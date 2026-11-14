/**
*  @filename    MockMerc.js
*  @desc        Savable snapshot of the mercenary, so his gear can still be scored while he is dead or out of reach
*
*/

(function (module, require) {
  const MockItem = require("./MockItem");

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
        .map(MockItem.snapshot),
    };
  };

  /**
   * @param {MockMercData} data
   * @returns {MockMercUnit}
   */
  const build = function (data) {
    const items = data.items.map(MockItem.fromSnapshot);

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
     * Store the live merc in the character data, written to disk when it changed.
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
     * His items are scored as they are now (tiers come from the current pickit lines), only their stats are stored.
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
  };

  module.exports = MockMerc;
}).call(null, module, require);
