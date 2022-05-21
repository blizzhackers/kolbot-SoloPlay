/**
*  @filename    ItemOverrides.js
*  @author      theBGuy
*  @credit      dzik, sonic
*  @desc        AutoEquip and Item related functions
*
*/

!isIncluded("common/Misc.js") && include("common/Misc.js");
!isIncluded("SoloPlay/Functions/PrototypesOverrides.js") && include("SoloPlay/Functions/PrototypesOverrides.js");

Item.getQuantityOwned = function (item = undefined) {
	if (!item) return 0;
	
	let myItems = me.getItemsEx()
		.filter(check =>
			check.itemType === item.itemType // same item type as current
				&& check.classid === item.classid // same item classid as current
				&& check.quality === item.quality // same item quality as current
				&& check.getStat(sdk.stats.NumSockets) === item.getStat(sdk.stats.NumSockets) // same socket count
				&& check.isInStorage
		);

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
		bodyLoc = me.barbarian ? [4, 5] : 4;

		break;
	case sdk.itemtype.HandtoHand:
	case sdk.itemtype.AssassinClaw:
		bodyLoc = !Check.currentBuild().caster && me.assassin ? [4, 5] : 4;

		break;
	default:
		return false;
	}

	return Array.isArray(bodyLoc) ? bodyLoc : [bodyLoc];
};

// todo: clean this up
Item.getEquippedItem = function (bodyLoc = -1) {
	let item = me.getItemsEx().filter((item) => item.isEquipped && item.bodylocation === bodyLoc).first();

	if (item) {
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
			durability: (item.getStat(sdk.stats.Quantity) ? 100 : (item.getStat(72) * 100 / item.getStat(73))),
			sockets: item.getStat(sdk.stats.NumSockets),
			socketed: item.getItemsEx().length > 0,
			isRuneword: item.runeword,
			twoHanded: item.twoHanded,
		};
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
	if (!item || item.type !== sdk.unittype.Item || !item.identified) return false;
	return me.charlvl >= item.getStat(sdk.stats.LevelReq) && me.trueStr >= item.strreq && me.trueDex >= item.dexreq;
};

Item.autoEquipCheck = function (item) {
	if (!Config.AutoEquip) return true;

	let tier = NTIP.GetTier(item),
		bodyLoc = this.getBodyLoc(item);

	if (tier > 0 && bodyLoc) {
		for (let i = 0; i < bodyLoc.length; i += 1) {
			if (tier > this.getEquippedItem(bodyLoc[i]).tier && (this.canEquip(item) || !item.identified)) {
				if (item.twoHanded && !me.barbarian) {
					if (tier < this.getEquippedItem(4).tier + this.getEquippedItem(5).tier) return false;
				}

				if (!me.barbarian && bodyLoc[i] === 5 && this.getEquippedItem(bodyLoc[i]).tier === -1) {
					if (this.getEquippedItem(4).twoHanded && tier < this.getEquippedItem(4).tier) return false;
				}

				return true;
			}
		}
	}

	return false;
};

Item.autoEquipKeepCheck = function (item) {
	if (!Config.AutoEquip) return true;

	let tier = NTIP.GetTier(item),
		bodyLoc = this.getBodyLoc(item);

	if (tier > 0 && bodyLoc) {
		for (let i = 0; i < bodyLoc.length; i += 1) {
			if (tier > this.getEquippedItem(bodyLoc[i]).tier) {
				if (item.twoHanded && !me.barbarian) {
					if (tier < this.getEquippedItem(4).tier + this.getEquippedItem(5).tier) return false;
				}

				if (!me.barbarian && bodyLoc[i] === 5 && this.getEquippedItem(bodyLoc[i]).tier === -1) {
					if (this.getEquippedItem(4).twoHanded && tier < this.getEquippedItem(4).tier) return false;
				}

				return true;
			}
		}
	}

	return false;
};

