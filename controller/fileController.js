const cloudinary = require('../config/cloudinary');
const prisma = require('../prisma/client');
const fileSizeFormat = require('../utils/fileSizeFormat');
const upload = require('../middleware/upload');
const breadcrumbing = require('../utils/breadCrumbs');


exports.upload = [
  (req, res, next) => {
    upload.single('uploadFile')(req,res, async function (err) {
      if (err) {
        const { id } = req.params
        const breadcrumbs = await breadcrumbing(id);
        const folder = await prisma.folder.findUnique({
          where: { id: parseInt(id, 10) },
          include: {
            subfolders: true,
            files: true,
          }
        });
        
        if (!folder || folder.authorId !== req.user.id) return res.status(403).send('Not authorized');
        console.log(err.message)
        return res.status(400).render('home', {
          folder,
          content: [...folder.subfolders, ...folder.files],
          breadcrumbs,
          errors: [{ msg: err.message }]
        })
      }
    })
  },
  async (req, res, next) => {
  const { id } = req.params;
  
  //check if a file is upladed
  if (!req.file) return res.status(400).send('No file uploaded');
  console.log(req.file)
  try {
    const folder = await prisma.folder.findUnique({ where: { id: parseInt(id, 10) }});
    if (!folder || folder.authorId !== req.user.id) return res.status(403).send('Not authorized');
    
    // upload to cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadSteam = cloudinary.uploader.upload_stream(
        {
          folder: `user_${req.user.id}/folder_${folder.id}`,
          resource_type: 'auto',
          public_id: `${Date.now()}_${req.file.originalname}`
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      // send file buffer to Cloudinary
      uploadSteam.end(req.file.buffer);
    });
    // save file to database
    const file = await prisma.file.create({
      data: {
        name: req.file.originalname,
        size: req.file.size,
        formattedSize: fileSizeFormat(req.file.size),
        url: result.secure_url,
        mimeType: req.file.mimetype,
        cloudinaryId: result.public_id,
        folderId: folder.id,
      }
    });
    res.redirect(`/folder/${folder.id}`)
  } catch (error) {
    console.error(error)
    next(error)
  };
}]

exports.delete = async (req, res, next) => {

}