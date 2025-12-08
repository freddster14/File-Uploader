function showSideInfo(content) {
  const body = document.querySelector('.body');
  const sideInfo = document.querySelector('.side-info');
  const name = document.querySelector('.name-info')
  const owner = document.querySelector('.owner');
  const createdAt = document.querySelector('.created-at');
  const status = document.querySelector('.status');
  const firstAccessedAt = document.querySelector('.first-accessed-at');
  const expiresAt = document.querySelector('.expires-at');
  const expiredTitle = document.querySelector('.expire-title');

  if ('sharedLinks' in content) {
    name.textContent = content.name;
    owner.textContent = content.author.email;
    createdAt.textContent = new Date(content.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

    if(content.sharedLinks) {
      document.querySelector('.active').style.display = 'block';
      document.querySelector('.opened').textContent = `${content.sharedLinks.linkAccess.length} user(s)`

      if(new Date(content.sharedLinks.expiresAt) < new Date()) {
        expiredTitle.textContent = 'Expired';
        status.textContent = 'expired'
      }

      if (content.sharedLinks.revoked) status.textContent = 'revoked';

      expiresAt.textContent = new Date(content.sharedLinks.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    } else {
      document.querySelector('.not-active').style.display = 'flex';
      document.forms.generate.action = `/share/${content.id}`
    }
  } else {
    name.textContent = content.name;
    owner.textContent = content.author.email;
    createdAt.textContent = new Date(content.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    firstAccessedAt.textContent = new Date(content.firstAccessedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    expiresAt.textContent = new Date(content.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    if (new Date(content.expiresAt) < new Date()) {
      expiredTitle.textContent = 'Expired';
      status.textContent = 'expired'
    }
    if (content.revoked) status.textContent = 'revoked';
  }
 
  
  body.classList.add('with-sidebar');
  sideInfo.style.display = 'flex';
}

function closeSideInfo() {
  document.querySelector('.side-info').style.display = 'none';
  document.querySelector('.body').classList.remove('with-sidebar');
}