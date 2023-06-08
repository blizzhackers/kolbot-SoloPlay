/**
*  @filename    PatherOverrides.js
*  @author      theBGuy
*  @credit      autosmurf (handling monster doors based on the rescue barbs script)
*  @desc        Pathing related functions
*
*/

includeIfNotIncluded("core/Pather.js");

Developer.debugging.pathing && (PathDebug.enableHooks = true);

/** @global */
const AreaData = require("../Modules/GameData/AreaData");

/**
 * Easier way to check if you have a waypoint
 * @param {number} area 
 * @returns {boolean}
 */
me.haveWaypoint = function (area) {
  let checkArea = AreaData.get(area);
  if (!checkArea || !checkArea.hasWaypoint()) return false;
  return getWaypoint(AreaData.wps.get(area));
};

Pather.inAnnoyingArea = function (currArea, includeArcane = false) {
  const areas = [sdk.areas.MaggotLairLvl1, sdk.areas.MaggotLairLvl2, sdk.areas.MaggotLairLvl3];
  includeArcane && areas.push(sdk.areas.ArcaneSanctuary);
  return areas.includes(currArea);
};

/**
 * @typedef {Object} clearSettings
 * @property {boolean} canTele
 * @property {boolean} clearPath
 * @property {number} range
 * @property {number} specType
 * @property {boolean} [allowClearing]
 */

/**
 * @param {clearSettings} arg
 * @returns {void}
 * @todo
 * - clean this up
 * - use effort level calculations to control clearing
 */
NodeAction.killMonsters = function (arg = {}) {
  if (Attack.stopClear || (arg.hasOwnProperty("allowClearing") && !arg.allowClearing)) return;

  const myArea = me.area;
  // I don't think this is even needed anymore, pretty sure I fixed wall hugging. todo - check it
  const pallyAnnoyingAreas = [
    sdk.areas.DenofEvil, sdk.areas.CaveLvl1,
    sdk.areas.UndergroundPassageLvl1, sdk.areas.HoleLvl1,
    sdk.areas.PitLvl1, sdk.areas.CaveLvl2,
    sdk.areas.UndergroundPassageLvl2, sdk.areas.PitLvl2,
    sdk.areas.HoleLvl2, sdk.areas.DisusedFane,
    sdk.areas.RuinedTemple, sdk.areas.ForgottenReliquary,
    sdk.areas.ForgottenTemple, sdk.areas.RuinedFane, sdk.areas.DisusedReliquary
  ];
  const summonerAreas = [
    sdk.areas.DenofEvil, sdk.areas.ColdPlains,
    sdk.areas.StonyField, sdk.areas.Tristram,
    sdk.areas.DarkWood, sdk.areas.BlackMarsh,
    sdk.areas.OuterCloister, sdk.areas.Barracks,
    sdk.areas.Cathedral, sdk.areas.CatacombsLvl4,
    sdk.areas.HallsoftheDeadLvl1, sdk.areas.HallsoftheDeadLvl2,
    sdk.areas.HallsoftheDeadLvl3, sdk.areas.ValleyofSnakes,
    sdk.areas.ClawViperTempleLvl1, sdk.areas.TalRashasTomb1,
    sdk.areas.TalRashasTomb2, sdk.areas.TalRashasTomb3,
    sdk.areas.TalRashasTomb4, sdk.areas.TalRashasTomb5,
    sdk.areas.TalRashasTomb6, sdk.areas.TalRashasTomb7
  ];
  // sanityCheck from isid0re - added paladin specific areas - theBGuy - a mess.. sigh
  if (Pather.inAnnoyingArea(myArea, true) || (me.paladin && pallyAnnoyingAreas.includes(myArea))) {
    arg.range = 7;
  }

  /**
   * @todo:
   * - we don't need this if we have a lightning chain based skill, e.g light sorc, light zon
   * - better monster sorting. If we are low level priortize killing easy targets like zombies/quill rats while ignoring fallens unless they are in our path
   * - ignore dolls when walking unless absolutely necessary because we are blocked
   */
  if (!arg.canTele && arg.clearPath !== false) {
    /** @type {Array<Monster>} */
    const monList = [];
    /** @param {Monster} mon */
    const addToMonList = function (mon) {
      monList.push(mon);
    };
    let _coll = (sdk.collision.BlockWall | sdk.collision.LineOfSight | sdk.collision.Ranged);

    if (me.inArea(sdk.areas.BloodMoor)) {
      getUnits(sdk.unittype.Monster)
        .filter(function (mon) {
          return mon.attackable && mon.distance < 30
            && !mon.isFallen && !checkCollision(me, mon, _coll);
        })
        .forEach(addToMonList);
    }

    if (summonerAreas.includes(myArea)) {
      getUnits(sdk.unittype.Monster)
        .filter(function (mon) {
          return mon.attackable && mon.distance < 30
            && (mon.isUnraveler || mon.isShaman) && !checkCollision(me, mon, _coll);
        })
        .forEach(addToMonList);
    }

    if ([sdk.areas.StonyField, sdk.areas.BlackMarsh, sdk.areas.FarOasis].includes(me.area)) {
      // monster nest's are good exp
      getUnits(sdk.unittype.Monster)
        .filter(function (mon) {
          return mon.attackable && mon.distance < 35 && mon.isMonsterNest;
        })
        .forEach(addToMonList);
    }
    // need to write a way to consider current path
    monList.length > 0 && Attack.clearList(monList);
  }

  if (arg.clearPath !== false) {
    Attack.clear(arg.range, arg.specType);
  }
};