Item.autoEquip = function () {
	if (!Config.AutoEquip) return true;

	console.log("ÿc8Kolbot-SoloPlayÿc0: Entering auto equip");

	let tick = getTickCount();
	let items = me.getItemsEx()
		.filter(function (item) {
			if (!item.isInStorage) return false;
			let tier = NTIP.GetTier(item);
			return (item.identified ? tier > 0 : tier !== 0);
		});

	// couldn't find my items
	if (!items.length) return false;

	function sortEq (a, b) {
		if (Item.canEquip(a)) return -1;
		if (Item.canEquip(b)) return 1;

		return 0;
	}

	// ring check - sometimes a higher tier ring ends up on the wrong finger causing a rollback loop
	if (this.getEquippedItem(7).tier > this.getEquippedItem(6).tier) {
		console.log("ÿc9AutoEquipÿc0 :: Swapping rings, higher tier ring is on the wrong finger");
		clickItemAndWait(0, 7);
		delay(200);
		me.itemoncursor && clickItemAndWait(0, 6);
		delay(200);
		me.itemoncursor && clickItemAndWait(0, 7);
	}

	me.cancel();

	while (items.length > 0) {
		items.sort(sortEq);
		let tier = NTIP.GetTier(items[0]);
		let bodyLoc = this.getBodyLoc(items[0]);

		if (tier > 0 && bodyLoc) {
			for (let j = 0; j < bodyLoc.length; j += 1) {
				let equippedItem = this.getEquippedItem(bodyLoc[j]);
				if (items[0].isInStorage && tier > equippedItem.tier && equippedItem.classid !== sdk.items.quest.KhalimsWill) {
					if (!items[0].identified) {
						let idTool = Town.getIdTool();

						if (idTool) {
							items[0].isInStash && Town.openStash();
							Town.identifyItem(items[0], idTool);
						}
					}

					if (items[0].twoHanded && !me.barbarian) {
						if (tier < this.getEquippedItem(4).tier + this.getEquippedItem(5).tier) {
							continue;
						}
						console.log("ÿc9AutoEquipÿc0 :: TwoHandedWep better than sum tier of currently equipped main + shield hand : " + items[0].fname + " Tier: " + tier);
					}

					if (!me.barbarian && bodyLoc[j] === 5 && equippedItem.tier === -1 && this.getEquippedItem(4).twoHanded) {
						if (tier < this.getEquippedItem(4).tier) {
							continue;
						}
						console.log("ÿc9AutoEquipÿc0 :: TwoHandedWep not as good as what we want to equip on our shield hand : " + items[0].fname + " Tier: " + tier);
					}

					let gid = items[0].gid;
					console.debug(items[0].name);

					if (this.equip(items[0], bodyLoc[j])) {
						console.log("ÿc9AutoEquipÿc0 :: Equipped: " + items[0].fname + " Tier: " + tier);
						// item that can have sockets
						if (items[0].getItemType()) {
							SoloWants.addToList(items[0]);
							SoloWants.ensureList();
						}
						Developer.debugging.autoEquip && Misc.logItem("Equipped", me.getItem(-1, -1, gid));
						Developer.logEquipped && MuleLogger.logEquippedItems();
					} else if (items[0].lvlreq > me.charlvl && !items[0].isInStash) {
						if (Storage.Stash.CanFit(items[0])) {
							console.log("ÿc9AutoEquipÿc0 :: Item level is to high, attempting to stash for now as its better than what I currently have: " + items[0].fname + " Tier: " + tier);
							Storage.Stash.MoveTo(items[0]);
						}
					} else if (me.getItem(-1, -1, gid)) {
						// Make sure we didn't lose it during roll back
						continue;
					}

					break;
				}
			}
		}

		items.shift();
	}

	console.log("ÿc8Kolbot-SoloPlayÿc0: Exiting auto equip. Time elapsed: " + Developer.formatTime(getTickCount() - tick));
	return true;
};

