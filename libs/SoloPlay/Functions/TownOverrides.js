/**
*  @filename    TownOverrides.js
*  @author      theBGuy
*  @desc        Town related functions
*
*/
!isIncluded("common/Town.js") && include("common/Town.js");

let Overrides = require('../../modules/Override');

new Overrides.Override(Town, Town.canTpToTown, function (orignal) {
	return (Misc.townEnabled && orignal());
}).apply();

new Overrides.Override(Town, Town.repair, function (orignal, force = false) {
	if (orignal(force)) {
		Town.shopItems();

		return true;
	}

	return false;
}).apply();

new Overrides.Override(Town, Town.buyPotions, function (orignal) {
	// no town portal book
	if (!me.getItem(sdk.items.TomeofTownPortal)) return false;

	if (orignal()) {
		let npc = getInteractedNPC();
		if (!npc) return true;

		// keep cold/pois res high with potions
		if (me.gold > 50000 && npc.getItem(sdk.items.ThawingPotion)) {
			CharData.buffData.thawing.need() && Town.buyPots(12, "thawing", true);
			CharData.buffData.antidote.need() && Town.buyPots(12, "antidote", true);
		}

		return true;
	}

	return false;
}).apply();

// Removed Missle Potions for easy gold
// Items that won't be stashed
Town.ignoredItemTypes = [
	sdk.itemtype.BowQuiver, sdk.itemtype.CrossbowQuiver, sdk.itemtype.Book,
	sdk.itemtype.Scroll, sdk.itemtype.Key, sdk.itemtype.HealingPotion,
	sdk.itemtype.ManaPotion, sdk.itemtype.RejuvPotion, sdk.itemtype.StaminaPotion,
	sdk.itemtype.AntidotePotion, sdk.itemtype.ThawingPotion
];

Town.needPotions = function () {
	// we aren't using MinColumn if none of the values are set
	if (!Config.MinColumn.some(el => el > 0)) return false;
	// no hp pots or mp pots in Config.BeltColumn (who uses only rejuv pots?)
	if (!Config.BeltColumn.some(el => ["hp", "mp"].includes(el))) return false;
	
	// Start
	if (me.charlvl > 2 && me.gold > 1000) {
		let pots = {
			hp: [],
			mp: [],
		};
		me.getItemsEx(-1, sdk.itemmode.inBelt)
			.filter(p => [sdk.itemtype.HealingPotion, sdk.itemtype.ManaPotion].includes(p.itemType) && p.x < 4)
			.forEach(p => {
				if (p.itemType === sdk.itemtype.HealingPotion) {
					pots.hp.push(copyUnit(p));
				} else if (p.itemType === sdk.itemtype.ManaPotion) {
					pots.mp.push(copyUnit(p));
				}
			});

		// quick check
		if ((Config.BeltColumn.includes("hp") && !pots.hp.length)
			|| (Config.BeltColumn.includes("mp") && !pots.hp.length)) {
			return true;
		}

		// should we check the actual amount in the column?
		// For now just keeping the way it was and checking if a column is empty
		for (let i = 0; i < 4; i += 1) {
			if (Config.MinColumn[i] <= 0) {
				continue;
			}

			switch (Config.BeltColumn[i]) {
			case "hp":
				if (!pots.hp.some(p => p.x === i)) {
					console.debug("Column: " + (i + 1) + " needs hp pots");
					return true;
				}
				break;
			case "mp":
				if (!pots.mp.some(p => p.x === i)) {
					console.debug("Column: " + (i + 1) + " needs mp pots");
					return true;
				}
				break;
			}
		}
	}

	return false;
};

// need to build task list then do them.
// This way we can look ahead to see if there is a task thats going to be done at the current npc like buyPots and just go ahead and do it
Town.townTasks = function (buyPots = {}) {
	let extraTasks = Object.assign({}, {
		thawing: false,
		antidote: false,
		stamina: false,
	}, buyPots);

	delay(250);

	console.debug("ÿc8Start ÿc0:: ÿc8TownTasks");
	let tick = getTickCount();
	!me.inTown && Town.goToTown();

	// Burst of speed while in town
	if (me.inTown && Skill.canUse(sdk.skills.BurstofSpeed) && !me.getState(sdk.states.BurstofSpeed)) {
		Skill.cast(sdk.skills.BurstofSpeed, sdk.skills.subindex.hardpoints);
	}

	let preAct = me.act;

	me.switchWeapons(Attack.getPrimarySlot());
	this.unfinishedQuests();
	this.heal();
	this.identify();
	this.clearInventory();
	this.buyBook();
	this.buyPotions();
	extraTasks.thawing && CharData.buffData.thawing.need() && Town.buyPots(12, "Thawing", true);
	extraTasks.antidote && CharData.buffData.antidote.need() && Town.buyPots(12, "Antidote", true);
	extraTasks.stamina && Town.buyPots(12, "Stamina", true);
	this.fillTome(sdk.items.TomeofTownPortal);
	Config.FieldID.Enabled && this.fillTome(sdk.items.TomeofIdentify);
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
	Item.autoEquipMerc();
	this.stash();
	this.clearJunk();
	Town.sortInventory();
	this.sortStash();
	Quest.characterRespec();

	me.act !== preAct && this.goToTown(preAct);
	me.cancelUIFlags();
	!me.barbarian && !Precast.checkCTA() && Precast.doPrecast(false);

	if (me.expansion) {
		Attack.getCurrentChargedSkillIds();
		Pather.checkForTeleCharges();
	}

	delay(300);
	console.debug("ÿc8End ÿc0:: ÿc8TownTasksÿc0 - ÿc7Duration: ÿc0" + Time.format(getTickCount() - tick));
	Town.lastInteractedNPC.reset(); // unassign

	return true;
};

Town.doChores = function (repair = false, buyPots = {}) {
	let extraTasks = Object.assign({}, {
		thawing: false,
		antidote: false,
		stamina: false,
	}, buyPots);

	delay(250);

	console.debug("ÿc8Start ÿc0:: ÿc8TownChores");
	let tick = getTickCount();

	!me.inTown && Town.goToTown();

	// Burst of speed while in town
	if (Skill.canUse(sdk.skills.BurstofSpeed) && !me.getState(sdk.states.BurstofSpeed)) {
		Skill.cast(sdk.skills.BurstofSpeed, sdk.skills.subindex.hardpoints);
	}

	let preAct = me.act;

	me.switchWeapons(Attack.getPrimarySlot());

	this.heal();
	this.identify();
	this.clearInventory();
	this.buyBook();
	this.buyPotions();
	extraTasks.thawing && CharData.buffData.thawing.need() && Town.buyPots(12, "Thawing", true);
	extraTasks.antidote && CharData.buffData.antidote.need() && Town.buyPots(12, "Antidote", true);
	extraTasks.stamina && Town.buyPots(12, "Stamina", true);
	this.fillTome(sdk.items.TomeofTownPortal);
	Config.FieldID.Enabled && this.fillTome(sdk.items.TomeofIdentify);
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
	Item.autoEquipMerc();
	this.stash();
	this.clearJunk();
	!!me.getItem(sdk.items.TomeofTownPortal) && this.clearScrolls();
	// check pots again, we might have enough gold now if we didn't before
	Town.needPotions() && this.buyPotions() && me.cancelUIFlags();

	this.sortInventory();
	Quest.characterRespec();

	me.act !== preAct && this.goToTown(preAct);
	me.cancelUIFlags();
	!me.barbarian && !Precast.checkCTA() && Precast.doPrecast(false);

	if (me.expansion) {
		Attack.getCurrentChargedSkillIds();
		Pather.checkForTeleCharges();
	}

	delay(300);
	console.debug("ÿc8End ÿc0:: ÿc8TownChoresÿc0 - ÿc7Duration: ÿc0" + Time.format(getTickCount() - tick));
	Town.lastInteractedNPC.reset(); // unassign

	return true;
};

Town.getIdTool = function () {
	let items = me.getItemsEx().filter((i) => i.isInInventory && [sdk.items.ScrollofIdentify, sdk.items.TomeofIdentify].includes(i.classid));
	let scroll = items.find((i) => i.isInInventory && i.classid === sdk.items.ScrollofIdentify);
	if (scroll) return scroll;
	let tome = items.find((i) => i.isInInventory && i.classid === sdk.items.TomeofIdentify);
	if (tome && tome.getStat(sdk.stats.Quantity) > 0) return tome;

	return null;
};

