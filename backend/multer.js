import multer from "multer";
import path from "path";

//Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");//Destination folder for storage upload files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));//unique fileName
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null,true);
    }
    else{
        cb(new Error("Only images are allowed"),false);
    }
};

const upload= multer({storage, fileFilter});

export default upload;
