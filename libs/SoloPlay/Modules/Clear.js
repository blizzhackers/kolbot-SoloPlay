var __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    const v = factory(require, exports);
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define(["require", "exports", "../../modules/sdk", "./Events", "./Coords", "./MissileData"], factory);
  }
})(function (require, exports) {
  "use strict";
  if (!isIncluded("libs/SoloPlay/Functions/PatherOverrides.js")) { include("libs/SoloPlay/Functions/PatherOverrides.js"); }
  include("SoloPlay/Functions/ClassAttackOverrides/" + sdk.player.class.nameOf(me.classid) + "Attacks.js");
  global["__________ignoreMonster"] = [];
  const sdk_1 = __importDefault(require("../../modules/sdk"));
  const Events_1 = require("./Events");
  const Coords_1 = require("./Coords");
  const MissileData_1 = __importDefault(require("./GameData/MissileData"));
  const defaults = {
    range: 14,
    spectype: 0,
    once: false,
    nodes: [],
    callback: undefined,
    filter: undefined //(monster: Monster, node: {x, y}[]) => true
  };
  const shamans = [
    sdk_1.default.monsters.FallenShaman, sdk_1.default.monsters.CarverShaman2, sdk_1.default.monsters.DevilkinShaman2, sdk_1.default.monsters.DarkShaman1,
    sdk_1.default.monsters.WarpedShaman, sdk_1.default.monsters.CarverShaman, sdk_1.default.monsters.DevilkinShaman, sdk_1.default.monsters.DarkShaman2
  ];
  const fallens = [
    sdk_1.default.monsters.Fallen, sdk_1.default.monsters.Carver2, sdk_1.default.monsters.Devilkin2, sdk_1.default.monsters.DarkOne1,
    sdk_1.default.monsters.WarpedFallen, sdk_1.default.monsters.Carver1, sdk_1.default.monsters.Devilkin, sdk_1.default.monsters.DarkOne2
  ];
  const clearDistance = function (x, y, xx, yy) {
    getUnits(sdk.unittype.Monster).forEach(function (monster) {
      if (typeof monster["beendead"] === "undefined")
        monster.beendead = false;
      monster.beendead = monster.beendead || monster.dead;
    });
    let path = getPath(me.area, x, y, xx, yy, 0, 4);
    if (!path || !path.length) return Infinity;

    return path.reduce(function (acc, v, i, arr) {
      let prev = i ? arr[i - 1] : v;
      return acc + Math.sqrt((prev.x - v.x) * (prev.x - v.x) + (prev.y - v.y) * (prev.y - v.y));
    }, 0);
  };
  var exporting = (function (_settings) {
    if (_settings === void 0) { _settings = {}; }
    let settings = Object.assign({}, defaults, _settings);
    // The bigger
    let smallStepRange = settings.range / 3 * 2;
    // Get an array with arrays going away from you (what we gonna walk after clearing, within range)
    let nearestNode = settings.nodes[settings.nodes.index];

    const backTrack = function (units, missiles) {
      if (settings.nodes.index < 2) return false;
      //ToDo; backtrack further if that is a safer bet
      let nodesBack = Math.min(settings.nodes.index, 5);
      me.overhead("backtracking " + nodesBack + " nodes");
      settings.nodes.index -= nodesBack;
      nearestNode = settings.nodes[settings.nodes.index];
      // stationary missiles that deal damages
      let enhancedMissiles = missiles.map(function (m) { return ({ missile: m, data: MissileData_1.default[m.classid] }); });
      let missilesOnFloor = enhancedMissiles
        .filter(function (m) { return !!m.data; })
        .filter(function (m) { return m.data.velocity === 0 && (m.data.minDamage > 0 || m.data.eMin > 0) && m.missile.hits(nearestNode); });
      while (missilesOnFloor.length > 0 && settings.nodes.index > 0) {
        console.log("missilesOnFloor");
        console.log(missilesOnFloor);
        nodesBack += 1;
        settings.nodes.index -= 1;
        nearestNode = settings.nodes[settings.nodes.index];
        missilesOnFloor = enhancedMissiles.filter(function (m) { return !!m.data; })
          .filter(function (m) { return m.data.velocity === 0 && (m.data.minDamage > 0 || m.data.eMin > 0) && m.missile.hits(nearestNode); });
      }

      let old = Pather.forceRun;
      Pather.forceRun = true;
      try {
        let x = nearestNode.x, y = nearestNode.y;
        // If the path between me and the node we wanna run back to is blocked dont do it
        if (CollMap.checkColl(me, {x: x, y: y}, Coords_1.Collision.BLOCK_MISSILE, 3)) {
          me.overhead("Before backtracking, clear near me");
          let unit = units.first();
          unit && ClassAttack.doAttack(unit);
          settings.nodes.index += nodesBack;
          return true;
        }

        me.overhead("backtracking " + nodesBack + " nodes");
        if (Pather.getWalkDistance(x, y) > getDistance(me, nearestNode) * 1.5) {
          if (Pather.canTeleport() && getDistance(me, nearestNode) < 35) {
            Pather.teleportTo(x, y);
          } else {
            Pather.moveToOverride(x, y);
          }
        } else {
          Pather.walkTo(x, y);
        }
        start = [x, y];
      } finally {
        Pather.forceRun = old;
      }
      return true;
    };

    let start = [], startArea = me.area, cachedNodes = undefined;
    const getUnits_filtered = function () {
      let monsters = getUnits(1, -1)
        .filter(function (m) { return m.area === me.area && m.attackable && !global["__________ignoreMonster"].includes(m.gid); })
        .filter(function (unit) { return ( // Shamaans have a higher range
          (function (range) {
            return start.length // If start has a length
              ? getDistance(start[0], start[1], unit) < range // If it has a range smaller as from the start point (when using me.clear)
              : unit.distance < range;
          } // if "me" move, the object doesnt move. So, check distance of object
          )(shamans.includes(unit.classid) ? settings.range * 1.6 : settings.range)
                // clear monsters on the path
                || (( /* cache the nodes*/cachedNodes = cachedNodes || settings.nodes
                  .slice(settings.nodes.index, settings.nodes.index + 5)
                  .filter(function (el) { return el.distance < 30; }))
                  .some(function (node) { return getDistance(unit, node.x, node.y) < smallStepRange; })))
                && !CollMap.checkColl(me, unit, Coords_1.Collision.BLOCK_MISSILE, 5); })
        .filter(function (unit) {
          if (!settings.spectype || typeof settings.spectype !== "number")
            return true; // No spectype =  all monsters
          // noinspection JSBitwiseOperatorUsage
          return unit.spectype & settings.spectype;
        });
      if (settings.filter) {
        monsters = monsters.filter(settings.filter);
      }
      // too much monsters, quick sort
      if (monsters.length > 7) {
        return monsters.sort(function (a, b) { return a.distance - b.distance; });
      }
      return monsters.sort(function (a, b) {
        // shamans are a mess early game
        var isShamanA = shamans.includes(a.classid);
        var isFallenB = fallens.includes(b.classid);
        if (isShamanA && isFallenB && !checkCollision(me, a, 0x7) /*line of sight*/) {
          // return shaman first, if we have a direct line of sight
          return -1;
        }
        if (typeof a["beendead"] !== "undefined" && typeof b["beendead"] === "undefined" && a["beendead"] && !b["beendead"]) {
          return 1; // those that been dead before (aka fallens) will be moved up from the list, so we are more likely to pwn shamans on a safe moment
        }
        return clearDistance(me.x, me.y, a.x, a.y) - (clearDistance(me.x, me.y, b.x, b.y));
      });
    };
    // If we clear around _me_ we move around, but just clear around where we started
    var units;
    if (me === this) {
      start = [me.x, me.y];
    }

    var backtracked = false;
    while ((units = getUnits_filtered()).length) {
      exporting.emit("sorting", units);
      // sorting algorithm can also take out monsters
      if (!units.length) {
        break;
      }
      // near monsters we can handle kinda depends on our health.
      var maxNearMonsters = Math.floor((4 * (1 / me.hpmax * me.hp)) + 1);
      if (!backtracked) {
        var nearUnits = units.filter(function (unit) { return unit.attackable && unit.distance < 10; });
        var nearMissiles = getUnits(sdk_1.default.unittype.Missile)
          .filter(function (unit) { var _a, _b, _c; return unit.distance < 10 && ((_a = unit.getParent()) === null || _a === void 0 ? void 0 : _a.gid) !== me.gid && ((_b = unit.getParent()) === null || _b === void 0 ? void 0 : _b.gid) !== ((_c = me.getMerc()) === null || _c === void 0 ? void 0 : _c.gid); })
          .filter(function (m) { return MissileData_1.default[m.classid] && (MissileData_1.default[m.classid].velocity > 0 || m.hits(me)) && (MissileData_1.default[m.classid].minDamage > 0 || MissileData_1.default[m.classid].eMin > 0); });
        me.overhead("backtrack counter (" + (nearUnits.length + nearMissiles.length) + "/" + maxNearMonsters + ")");
        if ((nearUnits.length + nearMissiles.length) >= maxNearMonsters && ((me.mp / me.mpmax) > 0.2 || me.getItemsEx().filter(function (i) { return (i.isInBelt || i.isInInventory) && i.itemType === sdk_1.default.itemtype.manapotion; }).length > 0)) {
          me.overhead("Want to backtrack");
          if (backTrack(units, nearMissiles)) {
            backtracked = true;
            continue; // we maybe wanna attack someone else now
          }
        }
      }
      backtracked = false;
      var unit = units.shift();
      if (settings.callback && settings.callback()) {
        return;
      }
      // Do something with the effort to not kill monsters that are too harsh
      var result = ClassAttack.doAttack(unit);
      if (typeof unit.casts === "undefined") {
        unit.casts = 0;
      }
      // cant attack this monsters, skip it
      if (result === 2 || unit.casts++ > 30) {
        console.log("Skip this monster");
        global["__________ignoreMonster"].push(unit.gid);
      }
      if (settings.once || startArea !== me.area) return true;
      Pickit.pickItems(3, true);
    }

    return true;
  }).bind(me);
  Object.keys(Events_1.Events.prototype).forEach(function (key) { return exporting[key] = Events_1.Events.prototype[key]; });
  return exporting;
});
