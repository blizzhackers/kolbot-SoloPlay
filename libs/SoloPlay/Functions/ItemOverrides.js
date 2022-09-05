/**
*  @filename    ItemOverrides.js
*  @author      theBGuy
*  @credit      dzik, sonic
*  @desc        AutoEquip and Item related functions
*
*/

includeIfNotIncluded("common/Misc.js");
includeIfNotIncluded("common/Item.js");
includeIfNotIncluded("SoloPlay/Functions/PrototypeOverrides.js");
includeIfNotIncluded("SoloPlay/Functions/ItemPrototypes.js");

Item.weaponTypes = [
	sdk.items.type.Scepter, sdk.items.type.Wand, sdk.items.type.Staff, sdk.items.type.Bow, sdk.items.type.Axe, sdk.items.type.Club,
	sdk.items.type.Sword, sdk.items.type.Hammer, sdk.items.type.Knife, sdk.items.type.Spear, sdk.items.type.Polearm, sdk.items.type.Crossbow,
	sdk.items.type.Mace, sdk.items.type.ThrowingKnife, sdk.items.type.ThrowingAxe, sdk.items.type.Javelin, sdk.items.type.Orb, sdk.items.type.AmazonBow,
	sdk.items.type.AmazonSpear, sdk.items.type.AmazonJavelin, sdk.items.type.MissilePotion
];
Item.shieldTypes = [
	sdk.items.type.Shield, sdk.items.type.AuricShields, sdk.items.type.VoodooHeads, sdk.items.type.BowQuiver, sdk.items.type.CrossbowQuiver
];
Item.helmTypes = [
	sdk.items.type.Helm, sdk.items.type.PrimalHelm, sdk.items.type.Circlet, sdk.items.type.Pelt
];

Item.getQuantityOwned = function (item = undefined, skipSameItem = false) {
	if (!item) return 0;
	
	return me.getItemsEx()
		.filter(check =>
			check.itemType === item.itemType
			&& (!skipSameItem || check.gid !== item.gid)
			&& check.classid === item.classid
			&& check.quality === item.quality
			&& check.sockets === item.sockets
			&& check.isInStorage
		).length;
};

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

Item.identify = function (item) {
	if (item.identified) return true;
	let idTool = me.getIdTool();

	if (idTool) {
		item.isInStash && Town.openStash();
		return Town.identifyItem(item, idTool);
	}
	return false;
};

Item.getBodyLoc = function (item) {
	let bodyLoc = (() => {
		switch (true) {
		case Item.shieldTypes.includes(item.itemType):
			return sdk.body.LeftArm;
		case item.itemType === sdk.items.type.Armor:
			return sdk.body.Armor;
		case item.itemType === sdk.items.type.Ring:
			return [sdk.body.RingRight, sdk.body.RingLeft];
		case item.itemType === sdk.items.type.Amulet:
			return sdk.body.Neck;
		case item.itemType === sdk.items.type.Boots:
			return sdk.body.Feet;
		case item.itemType === sdk.items.type.Gloves:
			return sdk.body.Gloves;
		case item.itemType === sdk.items.type.Belt:
			return sdk.body.Belt;
		case Item.helmTypes.includes(item.itemType):
			return sdk.body.Head;
		case Item.weaponTypes.includes(item.itemType):
			return me.barbarian ? [sdk.body.RightArm, sdk.body.LeftArm] : sdk.body.RightArm;
		case [sdk.items.type.HandtoHand, sdk.items.type.AssassinClaw].includes(item.itemType):
			return !Check.currentBuild().caster && me.assassin ? [sdk.body.RightArm, sdk.body.LeftArm] : sdk.body.RightArm;
		default:
			return false;
		}
	})();

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
			tierScore: tierscore(item, bodyLoc),
			secondarytier: NTIP.GetSecondaryTier(item),
			str: item.getStatEx(sdk.stats.Strength),
			dex: item.getStatEx(sdk.stats.Dexterity),
			durability: item.durabilityPercent,
			sockets: item.sockets,
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
		tierScore: -1,
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

	let tier = NTIP.GetTier(item);
	let bodyLoc = this.getBodyLoc(item);

	if (tier > 0 && bodyLoc) {
		for (let i = 0; i < bodyLoc.length; i += 1) {
			if (tier > this.getEquippedItem(bodyLoc[i]).tier && (this.canEquip(item) || !item.identified)) {
				if (item.twoHanded && !me.barbarian) {
					if (tier < this.getEquippedItem(sdk.body.RightArm).tier + this.getEquippedItem(sdk.body.LeftArm).tier) return false;
				}

				if (!me.barbarian && bodyLoc[i] === sdk.body.LeftArm && this.getEquippedItem(bodyLoc[i]).tier === -1) {
					if (this.getEquippedItem(sdk.body.RightArm).twoHanded && tier < this.getEquippedItem(sdk.body.RightArm).tier) return false;
				}

				return true;
			}
		}
	}

	return false;
};

