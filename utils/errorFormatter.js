function formatErrors (errors) {
  const formatted = {};
  for(let e of errors) {
    formatted[e.path] = e.msg;
  }
  console.log(formatted)
  return formatted
}

module.exports = formatErrors;