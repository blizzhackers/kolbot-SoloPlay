/**
*  @filename    ItemPrototypes.js
*  @author      theBGuy
*  @desc        Item related prototypes
*  @notes       Unused, for now at least can't guarantee only units are attempting to use the prototypes
*               me.getItem(sdk.items.runes.Ber).getQuantityOwned() throws an error if we don't have a ber rune
*
*/

includeIfNotIncluded("SoloPlay/Functions/PrototypeOverrides.js");

Unit.prototype.getQuantityOwned = function (skipSameItem = false) {
  if (this === undefined || this.type !== sdk.unittype.Item) return 0;

  return me.getItemsEx()
    .filter(check =>
      check.itemType === this.itemType
      && (!skipSameItem || check.gid !== this.gid)
      && check.classid === this.classid
      && check.quality === this.quality
      && check.sockets === this.sockets
      && check.isInStorage
    ).length;
};

Unit.prototype.hasTier = function () {
  if (this === undefined || this.type !== sdk.unittype.Item) return false;
  return Config.AutoEquip && NTIP.GetTier(this) > 0;
};

Unit.prototype.hasSecondaryTier = function () {
  if (this === undefined || this.type !== sdk.unittype.Item) return false;
  return Config.AutoEquip && NTIP.GetSecondaryTier(this) > 0 && me.expansion;
};

Unit.prototype.hasMercTier = function () {
  if (this === undefined || this.type !== sdk.unittype.Item) return false;
  return Config.AutoEquip && NTIP.GetMercTier(this) > 0 && me.expansion;
};

Unit.prototype.bodyLocation = function () {
  if (this === undefined || this.type !== sdk.unittype.Item) return [];

  let bodyLoc = (() => {
    switch (true) {
    case Item.shieldTypes.includes(this.itemType):
      return sdk.body.LeftArm;
    case this.itemType === sdk.items.type.Armor:
      return sdk.body.Armor;
    case this.itemType === sdk.items.type.Ring:
      return [sdk.body.RingRight, sdk.body.RingLeft];
    case this.itemType === sdk.items.type.Amulet:
      return sdk.body.Neck;
    case this.itemType === sdk.items.type.Boots:
      return sdk.body.Feet;
    case this.itemType === sdk.items.type.Gloves:
      return sdk.body.Gloves;
    case this.itemType === sdk.items.type.Belt:
      return sdk.body.Belt;
    case Item.helmTypes.includes(this.itemType):
      return sdk.body.Head;
    case Item.weaponTypes.includes(this.itemType):
      return me.barbarian ? [sdk.body.RightArm, sdk.body.LeftArm] : sdk.body.RightArm;
    case [sdk.items.type.HandtoHand, sdk.items.type.AssassinClaw].includes(this.itemType):
      return !Check.currentBuild().caster && me.assassin ? [sdk.body.RightArm, sdk.body.LeftArm] : sdk.body.RightArm;
    default:
      return false;
    }
  })();

  return Array.isArray(bodyLoc) ? bodyLoc : [bodyLoc];
};

Unit.prototype.secondaryBodyLocation = function () {
  if (this === undefined || this.type !== sdk.unittype.Item) return [];

  let bodyLoc = (() => {
    switch (true) {
    case Item.shieldTypes.includes(this.itemType):
      return sdk.body.LeftArmSecondary;
    case Item.weaponTypes.includes(this.itemType):
      return me.barbarian ? [sdk.body.RightArmSecondary, sdk.body.LeftArmSecondary] : sdk.body.RightArmSecondary;
    case [sdk.items.type.HandtoHand, sdk.items.type.AssassinClaw].includes(this.itemType):
      return !Check.currentBuild().caster && me.assassin ? [sdk.body.RightArmSecondary, sdk.body.LeftArmSecondary] : sdk.body.RightArmSecondary;
    default:
      return false;
    }
  })();

  return Array.isArray(bodyLoc) ? bodyLoc : [bodyLoc];
};

Unit.prototype.mercBodyLocation = function () {
  if (this === undefined || this.type !== sdk.unittype.Item) return [];

  let mercenary = me.getMercEx();
  if (!mercenary) return [];

  let bodyLoc = (() => {
    switch (this.itemType) {
    case sdk.items.type.Shield:
      return (mercenary.classid === sdk.mercs.IronWolf ? sdk.body.LeftArm : []);
    case sdk.items.type.Armor:
      return sdk.body.Armor;
    case sdk.items.type.Helm:
    case sdk.items.type.Circlet:
      return sdk.body.Head;
    case sdk.items.type.PrimalHelm:
      return (mercenary.classid === sdk.mercs.A5Barb ? sdk.body.Head : []);
    case sdk.items.type.Bow:
      return (mercenary.classid === sdk.mercs.Rogue ? sdk.body.RightArm : []);
    case sdk.items.type.Spear:
    case sdk.items.type.Polearm:
      return (mercenary.classid === sdk.mercs.Guard ? sdk.body.RightArm : []);
    case sdk.items.type.Sword:
      return ([sdk.mercs.IronWolf, sdk.mercs.A5Barb].includes(mercenary.classid) ? sdk.body.RightArm : []);
    default:
      return false;
    }
  })();

  return Array.isArray(bodyLoc) ? bodyLoc : [bodyLoc];
};

