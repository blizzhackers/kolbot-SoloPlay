/*
*	@filename	ItemOverrides.js
*	@author		theBGuy
*	@credits	isid0re, sorc/sonic
*	@desc		Misc.js Item function fixes to improve functionality and Autoequip
*/

if (!isIncluded("common/Misc.js")) { include("common/Misc.js"); }

Item.getQuantityOwned = function (item) {
	let list = [];

	if (item === undefined) {
		return 0;
	}

	let myItems = me.getItems()
		.filter(check =>
			check.itemType === item.itemType// same item type as current
				&& check.classid === item.classid// same item classid as current
				&& check.quality === item.quality// same item quality as current
				&& check.getStat(sdk.stats.NumSockets) === item.getStat(sdk.stats.NumSockets) // sockets match junk in review
				&& check.isInStorage
		);

	for (let i = 0; i < myItems.length; i++) {
		if (list.indexOf(myItems[i]) === -1) {
			list.push(myItems[i]);
		}
	}

	return myItems.length;
};

Item.getBodyLoc = function (item) {
	let bodyLoc;

	switch (item.itemType) {
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
		if (me.barbarian) {
			bodyLoc = [4, 5];

			break;
		}

		bodyLoc = 4;

		break;
	case sdk.itemtype.HandtoHand:
	case sdk.itemtype.AssassinClaw:
		if (!Check.currentBuild().caster && me.assassin) {
			bodyLoc = [4, 5];

			break;
		}

		bodyLoc = 4;

		break;
	default:
		return false;
	}

	if (typeof bodyLoc === "number") {
		bodyLoc = [bodyLoc];
	}

	return bodyLoc;
};


Item.getEquippedItem = function (bodyLoc) {
	let item = me.getItem();

	if (item) {
		do {
			if (item.location === sdk.storage.Equipped && item.bodylocation === bodyLoc) {
				return {
					classid: item.classid,
					name: item.name,
					fname: item.fname,
					prefixnum: item.prefixnum,
					itemType: item.itemType,
					quality: item.quality,
					tier: NTIP.GetTier(item),
					secondarytier: NTIP.GetSecondaryTier(item),
					str: item.getStatEx(sdk.stats.Strength),
					dex: item.getStatEx(sdk.stats.Dexterity),
					durability: (item.getStat(72) * 100 / item.getStat(73)),
					sockets: item.getStat(sdk.stats.NumSockets),
					socketed: !item.getItems(),
					isRuneword: item.getFlag(0x4000000),
					twoHanded: item.twoHanded,
				};
			}
		} while (item.getNext());
	}

	// Don't have anything equipped in there
	return {
		classid: -1,
		name: "none",
		fname: "none",
		prefixnum: -1,
		itemType: -1,
		quality: -1,
		tier: -1,
		secondarytier: -1,
		str: 0,
		dex: 0,
		durability: 0,
		sockets: 0,
		socketed: false,
		isRuneword: false,
		twoHanded: false,
	};
};

Item.canEquip = function (item) {
	// Not an item
	if (item.type !== sdk.unittype.Item) {
		return false;
	}

	if (!item.identified) {
		return false;
	}
	
	return me.charlvl >= item.getStat(sdk.stats.LevelReq) && me.trueStr >= item.strreq && me.trueDex >= item.dexreq;
};

Item.autoEquipCheck = function (item) {
	if (!Config.AutoEquip) {
		return true;
	}

	let tier = NTIP.GetTier(item),
		bodyLoc = this.getBodyLoc(item);

	if (tier > 0 && bodyLoc) {
		for (let i = 0; i < bodyLoc.length; i += 1) {
			if (tier > this.getEquippedItem(bodyLoc[i]).tier && (this.canEquip(item) || !item.identified)) {
				if (item.twoHanded && !me.barbarian) {
					if (tier < this.getEquippedItem(4).tier + this.getEquippedItem(5).tier) {
						return false;
					}
				}

				if (!me.barbarian && bodyLoc[i] === 5 && this.getEquippedItem(bodyLoc[i]).tier === -1) {
					if (this.getEquippedItem(4).twoHanded && tier < this.getEquippedItem(4).tier) {
						return false;
					}
				}
				return true;
			}
		}
	}

	return false;
};

Item.autoEquipKeepCheck = function (item) {
	if (!Config.AutoEquip) {
		return true;
	}

	let tier = NTIP.GetTier(item),
		bodyLoc = this.getBodyLoc(item);

	if (tier > 0 && bodyLoc) {
		for (let i = 0; i < bodyLoc.length; i += 1) {
			if (tier > this.getEquippedItem(bodyLoc[i]).tier) {
				if (item.twoHanded && !me.barbarian) {
					if (tier < this.getEquippedItem(4).tier + this.getEquippedItem(5).tier) {
						return false;
					}
				}

				if (!me.barbarian && bodyLoc[i] === 5 && this.getEquippedItem(bodyLoc[i]).tier === -1) {
					if (this.getEquippedItem(4).twoHanded && tier < this.getEquippedItem(4).tier) {
						return false;
					}
				}
				return true;
			}
		}
	}

	return false;
};

Item.autoEquip = function () {
	if (!Config.AutoEquip) {
		return true;
	}

	print("ÿc8Kolbot-SoloPlayÿc0: Entering auto equip");
	let tick = getTickCount();

	// Set trueStr and trueDex values rather than having to find them everytime.
	if (me.trueStr < me.rawStrength) {
		me.trueStr = me.rawStrength;
	}

	if (me.trueDex < me.rawDexterity) {
		me.trueDex = me.rawDexterity;
	}

	let tier, bodyLoc, tome, gid,
		items = me.findItems(-1, 0);

	if (!items) {
		return false;
	}

	function sortEq (a, b) {
		if (Item.canEquip(a)) {
			return -1;
		}

		if (Item.canEquip(b)) {
			return 1;
		}

		return 0;
	}

	me.cancel();

	// Remove items without tier
	for (let i = 0; i < items.length; i += 1) {
		if (NTIP.GetTier(items[i]) === 0) {
			items.splice(i, 1);

			i -= 1;
		}
	}

	while (items.length > 0) {
		items.sort(sortEq);

		tier = NTIP.GetTier(items[0]);
		bodyLoc = this.getBodyLoc(items[0]);

		if (tier > 0 && bodyLoc) {
			for (let j = 0; j < bodyLoc.length; j += 1) {
				if (items[0].isInStorage && tier > this.getEquippedItem(bodyLoc[j]).tier && this.getEquippedItem(bodyLoc[j]).classid !== sdk.items.quest.KhalimsWill) {
					if (!items[0].identified) {
						tome = me.findItem(519, 0, 3);

						if (tome && tome.getStat(sdk.stats.Quantity) > 0) {
							if (items[0].isInStash) {
								Town.openStash();
							}

							Town.identifyItem(items[0], tome);
						}
					}

					if (items[0].twoHanded && !me.barbarian) {
						if (tier < this.getEquippedItem(4).tier + this.getEquippedItem(5).tier) {
							continue;
						}
						print("ÿc9AutoEquipÿc0 :: TwoHandedWep better than sum tier of currently equipped main + shield hand : " + items[0].fname + " Tier: " + tier);
					}

					if (!me.barbarian && bodyLoc[j] === 5 && this.getEquippedItem(bodyLoc[j]).tier === -1) {
						if (this.getEquippedItem(4).twoHanded && tier < this.getEquippedItem(4).tier) {
							continue;
						}
						print("ÿc9AutoEquipÿc0 :: TwoHandedWep not as good as what we want to equip on our shield hand : " + items[0].fname + " Tier: " + tier);
					}

					gid = items[0].gid;

					print(items[0].name);

					if (this.equip(items[0], bodyLoc[j])) {
						print("ÿc9AutoEquipÿc0 :: Equipped: " + items[0].fname + " Tier: " + tier);

						if (Developer.Debugging.autoEquip) {
							Misc.logItem("Equipped", me.getItem(-1, -1, gid));
						}

						if (Developer.logEquipped) {
							MuleLogger.logEquippedItems();
						}
					} else if (items[0].lvlreq > me.charlvl && !items[0].isInStash) {
						if (Storage.Stash.CanFit(items[0])) {
							print("ÿc9AutoEquipÿc0 :: Item level is to high, attempting to stash for now as its better than what I currently have: " + items[0].fname + " Tier: " + tier);
							Storage.Stash.MoveTo(items[0]);
						}
					}

					break;
				}
			}
		}

		items.shift();
	}

	print("ÿc8Kolbot-SoloPlayÿc0: Exiting auto equip. Time elapsed: " + Developer.formatTime(getTickCount() - tick));
	return true;
};

