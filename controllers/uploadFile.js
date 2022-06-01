const { Upload } = require('../models/upload')
const { Permission } = require('../models/permissions')
allTypeUploader = require('../public/helper/fileUploader');
singlePic = allTypeUploader.single('image');
// multi_upload = allTypeUploader.array('images');
Fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '../config/config.env' });
var multiparty = require('multiparty')
var phantom = require('phantom');
const { promisify } = require('util');
const mv = promisify(fs.rename);
var _ = require('lodash');
const { sequelize, Op } = require('sequelize');
const zipFolder = require('zip-a-folder');
const createVideo = require('../public/helper/api.video');
const { response } = require('express');
exports.create = async (req, res) => {
singlePic(req, res, err => {
if (err) {
return res.status(400).json({
status: "fail",
msg: `<${err}>`
})
};
// //@pankajg rewriting documents file.
// /**************** s3 uploads configurations start ******************** */
try {
if (!req.body.description || !req.body.title)
return res.status(404).json({ status: "fail", msg: `required Parameters missing!` });

var AWS = require('aws-sdk')
AWS.config.update({
apiVersion: 'latest',
region: 'us-west-1',
s3BucketEndpoint: false,
s3ForcePathStyle: true,
accessKeyId: process.env.AWS_AccessKeyId,
seccretAccessKey: process.env.AWS_SecretAccessKey
})

var s3 = new AWS.S3();
var myBucket = process.env.AWS_DraftBucket;
var dataPath = req.file.path;
var stream = fs.createReadStream(dataPath);
var newFileName = path.parse(req.file.originalname).name;
newFileName = newFileName.replace(/ /g, '');
// combine upload video/files
if (req.file.mimetype == 'video/mp4' || req.file.mimetype == 'video/x-flv' || req.file.mimetype == 'application/x-mpegURL' ||
req.file.mimetype == 'video/MP2T' || req.file.mimetype == 'video/3gpp' || req.file.mimetype == 'video/quicktime' ||
req.file.mimetype == 'video/x-msvideo' || req.file.mimetype == 'video/x-ms-wmv') {
createVideo.createVid(req.body.title, req.body.description, req.file.path).then(result => {
let object = {
videoId: result.videoId,
files: result.assets.player,
description: result.description,
title: result.title,
uploadedBy: req.body.uploadedBy,
fileName: newFileName,
fileType: req.file.mimetype
}
Upload.create(object).then(async response => {
let permission = {
filesId: response.id,
isRead: (req.headers.isRead) ? req.headers.isRead : "true",
isWrite: (req.headers.isWrite) ? req.headers.isWrite : "true",
isDelete: (req.headers.isDelete) ? req.headers.isDelete : "true",
}
await Permission.create(permission).catch(err => {
res.status(500).send({
message: err
});
})
return res.send(response);
})
.catch(err => {
console.log("--------------", err)
res.status(500).send({
message: err
});
});
}).catch(error => {
return res.status(504).json({ status: "fail", msg: `Video not created!`, error });
})

}//otherwise uploading done by S3 bucket;
else {
var params = {
Bucket: myBucket,
Body: stream,
Key: dataPath,
ACL: 'public-read',
ContentLength: stream.byteCount,
maxTries: 20
}
s3.upload(params, async function (err, responseData) {
if (err) {
console.log("Error while uploading")
} else {
let object = {
files: req.file.path,
description: req.body.description,
title: req.body.title,
uploadedBy: req.body.uploadedBy,
key: baseUrlAWS,
fileName: newFileName,
fileType: req.file.mimetype
}
Upload.create(object).then(async response => {
let permission = {
filesId: response.id,
isRead: (req.headers.isRead) ? req.headers.isRead : "true",
isWrite: (req.headers.isWrite) ? req.headers.isWrite : "true",
isDelete: (req.headers.isDelete) ? req.headers.isDelete : "true",
}
await Permission.create(permission).catch(err => {
res.status(500).send({
message: err
});
})
return res.send(response);
})
.catch(err => {
console.log("--------------", err)
res.status(500).send({
message: err
});
});
// }
}
})
}
// /*************** s3 uploads configurations end *************************** */
} catch (error) {
res.status(500).send({
message: error.message
});
}
})
}
exports.changeFile = async (req, res) => {
try {
if (!req.query.url) return res.status(404).json({ status: "fail", msg: "Url is not exist" })
phantom.create().then(async function (ph) {
var fileName = 'sample.pdf';
ph.viewportSize = { width: 800, height: 600 };
ph.paperSize = { format: "Letter", orientation: "portrait", border: "0.5in" }

var newFileName;
var datetimestamp = new Date();
datetimestamp = datetimestamp.toISOString().split('T')[0]
newFileName = Date.now() + '_' + fileName;

ph.createPage().then(async function (page) {
page.open(req.query.url).then(async function (status) {
await page.render(newFileName);
let existPath = path.join(destinationPath, `/${newFileName}`);
let newPath = path.join(destinationPath, `/web-pdf/${newFileName}`);
await moveThem(existPath, newPath)
return res.send(`${destinationPath}/web-pdf/${newFileName}`)
});
});
});
} catch (error) {
return res.status(400).json({
status: "fail",
msg: error.message
})
}
}
exports.findByID = async (req, res) => {
if (!req.params.id) {
return res.send({
status: 'fail',
message: "parameter missing!"
})
}
else {
let result = await Upload.findOne({ where: { id: req.params.id } });
if (_.isEmpty(result))
return res.status(404).send({
status: 'fail',
message: "files not exist"
});
/******************** new s3 upload configurations start ********************** */
if (!_.isEmpty(result.videoId))
return res.status(200).send(result.files);
let responseArray = baseUrlAWS + result.files;
return res.status(200).send(responseArray)
}
}
exports.searchFileByName = async (req, res) => {
try {
if (!req.query)
return res.status(400).send({
status: 'fail',
message: "search filter not accepted!"
});
let fieldName = req.query.fieldName
let fieldValue = req.query.fieldValue
const id = req.params.id
var response;
if (fieldName == 'description') {
response = await Upload.findAll({
where: {
description: { [Op.like]: `%${fieldValue}%` },
},
raw: true,
}).catch(errorHandler => { throw new Error(errorHandler) });

if (_.isEmpty(response))
return res.status(404).send({
status: 'fail',
message: "This file is not present on our system!"
});
}
if (fieldName == 'title') {
response = await Upload.findAll({
where: {
title: { [Op.like]: `%${fieldValue}%` },
},
raw: true,
}).catch(errorHandler => { throw new Error(errorHandler) });

if (_.isEmpty(response))
return res.status(404).send({
status: 'fail',
message: "This file is not present on our system!"
});
}
if (fieldName == "files") {
response = await Upload.findAll({
where: {
files: { [Op.like]: `%${fieldValue}%` },
},
raw: true,
// { files: [fieldValue] }

})
if (_.isEmpty(response))
return res.status(404).send({
status: 'fail',
message: "This file is not present on our system!"
});
}
return res.status(200).send(response);
} catch (error) {
console.log(error)
return res.status(500).send({
status: 'fail',
message: error.message
});
}
}

