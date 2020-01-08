// no need to include aws-sdk into package.json it's already part of lambda environment
const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#createTable-property
const createTable = async (params) => {
  const { TableName, KeySchema, AttributeDefinitions, ProvisionedThroughput } = params;
  return await dynamo.createTable( { TableName, KeySchema, AttributeDefinitions, ProvisionedThroughput } ).promise();
}

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#createTable-property
const deleteTable = async (TableName) => await dynamo.deleteTable({ TableName }).promise();

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#putItem-property
const putItem = async (TableName, Item) => await docClient.put({ TableName, Item }).promise();

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#getItem-property
const getItem = async (TableName, Key) => await docClient.get({ TableName, Key }).promise();

const queryItemByIndex = async(query) => await docClient.query(query).promise();

const scan = async(query) => await docClient.scan(query).promise();

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#deleteItem-property
const deleteItem = async (TableName, Key) => await docClient.delete({ TableName, Key }).promise();

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#tableNotExists-waiter
const waitFor = async (what, TableName) => await dynamo.waitFor(what, { TableName }).promise();

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#describeTable-property
const describeTable = async (TableName) => await dynamo.describeTable({ TableName }).promise();

// generate unique id 
const generateUUID = () => {
  var d = new Date().getTime();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  }).replace(/[-]/g, '');
}

module.exports = { 
  createTable, 
  deleteTable, 
  describeTable,
  waitFor,
  putItem, 
  getItem, 
  scan,
  queryItemByIndex, 
  deleteItem, 
  generateUUID  
}