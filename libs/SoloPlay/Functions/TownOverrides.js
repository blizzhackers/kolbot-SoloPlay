/**
*  @filename    TownOverrides.js
*  @author      theBGuy
*  @desc        Town related functions
*
*/

/**
 * @todo
 *  - Town things should be broken up as this is kinda cluttered
 *  - Maybe have TownUtilites, TownChecks, and Town?
 *  - some of these functions might be better as part of me. Example Town.getTpTool -> me.getTpTool makes more sense
 */

includeIfNotIncluded("core/Town.js");

const wantedTasks = new Set();

new Overrides.Override(Town, Town.drinkPots, function (orignal, type) {
  const objDrank = orignal(type, false);
  const pots = new Map([
    [sdk.items.StaminaPotion, "stamina"],
    [sdk.items.AntidotePotion, "antidote"],
    [sdk.items.ThawingPotion, "thawing"]
  ]);
  
  try {
    if (objDrank.potName) {
      let objID = objDrank.potName.split(" ")[0].toLowerCase();

      if (objID) {
        // non-english version
        if (!CharData.pots.has(objID)) {
          typeof type === "number"
            ? (objID = pots.get(objID))
            : (objID = type.toLowerCase());
        }

        if (!CharData.pots.get(objID).active() || CharData.pots.get(objID).timeLeft() <= 0) {
          CharData.pots.get(objID).tick = getTickCount();
          CharData.pots.get(objID).duration = objDrank.quantity * 30 * 1000;
        } else {
          CharData.pots.get(objID).duration += (
            objDrank.quantity * 30 * 1000) - (getTickCount() - CharData.pots.get(objID).tick
          );
        }

        console.log("ÿc9DrinkPotsÿc0 :: drank " + objDrank.quantity + " " + objDrank.potName + "s. Timer [" + Time.format(CharData.pots.get(objID).duration) + "]");
      }
    }
  } catch (e) {
    console.error(e);
    return false;
  }

  return true;
}).apply();

// ugly for now but proxy the functions I moved to Me.js in case somewhere the base functions are being used
Town.getItemsForRepair = (repairPercent, chargedItems) => me.getItemsForRepair(repairPercent, chargedItems);
Town.needRepair = () => me.needRepair();
Town.buyPotions = () => NPCAction.buyPotions();
Town.fillTome = (classid, force = false) => NPCAction.fillTome(classid, force);
Town.cainID = (force = false) => NPCAction.cainID(force);
Town.lastShopped = { who: "", tick: 0 };
// todo - allow earlier shopping, mainly to get a belt
Town.shopItems = (force = false) => NPCAction.shopItems(force);
Town.gamble = () => NPCAction.gamble();

Town.sell = [];
// Removed Missle Potions for easy gold
// Items that won't be stashed
Town.ignoredItemTypes = [
  sdk.items.type.BowQuiver, sdk.items.type.CrossbowQuiver, sdk.items.type.Book,
  sdk.items.type.Scroll, sdk.items.type.Key, sdk.items.type.HealingPotion,
  sdk.items.type.ManaPotion, sdk.items.type.RejuvPotion, sdk.items.type.StaminaPotion,
  sdk.items.type.AntidotePotion, sdk.items.type.ThawingPotion
];

/**
 * @description Start a task and return the NPC Unit
 * @param {string} task 
 * @param {string} reason 
 * @returns {boolean | NPCUnit}
 */
