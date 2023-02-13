/**
*  @filename    Globals.js
*  @author      theBGuy
*  @credit      alogwe
*  @desc        Global functions for Kolbot-SoloPlay functionality
*
*/

/**
 * @todo
 *  - split up this file into appropriate sections
 */

// all we really need from oog is D2Bot
includeIfNotIncluded("oog/D2Bot.js");
includeIfNotIncluded("SoloPlay/Tools/Developer.js");
includeIfNotIncluded("SoloPlay/Tools/CharData.js");
includeIfNotIncluded("SoloPlay/Functions/PrototypeOverrides.js");

// not every thread needs these
/** @global */
const Overrides = require("../../modules/Override");
/** @global */
const Coords_1 = require("../Modules/Coords");
/** @global */
const PotData = require("../modules/PotData");
/** @global */
const GameData = require("../Modules/GameData");
/** @global */
const AreaData = require("../Modules/AreaData");

const MYCLASSNAME = sdk.player.class.nameOf(me.classid).toLowerCase();
includeIfNotIncluded("SoloPlay/BuildFiles/" + MYCLASSNAME + "/" + MYCLASSNAME + ".js");

/** 
 * @global
 * @type {charData}
 */
let myData = CharData.getStats();

Unit.prototype.__defineGetter__("mercid", function () {
	return !!myData ? myData.merc.classid : me.getMerc().classid;
});

Unit.prototype.__defineGetter__("trueStr", function () {
	return !!myData ? myData.me.strength : me.rawStrength;
});

Unit.prototype.__defineGetter__("trueDex", function () {
	return !!myData ? myData.me.dexterity : me.rawDexterity;
});

function myPrint (str = "", toConsole = false, color = 0) {
	console.log("ÿc8Kolbot-SoloPlayÿc0: " + str);
	me.overhead(str);

	if (toConsole && typeof color === "string") {
		color = color.capitalize(true);
		color = !!sdk.colors.D2Bot[color] ? sdk.colors.D2Bot[color] : 0;
	}
	toConsole && D2Bot.printToConsole("Kolbot-SoloPlay :: " + str, color);
}

function updateMyData () {
	let obj = JSON.stringify(copyObj(myData));
	let myThread = getScript(true).name;
	CharData.threads.forEach(function (script) {
		let curr = getScript(script);
		if (curr && myThread !== curr.name) {
			curr.send("data--" + obj);
		}
	});
}

