const {v4}=require('uuid');
const AWS=require('aws-sdk');
const awsServerlessExpress=require('aws-serverless-express');
const {dbConnection}=require('../model/dbConfig');
const ResponseModel = require('../model/responseModel');
const LocoJounrneyInfo = require('./../model/activeLocoInfo')
const { dbQuery } = require('../appConstants/dbQueries');
const Appconst = require('../appConstants/constants');
const server= awsServerlessExpress.createServer();
const moment = require('moment');


const getActiveLocoInfo = async(event,context) => {
    const responsemodel = new ResponseModel();
    try {

        const locoAssetTag= event.queryStringParameters.locoAssetTag
        // const locoAssetTag = req.query.locoAssetTag;
        const dbConnect = await dbConnection;

        //To get the active loco inventory information
        var inventory = await dbConnect.request().query(dbQuery.GET_ACTIVE_LOCO_INVENTORY_QUERY(locoAssetTag, Appconst.IS_DELETED_NO));
        if (!inventory.recordset.length) {
            console.log('record not found');
            responsemodel.status = Appconst.STATUS_CODE_RECORD_NOTFOUND;
            responsemodel.message = Appconst.MESSAGE_RECORD_NOTFOUND;

            return res.json(responsemodel);
        } else {
            var locojourneyInfo = new LocoJounrneyInfo();
            locojourneyInfo.Car_Type = inventory.recordset[0].Type;
            locojourneyInfo.Train_Number = locoAssetTag;

            var lastJourneyInfo = await dbConnect.request().query(dbQuery.GET_LASTINFO_QUERY(inventory.recordset[0].InventoryID, Appconst.IS_DELETED_NO));
            if (lastJourneyInfo.recordset.length) {
                locojourneyInfo.Origin_SPLC = lastJourneyInfo.recordset[lastJourneyInfo.recordset.length - 1].OriginSPLC;
                locojourneyInfo.Destination_SPLC = lastJourneyInfo.recordset[lastJourneyInfo.recordset.length - 1].DestinationSPLC;

                var assetTagLastRec = await dbConnect.request().query(dbQuery.GET_ACTIVE_LOCO_ASSETTAG_LASTREC_QUERY(locoAssetTag, lastJourneyInfo.recordset[lastJourneyInfo.recordset.length - 1].JourneyID));
                if (assetTagLastRec.recordset.length) {
                    var lastLocSPLCInfo = await dbConnect.request().query(dbQuery.GET_LASTLOCATION_SPLC_INFO_QUERY(assetTagLastRec.recordset[assetTagLastRec.recordset.length - 1].SPLC, Appconst.IS_DELETED_NO));
                    if (lastLocSPLCInfo.recordset.length) {
                        locojourneyInfo.Last_Location = lastLocSPLCInfo.recordset[0].City;
                    }
                }

                var originSPLCInfo = await dbConnect.request().query(dbQuery.GET_ORIGIN_INFO_QUERY(lastJourneyInfo.recordset[lastJourneyInfo.recordset.length - 1].OriginSPLC, Appconst.IS_DELETED_NO));
                if (originSPLCInfo.recordset.length) {
                    locojourneyInfo.Station = originSPLCInfo.recordset[0].City;
                }

                var destSPLCInfo = await dbConnect.request().query(dbQuery.GET_DESTINATION_INFO_QUERY(lastJourneyInfo.recordset[lastJourneyInfo.recordset.length - 1].DestinationSPLC, Appconst.IS_DELETED_NO));
                if (destSPLCInfo.recordset.length) {
                    locojourneyInfo.Destination = destSPLCInfo.recordset[0].City;
                }

                //getting the list of loco cars journey information
                var lastJourneyCarsInfo = await dbConnect.request().query(dbQuery.GET_ACTIVE_LOCO_LASTJOURNEY_CARSINFO_QUERY(lastJourneyInfo.recordset[lastJourneyInfo.recordset.length - 1].JourneyID, Appconst.IS_DELETED_NO));
                if (lastJourneyCarsInfo.recordset.length) {
                    locojourneyInfo.carCount = lastJourneyCarsInfo.recordset.length - 1;

                    var carJourneyInformation = [];
                    for (const item of lastJourneyCarsInfo.recordset) {

                        //to get active loco cars inventory information
                        var inventoryInfo = await dbConnect.request().query(dbQuery.GET_ACTIVE_CARJOURNEY_INVENTORY_INFO_QUERY(item.InventoryID));
                        if (inventoryInfo.recordset.length) {
                            let category = inventoryInfo.recordset[0].Category;
                            let type = inventoryInfo.recordset[0].Type;
                            let trainNumber = inventoryInfo.recordset[0].AssetTag;
                            let assetTag = inventoryInfo.recordset[0].AssetTag;
                            let condition = inventoryInfo.recordset[0].Condition;
                            let consignee = item.Consignee;
                            let consignmentNo = item.ConsignmentNo;
                            let originSPLC = item.OriginSPLC;

                            var originSplcInfo = await dbConnect.request().query(dbQuery.GET_ORIGIN_INFO_QUERY(item.OriginSPLC, Appconst.IS_DELETED_NO));
                            if (originSplcInfo.recordset.length) {
                                var originStation = originSplcInfo.recordset[0].City + " (SPLC " + item.OriginSPLC + ")";
                            }

                            let destinationSPLC = item.DestinationSPLC;
                            var destSplcInfo = await dbConnect.request().query(dbQuery.GET_DESTINATION_INFO_QUERY(item.DestinationSPLC, Appconst.IS_DELETED_NO));
                            if (destSplcInfo.recordset.length) {
                                var destinationStation = destSplcInfo.recordset[0].City + " (SPLC " + item.DestinationSPLC + ")";
                            }

                            var trainRouteInfo = await dbConnect.request().query(dbQuery.GET_TRAIN_ROUTE_INFO_QUERY(item.TrainRouteID, Appconst.IS_DELETED_NO));
                            if (trainRouteInfo.recordset.length) {

                                //gets the list of active Loco Route information
                                var routeInfoList = await dbConnect.request().query(dbQuery.GET_ACTIVE_ROUTE_INFO_LIST_QUERY(trainRouteInfo.recordset[0].Route, Appconst.IS_DELETED_NO));

                                var originIndex = routeInfoList.recordset.findIndex(element => element.SPLC == item.OriginSPLC);
                                var destIndex = routeInfoList.recordset.findIndex(element => element.SPLC == item.DestinationSPLC);

                                if (originIndex != -1 && destIndex != -1) {

                                    //creating filteredRouteList Array with specific length
                                    var filteredRouteList = Array.apply(null, { length: (destIndex - originIndex) + 1 });

                                    //filtering the route information
                                    filteredRouteList = routeInfoList.recordset.splice(originIndex, filteredRouteList.length);

                                    if (filteredRouteList.length) {
                                        let totalTimeInHrs = 0;

                                        for (const routeInfo of filteredRouteList) {
                                            totalTimeInHrs += routeInfo.TimeTaken;
                                        }

                                        var assetTagDataList = await dbConnect.request().query(dbQuery.GET_ACTIVE_ASSETTAG_DATA_LIST_QUERY(inventoryInfo.recordset[0].AssetTag, lastJourneyInfo.recordset[lastJourneyInfo.recordset.length - 1].JourneyID));
                                        if (assetTagDataList.recordset.length) {
                                           
                                            //getting start and end date time from epoch timestamp
                                            let startTime = moment.utc(assetTagDataList.recordset[0].TimestampEpoch * 1000).add(moment().utcOffset(), 'minutes').format("DD-MMM-YYYY HH:mm");
                                            let eTa = moment.utc((assetTagDataList.recordset[0].TimestampEpoch * 1000 + parseInt(totalTimeInHrs * 3600 * 1000))).add(moment().utcOffset(), 'minutes').format("DD-MMM-YYYY HH:mm");

                                            var carInfo = { Category: category, Car_Type: type, Train_Number: trainNumber, Asset_Tag: assetTag, Station: originStation, Origin_SPLC: originSPLC, Destination: destinationStation, Destination_SPLC: destinationSPLC, Status: condition, Start_Time: startTime, ETA: eTa, Consignee: consignee, Consignment_No: consignmentNo };
                                            carJourneyInformation.push(carInfo)
                                        }
                                    }
                                }
                            }
                        }
                    }
                    locojourneyInfo.carList = carJourneyInformation;
                }
            }
        }
        responsemodel.status = Appconst.STATUS_CODE_SUCCESS;
        responsemodel.data = locojourneyInfo;
        responsemodel.message = Appconst.MESSAGE_SUCCESS;
        // return res.json(responsemodel)
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
        // return res.json(responsemodel)
        const errorMessage={
            statusCode: 503,
            body: JSON.stringify(responsemodel)
          }
          return errorMessage
    }
}


module.exports={
    handler:getActiveLocoInfo
  }


