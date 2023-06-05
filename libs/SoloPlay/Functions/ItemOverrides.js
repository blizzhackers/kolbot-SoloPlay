/**
*  @filename    ItemOverrides.js
*  @author      theBGuy
*  @credit      dzik, sonic
*  @desc        AutoEquip and Item related functions
*
*/

includeIfNotIncluded("core/Item.js");
includeIfNotIncluded("SoloPlay/Functions/ItemPrototypes.js");

Item.weaponTypes = [
  sdk.items.type.Scepter, sdk.items.type.Wand,
  sdk.items.type.Staff, sdk.items.type.Bow,
  sdk.items.type.Axe, sdk.items.type.Club,
  sdk.items.type.Sword, sdk.items.type.Hammer,
  sdk.items.type.Knife, sdk.items.type.Spear,
  sdk.items.type.Polearm, sdk.items.type.Crossbow,
  sdk.items.type.Mace, sdk.items.type.ThrowingKnife,
  sdk.items.type.ThrowingAxe, sdk.items.type.Javelin,
  sdk.items.type.Orb, sdk.items.type.AmazonBow,
  sdk.items.type.AmazonSpear, sdk.items.type.AmazonJavelin, sdk.items.type.MissilePotion
];
Item.shieldTypes = [
  sdk.items.type.Shield, sdk.items.type.AuricShields,
  sdk.items.type.VoodooHeads, sdk.items.type.BowQuiver, sdk.items.type.CrossbowQuiver
];
Item.helmTypes = [
  sdk.items.type.Helm, sdk.items.type.PrimalHelm, sdk.items.type.Circlet, sdk.items.type.Pelt
];

/**
 * @param {ItemUnit} item 
 * @param {boolean} [skipSameItem] 
 */
Item.getQuantityOwned = function (item, skipSameItem = false) {
  if (!item) return 0;
  
  return me.getItemsEx()
    .filter(function (check) {
      return check.itemType === item.itemType
        && (!skipSameItem || check.gid !== item.gid)
        && check.classid === item.classid
        && check.quality === item.quality
        && check.sockets === item.sockets
        && check.isInStorage;
    }).length;
};

/**
 * @param {ItemUnit} item 
 */
Item.hasDependancy = function (item) {
  switch (item.itemType) {
  case sdk.items.type.Bow:
  case sdk.items.type.AmazonBow:
    return sdk.items.Arrows;
  case sdk.items.type.Crossbow:
    return sdk.items.Bolts;
  default:
    return false;
  }
};

/**
 * @param {ItemUnit} item 
 */
Item.identify = function (item) {
  if (item.identified) return true;
  let idTool = me.getIdTool();

  if (idTool) {
    item.isInStash && Town.openStash();
    return Town.identifyItem(item, idTool);
  }
  return false;
};

/**
 * @param {ItemUnit} item 
 */
Item.getBodyLoc = function (item) {
  if (!item || item.isInsertable) return [];
  if (Item.shieldTypes.includes(item.itemType)) return [sdk.body.LeftArm];
  if (Item.helmTypes.includes(item.itemType)) return [sdk.body.Head];
  if (Item.weaponTypes.includes(item.itemType)) {
    return me.barbarian && item.twoHanded && !item.strictlyTwoHanded
      ? [sdk.body.RightArm, sdk.body.LeftArm]
      : [sdk.body.RightArm];
  }

  switch (item.itemType) {
  case sdk.items.type.Armor:
    return [sdk.body.Armor];
  case sdk.items.type.Ring:
    return [sdk.body.RingRight, sdk.body.RingLeft];
  case sdk.items.type.Amulet:
    return [sdk.body.Neck];
  case sdk.items.type.Boots:
    return [sdk.body.Feet];
  case sdk.items.type.Gloves:
    return [sdk.body.Gloves];
  case sdk.items.type.Belt:
    return [sdk.body.Belt];
  case sdk.items.type.AssassinClaw:
  case sdk.items.type.HandtoHand:
    return !Check.currentBuild().caster && me.assassin
      ? [sdk.body.RightArm, sdk.body.LeftArm] : [sdk.body.RightArm];
  }

  return [];
};

/**
 * @param {ItemUnit} item 
 */
Item.canEquip = function (item) {
  if (!item || item.type !== sdk.unittype.Item || !item.identified) return false;
  return me.charlvl >= item.getStat(sdk.stats.LevelReq) && me.trueStr >= item.strreq && me.trueDex >= item.dexreq;
};

/**
 * @param {ItemUnit} item 
 * @param {boolean} basicCheck 
 */