Town.initNPC = function (task = "", reason = "undefined") {
  console.info(true, reason, "initNPC");
  task = task.capitalize(false);

  delay(250);

  /** @type {NPCUnit} */
  let npc = null;
  let wantedNpc = Town.tasks.get(me.act)[task] !== undefined
    ? Town.tasks.get(me.act)[task]
    : "undefined";
  const justUseClosest = (
    ["clearinventory", "sell"].includes(reason.toLowerCase())
    && !me.getUnids().length
  );
  
  if (getUIFlag(sdk.uiflags.NPCMenu)) {
    console.debug("Currently interacting with an npc");
    npc = getInteractedNPC();
  }

  try {
    if (npc) {
      let npcName = npc.name.toLowerCase();
      if (!justUseClosest && ((npcName !== wantedNpc)
        // Jamella gamble fix
        || (task === "Gamble" && npcName === NPC.Jamella))) {
        me.cancelUIFlags();
        npc = null;
      }
    } else {
      me.cancelUIFlags();
    }

    /**
     * we are just trying to clear our inventory, use the closest npc
     * Things to conisder:
     * - what if we have unid items? Should we use cain if he is closer than the npc with scrolls?
     * - what is our next task?
     * - would it be faster to change acts and use the closest npc?
     */
    if (justUseClosest) {
      let choices = new Set();
      let npcs = Town.tasks.get(me.act);
      let _needPots = me.needPotions();
      let _needRepair = me.needRepair().length > 0;
      if (_needPots && _needRepair) {
        if (me.act === 2) {
          choices = new Set([npcs.Key, npcs.Repair]);
        } else {
          choices = new Set([npcs.Key, npcs.Repair, npcs.Gamble, npcs.Shop]);
          // todo - handle when we are in normal and current act < 4
          // if we are going to go to a4 for potions anyway we should go ahead and change act
        }
      } else if (!_needPots && _needRepair) {
        choices.add(npcs.Repair);
      } else if (_needPots && !_needRepair) {
        choices.add(npcs.Shop);
        if (me.act === 2) {
          choices.add(npcs.Key);
        }
      } else if (!_needPots && !_needRepair) {
        choices = new Set([npcs.Key, npcs.Repair, npcs.Gamble, npcs.Shop]);
      }
      if (choices.size) {
        console.log("closest npc choices", choices);
        wantedNpc = Array.from(choices.values()).sort(function (a, b) {
          return Town.getDistance(a) - Town.getDistance(b);
        }).first();
        console.debug("Choosing closest npc", wantedNpc);
      }
    }

    if (me.act === 2) {
      if (task === "Heal") {
        // lets see if we are closer to Atma than Fara
        if (Town.getDistance(NPC.Atma) < Town.getDistance(NPC.Fara)) {
          wantedNpc = NPC.Atma;
        }
      } else if (reason === "buyPotions") {
        if (Town.getDistance(NPC.Drognan) > 10) {
          let _needStack = CharData.pots.get("thawing").need() || CharData.pots.get("antidote").need();
          if (_needStack) {
            wantedNpc = NPC.Lysander;
          }
        }
      }
    }

    if (!npc && wantedNpc !== "undefined") {
      npc = Game.getNPC(wantedNpc);

      if (!npc && this.move(wantedNpc)) {
        npc = Game.getNPC(wantedNpc);
      }
    }

    if (!npc || npc.area !== me.area || (!getUIFlag(sdk.uiflags.NPCMenu) && !npc.openMenu())) {
      throw new Error("Couldn't interact with npc");
    }

    delay(40);

    switch (task) {
    case "Shop":
    case "Repair":
    case "Gamble":
      if (!getUIFlag(sdk.uiflags.Shop) && !npc.startTrade(task)) {
        throw new Error("Failed to complete " + reason + " at " + npc.name);
      }
      break;
    case "Key":
      if (!getUIFlag(sdk.uiflags.Shop) && !npc.startTrade(me.act === 3 ? "Repair" : "Shop")) {
        throw new Error("Failed to complete " + reason + " at " + npc.name);
      }
      break;
    case "CainID":
      Misc.useMenu(sdk.menu.IdentifyItems);
      me.cancelUIFlags();

      break;
    case "Heal":
      if (String.isEqual(npc.name, NPC.Atma)) {
        // prevent crash due to atma not being a shoppable npc
        me.cancelUIFlags();
      }
      break;
    }

    console.info(false, "Did " + reason + " at " + npc.name, "initNPC");
  } catch (e) {
    console.error(e);

    if (!!e.message && e.message === "Couldn't interact with npc") {
      // getUnit bug probably, lets see if going to different act helps
      let highestAct = me.highestAct;
      if (highestAct === 1) return false; // can't go to any of the other acts
      let myAct = me.act;
      let potentialActs = [1, 2, 3, 4, 5].filter(a => a <= highestAct && a !== myAct);
      let goTo = potentialActs[rand(0, potentialActs.length - 1)];
      Config.DebugMode.Town && console.debug("Going to Act " + goTo + " to see if it fixes getUnit bug");
      Town.goToTown(goTo);
    }

    return false;
  }

  Misc.poll(function () {
    return me.gameReady;
  }, 2000, 250);

  if (task === "Heal") {
    Config.DebugMode.Town && console.debug("Checking if we are frozen");
    if (me.getState(sdk.states.Frozen)) {
      console.log("We are frozen, lets unfreeze real quick with some thawing pots");
      Town.buyPots(2, sdk.items.ThawingPotion, true, true, npc);
    }
  }

  return npc;
};

/**
 * @description Go to a town healer if we are below certain hp/mp percent or have a status effect
 */
