/**
*  @filename    TownOverrides.js
*  @author      theBGuy
*  @desc        Town related functions
*
*/

/**
 * @todo
 *  - Town things should be broken up as this is kinda cluttered
 *  - Maybe have TownUtilites, TownChecks, and Town?
 *  - some of these functions might be better as part of me. Example Town.getTpTool -> me.getTpTool makes more sense
 */

includeIfNotIncluded("core/Town.js");

new Overrides.Override(Town, Town.drinkPots, function(orignal, type) {
	const objDrank = orignal(type, false);
	const pots = {};
	pots[sdk.items.StaminaPotion] = "stamina";
	pots[sdk.items.AntidotePotion] = "antidote";
	pots[sdk.items.ThawingPotion] = "thawing";
	
	try {
		if (objDrank.potName) {
			let objID = objDrank.potName.split(" ")[0].toLowerCase();

			if (objID) {
				// non-english version
				if (!CharData.buffData[objID]) {
					typeof type === "number" ? (objID = pots[objID]) : (objID = type.toLowerCase());
				}

				if (!CharData.buffData[objID].active() || CharData.buffData[objID].timeLeft() <= 0) {
					CharData.buffData[objID].tick = getTickCount();
					CharData.buffData[objID].duration = objDrank.quantity * 30 * 1000;
				} else {
					CharData.buffData[objID].duration += (objDrank.quantity * 30 * 1000) - (getTickCount() - CharData.buffData[objID].tick);
				}

				console.log("ÿc9DrinkPotsÿc0 :: drank " + objDrank.quantity + " " + objDrank.potName + "s. Timer [" + Tracker.formatTime(CharData.buffData[objID].duration) + "]");
			}
		}
	} catch (e) {
		console.error(e);
		return false;
	}

	return true;
}).apply();

// ugly for now but proxy the functions I moved to Me.js in case somewhere the base functions are being used
Town.getIdTool = () => me.getIdTool();
Town.getTpTool = () => me.getTpTool();
Town.needPotions = () => me.needPotions();
Town.fieldID = () => me.fieldID();
Town.getItemsForRepair = (repairPercent, chargedItems) => me.getItemsForRepair(repairPercent, chargedItems);
Town.needRepair = () => me.needRepair();

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

Town.haveItemsToSell = function () {
	Town.sell = Town.sell.filter(i => i && i.isInStorage);
	return Town.sell.length;
};

