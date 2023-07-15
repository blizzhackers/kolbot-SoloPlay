/**
 * @filename    Events.js
 * @author      Jaenster
 * @desc        Transpiled UMD event module. Adds prototypes ("on", "emit", "once", "off") to Unit
 * 
 */

(function (factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    let v = factory(require, exports);
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define(["require", "exports"], factory);
  }
})(function (require, exports) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Events = void 0;
  let handlers = new WeakMap();
  let onceHandlers = new WeakMap();
  const __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (let i = 0, il = from.length, j = to.length; i < il; i++, j++) {
      to[j] = from[i];
    }
    return to;
  };
  // eslint-disable-next-line no-var
  var Events = /** @class */ (function () {
    function Events () {
    }
    // Generic type S to give to EventHandler<S> to typehint this function gets the same this as where the event is registered
    Events.prototype.on = function (key, handler, handlerType) {
      if (handlerType === void 0) {
        handlerType = handlers;
      }

      let map, set;

      !handlerType.has(this)
        ? handlerType.set(this, map = new Map)
        : map = handlerType.get(this);
      !map.has(key)
        ? map.set(key, set = [])
        : set = map.get(key);
      // Add this handler, since it has to be unique we dont need to check if it exists
      set.push(handler);
      // console.debug(set, map);
      // console.trace();
      return this;
    };
    Events.prototype.once = function (key, handler) {
      return this.on(key, handler, onceHandlers);
    };
    Events.prototype.off = function (key, handler) {
      let _this = this;
      [handlers, onceHandlers].forEach(function (handlerType) {
        let map, set, index;
        !handlerType.has(_this)
          ? handlerType.set(_this, map = new Map)
          : map = handlerType.get(_this);
        !map.has(key)
          ? map.set(key, set = [])
          : set = map.get(key);
        index = set.indexOf(handler);
        if (index > -1) {
          set.splice(index, 1);
        }
      });
      return this;
    };
    Events.prototype.emit = function (key) {
      let _this = this;
      let _a, _b;
      let args = [];
      for (let _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
      }
      let onceSet = ((_a = onceHandlers.get(this)) === null || _a === void 0 ? void 0 : _a.get(key));
      let restSet = ((_b = handlers.get(this)) === null || _b === void 0 ? void 0 : _b.get(key));
      // store callbacks in a set to avoid duplicate handlers
      let callbacks = __spreadArray(
        __spreadArray(
          [],
          (onceSet && onceSet.splice(0, onceSet.length) || [])
        ),
        restSet ? restSet : []
      );
      callbacks.forEach(function (el) {
        return el.apply(_this, args);
      });
      return this;
    };
    return Events;
  }());

  // @ts-ignore
  Unit.prototype.on = Events.prototype.on;
  // @ts-ignore
  Unit.prototype.off = Events.prototype.off;
  // @ts-ignore
  Unit.prototype.once = Events.prototype.once;
  // @ts-ignore
  Unit.prototype.emit = Events.prototype.emit;

  exports.Events = Events;
});
