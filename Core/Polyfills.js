/**
*  @filename    Polyfills.js
*  @author      theBGuy
*  @credit      Jaenster
*  @desc        additions for improved Kolbot-SoloPlay functionality and code readability
*
*/

if (!Array.prototype.at) {
  /**
   * @param {number} pos Index; negative values count from the end of the array.
   * @returns {*} The element at pos, or undefined if out of range.
   */
  Array.prototype.at = function (pos) {
    if (pos < 0) {
      pos += this.length;
    }
    if (pos < 0 || pos >= this.length) return undefined;
    return this[pos];
  };
}

if (!Object.setPrototypeOf) {
  // Only works in Chrome and FireFox, does not work in IE:
  Object.defineProperty(Object.prototype, "setPrototypeOf", {
    /**
     * @param {Object} obj
     * @param {Object} proto
     * @returns {Object}
     */
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
  /**
   * @param {Object} source
   * @returns {Array<*>}
   */
  Object.values = function (source) {
    return Object.keys(source).map(function (k) { return source[k]; });
  };
}

if (!Object.entries) {
  /**
   * @param {Object} source
   * @returns {Array<[string, *]>}
   */
  Object.entries = function (source) {
    return Object.keys(source).map(function (k) { return [k, source[k]]; });
  };
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is#polyfill
// @ts-ignore
if (!Object.is) {
  Object.defineProperty(Object, "is", {
    /**
     * @param {*} x
     * @param {*} y
     * @returns {boolean}
     */
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

// https://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript
if (!Array.prototype.equals) {
  // Warn if overriding existing method
  !!Array.prototype.equals && console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
  // attach the .equals method to Array's prototype to call it on any array
  /**
   * Order-insensitive equality check; mutates both `this` and `array` by sorting them in place.
   * @param {Array<*>} array
   * @returns {boolean}
   */
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
