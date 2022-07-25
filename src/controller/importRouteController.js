
const Appconst = require('./../appConstants/constants');
const {dbConnection}=require('../model/dbConfig');
const { dbQuery } = require('../appConstants/dbQueries');
const TrainRoute = require('../model/trainRoute');
const RouteInfo = require('../model/routeInfo');
const AvailableInventory = require('../model/availableInventory');
const ResponseModel = require('../model/responseModel');
const moment = require('moment');


moment.suppressDeprecationWarnings = true;


/**
 * @name getImportRoute
 * 
 * @description this method gives available routes information
 * 
 * @returns {Array} array of routesLists which contains all the available routes.
 */
const getImportRoute = async (req, res) => {
    const responsemodel = new ResponseModel();
    try {
        const routesLists = new Array()
        const dbConnect = await dbConnection;
        console.log("import routes");
        //To get the all available routes
        var routes = await dbConnect.request().query(dbQuery.GET_ROUTES(Appconst.IS_DELETED_NO));
        if (routes.recordset.length) {

            for (let item of routes.recordset) {
                const trainRoute = new TrainRoute();
                trainRoute.Train_Route_ID = item.TrainRouteID;
                trainRoute.Route_Name = item.Route;
                trainRoute.Origin_Station = item.OriginCity;
                trainRoute.Destination_Station = item.DestinationCity;
                trainRoute.Origin_SPLC = item.OriginSPLC;
                trainRoute.Destination_SPLC = item.DestinationSPLC;
                trainRoute.Total_Duration = item.TotalDuration;
                trainRoute.Total_Distance = item.TotalDistance;

                routesLists.push(trainRoute);
            }
        }

        responsemodel.status = Appconst.STATUS_CODE_SUCCESS;
        responsemodel.data = routesLists;
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
 * @name getRouteInfo
 * 
 * @description this method gives particular routes information.
 * 
 * @returns {Array} array of routeInfoList which contains specific route detailed information.
 */
const getRouteInfo = async (req, res) => {
    const responsemodel = new ResponseModel();
    try {
        const routeName = req.query.Route_Name;//'R-BRO-HEA'; 
        const routeInfoList = new Array();
        const dbConnect = await dbConnection;
        console.log("req.query.Route_Name",req.query.Route_Name);
        

        //to get routes information
        var routeInfo = await dbConnect.request().query(dbQuery.GET_ROUTE_INFO(routeName, Appconst.IS_DELETED_NO));
        console.log("query",dbQuery.GET_ROUTE_INFO(routeName, Appconst.IS_DELETED_NO));
        if (routeInfo.recordset.length) {
            for (const item of routeInfo.recordset) {
                const routeInformation = new RouteInfo();

                routeInformation.RouteInfo_ID = item.RouteInfoID;
                routeInformation.Route_Name = item.Route;
                routeInformation.Station_Name = item.City;
                routeInformation.Station_SPLC = item.SPLC;
                routeInformation.Location_lat_long = item.Location;
                routeInformation.Distance_Covered = item.DistanceCovered;
                routeInformation.Time_Taken = item.TimeTaken;

                routeInfoList.push(routeInformation);
            }
        }
        responsemodel.status = Appconst.STATUS_CODE_SUCCESS;
        responsemodel.data = routeInfoList;
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
 * @name getAvailableInventories
 * 
 * @description this method gives Available Inventories  information.
 * 
 * @returns {Array} array of availableInventoriesList which contains Available active Inventories information.
 */
const getAvailableInventories = async (req, res) => {
    const responsemodel = new ResponseModel();
    try {
        var JourneyStartDate = req.query.journeyStartDate;//'2022-04-06 00:00:00.000';//
        var TrainRouteID = req.query.trainRouteID;//5;//

        const availableInventoriesList = new Array();
        const dbConnect = await dbConnection;

        //to get active available inventeries on selected date
        var availableInventories = await dbConnect.request()
            .input("JourneyDate", JourneyStartDate)
            .input("RouteId", TrainRouteID)
            .execute("uspGetAvailableInventory");
        console.log("uspGetAvailableInventory",availableInventories);
        if (!availableInventories.recordset.length) {
            responsemodel.status = Appconst.STATUS_CODE_INVENTORIES_NOT_AVAILABLE;
            responsemodel.message = Appconst.MESSAGE_INVENTORIES_NOT_AVAILABLE;

            return res.json(responsemodel);
        } else {
            for (let item of availableInventories.recordset) {
                const availableInventory = new AvailableInventory();

                availableInventory.Inventory_ID = item.InventoryID;
                availableInventory.Category = item.Category;
                availableInventory.Asset_Tag = item.AssetTag;
                availableInventory.Cars_Type = item.Type;
                availableInventory.Destination = Appconst.NULL_DATA;
                availableInventory.DestinationSplc = Appconst.NULL_DATA;
                availableInventory.Ownership = Appconst.ownership;
                availableInventory.Current_Status = item.CurrentStatus;

                var lastInfo = await dbConnect.request().query(dbQuery.GET_LASTINFO_QUERY(item.InventoryID, Appconst.IS_DELETED_NO));
                if (lastInfo.recordset.length) {
                    availableInventory.Last_Consignee = lastInfo.recordset[lastInfo.recordset.length - 1].Consignee;
                    availableInventory.ConsignmentNo = lastInfo.recordset[lastInfo.recordset.length - 1].ConsignmentNo;
                }

                var routeInfo = await dbConnect.request().query(dbQuery.GET_TRAIN_ROUTE_INFO_QUERY(TrainRouteID, Appconst.IS_DELETED_NO));
                if (routeInfo.recordset.length) {
                    var originSPLC = routeInfo.recordset[0].OriginSPLC;
                    var originCity = routeInfo.recordset[0].OriginCity;
                    var destinationSPLC = routeInfo.recordset[0].DestinationSPLC
                }
                var assetTagDataLocationInfo = await dbConnect.request().query(dbQuery.GET_ASSET_TAG_DATA_QUERY(item.AssetTag));

                if (assetTagDataLocationInfo.recordset.length) {
                    var curret_splc = assetTagDataLocationInfo.recordset[assetTagDataLocationInfo.recordset.length - 1].SPLC;
                    var routes = await dbConnect.request().query(dbQuery.GET_ROUTES(Appconst.IS_DELETED_NO));
                    for(const item of routes.recordset){
                    if (curret_splc == item.DestinationSPLC) {
                        availableInventory.Current_Location = originCity + " ( " + originSPLC + " ) ";
                       
                    } else {
                        //getting current location information
                        var splcInfo = await dbConnect.request().query(dbQuery.GET_LASTLOCATION_SPLC_INFO_QUERY(assetTagDataLocationInfo.recordset[assetTagDataLocationInfo.recordset.length - 1].SPLC, Appconst.IS_DELETED_NO));
                        if (splcInfo.recordset.length) {
                            availableInventory.Current_Location = splcInfo.recordset[0].City + " ( " + assetTagDataLocationInfo.recordset[assetTagDataLocationInfo.recordset.length - 1].SPLC + " )";
                        }
                    }
                }
            }
                availableInventoriesList.push(availableInventory)
            }
        }
        const filteredAvailableInventoriesList = [...new Set(availableInventoriesList.map((object) =>
            JSON.stringify(object)))].map((item) => JSON.parse(item));
        responsemodel.status = Appconst.STATUS_CODE_SUCCESS;
        responsemodel.data = filteredAvailableInventoriesList;
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
 * @name postCreateLocoCarRoute
 * 
 * @description this method is to schedule a journey for loco cars
 * 
 * @param {InventoryID,TrainRouteID,OriginSPLC,DestinationSPLC,Consignee,ConsignmentNo,JourneyStartDate,
 *          JourneyEndDate,ItemDescription,Price,Quantity,Weight,High} request parameters
 *  
 * @returns inserts data into LOCO CAR ROUTE MAPPING Table 
 */
const postCreateLocoCarRoute = async (req, res) => {
    const responsemodel = new ResponseModel();
    try {
        let Data = req.body.data;

        //connecting with database
        const dbConnect = await dbConnection;

        var journeyid = 0;
        var lastJourneyInfo = await dbConnect.request().query(dbQuery.GET_LAST_JOURNEY());
        if (lastJourneyInfo.recordset.length) {
            journeyid = lastJourneyInfo.recordset[0].JourneyID;
        }

        //To create new JourneyID, increment last journey ID
        journeyid++;

        //Inserting data into loco car route mapping table
        for (let item of Data) {

            var result = await dbConnect.request()
                .input("journeyID", journeyid)
                .input("inventoryID", item.InventoryID)
                .input("trainRouteID", item.TrainRouteID)
                .input("originSPLC", item.OriginSPLC)
                .input("destinationSPLC", item.DestinationSPLC)
                .input("consignee", item.Consignee)
                .input("consignmentNo", item.ConsignmentNo)
                .input("journeyStatus", Appconst.DB_JOURNEY_STATUS_COMPLETED)
                .input("isDeleted", Appconst.IS_DELETED_NO)
                .input("journeyName", Appconst.NULL_DATA)
                .input("journeyStartDate", item.JourneyStartDate)
                .input("journeyEndDate", item.JourneyEndDate)
                .input("itemDescription", item.ItemDescription)
                .input("price", item.Price)
                .input("quantity", item.Quantity)
                .input("weight", item.Weight)
                .input("high", item.High)
                .execute("uspCreateLocoCarRoute");
            console.log(result);
        }
        responsemodel.status = Appconst.STATUS_CODE_SUCCESS;
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



module.exports = { getImportRoute, getRouteInfo, getAvailableInventories, postCreateLocoCarRoute }