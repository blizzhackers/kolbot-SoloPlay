/**
*  @filename    Polyfills.js
*  @author      theBGuy
*  @credit      Jaenster
*  @desc        additions for improved Kolbot-SoloPlay functionality and code readability
*
*/

if (!Array.prototype.at) {
  Array.prototype.at = function (pos) {
    if (pos < 0) {
      pos += this.length;
    }
    if (pos < 0 || pos >= this.length) return undefined;
    return this[pos];
  };
}

/**
 * @description Polyfill for setTimeout, as the version of d2bs isnt thread safe
 * @author Jaenster
 */

(function (global, _original) {
  let __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
  }) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
  }));
  let __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  }) : function (o, v) {
    o.default = v;
  });
  let __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    let result = {};
    if (mod != null) for (let k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
  let Worker = __importStar(require("../../modules/Worker"));
  global._setTimeout = _original;
  /**
  * @param {function} cb
  * @param {number} time
  * @param args
  * @constructor
  */
  function Timer (cb, time, args) {
    let _this = this;
    if (time === void 0) { time = 0; }
    if (args === void 0) { args = []; }
    Timer.instances.push(this);
    Worker.runInBackground["__setTimeout__" + (Timer.counter++)] = (function (startTick) {
      return function () {
        let finished = getTickCount() - startTick >= time;
        if (finished) {
          let index = Timer.instances.indexOf(_this);
          // only if not removed from the time list
          if (index > -1) {
            Timer.instances.splice(index, 1);
            cb.apply(undefined, args);
          }
        }
        return !finished;
      };
    })(getTickCount());
  }
  Timer.instances = [];
  Timer.counter = 0;
  global.setTimeout = function (cb, time) {
    if (time === void 0) { time = 0; }
    let args = [];
    for (let _i = 2; _i < arguments.length; _i++) {
      args[_i - 2] = arguments[_i];
    }
    if (typeof cb === "string") {
      console.debug("Warning: Do not use raw code @ setTimeout and does not support lexical scoping");
      cb = [].filter.constructor(cb);
    }
    if (typeof cb !== "function") {
      throw new TypeError("setTimeout callback needs to be a function");
    }
    return new Timer(cb, time, args);
  };
  /**
  *
  * @param {Timer} timer
  */
  global.clearTimeout = function (timer) {
    let index = Timer.instances.indexOf(timer);
    if (index > -1) {
      Timer.instances.splice(index, 1);
    }
  };
  // getScript(true).name.toString() !== 'default.dbj' && setTimeout(function () {/* test code*/}, 1000)
})([].filter.constructor("return this")(), setTimeout);

if (!Object.setPrototypeOf) {
  // Only works in Chrome and FireFox, does not work in IE:
  Object.defineProperty(Object.prototype, "setPrototypeOf", {
    value: function (obj, proto) {
      // @ts-ignore
      if (obj.__proto__) {
        // @ts-ignore
        obj.__proto__ = proto;
        return obj;
      } else {
        // If you want to return prototype of Object.create(null):
        let Fn = function () {
          for (let key in obj) {
            Object.defineProperty(this, key, {
              value: obj[key],
            });
          }
        };
        Fn.prototype = proto;
        return new Fn();
      }
    },
    enumerable: false,
  });
}

if (!Object.values) {
  Object.values = function (source) {
    return Object.keys(source).map(function (k) { return source[k]; });
  };
}

if (!Object.entries) {
  Object.entries = function (source) {
    return Object.keys(source).map(function (k) { return [k, source[k]]; });
  };
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is#polyfill
// @ts-ignore
if (!Object.is) {
  Object.defineProperty(Object, "is", {
    value: function (x, y) {
      // SameValue algorithm
      if (x === y) {
        // return true if x and y are not 0, OR
        // if x and y are both 0 of the same sign.
        // This checks for cases 1 and 2 above.
        return x !== 0 || 1 / x === 1 / y;
      } else {
        // return true if both x AND y evaluate to NaN.
        // The only possibility for a variable to not be strictly equal to itself
        // is when that variable evaluates to NaN (example: Number.NaN, 0/0, NaN).
        // This checks for case 3.
        // eslint-disable-next-line no-self-compare
        return x !== x && y !== y;
      }
    }
  });
}

// if (!Object.fromEntries) {
//   Object.defineProperty(Object, 'fromEntries', {
//     value: function (entries) {
//       if (!entries /*|| !entries[Symbol.iterator]*/) { throw new Error('Object.fromEntries() requires a single iterable argument'); }

//       const o = {};

//       Object.keys(entries).forEach((key) => {
//         const [k, v] = entries[key];

//         o[k] = v;
//       });

//       return o;
//     },
//   });
// }

// // filter an object
// Object.filter = function (obj, predicate) {
// 	return Object.fromEntries(Object.entries(obj).filter(predicate));
// };

// https://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript
if (!Array.prototype.equals) {
  // Warn if overriding existing method
  !!Array.prototype.equals && console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
  // attach the .equals method to Array's prototype to call it on any array
  Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array) return false;

    // compare lengths - can save a lot of time
    if (this.length !== array.length) return false;

    // call basic sort method, (my addition as I don't care if its the same order just if it contains the same values)
    this.sort();
    array.sort();

    for (let i = 0, l = this.length; i < l; i++) {
      // Check if we have nested arrays
      if (this[i] instanceof Array && array[i] instanceof Array) {
        // recurse into the nested arrays
        if (!this[i].equals(array[i])) return false;
      } else if (this[i] !== array[i]) {
        // Warning - two different object instances will never be equal: {x:20} != {x:20}
        return false;
      }
    }
    return true;
  };
  // Hide method from for-in loops
  Object.defineProperty(Array.prototype, "equals", { enumerable: false });
}
