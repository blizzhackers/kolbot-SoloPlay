/**
*  @filename    NPCAction.js
*  @author      theBGuy
*  @desc        NPC related functions
*
*/

// ugly but should handle scope issues if I decide to add this to the core in which case I can come back and remove this
// but won't get immeadiate issues of trying to redefine a const
(function (NPCAction) {
  const PotData = require("../Modules/GameData/PotData");
  /**
   * Easier shopping done at a specific npc
   * @param {string} npcName - NPC.NameOfNPC
   * @returns {boolean}
   */
  NPCAction.shopAt = function (npcName) {
    if (!me.inTown) return false;
    // keep track of where we start from
    const origAct = me.act;
    const npcAct = NPC.getAct(npcName);
    if (!npcAct.length) return false;

    try {
      // check for invaid npcs to shop at
      if ([
        NPC.Kashya, NPC.Warriv,
        NPC.Meshif, NPC.Atma,
        NPC.Greiz, NPC.Tyrael,
        NPC.Qual_Kehk, NPC.Cain
      ].includes(npcName.toLowerCase())) {
        throw new Error(npcName + " is an invalid npc to shop at");
      }

      if (!npcAct.includes(origAct)) {
        Town.goToTown(npcAct[0]);
      }

      Town.move(npcName);
      let npc = Game.getNPC(npcName);

      if (!npc && Town.move(npcName)) {
        npc = Game.getNPC(npcName);
      }

      if (!getUIFlag(sdk.uiflags.Shop) && !npc.startTrade("Shop")) {
        throw new Error("Failed to shop at " + npc.name);
      }

      return Town.shopItems();
    } catch (e) {
      console.error(e);

      return false;
    } finally {
      me.act !== origAct && Town.goToTown(origAct);
    }
  };

  NPCAction.buyPotions = function () {
    if (me.gold < 450 || !me.getItem(sdk.items.TomeofTownPortal)) return false;

    me.clearBelt();
    const buffer = { hp: 0, mp: 0 };
    const beltSize = Storage.BeltSize();
    let [needPots, needBuffer, specialCheck] = [false, true, false];
    let col = Storage.Belt.checkColumns(beltSize);

    const getNeededBuffer = function () {
      [buffer.hp, buffer.mp] = [0, 0];
      me.getItemsEx().filter(function (p) {
        return p.isInInventory
          && [sdk.items.type.HealingPotion, sdk.items.type.ManaPotion].includes(p.itemType);
      }).forEach(function (p) {
        switch (p.itemType) {
        case sdk.items.type.HealingPotion:
          return (buffer.hp++);
        case sdk.items.type.ManaPotion:
          return (buffer.mp++);
        }
        return false;
      });
    };

    // HP/MP Buffer
    (Config.HPBuffer > 0 || Config.MPBuffer > 0) && getNeededBuffer();

    // Check if we need to buy potions based on Config.MinColumn
    if (Config.BeltColumn.some(function (c, i) {
      return ["hp", "mp"].includes(c) && col[i] > (beltSize - Math.min(Config.MinColumn[i], beltSize));
    })) {
      needPots = true;
    }

    // Check if we need any potions for buffers
    if (buffer.mp < Config.MPBuffer || buffer.hp < Config.HPBuffer) {
      if (Config.BeltColumn.some(function (c, i) {
        return col[i] >= beltSize && (!needPots || c === "rv");
      })) {
        specialCheck = true;
      }
    }

    // We have enough potions in inventory
    (buffer.mp >= Config.MPBuffer && buffer.hp >= Config.HPBuffer) && (needBuffer = false);

    // No columns to fill
    if (!needPots && !needBuffer) return true;
    // todo: buy the cheaper potions if we are low on gold or don't need the higher ones i.e have low mana/health pool
    // why buy potion that heals 225 (greater mana) if we only have sub 100 mana
    let [wantedHpPot, wantedMpPot] = [5, 5];
    // only do this if we are low on gold in the first place
    if (me.normal && me.gold < Config.LowGold) {
      const mpPotsEffects = PotData.getMpPots().map(function (el) {
        return el.effect[me.classid];
      });
      const hpPotsEffects = PotData.getHpPots().map(function (el) {
        return el.effect[me.classid];
      });

      wantedHpPot = (hpPotsEffects.findIndex(eff => me.hpmax / 2 < eff) + 1 || hpPotsEffects.length - 1);
      wantedMpPot = (mpPotsEffects.findIndex(eff => me.mpmax / 2 < eff) + 1 || mpPotsEffects.length - 1);
      console.debug("Wanted hpPot: " + wantedHpPot + " Wanted mpPot: " + wantedMpPot);
    }

    if (me.normal) {
      if (me.highestAct >= 4) {
        let pAct = Math.max(wantedHpPot, wantedMpPot);
        pAct >= 4 ? me.act < 4 && Town.goToTown(4) : pAct > me.act && Town.goToTown(pAct);
      }
    } else if (!me.normal && me.act === 3
      && Town.getDistance(Town.tasks.get(me.act).Shop) > 10) {
      // if we need to repair items as well or stack pots we should go ahead and change act
      // unless we are already at our intended npc
      let _needRepair = me.needRepair().length > 0;
      let _needStack = CharData.pots.get("thawing").need() || CharData.pots.get("antidote").need();
      let _needMerc = me.needMerc();
      if (_needRepair || _needStack || _needMerc) {
        Town.goToTown(me.highestAct >= 4 ? 4 : 1);
      }
    }

    console.debug(
      "Buying potions, needPots: " + needPots
      + " needBuffer: " + needBuffer
      + " specialCheck: " + specialCheck
    );
    let npc = Town.initNPC("Shop", "buyPotions");
    if (!npc) return false;

    // special check, sometimes our rejuv slot is empty but we do still need buffer. Check if we can buy something to slot there
    if (specialCheck && Config.BeltColumn.some(function (c, i) {
      return c === "rv" && col[i] >= beltSize;
    })) {
      let pots = [sdk.items.ThawingPotion, sdk.items.AntidotePotion, sdk.items.StaminaPotion];
      Config.BeltColumn.forEach(function (c, i) {
        if (c === "rv" && col[i] >= beltSize && pots.length) {
          let usePot = pots[0];
          let pot = npc.getItem(usePot);
          if (pot) {
            Storage.Inventory.CanFit(pot) && Packet.buyItem(pot, false);
            pot = me.getItemsEx(usePot, sdk.items.mode.inStorage)
              .filter(function (i) {
                return i.isInInventory;
              })
              .first();
            !!pot && Packet.placeInBelt(pot, i);
            pots.shift();
          } else {
            needBuffer = false; // we weren't able to find any pots to buy
          }
        }
      });
    }

    for (let i = 0; i < 4; i += 1) {
      if (col[i] > 0) {
        const useShift = Town.shiftCheck(col, beltSize);
        const wantedPot = Config.BeltColumn[i] === "hp" ? wantedHpPot : wantedMpPot;
        let pot = Town.getPotion(npc, Config.BeltColumn[i], wantedPot);

        if (pot) {
          // console.log("ÿc2column ÿc0" + i + "ÿc2 needs ÿc0" + col[i] + " ÿc2potions");
          // Shift+buy will trigger if there's no empty columns or if only the current column is empty
          if (useShift) {
            pot.buy(true);
          } else {
            for (let j = 0; j < col[i]; j += 1) {
              pot.buy(false);
            }
          }
        }
      }

      col = Storage.Belt.checkColumns(beltSize); // Re-initialize columns (needed because 1 shift-buy can fill multiple columns)
    }

    // re-check
    !needBuffer && (Config.HPBuffer > 0 || Config.MPBuffer > 0) && getNeededBuffer();

    const buyHPBuffers = function () {
      if (needBuffer && buffer.hp < Config.HPBuffer) {
        for (let i = 0; i < Config.HPBuffer - buffer.hp; i += 1) {
          let pot = Town.getPotion(npc, "hp", wantedHpPot);
          !!pot && Storage.Inventory.CanFit(pot) && pot.buy(false);
        }
      }
      return true;
    };
    const buyMPBuffers = function () {
      if (needBuffer && buffer.mp < Config.MPBuffer) {
        for (let i = 0; i < Config.MPBuffer - buffer.mp; i += 1) {
          let pot = Town.getPotion(npc, "mp", wantedMpPot);
          !!pot && Storage.Inventory.CanFit(pot) && pot.buy(false);
        }
      }
      return true;
    };
    // priortize mana pots if caster
    Check.currentBuild().caster
      ? buyMPBuffers() && buyHPBuffers()
      : buyHPBuffers() && buyMPBuffers();

    // keep cold/pois res high with potions
    if (me.gold > 50000 && npc.getItem(sdk.items.ThawingPotion)) {
      CharData.pots.get("thawing").need() && Town.buyPots(12, "thawing", true);
      CharData.pots.get("antidote").need() && Town.buyPots(12, "antidote", true);
    }

    return true;
  };

  /**
   * @param {number} classid 
   * @param {boolean} force 
   * @returns {boolean}
   */
  NPCAction.fillTome = function (classid, force = false) {
    const scrollId = (classid === sdk.items.TomeofTownPortal
      ? sdk.items.ScrollofTownPortal
      : sdk.items.ScrollofIdentify);
    const have = Town.checkScrolls(classid, force);
    let myTome = me.getTome(classid);
    let invoScrolls = 0;

    if (have > 0 && have < 20) {
      // lets see if we have scrolls to cleanup
      invoScrolls = me.cleanUpScrolls(myTome, scrollId);
    }

    if (have + invoScrolls >= (me.charlvl < 12 ? 5 : 13)) return true;
    if (me.gold < 450) return false;

    if (me.act === 3
      && Town.getDistance(Town.tasks.get(me.act).Shop) > 10) {
      // if we need to repair items as well or stack pots we should go ahead and change act
      // unless we are already at our intended npc
      let _needRepair = me.needRepair().length > 0;
      let _needStack = CharData.pots.get("thawing").need() || CharData.pots.get("antidote").need();
      let _needMerc = me.needMerc();
      if (_needRepair || _needStack || _needMerc) {
        if (!me.normal || me.accessToAct(4) || !me.needPotions()) {
          Town.goToTown(me.highestAct >= 4 ? 4 : 1);
        }
      }
    }

    let npc = Town.initNPC("Shop", "fillTome");
    if (!npc) return false;

    delay(500);

    if (!myTome) {
      let tome = npc.getItem(classid);

      try {
        if (tome) {
          Storage.Inventory.CanFit(tome) && tome.buy();
        } else {
          // couldn't buy tome, lets see if we can just buy a single scroll
          if (me.getItem(scrollId)) return true;
          let scroll = npc.getItem(scrollId);
          if (!scroll || !Storage.Inventory.CanFit(scroll)) return false;
          scroll.buy();

          return true;
        }
      } catch (e) {
        console.error(e);

        return false;
      }
    }

    /** @type {ItemUnit} */
    let scroll = npc.getItem(scrollId);
    if (!scroll) return false;
    if (!myTome && !(myTome = me.getTome(classid))) return false;

    // place scrolls in tome if we have any now that we know we have a tome (possibly just bought one)
    me.cleanUpScrolls(myTome, scrollId);

    try {
      if (me.gold < 5000) {
        myTome = me.getTome(classid);

        if (myTome) {
          while (myTome.getStat(sdk.stats.Quantity) < 5 && me.gold > 500) {
            scroll = npc.getItem(scrollId);
            scroll && Packet.buyScroll(scroll, myTome, false);
            delay(50);
          }
        }
      } else {
        scroll.buy(true);

        if (scrollId !== sdk.items.ScrollofIdentify && me.gold > 10000) {
          // we are already in the shop, lets check if we need id scrolls too
          let idTome = me.getTome(sdk.items.TomeofIdentify);
          if (idTome && idTome.getStat(sdk.stats.Quantity) < 20) {
            scroll = npc.getItem(sdk.items.ScrollofIdentify);
            if (scroll) {
              scroll.buy(true);
            }
          }
        }
      }
    } catch (e2) {
      console.error(e2);

      return false;
    }

    return true;
  };

  NPCAction.cainID = function (force = false) {
    if ((!Config.CainID.Enable && !force)
      || !Misc.checkQuest(sdk.quest.id.TheSearchForCain, sdk.quest.states.Completed)) {
      return false;
    }

    let npc = getInteractedNPC();

    // Check if we're already in a shop. It would be pointless to go to Cain if so.
    if (npc && npc.name.toLowerCase() === Town.tasks.get(me.act).Shop) return false;
    // Check if we may use Cain - minimum gold
    if (me.gold < Config.CainID.MinGold && !force) return false;

    me.cancel();

    let unids = me.getUnids();
    if (!unids.length) return true;

    // Check if we may use Cain - number of unid items
    if (unids.length < Config.CainID.MinUnids && !force) return false;

    let cain = Town.initNPC("CainID", "cainID");
    if (!cain) return false;

    me.cancelUIFlags();
    
    while (unids.length) {
      const item = unids.shift();
      const { result, line } = Pickit.checkItem(item);

      switch (result) {
      case Pickit.Result.TRASH:
        Town.sell.push(item);

        break;
      case Pickit.Result.WANTED:
      case Pickit.Result.SOLOWANTS:
        Item.logger("Kept", item);
        Item.logItem("Kept", item, line);

        break;
      case Pickit.Result.CUBING:
        Item.logger("Kept", item, "Cubing-Town");
        Cubing.update();

        break;
      case Pickit.Result.RUNEWORD:
        Item.logger("Kept", item, "Runewords-Town");
        Runewords.update(item.classid, item.gid);

        break;
      case Pickit.Result.CRAFTING:
        Item.logger("Kept", item, "CraftSys-Town");
        CraftingSystem.update(item);

        break;
      case Pickit.Result.SOLOSYSTEM:
        Item.logger("Kept", item, "SoloWants-Town");
        SoloWants.update(item);

        break;
      case Pickit.Result.UNID:
      default:
        break;
      }
    }

    return true;
  };

  // todo - allow earlier shopping, mainly to get a belt
  NPCAction.shopItems = function (force = false) {
    if (!Config.MiniShopBot) return true;
    if (!me.getTome(sdk.items.TomeofTownPortal)) return false;
    
    // todo - better gold scaling
    // let goldLimit = [10000, 20000, 30000][me.diff];
    const startingGold = me.gold;
    let goldLimit = Math.floor(startingGold * 0.60);
    let itemTypes = [];
    let lowLevelShop = false;
    
    if (me.charlvl < 6 && startingGold > 200) {
      Storage.BeltSize() === 1 && itemTypes.push(sdk.items.type.Belt);
      !CharData.skillData.bow.onSwitch && itemTypes.push(sdk.items.type.Bow, sdk.items.type.Crossbow);
      if (!itemTypes.length) return true;
      lowLevelShop = true;
    }

    let npc = getInteractedNPC();
    if (!npc || !npc.itemcount) {
      // for now we only do force shop on low level
      if ((force || lowLevelShop) && itemTypes.length) {
        console.debug("Attempt force shopping");
        Town.initNPC("Repair", "shopItems");
        npc = getInteractedNPC();
        if (!npc || !npc.itemcount) return false;
      } else {
        return false;
      }
    }

    if (getTickCount() - Town.lastShopped.tick < Time.seconds(3)
      && Town.lastShopped.who === npc.name) {
      return false;
    }
    let items = npc.getItemsEx()
      .filter((item) => !Town.ignoreType(item.itemType)
        && (itemTypes.length === 0 || itemTypes.includes(item.itemType))
        && (NTIP.CheckItem(item) !== Pickit.Result.UNWANTED)
        && (startingGold - item.getItemCost(sdk.items.cost.ToBuy) > goldLimit))
      .sort(function (a, b) {
        let priorityA = itemTypes.includes(a.itemType);
        let priorityB = itemTypes.includes(b.itemType);
        if (priorityA && priorityB) return NTIP.GetTier(b) - NTIP.GetTier(a);
        if (priorityA) return 1;
        if (priorityB) return -1;
        return NTIP.GetTier(b) - NTIP.GetTier(a);
      });
    if (!items.length) return false;

    const checkedItems = items.length;

    console.time("shopItems");

    let bought = 0;
    const haveMerc = !!me.getMercEx();
    console.info(true, "ÿc4MiniShopBotÿc0: Scanning " + npc.itemcount + " items.");

    /**
     * @param {ItemUnit} item 
     * @param {string} action 
     * @param {{ result: PickitResult, line: string }} result 
     * @param {number | string} tierInfo 
     */
    const shopReport = function (item, action, result, tierInfo) {
      action === undefined && (action = "");
      tierInfo === undefined && (tierInfo = "");
      console.log("ÿc8Kolbot-SoloPlayÿc0: " + action + (tierInfo ? " " + tierInfo : ""));
      Item.logger(action, item);
      if (Developer.debugging.autoEquip) {
        Item.logItem("Shopped " + action, item, result.line !== undefined ? result.line : "null");
      }
    };

    /**
     * Buy dependancy item if it's needed
     * @param {ItemUnit} item 
     */
    const checkDependancy = function (item) {
      let check = Item.hasDependancy(item);
      if (check) {
        let el = npc.getItem(check);
        !!el && el.buy();
      }
    };

    for (let item of items) {
      const myGold = me.gold;
      const itemCost = item.getItemCost(sdk.items.cost.ToBuy);
      if (myGold < itemCost) continue;
      const { result, line } = Pickit.checkItem(item);

      // no tier'ed items
      if (!lowLevelShop && result === Pickit.Result.SOLOWANTS
        && NTIP.CheckItem(item, NTIP.NoTier, true).result !== Pickit.Result.UNWANTED) {
        try {
          if (Storage.Inventory.CanFit(item) && myGold >= itemCost && (myGold - itemCost > goldLimit)) {
            if (item.isBaseType) {
              if (Item.betterThanStashed(item) && Item.betterBaseThanWearing(item, Developer.debugging.baseCheck)) {
                shopReport(item, "better base", line);
                item.buy() && bought++;
              }
            } else {
              shopReport(item, "NoTier", line);
              item.buy() && bought++;
            }
          }
        } catch (e) {
          console.error(e);
        }
      } else if (result === Pickit.Result.SOLOWANTS && AutoEquip.wanted(item)) {
        // tier'ed items
        try {
          if (Storage.Inventory.CanFit(item) && myGold >= itemCost && (myGold - itemCost > goldLimit)) {
            let [mainTier] = [NTIP.GetTier(item)];

            // we want this to be at least a 5% increase in the tier value
            if (Item.hasTier(item)
              && Item.autoEquipCheck(item)
              && ((Item.getEquippedItem(item.bodyLocation().first()).tier - mainTier) / (mainTier * 100)) > 5) {
              shopReport(item, "AutoEquip", line, (item.prettyPrint + " Tier: " + NTIP.GetTier(item)));
              item.buy() && bought++;
              Item.autoEquip("InShop");
              checkDependancy(item);
            } else if (Item.hasSecondaryTier(item) && Item.autoEquipCheckSecondary(item)) {
              shopReport(item, "AutoEquip Switch Shopped", line, (item.prettyPrint + " SecondaryTier: " + NTIP.GetSecondaryTier(item)));
              item.buy() && bought++;
              Item.autoEquip("InShop");
              checkDependancy(item);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }

      delay(2);
    }

    // merc tier'ed items
    if (haveMerc && !lowLevelShop) {
      items = npc.getItemsEx()
        .filter(function (item) {
          return !Town.ignoreType(item.itemType) && NTIP.GetMercTier(item) > 0;
        })
        .sort(function (a, b) {
          return NTIP.GetMercTier(b) - NTIP.GetMercTier(a);
        })
        .forEach(function (item) {
          const myGold = me.gold;
          const itemCost = item.getItemCost(sdk.items.cost.ToBuy);
          if (myGold < itemCost) return;
          const result = Pickit.checkItem(item);

          if (result.result === Pickit.Result.SOLOWANTS && AutoEquip.wanted(item)) {
            try {
              if (Storage.Inventory.CanFit(item) && myGold >= itemCost && (myGold - itemCost > goldLimit)) {
                if (Item.hasMercTier(item) && Item.autoEquipCheckMerc(item)) {
                  shopReport(item, "AutoEquipMerc", result.line, (item.fname + " Tier: " + NTIP.GetMercTier(item)));
                  item.buy() && bought++;
                }
              }
            } catch (e) {
              console.error(e);
            }
          }

          delay(2);
        });
    }

    Town.lastShopped.tick = getTickCount();
    Town.lastShopped.who = npc.name;

    console.info(false, "Evaluated " + checkedItems + " items. Bought " + bought + " items. Spent " + (startingGold - me.gold) + " gold", "shopItems");

    return true;
  };

  NPCAction.gamble = function () {
    if (!Town.needGamble() || Config.GambleItems.length === 0) return true;

    let list = [];

    if (Town.gambleIds.size === 0) {
      // change text to classid
      for (let item of Config.GambleItems) {
        if (isNaN(item)) {
          if (NTIPAliasClassID.hasOwnProperty(item.replace(/\s+/g, "").toLowerCase())) {
            Town.gambleIds.add(NTIPAliasClassID[item.replace(/\s+/g, "").toLowerCase()]);
          } else {
            Misc.errorReport("ÿc1Invalid gamble entry:ÿc0 " + item);
          }
        } else {
          Town.gambleIds.add(item);
        }
      }
    }

    if (Town.gambleIds.size === 0) return true;

    // avoid Alkor
    if (me.act === 3
      || (Town.getDistance(Town.tasks.get(me.act).Gamble) > 25 && me.gold < Config.GambleGoldStart * 1.5)) {
      // avoid changing towns as its time wasting
      wantedTasks.add("gamble");
      return true;
    }
    // me.act === 3 && Town.goToTown(me.accessToAct(4) ? 4 : 2);

    let npc = Town.initNPC("Gamble", "gamble");
    if (!npc) return false;

    let items = me.findItems(-1, sdk.items.mode.inStorage, sdk.storage.Inventory);

    while (items && items.length > 0) {
      list.push(items.shift().gid);
    }

    while (me.gold >= Config.GambleGoldStop) {
      !getInteractedNPC() && npc.startTrade("Gamble");

      let item = npc.getItem();
      items = [];

      if (item) {
        do {
          Town.gambleIds.has(item.classid) && items.push(copyUnit(item));
        } while (item.getNext());

        for (let item of items) {
          if (!Storage.Inventory.CanFit(item)) return false;

          item.buy(false, true);

          let newItem = Town.getGambledItem(list);

          if (newItem) {
            let result = Pickit.checkItem(newItem);

            switch (result.result) {
            case Pickit.Result.WANTED:
              Item.logger("Gambled", newItem);
              Item.logItem("Gambled", newItem, result.line);
              list.push(newItem.gid);

              break;
            case Pickit.Result.CUBING:
              list.push(newItem.gid);
              Cubing.update();

              break;
            case Pickit.Result.CRAFTING:
              CraftingSystem.update(newItem);

              break;
            default:
              Item.logger("Sold", newItem, "Gambling");
              newItem.sell();

              if (!Config.PacketShopping) {
                delay(500);
              }

              break;
            }
          }
        }
      }

      me.cancel();
    }

    return true;
  };

  NPCAction.repair = function (force = false) {
    if (Town.cubeRepair()) return true;

    let npc;
    let repairAction = me.needRepair();
    force && repairAction.indexOf("repair") === -1 && repairAction.push("repair");
    if (!repairAction || !repairAction.length) return false;

    for (let action of repairAction) {
      switch (action) {
      case "repair":
        me.act === 3 && Town.goToTown(me.accessToAct(4) ? 4 : 2);
        npc = Town.initNPC("Repair", "repair");
        if (!npc) return false;
        me.repair();

        break;
      case "buyQuiver":
        let bowCheck = me.getItemsEx()
          .filter(function (el) {
            return el.isEquipped
              && [sdk.items.type.Bow, sdk.items.type.Crossbow, sdk.items.type.AmazonBow].includes(el.itemType);
          })
          .first();

        if (bowCheck) {
          const quiverType = bowCheck.itemType === sdk.items.type.Crossbow
            ? sdk.items.Bolts : sdk.items.Arrows;
          const onSwitch = bowCheck.isOnSwap;
          try {
            onSwitch && me.switchWeapons(sdk.player.slot.Secondary);
            npc = Town.initNPC("Repair", "buyQuiver");
            if (!npc) return false;

            let myQuiver = me.getItem(quiverType, sdk.items.mode.Equipped);
            !!myQuiver && myQuiver.sell();

            let quiver = npc.getItem(quiverType);
            !!quiver && quiver.buy();
          } finally {
            onSwitch && me.switchWeapons(sdk.player.slot.Main);
          }
        }

        break;
      }
    }

    NPCAction.shopItems();

    return true;
  };

  NPCAction.reviveMerc = function () {
    if (!me.needMerc()) return true;
    let preArea = me.area;

    // avoid Aheara
    me.act === 3 && Town.goToTown(me.accessToAct(4) ? 4 : 2);

    let npc = Town.initNPC("Merc", "reviveMerc");
    if (!npc) return false;

    MainLoop:
    for (let i = 0; i < 3; i += 1) {
      let dialog = getDialogLines();
      if (!dialog) continue;

      for (let lines = 0; lines < dialog.length; lines += 1) {
        if (dialog[lines].text.match(":", "gi")) {
          dialog[lines].handler();
          delay(Math.max(750, me.ping * 2));
        }

        // "You do not have enough gold for that."
        if (dialog[lines].text.match(getLocaleString(sdk.locale.dialog.youDoNotHaveEnoughGoldForThat), "gi")) {
          dialog.find(line => !line.text.match(getLocaleString(sdk.locale.dialog.youDoNotHaveEnoughGoldForThat), "gi")).handler();
          delay(Math.max(750, me.ping * 2));
          me.cancelUIFlags();
          console.error("Could not revive merc: My current gold: " + me.gold + ", current mercrevivecost: " + me.mercrevivecost);
          return false;
        }
      }

      let merc = null;
      let tick = getTickCount();

      while (getTickCount() - tick < 2000) {
        if ((merc = me.getMercEx())) {
          delay(Math.max(750, me.ping * 2));
          // check stats and update if necessary
          let _temp = copyObj(me.data.merc);
          let mercInfo = Mercenary.getMercInfo(merc);
          if (mercInfo.classid !== me.data.merc.classid) {
            me.data.merc.classid = mercInfo.classid;
          }
          if (mercInfo.act !== me.data.merc.act) {
            me.data.merc.act = mercInfo.act;
          }
          if (mercInfo.difficulty !== me.data.merc.difficulty) {
            me.data.merc.difficulty = mercInfo.difficulty;
          }
          if (merc.charlvl !== me.data.merc.level) {
            me.data.merc.level = merc.charlvl;
          }
          if (merc.rawStrength !== me.data.merc.strength) {
            me.data.merc.strength = merc.rawStrength;
          }
          if (merc.rawDexterity !== me.data.merc.dexterity) {
            me.data.merc.dexterity = merc.rawDexterity;
          }

          if (merc.classid !== sdk.mercs.Guard) {
            try {
              if (mercInfo.skillName !== me.data.merc.skillName) {
                me.data.merc.skillName = mercInfo.skillName;
                me.data.merc.skill = MercData.findByName(me.data.merc.skillName, me.data.merc.act).skill;
              }
            } catch (e) {
              //
            }
          }
          let changed = Misc.recursiveSearch(me.data.merc, _temp);
  
          if (Object.keys(changed).length > 0) {
            CharData.updateData("merc", me.data.merc);
          }
          me.cancel();

          break MainLoop;
        }

        delay(200);
      }
    }

    Attack.checkInfinity();

    if (me.getMercEx()) {
      // Cast BO on merc so he doesn't just die again. Only do this is you are a barb or actually have a cta. Otherwise its just a waste of time.
      if (Config.MercWatch && Precast.needOutOfTownCast()) {
        console.log("MercWatch precast");
        Precast.doRandomPrecast(true, preArea);
      }

      return true;
    }

    return false;
  };

})(global.NPCAction = global.NPCAction || {});
