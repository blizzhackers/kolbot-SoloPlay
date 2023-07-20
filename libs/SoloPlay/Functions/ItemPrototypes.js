/**
*  @filename    ItemPrototypes.js
*  @author      theBGuy
*  @desc        Item related prototypes
*  @notes       Unused, for now at least can't guarantee only units are attempting to use the prototypes
*
*/

includeIfNotIncluded("SoloPlay/Functions/PrototypeOverrides.js");

/** @this {ItemUnit} */
Unit.prototype.hasTier = function () {
  if (this.type !== sdk.unittype.Item) return false;
  return Config.AutoEquip && NTIP.GetTier(this) > 0;
};

/** @this {ItemUnit} */
Unit.prototype.hasSecondaryTier = function () {
  if (this.type !== sdk.unittype.Item) return false;
  return Config.AutoEquip && NTIP.GetSecondaryTier(this) > 0 && me.expansion;
};

/** @this {ItemUnit} */
Unit.prototype.hasMercTier = function () {
  if (this.type !== sdk.unittype.Item) return false;
  return Config.AutoEquip && NTIP.GetMercTier(this) > 0 && me.expansion;
};

/** @this {ItemUnit} */
Unit.prototype.canEquip = function () {
  if (this.type !== sdk.unittype.Item || !this.identified) return false;
  return me.charlvl >= this.lvlreq
    && me.trueStr >= this.strreq
    && me.trueDex >= this.dexreq;
};