exports.getAllFile = async (req, res) => {
if (!req.body.filePath && !req.body.email)
return res.status(404).send({ status: 'fail', message: "need fle path and email to serve" });
// /**************** s3 uploads configurations start ******************** */
try {
var AWS = require('aws-sdk')
AWS.config.update({
apiVersion: 'latest',
region: 'us-west-1',
s3BucketEndpoint: false,
s3ForcePathStyle: true,
accessKeyId: process.env.AWS_AccessKeyId,
seccretAccessKey: process.env.AWS_SecretAccessKey
})
var s3 = new AWS.S3();
var myBucket = process.env.AWS_DraftBucket;

var params = {
Bucket: myBucket,
Delimiter: '/',
Prefix: `${req.body.filePath}/`
};
let response = new Array()
s3.listObjects(params, function (err, data) {
if (err) {
return 'There was an error viewing your album: ' + err.message
} else {
console.log(data.Contents, "<<<all content");
data.Contents.forEach(function (obj, index) {
response.push(baseUrlAWS + obj.Key)
})
return res.status(200).send(response)
}
})

} catch (error) {
return res.status(404).send({ status: 'fail', message: error.message });

}
}
exports.getZip = async (req, res) => {
try {
if (!req.query.path)
return res.status(404).send({ status: 'fail', message: "need file path to serve files" });
let requestPath = (req.query.path) ? req.query.path : `public/assets/.docs`
var datetimestamp = Date.now();
// datetimestamp = datetimestamp.toISOString().split('T')[0]
let fileName = `file.${datetimestamp}.zip`
await zipFolder.zip(requestPath, `./convertedZip/${fileName}`);
let filePath = `/convertedZip/${fileName}`

return res.send(destinationPath + filePath);
} catch (error) {
return res.status(404).send({ status: 'fail', message: error.message });
}

}
exports.getFile = async (req, res) => {
try {
if (!req.query.path)
return res.status(404).send({ status: 'fail', message: "need file path to serve files" });
let requestPath = { files: req.query.path, id: req.params.id }
let result = await Upload.findOne({
where: requestPath, raw: true,
}).catch(errorHandler => { throw new Error(errorHandler) });
if (result.isPublic == false) return res.status(403).send({ status: 'fail', message: "This file is private." });
return res.send(result);
} catch (error) {
return res.status(404).send({ status: 'fail', message: error.message });
}

}
exports.findAllFilesOnSys = async (req, res) => {
try {
let filesData = await Upload.findAll({
where: {
isPublic: "true"
}
});
let finalResponse = new Array();
filesData.forEach(val => {
if (!_.isEmpty(val.videoId))
finalResponse.push(val.files);
else {
finalResponse.push(baseUrlAWS + val.files);
}
})
return res.send(finalResponse);

} catch (error) {
return res.status(404).send({ status: 'fail', message: error.message });
}
}

