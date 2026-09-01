/**
*  @filename    MiscOverrides.js
*  @author      theBGuy
*  @desc        miscellaneous functions, socketing/imbuing
*
*/

includeIfNotIncluded("core/Misc.js");

Misc.openChestsEnabled = true;
Misc.screenshotErrors = true;

/**
 * @override
 * @template T
 * @param {number} area 
 * @param {number[]} chestIds 
 * @param {function(T, T): number} [sort] 
 * @returns {boolean}
 */
Misc.openChestsInArea = function (area, chestIds = [], sort = undefined) {
  !area && (area = me.area);
  area !== me.area && Pather.journeyTo(area);
  !chestIds.length && (chestIds = sdk.objects.chestIds.slice(0));
    
  const presetUnits = Game.getPresetObjects(area)
    .filter(function (preset) {
      return chestIds.includes(preset.id);
    });
  if (!presetUnits.length) return false;

  let coords = presetUnits
    .map(function (preset) {
      return preset.realCoords();
    });

  while (coords.length) {
    coords.sort(typeof sort === "function" ? sort : Sort.units);
    Pather.moveToUnit(coords[0], 1, 2);
    this.openChests(20);

    for (let i = 0; i < coords.length; i += 1) {
      if (getDistance(coords[i].x, coords[i].y, coords[0].x, coords[0].y) < 20) {
        coords.shift();
      }
    }
  }

  return true;
};

/**
 * @description Open a chest Unit (takes chestID or unit)
 * @param {Unit | number} unit 
 * @returns {boolean} If we opened the chest
 */
Misc.openChest = function (unit) {
  typeof unit === "number" && (unit = Game.getObject(unit));
    
  // Skip invalid/open and Countess chests
  if (!unit || unit.x === 12526 || unit.x === 12565 || unit.mode) return false;
  // locked chest, no keys
  if (!me.assassin && unit.islocked
    && !me.findItem(sdk.items.Key, sdk.items.mode.inStorage, sdk.storage.Inventory)) {
    return false;
  }

  let specialChest = sdk.quest.chests.includes(unit.classid);

  const openedChest = function () {
    return !unit || unit.mode;
  };

  for (let i = 0; i < 7; i++) {
    // don't use tk if we are right next to it
    let useTK = (unit.distance > 5 && Skill.useTK(unit) && i < 3);
    let useDodge = Pather.useTeleport() && Skill.useTK(unit);
    if (useTK) {
      unit.distance > 18 && Attack.getIntoPosition(unit, 18, sdk.collision.WallOrRanged, false, true);
      if (!Packet.telekinesis(unit)) {
        console.debug("Failed to tk: attempt: " + i);
        continue;
      }
    } else {
      if (useDodge && me.inDanger()) {
        if (Attack.getIntoPosition(unit, 18, sdk.collision.WallOrRanged, false, true)) continue;
      }
      [(unit.x + 1), (unit.y + 2)].distance > 5 && Pather.moveTo(unit.x + 1, unit.y + 2, 3);
      (specialChest || i > 2) ? Misc.click(0, 0, unit) : Packet.entityInteract(unit);
    }

    if (Misc.poll(openedChest, 1000, 50)) {
      return true;
    }
    Packet.flash(me.gid);
  }

  // Click to stop walking in case we got stuck
  !me.idle && Misc.click(0, 0, me.x, me.y);

  return false;
};

/**
 * @param {number} range 
 * @returns {boolean}
 * @todo Take path parameter to we can open the chests in an order that brings us closer to our destination
 */
