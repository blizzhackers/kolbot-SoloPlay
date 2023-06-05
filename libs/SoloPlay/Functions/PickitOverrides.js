/**
*  @filename    PickitOverrides.js
*  @author      theBGuy
*  @credit      sonic, jaenster
*  @desc        Picking related functions
*
*/

includeIfNotIncluded("core/Pickit.js");
includeIfNotIncluded("SoloPlay/Functions/PrototypeOverrides.js");
includeIfNotIncluded("SoloPlay/Functions/NTIPOverrides.js");
includeIfNotIncluded("SoloPlay/Functions/MiscOverrides.js");

Pickit.enabled = true;
Pickit.Result.SOLOWANTS = 8;
Pickit.Result.SOLOSYSTEM = 9;

Pickit.minItemKeepGoldValue = function () {
  const myGold = me.gold;
  const cLvl = me.charlvl;
  switch (true) {
  case myGold < Math.min(Math.floor(500 + (cLvl * 100 * Math.sqrt(cLvl - 1))), 250000):
    return 10;
  case myGold < Math.min(Math.floor(500 + (cLvl * 250 * Math.sqrt(cLvl - 1))), 250000):
    return 50;
  case myGold < Math.min(Math.floor(500 + (cLvl * 500 * Math.sqrt(cLvl - 1))), 250000):
    return 500;
  default:
    return 1000;
  }
};

/**
 * @constant
 * This value never changes throughout the game
 */
Pickit.classicMode = me.classic;

/**
 * @param {ItemUnit} unit 
 */
