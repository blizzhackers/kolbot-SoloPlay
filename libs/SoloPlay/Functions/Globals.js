/*
*	@filename	Globals.js
*	@author		isid0re, theBGuy
*	@desc		Global variables Settings, general functions for Kolbot-SoloPlay functionality
*/

if (!isIncluded("OOG.js")) {
	include("OOG.js");
}

// general settings
var Difficulty = ['Normal', 'Nightmare', 'Hell'];
var classes = ["Amazon", "Sorceress", "Necromancer", "Paladin", "Barbarian", "Druid", "Assassin"];

const sdk = require('../modules/sdk');

var SetUp = {
	scripts: [
		"corpsefire", "den", "bloodraven", "tristram", "treehead", "countess", "smith", "pits", "jail", "andariel", "a1chests", "cows", // Act 1
		"cube", "radament", "amulet", "summoner", "tombs", "ancienttunnels", "staff", "duriel", // Act 2
		"templeruns", "lowerkurast", "eye", "heart", "brain", "travincal", "mephisto", // Act 3
		"izual", "hellforge", "river", "hephasto", "diablo", // Act 4
		"shenk", "savebarby", "anya", "ancients", "baal", "a5chests", // Act 5
	],

	// mine - theBGuy
	include: function () {
		var folders = ["Functions"];
		folders.forEach( (folder) => {
			var files = dopen("libs/SoloPlay/" + folder + "/").getFiles();
			files.forEach( (file) => {
				if (file.slice(file.length - 3) === ".js") {
					if (!isIncluded("SoloPlay/" + folder + "/" + file)) {
						if (!include("SoloPlay/" + folder + "/" + file)) {
							throw new Error("Failed to include " + "SoloPlay/" + folder + "/" + file);
						}
					}
				}
			});
		});
		// Include custom attacks
		let filePath = "SoloPlay/Functions/ClassAttackOverrides/" + classes[me.classid] + "Attacks.js";
		if (!isIncluded(filePath)) {
			if (!include(filePath)) {
				throw new Error("Failed to include: " + filePath);
			}
		}
	},

	// mine - theBGuy
	// Storage Settings
	sortSettings: {
		ItemsSortedFromLeft: [], // default: everything not in Config.ItemsSortedFromRight
		ItemsSortedFromRight: [
			// (NOTE: default pickit is fastest if the left side is open)
			603, 604, 605, // sort charms from the right
			519, 518, 543, // sort tomes and keys to the right
			515, 516, 587, 588, 589, 590, 591, 592, 593, 594, 595, 596 // sort all inventory potions from the right
		],
		PrioritySorting: true,
		ItemsSortedFromLeftPriority: [/*605, 604, 603, 519, 518*/], // (NOTE: the earlier in the index, the further to the Left)
		ItemsSortedFromRightPriority: [
			// (NOTE: the earlier in the index, the further to the Right)
			605, 604, 603, // sort charms from the right, GC > LC > SC
			519, 518, 543
		],
	},

	// Global value to set bot to walk while doing a task, since while physically attacking running decreases block chance
	walkToggle: false,

	//			Amazon					Sorceress				Necromancer					Paladin				Barbarian				Druid					Assassin					
	levelCap: [[33, 65, 100][me.diff], [33, 67, 100][me.diff], [33, 70, 100][me.diff], [33, 65, 100][me.diff], [33, 75, 100][me.diff], [33, 73, 100][me.diff], [33, 65, 100][me.diff]][me.classid],
	className: ["Amazon", "Sorceress", "Necromancer", "Paladin", "Barbarian", "Druid", "Assassin"][me.classid],
	currentBuild: DataFile.getStats().currentBuild,
	finalBuild: DataFile.getStats().finalBuild,
	respecOne: [ 30, 26, 26, 19, 30, 24, 32][me.classid],
	respecOneB: [ 64, 65, 0, 0, 74, 0, 0][me.classid],

	// mine - theBGuy
	respecTwo: function () {
		let respec;

		switch (me.gametype) {
		case 0:
			respec = [75, 75, 75, 85, 80, 75, 75][me.classid];
			break;

		case 1:
			switch (this.finalBuild) {
			case "Witchyzon":
				respec = Check.haveItem("diamondbow", "unique", "Witchwild String") ? me.charlvl : 100;
				break;
			case "Javazon":
			case "Lightning":
			case "Blova":
				respec = Attack.checkInfinity() ? me.charlvl : 100;
				break;
			case "Trapsin":
				respec = Attack.checkInfinity() && Check.haveItem("armor", "runeword", "Enigma") ? me.charlvl : 100;
				break;
			case "Cold":
			case "Meteorb":
			case "Blizzballer":
				// Tal amulet, belt, armor, and orb
				respec = Check.haveItem("amulet", "set", "Tal Rasha's Adjudication") && Check.haveItem("belt", "set", "Tal Rasha's Fine-Spun Cloth") &&
					Check.haveItem("armor", "set", "Tal Rasha's Guardianship") && Check.haveItem("swirlingcrystal", "set", "Tal Rasha's Lidless Eye") ? me.charlvl : 100;
				break;
			case "Bone":
			case "Poison":
			case "Summon":
			case "Hammerdin":
			case "Elemental":
			case "Wind":
				respec = Check.haveItem("armor", "runeword", "Enigma") ? me.charlvl : 100;
				break;
			case "Singer":
				respec = Check.haveItem("armor", "runeword", "Enigma") && Check.haveItem("mace", "runeword", "Heart of the Oak") ? me.charlvl : 100;
				break;
			case "Whirlwind":
			case "Smiter":
			case "Zealer":
				respec = Check.haveItem("sword", "runeword", "Grief") ? me.charlvl : 100;
				break;
			case "Uberconc":
				respec = Check.haveItem("sword", "runeword", "Grief") && Check.haveItem("monarch", "unique", "Stormshield") ? me.charlvl : 100;
				break;
			case "Frenzy":
				respec = Check.haveItem("sword", "runeword", "Grief") && Check.haveItem("sword", "runeword", "Breath of the Dying") ? me.charlvl : 100;
				break;
			case "Wolf":
				respec = Check.haveItem("stalagmite", "unique", "Ribcracker") && Check.haveItem("armor", "runeword", "Chains of Honor") ? me.charlvl : 100;
				break;
			case "Plaguewolf":
				respec = Check.haveItem("sword", "runeword", "Grief") && Check.haveItem("armor", "runeword", "Chains of Honor") ? me.charlvl : 100;
				break;
			case "Auradin":
				respec = Check.haveItem("auricshields", "runeword", "Dream") && Check.haveItem("helm", "runeword", "Dream") ? me.charlvl : 100;
				break;
			case "Immortalwhirl":
				// Whole IK Set
				respec = Check.haveItem("mace", "set", "Immortal King's Stone Crusher") && Check.haveItem("boots", "set", "Immortal King's Pillar") &&
					Check.haveItem("belt", "set", "Immortal King's Detail") && Check.haveItem("armor", "set", "Immortal King's Soul Cage") &&
					Check.haveItem("primalhelm", "set", "Immortal King's Will") && Check.haveItem("gloves", "set", "Immortal King's Forge") ? me.charlvl : 100;
				break;
			default:
				respec = 100;
				break;
			}
		}

		if (respec === me.charlvl && me.charlvl < 60) {
			showConsole();
			print("ÿc8Kolbot-SoloPlayÿc0: Bot has respecTwo items but is too low a level to respec.");
			print("ÿc8Kolbot-SoloPlayÿc0: This only happens with user intervention. Remove the items you gave the bot until at least level 60");
			respec = 100;
		}

		return respec;
	},

	getBuild: function () {
		let buildType;

		if (me.charlvl < SetUp.respecOne) {
			buildType = "Start";
		} else if (me.charlvl >= SetUp.respecTwo()) {
			buildType = SetUp.finalBuild;
		} else if (SetUp.respecOneB > 0 && me.charlvl >= SetUp.respecOne && me.charlvl < SetUp.respecOneB) {
			buildType = "Stepping";
		} else {
			buildType = "Leveling";
		}

		return buildType;
	},

	specPush: function (specType) {
		function getBuildTemplate () {
			let buildType = SetUp.getBuild();
			let build = buildType + "Build" ;
			let classname = SetUp.className;
			let template = "SoloPlay/BuildFiles/" + classname + "." + build + ".js";

			return template.toLowerCase();
		}

		var template = getBuildTemplate();

		if (!include(template)) {
			throw new Error("Failed to include template: " + template);
		}

		let specCheck = [];

		if (SetUp.getBuild() === SetUp.finalBuild) {
			switch (specType) {
			case "skills":
				// Push skills value from template file
				specCheck = JSON.parse(JSON.stringify(finalBuild.skills));
				break;
			case "stats":
				// Push stats value from template file
				specCheck = JSON.parse(JSON.stringify(finalBuild.stats));
				break;
			}
		} else {
			switch (specType) {
			case "skills":
				// Push skills value from template file
				specCheck = JSON.parse(JSON.stringify(build.skills));
				break;
			case "stats":
				// Push stats value from template file
				specCheck = JSON.parse(JSON.stringify(build.stats));
				break;
			}
		}

		return specCheck;
	},

	makeNext: function () {
		if (!isIncluded("SoloPlay/Tools/NameGen.js")) {
			include("SoloPlay/Tools/NameGen.js");
		}

		print("ÿc8Kolbot-SoloPlayÿc0: " + this.finalBuild + " goal reached. On to the next.");
		me.overhead("ÿc8Kolbot-SoloPlay: " + this.finalBuild + " goal reached. On to the next.");

		D2Bot.printToConsole("Kolbot-SoloPlay: " + this.finalBuild + " goal reached. Making next...", 6);
		D2Bot.setProfile(null, null, NameGen());
		FileTools.remove("data/" + me.profile + ".json");
		FileTools.remove("libs/SoloPlay/Data/" + me.profile + ".GameTime" + ".json");
		delay(100 + me.ping);
		D2Bot.restart();
    },
};

