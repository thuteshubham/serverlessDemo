const data = require('./../model/trains')
const db=require('./../model/dbConfig');
const moment = require('moment');
const ResponseModel = require('./../model/responseModel');
const ActiveInventory = require('./../model/activeInventory');
const DormantInventory = require('./../model/dormantInventory');
const LocoJounrneyInfo = require('./../model/activeLocoInfo')
const {dbConnection}=require('./../model/dbConfig');
const { dbQuery } = require('./../appConstants/dbQueries');
const Appconst = require('./../appConstants/constants');

moment.suppressDeprecationWarnings = true;

async function getAllTrains(req, res) {
     //Connect with Database
     const dbConnect = await dbConnection;
    console.log("helloo users",req.body);
    const reponse=await dbConnect.request().query('select * from Inventory');
     console.log("reponsee",reponse);
    const response = {
        statusCode: 200,
        body: reponse
    };
    // console.log(response);
    res.send(response);
}





function getUsersData(req,res){
    console.log("fetching user details");
    try{
        db.connection.query("SELECT * FROM users", function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            const response={
                statusCode:200,
                body:result
            }
            res.send(response);
          });
    }catch(err){
        console.log(err);
    }
}

const getActiveInventory = async (req, res) => {
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
        return res.json(responsemodel)
    } catch (err) {
        console.log(err);
        responsemodel.status = Appconst.STATUS_CODE_DATABASE_ERROR;
        responsemodel.data = Appconst.NULL_DATA;
        responsemodel.message = Appconst.MESSAGE_DATABASE_ERROR;

        return res.json(responsemodel)
    }
}


/**
 * @name getDormantInventory
 * 
 * @description This method is to get the Dormant Inventory details.
 * 
 * @returns {Array}  an Array of inactive Train or Loco details.
 */
 const getDormantInventory = async (req, res) => {
    const responsemodel = new ResponseModel();
    try {
        var dormantInventories = new Array();

        const dbConnect = await dbConnection;

        //To get the list of Inventories in Dormant state
        var inventories = await dbConnect.request().query(dbQuery.GET_DORMANT_INVENTORIES_LIST_QUERY(Appconst.CURRENT_STATUS_DORMANT, Appconst.IS_DELETED_NO));
        for (const item of inventories.recordset) {
            const dormantInventory = new DormantInventory();
            dormantInventory.Category = item.Category;
            dormantInventory.Car_Type = item.Type;
            dormantInventory.Train_Number = item.AssetTag;
            dormantInventory.Asset_Tag = item.AssetTag;
            dormantInventory.Status = item.Condition;
            dormantInventory.Ownership = Appconst.ownership;

            var lastInfo = await dbConnect.request().query(dbQuery.GET_LASTINFO_QUERY(item.InventoryID, Appconst.IS_DELETED_NO));
            if (lastInfo.recordset.length) {
                dormantInventory.Last_Consignee = lastInfo.recordset[lastInfo.recordset.length - 1].Consignee;
                dormantInventory.ConsignmentNo = lastInfo.recordset[lastInfo.recordset.length - 1].ConsignmentNo;

                //last travelled route information
                var trainRouteInfo = await dbConnect.request().query(dbQuery.GET_TRAIN_ROUTE_INFO_QUERY(lastInfo.recordset[lastInfo.recordset.length - 1].TrainRouteID, Appconst.IS_DELETED_NO));
                if (trainRouteInfo.recordset.length) {
                    dormantInventory.Last_Route_Taken = trainRouteInfo.recordset[0].Route;
                }
            }

            var assetTagDataLastRec = await dbConnect.request().query(dbQuery. GET_ASSET_TAG_DATA_QUERY(item.AssetTag));
            if (assetTagDataLastRec.recordset.length) {

                //getting last active date time from epoch timestamp
                dormantInventory.LastActiveEpoch = assetTagDataLastRec.recordset[assetTagDataLastRec.recordset.length - 1].TimestampEpoch;
                dormantInventory.Last_Active_Date = moment.utc(dormantInventory.LastActiveEpoch * 1000).add(moment().utcOffset(), 'minutes').format("DD-MMM-YYYY");

                currentdate = moment().format("DD-MMM-YYYY");
                dormantInventory.Dormant_Since = moment.utc(currentdate).add(moment().utcOffset(), 'minutes').diff(moment(dormantInventory.Last_Active_Date), 'days') + " Day(s)";
                dormantInventory.Estimated_Active_Date = moment.utc(moment(currentdate, "DD-MMM-YYYY").add(10, 'days')).add(moment().utcOffset(), 'minutes').format("DD-MMM-YYYY");

                //getting previous active location information
                var splcInfo = await dbConnect.request().query(dbQuery.GET_LASTLOCATION_SPLC_INFO_QUERY(assetTagDataLastRec.recordset[assetTagDataLastRec.recordset.length - 1].SPLC, Appconst.IS_DELETED_NO));
                if (splcInfo.recordset.length) {
                    dormantInventory.lat = splcInfo.recordset[0].Latitude;
                    dormantInventory.lng = splcInfo.recordset[0].Longitude;
                    dormantInventory.Current_Location = splcInfo.recordset[0].City + " (SPLC " + assetTagDataLastRec.recordset[assetTagDataLastRec.recordset.length - 1].SPLC + ")";            
                }
            }
            dormantInventories.push(dormantInventory);
        }
        dormantInventories.sort((a, b) => b.LastActiveEpoch - a.LastActiveEpoch);

        for (let key in dormantInventories) {
            delete dormantInventories[key].LastActiveEpoch;
        }
        responsemodel.status = Appconst.STATUS_CODE_SUCCESS;
        responsemodel.data = dormantInventories;
        responsemodel.message = Appconst.MESSAGE_SUCCESS;

        return res.json(responsemodel)
    } catch (err) {
        console.log(err);
        responsemodel.status = Appconst.STATUS_CODE_DATABASE_ERROR;
        responsemodel.data = Appconst.NULL_DATA;
        responsemodel.message = Appconst.MESSAGE_DATABASE_ERROR;

        return res.json(responsemodel)
    }
}


/**
 * @name getActiveLocoInfo
 * 
 * @description This method is to get Active Loco details.
 * @param {string} locoAssetTag
 * 
 * @returns {object} an object of active Loco Car details.
 */
 const getActiveLocoInfo = async (req, res) => {
    const responsemodel = new ResponseModel();
    try {
        const locoAssetTag = req.query.locoAssetTag;
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

        return res.json(responsemodel)
    } catch (err) {
        console.log(err);
        responsemodel.status = Appconst.STATUS_CODE_DATABASE_ERROR;
        responsemodel.data = Appconst.NULL_DATA;
        responsemodel.message = Appconst.MESSAGE_DATABASE_ERROR;

        return res.json(responsemodel)
    }
}





async function insertUserData(req,res){
    console.log("req",req.body);
    try{
        let response=db.connection.query(`insert into users(uid, uname) value(${req.body.uid},'${req.body.uname}')`);
        db.connection.query(" SELECT * FROM users", function (err, result, fields) {
            if (err) {
                throw err;
            }
            console.log(result);
            const response={
                statusCode:200,
                body:result
            }
            res.send(response);
          });
    }catch(error){
        throw error;
    }
}

module.exports = {
    getAllTrains: getAllTrains,
    getUsersData:getUsersData,
    insertUserData:insertUserData,
    getActiveInventory:getActiveInventory,
    getDormantInventory:getDormantInventory,
    getActiveLocoInfo:getActiveLocoInfo
}