Item.autoEquipCheck = function (item, basicCheck = false) {
  if (!Config.AutoEquip) return true;

  let tier = NTIP.GetTier(item);
  if (tier <= 0) return false;
  let bodyLoc = this.getBodyLoc(item);

  for (let loc of bodyLoc) {
    const equippedItem = me.equipped.get(loc);

    // rings are special
    if (item.isInStorage && item.itemType === sdk.items.type.Ring) {
      // have to pass in the specific location
      tier = tierscore(item, 1, loc);

      if (tier > equippedItem.tierScore) {
        return true;
      }
    } else if (tier > equippedItem.tier && (basicCheck ? true : this.canEquip(item) || !item.identified)) {
      if (Item.canEquip(item)) {
        if (item.twoHanded && !me.barbarian) {
          if (tier < me.equipped.get(sdk.body.RightArm).tier + me.equipped.get(sdk.body.LeftArm).tier) return false;
        }

        if (!me.barbarian && loc === sdk.body.LeftArm && me.equipped.get(loc).tier === -1) {
          if (me.equipped.get(sdk.body.RightArm).twoHanded
            && tier < me.equipped.get(sdk.body.RightArm).tier) {
            return false;
          }
        }

        return true;
      } else {
        /**
         * @param {ItemUnit} item 
         * @returns {boolean}
         */
        const checkForBetterItem = function (item) {
          let betterItem = me.getItemsEx()
            .filter(el => el.isInStorage && el.gid !== item.gid && el.identified && Item.getBodyLoc(el).includes(loc))
            .sort((a, b) => NTIP.GetTier(b) - NTIP.GetTier(a))
            .find(el => NTIP.GetTier(el) > tier);
          return !!betterItem;
        };
        // keep wanted final gear items
        if (NTIP.CheckItem(item, NTIP.FinalGear.list) === Pickit.Result.WANTED) {
          // don't horde items we can't equip
          return !checkForBetterItem(item);
        }

        let [lvlReq, strReq, dexReq] = [item.getStat(sdk.stats.LevelReq), item.strreq, item.dexreq];

        // todo - bit hacky, better way would be to track what stats are going to be allocated next
        if ((lvlReq - me.charlvl > 5) || (strReq - me.trueStr > 10) || (dexReq - me.trueDex > 10)) {
          return false;
        }

        // if we can't equip it, but it's a good item, keep it as long as we have space for it
        // lets double check that this is the highest tied'd item of this type in our storage
        let betterItem = checkForBetterItem(item);
        if (!betterItem) return true;

        return Storage.Stash.CanFit(item) && Storage.Stash.UsedSpacePercent() < 65;
      }
    }
  }

  return false;
};

/**
 * @param {string} task 
 */
