/*
*	@filename	TownOverrides.js
*	@author		isid0re, theBGuy
*	@desc		Town.js fixes and custom tasks to improve functionality
*/

if (!isIncluded("common/Town.js")) { include("common/Town.js"); }

// Removed Missle Potions for easy gold
// Items that won't be stashed
Town.ignoredItemTypes = [
	sdk.itemtype.BowQuiver, sdk.itemtype.CrossbowQuiver, sdk.itemtype.Book,
	sdk.itemtype.Scroll, sdk.itemtype.Key, sdk.itemtype.HealingPotion,
	sdk.itemtype.ManaPotion, sdk.itemtype.RejuvPotion, sdk.itemtype.StaminaPotion,
	sdk.itemtype.AntidotePotion, sdk.itemtype.ThawingPotion
];

Town.staminaPot = {tick: 0, duration: 0};
Town.thawingPot = {tick: 0, duration: 0};
Town.antidotePot = {tick: 0, duration: 0};

Town.townTasks = function () {
	if (!me.inTown) { Town.goToTown(); }

	// Burst of speed while in town
	if (me.inTown && me.assassin && me.getSkill(sdk.skills.BurstofSpeed, 1) && !me.getState(sdk.states.BurstofSpeed)) {
		Skill.cast(sdk.skills.BurstofSpeed, 0);
	}

	let preAct = me.act;

	me.switchWeapons(Attack.getPrimarySlot());
	this.unfinishedQuests();
	this.heal();
	this.identify();
	this.clearInventory();
	this.buyBook();
	this.buyPotions();
	this.fillTome(sdk.items.TomeofTownPortal);
	this.shopItems();
	this.buyKeys();
	this.repair(true);
	this.reviveMerc();
	this.gamble();
	Cubing.emptyCube();
	Runewords.makeRunewords();
	Cubing.doCubing();
	Runewords.makeRunewords();
	Item.autoEquip();
	Item.autoEquipSecondary();
	Item.autoEquipCharms();
	Merc.hireMerc();
	Merc.equipMerc();
	this.stash();
	this.clearJunk();
	this.sortInventory();
	this.sortStash();
	Quest.characterRespec();

	if ([sdk.areas.LutGholein, sdk.areas.KurastDocktown].includes(me.area)) {
		Town.buyPots(8, "Stamina");
		Town.drinkPots();
	}

	if (me.act !== preAct) {
		this.goToTown(preAct);
	}

	me.cancelUIFlags();

	if (!me.barbarian && !Precast.checkCTA()) {
		Precast.doPrecast(false);
	}

	if (me.expansion) {
		Attack.getCurrentChargedSkillIds();
		Pather.checkForTeleCharges();
	}

	delay(200 + me.ping * 2);

	return true;
};

Town.doChores = function (repair = false) {
	if (!me.inTown) { this.goToTown(); }

	// Burst of speed while in town
	if (me.inTown && me.assassin && me.getSkill(sdk.skills.BurstofSpeed, 1) && !me.getState(sdk.states.BurstofSpeed)) {
		Skill.cast(sdk.skills.BurstofSpeed, 0);
	}

	let preAct = me.act;
	me.switchWeapons(Attack.getPrimarySlot());
	this.heal();
	this.identify();
	this.clearInventory();
	this.buyBook();
	this.buyPotions();
	this.fillTome(sdk.items.TomeofTownPortal);
	this.shopItems();
	this.buyKeys();
	this.repair(repair);
	this.reviveMerc();
	this.gamble();
	Cubing.emptyCube();
	Runewords.makeRunewords();
	Cubing.doCubing();
	Runewords.makeRunewords();
	Item.autoEquip();
	Item.autoEquipSecondary();
	Item.autoEquipCharms();
	Merc.hireMerc();
	Merc.equipMerc();
	this.stash();
	this.clearJunk();

	if (me.getItem(sdk.items.TomeofTownPortal)) {
		this.clearScrolls();
	}

	this.sortInventory();
	Quest.characterRespec();

	if (me.act !== preAct) {
		this.goToTown(preAct);
	}

	me.cancelUIFlags();

	if (!me.barbarian && !Precast.checkCTA()) {
		Precast.doPrecast(false);
	}

	if (me.expansion) {
		Attack.getCurrentChargedSkillIds();
		Pather.checkForTeleCharges();
	}

	delay(200 + me.ping * 2);

	return true;
};

Town.getTpTool = function () {
    let scroll = me.getItemsEx().filter(function (i) { return i.isInInventory && i.classid === sdk.items.ScrollofTownPortal; }).first();
    let tome = me.getItemsEx().filter(function (i) { return i.isInInventory && i.classid === sdk.items.TomeofTownPortal; }).first();
    if (scroll) {
        return scroll;
    }
    if (tome && tome.getStat(sdk.stats.Quantity) > 0) {
        return tome;
    }
    return null;
};

Town.getIdTool = function () {
    let scroll = me.getItemsEx().find(function (i) { return i.isInInventory && i.classid === sdk.items.ScrollofIdentify; });
    let tome = me.getItemsEx().find(function (i) { return i.isInInventory && i.classid === sdk.items.TomeofIdentify; });
    if (scroll) {
        return scroll;
    }
    if (tome && tome.getStat(sdk.stats.Quantity) > 0) {
        return tome;
    }
    return null;
};

Town.clearScrolls = function () {
	let scrolls = me.getItems().filter(function (scroll) { return scroll.isInInventory && scroll.itemType === sdk.itemtype.Scroll; });
	let tpTome = scrolls.some(function (scroll) { 
		return scroll.classid === sdk.items.ScrollofTownPortal; }) ? me.findItem(sdk.items.TomeofTownPortal, sdk.itemmode.inStorage, sdk.storage.Inventory) : false;
	let idTome = scrolls.some(function (scroll) { 
		return scroll.classid === sdk.items.ScrollofIdentify; }) ? me.findItem(sdk.items.TomeofIdentify, sdk.itemmode.inStorage, sdk.storage.Inventory) : false;
	let currQuantity;

	for (let i = 0; !!scrolls && i < scrolls.length; i++) {
		switch (scrolls[i].classid) {
		case sdk.items.ScrollofTownPortal:
			if (tpTome && tpTome.getStat(sdk.stats.Quantity) < 20) {
				currQuantity = tpTome.getStat(sdk.stats.Quantity);
				if (scrolls[i].toCursor()) {
					clickItemAndWait(0, tpTome.x, tpTome.y, tpTome.location);

					if (tpTome.getStat(sdk.stats.Quantity) > currQuantity) {
						print('ÿc9clearScrollsÿc0 :: placed scroll in tp tome');
						continue;
					}
				}
			}

			break;
		case sdk.items.ScrollofIdentify:
			if (idTome && idTome.getStat(sdk.stats.Quantity) < 20) {
				currQuantity = idTome.getStat(sdk.stats.Quantity);
				if (scrolls[i].toCursor()) {
					clickItemAndWait(0, idTome.x, idTome.y, idTome.location);

					if (idTome.getStat(sdk.stats.Quantity) > currQuantity) {
						print('ÿc9clearScrollsÿc0 :: placed scroll in id tome');
						continue;
					}
				}
			}

			break;
		}

		// Might as well sell the item if already in shop
		if (getUIFlag(0xC) || (Config.PacketShopping && getInteractedNPC() && getInteractedNPC().itemcount > 0)) {
			print("clearInventory sell " + scrolls[i].name);
			Misc.itemLogger("Sold", scrolls[i]);
			scrolls[i].sell();
		} else {
			Misc.itemLogger("Dropped", scrolls[i], "clearScrolls");
			scrolls[i].drop();
		}
	}

	return true;
};

Town.repair = function (force = false) {
	let quiver, myQuiver, npc, repairAction, bowCheck;

	this.cubeRepair();

	repairAction = this.needRepair();

	if (force && repairAction.indexOf("repair") === -1) {
		repairAction.push("repair");
	}

	if (!repairAction || !repairAction.length) {
		return true;
	}

	for (let i = 0; i < repairAction.length; i += 1) {
		switch (repairAction[i]) {
		case "repair":
			if (me.act === 3) {
				this.goToTown(2);
			}

			npc = this.initNPC("Repair", "repair");

			if (!npc) {
				return false;
			}

			me.repair();

			break;
		case "buyQuiver":
			bowCheck = Attack.usingBow();

			if (bowCheck) {
				if (bowCheck === "bow") {
					quiver = "aqv"; // Arrows
				} else {
					quiver = "cqv"; // Bolts
				}

				myQuiver = me.getItem(quiver, 1);

				if (myQuiver) {
					myQuiver.drop();
				}

				npc = this.initNPC("Repair", "repair");

				if (!npc) {
					return false;
				}

				quiver = npc.getItem(quiver);

				if (quiver) {
					quiver.buy();
				}
			}

			break;
		}
	}

	this.shopItems();

	return true;
};

Town.cainID = function (force = false, dontSell = false) {
	if (!Config.CainID.Enable && !force) {
		return false;
	}

	// Cain hasn't been rescued
	if (!Misc.checkQuest(sdk.quests.TheSearchForCain, 0)) { return false; }

	// Check if we're already in a shop. It would be pointless to go to Cain if so.
	let cain, unids, result,
		npc = getInteractedNPC();

	if (npc && npc.name.toLowerCase() === this.tasks[me.act - 1].Shop) {
		return false;
	}

	// Check if we may use Cain - minimum gold
	if (me.gold < Config.CainID.MinGold && !force) {
		return false;
	}

	me.cancel();
	this.stash(false);

	unids = this.getUnids();

	if (unids) {
		// Check if we may use Cain - number of unid items
		if (unids.length < Config.CainID.MinUnids && !force) {
			return false;
		}

		cain = this.initNPC("CainID", "cainID");

		if (!cain) { return false; }

		if (force) {
			npc = this.initNPC("Shop", "clearInventory");
			if (!npc) { return false; }
		}

		for (let i = 0; i < unids.length; i += 1) {
			let item = unids[i];
			result = Pickit.checkItem(item);

			// Force ID for unid items matching autoEquip criteria
			if ([1, 2].indexOf(result.result) > -1 && !item.identified && AutoEquip.hasTier(item)) {
				result.result = -1;
			}

			switch (result.result) {
			case 4:
				try {
					print("sell " + item.name);
					this.initNPC("Shop", "clearInventory");
					Misc.itemLogger("Sold", item);
					item.sell();
				} catch (e) {
					print(e);
				}

				break;
			case 1:
				Misc.itemLogger("Kept", item);
				Misc.logItem("Kept", item, result.line);

				break;
			case 2: // cubing
				Misc.itemLogger("Kept", item, "Cubing-Town");
				Cubing.update();

				break;
			case 3: // runeword (doesn't trigger normally)
				break;
			case 5: // Crafting System
				Misc.itemLogger("Kept", item, "CraftSys-Town");
				CraftingSystem.update(item);

				break;
			default:
				Developer.debugging.smallCharm && item.classid === sdk.items.SmallCharm && (Misc.logItem("Sold", item));
				Developer.debugging.largeCharm && item.classid === sdk.items.LargeCharm && (Misc.logItem("Sold", item));
				Developer.debugging.grandCharm && item.classid === sdk.items.GrandCharm && (Misc.logItem("Sold", item));

				Misc.itemLogger("Sold", item);
				if ((getUIFlag(sdk.uiflags.Shop) || getUIFlag(sdk.uiflags.NPCMenu)) && (item.getItemCost(1) <= 1 || !item.isSellable)) {
					continue;
				}

				this.initNPC("Shop", "clearInventory");

				// Might as well sell the item if already in shop
				if (getUIFlag(sdk.uiflags.Shop) || (Config.PacketShopping && getInteractedNPC() && getInteractedNPC().itemcount > 0)) {
					print("clearInventory sell " + item.name);
					Misc.itemLogger("Sold", item);
					item.sell();
				} else {
					print("clearInventory dropped " + item.name);
					Misc.itemLogger("Dropped", item, "clearInventory");
					item.drop();
				}

				let timer = getTickCount() - this.sellTimer; // shop speedup test

				if (timer > 0 && timer < 500) {
					delay(timer);
				}

				break;
			case -1:
				if (tome) {
					this.identifyItem(item, tome);
				} else {
					scroll = npc.getItem(530);

					if (scroll) {
						if (!Storage.Inventory.CanFit(scroll)) {
							tpTome = me.findItem(518, 0, 3);

							if (tpTome) {
								tpTomePos = {x: tpTome.x, y: tpTome.y};

								tpTome.sell();
								delay(500);
							}
						}

						delay(500);

						if (Storage.Inventory.CanFit(scroll)) {
							scroll.buy();
						}
					}

					scroll = me.findItem(530, 0, 3);

					if (!scroll) {
						continue;
					}

					this.identifyItem(item, scroll);
				}

				// roll back to now check against other criteria
				if (item.indentified) {
					i--;
				}

				break;
			}
		}
	}

	return true;
};