// SoloLeveling Pickit Items
var nipItems = {
	Selling: [
		'([type] == ring || [type] == amulet) && [quality] >= magic # [fcr] >= 600',
		'([type] == armor || [type] == boots || [type] == gloves || [type] == belt) && [quality] >= magic # [fcr] >= 600',
		'([type] == helm || [type] == circlet || [type] == primalhelm || [type] == pelt) && [quality] >= magic # [fcr] >= 600',
		'([type] == shield || [type] == voodooheads) && [quality] >= magic # [fcr] >= 600',
		'([type] == javelin || [type] == amazonspear || [type] == amazonjavelin) && [quality] >= rare # [fcr] >= 600',
		'([type] == orb || [type] == wand || [type] == staff) && [quality] >= normal # [fcr] >= 600',
		'([type] == throwingaxe || [type] == axe || [type] == mace || [type] == club || [type] == scepter || [type] == hammer) && [quality] >= magic # [fcr] >= 600',
		'([type] == sword || [type] == knife || [type] == throwingknife) && [quality] >= magic # [fcr] >= 600',
		'([type] == bow || [type] == crossbow) && [quality] >= rare # [fcr] >= 600',
		'([type] == handtohand || [type] == assassinclaw) && [quality] >= magic  # [fcr] >= 600',
	],

	General: [
		"[name] == tomeoftownportal",
		"[name] == tomeofidentify",
		"[name] == gold # [gold] >= me.charlvl * 3 * me.diff",
		"(me.charlvl < 20 || me.gold < 500) && [name] == minorhealingpotion",
		"(me.charlvl < 25 || me.gold < 2000) && [name] == lighthealingpotion",
		"(me.charlvl < 29 || me.gold < 5000) && [name] == healingpotion",
		"[name] == greaterhealingpotion",
		"[name] == superhealingpotion",
		"(me.charlvl < 20 || me.gold < 1000) && [name] == minormanapotion",
		"[name] == lightmanapotion",
		"[name] == manapotion",
		"[name] == greatermanapotion",
		"[name] == supermanapotion",
		"[name] == rejuvenationpotion",
		"[name] == fullrejuvenationpotion",
		"[name] == scrolloftownportal # # [maxquantity] == 20",
		"[name] == scrollofidentify # # [maxquantity] == 20",
		"[name] == key # # [maxquantity] == 12",
	],

	Gems: [
		"[name] == perfecttopaz # # [maxquantity] == 2",
		"[name] == perfectdiamond # # [maxquantity] == 2",
		"[name] == perfectruby # # [maxquantity] == 2",
	],

	Quest: [
		"[name] == mephisto'ssoulstone",
		"[name] == hellforgehammer",
		"[name] == scrollofinifuss",
		"[name] == keytothecairnstones",
		"[name] == bookofskill",
		"[name] == horadriccube",
		"[name] == shaftofthehoradricstaff",
		"[name] == topofthehoradricstaff",
		"[name] == horadricstaff",
		"[name] == ajadefigurine",
		"[name] == thegoldenbird",
		"[name] == potionoflife",
		"[name] == lamesen'stome",
		"[name] == khalim'seye",
		"[name] == khalim'sheart",
		"[name] == khalim'sbrain",
		"[name] == khalim'sflail",
		"[name] == khalim'swill",
		"[name] == scrollofresistance",
	],
};