Item.equip = function (item, bodyLoc) {
	// can't equip
	if (!this.canEquip(item)) return false;

	// Already equipped in the right slot
	if (item.mode === sdk.itemmode.Equipped && item.bodylocation === bodyLoc) return true;
	// failed to open stash
	if (item.isInStash && !Town.openStash()) return false;
	// failed to open cube
	if (item.isInCube && !Cubing.openCube()) return false;

	let rolledBack = false;
	// todo: sometimes rings get bugged with the higher tier ring ending up on the wrong finger, if this happens swap them

	for (let i = 0; i < 3; i += 1) {
		if (item.toCursor()) {
			clickItemAndWait(0, bodyLoc);

			if (item.bodylocation === bodyLoc) {
				if (getCursorType() === 3) {
					let cursorItem = getUnit(100);

					if (cursorItem) {
						// rollback check
						let justEquipped = this.getEquippedItem(bodyLoc);
						if (NTIP.GetTier(cursorItem) > justEquipped.tier && !item.questItem && !justEquipped.isRuneword/*Wierd bug with runewords that it'll fail to get correct item desc so don't attempt rollback*/) {
							console.debug("ROLLING BACK TO OLD ITEM BECAUSE IT WAS BETTER");
							console.debug("OldItem: " + NTIP.GetTier(cursorItem) + " Just Equipped Item: " + this.getEquippedItem(bodyLoc).tier);
							clickItemAndWait(0, bodyLoc);
							cursorItem = getUnit(100);
							rolledBack = true;
						}

						if (Pickit.checkItem(cursorItem).result === 1
						// only keep wanted items or cubing items (in rare cases where weapon being used is also a cubing wanted item)
						|| (cursorItem.quality === 7 && Pickit.checkItem(cursorItem).result === 2)
						// or keep if item is worth selling
						|| (cursorItem.getItemCost(1) / (cursorItem.sizex * cursorItem.sizey) >= (me.normal ? 50 : me.nightmare ? 500 : 1000))) {
							if (Storage.Inventory.CanFit(cursorItem)) {
								Storage.Inventory.MoveTo(cursorItem);
							}
						} else {
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
		: me.getItemsEx().filter((item) => item.isEquipped && item.bodylocation === bodyLoc).first();

	!me.inTown && Town.goToTown();
	!getUIFlag(sdk.uiflags.Stash) && Town.openStash();

	if (removable) {
		removable.isOnSwap && me.weaponswitch !== 1 && me.switchWeapons(1);
		removable.toCursor();
		let cursorItem = getUnit(100);

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

		me.weaponswitch === 1 && me.switchWeapons(0);

		return true;
	}

	return false;
};

Item.hasSecondaryTier = function (item) {
	return Config.AutoEquip && NTIP.GetSecondaryTier(item) > 0 && me.expansion;
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
		bodyLoc = me.barbarian ? [11, 12] : 11;

		break;
	case sdk.itemtype.HandtoHand:
	case sdk.itemtype.AssassinClaw:
		bodyLoc = !Check.currentBuild().caster && me.assassin ? [11, 12] : 11;

		break;
	default:
		return false;
	}

	return Array.isArray(bodyLoc) ? bodyLoc : [bodyLoc];
};

Item.secondaryEquip = function (item, bodyLoc) {
	if (!this.canEquip(item) && me.expansion) return false;
	// Already equipped in the right slot
	if (item.mode === sdk.itemmode.Equipped && item.bodylocation === bodyLoc) return true;
	if (item.isInStash && !Town.openStash()) return false;

	me.switchWeapons(1); // Switch weapons

	for (let i = 0; i < 3; i += 1) {
		if (item.toCursor()) {
			clickItemAndWait(0, bodyLoc - 7);

			if (item.bodylocation === bodyLoc - 7) {
				if (getCursorType() === 3) {
					let cursorItem = getUnit(100);

					if (cursorItem) {
						if (Pickit.checkItem(cursorItem).result === 1
						// only keep wanted items or cubing items (in rare cases where weapon being used is also a cubing wanted item)
						|| (cursorItem.quality === 7 && Pickit.checkItem(cursorItem).result === 2)
						// or keep if item is worth selling
						|| (cursorItem.getItemCost(1) / (cursorItem.sizex * cursorItem.sizey) >= (me.normal ? 50 : me.nightmare ? 500 : 1000))) {
							Storage.Inventory.CanFit(cursorItem) && Storage.Inventory.MoveTo(cursorItem);
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

	// Switch back to primary
	me.weaponswitch !== 0 && me.switchWeapons(0);

	return false;
};

Item.autoEquipCheckSecondary = function (item) {
	if (!Config.AutoEquip) return true;
	if (me.classic) return false;

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
	if (!Config.AutoEquip || me.classic) return true;

	console.log("ÿc8Kolbot-SoloPlayÿc0: Entering secondary auto equip");
	let tick = getTickCount();

	let items = me.getItemsEx()
		.filter(function (item) {
			if (!item.isInStorage) return false;
			let tier = NTIP.GetSecondaryTier(item);
			return (item.identified ? tier > 0 : tier !== 0);
		});

	if (!items) return false;

	function sortEq (a, b) {
		if (Item.canEquip(a)) return -1;
		if (Item.canEquip(b)) return 1;

		return 0;
	}

	me.cancel();

	while (items.length > 0) {
		items.sort(sortEq);
		let tier = NTIP.GetSecondaryTier(items[0]);
		let bodyLoc = this.getBodyLocSecondary(items[0]);

		if (tier > 0 && bodyLoc) {
			for (let j = 0; j < bodyLoc.length; j += 1) {
				if ([sdk.storage.Inventory, sdk.storage.Stash].indexOf(items[0].location) > -1 && tier > this.getEquippedItem(bodyLoc[j]).secondarytier && this.getEquippedItem(bodyLoc[j]).classid !== sdk.items.quest.KhalimsWill) {
					if (!items[0].identified) {
						let idTool = Town.getIdTool();

						if (idTool) {
							items[0].isInStash && Town.openStash();
							Town.identifyItem(items[0], idTool);
						}
					}

					let gid = items[0].gid;
					console.debug(items[0].name);

					if (this.secondaryEquip(items[0], bodyLoc[j])) {
						console.log("ÿc9SecondaryEquipÿc0 :: Equipped: " + items[0].fname + " SecondaryTier: " + tier);
						Developer.debugging.autoEquip && Misc.logItem("Equipped switch", me.getItem(-1, -1, gid));
						Developer.logEquipped && MuleLogger.logEquippedItems();
					}

					break;
				}
			}
		}

		items.shift();
	}

	console.log("ÿc8Kolbot-SoloPlayÿc0: Exiting secondary auto equip. Time elapsed: " + Developer.formatTime(getTickCount() - tick));
	return true;
};

// AUTO EQUIP MERC - modified from dzik's
Item.hasMercTier = function (item) {
	return Config.AutoEquip && NTIP.GetMercTier(item) > 0 && me.expansion;
};

// need to re-work using char data so we can shop/keep items if merc is dead *but* we have enough to revive him and buy the item and enough space
Item.canEquipMerc = function (item, bodyLoc) {
	if (item.type !== sdk.unittype.Item || me.classic) return false;
	let mercenary = Merc.getMercFix();

	// dont have merc or he is dead or unidentifed item
	if (!mercenary || !item.identified) return false;
	let curr = Item.getEquippedItemMerc(bodyLoc);

	// Higher requirements
	if (item.getStat(sdk.stats.LevelReq) > mercenary.getStat(sdk.stats.Level)
		|| item.dexreq > mercenary.getStat(sdk.stats.Dexterity) - curr.dex
		|| item.strreq > mercenary.getStat(sdk.stats.Strength) - curr.str) {
		return false;
	}

	return true;
};

Item.equipMerc = function (item, bodyLoc) {
	let mercenary = Merc.getMercFix();

	// dont have merc or he is dead or higher requirements
	if (!mercenary || !Item.canEquipMerc(item, bodyLoc)) return false;
	// Already equipped in the right slot
	if (item.mode === sdk.itemmode.Equipped && item.bodylocation === bodyLoc) return true;
	if (item.isInStash && !Town.openStash()) return false;

	for (let i = 0; i < 3; i += 1) {
		if (item.toCursor()) {
			if (clickItem(4, bodyLoc)) {
				delay(500 + me.ping * 2);
				Developer.debugging.autoEquip && Misc.logItem("Merc Equipped", mercenary.getItem(item.classid));
			}

			if (item.bodylocation === bodyLoc) {
				if (getCursorType() === 3) {
					let cursorItem = getUnit(100);

					if (cursorItem) {
						if (Pickit.checkItem(cursorItem).result === 1
						// only keep wanted items or cubing items (in rare cases where weapon being used is also a cubing wanted item)
						|| (cursorItem.quality === 7 && Pickit.checkItem(cursorItem).result === 2)
						// or keep if item is worth selling
						|| (cursorItem.getItemCost(1) / (cursorItem.sizex * cursorItem.sizey) >= (me.normal ? 50 : me.nightmare ? 500 : 1000))) {
							Storage.Inventory.CanFit(cursorItem) && Storage.Inventory.MoveTo(cursorItem);
						} else {
							cursorItem.drop();
						}
					}
				}

				Developer.logEquipped && MuleLogger.logEquippedItems();

				return true;
			}
		}
	}

	return false;
};

Item.getEquippedItemMerc = function (bodyLoc = -1) {
	let mercenary = Merc.getMercFix();

	if (mercenary) {
		let item = mercenary.getItemsEx().filter((item) => item.isEquipped && item.bodylocation === bodyLoc).first();

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

Item.getBodyLocMerc = function (item) {
	let bodyLoc = false, mercenary = Merc.getMercFix();

	// dont have merc or he is dead
	if (!mercenary) return false;

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
		if (mercenary.classid === sdk.monsters.mercs.IronWolf || mercenary.classid === sdk.monsters.mercs.A5Barb) {
			bodyLoc = 4;
		}

		break;
	default:
		return false;
	}

	return Array.isArray(bodyLoc) ? bodyLoc : [bodyLoc];
};

Item.autoEquipCheckMerc = function (item) {
	if (!Config.AutoEquip) return true;
	if (Config.AutoEquip && !Merc.getMercFix()) return false;

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
	if (!Config.AutoEquip) return true;
	if (Config.AutoEquip && !Merc.getMercFix()) return false;

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
	if (!Config.AutoEquip || !Merc.getMercFix()) return true;

	let items = me.getItemsEx()
		.filter(function (item) {
			if (!item.isInStorage) return false;
			let tier = NTIP.GetMercTier(item);
			return (item.identified ? tier > 0 : tier !== 0);
		});

	if (!items.length) return false;

	function sortEq (a, b) {
		if (Item.canEquipMerc(a) && Item.canEquipMerc(b)) {
			return NTIP.GetMercTier(b) - NTIP.GetMercTier(a);
		}

		if (Item.canEquipMerc(a)) return -1;
		if (Item.canEquipMerc(b)) return 1;

		return 0;
	}

	me.cancel();

	while (items.length > 0) {
		items.sort(sortEq);
		let tier = NTIP.GetMercTier(items[0]);
		let bodyLoc = Item.getBodyLocMerc(items[0]);

		if (tier > 0 && bodyLoc) {
			for (let j = 0; j < bodyLoc.length; j += 1) {
				if ([sdk.storage.Inventory, sdk.storage.Stash].includes(items[0].location) && tier > Item.getEquippedItemMerc(bodyLoc[j]).tier) {
					if (!items[0].identified) {
						let idTool = Town.getIdTool();

						if (idTool) {
							items[0].isInStash && Town.openStash();
							Town.identifyItem(items[0], idTool);
						}
					}

					console.log("Merc " + items[0].name);
					this.equipMerc(items[0], bodyLoc[j]) && console.log("ÿc9MercEquipÿc0 :: Equipped: " + items[0].fname + " MercTier: " + tier);
					
					let cursorItem = getUnit(100);

					if (cursorItem) {
						cursorItem.drop();
						Developer.debugging.autoEquip && Misc.logItem("Merc Dropped", cursorItem);
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
	let mercenary = Merc.getMercFix();
	if (!mercenary) return true;
	// Sort items so we try to keep the highest tier'd items in case space in our invo is limited
	let items = mercenary.getItemsEx().sort((a, b) => NTIP.GetMercTier(b) - NTIP.GetMercTier(a));

	if (items) {
		for (let i = 0; i < items.length; i++) {
			clickItem(4, items[i].bodylocation);
			delay(500 + me.ping * 2);

			let cursorItem = getUnit(100);

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

// Charm Autoequip - TODO: clean this section up...sigh
// need to re-write how charms are handled, currently final charms are a bit bugged.
// Also can't add charms from main lists to backup check, because it causes issues with the invoquantity check, basically need to re-write not using ntip because it sucks
// end goal, being able to define which types of charms to keep while leveling AND which charms we want for final builds. Handle if amounts are different
Item.hasCharmTier = function (item) {
	return me.expansion && Config.AutoEquip && NTIP.GetCharmTier(item) > 0;
};

Item.maxFinalSCs = 0;
Item.maxFinalLCs = 0;
Item.maxFinalGCs = 0;
Item.finalEquippedSCs = [];
Item.finalEquippedLCs = [];
Item.finalEquippedGCs = [];

// Iterate over charm checklist, pickit result 0 and 4 get sold
// Otherwise if its not in the stash already and not a final charm try and stash it. I don't remember why I checked if it wasn't a final charm
const spliceCharmCheckList = function (checkList = [], verbose = false) {
	for (let i = 0; i < checkList.length; i++) {
		let currCharm = checkList[i];
		if (!currCharm || [0, 4].includes(Pickit.checkItem(currCharm).result)) continue;
		if (!currCharm.isInStash && !NTIP.checkFinalCharm(currCharm)) {
			if (!Storage.Stash.MoveTo(currCharm)) {
				verbose && Misc.itemLogger("Dropped", currCharm);
				currCharm.drop();
			} else {
				if (verbose) {
					Cubing.checkItem(currCharm) ? Misc.logItem("Stashed Cubing Ingredient", currCharm) : Misc.logItem("Stashed", currCharm);
				}
			}
		}

		checkList.splice(i, 1);
		i -= 1;
	}

	return checkList;
};

const spliceCharmKeepList = function (keep = []) {
	let id = keep[0].classid;
	let cap = (id === sdk.items.SmallCharm ? Item.maxFinalSCs : id === sdk.items.LargeCharm ? Item.maxFinalLCs : Item.maxFinalGCs);
	// charms.keep
	// 	.filter(charm => NTIP.checkFinalCharm(charm))
	// 	.sort((a, b) => NTIP.GetCharmTier(b) - NTIP.GetCharmTier(a))
	// 	.forEach(charm => {
	// 		if (!Item.finalEquippedSCs.includes(charm.gid)) {
	// 			Item.finalEquippedSCs.push(charm.gid);
	// 			verbose && console.log("ÿc8Kolbot-SoloPlayÿc0: CharmEquip Equipped Final SC " + charm.fname);
	// 		}
	// 	});

	// sort through kept charms
	if (keep.length > cap) {
		keep.sort((a, b) => NTIP.GetCharmTier(b) - NTIP.GetCharmTier(a));

		// check list up until our final charm cap and if its a wanted final charm that isn't in our array then add it
		for (let i = 0; i < cap; i++) {
			if (NTIP.checkFinalCharm(keep[i])) {
				switch (id) {
				case sdk.items.SmallCharm:
					if (!Item.finalEquippedSCs.includes(keep[i].gid)) {
						Item.finalEquippedSCs.push(keep[i].gid);
						verbose && console.log("ÿc8Kolbot-SoloPlayÿc0: CharmEquip Equipped Final SC " + keep[i].fname);
					}
					
					break;
				case sdk.items.LargeCharm:
					if (!Item.finalEquippedLCs.includes(keep[i].gid)) {
						Item.finalEquippedLCs.push(keep[i].gid);
						verbose && console.log("ÿc8Kolbot-SoloPlayÿc0: CharmEquip Equipped Final LC " + keep[i].fname);
					}
					
					break;
				case sdk.items.GrandCharm:
					if (!Item.finalEquippedGCs.includes(keep[i].gid)) {
						Item.finalEquippedGCs.push(keep[i].gid);
						verbose && console.log("ÿc8Kolbot-SoloPlayÿc0: CharmEquip Equipped Final GC " + keep[i].fname);
					}

					break;
				}
			}
		}

		// everything after the cap (need a better method for this in the instances where the max cap is less then leveling wanted cap)
		for (let i = cap; i < keep.length; i++) {
			if (!Item.autoEquipCharmCheck(keep[i])) {
				charms.checkList.push(keep[i]);
				verbose && console.log("ÿc8Kolbot-SoloPlayÿc0: CharmEquip Add " + keep[i].fname + " to checkList");
				keep.splice(i, 1);
				i -= 1;
			}
		}
	}

	return keep;
};

Item.autoEquipSC = function () {
	let verbose = (Developer.debugging.smallCharm || Developer.debugging.autoEquip);
	let items = me.getItemsEx()
		.filter((charm) => charm.isInStorage && charm.classid === sdk.items.SmallCharm && charm.quality === sdk.itemquality.Magic);

	if (!items.length) {
		Developer.debugging.smallCharm && console.log("No charms found");
		return {
			keep: [],
			sell: []
		};
	}

	let charms = Item.autoEquipCharmSort(items, verbose);
	charms.keep = spliceCharmKeepList(charms.keep);

	verbose && console.log("Small Charm checklist length: " + charms.checkList.length);
	charms.checkList = spliceCharmCheckList(charms.checkList, verbose);

	return {
		keep: charms.keep,
		sell: charms.checkList
	};
};

Item.autoEquipLC = function () {
	let verbose = (Developer.debugging.largeCharm || Developer.debugging.autoEquip);
	let items = me.getItemsEx()
		.filter((charm) => charm.isInStorage && charm.classid === sdk.items.LargeCharm && charm.quality === sdk.itemquality.Magic);

	if (!items.length) {
		Developer.debugging.largeCharm && console.log("No charms found");
		return {
			keep: [],
			sell: []
		};
	}

	let charms = Item.autoEquipCharmSort(items, Developer.debugging.largeCharm);
	charms.keep = spliceCharmKeepList(charms.keep);

	verbose && console.log("Large charm checklist length: " + charms.checkList.length);
	charms.checkList = spliceCharmCheckList(charms.checkList, verbose);

	return {
		keep: charms.keep,
		sell: charms.checkList
	};
};

Item.autoEquipGC = function () {
	let verbose = (Developer.debugging.largeCharm || Developer.debugging.autoEquip);
	let items = me.getItemsEx()
		.filter((charm) => charm.isInStorage && charm.classid === sdk.items.GrandCharm && charm.quality === sdk.itemquality.Magic);

	if (!items.length) {
		verbose && console.log("No charms found");
		return {
			keep: [],
			sell: []
		};
	}

	let charms = Item.autoEquipCharmSort(items, verbose);
	charms.keep = spliceCharmKeepList(charms.keep);

	verbose && console.log("Grand charm checklist length: " + charms.checkList.length);
	charms.checkList = spliceCharmCheckList(charms.checkList, verbose);

	return {
		keep: charms.keep,
		sell: charms.checkList
	};
};

Item.autoEquipCharmSort = function (items = [], verbose = false) {
	let charms = {
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

	const addToCheckList = (item) => charms.checkList.indexOf(item) === -1 && charms.checkList.push(item);
	//const addToBackUp = (item) => charms.backup.indexOf(item) === -1 && charms.backup.push(item);

	function sortCharms (arr = []) {
		let invoquantity = NTIP.getInvoQuantity(arr[0]);
		(invoquantity === undefined || invoquantity === -1) && (invoquantity = 2);
		let charmType = Item.getCharmType(arr[0]);
		verbose && console.log("Amount of " + charmType + " Charms: " + arr.length + " invoquantity: " + invoquantity);
		arr.length > 1 && arr.sort((a, b) => NTIP.GetCharmTier(b) - NTIP.GetCharmTier(a));

		if (arr.length > invoquantity) {
			verbose && arr.forEach((el, index) => console.log(charmType + "[" + index + "] = " + NTIP.GetCharmTier(el)));
			arr.forEach(el => {
				if (NTIP.checkFinalCharm(el) && NTIP.getInvoQuantity(el) !== invoquantity
				&& ((el.classid === sdk.items.SmallCharm && invoquantity < Item.maxFinalSCs)
				|| (el.classid === sdk.items.LargeCharm && invoquantity < Item.maxFinalLCs)
				|| (el.classid === sdk.items.GrandCharm && invoquantity < Item.maxFinalGCs))) {
					invoquantity += NTIP.getInvoQuantity(el);
				}
			});

			if (invoquantity > 0) {
				for (let i = invoquantity; i < arr.length; i++) {
					addToCheckList(arr[i]);

					arr.splice(i, 1);
					i -= 1;
				}
			}
		}

		return arr;
	}

	verbose && console.log("Amount of items: " + items.length);
	items.length > 1 && items.sort((a, b) => NTIP.GetCharmTier(b) - NTIP.GetCharmTier(a));
	
	while (items.length > 0) {
		let gid = items[0].gid;

		if (!items[0].identified) {
			let idTool = Town.getIdTool();

			if (idTool) {
				items[0].isInStash && Town.openStash();
				Town.identifyItem(items[0], idTool);

			} else if (items[0].isInStash && (getUIFlag(sdk.uiflags.Stash) || Town.openStash())) {
				Storage.Inventory.MoveTo(items[0]);
				Town.identify();
			}

			if (!getUnit(4, -1, -1, gid)) {
				verbose && console.log("Sold charm during Town.identify()");
				items.shift();

				continue;
			}
		}

		if (NTIP.GetCharmTier(items[0]) <= 0) {
			verbose && console.log("No tier. Adding to checkList: " + items[0].fname);
			addToCheckList(items[0]);

		} else if (!NTIP.hasStats(items[0]) && NTIP.GetCharmTier(items[0]) > 0) {
			verbose && console.log("Multiple Misc charm: " + items[0].fname);
			charms.backup.push(items[0]);

		} else {
			let charmType = Item.getCharmType(items[0]);
			switch (charmType) {
			case "skillerTypeA":
			case "skillerTypeB":
			case "skillerTypeC":
			case "resist":
			case "life":
			case "magicfind":
			case "damage":
			case "elemental":
				charms[charmType].push(items[0]);
				verbose && console.log(charmType + ": " + items[0].fname);

				break;
			default:
				addToCheckList(items[0]);
				verbose && console.log("Failed all checks. Adding to checkList: " + items[0].fname);

				break;
			}
		}

		items.shift();
	}

	if (!charms.skillerTypeA.length && !charms.skillerTypeB.length && !charms.skillerTypeC.length
		&& !charms.damage.length && !charms.resist.length && !charms.elemental.length && !charms.life.length && !charms.backup.length) {
		verbose && console.log("No Charms");
		return charms;
	}

	charms.skillerTypeA.length > 0 && (charms.skillerTypeA = sortCharms(charms.skillerTypeA));
	charms.skillerTypeB.length > 0 && (charms.skillerTypeB = sortCharms(charms.skillerTypeB));
	charms.skillerTypeC.length > 0 && (charms.skillerTypeC = sortCharms(charms.skillerTypeC));
	charms.resist.length > 0 && (charms.resist = sortCharms(charms.resist));
	charms.life.length > 0 && (charms.life = sortCharms(charms.life));
	charms.magicfind.length > 0 && (charms.magicfind = sortCharms(charms.magicfind));
	charms.damage.length > 0 && (charms.damage = sortCharms(charms.damage));
	charms.elemental.length > 0 && (charms.elemental = sortCharms(charms.elemental));

	// If stats are unspecifed, this will filter charms and keep highest based on invoquantity. If no invoquantity defined it will keep two of that type
	charms.backup.length > 0 && (charms.backup = sortCharms(charms.backup));
	charms.keep = charms.keep.concat(charms.skillerTypeA, charms.skillerTypeB, charms.skillerTypeC, charms.resist, charms.life, charms.magicfind, charms.damage, charms.elemental, charms.backup);

	verbose && charms.checkList.forEach((el, index) => console.log("checkList[" + index + "] = " + NTIP.GetCharmTier(el) + " " + el.fname));
	
	return charms;
};

Item.autoEquipCharmCheck = function (item = undefined) {
	if (!item || NTIP.GetCharmTier(item) <= 0) return false;
	// Annhilus, Hellfire Torch, Gheeds - Handled by a different function so return true to keep
	if ([sdk.items.SmallCharm, sdk.items.LargeCharm, sdk.items.GrandCharm].includes(item.classid) && item.quality === sdk.itemquality.Unique) return true;
	// Not a charm
	if (![sdk.items.SmallCharm, sdk.items.LargeCharm, sdk.items.GrandCharm].includes(item.classid)) return false;

	let finalCharms = [];
	finalCharms = finalCharms.concat(Item.finalEquippedSCs, Item.finalEquippedLCs, Item.finalEquippedGCs);
	// is one of our final charms
	if (finalCharms.includes(item.gid)) return true;

	let charms, lowestCharm,
		items = me.getItemsEx()
			.filter(charm => charm.classid === item.classid && charm.isInStorage
				&& charm.quality === sdk.itemquality.Magic && NTIP.GetCharmTier(charm) > 0);
	if (!items.length) return false;

	charms = Item.autoEquipCharmSort(items);
	
	if (charms.keep.length > (item.classid === sdk.items.SmallCharm ? Item.maxFinalSCs : item.classid === sdk.items.LargeCharm ? Item.maxFinalLCs : Item.maxFinalGCs)) {
		switch (item.classid) {
		case sdk.items.SmallCharm:
			lowestCharm = Item.finalEquippedSCs.last();
			
			break;
		case sdk.items.LargeCharm:
			lowestCharm = Item.finalEquippedLCs.last();
			
			break;
		case sdk.items.GrandCharm:
			lowestCharm = Item.finalEquippedGCs.last();

			break;
		}
		if (!!lowestCharm) {
			return !!(NTIP.GetCharmTier(item) >= NTIP.GetCharmTier(lowestCharm) || item.gid === lowestCharm.gid);
		}
	}

	let charmType = Item.getCharmType(item);

	switch (charmType) {
	case "skillerTypeA":
	case "skillerTypeB":
	case "skillerTypeC":
	case "resist":
	case "life":
	case "magicfind":
	case "damage":
	case "elemental":
		lowestCharm = charms[charmType].last();

		break;
	default:
		lowestCharm = charms.backup.last();

		break;
	}

	return !!lowestCharm ? !!(NTIP.GetCharmTier(item) >= NTIP.GetCharmTier(lowestCharm) || item.gid === lowestCharm.gid) : true;
};

Item.initCharms = function () {
	// No charms in classic
	if (me.classic) return;
	// initialzes final charms if we have any
	Item.autoEquipGC() && Item.autoEquipLC() && Item.autoEquipSC();
};

Item.autoEquipCharms = function () {
	// No charms in classic
	if (me.classic) return;

	console.log("ÿc8Kolbot-SoloPlayÿc0: Entering charm auto equip");
	let tick = getTickCount();
	let totalKeep = [], totalSell = [];
	let GCs = Item.autoEquipGC();
	let LCs = Item.autoEquipLC();
	let SCs = Item.autoEquipSC();
	let specialCharms = me.getItemsEx()
		.filter((charm) => [sdk.items.SmallCharm, sdk.items.LargeCharm, sdk.items.GrandCharm].includes(charm.classid) && charm.quality === sdk.itemquality.Unique);
	let verbose = !!(Developer.debugging.smallCharm || Developer.debugging.largeCharm || Developer.debugging.grandCharm);

	if (verbose) {
		console.log("Grand Charms Keep: " + GCs.keep.length + ", Sell: " + GCs.sell.length);
		console.log("Large Charms Keep: " + LCs.keep.length + ", Sell: " + LCs.sell.length);
		console.log("Small Charms Keep: " + SCs.keep.length + ", Sell: " + SCs.sell.length);
	}
	
	totalKeep = totalKeep.concat(SCs.keep, LCs.keep, GCs.keep, specialCharms);
	totalSell = totalSell.concat(SCs.sell, LCs.sell, GCs.sell);
	totalKeep.length > 0 && console.log("ÿc8Kolbot-SoloPlayÿc0: Total Charms Kept: " + totalKeep.length);

	if (totalSell.length > 0) {
		console.log("ÿc8Kolbot-SoloPlayÿc0: Total Charms Sell: " + totalSell.length);

		for (let i = 0; i < totalSell.length; i++) {
			totalSell[i].isInStash && !getUIFlag(sdk.uiflags.Stash) && Town.openStash();
			if (totalSell[i].isInStash && !Storage.Inventory.MoveTo(totalSell[i])) {
				totalSell[i].drop();
				totalSell.splice(i, 1);
				i -= 1;
			}
		}

		Town.initNPC("Shop", "clearInventory");

		if (getUIFlag(0xC) || (Config.PacketShopping && getInteractedNPC() && getInteractedNPC().itemcount > 0)) {
			for (let i = 0; i < totalSell.length; i++) {
				console.log("ÿc8Kolbot-SoloPlayÿc0: Sell old charm " + totalSell[i].name);
				verbose && Misc.itemLogger("Sold", totalSell[i]);
				verbose && Misc.logItem("CharmEquip Sold", totalSell[i]);
				totalSell[i].sell();
			}
		}
	}

	if (totalKeep.length > 0) {
		for (let i = 0; i < totalKeep.length; i++) {
			if (totalKeep[i].isInStash && !Cubing.checkItem(totalKeep[i])) {
				!getUIFlag(sdk.uiflags.Stash) && Town.openStash() && delay(300 + me.ping);
				if (Storage.Inventory.CanFit(totalKeep[i]) && Storage.Inventory.MoveTo(totalKeep[i])) {
					verbose && Misc.logItem("CharmEquip Equipped", totalKeep[i]);
				}
			}
		}
	}

	me.cancelUIFlags();

	console.log("ÿc8Kolbot-SoloPlayÿc0: Exiting charm auto equip. Time elapsed: " + Developer.formatTime(getTickCount() - tick));
};

// Write charm equip version that checks by item prefix/suffix using a switch case with the various prefixes and suffixes to sort them
// improve this, not sure how but still needs work
Item.getCharmType = function (charm = undefined) {
	if (!charm) return false;
	if (![sdk.items.SmallCharm, sdk.items.LargeCharm, sdk.items.GrandCharm].includes(charm.classid)) return false;
	if (charm.quality === sdk.itemquality.Unique) return "unique";
	if (!NTIP.hasStats(charm) && NTIP.GetCharmTier(charm) > 0) return "misc";

	let charmType = "";
	let skillerStats = [[0, 1, 2], [8, 9, 10], [16, 17, 18], [24, 25, 26], [32, 33, 34], [40, 41, 42], [48, 49, 50]][me.classid];

	if (charm.getStat(188, skillerStats[0])) {
		charmType = "skillerTypeA";
	} else if (charm.getStat(188, skillerStats[1])) {
		charmType = "skillerTypeB";
	} else if (charm.getStat(188, skillerStats[2])) {
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
};

const AutoEquip = {
	hasTier: function (item) {
		if (me.classic) {
			return Item.hasTier(item);
		} else {
			if ([sdk.itemtype.SmallCharm, sdk.itemtype.MediumCharm, sdk.itemtype.LargeCharm].includes(item.itemType)) {
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
			if ([sdk.itemtype.SmallCharm, sdk.itemtype.MediumCharm, sdk.itemtype.LargeCharm].includes(item.itemType)) {
				return Item.autoEquipCharmCheck(item);
			} else {
				return Item.autoEquipKeepCheckMerc(item) || Item.autoEquipKeepCheck(item) || Item.autoEquipCheckSecondary(item);
			}
		}
	},
};
