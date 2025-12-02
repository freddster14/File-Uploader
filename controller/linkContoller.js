const prisma = require('../prisma/client');
const breadcrumbing = require('../utils/breadCrumbs');
const crypto = require('crypto')

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
  res.render('shared', { shareLink, shareUrl, folderId: shareLink.folderId })
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
    if (folderId) {
      const folder = await prisma.folder.findUnique({
        where: { id: parseInt(folderId, 10) },
        include: {
          subfolders: true,
          files: true,
        },
      });
      current = folder;
      while (current.parentId) {
        if (current.id === rootFolder.id) {
          allowed = true;
          current = folder;
          break;
        }
        current = await prisma.folder.findUnique({ where: { id: current.parentId } })
      }
      if (!allowed) return res.status(403).send('Not authorized');
    } else {
      id = rootFolder.id
    }
    const breadcrumbs = await breadcrumbing(id, { token, limitId: rootFolder.parentId });
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

exports.revoke = async (req,res,next) => {
  
}

exports.shared = async (req, res, next) => {
  const sharedLinks = await prisma.shareLink.findMany({
    where: {
      folder: { authorId: req.user.id }
    },
    include: {
      folder: {
        select: {
          id: true,
          name: true,
        }
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  sharedLinks.forEach(link => {
    link.sharedUrl = `${req.protocol}://${req.get('host')}/share/${link.token}`
  })
  res.render('sharedView', { sharedLinks })
}

exports.sharedWithMe = async (req, res, next) => {

}