Town.identify = function () {
	let i, item, tome, scroll, npc, list, timer, tpTome, result,
		tpTomePos = {};

	if (me.gold < 5000) {
		this.cainID(true);
	}

	list = Storage.Inventory.Compare(Config.Inventory);

	if (!list) { return false; }

	// Avoid unnecessary NPC visits
	for (i = 0; i < list.length; i += 1) {
		// Only unid items or sellable junk (low level) should trigger a NPC visit
		if ((!list[i].identified || Config.LowGold > 0) && ([-1, 4].indexOf(Pickit.checkItem(list[i]).result) > -1 || (!list[i].identified && AutoEquip.hasTier(list[i])))) {
			break;
		}
	}

	if (i === list.length) {
		return false;
	}

	npc = this.initNPC("Shop", "identify");

	if (!npc) { return false; }

	tome = me.findItem(519, 0, 3);

	if (tome && tome.getStat(70) < list.length) {
		this.fillTome(519);
	}

	MainLoop:
	while (list.length > 0) {
		item = list.shift();

		if (!item.identified && item.location === sdk.storage.Inventory && !this.ignoredItemTypes.includes(item.itemType)) {
			result = Pickit.checkItem(item);

			// Force ID for unid items matching autoEquip criteria
			if ([1, 2].indexOf(result.result) > -1 && !item.identified && AutoEquip.hasTier(item)) {
				result.result = -1;
			}

			switch (result.result) {
			// Items for gold, will sell magics, etc. w/o id, but at low levels
			// magics are often not worth iding.
			case 4:
				Misc.itemLogger("Sold", item);
				item.sell();

				break;
			case -1:
				if (tome) {
					this.identifyItem(item, tome);
				} else {
					scroll = npc.getItem(530);

					if (scroll) {
						if (!Storage.Inventory.CanFit(scroll)) {
							tpTome = me.findItem(518, 0, 3);

							if (tpTome) {
								tpTomePos = {x: tpTome.x, y: tpTome.y};

								tpTome.sell();
								delay(500);
							}
						}

						delay(500);

						if (Storage.Inventory.CanFit(scroll)) {
							scroll.buy();
						}
					}

					scroll = me.findItem(530, 0, 3);

					if (!scroll) {
						break MainLoop;
					}

					this.identifyItem(item, scroll);
				}

				result = Pickit.checkItem(item);

				switch (result.result) {
				case 1:
					Misc.itemLogger("Kept", item);
					Misc.logItem("Kept", item, result.line);

					break;
				case -1: // unidentified
					// At low level its not worth keeping these items until we can Id them it just takes up too much room
					if (me.charlvl < 10 && item.quality === sdk.itemquality.Magic && item.classid !== sdk.items.SmallCharm) {
						Misc.itemLogger("Sold", item);
						item.sell()
					}

					break;
				case 2: // cubing
					Misc.itemLogger("Kept", item, "Cubing-Town");
					Cubing.update();

					break;
				case 3: // runeword (doesn't trigger normally)
					break;
				case 5: // Crafting System
					Misc.itemLogger("Kept", item, "CraftSys-Town");
					CraftingSystem.update(item);

					break;
				default:
					Developer.debugging.smallCharm && item.classid === sdk.items.SmallCharm && (Misc.logItem("Sold", item));
					Developer.debugging.largeCharm && item.classid === sdk.items.LargeCharm && (Misc.logItem("Sold", item));
					Developer.debugging.grandCharm && item.classid === sdk.items.GrandCharm && (Misc.logItem("Sold", item));

					Misc.itemLogger("Sold", item);
					item.sell();

					timer = getTickCount() - this.sellTimer; // shop speedup test

					if (timer > 0 && timer < 500) {
						delay(timer);
					}

					break;
				}

				break;
			}
		}
	}

	this.fillTome(518); // Check for TP tome in case it got sold for ID scrolls

	return true;
};

Town.canTpToTown = function () {
	// I'm dead or in town, no TP tome or scrolls, shouldn't tp from arreatsummit and can't tp from UberTristram
	if (me.dead || me.inTown || !this.getTpTool() || [sdk.areas.ArreatSummit, sdk.areas.UberTristram].includes(me.area)) {
		return false;
	}

	return true;
};

Town.buyBook = function () {
	if (me.findItem(sdk.items.TomeofTownPortal, 0, 3)) {
		return true;
	}

	let tpBook, tpScroll;
	let npc = this.initNPC("Shop", "buyTpTome");

    if (!npc) { return false; }

	delay(500);

	tpBook = npc.getItem(sdk.items.TomeofTownPortal);
	tpScroll = npc.getItem(529);

	if (tpBook && me.gold >= tpBook.getItemCost(0) && Storage.Inventory.CanFit(tpBook)) {
		try {
			if (tpBook.buy()) {
				print('ÿc9BuyBookÿc0 :: bought Tome of Town Portal');
				this.fillTome(sdk.items.TomeofTownPortal);
			}
		} catch (e1) {
			print(e1);

			return false;
		}
	} else {
		if (tpScroll && me.gold >= tpScroll.getItemCost(0) && Storage.Inventory.CanFit(tpScroll)) {
			try {
				if (tpScroll.buy()) {
					print('ÿc9BuyBookÿc0 :: bought Scroll of Town Portal');
				}
			} catch (e1) {
				print(e1);

				return false;
			}
		}
	}

	return true;
};

Town.buyPotions = function () {
	// no town portal book
	if (!me.getItem(sdk.items.TomeofTownPortal)) { 
		return false;
	}

	let i, j, npc, useShift, col, beltSize, pot,
		needPots = false,
		needBuffer = true,
		buffer = {
			hp: 0,
			mp: 0
		};

	this.clearBelt(); // fix wrong pot on pickup before town in belt
	beltSize = Storage.BeltSize();
	col = this.checkColumns(beltSize);

	if (Config.HPBuffer > 0 || Config.MPBuffer > 0) {
		pot = me.getItem(-1, 0);

		if (pot) {
			do {
				if (pot.location === sdk.storage.Inventory) {
					switch (pot.itemType) {
					case 76:
						buffer.hp += 1;

						break;
					case 77:
						buffer.mp += 1;

						break;
					}
				}
			} while (pot.getNext());
		}
	}

	for (i = 0; i < 4; i += 1) {
		if (["hp", "mp"].indexOf(Config.BeltColumn[i]) > -1 && col[i] > (beltSize - Math.min(Config.MinColumn[i], beltSize))) {
			needPots = true;
		}
	}

	if (buffer.mp < Config.MPBuffer || buffer.hp < Config.HPBuffer) {
		for (i = 0; i < 4; i += 1) {
			if (col[i] >= beltSize && (!needPots || Config.BeltColumn[i] === "rv")) {
				needBuffer = false;

				break;
			}
		}
	}

	if (buffer.mp >= Config.MPBuffer && buffer.hp >= Config.HPBuffer) {
		needBuffer = false;
	}

	if (!needPots && !needBuffer) {
		return true;
	}

	if (me.normal && Pather.accessToAct(2) && !Pather.accessToAct(3) && me.act < 2) {
		this.goToTown(2);
	}

	if (me.normal && Pather.accessToAct(3) && !Pather.accessToAct(4) && me.act < 3) {
		this.goToTown(3);
	}

	if (me.normal && Pather.accessToAct(4) && me.act < 4) {
		this.goToTown(4);
	}

	npc = this.initNPC("Shop", "buyPotions");

	if (!npc) {
		return false;
	}

	for (i = 0; i < 4; i += 1) {
		if (col[i] > 0) {
			useShift = this.shiftCheck(col, beltSize);
			pot = this.getPotion(npc, Config.BeltColumn[i]);

			if (pot) {
				if (useShift) {
					pot.buy(true);
				} else {
					for (j = 0; j < col[i]; j += 1) {
						pot.buy(false);
					}
				}
			}
		}

		col = this.checkColumns(beltSize);
	}

	if (needBuffer && buffer.hp < Config.HPBuffer) {
		for (i = 0; i < Config.HPBuffer - buffer.hp; i += 1) {
			pot = this.getPotion(npc, "hp");

			if (Storage.Inventory.CanFit(pot)) {
				pot.buy(false);
			}
		}
	}

	if (needBuffer && buffer.mp < Config.MPBuffer) {
		for (i = 0; i < Config.MPBuffer - buffer.mp; i += 1) {
			pot = this.getPotion(npc, "mp");

			if (Storage.Inventory.CanFit(pot)) {
				pot.buy(false);
			}
		}
	}

	return true;
};

