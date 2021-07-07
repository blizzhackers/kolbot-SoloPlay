/*
*	@filename	ItemOverrides.js
*	@author		theBGuy
*	@credits	isid0re
*	@desc		Misc.js Item function fixes to improve functionality and Autoequip
*/

if (!isIncluded("common/Misc.js")) {
	include("common/Misc.js");
}

Item.getBodyLoc = function (item) {
	var bodyLoc;

	switch (item.itemType) {
	case 2: // Shield
	case 70: // Auric Shields
	case 69: // Voodoo Heads
		bodyLoc = 5;

		break;
	case 3: // Armor
		bodyLoc = 3;

		break;
	case 5: // Arrows
	case 6: // Bolts
		bodyLoc = 5;

		break;
	case 10: // Ring
		bodyLoc = [6, 7];

		break;
	case 12: // Amulet
		bodyLoc = 2;

		break;
	case 15: // Boots
		bodyLoc = 9;

		break;
	case 16: // Gloves
		bodyLoc = 10;

		break;
	case 19: // Belt
		bodyLoc = 8;

		break;
	case 37: // Helm
	case 71: // Barb Helm
	case 75: // Circlet
	case 72: // Druid Pelts
		bodyLoc = 1;

		break;
	case 24: //	Scepter
	case 25: //	Wand
	case 26: //	Staff
	case 27: //	Bow
	case 28: //	Axe
	case 29: //	Club
	case 30: //	Sword
	case 31: //	Hammer
	case 32: //	Knife
	case 33: //	Spear
	case 34: //	Polearm
	case 35: //	Crossbow
	case 36: //	Mace
	case 42: //	Throwing Knife
	case 43: //	Throwing Axe
	case 44: //	Javelin
	case 68: //	Orb
	case 85: //	Amazon Bow
	case 86: //	Amazon Spear
	case 87: //	Amazon Javelin
		if (me.barbarian) {
			bodyLoc = [4, 5];

			break;
		}

		bodyLoc = 4;

		break;
	case 67: // Handtohand (Assasin Claw)
	case 88: //
		bodyLoc = [4, 5];

		break;
	default:
		return false;
	}

	if (typeof bodyLoc === "number") {
		bodyLoc = [bodyLoc];
	}

	return bodyLoc;
};

