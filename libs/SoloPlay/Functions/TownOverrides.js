/**
*  @filename    TownOverrides.js
*  @author      theBGuy
*  @desc        Town related functions
*
*/

includeIfNotIncluded("common/Town.js");

let Overrides = require("../../modules/Override");
let PotData = require("../modules/PotData");

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

Town.sell = [];
// Removed Missle Potions for easy gold
// Items that won't be stashed
Town.ignoredItemTypes = [
	sdk.items.type.BowQuiver, sdk.items.type.CrossbowQuiver, sdk.items.type.Book,
	sdk.items.type.Scroll, sdk.items.type.Key, sdk.items.type.HealingPotion,
	sdk.items.type.ManaPotion, sdk.items.type.RejuvPotion, sdk.items.type.StaminaPotion,
	sdk.items.type.AntidotePotion, sdk.items.type.ThawingPotion
];

Town.systemsKeep = function (item) {
	return (AutoEquip.wanted(item) || Cubing.keepItem(item) || Runewords.keepItem(item) || CraftingSystem.keepItem(item) || SoloWants.keepItem(item));
};

Town.needForceID = function (item) {
	const result = Pickit.checkItem(item);
	return ([Pickit.Result.WANTED, Pickit.Result.CUBING].includes(result.result) && !item.identified && AutoEquip.hasTier(item));
};

