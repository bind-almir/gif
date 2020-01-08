const template = (params) => `
<!DOCTYPE html>
<html lang="${params.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="keywords" content="gif, video, convert, serverless, aws, open source">
  <meta name="description" content="Convert video files to gif. Open source serverless implementation of gif creator.">
  <link rel="icon" href="${params.favicon}" type="image/x-icon"/>
  <title>Gif</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    }

    input {
      width: 100%;
      margin-bottom: 5px;
      height: 50px;
    }

    .container {
      width: 320px;
      height: calc(70vh - 35px);
      margin-top: 30vh;
      margin-left: calc(50% - 160px);
    }

    .gif-container {
      width: 320px;
      height: calc(70vh - 35px);
      margin: auto auto;
      padding-top: 5px;
    }

    img {
      max-width: 100%;
      max-height: 100%;
    }

    footer {
      position: fixed;
      left: 0;
      bottom: 0;
      width: 100%;
      background-color: black;
      color: white;
      text-align: center;
      line-height: 35px;
    }

    a:link {
      color: white;
      text-decoration: none;
    }
    
    a:visited {
      color: white;
      text-decoration: none;
    }
    
    a:hover {
      color: white;
      text-decoration: none;
    }
    
    a:active {
      color: white;
      text-decoration: none;
    }

    .hidden {
      display: none;
    }

    .loader {
      border: 1px solid white;
      border-radius: 50%;
      border-top: 1px solid black;
      width: 35px;
      height: 35px;
      -webkit-animation: spin 1s linear infinite; 
      animation: spin 1s linear infinite;
      margin: auto auto;
      margin-top: 30vh;
    }
    
    @-webkit-keyframes spin {
      0% { -webkit-transform: rotate(0deg); }
      100% { -webkit-transform: rotate(360deg); }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .progress {
      width: 320px;
      margin-top: 30vh;
      margin-left: calc(50% - 160px);
    }

    .home-button {
      cursor: pointer;
      -webkit-appearance: button;
      -moz-appearance: button;
      appearance: button;
      text-decoration: none;
      color: initial;
      float: left;
      height: 50px;
      width: 152px;
      text-decoration: none;
      color: #fff;
      background-color: #6c757d;
      border-color: #6c757d;
      transition: none;
      text-align: center;
      line-height: 50px;
    }
    .home-button:hover {
      color: #fff;
      background-color: #5a6268;
      border-color: #545b62;
    }

    .convert-button {
      cursor: pointer;
      float: right;
      height: 50px;
      width: 152px;
      text-decoration: none;
      color: #fff;
      background-color: #6c757d;
      border-color: #6c757d;
      transition: none;
    }
    .convert-button:hover {
      color: #fff;
      background-color: #5a6268;
      border-color: #545b62;
    }

  </style>

  <script>

    const postData = async (url = '', data = {}) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      return await response.json(); 
    }

    const putToS3 = (file, signedUrl) => new Promise((resolve, reject) => {
      
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', signedUrl, true);
      
      xhr.upload.onprogress = function (event) {
        document.getElementById('progress').value =  Math.ceil((event.loaded / event.total) * 100);
      };

      xhr.onload = function() {
        this.status == 200 ? resolve() : reject(this.responseText);
      };

      xhr.send(file);
    });

    const getSignedUrl = (operation, fileName) => {
      try {
        return postData('${params.signedUrl}', { operation, fileName });
      } catch(err) {
        console.error(err);
        alert('An error occurred, please try again later.');
      }
    }
    
    const uploadFile = async () => {

      document.getElementById('loader').classList.remove('hidden');   
      document.getElementById('progress').classList.remove('hidden');   
      document.getElementById('upload-container').classList.add('hidden');   
      
      try {
        const file = document.getElementById('video').files[0];
        const data = await postData('${params.action}', { fileName: file.name, contentType: file.type });
        await putToS3(file, data.signedUrl);
        const res = await getSignedUrl('getObject', data.fileName);

        document.getElementById('player').src = res.signedUrl;        
        document.getElementById('fileName').value = data.fileName;

        document.getElementById('loader').classList.add('hidden');   
        document.getElementById('progress').classList.add('hidden');   
        document.getElementById('convert-container').classList.remove('hidden');

        const player = document.getElementById('player');
        
        player.ontimeupdate = function() {
          document.getElementById('start').value = player.currentTime;
        };
        
        player.onloadedmetadata = function() {
          const end = document.getElementById('end');
          end.max = Math.ceil(player.duration);
          end.value = Math.ceil(player.duration);
        };

      } catch (error) {
        console.error(error);
        document.getElementById('progress').classList.add('hidden');   
        document.getElementById('loader').classList.add('hidden');
        document.getElementById('upload-container').classList.remove('hidden');
        alert('An error occurred, please try again later.');
      }

    }

    const convert = async() => {
      try {

        document.getElementById('convert-container').classList.add('hidden'); 
        document.getElementById('loader').classList.remove('hidden');   

        const start = document.getElementById('start').value;
        const end = document.getElementById('end').value;
        const fileName = document.getElementById('fileName').value;
        const converted = await postData('${params.convertUrl}', { fileName, start, end });  

        document.getElementById('loader').classList.add('hidden');    
        document.getElementById('gif-container').classList.remove('hidden');  
        document.getElementById('link').value = document.location.href + converted.shortUrl; 

        document.getElementById('gif').src = converted.signedUrl;

      } catch(err) {
        document.getElementById('loader').classList.add('hidden');   
        document.getElementById('convert-container').classList.remove('hidden'); 
        alert('An error occurred, please try again later.');
        console.error(err);
      }
    }

    const copyUrl = () => {
      try {
        const textInput = document.getElementById('link');
        textInput.select();
        textInput.setSelectionRange(0, 99999);
        document.execCommand('copy');
        document.getElementById('copy-button').innerHTML = 'Copy link (link copied)'
      } catch (err) {
        console.log(err);
        alert('An error occurred, please try again later.');
      }
    }

  </script>

</head>
<body>
  
  <div id="upload-container" class="container">
    
    <form method="${params.method}" action="${params.action}" enctype="multipart/form-data">
      <input id="video" type="file" onchange="uploadFile()">
    </form>

  </div>

  <div id="convert-container" class="container hidden">
  
    <video id="player" controls width="320" height="240">
      <source src="" type="video/mp4">
      Your browser does not support the video tag.  
    </video>

    <form>
      <input id="fileName" type="hidden">
      <input id="start" min="0" placeholder="&nbsp;&nbsp;start" type="number" value="0">
      <input id="end" min="0" placeholder="&nbsp;&nbsp;end" type="number" value="0">
      <br>
      <a href="https://${params.domain}" class="home-button">Home</a>
      <button type="button" class="convert-button" onclick="convert()">Convert to GIF</button>
    </form>

  </div>

  <div id="loader" class="container loader hidden"></div>
  <progress id="progress" class="progress hidden" value="0" max="100"></progress>

  <div id="gif-container" class="gif-container hidden">
    <img id="gif" src="" alt="gif">
    <input id="link" type="text">
    <a href="https://${params.domain}" class="home-button">Home</a>
    <button id="copy-button" class="convert-button" onclick="copyUrl()">Copy link</button>
  </div>

  <footer>
    <a href="https://${params.domain}">${params.domain}</a>
  </footer>

  <!-- Global site tag (gtag.js) - Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=UA-154985658-1"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
  
    gtag('config', 'UA-154985658-1');
  </script>

</body>
</html> 
`;

const handler = async event => {
  const signedUrl = 'signed';
  const convertUrl = 'convert';
  const { domain, favicon } = JSON.parse(process.env.SETTINGS);
  return {
    headers: {
      'content-type': 'text/html; charset=utf8',
      'Access-Control-Allow-Origin': '*'
    },
    body: template({
      lang: 'bs',
      action: 'upload', 
      method: 'POST',
      signedUrl,
      convertUrl,
      domain,
      favicon
    })
  }
}

module.exports = { handler }