Item.autoEquipCheck = function (item) {
	if (!Config.AutoEquip) {
		return true;
	}

	var i,
		tier = NTIP.GetTier(item),
		bodyLoc = this.getBodyLoc(item);

	if (tier > 0 && bodyLoc) {
		for (i = 0; i < bodyLoc.length; i += 1) {
			if (tier > this.getEquippedItem(bodyLoc[i]).tier && (this.canEquip(item) || !item.getFlag(0x10))) {
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

	var i,
		tier = NTIP.GetTier(item),
		bodyLoc = this.getBodyLoc(item);

	if (tier > 0 && bodyLoc) {
		for (i = 0; i < bodyLoc.length; i += 1) {
			if (tier > this.getEquippedItem(bodyLoc[i]).tier) {
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

	var i, j, tier, bodyLoc, tome, gid,
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
	for (i = 0; i < items.length; i += 1) {
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
			for (j = 0; j < bodyLoc.length; j += 1) {
				if ([3, 7].indexOf(items[0].location) > -1 && tier > this.getEquippedItem(bodyLoc[j]).tier && this.getEquippedItem(bodyLoc[j]).classid !== 174) { // khalim's will adjustment
					if (!items[0].getFlag(0x10)) { // unid
						tome = me.findItem(519, 0, 3);

						if (tome && tome.getStat(70) > 0) {
							if (items[0].location === 7) {
								Town.openStash();
							}

							Town.identifyItem(items[0], tome);
						}
					}

					gid = items[0].gid;

					print(items[0].name);

					if (this.equip(items[0], bodyLoc[j])) {
						Misc.logItem("Equipped", me.getItem(-1, -1, gid));

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

	return true;
};

Item.equip = function (item, bodyLoc) {
	if (!this.canEquip(item)) {
		return false;
	}

	// Already equipped in the right slot
	if (item.mode === 1 && item.bodylocation === bodyLoc) {
		return true;
	}

	var i, cursorItem;

	if (item.location === 7) {
		if (!Town.openStash()) {
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
						if (Pickit.checkItem(cursorItem).result === 1) { // only keep wanted items
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

//AUTO EQUIP MERC - modified from dzik's
Item.hasMercTier = function (item) {
	return Config.AutoEquip && NTIP.GetMercTier(item) > 0 && !me.classic;
};

Item.canEquipMerc = function (item, bodyLoc) {
	if (item.type !== 4 || me.classic) { // Not an item
		return false;
	}

	let mercenary = Merc.getMercFix();

	if (!mercenary) { // dont have merc or he is dead
		return false;
	}

	if (!item.getFlag(0x10)) { // Unid item
		return false;
	}

	let curr = Item.getEquippedItemMerc(bodyLoc);

	if (item.getStat(92) > mercenary.getStat(12) || item.dexreq > mercenary.getStat(2) - curr.dex || item.strreq > mercenary.getStat(0) - curr.str) { // Higher requirements
		return false;
	}

	return true;
};

Item.equipMerc = function (item, bodyLoc) {
	var i, cursorItem, mercenary = Merc.getMercFix();

	if (!mercenary) { // dont have merc or he is dead
		return false;
	}

	if (!Item.canEquipMerc(item, bodyLoc)) {
		return false;
	}

	if (item.mode === 1 && item.bodylocation === bodyLoc) { // Already equipped in the right slot
		return true;
	}

	if (item.location === 7) {
		if (!Town.openStash()) {
			return false;
		}
	}

	for (i = 0; i < 3; i += 1) {
		if (item.toCursor()) {
			if (clickItem(4, bodyLoc)) {
				delay(500 + me.ping * 2);
				Misc.logItem("Merc Equipped", mercenary.getItem(item.classid));
			}

			if (item.bodylocation === bodyLoc) {
				if (getCursorType() === 3) {
					cursorItem = getUnit(100);

					if (cursorItem) {
						if (Pickit.checkItem(cursorItem).result === 1) { // only keep wanted items
							if (Storage.Inventory.CanFit(cursorItem)) {
								Storage.Inventory.MoveTo(cursorItem);
							}
						}

						cursorItem = getUnit(100);

						if (cursorItem) {
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
				if (item.bodylocation === bodyLoc && item.location === 1) {
					return {
						classid: item.classid,
						prefixnum: item.prefixnum,
						tier: NTIP.GetMercTier(item),
						name: item.fname,
						str: item.getStatEx(0),
						dex: item.getStatEx(2)
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

	if (!mercenary) { // dont have merc or he is dead
		return false;
	}

	switch (item.itemType) {
	case 2: //	Shield
		if (mercenary.classid === 359) {
			bodyLoc = 5;
		}

		break;
	case 3: // Armor
		bodyLoc = 3;

		break;
	case 37: // Helm
	case 75: // Circlet
		bodyLoc = 1;

		break;
	case 27:
		if (mercenary.classid === 271) {
			bodyLoc = 4;
		}

		break;
	case 33: //
	case 34: //
		if (mercenary.classid === 338) {
			bodyLoc = 4;
		}

		break;
	case 30: //	Sword
		if (mercenary.classid === 359 || mercenary.classid === 561) {
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

	let i, tier = NTIP.GetMercTier(item), bodyLoc = Item.getBodyLocMerc(item);

	if (tier > 0 && bodyLoc) {
		for (i = 0; i < bodyLoc.length; i += 1) {
			var oldTier = Item.getEquippedItemMerc(bodyLoc[i]).tier; // Low tier items shouldn't be kept if they can't be equipped

			if (tier > oldTier && (Item.canEquipMerc(item) || !item.getFlag(0x10))) {
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

	let i, tier = NTIP.GetMercTier(item), bodyLoc = Item.getBodyLocMerc(item);

	if (tier > 0 && bodyLoc) {
		for (i = 0; i < bodyLoc.length; i += 1) {
			var oldTier = Item.getEquippedItemMerc(bodyLoc[i]).tier; // Low tier items shouldn't be kept if they can't be equipped

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

	let i, j, tier, bodyLoc, tome, scroll, items = me.findItems(-1, 0);

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

	for (i = 0; i < items.length; i += 1) {
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
			for (j = 0; j < bodyLoc.length; j += 1) {
				if ([3, 7].indexOf(items[0].location) > -1 && tier > Item.getEquippedItemMerc(bodyLoc[j]).tier) { // khalim's will adjustment
					if (!items[0].getFlag(0x10)) { // unid
						tome = me.findItem(519, 0, 3);
						scroll = me.findItem(530, 0, 3);

						if ((tome && tome.getStat(70) > 0) || scroll) {
							if (items[0].location === 7) {
								Town.openStash();
							}

							Town.identifyItem(items[0], scroll ? scroll : tome);
						}
					}

					print("Merc " + items[0].name);
					this.equipMerc(items[0], bodyLoc[j]);

					let cursorItem = getUnit(100);

					if (cursorItem) {
						cursorItem.drop();
						Misc.logItem("Merc Dropped", cursorItem);
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
		for (var i = 0; i < items.length; i++) {
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
		if (items[i].classid !== 603 || items[i].quality !== 4) {
			items.splice(i, 1);

			i -= 1;
		}
	}

	let charms = Item.autoEquipCharmSort(items, false);

	keep = keep.concat(charms.resCharms, charms.healthCharms, charms.mfCharms, charms.dmgCharms, charms.eleDmgCharms, charms.backupCheck);

	//print("Small Charm checklist length: " + charms.checkList.length);

	for (let i = 0; i < charms.checkList.length; i++) {
		if([0, 4].indexOf(Pickit.checkItem(charms.checkList[i]).result) > -1) {
			continue;
		} else {
			if (charms.checkList[i].location !== 7) {
				if (!Storage.Stash.MoveTo(charms.checkList[i])){
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
		if (items[i].classid !== 604 || items[i].quality !== 4) {
			items.splice(i, 1);

			i -= 1;
		}
	}

	let charms = Item.autoEquipCharmSort(items, false);

	keep = keep.concat(charms.resCharms, charms.healthCharms, charms.mfCharms, charms.dmgCharms, charms.eleDmgCharms, charms.backupCheck);

	//print("Large charm checklist length: " + charms.checkList.length);

	for (let i = 0; i < charms.checkList.length; i++) {
		if([0, 4].indexOf(Pickit.checkItem(charms.checkList[i]).result) > -1) {
			continue;
		} else {
			if (charms.checkList[i].location !== 7) {
				if (!Storage.Stash.MoveTo(charms.checkList[i])){
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
		if (items[i].classid !== 605 || items[i].quality !== 4) {
			items.splice(i, 1);

			i -= 1;
		}
	}

	let charms = Item.autoEquipCharmSort(items, false);

	keep = keep.concat(charms.typeA, charms.typeB, charms.typeC, charms.resCharms, charms.healthCharms, charms.mfCharms, charms.dmgCharms, charms.eleDmgCharms, charms.backupCheck);

	//print("Grand charm checklist length: " + charms.checkList.length);

	for (let i = 0; i < charms.checkList.length; i++) {
		if([0, 4].indexOf(Pickit.checkItem(charms.checkList[i]).result) > -1) {
			continue;
		} else {
			if (charms.checkList[i].location !== 7) {
				if (!Storage.Stash.MoveTo(charms.checkList[i])){
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
	var tome, scroll, resCharms = [], dmgCharms = [], eleDmgCharms = [], healthCharms = [], mfCharms = [], backupCheck = [],
		typeA = [], typeB = [], typeC = [], checkList = [], keep = [],
		stats = [[0, 1, 2], [8, 9, 10], [16, 17, 18,], [24, 25, 26], [32, 33, 34], [40, 41, 42], [48, 49, 50]][me.classid];

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

	function skillerCheck (item) {
		if (NTIP.GetCharmTier(item) > 0) {
			if (item.getStat(188, stats[0])) {
				typeA.push(item);

				if (verbose) {
					print("Skiller: " + item.fname);
				}

				return true;
			} else if (item.getStat(188, stats[1])) {
				typeB.push(item);

				if (verbose) {
					print("Skiller: " + item.fname);
				}

				return true;
			} else if (item.getStat(188, stats[2])) {
				typeC.push(item);

				if (verbose) {
					print("Skiller: " + item.fname);
				}

				return true;
			}	
		} else {
			return false;
		}
		
		return false;
	};

	function resCheck (item) {
		if (item.getStat(39) || item.getStat(41) || item.getStat(43) || item.getStat(45)) {
			return true;
		} else {
			return false;
		}
	};

	function healthCheck (item) {
		if (item.getStat(7)) {
			return true;	
		} else {
			return false;
		}

		return false; 
	};

	function mfCheck (item) {
		if (item.getStat(80)) {
			return true;	
		} else {
			return false;
		}

		return false; 
	};

	function damageCheck (item) {
		// mindamage, maxdamage, tohit, 
		if (item.getStat(21) || item.getStat(22) || item.getStat(19)) {
			return true;
		} else {
			return false;
		}
	};

	function eleDmgCheck (item) {
		// mindamage, maxdamage, tohit, 
		if (item.getStat(48) || item.getStat(49) || item.getStat(50) ||
			item.getStat(51) || item.getStat(52) || item.getStat(53) ||
			item.getStat(54) || item.getStat(55) || item.getStat(57) ||
			item.getStat(58)) {
			return true;
		} else {
			return false;
		}
	};

	function addToCheckList (item) {
		if (checkList.indexOf(item) === -1) {
			checkList.push(item);	
		}
	};

	if (verbose) {
		print("Amount of items: " + items.length);
	}
	
	while (items.length > 0) {
		if (!items[0].getFlag(0x10)) { // unid
			tome = me.findItem(519, 0, 3);
			scroll = me.findItem(530, 0, 3);

			if ((tome && tome.getStat(70) > 0) || scroll) {
				if (items[0].location === 7) {
					Town.openStash();
				}

				Town.identifyItem(items[0], scroll ? scroll : tome);
			} else if (items[0].location === 7 && Town.openStash()) {
				Storage.Inventory.MoveTo(items[0]);
				Town.identify();
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
		} else if (!skillerCheck(items[0])) {
			if (resCheck(items[0])) {
				if (verbose) {
					print("Res charm: " + items[0].fname);
				}

				resCharms.push(items[0]);
			} else if (healthCheck(items[0])) {
				if (verbose) {
					print("Health charm: " + items[0].fname);
				}
				
				healthCharms.push(items[0]);
			} else if (mfCheck(items[0])) {
				if (verbose) {
					print("mf charm: " + items[0].fname);
				}
				
				mfCharms.push(items[0]);
			} else if (damageCheck(items[0])) {
				if (verbose) {
					print("Non-elemental damage charm: " + items[0].fname);
				}
				
				dmgCharms.push(items[0]);
			} else if (eleDmgCheck(items[0])) {
				if (verbose) {
					print("Elemental damage charm: " + items[0].fname);
				}

				eleDmgCharms.push(items[0]);
			} else {
				if (verbose) {
					print("Failed all checks. Adding to checkList: " + items[0].fname);
				}

				addToCheckList(items[0]);
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

			typeA.sort(function (a, b) {
				return NTIP.GetTier(b) - NTIP.GetTier(a);
			});

			if (verbose) {
				for (let i = 0; i < typeA.length; i++) {
					print("typeA[" + i + "] = " + NTIP.GetTier(typeA[i]));
				}
			}

			if (invoquantity > 0) {
				for (let i = invoquantity; i < typeA.length; i++) {
					addToCheckList(typeA[i]);

					typeA.splice(i, 1);
					i -= 1;
				}	
			} else if (invoquantity === 0) {
				backupCheck = backupCheck.concat(typeA);

				for (let i = 0; i < typeA.length; i++) {	//Delete typeA charms

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
			
			typeB.sort(function (a, b) {
				return NTIP.GetCharmTier(b) - NTIP.GetCharmTier(a);
			});

			if (verbose) {
				for (let i = 0; i < typeB.length; i++) {
					print("typeB[" + i + "] = " + NTIP.GetCharmTier(typeB[i]));
				}	
			}
			
			if (invoquantity > 0) {
				for (let i = invoquantity; i < typeB.length; i++) {
					addToCheckList(typeB[i]);

					typeB.splice(i, 1);
					i -= 1;
				}	
			} else if (invoquantity === 0) {
				backupCheck = backupCheck.concat(typeB);

				for (let i = 0; i < typeB.length; i++) {	//Delete typeB charms

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
			
			typeC.sort(function (a, b) {
				return NTIP.GetCharmTier(b) - NTIP.GetCharmTier(a);
			});

			if (verbose) {
				for (let i = 0; i < typeC.length; i++) {
					print("typeC[" + i + "] = " + NTIP.GetTier(typeC[i]));
				}	
			}
			
			if (invoquantity > 0) {
				for (let i = invoquantity; i < typeC.length; i++) {
					addToCheckList(typeC[i]);

					typeC.splice(i, 1);
					i -= 1;
				}	
			} else if (invoquantity === 0) {
				backupCheck = backupCheck.concat(typeC);

				for (let i = 0; i < typeC.length; i++) {	//Delete typeC charms

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
			
			resCharms.sort(function (a, b) {
				return NTIP.GetCharmTier(b) - NTIP.GetCharmTier(a);
			});

			if (verbose) {
				for (let i = 0; i < resCharms.length; i++) {
					print("resCharms[" + i + "] = " + NTIP.GetCharmTier(resCharms[i]));
				}	
			}
			
			if (invoquantity > 0) {
				for (let i = invoquantity; i < resCharms.length; i++) {
					addToCheckList(resCharms[i]);

					resCharms.splice(i, 1);
					i -= 1;
				}	
			} else if (invoquantity === 0) {
				backupCheck = backupCheck.concat(resCharms);

				for (let i = 0; i < resCharms.length; i++) {	//Delete resCharms

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
			
			healthCharms.sort(function (a, b) {
				return NTIP.GetCharmTier(b) - NTIP.GetCharmTier(a);
			});

			if (verbose) {
				for (let i = 0; i < healthCharms.length; i++) {
					print("healthCharms[" + i + "] = " + NTIP.GetCharmTier(healthCharms[i]));
				}	
			}
			
			if (invoquantity > 0) {
				for (let i = invoquantity; i < healthCharms.length; i++) {
					addToCheckList(healthCharms[i]);

					healthCharms.splice(i, 1);
					i -= 1;
				}	
			} else if (invoquantity === 0) {
				backupCheck = backupCheck.concat(healthCharms);

				for (let i = 0; i < healthCharms.length; i++) {	//Delete healthCharms

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
			
			mfCharms.sort(function (a, b) {
				return NTIP.GetCharmTier(b) - NTIP.GetCharmTier(a);
			});

			if (verbose) {
				for (let i = 0; i < mfCharms.length; i++) {
					print("mfCharms[" + i + "] = " + NTIP.GetCharmTier(mfCharms[i]));
				}	
			}
			
			if (invoquantity > 0) {
				for (let i = invoquantity; i < mfCharms.length; i++) {
					addToCheckList(mfCharms[i]);

					mfCharms.splice(i, 1);
					i -= 1;
				}	
			} else if (invoquantity === 0) {
				backupCheck = backupCheck.concat(mfCharms);

				for (let i = 0; i < mfCharms.length; i++) {	//Delete mfCharms

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

			dmgCharms.sort(function (a, b) {
				return NTIP.GetCharmTier(b) - NTIP.GetCharmTier(a);
			});

			if (verbose) {
				for (let i = 0; i < dmgCharms.length; i++) {
					print("dmgCharms[" + i + "] = " + NTIP.GetCharmTier(dmgCharms[i]));
				}	
			}
			
			if (invoquantity > 0) {
				for (let i = invoquantity; i < dmgCharms.length; i++) {
					addToCheckList(dmgCharms[i]);

					dmgCharms.splice(i, 1);
					i -= 1;
				}	
			} else if (invoquantity === 0) {
				backupCheck = backupCheck.concat(dmgCharms);

				for (let i = 0; i < dmgCharms.length; i++) {	//Delete dmgCharms

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

			eleDmgCharms.sort(function (a, b) {
				return NTIP.GetCharmTier(b) - NTIP.GetCharmTier(a);
			});

			if (verbose) {
				for (let i = 0; i < eleDmgCharms.length; i++) {
					print("dmgCharms[" + i + "] = " + NTIP.GetCharmTier(eleDmgCharms[i]));
				}	
			}
			
			if (invoquantity > 0) {
				for (let i = invoquantity; i < eleDmgCharms.length; i++) {
					addToCheckList(eleDmgCharms[i]);

					eleDmgCharms.splice(i, 1);
					i -= 1;
				}	
			} else if (invoquantity === 0) {
				backupCheck = backupCheck.concat(eleDmgCharms);

				for (let i = 0; i < eleDmgCharms.length; i++) {	//Delete eleDmgCharms

					eleDmgCharms.splice(i, 1);
					i -= 1;
				}
			}
			
		} 

	}

	// If stats are unspecifed, this will filter charms and keep highest based on maxquantity. If no maxquantity defined it will keep two of that type
	if (backupCheck.length > 0) {
		let invoquantity = NTIP.getInvoQuantity(backupCheck[0]);

		if (invoquantity === undefined) {
			invoquantity = 2;
		}

		if (verbose) {
			print("Amount of Misc charms: " + backupCheck.length);
			print("invoquantity: " + invoquantity);	
		}

		if (backupCheck.length > invoquantity) {

			backupCheck.sort(function (a, b) {
				return NTIP.GetCharmTier(b) - NTIP.GetCharmTier(a);
			});

			if (verbose) {
				for (let i = 0; i < backupCheck.length; i++) {
					print("MiscCharms[" + i + "] = " + NTIP.GetCharmTier(backupCheck[i]));
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
	if (!item || item.quality === 7) {
		return false;
	}

	let charms, max, items = me.findItems(-1, 0),
		stats = [[0, 1, 2], [8, 9, 10], [16, 17, 18,], [24, 25, 26], [32, 33, 34], [40, 41, 42], [48, 49, 50]][me.classid];

	if (!items) {
		print("Couldn't find my items");
		return false;
	}

	function findCharmType (item) {
		if (!NTIP.hasStats(item) && NTIP.GetCharmTier(item) > 0) {
			return "undefined";
		}

		if (item.getStat(188, stats[0])) {	
			return "typeA";
		} else if (item.getStat(188, stats[1])) {
			return "typeB";
		} else if (item.getStat(188, stats[2])) {
			return "typeC";
		} else if (item.getStat(7)) {
			return "health";
		} else if (item.getStat(80)) {
			return "mf";
		} else if (item.getStat(39) || item.getStat(41) || item.getStat(43) || item.getStat(45)) {
			return "res";
		} else if (item.getStat(21) || item.getStat(22) || item.getStat(19)) {
			return "damage";
		} else if (item.getStat(48) || item.getStat(49) || item.getStat(50) ||
			item.getStat(51) || item.getStat(52) || item.getStat(53) ||
			item.getStat(54) || item.getStat(55) || item.getStat(57) ||
			item.getStat(58)) {
			
			return "eleDmg";
		} else {
			return "undefined";
		}
	};

	switch(item.classid) {
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

	switch (findCharmType(item)) {
	case "typeA":
		if (!charms.typeA.length) {
			break;
		}

		//It's the only item
		if (item.gid === charms.typeA[charms.typeA.length - 1].gid) {
			return true;
		}

		if (NTIP.GetCharmTier(item) > NTIP.GetCharmTier(charms.typeA[charms.typeA.length - 1])) {
			return true;
		} else {
			return false;
		}
	case "typeB":
		if (!charms.typeB.length) {
			break;
		}

		if (item.gid === charms.typeB[charms.typeB.length - 1].gid) {
			return true;
		}
		
		if (NTIP.GetCharmTier(item) > NTIP.GetCharmTier(charms.typeB[charms.typeB.length - 1])) {
			return true;
		} else {
			return false;
		}
	case "typeC":
		if (!charms.typeC.length) {
			break;
		}

		if (item.gid === charms.typeC[charms.typeC.length - 1].gid) {
			return true;
		}
		
		if (NTIP.GetCharmTier(item) > NTIP.GetCharmTier(charms.typeC[charms.typeC.length - 1])) {
			return true;
		} else {
			return false;
		}
	case "res":
		if (!charms.resCharms.length) {
			break;
		}

		if (item.gid === charms.resCharms[charms.resCharms.length - 1].gid) {
			return true;
		}
		
		if (NTIP.GetCharmTier(item) > NTIP.GetCharmTier(charms.resCharms[charms.resCharms.length - 1])) {
			return true;
		} else {
			return false;
		}
	case "health":
		if (!charms.healthCharms.length) {
			break;
		}

		if (item.gid === charms.healthCharms[charms.healthCharms.length - 1].gid) {
			return true;
		}
		
		if (NTIP.GetCharmTier(item) > NTIP.GetCharmTier(charms.healthCharms[charms.healthCharms.length - 1])) {
			return true;
		} else {
			return false;
		}
	case "mf":
		if (!charms.mfCharms.length) {
			break;
		}

		if (item.gid === charms.mfCharms[charms.mfCharms.length - 1].gid) {
			return true;
		}
		
		if (NTIP.GetCharmTier(item) > NTIP.GetCharmTier(charms.mfCharms[charms.mfCharms.length - 1])) {
			return true;
		} else {
			return false;
		}
	case "damage":
		if (!charms.dmgCharms.length) {
			break;
		}

		if (item.gid === charms.dmgCharms[charms.dmgCharms.length - 1].gid) {
			return true;
		}
		
		if (NTIP.GetCharmTier(item) > NTIP.GetCharmTier(charms.dmgCharms[charms.dmgCharms.length - 1])) {
			return true;
		} else {
			return false;
		}
	case "eleDmg":
		if (!charms.eleDmgCharms.length) {
			break;
		}

		if (item.gid === charms.eleDmgCharms[charms.eleDmgCharms.length - 1].gid) {
			return true;
		}
		
		if (NTIP.GetCharmTier(item) > NTIP.GetCharmTier(charms.eleDmgCharms[charms.eleDmgCharms.length - 1])) {
			return true;
		} else {
			return false;
		}
	default:
		if (!charms.backupCheck.length) {
			break;
		}

		//It's the only item
		if (item.gid === charms.backupCheck[charms.backupCheck.length - 1].gid) {
			return true;
		}
		
		if (NTIP.GetCharmTier(item) > NTIP.GetCharmTier(charms.backupCheck[charms.backupCheck.length - 1])) {
			return true;
		} else {
			return false;
		}
	}

	return true;
};

Item.autoEquipCharms = function (verbose) {
	let cancelFlags = [0x01, 0x02, 0x04, 0x08, 0x14, 0x16, 0x0c, 0x0f, 0x19, 0x1a];
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
	
	let totalKeep = totalKeep.concat(SCs.keep, LCs.keep, GCs.keep);
	let totalSell = totalSell.concat(SCs.sell, LCs.sell, GCs.sell);

	if (totalKeep.length > 0) {
		print("ÿc9GuysSoloLevelingÿc0: Total Charms Kept: " + totalKeep.length);
	}

	if (totalSell.length > 0) {
		print("ÿc9GuysSoloLevelingÿc0: Total Charms Sell: " + totalSell.length);

		for (let i = 0; i < totalSell.length; i++) {
			if (totalSell[i].location === 7 && !getUIFlag(0x19)) {
				Town.openStash();
			}

			if (totalSell[i].location === 7 && !Storage.Inventory.MoveTo(totalSell[i])) {
				totalSell[i].drop();

				totalSell.splice(i, 1);

				i -= 1;
			}
		}

		Town.initNPC("Shop", "clearInventory");

		if (getUIFlag(0xC) || (Config.PacketShopping && getInteractedNPC() && getInteractedNPC().itemcount > 0)) {
			for (let i = 0; i < totalSell.length; i++) {
				print("ÿc9GuysSoloLevelingÿc0: Sell old charm " + totalSell[i].name);
				Misc.itemLogger("Sold", totalSell[i]);
				Misc.logItem("CharmEquip Sold", totalSell[i]);
				totalSell[i].sell();
			}
		}
	}

	if (totalKeep.length > 0) {
		for (let i = 0; i < totalKeep.length; i++) {
			if (totalKeep[i].location === 7 && Pickit.checkItem(totalKeep[i]).result !== 2) {
				Town.openStash();
				delay(300 + me.ping);
				if (Storage.Inventory.CanFit(totalKeep[i])) {
					Storage.Inventory.MoveTo(totalKeep[i]);
					Misc.logItem("Equipped", totalKeep[i]);
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
};