//------------------------------------------ui api----------------------------------
exports.createUiFiles = async (req, res) => {

singlePic(req, res, err => {
if (err)
return res.status(400).json({ status: "fail", msg: `<${err}>` });
try {
if (!req.body.description || !req.body.title)
return res.status(404).json({ status: "fail", msg: `required Parameters missing!` });

var AWS = require('aws-sdk')
AWS.config.update({
apiVersion: 'latest',
region: 'us-west-1',
s3BucketEndpoint: false,
s3ForcePathStyle: true,
accessKeyId: process.env.AWS_AccessKeyId,
seccretAccessKey: process.env.AWS_SecretAccessKey
})

var s3 = new AWS.S3();
var myBucket = process.env.AWS_DraftBucket;
var dataPath = req.file.path;
var stream = fs.createReadStream(dataPath);
var newFileName = path.parse(req.file.originalname).name;
newFileName = newFileName.replace(/ /g, '');
// combine upload video/files
if (req.file.mimetype == 'video/mp4' || req.file.mimetype == 'video/x-flv' || req.file.mimetype == 'application/x-mpegURL' ||
req.file.mimetype == 'video/MP2T' || req.file.mimetype == 'video/3gpp' || req.file.mimetype == 'video/quicktime' ||
req.file.mimetype == 'video/x-msvideo' || req.file.mimetype == 'video/x-ms-wmv') {
createVideo.createVid(req.body.title, req.body.description, req.file.path).then(result => {
return res.status(200).json({url:result.assets.player});
}).catch(error => {
return res.status(504).json({ status: "fail", msg: `Video not created!`, error });
})

}//otherwise uploading done by S3 bucket;
else {
var params = {
Bucket: myBucket,
Body: stream,
Key: dataPath,
ACL: 'public-read',
ContentLength: stream.byteCount,
maxTries: 20
}
s3.upload(params, async function (err, responseData) {
if (err) {
console.log("Error while uploading")
} else {
return res.status(200).json({url:responseData.Location});
}
})
}
/*************** s3 uploads configurations end *************************** */
} catch (error) {
res.status(500).send({
message: error.message
});
}

})
}