// general settings
const SetUp = {
	mercEnabled: true,

	init: function () {
		let myData = CharData.getStats();

		if (!myData.initialized) {
			myData.me.startTime = me.gamestarttime;
			myData.me.level = me.charlvl;
			myData.me.classid = me.classid;
			myData.me.charName = me.name;
			myData.me.strength = me.rawStrength;
			myData.me.dexterity = me.rawDexterity;
			
			if (me.expansion) {
				myData.me.charms = Check.finalBuild().finalCharms;
			}

			myData.initialized = true;
			CharData.updateData("me", myData);
		}

		let temp = copyObj(myData);

		if (myData.me.currentBuild !== CharInfo.getActiveBuild()) {
			myData.me.currentBuild = CharInfo.getActiveBuild();
		}

		let currDiffStr = sdk.difficulty.nameOf(me.diff).toLowerCase();

		if (sdk.difficulty.Difficulties.indexOf(myData.me.highestDifficulty) < sdk.difficulty.Difficulties.indexOf(sdk.difficulty.nameOf(me.diff))) {
			myData.me.highestDifficulty = sdk.difficulty.nameOf(me.diff);
		}

		if (!!me.smith && myData[currDiffStr].imbueUsed === false) {
			myData[currDiffStr].imbueUsed = true;
		}

		if (!!me.respec && myData[currDiffStr].respecUsed === false) {
			myData[currDiffStr].respecUsed = true;
		}

		myData.me.level !== me.charlvl && (myData.me.level = me.charlvl);
		myData.me.strength !== me.rawStrength && (myData.me.strength = me.rawStrength);
		myData.me.dexterity !== me.rawDexterity && (myData.me.dexterity = me.rawDexterity);

		// expansion check
		let [cUpdate, mUpdate] = [false, false];

		if (me.expansion) {
			if (!myData.merc.gear) {
				myData.merc.gear = [];
				mUpdate = true;
			}
			
			// merc check
			if (me.getMercEx()) {
				// TODO: figure out how to ensure we are already using the right merc to prevent re-hiring
				// can't do an aura check as merc auras are bugged, only useful info from getUnit is the classid
				let merc = me.getMercEx();
				let mercItems = merc.getItemsEx();
				let preLength = myData.merc.gear.length;
				let check = myData.merc.gear.filter(i => mercItems.some(item => item.prefixnum === i));

				if (check !== preLength) {
					mUpdate = true;
					myData.merc.gear = check;
				}

				let mercInfo = Mercenary.getMercInfo(merc);
				mercInfo.classid !== myData.merc.classid && (myData.merc.classid = mercInfo.classid);
				mercInfo.act !== myData.merc.act && (myData.merc.act = mercInfo.act);
				mercInfo.difficulty !== myData.merc.difficulty && (myData.merc.difficulty = mercInfo.difficulty);

				if (merc.classid === sdk.mercs.Guard && !Mercenary.checkMercSkill(myData.merc.type)) {
				// go back, need to make sure this works properly.
				// only "go back" if we are past the difficulty we need to be in to hire merc. Ex. In hell but want holy freeze merc
				// only if we have enough gold on hand to hire said merc
				// return to our orignal difficulty afterwards
				}
			}

			// charm check
			if (!myData.me.charms || !Object.keys(myData.me.charms).length) {
				myData.me.charms = Check.finalBuild().finalCharms;
				cUpdate = true;
			}

			if (!myData.me.charmGids || myData.me.charmGids.length > 0) {
				myData.me.charmGids = [];
				cUpdate = true;
			}

			const finalCharmKeys = Object.keys(myData.me.charms);
			// gids change from game to game so reset our list
			for (let i = 0; i < finalCharmKeys.length; i++) {
				let cKey = finalCharmKeys[i];
				if (myData.me.charms[cKey].have.length) {
					myData.me.charms[cKey].have = [];
					cUpdate = true;
				}
			}

			if (!!me.shenk && myData[currDiffStr].socketUsed === false) {
				myData[currDiffStr].socketUsed = true;
			}

			if (mUpdate) {
				CharData.updateData("merc", myData);
			}
		}

		let changed = Misc.recursiveSearch(myData, temp);
	
		if (Object.keys(changed).length > 0 || cUpdate) {
			CharData.updateData("me", myData);
		}
	},

	// Should this be moved elsewhere? Currently have to include Globals then call this to include rest of overrides
	// which in doing so would include globals anyway but does this always need to be included first?
	// really need a centralized way to make sure all files use/have the custom functions and all threads stay updated without having to
	// scriptBroadcast all the time
	include: function () {
		let files = dopen("libs/SoloPlay/Functions/").getFiles();
		if (!files.length) throw new Error("Failed to find my files");
		if (!files.includes("Globals.js")) {
			console.warn("Incorrect Files?", files);
			// something went wrong?
			while (!files.includes("Globals.js")) {
				files = dopen("libs/SoloPlay/Functions/").getFiles();
				delay(50);
			}
		}
		Array.isArray(files) && files
			.filter(file => file.endsWith(".js"))
			.sort(a => a.startsWith("PrototypeOverrides.js") ? 0 : 1) // Dirty fix to load new prototypes first
			.forEach(function (x) {
				if (!isIncluded("SoloPlay/Functions/" + x)) {
					if (!include("SoloPlay/Functions/" + x)) {
						throw new Error("Failed to include " + "SoloPlay/Functions/" + x);
					}
				}
			});
	},

	// Storage Settings
	sortSettings: {
		ItemsSortedFromLeft: [], // default: everything not in Config.ItemsSortedFromRight
		ItemsSortedFromRight: [
			// (NOTE: default pickit is fastest if the left side is open)
			sdk.items.SmallCharm, sdk.items.LargeCharm, sdk.items.GrandCharm, // sort charms from the right
			sdk.items.TomeofIdentify, sdk.items.TomeofTownPortal, sdk.items.Key, // sort tomes and keys to the right
			// sort all inventory potions from the right
			sdk.items.RejuvenationPotion, sdk.items.FullRejuvenationPotion,
			sdk.items.MinorHealingPotion, sdk.items.LightHealingPotion, sdk.items.HealingPotion, sdk.items.GreaterHealingPotion, sdk.items.SuperHealingPotion,
			sdk.items.MinorManaPotion, sdk.items.LightManaPotion, sdk.items.ManaPotion, sdk.items.GreaterManaPotion, sdk.items.SuperManaPotion
		],
		PrioritySorting: true,
		ItemsSortedFromLeftPriority: [/*605, 604, 603, 519, 518*/], // (NOTE: the earlier in the index, the further to the Left)
		ItemsSortedFromRightPriority: [
			// (NOTE: the earlier in the index, the further to the Right)
			// sort charms from the right, GC > LC > SC
			sdk.items.GrandCharm, sdk.items.LargeCharm, sdk.items.SmallCharm,
			sdk.items.TomeofIdentify, sdk.items.TomeofTownPortal, sdk.items.Key
		],
	},

	currentBuild: this.currentBuild,
	finalBuild: this.finalBuild,

	// setter for Developer option to stop a profile once it reaches a certain level
	stopAtLevel: (function () {
		if (!Developer.stopAtLevel.enabled) return false;
		let level = Developer.stopAtLevel.profiles.find(profile => profile[0].toLowerCase() === me.profile.toLowerCase()) || false;
		return level ? level[1] : false;
	})(),

	// pulls respec requirments from final build file
	finalRespec: function () {
		let respec = Check.finalBuild().respec() ? me.charlvl : 100;

		if (respec === me.charlvl && me.charlvl < 60) {
			showConsole();
			console.log("ÿc8Kolbot-SoloPlayÿc0: Bot has respecTwo items but is too low a level to respec.");
			console.log("ÿc8Kolbot-SoloPlayÿc0: This only happens with user intervention. Remove the items you gave the bot until at least level 60");
			respec = 100;
		}

		return respec;
	},

	getTemplate: function () {
		let build = SetUp.currentBuild + "Build" ;
		let template = "SoloPlay/BuildFiles/" + MYCLASSNAME + "/" + MYCLASSNAME + "." + build + ".js";

		return {
			buildType: SetUp.currentBuild,
			template: template.toLowerCase()
		};
	},

	specPush: function (specType) {
		let buildInfo = SetUp.getTemplate();
		if (!includeIfNotIncluded(buildInfo.template)) throw new Error("Failed to include template: " + buildInfo.template);

		let specCheck = [];
		let final = buildInfo.buildType === SetUp.finalBuild;

		switch (specType) {
		case "skills":
			// Push skills value from template file
			specCheck = JSON.parse(JSON.stringify((final ? finalBuild.skills : build.skills)));

			break;
		case "stats":
			// Push stats value from template file
			specCheck = JSON.parse(JSON.stringify((final ? finalBuild.stats : build.stats)));

			break;
		}

		return specCheck;
	},

	makeNext: function () {
		includeIfNotIncluded("SoloPlay/Tools/Tracker.js");
		let gameObj, printTotalTime = Developer.logPerformance;
		printTotalTime && (gameObj = Tracker.readObj(Tracker.GTPath));

		// log info
		myPrint(this.finalBuild + " goal reached. On to the next.");
		D2Bot.printToConsole("Kolbot-SoloPlay: " + this.finalBuild + " goal reached" + (printTotalTime ? " (" + (Tracker.formatTime(gameObj.Total + Tracker.timer(gameObj.LastSave))) + "). " : ". ") + "Making next...", sdk.colors.D2Bot.Gold);

		D2Bot.setProfile(null, null, require("../Tools/NameGen")());
		CharData.delete(true);
		delay(250);
		D2Bot.restart();
	},

	belt: function () {
		let beltSlots = Math.max(1, Storage.BeltSize() - 1);
		Config.BeltColumn.forEach(function (col, index) {
			Config.MinColumn[index] = col.toLowerCase() !== "rv" ? beltSlots : 0;
		});
	},

	buffers: function () {
		const isCaster = Check.currentBuild().caster;
		const beltModifer = 4 - Storage.BeltSize();
		const mpFactor = isCaster ? 80 : 50;
		Config.MPBuffer = Math.floor(mpFactor / Math.sqrt(me.mpmax)) + (beltModifer * 2);
		!myData.merc.gear.includes(sdk.locale.items.Insight) && (Config.MPBuffer += 2);
		const hpFactor = isCaster ? 65 : 80;
		Config.HPBuffer = Math.floor(hpFactor / Math.sqrt(me.hpmax)) + (beltModifer * 2);
	},

	bowQuiver: function () {
		NTIP.resetRuntimeList();
		if (CharData.skillData.bowData.bowOnSwitch) {
			if ([sdk.items.type.Bow, sdk.items.type.AmazonBow].includes(CharData.skillData.bowData.bowType)) {
				NTIP.addToRuntime("[type] == bowquiver # # [maxquantity] == 1");
			} else if (CharData.skillData.bowData.bowType === sdk.items.type.Crossbow) {
				NTIP.addToRuntime("[type] == crossbowquiver # # [maxquantity] == 1");
			} else if (me.charlvl < 10) {
				NTIP.addToRuntime("[type] == bowquiver # # [maxquantity] == 1");
			}
		}
	},

	imbueItems: function () {
		if (SetUp.finalBuild === "Imbuemule") return [];
		let temp = [];
		for (let imbueItem of Config.imbueables) {
			try {
				if (imbueItem.condition()) {
					temp.push("[name] == " + imbueItem.name + " && [quality] >= normal && [quality] <= superior && [flag] != ethereal # [Sockets] == 0 # [maxquantity] == 1");
				}
			} catch (e) {
				console.log(e);
			}
		}
		return temp;
	},

	config: function () {
		Config.socketables = [];

		if (me.expansion) {
			if (Storage.Stash === undefined) {
				Storage.Init();
			}
			// sometimes it seems hard to find skillers, if we have the room lets try to cube some
			if (Storage.Stash.UsedSpacePercent() < 60 && Item.autoEquipGC().keep.length < CharData.charmData.grand.getCountInfo().max) {
				Config.Recipes.push([Recipe.Reroll.Magic, "Grand Charm"]);
			}
			// switch bow - only for zon/sorc/pal/necro classes right now
			if (!me.barbarian && !me.assassin && !me.druid) {
				NTIP.addLine("([type] == bow || [type] == crossbow) && [quality] >= normal # [itemchargedskill] >= 0 # [secondarytier] == tierscore(item)");
			}
			const expansionExtras = [
				// Special Charms
				"[name] == smallcharm && [quality] == unique # [itemallskills] == 1 # [charmtier] == 100000",
				"[name] == largecharm && [quality] == unique # [itemaddclassskills] == 3 # [charmtier] == 100000",
				"[name] == grandcharm && [quality] == unique # [itemmagicbonus] >= 30 || [itemgoldbonus] >= 150 # [charmtier] == 100000",
				// Merc
				"([type] == circlet || [type] == helm) && ([quality] >= magic || [flag] == runeword) # [itemchargedskill] >= 0 # [Merctier] == mercscore(item)",
				"[type] == armor && ([quality] >= magic || [flag] == runeword) # [itemchargedskill] >= 0 # [Merctier] == mercscore(item)",
				// Rogue
				"me.mercid === 271 && [type] == bow && ([quality] >= magic || [flag] == runeword) # [itemchargedskill] >= 0 # [Merctier] == mercscore(item)",
				// A2 Guard
				"me.mercid === 338 && ([type] == polearm || [type] == spear) && ([quality] >= magic || [flag] == runeword) # [itemchargedskill] >= 0 # [Merctier] == mercscore(item)",
			];
			NTIP.buildList(expansionExtras);
			this.bowQuiver();
		}

		/* General configuration. */
		Config.MinGameTime = 400;
		Config.MaxGameTime = 7200;
		Config.MiniShopBot = true;
		Config.PacketShopping = true;
		Config.TownCheck = true;
		Config.LogExperience = false;
		Config.PingQuit = [{Ping: 600, Duration: 10}];
		Config.Silence = true;
		Config.OpenChests.Enabled = true;
		Config.LowGold = me.normal ? 25000 : me.nightmare ? 50000 : 100000;
		Config.PrimarySlot = 0;
		Config.PacketCasting = 1;
		Config.WaypointMenu = true;
		Config.Cubing = !!me.getItem(sdk.items.quest.Cube);
		Config.MakeRunewords = true;

		/* Shrine scan configuration. */
		if (Check.currentBuild().caster) {
			Config.ScanShrines = [
				sdk.shrines.Refilling, sdk.shrines.Health, sdk.shrines.Mana, sdk.shrines.Gem, sdk.shrines.Monster, sdk.shrines.HealthExchange,
				sdk.shrines.ManaExchange, sdk.shrines.Experience, sdk.shrines.Armor, sdk.shrines.ResistFire, sdk.shrines.ResistCold,
				sdk.shrines.ResistLightning, sdk.shrines.ResistPoison, sdk.shrines.Skill, sdk.shrines.ManaRecharge, sdk.shrines.Stamina
			];
		} else {
			Config.ScanShrines = [
				sdk.shrines.Refilling, sdk.shrines.Health, sdk.shrines.Mana, sdk.shrines.Gem, sdk.shrines.Monster, sdk.shrines.HealthExchange,
				sdk.shrines.ManaExchange, sdk.shrines.Experience, sdk.shrines.Combat, sdk.shrines.Skill, sdk.shrines.Armor, sdk.shrines.ResistFire,
				sdk.shrines.ResistCold, sdk.shrines.ResistLightning, sdk.shrines.ResistPoison, sdk.shrines.ManaRecharge, sdk.shrines.Stamina
			];
		}

		/* General logging. */
		Config.ItemInfo = false;
		Config.LogKeys = false;
		Config.LogOrgans = false;
		Config.LogMiddleRunes = true;
		Config.LogHighRunes = true;
		Config.ShowCubingInfo = true;

		/* DClone. */
		Config.StopOnDClone = !!me.expansion;
		Config.SoJWaitTime = 5; // Time in minutes to wait for another SoJ sale before leaving game. 0 = disabled
		Config.KillDclone = !!me.expansion;
		Config.DCloneQuit = false;

		/* Town configuration. */
		Config.HealHP = 99;
		Config.HealMP = 99;
		Config.HealStatus = true;
		Config.UseMerc = me.expansion;
		Config.MercWatch = SetUp.mercwatch;
		Config.StashGold = me.charlvl * 100;
		Config.ClearInvOnStart = false;

		/* Inventory buffers and lock configuration. */
		Config.HPBuffer = 0;
		Config.MPBuffer = 0;
		Config.RejuvBuffer = 4;
		Config.Inventory[0] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
		Config.Inventory[1] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
		Config.Inventory[2] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
		Config.Inventory[3] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

		Config.SkipId.push(sdk.monsters.FireTower);

		/* FastMod configuration. */
		Config.FCR = 0;
		Config.FHR = 0;
		Config.FBR = 0;
		Config.IAS = 0;

		/* AutoStat configuration. */
		Config.AutoStat.Enabled = true;
		Config.AutoStat.Save = 0;
		Config.AutoStat.BlockChance = me.paladin ? 75 : 57;
		Config.AutoStat.UseBulk = true;
		Config.AutoStat.Build = SetUp.specPush("stats");

		/* AutoSkill configuration. */
		Config.AutoSkill.Enabled = true;
		Config.AutoSkill.Save = 0;
		Config.AutoSkill.Build = SetUp.specPush("skills");

		/* AutoBuild configuration. */
		Config.AutoBuild.Enabled = true;
		Config.AutoBuild.Verbose = false;
		Config.AutoBuild.DebugMode = false;
		Config.AutoBuild.Template = SetUp.currentBuild;
	}
};

