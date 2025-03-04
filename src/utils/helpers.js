const TYPES = [
  "Array",
  "Object",
  "String",
  "Date",
  "RegExp",
  "Function",
  "Boolean",
  "Number",
  "Null",
  "Undefined",
];

const type = function () {
  return Object.prototype.toString.call(this).slice(8, -1);
};

exports.isArray = (arr) => {
  return type.call(arr) === "Array";
};

exports.isObject = (obj) => {
  return type.call(obj) === "Object";
};
exports.isString = (str) => {
  return type.call(str) === "String";
};

exports.isDate = (date) => {
  return type.call(date) === "Date";
};

exports.isRegExp = (reg) => {
  return type.call(reg) === "RegExp";
};

exports.isFunction = (func) => {
  return type.call(func) === "Function";
};

exports.isBoolean = (bool) => {
  return type.call(bool) === "Boolean";
};

exports.isNumber = (num) => {
  return type.call(num) === "Number";
};

exports.isNull = (nul) => {
  return type.call(nul) === "Null";
};

exports.isUndefined = (und) => {
  return type.call(und) === "Undefined";
};

exports.isNullOrUndefined = (nul) => {
  return this.isNull(nul) || this.isUndefined(nul);
};
