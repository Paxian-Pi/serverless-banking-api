const express = require('express')
const router = express.Router()
const multer = require("multer")
const path = require("path")
const mongoose = require('mongoose')
const Schema = mongoose.Schema
// const fs = require("fs")

// const FileUploadModel = require('../models/FileUploadModel')

const fileUploadModel = mongoose.model('uploads', new Schema({
    file: {
        type: String
    },
    filePath: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
}))

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
        // cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

router.get('/upload/:filename', (req, res) => {
    fileUploadModel
        .find()
        .then(img => {
            console.log(img)
            res.json(img)
        })
})

router.put("/uploadfile", upload.single("file"), uploadFile);

function uploadFile(req, res) {

    const host = req.hostname;
    const filePath = req.protocol + "s://" + host + req.file.path;

    const fileupload = new fileUploadModel({
        file: req.file.filename,
        filePath: filePath
    })

    console.log(req.file)

    fileupload.save().then(file => {
        res.json({
            message: "Successfully uploaded file",
            data: file
        });
    })
}


// router.put('/uploadfile', upload.single('file'), (req, res) => {
//     var img = fs.readFileSync(req.file.path);
//     var encode_img = img.toString('base64');
//     var final_img = {
//         contentType: req.file.mimetype,
//         image: new Buffer.from(encode_img, 'base64')
//     };
//     FileUploadModel.create(final_img, function(err, result) {
//         if(err) {
//             console.log(err);
//         }else{
//             // console.log(result.img.Buffer.from());
//             console.log("Saved To database");
//             // console.log(final_img.contentType);
//             // console.log(final_img.image);
//             res.contentType(final_img.contentType);
//             res.send(final_img.image);
//         }
//     })
// })


module.exports = router