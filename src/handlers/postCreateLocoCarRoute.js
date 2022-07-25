const {v4}=require('uuid');
const AWS=require('aws-sdk');
const awsServerlessExpress=require('aws-serverless-express');
const Appconst = require('./../appConstants/constants');
const {dbConnection}=require('../model/dbConfig');
const { dbQuery } = require('../appConstants/dbQueries');
const RouteInfo = require('../model/routeInfo');
const ResponseModel = require('../model/responseModel');
const server= awsServerlessExpress.createServer();
const moment = require('moment');


const postCreateLocoCarRoute = async(event,context)  => {
    const responsemodel = new ResponseModel();
    try {
        // let Data = req.body.data;
        let parseData=JSON.parse(event.body);
        let Data=parseData.data
        console.log("event.body.data---->",event.body.data);
        console.log("Data===>",Data);
        //connecting with database
        const dbConnect = await dbConnection;

        var journeyid = 0;
        var lastJourneyInfo = await dbConnect.request().query(dbQuery.GET_LAST_JOURNEY1());
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
    handler:postCreateLocoCarRoute
  }