Item.equip = function (item, bodyLoc) {
	if (!this.canEquip(item)) {
		return false;
	}

	// Already equipped in the right slot
	if (item.mode === sdk.itemmode.Equipped && item.bodylocation === bodyLoc) {
		return true;
	}

	let i, cursorItem;

	if (item.isInStash) {
		if (!Town.openStash()) {
			return false;
		}
	}

	if (item.location === sdk.storage.Cube) {
		if (!Town.openStash() && !Cubing.openCube()) {
			return false;
		}
	}

	for (i = 0; i < 3; i += 1) {
		if (item.toCursor()) {
			clickItemAndWait(0, bodyLoc);

			if (item.bodylocation === bodyLoc) {
				if (getCursorType() === 3) {
					cursorItem = getUnit(100);

					if (cursorItem) {
						if (Pickit.checkItem(cursorItem).result === 1 ||
						(cursorItem.quality === 7 && Pickit.checkItem(cursorItem).result === 2) || // only keep wanted items or cubing items (in rare cases where weapon being used is also a cubing wanted item)
						(cursorItem.getItemCost(1) / (cursorItem.sizex * cursorItem.sizey) >= (me.normal ? 50 : me.nightmare ? 500 : 1000))) {	// or keep if item is worth selling
							if (Storage.Inventory.CanFit(cursorItem)) {
								Storage.Inventory.MoveTo(cursorItem);
							}
						} else {
							cursorItem.drop();
						}
					}
				}

				return true;
			}
		}
	}

	return false;
};

Item.removeItem = function (bodyLoc) {
	let cursorItem,
		removable = me.getItems()
			.filter(item =>
				item.mode === sdk.itemmode.Equipped
				&& item.bodylocation === bodyLoc
			)
			.first();

	if (!me.inTown) {
		Town.goToTown();
	}

	if (!getUIFlag(sdk.uiflags.Stash)) {
		Town.openStash();
	}

	if (removable) {
		removable.toCursor();
		cursorItem = getUnit(100);

		if (cursorItem) {
			// only keep wanted items
			if (Pickit.checkItem(cursorItem).result === 1) {
				if (Storage.Inventory.CanFit(cursorItem)) {
					Storage.Inventory.MoveTo(cursorItem);
				} else if (Storage.Stash.CanFit(cursorItem)) {
					Storage.Stash.MoveTo(cursorItem);
				} else if (Storage.Cube.CanFit(cursorItem)) {
					Storage.Cube.MoveTo(cursorItem);
				}
			} else {
				D2Bot.printToConsole("Dropped " + cursorItem.fname + " during un-equip process", 9);
				cursorItem.drop();
			}
		}

		return true;
	}

	return false;
};

Item.hasSecondaryTier = function (item) {
	return Config.AutoEquip && NTIP.GetSecondaryTier(item) > 0 && !me.classic;
};

Item.getBodyLocSecondary = function (item) {
	let bodyLoc;

	switch (item.itemType) {
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
		if (me.barbarian) {
			bodyLoc = [11, 12];
		} else {
			bodyLoc = 11;
		}

		break;
	case sdk.itemtype.HandtoHand:
	case sdk.itemtype.AssassinClaw:
		if (!Check.currentBuild().caster && me.assassin) {
			bodyLoc = [11, 12];

			break;
		}

		bodyLoc = 11;

		break;
	default:
		return false;
	}

	if (typeof bodyLoc === "number") {
		bodyLoc = [bodyLoc];
	}

	return bodyLoc;
};

Item.secondaryEquip = function (item, bodyLoc) {
	if (!this.canEquip(item) && !me.classic) {
		return false;
	}

	// Already equipped in the right slot
	if (item.mode === sdk.itemmode.Equipped && item.bodylocation === bodyLoc) {
		return true;
	}

	let i, cursorItem;

	if (item.isInStash) {
		if (!Town.openStash()) {
			return false;
		}
	}

	me.switchWeapons(1); // Switch weapons

	for (i = 0; i < 3; i += 1) {
		if (item.toCursor()) {
			clickItemAndWait(0, bodyLoc - 7);


			if (item.bodylocation === bodyLoc - 7) {
				if (getCursorType() === 3) {
					cursorItem = getUnit(100);

					if (cursorItem) {
						if (Pickit.checkItem(cursorItem).result === 1 ||
						(cursorItem.quality === 7 && Pickit.checkItem(cursorItem).result === 2) || // only keep wanted items or cubing items (in rare cases where weapon being used is also a cubing wanted item)
						(cursorItem.getItemCost(1) / (cursorItem.sizex * cursorItem.sizey) >= (me.normal ? 50 : me.nightmare ? 500 : 1000))) {	// or keep if item is worth selling
							if (Storage.Inventory.CanFit(cursorItem)) {
								Storage.Inventory.MoveTo(cursorItem);
							}
						} else {
							cursorItem.drop();
						}
					}
				}

				me.switchWeapons(0); // Switch back to primary
				return true;
			}
		}
	}

	if (me.weaponswitch !== 0) {
		// Switch back to primary
		Attack.weaponSwitch(0);
	}

	return false;
};

Item.autoEquipCheckSecondary = function (item) {
	if (!Config.AutoEquip) {
		return true;
	}
	
	if (me.classic) {
		return false;
	}

	let tier = NTIP.GetSecondaryTier(item),
		bodyLoc = Item.getBodyLocSecondary(item);

	for (let i = 0; tier > 0 && i < bodyLoc.length; i += 1) {
		if (tier > Item.getEquippedItem(bodyLoc[i]).secondarytier && (Item.canEquip(item) || !item.identified)) {
			return true;
		}
	}

	return false;
};

Item.autoEquipSecondary = function () {
	if (!Config.AutoEquip || me.classic) {
		return true;
	}

	print("ÿc8Kolbot-SoloPlayÿc0: Entering secondary auto equip");
	let tick = getTickCount();

	let tier, bodyLoc, tome, gid,
		items = me.findItems(-1, 0);

	if (!items) {
		return false;
	}

	function sortEq (a, b) {
		if (Item.canEquip(a)) {
			return -1;
		}

		if (Item.canEquip(b)) {
			return 1;
		}

		return 0;
	}

	me.cancel();

	// Remove items without tier
	for (let i = 0; i < items.length; i += 1) {
		if (NTIP.GetSecondaryTier(items[i]) === 0) {
			items.splice(i, 1);

			i -= 1;
		}
	}

	while (items.length > 0) {
		items.sort(sortEq);

		tier = NTIP.GetSecondaryTier(items[0]);
		bodyLoc = this.getBodyLocSecondary(items[0]);

		if (tier > 0 && bodyLoc) {
			for (let j = 0; j < bodyLoc.length; j += 1) {
				if ([sdk.storage.Inventory, sdk.storage.Stash].indexOf(items[0].location) > -1 && tier > this.getEquippedItem(bodyLoc[j]).secondarytier && this.getEquippedItem(bodyLoc[j]).classid !== sdk.items.quest.KhalimsWill) {
					if (!items[0].identified) {
						tome = me.findItem(519, 0, 3);

						if (tome && tome.getStat(sdk.stats.Quantity) > 0) {
							if (items[0].isInStash) {
								Town.openStash();
							}

							Town.identifyItem(items[0], tome);
						}
					}

					gid = items[0].gid;

					print(items[0].name);

					if (this.secondaryEquip(items[0], bodyLoc[j])) {
						print("ÿc9SecondaryEquipÿc0 :: Equipped: " + items[0].fname + " SecondaryTier: " + tier);

						if (Developer.Debugging.autoEquip) {
							Misc.logItem("Equipped switch", me.getItem(-1, -1, gid));
						}

						if (Developer.logEquipped) {
							MuleLogger.logEquippedItems();
						}
					}

					break;
				}
			}
		}

		items.shift();
	}

	print("ÿc8Kolbot-SoloPlayÿc0: Exiting secondary auto equip. Time elapsed: " + Developer.formatTime(getTickCount() - tick));
	return true;
};

