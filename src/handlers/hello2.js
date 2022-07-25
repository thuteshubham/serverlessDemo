const {v4}=require('uuid');
const AWS=require('aws-sdk');
const awsServerlessExpress=require('aws-serverless-express');
const {dbConnection}=require('../model/dbConfig');

const server= awsServerlessExpress.createServer()

const hello2 = async (event) => {
  try{
    const dbConnect = await dbConnection;
  console.log("helloo users");
  const reponsee=await dbConnect.request().query('select * from Inventory');
   console.log("reponsee",reponsee.recordset);
  const response = {
      statusCode: 200,
      body: JSON.stringify(reponsee.recordset) 
  };
  return response;
  }catch(err){
    console.log(err);
    const errorMessage={
      statusCode: 503,
      body: JSON.stringify(err)
    }
    return errorMessage
  }
  
};

module.exports={
  handler:hello2
}