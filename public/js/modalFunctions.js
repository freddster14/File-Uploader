function toggleModal(id) {
  const modal = document.getElementById(id);
  if(modal.open) {
    modal.close()
  } else {
    modal.show()
  }
}

// close modal when clicking outside
document.addEventListener('click', (e) => {
  const modals = document.querySelectorAll('dialog');
  modals.forEach(modal => {
    if (modal.open && e.target.id !== modal.id && !modal.contains(e.target)) modal.close()
  })
})

function previewImg(e) {
  const file = e.files[0];
  if (!file) return;

  const preview = document.getElementById("preview");
  preview.src = URL.createObjectURL(file);
}