/**
*  @filename    ItemPrototypes.js
*  @author      theBGuy
*  @desc        Item related prototypes
*  @notes       Unused, for now at least can't guarantee only units are attempting to use the prototypes
*               me.getItem(sdk.items.runes.Ber).getQuantityOwned() throws an error if we don't have a ber rune
*
*/

!isIncluded("SoloPlay/Functions/PrototypesOverrides.js") && include("SoloPlay/Functions/PrototypesOverrides.js");

Unit.prototype.getQuantityOwned = function () {
	if (this === undefined || this.type !== sdk.unittype.Item) return 0;

	let myItems = me.getItemsEx()
		.filter(check =>
			check.itemType === this.itemType
			&& check.classid === this.classid
			&& check.quality === this.quality
			&& check.sockets === this.sockets
			&& check.isInStorage
		);
	return myItems.length;
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

	let bodyLoc;

	switch (this.itemType) {
	case sdk.itemtype.Shield:
	case sdk.itemtype.AuricShields:
	case sdk.itemtype.VoodooHeads:
	case sdk.itemtype.BowQuiver:
	case sdk.itemtype.CrossbowQuiver:
		bodyLoc = 5;

		break;
	case sdk.itemtype.Armor:
		bodyLoc = 3;

		break;
	case sdk.itemtype.Ring:
		bodyLoc = [6, 7];

		break;
	case sdk.itemtype.Amulet:
		bodyLoc = 2;

		break;
	case sdk.itemtype.Boots:
		bodyLoc = 9;

		break;
	case sdk.itemtype.Gloves:
		bodyLoc = 10;

		break;
	case sdk.itemtype.Belt:
		bodyLoc = 8;

		break;
	case sdk.itemtype.Helm:
	case sdk.itemtype.PrimalHelm:
	case sdk.itemtype.Circlet:
	case sdk.itemtype.Pelt:
		bodyLoc = 1;

		break;
	case sdk.itemtype.Scepter:
	case sdk.itemtype.Wand:
	case sdk.itemtype.Staff:
	case sdk.itemtype.Bow:
	case sdk.itemtype.Axe:
	case sdk.itemtype.Club:
	case sdk.itemtype.Sword:
	case sdk.itemtype.Hammer:
	case sdk.itemtype.Knife:
	case sdk.itemtype.Spear:
	case sdk.itemtype.Polearm:
	case sdk.itemtype.Crossbow:
	case sdk.itemtype.Mace:
	case sdk.itemtype.ThrowingKnife:
	case sdk.itemtype.ThrowingAxe:
	case sdk.itemtype.Javelin:
	case sdk.itemtype.Orb:
	case sdk.itemtype.AmazonBow:
	case sdk.itemtype.AmazonSpear:
	case sdk.itemtype.AmazonJavelin:
	case sdk.itemtype.MissilePotion:
		bodyLoc = me.barbarian ? [4, 5] : 4;

		break;
	case sdk.itemtype.HandtoHand:
	case sdk.itemtype.AssassinClaw:
		bodyLoc = !Check.currentBuild().caster && me.assassin ? [4, 5] : 4;

		break;
	default:
		return [];
	}

	return Array.isArray(bodyLoc) ? bodyLoc : [bodyLoc];
};

Unit.prototype.secondaryBodyLocation = function () {
	if (this === undefined || this.type !== sdk.unittype.Item) return [];

	let bodyLoc;

	switch (this.itemType) {
	case sdk.itemtype.Shield:
	case sdk.itemtype.AuricShields:
	case sdk.itemtype.VoodooHeads:
	case sdk.itemtype.BowQuiver:
	case sdk.itemtype.CrossbowQuiver:
		bodyLoc = 12;

		break;
	case sdk.itemtype.Scepter:
	case sdk.itemtype.Wand:
	case sdk.itemtype.Staff:
	case sdk.itemtype.Bow:
	case sdk.itemtype.Axe:
	case sdk.itemtype.Club:
	case sdk.itemtype.Sword:
	case sdk.itemtype.Hammer:
	case sdk.itemtype.Knife:
	case sdk.itemtype.Spear:
	case sdk.itemtype.Polearm:
	case sdk.itemtype.Crossbow:
	case sdk.itemtype.Mace:
	case sdk.itemtype.ThrowingKnife:
	case sdk.itemtype.ThrowingAxe:
	case sdk.itemtype.Javelin:
	case sdk.itemtype.Orb:
	case sdk.itemtype.AmazonBow:
	case sdk.itemtype.AmazonSpear:
	case sdk.itemtype.AmazonJavelin:
	case sdk.itemtype.MissilePotion:
		bodyLoc = me.barbarian ? [11, 12] : 11;

		break;
	case sdk.itemtype.HandtoHand:
	case sdk.itemtype.AssassinClaw:
		bodyLoc = !Check.currentBuild().caster && me.assassin ? [11, 12] : 11;

		break;
	default:
		return [];
	}

	return Array.isArray(bodyLoc) ? bodyLoc : [bodyLoc];
};

