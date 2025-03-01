function trueType() {
  return Object.prototype.toString.call(this).slice(8, -1);
}

exports.isArray = (type) => {};
