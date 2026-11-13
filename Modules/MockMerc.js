/**
*  @filename    MockMerc.js
*  @desc        Savable snapshot of the mercenary, so his gear can still be scored while he is dead or out of reach
*
*/

(function (module, require) {
  const MockItem = require("./MockItem");

  // what merc scoring reads from his equipped items (Item.getMercEquipped, betterBaseThanWearing)
  const ITEM_STATS = [sdk.stats.Strength, sdk.stats.Dexterity, sdk.stats.Defense, sdk.stats.ArmorPercent];

  /** @type {{ json: string, classid: number, merc: MockMercUnit } | null} */
  let cache = null;

  /**
   * @param {MercUnit} merc
   * @returns {MockMercData}
   */
  const snapshot = function (merc) {
    return {
      classid: merc.classid,
      level: merc.getStat(sdk.stats.Level),
      strength: merc.getStat(sdk.stats.Strength),
      dexterity: merc.getStat(sdk.stats.Dexterity),
      items: merc.getItemsEx()
        .filter(function (item) {
          return item.isEquipped;
        })
        .map(function (item) {
          return {
            classid: item.classid,
            itemType: item.itemType,
            quality: item.quality,
            bodylocation: item.bodylocation,
            prefixnum: item.prefixnum,
            runeword: item.runeword,
            ethereal: item.ethereal,
            sockets: item.sockets,
            name: item.name,
            fname: item.fname,
            tier: NTIP.GetMercTier(item),
            stats: ITEM_STATS
              .map(function (stat) {
                return [stat, 0, item.getStatEx(stat)];
              })
              .filter(function (stat) {
                return stat[2] !== 0;
              }),
          };
        }),
    };
  };

  /**
   * @param {MockMercData} data
   * @returns {MockMercUnit}
   */
  const build = function (data) {
    const items = data.items.map(function (item) {
      const mock = new MockItem({
        type: sdk.unittype.Item,
        mode: sdk.items.mode.Equipped,
        location: sdk.storage.Equipped,
        isEquipped: true,
        identified: true,
        classid: item.classid,
        itemType: item.itemType,
        quality: item.quality,
        bodylocation: item.bodylocation,
        prefixnum: item.prefixnum,
        runeword: item.runeword,
        ethereal: item.ethereal,
        sockets: item.sockets,
        name: item.name,
        fname: item.fname,
        mercTier: item.tier,
        overrides: { stats: item.stats, skills: [], flags: 0, items: [], states: {} },
      });
      // the stored values are what getStatEx returned on the real item, read them back as they are
      mock.getStat = mock.getStatEx = function (major, minor) {
        return mock.internalGetStat(major, minor);
      };
      return mock;
    });

    return {
      isMock: true,
      classid: data.classid,
      charlvl: data.level,
      /** @param {number} stat */
      getStat: function (stat) {
        switch (stat) {
        case sdk.stats.Level:
          return data.level;
        case sdk.stats.Strength:
          return data.strength;
        case sdk.stats.Dexterity:
          return data.dexterity;
        default:
          return 0;
        }
      },
      getItemsEx: function () {
        return items.slice();
      },
    };
  };

  const MockMerc = {
    /**
     * Store what scoring needs from the live merc in the character data, written to disk when it changed.
     * @param {MercUnit} merc - the live merc
     * @returns {boolean}
     */
    update: function (merc) {
      if (!merc) return false;
      // stored as a JSON string: me.update() hands me.data to the other threads through Misc.updateRecursively,
      // which turns arrays of objects into plain objects and can't take null
      const json = JSON.stringify(snapshot(merc));
      if (json === me.data.merc.snapshot) return true;
      me.data.merc.snapshot = json;
      CharData.updateData("me", me.data) && me.update();
      return true;
    },

    /**
     * The merc as he was last seen, for scoring only: nothing that acts on the merc may be handed this.
     * @returns {MockMercUnit | null} null without a snapshot of the merc we have now
     */
    get: function () {
      const json = me.data.merc.snapshot;
      if (!json) return null;
      if (!cache || cache.json !== json) {
        try {
          /** @type {MockMercData} */
          const data = JSON.parse(json);
          cache = { json: json, classid: data.classid, merc: build(data) };
        } catch (e) {
          console.error(e);
          return null;
        }
      }
      return cache.classid === me.data.merc.classid ? cache.merc : null;
    },

    /**
     * Merc tier of an item the merc wears, live or mocked; a mock keeps the tier its item had when it was stored.
     * @param {ItemUnit | MockItem} item
     * @returns {number}
     */
    tierOf: function (item) {
      return item instanceof MockItem ? item.mercTier : NTIP.GetMercTier(item);
    },
  };

  module.exports = MockMerc;
}).call(null, module, require);