//AUTO EQUIP MERC - modified from dzik's
Item.hasMercTier = function (item) {
	return Config.AutoEquip && NTIP.GetMercTier(item) > 0 && !me.classic;
};

Item.canEquipMerc = function (item, bodyLoc) {
	if (item.type !== sdk.unittype.Item || me.classic) {
		return false;
	}

	let mercenary = Merc.getMercFix();

	// dont have merc or he is dead
	if (!mercenary) {
		return false;
	}

	if (!item.identified) {
		return false;
	}

	let curr = Item.getEquippedItemMerc(bodyLoc);

	// Higher requirements
	if (item.getStat(sdk.stats.LevelReq) > mercenary.getStat(sdk.stats.Level) || item.dexreq > mercenary.getStat(sdk.stats.Dexterity) - curr.dex || item.strreq > mercenary.getStat(sdk.stats.Strength) - curr.str) {
		return false;
	}

	return true;
};

Item.equipMerc = function (item, bodyLoc) {
	let cursorItem, mercenary = Merc.getMercFix();

	// dont have merc or he is dead
	if (!mercenary) {
		return false;
	}

	if (!Item.canEquipMerc(item, bodyLoc)) {
		return false;
	}

	// Already equipped in the right slot
	if (item.mode === sdk.itemmode.Equipped && item.bodylocation === bodyLoc) {
		return true;
	}

	if (item.isInStash) {
		if (!Town.openStash()) {
			return false;
		}
	}

	for (let i = 0; i < 3; i += 1) {
		if (item.toCursor()) {
			if (clickItem(4, bodyLoc)) {
				delay(500 + me.ping * 2);

				if (Developer.Debugging.autoEquip) {
					Misc.logItem("Merc Equipped", mercenary.getItem(item.classid));
				}
			}

			if (item.bodylocation === bodyLoc) {
				if (getCursorType() === 3) {
					cursorItem = getUnit(100);

					if (cursorItem) {
						if (Pickit.checkItem(cursorItem).result === 1 ||
						(cursorItem.quality === 7 && Pickit.checkItem(cursorItem).result === 2) || // only keep wanted items or cubing items (in rare cases where weapon being used is also a cubing wanted item)
						(cursorItem.getItemCost(1) / (cursorItem.sizex * cursorItem.sizey) >= (me.normal ? 50 : me.nightmare ? 500 : 1000))) {	// or keep if item is worth selling
							if (Storage.Inventory.CanFit(cursorItem)) {
								Storage.Inventory.MoveTo(cursorItem);
							}
						} else {
							cursorItem.drop();
						}
					}
				}

				if (Developer.logEquipped) {
					MuleLogger.logEquippedItems();
				}

				return true;
			}
		}
	}

	return false;
};

Item.getEquippedItemMerc = function (bodyLoc) {
	let mercenary = Merc.getMercFix();

	if (mercenary) {
		let item = mercenary.getItem();

		if (item) {
			do {
				if (item.bodylocation === bodyLoc && item.location === sdk.storage.Equipped) {
					return {
						classid: item.classid,
						prefixnum: item.prefixnum,
						tier: NTIP.GetMercTier(item),
						name: item.fname,
						str: item.getStatEx(sdk.stats.Strength),
						dex: item.getStatEx(sdk.stats.Dexterity)
					};
				}
			} while (item.getNext());
		}
	}

	return { // Don't have anything equipped in there
		classid: -1,
		prefixnum: -1,
		tier: -1,
		name: "none",
		str: 0,
		dex: 0
	};
};

Item.getBodyLocMerc = function (item) {
	let bodyLoc = false, mercenary = Merc.getMercFix();

	// dont have merc or he is dead
	if (!mercenary) {
		return false;
	}

	switch (item.itemType) {
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
		if (mercenary.classid === sdk.monsters.mercs.IronWolf || mercenary.classid === sdk.monsters.mercs.A5Barb) {
			bodyLoc = 4;
		}

		break;
	default:
		return false;
	}

	if (typeof bodyLoc === "number") {
		bodyLoc = [bodyLoc];
	}

	return bodyLoc;
};

Item.autoEquipCheckMerc = function (item) {
	if (!Config.AutoEquip) {
		return true;
	}

	if (Config.AutoEquip && !Merc.getMercFix()) {
		return false;
	}

	let tier = NTIP.GetMercTier(item), bodyLoc = Item.getBodyLocMerc(item);

	if (tier > 0 && bodyLoc) {
		for (let i = 0; i < bodyLoc.length; i += 1) {
			let oldTier = Item.getEquippedItemMerc(bodyLoc[i]).tier; // Low tier items shouldn't be kept if they can't be equipped

			if (tier > oldTier && (Item.canEquipMerc(item) || !item.identified)) {
				return true;
			}
		}
	}

	return false;
};

Item.autoEquipKeepCheckMerc = function (item) {
	if (!Config.AutoEquip) {
		return true;
	}

	if (Config.AutoEquip && !Merc.getMercFix()) {
		return false;
	}

	let tier = NTIP.GetMercTier(item), bodyLoc = Item.getBodyLocMerc(item);

	if (tier > 0 && bodyLoc) {
		for (let i = 0; i < bodyLoc.length; i += 1) {
			let oldTier = Item.getEquippedItemMerc(bodyLoc[i]).tier; // Low tier items shouldn't be kept if they can't be equipped

			if (tier > oldTier) {
				return true;
			}
		}
	}

	return false;
};

Item.autoEquipMerc = function () {
	if (!Config.AutoEquip || !Merc.getMercFix()) {
		return true;
	}

	let tier, bodyLoc, tome, scroll, items = me.findItems(-1, 0);

	if (!items) {
		return false;
	}

	function sortEq (a, b) {
		if (Item.canEquipMerc(a) && Item.canEquipMerc(b)) {
			return NTIP.GetMercTier(b) - NTIP.GetMercTier(a);
		}

		if (Item.canEquipMerc(a)) {
			return -1;
		}

		if (Item.canEquipMerc(b)) {
			return 1;
		}

		return 0;
	}

	me.cancel();

	for (let i = 0; i < items.length; i += 1) {
		if (NTIP.GetMercTier(items[i]) === 0) {
			items.splice(i, 1);

			i -= 1;
		}
	}

	while (items.length > 0) {
		items.sort(sortEq);

		tier = NTIP.GetMercTier(items[0]);
		bodyLoc = Item.getBodyLocMerc(items[0]);

		if (tier > 0 && bodyLoc) {
			for (let j = 0; j < bodyLoc.length; j += 1) {
				if ([sdk.storage.Inventory, sdk.storage.Stash].indexOf(items[0].location) > -1 && tier > Item.getEquippedItemMerc(bodyLoc[j]).tier) {
					if (!items[0].identified) {
						tome = me.findItem(519, 0, 3);
						scroll = me.findItem(530, 0, 3);

						if ((tome && tome.getStat(sdk.stats.Quantity) > 0) || scroll) {
							if (items[0].isInStash) {
								Town.openStash();
							}

							Town.identifyItem(items[0], scroll ? scroll : tome);
						}
					}

					print("Merc " + items[0].name);

					if (this.equipMerc(items[0], bodyLoc[j])) {
						print("ÿc9MercEquipÿc0 :: Equipped: " + items[0].fname + " MercTier: " + tier);
					}
					
					let cursorItem = getUnit(100);

					if (cursorItem) {
						cursorItem.drop();

						if (Developer.Debugging.autoEquip) {
							Misc.logItem("Merc Dropped", cursorItem);
						}
					}

					break;
				}
			}
		}

		items.shift();
	}

	return true;
};

