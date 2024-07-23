
var AWS = require('aws-sdk');

const csprng = require('csprng');


var utility = {};


utility.sendImageS3Bucket = async function (data, imagePath) {
    var deletePath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

    if (data) {

        var ext = '';
        var imageData = data;
        if (imageData) {
            var fileName = imageData.name;
            var fileNameArr = fileName.split('.');

            if (fileNameArr.length) {
                ext = fileNameArr[fileNameArr.length - 1];
            }
        }

        if (imagePath == "dairy") {
            ext = "png";
        }

        var imgRand = Date.now() + (0, csprng)(24, 24) + '.' + ext;
        var path = './public/' + imagePath + '/' + imgRand;

        var savepath = imagePath + '/' + imgRand;
        // await imageData.mv(path);
        utility.saveImageS3Bucket({
            imageData: data,
            imageName: savepath
        }, ext);

        if (deletePath) {
            await utility.deleteImageS3Bucket(deletePath);
        }

        return savepath;
    }
};

utility.saveImageS3Bucket = function (data, ext) {
    try {
        console.log("data in main=-=-=-=-", data)
        console.log("ext in main=-=-=-=-", ext)

        if (data) {

            var s3 = new AWS.S3({
                accessKeyId: "AKIAU6GDZOCO3CGBLVU4",
                secretAccessKey: "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",
                region: "ap-south-1"
            });

            var params = {
                Bucket: "youthadda",
                Key: process.env.plateform + '/' + data.imageName,
                Body: data.imageData.data,
                ACL: 'public-read'
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
        console.log("File Found in S3");
        try {
            await s3.deleteObject(params).promise();
            console.log("file deleted Successfully");
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

exports.default = utility;