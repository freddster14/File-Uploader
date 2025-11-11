const multer = require('multer');
const upload = multer({ dest: '../uploads' });

exports.upload = [upload.single('uploadedFile'), (req, res) => {
  const file = req.file;
  console.log(file);
}]