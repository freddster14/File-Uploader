const prisma = require('../prisma/client');
const breadcrumbing = require('../utils/breadCrumbs');
const crypto = require('crypto')

exports.getFolder = async (req, res, next) => {
  const { id } = req.params;
  try {
    const folder = await prisma.folder.findUnique({
      where: {
        id: parseInt(id, 10),
      },
      include: {
        subfolders: true,
        files: true,
      }
    });
    // auth
    if (req.user.id !== folder.authorId) return res.status(403).send('Not authorized');
    const breadcrumbs = await breadcrumbing(id);
    res.render('home', { folder, content: [...folder.subfolders, ...folder.files], breadcrumbs })
  } catch (error) {
    next(error)
  }
};

exports.createSubfolder = async (req, res, next) => {
  const { name } = req.body;
  const parentId = parseInt(req.params.id, 10);
  console.log(name)
  try {
    await prisma.folder.create({
      data: {
        name: name || 'New Folder',
        authorId: req.user.id,
        parentId,
      },
    });
    res.redirect(`/folder/${parentId}`);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.edit = async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const folder = await prisma.folder.update({
      where: { id: parseInt(id, 10)},
      data: {
        name: name
      }
    });
    if (folder.parentId) return res.redirect(`/folder/${folder.parentId}`);

    res.redirect('/')
  } catch (error) {
    console.error(error);
    next(error);
  };
}

exports.delete = async (req, res, next) => {
  const { id } = req.params;
  try {
    const folder = await prisma.folder.delete({ where: { id: parseInt(id, 10) } });
    console.log(folder)
    if (folder.parentId) return res.redirect(`/folder/${folder.parentId}`);
    res.redirect('/')
  } catch (error) {
    console.error(error)
    next(error)
  };
}

exports.generateLink = async (req, res, next) => {
  const { id } = req.params;
  const token = crypto.randomBytes(32).toString('hex');
  const shareLink = await prisma.shareLink.create({
    data: {
      token: token,
      folderId: parseInt(id),
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),// 3 days
    },
  });
  //shareable link
  const shareUrl = `${req.protocol}://${req.get('host')}/share/${token}`;
  res.render('share', { shareLink, shareUrl, folderId: shareLink.folderId })
}

exports.shareLink = async (req, res, next) => {
  const { token } = req.params;
  const { folderId } = req.query;
  try {
    const shareLink = await prisma.shareLink.findUnique({
      where: { token },
    });
    if (!shareLink || shareLink < new Date()) return res.status(400).send('Link unavailable');
    const rootFolder = await prisma.folder.findUnique({
      where: { id: shareLink.folderId },
      include: {
        subfolders: true,
        files: true,
      }
    });
    // get subfolders
    let current = rootFolder;
    let allowed = false;
    let id = folderId;
    if(folderId) {
      const folder = await prisma.folder.findUnique({
        where: { id: parseInt(folderId, 10) },
        include: {
          subfolders: true,
          files: true,
        },
      });
      current = folder;
      while(current.parentId) {
        if (current.id === rootFolder.id) {
          allowed = true;
          current = folder;
          break;
        }
        current = await prisma.folder.findUnique({ where: { id: current.parentId }})
      }
      if (!allowed) return res.status(403).send('Not authorized');
    } else {
      id = rootFolder.id
    }
    console.log(folderId)
    const breadcrumbs = await breadcrumbing(id , { token, limitId: rootFolder.parentId });
    console.log(breadcrumbs)
    res.render('shareFolder', {
      folder: current,
      content: [...current.subfolders, ...current.files],
      breadcrumbs,
      token,
    })
  } catch (error) {
    console.error(error);
    next(error);
  }
}

