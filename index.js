//place a pic called "face.jpg" in this directory of your face, direct var source to the url of the body image
//script is dependant on graphicsmagick cli tools

const request = require('request')
const fs = require('fs');
const gm = require('gm');
const imgur = require('imgur');

var source = 'http://1wusz1l7dx227nr7mlgvjn14.wpengine.netdna-cdn.com/wp-content/uploads/2016/12/ap_16228136310156.jpg'
var apikey = ''

var imageUpload = function(file, callback){
imgur.uploadFile(file)
    .then(function (json) {
       callback(json.data.link);
    })
}

var downloadImage = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

var facesBorders = function(imageSource, callback){
  request({
  url: 'https://westus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceAttributes=headPose',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': apikey
  },
  json: {
    url: imageSource
  }
}, function(error, response, body){
   console.log(body)
   callback(body[0])
})}

facesBorders(source, function(allDataGleaned){
  downloadImage(source, 'source.jpg', function(){
    var toBeReplacedImageDimensions = allDataGleaned
            imageUpload('face.jpg', function(imgurl){
              facesBorders(imgurl, function(allDataGleaned){
                gm('face.jpg')
                  .crop(allDataGleaned.faceRectangle.width, allDataGleaned.faceRectangle.height, allDataGleaned.faceRectangle.left, allDataGleaned.faceRectangle.top)
                  .resize(toBeReplacedImageDimensions.faceRectangle.width, toBeReplacedImageDimensions.faceRectangle.height)
                  .stream(function (error, stdout, stderr) {
                      var writeStream = fs.createWriteStream('croppedface.jpg');
                      stdout.pipe(writeStream);
                      gm('source.jpg')
                      .region(toBeReplacedImageDimensions.faceRectangle.width, toBeReplacedImageDimensions.faceRectangle.height, toBeReplacedImageDimensions.faceRectangle.left, toBeReplacedImageDimensions.faceRectangle.top)
                      .draw(['image Over 0,0 '+toBeReplacedImageDimensions.faceRectangle.width+','+toBeReplacedImageDimensions.faceRectangle.height+' croppedface.jpg'])
                      .stream(function (error, stdout, stderr) {
                          var writeStream = fs.createWriteStream('merge.jpg');
                          stdout.pipe(writeStream);
                        })
                  });
              })
            })
  });
})

/* blur code
facesBorders(source, function(allDataGleaned){

  downloadImage(source, 'source.jpg', function(){
    var toBeReplacedImageDimensions = allDataGleaned

    gm('source.jpg')
        .region(allDataGleaned.faceRectangle.width, allDataGleaned.faceRectangle.height, allDataGleaned.faceRectangle.left, allDataGleaned.faceRectangle.top)
        .resize(50)
        .blur(7, 3)
        .resize(allDataGleaned.faceRectangle.width, allDataGleaned.faceRectangle.height, allDataGleaned.faceRectangle.left, allDataGleaned.faceRectangle.top)
        .stream(function (error, stdout, stderr) {
            var writeStream = fs.createWriteStream('blurredsource.jpg');
            stdout.pipe(writeStream);
})*/
