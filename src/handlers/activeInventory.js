const {v4}=require('uuid');
const AWS=require('aws-sdk');
const awsServerlessExpress=require('aws-serverless-express');
const {dbConnection}=require('../model/dbConfig');
const ResponseModel = require('../model/responseModel');
const ActiveInventory = require('../model/activeInventory');
const { dbQuery } = require('../appConstants/dbQueries');
const Appconst = require('../appConstants/constants');
const server= awsServerlessExpress.createServer();
const moment = require('moment');


//
//
//
const getActiveInventory = async(event,context)=> {
    console.log("database for getting active inventory -1");
    const responsemodel = new ResponseModel();
    try {
        var activeInventories = new Array();

        //Connect with Database
        const dbConnect = await dbConnection;

        //To get the list of Inventories in Active state
        console.log("database for getting active inventory");
        var inventories = await dbConnect.request().query(dbQuery.GET_ACTIVE_INVENTORIES_LIST_QUERY(Appconst.CATEGORY_LOCO, Appconst.CURRENT_STATUS_ACTIVE, Appconst.IS_DELETED_NO));
        console.log(dbQuery.GET_ACTIVE_INVENTORIES_LIST_QUERY(Appconst.CATEGORY_LOCO, Appconst.CURRENT_STATUS_ACTIVE, Appconst.IS_DELETED_NO));
        for (const item of inventories.recordset) {
            const activeInventory = new ActiveInventory();  
            activeInventory.Category = item.Category;
            activeInventory.Car_Type = item.Type;
            activeInventory.Asset_Tag = item.AssetTag;
            activeInventory.Train_Number = item.AssetTag;

            var lastInfo = await dbConnect.request().query(dbQuery.GET_LASTINFO_QUERY(item.InventoryID, Appconst.IS_DELETED_NO));
            console.log(dbQuery.GET_LASTINFO_QUERY(item.InventoryID, Appconst.IS_DELETED_NO));
            if (lastInfo.recordset.length) {
                activeInventory.Origin_SPLC = lastInfo.recordset[lastInfo.recordset.length - 1].OriginSPLC;
                activeInventory.Destination_SPLC = lastInfo.recordset[lastInfo.recordset.length - 1].DestinationSPLC;
                console.log("SPLC",lastInfo.recordset[lastInfo.recordset.length - 1].OriginSPLC,lastInfo.recordset[lastInfo.recordset.length - 1].DestinationSPLC);
                var originInfo = await dbConnect.request().query(dbQuery.GET_ORIGIN_INFO_QUERY(lastInfo.recordset[lastInfo.recordset.length - 1].OriginSPLC, Appconst.IS_DELETED_NO));
                if (originInfo.recordset.length) {
                    activeInventory.Station = originInfo.recordset[0].City;
                }

                var destInfo = await dbConnect.request().query(dbQuery.GET_DESTINATION_INFO_QUERY(lastInfo.recordset[lastInfo.recordset.length - 1].DestinationSPLC, Appconst.IS_DELETED_NO));
                if (destInfo.recordset.length) {
                    activeInventory.Destination = destInfo.recordset[0].City;
                }

                var trainRouteInfo = await dbConnect.request().query(dbQuery.GET_TRAIN_ROUTE_INFO_QUERY(lastInfo.recordset[lastInfo.recordset.length - 1].TrainRouteID, Appconst.IS_DELETED_NO));
                if (trainRouteInfo.recordset.length) {
                    activeInventory.Total_Distance = 0;

                    //gets the list of active train Route information
                    var routeInfoList = await dbConnect.request().query(dbQuery.GET_ACTIVE_ROUTE_INFO_LIST_QUERY(trainRouteInfo.recordset[0].Route, Appconst.IS_DELETED_NO));

                    //gets the splc index value from an array of routeInfoList
                    var originIndex = routeInfoList.recordset.findIndex(element => element.SPLC == lastInfo.recordset[lastInfo.recordset.length - 1].OriginSPLC);
                    var destIndex = routeInfoList.recordset.findIndex(element => element.SPLC == lastInfo.recordset[lastInfo.recordset.length - 1].DestinationSPLC);

                    if (originIndex != -1 && destIndex != -1) {

                        //creating filteredRouteList Array with specific length
                        var filteredRouteList = Array.apply(null, { length: (destIndex - originIndex) + 1 });

                        //filtering the route information
                        filteredRouteList = routeInfoList.recordset.splice(originIndex, filteredRouteList.length)

                        if (filteredRouteList.length) {
                            var assetTagDataList = await dbConnect.request().query(dbQuery.GET_ACTIVE_ASSETTAG_DATA_LIST_QUERY(item.AssetTag, lastInfo.recordset[lastInfo.recordset.length - 1].JourneyID));
                            let totalTimeInHrs = 0;

                            var trainInformation = []
                            for (const routeInfo of filteredRouteList) {
                                let StationName = routeInfo.City;
                                let StationSPLC = routeInfo.SPLC;
                                let Latitude = routeInfo.Latitude;
                                let Longitude = routeInfo.Longitude;
                                let Status = Appconst.ACTIVE_TRAIN_STATUS_NOT_REACHED;

                                const routeAssetDataIndex = assetTagDataList.recordset.map(el => el.SPLC).lastIndexOf(routeInfo.SPLC);
                                if (routeAssetDataIndex != -1) {

                                    var ReacheddateTime = moment.utc(assetTagDataList.recordset[routeAssetDataIndex].TimestampEpoch * 1000).add(moment().utcOffset(), 'minutes').format("DD-MMM-YYYY HH:mm");
                                    Status = Appconst.ACTIVE_TRAIN_STATUS_CROSSED;
                                }

                                if (assetTagDataList.recordset.length && assetTagDataList.recordset[assetTagDataList.recordset.length - 1].SPLC == routeInfo.SPLC) {
                                    Status = Appconst.ACTIVE_TRAIN_STATUS_REACHED;
                                }

                                var trainInfos = { stationName: StationName, stationCode: StationSPLC, dateTime: ReacheddateTime, status: Status, lat: Latitude, lng: Longitude }
                                trainInformation.push(trainInfos);
                                activeInventory.trainInfo = trainInformation;

                                activeInventory.Total_Distance += routeInfo.DistanceCovered;

                                totalTimeInHrs += routeInfo.TimeTaken;

                                if (assetTagDataList.recordset.length) {
                                   
                                    //getting start and end date time from epoch timestamp
                                    activeInventory.StartTimeEpoch = assetTagDataList.recordset[0].TimestampEpoch;
                                    activeInventory.Start_Time = moment.utc(assetTagDataList.recordset[0].TimestampEpoch * 1000).add(moment().utcOffset(), 'minutes').format("DD-MMM-YYYY HH:mm");
                                    activeInventory.ETA = moment.utc((assetTagDataList.recordset[0].TimestampEpoch * 1000 + parseInt(totalTimeInHrs * 3600 * 1000))).add(moment().utcOffset(), 'minutes').format("DD-MMM-YYYY HH:mm");

                                    var lastDataRec = assetTagDataList.recordset[assetTagDataList.recordset.length - 1];
                                        
                                    //getting previous location information
                                    var lastLocInfo = await dbConnect.request().query(dbQuery.GET_LASTLOCATION_SPLC_INFO_QUERY(lastDataRec.SPLC, Appconst.IS_DELETED_NO));
                                    if (lastLocInfo.recordset.length) {
                                        activeInventory.Last_Location = lastLocInfo.recordset[0].City + " (SPLC " + lastLocInfo.recordset[0].SPLC + ")";
                                        activeInventory.Covered_Distance = lastDataRec.CoveredDistance;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            activeInventories.push(activeInventory);
            let count=1;
            console.log("inside for loop",activeInventories);
        }
        activeInventories.sort((a, b) => b.StartTimeEpoch - a.StartTimeEpoch);
        for (let key in activeInventories) {
            delete activeInventories[key].StartTimeEpoch;
        }
        responsemodel.status = Appconst.STATUS_CODE_SUCCESS;
        responsemodel.data = activeInventories;
        responsemodel.message = Appconst.MESSAGE_SUCCESS;
        // return JSON.stringify(responsemodel)
        const response = {
            statusCode: 200,
            body: JSON.stringify(responsemodel) 
        };
        return response;
   
    } catch (err) {
        console.log(err);
        responsemodel.status = Appconst.STATUS_CODE_DATABASE_ERROR;
        responsemodel.data = Appconst.NULL_DATA;
        responsemodel.message = Appconst.MESSAGE_DATABASE_ERROR;

        const errorMessage={
            statusCode: 503,
            body: JSON.stringify(responsemodel)
          }
          return errorMessage
    }
};

//
//
//
module.exports={
    handler:getActiveInventory
  }













