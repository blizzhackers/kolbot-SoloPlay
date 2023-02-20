/**
*  @filename    NPCAction.js
*  @author      theBGuy
*  @desc        NPC related functions
*
*/

// ugly but should handle scope issues if I decide to add this to the core in which case I can come back and remove this
// but won't get immeadiate issues of trying to redefine a const
(function (NPCAction) {
	NPCAction.buyPotions = function () {
		if (me.gold < 450 || !me.getItem(sdk.items.TomeofTownPortal)) return false;

		me.clearBelt();
		const buffer = { hp: 0, mp: 0 };
		const beltSize = Storage.BeltSize();
		let [needPots, needBuffer, specialCheck] = [false, true, false];
		let col = Storage.Belt.checkColumns(beltSize);

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
			pAct >= 4 ? me.act < 4 && Town.goToTown(4) : pAct > me.act && Town.goToTown(pAct);
		}

		let npc = Town.initNPC("Shop", "buyPotions");
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
				const useShift = Town.shiftCheck(col, beltSize);
				const wantedPot = Config.BeltColumn[i] === "hp" ? wantedHpPot : wantedMpPot;
				let pot = Town.getPotion(npc, Config.BeltColumn[i], wantedPot);

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

			col = Storage.Belt.checkColumns(beltSize); // Re-initialize columns (needed because 1 shift-buy can fill multiple columns)
		}

		// re-check
		!needBuffer && (Config.HPBuffer > 0 || Config.MPBuffer > 0) && getNeededBuffer();

		const buyHPBuffers = () => {
			if (needBuffer && buffer.hp < Config.HPBuffer) {
				for (let i = 0; i < Config.HPBuffer - buffer.hp; i += 1) {
					let pot = Town.getPotion(npc, "hp", wantedHpPot);
					!!pot && Storage.Inventory.CanFit(pot) && pot.buy(false);
				}
			}
			return true;
		};
		const buyMPBuffers = () => {
			if (needBuffer && buffer.mp < Config.MPBuffer) {
				for (let i = 0; i < Config.MPBuffer - buffer.mp; i += 1) {
					let pot = Town.getPotion(npc, "mp", wantedMpPot);
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

	NPCAction.fillTome = function (classid, force = false) {
		if (me.gold < 450) return false;
		const have = Town.checkScrolls(classid, force);
		if (have >= (me.charlvl < 12 ? 5 : 13)) return true;

		let scroll;
		const scrollId = (classid === sdk.items.TomeofTownPortal ? sdk.items.ScrollofTownPortal : sdk.items.ScrollofIdentify);
		let npc = Town.initNPC("Shop", "fillTome");
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
				} catch (e) {
					console.error(e);
					return false;
				}
				return true;
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

	NPCAction.cainID = function (force = false) {
		if ((!Config.CainID.Enable && !force) || !Misc.checkQuest(sdk.quest.id.TheSearchForCain, sdk.quest.states.Completed)) return false;

		let npc = getInteractedNPC();

		// Check if we're already in a shop. It would be pointless to go to Cain if so.
		if (npc && npc.name.toLowerCase() === Town.tasks[me.act - 1].Shop) return false;
		// Check if we may use Cain - minimum gold
		if (me.gold < Config.CainID.MinGold && !force) return false;

		me.cancel();
		Town.stash(false);

		let unids = me.getUnids();

		if (unids.length) {
			// Check if we may use Cain - number of unid items
			if (unids.length < Config.CainID.MinUnids && !force) return false;

			let cain = Town.initNPC("CainID", "cainID");
			if (!cain) return false;

			if (force) {
				npc = Town.initNPC("Shop", "clearInventory");
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
						Town.initNPC("Shop", "clearInventory");
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

					Town.initNPC("Shop", "clearInventory");

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
						console.log("clearInventory dropped " + item.prettyPrint);
						Item.logger("Dropped", item, "clearInventory");
						item.drop();
					}

					let timer = getTickCount() - Town.sellTimer; // shop speedup test

					if (timer > 0 && timer < 500) {
						delay(timer);
					}

					break;
				case Pickit.Result.UNID:
					if (tome) {
						Town.identifyItem(item, tome);
					} else {
						let scroll = npc.getItem(sdk.items.ScrollofIdentify);

						if (scroll) {
							if (!Storage.Inventory.CanFit(scroll)) {
								let tpTome = me.getTome(sdk.items.TomeofTownPortal);
								!!tpTome && tpTome.sell() && delay(500);
							}

							delay(500);
							Storage.Inventory.CanFit(scroll) && scroll.buy();
						}

						scroll = me.findItem(sdk.items.ScrollofIdentify, sdk.items.mode.inStorage, sdk.storage.Inventory);
						if (!scroll) continue;

						Town.identifyItem(item, scroll);
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

	// todo - allow earlier shopping, mainly to get a belt
	NPCAction.shopItems = function (force = false) {
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
			.filter((item) => !Town.ignoreType(item.itemType) && (itemTypes.length === 0 || itemTypes.includes(item.itemType)))
			.sort((a, b) => NTIP.GetTier(b) - NTIP.GetTier(a));
		if (!items.length) return false;
		if (getTickCount() - Town.lastShopped.tick < Time.seconds(3) && Town.lastShopped.who === npc.name) return false;

		console.time("shopItems");

		let bought = 0;
		const haveMerc = (!me.classic && Config.UseMerc && !me.mercrevivecost && Misc.poll(() => !!me.getMerc(), 500, 100));
		console.info(true, "ÿc4MiniShopBotÿc0: Scanning " + npc.itemcount + " items.");

		/**
		 * @param {ItemUnit} item 
		 * @param {string} action 
		 * @param {{ result: PickitResult, line: string }} result 
		 * @param {number | string} tierInfo 
		 */
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

						if (Item.hasSecondaryTier(item) && Item.autoEquipCheckSecondary(item)) {
							try {
								shopReport(item, "AutoEquip Switch Shopped", result.line, (item.fname + " SecondaryTier: " + NTIP.GetSecondaryTier(item)));
								item.buy() && bought++;
								Item.autoEquip("InShop");
							} catch (e) {
								console.error(e);
							}

							checkDependancy(item);
						}
					}
				} catch (e) {
					console.error(e);
				}
			}

			delay(2);
		}

		// merc tier'ed items
		if (haveMerc && !lowLevelShop) {
			items = npc.getItemsEx()
				.filter((item) => !Town.ignoreType(item.itemType) && (itemTypes.length === 0 || itemTypes.includes(item.itemType) && NTIP.GetMercTier(item) > 0))
				.sort((a, b) => NTIP.GetMercTier(b) - NTIP.GetMercTier(a))
				.forEach(item => {
					const myGold = me.gold;
					const itemCost = item.getItemCost(sdk.items.cost.ToBuy);
					if (myGold < itemCost) return;
					const result = Pickit.checkItem(item);

					if (result.result === Pickit.Result.SOLOWANTS && AutoEquip.wanted(item)) {
						try {
							if (Storage.Inventory.CanFit(item) && myGold >= itemCost && (myGold - itemCost > goldLimit)) {
								if (Item.hasMercTier(item) && Item.autoEquipCheckMerc(item)) {
									shopReport(item, "AutoEquipMerc", result.line, (item.fname + " Tier: " + NTIP.GetMercTier(item)));
									item.buy() && bought++;
								}
							}
						} catch (e) {
							console.error(e);
						}
					}

					delay(2);
				});
		}

		Town.lastShopped.tick = getTickCount();
		Town.lastShopped.who = npc.name;

		console.info(false, "Bought " + bought + " items", "shopItems");

		return true;
	};

	NPCAction.gamble = function () {
		if (!Town.needGamble() || Config.GambleItems.length === 0) return true;

		let list = [];

		if (Town.gambleIds.length === 0) {
			// change text to classid
			for (let i = 0; i < Config.GambleItems.length; i += 1) {
				if (isNaN(Config.GambleItems[i])) {
					if (NTIPAliasClassID.hasOwnProperty(Config.GambleItems[i].replace(/\s+/g, "").toLowerCase())) {
						Town.gambleIds.push(NTIPAliasClassID[Config.GambleItems[i].replace(/\s+/g, "").toLowerCase()]);
					} else {
						Misc.errorReport("ÿc1Invalid gamble entry:ÿc0 " + Config.GambleItems[i]);
					}
				} else {
					Town.gambleIds.push(Config.GambleItems[i]);
				}
			}
		}

		if (Town.gambleIds.length === 0) return true;

		// avoid Alkor
		me.act === 3 && Town.goToTown(Pather.accessToAct(4) ? 4 : 2);

		let npc = Town.initNPC("Gamble", "gamble");
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
					Town.gambleIds.includes(item.classid) && items.push(copyUnit(item));
				} while (item.getNext());

				for (let i = 0; i < items.length; i += 1) {
					if (!Storage.Inventory.CanFit(items[i])) return false;

					items[i].buy(false, true);

					let newItem = Town.getGambledItem(list);

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

	NPCAction.repair = function (force = false) {
		if (Town.cubeRepair()) return true;

		let npc;
		let repairAction = Town.needRepair();
		force && repairAction.indexOf("repair") === -1 && repairAction.push("repair");
		if (!repairAction || !repairAction.length) return false;

		for (let i = 0; i < repairAction.length; i += 1) {
			switch (repairAction[i]) {
			case "repair":
				me.act === 3 && Town.goToTown(Pather.accessToAct(4) ? 4 : 2);
				npc = Town.initNPC("Repair", "repair");
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
					
					npc = Town.initNPC("Repair", "buyQuiver");
					if (!npc) return false;

					quiver = npc.getItem(quiver);
					!!quiver && quiver.buy();
					switchBowCheck && me.switchWeapons(sdk.player.slot.Main);
				}

				break;
			}
		}

		NPCAction.shopItems();

		return true;
	};

	NPCAction.reviveMerc = function () {
		if (!me.needMerc()) return true;
		let preArea = me.area;

		// avoid Aheara
		me.act === 3 && Town.goToTown(Pather.accessToAct(4) ? 4 : 2);

		let npc = Town.initNPC("Merc", "reviveMerc");
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

})(global.NPCAction = global.NPCAction || {});
