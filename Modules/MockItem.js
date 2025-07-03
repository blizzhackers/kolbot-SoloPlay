/**
 * @description An savable/transferable item you can test with as if it where real
 * @author Jaenster
 *
 */


(function (module, require) {

  var defaultSettings = {
    base: 0, // Can be an item it extends
    type: 4,
    classid: 0,
    mode: 0,
    name: 0,
    act: 0,
    gid: 0,
    x: 0,
    y: 0,
    targetx: 0,
    targety: 0,
    area: 0,
    hp: 0,
    hpmax: 0,
    mp: 0,
    mpmax: 0,
    stamina: 0,
    staminamax: 0,
    charlvl: 0,
    itemcount: 0,
    owner: 0,
    ownertype: 0,
    spectype: 0,
    direction: 0,
    uniqueid: 0,
    code: 0,
    prefix: 0,
    suffix: 0,
    prefixes: 0,
    suffixes: 0,
    prefixnum: 0,
    suffixnum: 0,
    prefixnums: 0,
    suffixnums: 0,
    fname: 0,
    quality: 0,
    node: 0,
    location: 0,
    sizex: 0,
    sizey: 0,
    itemType: 0,
    description: 0,
    bodylocation: 0,
    ilvl: 0,
    lvlreq: 0,
    gfx: 0,
    runwalk: 0,
    weaponswitch: 0,
    objtype: 0,
    islocked: 0,
    getColor: 0,
    socketedWith: [],

    overrides: {stats: {}},
  };

  /**
   * @static fromItem
   * @static fromGear
   *
   * @param settings
   * @constructor
   */
  function MockItem(settings = {}) {
    if (typeof settings !== 'object' && settings) { settings = {}; }
    this.overrides = { stats: [], skills: [], flags: 0, items: [], states: {} };
    this.settingKeys = [];
    this.settingKeys = Object.keys(settings);
    Object.assign(this, settings);

    Object.keys(Unit.prototype).forEach(k => {
      typeof Unit.prototype === 'function' && (this[k] = (...args) => {
        Unit.prototype.apply(this, args);
      });
    });

    this.internalGetStat = function (major, minor) {
      var _a;
      var stat = ((_a = this.overrides.stats) !== null && _a !== void 0 ? _a : []).find(function (_a) {
        var main = _a[0], sub = _a[1];
        return main === major && sub === (minor | 0);
      });
      return (stat === null || stat === void 0 ? void 0 : stat[2]) || 0;
    };

    this.getStat = function (major, minor, extra) {
      var selfValue = this.internalGetStat(major, minor);
      var inventory = (this.getItems() || undefined);
      // Level requirement is the max of all items (so including sockets)
      let original = typeof this.base === 'object' && this.base.hasOwnProperty('getStat') && this.base.getStat.apply(this.base, [major, minor]) || 0;
      if (major === sdk.stats.Levelreq) {
        return Math.max.apply(Math, __spreadArray([selfValue], inventory.map(function (el) { return el.getStat(sdk.stats.Levelreq); })));
      }
      var socketedStats = inventory.reduce(function (a, c) { return a + c.getStat.call(c, major, minor, extra); }, 0);
      return original + selfValue + socketedStats;
    };

    this.getItems = function () {
      return this.overrides.items || [];
    };

    this.toJSON = function () {
      var _this = this;
      var obj = {};
      this.settingKeys.forEach(function (key) {
        obj[key] = _this[key];
      });
      return JSON.stringify(obj);
    };
    this.getState = function (id) {
      var _a;
      return ((_a = this.overrides.states) === null || _a === void 0 ? void 0 : _a[id]) || 0;
    };
    this.getFlag = function (flags) {
      var _a;
      return !!(((_a = this.overrides.flags) !== null && _a !== void 0 ? _a : 0) & (flags | 0));
    };

    this.getItemsEx = function () {
      return this.socketedWith;
    };

    // make it work with pickit lines
    this.getStatEx = function (major, minor) {
      return Unit.prototype.getStatEx.apply(this, [major, minor]);
    };

    this.store = () => JSON.stringify(Object.keys(settings).reduce((a, key) => a[key] = this[key], {}));

    Object.keys(Unit.prototype)
      .filter(key => typeof this[key] === 'undefined')
      .forEach(key => this[key] = (...args) => Unit.prototype[key].apply(this, args));
  }

  MockItem.getAllItemStats = function (item) {
    var stats = [];
    if (!item.getFlag(sdk.items.flags.Runeword)) {
      // since getStat(-1) is a perfect copy from item.getStat(major, minor), loop over it and get the real value
      // example, item.getStat(7, 0) != item.getStat(-1).find(([major])=> major === 7)[2]
      // its shifted with 8 bytes
      return (item.getStat(-1) || [])
        .map(function (_a) {
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

  MockItem.fromItem = function (item, settings) {
    if (settings === void 0) { settings = {}; }
    console.log(JSON.stringify(settings));
    Object.keys(item).forEach(key => settings[key] = item[key]);
    console.log(JSON.stringify(settings));
    settings.socketedWith = item.getItemsEx().map(item => MockItem.fromItem(item)) || []; // Mock its sockets too
    var initializer = Object.keys(item)
      .filter(function (key) { return typeof item[key] !== 'function'; })
      .reduce(function (acc, key) {
        acc[key] = item[key];
        return acc;
      }, {});
    var stats = MockItem.getAllItemStats(item);
    initializer.overrides = {
      stats: stats.reduce(function (accumulator, _a) {
        var major = _a[0], minor = _a[1], value = _a[2];
        var socketable = item.getItemsEx().map(item => item.getStat(major, minor)).reduce((a, c) => a + c, 0) || 0;
        var realValue = value;
        if (major !== sdk.stats.Levelreq) {
          realValue = value - socketable;
        }
        if (realValue > 0) { // Only if this stat isn't given by a socketable
          accumulator.push([major, minor, value]);
        }
        return accumulator;
      }, []),
      flags: item.getFlag(),
    };
    initializer.overrides.items = item.getItemsEx().map(function (item) { return MockItem.fromItem(item); });
    return new MockItem(initializer);
  };

  MockItem.fromGear = function () {
    return me.getItemsEx()
      .filter(item => item.location === sdk.storage.Equipped
        || (item.location === sdk.storage.Inventory && [603, 604, 605].indexOf(item.classid) > -1))
      .map(x => MockItem.fromItem(x));
  };

  module.exports = MockItem;

}).call(null, module, require);
