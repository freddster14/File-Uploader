const cloudinary = require('../config/cloudinary');
const prisma = require('../prisma/client');
const fileSizeFormat = require('../utils/fileSizeFormat');
const upload = require('../middleware/upload');
const breadcrumbing = require('../utils/breadCrumbs');


exports.upload = [
  (req, res, next) => {
    upload.single('uploadFile')(req, res, (err) => {
      if (err) req.uploadError = err;
      next()
    });
  },
  async (req, res, next) => {
  
  let id  = req.params.id;
  // set id to user when home
  try {
    if (req.uploadError) throw req.uploadError;
    let folder;
    // get either root or subfolders
    if (id === '-1') {
      id === req.user.id
      folder = await prisma.folder.findFirst({
        where: {
          authorId: id,
          parent: null,
        }
      })
    } else {
      folder = await prisma.folder.findUnique({ where: { id: parseInt(id, 10) } });
    }

  
    //auth
    if (!folder || folder.authorId !== req.user.id) return res.status(403).send('Not authorized');
    
    // upload to cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
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
      uploadStream.end(req.file.buffer);
    });
    // save to database
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
    console.error(error);
    const breadcrumbs = await breadcrumbing(id);
    const folder = await prisma.folder.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        subfolders: true,
        files: true,
      }
    });
    if(folder) {
      return res.status(500).render('home', {
        folder,
        content: [...folder.subfolders, ...folder.files],
        breadcrumbs,
        errors: [{ msg: error.message }]
      })
    }
    next(error);
  }
}]

exports.edit = async (req,res,next) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const file = await prisma.file.update({
      where: {
        id: parseInt(id, 10)
      },
      data: {
        name: name,
      },
    })
    res.redirect(`/folder/${file.folderId}`)
  } catch (error) {
    console.error(error)
  }
}

exports.delete = async (req, res, next) => {
  const { id } = req.params;
  try {
    const file = await prisma.file.delete({
      where: { id: parseInt(id, 10) },
      include: {
        folder: true
      }
    });
    console.log(file)
    if (file.folder.authorId !== req.user.id) {return res.status(403).send('Not authorized');}
    await cloudinary.uploader.destroy(file.cloudinaryId);
    res.redirect(`/folder/${file.folderId}`)
  } catch (error) {
    next(error)
  }
}