Unit.prototype.canEquip = function () {
  if (this === undefined || this.type !== sdk.unittype.Item || !this.identified) return false;
  return me.charlvl >= this.getStat(sdk.stats.LevelReq) && me.trueStr >= this.strreq && me.trueDex >= this.dexreq;
};

Unit.prototype.canEquipMerc = function (bodyLoc = -1) {
  if (this === undefined || this.type !== sdk.unittype.Item || !this.identified || me.classic) return false;
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

Unit.prototype.autoEquipCheck = function (checkCanEquip = true) {
  if (!Config.AutoEquip) return true;
  if (this === undefined || this.type !== sdk.unittype.Item) return false;

  let tier = NTIP.GetTier(this);
  let	bodyLoc = this.bodyLocation();

  if (tier > 0 && bodyLoc.length) {
    for (let i = 0; i < bodyLoc.length; i += 1) {
      if (tier > me.equipped.get(bodyLoc[i]).tier && ((checkCanEquip ? this.canEquip() : true) || !this.identified)) {
        if (this.twoHanded && !me.barbarian) {
          if (tier < me.equipped.get(sdk.body.RightArm).tier + me.equipped.get(sdk.body.LeftArm).tier) return false;
        }

        if (!me.barbarian && bodyLoc[i] === 5 && me.equipped.get(bodyLoc[i]).tier === -1) {
          if (me.equipped.get(sdk.body.RightArm).twoHanded && tier < me.equipped.get(sdk.body.RightArm).tier) return false;
        }

        return true;
      }
    }
  }

  return false;
};

Unit.prototype.autoEquipCheckSecondary = function (checkCanEquip = true) {
  if (!Config.AutoEquip) return true;
  if (this === undefined || this.type !== sdk.unittype.Item || me.classic) return false;

  let tier = NTIP.GetSecondaryTier(this);
  let	bodyLoc = this.secondaryBodyLocation();

  if (tier > 0 && bodyLoc.length) {
    for (let i = 0; i < bodyLoc.length; i += 1) {
      if (tier > me.equipped.get(bodyLoc[i]).secondaryTier && ((checkCanEquip ? this.canEquip() : true) || !this.identified)) {
        if (this.twoHanded && !me.barbarian) {
          if (tier < me.equipped.get(sdk.body.RightArmSecondary).secondaryTier + me.equipped.get(sdk.body.LeftArmSecondary).secondaryTier) return false;
        }

        if (!me.barbarian && bodyLoc[i] === 12 && me.equipped.get(bodyLoc[i]).secondaryTier === -1) {
          if (me.equipped.get(sdk.body.RightArmSecondary).twoHanded && tier < me.equipped.get(sdk.body.RightArmSecondary).secondaryTier) return false;
        }

        return true;
      }
    }
  }

  return false;
};

Unit.prototype.autoEquipCheckMerc = function (checkCanEquip = true) {
  if (!Config.AutoEquip) return true;
  if (this === undefined || this.type !== sdk.unittype.Item || me.classic || !me.getMercEx()) return false;

  let tier = NTIP.GetMercTier(this);
  let	bodyLoc = this.mercBodyLocation();

  if (tier > 0 && bodyLoc.length) {
    for (let i = 0; i < bodyLoc.length; i += 1) {
      let oldTier = Item.getMercEquipped(bodyLoc[i]).tier;

      if (tier > oldTier && ((checkCanEquip ? this.canEquipMerc() : true) || !this.identified)) {
        return true;
      }
    }
  }

  return false;
};

Unit.prototype.shouldKeep = function () {
  if (this === undefined || this.type !== sdk.unittype.Item) return false;

  if (Pickit.checkItem(this).result === 1
    // only keep wanted items or cubing items (in rare cases where weapon being used is also a cubing wanted item)
    || (this.unique && Pickit.checkItem(this).result === 2)
    // or keep if item is worth selling
    || (this.getItemCost(sdk.items.cost.ToSell) / (this.sizex * this.sizey) >= (!me.inTown && me.charlvl < 12 ? 5 : me.normal ? 50 : me.nightmare ? 500 : 1000))) {
    if ((Storage.Inventory.CanFit(this) && Storage.Inventory.MoveTo(this))) {
      !AutoEquip.wanted(this) && NTIP.CheckItem(this, NTIP.CheckList) === Pickit.Result.UNWANTED && Town.sell.push(this);
      return true;
    }
  }

  return false;
};

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
            if (NTIP.GetTier(cursorItem) > justEquipped.tier && !this.questItem && !justEquipped.isRuneword/*Wierd bug with runewords that it'll fail to get correct item desc so don't attempt rollback*/) {
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
