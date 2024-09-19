
var AWS = require('aws-sdk');
const nodemailer = require('nodemailer');
const csprng = require('csprng');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const crypto = require('crypto');

const storage = new Storage({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, // Path to your service account key JSON file
    projectId: 'youthadda@youthadda.iam.gserviceaccount.com', // Replace with your Google Cloud project ID
  });
  const bucketName = process.env.GCLOUD_STORAGE_BUCKET; // Your bucket name
var utility = {};


// utility.sendImageS3Bucket = async function (data, imagePath) {
//     console.log("actual image=here=-=-=======",data)
//     var deletePath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

//     if (data) {

//         var ext = '';
//         var imageData = data;
//         if (imageData) {
//             var fileName = imageData.name;
//             var fileNameArr = fileName.split('.');

//             if (fileNameArr.length) {
//                 ext = fileNameArr[fileNameArr.length - 1];
//             }
//         }

//         if (imagePath == "dairy") {
//             ext = "png";
//         }

//         var imgRand = Date.now() + (0, csprng)(24, 24) + '.' + ext;
//         var path = './public/' + imagePath + '/' + imgRand;

//         var savepath = imagePath + '/' + imgRand;
//         // await imageData.mv(path);
//         utility.saveImageS3Bucket({
//             imageData: data,
//             imageName: savepath
//         }, ext);

//         if (deletePath) {
//             await utility.deleteImageS3Bucket(deletePath);
//         }

//         return savepath;
//     }
// };

// utility.sendImageS3BucketNew = async function (data, imagePath, imageName, imageType) {
//     console.log("Received image data new: ", data);
//     if (!data) {
//         throw new Error('No image data provided');
//     }

//     // Extract file metadata
//     let ext = data.fileType || '' || imageType;
//     let imageData = data.image || data; // Assuming image data is already a buffer

//     // If the fileType is not provided, extract from name or default
//     let fileName = data.name || 'unknown' || imageName;
//     if (!ext && fileName) {
//         let fileNameArr = fileName.split('.');
//         if (fileNameArr.length) {
//             ext = fileNameArr[fileNameArr.length - 1];
//         }
//     }

//     if (!ext) {
//         throw new Error('Could not determine the file extension');
//     }

//     let imgRand = Date.now() + csprng(24, 24) + '.' + ext;
//     let savepath = imagePath + '/' + imgRand;

//     // Save image to S3
//     await utility.saveImageS3BucketNew({
//         imageData: imageData,
//         imageName: savepath
//     }, ext);

//     return savepath;
// };


// Function to send image to Google Cloud Storage bucket

utility.sendImageS3BucketNew = async function (data, imagePath, imageName, imageType) {
    // console.log("Received image data new: ", data);
    
    if (!data) {
      throw new Error('No image data provided');
    }
  
    let ext = data.fileType || imageType;
    let imageData = data.image || data; // Assuming image data is already a buffer
    let fileName = data.name || imageName || 'unknown';
  
    // Extract file extension if not provided
    if (!ext && fileName) {
      let fileNameArr = fileName.split('.');
      if (fileNameArr.length) {
        ext = fileNameArr[fileNameArr.length - 1];
      }
    }
  
    if (!ext) {
      throw new Error('Could not determine the file extension');
    }
  
    // Generate a unique filename
    const imgRand = Date.now() + crypto.randomBytes(12).toString('hex') + '.' + ext;
    const savePath = path.join(imagePath, imgRand); // Using `path` to handle file paths
  
    // Save the image to Google Cloud Storage
    await utility.saveImageGCSBucketNew({
      imageData,
      imageName: savePath
    }, ext);
  
    return savePath;
  };


// utility.sendImageS3Bucket = async function (data, imagePath) {
//     console.log("Received image data: ", data);
//     var deletePath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
//     if (data) {

//     // Extract file metadata if data is a file object or buffer
//     let ext = '';
//     let imageData = data;
//     if(imageData){
//         let fileName = imageData.name || 'unknown';
//         let fileNameArr = fileName.split('.');
//         if(fileNameArr.length){
//             ext = fileNameArr[fileNameArr.length - 1];
//         }

//     }
//     if (imagePath == "dairy") {
//         ext = "png";
//     }

//     let imgRand = Date.now() + (0, csprng)(24, 24) + '.' + ext;
//     let savepath = imagePath + '/' + imgRand;

