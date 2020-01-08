const { getSignedUrl } = require('../helpers/s3');

const handler = async event => {  
  try {
    const { upload_bucket } = JSON.parse(process.env.SETTINGS);
    const { operation, fileName } = JSON.parse(event.body);
    const signedUrl = await getSignedUrl(operation, upload_bucket, fileName);
    return {
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ signedUrl })
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