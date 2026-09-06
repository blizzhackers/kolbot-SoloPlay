/**
 * @description Data about pots
 * @author ryancrunchi, theBGuy
 * @type UMD module
 */

(function (root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    const v = factory();
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define([], factory);
  } else {
    root.PotData = factory();
  }
}(this, function () {
  "use strict";
  const PotData = (function () {
    /**
     * @typedef {Object} Pot
     * @property {string} type
     * @property {number[]} effect
     * @property {number} cost
     * @property {number} duration
     * @property {Array<number | Function>} [recipe]
     */

    /** @type {Object.<number, Pot>} */
    const _pots = {};

    _pots[sdk.items.MinorHealingPotion] = {
      type: "hp",
      effect: [45, 30, 30, 45, 60, 30, 45],
      cost: 30,
      duration: 7.68
    };
    _pots[sdk.items.LightHealingPotion] = {
      type: "hp",
      effect: [90, 60, 60, 90, 120, 60, 90],
      cost: 67,
      duration: 6.4
    };
    _pots[sdk.items.HealingPotion] = {
      type: "hp",
      effect: [150, 100, 100, 150, 200, 100, 150],
      cost: 112,
      duration: 6.84
    };
    _pots[sdk.items.GreaterHealingPotion] = {
      type: "hp",
      effect: [270, 180, 180, 270, 360, 180, 270],
      cost: 225,
      duration: 7.68
    };
    _pots[sdk.items.SuperHealingPotion] = {
      type: "hp",
      effect: [480, 320, 320, 480, 640, 320, 480],
      cost: undefined,
      duration: 10.24
    };
    _pots[sdk.items.MinorManaPotion] = {
      type: "mp",
      effect: [30, 40, 40, 30, 20, 40, 30],
      cost: 60,
      duration: 5.12
    };
    _pots[sdk.items.LightManaPotion] = {
      type: "mp",
      effect: [60, 80, 80, 60, 40, 80, 60],
      cost: 135,
      duration: 5.12
    };
    _pots[sdk.items.ManaPotion] = {
      type: "mp",
      effect: [120, 160, 160, 120, 80, 160, 120],
      cost: 270,
      duration: 5.12
    };
    _pots[sdk.items.GreaterManaPotion] = {
      type: "mp",
      effect: [225, 300, 300, 225, 150, 300, 225],
      cost: 450,
      duration: 5.12
    };
    _pots[sdk.items.SuperManaPotion] = {
      type: "mp",
      effect: [375, 500, 500, 375, 250, 500, 375],
      cost: undefined,
      duration: 5.12
    };
    _pots[sdk.items.RejuvenationPotion] = {
      type: "rv",
      effect: [35, 35, 35, 35, 35, 35, 35],
      cost: undefined,
      duration: 0.04,
      recipe: [
        [
          sdk.items.HealingPotion, sdk.items.HealingPotion, sdk.items.HealingPotion,
          sdk.items.ManaPotion, sdk.items.ManaPotion, sdk.items.ManaPotion,
          function (item) {
            return item.itemType === sdk.items.type.ChippedGem;
          }
        ]
      ]
    };
    _pots[sdk.items.FullRejuvenationPotion] = {
      type: "rv",
      effect: [100, 100, 100, 100, 100, 100, 100],
      cost: undefined,
      duration: 0.04,
      recipe: [
        // Recipe is either an classid, or an function that returns true on the correct item
        [
          sdk.items.RejuvenationPotion, sdk.items.RejuvenationPotion, sdk.items.RejuvenationPotion // 3 normal rv's
        ],
        [
          sdk.items.HealingPotion, sdk.items.HealingPotion, sdk.items.HealingPotion,
          sdk.items.ManaPotion, sdk.items.ManaPotion, sdk.items.ManaPotion,
          function (item) {
            return item.itemType === sdk.items.type.Gem;
          }
        ],
      ]
    };

    /** @type {Pot[]} */
    const _mpPots = [
      _pots[sdk.items.MinorManaPotion], _pots[sdk.items.LightManaPotion], _pots[sdk.items.ManaPotion],
      _pots[sdk.items.GreaterManaPotion], _pots[sdk.items.SuperManaPotion]
    ];
    /** @type {Pot[]} */
    const _hpPots = [
      _pots[sdk.items.MinorHealingPotion], _pots[sdk.items.LightHealingPotion], _pots[sdk.items.HealingPotion],
      _pots[sdk.items.GreaterHealingPotion], _pots[sdk.items.SuperHealingPotion]
    ];

    Object.keys(_pots)
      .forEach(key => Object.freeze(_pots[key]));
    Object.freeze(_mpPots);
    Object.freeze(_hpPots);

    return {
      pots: _pots,
      
      getMpPots: function () {
        return _mpPots;
      },
      getHpPots: function () {
        return _hpPots;
      },
    };
  })();

  return PotData;
}));
