/**
*  @filename    ToolsThread.js
*  @author      kolton, theBGuy (modifed for SoloPlay)
*  @desc        modified Toolsthread for use with Kolbot-SoloPlay
*
*/
js_strict(true);

include("json2.js");
include("NTItemParser.dbl");
include("OOG.js");
include("AutoMule.js");
include("Gambling.js");
include("CraftingSystem.js");
include("TorchSystem.js");
include("MuleLogger.js");
include("common/Attack.js");
include("common/Common.js");
include("common/Cubing.js");
include("common/CollMap.js");
include("common/Config.js");
include("common/misc.js");
include("common/util.js");
include("common/Pickit.js");
include("common/Pather.js");
include("common/Precast.js");
include("common/Prototypes.js");
include("common/Runewords.js");
include("common/Town.js");
include("SoloPlay/Tools/Developer.js");
include("SoloPlay/Tools/Tracker.js");
include("SoloPlay/Functions/Globals.js");

function main () {
	let ironGolem, tick, debugInfo = {area: 0, currScript: "no entry"};
	let pingTimer = [];
	let quitFlag = false;
	let restart = false;
	let quitListDelayTime;
	let canQuit = true;
	let timerLastDrink = [];

	let Overrides = require('../../modules/Override');

	new Overrides.Override(Attack, Attack.getNearestMonster, function (orignal) {
		let monster = orignal({skipBlocked: false, skipImmune: false});
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
	this.checkPing = function (print = false) {
		// Quit after at least 5 seconds in game
		if ((getTickCount() - me.gamestarttime < 5000) || !me.gameReady) {
			return false;
		}

		for (let m = 0; m < Config.PingQuit.length; m += 1) {
			if (Config.PingQuit[m].Ping > 0) {
				if (me.ping >= Config.PingQuit[m].Ping) {
					me.overhead("High Ping");

					if (pingTimer[m] === undefined || pingTimer[m] === 0) {
						pingTimer[m] = getTickCount();
					}

					if (getTickCount() - pingTimer[m] >= Config.PingQuit[m].Duration * 1000) {
						print && D2Bot.printToConsole("High ping (" + me.ping + "/" + Config.PingQuit[m].Ping + ") - leaving game.", 9);
						scriptBroadcast("pingquit");

						return true;
					}
				} else {
					pingTimer[m] = 0;
				}
			}
		}

		return false;
	};

	this.initQuitList = function () {
		let temp = [];

		for (let j = 0; j < Config.QuitList.length; j += 1) {
			if (FileTools.exists("data/" + Config.QuitList[j] + ".json")) {
				let string = Misc.fileAction("data/" + Config.QuitList[j] + ".json", 0);

				if (string) {
					let obj = JSON.parse(string);

					if (obj && obj.hasOwnProperty("name")) {
						temp.push(obj.name);
					}
				}
			}
		}

		Config.QuitList = temp.slice(0);
	};

	this.togglePause = function () {
		let scripts = ["default.dbj", "libs/SoloPlay/Threads/TownChicken.js", "tools/antihostile.js", "tools/party.js", "tools/rushthread.js"];

		for (let l = 0; l < scripts.length; l += 1) {
			let script = getScript(scripts[l]);

			if (script) {
				if (script.running) {
					scripts[l] === "default.dbj" && console.log("ÿc8ToolsThread :: ÿc1Pausing " + scripts[l]);
					scripts[l] === "libs/SoloPlay/Threads/TownChicken.js" && !SoloEvents.cloneWalked && console.log("ÿc8ToolsThread :: ÿc1Pausing " + scripts[l]);

					// don't pause townchicken during clone walk
					if (scripts[l] !== "libs/SoloPlay/Threads/TownChicken.js" || !SoloEvents.cloneWalked) {
						script.pause();
					}
				} else {
					scripts[l] === "default.dbj" && print("ÿc8ToolsThread :: ÿc2Resuming threads");
					script.resume();
				}
			}
		}

		return true;
	};

	this.stopDefault = function () {
		let scripts = [
			"default.dbj", "libs/SoloPlay/Threads/TownChicken.js", "libs/SoloPlay/Threads/EventThread.js",
			"libs/SoloPlay/Threads/AutoBuildThread.js", "libs/SoloPlay/Modules/Guard.js"
		];

		for (let l = 0; l < scripts.length; l += 1) {
			let script = getScript(scripts[l]);
			!!script && script.running && script.stop();
		}

		return true;
	};

	this.exit = function (chickenExit = false) {
		chickenExit && D2Bot.updateChickens();
		Config.LogExperience && Experience.log();
		Developer.logPerformance && Tracker.update();
		console.log("ÿc8Run duration ÿc2" + Developer.formatTime(getTickCount() - me.gamestarttime));
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

		let items = me.getItemsEx().filter(item => item.itemType === pottype && (type > 2 ? item.isInBelt : true));
		if (items.length === 0) return false;

		// Get highest id = highest potion first - todo write this to use invo pots first
		items.sort(function (a, b) {
			return b.classid - a.classid;
		});

		for (let k = 0; k < items.length; k += 1) {
			if (type < 3 && items[k].isInInventory && items[k].itemType === pottype) {
				console.log("ÿc2Drinking potion from inventory.");
				return copyUnit(items[k]);
			}

			if (items[k].mode === 2 && items[k].itemType === pottype) {
				console.log("ÿc2" + (type > 2 ? "Giving Merc" : "Drinking") + " potion from belt.");
				return copyUnit(items[k]);
			}
		}

		return false;
	};

	this.drinkPotion = function (type) {
		if (type === undefined) return false;
		let pottype, tNow = getTickCount();

		switch (type) {
		case 0:
		case 1:
			if ((timerLastDrink[type] && (tNow - timerLastDrink[type] < 1000)) || me.getState(type === 0 ? 100 : 106)) {
				return false;
			}

			break;
		case 2:
			// small delay for juvs just to prevent using more at once
			if (timerLastDrink[type] && (tNow - timerLastDrink[type] < 300)) {
				return false;
			}

			break;
		case 4:
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
		if ([0, 17, 18].includes(me.mode)) return false;

		switch (type) {
		case 0:
		case 3:
			pottype = 76;

			break;
		case 1:
			pottype = 77;

			break;
		default:
			pottype = 78;

			break;
		}

		let potion = this.getPotion(pottype, type);

		if (!!potion) {
			// mode 18 - can't drink while leaping/whirling etc.
			if ([0, 17, 18].includes(me.mode)) return false;

			try {
				if (type < 3) {
					potion.interact();
				} else {
					sendPacket(1, 0x26, 4, potion.gid, 4, 1, 4, 0);
				}
			} catch (e) {
				console.errorReport(e);
			}

			timerLastDrink[type] = getTickCount();
			delay(25);

			return true;
		}

		return false;
	};

	this.drinkSpecialPotion = function (type) {
		if (type === undefined) return false;
		let objID;
		let name = (type === sdk.items.ThawingPotion ? "thawing" : "antidote");

		// mode 18 - can't drink while leaping/whirling etc.
		// give at least a second delay between pots
		if ([0, 17, 18].includes(me.mode) || (getTickCount() - CharData.buffData[name].tick < 1000)) {
			return false;
		}

		let pot = me.getItemsEx().filter((p) => p.isInInventory && p.classid === type).first();
		!!pot && (objID = pot.name.split(' ')[0].toLowerCase());

		if (objID) {
			try {
				pot.interact();
				if (!CharData.buffData[objID].active() || CharData.buffData[objID].timeLeft() <= 0) {
					CharData.buffData[objID].tick = getTickCount();
					CharData.buffData[objID].duration = 3e4;
				} else {
					CharData.buffData[objID].duration += 3e4 - (getTickCount() - CharData.buffData[objID].tick);
				}

				console.debug(CharData.buffData);
			} catch (e) {
				console.warn(e);
			}

			return true;
		}

		return false;
	};

	this.checkVipers = function () {
		let monster = getUnit(1, 597);

		if (monster) {
			do {
				if (monster.getState(96)) {
					let owner = monster.getParent();

					if (owner && owner.name !== me.name) {
						return true;
					}
				}
			} while (monster.getNext());
		}

		return false;
	};

	this.getIronGolem = function () {
		let golem = getUnit(1, 291);

		if (golem) {
			do {
				let owner = golem.getParent();

				if (owner && owner.name === me.name) {
					return copyUnit(golem);
				}
			} while (golem.getNext());
		}

		return false;
	};

	this.getNearestPreset = function () {
		let id;
		let unit = getPresetUnits(me.area);
		let dist = 99;

		for (let n = 0; n < unit.length; n += 1) {
			if (getDistance(me, unit[n].roomx * 5 + unit[n].x, unit[n].roomy * 5 + unit[n].y) < dist) {
				dist = getDistance(me, unit[n].roomx * 5 + unit[n].x, unit[n].roomy * 5 + unit[n].y);
				id = unit[n].type + " " + unit[n].id;
			}
		}

		return id || "";
	};

	this.getStatsString = function (unit) {
		let realFCR = unit.getStat(sdk.stats.FCR);
		let realIAS = unit.getStat(sdk.stats.IAS);
		let realFBR = unit.getStat(sdk.stats.FBR);
		let realFHR = unit.getStat(sdk.stats.FHR);
		// me.getStat(105) will return real FCR from gear + Config.FCR from char cfg

		if (unit === me) {
			realFCR -= Config.FCR;
			realIAS -= Config.IAS;
			realFBR -= Config.FBR;
			realFHR -= Config.FHR;
		}

		let maxHellFireRes = 75 + unit.getStat(sdk.stats.MaxFireResist);
		let hellFireRes = unit.getStat(sdk.stats.FireResist) - me.getResPenalty(sdk.difficulty.Hell);
		hellFireRes > maxHellFireRes && (hellFireRes = maxHellFireRes);

		let maxHellColdRes = 75 + unit.getStat(sdk.stats.MaxColdResist);
		let hellColdRes = unit.getStat(sdk.stats.ColdResist) - me.getResPenalty(sdk.difficulty.Hell);
		hellColdRes > maxHellColdRes && (hellColdRes = maxHellColdRes);

		let maxHellLightRes = 75 + unit.getStat(sdk.stats.MaxLightResist);
		let hellLightRes = unit.getStat(sdk.stats.LightResist) - me.getResPenalty(sdk.difficulty.Hell);
		hellLightRes > maxHellLightRes && (hellLightRes = maxHellLightRes);

		let maxHellPoisonRes = 75 + unit.getStat(sdk.stats.MaxPoisonResist);
		let hellPoisonRes = unit.getStat(sdk.stats.PoisonResist) - me.getResPenalty(sdk.difficulty.Hell);
		hellPoisonRes > maxHellPoisonRes && (hellPoisonRes = maxHellPoisonRes);

		let str =
		"ÿc4Character Level: ÿc0" + unit.charlvl + (unit === me ? " ÿc4Difficulty: ÿc0" + sdk.difficulty.nameOf(me.diff) + " ÿc4HighestActAvailable: ÿc0" + me.highestAct : "") + "\n" +
		"ÿc1FR: ÿc0" + unit.getStat(sdk.stats.FireResist) + "ÿc1 Applied FR: ÿc0" + unit.fireRes +
		"/ÿc3 CR: ÿc0" + unit.getStat(sdk.stats.ColdResist) + "ÿc3 Applied CR: ÿc0" + unit.coldRes +
		"/ÿc9 LR: ÿc0" + unit.getStat(sdk.stats.LightResist) + "ÿc9 Applied LR: ÿc0" + unit.lightRes +
		"/ÿc2 PR: ÿc0" + unit.getStat(sdk.stats.PoisonResist) + "ÿc2 Applied PR: ÿc0" + unit.poisonRes + "\n" +
		(!me.hell ? "Hell res: ÿc1" + hellFireRes + "ÿc0/ÿc3" + hellColdRes + "ÿc0/ÿc9" + hellLightRes + "ÿc0/ÿc2" + hellPoisonRes + "ÿc0\n" : "") +
		"ÿc4MF: ÿc0" + unit.getStat(sdk.stats.MagicBonus) + "ÿc4 GF: ÿc0" + unit.getStat(sdk.stats.GoldBonus) +
		" ÿc4FCR: ÿc0" + realFCR + " ÿc4IAS: ÿc0" + realIAS + " ÿc4FBR: ÿc0" + realFBR +
		" ÿc4FHR: ÿc0" + realFHR + " ÿc4FRW: ÿc0" + unit.getStat(sdk.stats.FRW) + "\n" +
		"ÿc4CB: ÿc0" + unit.getStat(sdk.stats.CrushingBlow) + " ÿc4DS: ÿc0" + unit.getStat(sdk.stats.DeadlyStrike) +
		" ÿc4OW: ÿc0" + unit.getStat(sdk.stats.OpenWounds) +
		" ÿc1LL: ÿc0" + unit.getStat(sdk.stats.LifeLeech) + " ÿc3ML: ÿc0" + unit.getStat(sdk.stats.ManaLeech) +
		" ÿc8DR: ÿc0" + unit.getStat(sdk.stats.DamageResist) + "% + " + unit.getStat(sdk.stats.NormalDamageReduction) +
		" ÿc8MDR: ÿc0" + unit.getStat(sdk.stats.MagicResist) + "% + " + unit.getStat(sdk.stats.MagicDamageReduction) + "\n" +
		(unit.getStat(sdk.stats.CannotbeFrozen) > 0 ? "ÿc3Cannot be Frozenÿc1\n" : "\n");

		return str;
	};

	// Event functions
	this.keyEvent = function (key) {
		switch (key) {
		case 19: // Pause/Break key
			this.togglePause();

			break;
		case 96: // numpad 0
			Developer.logPerformance && Tracker.update();
			print("ÿc8Kolbot-SoloPlay: ÿc1Stopping profile");
			delay(rand(2e3, 5e3));
			D2Bot.stop(me.profile, true);

			break;
		case 35: // End key
			Developer.logEquipped ? MuleLogger.logEquippedItems() : MuleLogger.logChar();
			Developer.logPerformance && Tracker.update();

			delay(rand(Config.QuitListDelay[0] * 1e3, Config.QuitListDelay[1] * 1e3));
			D2Bot.printToConsole(me.profile + " - end run " + me.gamename);
			D2Bot.stop(me.profile, true);

			break;
		case 45: // Ins key
			me.overhead("Revealing " + Pather.getAreaName(me.area));
			revealLevel(true);

			break;
		case 107: // Numpad +
			showConsole();

			print("ÿc8My stats :: " + this.getStatsString(me));
			let merc = me.getMerc();
			!!merc && print("ÿc8Merc stats :: " + this.getStatsString(merc));
			console.log("//------ÿc8SoloWants.needListÿc0-----//");
			console.log(SoloWants.needList);

			break;
		case 101: // numpad 5
			if (AutoMule.getInfo() && AutoMule.getInfo().hasOwnProperty("muleInfo")) {
				if (AutoMule.getMuleItems().length > 0) {
					print("ÿc2Mule triggered");
					scriptBroadcast("mule");
					this.exit();

				} else {
					me.overhead("No items to mule.");
				}
			} else {
				me.overhead("Profile not enabled for muling.");
			}

			break;
		case 102: // Numpad 6
			Developer.logEquipped ? MuleLogger.logEquippedItems() : MuleLogger.logChar();
			me.overhead("Logged char: " + me.name);

			break;
		case 109: // Numpad -
			{
				let itemToCheck = getUnit(101);
				if (!!itemToCheck) {
					D2Bot.printToConsole('getTier: ' + NTIP.GetTier(itemToCheck));
					D2Bot.printToConsole('tierscore: ' + tierscore(itemToCheck));
					D2Bot.printToConsole('getSecondaryTier: ' + NTIP.GetSecondaryTier(itemToCheck));
					D2Bot.printToConsole('secondarytierscore: ' + secondaryscore(itemToCheck));
					D2Bot.printToConsole('charmTier: ' + NTIP.GetCharmTier(itemToCheck));
					D2Bot.printToConsole('charmscore: ' + charmscore(itemToCheck));
					D2Bot.printToConsole('getMercTier: ' + NTIP.GetMercTier(itemToCheck));
					D2Bot.printToConsole('mercscore: ' + mercscore(itemToCheck));
					print(itemToCheck.fname + " info printed to console");
				}
			}

			break;
		case 110: // numpad decimal point
			{
				let itemString = "";
				let charmString = "";
				let generalString = "";
				let itemToCheck = getUnit(101);
				if (!!itemToCheck) {
					itemString = "ÿc4MaxQuantity: ÿc0" + NTIP.getMaxQuantity(itemToCheck) + " | ÿc4ItemsOwned: ÿc0" + Item.getQuantityOwned(itemToCheck) + " | ÿc4Tier: ÿc0" + NTIP.GetTier(itemToCheck)
						+ " | ÿc4SecondaryTier: ÿc0" + NTIP.GetSecondaryTier(itemToCheck) + " | ÿc4MercTier: ÿc0" + NTIP.GetMercTier(itemToCheck) + "\n"
						+ "ÿc4AutoEquipKeepCheck: ÿc0" + Item.autoEquipKeepCheck(itemToCheck) + " | ÿc4AutoEquipCheckSecondary: ÿc0" + Item.autoEquipCheckSecondary(itemToCheck)
						+ " | ÿc4AutoEquipKeepCheckMerc: ÿc0" + Item.autoEquipKeepCheckMerc(itemToCheck) + "\nÿc4Cubing Item: ÿc0" + Cubing.keepItem(itemToCheck)
						+ " | ÿc4Runeword Item: ÿc0" + Runewords.keepItem(itemToCheck) + " | ÿc4Crafting Item: ÿc0" + CraftingSystem.keepItem(itemToCheck) + " | ÿc4SoloWants Item: ÿc0" + SoloWants.keepItem(itemToCheck)
						+ "\nÿc4ItemType: ÿc0" + itemToCheck.itemType + "| ÿc4Classid: ÿc0" + itemToCheck.classid + "| ÿc4Quality: ÿc0" + itemToCheck.quality;
					charmString = "ÿc4InvoQuantity: ÿc0" + NTIP.getInvoQuantity(itemToCheck) + " | ÿc4hasStats: ÿc0" + NTIP.hasStats(itemToCheck) + " | ÿc4FinalCharm: ÿc0" + Item.isFinalCharm(itemToCheck) + "\n"
						+ "ÿc4CharmType: ÿc0" + Item.getCharmType(itemToCheck) + " | ÿc4AutoEquipCharmCheck: ÿc0" + Item.autoEquipCharmCheck(itemToCheck) + " | ÿc4CharmTier: ÿc0" + NTIP.GetCharmTier(itemToCheck);
					generalString = "ÿc4ItemName: ÿc0" + itemToCheck.fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, "")
						+ "\nÿc4Pickit: ÿc0" + Pickit.checkItem(itemToCheck).result + " | ÿc4NTIP.CheckItem: ÿc0" + NTIP.CheckItem(itemToCheck, false, true).result + " | ÿc4NTIP.CheckItem No Tier: ÿc0" + NTIP.CheckItem(itemToCheck, NTIP_CheckListNoTier, true).result;
				}
				
				print("ÿc8Kolbot-SoloPlay: ÿc2Item Info Start");
				print(itemString);
				print("ÿc8Kolbot-SoloPlay: ÿc2Charm Info Start");
				print(charmString);
				print("ÿc8Kolbot-SoloPlay: ÿc2General Info Start");
				print(generalString);
				print("ÿc8Kolbot-SoloPlay: ÿc1****************Info End****************");
			}

			break;
		case 105: // numpad 9 - get nearest preset unit id
			console.log(this.getNearestPreset());

			break;
		case 106: // numpad * - precast
			Precast.doPrecast(true);

			break;
		case 111: // numpad / - re-load default
			print("ÿc8ToolsThread :: " + sdk.colors.Red + "Stopping threads and waiting 5 seconds to restart");
			this.stopDefault() && delay(5e3);
			print('Starting default.dbj');
			load('default.dbj');

			break;
		}
	};

	this.gameEvent = function (mode, param1, param2, name1, name2) {
		switch (mode) {
		case 0x00: // "%Name1(%Name2) dropped due to time out."
		case 0x01: // "%Name1(%Name2) dropped due to errors."
		case 0x03: // "%Name1(%Name2) left our world. Diablo's minions weaken."
			if ((typeof Config.QuitList === "string" && Config.QuitList.toLowerCase() === "any")
				|| (Config.QuitList instanceof Array && Config.QuitList.indexOf (name1) > -1)) {
				console.log(name1 + (mode === 0 ? " timed out" : " left"));

				if (typeof Config.QuitListDelay !== "undefined" && typeof quitListDelayTime === "undefined" && Config.QuitListDelay.length > 0) {
					Config.QuitListDelay.sort(function (a, b) {
						return a - b;
					});
					quitListDelayTime = getTickCount() + rand(Config.QuitListDelay[0] * 1e3, Config.QuitListDelay[1] * 1e3);
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
				!!me.gameserverip && D2Bot.printToConsole(param1 + " Stones of Jordan Sold to Merchants on IP " + me.gameserverip.split(".")[3], 7);
				Messaging.sendToScript("default.dbj", "soj");
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
				D2Bot.printToConsole("Diablo Walks the Earth", 7);
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

	this.scriptEvent = function (msg) {
		let obj;

		if (msg && typeof msg === "string" && msg !== "") {
			let updated = false;
			switch (true) {
			case msg.substring(0, 8) === "config--":
				console.debug("update config");
				Config = JSON.parse(msg.split("config--")[1]);
				updated = true;

				break;
			case msg.substring(0, 7) === "skill--":
				console.debug("update skillData");
				obj = JSON.parse(msg.split("skill--")[1]);
				Misc.updateRecursively(CharData.skillData, obj);
				updated = true;

				break;
			case msg.substring(0, 6) === "data--":
				console.debug("update myData");
				obj = JSON.parse(msg.split("data--")[1]);
				Misc.updateRecursively(myData, obj);
				updated = true;

				break;
			case msg.toLowerCase() === "test":
				console.debug(sdk.colors.Green + "//-----------DataDump Start-----------//\nÿc8MainData ::\n",
					myData, "\nÿc8BuffData ::\n", CharData.buffData, "\nÿc8SkillData ::\n", CharData.skillData, "\n" + sdk.colors.Red + "//-----------DataDump End-----------//");
				updated = true;

				break;
			}

			if (updated) return;
		}

		switch (msg) {
		case "toggleQuitlist":
			canQuit = !canQuit;

			break;
		case "quit":
			quitFlag = true;

			break;
		case "restart":
			restart = true;

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

				//D2Bot.store(JSON.stringify(debugInfo));
				DataFile.updateStats("debugInfo", JSON.stringify(debugInfo));
			}

			break;
		}
	};

	// Cache variables to prevent a bug where d2bs loses the reference to Config object
	Config = Misc.copy(Config);
	tick = getTickCount();

	addEventListener("keyup", this.keyEvent);
	addEventListener("gameevent", this.gameEvent);
	addEventListener("scriptmsg", this.scriptEvent);
	addEventListener("scriptmsg", Tracker.logLeveling);

	// Load Fastmod - patched
	// Packet.changeStat(105, Config.FCR);
	// Packet.changeStat(99, Config.FHR);
	// Packet.changeStat(102, Config.FBR);
	// Packet.changeStat(93, Config.IAS);

	Config.QuitListMode > 0 && this.initQuitList();

	let myAct = me.act;

	// Start
	while (true) {
		try {
			if (me.gameReady && !me.inTown) {
				Config.UseHP > 0 && me.hpPercent < Config.UseHP && this.drinkPotion(0);
				Config.UseRejuvHP > 0 && me.hpPercent < Config.UseRejuvHP && this.drinkPotion(2);

				if (Config.LifeChicken > 0 && me.hpPercent <= Config.LifeChicken && !me.inTown) {
					!Developer.hideChickens && D2Bot.printToConsole("Life Chicken (" + me.hp + "/" + me.hpmax + ")" + Attack.getNearestMonster() + " in " + Pather.getAreaName(me.area) + ". Ping: " + me.ping, 9);
					this.exit(true);

					break;
				}

				Config.UseMP > 0 && me.mpPercent < Config.UseMP && this.drinkPotion(1);
				Config.UseRejuvMP > 0 && me.mpPercent < Config.UseRejuvMP && this.drinkPotion(2);

				me.getState(sdk.states.Poison) && this.drinkSpecialPotion(sdk.items.AntidotePotion);
				[sdk.states.Frozen, sdk.states.FrozenSolid].some(state => me.getState(state)) && this.drinkSpecialPotion(sdk.items.ThawingPotion);

				if (Config.ManaChicken > 0 && me.mpPercent <= Config.ManaChicken && !me.inTown) {
					!Developer.hideChickens && D2Bot.printToConsole("Mana Chicken: (" + me.mp + "/" + me.mpmax + ") in " + Pather.getAreaName(me.area), 9);
					this.exit(true);

					break;
				}

				if (Config.IronGolemChicken > 0 && me.necromancer) {
					if (!ironGolem || copyUnit(ironGolem).x === undefined) {
						ironGolem = this.getIronGolem();
					}

					if (ironGolem) {
						// ironGolem.hpmax is bugged with BO
						if (ironGolem.hp <= Math.floor(128 * Config.IronGolemChicken / 100)) {
							!Developer.hideChickens && D2Bot.printToConsole("Irom Golem Chicken in " + Pather.getAreaName(me.area), 9);
							this.exit(true);

							break;
						}
					}
				}

				if (Config.UseMerc) {
					let merc = me.getMerc();
					if (!!merc) {
						let mercHP = getMercHP();

						if (mercHP > 0 && merc.mode !== 12) {
							if (mercHP < Config.MercChicken) {
								!Developer.hideChickens && D2Bot.printToConsole("Merc Chicken in " + Pather.getAreaName(me.area), 9);
								this.exit(true);

								break;
							}

							mercHP < Config.UseMercHP && this.drinkPotion(3);
							mercHP < Config.UseMercRejuv && this.drinkPotion(4);
						}
					}
				}

				if (Config.ViperCheck && getTickCount() - tick >= 250) {
					if (this.checkVipers()) {
						D2Bot.printToConsole("Revived Tomb Vipers found. Leaving game.", 9);
						quitFlag = true;
					}

					tick = getTickCount();
				}

				this.checkPing(true) && (quitFlag = true);
			}
		} catch (e) {
			Misc.errorReport(e, "ToolsThread");

			quitFlag = true;
		}

		if (me.maxgametime - (getTickCount() - me.gamestarttime) < 10e3) {
			print("Max game time reached");
			quitFlag = true;
		}

		// should overlay be moved to be a background worker?
		if (Developer.overlay) {
			if (Developer.logPerformance) {
				if (me.ingame && me.gameReady && me.area) {
					Overlay.update(quitFlag);

					if (me.act !== myAct) {
						Overlay.flush();
						myAct = me.act;
					}
				}
			} else {
				D2Bot.printToConsole('Overlay cannot work without Developer.logPerformance = true;', 4);
			}
		}

		if (quitFlag && canQuit && (typeof quitListDelayTime === "undefined" || getTickCount() >= quitListDelayTime)) {
			this.checkPing(false); // In case of quitlist triggering first
			this.exit();

			break;
		}

		!!restart && this.restart();

		if (debugInfo.area !== Pather.getAreaName(me.area)) {
			debugInfo.area = Pather.getAreaName(me.area);
			DataFile.updateStats("debugInfo", JSON.stringify(debugInfo));
		}

		delay(20);
	}

	return true;
}