Pickit.checkItem = function (unit) {
  const rval = NTIP.CheckItem(unit, false, true);
  const resultObj = function (result, line = null) {
    return {
      result: result,
      line: line
    };
  };

  // quick return on essentials - we know they aren't going to be in the other checks
  if (Pickit.essentials.includes(unit.itemType)) return rval;

  if (!Pickit.classicMode) {
    if ([sdk.items.runes.Ral, sdk.items.runes.Ort].includes(unit.classid)
      && Town.repairIngredientCheck(unit)) {
      return resultObj(Pickit.Result.UTILITY);
    }

    /**
     * Need to redo this
     */
    if (CharData.skillData.bow.onSwitch
      && [sdk.items.type.BowQuiver, sdk.items.type.CrossbowQuiver].includes(unit.itemType)
      && rval === Pickit.Result.WANTED) {
      if ([sdk.items.type.Bow, sdk.items.type.AmazonBow].includes(CharData.skillData.bow.bowType)
        && unit.itemType === sdk.items.type.BowQuiver) {
        return resultObj(Pickit.Result.SOLOWANTS, "Switch-Arrows");
      } else if (CharData.skillData.bow.bowType === sdk.items.type.Crossbow
        && unit.itemType === sdk.items.type.CrossbowQuiver) {
        return resultObj(Pickit.Result.SOLOWANTS, "Switch-Bolts");
      }
    }
  }

  if (unit.classid === sdk.items.StaminaPotion
    && (me.charlvl < 18 || me.staminaPercent <= 85 || me.walking)
    && Item.getQuantityOwned(unit, true) < 2) {
    return resultObj(Pickit.Result.WANTED, "LowStamina");
  }

  if (unit.classid === sdk.items.AntidotePotion
    && me.getState(sdk.states.Poison) && Item.getQuantityOwned(unit, true) < 2) {
    return resultObj(Pickit.Result.WANTED, "Poisoned");
  }

  if (unit.classid === sdk.items.ThawingPotion
    && (me.getState(sdk.states.Frozen) || me.getState(sdk.states.FrozenSolid))
    && Item.getQuantityOwned(unit, true) < 2) {
    return resultObj(Pickit.Result.WANTED, "Frozen");
  }

  if (rval.result === Pickit.Result.WANTED) {
    if (unit.isBroken) {
      return resultObj(Pickit.Result.TRASH);
    }
  }

  if (SoloWants.checkItem(unit)) return resultObj(Pickit.Result.SOLOSYSTEM);
  if (CraftingSystem.checkItem(unit)) return resultObj(Pickit.Result.CRAFTING);
  if (Cubing.checkItem(unit)) return resultObj(Pickit.Result.CUBING);
  if (Runewords.checkItem(unit)) return resultObj(Pickit.Result.RUNEWORD);
  if (AutoEquip.hasTier(unit) && !unit.identified) return resultObj(Pickit.Result.UNID);

  if (unit.isCharm/*  && NTIP.GetCharmTier(unit) > 0 && unit.identified */) {
    if (CharmEquip.check(unit)) {
      return resultObj(Pickit.Result.SOLOWANTS, "Autoequip charm Tier: " + NTIP.GetCharmTier(unit));
    }

    return NTIP.CheckItem(unit, NTIP.NoTier, true) || NTIP.CheckItem(unit, NTIP.CheckList, true);
  }

  if ((NTIP.GetMercTier(unit) > 0 || NTIP.GetTier(unit) > 0 || NTIP.GetSecondaryTier(unit) > 0) && unit.identified) {
    if (Item.autoEquipCheck(unit)) {
      return resultObj(Pickit.Result.SOLOWANTS, "Autoequip Tier: " + NTIP.GetTier(unit));
    }

    if (Item.autoEquipCheckMerc(unit)) {
      return resultObj(Pickit.Result.SOLOWANTS, "Autoequip MercTier: " + NTIP.GetMercTier(unit));
    }

    if (Item.autoEquipCheckSecondary(unit)) {
      return resultObj(Pickit.Result.SOLOWANTS, "Autoequip Secondary Tier: " + NTIP.GetSecondaryTier(unit));
    }

    return NTIP.CheckItem(unit, NTIP.NoTier, true) || NTIP.CheckItem(unit, NTIP.CheckList, true);
  }

  if (rval.result === Pickit.Result.WANTED && unit.isBaseType) {
    if (NTIP.CheckItem(unit, NTIP.NoTier)) {
      return resultObj(Pickit.Result.SOLOWANTS, "Base Type Item");
    }
  }

  // LowGold
  if (rval.result === Pickit.Result.UNWANTED && !Town.ignoredItemTypes.includes(unit.itemType) && !unit.questItem
    && (unit.isInInventory || (me.gold < Config.LowGold || me.gold < 500000))) {
    // Gold doesn't take up room, just pick it up
    if (unit.classid === sdk.items.Gold) return resultObj(Pickit.Result.TRASH);

    const itemValue = unit.getItemCost(sdk.items.cost.ToSell);
    const itemValuePerSquare = itemValue / (unit.sizex * unit.sizey);

    if (itemValuePerSquare >= 2000) {
      // If total gold is less than 500k pick up anything worth 2k gold per square to sell in town.
      return resultObj(Pickit.Result.TRASH, "Valuable Item: " + itemValue);
    } else if (itemValuePerSquare >= Pickit.minItemKeepGoldValue()
      && (me.gold < Config.LowGold || unit.isInInventory)) {
      // If total gold is less than LowGold setting pick up anything worth 10 gold per square to sell in town.
      return resultObj(Pickit.Result.TRASH, "LowGold Item: " + itemValue);
    }
  }

  return rval;
};