Unit.prototype.mercBodyLocation = function () {
	if (this === undefined || this.type !== sdk.unittype.Item) return [];

	let bodyLoc, mercenary = Mercenary.getMercFix();
	if (!mercenary) return [];

	switch (this.itemType) {
	case sdk.itemtype.Shield:
		if (mercenary.classid === sdk.monsters.mercs.IronWolf) {
			bodyLoc = 5;
		}

		break;
	case sdk.itemtype.Armor:
		bodyLoc = 3;

		break;
	case sdk.itemtype.Helm:
	case sdk.itemtype.Circlet:
		bodyLoc = 1;

		break;
	case sdk.itemtype.PrimalHelm:
		if (mercenary.classid === sdk.monsters.mercs.A5Barb) {
			bodyLoc = 1;
		}
		
		break;
	case sdk.itemtype.Bow:
		if (mercenary.classid === sdk.monsters.mercs.Rogue) {
			bodyLoc = 4;
		}

		break;
	case sdk.itemtype.Spear:
	case sdk.itemtype.Polearm:
		if (mercenary.classid === sdk.monsters.mercs.Guard) {
			bodyLoc = 4;
		}

		break;
	case sdk.itemtype.Sword:
		if (mercenary.classid === sdk.monsters.mercs.IronWolf
			|| mercenary.classid === sdk.monsters.mercs.A5Barb) {
			bodyLoc = 4;
		}

		break;
	default:
		return [];
	}

	return Array.isArray(bodyLoc) ? bodyLoc : [bodyLoc];
};

Unit.prototype.canEquip = function () {
	if (this === undefined || this.type !== sdk.unittype.Item || !this.identified) return false;
	return me.charlvl >= this.getStat(sdk.stats.LevelReq) && me.trueStr >= this.strreq && me.trueDex >= this.dexreq;
};

Unit.prototype.canEquipMerc = function (bodyLoc = -1) {
	if (this === undefined || this.type !== sdk.unittype.Item || !this.identified || me.classic) return false;
	let mercenary = Mercenary.getMercFix();

	// dont have merc or he is dead
	if (!mercenary) return false;
	let curr = Item.getEquippedItemMerc(bodyLoc);

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
			if (tier > Item.getEquippedItem(bodyLoc[i]).tier
                && ((checkCanEquip ? this.canEquip() : true) || !this.identified)) {
				if (this.twoHanded && !me.barbarian) {
					if (tier < Item.getEquippedItem(4).tier + Item.getEquippedItem(5).tier) return false;
				}

				if (!me.barbarian && bodyLoc[i] === 5 && Item.getEquippedItem(bodyLoc[i]).tier === -1) {
					if (Item.getEquippedItem(4).twoHanded && tier < Item.getEquippedItem(4).tier) return false;
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
			if (tier > Item.getEquippedItem(bodyLoc[i]).secondarytier
                && ((checkCanEquip ? this.canEquip() : true) || !this.identified)) {
				if (this.twoHanded && !me.barbarian) {
					if (tier < Item.getEquippedItem(11).secondarytier + Item.getEquippedItem(12).secondarytier) return false;
				}

				if (!me.barbarian && bodyLoc[i] === 12 && Item.getEquippedItem(bodyLoc[i]).secondarytier === -1) {
					if (Item.getEquippedItem(11).twoHanded && tier < Item.getEquippedItem(11).secondarytier) return false;
				}

				return true;
			}
		}
	}

	return false;
};