Object.defineProperties(SetUp, {
	currentBuild: {
		get: function () {
			return myData.me.currentBuild;
		},
	},
	finalBuild: {
		get: function () {
			return myData.me.finalBuild;
		},
	},
	mercwatch: {
		get: function () {
			const myGold = me.gold;
			const cLvl = me.charlvl;
			let lowGold = Math.min(Math.floor(500 + (cLvl * 150 * Math.sqrt(cLvl - 1))), 250000);
			return (SetUp.mercEnabled && (myGold > lowGold) && (myGold > me.mercrevivecost));
		}
	},
});

// misc
const goToDifficulty = function (diff = undefined, reason = "") {
	try {
		if (diff === undefined) throw new Error("diff is undefined");
		
		let diffString;
		switch (typeof diff) {
		case "string":
			diff = diff.capitalize(true);
			if (!sdk.difficulty.Difficulties.includes(diff)) throw new Error("difficulty doesn't exist" + diff);
			if (sdk.difficulty.Difficulties.indexOf(diff) === me.diff) throw new Error("already in this difficulty" + diff);
			diffString = diff;

			break;
		case "number":
			if (diff === me.diff || diff < 0) throw new Error("invalid diff" + diff);
			diffString = sdk.difficulty.nameOf(diff);

			break;
		default:
			throw new Error("?");
		}

		CharData.updateData("me", "setDifficulty", diffString);
		myPrint("Going to " + diffString + " " + reason, true);
		delay(1000);
		if (CharData.getStats().me.setDifficulty !== diffString) {
			throw new Error("Failed to set difficulty");
		}
		scriptBroadcast("quit");

		while (me.ingame) {
			delay(3);
		}
	} catch (e) {
		console.debug(e.message ? e.message : e);
		return false;
	}

	return true;
};