// @jaenster
Pickit.amountOfPotsNeeded = function () {
  let _a, _b, _c, _d;
  let potTypes = [sdk.items.type.HealingPotion, sdk.items.type.ManaPotion, sdk.items.type.RejuvPotion];
  let hpMax = (Array.isArray(Config.HPBuffer) ? Config.HPBuffer[1] : Config.HPBuffer);
  let mpMax = (Array.isArray(Config.MPBuffer) ? Config.MPBuffer[1] : Config.MPBuffer);
  let rvMax = (Array.isArray(Config.RejuvBuffer) ? Config.RejuvBuffer[1] : Config.RejuvBuffer);
  let needed = (_a = {},
  _a[sdk.items.type.HealingPotion] = (_b = {},
  _b[sdk.storage.Belt] = 0,
  _b[sdk.storage.Inventory] = hpMax,
  _b),
  _a[sdk.items.type.ManaPotion] = (_c = {},
  _c[sdk.storage.Belt] = 0,
  _c[sdk.storage.Inventory] = mpMax,
  _c),
  _a[sdk.items.type.RejuvPotion] = (_d = {},
  _d[sdk.storage.Belt] = 0,
  _d[sdk.storage.Inventory] = rvMax,
  _d),
  _a);
  if (hpMax > 0 || mpMax > 0 || rvMax > 0) {
    me.getItemsEx()
      .filter((pot) => potTypes.includes(pot.itemType) && (pot.isInBelt || pot.isInInventory))
      .forEach(function (pot) {
        needed[pot.itemType][pot.location] -= 1;
      });
  }
  let missing = Storage.Belt.checkColumns(Pickit.beltSize);
  Config.BeltColumn.forEach(function (column, index) {
    if (column === "hp") {needed[sdk.items.type.HealingPotion][sdk.storage.Belt] = missing[index];}
    if (column === "mp") {needed[sdk.items.type.ManaPotion][sdk.storage.Belt] = missing[index];}
    if (column === "rv") {needed[sdk.items.type.RejuvPotion][sdk.storage.Belt] = missing[index];}
  });
  return needed;
};

/**
 * @param {ItemUnit} item 
 * @returns {boolean}
 */
Pickit.canFit = function (item) {
  switch (item.itemType) {
  case sdk.items.type.Gold:
    return true;
  case sdk.items.type.Scroll:
  {
    let tome = me.findItem(item.classid - 11, 0, sdk.storage.Inventory);
    return (tome && tome.getStat(sdk.stats.Quantity) < 20) || Storage.Inventory.CanFit(item);
  }
  case sdk.items.type.HealingPotion:
  case sdk.items.type.ManaPotion:
  case sdk.items.type.RejuvPotion:
    {
      let pots = this.amountOfPotsNeeded();
      if (pots[item.itemType][sdk.storage.Belt] > 0) {
        // this potion can go in belt
        return true;
      }
    }
    return Storage.Inventory.CanFit(item);
  default:
    return Storage.Inventory.CanFit(item);
  }
};

/**
 * @param {ItemUnit} unit 
 * @returns {boolean}
 */