Item.autoEquip = function (task = "") {
  if (!Config.AutoEquip) return true;
  task = task + "AutoEquip";
  console.log("ÿc8Kolbot-SoloPlayÿc0: Entering " + task);

  const noStash = (!me.inTown || task !== "AutoEquip");
  let tick = getTickCount();
  let items = me.getItemsEx()
    .filter(function (item) {
      if (!item.isInStorage) return false;
      if (noStash && !item.isInInventory) return false;
      let tier = NTIP.GetTier(item);
      return (item.identified ? tier > 0 : tier !== 0);
    });
  // couldn't find my items
  if (!items.length) return false;

  me.switchWeapons(sdk.player.slot.Main);

  const sortEq = function (a, b) {
    let [prioA, prioB] = [Item.canEquip(a), Item.canEquip(b)];
    if (prioA && prioB) return NTIP.GetTier(b) - NTIP.GetTier(a);
    if (prioA) return -1;
    if (prioB) return 1;
    return 0;
  };

  /**
   * @param {ItemUnit} item 
   * @param {number} bodyLoc 
   * @param {number} tier 
   */
  const runEquip = function (item, bodyLoc, tier) {
    let gid = item.gid;
    let prettyName = item.prettyPrint;
    console.debug(prettyName + " tier: " + tier);

    if (Item.equip(item, bodyLoc)) {
      console.log(
        "ÿc9" + task + "ÿc0 :: \n"
        + "ÿc9 - Equippedÿc0: " + prettyName + "\n"
        + "ÿc9 - Tierÿc0: " + tier
      );
      // item that can have sockets
      if (item.getItemType()) {
        SoloWants.addToList(item);
        SoloWants.ensureList();
      }
      Developer.debugging.autoEquip && Item.logItem(task, me.getItem(-1, -1, gid));
      Developer.logEquipped && MuleLogger.logEquippedItems();
      me.equipped.set(bodyLoc, item);
    } else if (!noStash && item.lvlreq > me.charlvl && !item.isInStash) {
      if (Storage.Stash.CanFit(item)) {
        console.log(
          "ÿc9" + task + "ÿc0 :: \n"
          + "- " + prettyName + " Item req is too high (" + item.lvlreq + ") for my level (" + me.charlvl + ") \n"
          + "- Stash for now as its better than what I currently have. Tier: " + tier
        );
        Storage.Stash.MoveTo(item);
      }
    } else if (me.getItem(-1, -1, gid)) {
      // Make sure we didn't lose it during roll back
      return false;
    }

    return true;
  };

  // stash'd unid check
  let unids = items.filter(item => !item.identified && item.isInStash);
  if (unids.length && NPCAction.fillTome(sdk.items.TomeofIdentify, true)) {
    unids.forEach(item => Item.identify(item));
  }

  // ring check - sometimes a higher tier ring ends up on the wrong finger causing a rollback loop
  if (me.equipped.get(sdk.body.RingLeft).tierScore > me.equipped.get(sdk.body.RingRight).tierScore) {
    console.log("ÿc9" + task + "ÿc0 :: Swapping rings, higher tier ring is on the wrong finger");
    clickItemAndWait(sdk.clicktypes.click.item.Left, sdk.body.RingLeft);
    delay(200);
    me.itemoncursor && clickItemAndWait(sdk.clicktypes.click.item.Left, sdk.body.RingRight);
    delay(200);
    me.itemoncursor && clickItemAndWait(sdk.clicktypes.click.item.Left, sdk.body.RingLeft);
    me.equipped.init();
  }

  !getUIFlag(sdk.uiflags.Shop) && me.cancel();

  while (items.length > 0) {
    items.sort(sortEq);
    const item = items.shift();
    if (!item.isInStorage) continue;
    let tier = NTIP.GetTier(item);
    if (tier <= 0) continue;
    let bodyLoc = this.getBodyLoc(item);

    for (let loc of bodyLoc) {
      const equippedItem = me.equipped.get(loc);
      if (equippedItem.classid === sdk.items.quest.KhalimsWill) continue;
      // rings are special
      if (item.itemType === sdk.items.type.Ring) {
        Item.identify(item);
        // have to pass in the specific location
        tier = tierscore(item, 1, loc);

        if (tier > equippedItem.tierScore) {
          if (!runEquip(item, loc, tier)) {
            continue;
          }
          
          break;
        }
      } else {
        if (tier > equippedItem.tier) {
          console.debug("EquippedItem :: " + equippedItem.prettyPrint + " |ÿc0 Tier: " + equippedItem.tier);
          Item.identify(item);

          if (item.twoHanded && !me.barbarian) {
            if (tier < me.equipped.get(sdk.body.RightArm).tier + me.equipped.get(sdk.body.LeftArm).tier) {
              continue;
            }
            console.log("ÿc9" + task + "ÿc0 :: TwoHandedWep better than sum tier of currently equipped main + shield hand : " + item.fname + " Tier: " + tier);
          }

          if (!me.barbarian && loc === sdk.body.LeftArm
            && equippedItem.tier === -1
            && me.equipped.get(sdk.body.RightArm).twoHanded) {
            if (tier < me.equipped.get(sdk.body.RightArm).tier) {
              continue;
            }
            console.log("ÿc9" + task + "ÿc0 :: TwoHandedWep not as good as what we want to equip on our shield hand : " + item.fname + " Tier: " + tier);
          }

          if (!runEquip(item, loc, tier)) {
            continue;
          }

          break;
        }
      }
    }
  }

  console.log("ÿc8Kolbot-SoloPlayÿc0: Exiting ÿc9" + task + "ÿc0. Time elapsed: " + Time.format(getTickCount() - tick));
  return true;
};

/**
 * @param {ItemUnit} item 
 * @param {number} bodyLoc 
 */