Town.needPotions = function () {
	// we aren't using MinColumn if none of the values are set
	if (!Config.MinColumn.some(el => el > 0)) return false;
	// no hp pots or mp pots in Config.BeltColumn (who uses only rejuv pots?)
	if (!Config.BeltColumn.some(el => ["hp", "mp"].includes(el))) return false;
	
	// Start
	if (me.charlvl > 2 && me.gold > 1000) {
		let pots = { hp: [], mp: [], };
		me.getItemsEx(-1, sdk.items.mode.inBelt)
			.filter(p => [sdk.items.type.HealingPotion, sdk.items.type.ManaPotion].includes(p.itemType) && p.x < 4)
			.forEach(p => {
				if (p.itemType === sdk.items.type.HealingPotion) {
					pots.hp.push(copyUnit(p));
				} else if (p.itemType === sdk.items.type.ManaPotion) {
					pots.mp.push(copyUnit(p));
				}
			});

		// quick check
		if ((Config.BeltColumn.includes("hp") && !pots.hp.length)
			|| (Config.BeltColumn.includes("mp") && !pots.mp.length)) {
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

Town.buyPotions = function () {
	// Ain't got money fo' dat shyt
	if (me.gold < 450 || !me.getItem(sdk.items.TomeofTownPortal)) return false;

	let [needPots, needBuffer] = [false, true];
	let buffer = { hp: 0, mp: 0 };

	this.clearBelt();
	const beltSize = Storage.BeltSize();
	let col = this.checkColumns(beltSize);

	// HP/MP Buffer
	if (Config.HPBuffer > 0 || Config.MPBuffer > 0) {
		me.getItemsEx().filter(function (p) {
			return p.isInInventory && [sdk.items.type.HealingPotion, sdk.items.type.ManaPotion].includes(p.itemType);
		}).forEach(function (p) {
			switch (p.itemType) {
			case sdk.items.type.HealingPotion:
				buffer.hp++;

				break;
			case sdk.items.type.ManaPotion:
				buffer.mp++;

				break;
			}
		});
	}

	// Check if we need to buy potions based on Config.MinColumn
	for (let i = 0; i < 4; i += 1) {
		if (["hp", "mp"].includes(Config.BeltColumn[i]) && col[i] > (beltSize - Math.min(Config.MinColumn[i], beltSize))) {
			needPots = true;
		}
	}

	// Check if we need any potions for buffers
	if (buffer.mp < Config.MPBuffer || buffer.hp < Config.HPBuffer) {
		for (let i = 0; i < 4; i += 1) {
			// We can't buy potions because they would go into belt instead
			if (col[i] >= beltSize && (!needPots || Config.BeltColumn[i] === "rv")) {
				needBuffer = false;

				break;
			}
		}
	}

	// We have enough potions in inventory
	(buffer.mp >= Config.MPBuffer && buffer.hp >= Config.HPBuffer) && (needBuffer = false);

	// No columns to fill
	if (!needPots && !needBuffer) return true;
	// todo: buy the cheaper potions if we are low on gold or don't need the higher ones i.e have low mana/health pool
	// why buy potion that heals 225 (greater mana) if we only have sub 100 mana
	me.normal && me.highestAct >= 4 && me.act < 4 && this.goToTown(4);

	let highestPot = 5;
	let npc = this.initNPC("Shop", "buyPotions");
	if (!npc) return false;

	// only do this if we are low on gold in the first place
	if (me.gold < Config.LowGold) {
		const mpPotsEffects = PotData.getMpPots().map(el => el.effect[me.classid]);
		const hpPotsEffects = PotData.getHpPots().map(el => el.effect[me.classid]);

		let wantedHpPot = (hpPotsEffects.findIndex(eff => me.hpmax / 2 < eff) + 1 || hpPotsEffects.length - 1);
		let wantedMpPot = (mpPotsEffects.findIndex(eff => me.mpmax / 2 < eff) + 1 || mpPotsEffects.length - 1);
		console.debug("Wanted hpPot: " + wantedHpPot + " Wanted mpPot: " + wantedMpPot);
	}

	for (let i = 0; i < 4; i += 1) {
		if (col[i] > 0) {
			let useShift = this.shiftCheck(col, beltSize);
			let pot = this.getPotion(npc, Config.BeltColumn[i], highestPot);

			if (pot) {
				//print("ÿc2column ÿc0" + i + "ÿc2 needs ÿc0" + col[i] + " ÿc2potions");
				// Shift+buy will trigger if there's no empty columns or if only the current column is empty
				if (useShift) {
					pot.buy(true);
				} else {
					for (let j = 0; j < col[i]; j += 1) {
						pot.buy(false);
					}
				}
			}
		}

		col = this.checkColumns(beltSize); // Re-initialize columns (needed because 1 shift-buy can fill multiple columns)
	}

	const buyHPBuffers = () => {
		if (needBuffer && buffer.hp < Config.HPBuffer) {
			for (let i = 0; i < Config.HPBuffer - buffer.hp; i += 1) {
				let pot = this.getPotion(npc, "hp");
				!!pot && Storage.Inventory.CanFit(pot) && pot.buy(false);
			}
		}
	};
	const buyMPBuffers = () => {
		if (needBuffer && buffer.mp < Config.MPBuffer) {
			for (let i = 0; i < Config.MPBuffer - buffer.mp; i += 1) {
				let pot = this.getPotion(npc, "mp");
				!!pot && Storage.Inventory.CanFit(pot) && pot.buy(false);
			}
		}
	};
	// priortize mana pots
	if (Check.currentBuild().caster) {
		buyMPBuffers();
		buyHPBuffers();
	} else {
		buyHPBuffers();
		buyMPBuffers();
	}

	// keep cold/pois res high with potions
	if (me.gold > 50000 && npc.getItem(sdk.items.ThawingPotion)) {
		CharData.buffData.thawing.need() && Town.buyPots(12, "thawing", true);
		CharData.buffData.antidote.need() && Town.buyPots(12, "antidote", true);
	}

	return true;
};

Town.haveItemsToSell = function () {
	Town.sell = Town.sell.filter(i => i && i.isInStorage);
	return Town.sell.length;
};

Town.sellItems = function (itemList = []) {
	!itemList.length && (itemList = Town.sell);

	if (this.initNPC("Shop", "sell")) {
		while (itemList.length) {
			let item = itemList.shift();
			if (!item.isInStorage) continue;

			try {
				if (getUIFlag(sdk.uiflags.Shop) || getUIFlag(sdk.uiflags.NPCMenu)) {
					console.log("sell " + item.name);
					Misc.itemLogger("Sold", item);
					item.sell();
					delay(100);
				}
			} catch (e) {
				console.error(e);
			}
		}
	}

	return !itemList.length;
};

Town.fillTome = function (classid) {
	if (me.gold < 450) return false;
	let have = this.checkScrolls(classid);
	if (have >= (me.charlvl < 12 ? 5 : 13)) return true;

	let npc = this.initNPC("Shop", "fillTome");
	if (!npc) return false;

	delay(500);

	if (classid === sdk.items.TomeofTownPortal && !me.findItem(sdk.items.TomeofTownPortal, sdk.items.mode.inStorage, sdk.storage.Inventory)) {
		let tome = npc.getItem(sdk.items.TomeofTownPortal);

		if (tome && Storage.Inventory.CanFit(tome)) {
			try {
				tome.buy();
			} catch (e1) {
				console.warn(e1.message ? e1.message : e1);
				// Couldn't buy the tome, don't spam the scrolls
				return false;
			}
		} else {
			return false;
		}
	}

	let scroll = npc.getItem(classid === sdk.items.TomeofTownPortal ? sdk.items.ScrollofTownPortal : sdk.items.ScrollofIdentify);
	if (!scroll) return false;

	try {
		if (me.gold < 5000) {
			let myTome = me.getItem(sdk.items.TomeofTownPortal);
			if (myTome) {
				while (myTome.getStat(sdk.stats.Quantity) < 5 && me.gold > 500) {
					scroll = npc.getItem(classid === sdk.items.TomeofTownPortal ? sdk.items.ScrollofTownPortal : sdk.items.ScrollofIdentify);
					scroll && Packet.buyScroll(scroll, myTome, false);
					delay(50);
				}
			}
		} else {
			scroll.buy(true);
		}
	} catch (e2) {
		console.warn(e2.message ? e2.message : e2);

		return false;
	}

	return true;
};

// need to build task list then do them.
// This way we can look ahead to see if there is a task thats going to be done at the current npc like buyPots and just go ahead and do it
Town.townTasks = function (buyPots = {}) {
	const extraTasks = Object.assign({}, {
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
		Skill.cast(sdk.skills.BurstofSpeed, sdk.skills.hand.Right);
	}

	const preAct = me.act;

	me.switchWeapons(Attack.getPrimarySlot());
	Quest.unfinishedQuests();
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
	AutoEquip.runAutoEquip();
	Mercenary.hireMerc();
	Item.autoEquipMerc();
	Town.haveItemsToSell() && Town.sellItems() && me.cancelUIFlags();
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
	const extraTasks = Object.assign({}, {
		thawing: false,
		antidote: false,
		stamina: false,
	}, buyPots);

	delay(250);

	console.info(true);
	console.time("doChores");

	!me.inTown && Town.goToTown();

	// Burst of speed while in town
	if (Skill.canUse(sdk.skills.BurstofSpeed) && !me.getState(sdk.states.BurstofSpeed)) {
		Skill.cast(sdk.skills.BurstofSpeed, sdk.skills.hand.Right);
	}

	const preAct = me.act;

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
	AutoEquip.runAutoEquip();
	Mercenary.hireMerc();
	Item.autoEquipMerc();
	Town.haveItemsToSell() && Town.sellItems() && me.cancelUIFlags();
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
	console.info(false, null, "doChores");
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

Town.itemResult = function (item, result, system = "", sell = false) {
	let timer = 0;
	sell && !getInteractedNPC() && (sell = false);

	switch (result.result) {
	case Pickit.Result.WANTED:
		Misc.itemLogger("Kept", item);
		Misc.logItem("Kept", item, result.line);
		system === "Field" && Item.autoEquipCheck(item) && Item.autoEquip("Field");

		break;
	case Pickit.Result.UNID:
		// At low level its not worth keeping these items until we can Id them it just takes up too much room
		if (sell && me.charlvl < 10 && item.magic && item.classid !== sdk.items.SmallCharm) {
			Misc.itemLogger("Sold", item);
			item.sell();
		}

		break;
	case Pickit.Result.CUBING:
		Misc.itemLogger("Kept", item, "Cubing-" + system);
		Cubing.update();

		break;
	case Pickit.Result.RUNEWORD:
		break;
	case Pickit.Result.CRAFTING:
		Misc.itemLogger("Kept", item, "CraftSys-" + system);
		CraftingSystem.update(item);

		break;
	case Pickit.Result.SOLOWANTS:
		Misc.itemLogger("Kept", item, "SoloWants-" + system);
		SoloWants.update(item);

		break;
	default:
		if (!item.sellable || !sell) return;

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
};

Town.cainID = function (force = false) {
	if ((!Config.CainID.Enable && !force) || !Misc.checkQuest(sdk.quest.id.TheSearchForCain, sdk.quest.states.Completed)) return false;

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
			// Force ID for unid items matching autoEquip/cubing criteria
			Town.needForceID(item) && (result.result = -1);

			switch (result.result) {
			case Pickit.Result.TRASH:
				try {
					console.log("sell " + item.name);
					this.initNPC("Shop", "clearInventory");
					Misc.itemLogger("Sold", item);
					item.sell();
				} catch (e) {
					console.warn(e);
				}

				break;
			case Pickit.Result.WANTED:
				Misc.itemLogger("Kept", item);
				Misc.logItem("Kept", item, result.line);

				break;
			case Pickit.Result.CUBING:
				Misc.itemLogger("Kept", item, "Cubing-Town");
				Cubing.update();

				break;
			case Pickit.Result.RUNEWORD: // (doesn't trigger normally)
				break;
			case Pickit.Result.CRAFTING:
				Misc.itemLogger("Kept", item, "CraftSys-Town");
				CraftingSystem.update(item);

				break;
			case Pickit.Result.SOLOWANTS:
				Misc.itemLogger("Kept", item, "SoloWants-Town");
				SoloWants.update(item);

				break;
			default:
				if ((getUIFlag(sdk.uiflags.Shop) || getUIFlag(sdk.uiflags.NPCMenu)) && (item.getItemCost(sdk.items.cost.ToSell) <= 1 || !item.sellable)) {
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
			case Pickit.Result.UNID:
				if (tome) {
					this.identifyItem(item, tome);
				} else {
					let scroll = npc.getItem(sdk.items.ScrollofIdentify);

					if (scroll) {
						if (!Storage.Inventory.CanFit(scroll)) {
							tpTome = me.findItem(sdk.items.TomeofTownPortal, sdk.items.mode.inStorage, sdk.storage.Inventory);

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

					scroll = me.findItem(sdk.items.ScrollofIdentify, sdk.items.mode.inStorage, sdk.storage.Inventory);

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
		// Force ID for unid items matching autoEquip/cubing criteria
		Town.needForceID(item) && (result.result = -1);

		// unid item that should be identified
		if (result.result === Pickit.Result.UNID) {
			this.identifyItem(item, idTool, Config.FieldID.PacketID);
			delay(50);
			result = Pickit.checkItem(item);
		}
		Town.itemResult(item, result, "Field", false);
	}

	delay(200);
	me.cancel();

	return true;
};

Town.identify = function () {
	if (me.gold < 5000 && this.cainID(true)) return true;
	
	let scroll;
	let list = (Storage.Inventory.Compare(Config.Inventory) || []);

	if (!list.length) return false;
	
	// Avoid unnecessary NPC visits
	// Only unid items or sellable junk (low level) should trigger a NPC visit
	if (!list.some(item => {
		let identified = item.identified;
		return (!identified && ([Pickit.Result.UNID, Pickit.Result.TRASH].includes(Pickit.checkItem(item).result) || (!identified && AutoEquip.hasTier(item))));
	})) {
		return false;
	}

	let npc = this.initNPC("Shop", "identify");
	if (!npc) return false;

	let tome = me.findItem(sdk.items.TomeofIdentify, sdk.items.mode.inStorage, sdk.storage.Inventory);
	tome && tome.getStat(sdk.stats.Quantity) < list.length && this.fillTome(sdk.items.TomeofIdentify);

	MainLoop:
	while (list.length > 0) {
		let item = list.shift();

		if (!this.ignoredItemTypes.includes(item.itemType) && item.location === sdk.storage.Inventory && !item.identified) {
			let result = Pickit.checkItem(item);
			// Force ID for unid items matching autoEquip/cubing criteria
			Town.needForceID(item) && (result.result = -1);

			switch (result.result) {
			// Items for gold, will sell magics, etc. w/o id, but at low levels
			// magics are often not worth iding.
			case Pickit.Result.TRASH:
				Misc.itemLogger("Sold", item);
				item.sell();

				break;
			case Pickit.Result.UNID:
				let idTool = Town.getIdTool();

				if (idTool) {
					this.identifyItem(item, idTool);
				} else {
					scroll = npc.getItem(sdk.items.ScrollofIdentify);

					if (scroll) {
						if (!Storage.Inventory.CanFit(scroll)) {
							let tpTome = me.findItem(sdk.items.TomeofTownPortal, sdk.items.mode.inStorage, sdk.storage.Inventory);

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

					scroll = me.findItem(sdk.items.ScrollofIdentify, sdk.items.mode.inStorage, sdk.storage.Inventory);

					if (!scroll) {
						break MainLoop;
					}

					this.identifyItem(item, scroll);
				}

				result = Pickit.checkItem(item);
				Town.itemResult(item, result, "TownId", true);

				break;
			}
		}
	}

	this.fillTome(sdk.items.TomeofTownPortal); // Check for TP tome in case it got sold for ID scrolls

	return true;
};

// credit isid0re
Town.buyBook = function () {
	if (me.findItem(sdk.items.TomeofTownPortal, sdk.items.mode.inStorage, sdk.storage.Inventory)) return true;
	if (me.gold < 500) return false;

	let npc = this.initNPC("Shop", "buyTpTome");
	if (!npc) return false;

	delay(500);

	let tpBook = npc.getItem(sdk.items.TomeofTownPortal);
	let tpScroll = npc.getItem(sdk.items.ScrollofTownPortal);

	if (tpBook && me.gold >= tpBook.getItemCost(sdk.items.cost.ToBuy) && Storage.Inventory.CanFit(tpBook)) {
		try {
			if (tpBook.buy()) {
				console.log("ÿc9BuyBookÿc0 :: bought Tome of Town Portal");
				this.fillTome(sdk.items.TomeofTownPortal);
			}
		} catch (e1) {
			console.warn(e1);

			return false;
		}
	} else {
		if (tpScroll && me.gold >= tpScroll.getItemCost(sdk.items.cost.ToBuy) && Storage.Inventory.CanFit(tpScroll)) {
			try {
				tpScroll.buy() && console.log("ÿc9BuyBookÿc0 :: bought Scroll of Town Portal");
			} catch (e1) {
				console.warn(e1);
				return false;
			}
		}
	}

	return true;
};

Town.lastShopped = {
	who: "",
	tick: 0,
};

// todo - allow earlier shopping, mainly to get a belt
Town.shopItems = function () {
	if (!Config.MiniShopBot) return true;
	// todo - better gold scaling
	const goldLimit = [10000, 20000, 30000][me.diff];
	if (me.gold < goldLimit) return true;

	let npc = getInteractedNPC();
	if (!npc || !npc.itemcount) return false;

	let items = npc.getItemsEx()
		.filter((item) => Town.ignoredItemTypes.indexOf(item.itemType) === -1)
		.sort((a, b) => NTIP.GetTier(b) - NTIP.GetTier(a));
	if (!items.length) return false;
	if (getTickCount() - Town.lastShopped.tick < Time.seconds(3) && Town.lastShopped.who === npc.name) return false;

	console.time("shopItems");
	let bought = 0;
	const haveMerc = (!me.classic && Config.UseMerc && !me.mercrevivecost && Misc.poll(() => !!me.getMerc(), 500, 100));
	console.info(true, "ÿc4MiniShopBotÿc0: Scanning " + npc.itemcount + " items.");

	const shopReport = (item, action, result, tierInfo) => {
		action === undefined && (action = "");
		tierInfo === undefined && (tierInfo = "");
		console.log("ÿc8Kolbot-SoloPlayÿc0: " + action + (tierInfo ? " " + tierInfo : ""));
		Misc.itemLogger(action, item);
		Developer.debugging.autoEquip && Misc.logItem("Shopped " + action, item, result.line !== undefined ? result.line : "null");
	};

	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		const result = Pickit.checkItem(item);
		const myGold = me.gold;
		const itemCost = item.getItemCost(sdk.items.cost.ToBuy);

		// no tier'ed items
		if (result.result === Pickit.Result.WANTED && NTIP.CheckItem(item, NTIP_CheckListNoTier, true).result !== Pickit.Result.UNWANTED) {
			try {
				if (Storage.Inventory.CanFit(item) && myGold >= itemCost && (myGold - itemCost > goldLimit)) {
					if (item.isBaseType) {
						if (Town.betterThanStashed(item) && Town.betterBaseThanWearing(item, Developer.debugging.junkCheck)) {
							shopReport(item, "better base", result.line);
							item.buy() && bought++;

							continue;
						}
					} else {
						shopReport(item, "NoTier", result.line);
						item.buy() && bought++;

						continue;
					}
				}
			} catch (e) {
				console.error(e);
			}
		}

		// tier'ed items - // todo re-write this so we don't buy multiple items just to equip one then sell the rest back
		if (result.result === Pickit.Result.WANTED && AutoEquip.wanted(item)) {
			try {
				if (Storage.Inventory.CanFit(item) && myGold >= itemCost && (myGold - itemCost > goldLimit)) {
					if (Item.hasTier(item) && Item.autoEquipCheck(item)) {
						try {
							shopReport(item, "AutoEquip", result.line, (item.fname + " Tier: " + NTIP.GetTier(item)));
							item.buy() && bought++;
							Item.autoEquip("InShop");
						} catch (e) {
							console.error(e);
						}

						continue;
					}

					if (haveMerc && Item.hasMercTier(item) && Item.autoEquipCheckMerc(item)) {
						shopReport(item, "AutoEquipMerc", result.line, (item.fname + " Tier: " + NTIP.GetMercTier(item)));
						item.buy() && bought++;

						continue;
					}

					if (Item.hasSecondaryTier(item) && Item.autoEquipCheckSecondary(item)) {
						try {
							shopReport(item, "AutoEquip Switch Shopped", result.line, (item.fname + " SecondaryTier: " + NTIP.GetSecondaryTier(item)));
							item.buy() && bought++;
							Item.autoEquip("InShop");
						} catch (e) {
							console.error(e);
						}

						continue;
					}
				}
			} catch (e) {
				console.error(e);
			}
		}

		delay(2);
	}

	Town.lastShopped.tick = getTickCount();
	Town.lastShopped.who = npc.name;

	console.info(false, "Bought " + bought + " items", "shopItems");

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

	let items = me.findItems(-1, sdk.items.mode.inStorage, sdk.storage.Inventory);

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

				items[i].buy(false, true);

				let newItem = this.getGambledItem(list);

				if (newItem) {
					let result = Pickit.checkItem(newItem);

					switch (result.result) {
					case Pickit.Result.WANTED:
						Misc.itemLogger("Gambled", newItem);
						Misc.logItem("Gambled", newItem, result.line);
						list.push(newItem.gid);

						break;
					case Pickit.Result.CUBING:
						list.push(newItem.gid);
						Cubing.update();

						break;
					case Pickit.Result.CRAFTING:
						CraftingSystem.update(newItem);

						break;
					default:
						Misc.itemLogger("Sold", newItem, "Gambling");
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

new Overrides.Override(Town, Town.drinkPots, function(orignal, type) {
	let objDrank = orignal(type, false);
	
	if (objDrank.potName) {
		let objID = objDrank.potName.split(" ")[0].toLowerCase();

		if (objID) {
			// non-english version
			(!CharData.buffData[objID]) && (objID = type.toLowerCase());

			if (!CharData.buffData[objID].active() || CharData.buffData[objID].timeLeft() <= 0) {
				CharData.buffData[objID].tick = getTickCount();
				CharData.buffData[objID].duration = objDrank.quantity * 30 * 1000;
			} else {
				CharData.buffData[objID].duration += (objDrank.quantity * 30 * 1000) - (getTickCount() - CharData.buffData[objID].tick);
			}

			console.log("ÿc9DrinkPotsÿc0 :: drank " + objDrank.quantity + " " + objDrank.potName + "s. Timer [" + Developer.formatTime(CharData.buffData[objID].duration) + "]");
		}
	}

	return true;
}).apply();

Town.canStash = function (item) {
	if (this.ignoredItemTypes.includes(item.itemType)
		|| [sdk.items.quest.HoradricStaff, sdk.items.quest.KhalimsWill].includes(item.classid)
		|| (item.isCharm && Item.autoEquipCharmCheck(item))) {
		return false;
	}

	!Storage.Stash.CanFit(item) && this.sortStash(true);

	return Storage.Stash.CanFit(item);
};

Town.stash = function (stashGold = true) {
	if (!this.needStash()) return true;
	me.cancel();

	let items = Storage.Inventory.Compare(Config.Inventory);

	if (items) {
		for (let i = 0; i < items.length; i += 1) {
			const item = items[i];
			if (this.canStash(item)) {
				const pickResult = Pickit.checkItem(item).result;
				let result = (() => {
					switch (true) {
					case pickResult > Pickit.Result.UNWANTED && pickResult < Pickit.Result.TRASH:
					case Town.systemsKeep(item):
					case AutoEquip.wanted(item) && pickResult === Pickit.Result.UNWANTED: // wanted but can't use yet
					case !item.sellable: // quest/essences/keys/ect
						return true;
					default:
						return false;
					}
				})();

				if (result) {
					Misc.itemLogger("Stashed", item);
					Storage.Stash.MoveTo(item);
				}
			}
		}
	}

	// Stash gold
	if (stashGold) {
		if (me.getStat(sdk.stats.Gold) >= Config.StashGold && me.getStat(sdk.stats.GoldBank) < 25e5 && this.openStash()) {
			gold(me.getStat(sdk.stats.Gold), 3);
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
	console.log("ÿc8Start ÿc0:: ÿc8clearInventory");
	let clearInvoTick = getTickCount();
	
	// If we are at an npc already, open the window otherwise moving potions around fails
	if (getUIFlag(sdk.uiflags.NPCMenu) && !getUIFlag(sdk.uiflags.Shop)) {
		try {
			!!getInteractedNPC() && Misc.useMenu(sdk.menu.Trade);
		} catch (e) {
			console.error(e);
			me.cancelUIFlags();
		}
	}
		
	// Remove potions in the wrong slot of our belt
	this.clearBelt();

	// Return potions from inventory to belt
	let potsInInventory;
	const beltSize = Storage.BeltSize();
	// belt 4x4 locations
	/**
	* 12 13 14 15
	* 8  9  10 11
	* 4  5  6  7
	* 0  1  2  3
	*/
	const beltMax = (beltSize * 4);
	const beltCapRef = [(0 + beltMax), (1 + beltMax), (2 + beltMax), (3 + beltMax)];

	// check if we have empty belt slots
	let needCleanup = Town.checkColumns(beltSize).some(slot => slot > 0);

	if (needCleanup) {
		potsInInventory = me.getItemsEx()
			.filter((p) => p.isInInventory && [sdk.items.type.HealingPotion, sdk.items.type.ManaPotion, sdk.items.type.RejuvPotion].includes(p.itemType))
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
						p.toCursor(true) && new PacketBuilder().byte(sdk.packets.send.ItemToBelt).dword(p.gid).dword(x).send();
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
			sdk.items.type.HealingPotion, sdk.items.type.ManaPotion, sdk.items.type.RejuvPotion,
			sdk.items.type.ThawingPotion, sdk.items.type.AntidotePotion, sdk.items.type.StaminaPotion
		].includes(p.itemType));

	if (potsInInventory.length > 0) {
		let hp = [], mp = [], rv = [], specials = [];
		potsInInventory.forEach(function (p) {
			if (!p || p === undefined) return false;

			switch (p.itemType) {
			case sdk.items.type.HealingPotion:
				return (hp.push(copyUnit(p)));
			case sdk.items.type.ManaPotion:
				return (mp.push(copyUnit(p)));
			case sdk.items.type.RejuvPotion:
				return (rv.push(copyUnit(p)));
			case sdk.items.type.ThawingPotion:
			case sdk.items.type.AntidotePotion:
			case sdk.items.type.StaminaPotion:
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
	const ignoreTypes = [
		sdk.items.type.Book, sdk.items.type.Key, sdk.items.type.HealingPotion, sdk.items.type.ManaPotion, sdk.items.type.RejuvPotion
	];
	let items = (Storage.Inventory.Compare(Config.Inventory) || [])
		.filter(function (item) {
			if (!item) return false;
			if (ignoreTypes.indexOf(item.itemType) === -1 && item.sellable && !Town.systemsKeep(item)) {
				return true;
			}
			return false;
		});

	let sell = [];
	const classItemType = (item) => [
		sdk.items.type.Wand, sdk.items.type.VoodooHeads, sdk.items.type.AuricShields, sdk.items.type.PrimalHelm, sdk.items.type.Pelt
	].includes(item.itemType);

	items.length > 0 && items.forEach(function (item) {
		let result = Pickit.checkItem(item).result;

		if ([Pickit.Result.UNWANTED, Pickit.Result.TRASH].indexOf(result) === -1) {
			if ((item.isBaseType && item.sockets > 0) || (classItemType(item) && item.normal && item.sockets === 0)) {
				if (!Town.betterThanStashed(item) && !Town.betterBaseThanWearing(item, Developer.debugging.junkCheck)) {
					result = 4;
				}
			}
		}

		!item.identified && (result = -1);
		[Pickit.Result.UNWANTED, Pickit.Result.TRASH].includes(result) && sell.push(item);
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
			console.error(e);
		}
	});

	console.log("ÿc8Exit clearInventory ÿc0- ÿc7Duration: ÿc0" + Time.format(getTickCount() - clearInvoTick));

	return true;
};

const baseSkillsScore = (item, buildInfo) => {
	buildInfo === undefined && (buildInfo = Check.currentBuild());
	let generalScore = 0;
	let selectedWeights = [30, 20];
	let selectedSkills = [buildInfo.wantedSkills, buildInfo.usefulSkills];
	generalScore += item.getStatEx(sdk.stats.AddClassSkills, me.classid) * 200; // + class skills
	generalScore += item.getStatEx(sdk.stats.AddSkillTab, buildInfo.tabSkills) * 100; // + TAB skills - todo handle array of tab skills

	for (let i = 0; i < selectedWeights.length; i++) {
		for (let j = 0; j < selectedSkills.length; j++) {
			for (let k = 0; k < selectedSkills[j].length; k++) {
				generalScore += item.getStatEx(107, selectedSkills[j][k]) * selectedWeights[i];
			}
		}
	}
	return generalScore;
};

// TODO: clean this up (sigh) - 8/10/22 - update refactored alot, still think more can be done though
Town.betterBaseThanWearing = function (base = undefined, verbose = true) {
	if (!base || !base.isBaseType) return false;

	let name = "";
	let itemsResists, baseResists, itemsTotalDmg, baseDmg, itemsDefense, baseDefense;
	let baseSkillsTier, equippedSkillsTier;
	let result = false, preSocketCheck = false;
	let bodyLoc = Item.getBodyLoc(base);

	const checkNoSockets = (item) => [
		sdk.locale.items.AncientsPledge, sdk.locale.items.Exile, sdk.locale.items.Lore, sdk.locale.items.White, sdk.locale.items.Rhyme
	].includes(item.prefixnum) || (item.prefixnum === sdk.locale.items.Spirit && item.getItemType() === "Shield");
	const getRes = (item) => item.getStatEx(sdk.stats.FireResist) + item.getStatEx(sdk.stats.LightResist) + item.getStatEx(sdk.stats.ColdResist) + item.getStatEx(sdk.stats.PoisonResist);
	const getDmg = (item) => item.getStatEx(sdk.stats.MinDamage) + item.getStatEx(sdk.stats.MaxDamage);
	const getRealDmg = (item, maxED = 0, minOffset = 0, maxOffset = 0) => {
		let ED = item.getStatEx(sdk.stats.EnhancedDamage);
		ED > maxED && (ED = maxED);
		let itemsMinDmg = Math.ceil(((item.getStatEx(sdk.stats.MinDamage) - minOffset) / ((ED + 100) / 100)));
		let itemsMaxDmg = Math.ceil(((item.getStatEx(sdk.stats.MaxDamage) - maxOffset) / ((ED + 100) / 100)));
		return (itemsMinDmg + itemsMaxDmg);
	};
	const getDef = (item) => item.getStatEx(sdk.stats.Defense);
	const getRealDef = (item, maxEDef) => {
		let ED = item.getStatEx(sdk.stats.ArmorPercent);
		ED > maxEDef && (ED = maxEDef);
		return (Math.ceil((item.getStatEx(sdk.stats.Defense) / ((ED + 100) / 100))));
	};
	const resCheck = (baseResists, itemsResists) => {
		verbose && console.log("ÿc9BetterThanWearingCheckÿc0 :: RW(" + name + ") BaseResists: " + baseResists + " EquippedItem: " + itemsResists);
		return (baseResists > itemsResists);
	};
	const defCheck = (itemsDefense, baseDefense) => {
		verbose && console.log("ÿc9BetterThanWearingCheckÿc0 :: RW(" + name + ") BaseDefense: " + baseDefense + " EquippedItem: " + itemsDefense);
		return (baseDefense > itemsDefense);
	};
	const dmgCheck = (itemsTotalDmg, baseDmg) => {
		verbose && console.log("ÿc9BetterThanWearingCheckÿc0 :: RW(" + name + ") BaseDamage: " + baseDmg + " EquippedItem: " + itemsTotalDmg);
		return (baseDmg > itemsTotalDmg);
	};

	// @todo - betterThanMercUsing check for now just keep merc items
	if ([sdk.items.type.Polearm, sdk.items.type.Spear].includes(base.itemType) || ([sdk.items.type.Armor].includes(base.itemType) && base.ethereal)) return true;
	// Can't use so its worse then what we already have
	if ((Check.finalBuild().maxStr < base.strreq || Check.finalBuild().maxDex < base.dexreq)) {
		console.log("ÿc9BetterThanWearingCheckÿc0 :: " + base.name + " has to high stat requirments strReq: " + base.strreq + " dexReq " + base.dexreq);
		return false;
	}
	// don't toss pb base crescent moon/HoJ/Grief
	if (base.classid === sdk.items.PhaseBlade && [3, 4, 5].includes(base.sockets)) return true;

	let items = me.getItemsEx().filter(i => i.isEquipped && bodyLoc.includes(i.bodylocation));

	for (let i = 0; i < bodyLoc.length; i++) {
		let equippedItem = items.find(item => item.bodylocation === bodyLoc[i]);
		if (!equippedItem || !equippedItem.runeword || NTIP.GetTier(equippedItem) >= NTIP.MAX_TIER) {
			if (i === 0 && bodyLoc.length > 1) continue;
			return true;
		}
		name = getLocaleString(equippedItem.prefixnum);

		preSocketCheck = checkNoSockets(equippedItem);
		if (base.sockets === 0 && !preSocketCheck) return true;

		if (base.sockets === equippedItem.sockets || preSocketCheck) {
			switch (equippedItem.prefixnum) {
			case sdk.locale.items.AncientsPledge:
				if (me.paladin) {
					[itemsResists, baseResists] = [(getRes(equippedItem) - 187), getRes(base)];
					if (baseResists !== itemsResists && resCheck(baseResists, itemsResists)) return true;
				} else {
					[itemsDefense, baseDefense] = [getRealDef(equippedItem, 50), getDef(base)];
					if (baseDefense !== itemsDefense && defCheck(itemsDefense, baseDefense)) return true;
				}
				
				break;
			case sdk.locale.items.Black:
				[itemsTotalDmg, baseDmg] = [getRealDmg(equippedItem, 120), getDmg(base)];
				if (baseDmg !== itemsTotalDmg && dmgCheck(itemsTotalDmg, baseDmg)) return true;

				break;
			case sdk.locale.items.CrescentMoon:
				[itemsTotalDmg, baseDmg] = [getRealDmg(equippedItem, 220), getDmg(base)];
				if (baseDmg !== itemsTotalDmg && dmgCheck(itemsTotalDmg, baseDmg)) return true;

				break;
			case sdk.locale.items.Exile:
				[itemsResists, baseResists] = [getRes(equippedItem), getRes(base)];
				if (baseResists !== itemsResists && resCheck(baseResists, itemsResists)) return true;

				break;
			case sdk.locale.items.Honor:
				[itemsTotalDmg, baseDmg] = [getRealDmg(equippedItem, 160, 9, 9), getDmg(base)];
				if (baseDmg !== itemsTotalDmg && dmgCheck(itemsTotalDmg, baseDmg)) return true;

				break;
			case sdk.locale.items.KingsGrace:
				[itemsTotalDmg, baseDmg] = [getRealDmg(equippedItem, 100), getDmg(base)];
				if (baseDmg !== itemsTotalDmg && dmgCheck(itemsTotalDmg, baseDmg)) return true;

				break;
			case sdk.locale.items.Lawbringer:
				[itemsTotalDmg, baseDmg] = [getRealDmg(equippedItem), getDmg(base)];
				if (baseDmg !== itemsTotalDmg && dmgCheck(itemsTotalDmg, baseDmg)) return true;

				break;
			case sdk.locale.items.Lore:
				[itemsDefense, baseDefense] = [getRealDef(equippedItem), getDef(base)];
					
				if (me.barbarian || me.druid) {
					// (PrimalHelms and Pelts)
					[equippedSkillsTier, baseSkillsTier] = [baseSkillsScore(equippedItem), baseSkillsScore(base)];

					verbose && console.log("ÿc9BetterThanWearingCheckÿc0 :: RW(Lore) EquippedSkillsTier: " + equippedSkillsTier + " BaseSkillsTier: " + baseSkillsTier);
					if (equippedSkillsTier !== baseSkillsTier) {
						// Might need to add some type of std deviation, having the skills is probably better but maybe not if in hell with a 50 defense helm
						return (baseSkillsTier > equippedSkillsTier);
					} else if (baseDefense !== itemsDefense) {
						verbose && console.log("ÿc9BetterThanWearingCheckÿc0 :: RW(Lore) BaseDefense: " + baseDefense + " EquippedItem: " + itemsDefense);
						return (baseDefense > itemsDefense);
					}
				} else {
					if (baseDefense !== itemsDefense && defCheck(itemsDefense, baseDefense)) return true;
				}

				break;
			case sdk.locale.items.Malice:
				[itemsTotalDmg, baseDmg] = [getRealDmg(equippedItem, 33, 9), getDmg(base)];

				if (me.paladin) {
					// Paladin TODO: See if its worth it to calculate the added damage skills would add
					[equippedSkillsTier, baseSkillsTier] = [baseSkillsScore(equippedItem), baseSkillsScore(base)];
				}

				if (baseDmg !== itemsTotalDmg && dmgCheck(itemsTotalDmg, baseDmg)) return true;

				break;
			case sdk.locale.items.Rhyme:
				if (me.necromancer) {
					[equippedSkillsTier, baseSkillsTier] = [baseSkillsScore(equippedItem), baseSkillsScore(base)];

					if (equippedSkillsTier !== baseSkillsTier) {
						verbose && console.log("ÿc9BetterThanWearingCheckÿc0 :: RW(Rhyme) EquippedSkillsTier: " + equippedSkillsTier + " BaseSkillsTier: " + baseSkillsTier);
						// Might need to add some type of std deviation, having the skills is probably better but maybe not if in hell with a 50 defense shield
						if (baseSkillsTier > equippedSkillsTier) return true;
					} else if (equippedSkillsTier === baseSkillsTier) {
						[itemsDefense, baseDefense] = [getRealDef(equippedItem), getDef(base)];
						if (baseDefense !== itemsDefense && defCheck(itemsDefense, baseDefense)) return true;
					}
				} else if (me.paladin) {
					[itemsResists, baseResists] = [(getRes(equippedItem) - 100), getRes(base)];
					if (baseResists !== itemsResists && resCheck(baseResists, itemsResists)) return true;
				}

				break;
			case sdk.locale.items.Rift:
				[itemsTotalDmg, baseDmg] = [getRealDmg(equippedItem), getDmg(base)];
				if (baseDmg !== itemsTotalDmg && dmgCheck(itemsTotalDmg, baseDmg)) return true;

				break;
			case sdk.locale.items.Spirit:
				if (!me.paladin || bodyLoc[i] !== sdk.body.LeftArm || base.getItemType() !== "Shield") return true;
				
				[itemsResists, baseResists] = [(getRes(equippedItem) - 115), getRes(base)];
				if (baseResists !== itemsResists && resCheck(baseResists, itemsResists)) return true;

				break;
			case sdk.locale.items.Steel:
				[itemsTotalDmg, baseDmg] = [getRealDmg(equippedItem, 20, 3, 3), getDmg(base)];
				if (baseDmg !== itemsTotalDmg && dmgCheck(itemsTotalDmg, baseDmg)) return true;

				break;
			case sdk.locale.items.Strength:
				[itemsTotalDmg, baseDmg] = [getRealDmg(equippedItem, 35, 9, 9), getDmg(base)];
				if (baseDmg !== itemsTotalDmg && dmgCheck(itemsTotalDmg, baseDmg)) return true;

				break;
			case sdk.locale.items.White:
				if (me.necromancer) {
					[equippedSkillsTier, baseSkillsTier] = [(baseSkillsScore(equippedItem) - 550), baseSkillsScore(base)];

					if (equippedSkillsTier !== baseSkillsTier) {
						verbose && console.log("ÿc9BetterThanWearingCheckÿc0 :: RW(White) EquippedSkillsTier: " + equippedSkillsTier + " BaseSkillsTier: " + baseSkillsTier);
						if (baseSkillsTier > equippedSkillsTier) return true;
					}
				}

				break;
			case sdk.locale.items.Stone:
				[itemsDefense, baseDefense] = [getRealDef(equippedItem, 290), getDef(base)];
				if (baseDefense !== itemsDefense && defCheck(itemsDefense, baseDefense)) return true;

				break;
			case sdk.locale.items.Smoke:
				[itemsDefense, baseDefense] = [getRealDef(equippedItem, 75), getDef(base)];
				if (baseDefense !== itemsDefense && defCheck(itemsDefense, baseDefense)) return true;

				break;
			case sdk.locale.items.Prudence:
				[itemsDefense, baseDefense] = [getRealDef(equippedItem, 170), getDef(base)];
				if (baseDefense !== itemsDefense && defCheck(itemsDefense, baseDefense)) return true;

				break;
			case sdk.locale.items.Gloom:
				[itemsDefense, baseDefense] = [getRealDef(equippedItem, 260), getDef(base)];
				if (baseDefense !== itemsDefense && defCheck(itemsDefense, baseDefense)) return true;

				break;
			case sdk.locale.items.Fortitude:
				[itemsDefense, baseDefense] = [getRealDef(equippedItem, 200), getDef(base)];
				if (baseDefense !== itemsDefense && defCheck(itemsDefense, baseDefense)) return true;

				break;
			case sdk.locale.items.Enlightenment:
				[itemsDefense, baseDefense] = [getRealDef(equippedItem, 30), getDef(base)];
				if (baseDefense !== itemsDefense && defCheck(itemsDefense, baseDefense)) return true;

				break;
			case sdk.locale.items.Duress:
				[itemsDefense, baseDefense] = [getRealDef(equippedItem, 200), getDef(base)];
				if (baseDefense !== itemsDefense && defCheck(itemsDefense, baseDefense)) return true;

				break;
			case sdk.locale.items.ChainsofHonor:
				[itemsDefense, baseDefense] = [getRealDef(equippedItem, 70), getDef(base)];
				if (baseDefense !== itemsDefense && defCheck(itemsDefense, baseDefense)) return true;

				break;
			case sdk.locale.items.Bramble:
			case sdk.locale.items.Bone:
			case sdk.locale.items.Dragon:
			case sdk.locale.items.Enigma:
			case sdk.locale.items.Lionheart:
			case sdk.locale.items.Myth:
			case sdk.locale.items.Peace:
			case sdk.locale.items.Principle:
			case sdk.locale.items.Rain:
			case sdk.locale.items.Stealth:
			case sdk.locale.items.Treachery:
			case sdk.locale.items.Wealth:
				[itemsDefense, baseDefense] = [getRealDef(equippedItem), getDef(base)];
				if (baseDefense !== itemsDefense && defCheck(itemsDefense, baseDefense)) return true;

				break;
			default:
				// Runeword base isn't in the list, keep the base
				return true;
			}
		}
	}
		
	return result;
};

Town.betterThanStashed = function (base) {
	if (!base || base.quality > sdk.items.quality.Superior || base.isRuneword) return false;
	if (base.sockets === 0 && getBaseStat("items", base.classid, "gemsockets") <= 1) return false;
	if (base.sockets === 1) return false;

	const defenseScore = (item) => ({
		def: item.getStatEx(sdk.stats.Defense),
		eDef: item.getStatEx(sdk.stats.ArmorPercent)
	});

	const dmgScore = (item) => ({
		dmg: Math.round((item.getStatEx(sdk.stats.MinDamagePercent) + item.getStatEx(sdk.stats.MaxDamagePercent)) / 2),
		twoHandDmg: Math.round((item.getStatEx(sdk.stats.SecondaryMinDamage) + item.getStatEx(sdk.stats.SecondaryMaxDamage)) / 2),
		eDmg: item.getStatEx(sdk.stats.EnhancedDamage)
	});

	const generalScore = (item) => {
		const buildInfo = Check.currentBuild();
		let generalScore = baseSkillsScore(item, buildInfo);
		
		if (generalScore === 0) {
			// should take into account other skills that would be helpful for the current build
			me.paladin && (generalScore += item.getStatEx(sdk.stats.FireResist) * 2);
			generalScore += item.getStatEx(sdk.stats.Defense) * 0.5;

			if (!buildInfo.caster) {
				let dmg = dmgScore(item);
				generalScore += (dmg.dmg + dmg.eDmg);
			}
		}

		return generalScore;
	};

	/**
	 * @todo - better comparison for socketed items to unsocketed items
	 *   - should compare items with same sockets
	 *   - should compare some items (wands, voodooheads, primalhelms, pelts) with no sockets to ones with sockets
	 *   - should be able to compare regular items to class items and take into account the max amount of sockets an item can have
	 * 
	 */
	function getItemToCompare (itemtypes = [], eth = null, sort = (a, b) => a - b) {
		return me.getItemsEx(-1, sdk.items.mode.inStorage)
			.filter(item =>
				itemtypes.includes(item.itemType)
				&& ((item.sockets === base.sockets) || (item.sockets > base.sockets))
				&& (eth === null || item.ethereal === eth))
			.sort(sort)
			.last();
	}

	const defenseSort = (a, b) => {
		let [aDef, bDef] = [a.getStatEx(sdk.stats.Defense), b.getStatEx(sdk.stats.Defense)];
		if (aDef !== bDef) return aDef - bDef;
		return a.getStatEx(sdk.stats.ArmorPercent) - b.getStatEx(sdk.stats.ArmorPercent);
	};

	const generalScoreSort = (a, b) => {
		let [aScore, bScore] = [generalScore(a), generalScore(b)];
		if (aScore !== bScore) return aScore - bScore;
		let [aSoc, bSoc] = [a.sockets, b.sockets];
		if (aSoc !== bSoc) return aSoc - bSoc;
		if (a.getItemType() !== "Weapon" && aScore === bScore) {
			let [aDef, bDef] = [a.getStatEx(sdk.stats.Defense), b.getStatEx(sdk.stats.Defense)];
			if (aDef !== bDef) return aDef - bDef;
			if (aDef === bDef) a.getStatEx(sdk.stats.ArmorPercent) - b.getStatEx(sdk.stats.ArmorPercent);
		}
		return a.sockets - b.sockets;
	};

	const twoHandDmgSort = (a, b) => {
		let [aDmg, bDmg] = [dmgScore(a), dmgScore(b)];
		if (aDmg.twoHandDmg !== bDmg.twoHandDmg) return aDmg.twoHandDmg - bDmg.twoHandDmg;
		return aDmg.eDmg - bDmg.eDmg;
	};

	const defenseScoreCheck = (base, itemToCheck) => {
		let [defScoreBase, defScoreItem] = [defenseScore(base), defenseScore(itemToCheck)];
		console.log("ÿc9betterThanStashedÿc0 :: BaseScore: ", defScoreBase, " itemToCheckScore: ", defScoreItem);
		if (defScoreBase.def > defScoreItem.def || (defScoreBase.def === defScoreItem.def && (defScoreBase.eDef > defScoreItem.eDef || base.ilvl > itemToCheck.ilvl))) {
			return true;
		}
		return false;
	};

	const damageScoreCheck = (base, itemToCheck) => {
		let [gScoreBase, gScoreCheck] = [generalScore(base), generalScore(itemToCheck)];
		console.log("ÿc9betterThanStashedÿc0 :: BaseScore: " + generalScore(base) + " itemToCheckScore: " + generalScore(itemToCheck));
		switch (true) {
		case (gScoreBase > gScoreCheck || (gScoreBase === gScoreCheck && base.ilvl > itemToCheck.ilvl)):
		case (me.barbarian && (gScoreBase === gScoreCheck && Item.getQuantityOwned(base) < 2)):
		case (me.assassin && !Check.currentBuild().caster && (gScoreBase === gScoreCheck && Item.getQuantityOwned(base) < 2)):
			return true;
		}
		return false;
	};

	const generalScoreCheck = (base, itemToCheck) => {
		let [gScoreBase, gScoreCheck] = [generalScore(base), generalScore(itemToCheck)];
		console.log("ÿc9betterThanStashedÿc0 :: BaseScore: " + generalScore(base) + " itemToCheckScore: " + generalScore(itemToCheck));
		if (gScoreBase > gScoreCheck) return true;
		if (base.getItemType() === "Shield" && gScoreBase === gScoreCheck) return defenseScoreCheck(base, itemToCheck);
		return false;
	};

	let itemsToCheck;

	switch (base.itemType) {
	case sdk.items.type.Shield:
	case sdk.items.type.AuricShields:
	case sdk.items.type.VoodooHeads:
		if (me.paladin || me.necromancer) {
			let iType = [sdk.items.type.Shield];
			me.necromancer ? iType.push(sdk.items.type.VoodooHeads) : iType.push(sdk.items.type.AuricShields);
			
			itemsToCheck = getItemToCompare(iType, false, generalScoreSort);
			if (itemsToCheck === undefined || itemsToCheck.gid === base.gid) return true;

			return (base.isInStorage ? generalScoreCheck(base, itemsToCheck) : false);
		}

		if (base.ethereal || base.sockets === 0) return false;
		itemsToCheck = getItemToCompare([sdk.items.type.Shield], false, defenseSort);
		if (itemsToCheck === undefined || itemsToCheck.gid === base.gid) return true;
		
		return (base.isInStorage ? defenseScoreCheck(base, itemsToCheck) : false);
	case sdk.items.type.Armor:
		if (base.ethereal || base.sockets === 0) return false;
		itemsToCheck = getItemToCompare([sdk.items.type.Armor], false, defenseSort);
		if (itemsToCheck === undefined || itemsToCheck.gid === base.gid) return true;
		
		return (base.isInStorage ? defenseScoreCheck(base, itemsToCheck) : false);
	case sdk.items.type.Helm:
	case sdk.items.type.PrimalHelm:
	case sdk.items.type.Circlet:
	case sdk.items.type.Pelt:
		if (me.barbarian || me.druid) {
			let iType = [sdk.items.type.Helm, sdk.items.type.Circlet];
			me.druid ? iType.push(sdk.items.type.Pelt) : iType.push(sdk.items.type.PrimalHelm);
			
			itemsToCheck = getItemToCompare(iType, false, generalScoreSort);
			if (itemsToCheck === undefined || itemsToCheck.gid === base.gid) return true;

			return (base.isInStorage ? generalScoreCheck(base, itemsToCheck) : false);
		}

		if (base.ethereal || base.sockets === 0) return false;
		itemsToCheck = getItemToCompare([sdk.items.type.Helm, sdk.items.type.Circlet], false, defenseSort);
		if (itemsToCheck === undefined || itemsToCheck.gid === base.gid) return true;
		
		return (base.isInStorage ? defenseScoreCheck(base, itemsToCheck) : false);
	case sdk.items.type.Wand:
		if (!me.necromancer) return false;

		itemsToCheck = getItemToCompare([sdk.items.type.Wand], null, generalScoreSort);
		if (itemsToCheck === undefined || itemsToCheck.gid === base.gid) return true;
		return (base.isInStorage ? generalScoreCheck(base, itemsToCheck) : false);
	case sdk.items.type.Scepter:
	case sdk.items.type.Staff:
	case sdk.items.type.Bow:
	case sdk.items.type.Axe:
	case sdk.items.type.Club:
	case sdk.items.type.Sword:
	case sdk.items.type.Hammer:
	case sdk.items.type.Knife:
	case sdk.items.type.Spear:
	case sdk.items.type.Crossbow:
	case sdk.items.type.Mace:
	case sdk.items.type.Orb:
	case sdk.items.type.AmazonBow:
	case sdk.items.type.AmazonSpear:
		// don't toss grief base
		// Can't use so it's worse then what we already have
		// todo - need better solution to know what the max stats are for our current build and wanted final build
		// update - 8/8/2022 - checks final build stat requirements but still need a better check
		// don't keep an item if we are only going to be able to use it when we get to our final build but also sometimes like paladin making grief
		// we need the item to get to our final build but won't actually be able to use it till then so we can't just use max current build str/dex
		if ((Check.finalBuild().maxStr < base.strreq || Check.finalBuild().maxDex < base.dexreq)) return false;
		// need better solution for comparison based on what runeword can be made in a base type
		// should allow comparing multiple item types given they are all for the same runeword
		itemsToCheck = getItemToCompare([base.itemType], false, generalScoreSort);
		if (itemsToCheck === undefined || itemsToCheck.gid === base.gid) return true;

		return (base.isInStorage ? damageScoreCheck(base, itemsToCheck) : false);
	case sdk.items.type.HandtoHand:
	case sdk.items.type.AssassinClaw:
		if (!me.assassin) return false;

		itemsToCheck = getItemToCompare([sdk.items.type.HandtoHand, sdk.items.type.AssassinClaw], false, generalScoreSort);
		if (itemsToCheck === undefined || itemsToCheck.gid === base.gid) return true;

		return (base.isInStorage ? damageScoreCheck(base, itemsToCheck) : false);
	case sdk.items.type.Polearm:
		itemsToCheck = getItemToCompare([sdk.items.type.Polearm], null, twoHandDmgSort);
		if (itemsToCheck === undefined || itemsToCheck.gid === base.gid) return true;

		if (base.isInStorage && base.sockets > 0) {
			let [baseDmg, itemCheckDmg] = [dmgScore(base), dmgScore(itemsToCheck)];
			switch (true) {
			case (baseDmg.twoHandDmg > itemCheckDmg.twoHandDmg):
			case ((baseDmg.twoHandDmg === itemCheckDmg.twoHandDmg) && (baseDmg.eDmg > itemCheckDmg.eDmg)):
			case ((baseDmg.twoHandDmg === itemCheckDmg.twoHandDmg) && (baseDmg.eDmg === itemCheckDmg.eDmg) && base.ilvl > itemToCheck.ilvl):
				console.log("ÿc9betterThanStashedÿc0 :: BaseScore: ", baseDmg, " itemToCheckScore: ", itemCheckDmg);
				return true;
			}
		}

		break;
	}

	return false;
};

Town.clearJunk = function () {
	let junkItems = me.getItemsEx().filter(i => i.isInStorage && !Town.ignoredItemTypes.includes(i.itemType) && i.sellable);
	if (!junkItems.length) return false;

	let [totalJunk, junkToSell, junkToDrop] = [[], [], []];
	const getToItem = (str = "", item = null) => {
		if (!getUIFlag(sdk.uiflags.Stash) && item.isInStash && !Town.openStash()) {
			throw new Error("ÿc9" + str + "ÿc0 :: Failed to get " + item.name + " from stash");
		}
		if (item.isInCube && !Cubing.emptyCube()) throw new Error("ÿc9" + str + "ÿc0 :: Failed to remove " + item.name + " from cube");
		return true;
	};

	while (junkItems.length > 0) {
		const junk = junkItems.shift();
		const pickitResult = Pickit.checkItem(junk).result;

		try {
			if ([Pickit.Result.UNWANTED, Pickit.Result.TRASH].includes(pickitResult) && !Town.systemsKeep(junk)) {
				console.log("ÿc9JunkCheckÿc0 :: Junk: " + junk.name + " Pickit Result: " + pickitResult);
				getToItem("JunkCheck", junk) && totalJunk.push(junk);

				continue;
			}

			if (pickitResult !== Pickit.Result.WANTED) {
				if (!junk.identified && !Cubing.keepItem(junk) && !CraftingSystem.keepItem(junk) && junk.quality < sdk.items.quality.Set) {
					console.log("ÿc9UnidJunkCheckÿc0 :: Junk: " + junk.name + " Junk type: " + junk.itemType + " Pickit Result: " + pickitResult);
					getToItem("UnidJunkCheck", junk) && totalJunk.push(junk);

					continue;
				}
			}

			if (junk.isRuneword && !AutoEquip.wanted(junk)) {
				console.log("ÿc9AutoEquipJunkCheckÿc0 :: Junk: " + junk.name + " Junk type: " + junk.itemType + " Pickit Result: " + pickitResult);
				getToItem("AutoEquipJunkCheck", junk) && totalJunk.push(junk);
					
				continue;
			}

			if (junk.isBaseType) {
				if (!Town.betterThanStashed(junk)) {
					console.log("ÿc9BetterThanStashedCheckÿc0 :: Base: " + junk.name + " Junk type: " + junk.itemType + " Pickit Result: " + pickitResult);
					getToItem("BetterThanStashedCheck", junk) && totalJunk.push(junk);

					continue;
				}

				if (!Town.betterBaseThanWearing(junk, Developer.debugging.junkCheck)) {
					console.log("ÿc9BetterThanWearingCheckÿc0 :: Base: " + junk.name + " Junk type: " + junk.itemType + " Pickit Result: " + pickitResult);
					getToItem("BetterThanWearingCheck", junk) && totalJunk.push(junk);

					continue;
				}
			}
		} catch (e) {
			console.warn(e.message ? e.message : e);
		}
	}

	if (totalJunk.length > 0) {
		totalJunk
			.sort((a, b) => b.getItemCost(sdk.items.cost.ToSell) - a.getItemCost(sdk.items.cost.ToSell))
			.forEach(junk => {
				if (junk.isInInventory || (Storage.Inventory.CanFit(junk) && Storage.Inventory.MoveTo(junk))) {
					junkToSell.push(junk);
				} else {
					junkToDrop.push(junk);
				}
			});
		
		myPrint("Junk items to sell: " + junkToSell.length);
		Town.initNPC("Shop", "clearInventory");

		if (getUIFlag(sdk.uiflags.Shop) || (Config.PacketShopping && getInteractedNPC() && getInteractedNPC().itemcount > 0)) {
			for (let i = 0; i < junkToSell.length; i++) {
				console.log("ÿc9JunkCheckÿc0 :: Sell " + junkToSell[i].name);
				Misc.itemLogger("Sold", junkToSell[i]);
				Developer.debugging.junkCheck && Misc.logItem("JunkCheck Sold", junkToSell[i]);

				junkToSell[i].sell();
				delay(100);
			}
		}

		me.cancelUIFlags();

		for (let i = 0; i < junkToDrop.length; i++) {
			console.log("ÿc9JunkCheckÿc0 :: Drop " + junkToDrop[i].name);
			Misc.itemLogger("Sold", junkToDrop[i]);
			Developer.debugging.junkCheck && Misc.logItem("JunkCheck Sold", junkToDrop[i]);

			junkToDrop[i].drop();
			delay(100);
		}
	}

	return true;
};

Town.needRepair = function () {
	let bowCheck = Attack.usingBow();
	let repairAction = [];
	let canAfford = me.gold >= me.getRepairCost();

	if (bowCheck) {
		let [quiver, inventoryQuiver] = (() => {
			switch (bowCheck) {
			case "crossbow":
				return [me.getItem("cqv", sdk.items.mode.Equipped), me.getItem("cqv")];
			default:
			case "bow":
				return [me.getItem("aqv", sdk.items.mode.Equipped), me.getItem("aqv")];
			}
		})();

		// Out of arrows/bolts
		if (!quiver) {
			inventoryQuiver ? Item.equip(inventoryQuiver, 5) : repairAction.push("buyQuiver") && repairAction.push("buyQuiver");
		} else {
			let quantity = quiver.getStat(sdk.stats.Quantity);

			if (typeof quantity === "number" && quantity * 100 / getBaseStat("items", quiver.classid, "maxstack") <= Config.RepairPercent) {
				inventoryQuiver ? Item.equip(inventoryQuiver, 5) : repairAction.push("buyQuiver") && repairAction.push("buyQuiver");
			}
		}
	}

	// Repair durability/quantity/charges
	if (canAfford && this.getItemsForRepair(Config.RepairPercent, true).length > 0) {
		repairAction.push("repair");
	}

	return repairAction;
};
