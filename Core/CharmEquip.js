/**
*  @filename    CharmEquip.js
*  @author      theBGuy
*  @desc        AutoEquip for charms
*
*/

const CharmEquip = (function () {
  /**
   * Goals:
   * need to be able to define what types of charms we want while leveling, and upgrade based on that
   * need to be able to define what types of charms we want for final build, upgrade to that
   * need to be able to handle different invoquantity values of final charms vs leveling charms
   * need to be abel to handle final charms and leveling charms being the same type, in situation where we have enough of a final charm so compare it as a noraml leveling charm
   * need to differentiate bewtween cubing charm or pickit wanted charm vs autoequip charm
   * example:
   *   Imagine we are an auradin and we have 9 small charms in our inventory, Seven 5allres/20life and Two random life charms. Our build tells us we should keep 6 of the 5/20s
   *   so we should keep those. That leaves us with One 5/20 and Two random life charms, we should then compare the tier values and keep the highest of the two then sell or drop the third.
   *   As it is now, what happens is we don't compare the 7th 5/20 and we add that to the sell list while keeping the 2 lower charms. If we directly add it to the backup then the invoquantity
   *   gets read from the finalBuild file so instead of only keeping two it says we should keep 6.
   */

  /**
   * @param {ItemUnit} a 
   * @param {ItemUnit} b 
   */
  const sortCharms = function (a, b) {
    return NTIP.GetCharmTier(b) - NTIP.GetCharmTier(a);
  };

  /**
   * Iterate over charm checklist, pickit result 0 and 4 get sold
   * Otherwise if its not in the stash already and not a final charm try and stash it. I don't remember why I checked if it wasn't a final charm
   * @param {ItemUnit[]} checkList 
   * @param {boolean} verbose 
   */
  const spliceCharmCheckList = function (checkList = [], verbose = false) {
    for (let i = 0; i < checkList.length; i++) {
      const currCharm = checkList[i];
      if (!currCharm) continue;
      const pResult = NTIP.CheckItem(currCharm, NTIP.SoloList);
      if (pResult === Pickit.Result.UNWANTED) {
        continue;
      }
      if (!currCharm.isInStash && !me.data.charmGids.includes(currCharm.gid)) {
        if (!Storage.Stash.MoveTo(currCharm)) {
          verbose && Item.logger("Dropped", currCharm);
          currCharm.drop();
        } else {
          if (verbose) {
            Cubing.checkItem(currCharm)
              ? Item.logItem("Stashed Cubing Ingredient", currCharm)
              : Item.logItem("Stashed", currCharm);
          }
        }
      }

      checkList.splice(i, 1);
      i -= 1;
    }
  };

  const spliceCharmKeepList = function (keep = [], sell = [], verbose = false) {
    if (!keep.length) return;
    const id = keep[0].classid;
    const cInfo = (function () {
      return CharData.charms.get(id).count() || { max: 0 };
    })();

    // sort through kept charms
    if (keep.length > cInfo.max) {
      keep.sort(sortCharms);

      // everything after the cap (need a better method for this in the instances where the max cap is less then leveling wanted cap)
      for (let i = cInfo.max; i < keep.length; i++) {
        if (!!keep[i].classid && !CharmEquip.check(keep[i])) {
          sell.push(keep[i]);
          if (verbose) {
            console.log("ÿc8Kolbot-SoloPlayÿc0: CharmEquip Add " + keep[i].fname + " to checkList");
          }
          keep.splice(i, 1);
          i -= 1;
        }
      }
    }
  };

  /**
   * @constructor
   * @param {number} classid 
   */
  function CharmTypeEquip (classid) {
    this.classid = classid;
    this.name = (function () {
      switch (classid) {
      case sdk.items.SmallCharm:
        return "Small";
      case sdk.items.LargeCharm:
        return "Large";
      case sdk.items.GrandCharm:
        return "Grand";
      default:
        return "Unknown";
      }
    })();
    /** @type {boolean} */
    this.debugging = Developer.debugging[this.name.toLowerCase() + "Charm"];
  }

  /**
   * Handle charm autoequip
   * @param {ItemUnit[]} charmList 
   * @returns {{ keep: ItemUnit[], sell: ItemUnit[] }}
   */
  CharmTypeEquip.prototype.autoEquip = function (charmList = []) {
    const _classid = this.classid;
    let items = (charmList.length ? charmList : me.getItemsEx())
      .filter(function (charm) {
        return charm.isInStorage && charm.classid === _classid && charm.magic;
      });

    if (!items.length) {
      this.debugging && console.debug("No charms found for " + this.name + "Charm");
      return { keep: [], sell: [] };
    }

    let charms = CharmEquip.sort(items, this.debugging);
    spliceCharmKeepList(charms.keep, charms.checkList, this.debugging);

    this.debugging && console.log(this.name + " charm checklist length: " + charms.checkList.length);
    spliceCharmCheckList(charms.checkList, this.debugging);

    return { keep: charms.keep, sell: charms.checkList };
  };

  const _smallCharm = new CharmTypeEquip(sdk.items.SmallCharm);
  const _largeCharm = new CharmTypeEquip(sdk.items.LargeCharm);
  const _grandCharm = new CharmTypeEquip(sdk.items.GrandCharm);

  return {
    /** @type {Set<number>} */
    keptGids: new Set(),

    /**
     * @param {ItemUnit} item 
     * @returns {boolean}
     */
    hasCharmTier: function (item) {
      return me.expansion && Config.AutoEquip && NTIP.GetCharmTier(item) > 0;
    },

    /**
     * @param {ItemUnit} item 
     * @returns {boolean}
     */
    isFinalCharm: function (item) {
      return me.data.charmGids.includes(item.gid);
    },

    init: function () {
      // No charms in classic
      if (me.classic) return;
      let myCharms = me.getItemsEx()
        .filter(function (item) {
          return item.isInStorage && item.isCharm && item.magic;
        });
      let changed = false;

      const finalCharmKeys = Object.keys(me.data.charms);
      const check = function (list = [], charms = []) {
        for (let i = 0; i < list.length; i++) {
          if (!charms.some(c => c.gid === list[i])) {
            console.log("A charm was removed from our final list - updated it");
            me.data.charmGids.remove(list[i]);
            list.splice(i, 1);
            i--;
            changed = true;
          }
        }
      };

      for (let key of finalCharmKeys) {
        switch (me.data.charms[key].classid) {
        case sdk.items.SmallCharm:
          check(me.data.charms[key].have, myCharms);

          break;
        case sdk.items.LargeCharm:
          check(me.data.charms[key].have, myCharms);

          break;
        case sdk.items.GrandCharm:
          check(me.data.charms[key].have, myCharms);

          break;
        }
      }

      changed && me.update();
    },

    /**
     * @param {ItemUnit} charm 
     * @returns {string | false}
     */
    getCharmType: function (charm) {
      if (!charm || !charm.isCharm) return false;
      if (charm.unique) return "unique";
      if (!NTIP.hasStats(charm) && NTIP.GetCharmTier(charm) > 0) return "misc";

      let charmType = "";
      const skillerStats = me.getSkillTabs();

      if (charm.getStat(sdk.stats.AddSkillTab, skillerStats[0])) {
        charmType = "skillerTypeA";
      } else if (charm.getStat(sdk.stats.AddSkillTab, skillerStats[1])) {
        charmType = "skillerTypeB";
      } else if (charm.getStat(sdk.stats.AddSkillTab, skillerStats[2])) {
        charmType = "skillerTypeC";
      }

      switch (charm.prefix) {
      case "Shimmering":
      case "Azure":
      case "Lapis":
      case "Cobalt":
      case "Sapphire":
      case "Crimson":
      case "Russet":
      case "Garnet":
      case "Ruby":
      case "Tangerine":
      case "Ocher":
      case "Coral":
      case "Amber":
      case "Beryl":
      case "Viridian":
      case "Jade":
      case "Emerald":
        charmType = "resist";
        break;
      }

      if (!charmType || charmType === "") {
        switch (charm.suffix) {
        case "of Fortune":
        case "of Good Luck":
          charmType = "magicfind";
          break;
        case "of Life":
        case "of Substinence": 	// Odd issue, seems to be misspelled wherever item.suffix pulls info from
        case "of Vita":
          charmType = "life";
          break;
        }
      }

      if (!charmType || charmType === "") {
        switch (charm.prefix) {
        case "Red":
        case "Sanguinary":
        case "Bloody":
        case "Jagged":
        case "Forked":
        case "Serrated":
        case "Bronze":
        case "Iron":
        case "Steel":
        case "Fine":
        case "Sharp":
          charmType = "damage";
          break;
        case "Snowy":
        case "Shivering":
        case "Boreal":
        case "Hibernal":
        case "Ember":
        case "Smoldering":
        case "Smoking":
        case "Flaming":
        case "Static":
        case "Glowing":
        case "Arcing":
        case "Shocking":
        case "Septic":
        case "Foul":
        case "Toxic":
        case "Pestilant":
          charmType = "elemental";
          break;
        }
      }

      if (!charmType || charmType === "") {
        switch (charm.suffix) {
        case "of Craftmanship":
        case "of Quality":
        case "of Maiming":
          charmType = "damage";
          break;
        case "of Strength":
        case "of Dexterity":
          charmType = "stats";
          break;
        case "of Blight":
        case "of Venom":
        case "of Pestilence":
        case "of Anthrax":
        case "of Frost":
        case "of Icicle":
        case "of Glacier":
        case "of Winter":
        case "of Flame":
        case "of Burning":
        case "of Incineration":
        case "of Shock":
        case "of Lightning":
        case "of Thunder":
        case "of Storms":
          charmType = "elemental";
          break;
        }
      }

      if (!charmType || charmType === "") {
        switch (charm.prefix) {
        case "Stout":
        case "Burly":
        case "Stalwart":
          charmType = "misc";
          break;
        case "Rugged":
          charmType = "misc";
          break;
        case "Lizard's":
        case "Snake's":
        case "Serpent's":
          charmType = "mana";
          break;
        }
      }

      if (!charmType || charmType === "") {
        switch (charm.suffix) {
        case "of Balance":
        case "of Greed":
        case "of Inertia":
          charmType = "misc";
          break;
        }
      }

      return charmType;
    },

    /**
     * Handle small charm autoequip
     * @param {ItemUnit[]} charmList 
     * @returns {{ keep: ItemUnit[], sell: ItemUnit[] }}
     */
    smallCharm: function (charmList = []) {
      return _smallCharm.autoEquip(charmList);
    },
    /**
     * Handle large charm autoequip
     * @param {ItemUnit[]} charmList 
     * @returns {{ keep: ItemUnit[], sell: ItemUnit[] }}
     */
    largeCharm: function (charmList = []) {
      return _largeCharm.autoEquip(charmList);
    },
    /**
     * Handle grand charm autoequip
     * @param {ItemUnit[]} charmList 
     * @returns {{ keep: ItemUnit[], sell: ItemUnit[] }}
     */
    grandCharm: function (charmList = []) {
      return _grandCharm.autoEquip(charmList);
    },

    /**
     * @param {ItemUnit[]} items 
     * @param {boolean} verbose 
     * @returns {{ skillerTypeA: ItemUnit[], skillerTypeB: ItemUnit[], skillerTypeC: ItemUnit[], resist: ItemUnit[], life: ItemUnit[], magicfind: ItemUnit[], damage: ItemUnit[], elemental: ItemUnit[], backup: ItemUnit[], keep: ItemUnit[], checkList: ItemUnit[] }}}
     */
    sort: function (items = [], verbose = false) {
      const charms = {
        skillerTypeA: [],
        skillerTypeB: [],
        skillerTypeC: [],
        resist: [],
        life: [],
        magicfind: [],
        damage: [],
        elemental: [],
        backup: [],
        keep: [],
        checkList: []
      };

      if (!items.length) {
        verbose && console.log("No charms found");
        return charms;
      }

      /** @param {ItemUnit} item */
      const addToCheckList = function (item) {
        return charms.checkList.indexOf(item) === -1 && charms.checkList.push(item);
      };
      /** @param {ItemUnit} item */
      const addToBackUp = function (item) {
        return charms.backup.indexOf(item) === -1 && charms.backup.push(item);
      };

      const iterateList = function (arr = [], verbose = false, backUpCheck = true) {
        let invoquantity = NTIP.getInvoQuantity(arr[0]);
        (invoquantity === undefined || invoquantity === -1) && (invoquantity = 2);
        let charmType = CharmEquip.getCharmType(arr[0]);
        verbose && console.log("Amount of " + charmType + " Charms: " + arr.length + " invoquantity: " + invoquantity);
        if (arr.length > 1) {
          arr.sort(sortCharms);
        }

        if (arr.length > invoquantity) {
          if (verbose) {
            arr.forEach(function (el, index) {
              console.log(charmType + "[" + index + "] = " + NTIP.GetCharmTier(el));
            });
          }

          for (let i = invoquantity; i < arr.length; i++) {
            backUpCheck ? addToBackUp(arr[i]) : addToCheckList(arr[i]);

            arr.splice(i, 1);
            i -= 1;
          }
        }
      };

      verbose && console.log("Amount of items: " + items.length);
      items.length > 1 && items.sort(sortCharms);

      const finalCharmInfo = Check.finalBuild().finalCharms;
      const finalCharmKeys = Object.keys(finalCharmInfo);

      let found = false;
    
      while (items.length > 0) {
        let gid = items[0].gid;
        let item = items.shift();

        if (!item.identified) {
          let idTool = me.getIdTool();

          if (idTool) {
            item.isInStash && Town.openStash();
            Town.identifyItem(item, idTool);

          } else if (item.isInStash && (getUIFlag(sdk.uiflags.Stash) || Town.openStash())) {
            Storage.Inventory.MoveTo(item);
            Town.identify();
          }

          if (!Game.getItem(-1, -1, gid)) {
            verbose && console.log("Sold charm during Town.identify()");
            items.shift();

            continue;
          }
        }

        if (me.data.charmGids.includes(item.gid)) {
          charms.keep.push(item);

          continue;
        }

        let next = false;

        for (let key of finalCharmKeys) {
          try {
            if (!!me.data.charms[key] && me.data.charms[key].have.indexOf(item.gid) === -1
            && me.data.charms[key].have.length < me.data.charms[key].max) {
              if (finalCharmInfo[key].stats(item)) {
                console.debug(item.fname);
                me.data.charmGids.push(item.gid);
                me.data.charms[key].have.push(item.gid);
                charms.keep.push(item);
                found = true;
                next = true;
              
                break;
              }
            }
          } catch (e) {
            console.error(e);
          }
        }

        if (next) {
          continue;
        }

        if (NTIP.GetCharmTier(item) <= 0) {
          verbose && console.log("No tier. Adding to checkList: " + item.fname);
          addToCheckList(item);
        } else if (!NTIP.hasStats(item) && NTIP.GetCharmTier(item) > 0) {
          verbose && console.log("Multiple Misc charm: " + item.fname);
          charms.backup.push(item);
        } else {
          let charmType = CharmEquip.getCharmType(item);
          switch (charmType) {
          case "skillerTypeA":
          case "skillerTypeB":
          case "skillerTypeC":
          case "resist":
          case "life":
          case "magicfind":
          case "damage":
          case "elemental":
            charms[charmType].push(item);
            verbose && console.log(charmType + ": " + item.fname);

            break;
          default:
            addToCheckList(item);
            verbose && console.log("Failed all checks. Adding to checkList: " + item.fname);

            break;
          }
        }
      }

      if (found) {
        me.update();
      }

      if (Object.values(charms).every(c => !c.length)) {
        verbose && console.log("No Charms");
        return charms;
      }

      charms.skillerTypeA.length > 0 && iterateList(charms.skillerTypeA, verbose);
      charms.skillerTypeB.length > 0 && iterateList(charms.skillerTypeB, verbose);
      charms.skillerTypeC.length > 0 && iterateList(charms.skillerTypeC, verbose);
      charms.resist.length > 0 && iterateList(charms.resist, verbose);
      charms.life.length > 0 && iterateList(charms.life, verbose);
      charms.magicfind.length > 0 && iterateList(charms.magicfind, verbose);
      charms.damage.length > 0 && iterateList(charms.damage, verbose);
      charms.elemental.length > 0 && iterateList(charms.elemental, verbose);

      // If stats are unspecifed, this will filter charms and keep highest based on invoquantity. If no invoquantity defined it will keep two of that type
      charms.backup.length > 0 && iterateList(charms.backup, verbose, false);
      charms.keep = charms.keep.concat(
        charms.skillerTypeA,
        charms.skillerTypeB,
        charms.skillerTypeC,
        charms.resist,
        charms.life,
        charms.magicfind,
        charms.damage,
        charms.elemental,
        charms.backup
      );
      if (verbose) {
        charms.checkList
          .forEach(function (el, index) {
            console.log("checkList[" + index + "] = " + NTIP.GetCharmTier(el) + " " + el.fname);
          });
      }
    
      return charms;
    },

    /**
     * @param {ItemUnit} item 
     * @returns {boolean}
     */
    check: function (item) {
      if (!item || NTIP.GetCharmTier(item) <= 0 || !item.isCharm) return false;
      // Annhilus, Hellfire Torch, Gheeds - Handled by a different function so return true to keep
      if (item.isCharm && item.unique) return true;
      // is one of our final charms
      if (me.data.charmGids.includes(item.gid)) return true;
      // is in our checkList
      if (CharmEquip.keptGids.has(item.gid)) return true;

      let lowestCharm;
      let items = me.getItemsEx()
        .filter(function (charm) {
          return charm.classid === item.classid
            && charm.isInStorage
            && charm.magic
            && NTIP.GetCharmTier(charm) > 0;
        });
      if (!items.length) return true;

      let quantityCap = NTIP.getInvoQuantity(item);
      let have = 0;
      let charms = CharmEquip.sort(items);
      let charmType = CharmEquip.getCharmType(item);
      let cInfo, newList = [];

      switch (item.classid) {
      case sdk.items.SmallCharm:
        cInfo = CharData.charms.get("small").count();
      
        if (cInfo.curr && (cInfo.curr / cInfo.max) * 100 >= 75) {
        // chop off past our cap
          newList = charms.keep
            .sort(sortCharms)
            .slice(0, cInfo.max);
          // check if it made the cut
          if (!newList.find(i => i.gid === item.gid)) return false;
          lowestCharm = newList.last();
          return !!(NTIP.GetCharmTier(item) >= NTIP.GetCharmTier(lowestCharm) || item.gid === lowestCharm.gid);
        }

        break;
      case sdk.items.LargeCharm:
        cInfo = CharData.charms.get("large").count();
      
        if (cInfo.curr && (cInfo.curr / cInfo.max) * 100 >= 75) {
        // chop off past our cap
          newList = charms.keep
            .sort(sortCharms)
            .slice(0, cInfo.max);
          // check if it made the cut
          if (!newList.find(i => i.gid === item.gid)) return false;
          lowestCharm = newList.last();
          return !!(NTIP.GetCharmTier(item) >= NTIP.GetCharmTier(lowestCharm) || item.gid === lowestCharm.gid);
        }

        break;
      case sdk.items.GrandCharm:
        cInfo = CharData.charms.get("grand").count();
      
        if (cInfo.curr && (cInfo.curr / cInfo.max) * 100 >= 50) {
        // chop off past our cap
          newList = charms.keep
            .sort(sortCharms)
            .slice(0, cInfo.max);
          // check if it made the cut
          if (!newList.find(i => i.gid === item.gid)) return false;
          lowestCharm = newList.last();
          return !!(NTIP.GetCharmTier(item) >= NTIP.GetCharmTier(lowestCharm) || item.gid === lowestCharm.gid);
        }

        break;
      }

      switch (charmType) {
      case "skillerTypeA":
      case "skillerTypeB":
      case "skillerTypeC":
      case "resist":
      case "life":
      case "magicfind":
      case "damage":
      case "elemental":
        have = charms[charmType].length;
        lowestCharm = charms[charmType].last();
        if ((charms[charmType].findIndex(c => c.gid === lowestCharm.gid) + 1) > quantityCap) return false;

        break;
      default:
        have = charms.backup.length;
        lowestCharm = charms.backup.last();
        if ((charms.backup.findIndex(c => c.gid === lowestCharm.gid) + 1) > quantityCap) return false;
        // console.debug("Lowest Charm index " + (charms.backup.findIndex(c => c.gid === lowestCharm.gid)) + " out of " + charms.backup.length);

        break;
      }

      if (!lowestCharm) {
        // console.debug("Didn't find any other charms of this type " + charmType);
        return true;
      }

      if (item.gid === lowestCharm.gid) {
        // console.debug("Same charm");
        return true;
      }

      let [tierParamItem, tierLowestItem] = [NTIP.GetCharmTier(item), NTIP.GetCharmTier(lowestCharm)];

      if (tierParamItem === tierLowestItem) {
        // console.debug("Same tier value");
        // super hacky - arbritrary comparsion of xpos if the tier value is the same
        return (have < quantityCap)
          || (item.isInInventory && lowestCharm.isInInventory && item.x > lowestCharm.y)
          || (item.isInInventory && !lowestCharm.isInInventory);
      }

      return (tierParamItem >= tierLowestItem);
    },

    run: function () {
      // No charms in classic
      if (me.classic) return;

      console.log("ÿc8Kolbot-SoloPlayÿc0: Entering charm auto equip");
      const verbose = (Developer.debugging.smallCharm
        || Developer.debugging.largeCharm
        || Developer.debugging.grandCharm
      );
      let tick = getTickCount();
      let charms = me.getItemsEx()
        .filter(function (item) {
          return item.isInStorage && item.isCharm && item.magic;
        });
      // don't do anything if we don't have any charms
      if ((!charms.length)
        // don't do anything if we have the same charms as last time
        || ((CharmEquip.keptGids.size && charms.every(c => CharmEquip.keptGids.has(c.gid))))) {
        console.log("ÿc8Kolbot-SoloPlayÿc0: Exiting charm auto equip. Time elapsed: " + Time.format(getTickCount() - tick));
        return;
      }
      CharmEquip.keptGids.clear();
      /** @type {Array<ItemUnit>} */
      let totalKeep = [];
      /** @type {Array<ItemUnit>} */
      let totalSell = [];
      let GCs = CharmEquip.grandCharm(charms);
      let LCs = CharmEquip.largeCharm(charms);
      let SCs = CharmEquip.smallCharm(charms);
      let specialCharms = charms.filter((charm) => charm.unique);

      if (verbose) {
        console.log("Grand Charms Keep: " + GCs.keep.length + ", Sell: " + GCs.sell.length);
        console.log("Large Charms Keep: " + LCs.keep.length + ", Sell: " + LCs.sell.length);
        console.log("Small Charms Keep: " + SCs.keep.length + ", Sell: " + SCs.sell.length);
      }
    
      totalKeep = totalKeep.concat(SCs.keep, LCs.keep, GCs.keep, specialCharms);
      for (let i = 0; i < totalKeep.length; i++) {
        if (!CharmEquip.check(totalKeep[i])) {
          totalSell.push(totalKeep[i]);
          totalKeep.splice(i, 1);
          i--;
        }
      }
      totalSell = totalSell
        .concat(SCs.sell, LCs.sell, GCs.sell)
        .filter(function (charm) {
          return NTIP.CheckItem(charm, NTIP.CheckList) === Pickit.Result.UNWANTED;
        });
      totalKeep.length > 0 && console.log("ÿc8Kolbot-SoloPlayÿc0: Total Charms Kept: " + totalKeep.length);

      if (totalSell.length > 0) {
        console.log("ÿc8Kolbot-SoloPlayÿc0: Total Charms Sell: " + totalSell.length);

        for (let i = 0; i < totalSell.length; i++) {
          totalSell[i].isInStash && !getUIFlag(sdk.uiflags.Stash) && Town.openStash();
          if (totalSell[i].isInStash && (!totalSell[i].sellable || !Storage.Inventory.MoveTo(totalSell[i]))) {
            totalSell[i].drop();
            totalSell.splice(i, 1);
            i -= 1;
          }
        }

        Town.initNPC("Shop", "clearInventory");

        if (getUIFlag(sdk.uiflags.Shop)
          || (Config.PacketShopping && getInteractedNPC() && getInteractedNPC().itemcount > 0)) {
          for (let item of totalSell) {
            console.log("ÿc8Kolbot-SoloPlayÿc0: Sell old charm " + item.name);
            verbose && Item.logger("Sold", item);
            verbose && Item.logItem("CharmEquip Sold", item);
            item.sell();
          }
        }
      }

      if (totalKeep.length > 0) {
        for (let item of totalKeep) {
          CharmEquip.keptGids.add(item.gid);
          if (item.isInStash && !Cubing.checkItem(item)) {
            !getUIFlag(sdk.uiflags.Stash) && Town.openStash() && delay(300 + me.ping);
            if (Storage.Inventory.CanFit(item) && Storage.Inventory.MoveTo(item)) {
              verbose && Item.logItem("CharmEquip Equipped", item);
            }
          }
        }
      }

      me.cancelUIFlags();

      console.log("ÿc8Kolbot-SoloPlayÿc0: Exiting charm auto equip. Time elapsed: " + Time.format(getTickCount() - tick));
    },
  };
})();