//-----------------video uploading module------------------
exports.uploadVideo = async (req, res) => {
singlePic(req, res, err => {
if (err) {
return res.status(400).json({
status: "fail",
msg: `<${err}>`
})
};
if (!req.file) return res.status(404).json({ status: "fail", msg: `file not present!` });

createVideo.createVid(req.body.title, req.body.description, req.file.path).then(result => {
return res.send(result)
}).catch(error => {
return res.status(504).json({ status: "fail", msg: `Video not created!`, error });
})

})
}
exports.getSingleVideo = async (req, res) => {
try {
if (_.isEmpty(req.params.videoId))
return res.status(404).json({ status: "fail", msg: `Video Id is required!` });
let response = await createVideo.getSingleVideo(req.params.videoId)

if (_.isEmpty(response))
return res.status(404).json({ status: "fail", msg: `Video not present in this system first upload!` });
return res.status(200).send(response)

} catch (error) {
return res.status(404).send({ status: 'fail', message: error.message });
}

}
exports.updateVideo = async (req, res) => {
try {
let videoId = req.params.videoId;
if (_.isEmpty(req.body))
return res.status(404).send({ status: 'fail', message: "body parameter is missing!" });
let object = {
playerId: (req.body.playerId) ? req.body.playerId : '',
title: (req.body.title) ? req.body.title : '',
description: (req.body.description) ? req.body.description : '',
tags: (req.body.tags) ? req.body.tags : '',
metadata: (req.body.metadata) ? req.body.metadata : ''
}
let response = await createVideo.updateExistingVideo(videoId, object);
if (_.isEmpty(response))
return res.status(404).json({ status: "fail", msg: `Video not present or somthing is missing` });
return res.status(200).send(response)

} catch (error) {
return res.status(404).send({ status: 'fail', message: error });

}
}
exports.removeSingleVideo = async (req, res) => {
try {
if (_.isEmpty(req.params.videoId))
return res.status(404).json({ status: "fail", msg: `Video Id is required!` });
let response = await createVideo.deleteSingleVideo(req.params.videoId)

return res.status(200).send("video removed")

} catch (error) {
return res.status(404).send({ status: 'fail', message: error.problemDetails });
}

}
//some extra modules
exports.uploadFileByMultiparty = async (req, res) => {
//by the help of multipart module.
try {
var form = new multiparty.Form()
form.parse(req, function (err, fields, files) {
if (err) {
return res.status(400).json({
status: "fail",
msg: `<${err}>`
})
};
req.body.description = fields.description[0]
req.body.tittle = fields.tittle[0]
req.body.uploadedBy = fields.uploadedBy[0]
var File = files['image']
/**************** s3 uploads configurations start ******************** */
var AWS = require('aws-sdk')
AWS.config.update({
apiVersion: 'latest',
s3BucketEndpoint: false,
s3ForcePathStyle: true,
region: 'ap-southeast-2',
accessKeyId: process.env.AWS_AccessKeyId,
seccretAccessKey: process.env.AWS_SecretAccessKey
})

var s3 = new AWS.S3();
var myBucket = process.env.AWS_DraftBucket;
var path = File[0].path;
var stream = fs.createReadStream(path);
var fileName = File[0].originalFilename;
fileName = fileName.replace(/\s+/g, '').toLowerCase();
// var newFileName = path.parse(req.file.originalname).name;
var newFileName = Date.now() + '_' + fileName;
req.body.image = newFileName;
var params = {
Bucket: myBucket,
Body: stream,
Key: newFileName,
ACL: 'public-read',
ContentLength: stream.byteCount,
maxTries: 20
}
s3.upload(params, function (err, responseData) {
if (err) {
console.log("Error while uploading")
res.status(500).send({
message: err.message
})
} else {
let object = {
uploadedDoc: req.file.path,
description: req.body.description,
tittle: req.body.tittle,
uploadedBy: req.body.uploadedBy
}
let tt = responseData;
Upload.create(
object
)
.then(response => {
return res.send(response);
})
.catch(err => {
res.status(500).send({
message: err
});
});
}
})
/*************** s3 uploads configurations end *************************** */
})
} catch (error) {
return res.status(400).json({
status: "fail",
msg: error.message
})
}
}

// common function handler
const moveThem = async (original, destination) => {
// Move file ./filename to ./web-pdf
var original = original
var target = destination
await mv(original, target);
}

// for find operation.
// const userData = await Upload.findOne({ where: { id: req.body.id } });
// if (userData) {
// const finalresult = new Array()
// finalresult.push(req.file.path);
// if (userData.files)
// userData.files.forEach(val => {
// finalresult.push(val);
// });
// let object = {
// files: finalresult,
// description: (req.body.description) ? req.body.description : userData.description,
// title: (req.body.title) ? req.body.title : userData.title,
// uploadedBy: (req.body.uploadedBy) ? req.body.uploadedBy : userData.uploadedBy,
// key: baseUrlAWS
// }
// let updatedResult = await Upload.update(object, {
// where: {
// id: req.body.id
// }
// });
// if (updatedResult[0] == 0)
// return res.status(500).send({
// message: "No changes Deducted file already added."
// });
// return res.status(200).send({ message: "files updated successfully" })
// } else {
// let object = {
// files: [req.file.path],
// description: req.body.description,
// title: req.body.tittle,
// uploadedBy: req.body.uploadedBy,
// key: baseUrlAWS
// }