Item.autoEquipKeepCheck = function (item) {
	if (!Config.AutoEquip) return true;

	let tier = NTIP.GetTier(item);
	let bodyLoc = this.getBodyLoc(item);

	if (tier > 0 && bodyLoc) {
		for (let i = 0; i < bodyLoc.length; i += 1) {
			if (tier > this.getEquippedItem(bodyLoc[i]).tier) {
				if (item.twoHanded && !me.barbarian) {
					if (tier < this.getEquippedItem(sdk.body.RightArm).tier + this.getEquippedItem(sdk.body.LeftArm).tier) return false;
				}

				if (!me.barbarian && bodyLoc[i] === sdk.body.LeftArm && this.getEquippedItem(bodyLoc[i]).tier === -1) {
					if (this.getEquippedItem(sdk.body.RightArm).twoHanded && tier < this.getEquippedItem(sdk.body.RightArm).tier) return false;
				}

				return true;
			}
		}
	}

	return false;
};

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

	const sortEq = (a, b) => {
		if (Item.canEquip(a)) return -1;
		if (Item.canEquip(b)) return 1;
		return 0;
	};

	const runEquip = (item, bodyLoc, tier) => {
		let gid = item.gid;
		console.debug(item.name);

		if (this.equip(item, bodyLoc)) {
			console.log("ÿc9" + task + "ÿc0 :: Equipped: " + item.fname + " Tier: " + tier);
			// item that can have sockets
			if (item.getItemType()) {
				SoloWants.addToList(item);
				SoloWants.ensureList();
			}
			Developer.debugging.autoEquip && Misc.logItem(task, me.getItem(-1, -1, gid));
			Developer.logEquipped && MuleLogger.logEquippedItems();
		} else if (!noStash && item.lvlreq > me.charlvl && !item.isInStash) {
			if (Storage.Stash.CanFit(item)) {
				console.log("ÿc9" + task + "ÿc0 :: Item level is to high, attempting to stash for now as its better than what I currently have: " + item.fname + " Tier: " + tier);
				Storage.Stash.MoveTo(item);
			}
		} else if (me.getItem(-1, -1, gid)) {
			// Make sure we didn't lose it during roll back
			return false;
		}

		return true;
	};

	// ring check - sometimes a higher tier ring ends up on the wrong finger causing a rollback loop
	if (this.getEquippedItem(sdk.body.RingLeft).tierScore > this.getEquippedItem(sdk.body.RingRight).tierScore) {
		console.log("ÿc9" + task + "ÿc0 :: Swapping rings, higher tier ring is on the wrong finger");
		clickItemAndWait(sdk.clicktypes.click.Left, sdk.body.RingLeft);
		delay(200);
		me.itemoncursor && clickItemAndWait(sdk.clicktypes.click.Left, sdk.body.RingRight);
		delay(200);
		me.itemoncursor && clickItemAndWait(sdk.clicktypes.click.Left, sdk.body.RingLeft);
	}

	!getUIFlag(sdk.uiflags.Shop) && me.cancel();

	while (items.length > 0) {
		items.sort(sortEq);
		const item = items.shift();
		let tier = NTIP.GetTier(item);
		let bodyLoc = this.getBodyLoc(item);

		if (tier > 0 && bodyLoc) {
			for (let j = 0; j < bodyLoc.length; j += 1) {
				const equippedItem = this.getEquippedItem(bodyLoc[j]);
				// rings are special
				if (item.isInStorage && item.itemType === sdk.items.type.Ring) {
					Item.identify(item);
					// have to pass in the specific location
					tier = tierscore(item, bodyLoc[j]);

					if (tier > equippedItem.tierScore) {
						if (!runEquip(item, bodyLoc[j], tier)) {
							continue;
						}
					}
				} else {
					if (item.isInStorage && tier > equippedItem.tier && equippedItem.classid !== sdk.items.quest.KhalimsWill) {
						Item.identify(item);

						if (item.twoHanded && !me.barbarian) {
							if (tier < this.getEquippedItem(sdk.body.RightArm).tier + this.getEquippedItem(sdk.body.LeftArm).tier) {
								continue;
							}
							console.log("ÿc9" + task + "ÿc0 :: TwoHandedWep better than sum tier of currently equipped main + shield hand : " + item.fname + " Tier: " + tier);
						}

						if (!me.barbarian && bodyLoc[j] === sdk.body.LeftArm && equippedItem.tier === -1 && this.getEquippedItem(sdk.body.RightArm).twoHanded) {
							if (tier < this.getEquippedItem(sdk.body.RightArm).tier) {
								continue;
							}
							console.log("ÿc9" + task + "ÿc0 :: TwoHandedWep not as good as what we want to equip on our shield hand : " + item.fname + " Tier: " + tier);
						}

						if (!runEquip(item, bodyLoc[j], tier)) {
							continue;
						}

						break;
					}
				}
			}
		}
	}

	console.log("ÿc8Kolbot-SoloPlayÿc0: Exiting ÿc9" + task + "ÿc0. Time elapsed: " + Developer.formatTime(getTickCount() - tick));
	return true;
};

