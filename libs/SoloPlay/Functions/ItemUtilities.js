/**
*  @filename    ItemUtilities.js
*  @author      theBGuy
*  @desc        Item utility functions
*
*/

includeIfNotIncluded("core/Item.js");
(function () {
  /**
   * @param {ItemUnit} item 
   * @param {Build} buildInfo 
   * @returns {number}
   * @todo clean this up (sigh) - 8/10/22 - update refactored alot, still think more can be done though
   */
  const baseSkillsScore = function (item, buildInfo) {
    buildInfo === undefined && (buildInfo = Check.currentBuild());
    let generalScore = 0;
    let selectedWeights = [30, 20];
    let selectedSkills = [buildInfo.wantedSkills, buildInfo.usefulSkills];
    generalScore += item.getStatEx(sdk.stats.AddClassSkills, me.classid) * 200; // + class skills
    generalScore += item.getStatEx(sdk.stats.AddSkillTab, buildInfo.tabSkills) * 100; // + TAB skills - todo handle array of tab skills

    for (let i = 0; i < selectedWeights.length; i++) {
      for (let j = 0; j < selectedSkills.length; j++) {
        for (let k = 0; k < selectedSkills[j].length; k++) {
          generalScore += item.getStatEx(107, selectedSkills[j][k]) * selectedWeights[i];
        }
      }
    }
    return generalScore;
  };

  /**
   * @param {ItemUnit} base 
   * @param {boolean} verbose 
   * @returns {boolean} 
   */
  Item.betterBaseThanWearing = function (base, verbose = Developer.debugging.baseCheck) {
    if (!base || !base.isBaseType) return false;

    let name = "";
    let itemsResists, baseResists, itemsTotalDmg, baseDmg, itemsDefense, baseDefense;
    let baseSkillsTier, equippedSkillsTier;
    let result = false, preSocketCheck = false;
    let bodyLoc = Item.getBodyLoc(base);

    /** @param {ItemUnit} item */
    const checkNoSockets = function (item) {
      return item.normal && [
        sdk.locale.items.AncientsPledge,
        sdk.locale.items.Exile,
        sdk.locale.items.Lore,
        sdk.locale.items.White,
        sdk.locale.items.Rhyme
      ].includes(item.prefixnum) || (item.prefixnum === sdk.locale.items.Spirit && item.getItemType() === "Shield");
    };
    /** @param {ItemUnit} item */
    const getRes = function (item) {
      return (
        item.getStatEx(sdk.stats.FireResist) + item.getStatEx(sdk.stats.LightResist)
        + item.getStatEx(sdk.stats.ColdResist) + item.getStatEx(sdk.stats.PoisonResist)
      );
    };
    /** @param {ItemUnit} item */
    const getDmg = function (item) {
      return item.getStatEx(sdk.stats.MinDamage) + item.getStatEx(sdk.stats.MaxDamage);
    };
    /** @param {ItemUnit} item */
    const getRealDmg = function (item, maxED = 0, minOffset = 0, maxOffset = 0) {
      let ED = item.getStatEx(sdk.stats.EnhancedDamage);
      ED > maxED && (ED = maxED);
      let itemsMinDmg = Math.ceil(((item.getStatEx(sdk.stats.MinDamage) - minOffset) / ((ED + 100) / 100)));
      let itemsMaxDmg = Math.ceil(((item.getStatEx(sdk.stats.MaxDamage) - maxOffset) / ((ED + 100) / 100)));
      return (itemsMinDmg + itemsMaxDmg);
    };
    /** @param {ItemUnit} item */
    const getDef = function (item) {
      return item.getStatEx(sdk.stats.Defense);
    };
    /** @param {ItemUnit} item */
    const getRealDef = function (item, maxEDef) {
      let ED = item.getStatEx(sdk.stats.ArmorPercent);
      ED > maxEDef && (ED = maxEDef);
      return (Math.ceil((item.getStatEx(sdk.stats.Defense) / ((ED + 100) / 100))));
    };
    const resCheck = function (baseResists, itemsResists) {
      if (verbose) {
        console.log("ÿc9BetterThanWearingCheckÿc0 :: RW(" + name + ") BaseResists: " + baseResists + " EquippedItem: " + itemsResists);
      }
      return (baseResists > itemsResists);
    };
    const defCheck = function (itemsDefense, baseDefense) {
      if (verbose) {
        console.log("ÿc9BetterThanWearingCheckÿc0 :: RW(" + name + ") BaseDefense: " + baseDefense + " EquippedItem: " + itemsDefense);
      }
      return (baseDefense > itemsDefense);
    };
    const dmgCheck = function (itemsTotalDmg, baseDmg) {
      if (verbose) {
        console.log("ÿc9BetterThanWearingCheckÿc0 :: RW(" + name + ") BaseDamage: " + baseDmg + " EquippedItem: " + itemsTotalDmg);
      }
      return (baseDmg > itemsTotalDmg);
    };

    // @todo - betterThanMercUsing check for now just keep merc items
    if ([sdk.items.type.Polearm, sdk.items.type.Spear].includes(base.itemType)
      || ([sdk.items.type.Armor].includes(base.itemType) && base.ethereal)) {
      let merc = me.getMercEx();
      if (merc) {
        bodyLoc = Item.getBodyLocMerc(base);
        let eqItem = merc.getItemsEx().filter(i => i.isEquipped && bodyLoc.includes(i.bodylocation));
        if (!eqItem || !eqItem.runeword || NTIP.GetMercTier(eqItem) >= NTIP.MAX_TIER) return true;
        name = getLocaleString(eqItem.prefixnum);
        // todo logic checking before this to ensure we aren't keeping extra merc stuff
        if (base.sockets === 0) return true;
        switch (equippedItem.prefixnum) {
        case sdk.locale.items.Insight:
          [itemsTotalDmg, baseDmg] = [getRealDmg(equippedItem, 260), getDmg(base)];
          if (baseDmg !== itemsTotalDmg && dmgCheck(itemsTotalDmg, baseDmg)) return true;

          break;
        case sdk.locale.items.Infinity:
          [itemsTotalDmg, baseDmg] = [getRealDmg(equippedItem, 325), getDmg(base)];
          if (baseDmg !== itemsTotalDmg && dmgCheck(itemsTotalDmg, baseDmg)) return true;

          break;
        case sdk.locale.items.Treachery:
          [itemsDefense, baseDefense] = [getRealDef(equippedItem), getDef(base)];
          if (baseDefense !== itemsDefense && defCheck(itemsDefense, baseDefense)) return true;

          break;
        default:
          return true;
        }
        return false;
      }
    }
    // Can't use so its worse then what we already have
    if ((Check.finalBuild().maxStr < base.strreq || Check.finalBuild().maxDex < base.dexreq)) {
      console.log("ÿc9BetterThanWearingCheckÿc0 :: " + base.name + " has to high stat requirments strReq: " + base.strreq + " dexReq " + base.dexreq);
      return false;
    }
    // don't toss pb base crescent moon/HoJ/Grief
    if (base.classid === sdk.items.PhaseBlade && [3, 4, 5].includes(base.sockets)) return true;

    let items = me.getItemsEx()
      .filter(function (i) {
        return i.isEquipped && bodyLoc.includes(i.bodylocation);
      });

    for (let i = 0; i < bodyLoc.length; i++) {
      let equippedItem = items.find(item => item.bodylocation === bodyLoc[i]);
      if (!equippedItem || !equippedItem.runeword /* || NTIP.GetTier(equippedItem) >= NTIP.MAX_TIER */) {
        if (i === 0 && bodyLoc.length > 1) continue;
        return true;
      }
      name = getLocaleString(equippedItem.prefixnum);

      preSocketCheck = checkNoSockets(equippedItem);
      if (base.sockets === 0 && !preSocketCheck) return true;

      if (base.sockets === equippedItem.sockets || preSocketCheck) {
        switch (equippedItem.prefixnum) {
        case sdk.locale.items.AncientsPledge:
          if (me.paladin) {
            [itemsResists, baseResists] = [(getRes(equippedItem) - 187), getRes(base)];
            if (baseResists !== itemsResists && resCheck(baseResists, itemsResists)) return true;
          } else {
            [itemsDefense, baseDefense] = [getRealDef(equippedItem, 50), getDef(base)];
            if (baseDefense !== itemsDefense && defCheck(itemsDefense, baseDefense)) return true;
          }
        
          break;
        case sdk.locale.items.Black:
          [itemsTotalDmg, baseDmg] = [getRealDmg(equippedItem, 120), getDmg(base)];
          if (baseDmg !== itemsTotalDmg && dmgCheck(itemsTotalDmg, baseDmg)) return true;

          break;
        case sdk.locale.items.CrescentMoon:
          [itemsTotalDmg, baseDmg] = [getRealDmg(equippedItem, 220), getDmg(base)];
          if (baseDmg !== itemsTotalDmg && dmgCheck(itemsTotalDmg, baseDmg)) return true;

          break;
        case sdk.locale.items.Exile:
          [itemsResists, baseResists] = [getRes(equippedItem), getRes(base)];
          if (baseResists !== itemsResists && resCheck(baseResists, itemsResists)) return true;

          break;
        case sdk.locale.items.Honor:
          [itemsTotalDmg, baseDmg] = [getRealDmg(equippedItem, 160, 9, 9), getDmg(base)];
          if (baseDmg !== itemsTotalDmg && dmgCheck(itemsTotalDmg, baseDmg)) return true;

          break;
        case sdk.locale.items.KingsGrace:
          [itemsTotalDmg, baseDmg] = [getRealDmg(equippedItem, 100), getDmg(base)];
          if (baseDmg !== itemsTotalDmg && dmgCheck(itemsTotalDmg, baseDmg)) return true;

          break;
        case sdk.locale.items.Lawbringer:
          [itemsTotalDmg, baseDmg] = [getRealDmg(equippedItem), getDmg(base)];
          if (baseDmg !== itemsTotalDmg && dmgCheck(itemsTotalDmg, baseDmg)) return true;

          break;
        case sdk.locale.items.Lore:
          [itemsDefense, baseDefense] = [getRealDef(equippedItem), getDef(base)];
          
          if (me.barbarian || me.druid) {
            // (PrimalHelms and Pelts)
            [equippedSkillsTier, baseSkillsTier] = [baseSkillsScore(equippedItem), baseSkillsScore(base)];

            verbose && console.log("ÿc9BetterThanWearingCheckÿc0 :: RW(Lore) EquippedSkillsTier: " + equippedSkillsTier + " BaseSkillsTier: " + baseSkillsTier);
            if (equippedSkillsTier !== baseSkillsTier) {
              // Might need to add some type of std deviation, having the skills is probably better but maybe not if in hell with a 50 defense helm
              return (baseSkillsTier > equippedSkillsTier);
            } else if (baseDefense !== itemsDefense) {
              verbose && console.log("ÿc9BetterThanWearingCheckÿc0 :: RW(Lore) BaseDefense: " + baseDefense + " EquippedItem: " + itemsDefense);
              return (baseDefense > itemsDefense);
            }
          } else {
            if (baseDefense !== itemsDefense && defCheck(itemsDefense, baseDefense)) return true;
          }

          break;
        case sdk.locale.items.Malice:
          [itemsTotalDmg, baseDmg] = [getRealDmg(equippedItem, 33, 9), getDmg(base)];

          if (me.paladin) {
            // Paladin TODO: See if its worth it to calculate the added damage skills would add
            [equippedSkillsTier, baseSkillsTier] = [baseSkillsScore(equippedItem), baseSkillsScore(base)];
          }

          if (baseDmg !== itemsTotalDmg && dmgCheck(itemsTotalDmg, baseDmg)) return true;

          break;
        case sdk.locale.items.Rhyme:
          if (me.necromancer) {
            [equippedSkillsTier, baseSkillsTier] = [baseSkillsScore(equippedItem), baseSkillsScore(base)];

            if (equippedSkillsTier !== baseSkillsTier) {
              verbose && console.log("ÿc9BetterThanWearingCheckÿc0 :: RW(Rhyme) EquippedSkillsTier: " + equippedSkillsTier + " BaseSkillsTier: " + baseSkillsTier);
              // Might need to add some type of std deviation, having the skills is probably better but maybe not if in hell with a 50 defense shield
              if (baseSkillsTier > equippedSkillsTier) return true;
            } else if (equippedSkillsTier === baseSkillsTier) {
              [itemsDefense, baseDefense] = [getRealDef(equippedItem), getDef(base)];
              if (baseDefense !== itemsDefense && defCheck(itemsDefense, baseDefense)) return true;
            }
          } else if (me.paladin) {
            [itemsResists, baseResists] = [(getRes(equippedItem) - 100), getRes(base)];
            if (baseResists !== itemsResists && resCheck(baseResists, itemsResists)) return true;
          }

          break;
        case sdk.locale.items.Rift:
          [itemsTotalDmg, baseDmg] = [getRealDmg(equippedItem), getDmg(base)];
          if (baseDmg !== itemsTotalDmg && dmgCheck(itemsTotalDmg, baseDmg)) return true;

          break;
        case sdk.locale.items.Spirit:
          if (!me.paladin || bodyLoc[i] !== sdk.body.LeftArm || base.getItemType() !== "Shield") return true;
        
          [itemsResists, baseResists] = [(getRes(equippedItem) - 115), getRes(base)];
          if (baseResists !== itemsResists && resCheck(baseResists, itemsResists)) return true;

          break;
        case sdk.locale.items.Steel:
          [itemsTotalDmg, baseDmg] = [getRealDmg(equippedItem, 20, 3, 3), getDmg(base)];
          if (baseDmg !== itemsTotalDmg && dmgCheck(itemsTotalDmg, baseDmg)) return true;

          break;
        case sdk.locale.items.Strength:
          [itemsTotalDmg, baseDmg] = [getRealDmg(equippedItem, 35, 9, 9), getDmg(base)];
          if (baseDmg !== itemsTotalDmg && dmgCheck(itemsTotalDmg, baseDmg)) return true;

          break;
        case sdk.locale.items.White:
          if (me.necromancer) {
            [equippedSkillsTier, baseSkillsTier] = [(baseSkillsScore(equippedItem) - 550), baseSkillsScore(base)];

            if (equippedSkillsTier !== baseSkillsTier) {
              if (verbose) {
                console.debug(
                  "ÿc0 :: RW(White) EquippedSkillsTier: " + equippedSkillsTier
                  + " BaseSkillsTier: " + baseSkillsTier
                );
              }
              if (baseSkillsTier > equippedSkillsTier) return true;
            }
          }

          break;
        case sdk.locale.items.Stone:
          [itemsDefense, baseDefense] = [getRealDef(equippedItem, 290), getDef(base)];
          if (baseDefense !== itemsDefense && defCheck(itemsDefense, baseDefense)) return true;

          break;
        case sdk.locale.items.Smoke:
          [itemsDefense, baseDefense] = [getRealDef(equippedItem, 75), getDef(base)];
          if (baseDefense !== itemsDefense && defCheck(itemsDefense, baseDefense)) return true;

          break;
        case sdk.locale.items.Prudence:
          [itemsDefense, baseDefense] = [getRealDef(equippedItem, 170), getDef(base)];
          if (baseDefense !== itemsDefense && defCheck(itemsDefense, baseDefense)) return true;

          break;
        case sdk.locale.items.Gloom:
          [itemsDefense, baseDefense] = [getRealDef(equippedItem, 260), getDef(base)];
          if (baseDefense !== itemsDefense && defCheck(itemsDefense, baseDefense)) return true;

          break;
        case sdk.locale.items.Fortitude:
          [itemsDefense, baseDefense] = [getRealDef(equippedItem, 200), getDef(base)];
          if (baseDefense !== itemsDefense && defCheck(itemsDefense, baseDefense)) return true;

          break;
        case sdk.locale.items.Enlightenment:
          [itemsDefense, baseDefense] = [getRealDef(equippedItem, 30), getDef(base)];
          if (baseDefense !== itemsDefense && defCheck(itemsDefense, baseDefense)) return true;

          break;
        case sdk.locale.items.Duress:
          [itemsDefense, baseDefense] = [getRealDef(equippedItem, 200), getDef(base)];
          if (baseDefense !== itemsDefense && defCheck(itemsDefense, baseDefense)) return true;

          break;
        case sdk.locale.items.ChainsofHonor:
          [itemsDefense, baseDefense] = [getRealDef(equippedItem, 70), getDef(base)];
          if (baseDefense !== itemsDefense && defCheck(itemsDefense, baseDefense)) return true;

          break;
        case sdk.locale.items.Bramble:
        case sdk.locale.items.Bone:
        case sdk.locale.items.Dragon:
        case sdk.locale.items.Enigma:
        case sdk.locale.items.Lionheart:
        case sdk.locale.items.Myth:
        case sdk.locale.items.Peace:
        case sdk.locale.items.Principle:
        case sdk.locale.items.Rain:
        case sdk.locale.items.Stealth:
        case sdk.locale.items.Treachery:
        case sdk.locale.items.Wealth:
          [itemsDefense, baseDefense] = [getRealDef(equippedItem), getDef(base)];
          if (baseDefense !== itemsDefense && defCheck(itemsDefense, baseDefense)) return true;

          break;
        default:
          // Runeword base isn't in the list, keep the base
          return true;
        }
      }
    }
    
    return result;
  };

  /**
   * @param {ItemUnit} base 
   * @param {boolean} verbose 
   */
  Item.betterThanStashed = function (base, verbose) {
    if (!base || base.quality > sdk.items.quality.Superior || base.isRuneword) return false;
    if (base.sockets === 0 && getBaseStat("items", base.classid, "gemsockets") <= 1) return false;
    if (base.sockets === 1) return false;
    verbose === undefined && (verbose = Developer.debugging.baseCheck);

    /** @param {ItemUnit} item */
    const defenseScore = (item) => ({
      def: item.getStatEx(sdk.stats.Defense),
      eDef: item.getStatEx(sdk.stats.ArmorPercent)
    });

    /** @param {ItemUnit} item */
    const dmgScore = (item) => ({
      dmg: Math.round((item.getStatEx(sdk.stats.MinDamagePercent) + item.getStatEx(sdk.stats.MaxDamagePercent)) / 2),
      twoHandDmg: Math.round((item.getStatEx(sdk.stats.SecondaryMinDamage) + item.getStatEx(sdk.stats.SecondaryMaxDamage)) / 2),
      eDmg: item.getStatEx(sdk.stats.EnhancedDamage)
    });

    /** @param {ItemUnit} item */
    const generalScore = (item) => {
      const buildInfo = Check.currentBuild();
      let generalScore = baseSkillsScore(item, buildInfo);
    
      if (generalScore === 0) {
      // should take into account other skills that would be helpful for the current build
        me.paladin && (generalScore += item.getStatEx(sdk.stats.FireResist) * 2);
        generalScore += item.getStatEx(sdk.stats.Defense) * 0.5;

        if (!buildInfo.caster) {
          let dmg = dmgScore(item);
          generalScore += (dmg.dmg + dmg.eDmg);
        }
      }

      return generalScore;
    };

    /**
     * @todo - better comparison for socketed items to unsocketed items
     *   - should compare items with same sockets
     *   - should compare some items (wands, voodooheads, primalhelms, pelts) with no sockets to ones with sockets
     *   - should be able to compare regular items to class items and take into account the max amount of sockets an item can have
     * 
     */
    function getItemToCompare (itemtypes = [], eth = null, sort = (a, b) => a - b) {
      return me.getItemsEx(-1, sdk.items.mode.inStorage)
        .filter(item =>
          itemtypes.includes(item.itemType)
          && ((item.sockets === base.sockets) || (item.sockets > base.sockets))
          && (eth === null || item.ethereal === eth))
        .sort(sort)
        .last();
    }

    /**
     * @param {ItemUnit} a 
     * @param {ItemUnit} b 
     */
    const defenseSort = function (a, b) {
      let [aDef, bDef] = [a.getStatEx(sdk.stats.Defense), b.getStatEx(sdk.stats.Defense)];
      if (aDef !== bDef) return aDef - bDef;
      return a.getStatEx(sdk.stats.ArmorPercent) - b.getStatEx(sdk.stats.ArmorPercent);
    };

    /**
     * @param {ItemUnit} a 
     * @param {ItemUnit} b 
     */
    const generalScoreSort = function (a, b) {
      let [aScore, bScore] = [generalScore(a), generalScore(b)];
      if (aScore !== bScore) return aScore - bScore;
      let [aSoc, bSoc] = [a.sockets, b.sockets];
      if (aSoc !== bSoc) return aSoc - bSoc;
      if (a.getItemType() !== "Weapon" && aScore === bScore) {
        let [aDef, bDef] = [a.getStatEx(sdk.stats.Defense), b.getStatEx(sdk.stats.Defense)];
        if (aDef !== bDef) return aDef - bDef;
        if (aDef === bDef) a.getStatEx(sdk.stats.ArmorPercent) - b.getStatEx(sdk.stats.ArmorPercent);
      }
      return a.sockets - b.sockets;
    };

    /**
     * @param {ItemUnit} a 
     * @param {ItemUnit} b 
     */
    const twoHandDmgSort = function (a, b) {
      let [aDmg, bDmg] = [dmgScore(a), dmgScore(b)];
      if (aDmg.twoHandDmg !== bDmg.twoHandDmg) return aDmg.twoHandDmg - bDmg.twoHandDmg;
      return aDmg.eDmg - bDmg.eDmg;
    };

    const defenseScoreCheck = function (base, itemToCheck) {
      let [defScoreBase, defScoreItem] = [defenseScore(base), defenseScore(itemToCheck)];
      verbose && console.log("ÿc9betterThanStashedÿc0 :: BaseScore: ", defScoreBase, " itemToCheckScore: ", defScoreItem);
      if (defScoreBase.def > defScoreItem.def || (defScoreBase.def === defScoreItem.def && (defScoreBase.eDef > defScoreItem.eDef || base.ilvl > itemToCheck.ilvl))) {
        return true;
      }
      return false;
    };

    const damageScoreCheck = function (base, itemToCheck) {
      let [gScoreBase, gScoreCheck] = [generalScore(base), generalScore(itemToCheck)];
      verbose && console.log("ÿc9betterThanStashedÿc0 :: BaseScore: " + generalScore(base) + " itemToCheckScore: " + generalScore(itemToCheck));
      switch (true) {
      case (gScoreBase > gScoreCheck || (gScoreBase === gScoreCheck && base.ilvl > itemToCheck.ilvl)):
      case (me.barbarian && (gScoreBase === gScoreCheck && Item.getQuantityOwned(base) < 2)):
      case (me.assassin && !Check.currentBuild().caster && (gScoreBase === gScoreCheck && Item.getQuantityOwned(base) < 2)):
        return true;
      }
      return false;
    };

    const generalScoreCheck = function (base, itemToCheck) {
      let [gScoreBase, gScoreCheck] = [generalScore(base), generalScore(itemToCheck)];
      verbose && console.log("ÿc9betterThanStashedÿc0 :: BaseScore: " + generalScore(base) + " itemToCheckScore: " + generalScore(itemToCheck));
      if (gScoreBase > gScoreCheck) return true;
      if (base.getItemType() === "Shield" && gScoreBase === gScoreCheck) return defenseScoreCheck(base, itemToCheck);
      return false;
    };

    let checkItem;

    switch (base.itemType) {
    case sdk.items.type.Shield:
    case sdk.items.type.AuricShields:
    case sdk.items.type.VoodooHeads:
      if (me.paladin || me.necromancer) {
        let iType = [sdk.items.type.Shield];
        me.necromancer ? iType.push(sdk.items.type.VoodooHeads) : iType.push(sdk.items.type.AuricShields);
      
        checkItem = getItemToCompare(iType, false, generalScoreSort);
        if (checkItem === undefined || checkItem.gid === base.gid) return true;

        return (base.isInStorage ? generalScoreCheck(base, checkItem) : false);
      }

      if (base.ethereal || base.sockets === 0) return false;
      checkItem = getItemToCompare([sdk.items.type.Shield], false, defenseSort);
      if (checkItem === undefined || checkItem.gid === base.gid) return true;
    
      return (base.isInStorage ? defenseScoreCheck(base, checkItem) : false);
    case sdk.items.type.Armor:
      if (base.ethereal || base.sockets === 0) return false;
      checkItem = getItemToCompare([sdk.items.type.Armor], false, defenseSort);
      if (checkItem === undefined || checkItem.gid === base.gid) return true;
    
      return (base.isInStorage ? defenseScoreCheck(base, checkItem) : false);
    case sdk.items.type.Helm:
    case sdk.items.type.PrimalHelm:
    case sdk.items.type.Circlet:
    case sdk.items.type.Pelt:
      if (me.barbarian || me.druid) {
        let iType = [sdk.items.type.Helm, sdk.items.type.Circlet];
        me.druid ? iType.push(sdk.items.type.Pelt) : iType.push(sdk.items.type.PrimalHelm);
      
        checkItem = getItemToCompare(iType, false, generalScoreSort);
        if (checkItem === undefined || checkItem.gid === base.gid) return true;

        return (base.isInStorage ? generalScoreCheck(base, checkItem) : false);
      }

      if (base.ethereal || base.sockets === 0) return false;
      checkItem = getItemToCompare([sdk.items.type.Helm, sdk.items.type.Circlet], false, defenseSort);
      if (checkItem === undefined || checkItem.gid === base.gid) return true;
    
      return (base.isInStorage ? defenseScoreCheck(base, checkItem) : false);
    case sdk.items.type.Wand:
      if (!me.necromancer) return false;

      checkItem = getItemToCompare([sdk.items.type.Wand], null, generalScoreSort);
      if (checkItem === undefined || checkItem.gid === base.gid) return true;
      return (base.isInStorage ? generalScoreCheck(base, checkItem) : false);
    case sdk.items.type.Scepter:
    case sdk.items.type.Staff:
    case sdk.items.type.Bow:
    case sdk.items.type.Axe:
    case sdk.items.type.Club:
    case sdk.items.type.Sword:
    case sdk.items.type.Hammer:
    case sdk.items.type.Knife:
    case sdk.items.type.Spear:
    case sdk.items.type.Crossbow:
    case sdk.items.type.Mace:
    case sdk.items.type.Orb:
    case sdk.items.type.AmazonBow:
    case sdk.items.type.AmazonSpear:
      // don't toss grief base
      // Can't use so it's worse then what we already have
      // todo - need better solution to know what the max stats are for our current build and wanted final build
      // update - 8/8/2022 - checks final build stat requirements but still need a better check
      // don't keep an item if we are only going to be able to use it when we get to our final build but also sometimes like paladin making grief
      // we need the item to get to our final build but won't actually be able to use it till then so we can't just use max current build str/dex
      if ((Check.finalBuild().maxStr < base.strreq || Check.finalBuild().maxDex < base.dexreq)) return false;
      // need better solution for comparison based on what runeword can be made in a base type
      // should allow comparing multiple item types given they are all for the same runeword
      checkItem = getItemToCompare([base.itemType], false, generalScoreSort);
      if (checkItem === undefined || checkItem.gid === base.gid) return true;

      return (base.isInStorage ? damageScoreCheck(base, checkItem) : false);
    case sdk.items.type.HandtoHand:
    case sdk.items.type.AssassinClaw:
      if (!me.assassin) return false;

      checkItem = getItemToCompare([sdk.items.type.HandtoHand, sdk.items.type.AssassinClaw], false, generalScoreSort);
      if (checkItem === undefined || checkItem.gid === base.gid) return true;

      return (base.isInStorage ? damageScoreCheck(base, checkItem) : false);
    case sdk.items.type.Polearm:
      checkItem = getItemToCompare([sdk.items.type.Polearm], null, twoHandDmgSort);
      if (checkItem === undefined || checkItem.gid === base.gid) return true;

      if (base.isInStorage && base.sockets > 0) {
        let [baseDmg, checkItemDmg] = [dmgScore(base), dmgScore(checkItem)];
        switch (true) {
        case (baseDmg.twoHandDmg > checkItemDmg.twoHandDmg):
        case ((baseDmg.twoHandDmg === checkItemDmg.twoHandDmg) && (baseDmg.eDmg > checkItemDmg.eDmg)):
        case ((baseDmg.twoHandDmg === checkItemDmg.twoHandDmg) && (baseDmg.eDmg === checkItemDmg.eDmg) && base.ilvl > checkItem.ilvl):
          verbose && console.log("ÿc9betterThanStashedÿc0 :: BaseScore: ", baseDmg, " itemToCheckScore: ", checkItemDmg);
          return true;
        }
      }

      break;
    }

    return false;
  };
})();