Town.heal = function (force = false) {
  if (!me.needHealing() && !force) return true;
  if (me.act === 3
    && Town.getDistance(Town.tasks.get(me.act).Heal) > 10) {
    // if we need to repair items as well or stack pots we should go ahead and change act
    // unless we are already at our intended npc
    let _needRepair = me.needRepair().length > 0;
    let _needStack = CharData.pots.get("thawing").need() || CharData.pots.get("antidote").need();
    let _needMerc = me.needMerc();
    let _needPotions = me.needPotions();
    if (_needRepair || _needStack || _needMerc || _needPotions) {
      if (!_needPotions || !me.normal || me.accessToAct(4)) {
        // trying to prevent us from going to a1 and ending up buying minor pots in normal
        Town.goToTown(me.highestAct >= 4 ? 4 : 1);
      }
    }
  }
  return !!(this.initNPC("Heal", "heal"));
};

/**
 * Check if any of the systems need this item
 * @param {ItemUnit} item 
 * @returns {boolean}
 */
Town.systemsKeep = function (item) {
  return (AutoEquip.wanted(item)
    || Cubing.keepItem(item)
    || Runewords.keepItem(item)
    || CraftingSystem.keepItem(item)
    || SoloWants.keepItem(item)
  );
};

/**
 * @param {ItemUnit} item 
 * @returns {boolean}
 */
Town.needForceID = function (item) {
  const result = Pickit.checkItem(item);
  return ([Pickit.Result.WANTED, Pickit.Result.CUBING].includes(result.result)
    && !item.identified && AutoEquip.hasTier(item));
};

Town.haveItemsToSell = function () {
  let temp = [];
  while (Town.sell.length) {
    let i = Town.sell.shift();
    if (typeof i === "undefined") continue;
    let realItem = me.getItem(i.classid, -1, i.gid);
    if (realItem && realItem.isInStorage
      && !Town.ignoreType(realItem.itemType)
      && realItem.sellable
      && !Town.systemsKeep(realItem)) {
      temp.push(realItem);
    }
  }
  Town.sell = temp.slice(0);
  
  return Town.sell.length;
};

/**
 * @param {ItemUnit[]} itemList 
 * @returns {boolean}
 */