Pickit.canPick = function (unit) {
  if (!unit) return false;
  if (sdk.quest.items.includes(unit.classid) && me.getItem(unit.classid)) return false;
  
  // TODO: clean this up

  let tome, charm, i, potion, needPots, buffers, pottype, myKey, key;

  switch (unit.itemType) {
  case sdk.items.type.Gold:
    // Check current gold vs max capacity (cLvl*10000) and skip if full
    return (me.getStat(sdk.stats.Gold) < me.getStat(sdk.stats.Level) * 10000);
  case sdk.items.type.Scroll:
    // 518 - Tome of Town Portal or 519 - Tome of Identify, mode 0 - inventory/stash
    tome = me.getItem(unit.classid - 11, sdk.items.mode.inStorage);

    if (tome) {
      do {
        if (tome.isInInventory && tome.getStat(sdk.stats.Quantity) === 20) {
          return false; // Skip a scroll if its tome is full
        }
      } while (tome.getNext());
    } else {
      // If we don't have a tome, go ahead and keep 2 scrolls
      return unit.classid === sdk.items.ScrollofIdentify && me.charlvl > 5
        ? false
        : me.getItemsEx(unit.classid).filter(el => el.isInInventory).length < 2;
    }

    break;
  case sdk.items.type.Key:
    // Assassins don't ever need keys
    if (me.assassin) return false;

    myKey = me.getItem(sdk.items.Key, sdk.items.mode.inStorage);
    key = Game.getItem(-1, -1, unit.gid); // Passed argument isn't an actual unit, we need to get it

    if (myKey && key) {
      do {
        if (myKey.isInInventory && myKey.getStat(sdk.stats.Quantity) + key.getStat(sdk.stats.Quantity) > 12) {
          return false;
        }
      } while (myKey.getNext());
    }

    break;
  case sdk.items.type.SmallCharm:
  case sdk.items.type.LargeCharm:
  case sdk.items.type.GrandCharm:
    if (unit.unique) {
      charm = me.getItem(unit.classid, sdk.items.mode.inStorage);

      if (charm) {
        do {
          // Skip Gheed's Fortune, Hellfire Torch or Annihilus if we already have one
          if (charm.unique) return false;
        } while (charm.getNext());
      }
    }

    break;
  case sdk.items.type.HealingPotion:
  case sdk.items.type.ManaPotion:
  case sdk.items.type.RejuvPotion:
    needPots = 0;

    for (i = 0; i < 4; i += 1) {
      if (typeof unit.code === "string" && unit.code.includes(Config.BeltColumn[i])) {
        needPots += this.beltSize;
      }
    }

    potion = me.getItem(-1, sdk.items.mode.inBelt);

    if (potion) {
      do {
        if (potion.itemType === unit.itemType) {
          needPots -= 1;
        }
      } while (potion.getNext());
    }

    // re-do this to pick items to cursor if we don't want them in our belt then place them in invo
    let beltCheck = this.checkBelt();
    if (needPots < 1) {
      buffers = ["HPBuffer", "MPBuffer", "RejuvBuffer"];

      for (i = 0; i < buffers.length; i += 1) {
        if (Config[buffers[i]]) {
          pottype = (function () {
            switch (buffers[i]) {
            case "HPBuffer":
              return sdk.items.type.HealingPotion;
            case "MPBuffer":
              return sdk.items.type.ManaPotion;
            case "RejuvBuffer":
              return sdk.items.type.RejuvPotion;
            default:
              return -1;
            }
          })();

          if (unit.itemType === pottype) {
            if (!Storage.Inventory.CanFit(unit)) return false;

            needPots = Config[buffers[i]];
            potion = me.getItem(-1, sdk.items.mode.inStorage);

            if (potion) {
              do {
                if (potion.itemType === pottype && potion.isInInventory) {
                  needPots -= 1;
                }
              } while (potion.getNext());
            }
          }

          needPots > 0 && !beltCheck && _toCursorPick.add(unit.gid);
        }
      }
    }

    if (needPots < 1) {
      potion = me.getItem();

      if (potion) {
        do {
          if (potion.itemType === unit.itemType && (potion.isInInventory || potion.isInBelt)) {
            if (potion.classid < unit.classid) {
              potion.use();
              needPots += 1;

              break;
            }
          }
        } while (potion.getNext());
      }
    }

    return (needPots > 0) || (me.charlvl < 10 && Storage.Inventory.CanFit(unit));
  case undefined: // Yes, it does happen
    console.warn("undefined item (!?)");

    return false;
  }

  return true;
};

/** @type {Set<number>} */
const _toCursorPick = new Set();

/**
 * @override
 * @param {ItemUnit} unit 
 * @param {PickitResult} status 
 * @param {string} keptLine 
 * @param {boolean} clearBeforePick 
 */