Item.removeItemsMerc = function () {
	let cursorItem, mercenary = Merc.getMercFix();

	if (!mercenary) {
		return true;
	}

	let items = mercenary.getItems();

	if (items) {
		for (let i = 0; i < items.length; i++) {
			clickItem(4, items[i].bodylocation);
			delay(500 + me.ping * 2);

			cursorItem = getUnit(100);

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

// Charm Autoequip
Item.hasCharmTier = function (item) {
	return Config.AutoEquip && NTIP.GetCharmTier(item) > 0 && !me.classic;
};

Item.maxFinalSCs = 0;
Item.maxFinalLCs = 0;
Item.maxFinalGCs = 0;
Item.finalEquippedSCs = [];
Item.finalEquippedLCs = [];
Item.finalEquippedGCs = [];

Item.autoEquipSC = function () {
	let checkList = [], keep = [], items = me.findItems(-1, 0);

	if (!items) {
		print("No Items found");
		return {
			keep: keep,
			sell: checkList
		};
	}

	//Remove non small charms and annhilus
	for (let i = 0; i < items.length; i++) {
		if (items[i].classid !== 603 || (items[i].classid === 603 && items[i].quality !== 4)) {
			items.splice(i, 1);

			i -= 1;
		}
	}

	let charms = Item.autoEquipCharmSort(items, Developer.Debugging.smallCharmVerbose);

	keep = keep.concat(charms.resCharms, charms.healthCharms, charms.mfCharms, charms.dmgCharms, charms.eleDmgCharms, charms.backupCheck);

	if (keep.length > Item.maxFinalSCs) {
		keep.sort(function (a, b) {
			return NTIP.GetCharmTier(b) - NTIP.GetCharmTier(a);
		});

		for (let i = 0; i < Item.maxFinalSCs; i++) {
			if (NTIP.checkFinalCharm(keep[i])) {
				if (Item.finalEquippedSCs.indexOf(keep[i]) === -1) {
					Item.finalEquippedSCs.push(keep[i]);

					if (Developer.Debugging.smallCharmVerbose) {
						print("ÿc8Kolbot-SoloPlayÿc0: CharmEquip Equipped Final SC " + keep[i].fname);
					}
				}
			}
		}

		for (let i = Item.maxFinalSCs; i < keep.length; i++) {
			charms.checkList.push(keep[i]);

			if (Developer.Debugging.smallCharmVerbose) {
				print("ÿc8Kolbot-SoloPlayÿc0: CharmEquip Add " + keep[i].fname + " to checkList");
			}

			keep.splice(i, 1);
			i -= 1;
		}
	}

	//print("Small Charm checklist length: " + charms.checkList.length);

	for (let i = 0; i < charms.checkList.length; i++) {
		if ([0, 4].indexOf(Pickit.checkItem(charms.checkList[i]).result) > -1) {
			continue;
		} else {
			if (charms.checkList[i].location !== 7 && !NTIP.checkFinalCharm(charms.checkList[i])) {
				if (!Storage.Stash.MoveTo(charms.checkList[i])) {
					Misc.itemLogger("Dropped", charms.checkList[i]);
					checkList[i].drop();
				} else {
					if (Pickit.checkItem(charms.checkList[i]).result === 2) {
						Misc.logItem("Stashed Cubing Ingredient", charms.checkList[i]);
					} else {
						Misc.logItem("Stashed", charms.checkList[i]);
					}
				}
			}

			charms.checkList.splice(i, 1);
			i -= 1;
		}
	}

	return {
		keep: keep,
		sell: charms.checkList
	};

};

Item.autoEquipLC = function () {
	let checkList = [], keep = [], items = me.findItems(-1, 0);

	if (!items) {
		print("No Items found");
		return {
			keep: keep,
			sell: checkList
		};
	}

	//Remove non large charms and torch
	for (let i = 0; i < items.length; i++) {
		if (items[i].classid !== 604 || (items[i].classid === 604 && items[i].quality !== 4)) {
			items.splice(i, 1);

			i -= 1;
		}
	}

	let charms = Item.autoEquipCharmSort(items, Developer.Debugging.largeCharmVerbose);

	keep = keep.concat(charms.resCharms, charms.healthCharms, charms.mfCharms, charms.dmgCharms, charms.eleDmgCharms, charms.backupCheck);

	if (keep.length > Item.maxFinalLCs) {
		keep.sort(function (a, b) {
			return NTIP.GetCharmTier(b) - NTIP.GetCharmTier(a);
		});

		for (let i = 0; i < Item.maxFinalLCs; i++) {
			if (NTIP.checkFinalCharm(keep[i])) {
				if (Item.finalEquippedLCs.indexOf(item) === -1) {
					Item.finalEquippedLCs.push(keep[i]);

					if (Developer.Debugging.largeCharmVerbose) {
						print("ÿc8Kolbot-SoloPlayÿc0: CharmEquip Equipped Final LC " + keep[i].fname);
					}
				}
			}
		}

		for (let i = Item.maxFinalLCs; i < keep.length; i++) {
			charms.checkList.push(keep[i]);

			if (Developer.Debugging.largeCharmVerbose) {
				print("ÿc8Kolbot-SoloPlayÿc0: CharmEquip Add " + keep[i].fname + " to checkList");
			}

			keep.splice(i, 1);
			i -= 1;
		}
	}

	//print("Large charm checklist length: " + charms.checkList.length);

	for (let i = 0; i < charms.checkList.length; i++) {
		if ([0, 4].indexOf(Pickit.checkItem(charms.checkList[i]).result) > -1) {
			continue;
		} else {
			if (charms.checkList[i].location !== 7) {
				if (!Storage.Stash.MoveTo(charms.checkList[i])) {
					Misc.itemLogger("Dropped", charms.checkList[i]);
					checkList[i].drop();
				} else {
					if (Pickit.checkItem(charms.checkList[i]).result === 2) {
						Misc.logItem("Stashed Cubing Ingredient", charms.checkList[i]);
					} else {
						Misc.logItem("Stashed", charms.checkList[i]);
					}
				}

			}

			charms.checkList.splice(i, 1);
			i -= 1;
		}
	}

	return {
		keep: keep,
		sell: charms.checkList
	};
};

Item.autoEquipGC = function () {
	let checkList = [], keep = [], items = me.findItems(-1, 0);

	if (!items) {
		print("No Items found");
		return {
			keep: keep,
			sell: checkList
		};
	}

	//Remove non grand charms and gheeds
	for (let i = 0; i < items.length; i++) {
		if (items[i].classid !== 605 || (items[i].classid === 605 && items[i].quality !== 4)) {
			items.splice(i, 1);

			i -= 1;
		}
	}

	let charms = Item.autoEquipCharmSort(items, Developer.Debugging.grandCharmVerbose);

	keep = keep.concat(charms.typeA, charms.typeB, charms.typeC, charms.resCharms, charms.healthCharms, charms.mfCharms, charms.dmgCharms, charms.eleDmgCharms, charms.backupCheck);

	//print("Grand charm checklist length: " + charms.checkList.length);

	if (keep.length > Item.maxFinalGCs) {
		keep.sort(function (a, b) {
			return NTIP.GetCharmTier(b) - NTIP.GetCharmTier(a);
		});

		for (let i = 0; i < Item.maxFinalGCs; i++) {
			if (NTIP.checkFinalCharm(keep[i])) {
				if (Item.finalEquippedGCs.indexOf(item) === -1) {
					Item.finalEquippedGCs.push(keep[i]);
				}
			}
		}

		for (let i = Item.maxFinalGCs; i < keep.length; i++) {
			charms.checkList.push(keep[i]);

			keep.splice(i, 1);
			i -= 1;
		}
	}

	for (let i = 0; i < charms.checkList.length; i++) {
		if ([0, 4].indexOf(Pickit.checkItem(charms.checkList[i]).result) > -1) {
			continue;
		} else {
			if (charms.checkList[i].location !== 7) {
				if (!Storage.Stash.MoveTo(charms.checkList[i])) {
					Misc.itemLogger("Dropped", charms.checkList[i]);
					checkList[i].drop();
				} else {
					if (Pickit.checkItem(charms.checkList[i]).result === 2) {
						Misc.logItem("Stashed Cubing Ingredient", charms.checkList[i]);
					} else {
						Misc.logItem("Stashed", charms.checkList[i]);
					}
				}

			}

			charms.checkList.splice(i, 1);
			i -= 1;
		}
	}

	return {
		keep: keep,
		sell: charms.checkList
	};
};

Item.autoEquipCharmSort = function (items, verbose) {
	let tome, scroll, resCharms = [], dmgCharms = [], eleDmgCharms = [], healthCharms = [], mfCharms = [], backupCheck = [],
		typeA = [], typeB = [], typeC = [], checkList = [];

	if (!items) {
		print("No Items found");
		return {
			typeA: typeA,
			typeB: typeB,
			typeC: typeC,
			resCharms: resCharms,
			healthCharms: healthCharms,
			mfCharms: mfCharms,
			dmgCharms: dmgCharms,
			eleDmgCharms: eleDmgCharms,
			backupCheck: backupCheck,
			checkList: checkList,
		};
	}

	if (verbose === undefined) {
		verbose = false;
	}

	function addToCheckList (item) {
		if (checkList.indexOf(item) === -1) {
			checkList.push(item);
		}
	}

	if (verbose) {
		print("Amount of items: " + items.length);
	}

	if (items.length > 1) {
		items.sort(function (a, b) {
			return NTIP.GetCharmTier(b) - NTIP.GetCharmTier(a);
		});
	}
	
	while (items.length > 0) {
		let gid = items[0].gid;

		if (!items[0].identified) {
			tome = me.findItem(519, 0, 3);
			scroll = me.findItem(530, 0, 3);

			if ((tome && tome.getStat(sdk.stats.Quantity) > 0) || scroll) {
				if (items[0].isInStash) {
					Town.openStash();
				}

				Town.identifyItem(items[0], scroll ? scroll : tome);
			} else if (items[0].isInStash && Town.openStash()) {
				Storage.Inventory.MoveTo(items[0]);
				Town.identify();
			}

			if (!getUnit(4, -1, -1, gid)) {
				if (verbose) {
					print("Sold charm during Town.identify()");
				}

				items.shift();
				continue;
			}
		}

		if (NTIP.GetCharmTier(items[0]) <= 0) {
			if (verbose) {
				print("No tier. Adding to checkList: " + items[0].fname);
			}

			addToCheckList(items[0]);
		} else if (!NTIP.hasStats(items[0]) && NTIP.GetCharmTier(items[0]) > 0) {
			if (verbose) {
				print("Multiple Misc charm: " + items[0].fname);
			}

			backupCheck.push(items[0]);
		} else {
			switch (Item.getCharmType(items[0])) {
			case "skillerTypeA":
				typeA.push(items[0]);

				if (verbose) {
					print("Skiller: " + items[0].fname);
				}

				break;
			case "skillerTypeB":
				typeB.push(items[0]);

				if (verbose) {
					print("Skiller: " + items[0].fname);
				}

				break;
			case "skillerTypeC":
				typeC.push(items[0]);

				if (verbose) {
					print("Skiller: " + items[0].fname);
				}

				break;
			case "Resist":
				resCharms.push(items[0]);

				if (verbose) {
					print("Res charm: " + items[0].fname);
				}

				break;
			case "Life":
				healthCharms.push(items[0]);

				if (verbose) {
					print("Health charm: " + items[0].fname);
				}
				
				break;
			case "Magicfind":
				mfCharms.push(items[0]);

				if (verbose) {
					print("mf charm: " + items[0].fname);
				}
				
				break;
			case "Damage":
				dmgCharms.push(items[0]);

				if (verbose) {
					print("Non-elemental damage charm: " + items[0].fname);
				}
				
				break;
			case "Elemental":
				eleDmgCharms.push(items[0]);

				if (verbose) {
					print("Elemental damage charm: " + items[0].fname);
				}

				break;
			default:
				addToCheckList(items[0]);

				if (verbose) {
					print("Failed all checks. Adding to checkList: " + items[0].fname);
				}

				break;
			}
		}

		items.shift();
	}

	if (!typeA.length && !typeB.length && !typeC.length &&
		!dmgCharms.length && !resCharms.length && !eleDmgCharms.length && !healthCharms.length && !backupCheck.length) {
		
		if (verbose) {
			print("No Charms");
		}

		return {
			typeA: typeA,
			typeB: typeB,
			typeC: typeC,
			resCharms: resCharms,
			healthCharms: healthCharms,
			mfCharms: mfCharms,
			dmgCharms: dmgCharms,
			eleDmgCharms: eleDmgCharms,
			backupCheck: backupCheck,
			checkList: checkList,
		};
	}

	if (typeA.length > 0) {
		let invoquantity = NTIP.getInvoQuantity(typeA[0]);

		if (verbose) {
			print("Amount of typeA Charms: " + typeA.length);
			print("invoquantity: " + invoquantity);
		}

		if (typeA.length > invoquantity) {

			if (verbose) {
				for (let i = 0; i < typeA.length; i++) {
					print("typeA[" + i + "] = " + NTIP.GetCharmTier(typeA[i]));
				}
			}

			for (let i = 0; i < typeA.length; i++) {
				if (NTIP.checkFinalCharm(typeA[i]) && NTIP.getInvoQuantity(typeA[i]) !== invoquantity && (
					(typeA[i].classid === 605 && invoquantity < Item.maxFinalGCs))) {
					invoquantity += NTIP.getInvoQuantity(typeA[i]);
				}
			}

			if (invoquantity > 0) {
				for (let i = invoquantity; i < typeA.length; i++) {
					addToCheckList(typeA[i]);

					typeA.splice(i, 1);
					i -= 1;
				}
			}
			
		}

	}

	if (typeB.length > 0) {
		let invoquantity = NTIP.getInvoQuantity(typeB[0]);

		if (verbose) {
			print("Amount of typeB Charms: " + typeB.length);
			print("invoquantity: " + invoquantity);
		}

		if (typeB.length > invoquantity) {

			if (verbose) {
				for (let i = 0; i < typeB.length; i++) {
					print("typeB[" + i + "] = " + NTIP.GetCharmTier(typeB[i]));
				}
			}

			for (let i = 0; i < typeB.length; i++) {
				if (NTIP.checkFinalCharm(typeB[i]) && NTIP.getInvoQuantity(typeB[i]) !== invoquantity && (
					(typeB[i].classid === 605 && invoquantity < Item.maxFinalGCs))) {
					invoquantity += NTIP.getInvoQuantity(typeB[i]);
				}
			}
			
			if (invoquantity > 0) {
				for (let i = invoquantity; i < typeB.length; i++) {
					addToCheckList(typeB[i]);

					typeB.splice(i, 1);
					i -= 1;
				}
			}
			
		}

	}

	if (typeC.length > 0) {
		let invoquantity = NTIP.getInvoQuantity(typeC[0]);

		if (verbose) {
			print("Amount of typeC Charms: " + typeC.length);
			print("invoquantity: " + invoquantity);
		}
		
		if (typeC.length > invoquantity) {

			if (verbose) {
				for (let i = 0; i < typeC.length; i++) {
					print("typeC[" + i + "] = " + NTIP.GetCharmTier(typeC[i]));
				}
			}

			for (let i = 0; i < typeC.length; i++) {
				if (NTIP.checkFinalCharm(typeC[i]) && NTIP.getInvoQuantity(typeC[i]) !== invoquantity && (
					(typeC[i].classid === 605 && invoquantity < Item.maxFinalGCs))) {
					invoquantity += NTIP.getInvoQuantity(typeC[i]);
				}
			}
			
			if (invoquantity > 0) {
				for (let i = invoquantity; i < typeC.length; i++) {
					addToCheckList(typeC[i]);

					typeC.splice(i, 1);
					i -= 1;
				}
			}
			
		}

	}

	if (resCharms.length > 0) {
		let invoquantity = NTIP.getInvoQuantity(resCharms[0]);
		
		if (verbose) {
			print("Amount of resCharms: " + resCharms.length);
			print("invoquantity: " + invoquantity);
		}
		
		if (resCharms.length > invoquantity) {

			if (verbose) {
				for (let i = 0; i < resCharms.length; i++) {
					print("resCharms[" + i + "] = " + NTIP.GetCharmTier(resCharms[i]));
				}
			}

			for (let i = 0; i < resCharms.length; i++) {
				if (NTIP.checkFinalCharm(resCharms[i]) && NTIP.getInvoQuantity(resCharms[i]) !== invoquantity && (
					(resCharms[i].classid === 603 && invoquantity < Item.maxFinalSCs) ||
					(resCharms[i].classid === 604 && invoquantity < Item.maxFinalLCs) ||
					(resCharms[i].classid === 605 && invoquantity < Item.maxFinalGCs))) {
					invoquantity += NTIP.getInvoQuantity(resCharms[i]);
				}
			}
			
			if (invoquantity > 0) {
				for (let i = invoquantity; i < resCharms.length; i++) {
					addToCheckList(resCharms[i]);

					resCharms.splice(i, 1);
					i -= 1;
				}
			}
		}

	}

	if (healthCharms.length > 0) {
		let invoquantity = NTIP.getInvoQuantity(healthCharms[0]);
		
		if (verbose) {
			print("Amount of healthCharms: " + healthCharms.length);
			print("invoquantity: " + invoquantity);
		}
		
		if (healthCharms.length > invoquantity) {

			if (verbose) {
				for (let i = 0; i < healthCharms.length; i++) {
					print("healthCharms[" + i + "] = " + NTIP.GetCharmTier(healthCharms[i]));
				}
			}

			for (let i = 0; i < healthCharms.length; i++) {
				if (NTIP.checkFinalCharm(healthCharms[i]) && NTIP.getInvoQuantity(healthCharms[i]) !== invoquantity && (
					(healthCharms[i].classid === 603 && invoquantity < Item.maxFinalSCs) ||
					(healthCharms[i].classid === 604 && invoquantity < Item.maxFinalLCs) ||
					(healthCharms[i].classid === 605 && invoquantity < Item.maxFinalGCs))) {
					invoquantity += NTIP.getInvoQuantity(healthCharms[i]);
				}
			}
			
			if (invoquantity > 0) {
				for (let i = invoquantity; i < healthCharms.length; i++) {
					addToCheckList(healthCharms[i]);

					healthCharms.splice(i, 1);
					i -= 1;
				}
			}
			
		}

	}

	if (mfCharms.length > 0) {
		let invoquantity = NTIP.getInvoQuantity(mfCharms[0]);
		
		if (verbose) {
			print("Amount of mfCharms: " + mfCharms.length);
			print("invoquantity: " + invoquantity);
		}
		
		if (mfCharms.length > invoquantity) {

			if (verbose) {
				for (let i = 0; i < mfCharms.length; i++) {
					print("mfCharms[" + i + "] = " + NTIP.GetCharmTier(mfCharms[i]));
				}
			}

			for (let i = 0; i < mfCharms.length; i++) {
				if (NTIP.checkFinalCharm(mfCharms[i]) && NTIP.getInvoQuantity(mfCharms[i]) !== invoquantity && (
					(mfCharms[i].classid === 603 && invoquantity < Item.maxFinalSCs) ||
					(mfCharms[i].classid === 604 && invoquantity < Item.maxFinalLCs) ||
					(mfCharms[i].classid === 605 && invoquantity < Item.maxFinalGCs))) {
					invoquantity += NTIP.getInvoQuantity(mfCharms[i]);
				}
			}
			
			if (invoquantity > 0) {
				for (let i = invoquantity; i < mfCharms.length; i++) {
					addToCheckList(mfCharms[i]);

					mfCharms.splice(i, 1);
					i -= 1;
				}
			}
			
		}

	}

	if (dmgCharms.length > 0) {
		let invoquantity = NTIP.getInvoQuantity(dmgCharms[0]);

		if (verbose) {
			print("Amount of dmgCharms: " + dmgCharms.length);
			print("invoquantity: " + invoquantity);
		}
		
		if (dmgCharms.length > invoquantity) {

			if (verbose) {
				for (let i = 0; i < dmgCharms.length; i++) {
					print("dmgCharms[" + i + "] = " + NTIP.GetCharmTier(dmgCharms[i]));
				}
			}

			for (let i = 0; i < dmgCharms.length; i++) {
				if (NTIP.checkFinalCharm(dmgCharms[i]) && NTIP.getInvoQuantity(dmgCharms[i]) !== invoquantity && (
					(dmgCharms[i].classid === 603 && invoquantity < Item.maxFinalSCs) ||
					(dmgCharms[i].classid === 604 && invoquantity < Item.maxFinalLCs) ||
					(dmgCharms[i].classid === 605 && invoquantity < Item.maxFinalGCs))) {
					invoquantity += NTIP.getInvoQuantity(dmgCharms[i]);
				}
			}
			
			if (invoquantity > 0) {
				for (let i = invoquantity; i < dmgCharms.length; i++) {
					addToCheckList(dmgCharms[i]);

					dmgCharms.splice(i, 1);
					i -= 1;
				}
			}
			
		}

	}

	if (eleDmgCharms.length > 0) {
		let invoquantity = NTIP.getInvoQuantity(eleDmgCharms[0]);

		if (verbose) {
			print("Amount of eleDmgCharms: " + eleDmgCharms.length);
			print("invoquantity: " + invoquantity);
		}
		
		if (eleDmgCharms.length > invoquantity) {

			if (verbose) {
				for (let i = 0; i < eleDmgCharms.length; i++) {
					print("dmgCharms[" + i + "] = " + NTIP.GetCharmTier(eleDmgCharms[i]));
				}
			}

			for (let i = 0; i < eleDmgCharms.length; i++) {
				if (NTIP.checkFinalCharm(eleDmgCharms[i]) && NTIP.getInvoQuantity(eleDmgCharms[i]) !== invoquantity && (
					(eleDmgCharms[i].classid === 603 && invoquantity < Item.maxFinalSCs) ||
					(eleDmgCharms[i].classid === 604 && invoquantity < Item.maxFinalLCs) ||
					(eleDmgCharms[i].classid === 605 && invoquantity < Item.maxFinalGCs))) {
					invoquantity += NTIP.getInvoQuantity(eleDmgCharms[i]);
				}
			}
			
			if (invoquantity > 0) {
				for (let i = invoquantity; i < eleDmgCharms.length; i++) {
					addToCheckList(eleDmgCharms[i]);

					eleDmgCharms.splice(i, 1);
					i -= 1;
				}
			}
			
		}

	}

	// If stats are unspecifed, this will filter charms and keep highest based on invoquantity. If no invoquantity defined it will keep two of that type
	if (backupCheck.length > 0) {
		let invoquantity = NTIP.getInvoQuantity(backupCheck[0]);

		if (invoquantity === undefined || invoquantity === -1) {
			invoquantity = 2;
		}

		if (verbose) {
			print("Amount of Misc charms: " + backupCheck.length);
			print("invoquantity: " + invoquantity);
		}

		if (backupCheck.length > invoquantity) {

			if (verbose) {
				for (let i = 0; i < backupCheck.length; i++) {
					print("MiscCharms[" + i + "] = " + NTIP.GetCharmTier(backupCheck[i]));
				}
			}

			for (let i = 0; i < backupCheck.length; i++) {
				if (NTIP.checkFinalCharm(backupCheck[i]) && NTIP.getInvoQuantity(backupCheck[i]) !== invoquantity && (
					(backupCheck[i].classid === 603 && invoquantity < Item.maxFinalSCs) ||
					(backupCheck[i].classid === 604 && invoquantity < Item.maxFinalLCs) ||
					(backupCheck[i].classid === 605 && invoquantity < Item.maxFinalGCs))) {
					invoquantity += NTIP.getInvoQuantity(backupCheck[i]);
				}
			}
			
			if (invoquantity > 0) {
				for (let i = invoquantity; i < backupCheck.length; i++) {
					addToCheckList(backupCheck[i]);

					backupCheck.splice(i, 1);
					i -= 1;
				}
			}
			
		}
			
	}

	if (verbose) {
		for (let i = 0; i < checkList.length; i++) {
			print("checkList[" + i + "] = " + NTIP.GetCharmTier(checkList[i]) + " " + checkList[i].fname);
		}
	}

	return {
		typeA: typeA,
		typeB: typeB,
		typeC: typeC,
		resCharms: resCharms,
		healthCharms: healthCharms,
		mfCharms: mfCharms,
		dmgCharms: dmgCharms,
		eleDmgCharms: eleDmgCharms,
		backupCheck: backupCheck,
		checkList: checkList,
	};
};

Item.autoEquipCharmCheck = function (item) {
	if (!item) {
		return false;
	}

	// Annhilus, Hellfire Torch, Gheeds - Handled by a different function so return true to keep
	if ([603, 604, 605].indexOf(item.classid) > -1 && item.quality === 7) {
		return true;
	}

	// Not a charm
	if ([603, 604, 605].indexOf(item.classid) === -1) {
		return false;
	}

	let charms, items = me.findItems(-1, 0), lowestCharm;

	if (!items) {
		return false;
	}

	if (NTIP.GetCharmTier(item) <= 0) {
		return false;
	}

	// Remove items without tier
	for (let i = 0; i < items.length; i += 1) {
		if (NTIP.GetCharmTier(items[i]) === 0) {
			items.splice(i, 1);

			i -= 1;
		}
	}

	switch (item.classid) {
	case 603:
		//Remove non small charms and annhilus
		for (let i = 0; i < items.length; i++) {
			if (items[i].classid !== 603 || items[i].quality !== 4) {
				items.splice(i, 1);

				i -= 1;
			}
		}
		charms = Item.autoEquipCharmSort(items);

		break;
	case 604:
		//Remove non large charms and torch
		for (let i = 0; i < items.length; i++) {
			if (items[i].classid !== 604 || items[i].quality !== 4) {
				items.splice(i, 1);

				i -= 1;
			}
		}
		charms = Item.autoEquipCharmSort(items);

		break;
	case 605:
		//Remove non grand charms and gheeds
		for (let i = 0; i < items.length; i++) {
			if (items[i].classid !== 605 || items[i].quality !== 4) {
				items.splice(i, 1);

				i -= 1;
			}
		}
		charms = Item.autoEquipCharmSort(items);

		break;
	default:
		print("Not a charm");
		return false;
	}

	let keep = [];
	keep = keep.concat(charms.typeA, charms.typeB, charms.typeC, charms.resCharms, charms.healthCharms, charms.mfCharms, charms.dmgCharms, charms.eleDmgCharms, charms.backupCheck);

	if (keep.length > (item.classid === 603 ? Item.maxFinalSCs : item.classid === 604 ? Item.maxFinalLCs : Item.maxFinalGCs)) {
		switch (item.classid) {
		case 603:
			lowestCharm = Item.finalEquippedSCs.last();

			if (lowestCharm === undefined) {
				break;
			}

			if (NTIP.GetCharmTier(item) > NTIP.GetCharmTier(lowestCharm) || item.gid === lowestCharm.gid) {
				return true;
			} else {
				return false;
			}
		case 604:
			lowestCharm = Item.finalEquippedLCs.last();

			if (lowestCharm === undefined) {
				break;
			}

			if (NTIP.GetCharmTier(item) > NTIP.GetCharmTier(lowestCharm) || item.gid === lowestCharm.gid) {
				return true;
			} else {
				return false;
			}
		case 605:
			lowestCharm = Item.finalEquippedGCs.last();

			if (lowestCharm === undefined) {
				break;
			}

			if (NTIP.GetCharmTier(item) > NTIP.GetCharmTier(lowestCharm) || item.gid === lowestCharm.gid) {
				return true;
			} else {
				return false;
			}
		}
	}

	switch (Item.getCharmType(item)) {
	case "skillerTypeA":
		if (!charms.typeA.length) {
			break;
		}

		lowestCharm = charms.typeA.last();

		if (NTIP.GetCharmTier(item) > NTIP.GetCharmTier(lowestCharm) || item.gid === lowestCharm.gid) {
			return true;
		} else {
			return false;
		}
	case "skillerTypeB":
		if (!charms.typeB.length) {
			break;
		}

		lowestCharm = charms.typeB.last();

		if (NTIP.GetCharmTier(item) > NTIP.GetCharmTier(lowestCharm) || item.gid === lowestCharm.gid) {
			return true;
		} else {
			return false;
		}
	case "skillerTypeC":
		if (!charms.typeC.length) {
			break;
		}

		lowestCharm = charms.typeC.last();

		if (NTIP.GetCharmTier(item) > NTIP.GetCharmTier(lowestCharm) || item.gid === lowestCharm.gid) {
			return true;
		} else {
			return false;
		}
	case "Resist":
		if (!charms.resCharms.length) {
			break;
		}

		lowestCharm = charms.resCharms.last();

		if (NTIP.GetCharmTier(item) > NTIP.GetCharmTier(lowestCharm) || item.gid === lowestCharm.gid) {
			return true;
		} else {
			return false;
		}
	case "Life":
		if (!charms.healthCharms.length) {
			break;
		}

		lowestCharm = charms.healthCharms.last();

		if (NTIP.GetCharmTier(item) > NTIP.GetCharmTier(lowestCharm) || item.gid === lowestCharm.gid) {
			return true;
		} else {
			return false;
		}
	case "Magicfind":
		if (!charms.mfCharms.length) {
			break;
		}

		lowestCharm = charms.mfCharms.last();

		if (NTIP.GetCharmTier(item) > NTIP.GetCharmTier(lowestCharm) || item.gid === lowestCharm.gid) {
			return true;
		} else {
			return false;
		}
	case "Damage":
		if (!charms.dmgCharms.length) {
			break;
		}

		lowestCharm = charms.dmgCharms.last();

		if (NTIP.GetCharmTier(item) > NTIP.GetCharmTier(lowestCharm) || item.gid === lowestCharm.gid) {
			return true;
		} else {
			return false;
		}
	case "Elemental":
		if (!charms.eleDmgCharms.length) {
			break;
		}

		lowestCharm = charms.eleDmgCharms.last();

		if (NTIP.GetCharmTier(item) > NTIP.GetCharmTier(lowestCharm) || item.gid === lowestCharm.gid) {
			return true;
		} else {
			return false;
		}
	default:
		if (!charms.backupCheck.length) {
			break;
		}

		lowestCharm = charms.backupCheck.last();

		if (NTIP.GetCharmTier(item) > NTIP.GetCharmTier(lowestCharm) || item.gid === lowestCharm.gid) {
			return true;
		} else {
			return false;
		}
	}

	return true;
};

Item.autoEquipCharms = function (verbose) {
	// No charms in classic
	if (me.classic) {
		return;
	}

	print("ÿc8Kolbot-SoloPlayÿc0: Entering charm auto equip");
	let tick = getTickCount();

	let cancelFlags = [0x01, 0x02, 0x04, 0x08, 0x14, 0x16, 0x0c, 0x0f, 0x19, 0x1A];
	let totalKeep = [], totalSell = [];
	let GCs = Item.autoEquipGC();
	let LCs = Item.autoEquipLC();
	let SCs = Item.autoEquipSC();

	if (verbose) {
		print("Grand Charms Keep: " + GCs.keep.length);
		print("Grand Charms Sell: " + GCs.sell.length);
		print("Large Charms Keep: " + LCs.keep.length);
		print("Large Charms Sell: " + LCs.sell.length);
		print("Small Charms Keep: " + SCs.keep.length);
		print("Small Charms Sell: " + SCs.sell.length);
	}
	
	totalKeep = totalKeep.concat(SCs.keep, LCs.keep, GCs.keep);
	totalSell = totalSell.concat(SCs.sell, LCs.sell, GCs.sell);

	if (totalKeep.length > 0) {
		print("ÿc8Kolbot-SoloPlayÿc0: Total Charms Kept: " + totalKeep.length);
	}

	if (totalSell.length > 0) {
		print("ÿc8Kolbot-SoloPlayÿc0: Total Charms Sell: " + totalSell.length);

		for (let i = 0; i < totalSell.length; i++) {
			if (totalSell[i].isInStash && !getUIFlag(0x19)) {
				Town.openStash();
			}

			if (totalSell[i].isInStash && !Storage.Inventory.MoveTo(totalSell[i])) {
				totalSell[i].drop();

				totalSell.splice(i, 1);

				i -= 1;
			}
		}

		Town.initNPC("Shop", "clearInventory");

		if (getUIFlag(0xC) || (Config.PacketShopping && getInteractedNPC() && getInteractedNPC().itemcount > 0)) {
			for (let i = 0; i < totalSell.length; i++) {
				print("ÿc8Kolbot-SoloPlayÿc0: Sell old charm " + totalSell[i].name);
				Misc.itemLogger("Sold", totalSell[i]);
				Misc.logItem("CharmEquip Sold", totalSell[i]);
				totalSell[i].sell();
			}
		}
	}

	if (totalKeep.length > 0) {
		for (let i = 0; i < totalKeep.length; i++) {
			if (totalKeep[i].isInStash && Pickit.checkItem(totalKeep[i]).result !== 2) {
				Town.openStash();
				delay(300 + me.ping);
				if (Storage.Inventory.CanFit(totalKeep[i])) {
					Storage.Inventory.MoveTo(totalKeep[i]);
					Misc.logItem("CharmEquip Equipped", totalKeep[i]);
				}
			}
		}
	}

	for (let i = 0; i < cancelFlags.length; i += 1) {
		if (getUIFlag(cancelFlags[i])) {
			delay(500 + me.ping);
			me.cancel();

			break;
		}
	}

	me.cancel();

	print("ÿc8Kolbot-SoloPlayÿc0: Exiting charm auto equip. Time elapsed: " + Developer.formatTime(getTickCount() - tick));
};

// Write charm equip version that checks by item prefix/suffix using a switch case with the various prefixes and suffixes to sort them
Item.getCharmType = function (charm) {
	if (charm === undefined || !charm) {
		return false;
	}

	if ([603, 604, 605].indexOf(charm.classid) === -1) {
		return false;
	}

	let charmType = "";
	let skillerStats = [[0, 1, 2], [8, 9, 10], [16, 17, 18], [24, 25, 26], [32, 33, 34], [40, 41, 42], [48, 49, 50]][me.classid];

	if (charm.getStat(188, skillerStats[0])) {
		charmType = "skillerTypeA";
	} else if (charm.getStat(188, skillerStats[1])) {
		charmType = "skillerTypeB";
	} else if (charm.getStat(188, skillerStats[2])) {
		charmType = "skillerTypeC";
	}

	if (!NTIP.hasStats(charm) && NTIP.GetCharmTier(charm) > 0) {
		return "Misc";
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
		charmType = "Resist";
		break;
	}

	if (!charmType || charmType === "") {
		switch (charm.suffix) {
		case "of Fortune":
		case "of Good Luck":
			charmType = "Magicfind";
			break;
		case "of Life":
		case "of Substinence": 	// Odd issue, seems to be misspelled wherever item.suffix pulls info from
		case "of Vita":
			charmType = "Life";
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
			charmType = "Damage";
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
			charmType = "Elemental";
			break;
		}
	}

	if (!charmType || charmType === "") {
		switch (charm.suffix) {
		case "of Craftmanship":
		case "of Quality":
		case "of Maiming":
			charmType = "Damage";
			break;
		case "of Strength":
		case "of Dexterity":
			charmType = "Stats";
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
			charmType = "Elemental";
			break;
		}
	}

	if (!charmType || charmType === "") {
		switch (charm.prefix) {
		case "Stout":
		case "Burly":
		case "Stalwart":
			charmType = "Misc";
			break;
		case "Rugged":
			charmType = "Misc";
			break;
		case "Lizard's":
		case "Snake's":
		case "Serpent's":
			charmType = "Mana";
			break;
		}
	}

	if (!charmType || charmType === "") {
		switch (charm.suffix) {
		case "of Balance":
		case "of Greed":
		case "of Inertia":
			charmType = "Misc";
			break;
		}
	}

	return charmType;
};

let AutoEquip = {
	hasTier: function (item) {
		if (me.classic) {
			return Item.hasTier(item);
		} else {
			if ([sdk.itemtype.SmallCharm, sdk.itemtype.MediumCharm, sdk.itemtype.LargeCharm].indexOf(item.itemType) > -1) {
				return Item.hasCharmTier(item);
			} else {
				return Item.hasMercTier(item) || Item.hasTier(item) || Item.hasSecondaryTier(item);
			}
		}
	},

	wanted: function (item) {
		if (me.classic) {
			return Item.autoEquipKeepCheck(item);
		} else {
			if ([sdk.itemtype.SmallCharm, sdk.itemtype.MediumCharm, sdk.itemtype.LargeCharm].indexOf(item.itemType) > -1) {
				return Item.autoEquipCharmCheck(item);
			} else {
				return Item.autoEquipKeepCheckMerc(item) || Item.autoEquipKeepCheck(item) || Item.autoEquipCheckSecondary(item);
			}
		}
	},
};