Item.equip = function (item, bodyLoc) {
  // can't equip - @todo handle if it's one of our final items and we can equip it given the stats of our other items
  if (!this.canEquip(item)) return false;

  // Already equipped in the right slot
  if (item.mode === sdk.items.mode.Equipped && item.bodylocation === bodyLoc) return true;
  // failed to open stash
  if (item.isInStash && !Town.openStash()) return false;
  // failed to open cube
  if (item.isInCube && !Cubing.openCube()) return false;

  let currentEquipped = me.getItemsEx()
    .filter(item => item.isEquipped && item.bodylocation === bodyLoc)
    .first();
  if (currentEquipped) {
    console.debug(
      "ÿc9Equipÿc0 ::\n"
      + "ÿc9 - Equippingÿc0: " + item.prettyPrint + "\n"
      + "ÿc9 - Tierÿc0: " + NTIP.GetTier(item) + "\n"
      + "ÿc9 - Currently Equippedÿc0: " + currentEquipped.prettyPrint + "\n"
      + "ÿc9 - Tierÿc0: " + NTIP.GetTier(currentEquipped) + "\n"
      + "ÿc9 - BodyLocÿc0: " + bodyLoc
    );
  }
  let rolledBack = false;
  // todo: sometimes rings get bugged with the higher tier ring ending up on the wrong finger, if this happens swap them

  for (let i = 0; i < 3; i += 1) {
    if (item.toCursor()) {
      clickItemAndWait(sdk.clicktypes.click.item.Left, bodyLoc);

      if (item.bodylocation === bodyLoc) {
        if (getCursorType() === 3) {
          let cursorItem = Game.getCursorUnit();

          if (cursorItem) {
            // rollback check
            let justEquipped = me.equipped.get(bodyLoc);
            let checkScore = 0;
            switch (cursorItem.itemType) {
            case sdk.items.type.Ring:
              checkScore = tierscore(cursorItem, 1, bodyLoc);
              if (checkScore > justEquipped.tierScore) {
                console.debug("ROLLING BACK TO OLD ITEM BECAUSE IT WAS BETTER");
                console.debug("OldItem: " + checkScore + " Just Equipped Item: " + me.equipped.get(bodyLoc).tierScore);
                clickItemAndWait(sdk.clicktypes.click.item.Left, bodyLoc);
                cursorItem = Game.getCursorUnit();
                rolledBack = true;
              }

              break;
            default:
              checkScore = NTIP.GetTier(cursorItem);
              if (checkScore > justEquipped.tier
                && !item.questItem
                /*Wierd bug with runewords that it'll fail to get correct item desc so don't attempt rollback*/
                && !justEquipped.isRuneword) {
                console.debug("ROLLING BACK TO OLD ITEM BECAUSE IT WAS BETTER");
                console.debug("OldItem: " + checkScore + " Just Equipped Item: " + me.equipped.get(bodyLoc).tier);
                clickItemAndWait(sdk.clicktypes.click.item.Left, bodyLoc);
                cursorItem = Game.getCursorUnit();
                rolledBack = true;
              }

              break;
            }

            if (cursorItem && !cursorItem.shouldKeep()) {
              console.debug("ÿc9Equipÿc0 :: Dropping " + cursorItem.prettyPrint);
              cursorItem.drop();
            }
          }
        }

        return rolledBack ? false : true;
      }
    }
  }

  return false;
};

Item.removeItem = function (bodyLoc = -1, item = undefined) {
  let removable = item && typeof item === "object"
    ? item
    : me.getEquippedItem(bodyLoc);
  !me.inTown && Town.goToTown();
  !getUIFlag(sdk.uiflags.Stash) && Town.openStash();

  if (removable) {
    removable.isOnSwap && me.weaponswitch !== 1 && me.switchWeapons(1);
    removable.toCursor();
    let cursorItem = Game.getCursorUnit();

    if (cursorItem) {
      // only keep wanted items
      if ([Pickit.Result.WANTED, Pickit.Result.SOLOWANTS].includes(Pickit.checkItem(cursorItem).result)
        || AutoEquip.wanted(cursorItem)) {
        if (Storage.Inventory.CanFit(cursorItem)) {
          Storage.Inventory.MoveTo(cursorItem);
        } else if (Storage.Stash.CanFit(cursorItem)) {
          Storage.Stash.MoveTo(cursorItem);
        } else if (Storage.Cube.CanFit(cursorItem)) {
          Storage.Cube.MoveTo(cursorItem);
        }
      } else {
        D2Bot.printToConsole("Dropped " + cursorItem.prettyPrint + " during un-equip process", sdk.colors.D2Bot.Red);
        cursorItem.drop();
      }
    }

    me.weaponswitch === 1 && me.switchWeapons(0);

    return true;
  }

  return false;
};

/**
 * @param {ItemUnit} item 
 */
Item.hasSecondaryTier = (item) => Config.AutoEquip && me.expansion && NTIP.GetSecondaryTier(item) > 0;

/**
 * @param {ItemUnit} item 
 */