//     // Assuming saveImageS3Bucket handles the actual saving to S3
//     await utility.saveImageS3Bucket({
//         imageData: data, // or data.buffer if it's a buffer
//         imageName: savepath
//     }, ext);

//     if (deletePath) {
//         await utility.deleteImageS3Bucket(deletePath);
//     }

//     return savepath;
// }
// };

// utility.saveImageS3BucketNew = function (data, ext) {
//     try {
//         console.log("Data in main: ", data);
//         console.log("Extension in main: ", ext);

//         if (data && data.imageData) {
//             var s3 = new AWS.S3({
//                 accessKeyId: "AKIAU6GDZOCO3CGBLVU4",
//                 secretAccessKey: "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",
//                 region: "ap-south-1"
//             });

//             // Determine the correct ContentType
//             let contentType = 'image/png'; // default to PNG
//             if (ext === 'jpg' || ext === 'jpeg') {
//                 contentType = 'image/jpeg';
//             } else if (ext === 'gif') {
//                 contentType = 'image/gif';
//             } else if (ext === 'pdf') {
//                 contentType = 'application/pdf';
//             }

//             var params = {
//                 Bucket: "youthadda",
//                 Key: process.env.plateform + '/' + data.imageName,
//                 Body: data.imageData, // Buffer containing the image data
//                 ACL: 'public-read',
//                 ContentType: contentType
//             };

//             s3.putObject(params, function (err, data) {
//                 if (err) {
//                     console.log(err);
//                     return { success: false, code: err };
//                 } else {
//                     console.log(data);
//                     return { success: true, code: data };
//                 }
//             });
//         } else {
//             return { success: false, code: "Missing image data" };
//         }
//     } catch (error) {
//         console.error(error);
//         return { success: false, code: 500, msg: "Error", err: error };
//     }
// };

utility.sendImageS3Bucket = async function (data, imagePath) {
    // console.log("Received image data: ", data);
    const deletePath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    
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

        // Default extension handling for specific imagePath
        if (imagePath === "dairy") {
            ext = "png";
        }

        // Generate a unique filename
        const imgRand = Date.now() + crypto.randomBytes(12).toString('hex') + '.' + ext;
        const savePath = path.join(imagePath, imgRand); // Using `path` to handle file paths

        // Save image to Google Cloud Storage
        await utility.saveImageGCSBucket({
            imageData: data, // Image data buffer
            imageName: savePath
        }, ext);

        // Optionally delete the old image
        if (deletePath) {
            await utility.deleteImageGCSBucket(deletePath);
        }

        return savePath;
    }
};

utility.saveImageGCSBucket = async function (data, ext) {
    return new Promise((resolve, reject) => {
        try {
            if (!data || !data.imageData) {
                return resolve({ success: false, code: "Missing image data" });
            }

            // Extract the actual image data buffer
            const imageBuffer = data.imageData.data;

            // Determine ContentType based on file extension
            let contentType = 'image/png'; // Default to PNG
            if (ext === 'jpg' || ext === 'jpeg') {
                contentType = 'image/jpeg';
            } else if (ext === 'gif') {
                contentType = 'image/gif';
            } else if (ext === 'pdf') {
                contentType = 'application/pdf';
            }

            // Upload to Google Cloud Storage
            const bucket = storage.bucket('youthadda');
            const file = bucket.file(data.imageName); // The full path to the image in the bucket

            const stream = file.createWriteStream({
                metadata: {
                    contentType: contentType,
                },
                resumable: false, // Disable resumable uploads (can enable if needed)
            });

            stream.on('error', (err) => {
                console.error('Error uploading to Google Cloud Storage:', err);
                return reject({ success: false, code: 500, msg: "Error", err: err });
            });

            stream.on('finish', () => {
                console.log(`Upload of ${data.imageName} successful.`);
                return resolve({ success: true, code: 'Upload successful' });
            });

            // Write image data (Buffer) to Google Cloud Storage
            stream.end(imageBuffer); // Pass the actual image buffer here

        } catch (error) {
            console.error('Error saving image:', error);
            return reject({ success: false, code: 500, msg: "Error", err: error });
        }
    });
};

// utility.saveImageGCSBucket = async function (data, ext) {
//     try {

//         if (!data || !data.imageData) {
//             return { success: false, code: "Missing image data" };
//         }