Town.buyPotions = function () {
	// Ain't got money fo' dat shyt
	if (me.gold < 450 || !me.getItem(sdk.items.TomeofTownPortal)) return false;

	this.clearBelt();
	const buffer = { hp: 0, mp: 0 };
	const beltSize = Storage.BeltSize();
	let [needPots, needBuffer, specialCheck] = [false, true, false];
	let col = this.checkColumns(beltSize);

	const getNeededBuffer = () => {
		[buffer.hp, buffer.mp] = [0, 0];
		me.getItemsEx().filter(function (p) {
			return p.isInInventory && [sdk.items.type.HealingPotion, sdk.items.type.ManaPotion].includes(p.itemType);
		}).forEach(function (p) {
			switch (p.itemType) {
			case sdk.items.type.HealingPotion:
				return (buffer.hp++);
			case sdk.items.type.ManaPotion:
				return (buffer.mp++);
			}
			return false;
		});
	};

	// HP/MP Buffer
	(Config.HPBuffer > 0 || Config.MPBuffer > 0) && getNeededBuffer();

	// Check if we need to buy potions based on Config.MinColumn
	if (Config.BeltColumn.some((c, i) => ["hp", "mp"].includes(c) && col[i] > (beltSize - Math.min(Config.MinColumn[i], beltSize)))) {
		needPots = true;
	}

	// Check if we need any potions for buffers
	if (buffer.mp < Config.MPBuffer || buffer.hp < Config.HPBuffer) {
		if (Config.BeltColumn.some((c, i) => col[i] >= beltSize && (!needPots || c === "rv"))) {
			specialCheck = true;
		}
	}

	// We have enough potions in inventory
	(buffer.mp >= Config.MPBuffer && buffer.hp >= Config.HPBuffer) && (needBuffer = false);

	// No columns to fill
	if (!needPots && !needBuffer) return true;
	// todo: buy the cheaper potions if we are low on gold or don't need the higher ones i.e have low mana/health pool
	// why buy potion that heals 225 (greater mana) if we only have sub 100 mana
	let [wantedHpPot, wantedMpPot] = [5, 5];
	// only do this if we are low on gold in the first place
	if (me.normal && me.gold < Config.LowGold) {
		const mpPotsEffects = PotData.getMpPots().map(el => el.effect[me.classid]);
		const hpPotsEffects = PotData.getHpPots().map(el => el.effect[me.classid]);

		wantedHpPot = (hpPotsEffects.findIndex(eff => me.hpmax / 2 < eff) + 1 || hpPotsEffects.length - 1);
		wantedMpPot = (mpPotsEffects.findIndex(eff => me.mpmax / 2 < eff) + 1 || mpPotsEffects.length - 1);
		console.debug("Wanted hpPot: " + wantedHpPot + " Wanted mpPot: " + wantedMpPot);
	}

	if (me.normal && me.highestAct >= 4) {
		let pAct = Math.max(wantedHpPot, wantedMpPot);
		pAct >= 4 ? me.act < 4 && this.goToTown(4) : pAct > me.act && this.goToTown(pAct);
	}

	let npc = this.initNPC("Shop", "buyPotions");
	if (!npc) return false;

	// special check, sometimes our rejuv slot is empty but we do still need buffer. Check if we can buy something to slot there
	if (specialCheck && Config.BeltColumn.some((c, i) => c === "rv" && col[i] >= beltSize)) {
		let pots = [sdk.items.ThawingPotion, sdk.items.AntidotePotion, sdk.items.StaminaPotion];
		Config.BeltColumn.forEach((c, i) => {
			if (c === "rv" && col[i] >= beltSize && pots.length) {
				let usePot = pots[0];
				let pot = npc.getItem(usePot);
				if (pot) {
					Storage.Inventory.CanFit(pot) && Packet.buyItem(pot, false);
					pot = me.getItemsEx(usePot, sdk.items.mode.inStorage).filter(i => i.isInInventory).first();
					!!pot && Packet.placeInBelt(pot, i);
					pots.shift();
				} else {
					needBuffer = false; // we weren't able to find any pots to buy
				}
			}
		});
	}

	for (let i = 0; i < 4; i += 1) {
		if (col[i] > 0) {
			const useShift = this.shiftCheck(col, beltSize);
			const wantedPot = Config.BeltColumn[i] === "hp" ? wantedHpPot : wantedMpPot;
			let pot = this.getPotion(npc, Config.BeltColumn[i], wantedPot);

			if (pot) {
				// print("ÿc2column ÿc0" + i + "ÿc2 needs ÿc0" + col[i] + " ÿc2potions");
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

	// re-check
	!needBuffer && (Config.HPBuffer > 0 || Config.MPBuffer > 0) && getNeededBuffer();

	const buyHPBuffers = () => {
		if (needBuffer && buffer.hp < Config.HPBuffer) {
			for (let i = 0; i < Config.HPBuffer - buffer.hp; i += 1) {
				let pot = this.getPotion(npc, "hp", wantedHpPot);
				!!pot && Storage.Inventory.CanFit(pot) && pot.buy(false);
			}
		}
		return true;
	};
	const buyMPBuffers = () => {
		if (needBuffer && buffer.mp < Config.MPBuffer) {
			for (let i = 0; i < Config.MPBuffer - buffer.mp; i += 1) {
				let pot = this.getPotion(npc, "mp", wantedMpPot);
				!!pot && Storage.Inventory.CanFit(pot) && pot.buy(false);
			}
		}
		return true;
	};
	// priortize mana pots if caster
	Check.currentBuild().caster ? buyMPBuffers() && buyHPBuffers() : buyHPBuffers() && buyMPBuffers();

	// keep cold/pois res high with potions
	if (me.gold > 50000 && npc.getItem(sdk.items.ThawingPotion)) {
		CharData.buffData.thawing.need() && Town.buyPots(12, "thawing", true);
		CharData.buffData.antidote.need() && Town.buyPots(12, "antidote", true);
	}

	return true;
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
					Item.logger("Sold", item);
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

Town.checkScrolls = function (id, force = false) {
	let tome = me.findItem(id, sdk.items.mode.inStorage, sdk.storage.Inventory);

	if (!tome) {
		switch (id) {
		case sdk.items.TomeofIdentify:
		case "ibk":
			return (Config.FieldID.Enabled || force) ? 0 : 20; // Ignore missing ID tome if we aren't using field ID
		case sdk.items.TomeofTownPortal:
		case "tbk":
			return 0; // Force TP tome check
		}
	}

	return tome.getStat(sdk.stats.Quantity);
};

Town.fillTome = function (classid, force = false) {
	if (me.gold < 450) return false;
	const have = this.checkScrolls(classid, force);
	if (have >= (me.charlvl < 12 ? 5 : 13)) return true;

	let scroll;
	const scrollId = (classid === sdk.items.TomeofTownPortal ? sdk.items.ScrollofTownPortal : sdk.items.ScrollofIdentify);
	let npc = this.initNPC("Shop", "fillTome");
	if (!npc) return false;

	delay(500);

	if (!me.findItem(classid, sdk.items.mode.inStorage, sdk.storage.Inventory)) {
		let tome = npc.getItem(classid);

		try {
			if (!tome || !Storage.Inventory.CanFit(tome)) throw new Error("Can't buy tome");
			tome.buy();
		} catch (e) {
			// couldn't buy tome, lets see if we can just buy a single scroll
			if (me.getItem(scrollId)) return true;
			scroll = npc.getItem(scrollId);
			if (!scroll || !Storage.Inventory.CanFit(scroll)) return false;
			try {
				scroll.buy();
				return true;
			} catch (e) {
				console.error(e);
				return false;
			}
		}
	}

	scroll = npc.getItem(scrollId);
	if (!scroll) return false;

	try {
		if (me.gold < 5000) {
			let myTome = me.getItem(classid);
			if (myTome) {
				while (myTome.getStat(sdk.stats.Quantity) < 5 && me.gold > 500) {
					scroll = npc.getItem(scrollId);
					scroll && Packet.buyScroll(scroll, myTome, false);
					delay(50);
				}
			}
		} else {
			scroll.buy(true);
		}
	} catch (e2) {
		console.error(e2);

		return false;
	}

	return true;
};

Town.itemResult = function (item, result, system = "", sell = false) {
	let timer = 0;
	sell && !getInteractedNPC() && (sell = false);

	switch (result.result) {
	case Pickit.Result.WANTED:
	case Pickit.Result.SOLOWANTS:
		Item.logger("Kept", item);
		Item.logItem("Kept", item, result.line);
		system === "Field" && ((Item.autoEquipCheck(item) && Item.autoEquip("Field")) || (Item.autoEquipCheckSecondary(item) && Item.autoEquipSecondary("Field")));

		break;
	case Pickit.Result.UNID:
		// At low level its not worth keeping these items until we can Id them it just takes up too much room
		if (sell && me.charlvl < 10 && item.magic && item.classid !== sdk.items.SmallCharm) {
			Item.logger("Sold", item);
			item.sell();
		}

		break;
	case Pickit.Result.CUBING:
		Item.logger("Kept", item, "Cubing-" + system);
		Cubing.update();

		break;
	case Pickit.Result.RUNEWORD:
		break;
	case Pickit.Result.CRAFTING:
		Item.logger("Kept", item, "CraftSys-" + system);
		CraftingSystem.update(item);

		break;
	case Pickit.Result.SOLOSYSTEM:
		Item.logger("Kept", item, "SoloWants-" + system);
		SoloWants.update(item);

		break;
	default:
		if (!item.sellable || !sell) return;

		switch (true) {
		case (Developer.debugging.smallCharm && item.classid === sdk.items.SmallCharm):
		case (Developer.debugging.largeCharm && item.classid === sdk.items.LargeCharm):
		case (Developer.debugging.grandCharm && item.classid === sdk.items.GrandCharm):
			Item.logItem("Sold", item);

			break;
		default:
			Item.logger("Sold", item);
			
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

	let unids = me.getUnids();

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
					Item.logger("Sold", item);
					item.sell();
				} catch (e) {
					console.error(e);
				}

				break;
			case Pickit.Result.WANTED:
			case Pickit.Result.SOLOWANTS:
				Item.logger("Kept", item);
				Item.logItem("Kept", item, result.line);

				break;
			case Pickit.Result.CUBING:
				Item.logger("Kept", item, "Cubing-Town");
				Cubing.update();

				break;
			case Pickit.Result.RUNEWORD: // (doesn't trigger normally)
				break;
			case Pickit.Result.CRAFTING:
				Item.logger("Kept", item, "CraftSys-Town");
				CraftingSystem.update(item);

				break;
			case Pickit.Result.SOLOSYSTEM:
				Item.logger("Kept", item, "SoloWants-Town");
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
						Item.logItem("Sold", item);

						break;
					default:
						Item.logger("Dropped", item, "clearInventory");
						
						break;
					}

					item.sell();
				} else {
					console.log("clearInventory dropped " + item.name);
					Item.logger("Dropped", item, "clearInventory");
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
							let tpTome = me.findItem(sdk.items.TomeofTownPortal, sdk.items.mode.inStorage, sdk.storage.Inventory);
							!!tpTome && tpTome.sell() && delay(500);
						}

						delay(500);
						Storage.Inventory.CanFit(scroll) && scroll.buy();
					}

					scroll = me.findItem(sdk.items.ScrollofIdentify, sdk.items.mode.inStorage, sdk.storage.Inventory);
					if (!scroll) continue;

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

Town.identify = function () {
	if (me.gold < 5000 && this.cainID(true)) return true;
	
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
				Item.logger("Sold", item);
				item.sell();

				break;
			case Pickit.Result.UNID:
				let idTool = me.getIdTool();

				if (idTool) {
					this.identifyItem(item, idTool);
				} else {
					let scroll = npc.getItem(sdk.items.ScrollofIdentify);

					if (scroll) {
						if (!Storage.Inventory.CanFit(scroll)) {
							let tpTome = me.findItem(sdk.items.TomeofTownPortal, sdk.items.mode.inStorage, sdk.storage.Inventory);
							!!tpTome && tpTome.sell() && delay(500);
						}

						delay(500);
						Storage.Inventory.CanFit(scroll) && scroll.buy();
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

Town.lastShopped = { who: "", tick: 0 };

// todo - allow earlier shopping, mainly to get a belt
Town.shopItems = function (force = false) {
	if (!Config.MiniShopBot) return true;
	// todo - better gold scaling
	let goldLimit = [10000, 20000, 30000][me.diff];
	let itemTypes = [];
	let lowLevelShop = false;
	if (me.gold < goldLimit && me.charlvl > 6) {
		return false;
	} else if (me.charlvl < 6 && me.gold > 200) {
		lowLevelShop = true;
		Storage.BeltSize() === 1 && itemTypes.push(sdk.items.type.Belt);
		!CharData.skillData.bowData.bowOnSwitch && itemTypes.push(sdk.items.type.Bow, sdk.items.type.Crossbow);
		if (!itemTypes.length) return true;
		goldLimit = 200;
	}

	let npc = getInteractedNPC();
	if (!npc || !npc.itemcount) {
		// for now we only do force shop on low level
		if (force && itemTypes.length) {
			console.debug("Attempt force shopping");
			Town.initNPC("Repair", "shopItems");
			npc = getInteractedNPC();
			if (!npc || !npc.itemcount) return false;
		} else {
			return false;
		}
	}

	let items = npc.getItemsEx()
		.filter((item) => Town.ignoredItemTypes.indexOf(item.itemType) === -1 && (itemTypes.length === 0 || itemTypes.includes(item.itemType)))
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
		Item.logger(action, item);
		Developer.debugging.autoEquip && Item.logItem("Shopped " + action, item, result.line !== undefined ? result.line : "null");
	};

	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		const myGold = me.gold;
		const itemCost = item.getItemCost(sdk.items.cost.ToBuy);
		if (myGold < itemCost) continue;
		const result = Pickit.checkItem(item);

		// no tier'ed items
		if (!lowLevelShop && result.result === Pickit.Result.SOLOWANTS && NTIP.CheckItem(item, NTIP.SoloCheckListNoTier, true).result !== Pickit.Result.UNWANTED) {
			try {
				if (Storage.Inventory.CanFit(item) && myGold >= itemCost && (myGold - itemCost > goldLimit)) {
					if (item.isBaseType) {
						if (Item.betterThanStashed(item) && Item.betterBaseThanWearing(item, Developer.debugging.baseCheck)) {
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

		// tier'ed items
		if (result.result === Pickit.Result.SOLOWANTS && AutoEquip.wanted(item)) {
			const checkDependancy = (item) => {
				let check = Item.hasDependancy(item);
				if (check) {
					let el = npc.getItem(check);
					!!el && el.buy();
				}
			};
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

						checkDependancy(item);

						continue;
					}

					if (!lowLevelShop && haveMerc && Item.hasMercTier(item) && Item.autoEquipCheckMerc(item)) {
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

						checkDependancy(item);

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
				this.gambleIds.includes(item.classid) && items.push(copyUnit(item));
			} while (item.getNext());

			for (let i = 0; i < items.length; i += 1) {
				if (!Storage.Inventory.CanFit(items[i])) return false;

				items[i].buy(false, true);

				let newItem = this.getGambledItem(list);

				if (newItem) {
					let result = Pickit.checkItem(newItem);

					switch (result.result) {
					case Pickit.Result.WANTED:
						Item.logger("Gambled", newItem);
						Item.logItem("Gambled", newItem, result.line);
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
						Item.logger("Sold", newItem, "Gambling");
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

/**
 * @param {ItemUnit} item 
 */
Town.canStash = function (item) {
	if (Town.ignoreType(item.itemType)
		|| [sdk.items.quest.HoradricStaff, sdk.items.quest.KhalimsWill].includes(item.classid)
		|| (item.isCharm && Item.autoEquipCharmCheck(item))) {
		return false;
	}

	!Storage.Stash.CanFit(item) && this.sortStash(true);

	return Storage.Stash.CanFit(item);
};

Town.stash = function (stashGold = true) {
	if (!this.needStash()) return true;
	!getUIFlag(sdk.uiflags.Stash) && me.cancel();

	let items = (Storage.Inventory.Compare(Config.Inventory) || []);

	items.length > 0 && items.forEach(item => {
		if (this.canStash(item)) {
			const pickResult = Pickit.checkItem(item).result;
			switch (true) {
			case pickResult !== Pickit.Result.UNWANTED && pickResult !== Pickit.Result.TRASH:
			case Town.systemsKeep(item):
			case AutoEquip.wanted(item) && pickResult === Pickit.Result.UNWANTED: // wanted but can't use yet
			case !item.sellable: // quest/essences/keys/ect
				Storage.Stash.MoveTo(item) && Item.logger("Stashed", item);
				break;
			default:
				break;
			}
		}
	});

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

Town.repair = function (force = false) {
	if (this.cubeRepair()) return true;

	let npc;
	let repairAction = this.needRepair();
	force && repairAction.indexOf("repair") === -1 && repairAction.push("repair");
	if (!repairAction || !repairAction.length) return false;

	for (let i = 0; i < repairAction.length; i += 1) {
		switch (repairAction[i]) {
		case "repair":
			me.act === 3 && this.goToTown(Pather.accessToAct(4) ? 4 : 2);
			npc = this.initNPC("Repair", "repair");
			if (!npc) return false;
			me.repair();

			break;
		case "buyQuiver":
			let bowCheck = Attack.usingBow();
			let switchBowCheck = CharData.skillData.bowData.bowOnSwitch;
			!bowCheck && switchBowCheck && (bowCheck = (() => {
				switch (CharData.skillData.bowData.bowType) {
				case sdk.items.type.Bow:
				case sdk.items.type.AmazonBow:
					return "bow";
				case sdk.items.type.Crossbow:
					return "crossbow";
				default:
					return "";
				}
			})());

			if (bowCheck) {
				let quiver = bowCheck === "bow" ? "aqv" : "cqv";
				switchBowCheck && me.switchWeapons(sdk.player.slot.Secondary);
				let myQuiver = me.getItem(quiver, sdk.items.mode.Equipped);
				!!myQuiver && myQuiver.drop();
				
				npc = this.initNPC("Repair", "buyQuiver");
				if (!npc) return false;

				quiver = npc.getItem(quiver);
				!!quiver && quiver.buy();
				switchBowCheck && me.switchWeapons(sdk.player.slot.Main);
			}

			break;
		}
	}

	Town.shopItems();

	return true;
};

Town.reviveMerc = function () {
	if (!me.needMerc()) return true;
	let preArea = me.area;

	// avoid Aheara
	me.act === 3 && this.goToTown(Pather.accessToAct(4) ? 4 : 2);

	let npc = this.initNPC("Merc", "reviveMerc");
	if (!npc) return false;

	MainLoop:
	for (let i = 0; i < 3; i += 1) {
		let dialog = getDialogLines();
		if (!dialog) continue;

		for (let lines = 0; lines < dialog.length; lines += 1) {
			if (dialog[lines].text.match(":", "gi")) {
				dialog[lines].handler();
				delay(Math.max(750, me.ping * 2));
			}

			// "You do not have enough gold for that."
			if (dialog[lines].text.match(getLocaleString(sdk.locale.dialog.youDoNotHaveEnoughGoldForThat), "gi")) {
				dialog.find(line => !line.text.match(getLocaleString(sdk.locale.dialog.youDoNotHaveEnoughGoldForThat), "gi")).handler();
				delay(Math.max(750, me.ping * 2));
				me.cancelUIFlags();
				console.error("Could not revive merc: My current gold: " + me.gold + ", current mercrevivecost: " + me.mercrevivecost);
				return false;
			}
		}

		let tick = getTickCount();

		while (getTickCount() - tick < 2000) {
			if (me.getMercEx()) {
				delay(Math.max(750, me.ping * 2));

				break MainLoop;
			}

			delay(200);
		}
	}

	Attack.checkInfinity();

	if (me.getMercEx()) {
		// Cast BO on merc so he doesn't just die again. Only do this is you are a barb or actually have a cta. Otherwise its just a waste of time.
		if (Config.MercWatch && Precast.needOutOfTownCast()) {
			console.log("MercWatch precast");
			Precast.doRandomPrecast(true, preArea);
		}

		return true;
	}

	return false;
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
	me.cleanUpInvoPotions();

	// Cleanup remaining potions
	console.debug("clearInventory: start clean-up remaining pots");
	let sellOrDrop = [];
	let potsInInventory = me.getItemsEx()
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
				return (hp.push(p));
			case sdk.items.type.ManaPotion:
				return (mp.push(p));
			case sdk.items.type.RejuvPotion:
				return (rv.push(p));
			case sdk.items.type.ThawingPotion:
			case sdk.items.type.AntidotePotion:
			case sdk.items.type.StaminaPotion:
				return (specials.push(p));
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
			if (item.classid === sdk.items.TomeofIdentify && !Config.FieldID.Enabled) return true;
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
				if (!Item.betterThanStashed(item) && !Item.betterBaseThanWearing(item, Developer.debugging.baseCheck)) {
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
				Item.logger("Sold", item);
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

Town.clearJunk = function () {
	let junkItems = me.getItemsEx()
		.filter(i => i.isInStorage && !Town.ignoredItemTypes.includes(i.itemType) && i.sellable && !Town.systemsKeep(i));
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
			if ([Pickit.Result.UNWANTED, Pickit.Result.TRASH].includes(pickitResult)) {
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

			if (junk.isBaseType && pickitResult === Pickit.Result.SOLOWANTS) {
				if (!Item.betterThanStashed(junk)) {
					console.log("ÿc9BetterThanStashedCheckÿc0 :: Base: " + junk.name + " Junk type: " + junk.itemType + " Pickit Result: " + pickitResult);
					getToItem("BetterThanStashedCheck", junk) && totalJunk.push(junk);

					continue;
				}

				if (!Item.betterBaseThanWearing(junk, Developer.debugging.baseCheck)) {
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
				// extra check should ensure no pickit wanted items get sold/dropped
				if (NTIP.CheckItem(junk, NTIP_CheckListNoTier) === Pickit.Result.WANTED) return;
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
				Item.logger("Sold", junkToSell[i]);
				Developer.debugging.junkCheck && Item.logItem("JunkCheck Sold", junkToSell[i]);

				junkToSell[i].sell();
				delay(100);
			}
		}

		me.cancelUIFlags();

		for (let i = 0; i < junkToDrop.length; i++) {
			console.log("ÿc9JunkCheckÿc0 :: Drop " + junkToDrop[i].name);
			Item.logger("Sold", junkToDrop[i]);
			Developer.debugging.junkCheck && Item.logItem("JunkCheck Sold", junkToDrop[i]);

			junkToDrop[i].drop();
			delay(100);
		}
	}

	return true;
};

Town.doChores = function (repair = false, givenTasks = {}) {
	const extraTasks = Object.assign({}, {
		thawing: false,
		antidote: false,
		stamina: false,
		fullChores: false,
	}, givenTasks);

	delay(250);

	console.info(true);
	console.time("doChores");
	console.debug("doChores Inital Gold :: " + me.gold);

	!me.inTown && Town.goToTown();

	// Burst of speed while in town
	if (Skill.canUse(sdk.skills.BurstofSpeed) && !me.getState(sdk.states.BurstofSpeed)) {
		Skill.cast(sdk.skills.BurstofSpeed, sdk.skills.hand.Right);
	}

	const preAct = me.act;

	me.switchWeapons(Attack.getPrimarySlot());
	extraTasks.fullChores && Quest.unfinishedQuests();
	me.getUnids().length && me.gold < 5000 && this.cainID(true);
	this.heal();
	this.identify();
	this.clearInventory();
	this.fillTome(sdk.items.TomeofTownPortal);
	Config.FieldID.Enabled && this.fillTome(sdk.items.TomeofIdentify);
	!!me.getItem(sdk.items.TomeofTownPortal) && this.clearScrolls();
	this.buyPotions();
	this.buyKeys();
	extraTasks.thawing && CharData.buffData.thawing.need() && Town.buyPots(12, "Thawing", true);
	extraTasks.antidote && CharData.buffData.antidote.need() && Town.buyPots(12, "Antidote", true);
	extraTasks.stamina && Town.buyPots(12, "Stamina", true);
	this.shopItems();
	this.repair(repair) && this.shopItems(true);
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
	this.clearJunk();
	this.stash();
	// check pots again, we might have enough gold now if we didn't before
	me.needPotions() && this.buyPotions() && me.cancelUIFlags();
	// check repair again, we might have enough gold now if we didn't before
	me.needRepair() && this.repair() && me.cancelUIFlags();

	this.sortInventory();
	extraTasks.fullChores && this.sortStash();
	Quest.characterRespec();

	me.act !== preAct && this.goToTown(preAct);
	me.cancelUIFlags();
	!me.barbarian && !Precast.checkCTA() && Precast.doPrecast(false);
	
	if (me.expansion) {
		Attack.checkBowOnSwitch();
		Attack.getCurrentChargedSkillIds();
		Pather.checkForTeleCharges();
	}

	delay(300);
	console.debug("doChores Ending Gold :: " + me.gold);
	console.info(false, null, "doChores");
	Town.lastInteractedNPC.reset(); // unassign

	return true;
};
