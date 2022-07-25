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


const getRouteInfo = async(event,context) => {
    const responsemodel = new ResponseModel();
    try {
        const routeName = event.queryStringParameters.Route_Name;//'R-BRO-HEA'; 
        // const routeName = req.query.Route_Name;//'R-BRO-HEA'; 
        const routeInfoList = new Array();
        const dbConnect = await dbConnection;
        console.log("req.query.Route_Name",event.queryStringParameters.Route_Name);
        

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
        // return res.json(responsemodel);
        const errorMessage={
            statusCode: 503,
            body: JSON.stringify(responsemodel)
          }
          return errorMessage
    }

}



module.exports={
    handler:getRouteInfo
  }
