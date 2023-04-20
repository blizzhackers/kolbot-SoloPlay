/**
*  @filename    ToolsThread.js
*  @author      kolton, theBGuy (modifed for SoloPlay)
*  @desc        modified Toolsthread for use with Kolbot-SoloPlay
*
*/
js_strict(true);
include("critical.js");

// globals needed for core gameplay
includeCoreLibs({ exclude: ["Storage.js"] });
include("core/Common/Tools.js");

// system libs
includeSystemLibs();
include("systems/mulelogger/MuleLogger.js");

// Include SoloPlay's librarys
include("SoloPlay/Tools/Developer.js");
include("SoloPlay/Tools/Tracker.js");
include("SoloPlay/Tools/CharData.js");
include("SoloPlay/Tools/SoloIndex.js");
include("SoloPlay/Functions/ConfigOverrides.js");
include("SoloPlay/Functions/Globals.js");

/**
 * @todo trim the uneeded files/global variables from this file
 */

function main () {
	let ironGolem, tick, quitListDelayTime;
	let canQuit = true;
	let timerLastDrink = [];
	let [quitFlag, restart] = [false, false];
	let debugInfo = { area: 0, currScript: "no entry" };

	new Overrides.Override(Attack, Attack.getNearestMonster, function (orignal) {
		let monster = orignal({ skipBlocked: false, skipImmune: false });
		return (monster ? " to " + monster.name : "");
	}).apply();

	console.log("ÿc8Kolbot-SoloPlayÿc0: Start Custom ToolsThread script");
	D2Bot.init();
	SetUp.include();
	Config.init(false);
	Pickit.init(false);
	Attack.init();
	Storage.Init();
	CraftingSystem.buildLists();
	Runewords.init();
	Cubing.init();

	Developer.overlay && include("SoloPlay/Tools/Overlay.js");

	for (let i = 0; i < 5; i += 1) {
		timerLastDrink[i] = 0;
	}

	// Reset core chicken
	me.chickenhp = -1;
	me.chickenmp = -1;

	// General functions
	this.togglePause = function () {
		["libs/SoloPlay/SoloPlay.js", "threads/party.js"].forEach((script) => {
			let thread = getScript(script);
			if (thread) {
				if (thread.running) {
					script === "libs/SoloPlay/SoloPlay.js" && console.log("ÿc8ToolsThread :: ÿc1Pausing " + script);
					thread.pause();
				} else {
					script === "libs/SoloPlay/SoloPlay.js" && console.log("ÿc8ToolsThread :: ÿc2Resuming threads");
					thread.resume();
				}
			}
		});

		return true;
	};

	this.stopDefault = function () {
		["libs/SoloPlay/SoloPlay.js", "libs/SoloPlay/Modules/Guard.js", "threads/party.js"]
			.forEach(script => {
				let thread = getScript(script);
				if (thread && thread.running) {
					thread.stop();
				}
			});
		return true;
	};

	this.exit = function (chickenExit = false) {
		chickenExit && D2Bot.updateChickens();
		Config.LogExperience && Experience.log();
		Developer.logPerformance && Tracker.update();
		console.log("ÿc8Run duration ÿc2" + Time.format(getTickCount() - me.gamestarttime));
		this.stopDefault();
		quit();
	};

	this.restart = function () {
		Config.LogExperience && Experience.log();
		Developer.logPerformance && Tracker.update();
		this.stopDefault();
		D2Bot.restart();
	};

	this.getPotion = function (pottype = -1, type = -1) {
		if (pottype === undefined) return false;

		let items = me.getItemsEx()
			.filter(item => item.itemType === pottype && (type > Common.Toolsthread.pots.Rejuv ? item.isInBelt : true));
		if (items.length === 0) return false;
		let invoFirst = [Common.Toolsthread.pots.Health, Common.Toolsthread.pots.Mana].includes(type);

		if (invoFirst) {
			// sort by location (invo first, then classid)
			items.sort(function (a, b) {
				let [aLoc, bLoc] = [a.location, b.location];
				if (bLoc < aLoc) return -1;
				if (bLoc > aLoc) return 1;
				return b.classid - a.classid;
			});
		} else {
			// Get highest id = highest potion first
			items.sort(function (a, b) {
				return b.classid - a.classid;
			});
		}

		for (let k = 0; k < items.length; k += 1) {
			if (type < Common.Toolsthread.pots.MercHealth && items[k].isInInventory && items[k].itemType === pottype) {
				console.log("ÿc2Drinking " + items[k].name + " from inventory.");
				return items[k];
			}

			if (items[k].mode === sdk.items.mode.inBelt && items[k].itemType === pottype) {
				console.log("ÿc2" + (type > 2 ? "Giving Merc " : "Drinking ") + items[k].name + " from belt.");
				return items[k];
			}
		}

		return false;
	};

	this.drinkPotion = function (type) {
		if (type === undefined) return false;
		let tNow = getTickCount();

		switch (type) {
		case Common.Toolsthread.pots.Health:
		case Common.Toolsthread.pots.Mana:
			if ((timerLastDrink[type] && (tNow - timerLastDrink[type] < 1000)) || me.getState(type === 0 ? 100 : 106)) {
				return false;
			}

			break;
		case Common.Toolsthread.pots.Rejuv:
			// small delay for juvs just to prevent using more at once
			if (timerLastDrink[type] && (tNow - timerLastDrink[type] < 300)) {
				return false;
			}

			break;
		case Common.Toolsthread.pots.MercRejuv:
			// larger delay for juvs just to prevent using more at once, considering merc update rate
			if (timerLastDrink[type] && (tNow - timerLastDrink[type] < 2000)) {
				return false;
			}

			break;
		default:
			if (timerLastDrink[type] && (tNow - timerLastDrink[type] < 8000)) {
				return false;
			}

			break;
		}

		// mode 18 - can't drink while leaping/whirling etc.
		if (me.dead || me.mode === sdk.player.mode.SkillActionSequence) return false;

		let pottype = (() => {
			switch (type) {
			case Common.Toolsthread.pots.Health:
			case Common.Toolsthread.pots.MercHealth:
				return sdk.items.type.HealingPotion;
			case Common.Toolsthread.pots.Mana:
				return sdk.items.type.ManaPotion;
			default:
				return sdk.items.type.RejuvPotion;
			}
		})();

		let potion = this.getPotion(pottype, type);

		if (!!potion) {
			// mode 18 - can't drink while leaping/whirling etc.
			if (me.dead || me.mode === sdk.player.mode.SkillActionSequence) return false;

			try {
				type < Common.Toolsthread.pots.MercHealth ? potion.interact() : Packet.useBeltItemForMerc(potion);
			} catch (e) {
				console.error(e);
			}

			timerLastDrink[type] = getTickCount();
			delay(25);

			return true;
		}

		return false;
	};

	/**
	 * Handles thawing/antidote/stamina potions
	 * @param {number} type 
	 * @returns {boolean}
	 */
	this.drinkSpecialPotion = function (type) {
		if (type === undefined) return false;
		if (!CharData.pots.has(type)) return false;
		// give at least a second delay between pots
		if (CharData.pots.get(type).tick < 1000) return false;

		// mode 18 - can't drink while leaping/whirling etc.
		if (me.dead || me.mode === sdk.player.mode.SkillActionSequence) {
			return false;
		}

		let pot = me.getItemsEx(-1, sdk.items.mode.inStorage)
			.filter((p) => p.isInInventory && p.classid === type).first();

		if (pot) {
			try {
				pot.interact();
				
				if (!CharData.pots.get(type).active() || CharData.pots.get(type).timeLeft() <= 0) {
					CharData.pots.get(type).tick = getTickCount();
					CharData.pots.get(type).duration = 3e4;
				} else {
					CharData.pots.get(type).duration += 3e4 - (getTickCount() - CharData.pots.get(type).tick);
				}

				console.debug(CharData.pots);
			} catch (e) {
				console.warn(e);
			}

			return true;
		}

		return false;
	};

	// ~~~~~~~~~~~~~~~ //
	// Event functions //
	// ~~~~~~~~~~~~~~~ //

	/**
	 * Handle keyUp events
	 * @param {number} key 
	 */
	const keyEvent = function (key) {
		switch (key) {
		case sdk.keys.PauseBreak: // pause default.dbj
			this.togglePause();

			break;
		case sdk.keys.Numpad0: // stop profile without logging character
			Developer.logPerformance && Tracker.update();
			console.log("ÿc8Kolbot-SoloPlay: ÿc1Stopping profile");
			delay(rand(2e3, 5e3));
			D2Bot.stop(me.profile, true);

			break;
		case sdk.keys.End: // stop profile and log character
			Developer.logEquipped ? MuleLogger.logEquippedItems() : MuleLogger.logChar();
			Developer.logPerformance && Tracker.update();

			delay(rand(Config.QuitListDelay[0] * 1e3, Config.QuitListDelay[1] * 1e3));
			D2Bot.printToConsole(me.profile + " - end run " + me.gamename);
			D2Bot.stop(me.profile, true);

			break;
		case sdk.keys.Delete: // quit current game
			this.exit();

			break;
		case sdk.keys.Insert: // reveal level
			me.overhead("Revealing " + getAreaName(me.area));
			revealLevel(true);

			break;
		case sdk.keys.NumpadPlus: // log stats
			showConsole();

			console.log("ÿc8My stats :: " + Common.Toolsthread.getStatsString(me));
			let merc = me.getMerc();
			!!merc && console.log("ÿc8Merc stats :: " + Common.Toolsthread.getStatsString(merc));
			console.log("//------ÿc8SoloWants.needListÿc0-----//");
			console.log(SoloWants.needList);

			break;
		case sdk.keys.Numpad5: // force automule check
			if (AutoMule.getInfo() && AutoMule.getInfo().hasOwnProperty("muleInfo")) {
				if (AutoMule.getMuleItems().length > 0) {
					console.log("ÿc2Mule triggered");
					scriptBroadcast("mule");
					this.exit();

				} else {
					me.overhead("No items to mule.");
				}
			} else {
				me.overhead("Profile not enabled for muling.");
			}

			break;
		case sdk.keys.Numpad6: // log character to char viewer
			Developer.logEquipped ? MuleLogger.logEquippedItems() : MuleLogger.logChar();
			me.overhead("Logged char: " + me.name);

			break;
		case sdk.keys.NumpadDash:
			{
				let itemToCheck = Game.getSelectedUnit();
				if (!!itemToCheck) {
					D2Bot.printToConsole("getTier: " + NTIP.GetTier(itemToCheck));
					D2Bot.printToConsole("tierscore: " + tierscore(itemToCheck));
					D2Bot.printToConsole("getSecondaryTier: " + NTIP.GetSecondaryTier(itemToCheck));
					D2Bot.printToConsole("secondarytierscore: " + secondaryscore(itemToCheck));
					D2Bot.printToConsole("charmTier: " + NTIP.GetCharmTier(itemToCheck));
					D2Bot.printToConsole("charmscore: " + charmscore(itemToCheck));
					D2Bot.printToConsole("getMercTier: " + NTIP.GetMercTier(itemToCheck));
					D2Bot.printToConsole("mercscore: " + mercscore(itemToCheck));
					console.log(itemToCheck.fname + " info printed to console");
				}
			}

			break;
		case sdk.keys.NumpadDecimal: // dump item info
			{
				let [itemString, charmString, generalString] = ["", "", ""];
				let itemToCheck = Game.getSelectedUnit();
				if (!!itemToCheck) {
					let special = "";
					if (itemToCheck.itemType === sdk.items.type.Ring) {
						special = (" | ÿc4TierLHS: ÿc0" + tierscore(itemToCheck, 1, sdk.body.RingRight) + " | ÿc4TierRHS: ÿc0" + tierscore(itemToCheck, 1, sdk.body.RingLeft));
					}
					itemString = "ÿc4MaxQuantity: ÿc0" + NTIP.getMaxQuantity(itemToCheck) + " | ÿc4ItemsOwned: ÿc0" + Item.getQuantityOwned(itemToCheck) + " | ÿc4Tier: ÿc0" + NTIP.GetTier(itemToCheck) + (special ? special : "")
						+ " | ÿc4SecondaryTier: ÿc0" + NTIP.GetSecondaryTier(itemToCheck) + " | ÿc4MercTier: ÿc0" + NTIP.GetMercTier(itemToCheck) + "\n"
						+ "ÿc4AutoEquipKeepCheck: ÿc0" + Item.autoEquipCheck(itemToCheck, true) + " | ÿc4AutoEquipCheckSecondary: ÿc0" + Item.autoEquipCheckSecondary(itemToCheck)
						+ " | ÿc4AutoEquipKeepCheckMerc: ÿc0" + Item.autoEquipCheckMerc(itemToCheck, true) + "\nÿc4Cubing Item: ÿc0" + Cubing.keepItem(itemToCheck)
						+ " | ÿc4Runeword Item: ÿc0" + Runewords.keepItem(itemToCheck) + " | ÿc4Crafting Item: ÿc0" + CraftingSystem.keepItem(itemToCheck) + " | ÿc4SoloWants Item: ÿc0" + SoloWants.keepItem(itemToCheck)
						+ "\nÿc4ItemType: ÿc0" + itemToCheck.itemType + "| ÿc4Classid: ÿc0" + itemToCheck.classid + "| ÿc4Quality: ÿc0" + itemToCheck.quality;
					charmString = "ÿc4InvoQuantity: ÿc0" + NTIP.getInvoQuantity(itemToCheck) + " | ÿc4hasStats: ÿc0" + NTIP.hasStats(itemToCheck) + " | ÿc4FinalCharm: ÿc0" + CharmEquip.isFinalCharm(itemToCheck) + "\n"
						+ "ÿc4CharmType: ÿc0" + CharmEquip.getCharmType(itemToCheck) + " | ÿc4AutoEquipCharmCheck: ÿc0" + CharmEquip.check(itemToCheck) + " | ÿc4CharmTier: ÿc0" + NTIP.GetCharmTier(itemToCheck);
					generalString = "ÿc4ItemName: ÿc0" + itemToCheck.fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, "")
						+ "\nÿc4Pickit: ÿc0" + Pickit.checkItem(itemToCheck).result + " | ÿc4NTIP.CheckItem: ÿc0" + NTIP.CheckItem(itemToCheck, false, true).result + " | ÿc4NTIP.CheckItem No Tier: ÿc0" + NTIP.CheckItem(itemToCheck, NTIP_CheckListNoTier, true).result;
				}
				
				console.log("ÿc8Kolbot-SoloPlay: ÿc2Item Info Start");
				console.log(itemString);
				console.log("ÿc8Kolbot-SoloPlay: ÿc2Charm Info Start");
				console.log(charmString);
				console.log("ÿc8Kolbot-SoloPlay: ÿc2General Info Start");
				console.log(generalString);
				console.log("ÿc8Kolbot-SoloPlay: ÿc1****************Info End****************");
			}

			break;
		case sdk.keys.Numpad9: // get nearest preset unit id
			console.log(Common.Toolsthread.getNearestPreset());

			break;
		case sdk.keys.NumpadStar: // precast
			Precast.doPrecast(true);

			break;
		case sdk.keys.NumpadSlash: // re-load default
			console.log("ÿc8ToolsThread :: " + sdk.colors.Red + "Stopping threads and waiting 5 seconds to restart");
			this.stopDefault() && delay(1e3);
			load("libs/SoloPlay/Threads/Reload.js");

			break;
		}
	};

	/**
	 * Handle game events
	 * @param {number} mode 
	 * @param {number} [param1] 
	 * @param {number} [param2] 
	 * @param {string} [name1] 
	 * @param {string} [name2] 
	 */
	const gameEvent = function (mode, param1, param2, name1, name2) {
		switch (mode) {
		case 0x00: // "%Name1(%Name2) dropped due to time out."
		case 0x01: // "%Name1(%Name2) dropped due to errors."
		case 0x03: // "%Name1(%Name2) left our world. Diablo's minions weaken."
			Config.DebugMode.Stack && mode === 0 && D2Bot.printToConsole(name1 + " timed out, check their logs");

			if (Config.QuitList.includes(name1) || Config.QuitList.some(str => String.isEqual(str, "all"))) {
				console.log(name1 + (mode === 0 ? " timed out" : " left"));

				if (typeof quitListDelayTime === "undefined" && Config.QuitListDelay.length > 0) {
					let [min, max] = Config.QuitListDelay.sort((a, b) => a - b).map(s => Time.seconds(s));

					quitListDelayTime = getTickCount() + rand(min, max);
				} else {
					quitListDelayTime = getTickCount();
				}

				quitFlag = true;
			}

			Config.AntiHostile && scriptBroadcast("remove " + name1);

			break;
		case 0x06:
			// "%Name1 was Slain by %Name2"
			if (Config.AntiHostile && param2 === 0x00 && name2 === me.name) {
				scriptBroadcast("mugshot " + name1);
			}

			break;
		case 0x07:
			// "%Player has declared hostility towards you."
			if (Config.AntiHostile && param2 === 0x03) {
				scriptBroadcast("findHostiles");
			}

			break;
		case 0x11: // "%Param1 Stones of Jordan Sold to Merchants"
			if (Config.DCloneQuit === 2) {
				D2Bot.printToConsole("SoJ sold in game. Leaving.");
				quitFlag = true;

				break;
			}

			// Only do this in expansion
			if (Config.SoJWaitTime && !me.classic) {
				!!me.gameserverip && D2Bot.printToConsole(param1 + " Stones of Jordan Sold to Merchants on IP " + me.gameserverip.split(".")[3], sdk.colors.D2Bot.DarkGold);
				Messaging.sendToScript("libs/SoloPlay/SoloPlay.js", "soj");
			}

			break;
		case 0x12: // "Diablo Walks the Earth"
			if (Config.DCloneQuit > 0) {
				D2Bot.printToConsole("Diablo walked in game. Leaving.");
				quitFlag = true;

				break;
			}

			// Only do this in expansion
			if (Config.StopOnDClone && !me.classic && me.hell) {
				D2Bot.printToConsole("Diablo Walks the Earth", sdk.colors.D2Bot.DarkGold);
				SoloEvents.cloneWalked = true;
				this.togglePause();
				Town.goToTown();
				showConsole();
				myPrint("ÿc4Diablo Walks the Earth");
				me.maxgametime += (30 * 1000 * 60);		// Add 30 minutes to current maxgametime
				Config.KillDclone && Messaging.sendToScript(SoloEvents.filePath, "killdclone");
			}

			break;
		}
	};

	/**
	 * Handle script/thread communications
	 * @param {string} msg 
	 * @returns {void}
	 */
	const scriptEvent = function (msg) {
		if (!msg || typeof msg !== "string") return;

		let obj;

		if (msg.includes("--")) {
			let sub = msg.match(/\w+?--/gm).first();

			switch (sub) {
			case "config--":
				console.debug("update config");
				Config = JSON.parse(msg.split("config--")[1]);

				return;
			case "skill--":
				console.debug("update skillData");
				obj = JSON.parse(msg.split("skill--")[1]);
				Misc.updateRecursively(CharData.skillData, obj);

				return;
			case "data--":
				console.debug("update me.data");
				obj = JSON.parse(msg.split("data--")[1]);
				Misc.updateRecursively(me.data, obj);

				return;
			}
		}

		switch (msg) {
		case "deleteAndRemake":
			Developer.testingMode.enabled && (quitFlag = true);

			break;
		case "toggleQuitlist":
			canQuit = !canQuit;

			break;
		case "quit":
			quitFlag = true;

			break;
		case "restart":
			restart = true;

			break;
		case "test":
			{
				console.debug(sdk.colors.Green + "//-----------DataDump Start-----------//",
					"\nÿc8ThreadData ::\n", getScript(true),
					"\nÿc8MainData ::\n", me.data,
					"\nÿc8BuffData ::\n", CharData.pots,
					"\nÿc8SkillData ::\n", CharData.skillData,
					"\nÿc8GlobalVariabls ::\n", Object.keys(global),
					"\n" + sdk.colors.Red + "//-----------DataDump End-----------//");
			}
			break;
		// ignore common scriptBroadcast messages that aren't relevent to this thread
		case "mule":
		case "muleTorch":
		case "muleAnni":
		case "torch":
		case "crafting":
		case "getMuleMode":
		case "pingquit":
		case "townCheck":
			break;
		default:
			try {
				obj = JSON.parse(msg);
			} catch (e) {
				return;
			}

			if (obj) {
				obj.hasOwnProperty("currScript") && (debugInfo.currScript = obj.currScript);
				obj.hasOwnProperty("lastAction") && (debugInfo.lastAction = obj.lastAction);
				// D2Bot.store(JSON.stringify(debugInfo));
				DataFile.updateStats("debugInfo", JSON.stringify(debugInfo));
			}

			break;
		}
	};

	// Cache variables to prevent a bug where d2bs loses the reference to Config object
	Config = copyObj(Config);
	tick = getTickCount();

	// getUnit test
	getUnit(-1) === null && console.warn("getUnit bug detected");

	addEventListener("keyup", keyEvent);
	addEventListener("gameevent", gameEvent);
	addEventListener("scriptmsg", scriptEvent);

	Config.QuitListMode > 0 && Common.Toolsthread.initQuitList();
	!Array.isArray(Config.QuitList) && (Config.QuitList = [Config.QuitList]);

	let myAct = me.act;

	if (Developer.overlay && !Developer.logPerformance) {
		console.warn("Without logPerformance set, the overlay will only show partial values");
	}

	const Worker = require("../../modules/Worker");
	const diffShort = ["Norm", "Night", "Hell"][me.diff];

	// Start worker - handles overlay and d2bot# profile display
	Worker.runInBackground.display = (new function () {
		let _timeout = 0;
		let gameTracker;

		function timer () {
			const currInGame = (getTickCount() - me.gamestarttime);
			let timeStr = " (Time: " + Time.format(currInGame) + ") ";
			
			if (Developer.displayClockInConsole && Developer.logPerformance) {
				try {
					gameTracker === undefined && (gameTracker = Tracker.readObj(Tracker.GTPath));
					let [tTime, tInGame, tDays] = [
						(gameTracker.Total + currInGame),
						(gameTracker.InGame + currInGame),
						(gameTracker.Total + currInGame)
					];
					let [totalTime, totalInGame, totalDays] = [
						Time.format(tTime),
						Time.format(tInGame),
						Tracker.totalDays(tDays)
					];
					timeStr += ("(Days: " + totalDays + ") (Total: " + totalTime + ") (IG: " + totalInGame + ") (OOG: " + Time.format(gameTracker.OOG) + ")");
				} catch (e) {
					console.log(e);
				}
			}
			return timeStr;
		}
		
		this.run = () => {
			if (getTickCount() - _timeout < 500) return true;
			_timeout = getTickCount();

			if (me.gameReady) {
				// handle d2bot# profile display
				let statusString = "";

				try {
					statusString = [
						(me.name + " | "),
						("Lvl: " + me.charlvl),
						(" (" + Experience.progress() + "%) "),
						("(Diff: " + diffShort + ") "),
						("(A: " + getAreaName(me.area) + ") "),
						("(G: " + me.gold + ") "),
						("(F: " + me.FR + "/C: " + me.CR + "/L: " + me.LR + "/P: " + me.PR + ")"),
					].join("");

					D2Bot.updateStatus(statusString + timer());
				} catch (e) {
					console.error(e);
				}

				// handle overlay
				if (Developer.overlay) {
					if (me.ingame && me.gameReady && me.area) {
						Overlay.update(quitFlag);

						if (me.act !== myAct) {
							Overlay.flush();
							myAct = me.act;
							Overlay.update(quitFlag);
						}
					}
				}
			}

			return true;
		};
	}).run;

	// Start ToolsThread
	while (true) {
		try {
			if (me.gameReady && !me.inTown) {
				// todo - build potion list only once per iteration
				Config.UseHP > 0 && me.hpPercent < Config.UseHP && this.drinkPotion(Common.Toolsthread.pots.Health);
				Config.UseRejuvHP > 0 && me.hpPercent < Config.UseRejuvHP && this.drinkPotion(Common.Toolsthread.pots.Rejuv);

				if (Config.LifeChicken > 0 && me.hpPercent <= Config.LifeChicken && !me.inTown) {
					if (!Developer.hideChickens) {
						D2Bot.printToConsole("Life Chicken (" + me.hp + "/" + me.hpmax + ")" + Attack.getNearestMonster() + " in " + getAreaName(me.area) + ". Ping: " + me.ping, sdk.colors.D2Bot.Red);
					}
					this.exit(true);

					return true;
				}

				Config.UseMP > 0 && me.mpPercent < Config.UseMP && this.drinkPotion(Common.Toolsthread.pots.Mana);
				Config.UseRejuvMP > 0 && me.mpPercent < Config.UseRejuvMP && this.drinkPotion(Common.Toolsthread.pots.Rejuv);

				(me.staminaPercent <= 20 || me.walking) && this.drinkSpecialPotion(sdk.items.StaminaPotion);
				me.getState(sdk.states.Poison) && this.drinkSpecialPotion(sdk.items.AntidotePotion);
				[sdk.states.Frozen, sdk.states.FrozenSolid].some(state => me.getState(state)) && this.drinkSpecialPotion(sdk.items.ThawingPotion);

				if (Config.ManaChicken > 0 && me.mpPercent <= Config.ManaChicken && !me.inTown) {
					!Developer.hideChickens && D2Bot.printToConsole("Mana Chicken: (" + me.mp + "/" + me.mpmax + ") in " + getAreaName(me.area), sdk.colors.D2Bot.Red);
					this.exit(true);

					return true;
				}

				if (Config.IronGolemChicken > 0 && me.necromancer) {
					if (!ironGolem || copyUnit(ironGolem).x === undefined) {
						ironGolem = Common.Toolsthread.getIronGolem();
					}

					if (ironGolem) {
						// ironGolem.hpmax is bugged with BO
						if (ironGolem.hp <= Math.floor(128 * Config.IronGolemChicken / 100)) {
							!Developer.hideChickens && D2Bot.printToConsole("Irom Golem Chicken in " + getAreaName(me.area), sdk.colors.D2Bot.Red);
							this.exit(true);

							return true;
						}
					}
				}

				if (Config.UseMerc) {
					let merc = me.getMerc();
					if (!!merc) {
						let mercHP = getMercHP();

						if (mercHP > 0 && merc.mode !== sdk.monsters.mode.Dead) {
							if (mercHP < Config.MercChicken) {
								!Developer.hideChickens && D2Bot.printToConsole("Merc Chicken in " + getAreaName(me.area), sdk.colors.D2Bot.Red);
								this.exit(true);

								return true;
							}

							mercHP < Config.UseMercHP && this.drinkPotion(Common.Toolsthread.pots.MercHealth);
							mercHP < Config.UseMercRejuv && this.drinkPotion(Common.Toolsthread.pots.MercRejuv);
						}
					}
				}

				if (Config.ViperCheck && getTickCount() - tick >= 250) {
					if (Common.Toolsthread.checkVipers()) {
						D2Bot.printToConsole("Revived Tomb Vipers found. Leaving game.", sdk.colors.D2Bot.Red);
						quitFlag = true;
					}

					tick = getTickCount();
				}

				Common.Toolsthread.checkPing(true) && (quitFlag = true);
			}
		} catch (e) {
			Misc.errorReport(e, "ToolsThread");

			quitFlag = true;
		}

		if (me.maxgametime - (getTickCount() - me.gamestarttime) < 10e3) {
			console.log("Max game time reached");
			quitFlag = true;
		}

		if (quitFlag && canQuit && (typeof quitListDelayTime === "undefined" || getTickCount() >= quitListDelayTime)) {
			Common.Toolsthread.checkPing(false); // In case of quitlist triggering first
			this.exit();

			break;
		}

		!!restart && this.restart();

		if (debugInfo.area !== getAreaName(me.area)) {
			debugInfo.area = getAreaName(me.area);
			DataFile.updateStats("debugInfo", JSON.stringify(debugInfo));
		}

		delay(20);
	}

	return true;
}