Pickit.pickItem = function (unit, status, keptLine, clearBeforePick = true) {
  /**
   * @constructor
   * @param {ItemUnit} unit 
   */
  function ItemStats (unit) {
    let self = this;
    self.x = unit.x;
    self.y = unit.y;
    self.ilvl = unit.ilvl;
    self.sockets = unit.sockets;
    self.type = unit.itemType;
    self.classid = unit.classid;
    self.name = unit.name;
    self.color = Item.color(unit);
    self.gold = unit.getStat(sdk.stats.Gold);
    self.dist = (unit.distance || Infinity);
    let canTk = (Skill.haveTK && Pickit.tkable.includes(self.type) && !_toCursorPick.has(unit.gid)
      && self.dist > 5 && self.dist < 20 && !checkCollision(me, unit, sdk.collision.WallOrRanged));
    self.useTk = canTk && (me.mpPercent > 50);
    self.picked = false;
  }

  const itemCount = me.itemcount;
  const cancelFlags = [
    sdk.uiflags.Inventory, sdk.uiflags.NPCMenu,
    sdk.uiflags.Waypoint, sdk.uiflags.Shop,
    sdk.uiflags.Stash, sdk.uiflags.Cube
  ];

  if (!unit || unit === undefined) return false;

  let retry = false;
  const gid = unit.gid;
  
  let item = Game.getItem(-1, -1, gid);
  if (!item) return false;

  if (cancelFlags.some(function (flag) { return getUIFlag(flag); })) {
    delay(500);
    me.cancel(0);
  }

  const stats = new ItemStats(item);
  const tkMana = stats.useTk ? Skill.getManaCost(sdk.skills.Telekinesis) * 2 : Infinity;

  MainLoop:
  for (let i = 0; i < 3; i += 1) {
    if (me.dead) return false;
    if (!Game.getItem(-1, -1, gid)) {
      break;
    }

    while (!me.idle) {
      delay(40);
    }

    if (!item.onGroundOrDropping) {
      break;
    }

    let itemDist = item.distance;
    // todo - allow picking near potions/scrolls while attacking distance < 5
    if (stats.useTk && me.mp > tkMana) {
      Packet.telekinesis(item);
    } else {
      let checkItem = false;
      const maxDist = (Config.FastPick || i < 1) ? 8 : 5;
      if (item.distance > maxDist || checkCollision(me, item, sdk.collision.BlockWall)) {
        let coll = (sdk.collision.BlockWall | sdk.collision.Objects | sdk.collision.ClosedDoor);

        if (!clearBeforePick && me.checkForMobs({ range: 5, coll: coll })) {
          continue;
        }

        if (clearBeforePick && item.checkForMobs({ range: 8, coll: coll })) {
          try {
            console.log("ÿc8PickItemÿc0 :: Clearing area around item I want to pick");
            Pickit.enabled = false;		// Don't pick while trying to clear
            Attack.clearPos(item.x, item.y, 10, false);
          } finally {
            Pickit.enabled = true;		// Reset value
          }
        }
        checkItem = true;
      }

      if (checkItem || i > 0) {
        if (copyUnit(item).x === undefined || !item.onGroundOrDropping) {
          break;
        }
        if (!Pather.moveNearUnit({ x: stats.x, y: stats.y }, 5)) continue;
      }

      let cursorUnit;
      itemDist = item.distance;
      // use packet first, if we fail and not using fast pick use click
      _toCursorPick.has(item.gid)
        ? Packet.click(item, true)
          && (cursorUnit = Misc.poll(function () {
            return Game.getCursorUnit();
          }, (itemDist > 10 ? 1000 : 250), 50))
          && Storage.Inventory.MoveTo(cursorUnit)
        : (Config.FastPick || i < 1)
          ? Packet.click(item)
          : Misc.click(0, 0, item);
    }

    let tick = getTickCount();

    while (getTickCount() - tick < (itemDist > 10 ? 2000 : 1000)) {
      item = copyUnit(item);
      _toCursorPick.has(item.gid) && _toCursorPick.delete(item.gid);

      if (stats.classid === sdk.items.Gold) {
        if (!item.getStat(sdk.stats.Gold) || item.getStat(sdk.stats.Gold) < stats.gold) {
          console.log(
            "ÿc7Picked up " + stats.color
            + (item.getStat(sdk.stats.Gold) ? (item.getStat(sdk.stats.Gold) - stats.gold) : stats.gold)
            + " " + stats.name
          );
          return true;
        }
      }

      if (!item.onGroundOrDropping) {
        switch (stats.classid) {
        case sdk.items.Key:
          console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc7(" + Town.checkKeys() + "/12)");

          return true;
        case sdk.items.ScrollofTownPortal:
        case sdk.items.ScrollofIdentify:
          console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc7(" + Town.checkScrolls(stats.classid === sdk.items.ScrollofTownPortal ? "tbk" : "ibk") + "/20)");

          return true;
        case sdk.items.Arrows:
        case sdk.items.Bolts:
          me.needRepair();
          
          break;
        }

        me.itemoncursor && Storage.Inventory.MoveTo(Game.getCursorUnit());

        break MainLoop;
      }

      delay(20);
    }

    // TK failed, disable it
    stats.useTk = false;

    //console.log("pick retry");
  }

  if (retry) return this.pickItem(unit, status, keptLine);

  stats.picked = me.itemcount > itemCount || !!me.getItem(-1, -1, gid);

  if (stats.picked) {
    DataFile.updateStats("lastArea");

    switch (status) {
    case Pickit.Result.WANTED:
    case Pickit.Result.SOLOWANTS:
      console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + (stats.sockets > 0 ? ") (sockets " + stats.sockets : "") + (keptLine ? ") (" + keptLine + ")" : ")"));

      if (this.ignoreLog.indexOf(stats.type) === -1) {
        Item.logger("Kept", item);
        Item.logItem("Kept", item, keptLine);
      }

      if (item.identified && item.isInInventory && AutoEquip.wanted(item)) {
        ((Item.autoEquipCheck(item) && Item.autoEquip("Field")) || (Item.autoEquipCheckSecondary(item) && Item.autoEquipSecondary("Field")));
      }

      break;
    case Pickit.Result.CUBING:
      console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + ")" + " (Cubing)");
      Item.logger("Kept", item, "Cubing " + me.findItems(item.classid).length);
      Cubing.update();

      break;
    case Pickit.Result.RUNEWORD:
      console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + ")" + " (Runewords)");
      Item.logger("Kept", item, "Runewords");
      Runewords.update(stats.classid, gid);

      break;
    case Pickit.Result.CRAFTING:
      console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + ")" + " (Crafting System)");
      CraftingSystem.update(item);

      break;
    case Pickit.Result.SOLOSYSTEM:
      console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + ")" + " (SoloWants System)");
      SoloWants.update(item);

      break;
    default:
      console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + (keptLine ? ") (" + keptLine + ")" : ")"));

      break;
    }
  }

  return true;
};

