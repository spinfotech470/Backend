
var AWS = require('aws-sdk');
const nodemailer = require('nodemailer');
const csprng = require('csprng');


var utility = {};

utility.sendImageS3BucketNew = async function (data, imagePath, imageName, imageType) {
    if (!data) {
        throw new Error('No image data provided');
    }

    // Extract file metadata
    let ext = data.fileType || '' || imageType;
    let imageData = data.image || data; // Assuming image data is already a buffer

    // If the fileType is not provided, extract from name or default
    let fileName = data.name || 'unknown' || imageName;
    if (!ext && fileName) {
        let fileNameArr = fileName.split('.');
        if (fileNameArr.length) {
            ext = fileNameArr[fileNameArr.length - 1];
        }
    }

    if (!ext) {
        throw new Error('Could not determine the file extension');
    }

    let imgRand = Date.now() + csprng(24, 24) + '.' + ext;
    let savepath = imagePath + '/' + imgRand;

    // Save image to S3
    await utility.saveImageS3BucketNew({
        imageData: imageData,
        imageName: savepath
    }, ext);

    return savepath;
};

utility.sendImageS3Bucket = async function (data, imagePath) {
    var deletePath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    if (data) {

        // Extract file metadata if data is a file object or buffer
        let ext = '';
        let imageData = data;
        if (imageData) {
            let fileName = imageData.name || 'unknown';
            let fileNameArr = fileName.split('.');
            if (fileNameArr.length) {
                ext = fileNameArr[fileNameArr.length - 1];
            }

        }
        if (imagePath == "dairy") {
            ext = "png";
        }

        let imgRand = Date.now() + (0, csprng)(24, 24) + '.' + ext;
        let savepath = imagePath + '/' + imgRand;

        // Assuming saveImageS3Bucket handles the actual saving to S3
        await utility.saveImageS3Bucket({
            imageData: data, // or data.buffer if it's a buffer
            imageName: savepath
        }, ext);

        if (deletePath) {
            await utility.deleteImageS3Bucket(deletePath);
        }

        return savepath;
    }
};

utility.saveImageS3BucketNew = function (data, ext) {
    try {

        if (data && data.imageData) {
            var s3 = new AWS.S3({
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_KEY,
                region: "ap-south-1"
            });

            // Determine the correct ContentType
            let contentType = 'image/png'; // default to PNG
            if (ext === 'jpg' || ext === 'jpeg') {
                contentType = 'image/jpeg';
            } else if (ext === 'gif') {
                contentType = 'image/gif';
            } else if (ext === 'pdf') {
                contentType = 'application/pdf';
            }

            var params = {
                Bucket: "youthadda",
                Key: process.env.plateform + '/' + data.imageName,
                Body: data.imageData,
                ContentType: contentType
            };

            s3.putObject(params, function (err, data) {
                if (err) {
                    console.log(err);
                    return { success: false, code: err };
                } else {
                    console.log(data);
                    return { success: true, code: data };
                }
            });
        } else {
            return { success: false, code: "Missing image data" };
        }
    } catch (error) {
        console.error(error);
        return { success: false, code: 500, msg: "Error", err: error };
    }
};

utility.saveImageS3Bucket = function (data, ext) {
    try {

        if (data) {

            var s3 = new AWS.S3({
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_KEY,
                region: "ap-south-1"
            });

            var params = {
                Bucket: "youthadda",
                Key: process.env.plateform + '/' + data.imageName,
                Body: data.imageData.data,
            };

            if (ext == 'pdf' || ext == 'PDF') {
                params.ContentType = "application/pdf";
            }

            s3.putObject(params, function (err, data) {
                if (err) {
                    console.log(err);
                    return { success: false, code: err };
                } else {
                    console.log(data);
                    return { success: false, code: data };
                }
            });
        } else {
            return { success: false, code: "req.files" };
        }
    } catch (error) {
        return { success: false, code: 500, msg: "Error", err: error };
    }
};

utility.deleteImageS3Bucket = async function (data) {

    AWS.config.update({
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
        region: process.env.S3_AWS_REGION_NAME
        //version: "****"
    });

    var s3 = new AWS.S3();

    var fileName = process.env.plateform + '/' + data;

    var params = {
        Bucket: process.env.S3_AWS_BUCKET_NAME,
        Key: fileName //if any sub folder-> path/of/the/folder.ext
    };
    try {
        await s3.headObject(params).promise();
        try {
            await s3.deleteObject(params).promise();
        } catch (err) {
            console.log("ERROR in file Deleting : " + JSON.stringify(err));
        }
    } catch (err) {
        console.log("File not Found ERROR : " + err.code);
    }
};

utility.getImage = function (filename, req, res) {
    var fs = require('fs');
    try {
        var data = fs.readFileSync('./images/' + filename, 'base64');
        return res.send({ success: true, code: 200, msg: "successfully in getting file", data: data });
    } catch (e) {
        return res.send({ success: false, code: 500, msg: "Error in getting file", error: e.stack });
    }
};

utility.sendNotificationMail = function async(postInfo, senderInfo, type, token, req, res) {
    try {
        let transporter = nodemailer.createTransport({
            service: "hotmail",
            auth: {
                user: "rahulacharya978@outlook.com",
                pass: "eeeeeeeeeex"
            }
        });

        const mailOptions = {
            from: 'rahulacharya978@outlook.com',
            to: postInfo.createdByDetails.email,
            subject: 'Notification Mail From YouthAdda',
            html: `<p>Hello ${postInfo.createdByDetails.name},</p>
               <p>Notification From YouthAdda ${type} on your Post by ${type === 'like' ? senderInfo.name : "SomeOne Check Now By Clicking below post"}</p>
               <br/>
               <a href="http://localhost:3000" target="_blank" style="display:block; text-decoration:none; color:inherit;">
           <div style="box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); padding: 10px; border-radius: 5px;">
             <p style="margin: 0; font-weight: bold;">${postInfo.questionTitle}</p>
             <img src="https://youthadda.s3.ap-south-1.amazonaws.com/undefined/${postInfo.imgUrl}" alt="Post Image" style="width: 100%; max-width: 600px; margin-top: 10px; border-radius: 5px;"/>
           </div>
         </a>`
        };
        transporter.sendMail(mailOptions, function (error, info) {

            // if (error) {
            // console.log(error)
            //   res.send({ code: code.fail, msg: "Error", data: error });
            // } else {
            //   res.send({ code: code.success, msg: "Done", data: info });
            // }
            // if (info) {
            //   res.send({ code: code.success, msg: "done", data: info });
            // }
            // else {
            //   res.send({ code: code.fail, msg: "MAil has been send", data: error });
            // }
        });
    } catch (error) {
        console.log(error)
        res.send({ code: code.success, msg: error });
    }
}

exports.default = utility;