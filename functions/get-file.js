const { getItem } = require('../helpers/dynamo');
const { getSignedUrl } = require('../helpers/s3');

const handler = async event => {
  try {
    const { convert_bucket, table } = JSON.parse(process.env.SETTINGS);
    const file = event.path.replace('/', '');
    console.log(file);
    const { Item } = await getItem(table, {
      table: 'urls',
      key: file
    }); 
    console.log(Item)
    const signedUrl = await getSignedUrl('getObject', convert_bucket, Item.data);
    return {
      statusCode: 301,
      headers: {
        Location: signedUrl
      }
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