Pickit.checkSpotForItems = function (spot, checkVsMyDist = false, range = Config.PickRange) {
  if (spot.x === undefined) return false;
  let itemList = [];
  let item = Game.getItem();

  if (item) {
    do {
      if (item.onGroundOrDropping && getDistance(spot, item) <= range) {
        const spotDist = getDistance(spot, item);
        const itemDistFromMe = item.distance;
        if (Pickit.essentials.includes(item.itemType)) {
          if (Pickit.checkItem(item).result && Pickit.canPick(item) && Pickit.canFit(item)) {
            checkVsMyDist && itemDistFromMe < spotDist
              ? Pickit.essentials.push(copyUnit(item))
              : itemList.push(copyUnit(item));
          }
        } else if (item.itemType === sdk.items.type.Key) {
          if (Pickit.canPick(item) && Pickit.checkItem(item).result) {
            checkVsMyDist && itemDistFromMe < spotDist
              ? Pickit.pickList.push(copyUnit(item))
              : itemList.push(copyUnit(item));
          }
        } else if (Pickit.checkItem(item).result) {
          if (checkVsMyDist && itemDistFromMe < spotDist) {
            Pickit.pickList.push(copyUnit(item));
          } else {
            return true;
          }
        }
      }
    } while (item.getNext());
  }

  return itemList.length > 3;
};

Pickit.pickList = [];
Pickit.essentialList = [];