Town.cainID = function (force = false) {
	if ((!Config.CainID.Enable && !force) || !Misc.checkQuest(sdk.quest.id.TheSearchForCain, 0)) return false;

	let npc = getInteractedNPC();

	// Check if we're already in a shop. It would be pointless to go to Cain if so.
	if (npc && npc.name.toLowerCase() === this.tasks[me.act - 1].Shop) return false;
	// Check if we may use Cain - minimum gold
	if (me.gold < Config.CainID.MinGold && !force) return false;

	me.cancel();
	this.stash(false);

	let unids = this.getUnids();

	if (unids) {
		// Check if we may use Cain - number of unid items
		if (unids.length < Config.CainID.MinUnids && !force) return false;

		let cain = this.initNPC("CainID", "cainID");
		if (!cain) return false;

		if (force) {
			npc = this.initNPC("Shop", "clearInventory");
			if (!npc) return false;
		}

		for (let i = 0; i < unids.length; i += 1) {
			let item = unids[i];
			let result = Pickit.checkItem(item);

			// Force ID for unid items matching autoEquip criteria
			if ([1, 2].includes(result.result) && !item.identified && AutoEquip.hasTier(item)) {
				result.result = -1;
			}

			switch (result.result) {
			case 4:
				try {
					console.log("sell " + item.name);
					this.initNPC("Shop", "clearInventory");
					Misc.itemLogger("Sold", item);
					item.sell();
				} catch (e) {
					console.warn(e);
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
			case 8: // SoloWants System
				Misc.itemLogger("Kept", item, "SoloWants-Town");
				SoloWants.update(item);

				break;
			default:
				if ((getUIFlag(sdk.uiflags.Shop) || getUIFlag(sdk.uiflags.NPCMenu)) && (item.getItemCost(1) <= 1 || !item.sellable)) {
					continue;
				}

				this.initNPC("Shop", "clearInventory");

				// Might as well sell the item if already in shop
				if (getUIFlag(sdk.uiflags.Shop) || (Config.PacketShopping && getInteractedNPC() && getInteractedNPC().itemcount > 0)) {
					console.log("clearInventory sell " + item.name);
					
					switch (true) {
					case (Developer.debugging.smallCharm && item.classid === sdk.items.SmallCharm):
					case (Developer.debugging.largeCharm && item.classid === sdk.items.LargeCharm):
					case (Developer.debugging.grandCharm && item.classid === sdk.items.GrandCharm):
						Misc.logItem("Sold", item);

						break;
					default:
						Misc.itemLogger("Dropped", item, "clearInventory");
						
						break;
					}

					item.sell();
				} else {
					console.log("clearInventory dropped " + item.name);
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
				if (item.identified) {
					i--;
				}

				break;
			}
		}
	}

	return true;
};

Town.fieldID = function () {
	let list = this.getUnids();
	if (!list) return false;

	while (list.length > 0) {
		let idTool = Town.getIdTool();
		if (!idTool) return false;

		let item = list.shift();
		let result = Pickit.checkItem(item);

		// Force ID for unid items matching autoEquip criteria
		if ([1, 2].includes(result.result) && !item.identified && AutoEquip.hasTier(item)) {
			result.result = -1;
		}

		// unid item that should be identified
		if (result.result === Pickit.result.UNID) {
			this.identifyItem(item, idTool, Config.FieldID.PacketID);
			delay(50);
			result = Pickit.checkItem(item);

			switch (result.result) {
			case Pickit.result.WANTED:
				Misc.itemLogger("Field Kept", item);
				Misc.logItem("Field Kept", item, result.line);

				if (Item.autoEquipCheck(item)) {
					Item.outOfTownAutoEquip();
				}

				break;
			case Pickit.result.CUBING:
				Misc.itemLogger("Field Kept", item, "Cubing-Town");
				Cubing.update();

				break;
			case Pickit.result.CRAFTING:
				Misc.itemLogger("Field Kept", item, "CraftSys-Town");
				CraftingSystem.update(item);

				break;
			case 8: // SoloWants System
				Misc.itemLogger("Field Kept", item, "SoloWants-Town");
				SoloWants.update(item);

				break;
			default:
				break;
			}
		}
	}

	delay(200);
	me.cancel();

	return true;
};

Town.identify = function () {
	if (me.gold < 5000 && this.cainID(true)) return true;
	
	let scroll, timer;
	let list = (Storage.Inventory.Compare(Config.Inventory) || []);

	if (!list.length) return false;
	
	// Avoid unnecessary NPC visits
	// Only unid items or sellable junk (low level) should trigger a NPC visit
	if (!list.some(item => {
		let identified = item.identified;
		return (!identified && ([-1, 4].includes(Pickit.checkItem(item).result) || (!identified && AutoEquip.hasTier(item))));
	})) {
		return false;
	}

	let npc = this.initNPC("Shop", "identify");
	if (!npc) return false;

	let tome = me.findItem(sdk.items.TomeofIdentify, 0, 3);
	tome && tome.getStat(sdk.stats.Quantity) < list.length && this.fillTome(sdk.items.TomeofIdentify);

	MainLoop:
	while (list.length > 0) {
		let item = list.shift();

		if (!this.ignoredItemTypes.includes(item.itemType) && item.location === sdk.storage.Inventory && !item.identified) {
			let result = Pickit.checkItem(item);

			// Force ID for unid items matching autoEquip criteria
			if ([1, 2].includes(result.result) && !item.identified && AutoEquip.hasTier(item)) {
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
				let idTool = Town.getIdTool();

				if (idTool) {
					this.identifyItem(item, idTool);
				} else {
					scroll = npc.getItem(530);

					if (scroll) {
						if (!Storage.Inventory.CanFit(scroll)) {
							let tpTome = me.findItem(518, 0, 3);

							if (tpTome) {
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
					if (me.charlvl < 10 && item.magic && item.classid !== sdk.items.SmallCharm) {
						Misc.itemLogger("Sold", item);
						item.sell();
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
				case 8: // SoloWants System
					Misc.itemLogger("Kept", item, "SoloWants-Town");
					SoloWants.update(item);

					break;
				default:
					if (!item.sellable) continue;

					switch (true) {
					case (Developer.debugging.smallCharm && item.classid === sdk.items.SmallCharm):
					case (Developer.debugging.largeCharm && item.classid === sdk.items.LargeCharm):
					case (Developer.debugging.grandCharm && item.classid === sdk.items.GrandCharm):
						Misc.logItem("Sold", item);

						break;
					default:
						Misc.itemLogger("Sold", item);
						
						break;
					}

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

// credit isid0re
Town.buyBook = function () {
	if (me.findItem(sdk.items.TomeofTownPortal, 0, 3)) return true;
	if (me.gold < 500) return false;

	let npc = this.initNPC("Shop", "buyTpTome");
	if (!npc) return false;

	delay(500);

	let tpBook = npc.getItem(sdk.items.TomeofTownPortal);
	let tpScroll = npc.getItem(529);

	if (tpBook && me.gold >= tpBook.getItemCost(0) && Storage.Inventory.CanFit(tpBook)) {
		try {
			if (tpBook.buy()) {
				console.log('ÿc9BuyBookÿc0 :: bought Tome of Town Portal');
				this.fillTome(sdk.items.TomeofTownPortal);
			}
		} catch (e1) {
			console.warn(e1);

			return false;
		}
	} else {
		if (tpScroll && me.gold >= tpScroll.getItemCost(0) && Storage.Inventory.CanFit(tpScroll)) {
			try {
				if (tpScroll.buy()) {
					console.log('ÿc9BuyBookÿc0 :: bought Scroll of Town Portal');
				}
			} catch (e1) {
				console.warn(e1);

				return false;
			}
		}
	}

	return true;
};

Town.shopItems = function () {
	if (!Config.MiniShopBot) return true;

	let npc = getInteractedNPC();
	let goldLimit = [10000, 20000, 30000][me.diff];

	if (!npc || !npc.itemcount) return false;

	let items = npc.getItemsEx().filter((item) => Town.ignoredItemTypes.indexOf(item.itemType) === -1);
	if (!items.length) return false;

	let tick = getTickCount();
	let haveMerc = !me.classic && Config.UseMerc && Misc.poll(() => !!me.getMerc(), 500, 100);
	console.log("ÿc4MiniShopBotÿc0: Scanning " + npc.itemcount + " items.");
	console.log("ÿc8Kolbot-SoloPlayÿc0: Evaluating " + npc.itemcount + " items.");

	for (let i = 0; i < items.length; i++) {
		let item = items[i];
		let result = Pickit.checkItem(item);
		let myGold = me.gold;
		let itemCost = item.getItemCost(0);

		// no tier'ed items
		if (result.result === 1 && NTIP.CheckItem(item, NTIP_CheckListNoTier, true).result !== 0) {
			try {
				if (Storage.Inventory.CanFit(item) && myGold >= itemCost && (myGold - itemCost > goldLimit)) {
					if (item.isBaseType) {
						if (!this.worseBaseThanStashed(item) && this.betterBaseThanWearing(item, Developer.debugging.junkCheck)) {
							Misc.itemLogger("Shopped", item);
							Developer.debugging.autoEquip && Misc.logItem("Shopped", item, result.line);
							console.log("ÿc8Kolbot-SoloPlayÿc0: Bought better base");
							item.buy();

							continue;
						}
					} else {
						Misc.itemLogger("Shopped", item);
						Misc.logItem("Shopped", item, result.line);
						item.buy();

						continue;
					}
				}
			} catch (e) {
				console.warn(e);
			}
		}

		// tier'ed items - // todo re-write this so we don't buy multiple items just to equip one then sell the rest back
		if (result.result === 1 && AutoEquip.wanted(item)) {
			try {
				if (Storage.Inventory.CanFit(item) && myGold >= itemCost && (myGold - itemCost > goldLimit)) {
					if (Item.hasTier(item) && Item.autoEquipCheck(item)) {
						try {
							Misc.itemLogger("AutoEquip Shopped", item);
							console.log("ÿc9ShopItemsÿc0 :: AutoEquip Shopped: " + item.fname + " Tier: " + NTIP.GetTier(item));
							Developer.debugging.autoEquip && Misc.logItem("AutoEquip Shopped", item, result.line);
							item.buy();

						} catch (e) {
							console.warn(e);
						}

						continue;
					}

					if (haveMerc && Item.hasMercTier(item) && Item.autoEquipCheckMerc(item)) {
						Misc.itemLogger("AutoEquipMerc Shopped", item);
						Developer.debugging.autoEquip && Misc.logItem("AutoEquipMerc Shopped", item, result.line);
						item.buy();

						continue;
					}

					if (Item.hasSecondaryTier(item) && Item.autoEquipCheckSecondary(item)) {
						try {
							Misc.itemLogger("AutoEquip Switch Shopped", item);
							console.log("ÿc9ShopItemsÿc0 :: AutoEquip Switch Shopped: " + item.fname + " SecondaryTier: " + NTIP.GetSecondaryTier(item));
							Developer.debugging.autoEquip && Misc.logItem("AutoEquip Switch Shopped", item, result.line);
							item.buy();

						} catch (e) {
							console.warn(e);
						}

						continue;
					}
				}
			} catch (e) {
				console.warn(e);
			}
		}

		delay(2);
	}

	console.log("ÿc8Kolbot-SoloPlayÿc0: Exiting Town.shopItems. Time elapsed: " + Developer.formatTime(getTickCount() - tick));

	return true;
};

Town.gamble = function () {
	if (!this.needGamble() || Config.GambleItems.length === 0) return true;

	let list = [];

	if (this.gambleIds.length === 0) {
		// change text to classid
		for (let i = 0; i < Config.GambleItems.length; i += 1) {
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

	if (this.gambleIds.length === 0) return true;

	// avoid Alkor
	me.act === 3 && this.goToTown(Pather.accessToAct(4) ? 4 : 2);

	let npc = this.initNPC("Gamble", "gamble");
	if (!npc) return false;

	let items = me.findItems(-1, sdk.itemmode.inStorage, sdk.itemmode.onGround);

	while (items && items.length > 0) {
		list.push(items.shift().gid);
	}

	while (me.gold >= Config.GambleGoldStop) {
		!getInteractedNPC() && npc.startTrade("Gamble");

		let item = npc.getItem();
		items = [];

		if (item) {
			do {
				if (this.gambleIds.includes(item.classid)) {
					items.push(copyUnit(item));
				}
			} while (item.getNext());

			for (let i = 0; i < items.length; i += 1) {
				if (!Storage.Inventory.CanFit(items[i])) return false;

				//me.overhead("Buy: " + items[i].name);
				items[i].buy(false, true);

				let newItem = this.getGambledItem(list);

				if (newItem) {
					let result = Pickit.checkItem(newItem);

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

// todo: clean this up
Town.unfinishedQuests = function () {
	// Act 1
	// Tools of the trade
	let malus = me.getItem(sdk.items.quest.HoradricMalus);
	!!malus && Town.goToTown(1) && Town.npcInteract("charsi");

	let imbueItem = Misc.checkItemsForImbueing();
	if (imbueItem) {
		Quest.useImbueQuest(imbueItem);
		Item.autoEquip();
	}

	// Drop wirts leg at startup
	let leg = me.getItem(sdk.items.quest.WirtsLeg);
	if (leg) {
		!me.inTown && Town.goToTown();
		leg.isInStash && Town.openStash() && Storage.Inventory.MoveTo(leg) && delay(300 + me.ping);
		getUIFlag(sdk.uiflags.Stash) && me.cancel();
		leg.drop();
	}

	// Act 2
	// Radament skill book
	let book = me.getItem(sdk.items.quest.BookofSkill);
	if (book) {
		book.isInStash && Town.openStash() && delay(300 + me.ping);
		book.interact();
		print('ÿc8Kolbot-SoloPlayÿc0: used Radament skill book');
		delay(500 + me.ping) && me.getStat(sdk.stats.NewSkills) > 0 && AutoSkill.init(Config.AutoSkill.Build, Config.AutoSkill.Save);
	}

	// Act 3
	// Figurine -> Golden Bird
	if (me.getItem(sdk.items.quest.AJadeFigurine)) {
		myPrint("starting jade figurine");
		Town.goToTown(3) && Town.npcInteract("meshif");
	}

	// Golden Bird -> Ashes
	if (me.getItem(sdk.items.quest.TheGoldenBird)) {
		Town.goToTown(3) && Town.npcInteract("alkor");
	}

	// Potion of life
	let pol = me.getItem(sdk.items.quest.PotofLife);
	if (pol) {
		pol.isInStash && Town.openStash() && delay(300 + me.ping);
		pol.interact();
		print('ÿc8Kolbot-SoloPlayÿc0: used potion of life');
	}

	// LamEssen's Tome
	let tome = me.getItem(sdk.items.quest.LamEsensTome);
	if (tome) {
		!me.inTown && Town.goToTown(3);
		tome.isInStash && Town.openStash() && Storage.Inventory.MoveTo(tome) && delay(300 + me.ping);
		Town.npcInteract("alkor") && delay(300 + me.ping);
		me.getStat(sdk.stats.StatPts) > 0 && AutoStat.init(Config.AutoStat.Build, Config.AutoStat.Save, Config.AutoStat.BlockChance, Config.AutoStat.UseBulk);
		print('ÿc8Kolbot-SoloPlayÿc0: LamEssen Tome completed');
	}

	// Remove Khalim's Will if quest not completed and restarting run.
	let kw = me.getItem(sdk.items.quest.KhalimsWill);
	if (kw) {
		if (Item.getEquippedItem(sdk.body.RightArm).classid === sdk.items.quest.KhalimsWill) {
			Town.clearInventory();
			delay(500 + me.ping * 2);
			Quest.stashItem(sdk.items.quest.KhalimsWill);
			print('ÿc8Kolbot-SoloPlayÿc0: removed khalims will');
			Item.autoEquip();
		}
	}

	// Killed council but haven't talked to cain
	if (!Misc.checkQuest(sdk.quest.id.TheBlackenedTemple, 0) && Misc.checkQuest(sdk.quest.id.TheBlackenedTemple, 4)) {
		me.overhead("Finishing Travincal by talking to cain");
		Town.goToTown(3) && Town.npcInteract("cain");
		delay(300 + me.ping);
		me.cancel();
	}

	// Act 4
	// Drop hellforge hammer and soulstone at startup
	let hammer = me.getItem(sdk.items.quest.HellForgeHammer);
	if (hammer) {
		!me.inTown && Town.goToTown();
		hammer.isInStash && Town.openStash() && Storage.Inventory.MoveTo(hammer) && delay(300 + me.ping);
		getUIFlag(sdk.uiflags.Stash) && me.cancel();
		hammer.drop();
	}

	let soulstone = me.getItem(sdk.items.quest.MephistosSoulstone);
	if (soulstone) {
		!me.inTown && Town.goToTown();
		soulstone.isInStash && Town.openStash() && Storage.Inventory.MoveTo(soulstone) && delay(300 + me.ping);
		getUIFlag(sdk.uiflags.Stash) && me.cancel();
		soulstone.drop();
	}

	// Act 5
	let socketItem = Misc.checkItemsForSocketing();
	!!socketItem && Quest.useSocketQuest(socketItem);

	// Scroll of resistance
	let sor = me.getItem(sdk.items.quest.ScrollofResistance);
	if (sor) {
		sor.isInStash && this.openStash() && delay(300 + me.ping);
		sor.interact();
		print('ÿc8Kolbot-SoloPlayÿc0: used scroll of resistance');
	}

	Misc.checkSocketables();
	
	Town.heal();
	me.cancelUIFlags();
	
	return true;
};

new Overrides.Override(Town, Town.drinkPots, function(orignal, type) {
	let objDrank = orignal(type, false);
	
	if (objDrank.potName) {
		let objID = objDrank.potName.split(' ')[0].toLowerCase();

		if (objID) {
			// non-english version
			if (!CharData.buffData[objID]) {
				objID = type.toLowerCase();
			}

			if (!CharData.buffData[objID].active() || CharData.buffData[objID].timeLeft() <= 0) {
				CharData.buffData[objID].tick = getTickCount();
				CharData.buffData[objID].duration = objDrank.quantity * 30 * 1000;
			} else {
				CharData.buffData[objID].duration += (objDrank.quantity * 30 * 1000) - (getTickCount() - CharData.buffData[objID].tick);
			}

			console.log('ÿc9DrinkPotsÿc0 :: drank ' + objDrank.quantity + " " + objDrank.potName + "s. Timer [" + Developer.formatTime(CharData.buffData[objID].duration) + "]");
		}
	}

	return true;
}).apply();

// re-write this so its actually useable
Town.buyMercPots = function (quantity, type) {
	let merc = Misc.poll(() => me.getMerc(), 1000, 30);
	if (!merc) return false;
	
	let npc, jugs;
	let potDealer = ["Akara", "Lysander", "Alkor", "Jamella", "Malah"][me.act - 1];

	// Don't buy if already at max res
	if (type === "Thawing" && merc.coldRes >= 75) return true;

	// Don't buy if already at max res
	if (type === "Antidote" && merc.poisonRes >= 75) return true;

	Town.move(NPC[potDealer]);
	npc = Game.getNPC(NPC[potDealer]);

	if (!npc || !npc.openMenu()) return false;

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

Town.canStash = function (item) {
	if (this.ignoredItemTypes.includes(item.itemType)
		|| [sdk.items.quest.HoradricStaff, sdk.items.quest.KhalimsWill].includes(item.classid)
		|| ([sdk.items.SmallCharm, sdk.items.LargeCharm, sdk.items.GrandCharm].includes(item.classid) && Item.autoEquipCharmCheck(item))) {
		return false;
	}

	!Storage.Stash.CanFit(item) && this.sortStash(true);

	return Storage.Stash.CanFit(item);
};

Town.stash = function (stashGold = true) {
	if (!this.needStash()) return true;

	me.cancel();

	let result = false;
	let items = Storage.Inventory.Compare(Config.Inventory);

	if (items) {
		for (let i = 0; i < items.length; i += 1) {
			if (this.canStash(items[i])) {
				let pickResult = Pickit.checkItem(items[i]).result;
				switch (true) {
				case pickResult > 0 && pickResult < 4:
				case Cubing.keepItem(items[i]):
				case Runewords.keepItem(items[i]):
				case CraftingSystem.keepItem(items[i]):
				case SoloWants.keepItem(items[i]):
				case AutoEquip.wanted(items[i]) && pickResult === 0: // wanted but can't use yet
				case !items[i].sellable: // quest/essences/keys/ect
					result = true;

					break;
				default:
					result = false;

					break;
				}

				if (result) {
					Misc.itemLogger("Stashed", items[i]);
					Storage.Stash.MoveTo(items[i]);
				}
			}
		}
	}

	// Stash gold
	if (stashGold) {
		if (me.getStat(Gold) >= Config.StashGold && me.getStat(GoldBank) < 25e5 && this.openStash()) {
			gold(me.getStat(Gold), 3);
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

Town.sortStash = function (force = false) {
	if (Storage.Stash.UsedSpacePercent() < 50 && !force) return true;
	Storage.Stash.SortItems();

	return true;
};

Town.clearInventory = function () {
	// If we are at an npc already, open the window otherwise moving potions around fails
	if (getUIFlag(sdk.uiflags.NPCMenu) && !getUIFlag(sdk.uiflags.Shop)) {
		try {
			!!getInteractedNPC() && Misc.useMenu(sdk.menu.Trade);
		} catch (e) {
			console.warn(e);
			me.cancelUIFlags();
		}
	}
		
	// Remove potions in the wrong slot of our belt
	this.clearBelt();

	// Return potions from inventory to belt
	let potsInInventory;
	let beltSize = Storage.BeltSize();
	// belt 4x4 locations
	/**
	* 12 13 14 15
	* 8  9  10 11
	* 4  5  6  7
	* 0  1  2  3
	*/
	let beltMax = (beltSize * 4);
	let beltCapRef = [(0 + beltMax), (1 + beltMax), (2 + beltMax), (3 + beltMax)];

	// check if we have empty belt slots
	let needCleanup = Town.checkColumns(beltSize).some(slot => slot > 0);

	if (needCleanup) {
		potsInInventory = me.getItemsEx()
			.filter((p) => p.isInInventory && [sdk.itemtype.HealingPotion, sdk.itemtype.ManaPotion, sdk.itemtype.RejuvPotion].includes(p.itemType))
			.sort((a, b) => a.itemType - b.itemType);

		potsInInventory.length > 0 && console.debug("clearInventory: start pots clean-up");
		// Start interating over all the pots we have in our inventory
		beltSize > 1 && potsInInventory.forEach(function (p) {
			let moved = false;
			// get free space in each slot of our belt
			let freeSpace = Town.checkColumns(beltSize);
			for (let i = 0; i < 4 && !moved; i += 1) {
				// checking that current potion matches what we want in our belt
				if (freeSpace[i] > 0 && p.code && p.code.startsWith(Config.BeltColumn[i])) {
					// Pick up the potion and put it in belt if the column is empty, and we don't have any other columns empty
					// prevents shift-clicking potion into wrong column
					if (freeSpace[i] === beltSize || freeSpace.some((spot) => spot === beltSize)) {
						let x = freeSpace[i] === beltSize ? i : (beltCapRef[i] - (freeSpace[i] * 4));
						p.toCursor(true) && new PacketBuilder().byte(0x23).dword(p.gid).dword(x).send();
					} else {
						clickItemAndWait(sdk.clicktypes.click.ShiftLeft, p.x, p.y, p.location);
					}
					Misc.poll(() => !me.itemoncursor, 300, 30);
					moved = Town.checkColumns(beltSize)[i] === freeSpace[i] - 1;
				}
				Cubing.cursorCheck();
			}
		});
	}

	// Cleanup remaining potions
	console.debug("clearInventory: start clean-up remaining pots");
	let sellOrDrop = [];
	potsInInventory = me.getItemsEx()
		.filter((p) => p.isInInventory && [
			sdk.itemtype.HealingPotion, sdk.itemtype.ManaPotion, sdk.itemtype.RejuvPotion,
			sdk.itemtype.ThawingPotion, sdk.itemtype.AntidotePotion, sdk.itemtype.StaminaPotion
		].includes(p.itemType));

	if (potsInInventory.length > 0) {
		let hp = [], mp = [], rv = [], specials = [];
		potsInInventory.forEach(function (p) {
			if (!p || p === undefined) return false;

			switch (p.itemType) {
			case sdk.itemtype.HealingPotion:
				return (hp.push(copyUnit(p)));
			case sdk.itemtype.ManaPotion:
				return (mp.push(copyUnit(p)));
			case sdk.itemtype.RejuvPotion:
				return (rv.push(copyUnit(p)));
			case sdk.itemtype.ThawingPotion:
			case sdk.itemtype.AntidotePotion:
			case sdk.itemtype.StaminaPotion:
				return (specials.push(copyUnit(p)));
			}

			return false;
		});

		// Cleanup healing potions
		while (hp.length > Config.HPBuffer) {
			sellOrDrop.push(hp.shift());
		}

		// Cleanup mana potions
		while (mp.length > Config.MPBuffer) {
			sellOrDrop.push(mp.shift());
		}

		// Cleanup rejuv potions
		while (rv.length > Config.RejuvBuffer) {
			sellOrDrop.push(rv.shift());
		}

		// Clean up special pots
		while (specials.length) {
			specials.shift().interact();
			delay(200);
		}
	}

	if (Config.FieldID.Enabled && !me.getItem(sdk.items.TomeofIdentify)) {
		let scrolls = me.getItemsEx().filter(i => i.isInInventory && i.classid === sdk.items.ScrollofIdentify);

		while (scrolls.length > 2) {
			sellOrDrop.push(scrolls.shift());
		}
	}

	// Any leftover items from a failed ID (crashed game, disconnect etc.)
	let items = (Storage.Inventory.Compare(Config.Inventory) || []);
	items.length > 0 && (items = items.filter(function (item) {
		return (!!item && ([sdk.itemtype.Book, sdk.itemtype.Key, sdk.itemtype.HealingPotion, sdk.itemtype.HealingPotion, sdk.itemtype.RejuvPotion].indexOf(item.itemType) === -1
					&& item.sellable // Don't try to sell/drop quest-items
					&& !AutoEquip.wanted(item) // Don't throw auto equip wanted items
					&& !Cubing.keepItem(item) // Don't throw cubing ingredients
					&& !Runewords.keepItem(item) // Don't throw runeword ingredients
					&& !CraftingSystem.keepItem(item) // Don't throw crafting system ingredients
					&& !SoloWants.keepItem(item) // Don't throw SoloWants system ingredients
		));
	}));

	let sell = [];
	items.length > 0 && items.forEach(function (item) {
		let result = Pickit.checkItem(item).result;

		if ([Pickit.result.UNWANTED, Pickit.result.TRASH].indexOf(result) === -1) {
			if ((item.isBaseType && item.sockets > 0) ||
				([sdk.itemtype.Wand, sdk.itemtype.VoodooHeads, sdk.itemtype.AuricShields, sdk.itemtype.PrimalHelm, sdk.itemtype.Pelt].includes(item.itemType) && item.normal && item.sockets === 0)) {
				if (Town.worseBaseThanStashed(item) && !Town.betterBaseThanWearing(item, Developer.debugging.junkCheck)) {
					result = 4;
				}
			}
		}

		!item.identified && (result = -1);

		[Pickit.result.UNWANTED, Pickit.result.TRASH].includes(result) && sell.push(item);
	});

	sell = (sell.length > 0 ? sell.concat(sellOrDrop) : sellOrDrop.slice(0));
	sell.length > 0 && this.initNPC("Shop", "clearInventory") && sell.forEach(function (item) {
		try {
			if (getUIFlag(sdk.uiflags.Shop) || getUIFlag(sdk.uiflags.NPCMenu)) {
				console.log("clearInventory sell " + item.name);
				Misc.itemLogger("Sold", item);
				item.sell();
				delay(100);
			}
		} catch (e) {
			console.errorReport(e);
		}
	});

	return true;
};

// TODO: clean this up (sigh)
Town.betterBaseThanWearing = function (base = undefined, verbose = true) {
	let equippedItem = {}, check;
	let itemsResists, baseResists, itemsMinDmg, itemsMaxDmg, itemsTotalDmg, baseDmg, ED, itemsDefense, baseDefense;
	let baseSkillsTier, equippedSkillsTier;
	let result = true, preSocketCheck = false;

	let skillsScore = function (item) {
		let skillsRating = 0;
		skillsRating += item.getStatEx(sdk.stats.AddClassSkills, me.classid) * 200; // + class skills
		skillsRating += item.getStatEx(sdk.stats.AddSkillTab, Check.currentBuild().tabSkills) * 100; // + TAB skills
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

	if (!base || !base.isBaseType) return false;

	let bodyLoc = Item.getBodyLoc(base);

	// Can't use so its worse then what we already have
	if ((me.getStat(sdk.stats.Strength) < base.strreq || me.getStat(sdk.stats.Dexterity) < base.dexreq)) {
		return false;
	}

	let item = me.getItem();

	for (let i = 0; i < bodyLoc.length; i++) {
		if (item) {
			do {
				if (item.location === sdk.storage.Equipped && item.bodylocation === bodyLoc[i]) {
					equippedItem = {
						classid: item.classid,
						type: item.itemType,
						sockets: item.getStatEx(sdk.stats.NumSockets),
						name: item.name,
						tier: NTIP.GetTier(item),
						prefixnum: item.prefixnum,
						str: item.getStatEx(sdk.stats.Strength),
						dex: item.getStatEx(sdk.stats.Dexterity),
						def: item.getStatEx(sdk.stats.ArmorClass),
						eDef: item.getStatEx(sdk.stats.ArmorPercent),
						fr: item.getStatEx(sdk.stats.FireResist),
						lr: item.getStatEx(sdk.stats.LightResist),
						cr: item.getStatEx(sdk.stats.ColdResist),
						pr: item.getStatEx(sdk.stats.PoisonResist),
						minDmg: item.getStatEx(sdk.stats.MinDamage),
						maxDmg: item.getStatEx(sdk.stats.MaxDamage),
						eDmg: item.getStatEx(sdk.stats.MinDamagePercent),
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
		case sdk.locale.items.AncientsPledge:
		case sdk.locale.items.Exile:
		case sdk.locale.items.Lore:
		case sdk.locale.items.Spirit:
		case sdk.locale.items.White:
		case sdk.locale.items.Rhyme:
			preSocketCheck = true;
			break;
		default:
			break;
		}

		if (base.sockets <= 0 && !preSocketCheck) {
			return true;
		}

		if (base.sockets === equippedItem.sockets || preSocketCheck) {
			switch (equippedItem.prefixnum) {
			case sdk.locale.items.AncientsPledge:
				if (me.paladin) {
					itemsResists = (equippedItem.fr + equippedItem.cr + equippedItem.lr + equippedItem.pr) - 187;
					baseResists = base.getStat(sdk.stats.FireResist) + base.getStat(sdk.stats.LightResist) + base.getStat(sdk.stats.ColdResist) + base.getStat(sdk.stats.PoisonResist);

					if (baseResists !== itemsResists) {
						verbose && print("ÿc9BetterThanWearingCheckÿc0 :: RW(Ancient's Pledge) BaseResists: " + baseResists + " EquippedItem: " + itemsResists);

						if (baseResists < itemsResists) {	//base has lower resists. Will only get here with a paladin shield and I think maximizing resists is more important than defense
							result = false;

							break;
						}
					}
				} else {
					itemsDefense = Math.ceil((equippedItem.def / ((equippedItem.eDef + 100) / 100)));
					baseDefense = base.getStatEx(sdk.stats.Defense);

					if (baseDefense !== itemsDefense) {
						verbose && print("ÿc9BetterThanWearingCheckÿc0 :: RW(Ancient's Pledge) BaseDefense: " + baseDefense + " EquippedItem: " + itemsDefense);

						if (baseDefense < itemsDefense) {	//base has lower defense
							result = false;

							break;
						}
					}
				}
				
				break;
			case sdk.locale.items.Black:
				ED = equippedItem.eDmg > 120 ? 120 : equippedItem.eDmg;
				itemsMinDmg = Math.ceil((equippedItem.minDmg / ((ED + 100) / 100)));
				itemsMaxDmg = Math.ceil((equippedItem.maxDmg / ((ED + 100) / 100)));
				itemsTotalDmg = itemsMinDmg + itemsMaxDmg;
				baseDmg = base.getStat(sdk.stats.MinDamage) + base.getStat(sdk.stats.MaxDamage);
					
				if (baseDmg !== itemsTotalDmg) {
					verbose && print("ÿc9BetterThanWearingCheckÿc0 :: RW(Black) BaseDamage: " + baseDmg + " EquippedItem: " + itemsTotalDmg);

					if (baseDmg < itemsTotalDmg) {	//base has lower damage.
						result = false;

						break;
					}
				}

				break;
			case sdk.locale.items.CrescentMoon:
				ED = equippedItem.eDmg > 220 ? 220 : equippedItem.eDmg;
				itemsMinDmg = Math.ceil((equippedItem.minDmg / ((ED + 100) / 100)));
				itemsMaxDmg = Math.ceil((equippedItem.maxDmg / ((ED + 100) / 100)));
				itemsTotalDmg = itemsMinDmg + itemsMaxDmg;
				baseDmg = base.getStat(sdk.stats.MinDamage) + base.getStat(sdk.stats.MaxDamage);
					
				if (baseDmg !== itemsTotalDmg) {
					verbose && print("ÿc9BetterThanWearingCheckÿc0 :: RW(Crescent Moon) BaseDamage: " + baseDmg + " EquippedItem: " + itemsTotalDmg);

					if (baseDmg < itemsTotalDmg) {	//base has lower damage.
						result = false;

						break;
					}
				}

				break;
			case sdk.locale.items.Exile: 	//Exile
				itemsResists = (equippedItem.fr + equippedItem.cr + equippedItem.lr + equippedItem.pr);
				baseResists = base.getStat(sdk.stats.FireResist) + base.getStat(sdk.stats.LightResist) + base.getStat(sdk.stats.ColdResist) + base.getStat(sdk.stats.PoisonResist);

				if (baseResists !== itemsResists) {
					verbose && print("ÿc9BetterThanWearingCheckÿc0 :: RW(Exile) BaseResists: " + baseResists + " EquippedItem: " + itemsResists);

					if (baseResists < itemsResists) {	//base has lower resists. Will only get here with a paladin shield and I think maximizing resists is more important than defense
						result = false;

						break;
					}
				}

				break;
			case sdk.locale.items.Honor:
				ED = equippedItem.eDmg > 160 ? 160 : equippedItem.eDmg;
				itemsMinDmg = Math.ceil(((equippedItem.minDmg - 9) / ((ED + 100) / 100)));
				itemsMaxDmg = Math.ceil(((equippedItem.maxDmg - 9) / ((ED + 100) / 100)));
				itemsTotalDmg = itemsMinDmg + itemsMaxDmg;
				baseDmg = base.getStat(sdk.stats.MinDamage) + base.getStat(sdk.stats.MaxDamage);
					
				if (baseDmg !== itemsTotalDmg) {
					verbose && print("ÿc9BetterThanWearingCheckÿc0 :: RW(Honor) BaseDamage: " + baseDmg + " EquippedItem: " + itemsTotalDmg);

					if (baseDmg < itemsTotalDmg) {	//base has lower damage.
						result = false;

						break;
					}
				}

				break;
			case sdk.locale.items.KingsGrace:
				ED = equippedItem.eDmg > 100 ? 100 : equippedItem.eDmg;
				itemsMinDmg = Math.ceil((equippedItem.minDmg / ((ED + 100) / 100)));
				itemsMaxDmg = Math.ceil((equippedItem.maxDmg / ((ED + 100) / 100)));
				itemsTotalDmg = itemsMinDmg + itemsMaxDmg;
				baseDmg = base.getStat(sdk.stats.MinDamage) + base.getStat(sdk.stats.MaxDamage);
					
				if (baseDmg !== itemsTotalDmg) {
					verbose && print("ÿc9BetterThanWearingCheckÿc0 :: RW(King's Grace) BaseDamage: " + baseDmg + " EquippedItem: " + itemsTotalDmg);

					if (baseDmg < itemsTotalDmg) {	//base has lower damage.
						result = false;

						break;
					}
				}

				break;
			case sdk.locale.items.Lawbringer:
				ED = equippedItem.eDmg;
				itemsMinDmg = Math.ceil((equippedItem.minDmg / ((ED + 100) / 100)));
				itemsMaxDmg = Math.ceil((equippedItem.maxDmg / ((ED + 100) / 100)));
				itemsTotalDmg = itemsMinDmg + itemsMaxDmg;
				baseDmg = base.getStat(sdk.stats.MinDamage) + base.getStat(sdk.stats.MaxDamage);
					
				if (baseDmg !== itemsTotalDmg) {
					verbose && print("ÿc9BetterThanWearingCheckÿc0 :: RW(Lawbringer) BaseDamage: " + baseDmg + " EquippedItem: " + itemsTotalDmg);

					if (baseDmg < itemsTotalDmg) {	//base has lower damage.
						result = false;

						break;
					}
				}

				break;
			case sdk.locale.items.Lore:
				itemsDefense = check.getStatEx(sdk.stats.Defense);
				baseDefense = base.getStatEx(sdk.stats.Defense);
					
				if (me.barbarian || me.druid) {	//Barbarian or Druid (PrimalHelms and Pelts)
					equippedSkillsTier = skillsScore(check);
					baseSkillsTier = skillsScore(base);

					if (equippedSkillsTier !== baseSkillsTier) {
						print("ÿc9BetterThanWearingCheckÿc0 :: RW(Lore) EquippedSkillsTier: " + equippedSkillsTier + " BaseSkillsTier: " + baseSkillsTier);

						if (baseSkillsTier < equippedSkillsTier) {	//Might need to add some type of std deviation, having the skills is probably better but maybe not if in hell with a 50 defense helm
							result = false;

							break;
						}
					} else if (baseDefense !== itemsDefense) {
						verbose && print("ÿc9BetterThanWearingCheckÿc0 :: RW(Lore) BaseDefense: " + baseDefense + " EquippedItem: " + itemsDefense);

						if (baseDefense < itemsDefense) {	//base has lower defense
							result = false;

							break;
						}
					}
				} else {
					if (baseDefense !== itemsDefense) {
						verbose && print("ÿc9BetterThanWearingCheckÿc0 :: RW(Lore) BaseDefense: " + baseDefense + " EquippedItem: " + itemsDefense);

						if (baseDefense < itemsDefense) {	//base has lower defense
							result = false;

							break;
						}
					}
				}

				break;
			case sdk.locale.items.Malice:
				ED = equippedItem.eDmg > 33 ? 33 : equippedItem.eDmg;
				itemsMinDmg = Math.ceil(((equippedItem.minDmg - 9) / ((ED + 100) / 100)));
				itemsMaxDmg = Math.ceil((equippedItem.maxDmg / ((ED + 100) / 100)));
				itemsTotalDmg = itemsMinDmg + itemsMaxDmg;
				baseDmg = base.getStat(sdk.stats.MinDamage) + base.getStat(sdk.stats.MaxDamage);

				if (me.classid === sdk.charclass.Paladin) {	//Paladin TODO: See if its worth it to calculate the added damage skills would add
					equippedSkillsTier = skillsScore(check);
					baseSkillsTier = skillsScore(base);
				}
					
				if (baseDmg !== itemsTotalDmg) {
					verbose && print("ÿc9BetterThanWearingCheckÿc0 :: RW(Malice) BaseDamage: " + baseDmg + " EquippedItem: " + itemsTotalDmg);

					if (baseDmg < itemsTotalDmg) {	//base has lower damage.
						result = false;

						break;
					}
				}

				break;
			case sdk.locale.items.Rhyme:
				if (me.necromancer) {
					equippedSkillsTier = skillsScore(check);
					baseSkillsTier = skillsScore(base);

					if (equippedSkillsTier !== baseSkillsTier) {
						verbose && print("ÿc9BetterThanWearingCheckÿc0 :: RW(Rhyme) EquippedSkillsTier: " + equippedSkillsTier + " BaseSkillsTier: " + baseSkillsTier);

						if (baseSkillsTier < equippedSkillsTier) {	//Might need to add some type of std deviation, having the skills is probably better but maybe not if in hell with a 50 defense shield
							result = false;

							break;
						}
					} else if (equippedSkillsTier === baseSkillsTier) {
						baseDefense = base.getStatEx(sdk.stats.Defense);
						verbose && print("ÿc9BetterThanWearingCheckÿc0 :: RW(Rhyme) EquippedDefense: " + equippedItem.def + " BaseDefense: " + baseDefense);

						if (baseDefense < equippedItem.def) {
							result = false;

							break;
						}
					}
				} else if (me.paladin) {
					itemsResists = (equippedItem.fr + equippedItem.cr + equippedItem.lr + equippedItem.pr) - 100;
					baseResists = base.getStat(sdk.stats.FireResist) + base.getStat(sdk.stats.LightResist) + base.getStat(sdk.stats.ColdResist) + base.getStat(sdk.stats.PoisonResist);

					if (baseResists !== itemsResists) {
						verbose && print("ÿc9BetterThanWearingCheckÿc0 :: RW(Rhyme) BaseResists: " + baseResists + " equippedItem: " + itemsResists);

						if (baseResists < itemsResists) {	//base has lower resists. Will only get here with a paladin shield and I think maximizing resists is more important than defense
							result = false;

							break;
						}
					}

				}

				break;
			case sdk.locale.items.Rift:
				ED = equippedItem.eDmg;
				itemsMinDmg = Math.ceil((equippedItem.minDmg / ((ED + 100) / 100)));
				itemsMaxDmg = Math.ceil((equippedItem.maxDmg / ((ED + 100) / 100)));
				itemsTotalDmg = itemsMinDmg + itemsMaxDmg;
				baseDmg = base.getStat(sdk.stats.MinDamage) + base.getStat(sdk.stats.MaxDamage);
					
				if (baseDmg !== itemsTotalDmg) {
					verbose && print("ÿc9BetterThanWearingCheckÿc0 :: RW(Rift) BaseDamage: " + baseDmg + " EquippedItem: " + itemsTotalDmg);

					if (baseDmg < itemsTotalDmg) {	//base has lower damage.
						result = false;

						break;
					}
				}

				break;
			case sdk.locale.items.Spirit:
				if (me.paladin && bodyLoc[i] === 5) {
					itemsResists = (equippedItem.fr + equippedItem.cr + equippedItem.lr + equippedItem.pr) - 115;
					baseResists = base.getStat(sdk.stats.FireResist) + base.getStat(sdk.stats.LightResist) + base.getStat(sdk.stats.ColdResist) + base.getStat(sdk.stats.PoisonResist);
				} else {
					break;
				}

				if (baseResists !== itemsResists) {
					verbose && print("ÿc9BetterThanWearingCheckÿc0 :: RW(spirit) BaseResists: " + baseResists + " equippedItem: " + itemsResists);

					if (baseResists < itemsResists) {	//base has lower resists. Will only get here with a paladin shield and I think maximizing resists is more important than defense
						result = false;

						break;
					}
				}

				break;
			case sdk.locale.items.Steel:
				ED = equippedItem.eDmg > 20 ? 20 : equippedItem.eDmg;
				itemsMinDmg = Math.ceil(((equippedItem.minDmg - 3) / ((ED + 100) / 100)));
				itemsMaxDmg = Math.ceil(((equippedItem.maxDmg - 3) / ((ED + 100) / 100)));
				itemsTotalDmg = itemsMinDmg + itemsMaxDmg;
				baseDmg = base.getStat(sdk.stats.MinDamage) + base.getStat(sdk.stats.MaxDamage);
					
				if (baseDmg !== itemsTotalDmg) {
					verbose && print("ÿc9BetterThanWearingCheckÿc0 :: RW(Steel) BaseDamage: " + baseDmg + " EquippedItem: " + itemsTotalDmg);

					if (baseDmg < itemsTotalDmg) {	//base has lower damage.
						result = false;

						break;
					}
				}

				break;
			case sdk.locale.items.Strength:
				ED = equippedItem.eDmg > 35 ? 35 : equippedItem.eDmg;
				itemsMinDmg = Math.ceil((equippedItem.minDmg / ((ED + 100) / 100)));
				itemsMaxDmg = Math.ceil((equippedItem.maxDmg / ((ED + 100) / 100)));
				itemsTotalDmg = itemsMinDmg + itemsMaxDmg;
				baseDmg = base.getStat(sdk.stats.MinDamage) + base.getStat(sdk.stats.MaxDamage);
					
				if (baseDmg !== itemsTotalDmg) {
					verbose && print("ÿc9BetterThanWearingCheckÿc0 :: RW(Strength) BaseDamage: " + baseDmg + " EquippedItem: " + itemsTotalDmg);

					if (baseDmg < itemsTotalDmg) {	//base has lower damage.
						result = false;

						break;
					}
				}

				break;
			case sdk.locale.items.White:
				if (me.necromancer) {
					equippedSkillsTier = skillsScore(check) - 550;
					baseSkillsTier = skillsScore(base);

					if (equippedSkillsTier !== baseSkillsTier) {
						verbose && print("ÿc9BetterThanWearingCheckÿc0 :: RW(White) EquippedSkillsTier: " + equippedSkillsTier + " BaseSkillsTier: " + baseSkillsTier);

						if (baseSkillsTier < equippedSkillsTier) {
							result = false;

							break;
						}
					}
				}

				break;
			case sdk.locale.items.Smoke:
			case sdk.locale.items.Stealth:
				itemsDefense = Math.ceil((equippedItem.def / ((equippedItem.eDef + 100) / 100)));
				baseDefense = base.getStatEx(sdk.stats.Defense);

				if (baseDefense !== itemsDefense) {
					verbose && print("ÿc9BetterThanWearingCheckÿc0 :: RW(Stealth/Smoke) BaseDefense: " + baseDefense + " EquippedItem: " + itemsDefense);

					if (baseDefense < itemsDefense) {	//base has lower defense
						result = false;

						break;
					}
				}

				break;
			case sdk.locale.items.Bone:
			case sdk.locale.items.Myth:
			case sdk.locale.items.Peace:
			case sdk.locale.items.Treachery:
				let name = "";

				switch (equippedItem.prefixnum) {
				case sdk.locale.items.Bone:
					name = "Bone";
					break;
				case sdk.locale.items.Myth:
					name = "Myth";
					break;
				case sdk.locale.items.Peace:
					name = "Peace";
					break;
				case sdk.locale.items.Treachery:
					name = "Treachery";
					break;
				}

				itemsDefense = Math.ceil((equippedItem.def / ((equippedItem.eDef + 100) / 100)));
				baseDefense = base.getStatEx(sdk.stats.Defense);

				if (baseDefense !== itemsDefense) {
					verbose && print("ÿc9BetterThanWearingCheckÿc0 :: RW(" + name + ") BaseDefense: " + baseDefense + " EquippedItem: " + itemsDefense);

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
Town.worseBaseThanStashed = function (base = undefined, clearJunkCheck = false) {
	if (!base) return false;
	if (base.quality > sdk.itemquality.Superior || base.isRuneword) return false;

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
				generalScore += item.getStatEx(sdk.stats.FireResist) * 2;	// Resist
			}

			generalScore += item.getStatEx(sdk.stats.Defense) * 0.5;		// Defense
			generalScore += item.getStatEx(sdk.stats.MinDamage); // add MIN damage
			generalScore += item.getStatEx(sdk.stats.MaxDamage); // add MAX damage
			//generalScore += item.getStatEx(sdk.stats.SecondaryMinDamage); // add MIN damage
			//generalScore += item.getStatEx(sdk.stats.SecondaryMaXDamage); // add MAX damage
		}

		return generalScore;
	}

	let itemsToCheck, result = false;

	switch (base.itemType) {
	case sdk.itemtype.Shield:
	case sdk.itemtype.VoodooHeads:
	case sdk.itemtype.AuricShields:
		if (me.paladin) {
			itemsToCheck = me.getItemsEx()
				.filter(item => [sdk.itemtype.Shield, sdk.itemtype.AuricShields].indexOf(item.itemType) > -1// same item type as current
					&& item.sockets === base.sockets // sockets match junk in review
					&& [sdk.storage.Inventory, sdk.storage.Stash].indexOf(item.location) > -1
				)
				.sort((a, b) => generalScore(a) - generalScore(b))
				.last(); // select last

			if (itemsToCheck === undefined) return false;
			if (!clearJunkCheck && base.gid === itemsToCheck.gid) return true;

			if (base.sockets > 0 || itemsToCheck.sockets === base.sockets) {
				if (base.isInStorage && (generalScore(base) < generalScore(itemsToCheck) ||
						(generalScore(base) === generalScore(itemsToCheck) && base.ilvl > itemsToCheck.ilvl))) {
					Developer.debugging.junkCheck && print("ÿc9WorseBaseThanStashedÿc0 :: BaseScore: " + generalScore(base) + " itemToCheckScore: " + generalScore(itemsToCheck));

					result = true;
				}
			}
		} else if (me.necromancer) {
			itemsToCheck = me.getItemsEx()
				.filter(item => [sdk.itemtype.Shield, sdk.itemtype.VoodooHeads].indexOf(item.itemType) > -1// same item type as current
					&& item.sockets === base.sockets // sockets match junk in review
					&& [sdk.storage.Inventory, sdk.storage.Stash].indexOf(item.location) > -1 // locations
				)
				.sort((a, b) => generalScore(a) - generalScore(b)) // Sort on tier value, (better for skills)
				.last(); // select last

			if (itemsToCheck === undefined) return false;
			if (!clearJunkCheck && base.gid === itemsToCheck.gid) return true;

			if (base.sockets > 0 || itemsToCheck.sockets === base.sockets) {
				if (base.isInStorage && (generalScore(base) < generalScore(itemsToCheck))) {
					Developer.debugging.junkCheck && print("ÿc9WorseBaseThanStashedÿc0 :: BaseScore: " + generalScore(base) + " itemToCheckScore: " + generalScore(itemsToCheck));

					result = true;
				}
			}
		} else {
			itemsToCheck = me.getItemsEx()
				.filter(item =>
					item.itemType === sdk.itemType.Shield// same item type as current
					&& !item.ethereal // only noneth runeword bases
					&& item.sockets === base.sockets // sockets match junk in review
					&& [sdk.storage.Inventory, sdk.storage.Stash].indexOf(item.location) > -1 // locations
				)
				.sort((a, b) => a.getStatEx(sdk.stats.Defense) - b.getStatEx(sdk.stats.Defense)) // Sort on tier value, (better for skills)
				.last(); // select last

			if (itemsToCheck === undefined) return false;
			if (!clearJunkCheck && base.gid === itemsToCheck.gid) return true;

			if (base.sockets > 0) {
				if (base.isInStorage && !base.ethereal && (base.getStatEx(sdk.stats.Defense) < itemsToCheck.getStatEx(sdk.stats.Defense) ||
						base.getStatEx(sdk.stats.Defense) === itemsToCheck.getStatEx(sdk.stats.Defense) && base.getStatEx(sdk.stats.ArmorPercent) < itemsToCheck.getStatEx(sdk.stats.ArmorPercent))) {
					Developer.debugging.junkCheck && print("ÿc9WorseBaseThanStashedÿc0 :: BaseDefense: " + base.getStatEx(sdk.stats.Defense) + " itemToCheckDefense: " + itemsToCheck.getStatEx(sdk.stats.Defense));

					result = true;
				}
			}
		}

		break;
	case sdk.itemtype.Armor:
		itemsToCheck = me.getItemsEx()
			.filter(item =>
				item.itemType === sdk.itemtype.Armor // same item type as current
				&& !item.ethereal // only noneth runeword bases
				&& item.sockets === base.sockets // sockets match junk in review
				&& [sdk.storage.Inventory, sdk.storage.Stash].indexOf(item.location) > -1 // locations
			)
			.sort((a, b) => a.getStatEx(sdk.stats.Defense) - b.getStatEx(sdk.stats.Defense)) // Sort on tier value, (better for skills)
			.last(); // select last

		if (itemsToCheck === undefined) return false;
		if (!clearJunkCheck && base.gid === itemsToCheck.gid) return true;

		if (base.sockets > 0) {
			if (base.isInStorage && !base.ethereal && (base.getStatEx(sdk.stats.Defense) < itemsToCheck.getStatEx(sdk.stats.Defense) ||
					base.getStatEx(sdk.stats.Defense) === itemsToCheck.getStatEx(sdk.stats.Defense) && base.getStatEx(sdk.stats.ArmorPercent) < itemsToCheck.getStatEx(sdk.stats.ArmorPercent))) {
				Developer.debugging.junkCheck && print("ÿc9WorseBaseThanStashedÿc0 :: BaseDefense: " + base.getStatEx(sdk.stats.Defense) + " itemToCheckDefense: " + itemsToCheck.getStatEx(sdk.stats.Defense));

				result = true;
			}
		}

		break;
	case sdk.itemtype.Helm:
	case sdk.itemtype.PrimalHelm:
	case sdk.itemtype.Pelt:
	case sdk.itemtype.Circlet:
		if (me.barbarian || me.druid) {
			itemsToCheck = me.getItemsEx()
				.filter(item =>
					[sdk.itemtype.Helm, sdk.itemtype.Circlet, sdk.itemtype.PrimalHelm, sdk.itemtype.Pelt].indexOf(item.itemType) > -1// same item type as current
					&& item.sockets === base.sockets // sockets match junk in review
					&& [sdk.storage.Inventory, sdk.storage.Stash].indexOf(item.location) > -1 // locations
				)
				.sort((a, b) => generalScore(a) - generalScore(b)) // Sort on tier value, (better for skills)
				.last(); // select last

			if (itemsToCheck === undefined) return false;
			if (!clearJunkCheck && base.gid === itemsToCheck.gid) return true;

			if (base.sockets > 0 || itemsToCheck.sockets === base.sockets) {
				if (base.isInStorage && (generalScore(base) < generalScore(itemsToCheck) ||
						(generalScore(base) === generalScore(itemsToCheck) && base.getStatEx(sdk.stats.Defense) < itemsToCheck.getStatEx(sdk.stats.Defense)))) {
					Developer.debugging.junkCheck && print("ÿc9WorseBaseThanStashedÿc0 :: BaseScore: " + generalScore(base) + " itemToCheckScore: " + generalScore(itemsToCheck));

					result = true;
				}
			}
		} else {
			itemsToCheck = me.getItemsEx()
				.filter(item =>
					[sdk.itemtype.Helm, sdk.itemtype.Circlet].indexOf(item.itemType) > -1// same item type as current
					&& !item.ethereal // only noneth runeword bases
					&& item.sockets === base.sockets // sockets match junk in review
					&& [sdk.storage.Inventory, sdk.storage.Stash].indexOf(item.location) > -1 // locations
				)
				.sort((a, b) => a.getStatEx(sdk.stats.Defense) - b.getStatEx(sdk.stats.Defense)) // Sort on defense
				.last(); // select last

			if (itemsToCheck === undefined) return false;
			if (!clearJunkCheck && base.gid === itemsToCheck.gid) return true;

			if (base.sockets > 0 || itemsToCheck.sockets === base.sockets) {
				if (base.isInStorage && !base.ethereal && (base.getStatEx(sdk.stats.Defense) < itemsToCheck.getStatEx(sdk.stats.Defense) ||
						base.getStatEx(sdk.stats.Defense) === itemsToCheck.getStatEx(sdk.stats.Defense) && base.getStatEx(sdk.stats.ArmorPercent) < itemsToCheck.getStatEx(sdk.stats.ArmorPercent))) {
					Developer.debugging.junkCheck && print("ÿc9WorseBaseThanStashedÿc0 :: BaseDefense: " + base.getStat(31) + " itemToCheckDefense: " + itemsToCheck.getStat(sdk.stats.Defense));

					result = true;
				}
			}
		}

		break;
	case sdk.itemtype.Wand:
		if (me.necromancer) {
			itemsToCheck = me.getItemsEx()
				.filter(item =>
					[sdk.itemtype.Wand].indexOf(item.itemType) > -1// same item type as current
					&& item.sockets === base.sockets // sockets match junk in review
					&& [sdk.storage.Inventory, sdk.storage.Stash].indexOf(item.location) > -1 // locations
				)
				.sort((a, b) => generalScore(a) - generalScore(b)) // Sort on tier value, (better for skills)
				.last(); // select last

			if (itemsToCheck === undefined) return false;
			if (!clearJunkCheck && base.gid === itemsToCheck.gid) return true;

			if (base.sockets > 0 || itemsToCheck.sockets === base.sockets) {
				if (base.isInStorage && (generalScore(base) < generalScore(itemsToCheck) ||
						(generalScore(base) === generalScore(itemsToCheck) && base.ilvl > itemsToCheck.ilvl))) {
					Developer.debugging.junkCheck && print("ÿc9WorseBaseThanStashedÿc0 :: BaseScore: " + generalScore(base) + " itemToCheckScore: " + generalScore(itemsToCheck));

					result = true;
				}
			}
		}

		break;
		// Todo: Separate amazonbow/xbow
	case sdk.itemtype.Scepter:
	case sdk.itemtype.Staff:
	case sdk.itemtype.Bow:
	case sdk.itemtype.Axe:
	case sdk.itemtype.Club:
	case sdk.itemtype.Sword:
	case sdk.itemtype.Hammer:
	case sdk.itemtype.Spear:
	case sdk.itemtype.Crossbow:
	case sdk.itemtype.Mace:
	case sdk.itemtype.Orb:
	case sdk.itemtype.AmazonBow:
	case sdk.itemtype.AmazonSpear:
		if ((me.getStat(sdk.stats.Strength) < base.strreq || me.getStat(sdk.stats.Dexterity) < base.dexreq) && !me.paladin) {	// don't toss grief base
			return true; // Can't use so it's worse then what we already have
		}

		itemsToCheck = me.getItemsEx()
			.filter(item =>
				item.itemType === base.itemType// same item type as current
				&& item.sockets === base.sockets // sockets match junk in review
				&& [sdk.storage.Inventory, sdk.storage.Stash].indexOf(item.location) > -1 // locations
				&& me.getStat(sdk.stats.Strength) >= item.strreq && me.getStat(sdk.stats.Dexterity) >= item.dexreq // I have enough str/dex for this item
			)
			.sort((a, b) => generalScore(a) - generalScore(b)) // Sort on tier value, (better for skills)
			.last(); // select last

		if (itemsToCheck === undefined) {
			Developer.debugging.junkCheck && print("ÿc9WorseBaseThanStashedÿc0 :: itemsToCheck is undefined");

			return false;
		}

		if (!clearJunkCheck && base.gid === itemsToCheck.gid) {
			Developer.debugging.junkCheck && print("ÿc9WorseBaseThanStashedÿc0 :: same item");

			return true;
		}

		if (base.sockets > 0 || itemsToCheck.sockets === base.sockets) {
			if (base.isInStorage && (generalScore(base) < generalScore(itemsToCheck) ||
					(generalScore(base) === generalScore(itemsToCheck) && (Item.getQuantityOwned(base) > 2 || base.getStatEx(sdk.stats.MinDamagePercent) < itemsToCheck.getStatEx(sdk.stats.MinDamagePercent))))) {
				if (Developer.debugging.junkCheck) {
					print("ÿc9WorseBaseThanStashedÿc0 :: BaseScore: " + generalScore(base) + " itemToCheckScore: " + generalScore(itemsToCheck));
				}

				result = true;
			}
		}
		
		break;
	case sdk.itemtype.HandtoHand:
	case sdk.itemtype.AssassinClaw:
		if (me.assassin) {
			itemsToCheck = me.getItemsEx()
				.filter(item =>
					[sdk.itemtype.HandtoHand, sdk.itemtype.AssassinClaw].indexOf(item.itemType) > -1// same item type as current
					&& item.sockets === base.sockets // sockets match junk in review
					&& [sdk.storage.Inventory, sdk.storage.Stash].indexOf(item.location) > -1 // locations
				)
				.sort((a, b) => generalScore(a) - generalScore(b)) // Sort on tier value, (better for skills)
				.last(); // select last

			if (itemsToCheck === undefined) return false;
			if (!clearJunkCheck && base.gid === itemsToCheck.gid) return true;

			if (base.sockets > 0) {
				if (base.isInStorage && (generalScore(base) < generalScore(itemsToCheck))) {
					Developer.debugging.junkCheck && print("ÿc9WorseBaseThanStashedÿc0 :: BaseScore: " + generalScore(base) + " itemToCheckScore: " + generalScore(itemsToCheck));

					result = true;
				}
			}
		}

		break;
	case sdk.itemtype.Polearm:
		itemsToCheck = me.getItemsEx()
			.filter(item =>
				[sdk.itemtype.Polearm].indexOf(item.itemType) > -1// same item type as current
				&& item.sockets === base.sockets // sockets match junk in review
				&& [sdk.storage.Inventory, sdk.storage.Stash].indexOf(item.location) > -1 // locations
			)
			.sort((a, b) => (a.getStatEx(sdk.stats.SecondaryMinDamage) + a.getStatEx(sdk.stats.SecondaryMaxDamage)) - (b.getStatEx(sdk.stats.SecondaryMinDamage) + b.getStatEx(sdk.stats.SecondaryMaxDamage))) // Sort on damage, low to high.
			.last(); // select last

		if (itemsToCheck === undefined) return false;
		if (!clearJunkCheck && base.gid === itemsToCheck.gid) return true;

		if (base.sockets > 0) {
			if (base.isInStorage && (base.getStatEx(sdk.stats.SecondaryMinDamage) + base.getStatEx(sdk.stats.SecondaryMaxDamage)) < (itemsToCheck.getStatEx(sdk.stats.SecondaryMinDamage) + itemsToCheck.getStatEx(sdk.stats.SecondaryMaxDamage))) {
				Developer.debugging.junkCheck && print("ÿc9WorseBaseThanStashedÿc0 :: BaseDamage: " + (base.getStatEx(sdk.stats.SecondaryMinDamage) + base.getStatEx(sdk.stats.SecondaryMaxDamage)) + " itemToCheckDamage: " + (itemsToCheck.getStatEx(sdk.stats.SecondaryMinDamage) + itemsToCheck.getStatEx(sdk.stats.SecondaryMaxDamage)));

				result = true;
			}
		}

		break;
	default:
		Developer.debugging.junkCheck && print("ÿc9WorseBaseThanStashedÿc0 :: No itemType to check for " + base.name);

		return false;
	}

	return result;
};

Town.clearJunk = function () {
	let junkItems = me.findItems(-1, sdk.itemmode.inStorage);
	let junkToSell = [];

	if (!junkItems) return false;

	while (junkItems.length > 0) {
		let junk = junkItems.shift();
		const pickitResult = Pickit.checkItem(junk).result;

		if ((junk.isInStorage) && // stash/invo/cube
			([Pickit.result.WANTED, Pickit.result.CUBING, Pickit.result.RUNEWORD, Pickit.result.CRAFTING].indexOf(pickitResult) === -1) &&
			!AutoEquip.wanted(junk) && // Don't toss wanted auto equip items
			!Cubing.keepItem(junk) && // Don't throw cubing ingredients
			!Runewords.keepItem(junk) && // Don't throw runeword ingredients
			!CraftingSystem.keepItem(junk) && // Don't throw crafting system ingredients
			!SoloWants.keepItem(junk) && // Don't throw SoloWants system ingredients
			!Town.ignoredItemTypes.includes(junk.itemType) && // Don't drop tomes, keys or potions
			junk.sellable &&	// Don't try to sell/drop quest-items/keys/essences/tokens/organs
			([Pickit.result.UNWANTED, Pickit.result.TRASH].includes(pickitResult)) // only drop unwanted or sellable
		) {
			print("ÿc9JunkCheckÿc0 :: Junk: " + junk.name + " Pickit Result: " + pickitResult);

			!getUIFlag(sdk.uiflags.Stash) && junk.isInStash && Town.openStash();
			junk.isInCube && Cubing.emptyCube();

			if (junk.sellable && (junk.isInInventory || (Storage.Inventory.CanFit(junk) && Storage.Inventory.MoveTo(junk)))) {
				junkToSell.push(junk);

				continue;
			} else if (junk.drop()) {
				myPrint("Cleared junk - " + junk.name);
				delay(50);

				continue;
			}
		}

		if (junk.isInStorage && junk.sellable && pickitResult !== 1) {
			if (!junk.identified && !Cubing.keepItem(junk) && !CraftingSystem.keepItem(junk)) {
				print("ÿc9UnidJunkCheckÿc0 :: Junk: " + junk.name + " Junk type: " + junk.itemType + " Pickit Result: " + pickitResult);

				!getUIFlag(sdk.uiflags.Stash) && junk.isInStash && Town.openStash();
				junk.isInCube && Cubing.emptyCube();

				if (junk.isInInventory || (Storage.Inventory.CanFit(junk) && Storage.Inventory.MoveTo(junk))) {
					junkToSell.push(junk);

					continue;
				} else if (junk.drop()) {
					myPrint("Cleared unid junk - " + junk.name);
					delay(50 + me.ping);

					continue;
				}
			}

			if (junk.isRuneword && !AutoEquip.wanted(junk)) {
				!getUIFlag(sdk.uiflags.Stash) && junk.isInStash && Town.openStash();
				junk.isInCube && Cubing.emptyCube();

				print("ÿc9AutoEquipJunkCheckÿc0 :: Junk: " + junk.name + " Junk type: " + junk.itemType + " Pickit Result: " + pickitResult);

				if (junk.isInInventory || (Storage.Inventory.CanFit(junk) && Storage.Inventory.MoveTo(junk))) {
					junkToSell.push(junk);

					continue;
				} else if (junk.drop()) {
					myPrint("Cleared old runeword junk - " + junk.name);
					delay(50 + me.ping);

					continue;
				}
			}

			if (junk.isBaseType) {
				if (this.worseBaseThanStashed(junk, true)) {
					print("ÿc9WorseBaseThanStashedCheckÿc0 :: Base: " + junk.name + " Junk type: " + junk.itemType + " Pickit Result: " + pickitResult);
					
					!getUIFlag(sdk.uiflags.Stash) && junk.isInStash && Town.openStash();
					junk.isInCube && Cubing.emptyCube();

					if (junk.isInInventory || (Storage.Inventory.CanFit(junk) && Storage.Inventory.MoveTo(junk))) {
						junkToSell.push(junk);

						continue;
					} else if (junk.drop()) {
						myPrint("Cleared runeword base junk - " + junk.name);
						delay(50 + me.ping);

						continue;
					}
				}

				if (!this.betterBaseThanWearing(junk, Developer.debugging.junkCheck)) {
					print("ÿc9BetterThanWearingCheckÿc0 :: Base: " + junk.name + " Junk type: " + junk.itemType + " Pickit Result: " + pickitResult);

					!getUIFlag(sdk.uiflags.Stash) && junk.isInStash && Town.openStash();
					junk.isInCube && Cubing.emptyCube();

					if (junk.isInInventory || (Storage.Inventory.CanFit(junk) && Storage.Inventory.MoveTo(junk))) {
						junkToSell.push(junk);

						continue;
					} else if (junk.drop()) {
						myPrint("Cleared bad runeword base junk - " + junk.name);
						delay(50 + me.ping);

						continue;
					}
				}
			}
		}
	}

	if (junkToSell.length > 0) {
		myPrint("Junk items to sell: " + junkToSell.length);
		Town.initNPC("Shop", "clearInventory");

		if (getUIFlag(sdk.uiflags.Shop) || (Config.PacketShopping && getInteractedNPC() && getInteractedNPC().itemcount > 0)) {
			for (let i = 0; i < junkToSell.length; i++) {
				print("ÿc9JunkCheckÿc0 :: Sell " + junkToSell[i].name);
				Misc.itemLogger("Sold", junkToSell[i]);
				Developer.debugging.junkCheck && Misc.logItem("JunkCheck Sold", junkToSell[i]);

				junkToSell[i].sell();
				delay(50 + me.ping);
			}
		}

		me.cancelUIFlags();
	}

	return true;
};

Town.needRepair = function () {
	let quiver, quantity, inventoryQuiver;
	let repairAction = [];
	let canAfford = me.gold >= me.getRepairCost();

	// Arrow/Bolt check
	let bowCheck = Attack.usingBow();

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
			quantity = quiver.getStat(sdk.stats.Quantity);

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