Item.getSecondaryBodyLoc = function (item) {
  if (Item.shieldTypes.includes(item.itemType)) return [sdk.body.LeftArmSecondary];
  if ([sdk.items.type.HandtoHand, sdk.items.type.AssassinClaw].includes(item.itemType)) {
    return !Check.currentBuild().caster && me.assassin
      ? [sdk.body.RightArmSecondary, sdk.body.LeftArmSecondary]
      : [sdk.body.RightArmSecondary];
  }
  if (Item.weaponTypes.includes(item.itemType)) {
    return me.barbarian && item.twoHanded && !item.strictlyTwoHanded
      ? [sdk.body.RightArmSecondary, sdk.body.LeftArmSecondary]
      : [sdk.body.RightArmSecondary];
  }
  return [];
};

/**
 * @param {ItemUnit} item 
 * @param {11 | 12} bodyLoc 
 */
Item.secondaryEquip = function (item, bodyLoc) {
  if (!this.canEquip(item) && me.expansion) return false;
  // Already equipped in the right slot
  if (item.mode === sdk.items.mode.Equipped && item.bodylocation === bodyLoc) return true;
  if (item.isInStash && !Town.openStash()) return false;
  let equipped = false;

  me.switchWeapons(1); // Switch weapons

  try {
    for (let i = 0; i < 3; i += 1) {
      if (item.toCursor()) {
        clickItemAndWait(sdk.clicktypes.click.item.Left, bodyLoc - 7);

        if (item.bodylocation === bodyLoc - 7) {
          equipped = true;
          [sdk.items.Arrows, sdk.items.Bolts].includes(item.classid) && CharData.skillData.bow.setArrowInfo(item);
          if ([sdk.items.type.Bow, sdk.items.type.AmazonBow, sdk.items.type.Crossbow].includes(item.itemType)) {
            CharData.skillData.bow.setBowInfo(item);
          }
          
          if (getCursorType() === 3) {
            let cursorItem = Game.getCursorUnit();
            !!cursorItem && !cursorItem.shouldKeep() && cursorItem.drop();
          }

          if (Item.hasDependancy(item) && me.needRepair() && me.inTown) {
            NPCAction.repair(true);
          }

          return true;
        }
      }
    }
  } finally {
    me.switchToPrimary();
  }

  return equipped;
};

/**
 * @param {ItemUnit} item 
 */
Item.autoEquipCheckSecondary = function (item) {
  if (!Config.AutoEquip) return true;
  if (me.classic) return false;

  let tier = NTIP.GetSecondaryTier(item);
  if (tier <= 0) return false;
  let bodyLoc = Item.getSecondaryBodyLoc(item);

  for (let loc of bodyLoc) {
    if (tier > me.equipped.get(loc).secondaryTier && (Item.canEquip(item) || !item.identified)) {
      return true;
    }
  }

  return false;
};

/**
 * @param {string} task 
 */
Item.autoEquipSecondary = function (task = "") {
  if (!Config.AutoEquip || me.classic) return true;

  task = task + "Secondary AutoEquip";
  console.log("ÿc8Kolbot-SoloPlayÿc0: Entering " + task);

  const noStash = (!me.inTown || task !== "Secondary AutoEquip");
  let tick = getTickCount();
  let items = me.getItemsEx()
    .filter(function (item) {
      if (!item.isInStorage) return false;
      if (noStash && !item.isInInventory) return false;
      let tier = NTIP.GetSecondaryTier(item);
      return (item.identified ? tier > 0 : tier !== 0);
    });

  if (!items) return false;

  const sortEq = function (a, b) {
    if (Item.canEquip(a)) return -1;
    if (Item.canEquip(b)) return 1;
    return 0;
  };

  me.cancel();

  while (items.length > 0) {
    items.sort(sortEq);
    const item = items.shift();
    if (!item.isInStorage) continue;
    const tier = NTIP.GetSecondaryTier(item);
    if (tier <= 0) continue;
    let bodyLoc = Item.getSecondaryBodyLoc(item);

    for (let loc of bodyLoc) {
      const equippedItem = me.equipped.get(loc);
      // should never happen - but just in case
      if (equippedItem.classid === sdk.items.quest.KhalimsWill) continue;
      if (tier > equippedItem.secondaryTier) {
        Item.identify(item);

        let gid = item.gid;
        let prettyName = item.prettyPrint;
        console.debug(prettyName + " tier: " + tier);

        if (this.secondaryEquip(item, loc)) {
          console.log("ÿc9SecondaryEquipÿc0 :: Equipped: " + prettyName + " SecondaryTier: " + tier);
          Developer.debugging.autoEquip && Item.logItem("Equipped switch", me.getItem(-1, -1, gid));
          Developer.logEquipped && MuleLogger.logEquippedItems();
          me.equipped.set(loc, item);
        }

        break;
      }
    }
  }

  console.log("ÿc8Kolbot-SoloPlayÿc0: Exiting secondary auto equip. Time elapsed: " + Time.format(getTickCount() - tick));
  return true;
};

