function formatSec(sec) {
  if(sec > 120) {
    return `${Math.floor(sec / 60)} minutes`
  } else if(sec > 60) {
    return `${Math.floor(sec / 60)} minute`
  } else {
    return `${sec} seconds`
  }
};

module.exports = formatSec;