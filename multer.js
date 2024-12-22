const multer = require("multer");
const upload = multer({ dest: 'uploads/' });

//filter only image files
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

// Storage configuration for exercice images
const exreciceImagesStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/exercice/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

//multer initial
const uploadExerciceImages = multer({
    storage: exreciceImagesStorage,
    fileFilter: imageFileFilter,
}).array("images",5);

const profileImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/profile/"); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname); 
    },
});

const uploadProfileImage = multer({
    storage: profileImageStorage,
    fileFilter: imageFileFilter,
}).single("profileImage");


module.exports = {
    uploadExerciceImages,
    uploadProfileImage
};