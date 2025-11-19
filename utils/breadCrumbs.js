const prisma = require('../prisma/client');

async function breadcrumbing(id, share = {}) {
  let current = await prisma.folder.findUnique({
    where: { id: parseInt(id, 10) },
  });
  const res = []
  // go up the tree
  while (current.parentId !== null || (share.limitId && current.id !== share.limitId)) {
    if(share.limitId) {
      res.push({ name: current.name, link: `/share/${share.token}/?folderId=${current.id}` });
    } else {
      res.push({ name: current.name, link: `/folder/${current.id}` });
    }
    current = await prisma.folder.findUnique({
      where: {
        id: current.parentId,
      }
    })
  }
  return res;
}

module.exports = breadcrumbing;