/**
 * @param {ItemUnit} item 
 */
Item.hasMercTier = (item) => Config.AutoEquip && me.expansion && NTIP.GetMercTier(item) > 0;

/**
 * @param {ItemUnit} item 
 * @param {number} bodyLoc 
 * @todo re-work using char data so we can shop/keep items if merc is dead *but* we have enough to revive him and buy the item and enough space
 */
Item.canEquipMerc = function (item, bodyLoc) {
  if (item.type !== sdk.unittype.Item || me.classic) return false;
  let mercenary = me.getMercEx();

  // dont have merc or he is dead or unidentifed item
  if (!mercenary || !item.identified) return false;
  let curr = Item.getMercEquipped(bodyLoc);

  // Higher requirements
  if (item.getStat(sdk.stats.LevelReq) > mercenary.getStat(sdk.stats.Level)
    || item.dexreq > mercenary.getStat(sdk.stats.Dexterity) - curr.dex
    || item.strreq > mercenary.getStat(sdk.stats.Strength) - curr.str) {
    return false;
  }

  return true;
};

/**
 * @param {ItemUnit} item 
 * @param {number} bodyLoc 
 */
Item.equipMerc = function (item, bodyLoc) {
  let mercenary = me.getMercEx();

  // dont have merc or he is dead or higher requirements
  if (!mercenary || !Item.canEquipMerc(item, bodyLoc)) return false;
  // Already equipped in the right slot
  if (item.mode === sdk.items.mode.Equipped && item.bodylocation === bodyLoc) return true;
  if (item.isInStash && !Town.openStash()) return false;

  for (let i = 0; i < 3; i += 1) {
    if (item.toCursor()) {
      if (clickItem(sdk.clicktypes.click.item.Mercenary, bodyLoc)) {
        delay(500 + me.ping * 2);
        Developer.debugging.autoEquip && Item.logItem("Merc Equipped", mercenary.getItem(item.classid));
      }

      let check = mercenary.getItem(item.classid);

      if (check && check.bodylocation === bodyLoc) {
        if (check.runeword) {
          // just track runewords for now
          me.data.merc.gear.push(check.prefixnum);
          CharData.updateData("merc", me.data);
        }

        if (getCursorType() === 3) {
          let cursorItem = Game.getCursorUnit();
          !!cursorItem && !cursorItem.shouldKeep() && cursorItem.drop();
        }

        Developer.logEquipped && MuleLogger.logEquippedItems();

        return true;
      }
    }
  }

  return false;
};

Item.getMercEquipped = function (bodyLoc = -1) {
  let mercenary = me.getMercEx();

  if (mercenary) {
    let item = mercenary.getItemsEx()
      .filter((item) => item.isEquipped && item.bodylocation === bodyLoc)
      .first();

    if (item) {
      return {
        classid: item.classid,
        prefixnum: item.prefixnum,
        tier: NTIP.GetMercTier(item),
        name: item.fname,
        str: item.getStatEx(sdk.stats.Strength),
        dex: item.getStatEx(sdk.stats.Dexterity)
      };
    }
  }

  // Don't have anything equipped in there
  return {
    classid: -1,
    prefixnum: -1,
    tier: -1,
    name: "none",
    str: 0,
    dex: 0
  };
};

/**
 * @param {ItemUnit} item 
 * @returns {number[]}
 */
Item.getBodyLocMerc = function (item) {
  let _mercId = me.data.merc.classid;

  switch (item.itemType) {
  case sdk.items.type.Shield:
    return (_mercId === sdk.mercs.IronWolf
      ? [sdk.body.LeftArm]
      : []);
  case sdk.items.type.Armor:
    return [sdk.body.Armor];
  case sdk.items.type.Helm:
  case sdk.items.type.Circlet:
    return [sdk.body.Head];
  case sdk.items.type.PrimalHelm:
    return (_mercId === sdk.mercs.A5Barb
      ? [sdk.body.Head]
      : []);
  case sdk.items.type.Bow:
    return (_mercId === sdk.mercs.Rogue
      ? [sdk.body.RightArm]
      : []);
  case sdk.items.type.Spear:
  case sdk.items.type.Polearm:
    return (_mercId === sdk.mercs.Guard
      ? [sdk.body.RightArm]
      : []);
  case sdk.items.type.Sword:
    return ([sdk.mercs.IronWolf, sdk.mercs.A5Barb].includes(_mercId)
      ? sdk.body.RightArm
      : []);
  }
  return [];
};