/** @param {clearSettings} arg */
NodeAction.popChests = function (arg = {}) {
  const range = arg.canTele ? 25 : 15;
  Config.OpenChests.Enabled && Misc.openChests(range);
  Misc.useWell(range);
};

/** @param {clearSettings} arg */
NodeAction.pickItems = function (arg = {}) {
  if (arg.hasOwnProperty("allowPicking") && !arg.allowPicking) return;

  let item = Game.getItem();

  if (item) {
    const maxDist = Skill.haveTK ? 15 : 5;
    const regPickRange = arg.canTele ? Config.PickRange : 8;
    const maxRange = Math.max(maxDist, regPickRange);
    const totalList = [].concat(Pickit.essentialList, Pickit.pickList);
    /** @param {ItemUnit} item */
    const filterJunk = function (item) {
      return !!item && item.onGroundOrDropping;
    };

    do {
      if (item.onGroundOrDropping) {
        const itemDist = getDistance(me, item);
        if (itemDist > maxRange) continue;
        if (totalList.some(el => el.gid === item.gid)) continue;
        if (Pickit.essentials.includes(item.itemType)) {
          if (itemDist <= maxDist && (item.itemType !== sdk.items.type.Gold || itemDist < 5)
            && Pickit.checkItem(item).result && Pickit.canPick(item) && Pickit.canFit(item)) {
            Pickit.essentialList.push(copyUnit(item));
          }
        } else if (itemDist <= regPickRange && item.itemType === sdk.items.type.Key) {
          if (Pickit.canPick(item) && Pickit.checkItem(item).result) {
            Pickit.pickList.push(copyUnit(item));
          }
        } else if (itemDist <= regPickRange && Pickit.checkItem(item).result) {
          Pickit.pickList.push(copyUnit(item));
        }
      }
    } while (item.getNext());
    
    Pickit.essentialList.length > 0 && (Pickit.essentialList = Pickit.essentialList.filter(filterJunk));
    Pickit.pickList.length > 0 && (Pickit.pickList = Pickit.pickList.filter(filterJunk));
    Pickit.essentialList.length > 0 && Pickit.essessntialsPick(false, false);
    Pickit.pickList.length > 0 && Pickit.pickItems(regPickRange);
  }
};

// todo - fast shrineing, if we are right next to a shrine then grab it even with mobs around

Pather.haveTeleCharges = false;
Pather.forceWalk = false;
Pather.forceRun = false;

{
  let coords = function () {
    if (Array.isArray(this) && this.length > 1) return [this[0], this[1]];

    if (typeof this.x !== "undefined" && typeof this.y !== "undefined") {
      return this instanceof PresetUnit && [this.roomx * 5 + this.x, this.roomy * 5 + this.y] || [this.x, this.y];
    }

    return [undefined, undefined];
  };

  Object.defineProperty(Object.prototype, "mobCount", {
    writable: true,
    enumerable: false,
    configurable: true,
    value: function (givenSettings = {}) {
      let [x, y] = coords.apply(this);
      const settings = Object.assign({}, {
        range: 5,
        coll: (
          sdk.collision.BlockWall | sdk.collision.ClosedDoor | sdk.collision.LineOfSight | sdk.collision.BlockMissile
        ),
        type: 0,
        ignoreClassids: [],
      }, givenSettings);
      return getUnits(sdk.unittype.Monster)
        .filter(function (mon) {
          return mon.attackable && getDistance(x, y, mon.x, mon.y) < settings.range
            && (!settings.type || (settings.type & mon.spectype))
            && (settings.ignoreClassids.indexOf(mon.classid) === -1)
            && !CollMap.checkColl({ x: x, y: y }, mon, settings.coll, 1);
        }).length;
    }
  });
}

Pather.checkForTeleCharges = function () {
  this.haveTeleCharges = Attack.getItemCharges(sdk.skills.Teleport);
};

Pather.canUseTeleCharges = function () {
  if (me.classic || me.inTown || me.shapeshifted) return false;
  // Charges are costly so make sure we have enough gold to handle repairs
  // unless we are in maggot lair since thats a pita and worth the gold spent
  if (me.gold < 500000 && !Pather.inAnnoyingArea(me.area)) return false;

  return this.haveTeleCharges;
};