Misc.openChests = function (range = 15) {
  if (!Misc.openChestsEnabled) return false;
  const containers = [
    "chest", "loose rock", "hidden stash", "loose boulder", "corpseonstick", "casket", "armorstand", "weaponrack",
    "holeanim", "roguecorpse", "corpse", "tomb2", "tomb3", "chest3",
    "skeleton", "guardcorpse", "sarcophagus", "object2", "cocoon", "hollow log", "hungskeleton",
    "bonechest", "woodchestl", "woodchestr",
    "burialchestr", "burialchestl", "chestl", "chestr", "groundtomb", "tomb3l", "tomb1l",
    "deadperson", "deadperson2", "groundtombl", "casket"
  ];

  if (Config.OpenChests.Types.some((el) => el.toLowerCase() === "all")) {
    containers.push(
      "barrel", "ratnest", "goo pile", "largeurn", "urn", "jug", "basket", "stash",
      "pillar", "skullpile", "skull pile", "jar3", "jar2", "jar1", "barrel wilderness",
      "explodingchest", "icecavejar1", "icecavejar2", "icecavejar3",
      "icecavejar4", "evilurn"
    );
  }

  me.baal && containers.push("evilurn");

  let unitList = getUnits(sdk.unittype.Object)
    .filter(function (c) {
      return c.name
        && c.mode === sdk.objects.mode.Inactive
        && c.distance <= range
        && containers.includes(c.name.toLowerCase());
    });

  while (unitList.length > 0) {
    unitList.sort(Sort.units);
    let unit = unitList.shift();

    if (unit && Pather.currentWalkingPath.length) {
      /**
       * @todo - check if the chest is in our path of if in the future we would be closer to it
       * and if so assign a hook to be triggered at our point nearest to it so we can open it
       * and save time
       */
      if (unit.distance > 5 && PathDebug.coordsInPath(Pather.currentWalkingPath, unit.x, unit.y)) {
        console.log("Skipping chest for now as it is in our path for later");
        continue;
      }
      // check mob count at chest - think I need a new prototype for faster checking
      // allow specifying an amount and return true/false, rather than building the whole list then deciding what amount is too much
      // possibly also specify a danger modifier - 3 champions around a chest is much more dangerous than 3 fallens
      // also think we need to take into account mob count arround us, we shouldn't open chests when we are surrounded and in the process of clearing
      // that needs a handler as well though, if we aren't clearing and are just pathing (tele char) opening a chest and moving on is fine
    }

    /**
     * @todo
     * - evaluate actual walking distance to chest, as if it's far out of the way it maybe be better to skip it
     * especially early on when we are trying to get to the next area
     */

    if (unit
      && (Pather.useTeleport() || !checkCollision(me, unit, sdk.collision.BlockWalk))
      && this.openChest(unit)) {
      Pickit.pickItems();
    }
  }

  return true;
};

/**
 * Use a shrine Unit
 * @param {ObjectUnit} unit 
 * @returns {boolean} 
 */
Misc.getShrine = function (unit) {
  if (unit.mode === sdk.objects.mode.Active) return false;
  AreaData.get(me.area).addShrine(unit);
  if (Misc.lastShrine.remaining() > Time.seconds(30) && Misc.lastShrine.isMyCurrentState()) {
    // skip for now, don't waste the shrine we have active
    return false;
  }

  const usedShrine = function () {
    return unit.mode;
  };

  for (let i = 0; i < 3; i++) {
    if (Skill.useTK(unit) && i < 2) {
      unit.distance > 21 && Pather.moveNearUnit(unit, 20);
      if (!Packet.telekinesis(unit)) {
        Attack.getIntoPosition(unit, 20, sdk.collision.WallOrRanged);
      }
    } else {
      if (getDistance(me, unit) < 4 || Pather.moveToUnit(unit, 3, 0)) {
        Misc.click(0, 0, unit);
      }
    }

    if (Misc.poll(usedShrine, 1000, 40)) {
      AreaData.get(me.area).updateShrine(unit);
      Misc.lastShrine.update(unit);
      if (unit.objtype === sdk.shrines.Gem) {
        Pickit.pickItems();
      }
      return true;
    }
  }

  return false;
};

/**
 * Check all shrines in area and get the first one of specified type
 * @param {number} area 
 * @param {number} type 
 * @param {boolean} use 
 * @returns {boolean} Sucesfully found shrine(s)
 * @todo If we are trying to find a specific shrine then generate path and perform callback after each node to see if we are within range
 * of getUnit and can see the shrine type so we know whether to continue moving to it or not.
 */
Misc.getShrinesInArea = function (area, type, use) {
  if (!area || !AreaData.has(area)) return false;
  let shrineLocs = [];
  let result = false;
  let units = Game.getPresetObjects(area)
    .filter(function (preset) {
      return sdk.shrines.Presets.includes(preset.id);
    });

  if (units.length) {
    for (let shrine of units) {
      shrineLocs.push(shrine.realCoords());
    }
  } else if (AreaData.get(area).getShrines().length) {
    shrineLocs = AreaData.get(area)
      .getShrines()
      .filter(function (shrine) {
        return shrine.useable();
      });
  } else {
    return false;
  }

  try {
    NodeAction.shrinesToIgnore.push(type);
    
    while (shrineLocs.length > 0) {
      shrineLocs.sort(Sort.units);
      let coords = shrineLocs.shift();

      /** @returns {boolean} True once the shrine object has reached the target coordinates. */
      Pather.move(coords, { minDist: Skill.haveTK ? 20 : 5, callback: function () {
        let shrine = Game.getObject("shrine");
        return !!shrine && shrine.x === coords.x && shrine.y === coords.y;
      } });

      let shrine = Game.getObject("shrine");

      if (shrine) {
        do {
          if (shrine.objtype === type && shrine.mode === sdk.objects.mode.Inactive) {
            (!Skill.haveTK || !use) && Pather.moveTo(shrine.x - 2, shrine.y - 2);

            if (!use || this.getShrine(shrine)) {
              result = true;

              if (type === sdk.shrines.Gem) {
                Pickit.pickItems(5);
              }
              return true;
            }

            if (use && type >= sdk.shrines.Armor
              && type <= sdk.shrines.Experience
              && me.getState(type + 122)) {
              return true;
            }
          }
        } while (shrine.getNext());
      }
    }
  } finally {
    NodeAction.shrinesToIgnore.remove(type);
  }

  return result;
};