//         // Determine ContentType based on file extension
//         let contentType = 'image/png'; // Default to PNG
//         if (ext === 'jpg' || ext === 'jpeg') {
//             contentType = 'image/jpeg';
//         } else if (ext === 'gif') {
//             contentType = 'image/gif';
//         } else if (ext === 'pdf') {
//             contentType = 'application/pdf';
//         }

//         // Upload to Google Cloud Storage
//         const bucket = storage.bucket(bucketName);
//         const file = bucket.file(data.imageName); // The full path to the image in the bucket

//         const stream = file.createWriteStream({
//             metadata: {
//                 contentType: contentType,
//             },
//             resumable: false, // Disable resumable uploads (can enable if needed)
//             public: true, // Set the file to be publicly accessible
//         });

//         stream.on('error', (err) => {
//             console.error('Error uploading to Google Cloud Storage:', err);
//             throw err;
//         });

//         stream.on('finish', () => {
//             console.log('Upload complete!');
//         });

//         // Write image data (Buffer) to Google Cloud Storage
//         stream.end(data.imageData);

//         return { success: true, code: 'Upload successful' };
//     } catch (error) {
//         console.error('Error saving image:', error);
//         return { success: false, code: 500, msg: "Error", err: error };
//     }
// };

// utility.saveImageGCSBucket = async function (data, ext) {
//     try {
//         console.log("Data in main: ", data);
//         console.log("Extension in main: ", ext);

//         if (!data || !data.imageData) {
//             return { success: false, code: "Missing image data" };
//         }

//         // Extract the actual image data buffer
//         const imageBuffer = data.imageData.data;

//         // Determine ContentType based on file extension
//         let contentType = 'image/png'; // Default to PNG
//         if (ext === 'jpg' || ext === 'jpeg') {
//             contentType = 'image/jpeg';
//         } else if (ext === 'gif') {
//             contentType = 'image/gif';
//         } else if (ext === 'pdf') {
//             contentType = 'application/pdf';
//         }

//         // Upload to Google Cloud Storage
//         const bucket = storage.bucket(bucketName);
//         const file = bucket.file(data.imageName); // The full path to the image in the bucket

//         const stream = file.createWriteStream({
//             metadata: {
//                 contentType: contentType,
//             },
//             resumable: false, // Disable resumable uploads (can enable if needed)
//             public: true, // Set the file to be publicly accessible
//         });

//         stream.on('error', (err) => {
//             console.error('Error uploading to Google Cloud Storage:', err);
//             throw err;
//         });

//         stream.on('finish', () => {
//             console.log('Upload complete!');
//         });

//         // Write image data (Buffer) to Google Cloud Storage
//         stream.end(imageBuffer);  // Pass the actual image buffer here

//         return { success: true, code: 'Upload successful' };
//     } catch (error) {
//         console.error('Error saving image:', error);
//         return { success: false, code: 500, msg: "Error", err: error };
//     }
// };

utility.deleteImageGCSBucket = async function (imageName) {
    try {
        const bucket = storage.bucket(bucketName);
        await bucket.file(imageName).delete();
        return { success: true, code: 'Deletion successful' };
    } catch (error) {
        console.error('Error deleting image:', error);
        return { success: false, code: 500, msg: "Error", err: error };
    }
};

utility.saveImageGCSBucketNew = async function (data, ext) {
    try {
  
      if (!data || !data.imageData) {
        return { success: false, code: "Missing image data" };
      }
  
      // Determine ContentType based on file extension
      let contentType = 'image/png'; // default to PNG
      if (ext === 'jpg' || ext === 'jpeg') {
        contentType = 'image/jpeg';
      } else if (ext === 'gif') {
        contentType = 'image/gif';
      } else if (ext === 'pdf') {
        contentType = 'application/pdf';
      }
  
      // Upload to Google Cloud Storage
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(data.imageName); // The full path to the image in the bucket
  
      const stream = file.createWriteStream({
        metadata: {
          contentType: contentType,
        },
        resumable: false, // Disable resumable uploads (can enable if needed)
        public: true, // Set the file to be publicly accessible (equivalent to ACL 'public-read')
      });
  
      stream.on('error', (err) => {
        console.error('Error uploading to Google Cloud Storage:', err);
        throw err;
      });
  
      stream.on('finish', () => {
      });
  
      // Write image data (Buffer) to Google Cloud Storage
      stream.end(data.imageData);
  
      return { success: true, code: 'Upload successful' };
    } catch (error) {
      console.error('Error saving image:', error);
      return { success: false, code: 500, msg: "Error", err: error };
    }
  };

