const multer = require("multer");
const path = require("path");
const AppError = require("../utils/AppError.js");

const distStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!file.mimetype.startsWith("image")) {
      return cb(new AppError(400, "file must be image"), null);
    }
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const newFileName = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, newFileName);
  },
});

const memoryStorage = multer.memoryStorage();
const uploadLocal = multer({ storage: distStorage });
const uploadCDN = multer({ storage: memoryStorage });

module.exports = {
  uploadLocal,
  uploadCDN,
};
