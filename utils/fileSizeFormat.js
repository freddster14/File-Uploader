function formatSize (size) {
  if (size > 1000000) {
    return `${(size/( 1024 * 1024)).toFixed(1)} MB`
  } else if (size > 1024) {
    return `${(size/1024).toFixed(1)} KB`
  } else {
    return `${size} B`
  }
};

module.exports = formatSize;