const buildAutoBuildTempObj = (update = () => {}) => ({
	SkillPoints: [-1],
	StatPoints: [-1, -1, -1, -1, -1],
	Update: update
});

// General Game functions
const Check = {
	lowGold: false,

	gold: function () {
		let gold = me.gold;
		let goldLimit = [25000, 50000, 100000][me.diff];

		if ((me.normal && !Pather.accessToAct(2)) || gold >= goldLimit) {
			return true;
		}

		me.overhead("low gold");

		return false;
	},

	brokeAf: function (announce = true) {
		let gold = me.gold;
		let lowGold = Math.min(Math.floor(500 + (me.charlvl * 100 * Math.sqrt(me.charlvl - 1))), 250000);

		switch (true) {
		case (me.charlvl < 15):
		case (me.normal && !Pather.accessToAct(2)):
		case (gold >= lowGold):
		case (me.charlvl >= 15 && gold > Math.floor(lowGold / 2) && gold > me.getRepairCost()):
			return false;
		}

		if (announce) {
			myPrint("very low gold. My Gold: " + gold);
			NTIP.addLine("[name] == gold # [gold] >= 1");
		}

		return true;
	},

	broken: function () {
		let gold = me.gold;

		// Almost broken but not quite
		if (((Item.getEquipped(sdk.body.RightArm).durability <= 30 && Item.getEquipped(sdk.body.RightArm).durability > 0)
			|| (Item.getEquipped(sdk.body.LeftArm).durability <= 30 && Item.getEquipped(sdk.body.LeftArm).durability > 0)
			&& !me.getMerc() && me.charlvl >= 15 && !me.normal && !me.nightmare && gold < 1000)) {
			return 1;
		}

		// Broken
		if ((Item.getEquipped(sdk.body.RightArm).durability === 0 || Item.getEquipped(sdk.body.LeftArm).durability === 0) && me.charlvl >= 15 && !me.normal && gold < 1000) {
			return 2;
		}

		return 0;
	},

	brokeCheck: function () {
		Town.doChores();

		let myGold = me.gold;
		let repairCost = me.getRepairCost();
		let items = (me.getItemsForRepair(100, false) || []);
		let meleeChar = !Check.currentBuild().caster;
		let msg = "";
		let diff = -1;

		switch (true) {
		case myGold > repairCost:
			return false;
		case me.normal:
		case !meleeChar && me.nightmare:
			this.lowGold = myGold < repairCost;
			return false;
		case meleeChar && !me.normal:
			// check how broke we are - only for melee chars since casters don't care about weapons
			let wep = items.filter(i => i.isEquipped && i.bodylocation === sdk.body.RightArm).first();
			if (!!wep && meleeChar && wep.durabilityPercent === 0) {
				// we are really broke - go back to normal
				msg = " We are broken - lets get some easy gold in normal.";
				diff = sdk.difficulty.Normal;
			}

			break;
		case !meleeChar && me.hell:
			msg = " We are pretty broke, lets run some easy stuff in nightmare for gold";
			diff = sdk.difficulty.Nightmare;

			break;
		}

		if (diff > -1) {
			console.debug("My gold: " + myGold + ", Repair cost: " + repairCost);
			goToDifficulty(diff, msg + (" My gold: " + myGold + ", Repair cost: " + repairCost));

			return true;
		}

		return false;
	},

	resistance: function () {
		let resPenalty = me.getResPenalty(me.diff + 1);
		let [frRes, lrRes, crRes, prRes] = [(me.realFR - resPenalty), (me.realLR - resPenalty), (me.realCR - resPenalty), (me.realPR - resPenalty)];

		return {
			Status: ((frRes > 0) && (lrRes > 0) && (crRes > 0)),
			FR: frRes,
			CR: crRes,
			LR: lrRes,
			PR: prRes,
		};
	},

	nextDifficulty: function (announce = true) {
		let diffShift = me.diff;
		let res = this.resistance();
		let lvlReq = !!((me.charlvl >= CharInfo.levelCap) && !["Bumper", "Socketmule"].includes(SetUp.finalBuild) && !this.broken());

		if (me.diffCompleted) {
			if (lvlReq) {
				if (res.Status) {
					diffShift = me.diff + 1;
					announce && D2Bot.printToConsole("Kolbot-SoloPlay: next difficulty requirements met. Starting: " + sdk.difficulty.nameOf(diffShift), sdk.colors.D2Bot.Blue);
				} else {
					if (me.charlvl >= CharInfo.levelCap + (!me.normal ? 5 : 2)) {
						diffShift = me.diff + 1;
						announce && D2Bot.printToConsole("Kolbot-SoloPlay: Over leveled. Starting: " + sdk.difficulty.nameOf(diffShift));
					} else {
						announce && myPrint(sdk.difficulty.nameOf(diffShift + 1) + " requirements not met. Negative resistance. FR: " + res.FR + " | CR: " + res.CR + " | LR: " + res.LR);
						return false;
					}
				}
			}
		} else {
			return false;
		}

		return sdk.difficulty.nameOf(diffShift);
	},

	runes: function () {
		if (me.classic) return false;
		let needRunes = true;

		switch (me.diff) {
		case sdk.difficulty.Normal:
			// Have runes or stealth and ancients pledge
			if (me.haveRunes([sdk.items.runes.Tal, sdk.items.runes.Eth]) || me.checkItem({name: sdk.locale.items.Stealth}).have) {
				needRunes = false;
			}

			break;
		case sdk.difficulty.Nightmare:
			if ((me.haveRunes([sdk.items.runes.Tal, sdk.items.runes.Thul, sdk.items.runes.Ort, sdk.items.runes.Amn]) && Check.currentBuild().caster)
				|| (!me.paladin && me.checkItem({name: sdk.locale.items.Spirit, itemtype: sdk.items.type.Sword}).have)
				|| (me.paladin && me.haveAll([{name: sdk.locale.items.Spirit, itemtype: sdk.items.type.Sword}, {name: sdk.locale.items.Spirit, itemtype: sdk.items.type.AuricShields}]))
				|| (me.necromancer && me.checkItem({name: sdk.locale.items.White}).have
					&& (me.checkItem({name: sdk.locale.items.Rhyme, itemtype: sdk.items.type.VoodooHeads}).have || Item.getEquipped(sdk.body.LeftArm).tier > 800))
				|| (me.barbarian && (me.checkItem({name: sdk.locale.items.Lawbringer}).have || me.baal))) {
				needRunes = false;
			}

			break;
		case sdk.difficulty.Hell:
			if (!me.baal || (me.sorceress && !["Blova", "Lightning"].includes(SetUp.currentBuild))) {
				needRunes = false;
			}

			break;
		}

		return needRunes;
	},

	// todo: need to finish up adding locale string ids to sdk so I can remove this in favor of better me.checkItem prototype
	haveItem: function (type, flag, iName = undefined) {
		let [isClassID, itemCHECK, typeCHECK] = [false, false, false];

		flag && typeof flag === "string" && (flag = flag.capitalize(true));
		typeof iName === "string" && (iName = iName.toLowerCase());

		let items = me.getItemsEx()
			.filter(function (item) {
				return !item.questItem && (flag === "Runeword" ? item.isRuneword : item.quality === sdk.items.quality[flag]);
			});

		switch (typeof type) {
		case "string":
			typeof type === "string" && (type = type.toLowerCase());
			if (type !== "dontcare" && !NTIPAliasType[type] && !NTIPAliasClassID[type]) return false;
			if (type === "dontcare") {
				typeCHECK = true; // we don't care about type
				break;
			}

			// check if item is a classid but with hacky fix for items like belt which is a type and classid...sigh
			isClassID = !!NTIPAliasClassID[type] && !NTIPAliasType[type];
			type = isClassID ? NTIPAliasClassID[type] : NTIPAliasType[type];
			
			break;
		case "number":
			if (!Object.values(sdk.items.type).includes(type) && !Object.values(sdk.items).includes(type)) return false;
			// check if item is a classid but with hacky fix for items like belt which is a type and classid...sigh
			isClassID = Object.values(sdk.items).includes(type) && !Object.values(sdk.items.type).includes(type);

			break;
		}

		// filter out non-matching item types/classids
		if (typeof type === "number") {
			items = items.filter(function (item) {
				return (isClassID ? item.classid === type : item.itemType === type);
			});
		}

		for (let i = 0; i < items.length; i++) {
			switch (flag) {
			case "Set":
			case "Unique":
			case "Crafted":
				itemCHECK = !!(items[i].quality === sdk.items.quality[flag]) && (iName ? items[i].fname.toLowerCase().includes(iName) : true);
				break;
			case "Runeword":
				itemCHECK = !!(items[i].isRuneword) && (iName ? items[i].fname.toLowerCase().includes(iName) : true);
				break;
			}

			// don't waste time if first condition wasn't met
			if (itemCHECK && typeof type === "number") {
				typeCHECK = isClassID ? items[i].classid === type : items[i].itemType === type;
			}

			if (itemCHECK && typeCHECK) {
				return true;
			}
		}

		return false;
	},

	itemSockables: function (type, quality, iName) {
		quality && typeof quality === "string" && (quality = sdk.items.quality[quality.capitalize(true)]);
		typeof iName === "string" && (iName = iName.toLowerCase());
		let [isClassID, itemCHECK, typeCHECK] = [false, false, false];

		switch (typeof type) {
		case "string":
			typeof type === "string" && (type = type.toLowerCase());
			if (!NTIPAliasType[type] && !NTIPAliasClassID[type]) return false;
			isClassID = !!NTIPAliasClassID[type];
			type = isClassID ? NTIPAliasClassID[type] : NTIPAliasType[type];
			
			break;
		case "number":
			if (!Object.values(sdk.items.type).includes(type) && !Object.values(sdk.items).includes(type)) return false;
			isClassID = Object.values(sdk.items).includes(type);

			break;
		}

		let socketableCHECK = isClassID ? Config.socketables.find(({ classid }) => type === classid) : false;
		let items = me.getItemsEx()
			.filter(function (item) {
				return item.quality === quality && !item.questItem && !item.isRuneword && (isClassID ? item.classid === type : item.itemType === type) && getBaseStat("items", item.classid, "gemsockets") > 0;
			});

		for (let i = 0; i < items.length; i++) {
			itemCHECK = !!(items[i].quality === quality) && (iName ? items[i].fname.toLowerCase().includes(iName) : true);

			// don't waste time if first condition wasn't met
			itemCHECK && (typeCHECK = isClassID ? items[i].classid === type : items[i].itemType === type);

			if (itemCHECK && typeCHECK) {
				if (!socketableCHECK && items[i].getItemsEx().length === 0) {
					return true;
				} else if (socketableCHECK) {
					SoloWants.addToList(items[i]);

					return true;
				}
			}
		}

		return false;
	},

	haveBase: function (type = undefined, sockets = undefined) {
		if (!type || !sockets) return false;
		let isClassID = false;

		switch (typeof type) {
		case "string":
			typeof type === "string" && (type = type.toLowerCase());
			if (!NTIPAliasType[type] && !NTIPAliasClassID[type]) return false;
			isClassID = !!NTIPAliasClassID[type];
			type = isClassID ? NTIPAliasClassID[type] : NTIPAliasType[type];
			
			break;
		case "number":
			if (!Object.values(sdk.items.type).includes(type) && !Object.values(sdk.items).includes(type)) return false;
			isClassID = Object.values(sdk.items).includes(type);

			break;
		}
		
		let items = me.getItemsEx()
			.filter(item => item.isBaseType && item.isInStorage && (isClassID ? item.classid === type : item.itemType === type));

		for (let i = 0; i < items.length; i++) {
			if (items[i].sockets === sockets && (isClassID ? items[i].classid === type : items[i].itemType === type)) {
				return true;
			}
		}

		return false;
	},

	getMaxValue: function (buildInfo, stat) {
		if (!buildInfo || !buildInfo.stats || stat === undefined) return 0;
		let highest = 0;
		const shorthandStr = [sdk.stats.Strength, "s", "str", "strength"];
		const shorthandDex = [sdk.stats.Dexterity, "d", "dex", "dexterity"];
		const statToCheck = shorthandStr.includes(stat) ? "str" : shorthandDex.includes(stat) ? "dex" : "";
		
		buildInfo.stats.forEach(s => {
			switch (true) {
			case (shorthandStr.includes(s[0]) && statToCheck === "str"):
			case (shorthandDex.includes(s[0]) && statToCheck === "dex"):
				if (typeof s[1] === "number" && s[1] > highest) {
					highest = s[1];
				}

				break;
			default:
				break;
			}
		});

		return highest;
	},

	currentBuild: function () {
		let buildInfo = SetUp.getTemplate();

		if (!includeIfNotIncluded(buildInfo.template)) throw new Error("currentBuild(): Failed to include template: " + buildInfo.template);

		let final = buildInfo.buildType === SetUp.finalBuild;

		return {
			caster: final ? finalBuild.caster : build.caster,
			tabSkills: final ? finalBuild.skillstab : build.skillstab,
			wantedSkills: final ? finalBuild.wantedskills : build.wantedskills,
			usefulSkills: final ? finalBuild.usefulskills : build.usefulskills,
			precastSkills: final ? finalBuild.precastSkills : [],
			usefulStats: final ? (!!finalBuild.usefulStats ? finalBuild.usefulStats : []) : (!!build.usefulStats ? build.usefulStats : []),
			mercDiff: final ? finalBuild.mercDiff : null,
			mercAct: final ? finalBuild.mercAct : null,
			mercAuraWanted: final ? finalBuild.mercAuraWanted : null,
			finalGear: final ? finalBuild.autoEquipTiers : [],
			finalCharms: final ? (finalBuild.charms || {}) : {},
			respec: final ? finalBuild.respec : () => {},
			active: final ? finalBuild.active : build.active,
		};
	},

	finalBuild: function () {
		function getBuildTemplate () {
			let build;
			let buildType = SetUp.finalBuild;

			if (["Bumper", "Socketmule", "Imbuemule"].includes(buildType)) {
				build = ["Javazon", "Cold", "Bone", "Hammerdin", "Whirlwind", "Wind", "Trapsin"][me.classid] + "Build";
			} else {
				build = buildType + "Build";
			}

			return ("SoloPlay/BuildFiles/" + MYCLASSNAME + "/" + MYCLASSNAME + "." + build + ".js").toLowerCase();
		}

		let template = getBuildTemplate();

		if (!includeIfNotIncluded(template)) {
			let foundError = false;
			let buildType;
			
			// try to see if we can correct the finalBuild
			if (myData.me.finalBuild.match("Build", "gi")) {
				myData.me.finalBuild = myData.me.finalBuild.substring(0, SetUp.finalBuild.length - 5);
				D2Bot.printToConsole("Kolbot-SoloPlay: Info tag contained build which is unecessary. It has been fixed. New InfoTag/finalBuild :: " + SetUp.finalBuild, sdk.colors.D2Bot.Red);
				foundError = true;
			}

			if (myData.me.finalBuild.includes(".")) {
				myData.me.finalBuild = myData.me.finalBuild.substring(myData.me.finalBuild.indexOf(".") + 1).capitalize(true);
				D2Bot.printToConsole("Kolbot-SoloPlay: Info tag was incorrect, it contained '.' which is unecessary and means you likely entered something along the lines of Classname.finalBuild. I have attempted to remedy this. If it is still giving you an error please re-read the documentation. New InfoTag/finalBuild :: " + SetUp.finalBuild, sdk.colors.D2Bot.Red);
				foundError = true;
			}

			if (myData.me.finalBuild.includes(" ")) {
				myData.me.finalBuild = myData.me.finalBuild.trim().capitalize(true);
				D2Bot.printToConsole("Kolbot-SoloPlay: Info tag was incorrect, it contained a trailing space. I have attempted to remedy this. If it is still giving you an error please re-read the documentation. New InfoTag/finalBuild :: " + SetUp.finalBuild, sdk.colors.D2Bot.Red);
				foundError = true;
			}

			if (myData.me.finalBuild.includes("-")) {
				myData.me.finalBuild = myData.me.finalBuild.substring(myData.me.finalBuild.indexOf("-") + 1).capitalize(true);
				D2Bot.printToConsole("Kolbot-SoloPlay: Info tag was incorrect, it contained '-' which is unecessary and means you likely entered something along the lines of Classname-finalBuild. I have attempted to remedy this. If it is still giving you an error please re-read the documentation. New InfoTag/finalBuild :: " + SetUp.finalBuild, sdk.colors.D2Bot.Red);
				foundError = true;
			}

			if (foundError) {
				D2Bot.setProfile(null, null, null, null, null, SetUp.finalBuild);
				CharData.updateData("me", "finalBuild", SetUp.finalBuild);
				buildType = myData.me.finalBuild;
				template = ("SoloPlay/BuildFiles/" + sdk.player.class.nameOf(me.classid) + "." + buildType + "Build.js").toLowerCase();
			}

			// try-again - if it fails again throw error
			if (!include(template)) {
				console.debug("ÿc8Kolbot-SoloPlayÿc0: Failed to include finalBuild template. Please check that you have actually entered it in correctly. Here is what you currently have: " + SetUp.finalBuild);
				throw new Error("finalBuild(): Failed to include template: " + template);
			}
		}

		return {
			caster: finalBuild.caster,
			tabSkills: finalBuild.skillstab,
			wantedSkills: finalBuild.wantedskills,
			usefulSkills: finalBuild.usefulskills,
			precastSkills: finalBuild.precastSkills,
			usefulStats: (!!finalBuild.usefulStats ? finalBuild.usefulStats : []),
			mercDiff: finalBuild.mercDiff,
			mercAct: finalBuild.mercAct,
			mercAuraWanted: finalBuild.mercAuraWanted,
			finalGear: finalBuild.autoEquipTiers,
			finalCharms: (finalBuild.charms || {}),
			maxStr: Check.getMaxValue(finalBuild, "strength"),
			maxDex: Check.getMaxValue(finalBuild, "dexterity"),
			respec: finalBuild.respec,
			active: finalBuild.active,
		};
	},

	checkSpecialCase: function () {
		const questCompleted = (id) => !!Misc.checkQuest(id, sdk.quest.states.ReqComplete);
		let goalReached = false, goal = "";

		switch (true) {
		case SetUp.finalBuild === "Bumper" && me.charlvl >= 40:
		case (SetUp.finalBuild === "Socketmule" && questCompleted(sdk.quest.id.SiegeOnHarrogath)):
		case (SetUp.finalBuild === "Imbuemule" && questCompleted(sdk.quest.id.ToolsoftheTrade) && me.charlvl >= Developer.imbueStopLevel):
			goal = SetUp.finalBuild;
			goalReached = true;

			break;
		case SetUp.stopAtLevel && me.charlvl >= SetUp.stopAtLevel:
			goal = "Level: " + SetUp.stopAtLevel;
			goalReached = true;

			break;
		case sdk.difficulty.Difficulties.indexOf(sdk.difficulty.nameOf(me.diff)) < sdk.difficulty.Difficulties.indexOf(myData.me.highestDifficulty):
			// TODO: fill this out, if we go back to normal from hell I want to be able to do whatever it was imbue/socket/respec then return to our orignal difficulty
			// as it is right now if we go back it would take 2 games to get back to hell
			// but this needs a check to ensure that one of the above reasons are why we went back in case we had gone back because low gold in which case we need to stay in the game
			break;
		default:
			break;
		}

		if (goalReached) {
			const gameObj = Developer.logPerformance ? Tracker.readObj(Tracker.GTPath) : null;

			switch (true) {
			case (SetUp.finalBuild === "Bumper" && Developer.fillAccount.bumpers):
			case (SetUp.finalBuild === "Socketmule" && Developer.fillAccount.socketMules):
				SetUp.makeNext();
				
				break;
			default:
				D2Bot.printToConsole("Kolbot-SoloPlay " + goal + " goal reached." + (gameObj ? " (" + (Tracker.formatTime(gameObj.Total + Tracker.timer(gameObj.LastSave))) + ")" : ""), sdk.colors.D2Bot.Gold);
				Developer.logPerformance && Tracker.update();
				D2Bot.stop();
			}
		}
	},

	// TODO: enable this for other items, i.e maybe don't socket tal helm in hell but instead go back and use nightmare so then we can use hell socket on tal armor?
	usePreviousSocketQuest: function () {
		if (me.classic) return;
		if (!Check.resistance().Status) {
			if (me.weaponswitch === 0 && Item.getEquipped(sdk.body.LeftArm).fname.includes("Lidless Wall") && !Item.getEquipped(sdk.body.LeftArm).socketed) {
				if (!me.normal) {
					if (!myData.normal.socketUsed) goToDifficulty(sdk.difficulty.Normal, " to use socket quest");
					if (me.hell && !myData.nightmare.socketUsed) goToDifficulty(sdk.difficulty.Nightmare, " to use socket quest");
				}
			}
		}
	},
};

