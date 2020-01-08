const { getSignedUrl, generateUUID } = require('../helpers/s3');
const path = require('path');

const handler = async event => {
  try {
    const { upload_bucket } = JSON.parse(process.env.SETTINGS);
    let { contentType, fileName } = JSON.parse(event.body);
    fileName = generateUUID() + path.extname(fileName);
    console.log(fileName, contentType);
    const signedUrl = await getSignedUrl('putObject', upload_bucket, fileName, contentType);
    return {
      headers: {
        'content-type': 'application/json',       
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ fileName, signedUrl })
    }
  } catch(err) {
    console.log(err);
    return {
      statusCode: 500,
      headers: {'content-type': 'application/json' },
      body: JSON.stringify(err)
    }
  }

}

module.exports = { handler }