/**
 * @param {ItemUnit} item 
 * @param {boolean} basicCheck 
 */
Item.autoEquipCheckMerc = function (item, basicCheck = false) {
  if (!Config.AutoEquip) return true;
  if (Config.AutoEquip && !me.getMercEx()) return false;

  let tier = NTIP.GetMercTier(item);
  if (tier <= 0) return false;
  let bodyLoc = Item.getBodyLocMerc(item);

  for (let loc of bodyLoc) {
    let oldTier = Item.getMercEquipped(loc).tier;

    if (tier > oldTier) {
      if (Item.canEquipMerc(item) || !item.identified) {
        return true;
      } else if (basicCheck) {
        // keep wanted final gear items
        if (NTIP.CheckItem(item, NTIP.FinalGear.list) === Pickit.Result.WANTED) {
          return true;
        }

        return false;
      }
    }
  }

  return false;
};

Item.autoEquipMerc = function () {
  if (!Config.AutoEquip || !me.getMercEx()) return true;

  let items = me.getItemsEx()
    .filter(function (item) {
      if (!item.isInStorage) return false;
      let tier = NTIP.GetMercTier(item);
      return (item.identified ? tier > 0 : tier !== 0);
    });
  if (!items.length) return false;

  function sortEq (a, b) {
    let [prioA, prioB] = [Item.canEquip(a), Item.canEquip(b)];
    if (prioA && prioB) return NTIP.GetMercTier(b) - NTIP.GetMercTier(a);
    if (prioA) return -1;
    if (prioB) return 1;
    return 0;
  }

  me.cancel();

  while (items.length > 0) {
    items.sort(sortEq);
    const item = items.shift();
    const tier = NTIP.GetMercTier(item);
    if (tier <= 0) continue;
    const bodyLoc = Item.getBodyLocMerc(item);
    const name = item.name;

    for (let loc of bodyLoc) {
      if ([sdk.storage.Inventory, sdk.storage.Stash].includes(item.location) && tier > Item.getMercEquipped(loc).tier) {
        Item.identify(item);

        console.log("Merc " + name);
        this.equipMerc(item, loc) && console.log("ÿc9MercEquipÿc0 :: Equipped: " + name + " MercTier: " + tier);
        
        let cursorItem = Game.getCursorUnit();

        if (cursorItem) {
          cursorItem.drop();
          Developer.debugging.autoEquip && Item.logItem("Merc Dropped", cursorItem);
        }

        break;
      }
    }
  }

  return true;
};

Item.removeItemsMerc = function () {
  let mercenary = me.getMercEx();
  if (!mercenary) return true;
  // Sort items so we try to keep the highest tier'd items in case space in our invo is limited
  let items = mercenary.getItemsEx().sort((a, b) => NTIP.GetMercTier(b) - NTIP.GetMercTier(a));

  if (items) {
    for (let i = 0; i < items.length; i++) {
      clickItem(sdk.clicktypes.click.item.Mercenary, items[i].bodylocation);
      delay(500 + me.ping * 2);

      let cursorItem = Game.getCursorUnit();

      if (cursorItem) {
        if (Storage.Inventory.CanFit(cursorItem)) {
          Storage.Inventory.MoveTo(cursorItem);
        } else {
          cursorItem.drop();
        }
      }
    }
  }

  return !!mercenary.getItem();
};