utility.saveImageS3Bucket = function (data, ext) {
    try {

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
                    return { success: false, code: err };
                } else {
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
        }
    } catch (err) {
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

// utility.sendEmail = function (data) {
//     var sgMail = require('@sendgrid/mail');
//     var SENDGRID_API_KEY = 'SG.CBXp8pQQMlFHEQSw98';
//     sgMail.setApiKey(SENDGRID_API_KEY);

//     var htmlBody = data.html;

//     var msg = {
//         to: data.to,
//         from: 'abc@gmail.com',
//         subject: data.subject,
//         html: htmlBody
//     };

//     sgMail.send(msg).then(function (response) {
//         console.log(response);
//     }).catch(function (error) {
//         console.log(error);
//     });
// };

// utility.sendNotificationMail = function async(postInfo, senderInfo, type, token, req, res){
//     console.log("postInfo",postInfo)
//     console.log("senderInfo",senderInfo)

//     try {
//       let transporter = nodemailer.createTransport({
//         service: "hotmail",
//         auth: {
//           user: "rahulacharya978@outlook.com",
//           pass: "Rahul@outlook.com"
//         }
//       });

//       const mailOptions = {
//         from: 'rahulacharya978@outlook.com',
//         to: postInfo.createdByDetails.email,
//         subject: 'Notification Mail From YouthAdda',
//         html: `<p>Hello ${postInfo.createdByDetails.name},</p>
//                <p>Notification From YouthAdda ${type} on your Post by ${type === 'like' ? senderInfo.name : "SomeOne Check Now By Clicking below post"}</p>
//                <br/>
//                <a href="http://localhost:3000" target="_blank" style="display:block; text-decoration:none; color:inherit;">
//            <div style="box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); padding: 10px; border-radius: 5px;">
//              <p style="margin: 0; font-weight: bold;">${postInfo.questionTitle}</p>
//              <img src="https://youthadda.s3.ap-south-1.amazonaws.com/undefined/${postInfo.imgUrl}" alt="Post Image" style="width: 100%; max-width: 600px; margin-top: 10px; border-radius: 5px;"/>
//            </div>
//          </a>`
//       };
//       transporter.sendMail(mailOptions, function (error, info) {
  
//         if (error) {
//         console.log(error)
//           res.send({ code: code.fail, msg: "Error", data: error });
//         } else {
//           res.send({ code: code.success, msg: "Done", data: info });
//         }
//         if (info) {
//           res.send({ code: code.success, msg: "done", data: info });
//         }
//         else {
//           res.send({ code: code.fail, msg: "MAil has been send", data: error });
//         }
//       });
//     } catch (error) {
//         console.log(error)
//       res.send({ code: code.success, msg: error });
//     }
//   }

utility.sendNotificationMail = async function(postInfo, senderInfo, type, token, req, res) {

    try {
        // Check if the sender is the same as the post creator
        if (senderInfo._id === postInfo.createdByDetails._id) {
            return; // Exit the function without sending an email
        }

        let transporter = nodemailer.createTransport({
            service: "hotmail",
            auth: {
                user: "rahulacharya978@outlook.com",
                pass: "Rahul@outlook.com"
            }
        });

        const mailOptions = {
            from: 'rahulacharya978@outlook.com',
            to: postInfo.createdByDetails.email,
            subject: 'Notification Mail From YouthAdda',
            html: `<p>Hello ${postInfo.createdByDetails.name},</p>
                   <p>Notification From YouthAdda ${type} on your Post by ${type === 'like' ? senderInfo.name : "SomeOne Check Now By Clicking below post"}</p>
                   <br/>
                   <a href="http://localhost:3000/questionDetails/${postInfo._id}" target="_blank" style="display:block; text-decoration:none; color:inherit;">
               <div style="box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); padding: 10px; border-radius: 5px;">
                 <p style="margin: 0; font-weight: bold;">${postInfo.questionTitle}</p>
                 <img src="https://youthadda.s3.ap-south-1.amazonaws.com/undefined/${postInfo.imgUrl}" alt="Post Image" style="width: 100%; max-width: 600px; margin-top: 10px; border-radius: 5px;"/>
               </div>
             </a>`
        };

        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                res.send({ code: code.fail, msg: "Error", data: error });
            } else {
                res.send({ code: code.success, msg: "Done", data: info });
            }
        });
    } catch (error) {
        res.send({ code: code.success, msg: error });
    }
};


exports.default = utility;