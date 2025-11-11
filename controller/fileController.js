const cloudinary = require('../config/cloudinary');
const prisma = require('../prisma/client');

exports.upload = async (req, res, next) => {
  const { id } = req.params;
  
  //check if a file is upladed
  if (!req.file) return res.status(400).send('No file uploaded');

  try {
    const folder = prisma.folder.findUnique({ where: { id: parseInt(id, 10) }});
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
        url: result.secure_url,
        mimeType: req.file.mimeType,
        cloudinaryId: result.public_id,
        folderId: folder.id,
      }
    });
    res.redirect(`folder/${folder.id}`)
  } catch (error) {
    console.error(error)
    next(error)
  };
 
}