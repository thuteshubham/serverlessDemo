const {v4}=require('uuid');
const AWS=require('aws-sdk');
const awsServerlessExpress=require('aws-serverless-express');
const {dbConnection}=require('../model/dbConfig');
const ResponseModel = require('../model/responseModel');
const DormantInventory = require('./../model/dormantInventory');
const { dbQuery } = require('../appConstants/dbQueries');
const Appconst = require('../appConstants/constants');
const server= awsServerlessExpress.createServer();
const moment = require('moment');


const getDormantInventory = async (event,context) => {
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
        // return res.json(responsemodel);
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
        // return res.json(responsemodel);
       
        const errorMessage={
            statusCode: 503,
            body: JSON.stringify(responsemodel)
          }
          return errorMessage
    }
}


module.exports={
    handler:getDormantInventory
  }