Town.shopItems = function () {
	if (!Config.MiniShopBot) {
		return true;
	}

	let item, result,
		items = [],
		npc = getInteractedNPC(),
		goldLimit = [10000, 20000, 30000][me.diff];

	if (!npc || !npc.itemcount) {
		return false;
	}

	let tick = getTickCount();

	item = npc.getItem();

	if (!item) {
		return false;
	}

	print("ÿc4MiniShopBotÿc0: Scanning " + npc.itemcount + " items.");

	do {
		if (!this.ignoredItemTypes.includes(item.itemType)) {
			items.push(copyUnit(item));
		}
	} while (item.getNext());

	print("ÿc8Kolbot-SoloPlayÿc0: Evaluating " + npc.itemcount + " items.");

	for (let i = 0; i < items.length; i += 1) {
		result = Pickit.checkItem(items[i]);
		let myGold = me.gold;
		let itemCost = items[i].getItemCost(0);

		// no tier'ed items
		if (result.result === 1 && NTIP.CheckItem(items[i], NTIP_CheckListNoTier, true).result !== 0) {
			try {
				if (Storage.Inventory.CanFit(items[i]) && myGold >= itemCost && (myGold - itemCost > goldLimit)) {
					if (items[i].isBaseType) {
						if (!this.worseBaseThanStashed(items[i]) && this.betterBaseThanWearing(items[i], Developer.debugging.junkCheck)) {
							Misc.itemLogger("Shopped", items[i]);
							Developer.debugging.autoEquip && (Misc.logItem("Shopped", items[i], result.line));
							print("ÿc8Kolbot-SoloPlayÿc0: Bought better base");
							items[i].buy();

							continue;
						}
					} else {
						Misc.itemLogger("Shopped", items[i]);
						Misc.logItem("Shopped", items[i], result.line);
						items[i].buy();

						continue;
					}
				}
			} catch (e) {
				print(e);
			}
		}

		// tier'ed items
		if (result.result === 1 && AutoEquip.wanted(items[i])) {
			try {
				if (Storage.Inventory.CanFit(items[i]) && myGold >= itemCost && (myGold - itemCost > goldLimit)) {
					if (Item.hasTier(items[i]) && Item.autoEquipCheck(items[i])) {
						try {
							Misc.itemLogger("AutoEquip Shopped", items[i]);
							print("ÿc9ShopItemsÿc0 :: AutoEquip Shopped: " + items[i].fname + " Tier: " + NTIP.GetTier(items[i]));
							Developer.debugging.autoEquip && (Misc.logItem("AutoEquip Shopped", items[i], result.line));
							items[i].buy();

						} catch (e) {
							print(e);
						}

						continue;
					}

					if (Item.hasMercTier(items[i]) && Item.autoEquipCheckMerc(items[i])) {
						Misc.itemLogger("AutoEquipMerc Shopped", items[i]);
						Developer.debugging.autoEquip && (Misc.logItem("AutoEquipMerc Shopped", items[i], result.line));
						items[i].buy();

						continue;
					}

					if (Item.hasSecondaryTier(items[i]) && Item.autoEquipCheckSecondary(items[i])) {
						try {
							Misc.itemLogger("AutoEquip Switch Shopped", items[i]);
							print("ÿc9ShopItemsÿc0 :: AutoEquip Switch Shopped: " + items[i].fname + " SecondaryTier: " + NTIP.GetSecondaryTier(items[i]));
							Developer.debugging.autoEquip && (Misc.logItem("AutoEquip Switch Shopped", items[i], result.line));
							items[i].buy();

						} catch (e) {
							print(e);
						}

						continue;
					}
				}
			} catch (e) {
				print(e);
			}
		}

		delay(2);
	}

	print("ÿc8Kolbot-SoloPlayÿc0: Exiting Town.shopItems. Time elapsed: " + Developer.formatTime(getTickCount() - tick));

	return true;
};

Town.gamble = function () {
	if (!this.needGamble() || Config.GambleItems.length === 0) {
		return true;
	}

	let i, item, items, npc, newItem, result,
		list = [];

	if (this.gambleIds.length === 0) {
		// change text to classid
		for (i = 0; i < Config.GambleItems.length; i += 1) {
			if (isNaN(Config.GambleItems[i])) {
				if (NTIPAliasClassID.hasOwnProperty(Config.GambleItems[i].replace(/\s+/g, "").toLowerCase())) {
					this.gambleIds.push(NTIPAliasClassID[Config.GambleItems[i].replace(/\s+/g, "").toLowerCase()]);
				} else {
					Misc.errorReport("ÿc1Invalid gamble entry:ÿc0 " + Config.GambleItems[i]);
				}
			} else {
				this.gambleIds.push(Config.GambleItems[i]);
			}
		}
	}

	if (this.gambleIds.length === 0) {
		return true;
	}

	// avoid Alkor
	if (me.act === 3) {
		this.goToTown(2);
	}

	npc = this.initNPC("Gamble", "gamble");

	if (!npc) {
		return false;
	}

	items = me.findItems(-1, 0, 3);

	while (items && items.length > 0) {
		list.push(items.shift().gid);
	}

	while (me.gold >= Config.GambleGoldStop) {
		if (!getInteractedNPC()) {
			npc.startTrade("Gamble");
		}

		item = npc.getItem();
		items = [];

		if (item) {
			do {
				if (this.gambleIds.indexOf(item.classid) > -1) {
					items.push(copyUnit(item));
				}
			} while (item.getNext());

			for (i = 0; i < items.length; i += 1) {
				if (!Storage.Inventory.CanFit(items[i])) {
					return false;
				}

				//me.overhead("Buy: " + items[i].name);
				items[i].buy(false, true);

				newItem = this.getGambledItem(list);

				if (newItem) {
					result = Pickit.checkItem(newItem);

					switch (result.result) {
					case 1:
						Misc.itemLogger("Gambled", newItem);
						Misc.logItem("Gambled", newItem, result.line);
						list.push(newItem.gid);

						break;
					case 2:
						list.push(newItem.gid);
						Cubing.update();

						break;
					case 5: // Crafting System
						CraftingSystem.update(newItem);

						break;
					default:
						Misc.itemLogger("Sold", newItem, "Gambling");
						//me.overhead("Sell: " + newItem.name);
						newItem.sell();

						if (!Config.PacketShopping) {
							delay(500);
						}

						break;
					}
				}
			}
		}

		me.cancel();
	}

	return true;
};

Town.unfinishedQuests = function () {
	let malus = me.getItem(89),
		leg = me.getItem(88),
		book = me.getItem(552),
		tome = me.getItem(548),
		kw = me.getItem(174),
		hammer = me.getItem(90),
		soulstone = me.getItem(551);

	// Act 1
	// Tools of the trade
	if (malus) {
		Town.goToTown(1);
		Town.npcInteract("charsi");
	}

	let imbueItem = Misc.checkItemForImbueing();
	if (imbueItem) {
		Quest.useImbueQuest(imbueItem);
		Item.autoEquip();
	}

	// Drop wirts leg at startup to avoid selling and d/c
	if (leg) {
		Town.goToTown();

		if (leg.isInStash) {
			Town.move('stash');
			Town.openStash();
			Storage.Inventory.MoveTo(leg);
			delay(300 + me.ping);
			me.cancel();
		}

		leg.drop();
	}

	// Act 2
	// Radament skill book
	if (book) {
		book.isInStash && this.openStash() && delay(300 + me.ping);
		book.interact();
		print('ÿc8Kolbot-SoloPlayÿc0: used Radament skill book');
	}

	// Act 3
	// Golden bird
	if (me.getItem(546)) {
		print("ÿc8Kolbot-SoloPlayÿc0: starting jade figurine");
		me.overhead('jade figurine');
		Town.goToTown(3);
		Town.npcInteract("meshif");
	}

	// Ashes
	if (me.getItem(547)) {
		Town.goToTown(3);
		Town.npcInteract("alkor");
	}

	// Potion of life
	if (me.getItem(545)) {
		let pol = me.getItem(545);

		if (pol.isInStash) {
			this.openStash();
			delay(300 + me.ping);
		}

		pol.interact();
		print('ÿc8Kolbot-SoloPlayÿc0: used potion of life');
	}

	// LamEssen's Tome
	if (tome) {
		if (tome.isInStash) {
			Town.move('stash');
			Town.openStash();
			Storage.Inventory.MoveTo(tome);
			delay(300 + me.ping);
		}

		Town.goToTown(3);
		Town.npcInteract("alkor");
		print('ÿc8Kolbot-SoloPlayÿc0: LamEssen Tome completed');
	}

	// Remove Khalim's Will if quest not completed and restarting run.
	if (kw) {
		if (Item.getEquippedItem(4).classid === 174) {
			Town.clearInventory();
			delay(500 + me.ping * 2);
			Quest.stashItem(174);
			print('ÿc8Kolbot-SoloPlayÿc0: removed khalims will');
			Item.autoEquip();
		}
	}

	// Killed council but haven't talked to cain
	if (!Misc.checkQuest(21, 0) && Misc.checkQuest(21, 4)) {
		me.overhead("Finishing Travincal by talking to cain");
		Town.goToTown(3);
		Town.npcInteract("cain");
		delay(300 + me.ping);

		me.cancel();
	}

	// Act 4
	// Drop hellforge hammer and soulstone at startup to avoid selling and d/c
	if (hammer) {
		Town.goToTown(1);

		if (hammer.isInStash) {
			Town.move('stash');
			Town.openStash();
			Storage.Inventory.MoveTo(hammer);
			delay(300 + me.ping);
			me.cancel();
		}

		hammer.drop();
	}

	if (soulstone) {
		Town.goToTown(1);

		if (soulstone.isInStash) {
			Town.move('stash');
			Town.openStash();
			Storage.Inventory.MoveTo(soulstone);
			delay(300 + me.ping);
			me.cancel();
		}

		soulstone.drop();
	}

	// Act 5
	let socketItem = Misc.checkItemForSocketing();
	if (socketItem) {
		Quest.useSocketQuest(socketItem);
	}

	Misc.addSocketables();

	// Scroll of resistance
	if (me.getItem(646)) {
		let sor = me.getItem(646);

		if (sor.isInStash) {
			this.openStash();
			delay(300 + me.ping);
		}

		sor.interact();
		print('ÿc8Kolbot-SoloPlayÿc0: used scroll of resistance');
	}

	if (Town.heal()) {
		me.cancel();
	}
	
	return true;
};

Town.buyPots = function (quantity, type) {
	if (!quantity || !type) { return false; }
	let npc, jugs;
	type = type[0].toUpperCase() + type.substring(1).toLowerCase();
	let potDealer = ["Akara", "Lysander", "Alkor", "Jamella", "Malah"][me.act - 1];

	// Don't buy if already at max res
	if (type === "Thawing" && me.coldRes >= 75) {
		return true;
	} else if (type === "Thawing") {
		print("ÿc9BuyPotsÿc0 :: Current cold resistance: " + me.coldRes);
	}

	// Don't buy if already at max res
	if (type === "Antidote" && me.poisonRes >= 75) {
		return true;
	} else if (type === "Antidote") {
		print("ÿc9BuyPotsÿc0 :: Current poison resistance: " + me.poisonRes);
	}

	// Don't buy if teleport or vigor
	if (type === "Stamina" && (me.getSkill(sdk.skills.Vigor, 0) || Pather.canTeleport())) {
		return true;
	}

	Town.move(NPC[potDealer]);
	npc = getUnit(sdk.unittype.NPC, NPC[potDealer]);

	if (!npc || !npc.openMenu()) {
		return false;
	}

	Misc.useMenu(sdk.menu.Trade);

	switch (type) {
	case "Thawing":
		jugs = npc.getItem("wms");

		break;
	case "Stamina":
		jugs = npc.getItem("vps");

		break;
	case "Antidote":
		jugs = npc.getItem("yps");

		break;
	}

	print('ÿc9BuyPotsÿc0 :: buying ' + quantity + ' ' + type + ' Potions');

	for (let totalspecialpotions = 0; totalspecialpotions < quantity; totalspecialpotions++) {
		if (jugs && Storage.Inventory.CanFit(jugs)) {
			jugs.buy(false);
		}
	}

	me.cancelUIFlags();

	return true;
};

Town.drinkPots = function () {
	let classIds = [sdk.items.StaminaPotion, sdk.items.AntidotePotion, sdk.items.ThawingPotion];

	for (let totalpots = 0; totalpots < classIds.length; totalpots++) {
		let quantity = 0, name;
		let chugs = me.getItemsEx(classIds[totalpots]).filter(pot => pot.isInInventory);

		if (chugs.length > 0) {
			chugs.forEach(function (pot) {
				if (!!pot) {
					name === undefined && (name = pot.name);
					pot.interact();
					quantity++;
					delay(10 + me.ping);
				}
			});

			switch (classIds[totalpots]) {
			case sdk.items.StaminaPotion:
				Town.staminaPot.tick = getTickCount();
				Town.staminaPot.duration = quantity * 30 * 1000;
				break;
			case sdk.items.AntidotePotion:
				Town.antidotePot.tick = getTickCount();
				Town.antidotePot.duration = quantity * 30 * 1000;
				break;
			case sdk.items.ThawingPotion:
				Town.thawingPot.tick = getTickCount();
				Town.thawingPot.duration = quantity * 30 * 1000;
				break;
			}

			print('ÿc9DrinkPotsÿc0 :: drank ' + quantity + " " + name + "s. Timer [" + Developer.formatTime(quantity * 30 * 1000) + "]");
		}
	}

	return true;
};

