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
  res.render('sharedLink', { shareLink, shareUrl, folderId: shareLink.folderId })
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
  res.render('shared', { sharedLinks })
}

exports.shareLink = async (req, res, next) => {
  const { token } = req.params;
  const { folderId } = req.query;
  try {
    const shareLink = await prisma.shareLink.findUnique({
      where: { token },
    });
    if (!shareLink || shareLink < new Date() || shareLink.revoked) return res.status(400).send('Link unavailable');
    const rootFolder = await prisma.folder.findUnique({
      where: { id: shareLink.folderId },
      include: {
        subfolders: true,
        files: true,
      }
    });
    // add new user to linkAccess
    if (req.user && rootFolder.authorId !== req.user.id) {
      await prisma.linkAccess.upsert({
        where: {
          shareLinkId_userId: {
            shareLinkId: shareLink.id,
            userId: req.user.id,
          }
        },
        create: {
          shareLinkId: shareLink.id,
          userId: req.user.id,
        },
        update: {},
      });
    }
    // get subfolders
    let current = rootFolder;
    let allowed = false;
    let id = folderId;
    if (folderId && folderId !== rootFolder.id) {
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
    res.render('sharedFolder', {
      folder: current,
      content: [...current.subfolders, ...current.files],
      breadcrumbs,
    })
  } catch (error) {
    console.error(error);
    next(error);
  }
}

exports.activate = async (req,res,next) => {
  const { id } = req.params;
  try {
    await prisma.shareLink.update({
      where: { id: parseInt(id, 10)},
      data: {
        revoked: false,
      }
    })
    res.redirect('/shared');
  } catch (error) {
    console.error(error);
    next(error);
  }
}

exports.extend = async (req,res,next) => {
  const { id } = req.params;
  try {
    await prisma.shareLink.update({
      where: { id: parseInt(id, 10)},
      data: { expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), }
    });
    res.redirect('/shared');
  } catch (error) {
    console.error(error);
    next(error);
  }
}

exports.revoke = async (req,res,next) => {
  const { id } = req.params;
  try {
    await prisma.shareLink.update({
      where: { id: parseInt(id, 10) },
      data: {
        revoked: true,
      },
    });
    res.redirect('/shared');
  } catch (error) {
    console.error(error);
    next(error);
  }
}

exports.delete = async (req,res,next) => {
  const { id } = req.params;
  try {
    await prisma.shareLink.delete({ where: { id: parseInt(id, 10)}});
    res.redirect('/shared');
  } catch (error) {
    console.error(error);
    next(error);
  }
}


exports.sharedWithMe = async (req, res, next) => {
  const accessibleLinks = await prisma.linkAccess.findMany({
    where: {
      userId: req.user.id,
      shareLink: {
        revoked: false,
        expiresAt: {
          gt: new Date(),
        }
      },
    },
    include: {
      shareLink: {
        include: {
          folder: {
            select: {
              author: {
                select: {
                  email:true
                }
              },
              name: true,
            }
          },
        }
      },
    }
  })
  console.log(accessibleLinks)
  const flattenLinks = accessibleLinks.map(link => ({
    ...link.shareLink.folder,
    id: link.shareLink.folder.id,
    createdAt: link.shareLink.createdAt,
    token: link.shareLink.token,
    firstAccessedAt:  link.firstAccessedAt,
    expiresAt: link.shareLink.expiresAt,
  }))
  res.render('sharedFolder', { title: 'Shared with me', content: flattenLinks, token: flattenLinks[0].token })
}