Item.equip = function (item, bodyLoc) {
	// can't equip
	if (!this.canEquip(item)) return false;

	// Already equipped in the right slot
	if (item.mode === sdk.items.mode.Equipped && item.bodylocation === bodyLoc) return true;
	// failed to open stash
	if (item.isInStash && !Town.openStash()) return false;
	// failed to open cube
	if (item.isInCube && !Cubing.openCube()) return false;

	let rolledBack = false;
	// todo: sometimes rings get bugged with the higher tier ring ending up on the wrong finger, if this happens swap them

	for (let i = 0; i < 3; i += 1) {
		if (item.toCursor()) {
			clickItemAndWait(sdk.clicktypes.click.Left, bodyLoc);

			if (item.bodylocation === bodyLoc) {
				if (getCursorType() === 3) {
					let cursorItem = Game.getCursorUnit();

					if (cursorItem) {
						// rollback check
						let justEquipped = this.getEquippedItem(bodyLoc);
						let checkScore = 0;
						switch (cursorItem.itemType) {
						case sdk.items.type.Ring:
							checkScore = tierscore(cursorItem, bodyLoc);
							if (checkScore > justEquipped.tierScore) {
								console.debug("ROLLING BACK TO OLD ITEM BECAUSE IT WAS BETTER");
								console.debug("OldItem: " + checkScore + " Just Equipped Item: " + this.getEquippedItem(bodyLoc).tierScore);
								clickItemAndWait(sdk.clicktypes.click.Left, bodyLoc);
								cursorItem = Game.getCursorUnit();
								rolledBack = true;
							}

							break;
						default:
							checkScore = NTIP.GetTier(cursorItem);
							if (checkScore > justEquipped.tier && !item.questItem && !justEquipped.isRuneword/*Wierd bug with runewords that it'll fail to get correct item desc so don't attempt rollback*/) {
								console.debug("ROLLING BACK TO OLD ITEM BECAUSE IT WAS BETTER");
								console.debug("OldItem: " + checkScore + " Just Equipped Item: " + this.getEquippedItem(bodyLoc).tier);
								clickItemAndWait(sdk.clicktypes.click.Left, bodyLoc);
								cursorItem = Game.getCursorUnit();
								rolledBack = true;
							}

							break;
						}

						if (cursorItem && !cursorItem.shouldKeep()) {
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
		let cursorItem = Game.getCursorUnit();

		if (cursorItem) {
			// only keep wanted items
			if (Pickit.checkItem(cursorItem).result === Pickit.Result.WANTED || AutoEquip.wanted(cursorItem)) {
				if (Storage.Inventory.CanFit(cursorItem)) {
					Storage.Inventory.MoveTo(cursorItem);
				} else if (Storage.Stash.CanFit(cursorItem)) {
					Storage.Stash.MoveTo(cursorItem);
				} else if (Storage.Cube.CanFit(cursorItem)) {
					Storage.Cube.MoveTo(cursorItem);
				}
			} else {
				D2Bot.printToConsole("Dropped " + cursorItem.fname + " during un-equip process", sdk.colors.D2Bot.Red);
				cursorItem.drop();
			}
		}

		me.weaponswitch === 1 && me.switchWeapons(0);

		return true;
	}

	return false;
};

Item.hasSecondaryTier = (item) => Config.AutoEquip && me.expansion && NTIP.GetSecondaryTier(item) > 0;

Item.getBodyLocSecondary = function (item) {
	let bodyLoc = (() => {
		switch (true) {
		case Item.shieldTypes.includes(item.itemType):
			return sdk.body.LeftArmSecondary;
		case Item.weaponTypes.includes(item.itemType):
			return me.barbarian ? [sdk.body.RightArmSecondary, sdk.body.LeftArmSecondary] : sdk.body.RightArmSecondary;
		case [sdk.items.type.HandtoHand, sdk.items.type.AssassinClaw].includes(item.itemType):
			return !Check.currentBuild().caster && me.assassin ? [sdk.body.RightArmSecondary, sdk.body.LeftArmSecondary] : sdk.body.RightArmSecondary;
		default:
			return false;
		}
	})();

	return Array.isArray(bodyLoc) ? bodyLoc : [bodyLoc];
};

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
				clickItemAndWait(sdk.clicktypes.click.Left, bodyLoc - 7);

				if (item.bodylocation === bodyLoc - 7) {
					equipped = true;
					if (getCursorType() === 3) {
						let cursorItem = Game.getCursorUnit();
						!!cursorItem && !cursorItem.shouldKeep() && cursorItem.drop();
					}

					if (Item.hasDependancy(item) && me.needRepair() && me.inTown) {
						Town.repair(true);
					}

					return true;
				}
			}
		}
	} finally {
		// Switch back to primary
		me.weaponswitch !== 0 && me.switchWeapons(0);
	}

	return equipped;
};

Item.autoEquipCheckSecondary = function (item) {
	if (!Config.AutoEquip) return true;
	if (me.classic) return false;

	let tier = NTIP.GetSecondaryTier(item);
	let bodyLoc = Item.getBodyLocSecondary(item);

	for (let i = 0; tier > 0 && i < bodyLoc.length; i += 1) {
		if (tier > Item.getEquippedItem(bodyLoc[i]).secondarytier && (Item.canEquip(item) || !item.identified)) {
			return true;
		}
	}

	return false;
};

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

	const sortEq = (a, b) => {
		if (Item.canEquip(a)) return -1;
		if (Item.canEquip(b)) return 1;
		return 0;
	};

	me.cancel();

	while (items.length > 0) {
		items.sort(sortEq);
		const item = items.shift();
		const tier = NTIP.GetSecondaryTier(item);
		let bodyLoc = this.getBodyLocSecondary(item);

		if (tier > 0 && bodyLoc) {
			for (let j = 0; j < bodyLoc.length; j += 1) {
				const equippedItem = this.getEquippedItem(bodyLoc[j]);
				if (item.isInStorage && tier > equippedItem.secondarytier && equippedItem.classid !== sdk.items.quest.KhalimsWill) {
					Item.identify(item);

					let gid = item.gid;
					console.debug(item.name);

					if (this.secondaryEquip(item, bodyLoc[j])) {
						console.log("ÿc9SecondaryEquipÿc0 :: Equipped: " + item.fname + " SecondaryTier: " + tier);
						Developer.debugging.autoEquip && Misc.logItem("Equipped switch", me.getItem(-1, -1, gid));
						Developer.logEquipped && MuleLogger.logEquippedItems();
					}

					break;
				}
			}
		}
	}

	console.log("ÿc8Kolbot-SoloPlayÿc0: Exiting secondary auto equip. Time elapsed: " + Developer.formatTime(getTickCount() - tick));
	return true;
};

