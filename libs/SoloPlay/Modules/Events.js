var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Events = void 0;
    var handlers = new WeakMap();
    var onceHandlers = new WeakMap();
    var Events = /** @class */ (function () {
        function Events() {
        }
        // Generic type S to give to EventHandler<S> to typehint this function gets the same this as where the event is registered
        Events.prototype.on = function (key, handler, handlerType) {
            if (handlerType === void 0) { handlerType = handlers; }
            var map, set;
            !handlerType.has(this) ? handlerType.set(this, map = new Map) : map = handlerType.get(this);
            !map.has(key) ? map.set(key, set = []) : set = map.get(key);
            // Add this handler, since it has to be unique we dont need to check if it exists
            set.push(handler);
            return this;
        };
        Events.prototype.once = function (key, handler) {
            return this.on(key, handler, onceHandlers);
        };
        Events.prototype.off = function (key, handler) {
            var _this = this;
            [handlers, onceHandlers].forEach(function (handlerType) {
                var map, set, index;
                !handlerType.has(_this) ? handlerType.set(_this, map = new Map) : map = handlerType.get(_this);
                !map.has(key) ? map.set(key, set = []) : set = map.get(key);
                index = set.indexOf(handler);
                if (index > -1)
                    set.splice(index, 1);
            });
            return this;
        };
        Events.prototype.emit = function (key) {
            var _this = this;
            var _a, _b;
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var onceSet = ((_a = onceHandlers.get(this)) === null || _a === void 0 ? void 0 : _a.get(key));
            var restSet = ((_b = handlers.get(this)) === null || _b === void 0 ? void 0 : _b.get(key));
            // store callbacks in a set to avoid duplicate handlers
            var callbacks = __spreadArray(__spreadArray([], (onceSet && onceSet.splice(0, onceSet.length) || [])), restSet ? restSet : []);
            callbacks.forEach(function (el) { return el.apply(_this, args); });
            return this;
        };
        return Events;
    }());
    exports.Events = Events;
});