Pather.teleportTo = function (x, y, maxRange = 5) {
  // Developer.debugging.pathing && console.log("Mob Count at next node: " + [x, y].mobCount());
  
  for (let i = 0; i < 3; i += 1) {
    if (!Packet.teleport(x, y)) continue;
    let tick = getTickCount();
    let pingDelay = i === 0 ? 250 : me.getPingDelay();

    while (getTickCount() - tick < Math.max(500, pingDelay * 2 + 200)) {
      if (getDistance(me.x, me.y, x, y) < maxRange) {
        return true;
      }

      delay(10);
    }
  }

  return false;
};

Pather.teleUsingCharges = function (x, y, maxRange = 5) {
  let orgSlot = me.weaponswitch;

  try {
    for (let i = 0; i < 3; i++) {
      me.castChargedSkillEx(sdk.skills.Teleport, x, y);
      let tick = getTickCount();

      while (getTickCount() - tick < Math.max(500, me.ping * 2 + 200)) {
        if (getDistance(me.x, me.y, x, y) < maxRange) {
          return true;
        }

        delay(10);
      }
    }

    if (CharData.skillData.haveChargedSkill(sdk.skills.Teleport)
      && !Attack.getItemCharges(sdk.skills.Teleport)) {

      if (me.gold > me.getRepairCost() * 3 && me.canTpToTown()) {
        console.debug("Tele-Charge repair");
        Town.visitTown(true);
      } else {
        this.haveTeleCharges = false;
      }
    }

    return false;
  } finally {
    me.weaponswitch !== orgSlot && me.switchWeapons(orgSlot);
  }
};

Pather.checkWP = function (area = 0, keepMenuOpen = false) {
  while (!me.gameReady) {
    delay(40);
  }

  // only do this if we haven't initialzed our wp data
  if (!me.haveWaypoint(area) && !Pather.initialized) {
    me.inTown && !getUIFlag(sdk.uiflags.Waypoint) && Town.move("waypoint");

    for (let i = 0; i < 15; i++) {
      let wp = Game.getObject("waypoint");
      let useTK = (Skill.useTK(wp) && i < 5);
      let pingDelay = me.getPingDelay();

      if (wp && wp.area === me.area) {
        if (useTK) {
          wp.distance > 21 && Pather.moveNearUnit(wp, 20);
          Packet.telekinesis(wp);
        } else {
          wp.distance > 7 && this.moveToUnit(wp);
          Misc.click(0, 0, wp);
        }

        let tick = getTickCount();

        while (getTickCount() - tick < Math.max(Math.round((i + 1) * 1000 / (i / 5 + 1)), (1 + pingDelay * 2))) {
          if (getUIFlag(sdk.uiflags.Waypoint)) {
            delay(500 + pingDelay);
            break;
          }

          delay(50 + pingDelay);
        }
      } else {
        me.inTown && Town.move("waypoint");
      }

      if (getUIFlag(sdk.uiflags.Waypoint)) {
        !keepMenuOpen && me.cancel();
        Pather.initialized = true;
        break;
      }
    }
    // go ahead and close out of wp menu if we don't have the wp
    !me.haveWaypoint(area) && getUIFlag(sdk.uiflags.Waypoint) && me.cancel();
  }

  return me.haveWaypoint(area);
};

Pather.changeAct = function (act = me.act + 1) {
  const npcTravel = new Map([
    [1, ["Warriv", sdk.areas.RogueEncampment]],
    [2, [(me.act === 1 ? "Warriv" : "Meshif"), sdk.areas.LutGholein]],
    [3, ["Meshif", sdk.areas.KurastDocktown]],
    [5, ["Tyrael", sdk.areas.Harrogath]],
  ]);
  let [npc, loc] = npcTravel.get(act);
  if (!npc) return false;

  !me.inTown && Town.goToTown();
  let npcUnit = Town.npcInteract(npc);
  let timeout = getTickCount() + 3000;
  let pingDelay = me.getPingDelay();

  if (!npcUnit) {
    while (!npcUnit && timeout < getTickCount()) {
      Town.move(NPC[npc]);
      Packet.flash(me.gid, pingDelay);
      delay(pingDelay * 2 + 100);
      npcUnit = Game.getNPC(npc);
    }
  }

  if (npcUnit) {
    for (let i = 0; i < 5; i++) {
      new PacketBuilder()
        .byte(sdk.packets.send.EntityAction)
        .dword(0)
        .dword(npcUnit.gid)
        .dword(loc)
        .send();
      delay(1000);

      if (me.act === act) {
        break;
      }
    }
  } else {
    myPrint("Failed to move to " + npc);
  }

  while (!me.gameReady) {
    delay(100);
  }

  return me.act === act;
};

Pather.clearUIFlags = function () {
  while (!me.gameReady) delay(3);

  for (let i = 0; i < Pather.cancelFlags.length; i++) {
    if (getUIFlag(Pather.cancelFlags[i]) && me.cancel()) {
      delay(250);
      i = 0; // Reset
    }
  }
};

