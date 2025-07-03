var __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    let v = factory(require, exports);
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define(["require", "exports", "../../modules/sdk", ], factory);
  }
})(function (require, exports) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.randomString = exports.recursiveSearch = exports.mixinFunctions = exports.mixin = void 0;
  let sdk_1 = __importDefault(require("../../modules/sdk"));
  function mixin(target) {
    let sources = [];
    for (let _i = 1; _i < arguments.length; _i++) {
      sources[_i - 1] = arguments[_i];
    }
    sources.forEach(function (source) {
      return Object.getOwnPropertyNames(source.prototype)
        .forEach(function (key) { return Object.defineProperty(target.prototype, key, Object.getOwnPropertyDescriptor(source.prototype, key)); });
    });
  }
  exports.mixin = mixin;
  function mixinFunctions(target) {
    let sources = [];
    for (let _i = 1; _i < arguments.length; _i++) {
      sources[_i - 1] = arguments[_i];
    }
    sources.forEach(function (source) {
      return Object.getOwnPropertyNames(source.prototype)
        .forEach(function (key) {
          let propertyDescriptor = Object.getOwnPropertyDescriptor(source.prototype, key);
          let current = Object.getOwnPropertyDescriptor(target.prototype, key);
          if (!current && propertyDescriptor.hasOwnProperty("value") && typeof propertyDescriptor.value === "function") {
            Object.defineProperty(target.prototype, key, Object.getOwnPropertyDescriptor(source.prototype, key));
          }
        });
    });
  }
  exports.mixinFunctions = mixinFunctions;
  function recursiveSearch(o, n, changed) {
    if (changed === void 0) { changed = {}; }
    Object.keys(n).forEach(function (key) {
      if (typeof n[key] !== "object") {
        if (!o.hasOwnProperty(key) || o[key] !== n[key]) {
          changed[key] = n[key];
        }
      } else {
        if (typeof changed[key] !== "object" || !changed[key]) {
          changed[key] = {};
        }
        recursiveSearch((o === null || o === void 0 ? void 0 : o[key]) || {}, (n === null || n === void 0 ? void 0 : n[key]) || {}, changed[key]);
        if (!Object.keys(changed[key]).length)
          delete changed[key];
      }
    });
    return changed;
  }
  exports.recursiveSearch = recursiveSearch;
  function randomString(min, max) {
    return Array.apply(null, { length: min + ~~(rand(0, max - min)) })
      .map(function (_) { return "abcdefghijklmnopqrstuvwxyz".charAt(Math.floor(Math.random() * 26)); })
      .join("");
  }
  exports.randomString = randomString;
});
