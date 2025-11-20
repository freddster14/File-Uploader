function formatErrors (errors) {
  const formatted = {};
  for(let e of errors) {
    formatted[e.path] = e.msg;
  }
  return formatted
}

module.exports = formatErrors;