/**
 * @memberof Pather
 * @type {PathNode[]}
 */
Pather.currentWalkingPath = [];

/**
 * @param {PathNode | Unit | PresetUnit} target 
 * @param {pathSettings} givenSettings 
 * @returns {boolean}
 */
Pather.move = function (target, givenSettings = {}) {
  // Abort if dead
  if (me.dead) return false;
  /**
   * assign settings
   * @type {pathSettings}
   */
  const settings = Object.assign({}, {
    clearSettings: {
    },
    allowNodeActions: true,
    allowTeleport: true,
    allowClearing: true,
    allowTown: true,
    allowPicking: true,
    minDist: 3,
    retry: 5,
    pop: false,
    returnSpotOnError: true,
    callback: null,
  }, givenSettings);
  // assign clear settings becasue object.assign was removing the default properties of settings.clearSettings
  const clearSettings = Object.assign({
    canTele: false,
    clearPath: false,
    range: typeof Config.ClearPath.Range === "number" ? Config.ClearPath.Range : 10,
    specType: typeof Config.ClearPath.Spectype === "number" ? Config.ClearPath.Spectype : 0,
    sort: Attack.sortMonsters,
  }, settings.clearSettings);
  // set settings.clearSettings equal to the now properly asssigned clearSettings
  settings.clearSettings = clearSettings;
  !settings.allowClearing && (settings.clearSettings.allowClearing = false);
  !settings.allowPicking && (settings.clearSettings.allowPicking = false);

  (target instanceof PresetUnit) && (target = target.realCoords());

  if (settings.minDist > 3) {
    target = Pather.spotOnDistance(
      target,
      settings.minDist,
      { returnSpotOnError: settings.returnSpotOnError, reductionType: (me.inTown ? 0 : 2) }
    );
  }

  /** @constructor */
  function PathAction () {
    this.at = 0;
    /** @type {PathNode} */
    this.node = { x: null, y: null };
  }

  let fail = 0;
  let invalidCheck = false;
  let cbCheck = false;
  let node = { x: target.x, y: target.y };
  const leaped = new PathAction();
  const whirled = new PathAction();
  const cleared = new PathAction();
  const teleported = new PathAction();

  Pather.clearUIFlags();

  if (typeof target.x !== "number" || typeof target.y !== "number") return false;
  if (getDistance(me, target) < 2 && !CollMap.checkColl(me, target, Coords_1.Collision.BLOCK_MISSILE, 5)) {
    return true;
  }

  const useTeleport = (
    settings.allowTeleport
    && (target.distance > 15 || me.diff || me.act > 3)
    && Pather.useTeleport()
  );
  settings.clearSettings.canTele = useTeleport;
  const useChargedTele = settings.allowTeleport && Pather.canUseTeleCharges();
  const usingTele = (useTeleport || useChargedTele);
  const tpMana = Skill.getManaCost(sdk.skills.Teleport);
  const annoyingArea = Pather.inAnnoyingArea(me.area);
  let path = getPath(
    me.area,
    target.x, target.y,
    me.x, me.y,
    usingTele ? 1 : 0,
    usingTele ? (annoyingArea ? 30 : Pather.teleDistance) : Pather.walkDistance
  );
  if (!path) throw new Error("move: Failed to generate path.");

  // need to work on a better force clearing method but for now just have all walkers clear unless
  // we specifically are forcing them not to (like while repositioning)
  if (!useTeleport && settings.allowClearing && !settings.clearSettings.clearPath) {
    settings.clearSettings.clearPath = true;
  }

  if (settings.retry <= 3 && target.distance > useTeleport ? 120 : 60) {
    settings.retry = 10;
  }

  // for now only do this for teleporters
  if (useTeleport && !me.normal) {
    /** @type {Array} */
    let areaImmunities = GameData.areaImmunities(me.area);
    if (areaImmunities.length) {
      let mySkElems = Config.AttackSkill
        .filter(sk => sk > 0)
        .map(sk => Attack.getSkillElement(sk));
      // this area has monsters that are immune to our elements. This is a basic check for now
      // a better way would probably be per list built to check the ratio of immunes to non?
      if (mySkElems.length && mySkElems.every(elem => areaImmunities.includes(elem))) {
        settings.clearSettings.clearPath = false;
      }
    } else if (AreaData.get(me.area).hasMonsterType(sdk.monsters.type.UndeadFetish)) {
      settings.clearSettings.clearPath = false;
    }
  }

  path.reverse();
  settings.pop && path.pop();
  PathDebug.drawPath(path);
  useTeleport && Config.TeleSwitch && path.length > 5 && me.switchToPrimary();

  while (path.length > 0) {
    // Abort if dead
    if (me.dead) return false;
    // main path
    Pather.recursion && (Pather.currentWalkingPath = path);
    Pather.clearUIFlags();

    node = path.shift();

    if (typeof settings.callback === "function" && settings.callback()) {
      cbCheck = true;
      break;
    }

    if (getDistance(me, node) > 2) {
      // Make life in Maggot Lair easier
      if (fail >= 3 && fail % 3 === 0 && !Attack.validSpot(node.x, node.y)) {
        invalidCheck = true;
      }
      // Make life in Maggot Lair easier - should this include arcane as well?
      if (annoyingArea || invalidCheck) {
        let adjustedNode = Pather.getNearestWalkable(node.x, node.y, 15, 3, sdk.collision.BlockWalk);

        if (adjustedNode) {
          [node.x, node.y] = adjustedNode;
          invalidCheck && (invalidCheck = false);
        }

        annoyingArea && ([settings.clearSettings.clearPath, settings.clearSettings.range] = [true, 5]);
        settings.retry <= 3 && !useTeleport && (settings.retry = 15);
      }

      if (useTeleport && tpMana <= me.mp
        ? Pather.teleportTo(node.x, node.y)
        : useChargedTele && (getDistance(me, node) >= 15 || me.inArea(sdk.areas.ThroneofDestruction))
          ? Pather.teleUsingCharges(node.x, node.y)
          : Pather.walkTo(node.x, node.y, (fail > 0 || me.inTown) ? 2 : 4)) {
        if (settings.allowNodeActions && !me.inTown) {
          if (Pather.recursion) {
            try {
              Pather.recursion = false;
              /**
               * @todo We need to pass our path in so we can fix the recursion issues of running forward on our path
               * only to return to the old node and continue we should instead perform the actions in a way that moves
               * us forward on our path ensuring we haven't skipped anything in the process as well
               * for long paths maybe generate a coordinate list of shrines/chests and have action hooks for them
               */
              NodeAction.go(settings.clearSettings);
              // need to determine if its worth going back to our orignal node (items maybe?)
              // vs our current proximity to our next node
              // need to export our main path so other functions that cause us to move can see it
              if (node.distance > 5) {
                const lastNode = Pather.currentWalkingPath.last();
                // lets try and find the nearest node that brings us close to our goal
                /** @type {PathNode} */
                let nearestNode = Pather.currentWalkingPath.length > 0 && Pather.currentWalkingPath
                  .filter(function (el) {
                    return !!el && el.x !== node.x && el.y !== node.y;
                  })
                  .sort(function (a, b) {
                    const [aDist, bDist] = [a.distance, b.distance];
                    const [aLastDist, bLastDist] = [getDistance(a, lastNode), getDistance(b, lastNode)];
                    if (aDist < bDist && aLastDist < bLastDist) return -1;
                    if (aDist > bDist && aLastDist > bLastDist) return 1;
                    return aDist - bDist;
                  })
                  .find(function (pNode) {
                    return pNode.distance > 5;
                  });
                  
                if (node.distance < 40) {
                  let goBack = false;
                  // lets see if it's worth walking back to old node
                  Pickit.checkSpotForItems(node, true) && (goBack = true);
                  // @todo check shrines/chests in proximity to old node vs next node
                  if (goBack) {
                    // console.debug("Going back to old node. Distance: " + node.distance);
                  } else if (nearestNode && nearestNode.distance > 5 && node.distance > 5
                    && Math.percentDifference(node.distance, nearestNode.distance) > 5) {
                    let newIndex = path.findIndex(node => nearestNode.x === node.x && nearestNode.y === node.y);
                    if (newIndex > -1) {
                      path = path.slice(newIndex);
                      node = path.shift();
                    }
                  }

                  if (node.distance > 5) {
                    Pather.move(node, settings);
                  }
                } else {
                  Pather.move(node, settings);
                }
              }
            } finally {
              Pather.recursion = true;
            }
          }
        }
      } else {
        if (!me.inTown) {
          if (!useTeleport && settings.allowClearing) {
            let tempRange = (annoyingArea ? 5 : 10);
            // allowed to clear so lets see if any mobs are around us
            if (me.checkForMobs({ range: tempRange, coll: sdk.collision.BlockWalk })) {
              // there are at least some, but lets only continue to next iteration if we actually killed something
              if (Attack.clear(tempRange, null, null, null, settings.allowPicking) === Attack.Result.SUCCESS) {
                // console.debug("Cleared Node");
                continue;
              }
            }
          }
          if (!useTeleport && (Pather.openDoors(node.x, node.y) || Pather.kickBarrels(node.x, node.y))) {
            continue;
          }

          if (fail > 0 && (!useTeleport || tpMana > me.mp)) {
            // if we are allowed to clear
            if (settings.allowClearing) {
              // Don't go berserk on longer paths - also check that there are even mobs blocking us
              if (cleared.at === 0 || getTickCount() - cleared.at > Time.seconds(3)
                && cleared.node.distance > 5 && me.checkForMobs({ range: 10 })) {
                // only set that we cleared if we actually killed at least 1 mob
                if (Attack.clear(10, null, null, null, settings.allowPicking) === Attack.Result.SUCCESS) {
                  // console.debug("Cleared Node");
                  cleared.at = getTickCount();
                  [cleared.node.x, cleared.node.y] = [node.x, node.y];
                }
              }
            }

            // Leap can be helpful on long paths but make sure we don't spam it
            if (Skill.canUse(sdk.skills.LeapAttack)) {
              // we can use leapAttack, now lets see if we should - either haven't used it yet
              // or it's been long enough since last time
              if (leaped.at === 0 || getTickCount() - leaped.at > Time.seconds(3)
                || leaped.node.distance > 5 || me.checkForMobs({ range: 6 })) {
                // alright now if we have actually casted it set the values so we know
                if (Skill.cast(sdk.skills.LeapAttack, sdk.skills.hand.Right, node.x, node.y)) {
                  leaped.at = getTickCount();
                  [leaped.node.x, leaped.node.y] = [node.x, node.y];
                }
              }
            }

            /**
             * whirlwind can be useful as well, implement it.
             * Things to consider:
             * 1) Can we cast whirlwind on the node? Is it blocked by something other than monsters.
             * 2) If we can't cast on that node, is there another node between us and it that would work?
             */
            if (Skill.canUse(sdk.skills.Whirlwind)) {
              // we can use whirlwind, now lets see if we should - either haven't used it yet
              // or it's been long enough since last time
              if (whirled.at === 0 || getTickCount() - whirled.at > Time.seconds(3)
                || whirled.node.distance > 5 || me.checkForMobs({ range: 6 })) {
                // alright now if we have actually casted it set the values so we know
                if (Skill.cast(sdk.skills.Whirlwind, sdk.skills.hand.Right, node.x, node.y)) {
                  whirled.at = getTickCount();
                  [whirled.node.x, whirled.node.y] = [node.x, node.y];
                }
              }
            }

            if (usingTele) {
              if (teleported.at === 0 || getTickCount() - teleported.at > Time.seconds(3)
                || teleported.node.distance > 5 || me.checkForMobs({ range: 6 })) {
                // alright now if we have actually casted it set the values so we know
                if (useTeleport ? Pather.teleportTo(node.x, node.y) : Pather.teleUsingCharges(node.x, node.y)) {
                  teleported.at = getTickCount();
                  [teleported.node.x, teleported.node.y] = [node.x, node.y];
                }
              }
            }
          }
        }

        // Reduce node distance in new path
        path = getPath(
          me.area,
          target.x, target.y,
          me.x, me.y,
          useTeleport ? 1 : 0,
          useTeleport ? rand(25, 35) : rand(10, 15)
        );
        if (!path) throw new Error("moveTo: Failed to generate path.");

        path.reverse();
        PathDebug.drawPath(path);
        settings.pop && path.pop();

        if (fail > 0) {
          console.debug("move retry " + fail);
          Packet.flash(me.gid);

          if (fail >= settings.retry) {
            console.log("Failed move: Retry = " + settings.retry);
            break;
          }
        }
        if (fail > 100) {
          // why?
          console.debug(settings);
          throw new Error("Retry limit excessivly exceeded");
        }
        fail++;
      }
    }

    delay(5);
  }

  useTeleport && Config.TeleSwitch && me.switchToPrimary();
  PathDebug.removeHooks();

  return cbCheck || getDistance(me, node.x, node.y) < 5;
};