Town.sellItems = function (itemList = []) {
  !itemList.length && (itemList = Town.sell);
  if (!itemList.length) return true;

  if (this.initNPC("Shop", "sell")) {
    while (itemList.length) {
      let item = itemList.shift();
      if (!item.isInStorage) continue;

      try {
        if (getUIFlag(sdk.uiflags.Shop) || getUIFlag(sdk.uiflags.NPCMenu)) {
          console.log("sell " + item.prettyPrint);
          Item.logger("Sold", item);
          item.sell();
          delay(100);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  return !itemList.length;
};

Town.checkScrolls = function (id, force = false) {
  let tome = me.findItem(id, sdk.items.mode.inStorage, sdk.storage.Inventory);

  if (!tome) {
    switch (id) {
    case sdk.items.TomeofIdentify:
    case "ibk":
      return (Config.FieldID.Enabled || force) ? 0 : 20; // Ignore missing ID tome if we aren't using field ID
    case sdk.items.TomeofTownPortal:
    case "tbk":
      return 0; // Force TP tome check
    }
  }

  return tome.getStat(sdk.stats.Quantity);
};

/**
 * @param {ItemUnit} item 
 * @param {{ result: PickitResult, line: string }} result 
 * @param {string} system 
 * @param {boolean} sell 
 * @returns {void}
 */
Town.itemResult = function (item, result, system = "", sell = false) {
  let timer = 0;
  sell && !getInteractedNPC() && (sell = false);

  switch (result.result) {
  case Pickit.Result.WANTED:
  case Pickit.Result.SOLOWANTS:
    Item.logger("Kept", item);
    Item.logItem("Kept", item, result.line);
    if (system === "Field") {
      (
        (Item.autoEquipCheck(item) && Item.autoEquip("Field"))
        || (Item.autoEquipCheckSecondary(item) && Item.autoEquipSecondary("Field"))
      );
    }

    break;
  case Pickit.Result.UNID:
    // At low level its not worth keeping these items until we can Id them it just takes up too much room
    if (sell && me.charlvl < 10 && item.magic && item.classid !== sdk.items.SmallCharm) {
      Item.logger("Sold", item);
      item.sell();
    }

    break;
  case Pickit.Result.CUBING:
    Item.logger("Kept", item, "Cubing-" + system);
    Cubing.update();

    break;
  case Pickit.Result.RUNEWORD:
    break;
  case Pickit.Result.CRAFTING:
    Item.logger("Kept", item, "CraftSys-" + system);
    CraftingSystem.update(item);

    break;
  case Pickit.Result.SOLOSYSTEM:
    Item.logger("Kept", item, "SoloWants-" + system);
    SoloWants.update(item);

    break;
  default:
    if (!item.sellable || !sell) return;

    switch (true) {
    case (Developer.debugging.smallCharm && item.classid === sdk.items.SmallCharm):
    case (Developer.debugging.largeCharm && item.classid === sdk.items.LargeCharm):
    case (Developer.debugging.grandCharm && item.classid === sdk.items.GrandCharm):
      Item.logItem("Sold", item);

      break;
    default:
      Item.logger("Sold", item);
      
      break;
    }

    item.sell();
    timer = getTickCount() - this.sellTimer; // shop speedup test

    if (timer > 0 && timer < 500) {
      delay(timer);
    }

    break;
  }
};

Town.identify = function () {
  /**
   * @todo use cain we are closer to him than our shop npc
   */
  if (me.gold < 15000 && NPCAction.cainID(true)) return true;
  
  let list = (Storage.Inventory.Compare(Config.Inventory) || [])
    .filter(function (item) {
      return !item.identified;
    });
  if (!list.length) return false;
  
  // Avoid unnecessary NPC visits
  // Only unid items or sellable junk (low level) should trigger a NPC visit
  if (!list.some(function (item) {
    let identified = item.identified;
    if (!identified && AutoEquip.hasTier(item)) return true;
    return ([Pickit.Result.UNID, Pickit.Result.TRASH].includes(Pickit.checkItem(item).result));
  })) {
    return false;
  }

  let tome = me.getTome(sdk.items.TomeofIdentify);
  // if we have a tome might as well use it - this might prevent us from having to run from one npc to another
  if (tome && tome.getStat(sdk.stats.Quantity) > 0
    && Town.getDistance(Town.tasks.get(me.act).Shop) > 5) {
    // not in the field but oh well no need to repeat the code
    if (me.fieldID() && !me.getUnids().length) {
      return true;
    }
  }

  if (me.act === 3
    && Town.getDistance(Town.tasks.get(me.act).Shop) > 10) {
    // if we need to repair items as well or stack pots we should go ahead and change act
    // unless we are already at our intended npc
    let _needRepair = me.needRepair().length > 0;
    let _needStack = CharData.pots.get("thawing").need() || CharData.pots.get("antidote").need();
    let _needMerc = me.needMerc();
    let _needPotions = me.normal && me.accessToAct(4) && me.needPotions();
    if (_needRepair || _needStack || _needMerc || _needPotions) {
      Town.goToTown(me.highestAct >= 4 ? 4 : 1);
    }
  }

  let npc = Town.initNPC("Shop", "identify");
  if (!npc) return false;

  tome && tome.getStat(sdk.stats.Quantity) < list.length && NPCAction.fillTome(sdk.items.TomeofIdentify);

  MainLoop:
  while (list.length > 0) {
    const item = list.shift();

    if (!Town.ignoreType(item.itemType) && item.isInInventory && !item.identified) {
      let result = Pickit.checkItem(item).result;
      // Force ID for unid items matching autoEquip/cubing criteria
      Town.needForceID(item) && (result = -1);

      switch (result) {
      // Items for gold, will sell magics, etc. w/o id, but at low levels
      // magics are often not worth iding.
      case Pickit.Result.TRASH:
        Item.logger("Sold", item);
        item.sell();

        break;
      case Pickit.Result.UNID:
        let idTool = me.getIdTool();

        if (idTool) {
          this.identifyItem(item, idTool);
        } else {
          let scroll = npc.getItem(sdk.items.ScrollofIdentify);

          if (scroll) {
            if (!Storage.Inventory.CanFit(scroll)) {
              let tpTome = me.getTome(sdk.items.TomeofTownPortal);
              !!tpTome && tpTome.sell() && delay(500);
            }

            delay(500);
            Storage.Inventory.CanFit(scroll) && scroll.buy();
          }

          scroll = me.findItem(sdk.items.ScrollofIdentify, sdk.items.mode.inStorage, sdk.storage.Inventory);

          if (!scroll) {
            break MainLoop;
          }

          this.identifyItem(item, scroll);
        }

        result = Pickit.checkItem(item);
        Town.itemResult(item, result, "TownId", true);

        break;
      }
    }
  }

  NPCAction.fillTome(sdk.items.TomeofTownPortal); // Check for TP tome in case it got sold for ID scrolls

  return true;
};

Town.needStash = function () {
  if (Config.StashGold
    && me.getStat(sdk.stats.Gold) >= Config.StashGold
    && me.getStat(sdk.stats.GoldBank) < 25e5) {
    return true;
  }

  return (Storage.Inventory.Compare(Config.Inventory) || [])
    .filter(function (item) {
      return !Town.ignoreType(item.itemType) && (!item.isCharm || !CharmEquip.keptGids.has(item.gid));
    })
    .some(function (item) {
      return Storage.Stash.CanFit(item);
    });
};

/**
 * @param {ItemUnit} item 
 */
Town.canStash = function (item) {
  if (Town.ignoreType(item.itemType)
    || [sdk.items.quest.HoradricStaff, sdk.items.quest.KhalimsWill].includes(item.classid)
    || (item.isCharm && CharmEquip.check(item))) {
    return false;
  }

  !Storage.Stash.CanFit(item) && this.sortStash(true);

  return Storage.Stash.CanFit(item);
};

Town.stash = function (stashGold = true) {
  if (!this.needStash()) return true;
  !getUIFlag(sdk.uiflags.Stash) && me.cancel();

  let items = (Storage.Inventory.Compare(Config.Inventory) || []);

  if (items.length > 0) {
    Storage.Stash.SortItems();

    items.forEach(function (item) {
      if (Town.canStash(item)) {
        const pickResult = Pickit.checkItem(item).result;
        switch (true) {
        case pickResult !== Pickit.Result.UNWANTED && pickResult !== Pickit.Result.TRASH:
        case Town.systemsKeep(item):
        case AutoEquip.wanted(item) && pickResult === Pickit.Result.UNWANTED: // wanted but can't use yet
        case !item.sellable: // quest/essences/keys/ect
          if ([sdk.quest.item.PotofLife, sdk.quest.item.ScrollofResistance].includes(item.classid)) {
            // don't stash item, use it
            let refName = item.prettyPrint;
            if (item.use()) {
              console.log("Used " + refName);
              return;
            }
          }
          Storage.Stash.MoveTo(item) && Item.logger("Stashed", item);

          break;
        }
      }
    });
  }
  

  // Stash gold
  if (stashGold) {
    if (me.getStat(sdk.stats.Gold) >= Config.StashGold
      && me.getStat(sdk.stats.GoldBank) < 25e5
      && this.openStash()) {
      gold(me.getStat(sdk.stats.Gold), 3);
      delay(1000); // allow UI to initialize
      me.cancel();
    }
  }

  return true;
};

Town.sortStash = function (force = false) {
  if (Storage.Stash.UsedSpacePercent() < 50 && !force) return true;
  return Storage.Stash.SortItems();
};

Town.clearInventory = function () {
  console.log("ÿc8Start ÿc0:: ÿc8clearInventory");
  let clearInvoTick = getTickCount();
  
  // If we are at an npc already, open the window otherwise moving potions around fails
  if (getUIFlag(sdk.uiflags.NPCMenu) && !getUIFlag(sdk.uiflags.Shop)) {
    try {
      console.debug("Open npc menu");
      !!getInteractedNPC() && Misc.useMenu(sdk.menu.Trade);
    } catch (e) {
      console.error(e);
      me.cancelUIFlags();
    }
  }
    
  // Remove potions in the wrong slot of our belt
  me.clearBelt();

  // Return potions from inventory to belt
  me.cleanUpInvoPotions();

  // Cleanup remaining potions
  console.debug("clearInventory: start clean-up remaining pots");
  let sellOrDrop = [];
  let potsInInventory = me.getItemsEx()
    .filter(function (p) {
      return p.isInInventory && [
        sdk.items.type.HealingPotion, sdk.items.type.ManaPotion,
        sdk.items.type.RejuvPotion, sdk.items.type.ThawingPotion,
        sdk.items.type.AntidotePotion, sdk.items.type.StaminaPotion
      ].includes(p.itemType);
    });

  if (potsInInventory.length > 0) {
    let [hp, mp, rv, specials] = [[], [], [], []];

    while (potsInInventory.length) {
      (function (p) {
        switch (p.itemType) {
        case sdk.items.type.HealingPotion:
          return (hp.push(p));
        case sdk.items.type.ManaPotion:
          return (mp.push(p));
        case sdk.items.type.RejuvPotion:
          return (rv.push(p));
        case sdk.items.type.ThawingPotion:
        case sdk.items.type.AntidotePotion:
        case sdk.items.type.StaminaPotion:
        default: // shuts d2bs up
          return (specials.push(p));
        }
      })(potsInInventory.shift());
    }

    /**
     * @param {ItemUnit} a 
     * @param {ItemUnit} b 
     * @returns {number}
     */
    let sortPots = function (a, b) {
      return a.classid - b.classid;
    };
    // ensures when clearing invo we don't sell high pots before low pots
    hp.sort(sortPots);
    mp.sort(sortPots);
    rv.sort(sortPots);

    // Cleanup healing potions
    while (hp.length > Config.HPBuffer) {
      sellOrDrop.push(hp.shift());
    }

    // Cleanup mana potions
    while (mp.length > Config.MPBuffer) {
      sellOrDrop.push(mp.shift());
    }

    // Cleanup rejuv potions
    while (rv.length > Config.RejuvBuffer) {
      sellOrDrop.push(rv.shift());
    }

    // Clean up special pots
    while (specials.length) {
      specials.shift().interact();
      delay(200);
    }
  }

  if (Config.FieldID.Enabled && !me.getItem(sdk.items.TomeofIdentify)) {
    let scrolls = me.getItemsEx()
      .filter(function (i) {
        return i.isInInventory && i.classid === sdk.items.ScrollofIdentify;
      });

    while (scrolls.length > 2) {
      sellOrDrop.push(scrolls.shift());
    }
  }

  // Any leftover items from a failed ID (crashed game, disconnect etc.)
  const ignoreTypes = [
    sdk.items.type.Book, sdk.items.type.Key,
    sdk.items.type.HealingPotion, sdk.items.type.ManaPotion, sdk.items.type.RejuvPotion
  ];
  let items = (Storage.Inventory.Compare(Config.Inventory) || [])
    .filter(function (item) {
      if (!item) return false;
      if (item.classid === sdk.items.TomeofIdentify && !Config.FieldID.Enabled) return true;
      if (ignoreTypes.indexOf(item.itemType) === -1 && item.sellable && !Town.systemsKeep(item)) {
        return true;
      }
      return false;
    });

  /** @type {ItemUnit[]} */
  let sell = [];

  /**
   * @param {ItemUnit} item 
   * @returns {boolean}
   */
  const classItemType = function (item) {
    return [
      sdk.items.type.Wand, sdk.items.type.VoodooHeads,
      sdk.items.type.AuricShields, sdk.items.type.PrimalHelm, sdk.items.type.Pelt
    ].includes(item.itemType);
  };

  items.length > 0 && items.forEach(function (item) {
    let result = Pickit.checkItem(item).result;

    if ([Pickit.Result.UNWANTED, Pickit.Result.TRASH].indexOf(result) === -1) {
      if ((item.isBaseType && item.sockets > 0) || (classItemType(item) && item.normal && item.sockets === 0)) {
        if (!Item.betterThanStashed(item) && !Item.betterBaseThanWearing(item, Developer.debugging.baseCheck)) {
          if (NTIP.CheckItem(item, NTIP.CheckList) === Pickit.Result.UNWANTED) {
            result = Pickit.Result.TRASH;
          }
        }
      }
    }

    !item.identified && (result = -1);
    [Pickit.Result.UNWANTED, Pickit.Result.TRASH].includes(result) && sell.push(item);
  });

  sell = (sell.length > 0
    ? sell.concat(sellOrDrop)
    : sellOrDrop.slice(0)
  );
  if (sell.length > 0) {
    if (me.act === 3
      && Town.getDistance(Town.tasks.get(me.act).Shop) > 10) {
      // if we need to repair items as well or stack pots we should go ahead and change act
      // unless we are already at our intended npc
      let _needRepair = me.needRepair().length > 0;
      let _needStack = CharData.pots.get("thawing").need() || CharData.pots.get("antidote").need();
      let _needMerc = me.needMerc();
      let _needPotions = me.needPotions();
      if (_needRepair || _needStack || _needMerc || _needPotions) {
        if (!_needPotions || !me.normal || me.accessToAct(4)) {
          // trying to prevent us from going to a1 and ending up buying minor pots in normal
          Town.goToTown(me.highestAct >= 4 ? 4 : 1);
        }
      }
    }
    if (this.initNPC("Shop", "clearInventory")) {
      sell.forEach(function (item) {
        try {
          if (getUIFlag(sdk.uiflags.Shop) || getUIFlag(sdk.uiflags.NPCMenu)) {
            console.log("clearInventory sell " + item.prettyPrint);
            Item.logger("Sold", item);
            item.sell();
            delay(100);
          }
        } catch (e) {
          console.error(e);
        }
      });
    }
  }

  Town.sell = [];

  console.log("ÿc8Exit clearInventory ÿc0- ÿc7Duration: ÿc0" + Time.format(getTickCount() - clearInvoTick));

  if (wantedTasks.has("gamble") && Town.getDistance(Town.tasks.get(me.act).Gamble) < 10) {
    NPCAction.gamble() && wantedTasks.delete("gamble");
  }

  return true;
};

Town.clearJunk = function () {
  let junkItems = me.getItemsEx()
    .filter(function (i) {
      return i.isInStorage && !Town.ignoreType(i.itemType) && i.sellable && !Town.systemsKeep(i);
    });
  if (!junkItems.length) return false;

  console.log("ÿc8Start ÿc0:: ÿc8clearJunk");
  let clearJunkTick = getTickCount();

  /**
   * @type {ItemUnit[][]}
   */
  let [totalJunk, junkToSell, junkToDrop] = [[], [], []];

  /**
   * @param {string} str 
   * @param {ItemUnit} item 
   * @returns {boolean}
   */
  const getToItem = function (str = "", item = null) {
    if (!getUIFlag(sdk.uiflags.Stash) && item.isInStash && !Town.openStash()) {
      throw new Error("ÿc9" + str + "ÿc0 :: Failed to get " + item.prettyPrint + " from stash");
    }
    if (item.isInCube && !Cubing.emptyCube()) {
      throw new Error("ÿc9" + str + "ÿc0 :: Failed to remove " + item.prettyPrint + " from cube");
    }
    return true;
  };

  while (junkItems.length > 0) {
    const junk = junkItems.shift();
    const pickitResult = Pickit.checkItem(junk).result;

    try {
      if ([Pickit.Result.UNWANTED, Pickit.Result.TRASH].includes(pickitResult)) {
        console.log("ÿc9JunkCheckÿc0 :: Junk: " + junk.prettyPrint + " Pickit Result: " + pickitResult);
        getToItem("JunkCheck", junk) && totalJunk.push(junk);

        continue;
      }

      if (pickitResult !== Pickit.Result.WANTED) {
        if (!junk.identified && !Cubing.keepItem(junk)
          && !CraftingSystem.keepItem(junk) && junk.quality < sdk.items.quality.Set) {
          console.log("ÿc9UnidJunkCheckÿc0 :: Junk: " + junk.prettyPrint + " Junk type: " + junk.itemType + " Pickit Result: " + pickitResult);
          getToItem("UnidJunkCheck", junk) && totalJunk.push(junk);

          continue;
        }
      }

      if (junk.isRuneword && !AutoEquip.wanted(junk)) {
        console.log("ÿc9AutoEquipJunkCheckÿc0 :: Junk: " + junk.prettyPrint + " Junk type: " + junk.itemType + " Pickit Result: " + pickitResult);
        getToItem("AutoEquipJunkCheck", junk) && totalJunk.push(junk);
          
        continue;
      }

      if (junk.isBaseType && [Pickit.Result.CUBING, Pickit.Result.SOLOWANTS].includes(pickitResult)) {
        if (!Item.betterThanStashed(junk)) {
          console.log("ÿc9BetterThanStashedCheckÿc0 :: Base: " + junk.prettyPrint + " Junk type: " + junk.itemType + " Pickit Result: " + pickitResult);
          getToItem("BetterThanStashedCheck", junk) && totalJunk.push(junk);

          continue;
        }

        if (!Item.betterBaseThanWearing(junk, Developer.debugging.baseCheck)) {
          console.log("ÿc9BetterThanWearingCheckÿc0 :: Base: " + junk.prettyPrint + " Junk type: " + junk.itemType + " Pickit Result: " + pickitResult);
          getToItem("BetterThanWearingCheck", junk) && totalJunk.push(junk);

          continue;
        }
      }
    } catch (e) {
      console.warn(e.message ? e.message : e);
    }
  }

  if (totalJunk.length > 0) {
    totalJunk
      .sort(function (a, b) {
        return b.getItemCost(sdk.items.cost.ToSell) - a.getItemCost(sdk.items.cost.ToSell);
      })
      .forEach(function (item) {
        // extra check should ensure no pickit wanted items get sold/dropped
        if (NTIP.CheckItem(item, NTIP.CheckList) === Pickit.Result.WANTED) return;
        if (item.isInInventory || (Storage.Inventory.CanFit(item) && Storage.Inventory.MoveTo(item))) {
          junkToSell.push(item);
        } else {
          junkToDrop.push(item);
        }
      });
    
    myPrint("Junk items to sell: " + junkToSell.length);
    Town.initNPC("Shop", "clearInventory");

    if (getUIFlag(sdk.uiflags.Shop)
      || (Config.PacketShopping && getInteractedNPC() && getInteractedNPC().itemcount > 0)) {
      for (let item of junkToSell) {
        console.log("ÿc9JunkCheckÿc0 :: Sell " + item.prettyPrint);
        Item.logger("Sold", item);
        Developer.debugging.junkCheck && Item.logItem("JunkCheck Sold", item);

        item.sell();
        delay(100);
      }
    }

    me.cancelUIFlags();

    for (let item of junkToDrop) {
      console.log("ÿc9JunkCheckÿc0 :: Drop " + item.prettyPrint);
      Item.logger("Sold", item);
      Developer.debugging.junkCheck && Item.logItem("JunkCheck Sold", item);

      item.drop();
      delay(100);
    }
  }

  console.log("ÿc8Exit clearJunk ÿc0- ÿc7Duration: ÿc0" + Time.format(getTickCount() - clearJunkTick));

  return true;
};

Town.lastChores = 0;

Town.fillTomes = function () {
  NPCAction.fillTome(sdk.items.TomeofTownPortal);
  Config.FieldID.Enabled && NPCAction.fillTome(sdk.items.TomeofIdentify);
  !!me.getItem(sdk.items.TomeofTownPortal) && this.clearScrolls();
};

/**
 * @override
 * @param {boolean} repair 
 * @param {extraTasks} givenTasks 
 * @returns {boolean}
 */
Town.doChores = function (repair = false, givenTasks = {}) {
  const extraTasks = Object.assign({}, {
    thawing: false,
    antidote: false,
    stamina: false,
    fullChores: false,
  }, givenTasks);

  delay(250);

  console.info(true);
  console.time("doChores");
  let _startGold = me.gold;
  console.debug("doChores Inital Gold :: " + _startGold);

  !me.inTown && Town.goToTown();

  // Burst of speed while in town
  if (Skill.canUse(sdk.skills.BurstofSpeed) && !me.getState(sdk.states.BurstofSpeed)) {
    Skill.cast(sdk.skills.BurstofSpeed, sdk.skills.hand.Right);
  }

  const preAct = me.act;

  /**
   * @todo light chores if last chores was < minute? 2 minutes idk yet
   */

  me.switchToPrimary();
  extraTasks.fullChores && Quest.unfinishedQuests();

  // Use cainId if we are low on gold or we are closer to him than the shopNPC
  if (me.getUnids().length) {
    // use our id tome if we have it first
    if (!me.fieldID()) {
      if (me.gold < 5000
        || Town.getDistance(NPC.Cain) < Town.getDistance(Town.tasks.get(me.act).Shop)) {
        NPCAction.cainID(true);
      }
    }
  }

  // maybe a check if need healing first, as we might have just used a potion
  Town.heal();
  Town.identify();
  Town.clearInventory();
  Town.fillTomes();
  NPCAction.buyPotions();
  Town.buyKeys();
  extraTasks.thawing && CharData.pots.get("thawing").need() && Town.buyPots(12, "Thawing", true);
  extraTasks.antidote && CharData.pots.get("antidote").need() && Town.buyPots(12, "Antidote", true);
  extraTasks.stamina && Town.buyPots(12, "Stamina", true);
  NPCAction.shopItems();
  NPCAction.repair(repair);
  NPCAction.reviveMerc();
  NPCAction.gamble();

  // if (me.inArea(sdk.areas.LutGholein) && me.normal && me.gold > 10000) {
  // 	// shop at Elzix - what about others?
  // 	NPCAction.shopAt(NPC.Elzix);
  // }
  Cubing.emptyCube();
  Runewords.makeRunewords();
  Cubing.doCubing();
  Runewords.makeRunewords();
  AutoEquip.run();
  Mercenary.hireMerc();
  Item.autoEquipMerc();
  Town.haveItemsToSell() && Town.sellItems() && me.cancelUIFlags();
  Town.clearJunk();
  Town.stash();

  // check pots again, we might have enough gold now if we didn't before
  me.needPotions() && NPCAction.buyPotions() && me.cancelUIFlags();
  // check repair again, we might have enough gold now if we didn't before
  me.needRepair().length && NPCAction.repair() && me.cancelUIFlags();

  me.sortInventory();
  Quest.characterRespec();

  me.act !== preAct && Town.goToTown(preAct);
  me.cancelUIFlags();
  !me.barbarian && !Precast.checkCTA() && Precast.doPrecast(false);
  
  if (me.expansion) {
    Attack.checkBowOnSwitch();
    Attack.getCurrentChargedSkillIds();
    Pather.checkForTeleCharges();
  }

  delay(300);
  console.debug(
    "doChores Ending Gold :: " + me.gold
    + " ÿc8(ÿc7" + (me.gold - _startGold) + "ÿc8)"
  );
  console.info(false, null, "doChores");
  Town.lastChores = getTickCount();
  wantedTasks.clear();

  return true;
};
