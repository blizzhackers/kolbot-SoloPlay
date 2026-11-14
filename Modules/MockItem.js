/**
 * @description An savable/transferable item you can test with as if it where real
 * @author Jaenster
 *
 */

(function (module) {
  const defaultSettings = {
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

    overrides: { stats: {} },
  };

  /**
   * @static fromItem
   * @static fromGear
   *
   * @param settings
   * @constructor
   */
  function MockItem(settings = {}) {
    if (typeof settings !== "object" && settings) { settings = {}; }
    this.overrides = { stats: [], skills: [], flags: 0, items: [], states: {} };
    this.settingKeys = [];
    this.settingKeys = Object.keys(settings);
    Object.assign(this, settings);

    Object.keys(Unit.prototype).forEach(k => {
      typeof Unit.prototype === "function" && (this[k] = (...args) => {
        Unit.prototype.apply(this, args);
      });
    });

    /**
     * @param {number} major - Primary stat ID (see sdk.stats).
     * @param {number} minor - Sub-stat index.
     * @returns {number} The matching override stat value, or 0 if none is set.
     */
    this.internalGetStat = function (major, minor) {
      let _a;
      let stat = ((_a = this.overrides.stats) !== null && _a !== void 0 ? _a : []).find(function (_a) {
        let main = _a[0], sub = _a[1];
        return main === major && sub === (minor | 0);
      });
      return (stat === null || stat === void 0 ? void 0 : stat[2]) || 0;
    };

    /**
     * @param {number} major - Primary stat ID (see sdk.stats).
     * @param {number} minor - Sub-stat index.
     * @param {number} [extra] - Unused; kept for parity with `Unit.getStat`'s signature.
     * @returns {number} Combined stat value from the base item, this mock's overrides, and its sockets.
     */
    this.getStat = function (major, minor, extra) {
      let selfValue = this.internalGetStat(major, minor);
      let inventory = (this.getItems() || undefined);
      // Level requirement is the max of all items (so including sockets)
      let original = typeof this.base === "object" && this.base.hasOwnProperty("getStat") && this.base.getStat.apply(this.base, [major, minor]) || 0;
      if (major === sdk.stats.Levelreq) {
        return Math.max.apply(Math, __spreadArray([selfValue], inventory.map(function (el) {
          return el.getStat(sdk.stats.Levelreq);
        })));
      }
      let socketedStats = inventory.reduce(function (a, c) {
        return a + c.getStat.call(c, major, minor, extra);
      }, 0);
      return original + selfValue + socketedStats;
    };

    /** @returns {MockItem[]} The items overridden onto this mock item, or an empty array. */
    this.getItems = function () {
      return this.overrides.items || [];
    };

    /** @returns {string} JSON string of only the keys originally passed into the constructor. */
    this.toJSON = function () {
      let _this = this;
      let obj = {};
      this.settingKeys.forEach(function (key) {
        obj[key] = _this[key];
      });
      return JSON.stringify(obj);
    };
    /**
     * @param {number} id - State ID to look up.
     * @returns {number} The overridden state value, or 0 if unset.
     */
    this.getState = function (id) {
      let _a;
      return ((_a = this.overrides.states) === null || _a === void 0 ? void 0 : _a[id]) || 0;
    };
    /**
     * @param {number} flags - Flag bitmask to test.
     * @returns {boolean} True if the override flags include the given bitmask.
     */
    this.getFlag = function (flags) {
      let _a;
      return !!(((_a = this.overrides.flags) !== null && _a !== void 0 ? _a : 0) & (flags | 0));
    };

    /** @returns {MockItem[]} The items socketed into this mock item. */
    this.getItemsEx = function () {
      return this.socketedWith;
    };

    // make it work with pickit lines
    /**
     * @param {number} major - Primary stat ID (see sdk.stats).
     * @param {number} minor - Sub-stat index.
     * @returns {number} Delegates to `Unit.prototype.getStatEx` so this mock works with pickit lines.
     */
    this.getStatEx = function (major, minor) {
      return Unit.prototype.getStatEx.apply(this, [major, minor]);
    };

    /** @returns {string} JSON string of this mock's constructor settings, re-read from current values. */
    this.store = () => JSON.stringify(Object.keys(settings).reduce((a, key) => a[key] = this[key], {}));

    Object.keys(Unit.prototype)
      .filter(key => typeof this[key] === "undefined")
      .forEach(key => this[key] = (...args) => Unit.prototype[key].apply(this, args));
  }

  /**
   * @param {ItemUnit} item - Real item to snapshot stats from.
   * @returns {Array<[number, number, number]>} Flat list of [major, minor, value] stat triples.
   */
  MockItem.getAllItemStats = function (item) {
    let stats = [];
    if (!item.getFlag(sdk.items.flags.Runeword)) {
      // since getStat(-1) is a perfect copy from item.getStat(major, minor), loop over it and get the real value
      // example, item.getStat(7, 0) != item.getStat(-1).find(([major])=> major === 7)[2]
      // its shifted with 8 bytes
      return (item.getStat(-1) || [])
        .map(function (_a) {
          let major = _a[0], minor = _a[1], value = _a[2];
          return [major, minor, item.getStat(major, minor)];
        });
    }
    for (let x = 0; x < 358; x++) {
      let zero = item.getStatEx(x, 0);
      zero && stats.push([x, 0, zero]);
      for (let y = 1; y < 281; y++) {
        let second = item.getStatEx(x, y);
        second && second !== zero && stats.push([x, y, second]);
      }
    }
    return stats;
  };

  /**
   * @param {ItemUnit} item - Real item to clone into a mock.
   * @param {object} [settings] - Extra properties merged onto the clone; mutated in place.
   * @returns {MockItem} A new mock item reproducing `item`'s properties, stats, flags, and sockets.
   */
  MockItem.fromItem = function (item, settings) {
    if (settings === void 0) { settings = {}; }
    console.log(JSON.stringify(settings));
    Object.keys(item).forEach(key => settings[key] = item[key]);
    console.log(JSON.stringify(settings));
    settings.socketedWith = item.getItemsEx().map(item => MockItem.fromItem(item)) || []; // Mock its sockets too
    let initializer = Object.keys(item)
      .filter(function (key) { return typeof item[key] !== "function"; })
      .reduce(function (acc, key) {
        acc[key] = item[key];
        return acc;
      }, {});
    let stats = MockItem.getAllItemStats(item);
    initializer.overrides = {
      stats: stats.reduce(function (accumulator, _a) {
        let major = _a[0], minor = _a[1], value = _a[2];
        let socketable = item.getItemsEx().map(item => item.getStat(major, minor)).reduce((a, c) => a + c, 0) || 0;
        let realValue = value;
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

  // the native properties MockItem.snapshot keeps, Unit.prototype derives the rest from these, the stats and the flags
  const SNAPSHOT_PROPS = [
    "type", "classid", "mode", "location", "bodylocation", "itemType", "quality", "ilvl", "lvlreq", "code",
    "name", "fname", "description", "prefix", "suffix", "prefixes", "suffixes",
    "prefixnum", "suffixnum", "prefixnums", "suffixnums",
  ];

  /**
   * getStat(-2) is a sparse array (of sparse arrays or skill objects), JSON would fill its holes with nulls
   * @param {any} value
   * @returns {any}
   */
  const packSparse = function (value) {
    if (!Array.isArray(value)) return value;
    return {
      l: value.length,
      e: Object.keys(value).map(function (key) {
        return [Number(key), packSparse(value[key])];
      }),
    };
  };

  /**
   * @param {any} value
   * @returns {any}
   */
  const unpackSparse = function (value) {
    if (!value || typeof value !== "object" || !Array.isArray(value.e)) return value;
    const arr = [];
    value.e.forEach(function (entry) {
      arr[entry[0]] = unpackSparse(entry[1]);
    });
    arr.length = value.l;
    return arr;
  };

  // the highest stat id, AllRes is a stand-in getStatEx computes rather than a stat
  const MAX_STAT = Math.max.apply(Math, Object.keys(sdk.stats).map(function (key) {
    return typeof sdk.stats[key] === "number" && key !== "AllRes" ? sdk.stats[key] : 0;
  }));

  /** @param {Function} fn */
  const isNative = function (fn) {
    return /\[native code\]/.test(Function.prototype.toString.call(fn));
  };

  /**
   * Everything about a real item that can be read off it without the game: its native properties, flags, its
   * getStat(-1) and getStat(-2) tables, and getStat(stat, subid) for every stat without a subid and every stat/subid
   * pair the tables or its socketed items list. Also its socketed items, the same way.
   * The values are kept as getStat returned them, so getStat on the mock returns exactly what it returned on the item.
   * @param {ItemUnit} item
   * @returns {MockItemSnapshot}
   */
  MockItem.snapshot = function (item) {
    /** @type {MockItemSnapshot} */
    const record = { props: {}, flags: item.getFlags(), stats: [] };
    SNAPSHOT_PROPS.forEach(function (key) {
      record.props[key] = item[key];
    });

    const all = item.getStat(-1);
    const detailed = item.getStat(-2);
    record.all = all;
    record.detailed = packSparse(detailed);

    /** @type {Map<string, [number, number]>} */
    const keys = new Map();
    const addKey = function (stat, subid) {
      keys.set(stat + ":" + subid, [stat, subid]);
    };
    Array.isArray(all) && all.forEach(function (stat) {
      addKey(stat[0], stat[1]);
    });
    Array.isArray(detailed) && Object.keys(detailed).forEach(function (key) {
      const stat = Number(key);
      const entry = detailed[stat];
      // a skill stat (subid > 0x200) is a { skill, level } object or an array of them, keyed by skill << 6 | level
      if (!Array.isArray(entry)) {
        entry && typeof entry === "object" && addKey(stat, (entry.skill << 6) | entry.level);
        return;
      }
      Object.keys(entry).forEach(function (subKey) {
        const value = entry[subKey];
        value && typeof value === "object"
          ? addKey(stat, (value.skill << 6) | value.level)
          : addKey(stat, Number(subKey));
      });
    });
    // neither table lists what the socketed items add (getStat on the item includes it), so take their pairs too
    const socketed = item.getItemsEx();
    socketed.length && (record.socketed = socketed.map(MockItem.snapshot));
    (record.socketed || []).forEach(function (socket) {
      socket.stats.forEach(function (stat) {
        addKey(stat[0], stat[1]);
      });
    });
    // and every stat without a subid, which also covers computed ones such as the level requirement
    for (let stat = 0; stat <= MAX_STAT; stat++) {
      addKey(stat, 0);
    }

    keys.forEach(function (key) {
      const value = item.getStat(key[0], key[1]);
      value && record.stats.push([key[0], key[1], value]);
    });

    return record;
  };

  /**
   * A mock that answers what the snapshotted item would: getStat and getFlag from the stored values, and every JS
   * getter and method on Unit.prototype (getStatEx, strreq, sockets, runeword, getColor...) runs over them as it does
   * on the item.
   * @param {MockItemSnapshot} record - from MockItem.snapshot
   * @returns {MockItem}
   */
  MockItem.fromSnapshot = function (record) {
    const socketed = (record.socketed || []).map(MockItem.fromSnapshot);
    const mock = new MockItem(Object.assign({}, record.props, {
      socketedWith: socketed,
      overrides: { stats: record.stats || [], skills: [], flags: record.flags | 0, items: socketed, states: {} },
    }));

    // the stored values already include the sockets, unlike MockItem's own getStat
    mock.getStat = function (major, minor) {
      if (major === -1) {
        return Array.isArray(record.all)
          ? record.all.map(function (stat) {
            return stat.slice();
          })
          : record.all;
      }
      if (major === -2) return unpackSparse(record.detailed);
      // the level requirement ignores the subid
      return mock.internalGetStat(major, major === sdk.stats.LevelReq ? 0 : minor);
    };
    mock.getFlags = function () {
      return record.flags;
    };

    Object.getOwnPropertyNames(Unit.prototype).forEach(function (key) {
      if (Object.prototype.hasOwnProperty.call(mock, key)) return;
      const desc = Object.getOwnPropertyDescriptor(Unit.prototype, key);
      if (!desc || typeof desc.get !== "function" || isNative(desc.get)) return;
      Object.defineProperty(mock, key, { get: desc.get, configurable: true });
    });

    return mock;
  };

  /** @returns {MockItem[]} Mock items for every equipped item and inventory charm on the character. */
  MockItem.fromGear = function () {
    return me.getItemsEx()
      .filter(item => item.location === sdk.storage.Equipped
        || (item.location === sdk.storage.Inventory && [603, 604, 605].indexOf(item.classid) > -1))
      .map(x => MockItem.fromItem(x));
  };

  module.exports = MockItem;
}).call(null, module, require);
