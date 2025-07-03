/* eslint-disable no-var */
var __extends = (this && this.__extends) || (function () {
  var extendStatics = function (d, b) {
    extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
  };
  return function (d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
  for (var i = 0, il = from.length, j = to.length; i < il; i++, j++) {
    to[j] = from[i];
  }
  return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    var v = factory(require, exports);
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define(["require", "exports", "./utilities", "../../modules/sdk"], factory);
  }
})(function (require, exports) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.MockMonster = exports.MockPlayer = exports.MockItem = exports.Mockable = void 0;
  /**
     * @description An savable/transferable item you can test with as if it where real
     * @author Jaenster
     *
     */
  var utilities_1 = require("./utilities");
  var sdk_1 = __importDefault(require("../../modules/sdk"));
  var Mockable = /** @class */ (function () {
    function Mockable(settings) {
      if (settings === void 0) { settings = {}; }
      this.overrides = { stats: [], skills: [], flags: 0, items: [], states: {} };
      this.settingKeys = [];
      this.settingKeys = Object.keys(settings);
      Object.assign(this, settings);
    }
    Mockable.prototype.internalGetStat = function (major, minor) {
      var _a;
      var stat = ((_a = this.overrides.stats) !== null && _a !== void 0 ? _a : []).find(function (_a) {
        var main = _a[0], sub = _a[1];
        return main === major && sub === (minor | 0);
      });
      return (stat === null || stat === void 0 ? void 0 : stat[2]) || 0;
    };
    Mockable.prototype.getStat = function (major, minor, extra) {
      var selfValue = this.internalGetStat(major, minor);
      var inventory = (this.getItems() || undefined);
      // Level requirement is the max of all items (so including sockets)
      if (major === sdk.stats.Levelreq) {
        return Math.max.apply(Math, __spreadArray([selfValue], inventory.map(function (el) { return el.getStat(sdk.stats.Levelreq); })));
      }
      var socketedStats = inventory.reduce(function (a, c) { return a + c.getStat.call(c, major, minor, extra); }, 0);
      return selfValue + socketedStats;
    };
    Mockable.prototype.getItems = function () {
      return this.overrides.items || [];
    };
    Mockable.prototype.toJSON = function () {
      var _this = this;
      var obj = {};
      this.settingKeys.forEach(function (key) {
        obj[key] = _this[key];
      });
      return JSON.stringify(obj);
    };
    Mockable.prototype.getState = function (id) {
      var _a;
      return ((_a = this.overrides.states) === null || _a === void 0 ? void 0 : _a[id]) || 0;
    };
    Mockable.prototype.getFlag = function (flags) {
      var _a;
      return !!(((_a = this.overrides.flags) !== null && _a !== void 0 ? _a : 0) & (flags | 0));
    };
    return Mockable;
  }());
  exports.Mockable = Mockable;
  // Put entire prototype of Unit in Mockable
  utilities_1.mixinFunctions(Mockable, Unit);
  var MockItem = /** @class */ (function (_super) {
    __extends(MockItem, _super);
    function MockItem() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    MockItem.getAllItemStats = function (item) {
      var stats = [];
      if (!item.getFlag(sdk.items.flags.Runeword)) {
        // since getStat(-1) is a perfect copy from item.getStat(major, minor), loop over it and get the real value
        // example, item.getStat(7, 0) != item.getStat(-1).find(([major])=> major === 7)[2]
        // its shifted with 8 bytes
        return (item.getStat(-1) || [])
          .map(function (_a) {
            // eslint-disable-next-line no-unused-vars
            var major = _a[0], minor = _a[1], value = _a[2];
            return [major, minor, item.getStat(major, minor)];
          });
      }
      for (var x = 0; x < 358; x++) {
        var zero = item.getStatEx(x, 0);
        zero && stats.push([x, 0, zero]);
        for (var y = 1; y < 281; y++) {
          var second = item.getStatEx(x, y);
          second && second !== zero && stats.push([x, y, second]);
        }
      }
      return stats;
    };
    MockItem.settingsGenerator = function (item, settings) {
      if (settings === void 0) { settings = {}; }
      // Add to settings
      var initializer = Object.keys(item)
        .filter(function (key) { return typeof item[key] !== "function"; })
        .reduce(function (acc, key) {
          acc[key] = item[key];
          return acc;
        }, {});
      var stats = MockItem.getAllItemStats(item);
      initializer.overrides = {
        stats: stats.reduce(function (accumulator, _a) {
          var major = _a[0], minor = _a[1], value = _a[2];
          var socketable = item.getItemsEx().map(function (item) { return item.getStat(major, minor); }).reduce(function (a, c) { return a + c; }, 0) || 0;
          var realValue = value;
          if (major !== sdk.stats.Levelreq) {
            realValue = value - socketable;
          }
          if (realValue > 0) { // Only if this stat isn't given by a socketable
            accumulator.push([major, minor, value]);
          }
          return accumulator;
        }, []),
        flags: item.getFlags(),
      };
      return initializer;
    };
    MockItem.fromItem = function (item, settings) {
      if (settings === void 0) { settings = {}; }
      var initializer = this.settingsGenerator(item, settings);
      initializer.overrides.items = item.getItemsEx().map(function (item) { return MockItem.fromItem(item); });
      return new MockItem(initializer);
    };
    MockItem.fromPlayer = function (from) {
      if (from === void 0) { from = me; }
      return from.getItemsEx()
        .filter(function (item) {
          return item.location === sdk_1.default.storage.Equipment
                || (item.location === sdk_1.default.storage.Inventory && [603, 604, 605].indexOf(item.classid) > -1);
        })
        .map(function (x) { return MockItem.fromItem(x); });
    };
    return MockItem;
  }(Mockable));
  exports.MockItem = MockItem;
  var MockPlayer = /** @class */ (function (_super) {
    __extends(MockPlayer, _super);
    function MockPlayer() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(MockPlayer.prototype, "maxhp", {
      get: function () {
        return this.getStat(sdk_1.default.stats.Maxhp) * (1 + (this.getStat(sdk_1.default.stats.MaxhpPercent) / 100));
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(MockPlayer.prototype, "maxmp", {
      get: function () {
        return this.getStat(sdk_1.default.stats.Maxhp) * (1 + (this.getStat(sdk_1.default.stats.MaxmanaPercent) / 100));
      },
      enumerable: false,
      configurable: true
    });
    return MockPlayer;
  }(Mockable));
  exports.MockPlayer = MockPlayer;
  var MockMonster = /** @class */ (function (_super) {
    __extends(MockMonster, _super);
    function MockMonster() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    return MockMonster;
  }(Mockable));
  exports.MockMonster = MockMonster;
});
