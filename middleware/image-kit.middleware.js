const AppError = require("../utils/AppError.js");
const imagekit = require("../config/image-kit.js");

const uploadImageKit = (isMultipleFiles, folderName) => {
  return async (req, res, next) => {
    const hasFiles = isMultipleFiles
      ? req.files && req.files.length > 0
      : req.file;

    if (!hasFiles) return next();

    const files = isMultipleFiles ? req.files : [req.file];

    try {
      const imageKitPromises = files.map((file) =>
        imagekit.upload({
          file: file.buffer,
          fileName: `${Date.now()}-${file.originalname}`,
          folder: folderName,
        }),
      );

      const results = await Promise.all(imageKitPromises);
      const imagesUrl = results.map((item) => item.url);

      req.body.images = isMultipleFiles ? imagesUrl : imagesUrl[0];

      next();
    } catch (error) {
      return next(
        new AppError(`Failed to upload image: ${error.message}`, 400),
      );
    }
  };
};

module.exports = uploadImageKit;