const SoloWants = {
	needList: [],
	validGids: [],

	checkItem: function (item) {
		if (!item) return false;
		if (this.validGids.includes(item.gid)) return true;
		let i = 0;
		for (let el of this.needList) {
			if ([sdk.items.type.Jewel, sdk.items.type.Rune].includes(item.itemType) || (item.itemType >= sdk.items.type.Amethyst && item.itemType <= sdk.items.type.Skull)) {
				if (el.needed.includes(item.classid)) {
					this.validGids.push(item.gid);
					this.needList[i].needed.splice(this.needList[i].needed.indexOf(item.classid), 1);
					if (this.needList[i].needed.length === 0) {
						// no more needed items so remove from list
						this.needList.splice(i, 1);
					}
					return true;
				}
			}
			i++; // keep track of index
		}

		return false;
	},

	keepItem: function (item) {
		if (!item) return false;
		return this.validGids.includes(item.gid);
	},

	buildList: function () {
		let myItems = me.getItemsEx()
			.filter(function (item) {
				return !item.isRuneword && !item.questItem && item.quality >= sdk.items.quality.Magic && (item.sockets > 0 || getBaseStat("items", item.classid, "gemsockets") > 0);
			});
		myItems
			.filter(item => item.isEquipped)
			.forEach(item => SoloWants.addToList(item));
		myItems
			.filter(item => item.isInStorage && item.getItemType() && AutoEquip.wanted(item))
			.forEach(item => SoloWants.addToList(item));
		
		return myItems.forEach(item => SoloWants.checkItem(item));
	},

	addToList: function (item) {
		if (!item || me.classic || item.isRuneword) return false;
		if (SoloWants.needList.some(check => item.classid === check.classid)) return false;
		let hasWantedItems;
		let list = [];
		let socketedWith = item.getItemsEx();
		let numSockets = item.sockets;
		let curr = Config.socketables.find(({ classid }) => item.classid === classid);

		if (curr && curr.socketWith.length > 0) {
			hasWantedItems = socketedWith.some(el => curr.socketWith.includes(el.classid));
			if (hasWantedItems && socketedWith.length === numSockets) {
				return true; // this item is full
			}

			if (curr.socketWith.includes(sdk.items.runes.Hel)) {
				let merc = me.getMerc();
				switch (true) {
				case Item.autoEquipCheck(item, true) && me.trueStr >= item.strreq && me.trueDex >= item.dexreq:
				case Item.autoEquipCheckMerc(item, true) && !!merc && merc.rawStrength >= item.strreq && merc.rawDexterity >= item.dexreq:
					curr.socketWith.splice(curr.socketWith.indexOf(sdk.items.runes.Hel), 1);
					break;
				}
			}

			if (curr.socketWith.length > 1 && hasWantedItems) {
				// handle different wanted socketables, if we already have a wanted socketable inserted then remove it from the check list
				socketedWith.forEach(function (socketed) {
					if (curr.socketWith.length > 1 && curr.socketWith.includes(socketed.classid)) {
						curr.socketWith.splice(curr.socketWith.indexOf(socketed.classid), 1);
					}
				});
			}

			// add the wanted items to the list
			for (let i = 0; i < numSockets - (hasWantedItems ? socketedWith.length : 0); i++) {
				// handle different wanted socketables
				curr.socketWith.length === numSockets ? list.push(curr.socketWith[i]) : list.push(curr.socketWith[0]);
			}

			// currently no sockets but we might use our socket quest on it
			numSockets === 0 && curr.useSocketQuest && list.push(curr.socketWith[0]);

			// if temp socketables are used for this item and its not already socketed with wanted items add the temp items too
			if (!hasWantedItems && !!curr.temp && !!curr.temp.length > 0) {
				for (let i = 0; i < numSockets - socketedWith.length; i++) {
					list.push(curr.temp[0]);
				}
				// Make sure we keep a hel rune so we can unsocket temp socketables if needed
				if (!SoloWants.needList.some(check => sdk.items.runes.Hel === check.classid)) {
					let hel = me.getItemsEx(sdk.items.runes.Hel, sdk.items.mode.inStorage);
					// we don't have any hel runes and its not already in our needList
					if ((!hel || hel.length === 0)) {
						SoloWants.needList.push({classid: sdk.items.runes.Hel, needed: [sdk.items.runes.Hel]});
					} else if (!hel.some(check => SoloWants.validGids.includes(check.gid))) {
						SoloWants.needList.push({classid: sdk.items.runes.Hel, needed: [sdk.items.runes.Hel]});
					}
				}
			}
		} else {
			let itemtype = item.getItemType();
			if (!itemtype) return false;
			let gemType = ["Helmet", "Armor"].includes(itemtype) ? "Ruby" : itemtype === "Shield" ? "Diamond" : itemtype === "Weapon" && !Check.currentBuild().caster ? "Skull" : "";
			let runeType;

			// Tir rune in normal, Io rune otherwise and Shael's if assassin TODO: use jewels too
			!gemType && (runeType = me.normal ? "Tir" : me.assassin ? "Shael" : "Io");

			hasWantedItems = socketedWith.some(el => gemType ? el.itemType === sdk.items.type[gemType] : el.classid === sdk.items.runes[runeType]);
			if (hasWantedItems && socketedWith.length === numSockets) {
				return true; // this item is full
			}

			for (let i = 0; i < numSockets - socketedWith.length; i++) {
				list.push(gemType ? sdk.items.gems.Perfect[gemType] : sdk.items.runes[runeType]);
			}
		}

		// add to our needList so we pick the items
		return list.length > 0 ? this.needList.push({classid: item.classid, needed: list}) : false;
	},

	update: function (item) {
		if (!item) return false;
		if (this.validGids.includes(item.gid)) return true; // already in the list
		let i = 0;
		for (let el of this.needList) {
			if (!me.getItem(el.classid)) {
				// We no longer have the item we wanted socketables for
				this.needList.splice(i, 1);
				continue;
			}
			if ([sdk.items.type.Jewel, sdk.items.type.Rune].includes(item.itemType) || (item.itemType >= sdk.items.type.Amethyst && item.itemType <= sdk.items.type.Skull)) {
				if (el.needed.includes(item.classid)) {
					this.validGids.push(item.gid);
					this.needList[i].needed.splice(this.needList[i].needed.indexOf(item.classid), 1);
					if (this.needList[i].needed.length === 0) {
						// no more needed items so remove from list
						this.needList.splice(i, 1);
					}
					return true;
				}
			}
			i++; // keep track of index
		}

		return false;
	},

	ensureList: function () {
		let i = 0;
		for (let el of this.needList) {
			if (!me.getItem(el.classid)) {
				// We no longer have the item we wanted socketables for
				this.needList.splice(i, 1);
				continue;
			}
			i++; // keep track of index
		}
	},

	// Cube ingredients
	checkSubrecipes: function () {
		for (let el of this.needList) {
			for (let i = 0; i < el.needed.length; i++) {
				switch (true) {
				case [
					sdk.items.gems.Perfect.Ruby, sdk.items.gems.Perfect.Sapphire, sdk.items.gems.Perfect.Topaz, sdk.items.gems.Perfect.Emerald,
					sdk.items.gems.Perfect.Amethyst, sdk.items.gems.Perfect.Diamond, sdk.items.gems.Perfect.Skull].includes(el.needed[i]):
					if (Cubing.subRecipes.indexOf(el.needed[i]) === -1) {
						Cubing.subRecipes.push(el.needed[i]);
						Cubing.recipes.push({
							Ingredients: [el.needed[i] - 1, el.needed[i] - 1, el.needed[i] - 1],
							Index: 0,
							AlwaysEnabled: true,
							MainRecipe: "Crafting"
						});
					}

					break;
				case el.needed[i] >= sdk.items.runes.El && el.needed[i] <= sdk.items.runes.Ort:
					if (Cubing.subRecipes.indexOf(el.needed[i]) === -1) {
						Cubing.subRecipes.push(el.needed[i]);
						Cubing.recipes.push({
							Ingredients: [el.needed[i] - 1, el.needed[i] - 1, el.needed[i] - 1],
							Index: Recipe.Rune,
							AlwaysEnabled: true,
							MainRecipe: "Crafting"
						});
					}

					break;
				// case el.needed[i] >= sdk.items.runes.Thul && el.needed[i] <= sdk.items.runes.Lem:
				// // gems repeat so should be able to math this out chipped (TASRED) -> repeat flawed (TASRED)
				// 	if (Cubing.subRecipes.indexOf(el.needed[i]) === -1) {
				// 		Cubing.subRecipes.push(el.needed[i]);
				// 		Cubing.recipes.push({
				// 			Ingredients: [el.needed[i] - 1, el.needed[i] - 1, el.needed[i] - 1],
				// 			Index: Recipe.Rune,
				// 			AlwaysEnabled: true,
				// 			MainRecipe: "Crafting"
				// 		});
				// 	}

				// 	break;
				// case el.needed[i] >= sdk.items.runes.Mal && el.needed[i] <= sdk.items.runes.Zod:
				// // gems repeat so should be able to math this out Base (TASRED) -> repeat Flawless (TASRE) (stops at Emerald)
				// 	if (Cubing.subRecipes.indexOf(el.needed[i]) === -1) {
				// 		Cubing.subRecipes.push(el.needed[i]);
				// 		Cubing.recipes.push({
				// 			Ingredients: [el.needed[i] - 1, el.needed[i] - 1],
				// 			Index: Recipe.Rune,
				// 			AlwaysEnabled: true,
				// 			MainRecipe: "Crafting"
				// 		});
				// 	}

				// 	break;
				}
			}
		}

		return true;
	},
};
