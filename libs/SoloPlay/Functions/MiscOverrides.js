/**
*  @filename    MiscOverrides.js
*  @author      theBGuy
*  @credit      isid0re (get/use Well idea)
*  @desc        miscellaneous functions, socketing/imbuing
*
*/

includeIfNotIncluded("core/Misc.js");

Misc.openChestsEnabled = true;
Misc.screenshotErrors = true;
Misc.presetChestIds = [
  5, 6, 87, 104, 105, 106, 107, 143, 140, 141, 144, 146, 147, 148, 176, 177, 181, 183, 198, 240, 241,
  242, 243, 329, 330, 331, 332, 333, 334, 335, 336, 354, 355, 356, 371, 387, 389, 390, 391, 397, 405,
  406, 407, 413, 420, 424, 425, 430, 431, 432, 433, 454, 455, 501, 502, 504, 505, 580, 581
];

/**
 * @override
 * @param {number} area 
 * @param {number[]} chestIds 
 * @param {Function} [sort] 
 * @returns {boolean}
 */
Misc.openChestsInArea = function (area, chestIds = [], sort = undefined) {
  !area && (area = me.area);
  area !== me.area && Pather.journeyTo(area);
    
  let presetUnits = Game.getPresetObjects(area);
  if (!presetUnits) return false;

  !chestIds.length && (chestIds = Misc.presetChestIds.slice(0));

  let coords = [];

  while (presetUnits.length > 0) {
    if (chestIds.includes(presetUnits[0].id)) {
      coords.push({
        x: presetUnits[0].roomx * 5 + presetUnits[0].x,
        y: presetUnits[0].roomy * 5 + presetUnits[0].y
      });
    }

    presetUnits.shift();
  }

  while (coords.length) {
    coords.sort(sort ? sort : Sort.units);
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
  if (!me.assassin && unit.islocked && !me.findItem(sdk.items.Key, sdk.items.mode.inStorage, sdk.storage.Inventory)) return false;

  let specialChest = sdk.quest.chests.includes(unit.classid);

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

    if (Misc.poll(() => !unit || unit.mode, 1000, 50)) {
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
    .filter(c => c.name && c.mode === sdk.objects.mode.Inactive && c.distance <= range && containers.includes(c.name.toLowerCase()));

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

    if (unit && (Pather.useTeleport() || !checkCollision(me, unit, sdk.collision.WallOrRanged)) && this.openChest(unit)) {
      Pickit.pickItems();
    }
  }

  return true;
};

/**
 * @param {ObjectUnit} unit 
 * @returns {boolean}
 */
Misc.getWell = function (unit) {
  if (!unit || unit.mode === sdk.objects.mode.Active) return false;

  for (let i = 0; i < 3; i++) {
    if (Skill.useTK(unit) && i < 2) {
      unit.distance > 21 && Pather.moveNearUnit(unit, 20);
      checkCollision(me, unit, sdk.collision.Ranged) && Attack.getIntoPosition(unit, 20, sdk.collision.Ranged);
      Packet.telekinesis(unit);
    } else {
      if (unit.distance < 4 || Pather.moveToUnit(unit, 3, 0)) {
        Misc.click(0, 0, unit);
      }
    }

    if (Misc.poll(() => unit.mode, 1000, 50)) return true;
    Packet.flash(me.gid);
  }

  return false;
};

Misc.useWell = function (range = 15) {
  // I'm in perfect health, don't need this shit
  if (me.hpPercent >= 95 && me.mpPercent >= 95 && me.staminaPercent >= 50
    && [sdk.states.Frozen, sdk.states.Poison, sdk.states.AmplifyDamage, sdk.states.Decrepify].every((states) => !me.getState(states))) {
    return true;
  }

  Pather.canTeleport() && me.hpPercent < 60 && (range = 25);

  let unitList = getUnits(sdk.unittype.Object, "well").filter(function (well) {
    return well.distance < range && well.mode !== sdk.objects.mode.Active;
  });

  while (unitList.length > 0) {
    unitList.sort(Sort.units);
    let unit = unitList.shift();

    if (unit && (Pather.useTeleport() || !checkCollision(me, unit, sdk.collision.WallOrRanged))) {
      this.getWell(unit);
    }
  }

  return true;
};

const shrineMap = new Map();
shrineMap.set(sdk.shrines.Refilling, 0);
shrineMap.set(sdk.shrines.Health, 0);
shrineMap.set(sdk.shrines.Mana, 0);
shrineMap.set(sdk.shrines.HealthExchange, 0);
shrineMap.set(sdk.shrines.ManaExchange, 0);
shrineMap.set(sdk.shrines.Armor, sdk.states.ShrineArmor);
shrineMap.set(sdk.shrines.Combat, sdk.states.ShrineCombat);
shrineMap.set(sdk.shrines.ResistFire, sdk.states.ShrineResFire);
shrineMap.set(sdk.shrines.ResistCold, sdk.states.ShrineResCold);
shrineMap.set(sdk.shrines.ResistLightning, sdk.states.ShrineResLighting);
shrineMap.set(sdk.shrines.ResistPoison, sdk.states.ShrineResPoison);
shrineMap.set(sdk.shrines.Skill, sdk.states.ShrineSkill);
shrineMap.set(sdk.shrines.ManaRecharge, sdk.states.ShrineManaRegen);
shrineMap.set(sdk.shrines.Stamina, sdk.states.ShrineStamina);
shrineMap.set(sdk.shrines.Experience, sdk.states.ShrineExperience);
shrineMap.set(sdk.shrines.Enirhs, 0);
shrineMap.set(sdk.shrines.Portal, 0);
shrineMap.set(sdk.shrines.Gem, 0);
shrineMap.set(sdk.shrines.Fire, 0);
shrineMap.set(sdk.shrines.Monster, 0);
shrineMap.set(sdk.shrines.Exploding, 0);
shrineMap.set(sdk.shrines.Poison, 0);

Misc.scanShrines = function (range, ignore = []) {
  if (!Config.ScanShrines.length) return false;

  !range && (range = Pather.useTeleport() ? 25 : 15);
  !Array.isArray(ignore) && (ignore = [ignore]);

  /** @type {ObjectUnit[]} */
  let shrineList = [];

  const rangeCheck = (shrineType) => {
    switch (true) {
    case shrineType === sdk.shrines.Refilling && (me.hpPercent < 50 || me.mpPercent < 50 || me.staminaPercent < 50):
    case shrineType === sdk.shrines.Mana && me.mpPercent < 50:
    case shrineType === sdk.shrines.ManaRecharge && me.mpPercent < 50 && me.charlvl < 20:
    case [sdk.shrines.Skill, sdk.shrines.Experience].includes(shrineType):
      return 30;
    case [sdk.shrines.Poison, sdk.shrines.Exploding].includes(shrineType):
      return 15;
    }
    return range;
  };

  // add exploding/poision shrines
  if (me.normal) {
    Config.ScanShrines.indexOf(sdk.shrines.Poison) === -1 && Config.ScanShrines.push(sdk.shrines.Poison);
    Config.ScanShrines.indexOf(sdk.shrines.Exploding) === -1 && Config.ScanShrines.push(sdk.shrines.Exploding);
  }

  // Initiate shrine states
  if (!this.shrineStates) {
    this.shrineStates = [];
    let i = 0;
    for (let shrine of Config.ScanShrines) {
      if (shrine > 0) {
        this.shrineStates[i] = shrineMap.get(shrine);
        i++;
      }
    }
  }

  /**
   * @todo - We should build a list of shrines by their preset values when we scan the area
   */

  let shrine = Game.getObject();

  /**
   * Fix for a3/a5 shrines
   */
  if (shrine) {
    let index = -1;
    
    // Build a list of nearby shrines
    do {
      if (shrine.name.toLowerCase().includes("shrine") && shrineMap.has(shrine.objtype)
        && shrine.mode === sdk.objects.mode.Inactive && !ignore.includes(shrine.objtype)
        && getDistance(me.x, me.y, shrine.x, shrine.y) <= rangeCheck(shrine.objtype)) {
        shrineList.push(copyUnit(shrine));
      }
    } while (shrine.getNext());

    if (!shrineList.length) return false;

    // Check if we have a shrine state, store its index if yes
    for (let i = 0; i < this.shrineStates.length; i += 1) {
      if (me.getState(this.shrineStates[i])) {
        index = i;

        break;
      }
    }

    for (let i = 0; i < Config.ScanShrines.length; i += 1) {
      for (let shrine of shrineList) {
        // Get the shrine if we have no active state or to refresh current state or if the shrine has no state
        // Don't override shrine state with a lesser priority shrine
        // todo - check to make sure we can actually get the shrine for ones without states
        // can't grab a health shrine if we are in perfect health, can't grab mana shrine if our mana is maxed
        if (index === -1 || i <= index || this.shrineStates[i] === 0) {
          if (shrine.objtype === Config.ScanShrines[i]
            && (Pather.useTeleport() || !checkCollision(me, shrine, sdk.collision.WallOrRanged))) {
            this.getShrine(shrine);

            // Gem shrine - pick gem
            if (Config.ScanShrines[i] === sdk.shrines.Gem) {
              Pickit.pickItems();
            }
          }
        }
      }
    }
  }

  return true;
};

Misc.presetShrineIds = [2, 81, 83];

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
  let shrineLocs = [];
  let result = false;
  let unit = Game.getPresetObjects(area);

  if (unit) {
    for (let i = 0; i < unit.length; i += 1) {
      if (Misc.presetShrineIds.includes(unit[i].id)) {
        Misc.presetShrineIds.push([unit[i].roomx * 5 + unit[i].x, unit[i].roomy * 5 + unit[i].y]);
      }
    }
  }

  try {
    NodeAction.shrinesToIgnore.push(type);
    
    while (shrineLocs.length > 0) {
      shrineLocs.sort(Sort.points);
      let coords = shrineLocs.shift();

      Pather.moveToEx(coords[0], coords[1], { minDist: Skill.haveTK ? 20 : 5, callback: () => {
        let shrine = Game.getObject("shrine");
        // for now until I write a proper isShrineWanted check, get close enough that nodeaction checks it
        return !!shrine && shrine.x === coords[0] && shrine.y === coords[1] && shrine.distance <= 15;
      } });

      let shrine = Game.getObject("shrine");

      if (shrine) {
        do {
          if (shrine.objtype === type && shrine.mode === sdk.objects.mode.Inactive) {
            (!Skill.haveTK || !use) && Pather.moveTo(shrine.x - 2, shrine.y - 2);

            if (!use || this.getShrine(shrine)) {
              result = true;

              if (type === sdk.shrines.Gem) {
                Pickit.pickItems();
              }
              return true;
            }

            if (use && type >= sdk.shrines.Armor && type <= sdk.shrines.Experience && me.getState(type + 122)) {
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

Misc.getExpShrine = function (shrineLocs = []) {
  if (me.getState(sdk.states.ShrineExperience)) return true;

  for (let get = 0; get < shrineLocs.length; get++) {
    me.overhead("Looking for xp shrine");

    if (shrineLocs[get] === sdk.areas.BloodMoor) {
      Pather.journeyTo(shrineLocs[get]);
    } else {
      Pather.checkWP(shrineLocs[get], true) ? Pather.useWaypoint(shrineLocs[get]) : Pather.getWP(shrineLocs[get]);
    }

    Precast.doPrecast(true);
    Misc.getShrinesInArea(shrineLocs[get], sdk.shrines.Experience, true);

    if (me.getState(sdk.states.ShrineExperience)) {
      break;
    }

    !me.inTown && Town.goToTown();
  }

  return true;
};

/**
 * @param {ItemUnit} item 
 * @returns {boolean}
 */
Misc.unsocketItem = function (item) {
  if (me.classic || !me.getItem(sdk.items.quest.Cube) || !item) return false;
  // Item doesn't have anything socketed
  if (item.getItemsEx().length === 0) return true;

  let hel = me.getItem(sdk.items.runes.Hel, sdk.items.mode.inStorage);
  if (!hel) return false;

  let scroll = Runewords.getScroll();
  let bodyLoc;
  let { classid, quality } = item;
  item.isEquipped && (bodyLoc = item.bodylocation);

  // failed to get scroll or open stash most likely means we're stuck somewhere in town, so it's better to return false
  if (!scroll || !Town.openStash() || !Cubing.emptyCube()) return false;

  try {
    // failed to move any of the items to the cube
    if (!Storage.Cube.MoveTo(item)
      || !Storage.Cube.MoveTo(hel)
      || !Storage.Cube.MoveTo(scroll)) {
      throw new Error("Failed to move items to cube");
    }

    // probably only happens on server crash
    if (!Cubing.openCube()) throw "Failed to open cube";

    myPrint("ÿc4Removing sockets from: ÿc0" + item.fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, ""));
    transmute();
    delay(500);
    // unsocketing an item causes loss of reference, so re-find our item
    item = me.findItem(classid, -1, sdk.storage.Cube);
    !!item && bodyLoc && item.equip(bodyLoc);

    // can't pull the item out = no space = fail
    if (!Cubing.emptyCube()) throw "Failed to empty cube";
  } catch (e) {
    console.debug(e);
  } finally {
    // lost the item, so relocate it
    !item && (item = me.findItem(classid, -1, -1, quality));
    // In case error was thrown before hitting above re-equip statement
    bodyLoc && !item.isEquipped && item.equip(bodyLoc);
    // No bodyloc so move back to stash
    !bodyLoc && !item.isInStash && Storage.Stash.MoveTo(item);
    getUIFlag(sdk.uiflags.Cube) && me.cancel();
  }

  return item.getItemsEx().length === 0;
};

Misc.checkItemsForSocketing = function () {
  if (me.classic || !me.getQuest(sdk.quest.id.SiegeOnHarrogath, sdk.quest.states.ReqComplete)) return false;

  let items = me.getItemsEx()
    .filter(function (item) {
      return item.sockets === 0 && getBaseStat("items", item.classid, "gemsockets") > 0;
    })
    .sort(function (a, b) {
      return NTIP.GetTier(b) - NTIP.GetTier(a);
    });

  for (let i = 0; i < items.length; i++) {
    let curr = Config.socketables.find(({ classid }) => items[i].classid === classid);
    if (curr && curr.condition(items[i]) && curr.useSocketQuest) {
      return items[i];
    }
  }

  return false;
};

Misc.checkItemsForImbueing = function () {
  if (!me.getQuest(sdk.quest.id.ToolsoftheTrade, sdk.quest.states.ReqComplete)) return false;

  let items = me.getItemsEx().filter(item => item.sockets === 0 && (item.normal || item.superior));

  for (let i = 0; i < items.length; i++) {
    if (Config.imbueables.some(item => item.name === items[i].classid && Item.canEquip(items[i]))) {
      return items[i];
    }
  }

  return false;
};

/**
 * @param {ItemUnit} item 
 * @param {ItemUnit[]} runes 
 * @returns {boolean}
 */
Misc.addSocketablesToItem = function (item, runes = []) {
  if (!item || item.sockets === 0) return false;
  let preSockets = item.getItemsEx().length;
  let original = preSockets;
  let bodyLoc;

  if (item.isEquipped) {
    bodyLoc = item.bodylocation;

    if (!Storage.Inventory.CanFit(item)) {
      me.sortInventory();

      if (!Storage.Inventory.CanFit(item) && !Storage.Inventory.MoveTo(item)) {
        console.log("ÿc8AddSocketableToItemÿc0 :: No space to get item back");
        return false;
      }
    } else {
      if (!Storage.Inventory.MoveTo(item)) return false;
    }
  }

  if (!Town.openStash()) return false;

  for (let i = 0; i < runes.length; i++) {
    let rune = runes[i];
    if (!rune.toCursor()) return false;

    for (let i = 0; i < 3; i += 1) {
      sendPacket(1, sdk.packets.send.InsertSocketItem, 4, rune.gid, 4, item.gid);
      let tick = getTickCount();

      while (getTickCount() - tick < 2000) {
        if (!me.itemoncursor) {
          delay(300);

          break;
        }

        delay(10);
      }

      if (item.getItemsEx().length > preSockets) {
        D2Bot.printToConsole("Added socketable: " + rune.fname + " to " + item.fname, sdk.colors.D2Bot.Gold);
        Item.logItem("Added " + rune.name + " to: ", item, null, true);
        preSockets++;
      }
    }
  }

  bodyLoc && Item.equip(item, bodyLoc);

  return item.getItemsEx().length > original;
};

/**
 * @param {ItemUnit} item 
 * @param {{ classid: number, socketWith: number[], temp: number[], useSocketQuest: boolean, condition: Function }} [itemInfo] 
 * @returns {boolean}
 */
Misc.getSocketables = function (item, itemInfo) {
  if (!item) return false;
  itemInfo === undefined && (itemInfo = {});

  let itemtype, gemType, runeType;
  let [multiple, temp] = [[], []];
  let itemSocketInfo = item.getItemsEx();
  let preSockets = itemSocketInfo.length;
  let allowTemp = (itemInfo.hasOwnProperty("temp") && itemInfo.temp.length > 0
    && (preSockets === 0 || preSockets > 0 && itemSocketInfo.some(el => !itemInfo.socketWith.includes(el.classid))));
  let sockets = item.sockets;
  let openSockets = sockets - preSockets;
  let { classid, quality } = item;
  let socketables = me.getItemsEx().filter(item => item.isInsertable);

  if (!socketables || (!allowTemp && openSockets === 0)) return false;

  function highestGemAvailable (gem, checkList = []) {
    if (!gem) return false;

    // filter out all items that aren't the gem type we are looking for
    // then sort the highest classid (better gems first)
    let myItems = me.getItemsEx()
      .filter(item => item.itemType === gem.itemType)
      .sort((a, b) => b.classid - a.classid);

    for (let i = 0; i < myItems.length; i++) {
      if (!checkList.includes(myItems[i])) return true;
    }

    return false;
  }

  if (!itemInfo.hasOwnProperty("socketWith") || (itemInfo.hasOwnProperty("socketWith") && itemInfo.socketWith.length === 0)) {
    itemtype = item.getItemType();
    if (!itemtype) return false;
    gemType = ["Helmet", "Armor"].includes(itemtype)
      ? "Ruby" : itemtype === "Shield"
        ? "Diamond" : itemtype === "Weapon" && !Check.currentBuild().caster
          ? "Skull" : "";

    // Tir rune in normal, Io rune otherwise and Shael's if assassin
    !gemType && (runeType = me.normal ? "Tir" : me.assassin ? "Shael" : "Io");

    // TODO: Use Jewels
    // would need to score them and way to compare to runes/gems by what itemtype we are looking at
    // then keep upgrading until we actually are ready to insert in the item
  }

  for (let i = 0; i < socketables.length; i++) {
    if (itemInfo.hasOwnProperty("socketWith") && itemInfo.socketWith.length > 0) {
      // In case we are trying to use different runes, check if item already has current rune inserted
      // or if its already in the muliple list. If it is, remove that socketables classid from the list of wanted classids
      if (itemInfo.socketWith.length > 1
        && (itemSocketInfo.some(el => el.classid === socketables[i].classid) || multiple.some(el => el.classid === socketables[i].classid))) {
        itemInfo.socketWith.remove(socketables[i].classid);
      }

      if (itemInfo.socketWith.includes(socketables[i].classid) && !multiple.includes(socketables[i])) {
        if (multiple.length < sockets) {
          multiple.push(socketables[i]);
        }
      }

      if (allowTemp && itemInfo.temp.includes(socketables[i].classid) && !temp.includes(socketables[i])) {
        if (temp.length < sockets) {
          temp.push(socketables[i]);
        }
      }
    } else {
      // If itemtype was matched with a gemType
      if (gemType) {
        // current item matches wanted gemType
        if (socketables[i].itemType === sdk.items.type[gemType]) {
          // is the highest gem of that type
          if (highestGemAvailable(socketables[i], multiple)) {
            if (multiple.length < sockets) {
              multiple.push(socketables[i]);
            }
          }
        }
      } else if (runeType) {
        if (socketables[i].classid === sdk.items.runes[runeType] && !multiple.includes(socketables[i])) {
          if (multiple.length < sockets) {
            multiple.push(socketables[i]);
          }
        }
      }
    }

    if (multiple.length === sockets) {
      break;
    }
  }

  if (allowTemp) {
    // we have all our wanted socketables
    if (multiple.length === sockets) {
      // Failed to remove temp socketables
      if (!Misc.unsocketItem(item)) return false;
      // relocate our item as unsocketing it causes loss of reference
      item = me.findItem(classid, -1, -1, quality);
      openSockets = sockets;
    } else {
      if (temp.length > 0) {
        // use temp socketables
        multiple = temp.slice(0);
      } else if (item.getItemsEx().some((el) => itemInfo.temp.includes(el.classid))) {
        return false;
      }
    }
  }
  
  if (multiple.length > 0) {
    multiple.length > openSockets && (multiple.length = openSockets);
    if (openSockets === 0) return false;
    // check to ensure I am a high enough level to use wanted socketables
    for (let i = 0; i < multiple.length; i++) {
      if (me.charlvl < multiple[i].lvlreq) {
        console.log("ÿc8Kolbot-SoloPlayÿc0: Not high enough level for " + multiple[i].fname);
        return false;
      }
    }

    if (Misc.addSocketablesToItem(item, multiple)) {
      delay(250 + me.ping);
    } else {
      console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to add socketable to " + item.fname);
    }

    return item.getItemsEx().length === sockets || item.getItemsEx().length > preSockets;
  }

  return false;
};

Misc.checkSocketables = function () {
  let items = me.getItemsEx()
    .filter(item => item.sockets > 0 && AutoEquip.hasTier(item)
      && (item.quality >= sdk.items.quality.Magic || ((item.normal || item.superior) && item.isEquipped)))
    .sort((a, b) => NTIP.GetTier(b) - NTIP.GetTier(a));

  if (!items) return;

  for (let i = 0; i < items.length; i++) {
    let sockets = items[i].sockets;

    switch (items[i].quality) {
    case sdk.items.quality.Normal:
    case sdk.items.quality.Superior:
    case sdk.items.quality.Magic:
    case sdk.items.quality.Rare:
    case sdk.items.quality.Crafted:
      // no need to check anything else if already socketed
      if (items[i].getItemsEx().length === sockets) {
        continue;
      }
      // Any magic, rare, or crafted item with open sockets
      if (items[i].isEquipped && [sdk.body.Head, sdk.body.Armor, sdk.body.RightArm, sdk.body.LeftArm].includes(items[i].bodylocation)) {
        Misc.getSocketables(items[i]);
      }

      break;
    case sdk.items.quality.Set:
    case sdk.items.quality.Unique:
      {
        let curr = Config.socketables.find(({ classid }) => items[i].classid === classid);

        // item is already socketed and we don't use temp socketables on this item
        if ((!curr || (curr && !curr.temp)) && items[i].getItemsEx().length === sockets) {
          continue;
        }

        if (curr && curr.condition(items[i])) {
          Misc.getSocketables(items[i], curr);
        } else if (items[i].isEquipped) {
          Misc.getSocketables(items[i]);
        }
      }

      break;
    default:
      break;
    }
  }
};

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
      Misc.recursiveSearch((o === null || o === void 0 ? void 0 : o[key]) || {}, (n === null || n === void 0 ? void 0 : n[key]) || {}, changed[key]);
      if (!Object.keys(changed[key]).length) {
        delete changed[key];
      }
    }
  });
  return changed;
};
