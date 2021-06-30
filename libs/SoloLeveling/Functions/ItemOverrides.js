/*
*	@filename	ItemOverrides.js
*	@author		isid0re
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
	case 24: //
	case 25: //
	case 26: //
	case 27: //
	case 28: //
	case 29: //
	case 30: //
	case 31: //
	case 32: //
	case 33: //
	case 34: //
	case 35: //
	case 36: //
	case 42: //
	case 43: //
	case 44: //
	case 68: //
	case 85: //
	case 86: //
	case 87: //
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
