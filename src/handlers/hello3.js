const {v4}=require('uuid');
const AWS=require('aws-sdk');
const awsServerlessExpress=require('aws-serverless-express');
const {dbConnection}=require('../model/dbConfig');

const {getAllTrains}=require('../controller/getAllTrains');

const server= awsServerlessExpress.createServer(getAllTrains)

const hello3= async (event,context) => {
    console.log("hello3 connection");
    const dbConnect = await dbConnection;
    return awsServerlessExpress.proxy(server,event,context);
};

module.exports={
  handler:hello3
}