Pather.moveNear = function (x, y, minDist, givenSettings = {}) {
  return Pather.move(
    { x: x, y: y },
    Object.assign({ minDist: minDist }, givenSettings)
  );
};

Pather.moveTo = function (x, y, retry, clearPath = true, pop = false) {
  return Pather.move(
    { x: x, y: y },
    { retry: retry, pop: pop, clearSettings: { clearPath: clearPath } }
  );
};

Pather.moveToLoc = function (target, givenSettings = {}) {
  return Pather.move(target, givenSettings);
};

Pather.moveToEx = function (x, y, givenSettings = {}) {
  return Pather.move({ x: x, y: y }, givenSettings);
};

/**
 * @param {number} targetArea - area id or array of area ids to move to
 * @param {boolean} [use] - enter target area or last area in the array
 * @param {pathSettings} givenSettings
 */
Pather.moveToExit = function (targetArea, use, givenSettings = {}) {
  if (targetArea === undefined) return false;

  const areas = Array.isArray(targetArea)
    ? targetArea
    : [targetArea];
  const finalDest = areas.last();
  const finalDestName = getAreaName(finalDest);
  console.info(true, "ÿc7MyArea: ÿc0" + getAreaName(me.area) + " ÿc7TargetArea: ÿc0" + finalDestName, "moveToExit");

  me.inArea(areas.first()) && areas.shift();

  for (let currTarget of areas) {
    console.info(null, getAreaName(me.area) + "ÿc8 --> ÿc0" + getAreaName(currTarget));
    
    // const area = Misc.poll(() => getArea(me.area));
    // if (!area) throw new Error("moveToExit: error in getArea()");
    
    /** @type {Array<Exit>} */
    const exits = AreaData.get(me.area).getExits();
    // const exits = (area.exits || []);
    if (!exits.length) return false;

    let checkExits = [];
    for (let exit of exits) {
      if (!exit.hasOwnProperty("target") || exit.target !== currTarget) continue;
      checkExits.push(exit);
    }

    if (checkExits.length > 0) {
      // if there are multiple exits to the same location find the closest one
      let currExit = checkExits.length > 1
        ? (function () {
          let useExit = checkExits.shift(); // assign the first exit as a possible result
          let dist = getDistance(me.x, me.y, useExit.x, useExit.y);
          while (checkExits.length > 0) {
            let exitDist = getDistance(me.x, me.y, checkExits[0].x, checkExits[0].y);
            if (exitDist < dist) {
              useExit = checkExits[0];
              dist = exitDist;
            }
            checkExits.shift();
          }
          return useExit;
        })()
        : checkExits[0];
      let dest = this.getNearestWalkable(currExit.x, currExit.y, 5, 1);
      if (!dest) return false;
      const node = { x: dest[0], y: dest[1] };

      for (let retry = 0; retry < 3; retry++) {
        if (this.move(node, givenSettings)) {
          break;
        }

        delay(200);
        console.log("ÿc7(moveToExit) :: ÿc0Retry: " + (retry + 1));
        Misc.poll(function () {
          return me.gameReady;
        }, 1000, 200);
      }

      if (use || currTarget !== finalDest) {
        switch (currExit.type) {
        case 1: // walk through
          let targetRoom = this.getNearestRoom(currTarget);
          // might need adjustments
          if (!targetRoom) return false;
          this.move({ x: targetRoom[0], y: targetRoom[1] }, givenSettings);

          break;
        case 2: // stairs
          if (!this.openExit(currTarget) && !this.useUnit(sdk.unittype.Stairs, currExit.tileid, currTarget)) {
            return false;
          }

          break;
        }
      }
    }
  }

  console.info(false, "ÿc7targetArea: ÿc0" + finalDestName + " ÿc7myArea: ÿc0" + getAreaName(me.area), "moveToExit");
  delay(300);

  return (use && finalDest ? me.area === finalDest : true);
};

