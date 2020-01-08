const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { putItem } = require('../helpers/dynamo');
const shortid = require('shortid');

const { uploadFile, downloadFile, getSignedUrl } = require('../helpers/s3');

const os = require('os');
const path = require('path');

const handler = async event => {
  const { convert_bucket, table } = JSON.parse([process.env.SETTINGS]);
  // get file name, from second to second range and content type 
  let { fileName, start, end } = JSON.parse(event.body);
  const workdir = os.tmpdir();
  const inputFile = path.join(workdir, fileName);
  const nameOnly = path.basename(fileName).split('.');
  nameOnly.pop();
  const outputFile = path.join(workdir, nameOnly + '.gif');  
  [].pop()
  try {
    await downloadFile(inputFile, fileName);
    const { stdout, stderr } = await exec(`/opt/bin/ffmpeg -loglevel error -y -i ${inputFile} -ss ${start} -t ${end-start} -r 10 -hide_banner -vf scale=w=iw/2:h=ih/2 ${outputFile}`);
    console.log(stdout);
    console.log(stderr);

    await uploadFile(outputFile, convert_bucket, path.basename(outputFile), 'private', 'image/gif');
    const signedUrl = await getSignedUrl('getObject', convert_bucket, path.basename(outputFile));

    const shortUrl = shortid.generate();
    console.log(shortUrl);
    console.log(signedUrl);

    await putItem(table, {
      table: 'urls',
      created: (new Date()).toString(),
      key: shortUrl,
      title: 'short url',
      data: path.basename(outputFile),
      expires: 15
    });

    return {
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ signedUrl, shortUrl })
    }
  } catch(err) {
    console.log(err);
    return {
      statusCode: 500,
      headers: {'content-type': 'application/json'},
      body: JSON.stringify(err)
    }
  }
}

module.exports = { handler }