// const multer = require('multer')

// const storage = multer.diskStorage({})

// const upload = multer({
//     storage,
//     limits: {
//         fileSize: 2 * 1024 * 1024
//     },
//     fileFilter: (req, file, cb) => {
//         const allowedTypes = [
//             'image/jpeg',
//             'image/png',
//             'image/webp'
//         ]

//         if (!allowedTypes.includes(file.mimetype)) {

//             return cb(new Error("Only JPG, PNG and WEBP images are allowed"), false);
//         }

//         cb(null, true)

//     }
// })

// module.exports = upload