// Log kept item stats in the manager.
Item.logItem = function (action, unit, keptLine, force) {
  if (!this.useItemLog || unit === undefined || !unit || !unit.fname) return false;
  if (!Config.LogKeys && ["pk1", "pk2", "pk3"].includes(unit.code)) return false;
  if (!Config.LogOrgans && ["dhn", "bey", "mbr"].includes(unit.code)) return false;
  if (!Config.LogLowRunes && ["r01", "r02", "r03", "r04", "r05", "r06", "r07", "r08", "r09", "r10", "r11", "r12", "r13", "r14"].includes(unit.code)) return false;
  if (!Config.LogMiddleRunes && ["r15", "r16", "r17", "r18", "r19", "r20", "r21", "r22", "r23"].includes(unit.code)) return false;
  if (!Config.LogHighRunes && ["r24", "r25", "r26", "r27", "r28", "r29", "r30", "r31", "r32", "r33"].includes(unit.code)) return false;
  if (!Config.LogLowGems && ["gcv", "gcy", "gcb", "gcg", "gcr", "gcw", "skc", "gfv", "gfy", "gfb", "gfg", "gfr", "gfw", "skf", "gsv", "gsy", "gsb", "gsg", "gsr", "gsw", "sku"].includes(unit.code)) return false;
  if (!Config.LogHighGems && ["gzv", "gly", "glb", "glg", "glr", "glw", "skl", "gpv", "gpy", "gpb", "gpg", "gpr", "gpw", "skz"].includes(unit.code)) return false;

  for (let i = 0; i < Config.SkipLogging.length; i++) {
    if (Config.SkipLogging[i] === unit.classid || Config.SkipLogging[i] === unit.code) return false;
  }

  let lastArea;
  let name = unit.fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<:;.*]|\/|\\/g, "").trim();
  let desc = (this.getItemDesc(unit) || "");
  let color = (unit.getColor() || -1);

  if (action.match("kept", "i")) {
    lastArea = DataFile.getStats().lastArea;
    lastArea && (desc += ("\n\\xffc0Area: " + lastArea));
  }

  const mercCheck = action.match("Merc");
  const hasTier = AutoEquip.hasTier(unit);
  const charmCheck = (unit.isCharm && CharmEquip.check(unit));
  const nTResult = NTIP.CheckItem(unit, NTIP.CheckList) === 1;

  if (!action.match("kept", "i") && !action.match("Shopped") && hasTier) {
    if (!mercCheck) {
      NTIP.GetCharmTier(unit) > 0 && (desc += ("\n\\xffc0Autoequip charm tier: " + NTIP.GetCharmTier(unit)));
      NTIP.GetTier(unit) > 0 && (desc += ("\n\\xffc0Autoequip char tier: " + NTIP.GetTier(unit)));
    } else {
      desc += ("\n\\xffc0Autoequip merc tier: " + NTIP.GetMercTier(unit));
    }
  }

  // should stop logging items unless we wish to see them or it's part of normal pickit
  if (!nTResult && !force) {
    switch (true) {
    case (unit.questItem || unit.isBaseType):
    case (!unit.isCharm && hasTier && !Developer.debugging.autoEquip):
    case (charmCheck && !Developer.debugging.smallCharm && unit.classid === sdk.items.SmallCharm):
    case (charmCheck && !Developer.debugging.largeCharm && unit.classid === sdk.items.LargeCharm):
    case (charmCheck && !Developer.debugging.grandCharm && unit.classid === sdk.items.GrandCharm):
      return true;
    default:
      break;
    }
  }

  let code = this.getItemCode(unit);
  let sock = unit.getItem();

  if (sock) {
    do {
      if (sock.itemType === sdk.items.type.Jewel) {
        desc += "\n\n";
        desc += this.getItemDesc(sock);
      }
    } while (sock.getNext());
  }

  keptLine && (desc += ("\n\\xffc0Line: " + keptLine));
  desc += "$" + (unit.getFlag(sdk.items.flags.Ethereal) ? ":eth" : "");

  let itemObj = {
    title: action + " " + name,
    description: desc,
    image: code,
    textColor: unit.quality,
    itemColor: color,
    header: "",
    sockets: this.getItemSockets(unit)
  };

  D2Bot.printToItemLog(itemObj);

  return true;
};

const AutoEquip = {
  /**
   * @param {ItemUnit} item 
   */
  hasTier: function (item) {
    if (me.classic) return Item.hasTier(item);
    if (item.isCharm) {
      return CharmEquip.hasCharmTier(item);
    }
    return Item.hasMercTier(item) || Item.hasTier(item) || Item.hasSecondaryTier(item);
  },

  /**
   * @param {ItemUnit} item 
   */
  wanted: function (item) {
    if (me.classic) return Item.autoEquipCheck(item, true);
    if (item.isCharm) {
      return CharmEquip.check(item);
    }
    return Item.autoEquipCheckMerc(item, true) || Item.autoEquipCheck(item, true) || Item.autoEquipCheckSecondary(item);
  },

  run: function () {
    console.time("AutoEquip");
    Item.autoEquip();
    Item.autoEquipSecondary();
    CharmEquip.run();
    console.timeEnd("AutoEquip");
  }
};
