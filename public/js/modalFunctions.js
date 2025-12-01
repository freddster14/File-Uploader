let currentlyOpening = null;

function toggleModal(id, event) {
  const dialog = document.getElementById(id);
  if(dialog.open) {
    dialog.close();
  } else {
    currentlyOpening = dialog;
    dialog.show();
  }
}

// close modal when clicking outside
document.addEventListener('click', (e) => {
  const openDialogs = document.querySelectorAll('dialog[open]');

  openDialogs.forEach(dialog => {
    if (dialog === currentlyOpening) return;
    if (!dialog.contains(e.target) || !currentlyOpening.contains(e.target)) dialog.close();
  })

  currentlyOpening = null;
})

function previewImg(e) {
  const file = e.files[0];
  if (!file) return;

  const preview = document.getElementById("preview");
  preview.src = URL.createObjectURL(file);
}