// Add check in case "random" to return false if bot doesn't have cold plains wp yet
Pather.useWaypoint = function useWaypoint (targetArea, check = false) {
  switch (targetArea) {
  case undefined:
    throw new Error("useWaypoint: Invalid targetArea parameter: " + targetArea);
  case null:
  case "random":
    check = true;

    break;
  default:
    if (typeof targetArea !== "number") throw new Error("useWaypoint: Invalid targetArea parameter");
    if (!AreaData.wps.has(targetArea)) throw new Error("useWaypoint: Invalid area");

    break;
  }

  console.time("useWaypoint");

  MainLoop:
  for (let i = 0; i < 12; i++) {
    if (me.area === targetArea || me.dead) {
      break;
    }

    if (me.inTown) {
      if (me.inArea(sdk.areas.LutGholein) && targetArea === sdk.areas.KurastDocktown) {
        let npc = Game.getNPC(NPC.Meshif);

        if (!!npc && npc.distance < 50) {
          if (!Pather.changeAct(3)) throw new Error("Failed to go to act 3 using Meshif");
          break;
        }
      } else if (me.inArea(sdk.areas.LutGholein)) {
        let npc = Game.getNPC(NPC.Warriv);

        if (!!npc && npc.distance < 50) {
          if (!Pather.changeAct(1)) throw new Error("Failed to go to act 1 using Warriv");
        }
      } else if (me.inArea(sdk.areas.KurastDocktown) && targetArea === sdk.areas.LutGholein) {
        let npc = Game.getNPC(NPC.Meshif);

        if (!!npc && npc.distance < 50) {
          if (!Pather.changeAct(2)) throw new Error("Failed to go to act 2 using Meshif");
          break;
        }
      }

      if (!getUIFlag(sdk.uiflags.Waypoint) && Town.getDistance("waypoint") > (Skill.haveTK ? 20 : 5)) {
        Town.move("waypoint");
      }
    }

    let wp = Game.getObject("waypoint");

    if (!!wp && wp.area === me.area) {
      let useTK = (Skill.useTK(wp) && i < 3);
      let pingDelay = me.getPingDelay();

      if (useTK && !getUIFlag(sdk.uiflags.Waypoint)) {
        wp.distance > 21 && Pather.moveNearUnit(wp, 20);
        if (i > 1 && checkCollision(me, wp, sdk.collision.Ranged)) {
          Attack.getIntoPosition(wp, 20, sdk.collision.Ranged);
        }
        Packet.telekinesis(wp);
      } else if (!me.inTown && wp.distance > 7) {
        this.moveToUnit(wp);
      }

      if (check || Config.WaypointMenu || !this.initialized) {
        if (!useTK && (wp.distance > 5 || !getUIFlag(sdk.uiflags.Waypoint))) {
          this.moveToUnit(wp) && Misc.click(0, 0, wp);
        }

        // handle getUnit bug
        if (me.inTown && !getUIFlag(sdk.uiflags.Waypoint) && wp.name.toLowerCase() === "dummy") {
          Town.getDistance("waypoint") > 5 && Town.move("waypoint");
          Misc.click(0, 0, wp);
        }

        let tick = getTickCount();

        while (getTickCount() - tick < Math.max(Math.round((i + 1) * 1000 / (i / 5 + 1)), pingDelay * 2)) {
          if (getUIFlag(sdk.uiflags.Waypoint)) {
            delay(500);

            switch (targetArea) {
            case "random":
              let validWps = this.nonTownWpAreas
                .filter(area => getWaypoint(this.wpAreas.indexOf(area)));
              if (!validWps.length) {
                if (me.inTown && Pather.moveToExit(me.area + 1, true)) {
                  break;
                }
                throw new Error("Pather.useWaypoint: Failed to go to waypoint " + targetArea);
              }
              targetArea = validWps.random();

              break;
            case null:
              me.cancel();

              return true;
            }

            if (!me.haveWaypoint(targetArea) && me.cancel()) {
              me.overhead("Trying to get the waypoint");
              if (this.getWP(targetArea)) return true;

              throw new Error("Pather.useWaypoint: Failed to go to waypoint " + targetArea);
            }

            break;
          }

          delay(10);
        }

        if (!getUIFlag(sdk.uiflags.Waypoint)) {
          console.warn("waypoint retry " + (i + 1));
          let retry = Math.min(i + 1, 5);
          let coord = CollMap.getRandCoordinate(me.x, -5 * retry, 5 * retry, me.y, -5 * retry, 5 * retry);
          !!coord && this.moveTo(coord.x, coord.y);
          delay(200);
          i > 1 && (i % 3) === 0 && Packet.flash(me.gid, pingDelay);

          continue;
        }
      }

      if (!check || getUIFlag(sdk.uiflags.Waypoint)) {
        delay(250);
        wp.interact(targetArea);
        let tick = getTickCount();

        while (getTickCount() - tick < Math.max(Math.round((i + 1) * 1000 / (i / 5 + 1)), pingDelay * 4)) {
          if (me.area === targetArea) {
            delay(1500);

            break MainLoop;
          }

          delay(30);
        }

        while (!me.gameReady) {
          delay(1000);
        }

        // In case lag causes the wp menu to stay open
        getUIFlag(sdk.uiflags.Waypoint) && me.cancel();
      }

      i > 1 && (i % 3) === 0 && Packet.flash(me.gid, pingDelay);
      // Activate check if we fail direct interact twice
      i > 1 && (check = true);
    } else {
      Packet.flash(me.gid);
    }

    // We can't seem to get the wp maybe attempt portal to town instead and try to use that wp
    i >= 10 && !me.inTown && Town.goToTown();

    delay(250);
  }

  if (me.area === targetArea) {
    delay(500);
    console.info(
      false,
      "ÿc7targetArea: ÿc0" + getAreaName(targetArea) + " ÿc7myArea: ÿc0" + getAreaName(me.area),
      "useWaypoint"
    );
    return true;
  }

  throw new Error("useWaypoint: Failed to use waypoint to " + targetArea);
};