// AUTO EQUIP MERC - modified from dzik's
Item.hasMercTier = (item) => Config.AutoEquip && me.expansion && NTIP.GetMercTier(item) > 0;

// need to re-work using char data so we can shop/keep items if merc is dead *but* we have enough to revive him and buy the item and enough space
Item.canEquipMerc = function (item, bodyLoc) {
	if (item.type !== sdk.unittype.Item || me.classic) return false;
	let mercenary = me.getMercEx();

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
	let mercenary = me.getMercEx();

	// dont have merc or he is dead or higher requirements
	if (!mercenary || !Item.canEquipMerc(item, bodyLoc)) return false;
	// Already equipped in the right slot
	if (item.mode === sdk.items.mode.Equipped && item.bodylocation === bodyLoc) return true;
	if (item.isInStash && !Town.openStash()) return false;

	for (let i = 0; i < 3; i += 1) {
		if (item.toCursor()) {
			if (clickItem(sdk.clicktypes.click.Mercenary, bodyLoc)) {
				delay(500 + me.ping * 2);
				Developer.debugging.autoEquip && Misc.logItem("Merc Equipped", mercenary.getItem(item.classid));
			}

			let check = mercenary.getItem(item.classid);

			if (check && check.bodylocation === bodyLoc) {
				if (check.runeword) {
					// just track runewords for now
					myData.merc.gear.push(check.prefixnum);
					CharData.updateData("merc", myData);
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

Item.getEquippedItemMerc = function (bodyLoc = -1) {
	let mercenary = me.getMercEx();

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
	let mercenary = me.getMercEx();

	// dont have merc or he is dead
	if (!mercenary) return false;

	let bodyLoc = (() => {
		switch (item.itemType) {
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

Item.autoEquipCheckMerc = function (item) {
	if (!Config.AutoEquip) return true;
	if (Config.AutoEquip && !me.getMercEx()) return false;

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
	if (Config.AutoEquip && !me.getMercEx()) return false;

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
	if (!Config.AutoEquip || !me.getMercEx()) return true;

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
		const item = items.shift();
		const tier = NTIP.GetMercTier(item);
		const bodyLoc = Item.getBodyLocMerc(item);
		const name = item.name;

		if (tier > 0 && bodyLoc) {
			for (let j = 0; j < bodyLoc.length; j += 1) {
				if ([sdk.storage.Inventory, sdk.storage.Stash].includes(item.location) && tier > Item.getEquippedItemMerc(bodyLoc[j]).tier) {
					Item.identify(item);

					console.log("Merc " + name);
					this.equipMerc(item, bodyLoc[j]) && console.log("ÿc9MercEquipÿc0 :: Equipped: " + name + " MercTier: " + tier);
					
					let cursorItem = Game.getCursorUnit();

					if (cursorItem) {
						cursorItem.drop();
						Developer.debugging.autoEquip && Misc.logItem("Merc Dropped", cursorItem);
					}

					break;
				}
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
			clickItem(sdk.clicktypes.click.Mercenary, items[i].bodylocation);
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

// Charm Autoequip - TODO: clean this section up...sigh
// goals
/*
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
Item.hasCharmTier = (item) => me.expansion && Config.AutoEquip && NTIP.GetCharmTier(item) > 0;
Item.isFinalCharm = (item) => myData.me.charmGids.includes(item.gid);

// Iterate over charm checklist, pickit result 0 and 4 get sold
// Otherwise if its not in the stash already and not a final charm try and stash it. I don't remember why I checked if it wasn't a final charm
const spliceCharmCheckList = function (checkList = [], verbose = false) {
	for (let i = 0; i < checkList.length; i++) {
		const currCharm = checkList[i];
		if (!currCharm || [0, 4].includes(Pickit.checkItem(currCharm).result)) continue;
		if (!currCharm.isInStash && !myData.me.charmGids.includes(currCharm.gid)) {
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
};

const spliceCharmKeepList = function (keep = [], sell = [], verbose = false) {
	if (!keep.length) return;
	const id = keep[0].classid;
	const cInfo = (() => {
		switch (id) {
		case sdk.items.SmallCharm:
			return CharData.charmData.small.getCountInfo();
		case sdk.items.LargeCharm:
			return CharData.charmData.small.getCountInfo();
		case sdk.items.GrandCharm:
			return CharData.charmData.small.getCountInfo();
		default:
			return { max: 0 };
		}
	})();

	// sort through kept charms
	if (keep.length > cInfo.max) {
		keep.sort((a, b) => NTIP.GetCharmTier(b) - NTIP.GetCharmTier(a));

		// everything after the cap (need a better method for this in the instances where the max cap is less then leveling wanted cap)
		for (let i = cInfo.max; i < keep.length; i++) {
			if (!!keep[i].classid && !Item.autoEquipCharmCheck(keep[i])) {
				sell.push(keep[i]);
				verbose && console.log("ÿc8Kolbot-SoloPlayÿc0: CharmEquip Add " + keep[i].fname + " to checkList");
				keep.splice(i, 1);
				i -= 1;
			}
		}
	}
};

Item.autoEquipSC = function () {
	let verbose = Developer.debugging.smallCharm;
	// build list of our charms
	let items = me.getItemsEx()
		.filter((charm) => charm.isInStorage && charm.classid === sdk.items.SmallCharm && charm.magic);

	if (!items.length) {
		verbose && console.debug("No charms found");
		return { keep: [], sell: [] };
	}

	let charms = Item.autoEquipCharmSort(items, verbose);
	spliceCharmKeepList(charms.keep, charms.checkList, verbose);

	verbose && console.log("Small Charm checklist length: " + charms.checkList.length);
	spliceCharmCheckList(charms.checkList, verbose);

	return { keep: charms.keep, sell: charms.checkList };
};

Item.autoEquipLC = function () {
	let verbose = Developer.debugging.largeCharm;
	let items = me.getItemsEx()
		.filter((charm) => charm.isInStorage && charm.classid === sdk.items.LargeCharm && charm.magic);

	if (!items.length) {
		verbose && console.debug("No charms found");
		return { keep: [], sell: [] };
	}

	let charms = Item.autoEquipCharmSort(items, verbose);
	spliceCharmKeepList(charms.keep, charms.checkList, verbose);

	verbose && console.log("Large charm checklist length: " + charms.checkList.length);
	spliceCharmCheckList(charms.checkList, verbose);

	return { keep: charms.keep, sell: charms.checkList };
};

Item.autoEquipGC = function () {
	let verbose = Developer.debugging.largeCharm;
	let items = me.getItemsEx()
		.filter((charm) => charm.isInStorage && charm.classid === sdk.items.GrandCharm && charm.magic);

	if (!items.length) {
		verbose && console.debug("No charms found");
		return { keep: [], sell: [] };
	}

	let charms = Item.autoEquipCharmSort(items, verbose);
	spliceCharmKeepList(charms.keep, verbose);

	verbose && console.log("Grand charm checklist length: " + charms.checkList.length);
	spliceCharmKeepList(charms.keep, charms.checkList, verbose);

	return { keep: charms.keep, sell: charms.checkList };
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
	const addToBackUp = (item) => charms.backup.indexOf(item) === -1 && charms.backup.push(item);

	const sortCharms = (arr = [], verbose = false, backUpCheck = true) => {
		let invoquantity = NTIP.getInvoQuantity(arr[0]);
		(invoquantity === undefined || invoquantity === -1) && (invoquantity = 2);
		let charmType = Item.getCharmType(arr[0]);
		verbose && console.log("Amount of " + charmType + " Charms: " + arr.length + " invoquantity: " + invoquantity);
		arr.length > 1 && arr.sort((a, b) => NTIP.GetCharmTier(b) - NTIP.GetCharmTier(a));

		if (arr.length > invoquantity) {
			verbose && arr.forEach((el, index) => console.log(charmType + "[" + index + "] = " + NTIP.GetCharmTier(el)));

			for (let i = invoquantity; i < arr.length; i++) {
				backUpCheck ? addToBackUp(arr[i]) : addToCheckList(arr[i]);

				arr.splice(i, 1);
				i -= 1;
			}
		}
	};

	verbose && console.log("Amount of items: " + items.length);
	items.length > 1 && items.sort((a, b) => NTIP.GetCharmTier(b) - NTIP.GetCharmTier(a));

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

		if (myData.me.charmGids.includes(item.gid)) {
			charms.keep.push(item);

			continue;
		}

		let next = false;

		for (let i = 0; i < finalCharmKeys.length; i++) {
			let cKey = finalCharmKeys[i];
			try {
				if (!!myData.me.charms[cKey] && myData.me.charms[cKey].have.indexOf(item.gid) === -1
					&& myData.me.charms[cKey].have.length < myData.me.charms[cKey].max) {
					if (finalCharmInfo[cKey].stats(item)) {
						console.debug(item.fname);
						myData.me.charmGids.push(item.gid);
						myData.me.charms[cKey].have.push(item.gid);
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
		updateMyData();
	}

	if (!charms.skillerTypeA.length && !charms.skillerTypeB.length && !charms.skillerTypeC.length
		&& !charms.damage.length && !charms.resist.length && !charms.elemental.length && !charms.life.length && !charms.backup.length) {
		verbose && console.log("No Charms");
		return charms;
	}

	charms.skillerTypeA.length > 0 && sortCharms(charms.skillerTypeA, verbose);
	charms.skillerTypeB.length > 0 && sortCharms(charms.skillerTypeB, verbose);
	charms.skillerTypeC.length > 0 && sortCharms(charms.skillerTypeC, verbose);
	charms.resist.length > 0 && sortCharms(charms.resist, verbose);
	charms.life.length > 0 && sortCharms(charms.life, verbose);
	charms.magicfind.length > 0 && sortCharms(charms.magicfind, verbose);
	charms.damage.length > 0 && sortCharms(charms.damage, verbose);
	charms.elemental.length > 0 && sortCharms(charms.elemental, verbose);

	// If stats are unspecifed, this will filter charms and keep highest based on invoquantity. If no invoquantity defined it will keep two of that type
	charms.backup.length > 0 && sortCharms(charms.backup, verbose, false);
	charms.keep = charms.keep.concat(charms.skillerTypeA, charms.skillerTypeB, charms.skillerTypeC, charms.resist, charms.life, charms.magicfind, charms.damage, charms.elemental, charms.backup);
	verbose && charms.checkList.forEach((el, index) => console.log("checkList[" + index + "] = " + NTIP.GetCharmTier(el) + " " + el.fname));
	
	return charms;
};

Item.autoEquipCharmCheck = function (item = undefined) {
	if (!item || NTIP.GetCharmTier(item) <= 0 || !item.isCharm) return false;
	// Annhilus, Hellfire Torch, Gheeds - Handled by a different function so return true to keep
	if (item.isCharm && item.unique) return true;
	// is one of our final charms
	if (myData.me.charmGids.includes(item.gid)) return true;

	let lowestCharm;
	let items = me.getItemsEx()
		.filter(charm => charm.classid === item.classid && charm.isInStorage && charm.magic && NTIP.GetCharmTier(charm) > 0);
	if (!items.length) return true;

	let quantityCap = NTIP.getInvoQuantity(item);
	let charms = Item.autoEquipCharmSort(items);
	let charmType = Item.getCharmType(item);
	let cInfo, newList = [];

	switch (item.classid) {
	case sdk.items.SmallCharm:
		cInfo = CharData.charmData.small.getCountInfo();
		
		if (cInfo.curr && (cInfo.curr / cInfo.max) * 100 >= 75) {
			// chop off past our cap
			newList = charms.keep
				.sort((a, b) => NTIP.GetCharmTier(b) - NTIP.GetCharmTier(a))
				.slice(0, cInfo.max);
			// check if it made the cut
			if (!newList.find(i => i.gid === item.gid)) return false;
			lowestCharm = newList.last();
			return !!(NTIP.GetCharmTier(item) >= NTIP.GetCharmTier(lowestCharm) || item.gid === lowestCharm.gid);
		}

		break;
	case sdk.items.LargeCharm:
		cInfo = CharData.charmData.large.getCountInfo();
		
		if (cInfo.curr && (cInfo.curr / cInfo.max) * 100 >= 75) {
			// chop off past our cap
			newList = charms.keep
				.sort((a, b) => NTIP.GetCharmTier(b) - NTIP.GetCharmTier(a))
				.slice(0, cInfo.max);
			// check if it made the cut
			if (!newList.find(i => i.gid === item.gid)) return false;
			lowestCharm = newList.last();
			return !!(NTIP.GetCharmTier(item) >= NTIP.GetCharmTier(lowestCharm) || item.gid === lowestCharm.gid);
		}

		break;
	case sdk.items.GrandCharm:
		cInfo = CharData.charmData.grand.getCountInfo();
		
		if (cInfo.curr && (cInfo.curr / cInfo.max) * 100 >= 50) {
			// chop off past our cap
			newList = charms.keep
				.sort((a, b) => NTIP.GetCharmTier(b) - NTIP.GetCharmTier(a))
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
		lowestCharm = charms[charmType].last();
		if ((charms[charmType].findIndex(c => c.gid === lowestCharm.gid) + 1) > quantityCap) return false;

		break;
	default:
		lowestCharm = charms.backup.last();
		if ((charms.backup.findIndex(c => c.gid === lowestCharm.gid) + 1) > quantityCap) return false;

		break;
	}

	return !!lowestCharm ? !!(NTIP.GetCharmTier(item) >= NTIP.GetCharmTier(lowestCharm) || item.gid === lowestCharm.gid) : true;
};

Item.initCharms = function () {
	// No charms in classic
	if (me.classic) return;
	let myCharms = me.getItemsEx().filter(item => item.isInStorage && item.isCharm && item.magic);
	let changed = false;

	const finalCharmKeys = Object.keys(myData.me.charms);
	const check = function (list = [], charms = []) {
		for (let i = 0; i < list.length; i++) {
			if (!charms.some(c => c.gid === list[i])) {
				console.log("A charm was removed from our final list - updated it");
				myData.me.charmGids.remove(list[i]);
				list.splice(i, 1);
				i--;
				changed = true;
			}
		}
	};

	for (let i = 0; i < finalCharmKeys.length; i++) {
		let cKey = finalCharmKeys[i];
		switch (myData.me.charms[cKey].classid) {
		case sdk.items.SmallCharm:
			check(myData.me.charms[cKey].have, myCharms);

			break;
		case sdk.items.LargeCharm:
			check(myData.me.charms[cKey].have, myCharms);

			break;
		case sdk.items.GrandCharm:
			check(myData.me.charms[cKey].have, myCharms);

			break;
		}
	}

	changed && updateMyData();
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
		.filter((charm) => [sdk.items.SmallCharm, sdk.items.LargeCharm, sdk.items.GrandCharm].includes(charm.classid) && charm.unique);
	let verbose = !!(Developer.debugging.smallCharm || Developer.debugging.largeCharm || Developer.debugging.grandCharm);

	if (verbose) {
		console.log("Grand Charms Keep: " + GCs.keep.length + ", Sell: " + GCs.sell.length);
		console.log("Large Charms Keep: " + LCs.keep.length + ", Sell: " + LCs.sell.length);
		console.log("Small Charms Keep: " + SCs.keep.length + ", Sell: " + SCs.sell.length);
	}
	
	totalKeep = totalKeep.concat(SCs.keep, LCs.keep, GCs.keep, specialCharms);
	for (let i = 0; i < totalKeep.length; i++) {
		if (!Item.autoEquipCharmCheck(totalKeep[i])) {
			totalSell.push(totalKeep[i]);
			totalKeep.splice(i, 1);
			i--;
		}
	}
	totalSell = totalSell.concat(SCs.sell, LCs.sell, GCs.sell);
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

		if (getUIFlag(sdk.uiflags.Shop) || (Config.PacketShopping && getInteractedNPC() && getInteractedNPC().itemcount > 0)) {
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
// maybe do this by prefix/suffix number instead?
Item.getCharmType = function (charm = undefined) {
	if (!charm || !charm.isCharm) return false;
	if (charm.unique) return "unique";
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
			if ([sdk.items.type.SmallCharm, sdk.items.type.LargeCharm, sdk.items.type.GrandCharm].includes(item.itemType)) {
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
			if ([sdk.items.type.SmallCharm, sdk.items.type.LargeCharm, sdk.items.type.GrandCharm].includes(item.itemType)) {
				return Item.autoEquipCharmCheck(item);
			} else {
				return Item.autoEquipKeepCheckMerc(item) || Item.autoEquipKeepCheck(item) || Item.autoEquipCheckSecondary(item);
			}
		}
	},

	runAutoEquip: function () {
		Item.autoEquip();
		Item.autoEquipSecondary();
		Item.autoEquipCharms();
	}
};