Unit.prototype.autoEquipCheckMerc = function (checkCanEquip = true) {
	if (!Config.AutoEquip) return true;
	if (this === undefined || this.type !== sdk.unittype.Item || me.classic || !Mercenary.getMercFix()) return false;

	let tier = NTIP.GetMercTier(this);
	let	bodyLoc = this.mercBodyLocation();

	if (tier > 0 && bodyLoc.length) {
		for (let i = 0; i < bodyLoc.length; i += 1) {
			let oldTier = Item.getEquippedItemMerc(bodyLoc[i]).tier;

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
		|| (this.getItemCost(sdk.items.cost.ToSell) / (this.sizex * this.sizey) >= (me.normal ? 50 : me.nightmare ? 500 : 1000))) {
		return (Storage.Inventory.CanFit(this) && Storage.Inventory.MoveTo(this));
	}

	return false;
};

Unit.prototype.equipItem = function (bodyLoc = -1) {
	// can't equip
	if (this === undefined || this.type !== sdk.unittype.Item || !this.canEquip()) return false;
	bodyLoc === -1 && (bodyLoc = this.bodyLocation().first());
	// Already equipped in the right slot
	if (this.mode === sdk.itemmode.Equipped && this.bodylocation === bodyLoc) return true;
	// failed to open stash
	if (this.isInStash && !Town.openStash()) return false;
	// failed to open cube
	if (this.isInCube && !Cubing.openCube()) return false;

	let rolledBack = false;
	// todo: sometimes rings get bugged with the higher tier ring ending up on the wrong finger, if this happens swap them

	for (let i = 0; i < 3; i += 1) {
		if (this.toCursor()) {
			clickItemAndWait(0, bodyLoc);

			if (this.bodylocation === bodyLoc) {
				if (getCursorType() === 3) {
					let cursorItem = Game.getCursorUnit();

					if (cursorItem) {
						// rollback check
						let justEquipped = Item.getEquippedItem(bodyLoc);
						if (NTIP.GetTier(cursorItem) > justEquipped.tier && !this.questItem && !justEquipped.isRuneword/*Wierd bug with runewords that it'll fail to get correct item desc so don't attempt rollback*/) {
							console.debug("ROLLING BACK TO OLD ITEM BECAUSE IT WAS BETTER");
							console.debug("OldItem: " + NTIP.GetTier(cursorItem) + " Just Equipped Item: " + Item.getEquippedItem(bodyLoc).tier);
							clickItemAndWait(0, bodyLoc);
							cursorItem = Game.getCursorUnit();
							rolledBack = true;
						}

						if (!this.shouldKeep()) {
							this.drop();
						}
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
	if (this.mode === sdk.itemmode.Equipped && this.bodylocation === bodyLoc) return true;
	// failed to open stash
	if (this.isInStash && !Town.openStash()) return false;
	// failed to open cube
	if (this.isInCube && !Cubing.openCube()) return false;

	me.switchWeapons(1);
	
	for (let i = 0; i < 3; i += 1) {
		if (this.toCursor()) {
			clickItemAndWait(0, bodyLoc - 7);

			if (this.bodylocation === bodyLoc - 7) {
				if (getCursorType() === 3) {
					let cursorItem = Game.getCursorUnit();

					if (cursorItem) {
						if (!this.shouldKeep()) {
							this.drop();
						}
					}
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
	if (this.mode === sdk.itemmode.Equipped && this.bodylocation === bodyLoc) return true;
	// failed to open stash
	if (this.isInStash && !Town.openStash()) return false;
	// failed to open cube
	if (this.isInCube && !Cubing.openCube()) return false;
	
	for (let i = 0; i < 3; i += 1) {
		if (this.toCursor()) {
			clickItemAndWait(4, bodyLoc);

			if (this.bodylocation === bodyLoc) {
				if (getCursorType() === 3) {
					let cursorItem = Game.getCursorUnit();

					if (cursorItem) {
						if (!this.shouldKeep()) {
							this.drop();
						}
					}
				}

				Developer.debugging.autoEquip && Misc.logItem("Merc Equipped", me.getMerc().getItem(this.classid));
				Developer.logEquipped && MuleLogger.logEquippedItems();

				return true;
			}
		}
	}

	return false;
};