// Might need to do a global list so this function and pickItems see the same items to prevent an item from being in both
Pickit.essessntialsPick = function (clearBeforePick = false, ignoreGold = false, builtList = [], once = false) {
  if (me.dead || me.inTown || (!Pickit.enabled && !clearBeforePick)) return false;

  Pickit.essentialList
    .concat(builtList, Pickit.pickList)
    .filter(function (i) {
      return !!i && Pickit.essentials.includes(i.itemType);
    });
  let item = Game.getItem();
  const maxDist = Skill.haveTK ? 15 : 5;

  if (item) {
    do {
      if (item.onGroundOrDropping && item.distance <= maxDist && Pickit.essentials.includes(item.itemType)) {
        if (Pickit.essentialList.some(el => el.gid === item.gid)) continue;
        if (item.itemType !== sdk.items.type.Gold || item.distance < 5) {
          Pickit.essentialList.push(copyUnit(item));
        }
      }
    } while (item.getNext());
  }

  if (!Pickit.essentialList.length) return true;

  while (!me.idle) {
    delay(40);
  }

  while (Pickit.essentialList.length > 0) {
    if (me.dead || !Pickit.enabled) return false;

    Pickit.essentialList.sort(this.sortItems);
    const currItem = Pickit.essentialList[0];

    // Check if the item unit is still valid and if it's on ground or being dropped
    // Don't pick items behind walls/obstacles when walking
    if (copyUnit(currItem).x !== undefined && currItem.onGroundOrDropping
      && (Pather.useTeleport() || !checkCollision(me, currItem, sdk.collision.BlockWall))) {
      // Check if the item should be picked
      let status = this.checkItem(currItem);

      if (status.result && Pickit.canPick(currItem)) {
        let canFit = (Storage.Inventory.CanFit(currItem) || Pickit.canFit(currItem));

        // Field id when our used space is above a certain percent or if we are full try to make room with FieldID
        // or if we have an exp shrine so we don't waste it
        if ((Config.FieldID.Enabled || me.getState(sdk.states.ShrineExperience))
          && (!canFit || Storage.Inventory.UsedSpacePercent() > Config.FieldID.UsedSpace)) {
          me.fieldID() && (canFit = (currItem.gid !== undefined && Storage.Inventory.CanFit(currItem)));
        }

        // Try to make room by selling items in town
        if (!canFit) {
          // Check if any of the current inventory items can be stashed or need to be identified and eventually sold to make room
          if (this.canMakeRoom()) {
            console.log("ÿc7Trying to make room for " + Item.color(currItem) + currItem.name);

            // Go to town and do town chores
            if (Town.visitTown()) {
              // Recursive check after going to town. We need to remake item list because gids can change.
              // Called only if room can be made so it shouldn't error out or block anything.
              return this.essessntialsPick(clearBeforePick, ignoreGold, builtList, once);
            }

            // Town visit failed - abort
            console.log("ÿc7Unable to make room for " + Item.color(currItem) + currItem.name);

            return false;
          }

          // Can't make room
          Item.logger("No room for", currItem);
          console.log("ÿc7Not enough room for " + Item.color(currItem) + currItem.name);
        }

        // Item can fit - pick it up
        if (canFit) {
          let picked = this.pickItem(currItem, status.result, status.line, clearBeforePick);
          if (picked && once) return true;
        }
      }
    }

    Pickit.essentialList.shift();
  }

  return true;
};

