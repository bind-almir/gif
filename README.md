**Serverless video to Gif converter**

This is a serverless implementation of video to gif converter hosted on AWS. It contains an example how various services interacts with each other. Frontend and backend are lambda functions with API Gateway behind CloudFront. Route53 hosted zone points to CloudFront distribution to ensure https. SSL certificate has been provisioned using ACM. User uploads and gif files are stored on S3. DynamoDB is used to store short url pointer to S3 object that contains gif file so signed url can be created. 

Application is written using NodeJS with the help of serverless framework. Fronted is written using vanilla JavaScript - no external libraries involved. 

Read more [here](https://almirzulic.com/posts/serverless-gif-video-converter/).

**CREDITS** 
- https://github.com/serverlesspub/ffmpeg-aws-lambda-layer
- https://github.com/dylang/shortid#readme

**LICENSE** 
- MIT