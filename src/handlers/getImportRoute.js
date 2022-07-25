const {v4}=require('uuid');
const AWS=require('aws-sdk');
const awsServerlessExpress=require('aws-serverless-express');
const Appconst = require('./../appConstants/constants');
const {dbConnection}=require('../model/dbConfig');
const { dbQuery } = require('../appConstants/dbQueries');
const TrainRoute = require('../model/trainRoute');
const ResponseModel = require('../model/responseModel');
const server= awsServerlessExpress.createServer();
const moment = require('moment');

const getImportRoute = async(event,context) => {
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
    handler:getImportRoute
  }
