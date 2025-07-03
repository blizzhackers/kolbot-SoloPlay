/* eslint-disable dot-notation */
(function (factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    var v = factory(require, exports);
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define(["require", "exports", "../../modules/sdk"], factory);
  }
})(function (require, exports) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.getSpotsFor = exports.findCastingSpotRange = exports.findCastingSpotSkill = exports.isBlockedBetween = exports.getCollisionBetweenCoords = exports.convertToCoordArray = exports.getCoordsBetween = exports.Collision = exports.BlockBits = void 0;
  const sdk_1 = require("../../modules/sdk");
  var BlockBits;
  (function (BlockBits) {
    BlockBits[BlockBits["BlockWall"] = 1] = "BlockWall";
    // Simply put, if the monster should be drawn
    BlockBits[BlockBits["LineOfSight"] = 2] = "LineOfSight";
    // Its a bit weird but it seems if this is set if you go out of range to hit a monster
    BlockBits[BlockBits["Ranged"] = 4] = "Ranged";
    // This naming comes from d2bs, but not sure if its accurate
    BlockBits[BlockBits["PlayerToWalk"] = 8] = "PlayerToWalk";
    // This is some light setting, not usefull. Its mostly around doors and waypoints. NOTE: Also set in dungeon areas when monster is in another room
    BlockBits[BlockBits["DarkArea"] = 16] = "DarkArea";
    // Is it a cast blocker? Like a stone or whatever. Not 100% accurate
    BlockBits[BlockBits["Casting"] = 32] = "Casting";
    // Tell me if you see it!
    BlockBits[BlockBits["Unknown_NeverSeen"] = 64] = "Unknown_NeverSeen";
    // These are always set if you check collision between you and a monster
    BlockBits[BlockBits["Players"] = 128] = "Players";
    BlockBits[BlockBits["Monsters"] = 256] = "Monsters";
    BlockBits[BlockBits["Items"] = 512] = "Items";
    BlockBits[BlockBits["Objects"] = 1024] = "Objects";
    // Between me / spot is a door that is closed
    BlockBits[BlockBits["ClosedDoor"] = 2048] = "ClosedDoor";
    // This one is odd, its nearly always set. But not for monsters that fly over lava for example
    // Blizzard / meteor and prob other skills are only castable on spots with this set
    BlockBits[BlockBits["IsOnFloor"] = 4096] = "IsOnFloor";
    // Flavie, merc.
    BlockBits[BlockBits["FriendlyNPC"] = 8192] = "FriendlyNPC";
    BlockBits[BlockBits["Unknown_3"] = 16384] = "Unknown_3";
    BlockBits[BlockBits["DeadBodies"] = 32768] = "DeadBodies";
  })(BlockBits = exports.BlockBits || (exports.BlockBits = {}));
  var Collision;
  (function (Collision) {
    // Collisions that cause a missile to burst
    Collision[Collision["BLOCK_MISSILE"] = 2062] = "BLOCK_MISSILE";
  })(Collision = exports.Collision || (exports.Collision = {}));
  function getCoordsBetween(x1, y1, x2, y2) {
    const abs = Math.abs, min = Math.min, max = Math.max, floor = Math.floor;
    const A = { x: x1, y: y1 };
    const B = { x: x2, y: y2 };
    if (max(x1, x2) - min(x1, x2) < max(y1, y2) - min(y1, y2)) {
      // noinspection JSSuspiciousNameCombination
      return getCoordsBetween(y1, x1, y2, x2).map(function (_a) {
        let x = _a.x, y = _a.y;
        return ({ x: y, y: x });
      });
    }
    function slope(a, b) {
      if (a.x === b.x) return null;
      return (b.y - a.y) / (b.x - a.x);
    }
    function intercept(point, slope) {
      // vertical line
      if (slope === null) return point.x;
      return point.y - slope * point.x;
    }
    const m = slope(A, B);
    const b = intercept(A, m);
    const coordinates = [];
    for (let x = min(A.x, B.x); x <= max(A.x, B.x); x++) {
      let y = m * x + b;
      coordinates.push({ x: x, y: y });
    }
    return coordinates.map(function (_a) {
      let x = _a.x, y = _a.y;
      return ({ x: floor(x), y: floor(y) });
    })
      .filter(function (el, idx, self) { return self.findIndex(function (other) { return other.x === el.x && other.y === el.y; }) === idx; });
  }
  exports.getCoordsBetween = getCoordsBetween;
  const convertToCoordArray = function (args, caller, length) {
    if (length === void 0) { length = 2; }
    var coords = [];
    for (var i = 0; i < args.length; i++) {
      if (typeof args[i] === "number" && i < args.length - 1) {
        coords.push({ x: args[i], y: args[++i] });
      } else {
        coords.push(args[i]);
      }
    }
    if (coords.length !== length) throw TypeError("Didnt give proper arguments to " + caller);
    return coords;
  };
  exports.convertToCoordArray = convertToCoordArray;
  function getCollisionBetweenCoords() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    var _a = exports.convertToCoordArray(args, "getCollisionBetweenCoords", 2), one = _a[0], two = _a[1];
    if (getDistance(one, two) > 50) {
      return -1;
    }
    try {
      return getCoordsBetween(one.x, one.y, two.x, two.y)
        .reduce(function (acc, cur) {
          return (acc | 0)
                    // | (getCollision(me.area, cur.x+1, cur.y-1) | 0)
                    // | (getCollision(me.area, cur.x+1, cur.y) | 0)
                    // | (getCollision(me.area, cur.x+1, cur.y+1) | 0)
                    // | (getCollision(me.area, cur.x, cur.y-1) | 0)
                    | (getCollision(me.area, cur.x, cur.y) | 0);
        }, 0);
    } catch (e) {
      return -1; // Area not loaded
    }
  }
  exports.getCollisionBetweenCoords = getCollisionBetweenCoords;
  function isBlockedBetween() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    var collision = getCollisionBetweenCoords.apply(null, args);
    return !!(collision & (0
            | BlockBits.LineOfSight
            | BlockBits.Ranged
            | BlockBits.Casting
            | BlockBits.ClosedDoor
            | BlockBits.DarkArea
            | BlockBits.Objects));
  }
  exports.isBlockedBetween = isBlockedBetween;
  function checkCollisionBetween(unit1, unit2, coll) {
    let args = [];
    args.push(unit1, unit2);
    let collision = getCollisionBetweenCoords.apply(null, args);
    return !!(collision & (0 | coll));
  }
  exports.checkCollisionBetween = checkCollisionBetween;
  Room.prototype.isInRoom = function () {
    let args = [];
    for (let _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    let _a = exports.convertToCoordArray(args, "isInRoom", 1)[0], x = _a[0], y = _a[1];
    return this && x >= this.x * 5 && x < this.x * 5 + this.xsize && y >= this.y * 5 && y < this.y * 5 + this.ysize;
  };
  function findCastingSpotSkill(skill, unit, minRange, thickness, collision) {
    if (minRange === void 0) { minRange = 5; }
    if (thickness === void 0) { thickness = 5; }
    if (collision === void 0) { collision = Collision.BLOCK_MISSILE; }
    let range = Skill.getRange(skill);
    console.log("Searching range for", skill, Object.keys(sdk_1.skills).find(function (el) { return sdk_1.skills[el] === skill; }), range);
    return findCastingSpotRange(range, unit, minRange, thickness, collision);
  }
  exports.findCastingSpotSkill = findCastingSpotSkill;
  function findCastingSpotRange(range, unit, minRange, thickness, collision) {
    if (minRange === void 0) { minRange = 5; }
    if (thickness === void 0) { thickness = 5; }
    if (collision === void 0) { collision = Collision.BLOCK_MISSILE; }
    let spots = getSpotsFor(collision, thickness, unit)
      .sort(function (a, b) {
        if (CollMap.checkColl(a, me, BlockBits.BlockWall, 7)) return 1;
        return getDistance(me, a) - getDistance(me, b);
      });
    return spots.find(function (a) {
      var dist = getDistance(unit.x, unit.y, a.x, a.y);
      return dist < range && dist > minRange;
    });
  }
  exports.findCastingSpotRange = findCastingSpotRange;
  var lines = [];
  function getSpotsFor(collision, thickness, unit) {
    var spots = [];
    var fieldSize = 75;
    for (var oX = -fieldSize; oX < fieldSize; oX++) {
      for (var oY = -fieldSize; oY < fieldSize; oY++) {
        var _a = [unit.x + oX, unit.y + oY], x = _a[0], y = _a[1];
        if (getDistance(unit.x, unit.y, x, y) > 40) continue;
        var isCol = !!(getCollision(unit.area, x, y) & collision);
        for (var i = -2; i < 2 && !isCol; i++) {
          for (var j = -2; j < 2 && !isCol; j++) {
            isCol = isCol && !!(getCollision(unit.area, x + i, y + j) & collision);
          }
        }
        // if it isnt a collision to start with
        if (!isCol) {
          spots.push({ x: x, y: y });
        }
      }
    }
    spots = spots.filter(function (el) { return !CollMap.checkColl(el, unit, collision, thickness); });
    //lines.splice(0, lines.length);
    /*spots.map(function (_a) {
            var x = _a.x, y = _a.y;
            return lines.push(new Line(x + 1, y + 1, x, y, 0x70, true));
        });*/
    return spots;
  }
  exports.getSpotsFor = getSpotsFor;
});