/**
 * @param {number} currentarea 
 * @param {number} targetarea 
 * @param {pathSettings} givenSettings 
 * @returns {boolean}
 */
Pather.clearToExit = function (currentarea, targetarea, givenSettings = {}) {
  let retry = 0;
  const targetName = getAreaName(targetarea);
  console.info(true, getAreaName(me.area) + "ÿc8 --> ÿc0" + targetName, "clearToExit");

  me.area !== currentarea && Pather.journeyTo(currentarea);

  if (typeof givenSettings === "boolean") {
    givenSettings = { allowClearing: givenSettings };
  }

  while (me.area !== targetarea) {
    try {
      Pather.moveToExit(targetarea, true, givenSettings);
    } catch (e) {
      console.error(e);
    }

    delay(500);
    Misc.poll(() => me.gameReady, 1000, 100);
    
    if (retry > 5) {
      console.error("ÿc2Failed to move to: ÿc0" + targetName);

      break;
    }

    retry++;
  }

  console.info(false, "", "clearToExit");
  return (me.area === targetarea);
};

Pather.getWalkDistance = function (x, y, area = me.area, xx = me.x, yy = me.y, reductionType = 2, radius = 5) {
  // distance between node x and x-1
  return (getPath(area, x, y, xx, yy, reductionType, radius) || [])
    .map(function (e, i, s) {
      return i && getDistance(s[i - 1], e) || 0;
    })
    .reduce(function (acc, cur) {
      return acc + cur;
    }, 0) || Infinity;
};