/**
 * Travels to each candidate area looking for the experience shrine buff, stopping once obtained.
 * @param {number[]} [shrineLocs=[]]
 * @returns {boolean}
 */
Misc.getExpShrine = function (shrineLocs = []) {
  if (me.getState(sdk.states.ShrineExperience)) return true;

  for (let area of shrineLocs) {
    me.overhead("Looking for xp shrine");

    if (area === sdk.areas.BloodMoor) {
      Pather.journeyTo(area);
    } else {
      Pather.checkWP(area, true)
        ? Pather.useWaypoint(area)
        : Pather.getWP(area);
    }

    Precast.doPrecast(true);
    Misc.getShrinesInArea(area, sdk.shrines.Experience, true);

    if (me.getState(sdk.states.ShrineExperience)) {
      return true;
    }

    !me.inTown && Town.goToTown();
  }

  // this needs work but idea is we can leverage the shrine data gathered during regular script actions
  // to find the closest xp shrine to us and go to it without having to search a bunch of different areas
  // let _xpShrineAreas = AreaData.getAreasWithShrine(sdk.shrines.Experience);
  // if (_xpShrineAreas.length) {
  //   for (let area of _xpShrineAreas) {
  //     me.overhead("Looking for xp shrine");
  //     Pather.journeyTo(area.Index);
  //     let _shrine = area.Shrines.find(function (shrine) {
  //       return shrine.Type === sdk.shrines.Experience;
  //     });
  //     Pather.move(_shrine, { minDist: Skill.haveTK ? 20 : 5, callback: function () {
  //       let shrine = Game.getObject(-1, sdk.objects.mode.Inactive, _shrine.gid);
  //       return !!shrine && shrine.x === _shrine.x && shrine.y === _shrine.y;
  //     } });
  //     if (Misc.getShrine(Game.getObject(-1, sdk.objects.mode.Inactive, _shrine.gid))) {
  //       return true;
  //     }
  //   }
  // }
  return true;
};

/**
 * Recursively copies changed primitive/array values from `newObj` into `oldObj` in place, skipping functions.
 * @param {Record<string, unknown>} oldObj
 * @param {Record<string, unknown>} newObj
 * @param {string[]} [path]
 * @returns {void}
 */
Misc.updateRecursively = function (oldObj, newObj, path) {
  if (path === void 0) { path = []; }
  Object.keys(newObj).forEach(function (key) {
    if (typeof newObj[key] === "function") return; // skip
    if (typeof newObj[key] !== "object") {
      if (!oldObj.hasOwnProperty(key) || oldObj[key] !== newObj[key]) {
        oldObj[key] = newObj[key];
      }
    } else if (Array.isArray(newObj[key]) && !newObj[key].some(k => typeof k === "object")) {
      // copy array (shallow copy)
      if (oldObj[key] === undefined || !oldObj[key].equals(newObj[key])) {
        oldObj[key] = newObj[key].slice(0);
      }
    } else {
      if (typeof oldObj[key] !== "object") {
        oldObj[key] = {};
      }
      path.push(key);
      Misc.updateRecursively(oldObj[key], newObj[key], path);
    }
  });
};

/**
 * Recursively diffs `n` against `o`, returning only the keys/values that changed.
 * @param {Record<string, unknown>} o
 * @param {Record<string, unknown>} n
 * @param {Record<string, unknown>} [changed]
 * @returns {Record<string, unknown>}
 */
Misc.recursiveSearch = function (o, n, changed) {
  if (changed === void 0) { changed = {}; }
  Object.keys(n).forEach(function (key) {
    if (typeof n[key] === "function") return; // skip
    if (typeof n[key] !== "object") {
      if (!o.hasOwnProperty(key) || o[key] !== n[key]) {
        changed[key] = n[key];
      }
    } else {
      if (typeof changed[key] !== "object" || !changed[key]) {
        changed[key] = {};
      }
      Misc.recursiveSearch(
        (o === null || o === void 0 ? void 0 : o[key]) || {},
        (n === null || n === void 0 ? void 0 : n[key]) || {},
        changed[key]
      );
      if (!Object.keys(changed[key]).length) {
        delete changed[key];
      }
    }
  });
  return changed;
};