Pickit.pickItems = function (range = Config.PickRange, once = false) {
  if (me.dead || range < 0 || !Pickit.enabled) return false;
  
  let needMule = false;
  const canUseMule = AutoMule.getInfo() && AutoMule.getInfo().hasOwnProperty("muleInfo");
  const _pots = [sdk.items.type.HealingPotion, sdk.items.type.ManaPotion, sdk.items.type.RejuvPotion];

  while (!me.idle) {
    delay(40);
  }

  let item = Game.getItem();

  if (item) {
    do {
      if (Pickit.ignoreList.has(item.gid)) continue;
      if (Pickit.pickList.some(el => el.gid === item.gid)) continue;
      if (item.onGroundOrDropping && item.distance <= range) {
        Pickit.pickList.push(copyUnit(item));
      }
    } while (item.getNext());
  }

  if (Pickit.pickList.some(function (el) {
    return _pots.includes(el.itemType);
  })) {
    me.clearBelt();
    Pickit.beltSize = Storage.BeltSize();
  }

  while (Pickit.pickList.length > 0) {
    if (me.dead || !Pickit.enabled) return false;
    Pickit.pickList.sort(this.sortItems);
    const currItem = Pickit.pickList[0];

    if (Pickit.ignoreList.has(currItem.gid)) {
      Pickit.pickList.shift();
      
      continue;
    }

    // Check if the item unit is still valid and if it's on ground or being dropped
    // Don't pick items behind walls/obstacles when walking
    if (copyUnit(currItem).x !== undefined && currItem.onGroundOrDropping
      && (Pather.useTeleport() || me.inTown || !checkCollision(me, currItem, sdk.collision.BlockWall))) {
      // Check if the item should be picked
      let status = this.checkItem(currItem);

      if (status.result && Pickit.canPick(currItem)) {
        let canFit = (Storage.Inventory.CanFit(currItem) || Pickit.canFit(currItem));

        // Field id when our used space is above a certain percent or if we are full try to make room with FieldID
        if (Config.FieldID.Enabled && (!canFit || Storage.Inventory.UsedSpacePercent() > Config.FieldID.UsedSpace)) {
          me.fieldID() && (canFit = (currItem.gid !== undefined && Storage.Inventory.CanFit(currItem)));
        }

        if (!canFit && !me.checkForMobs({ range: 10 })) {
          me.sortInventory();
          canFit = (Storage.Inventory.CanFit(currItem) || Pickit.canFit(currItem));
        }

        // Try to make room by selling items in town
        if (!canFit) {
          // Check if any of the current inventory items can be stashed or need to be identified and eventually sold to make room
          if (this.canMakeRoom()) {
            console.log("ÿc7Trying to make room for " + Item.color(currItem) + currItem.name);

            /**
             * @todo
             * - Try to sort inventory if it is safe to do so
             * - Check to see if we can clear up enough buffer potions (exlcuding rejuvs) in order to pick the item
             * - If all this fails after visiting town to clear inventory and stash items then globally ignore this item
             * and potentially any other items it's size until our used space changes. Only way we should get to this point
             * is the use of an additonal pickit file without muling setup.
             */

            // Go to town and do town chores
            if (Town.visitTown()) {
              // Recursive check after going to town. We need to remake item list because gids can change.
              // Called only if room can be made so it shouldn't error out or block anything.
              Pickit.ignoreList.clear(); // reset the list of ignored gids
              return this.pickItems(range, once);
            }

            // Town visit failed - abort
            console.warn("Failed to visit town. ÿc7Not enough room for " + Item.color(currItem) + currItem.name);

            return false;
          }

          // Can't make room - trigger automule
          if (copyUnit(currItem).x !== undefined) {
            Item.logger("No room for", currItem);
            console.warn("ÿc7Not enough room for " + Item.color(currItem) + currItem.name);
            // ignore the item now
            Pickit.ignoreList.add(currItem.gid);
            needMule = true;

            break;
          }
        }

        // Item can fit - pick it up
        if (canFit) {
          let picked = this.pickItem(currItem, status.result, status.line);
          if (picked && once) return true;
        }
      }
    }

    Pickit.pickList.shift();
  }

  // Quit current game and transfer the items to mule
  if (needMule && canUseMule && AutoMule.getMuleItems().length > 0) {
    console.log(
      "ÿc7Muling items :: \n"
      + "- ÿc7UsedStashSpacePercentÿc0: " + Storage.Stash.UsedSpacePercent() + "\n"
      + "- ÿc7UsedInventorySpacePercentÿc0: " + Storage.Inventory.UsedSpacePercent()
    );
    scriptBroadcast("mule");
    scriptBroadcast("quit");

    return false;
  }

  return true;
};
