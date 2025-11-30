const prisma = require('../prisma/client');

async function breadcrumbing(id, share = {}) {
  let current = await prisma.folder.findUnique({
    where: { id: parseInt(id, 10) },
  });
  const res = [current]
  // go up the tree
  while (current.parentId !== null) {
    current = await prisma.folder.findUnique({
      where: {
        id: current.parentId,
      }
    })
    if (share.limitId && current.id === share.limitId) return res;
    if(res.length === 3) return res;
    if(share.limitId) {
      res.push({ name: current.name, link: `/share/${share.token}/?folderId=${current.id}` });
    } else {
      res.push({ name: current.name, link: `/folder/${current.id}` });
    }
   
  }
  return res;
}

module.exports = breadcrumbing;