/** @this {ItemUnit} */
Unit.prototype.bodyLocation = function () {
  if (this.type !== sdk.unittype.Item || this.isInsertable) return [];
  if (Item.shieldTypes.includes(this.itemType)) return [sdk.body.LeftArm];
  if (Item.helmTypes.includes(this.itemType)) return [sdk.body.Head];
  if (Item.weaponTypes.includes(this.itemType)) {
    return me.barbarian && this.twoHanded && !this.strictlyTwoHanded
      ? [sdk.body.RightArm, sdk.body.LeftArm]
      : [sdk.body.RightArm];
  }

  switch (this.itemType) {
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

/** @this {ItemUnit} */
Unit.prototype.canEquipMerc = function (bodyLoc = -1) {
  if (this.type !== sdk.unittype.Item || !this.identified || me.classic) return false;
  let mercenary = me.getMercEx();

  // dont have merc or he is dead
  if (!mercenary) return false;
  let curr = Item.getMercEquipped(bodyLoc);

  // Higher requirements
  if (this.getStat(sdk.stats.LevelReq) > mercenary.getStat(sdk.stats.Level)
    || this.dexreq > mercenary.getStat(sdk.stats.Dexterity) - curr.dex
    || this.strreq > mercenary.getStat(sdk.stats.Strength) - curr.str) {
    return false;
  }

  return true;
};

/** @this {ItemUnit} */
Unit.prototype.shouldKeep = function () {
  if (this === undefined || this.type !== sdk.unittype.Item) return false;

  if (Pickit.checkItem(this).result === 1
    // only keep wanted items or cubing items (in rare cases where weapon being used is also a cubing wanted item)
    || (this.unique && Pickit.checkItem(this).result === 2)
    // or keep if item is worth selling
    || (
      (this.getItemCost(sdk.items.cost.ToSell) / (this.sizex * this.sizey))
      >= (!me.inTown && me.charlvl < 12 ? 5 : me.normal ? 50 : me.nightmare ? 500 : 1000)
    )) {
    if ((Storage.Inventory.CanFit(this) && Storage.Inventory.MoveTo(this))) {
      if (!AutoEquip.wanted(this) && NTIP.CheckItem(this, NTIP.CheckList) === Pickit.Result.UNWANTED) {
        Town.sell.push(this);
      }
      return true;
    }
  }

  return false;
};

/** @this {ItemUnit} */
Unit.prototype.equipItem = function (bodyLoc = -1) {
  // can't equip
  if (this === undefined || this.type !== sdk.unittype.Item || !this.canEquip()) return false;
  bodyLoc === -1 && (bodyLoc = this.bodyLocation().first());
  // Already equipped in the right slot
  if (this.mode === sdk.items.mode.Equipped && this.bodylocation === bodyLoc) return true;
  // failed to open stash
  if (this.isInStash && !Town.openStash()) return false;
  // failed to open cube
  if (this.isInCube && !Cubing.openCube()) return false;

  let rolledBack = false;
  // todo: sometimes rings get bugged with the higher tier ring ending up on the wrong finger, if this happens swap them

  for (let i = 0; i < 3; i += 1) {
    if (this.toCursor()) {
      clickItemAndWait(sdk.clicktypes.click.item.Left, bodyLoc);

      if (this.bodylocation === bodyLoc) {
        if (getCursorType() === 3) {
          let cursorItem = Game.getCursorUnit();

          if (cursorItem) {
            // rollback check
            let justEquipped = me.equipped.get(bodyLoc);
            if (NTIP.GetTier(cursorItem) > justEquipped.tier
              && !this.questItem
              /*Wierd bug with runewords that it'll fail to get correct item desc so don't attempt rollback*/
              && !justEquipped.isRuneword) {
              console.debug("ROLLING BACK TO OLD ITEM BECAUSE IT WAS BETTER");
              console.debug("OldItem: " + NTIP.GetTier(cursorItem) + " Just Equipped Item: " + me.equipped.get(bodyLoc).tier);
              clickItemAndWait(sdk.clicktypes.click.item.Left, bodyLoc);
              cursorItem = Game.getCursorUnit();
              rolledBack = true;
            }

            !this.shouldKeep() && this.drop();
          }
        }

        return rolledBack ? false : true;
      }
    }
  }

  return false;
};

Unit.prototype.secondaryEquip = function (bodyLoc = -1) {
  // can't equip
  if (this === undefined || this.type !== sdk.unittype.Item || (!this.canEquip() && me.expansion)) return false;
  bodyLoc === -1 && (bodyLoc = this.secondaryBodyLocation().first());
  // Already equipped in the right slot
  if (this.mode === sdk.items.mode.Equipped && this.bodylocation === bodyLoc) return true;
  // failed to open stash
  if (this.isInStash && !Town.openStash()) return false;
  // failed to open cube
  if (this.isInCube && !Cubing.openCube()) return false;

  me.switchWeapons(1);
  
  for (let i = 0; i < 3; i += 1) {
    if (this.toCursor()) {
      clickItemAndWait(sdk.clicktypes.click.item.Left, bodyLoc - 7);

      if (this.bodylocation === bodyLoc - 7) {
        if (getCursorType() === 3) {
          let cursorItem = Game.getCursorUnit();
          !!cursorItem && !this.shouldKeep() && this.drop();
        }

        me.switchWeapons(0);
        return true;
      }
    }
  }

  me.weaponswitch !== 0 && me.switchWeapons(0);

  return false;
};

Unit.prototype.equipMerc = function (bodyLoc = -1) {
  // can't equip
  if (this === undefined || this.type !== sdk.unittype.Item || !this.canEquipMerc()) return false;
  bodyLoc === -1 && (bodyLoc = this.mercBodyLocation().first());
  // Already equipped in the right slot
  if (this.mode === sdk.items.mode.Equipped && this.bodylocation === bodyLoc) return true;
  // failed to open stash
  if (this.isInStash && !Town.openStash()) return false;
  // failed to open cube
  if (this.isInCube && !Cubing.openCube()) return false;
  
  for (let i = 0; i < 3; i += 1) {
    if (this.toCursor()) {
      clickItemAndWait(sdk.clicktypes.click.item.Mercenary, bodyLoc);

      if (this.bodylocation === bodyLoc) {
        if (getCursorType() === 3) {
          let cursorItem = Game.getCursorUnit();
          !!cursorItem && !this.shouldKeep() && this.drop();
        }

        Developer.debugging.autoEquip && Item.logItem("Merc Equipped", me.getMerc().getItem(this.classid));
        Developer.logEquipped && MuleLogger.logEquippedItems();

        return true;
      }
    }
  }

  return false;
};