// General Game functions
var Check = {
	Task: function (sequenceName) {
		let needRunes = this.Runes();

		switch (sequenceName.toLowerCase()) {
		case "den":
			if (!me.den) {
				return true;
			}

			break;
		case "corpsefire":
			if (me.den && me.hell && (!me.andariel || Check.brokeAf()) && !me.druid && !me.paladin) {
				return true;
			}

			break;
		case "bloodraven":
			if ((!me.bloodraven && me.normal || (!me.summoner && Check.brokeAf())) || 
				(me.normal && !me.tristram && me.barbarian) || 
				(me.hell && ((me.sorceress && SetUp.currentBuild !== "Lightning") || ((me.amazon || me.assassin) && Attack.checkInfinity()) || (me.barbarian || me.paladin || me.necromancer || me.druid)))) {
				return true;
			}

			break;
		case "treehead":
			if (me.hell && (me.paladin && (!Attack.IsAuradin || !Check.haveItem("armor", "runeword", "Enigma") || !Pather.accessToAct(3)))) {
				return true;
			}

			break;
		case "smith":
			if (!me.smith && !Misc.checkQuest(3, 1)) {
				return true;
			}

			break;
		case "tristram":
			if ((me.normal && (!me.tristram || me.charlvl < (me.barbarian ? 6 : 12) || Check.brokeAf())) || 
				(!me.normal && 
					((!me.tristram && (me.classic && me.diablo || me.baal)) ||
					 (me.barbarian && !Pather.accessToAct(3) && !Check.haveItem("sword", "runeword", "Lawbringer")) ||
					 (me.paladin && me.hell && !Pather.accessToAct(3) && (!Attack.IsAuradin || !Check.haveItem("armor", "runeword", "Enigma")))))) {
				return true;
			}

			break;
		case "countess":
			// classic quest not completed normal || don't have runes for difficulty || barb in hell and have lawbringer
			if ((me.classic && !me.countess) || 
				(!me.classic && (needRunes || Check.brokeAf() || (me.barbarian && me.hell && Check.haveItem("sword", "runeword", "Lawbringer"))))) {
				return true;
			}

			break;
		case "pits":
			if (me.hell && 
				((me.necromancer || me.barbarian || me.assassin) ||
					(me.paladin && ["Zealer", "Auradin"].indexOf(SetUp.currentBuild) > -1) ||
					(me.amazon && (SetUp.currentBuild === SetUp.finalBuild || me.charlvl >= 85)) || 
					(me.sorceress && me.charlvl >= 80) || 
					(me.druid && ["Plaguewolf", "Wolf"].indexOf(SetUp.currentBuild) > -1))) {
				return true;
			}

			break;
		case "jail":
			if (me.hell && me.amazon && !me.mephisto) {
				return true;
			}

			break;
		case "andariel":
			if (!me.andariel || 
				(me.classic && me.hell) || 
				(!me.classic && 
					(!me.normal && (Pather.canTeleport() || me.charlvl <= 60)) || 
					(me.hell && me.charlvl !== 100 && (!me.amazon || (me.amazon && SetUp.currentBuild === SetUp.finalBuild))))) {
				return true;
			}

			break;
		case "a1chests":
			if (!me.classic && 
				(me.charlvl >= 70 && Pather.canTeleport() || 
					(me.barbarian && me.hell && !Pather.accessToAct(3) && (Item.getEquippedItem(5).tier < 1270 && !Check.haveItem("sword", "runeword", "Lawbringer"))))) {
				return true;
			}

			break;
		case "cube":
			if (Pather.accessToAct(2) && !me.cube) {
				return true;
			}

			break;
		case "radament":
			if (Pather.accessToAct(2) && (!me.radament || (me.amazon && SetUp.currentBuild !== SetUp.finalBuild && me.hell))) {
				return true;
			}

			break;
		case "staff":
			if (Pather.accessToAct(2) && !me.shaft && !me.staff && !me.horadricstaff) {
				return true;
			}

			break;
		case "amulet":
			if (Pather.accessToAct(2) && !me.amulet && !me.staff && !me.horadricstaff) {
				return true;
			}

			break;
		case "ancienttunnels":
			// No pally in hell due to magic immunes unless is auradin, No zon in hell unless at final build becasue light/poison immunes
			if (Pather.accessToAct(2) && me.hell && (!me.paladin || Attack.IsAuradin) && (!me.amazon || (me.amazon && SetUp.currentBuild === SetUp.finalBuild))) {
				return true;
			}

			break;
		case "summoner":
			if (Pather.accessToAct(2) && !me.summoner) {
				return true;
			}

			break;
		case "tombs":
			if (Pather.accessToAct(2) && me.normal && me.charlvl < 24) {
				return true;
			}

			break;
		case "duriel":
			if (Pather.accessToAct(2) && !me.duriel) {
				return true;
			}

			break;
		case "eye":
			if (Pather.accessToAct(3) && !me.eye && !me.khalimswill && !me.travincal) {
				return true;
			}

			break;
		case "templeruns":
			if (Pather.accessToAct(3) && ((!me.lamessen || me.nightmare && me.charlvl < 50 || me.hell) && (!me.paladin || Attack.IsAuradin))) {
				return true;
			}

			break;
		case "lamessen":
			if (Pather.accessToAct(3) && !me.lamessen && me.paladin) {
				return true;
			}

			break;
		case "lowerkurast":
			if (Pather.accessToAct(3) && me.nightmare && me.charlvl >= 50 && me.barbarian && !Check.haveItem("sword", "runeword", "Voice of Reason")) {
				return true;
			}

			break;
		case "heart":
			if (Pather.accessToAct(3) && !me.heart && !me.khalimswill && !me.travincal) {
				return true;
			}

			break;
		case "brain":
			if (Pather.accessToAct(3) && !me.brain && !me.khalimswill && !me.travincal) {
				return true;
			}

			break;
		case "travincal":
			if (Pather.accessToAct(3) && 
					(!me.travincal ||
						(me.charlvl < 25 || 
						(me.charlvl >= 25 && me.normal && !me.baal && !Check.Gold()) ||
						(me.nightmare && !me.diablo && me.barbarian && !Check.haveItem("sword", "runeword", "Lawbringer")) || 
						(me.hell && me.paladin && me.charlvl > 85 && (!Attack.IsAuradin || !Check.haveItem("armor", "runeword", "Enigma")))))) {
				return true;
			}

			break;
		case "mephisto":
			if (Pather.accessToAct(3) && 
				(!me.mephisto ||
					(me.normal && (!me.baal || !Check.Gold())) ||
					(!me.normal && (Pather.canTeleport() || me.charlvl <= 65)) || 
					(me.hell && me.charlvl !== 100))) {
				return true;
			}

			break;
		case "izual":
			if (Pather.accessToAct(4) && !me.izual) {
				return true;
			}

			break;
		case "river":
			if (Pather.accessToAct(4) && !me.diablo && !me.normal && me.barbarian && !Check.haveItem("sword", "runeword", "Lawbringer")) {
				return true;
			}

			break;
		case "hephasto":
			if (Pather.accessToAct(4) && !me.normal && me.diablo && me.barbarian && me.charlvl <= 70 && !Check.haveItem("sword", "runeword", "Lawbringer")) {
				return true;
			}

			break;
		case "diablo":
			if (Pather.accessToAct(4) && ((me.normal && me.charlvl < 35) || (me.nightmare && (Pather.canTeleport() || me.charlvl <= 65)) || (me.hell && me.charlvl !== 100) || !me.diablo)) {
				return true;
			}

			break;
		case "hellforge":
			if (Pather.accessToAct(4) && !me.hellforge) {
				return true;
			}

			break;
		case "shenk":
			if (!me.classic && Pather.accessToAct(5) && (!me.druid || me.charlvl <= 70)) {
				return true;
			}

			break;
		case "savebarby":
			// I need tal, ral, or ort rune for runewords
			if (!me.classic && Pather.accessToAct(5) && !me.savebarby && (Runewords.checkRune(616) || Runewords.checkRune(617) || Runewords.checkRune(618))) {
				return true;
			}

			break;
		case "anya":
			if (!me.classic && Pather.accessToAct(5)) {
				return true;
			}

			break;
		case "ancients":
			if (!me.classic && Pather.accessToAct(5) && !me.ancients) {
				return true;
			}

			break;
		case "baal":
			if (!me.classic && Pather.accessToAct(5)) {
				return true;
			}

			break;
		case "cows":
			if (!me.normal && !me.cows && 
				(!me.barbarian || ["Whirlwind", "Immortalwhirl", "Singer"].indexOf(SetUp.currentBuild) > -1) && 
				(me.classic && me.diablo || me.baal) && 
				((me.nightmare && (!me.druid || me.charlvl <= 65) || me.hell))) {
				return true;
			}

			if (me.normal && !me.cows && (me.classic && me.diablo || me.baal) && Check.brokeAf()) {
				return true;
			}

			break;
		case "a5chests":
			if (!me.normal && me.baal) {
				return true;
			}

			break;
		case "getkeys":
			if (Pather.accessToAct(5) && me.hell && ["Zealer", "Smiter", "Uberconc"].indexOf(SetUp.currentBuild) > -1) {
				return true;
			}

			break;
		case "orgtorch":
			if (Pather.accessToAct(5) && me.hell && ["Zealer", "Smiter", "Uberconc"].indexOf(SetUp.currentBuild) > -1) {
				return true;
			}

			break;
		default:
			break;
		}

		return false;
	},

	Gold: function () {
		let gold = me.getStat(14) + me.getStat(15);
		let goldLimit = [25000, 50000, 100000][me.diff];

		if ((me.normal && !Pather.accessToAct(2)) || gold >= goldLimit) {
			return true;
		}

		me.overhead('low gold');

		return false;
	},

	brokeAf: function () {
		let gold = me.getStat(14) + me.getStat(15);
		let goldLimit = [10000, 25000, 50000][me.diff];

		if (gold >= goldLimit || me.charlvl < 15 || (me.charlvl >= 15 && gold > 1000 && Item.getEquippedItem(4).durability !== 0)) {
			return false;
		}

		me.overhead("I am broke af");
		NTIP.addLine("[name] == gold # [gold] >= 1");

		return true;
	},

	broken: function () {
		let gold = me.getStat(14) + me.getStat(15);

		// Almost broken but not quite
		if (((Item.getEquippedItem(4).durability <= 30 && Item.getEquippedItem(4).durability > 0) || Item.getEquippedItem(5).durability <= 30 && Item.getEquippedItem(5).durability > 0) && 
			!me.getMerc() && me.charlvl >= 15 && !me.normal && !me.nightmare && gold < 1000) {
			return 1;
		}

		// Broken
		if ((Item.getEquippedItem(4).durability === 0 || Item.getEquippedItem(5).durability === 0) && me.charlvl >= 15 && !me.normal && gold < 1000) {
			return 2;
		}

		return -1;
	},

	Resistance: function () {
		let resStatus,
			resPenalty = me.classic ? [0, 20, 50][me.diff] : [0, 40, 100][me.diff],
			frRes = me.getStat(39) - resPenalty,
			lrRes = me.getStat(41) - resPenalty,
			crRes = me.getStat(43) - resPenalty,
			prRes = me.getStat(45) - resPenalty;

		if ((frRes >= 0) && (lrRes >= 0) && (crRes >= 0)) {
			resStatus = true;
		} else {
			resStatus = false;
		}

		return {
			Status: resStatus,
			FR: frRes,
			CR: crRes,
			LR: lrRes,
			PR: prRes,
		};
	},

	mercResistance: function () {
		let mercenary = Merc.getMercFix();

		// Dont have merc or he is dead
		if (!mercenary) {
			return {
				FR: 0,
				CR: 0,
				LR: 0,
				PR: 0,
			};
		}

		let resPenalty = me.classic ? [0, 20, 50, 50][me.diff + 1] : [ 0, 40, 100, 100][me.diff + 1],
			frRes = mercenary.getStat(39) - resPenalty,
			lrRes = mercenary.getStat(41) - resPenalty,
			crRes = mercenary.getStat(43) - resPenalty,
			prRes = mercenary.getStat(45) - resPenalty;

		return {
			FR: frRes,
			CR: crRes,
			LR: lrRes,
			PR: prRes,
		};	
	},

	nextDifficulty: function (announce = true) {
		let diffShift = me.diff;
		let lowRes = !this.Resistance().Status;
		let lvlReq = (me.charlvl >= SetUp.levelCap) && ["Bumper", "Socketmule"].indexOf(SetUp.finalBuild) === -1 && Item.getEquippedItem(4).durability !== 0 ? true : false;
		let diffCompleted = !me.classic && me.baal ? true : me.classic && me.diablo ? true : false;

		if (diffCompleted) {
			if (lvlReq) {
				if (!lowRes) {
					diffShift = me.diff + 1;
					if (announce) {D2Bot.printToConsole('Kolbot-SoloPlay: next difficulty requirements met. Starting: ' + Difficulty[diffShift], 8);}
				} else {
					if (me.charlvl >= SetUp.levelCap + 5) {
						diffShift = me.diff + 1;
						if (announce) {D2Bot.printToConsole('Kolbot-SoloPlay: Over leveled. Starting: ' + Difficulty[diffShift]);}
					} else {
						if (announce) {D2Bot.printToConsole('Kolbot-SoloPlay: ' + Difficulty[diffShift + 1] + ' requirements not met. Negative resistance. FR: ' + Check.Resistance().FR + ' | CR: ' + Check.Resistance().CR + ' | LR: ' + Check.Resistance().LR);}
						return false;
					}
				}
			}
		} else {
			return false;
		}

		let nextDiff = Difficulty[diffShift];

		return nextDiff;
	},

	Runes: function () {
		let needRunes = true;

		switch (me.diff) {
		case sdk.difficulty.Normal:
			// Have runes or stealth and ancients pledge
			if ((me.getItem(sdk.runes.Tal) && me.getItem(sdk.runes.Eth)) || this.haveItem("armor", "runeword", "Stealth")) {
				needRunes = false;
			}

			break;
		case sdk.difficulty.Nightmare:
			if ((me.getItem(sdk.runes.Tal) && me.getItem(sdk.runes.Thul) && me.getItem(sdk.runes.Ort) && me.getItem(sdk.runes.Amn) && Check.currentBuild().caster) || 
				(!me.paladin && this.haveItem("sword", "runeword", "Spirit")) || (me.paladin && this.haveItem("sword", "runeword", "Spirit") && this.haveItem("auricshields", "runeword", "Spirit")) ||
				(me.necromancer && this.haveItem("wand", "runeword", "White") && (this.haveItem("voodooheads", "runeword", "Rhyme") || Item.getEquippedItem(5).tier > 800)) ||
				(me.barbarian && (Check.haveItem("sword", "runeword", "Lawbringer") || me.baal))) {
				needRunes = false;
			}

			break;
		case sdk.difficulty.Hell:
			if (!me.baal || (me.sorceress && ["Blova", "Lightning"].indexOf(SetUp.currentBuild) === -1)) {
				needRunes = false;
			}

			break;
		}

		return needRunes;
	},

	haveItem: function (type, flag, iName) {
		type = type.toLowerCase();
		flag = flag.toLowerCase();

		if (type && !NTIPAliasType[type] && !NTIPAliasClassID[type]) {
			print("ÿc9SoloLevelingÿc0: No NTIPalias for '" + type + "'");
		}

		if (iName !== undefined) {
			iName = iName.toLowerCase();
		}

		let typeCHECK = false;
		let items = me.getItems();
		let itemCHECK = false;

		for (let i = 0; i < items.length && !itemCHECK; i++) {

			switch (flag) {
			case 'set':
				itemCHECK = !!(items[i].quality === 5) && items[i].fname.toLowerCase().includes(iName);
				break;
			case 'unique':
				itemCHECK = !!(items[i].quality === 7) && items[i].fname.toLowerCase().includes(iName);
				break;
			case 'crafted':
				itemCHECK = !!(items[i].getFlag(NTIPAliasQuality["crafted"]));
				break;
			case 'runeword':
				itemCHECK = !!(items[i].getFlag(NTIPAliasFlag["runeword"])) && items[i].fname.toLowerCase().includes(iName);
				break;
			}

			switch (type) {
			case "helm":
			case "primalhelm":
			case "pelt":
			case "armor":
			case "shield":
			case "auricshields":
			case "voodooheads":
			case "gloves":
			case "belt":
			case "boots":
			case "ring":
			case "amulet":
			case "axe":
			case "bow":
			case "amazonbow":
			case "crossbow":
			case "dagger":
			case "javelin":
			case "amazonjavelin":
			case "mace":
			case "polearm":
			case "scepter":
			case "spear":
			case "amazonspear":
			case "staff":
			case "sword":
			case "wand":
			case "assassinclaw":
			case "weapon":
			case "smallcharm":
			case "mediumcharm":
			case "largecharm":
				typeCHECK = items[i].itemType === NTIPAliasType[type];
				break;
			default:
				typeCHECK = items[i].classid === NTIPAliasClassID[type];
				break;
			}

			if (type) {
				itemCHECK = itemCHECK && typeCHECK;
			}
		}

		return itemCHECK;
	},

	haveItemAndNotSocketed: function (type, flag, iName) {
		type = type.toLowerCase();
		flag = flag.toLowerCase();

		if (type && !NTIPAliasType[type] && !NTIPAliasClassID[type]) {
			print("ÿc8Kolbot-SoloPlayÿc0: No NTIPalias for '" + type + "'");
		}

		if (iName !== undefined) {
			iName = iName.toLowerCase();
		}

		let typeCHECK = false;
		let items = me.getItems();
		let itemCHECK = false;

		for (let i = 0; i < items.length && !itemCHECK; i++) {

			switch (flag) {
			case 'set':
				itemCHECK = !!(items[i].quality === 5) && items[i].fname.toLowerCase().includes(iName);
				break;
			case 'unique':
				itemCHECK = !!(items[i].quality === 7) && items[i].fname.toLowerCase().includes(iName);
				break;
			case 'crafted':
				itemCHECK = !!(items[i].getFlag(NTIPAliasQuality["crafted"]));
				break;
			case 'runeword':
				itemCHECK = !!(items[i].getFlag(NTIPAliasFlag["runeword"])) && items[i].fname.toLowerCase().includes(iName);
				break;
			}

			switch (type) {
			case "helm":
			case "primalhelm":
			case "pelt":
			case "armor":
			case "shield":
			case "auricshields":
			case "voodooheads":
			case "gloves":
			case "belt":
			case "boots":
			case "ring":
			case "amulet":
			case "axe":
			case "bow":
			case "amazonbow":
			case "crossbow":
			case "dagger":
			case "javelin":
			case "amazonjavelin":
			case "mace":
			case "polearm":
			case "scepter":
			case "spear":
			case "amazonspear":
			case "staff":
			case "sword":
			case "wand":
			case "assassinclaw":
			case "weapon":
				typeCHECK = items[i].itemType === NTIPAliasType[type];
				break;
			default:
				typeCHECK = items[i].classid === NTIPAliasClassID[type];
				break;
			}

			if (type) {
				itemCHECK = itemCHECK && typeCHECK && !items[i].getItem();
			}
		}

		return itemCHECK;
	},

	haveBase: function (type, sockets) {
		if (type === undefined || sockets === undefined) {
			return false;
		}

		switch (typeof type) {
		case "number":
			break;
		case "string":
			type = type.toLowerCase();
			break;
		}

		let baseCheck = false;
		let items = me.getItems()
			.filter(item => 
				[2, 3].indexOf(item.quality) > -1 &&
				[3, 7].indexOf(item.location) > -1);

		for (let i = 0; i < items.length; i++) {
			if (items[i].getStat(194) === sockets) {
				switch (type) {
				case "helm":
				case "primalhelm":
				case "pelt":
				case "armor":
				case "shield":
				case "auricshields":
				case "voodooheads":
				case "gloves":
				case "belt":
				case "boots":
				case "ring":
				case "amulet":
				case "axe":
				case "bow":
				case "amazonbow":
				case "crossbow":
				case "dagger":
				case "javelin":
				case "amazonjavelin":
				case "mace":
				case "polearm":
				case "scepter":
				case "spear":
				case "amazonspear":
				case "staff":
				case "sword":
				case "wand":
				case "assassinclaw":
				case "weapon":
					baseCheck = items[i].itemType === NTIPAliasType[type];

					break;
				default:
					baseCheck = items[i].classid === NTIPAliasClassID[type];

					break;
				}

				if (baseCheck) {
					break;
				}

			}
		}

		return baseCheck;
	},

	currentBuild: function () {
		function getBuildTemplate () {
			let buildType = SetUp.currentBuild;
			let build = buildType + "Build" ;
			let classname = ["Amazon", "Sorceress", "Necromancer", "Paladin", "Barbarian", "Druid", "Assassin"][me.classid];
			let template = "SoloPlay/BuildFiles/" + classname + "." + build + ".js";

			return template.toLowerCase();
		}

		var template = getBuildTemplate();

		if (!include(template)) {
			throw new Error("currentBuild(): Failed to include template: " + template);
		}

		if (SetUp.currentBuild === SetUp.finalBuild) {
			return {
				caster: finalBuild.caster,
				tabSkills: finalBuild.skillstab,
				wantedSkills: finalBuild.wantedskills,
				usefulSkills: finalBuild.usefulskills,
				precastSkills: finalBuild.precastSkills,
				mercAuraName: finalBuild.mercAuraName,
				mercAuraWanted: finalBuild.mercAuraWanted,
				mercDiff: finalBuild.mercDiff,
				finalGear: finalBuild.autoEquipTiers,
			};
		}

		return {
			caster: build.caster,
			tabSkills: build.skillstab,
			wantedSkills: build.wantedskills,
			usefulSkills: build.usefulskills,
		};
	},

	finalBuild: function () {
		function getBuildTemplate () {
			if (SetUp.finalBuild.includes("Build") || SetUp.finalBuild.includes("build")) {
				SetUp.finalBuild = SetUp.finalBuild.substring(0, SetUp.finalBuild.length - 5);
				D2Bot.printToConsole("Kolbot-SoloPlay: Info tag contained build which is unecessary. It has been fixed. New InfoTag/finalBuild :: " + SetUp.finalBuild, 9);
				D2Bot.setProfile(null, null, null, null, null, SetUp.finalBuild);
				DataFile.updateStats("finalBuild", SetUp.finalBuild);
			}

			if (SetUp.finalBuild.includes(".")) {
				SetUp.finalBuild = SetUp.finalBuild.substring(SetUp.finalBuild.indexOf(".") + 1);
				SetUp.finalBuild = SetUp.finalBuild[0].toUpperCase() + SetUp.finalBuild.substring(1).toLowerCase();
				D2Bot.printToConsole("Kolbot-SoloPlay: Info tag was incorrect, it contained '.' which is unecessary and means you likely entered something along the lines of Classname.finalBuild. I have attempted to remedy this. If it is still giving you an error please re-read the documentation. New InfoTag/finalBuild :: " + SetUp.finalBuild, 9);
				D2Bot.setProfile(null, null, null, null, null, SetUp.finalBuild);
				DataFile.updateStats("finalBuild", SetUp.finalBuild);
			}

			if (SetUp.finalBuild.includes(" ")) {
				if (SetUp.finalBuild.indexOf(" ") === (SetUp.finalBuild.length - 1)) {	// Trailing space
					SetUp.finalBuild = SetUp.finalBuild.split(" ")[0];
					SetUp.finalBuild = SetUp.finalBuild[0].toUpperCase() + SetUp.finalBuild.substring(1).toLowerCase();
					D2Bot.printToConsole("Kolbot-SoloPlay: Info tag was incorrect, it contained a trailing space. I have attempted to remedy this. If it is still giving you an error please re-read the documentation. New InfoTag/finalBuild :: " + SetUp.finalBuild, 9);
					D2Bot.setProfile(null, null, null, null, null, SetUp.finalBuild);
					DataFile.updateStats("finalBuild", SetUp.finalBuild);
				}
			}

			let buildType = SetUp.finalBuild;
			let build;

			if (["Bumper", "Socketmule"].indexOf(SetUp.finalBuild) > -1) {
				build = ["Javazon", "Lightning", "Bone", "Hammerdin", "Whirlwind", "Wind", "Trapsin"][me.classid] + "Build";
			} else  {
				build = buildType + "Build";
			}

			let classname = ["Amazon", "Sorceress", "Necromancer", "Paladin", "Barbarian", "Druid", "Assassin"][me.classid];
			let template = "SoloPlay/BuildFiles/" + classname + "." + build + ".js";

			return template.toLowerCase();
		}

		var template = getBuildTemplate();

		if (!include(template)) {
			print("ÿc8Kolbot-SoloPlayÿc0: Failed to include finalBuild template. Please check that you have actually entered it in correctly. Here is what you currently have: " + SetUp.finalBuild);
			throw new Error("finalBuild(): Failed to include template: " + template);
		}

		return {
			caster: finalBuild.caster,
			tabSkills: finalBuild.skillstab,
			wantedSkills: finalBuild.wantedskills,
			usefulSkills: finalBuild.usefulskills,
			precastSkills: finalBuild.precastSkills,
			mercAuraName: finalBuild.mercAuraName,
			mercAuraWanted: finalBuild.mercAuraWanted,
			mercDiff: finalBuild.mercDiff,
			finalGear: finalBuild.autoEquipTiers,
		};
	},

	checkSpecialCase: function () {
		let goalReached = false;

		switch (SetUp.finalBuild) {
		case "Bumper":
			if (SetUp.finalBuild === "Bumper" && me.charlvl >= 40) {
				goalReached = true;
			}

			break;
		case "Socketmule":
			if (SetUp.finalBuild === "Socketmule" && Misc.checkQuest(35, 1)) {
				goalReached = true;
			}

			break;
		default:
			if (Developer.stopAtLevel.enabled) {
				for (let i = 0; i < Developer.stopAtLevel.profiles.length; i++) {
					if (Developer.stopAtLevel.profiles[i][0].toLowerCase() === me.profile.toLowerCase()) {
						if (me.charlvl >= Developer.stopAtLevel.profiles[i][1]) {
							D2Bot.printToConsole("Kolbot-SoloPlay level goal reached. Current level: " + me.charlvl, 6);
							if (Developer.logPerformance) {
								Tracker.Update();
							}
							D2Bot.stop();
						}
					}
				}
			}

			break;
		}

		if (goalReached) {
			if (Developer.fillAccount.Bumpers || Developer.fillAccount.Socketmules) {
				SetUp.makeNext();
			} else {
				D2Bot.printToConsole("Kolbot-SoloPlay " + SetUp.finalBuild + " goal reached.", 6);
				if (Developer.logPerformance) {
					Tracker.Update();
				}
				D2Bot.stop();
			}
		}
	},

	usePreviousSocketQuest: function () {
		if (!Check.Resistance().Status) {
			if (me.weaponswitch === 0 && Item.getEquippedItem(5).fname.includes("Lidless Wall") && !Item.getEquippedItem(5).socketed) {
				if (me.hell) {
					if (FileTools.exists("libs/SoloPlay/Data/" + me.profile + ".SocketData.json")) {
						let data = Developer.readObj("libs/SoloPlay/Data/" + me.profile + ".SocketData.json");
						if (data.Nightmare === false) {
							D2Bot.setProfile(null, null, null, 'Nightmare');
							DataFile.updateStats("setDifficulty", 'Nightmare');
							D2Bot.printToConsole('Kolbot-SoloPlay: Going back to Nightmare to use socket quest');
							print("ÿc8Kolbot-SoloPlayÿc0: Going back to Nightmare to use socket quest");
							me.overhead("Going back to Nightmare to use socket quest");
							D2Bot.restart();
						}
					}
				}
			}
		}
	},
};

var indexOfMax = function (arr) {
	if (arr.length === 0) {
		return -1;
	}

	var max = arr[0];
	var maxIndex = 0;

	for (let index = 1; index < arr.length; index++) {
		if (arr[index] > max) {
			maxIndex = index;
			max = arr[index];
		}
	}

	return maxIndex;
};