Town.buyMercPots = function (quantity, type) {
	let npc, jugs;
	let potDealer = ["Akara", "Lysander", "Alkor", "Jamella", "Malah"][me.act - 1];

	// Don't buy if already at max res
	if (type === "Thawing" && Check.mercResistance().CR >= 75) {
		return true;
	}

	// Don't buy if already at max res
	if (type === "Antidote" && Check.mercResistance().PR >= 75) {
		return true;
	}

	Town.move(NPC[potDealer]);
	npc = getUnit(sdk.unittype.NPC, NPC[potDealer]);

	if (!npc || !npc.openMenu()) {
		return false;
	}

	Misc.useMenu(sdk.menu.Trade);

	switch (type) {
	case "Thawing":
		jugs = npc.getItem("wms");

		break;
	case "Stamina":
		jugs = npc.getItem("vps");

		break;
	case "Antidote":
		jugs = npc.getItem("yps");

		break;
	}

	print('ÿc8Kolbot-SoloPlayÿc0: buying ' + quantity + ' ' + type + ' Potions for merc');

	for (let totalspecialpotions = 0; totalspecialpotions < quantity; totalspecialpotions++) {

		if (jugs) {
			jugs.buy(false);
		}
	}

	me.cancel();

	return true;
};

Town.giveMercPots = function () {
	let classIds = ["yps", "wms"];
	let mercenary = Merc.getMercFix();

	if (!mercenary) { return false; }

	for (let totalpots = 0; totalpots < classIds.length; totalpots++) {
		let chugs = me.getItem(classIds[totalpots]);

		if (chugs) {
			do {
				try {
					if (chugs.toCursor()) {
						//clickItem(4, 0);
						(new PacketBuilder).byte(0x61).word(0).send();
					}
					//sendPacket(1, 0x26, 4, chugs.gid);
				} catch (e) {
					print("Couldn't give the potion to merc.");
				}

				if (getCursorType() === 3) {
					let cursorItem = getUnit(100);

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

				delay(500 + me.ping * 2);
			} while (chugs.getNext());

			print('ÿc8Kolbot-SoloPlayÿc0: gave merc Special Potions');
		}
	}

	return true;
};

Town.openStash = function () {
	let stash, telekinesis;

	if (getUIFlag(sdk.uiflags.Cube) && !Cubing.closeCube()) {
		return false;
	}

	if (getUIFlag(sdk.uiflags.Stash)) {
		return true;
	}

	for (let i = 0; i < 5; i += 1) {
		me.cancel();

		if (this.move("stash")) {
			stash = getUnit(2, 267);

			if (stash) {
				if (Skill.useTK()) {
					// Fix for out of range telek
					Pather.walkTo(stash.x, stash.y, 23);
					Skill.cast(sdk.skills.Telekinesis, 0, stash);
				} else {
					Misc.click(0, 0, stash);
				}

				let tick = getTickCount();

				while (getTickCount() - tick < 5000) {
					if (getUIFlag(sdk.uiflags.Stash)) {
						delay(100 + me.ping * 2); // allow UI to initialize

						return true;
					}

					delay(100);
				}
			}
		}

		Packet.flash(me.gid);
	}

	return false;
};

Town.canStash = function (item) {
	let ignoredClassids = [91, 174]; // Some quest items that have to be in inventory or equipped

	if (this.ignoredItemTypes.includes(item.itemType) || ignoredClassids.includes(item.classid) ||
		([sdk.itemtype.SmallCharm, sdk.itemtype.MediumCharm, sdk.itemtype.LargeCharm].includes(item.itemType) && Item.autoEquipCharmCheck(item))) {
		return false;
	}

	if (!Storage.Stash.CanFit(item)) {
		this.sortStash(true);	// Force sort

		// Re-check after sorting
		if (!Storage.Stash.CanFit(item)) {	
			return false;
		}
	}

	return true;
};

Town.stash = function (stashGold) {
	stashGold === undefined && (stashGold = true);
	if (!this.needStash()) { return true; }

	me.cancel();

	let result, items = Storage.Inventory.Compare(Config.Inventory);

	if (items) {
		for (let i = 0; i < items.length; i += 1) {
			if (this.canStash(items[i])) {
				result = (![-1, 0, 4].includes(Pickit.checkItem(items[i]).result) && !Item.autoEquipCharmCheck(items[i])) ||
					!items[i].isSellable || Cubing.keepItem(items[i]) || Runewords.keepItem(items[i]) || CraftingSystem.keepItem(items[i]);

				if (result) {
					Misc.itemLogger("Stashed", items[i]);
					Storage.Stash.MoveTo(items[i]);
				}
			}
		}
	}

	// Stash gold
	if (stashGold) {
		if (me.getStat(14) >= Config.StashGold && me.getStat(15) < 25e5 && this.openStash()) {
			gold(me.getStat(14), 3);
			delay(1000); // allow UI to initialize
			me.cancel();
		}
	}

	return true;
};

Town.sortInventory = function () {
	Storage.Inventory.SortItems(SetUp.sortSettings.ItemsSortedFromLeft, SetUp.sortSettings.ItemsSortedFromRight);

	return true;
};

// Thank you Yame for testing
Town.sortStash = function (force) {
	force === undefined && (force = false);

	if (Storage.Stash.UsedSpacePercent() < 50 && !force) {
		return true;
	}

	Storage.Stash.SortItems();

	return true;
};

Town.clearInventory = function () {
	let col, result, item, beltSize,
		items = [];

	// Return potions to belt
	item = me.getItem(-1, 0);

	if (item) {
		do {
			if (item.location === sdk.storage.Inventory && [sdk.itemtype.HealingPotion, sdk.itemtype.ManaPotion, sdk.itemtype.RejuvPotion].indexOf(item.itemType) > -1) {
				items.push(copyUnit(item));
			}
		} while (item.getNext());

		beltSize = Storage.BeltSize();
		col = this.checkColumns(beltSize);

		// Sort from HP to RV
		items.sort(function (a, b) {
			return a.itemType - b.itemType;
		});

		while (items.length) {
			item = items.shift();

			for (let i = 0; i < 4; i += 1) {
				if (item.code.indexOf(Config.BeltColumn[i]) > -1 && col[i] > 0) {
					if (col[i] === beltSize) { // Pick up the potion and put it in belt if the column is empty
						if (item.toCursor()) {
							clickItem(0, i, 0, 2);
						}
					} else {
						clickItem(2, item.x, item.y, item.location); // Shift-click potion
					}

					delay(me.ping + 200);

					col = this.checkColumns(beltSize);
					break;
				}
			}
		}
	}

	// Cleanup remaining potions
	item = me.getItem(-1, 0);

	if (item) {
		items = [
			[], // array for hp
			[] // array for mp
		];

		do {
			if (item.itemType === sdk.itemtype.HealingPotion) {
				items[0].push(copyUnit(item));
			}

			if (item.itemType === sdk.itemtype.ManaPotion) {
				items[1].push(copyUnit(item));
			}
		} while (item.getNext());

		// Cleanup healing potions
		while (items[0].length > Config.HPBuffer) {
			items[0].shift().interact();
			delay(200 + me.ping);
		}

		// Cleanup mana potions
		while (items[1].length > Config.MPBuffer) {
			items[1].shift().interact();
			delay(200 + me.ping);
		}
	}

	// Any leftover items from a failed ID (crashed game, disconnect etc.)
	items = Storage.Inventory.Compare(Config.Inventory);

	for (let i = 0; !!items && i < items.length; i += 1) {
		if ([18, 41, 76, 77, 78].indexOf(items[i].itemType) === -1 && // Don't drop tomes, keys or potions
			items[i].isSellable &&	// Don't try to sell/drop quest-items/keys/essences/tokens/organs
			(items[i].code !== 529 || !!me.findItem(518, 0, 3)) && // Don't throw scrolls if no tome is found (obsolete code?)
			(items[i].code !== 530 || !!me.findItem(519, 0, 3)) && // Don't throw scrolls if no tome is found (obsolete code?)
			!AutoEquip.wanted(items[i]) && // Don't throw auto equip wanted items
			!Cubing.keepItem(items[i]) && // Don't throw cubing ingredients
			!Runewords.keepItem(items[i]) && // Don't throw runeword ingredients
			!CraftingSystem.keepItem(items[i]) // Don't throw crafting system ingredients
		) {
			result = Pickit.checkItem(items[i]).result;

			if ([0, 4].indexOf(result) === -1) {
				if ((items[i].isBaseType && items[i].getStat(194) > 0) ||
					([25, 69, 70, 71, 72].indexOf(items[i].itemType) > -1 && items[i].quality === 2 && items[i].getStat(194) === 0)) {
					if (this.worseBaseThanStashed(items[i]) && !this.betterBaseThanWearing(items[i], Developer.debugging.junkCheck)) {
						result = 4;
					}
				}
			}

			if (!items[i].identified) {
				result = -1;
			}

			switch (result) {
			case 0: // Drop item
				if ((getUIFlag(sdk.uiflags.Shop) || getUIFlag(sdk.uiflags.NPCMenu)) && (items[i].getItemCost(1) <= 1 || !items[i].isSellable)) {
					continue;
				}

				this.initNPC("Shop", "clearInventory");

				// Might as well sell the item if already in shop
				if (getUIFlag(sdk.uiflags.Shop) || (Config.PacketShopping && getInteractedNPC() && getInteractedNPC().itemcount > 0)) {
					print("clearInventory sell " + items[i].name);
					Misc.itemLogger("Sold", items[i]);
					items[i].sell();
				} else {
					print("clearInventory dropped " + items[i].name);
					Misc.itemLogger("Dropped", items[i], "clearInventory");
					items[i].drop();
				}

				break;
			case 4: // Sell item
				try {
					print("LowGold sell " + items[i].name);
					this.initNPC("Shop", "clearInventory");
					Misc.itemLogger("Sold", items[i]);
					items[i].sell();
				} catch (e) {
					print(e);
				}

				break;
			}
		}
	}

	return true;
};

// TODO: clean this up (sigh)
Town.betterBaseThanWearing = function (base, verbose) {
	verbose === undefined && (verbose = true);
	preSocketCheck === undefined && (preSocketCheck = false);

	let equippedItem = {}, bodyLoc = [], check;
	let itemsResists, baseResists, itemsMinDmg, itemsMaxDmg, itemsTotalDmg, baseDmg, ED, itemsDefense, baseDefense;
	let baseSkillsTier, equippedSkillsTier;
	let result = true, preSocketCheck = false;

	let skillsScore = function (item) {
		let skillsRating = 0;
		skillsRating += item.getStatEx(83, me.classid) * 200; // + class skills
		skillsRating += item.getStatEx(188, Check.currentBuild().tabSkills) * 100; // + TAB skills
		let selectedWeights = [30, 20];
		let selectedSkills = [Check.currentBuild().wantedSkills, Check.currentBuild().usefulSkills];

		for (let i = 0; i < selectedWeights.length; i++) {
			for (let j = 0; j < selectedSkills.length; j++) {
				for (let k = 0; k < selectedSkills[j].length; k++) {
					skillsRating += item.getStatEx(107, selectedSkills[j][k]) * selectedWeights[i];
				}
			}
		}

		return skillsRating;
	};

	if (base === undefined || !base) {
		return false;
	}

	if (base.quality > 4) {
		return false;	//Not a runeword base
	}

	bodyLoc = Item.getBodyLoc(base);

	if ((me.getStat(0) < base.strreq || me.getStat(2) < base.dexreq)) {
		return false; // Can't use so its worse then what we already have
	}

	let item = me.getItem();

	for (let i = 0; i < bodyLoc.length; i++) {
		if (item) {
			do {
				if (item.location === 1 && item.bodylocation === bodyLoc[i]) {
					equippedItem = {
						classid: item.classid,
						type: item.itemType,
						sockets: item.getStatEx(194),
						name: item.name,
						tier: NTIP.GetTier(item),
						prefixnum: item.prefixnum,
						str: item.getStatEx(0),
						dex: item.getStatEx(2),
						def: item.getStatEx(31),
						eDef: item.getStatEx(16),
						fr: item.getStatEx(39),
						lr: item.getStatEx(41),
						cr: item.getStatEx(43),
						pr: item.getStatEx(45),
						minDmg: item.getStatEx(21),
						maxDmg: item.getStatEx(22),
						eDmg: item.getStatEx(18),
						runeword: item.isRuneword,
					};
					check = item;
					break;
				}
			} while (item.getNext());
		}

		if (!equippedItem.runeword) {
			continue;	//Equipped item is not a runeword, keep the base
		}

		switch (equippedItem.prefixnum) {
		case 20507: 	//Ancient's Pledge
		case 20543: 	//Exile
		case 20581: 	//Lore
		case 20635: 	//Spirit
		case 20667: 	//White
		case 20625: 	//Rhyme
			preSocketCheck = true;
			break;
		default:
			break;
		}

		if (base.getStat(194) <= 0 && !preSocketCheck) {
			return true;
		}

		if (base.getStat(194) === equippedItem.sockets || preSocketCheck) {
			switch (equippedItem.prefixnum) {
			case 20507: 	//Ancient's Pledge
				if (me.paladin) {
					itemsResists = (equippedItem.fr + equippedItem.cr + equippedItem.lr + equippedItem.pr) - 187;
					baseResists = base.getStat(39) + base.getStat(41) + base.getStat(43) + base.getStat(45);

					if (baseResists !== itemsResists) {
						if (verbose) {
							print("ÿc9BetterThanWearingCheckÿc0 :: RW(Ancient's Pledge) BaseResists: " + baseResists + " EquippedItem: " + itemsResists);
						}

						if (baseResists < itemsResists) {	//base has lower resists. Will only get here with a paladin shield and I think maximizing resists is more important than defense
							result = false;

							break;
						}
					}
				} else {
					itemsDefense = Math.ceil((equippedItem.def / ((equippedItem.eDef + 100) / 100)));
					baseDefense = base.getStatEx(31);

					if (baseDefense !== itemsDefense) {
						if (verbose) {
							print("ÿc9BetterThanWearingCheckÿc0 :: RW(Ancient's Pledge) BaseDefense: " + baseDefense + " EquippedItem: " + itemsDefense);
						}

						if (baseDefense < itemsDefense) {	//base has lower defense
							result = false;

							break;
						}
					}
				}
				
				break;
			case 20512: 	//Black
				ED = equippedItem.eDmg > 120 ? 120 : equippedItem.eDmg;
				itemsMinDmg = Math.ceil((equippedItem.minDmg / ((ED + 100) / 100)));
				itemsMaxDmg = Math.ceil((equippedItem.maxDmg / ((ED + 100) / 100)));
				itemsTotalDmg = itemsMinDmg + itemsMaxDmg;
				baseDmg = base.getStat(21) + base.getStat(22);
					
				if (baseDmg !== itemsTotalDmg) {
					if (verbose) {
						print("ÿc9BetterThanWearingCheckÿc0 :: RW(Black) BaseDamage: " + baseDmg + " EquippedItem: " + itemsTotalDmg);
					}

					if (baseDmg < itemsTotalDmg) {	//base has lower damage.
						result = false;

						break;
					}
				}

				break;
			case 20523: 	//Crescent Moon
				ED = equippedItem.eDmg > 220 ? 220 : equippedItem.eDmg;
				itemsMinDmg = Math.ceil((equippedItem.minDmg / ((ED + 100) / 100)));
				itemsMaxDmg = Math.ceil((equippedItem.maxDmg / ((ED + 100) / 100)));
				itemsTotalDmg = itemsMinDmg + itemsMaxDmg;
				baseDmg = base.getStat(21) + base.getStat(22);
					
				if (baseDmg !== itemsTotalDmg) {
					if (verbose) {
						print("ÿc9BetterThanWearingCheckÿc0 :: RW(Crescent Moon) BaseDamage: " + baseDmg + " EquippedItem: " + itemsTotalDmg);
					}

					if (baseDmg < itemsTotalDmg) {	//base has lower damage.
						result = false;

						break;
					}
				}

				break;
			case 20543: 	//Exile
				itemsResists = (equippedItem.fr + equippedItem.cr + equippedItem.lr + equippedItem.pr);
				baseResists = base.getStat(39) + base.getStat(41) + base.getStat(43) + base.getStat(45);

				if (baseResists !== itemsResists) {
					if (verbose) {
						print("ÿc9BetterThanWearingCheckÿc0 :: RW(Exile) BaseResists: " + baseResists + " EquippedItem: " + itemsResists);
					}

					if (baseResists < itemsResists) {	//base has lower resists. Will only get here with a paladin shield and I think maximizing resists is more important than defense
						result = false;

						break;
					}
				}

				break;
			case 20561: 	//Honor
				ED = equippedItem.eDmg > 160 ? 160 : equippedItem.eDmg;
				itemsMinDmg = Math.ceil(((equippedItem.minDmg - 9) / ((ED + 100) / 100)));
				itemsMaxDmg = Math.ceil(((equippedItem.maxDmg - 9) / ((ED + 100) / 100)));
				itemsTotalDmg = itemsMinDmg + itemsMaxDmg;
				baseDmg = base.getStat(21) + base.getStat(22);
					
				if (baseDmg !== itemsTotalDmg) {
					if (verbose) {
						print("ÿc9BetterThanWearingCheckÿc0 :: RW(Honor) BaseDamage: " + baseDmg + " EquippedItem: " + itemsTotalDmg);
					}

					if (baseDmg < itemsTotalDmg) {	//base has lower damage.
						result = false;

						break;
					}
				}

				break;
			case 20571: 	//King's Grace
				ED = equippedItem.eDmg > 100 ? 100 : equippedItem.eDmg;
				itemsMinDmg = Math.ceil((equippedItem.minDmg / ((ED + 100) / 100)));
				itemsMaxDmg = Math.ceil((equippedItem.maxDmg / ((ED + 100) / 100)));
				itemsTotalDmg = itemsMinDmg + itemsMaxDmg;
				baseDmg = base.getStat(21) + base.getStat(22);
					
				if (baseDmg !== itemsTotalDmg) {
					if (verbose) {
						print("ÿc9BetterThanWearingCheckÿc0 :: RW(King's Grace) BaseDamage: " + baseDmg + " EquippedItem: " + itemsTotalDmg);
					}

					if (baseDmg < itemsTotalDmg) {	//base has lower damage.
						result = false;

						break;
					}
				}

				break;
			case 20577: 	//Lawbringer
				ED = equippedItem.eDmg;
				itemsMinDmg = Math.ceil((equippedItem.minDmg / ((ED + 100) / 100)));
				itemsMaxDmg = Math.ceil((equippedItem.maxDmg / ((ED + 100) / 100)));
				itemsTotalDmg = itemsMinDmg + itemsMaxDmg;
				baseDmg = base.getStat(21) + base.getStat(22);
					
				if (baseDmg !== itemsTotalDmg) {
					if (verbose) {
						print("ÿc9BetterThanWearingCheckÿc0 :: RW(Lawbringer) BaseDamage: " + baseDmg + " EquippedItem: " + itemsTotalDmg);
					}

					if (baseDmg < itemsTotalDmg) {	//base has lower damage.
						result = false;

						break;
					}
				}

				break;
			case 20581: 	//Lore
				itemsDefense = check.getStatEx(31);
				baseDefense = base.getStatEx(31);
					
				if (me.barbarian || me.druid) {	//Barbarian or Druid (PrimalHelms and Pelts)
					equippedSkillsTier = skillsScore(check);
					baseSkillsTier = skillsScore(base);

					if (equippedSkillsTier !== baseSkillsTier) {
						if (verbose) {
							print("ÿc9BetterThanWearingCheckÿc0 :: RW(Lore) EquippedSkillsTier: " + equippedSkillsTier + " BaseSkillsTier: " + baseSkillsTier);
						}

						if (baseSkillsTier < equippedSkillsTier) {	//Might need to add some type of std deviation, having the skills is probably better but maybe not if in hell with a 50 defense helm
							result = false;

							break;
						}
					} else if (baseDefense !== itemsDefense) {
						if (verbose) {
							print("ÿc9BetterThanWearingCheckÿc0 :: RW(Lore) BaseDefense: " + baseDefense + " EquippedItem: " + itemsDefense);
						}

						if (baseDefense < itemsDefense) {	//base has lower defense
							result = false;

							break;
						}
					}
				} else {
					if (baseDefense !== itemsDefense) {
						if (verbose) {
							print("ÿc9BetterThanWearingCheckÿc0 :: RW(Lore) BaseDefense: " + baseDefense + " EquippedItem: " + itemsDefense);
						}

						if (baseDefense < itemsDefense) {	//base has lower defense
							result = false;

							break;
						}
					}
				}

				break;
			case 20586: 	//Malice
				ED = equippedItem.eDmg > 33 ? 33 : equippedItem.eDmg;
				itemsMinDmg = Math.ceil(((equippedItem.minDmg - 9) / ((ED + 100) / 100)));
				itemsMaxDmg = Math.ceil((equippedItem.maxDmg / ((ED + 100) / 100)));
				itemsTotalDmg = itemsMinDmg + itemsMaxDmg;
				baseDmg = base.getStat(21) + base.getStat(22);

				if (me.classid === 3) {	//Paladin TODO: See if its worth it to calculate the added damage skills would add
					equippedSkillsTier = skillsScore(check);
					baseSkillsTier = skillsScore(base);
				}
					
				if (baseDmg !== itemsTotalDmg) {
					if (verbose) {
						print("ÿc9BetterThanWearingCheckÿc0 :: RW(Malice) BaseDamage: " + baseDmg + " EquippedItem: " + itemsTotalDmg);
					}

					if (baseDmg < itemsTotalDmg) {	//base has lower damage.
						result = false;

						break;
					}
				}

				break;
			case 20625: 	//Rhyme
				if (me.necromancer) {	//Necromancer
					equippedSkillsTier = skillsScore(check);
					baseSkillsTier = skillsScore(base);

					if (equippedSkillsTier !== baseSkillsTier) {
						if (verbose) {
							print("ÿc9BetterThanWearingCheckÿc0 :: RW(Rhyme) EquippedSkillsTier: " + equippedSkillsTier + " BaseSkillsTier: " + baseSkillsTier);
						}

						if (baseSkillsTier < equippedSkillsTier) {	//Might need to add some type of std deviation, having the skills is probably better but maybe not if in hell with a 50 defense shield
							result = false;

							break;
						}
					} else if (equippedSkillsTier === baseSkillsTier) {
						baseDefense = base.getStatEx(31);

						if (verbose) {
							print("ÿc9BetterThanWearingCheckÿc0 :: RW(Rhyme) EquippedDefense: " + equippedItem.def + " BaseDefense: " + baseDefense);
						}

						if (baseDefense < equippedItem.def) {
							result = false;

							break;
						}
					}
				} else if (me.paladin) {
					itemsResists = (equippedItem.fr + equippedItem.cr + equippedItem.lr + equippedItem.pr) - 100;
					baseResists = base.getStat(39) + base.getStat(41) + base.getStat(43) + base.getStat(45);

					if (baseResists !== itemsResists) {
						if (verbose) {
							print("ÿc9BetterThanWearingCheckÿc0 :: RW(Rhyme) BaseResists: " + baseResists + " equippedItem: " + itemsResists);
						}

						if (baseResists < itemsResists) {	//base has lower resists. Will only get here with a paladin shield and I think maximizing resists is more important than defense
							result = false;

							break;
						}
					}

				}

				break;
			case 20626: 	//Rift
				ED = equippedItem.eDmg;
				itemsMinDmg = Math.ceil((equippedItem.minDmg / ((ED + 100) / 100)));
				itemsMaxDmg = Math.ceil((equippedItem.maxDmg / ((ED + 100) / 100)));
				itemsTotalDmg = itemsMinDmg + itemsMaxDmg;
				baseDmg = base.getStat(21) + base.getStat(22);
					
				if (baseDmg !== itemsTotalDmg) {
					if (verbose) {
						print("ÿc9BetterThanWearingCheckÿc0 :: RW(Rift) BaseDamage: " + baseDmg + " EquippedItem: " + itemsTotalDmg);
					}

					if (baseDmg < itemsTotalDmg) {	//base has lower damage.
						result = false;

						break;
					}
				}

				break;
			case 20635: 	//Spirit
				if (me.paladin && bodyLoc === 5) {
					itemsResists = (equippedItem.fr + equippedItem.cr + equippedItem.lr + equippedItem.pr) - 115;
					baseResists = base.getStat(39) + base.getStat(41) + base.getStat(43) + base.getStat(45);
				} else {
					break;
				}

				if (baseResists !== itemsResists) {
					if (verbose) {
						print("ÿc9BetterThanWearingCheckÿc0 :: RW(spirit) BaseResists: " + baseResists + " equippedItem: " + itemsResists);
					}

					if (baseResists < itemsResists) {	//base has lower resists. Will only get here with a paladin shield and I think maximizing resists is more important than defense
						result = false;

						break;
					}
				}

				break;
			case 20639: 	//Steel
				ED = equippedItem.eDmg > 20 ? 20 : equippedItem.eDmg;
				itemsMinDmg = Math.ceil(((equippedItem.minDmg - 3) / ((ED + 100) / 100)));
				itemsMaxDmg = Math.ceil(((equippedItem.maxDmg - 3) / ((ED + 100) / 100)));
				itemsTotalDmg = itemsMinDmg + itemsMaxDmg;
				baseDmg = base.getStat(21) + base.getStat(22);
					
				if (baseDmg !== itemsTotalDmg) {
					if (verbose) {
						print("ÿc9BetterThanWearingCheckÿc0 :: RW(Steel) BaseDamage: " + baseDmg + " EquippedItem: " + itemsTotalDmg);
					}

					if (baseDmg < itemsTotalDmg) {	//base has lower damage.
						result = false;

						break;
					}
				}

				break;
			case 20644: 	//Strength
				ED = equippedItem.eDmg > 35 ? 35 : equippedItem.eDmg;
				itemsMinDmg = Math.ceil((equippedItem.minDmg / ((ED + 100) / 100)));
				itemsMaxDmg = Math.ceil((equippedItem.maxDmg / ((ED + 100) / 100)));
				itemsTotalDmg = itemsMinDmg + itemsMaxDmg;
				baseDmg = base.getStat(21) + base.getStat(22);
					
				if (baseDmg !== itemsTotalDmg) {
					if (verbose) {
						print("ÿc9BetterThanWearingCheckÿc0 :: RW(Strength) BaseDamage: " + baseDmg + " EquippedItem: " + itemsTotalDmg);
					}

					if (baseDmg < itemsTotalDmg) {	//base has lower damage.
						result = false;

						break;
					}
				}

				break;
			case 20667: 	//White
				if (me.necromancer) {	//Necromancer
					equippedSkillsTier = skillsScore(check) - 550;
					baseSkillsTier = skillsScore(base);

					if (equippedSkillsTier !== baseSkillsTier) {
						if (verbose) {
							print("ÿc9BetterThanWearingCheckÿc0 :: RW(White) EquippedSkillsTier: " + equippedSkillsTier + " BaseSkillsTier: " + baseSkillsTier);
						}

						if (baseSkillsTier < equippedSkillsTier) {
							result = false;

							break;
						}
					}
				}

				break;
			case 20633: 	// Smoke
			case 20638: 	// Stealth
				itemsDefense = Math.ceil((equippedItem.def / ((equippedItem.eDef + 100) / 100)));
				baseDefense = base.getStatEx(31);

				if (baseDefense !== itemsDefense) {
					if (verbose) {
						print("ÿc9BetterThanWearingCheckÿc0 :: RW(Stealth/Smoke) BaseDefense: " + baseDefense + " EquippedItem: " + itemsDefense);
					}

					if (baseDefense < itemsDefense) {	//base has lower defense
						result = false;

						break;
					}
				}

				break;
			case 20514: 	// Bone
			case 20592: 	// Myth
			case 20603: 	// Peace
			case 20653: 	// Treachery
				let name = "";

				switch (equippedItem.prefixnum) {
				case 20514: 	// Bone
					name = "Bone";
					break;
				case 20592: 	// Myth
					name = "Myth";
					break;
				case 20603: 	// Peace
					name = "Peace";
					break;
				case 20653: 	// Treachery
					name = "Treachery";
					break;
				}

				itemsDefense = Math.ceil((equippedItem.def / ((equippedItem.eDef + 100) / 100)));
				baseDefense = base.getStatEx(31);

				if (baseDefense !== itemsDefense) {
					if (verbose) {
						print("ÿc9BetterThanWearingCheckÿc0 :: RW(" + name + ") BaseDefense: " + baseDefense + " EquippedItem: " + itemsDefense);
					}

					if (baseDefense < itemsDefense) {	//base has lower defense
						result = false;

						break;
					}
				}

				break;
			default:
				return true;	// Runeword base isn't in the list, keep the base
			}
		}
	}
		
	return result;
};

// TODO: clean this up (which is gonna suck)
Town.worseBaseThanStashed = function (base, clearJunkCheck) {
	if (base === undefined || !base) {
		return false;
	}

	if (base.quality > 4 || base.isRuneword) {
		return false;
	}

	if (clearJunkCheck === undefined) {
		clearJunkCheck = false;
	}

	function generalScore (item) {
		let generalScore = 0;
		generalScore += item.getStatEx(83, me.classid) * 200; // + class skills
		generalScore += item.getStatEx(188, Check.currentBuild().tabSkills) * 100; // + TAB skills
		let selectedWeights = [30, 20];
		let selectedSkills = [Check.currentBuild().wantedSkills, Check.currentBuild().usefulSkills];

		for (let i = 0; i < selectedWeights.length; i++) {
			for (let j = 0; j < selectedSkills.length; j++) {
				for (let k = 0; k < selectedSkills[j].length; k++) {
					generalScore += item.getStatEx(107, selectedSkills[j][k]) * selectedWeights[i];
				}
			}
		}

		if (generalScore === 0) {
			if (me.paladin) {
				generalScore += item.getStatEx(39) * 2;	// Resist
			}

			generalScore += item.getStatEx(31) * 0.5;		// Defense
			generalScore += item.getStatEx(21); // add MIN damage
			generalScore += item.getStatEx(22); // add MAX damage
			//generalScore += item.getStatEx(23); // add MIN damage
			//generalScore += item.getStatEx(24); // add MAX damage
		}

		return generalScore;
	}

	let itemsToCheck, result = false;

	switch (base.itemType) {
	case 2: // Shield
	case 69: // Voodoo heads
	case 70: // Auric Shields
		if (me.paladin) {
			itemsToCheck = me.getItems()
				.filter(item =>
					[2, 70].indexOf(item.itemType) > -1// same item type as current
					&& item.getStat(194) === base.getStat(194) // sockets match junk in review
					&& [3, 7].indexOf(item.location) > -1 // locations
				)
				.sort((a, b) => generalScore(a) - generalScore(b))
				.last(); // select last

			if (itemsToCheck === undefined) {
				return false;
			}

			if (!clearJunkCheck && base.gid === itemsToCheck.gid) {
				return true;
			}

			if (base.getStat(194) > 0 || itemsToCheck.getStat(194) === base.getStat(194)) {
				if (([3, 4, 7].indexOf(base.location) > -1) &&
					(generalScore(base) < generalScore(itemsToCheck) ||
						(generalScore(base) === generalScore(itemsToCheck) && base.ilvl > itemsToCheck.ilvl))) {
					if (Developer.debugging.junkCheck) {
						print("ÿc9WorseBaseThanStashedÿc0 :: BaseScore: " + generalScore(base) + " itemToCheckScore: " + generalScore(itemsToCheck));
					}

					result = true;
				}
			}
		} else if (me.necromancer) {
			itemsToCheck = me.getItems()
				.filter(item =>
					[2, 69].indexOf(item.itemType) > -1// same item type as current
					&& item.getStat(194) === base.getStat(194) // sockets match junk in review
					&& [3, 7].indexOf(item.location) > -1 // locations
				)
				.sort((a, b) => generalScore(a) - generalScore(b)) // Sort on tier value, (better for skills)
				.last(); // select last

			if (itemsToCheck === undefined) {
				return false;
			}

			if (!clearJunkCheck && base.gid === itemsToCheck.gid) {
				return true;
			}

			if (base.getStat(194) > 0 || itemsToCheck.getStat(194) === base.getStat(194)) {
				if (([3, 4, 7].indexOf(base.location) > -1) &&
					(generalScore(base) < generalScore(itemsToCheck))) {
					if (Developer.debugging.junkCheck) {
						print("ÿc9WorseBaseThanStashedÿc0 :: BaseScore: " + generalScore(base) + " itemToCheckScore: " + generalScore(itemsToCheck));
					}

					result = true;
				}
			}
		} else {
			itemsToCheck = me.getItems()
				.filter(item =>
					item.itemType === 2// same item type as current
					&& !item.ethereal // only noneth runeword bases
					&& item.getStat(194) === base.getStat(194) // sockets match junk in review
					&& [3, 7].indexOf(item.location) > -1 // locations
				)
				.sort((a, b) => a.getStatEx(31) - b.getStatEx(31)) // Sort on tier value, (better for skills)
				.last(); // select last

			if (itemsToCheck === undefined) {
				return false;
			}

			if (!clearJunkCheck && base.gid === itemsToCheck.gid) {
				return true;
			}

			if (base.getStat(194) > 0) {
				if (([3, 4, 7].indexOf(base.location) > -1) &&
					!base.ethereal &&
					(base.getStatEx(31) < itemsToCheck.getStatEx(31) ||
						base.getStatEx(31) === itemsToCheck.getStatEx(31) && base.getStatEx(16) < itemsToCheck.getStatEx(16))) {
					if (Developer.debugging.junkCheck) {
						print("ÿc9WorseBaseThanStashedÿc0 :: BaseDefense: " + base.getStatEx(31) + " itemToCheckDefense: " + itemsToCheck.getStatEx(31));
					}

					result = true;
				}
			}
		}

		break;
	case 3: // Armor
		itemsToCheck = me.getItems()
			.filter(item =>
				item.itemType === 3// same item type as current
				&& !item.ethereal // only noneth runeword bases
				&& item.getStat(194) === base.getStat(194) // sockets match junk in review
				&& [3, 7].indexOf(item.location) > -1 // locations
			)
			.sort((a, b) => a.getStatEx(31) - b.getStatEx(31)) // Sort on tier value, (better for skills)
			.last(); // select last

		if (itemsToCheck === undefined) {
			return false;
		}

		if (!clearJunkCheck && base.gid === itemsToCheck.gid) {
			return true;
		}

		if (base.getStat(194) > 0) {
			if (([3, 6, 7].indexOf(base.location) > -1) &&
				!base.ethereal &&
				(base.getStatEx(31) < itemsToCheck.getStatEx(31) ||
						base.getStatEx(31) === itemsToCheck.getStatEx(31) && base.getStatEx(16) < itemsToCheck.getStatEx(16))) {
				if (Developer.debugging.junkCheck) {
					print("ÿc9WorseBaseThanStashedÿc0 :: BaseDefense: " + base.getStatEx(31) + " itemToCheckDefense: " + itemsToCheck.getStatEx(31));
				}

				result = true;
			}
		}

		break;
	case 37: // Helm
	case 71: // Barb Helm
	case 72: //	Druid Pelt
	case 75: // Circlet
		if (me.barbarian || me.druid) {
			itemsToCheck = me.getItems()
				.filter(item =>
					[37, 75, 71, 72].indexOf(item.itemType) > -1// same item type as current
					&& item.getStat(194) === base.getStat(194) // sockets match junk in review
					&& [3, 7].indexOf(item.location) > -1 // locations
				)
				.sort((a, b) => generalScore(a) - generalScore(b)) // Sort on tier value, (better for skills)
				.last(); // select last

			if (itemsToCheck === undefined) {
				return false;
			}

			if (!clearJunkCheck && base.gid === itemsToCheck.gid) {
				return true;
			}

			if (base.getStat(194) > 0 || itemsToCheck.getStat(194) === base.getStat(194)) {
				if (([3, 4, 7].indexOf(base.location) > -1) &&
					(generalScore(base) < generalScore(itemsToCheck) ||
						(generalScore(base) === generalScore(itemsToCheck) && base.getStatEx(31) < itemsToCheck.getStatEx(31)))) {
					if (Developer.debugging.junkCheck) {
						print("ÿc9WorseBaseThanStashedÿc0 :: BaseScore: " + generalScore(base) + " itemToCheckScore: " + generalScore(itemsToCheck));
					}

					result = true;
				}
			}
		} else {
			itemsToCheck = me.getItems()
				.filter(item =>
					[37, 75].indexOf(item.itemType) > -1// same item type as current
					&& !item.ethereal // only noneth runeword bases
					&& item.getStat(194) === base.getStat(194) // sockets match junk in review
					&& [3, 7].indexOf(item.location) > -1 // locations
				)
				.sort((a, b) => a.getStatEx(31) - b.getStatEx(31)) // Sort on defense
				.last(); // select last

			if (itemsToCheck === undefined) {
				return false;
			}

			if (!clearJunkCheck && base.gid === itemsToCheck.gid) {
				return true;
			}

			if (base.getStat(194) > 0 || itemsToCheck.getStat(194) === base.getStat(194)) {
				if (([3, 4, 7].indexOf(base.location) > -1) &&
					!base.ethereal &&
					(base.getStatEx(31) < itemsToCheck.getStatEx(31) ||
						base.getStatEx(31) === itemsToCheck.getStatEx(31) && base.getStatEx(16) < itemsToCheck.getStatEx(16))) {
					if (Developer.debugging.junkCheck) {
						print("ÿc9WorseBaseThanStashedÿc0 :: BaseDefense: " + base.getStat(31) + " itemToCheckDefense: " + itemsToCheck.getStat(31));
					}

					result = true;
				}
			}
		}

		break;
	case 25: //	Wand
		if (me.necromancer) {
			itemsToCheck = me.getItems()
				.filter(item =>
					[25].indexOf(item.itemType) > -1// same item type as current
					&& item.getStat(194) === base.getStat(194) // sockets match junk in review
					&& [3, 7].indexOf(item.location) > -1 // locations
				)
				.sort((a, b) => generalScore(a) - generalScore(b)) // Sort on tier value, (better for skills)
				.last(); // select last

			if (itemsToCheck === undefined) {
				return false;
			}

			if (!clearJunkCheck && base.gid === itemsToCheck.gid) {
				return true;
			}

			if (base.getStat(194) > 0 || itemsToCheck.getStat(194) === base.getStat(194)) {
				if (([3, 4, 7].indexOf(base.location) > -1) &&
					(generalScore(base) < generalScore(itemsToCheck) ||
						(generalScore(base) === generalScore(itemsToCheck) && base.ilvl > itemsToCheck.ilvl))) {
					if (Developer.debugging.junkCheck) {
						print("ÿc9WorseBaseThanStashedÿc0 :: BaseScore: " + generalScore(base) + " itemToCheckScore: " + generalScore(itemsToCheck));
					}

					result = true;
				}
			}
		}

		break;
	case 24: //	Scepter
	case 26: //	Staff
	case 27: //	Bow
	case 28: //	Axe
	case 29: //	Club
	case 30: //	Sword
	case 31: //	Hammer
	case 33: //	Spear
	case 35: //	Crossbow
	case 36: //	Mace
	case 68: //	Orb
	case 85: //	Amazon Bow
	case 86: //	Amazon Spear
		if ((me.getStat(0) < base.strreq || me.getStat(2) < base.dexreq) && !me.paladin) {	// don't toss grief base
			return true; // Can't use so it's worse then what we already have
		}

		itemsToCheck = me.getItems()
			.filter(item =>
				item.itemType === base.itemType// same item type as current
				&& item.getStat(194) === base.getStat(194) // sockets match junk in review
				&& [3, 7].indexOf(item.location) > -1 // locations
				&& me.getStat(0) >= item.strreq && me.getStat(2) >= item.dexreq // I have enough str/dex for this item
			)
			.sort((a, b) => generalScore(a) - generalScore(b)) // Sort on tier value, (better for skills)
			.last(); // select last

		if (itemsToCheck === undefined) {
			if (Developer.debugging.junkCheck) {
				print("ÿc9WorseBaseThanStashedÿc0 :: itemsToCheck is undefined");
			}

			return false;
		}

		if (!clearJunkCheck && base.gid === itemsToCheck.gid) {
			if (Developer.debugging.junkCheck) {
				print("ÿc9WorseBaseThanStashedÿc0 :: same item");
			}

			return true;
		}

		if (base.getStat(194) > 0 || itemsToCheck.getStat(194) === base.getStat(194)) {
			if (([3, 4, 7].indexOf(base.location) > -1) &&
				(generalScore(base) < generalScore(itemsToCheck) ||
						(generalScore(base) === generalScore(itemsToCheck) && (Item.getQuantityOwned(base) > 2 || base.getStatEx(18) < itemsToCheck.getStatEx(18))))) {
				if (Developer.debugging.junkCheck) {
					print("ÿc9WorseBaseThanStashedÿc0 :: BaseScore: " + generalScore(base) + " itemToCheckScore: " + generalScore(itemsToCheck));
				}

				result = true;
			}
		}
		
		break;
	case 67: // Handtohand (Assasin Claw)
	case 88: //	Assassin Claw
		if (me.assassin) {
			itemsToCheck = me.getItems()
				.filter(item =>
					[67, 88].indexOf(item.itemType) > -1// same item type as current
					&& item.getStat(194) === base.getStat(194) // sockets match junk in review
					&& [3, 7].indexOf(item.location) > -1 // locations
				)
				.sort((a, b) => generalScore(a) - generalScore(b)) // Sort on tier value, (better for skills)
				.last(); // select last

			if (itemsToCheck === undefined) {
				return false;
			}

			if (!clearJunkCheck && base.gid === itemsToCheck.gid) {
				return true;
			}

			if (base.getStat(194) > 0) {
				if (([3, 4, 7].indexOf(base.location) > -1) &&
					(generalScore(base) < generalScore(itemsToCheck))) {
					if (Developer.debugging.junkCheck) {
						print("ÿc9WorseBaseThanStashedÿc0 :: BaseScore: " + generalScore(base) + " itemToCheckScore: " + generalScore(itemsToCheck));
					}

					result = true;
				}
			}
		}

		break;
	case 34: //	Polearm
		itemsToCheck = me.getItems()
			.filter(item =>
				[34].indexOf(item.itemType) > -1// same item type as current
				&& item.getStat(194) === base.getStat(194) // sockets match junk in review
				&& [3, 7].indexOf(item.location) > -1 // locations
			)
			.sort((a, b) => (a.getStatEx(23) + a.getStatEx(24)) - (b.getStatEx(23) + b.getStatEx(24))) // Sort on damage, low to high.
			.last(); // select last

		if (itemsToCheck === undefined) {
			return false;
		}

		if (!clearJunkCheck && base.gid === itemsToCheck.gid) {
			return true;
		}

		if (base.getStat(194) > 0) {
			if (([3, 4, 7].indexOf(base.location) > -1) &&
				(base.getStatEx(23) + base.getStatEx(24)) < (itemsToCheck.getStatEx(23) + itemsToCheck.getStatEx(24))) {
				if (Developer.debugging.junkCheck) {
					print("ÿc9WorseBaseThanStashedÿc0 :: BaseDamage: " + (base.getStatEx(23) + base.getStatEx(24)) + " itemToCheckDamage: " + (itemsToCheck.getStatEx(23) + itemsToCheck.getStatEx(24)));
				}

				result = true;
			}
		}

		break;
	default:
		if (Developer.debugging.junkCheck) {
			print("ÿc9WorseBaseThanStashedÿc0 :: No itemType to check for " + base.name);
		}

		return false;
	}

	return result;
};

Town.clearJunk = function () {
	let junk = me.findItems(-1, 0);
	let junkToSell = [];

	if (!junk) { return false; }

	while (junk.length > 0) {
		if ((junk[0].isInStorage) && // stash/invo/cube
			([1, 2, 3, 5].indexOf(Pickit.checkItem(junk[0]).result) === -1) &&
			!AutoEquip.wanted(junk[0]) && // Don't toss wanted auto equip items
			!Cubing.keepItem(junk[0]) && // Don't throw cubing ingredients
			!Runewords.keepItem(junk[0]) && // Don't throw runeword ingredients
			!CraftingSystem.keepItem(junk[0]) && // Don't throw crafting system ingredients
			!Town.ignoredItemTypes.contains(junk[0].itemType) && // Don't drop tomes, keys or potions
			junk[0].isSellable &&	// Don't try to sell/drop quest-items/keys/essences/tokens/organs
			([0, 4].indexOf(Pickit.checkItem(junk[0]).result) > -1) // only drop unwanted
		) {
			if ([0, 4].indexOf(Pickit.checkItem(junk[0]).result) === -1) {
				continue;
			}

			if (!getUIFlag(sdk.uiflags.Stash) && [sdk.storage.Stash, sdk.storage.Cube].contains(junk[0].location)) {
				Town.openStash();
			}

			// Something got stuck in the cube
			if (junk[0].location === sdk.storage.cube) {	
				Cubing.emptyCube();
			}

			print("ÿc9JunkCheckÿc0 :: Junk: " + junk[0].name + " Pickit Result: " + Pickit.checkItem(junk[0]).result);

			if (Storage.Inventory.CanFit(junk[0])) {
				if (Storage.Inventory.MoveTo(junk[0])) {
					junkToSell.push(junk[0]);

					junk.shift();
					continue;
				} else {
					if (junk[0].drop()) {
						me.overhead('cleared junk');
						print("ÿc8Kolbot-SoloPlayÿc0: Failed to move item to inventory. Dropping instead");
						print("ÿc8Kolbot-SoloPlayÿc0: Cleared junk - " + junk[0].name);
						delay(50 + me.ping);

						continue;
					}
				}
			} else if (junk[0].drop()) {
				me.overhead('cleared junk');
				print("ÿc8Kolbot-SoloPlayÿc0: Cleared junk - " + junk[0].name);
				delay(50 + me.ping);

				continue;
			}

		}

		if (junk[0].isInStorage && junk[0].isSellable) {
			if (junk[0].isRuneword && !AutoEquip.wanted(junk[0])) {
				if (!getUIFlag(sdk.uiflags.Stash) && [sdk.storage.Stash, sdk.storage.Cube].contains(junk[0].location)) {
					Town.openStash();
				}

				// Something got stuck in the cube
				if (junk[0].location === sdk.storage.cube) {	
					Cubing.emptyCube();
				}

				print("ÿc9AutoEquipJunkCheckÿc0 :: Junk: " + junk[0].name + " Junk type: " + junk[0].itemType + " Pickit Result: " + Pickit.checkItem(junk[0]).result);

				if (Storage.Inventory.CanFit(junk[0])) {
					if (Storage.Inventory.MoveTo(junk[0])) {
						junkToSell.push(junk[0]);

						junk.shift();
						continue;
					} else {
						if (junk[0].drop()) {
							me.overhead('cleared runeword junk');
							print("ÿc8Kolbot-SoloPlayÿc0: Failed to move item to inventory. Dropping instead");
							print("ÿc8Kolbot-SoloPlayÿc0: Cleared old runeword junk - " + junk[0].name);
							delay(50 + me.ping);

							continue;
						}
					}
				} else if (junk[0].drop()) {
					me.overhead('cleared old runeword junk');
					print("ÿc8Kolbot-SoloPlayÿc0: Cleared old runeword junk - " + junk[0].name);
					delay(50 + me.ping);

					continue;
				}
			}

			if (junk[0].isBaseType) {
				if (this.worseBaseThanStashed(junk[0], true)) {
					if (!getUIFlag(sdk.uiflags.Stash) && [sdk.storage.Stash, sdk.storage.Cube].contains(junk[0].location)) {
						Town.openStash();
					}

					// Something got stuck in the cube
					if (junk[0].location === sdk.storage.cube) {	
						Cubing.emptyCube();
					}

					print("ÿc9WorseBaseThanStashedCheckÿc0 :: Base: " + junk[0].name + " Junk type: " + junk[0].itemType + " Pickit Result: " + Pickit.checkItem(junk[0]).result);

					if (Storage.Inventory.CanFit(junk[0])) {
						if (Storage.Inventory.MoveTo(junk[0])) {
							junkToSell.push(junk[0]);

							junk.shift();
							continue;
						} else {
							if (junk[0].drop()) {
								me.overhead('cleared runeword base junk');
								print("ÿc8Kolbot-SoloPlayÿc0: Failed to move item to inventory. Dropping instead");
								print("ÿc8Kolbot-SoloPlayÿc0: Cleared runeword base junk - " + junk[0].name);
								delay(50 + me.ping);

								continue;
							}
						}
					} else if (junk[0].drop()) {
						me.overhead('cleared runeword base junk');
						print("ÿc8Kolbot-SoloPlayÿc0: Cleared runeword base junk - " + junk[0].name);
						delay(50 + me.ping);

						continue;
					}
				}

				if (!this.betterBaseThanWearing(junk[0], Developer.debugging.junkCheck)) {
					print("ÿc9BetterThanWearingCheckÿc0 :: Base: " + junk[0].name + " Junk type: " + junk[0].itemType + " Pickit Result: " + Pickit.checkItem(junk[0]).result);

					if (!getUIFlag(sdk.uiflags.Stash) && [sdk.storage.Stash, sdk.storage.Cube].contains(junk[0].location)) {
						Town.openStash();
					}

					// Something got stuck in the cube
					if (junk[0].location === sdk.storage.cube) {	
						Cubing.emptyCube();
					}

					if (Storage.Inventory.CanFit(junk[0])) {
						if (Storage.Inventory.MoveTo(junk[0])) {
							junkToSell.push(junk[0]);

							junk.shift();
							continue;
						} else {
							if (junk[0].drop()) {
								me.overhead('cleared bad runeword base junk');
								print("ÿc8Kolbot-SoloPlayÿc0: Failed to move item to inventory. Dropping instead");
								print("ÿc8Kolbot-SoloPlayÿc0: Cleared bad runeword base junk - " + junk[0].name);
								delay(50 + me.ping);

								continue;
							}
						}
					} else if (junk[0].drop()) {
						me.overhead('cleared bad runeword base junk');
						print("ÿc8Kolbot-SoloPlayÿc0: Cleared bad runeword base junk - " + junk[0].name);
						delay(50 + me.ping);

						continue;
					}
				}
			}
		}

		junk.shift();
	}

	if (junkToSell.length > 0) {
		print("ÿc8Kolbot-SoloPlayÿc0: Junk items to sell: " + junkToSell.length);

		Town.initNPC("Shop", "clearInventory");

		if (getUIFlag(sdk.uiflags.Shop) || (Config.PacketShopping && getInteractedNPC() && getInteractedNPC().itemcount > 0)) {
			for (let i = 0; i < junkToSell.length; i++) {
				print("ÿc9JunkCheckÿc0 :: Sell " + junkToSell[i].name);
				Misc.itemLogger("Sold", junkToSell[i]);
				Developer.debugging.junkCheck && (Misc.logItem("JunkCheck Sold", junkToSell[i]));

				junkToSell[i].sell();
				delay(50 + me.ping);
			}
		}

		me.cancelUIFlags();
	}

	return true;
};

Town.npcInteract = function (name) {
	let npc;
	
	!name.includes("_") && (name = name[0].toUpperCase() + name.substring(1).toLowerCase());
	name.includes("_") && (name = "Qual_Kehk");

	!me.inTown && Town.goToTown();
	Town.move(NPC[name])
	npc = getUnit(1, NPC[name]);

	// In case Jerhyn is by Warriv
	if (name === "Jerhyn" && !npc) {
		me.cancel();
		Pather.moveTo(5166, 5206);
		npc = getUnit(1, NPC[name]);
	}

	Packet.flash(me.gid);
	delay(1 + me.ping * 2);

	if (!npc || !npc.openMenu()) {
		me.cancel();
	}

	Packet.flash(me.gid);

	return true;
};

Town.reviveMerc = function () {
	if (!this.needMerc()) {
		return true;
	}

	// avoid Aheara
	if (me.act === 3) {
		this.goToTown(2);
	}

	let tick, dialog, lines,
		preArea = me.area,
		npc = this.initNPC("Merc", "reviveMerc");

	if (!npc) {
		return false;
	}

	MainLoop:
	for (let i = 0; i < 3; i += 1) {
		dialog = getDialogLines();

		for (lines = 0; lines < dialog.length; lines += 1) {
			if (dialog[lines].text.match(":", "gi")) {
				dialog[lines].handler();
				delay(Math.max(750, me.ping * 2));
			}

			// "You do not have enough gold for that."
			if (dialog[lines].text.match(getLocaleString(3362), "gi")) {
				return false;
			}
		}

		while (getTickCount() - tick < 2000) {
			if (!!Merc.getMercFix()) {
				delay(Math.max(750, me.ping * 2));

				break MainLoop;
			}

			delay(200);
		}
	}

	Attack.checkInfinity();

	if (!!Merc.getMercFix()) {
		// Cast BO on merc so he doesn't just die again. Only do this is you are a barb or actually have a cta. Otherwise its just a waste of time.
		if (Config.MercWatch && ((me.barbarian && (me.getSkill(138, 1) || me.getSkill(149, 1))) || Precast.checkCTA())) {
			print("MercWatch precast");
			Pather.useWaypoint("random");
			Precast.doPrecast(true);
			Pather.useWaypoint(preArea);
		}

		return true;
	}

	return false;
};

// TODO: Determine if the call for this function is critical, like during TownChicken vs trying to pick an item or just moving on to next script
// if its not critcal then if it fails maybe write a seperate journeyTo like function (perhaps hikeTo? lol) that plots a course from our current position to
// wherever we want to go. The general reason this fails is either being mobbed (TownChicken so critical should exit game) or getUnit failure bug which isn't critical just annoying
Town.goToTown = function (act, wpmenu) {
	let towns = [1, 40, 75, 103, 109];

	if (!me.inTown) {
		if (!Pather.makePortal(true)) {
			throw new Error("Town.goToTown: Failed to make TP");
		}

		// re-check inTown in case we sucessfully made and used our portal already in the previous function
		if (!me.inTown && !Pather.usePortal(null, me.name)) {
			throw new Error("Town.goToTown: Failed to take TP");
		}
	}

	if (act === undefined) {
		return true;
	}

	if (act < 1 || act > 5) {
		throw new Error("Town.goToTown: Invalid act");
	}

	if (act !== me.act) {
		try {
			Pather.useWaypoint(towns[act - 1], wpmenu);
		} catch (WPError) {
			throw new Error("Town.goToTown: Failed use WP");
		}
	}

	return true;
};

Town.visitTown = function (repair = false) {
	if (me.inTown) {
		this.doChores();
		this.move("stash");

		return true;
	}

	if (!Misc.townEnabled || !Town.canTpToTown()) {
		return false;
	}

	let preArea = me.area, preAct = me.act;

	// not an essential function -> handle thrown errors
	try {
		this.goToTown();
	} catch (e) {
		return false;
	}

	this.doChores(repair);

	if (me.act !== preAct) {
		this.goToTown(preAct);
	}

	this.move("portalspot");

	// this part is essential (would this be better to first try use usePortal(preArea, me.name) then if that fails (usePortal(preArea, null)))
	// that way it tries to use our portal first then if that fails maybe theres another portal to the area we want to go?
	if (!Pather.usePortal(null, me.name)) {
		try {
			Pather.usePortal(preArea, me.name);
		} catch (e) {
			throw new Error("Town.visitTown: Failed to go back from town");
		}
	}

	return true;
};

Town.needRepair = function () {
	let quiver, bowCheck, quantity, inventoryQuiver,
		repairAction = [],
		canAfford = me.gold >= me.getRepairCost();

	// Arrow/Bolt check
	bowCheck = Attack.usingBow();

	if (bowCheck) {
		switch (bowCheck) {
		case "bow":
			quiver = me.getItem("aqv", 1); // Equipped arrow quiver
			inventoryQuiver = me.getItem("aqv");

			break;
		case "crossbow":
			quiver = me.getItem("cqv", 1); // Equipped bolt quiver
			inventoryQuiver = me.getItem("cqv");

			break;
		}

		if (!quiver) { // Out of arrows/bolts
			if (inventoryQuiver) {
				Item.equip(inventoryQuiver, 5);
			} else {
				repairAction.push("buyQuiver"); // equip
				repairAction.push("buyQuiver"); // inventory
			}
		} else {
			quantity = quiver.getStat(70);

			if (typeof quantity === "number" && quantity * 100 / getBaseStat("items", quiver.classid, "maxstack") <= Config.RepairPercent) {
				if (inventoryQuiver) {
					Item.equip(inventoryQuiver, 5);
				} else {
					repairAction.push("buyQuiver"); // equip
					repairAction.push("buyQuiver"); // inventory
				}
			}
		}
	}

	if (canAfford) { // Repair durability/quantity/charges
		if (this.getItemsForRepair(Config.RepairPercent, true).length > 0) {
			repairAction.push("repair");
		}
	} else {
		//print("ÿc4Town: ÿc1Can't afford repairs.");
	}

	return repairAction;
};
