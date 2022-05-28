/**
*  @filename    Globals.js
*  @author      theBGuy
*  @credit      alogwe, isid0re
*  @desc        Global functions for Kolbot-SoloPlay functionality
*
*/

!isIncluded("OOG.js") && include("OOG.js");
!isIncluded("SoloPlay/Tools/Developer.js") && include("SoloPlay/Tools/Developer.js");
!isIncluded("SoloPlay/Tools/CharData.js") && include("SoloPlay/Tools/CharData.js");
!isIncluded("SoloPlay/Functions/PrototypesOverrides.js") && include("SoloPlay/Functions/PrototypesOverrides.js");

let myData = CharData.getStats();

// these builds are not possible to do on classic
let impossibleClassicBuilds = ["Bumper", "Socketmule", "Witchyzon", "Auradin", "Torchadin", "Immortalwhirl", "Sancdreamer"];
// these builds are not possible to do without ladder runewords
let impossibleNonLadderBuilds = ["Auradin", "Sancdreamer"];

Unit.prototype.__defineGetter__('mercid', function () {
	return !!myData ? myData.merc.classid : me.getMerc().classid;
});

Unit.prototype.__defineGetter__('trueStr', function () {
	return !!myData ? myData.me.strength : me.rawStrength;
});

Unit.prototype.__defineGetter__('trueDex', function () {
	return !!myData ? myData.me.dexterity : me.rawDexterity;
});

function myPrint (str = "", toConsole = false, color = 0) {
	console.log("ÿc8Kolbot-SoloPlayÿc0: " + str);
	me.overhead(str);

	if (toConsole && typeof color === "string") {
		color = color.capitalize(true);
		color = !!sdk.colors.D2Bot[color] ? sdk.colors.D2Bot[color] : 0;
	}
	toConsole && D2Bot.printToConsole("Kolbot-SoloPlayÿ :: " + str, color);
}

function updateMyData () {
	let scripts = ["default.dbj", "libs/soloplay/threads/townchicken.js", "libs/soloplay/threads/toolsthread.js", "libs/soloplay/threads/eventthread.js"];
	let obj = JSON.stringify(Misc.copy(myData));
	let myThread = getScript(true).name;
	scripts.forEach(function (script) {
		let curr = getScript(script);
		if (curr && myThread !== curr.name) {
			curr.send("data--" + obj);
		}
	});
}

function ensureData () {
	let temp = Misc.copy(myData);

	if (myData.me.currentBuild !== SetUp.getBuild()) {
		switch (true) {
		case Check.currentBuild().active():
		case Check.finalBuild().active():
			myData.me.currentBuild = SetUp.getBuild();

			break;
		case !["Start", "Stepping", "Leveling"].includes(SetUp.getBuild()) && myData.me.currentBuild !== myData.me.finalBuild:
			myData.me.currentBuild = "Leveling";

			break;
		}
	}

	if (sdk.difficulty.Difficulties.indexOf(myData.me.highestDifficulty) < sdk.difficulty.Difficulties.indexOf(sdk.difficulty.nameOf(me.diff))) {
		myData.me.highestDifficulty = sdk.difficulty.nameOf(me.diff);
	}

	if (!!me.smith && myData[sdk.difficulty.nameOf(me.diff).toLowerCase()].imbueUsed === false) {
		myData[sdk.difficulty.nameOf(me.diff).toLowerCase()].imbueUsed = true;
	}

	if (!!me.respec && myData[sdk.difficulty.nameOf(me.diff).toLowerCase()].respecUsed === false) {
		myData[sdk.difficulty.nameOf(me.diff).toLowerCase()].respecUsed = true;
	}

	myData.me.level !== me.charlvl && (myData.me.level = me.charlvl);
	myData.me.strength !== me.rawStrength && (myData.me.strength = me.rawStrength);
	myData.me.dexterity !== me.rawDexterity && (myData.me.dexterity = me.rawDexterity);

	// Merc check
	if (me.expansion) {
		if (!!me.getMerc()) {
			// TODO: figure out how to ensure we are already using the right merc to prevent re-hiring
			// can't do an aura check as merc auras are bugged, only useful info from getUnit is the classid
			let merc = me.getMerc();
			if (merc.classid !== myData.merc.classid) {
				myData.merc.classid = merc.classid;
				console.debug(myData.merc);
			}
		}

		if (!!me.shenk && myData[sdk.difficulty.nameOf(me.diff).toLowerCase()].socketUsed === false) {
			myData[sdk.difficulty.nameOf(me.diff).toLowerCase()].socketUsed = true;
		}
	}

	let changed = Misc.recursiveSearch(myData, temp);
	
	if (Object.keys(changed).length > 0) {
		console.debug(changed);
		CharData.updateData("me", myData) && updateMyData();
	}
}

// general settings
const SetUp = {
	scripts: [
		// Act 1
		"corpsefire", "den", "bloodraven", "tristram", "treehead", "countess", "smith", "pits", "jail", "boneash", "andariel", "a1chests", "cows",
		// Act 2
		"cube", "radament", "amulet", "summoner", "tombs", "ancienttunnels", "staff", "duriel",
		// Act 3
		"lamessen", "templeruns", "lowerkurast", "eye", "heart", "brain", "travincal", "mephisto",
		// Act 4
		"izual", "hellforge", "river", "hephasto", "diablo",
		// Act 5
		"shenk", "savebarby", "anya", "ancients", "baal", "a5chests",
	],

	// TODO: write me.mainDps prototype to clean up exclusions
	/*scripts: {
		corpsefire: {
			preReq: () => { return me.den && me.hell; },
			skipIf: () => { return me.druid && me.paladin; },
			runIf: () => { return this.preReq() && !this.skipIf() && (!me.andariel || Check.brokeAf()); }
		},
		den: {
			runIf: () => { return !me.den; }
		},
		bloodraven: {
			skipIf: () => { return ["Lightning", "Trapsin", "Javazon"].includes(SetUp.currentBuild); },
			byDiff: () => {
				switch (me.diff) {
				case sdk.difficulty.Normal:
					return !me.bloodraven || (!me.summoner && Check.brokeAf()) || (!me.tristram && me.barbarian);
				case sdk.difficulty.Nightmare:
					return !me.bloodraven;
				case sdk.difficulty.Hell:
					return !this.skipIf();
				}
			},
			runIf: () => { return this.byDiff(); }
		},
		treehead: {
			skipIf: () => { return !me.hell || !me.paladin || !Pather.accessToAct(3); },
			runIf: () => { return !this.skipIf() && SetUp.currentBuild !== SetUp.finalBuild; }
		},
		smith: {
			// does smith have leveling potential? for now just if we need the q
			runIf: () => { return !Misc.checkQuest(3, 1) && !me.smith; }
		},
		tristram: {
			skipIf: () => { return },
			byDiff: () => {
				switch (me.diff) {
				case sdk.difficulty.Normal:
					return (!me.tristram || me.charlvl < (me.barbarian ? 6 : 12) || Check.brokeAf());
				case sdk.difficulty.Nightmare:
				case sdk.difficulty.Hell:
					return !this.skipIf();
				}
			}
		},
	},*/

	// Should this be moved elsewhere? Currently have to include Globals then call this to include rest of overrides
	// which in doing so would include globals anyway but does this always need to be included first?
	// really need a centralized way to make sure all files use/have the custom functions and all threads stay updated without having to
	// scriptBroadcast all the time
	include: function () {
		let folders = ["Functions"];
		folders.forEach( (folder) => {
			let files = dopen("libs/SoloPlay/" + folder + "/").getFiles();
			Array.isArray(files) && files
				.filter(file => file.endsWith('.js'))
				.sort(a => a.startsWith("PrototypesOverrides.js") ? 0 : 1) // Dirty fix to load new prototypes first
				.forEach(function (x) {
					if (!isIncluded("SoloPlay/" + folder + "/" + x)) {
						if (!include("SoloPlay/" + folder + "/" + x)) {
							throw new Error("Failed to include " + "SoloPlay/" + folder + "/" + x);
						}
					}
				});
		});
	},

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

	currentBuild: this.currentBuild,
	finalBuild: this.finalBuild,

	// setter for Developer option to stop a profile once it reaches a certain level
	stopAtLevel: (function () {
		if (!Developer.stopAtLevel.enabled) return false;
		let level = Developer.stopAtLevel.profiles.find(profile => profile[0].toLowerCase() === me.profile.toLowerCase()) || false;
		return level ? level[1] : false;
	})(),

	// pulls respec requirments from final build file
	respecTwo: function () {
		let respec = Check.finalBuild().respec() ? me.charlvl : 100;

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

		if (me.charlvl < Config.respecOne) {
			buildType = "Start";
		} else if (me.charlvl >= SetUp.respecTwo()) {
			buildType = SetUp.finalBuild;
		} else if (Config.respecOneB > 0 && me.charlvl >= Config.respecOne && me.charlvl < Config.respecOneB) {
			buildType = "Stepping";
		} else {
			buildType = "Leveling";
		}

		return buildType;
	},

	getTemplate: function () {
		let buildType = SetUp.currentBuild;
		let build = buildType + "Build" ;
		let template = "SoloPlay/BuildFiles/" + sdk.charclass.nameOf(me.classid) + "." + build + ".js";

		return {
			buildType: buildType,
			template: template.toLowerCase()
		};
	},

	specPush: function (specType) {
		let buildInfo = SetUp.getTemplate();

		if (!include(buildInfo.template)) throw new Error("Failed to include template: " + buildInfo.template);

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
		!isIncluded("SoloPlay/Tools/NameGen.js") && include("SoloPlay/Tools/NameGen.js");
		!isIncluded("SoloPlay/Tools/Tracker.js") && include("SoloPlay/Tools/Tracker.js");
		let gameObj, printTotalTime = Developer.logPerformance;
		printTotalTime && (gameObj = Developer.readObj(Tracker.GTPath));

		// log info
		myPrint(this.finalBuild + " goal reached. On to the next.");
		D2Bot.printToConsole("Kolbot-SoloPlay: " + this.finalBuild + " goal reached" + (printTotalTime ? " (" + (Developer.formatTime(gameObj.Total + Developer.Timer(gameObj.LastSave))) + "). " : ". ") + "Making next...", 6);

		D2Bot.setProfile(null, null, NameGen());
		CharData.delete(true);
		delay(100 + me.ping);
		D2Bot.restart();
	},

	belt: function () {
		let beltSlots = Math.max(1, Storage.BeltSize() - 1);
		Config.BeltColumn.forEach(function (col, index) {
			Config.MinColumn[index] = col.toLowerCase() !== "rv" ? beltSlots : 0;
		});
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
				print(e);
			}
		}
		return temp;
	},

	config: function () {
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
		Config.MercWatch = true;
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

		/* FastMod configuration. */
		Config.FCR = Developer.developerMode.enabled ? 0 : 255;
		Config.FHR = me.realm ? 0 : 255;
		Config.FBR = me.realm ? 0 : 255;
		Config.IAS = me.realm ? 0 : 255;

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
		Config.AutoBuild.Template = SetUp.getBuild();
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
});

// SoloPlay general gameplay items
const nipItems = {
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

const basicSocketables = {
	caster: [
		{
			classid: sdk.items.BroadSword,
			socketWith: [],
			useSocketQuest: true,
			condition: (item) => me.normal && !Check.haveBase("sword", 4) && !Check.haveItem("sword", "runeword", "Spirit") && item.ilvl >= 26 && item.isBaseType && !item.ethereal
		},
		{
			classid: sdk.items.CrystalSword,
			socketWith: [],
			useSocketQuest: true,
			condition: (item) => me.normal && !Check.haveBase("sword", 4) && !Check.haveItem("sword", "runeword", "Spirit") && item.ilvl >= 26 && item.ilvl <= 40 && item.isBaseType && !item.ethereal
		},
		{
			// Lidless
			classid: sdk.items.GrimShield,
			socketWith: [sdk.items.runes.Um],
			temp: [sdk.items.gems.Perfect.Diamond],
			useSocketQuest: !me.hell,
			condition: (item) => item.quality === sdk.itemquality.Unique && (item.isInStorage || (item.isEquipped && !item.isOnSwap)) && !item.ethereal
		},
	],
	all: [
		{
			classid: sdk.items.Bill,
			socketWith: [],
			useSocketQuest: true,
			condition: (item) => me.nightmare && item.ilvl >= 26 && item.isBaseType && item.ethereal
		},
		{
			classid: sdk.items.ColossusVoulge,
			socketWith: [],
			useSocketQuest: true,
			condition: (item) => me.nightmare && item.ilvl >= 26 && item.isBaseType && item.ethereal
		},
		{
			// Crown of Ages
			classid: sdk.items.Corona,
			socketWith: [sdk.items.runes.Ber, sdk.items.runes.Um],
			temp: [sdk.items.gems.Perfect.Ruby],
			useSocketQuest: false,
			condition: (item) => item.quality === sdk.itemquality.Unique && !item.ethereal
		},
		{
			// Moser's
			classid: sdk.items.RoundShield,
			socketWith: [sdk.items.runes.Um],
			temp: [sdk.items.gems.Perfect.Diamond],
			useSocketQuest: false,
			condition: (item) => item.quality === sdk.itemquality.Unique && !item.ethereal
		},
		{
			// Spirit Forge
			classid: sdk.items.LinkedMail,
			socketWith: [sdk.items.runes.Shael],
			temp: [sdk.items.gems.Perfect.Ruby],
			useSocketQuest: false,
			condition: (item) => item.quality === sdk.itemquality.Unique && !item.ethereal
		},
		{
			// Dijjin Slayer
			classid: sdk.items.Ataghan,
			socketWith: [sdk.items.runes.Amn],
			temp: [sdk.items.gems.Perfect.Skull],
			useSocketQuest: false,
			condition: (item) => !Check.currentBuild().caster && item.quality === sdk.itemquality.Unique && !item.ethereal
		},
		{
			// Bone Hew - for merc
			classid: sdk.items.OgreAxe,
			socketWith: [sdk.items.runes.Hel, sdk.items.runes.Amn],
			temp: [sdk.items.gems.Perfect.Skull],
			useSocketQuest: false,
			condition: (item) => item.quality === sdk.itemquality.Unique
		},
	]
};

const goToDifficulty = function (diff = undefined, reason = "") {
	try {
		if (!diff) throw ("diff is undefined");
		
		let diffString;
		switch (typeof diff) {
		case "string":
			diff = diff.capitalize(true);

			if (!sdk.difficulty.Difficulties.includes(diff)) throw ("difficulty doesn't exist" + diff);
			if (sdk.difficulty.Difficulties.indexOf(diff) === me.diff) throw ("already in this difficulty" + diff);
			diffString = diff;

			break;
		case "number":
			if (diff === me.diff || diff < 0) throw ("invalid diff" + diff);
			diffString = sdk.difficulty.nameOf(diff);

			break;
		default:
			throw ("?");
		}

		D2Bot.setProfile(null, null, null, diffString);
		CharData.updateData("me", "setDifficulty", diffString);
		myPrint("Going to " + diffString + reason, true);
		D2Bot.restart();
	} catch (e) {
		console.debug(e);
	}

	return false;
};

// General Game functions
const Check = {
	// TODO: clean this up somehow, I dislike how it looks right now as its not completely clear
	task: function (sequenceName) {
		let needRunes = this.runes();

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
			if ((!me.bloodraven && me.normal || (!me.summoner && Check.brokeAf()))
				|| (me.normal && !me.tristram && me.barbarian)
				|| (me.hell && ((me.sorceress && SetUp.currentBuild !== "Lightning")
					|| ((me.amazon || me.assassin) && Attack.checkInfinity())
					|| (me.barbarian || me.paladin || me.necromancer || me.druid)))) {
				return true;
			}

			break;
		case "treehead":
			if (me.hell && (me.paladin && (!Attack.auradin || !me.checkItem({name: sdk.locale.items.Enigma}).have || !Pather.accessToAct(3)))) {
				return true;
			}

			break;
		case "smith":
			if (!Misc.checkQuest(3, 1) && !me.smith) {
				return true;
			}

			break;
		case "tristram":
			if ((me.normal && (!me.tristram || me.charlvl < (me.barbarian ? 6 : 12) || Check.brokeAf()))
				|| (!me.normal && ((!me.tristram && me.diffCompleted)
					|| (me.barbarian && !Pather.accessToAct(3) && !me.checkItem({name: sdk.locale.items.Lawbringer}).have)
					|| (me.paladin && me.hell && !Pather.accessToAct(3) && (!Attack.auradin || !me.checkItem({name: sdk.locale.items.Enigma}).have))))) {
				return true;
			}

			break;
		case "countess":
			// classic quest not completed normal/nightmare || don't have runes for difficulty || barb in hell and have lawbringer
			if ((me.classic && !me.hell && !me.countess)
				|| (me.expansion && (needRunes || Check.brokeAf() || (me.barbarian && me.hell && me.checkItem({name: sdk.locale.items.Lawbringer}).have)))) {
				return true;
			}

			break;
		case "pits":
			if (me.hell &&
				((me.necromancer || me.barbarian || me.assassin) ||
					(me.paladin || me.druid && !Check.currentBuild().caster) ||
					(me.amazon && (SetUp.currentBuild === SetUp.finalBuild || me.charlvl >= 85)) ||
					(me.sorceress && me.charlvl >= 80))) {
				return true;
			}

			break;
		case "jail":
			if (me.hell && me.amazon && !me.mephisto) {
				return true;
			}

			break;
		case "boneash":
			if (me.hell && me.classic && !me.diablo) {
				return true;
			}

			break;
		case "andariel":
			if (!me.andariel || (me.classic && me.hell)
				|| (me.expansion && (!me.normal && (Pather.canTeleport() || me.charlvl <= 60))
					|| (me.hell && (!me.amazon || (me.amazon && SetUp.currentBuild === SetUp.finalBuild))))) {
				return true;
			}

			break;
		case "a1chests":
			if (me.classic) return false;
			if (me.charlvl >= 70 && Pather.canTeleport()
				|| (me.barbarian && me.hell && !Pather.accessToAct(3)
				&& (Item.getEquippedItem(5).tier < 1270 && !me.checkItem({name: sdk.locale.items.Lawbringer}).have))) {
				return true;
			}

			break;
		case "cube":
			if (Pather.accessToAct(2) && !me.cube) {
				return true;
			}

			break;
		case "radament":
			if (!Pather.accessToAct(2)) return false;
			if (!me.radament || (me.amazon && SetUp.currentBuild !== SetUp.finalBuild && me.hell)
				|| (me.hell && me.sorceress && me.classic && !me.diablo)) {
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
			if (!Pather.accessToAct(2)) return false;
			// No pally in hell due to magic immunes unless is melee build, No zon in hell unless at final build because light/poison immunes
			if (me.hell && (!me.paladin || (me.paladin && !Check.currentBuild().caster))
				&& (!me.amazon || (me.amazon && SetUp.currentBuild === SetUp.finalBuild))) {
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
			if (!Pather.accessToAct(3)) return false;
			if ((!me.lamessen || (me.nightmare && me.charlvl < 50) || (me.hell && !me.classic))
				&& (!me.paladin || (me.paladin && !Check.currentBuild().caster))) {
				return true;
			}

			break;
		case "lamessen":
			if (Pather.accessToAct(3) && !me.lamessen && ((me.paladin && !Check.currentBuild().caster) || me.classic)) {
				return true;
			}

			break;
		case "lowerkurast":
			if (Pather.accessToAct(3) && me.nightmare && me.charlvl >= 50 && me.barbarian && !me.checkItem({name: sdk.locale.items.VoiceofReason}).have) {
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
			if (!Pather.accessToAct(3)) return false;
			if (!me.travincal
				|| (me.charlvl < 25 || (me.charlvl >= 25 && me.normal && !me.baal && !Check.gold()))
				|| (me.nightmare && !me.diablo && me.barbarian && !me.checkItem({name: sdk.locale.items.Lawbringer}).have)
				|| (me.hell && me.paladin && me.charlvl > 85 && (!Attack.auradin || !me.checkItem({name: sdk.locale.items.Enigma}).have))) {
				return true;
			}

			break;
		case "mephisto":
			if (Pather.accessToAct(3)) {
				if (!me.mephisto) return true;
				switch (me.diff) {
				case sdk.difficulty.Normal:
					return !Check.gold() || !me.diffCompleted;
				case sdk.difficulty.Nightmare:
					return Pather.canTeleport() || me.charlvl <= 65;
				case sdk.difficulty.Hell:
					return true;
				}
			}

			break;
		case "izual":
			if (Pather.accessToAct(4) && !me.izual) {
				return true;
			}

			break;
		case "river":
			if (!Pather.accessToAct(4)) return false;
			if (!me.diablo && !me.normal
				&& (me.barbarian && !me.checkItem({name: sdk.locale.items.Lawbringer}).have)
				|| (me.sorceress && me.classic)) {
				return true;
			}

			break;
		case "hephasto":
			if (!Pather.accessToAct(4)) return false;
			if (!me.normal && me.diablo && me.barbarian && me.charlvl <= 70 && !me.checkItem({name: sdk.locale.items.Lawbringer}).have) {
				return true;
			}

			break;
		case "diablo":
			if (!Pather.accessToAct(4)) return false;
			if ((me.normal && (me.charlvl < 35 || me.classic))
				|| (me.nightmare && (Pather.canTeleport() || me.charlvl <= 65))
				|| me.hell || !me.diablo) {
				return true;
			}

			break;
		case "hellforge":
			if (Pather.accessToAct(4) && !me.hellforge) {
				return true;
			}

			break;
		case "shenk":
			if (me.expansion && Pather.accessToAct(5) && (!me.druid || me.charlvl <= 70)) {
				return true;
			}

			break;
		case "savebarby":
			// I need tal, ral, or ort rune for runewords
			if (me.expansion && Pather.accessToAct(5) && !me.savebarby
				&& Runewords.checkRune(sdk.items.runes.Tal, sdk.items.runes.Ral, sdk.items.runes.Ort)) {
				return true;
			}

			break;
		case "anya":
			if (me.expansion && Pather.accessToAct(5)) {
				return true;
			}

			break;
		case "ancients":
			if (me.expansion && Pather.accessToAct(5) && !me.ancients) {
				return true;
			}

			break;
		case "baal":
			if (me.expansion && Pather.accessToAct(5) && me.ancients) {
				return true;
			}

			break;
		case "cows":
			if (!me.cows && me.diffCompleted) {
				if (me.barbarian && !["Whirlwind", "Immortalwhirl", "Singer"].includes(SetUp.currentBuild) && (!me.normal || !Check.brokeAf())) return false;
				switch (me.diff) {
				case sdk.difficulty.Normal:
					if (Check.brokeAf()) {
						return true;
					}
					break;
				case sdk.difficulty.Nightmare:
					if (me.druid && me.charlvl <= 65) {
						return true;
					} else if (me.sorceress && (me.expansion || me.charlvl < 62)) {
						return true;
					} else if (!me.druid && !me.sorceress) {
						return true;
					}
					
					break;
				case sdk.difficulty.Hell:
					return true;
				}
			}

			break;
		case "a5chests":
			if (!me.normal && me.baal) {
				return true;
			}

			break;
		case "getkeys":
			if (me.expansion && Pather.accessToAct(5) && me.hell && ["Zealer", "Smiter", "Uberconc"].includes(SetUp.currentBuild)) {
				return true;
			}

			break;
		case "orgtorch":
			if (me.expansion && Pather.accessToAct(5) && me.hell && ["Zealer", "Smiter", "Uberconc"].includes(SetUp.currentBuild)) {
				return true;
			}

			break;
		default:
			break;
		}

		return false;
	},

	gold: function () {
		let gold = me.gold;
		let goldLimit = [25000, 50000, 100000][me.diff];

		if ((me.normal && !Pather.accessToAct(2)) || gold >= goldLimit) {
			return true;
		}

		me.overhead('low gold');

		return false;
	},

	brokeAf: function () {
		let gold = me.gold;
		let goldLimit = [10000, 25000, 50000][me.diff];

		if (gold >= goldLimit || me.charlvl < 15 || (me.charlvl >= 15 && gold > 1000 && Item.getEquippedItem(4).durability !== 0)) {
			return false;
		}

		me.overhead("I am broke af");
		NTIP.addLine("[name] == gold # [gold] >= 1");

		return true;
	},

	broken: function () {
		let gold = me.gold;

		// Almost broken but not quite
		if (((Item.getEquippedItem(4).durability <= 30 && Item.getEquippedItem(4).durability > 0)
			|| (Item.getEquippedItem(5).durability <= 30 && Item.getEquippedItem(5).durability > 0)
			&& !me.getMerc() && me.charlvl >= 15 && !me.normal && !me.nightmare && gold < 1000)) {
			return 1;
		}

		// Broken
		if ((Item.getEquippedItem(4).durability === 0 || Item.getEquippedItem(5).durability === 0) && me.charlvl >= 15 && !me.normal && gold < 1000) {
			return 2;
		}

		return 0;
	},

	resistance: function () {
		let resStatus,
			resPenalty = me.getResPenalty(me.diff + 1),
			frRes = me.getStat(sdk.stats.FireResist) - resPenalty,
			lrRes = me.getStat(sdk.stats.LightResist) - resPenalty,
			crRes = me.getStat(sdk.stats.ColdResist) - resPenalty,
			prRes = me.getStat(sdk.stats.PoisonResist) - resPenalty;

		resStatus = ((frRes >= 0) && (lrRes >= 0) && (crRes >= 0));

		return {
			Status: resStatus,
			FR: frRes,
			CR: crRes,
			LR: lrRes,
			PR: prRes,
		};
	},

	nextDifficulty: function (announce = true) {
		let diffShift = me.diff;
		let res = this.resistance();
		let lvlReq = !!((me.charlvl >= Config.levelCap) && !["Bumper", "Socketmule"].includes(SetUp.finalBuild) && !this.broken());

		if (me.diffCompleted) {
			if (lvlReq) {
				if (res.Status) {
					diffShift = me.diff + 1;
					announce && D2Bot.printToConsole('Kolbot-SoloPlay: next difficulty requirements met. Starting: ' + sdk.difficulty.nameOf(diffShift), sdk.colors.D2Bot.Blue);
				} else {
					if (me.charlvl >= Config.levelCap + (!me.normal ? 5 : 2)) {
						diffShift = me.diff + 1;
						announce && D2Bot.printToConsole('Kolbot-SoloPlay: Over leveled. Starting: ' + sdk.difficulty.nameOf(diffShift));
					} else {
						announce && myPrint(sdk.difficulty.nameOf(diffShift + 1) + ' requirements not met. Negative resistance. FR: ' + res.FR + ' | CR: ' + res.CR + ' | LR: ' + res.LR);
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
			if ([sdk.items.runes.Tal, sdk.items.runes.Eth].every((i) => !!me.getItem(i)) || this.haveItem("armor", "runeword", "Stealth")) {
				needRunes = false;
			}

			break;
		case sdk.difficulty.Nightmare:
			if (([sdk.items.runes.Tal, sdk.items.runes.Thul, sdk.items.runes.Ort, sdk.items.runes.Amn].every((i) => !!me.getItem(i)) && Check.currentBuild().caster)
				|| (!me.paladin && this.haveItem("sword", "runeword", "Spirit"))
				|| (me.paladin && this.haveItem("sword", "runeword", "Spirit") && this.haveItem("auricshields", "runeword", "Spirit"))
				|| (me.necromancer && this.haveItem("wand", "runeword", "White") && (this.haveItem("voodooheads", "runeword", "Rhyme") || Item.getEquippedItem(5).tier > 800))
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
		let isClassID = false;
		let itemCHECK = false;
		let typeCHECK = false;

		flag && typeof flag === "string" && (flag = flag.capitalize(true));
		typeof iName === "string" && (iName = iName.toLowerCase());

		let items = me.getItemsEx()
			.filter(function (item) {
				return !item.questItem && (flag === "Runeword" ? item.isRuneword : item.quality === sdk.itemquality[flag]);
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
			if (!Object.values(sdk.itemtype).includes(type) && !Object.values(sdk.items).includes(type)) return false;
			// check if item is a classid but with hacky fix for items like belt which is a type and classid...sigh
			isClassID = Object.values(sdk.items).includes(type) && !Object.values(sdk.itemtype).includes(type);

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
			case 'Set':
			case 'Unique':
			case 'Crafted':
				itemCHECK = !!(items[i].quality === sdk.itemquality[flag]) && (iName ? items[i].fname.toLowerCase().includes(iName) : true);
				break;
			case 'Runeword':
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
		quality && typeof quality === "string" && (quality = sdk.itemquality[quality.capitalize(true)]);
		typeof iName === "string" && (iName = iName.toLowerCase());
		let isClassID = false;

		switch (typeof type) {
		case "string":
			typeof type === "string" && (type = type.toLowerCase());
			if (!NTIPAliasType[type] && !NTIPAliasClassID[type]) return false;
			isClassID = !!NTIPAliasClassID[type];
			type = isClassID ? NTIPAliasClassID[type] : NTIPAliasType[type];
			
			break;
		case "number":
			if (!Object.values(sdk.itemtype).includes(type) && !Object.values(sdk.items).includes(type)) return false;
			isClassID = Object.values(sdk.items).includes(type);

			break;
		}

		let socketableCHECK = isClassID ? Config.socketables.find(({ classid }) => type === classid) : false;
		let typeCHECK = false;
		let itemCHECK = false;
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
			if (!Object.values(sdk.itemtype).includes(type) && !Object.values(sdk.items).includes(type)) return false;
			isClassID = Object.values(sdk.items).includes(type);

			break;
		}
		

		let items = me.getItemsEx()
			.filter(item => item.isBaseType && item.isInStorage && (isClassID ? item.classid === type : item.itemType === type));

		for (let i = 0; i < items.length; i++) {
			if (items[i].getStat(sdk.stats.NumSockets) === sockets && (isClassID ? items[i].classid === type : items[i].itemType === type)) {
				return true;
			}
		}

		return false;
	},

	currentBuild: function () {
		let buildInfo = SetUp.getTemplate();

		if (!include(buildInfo.template)) throw new Error("currentBuild(): Failed to include template: " + buildInfo.template);

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

			return ("SoloPlay/BuildFiles/" + sdk.charclass.nameOf(me.classid) + "." + build + ".js").toLowerCase();
		}

		let template = getBuildTemplate();

		if (!include(template)) {
			let foundError = false;
			let buildType;
			
			// try to see if we can correct the finalBuild
			if (myData.me.finalBuild.match("Build", "gi")) {
				myData.me.finalBuild = myData.me.finalBuild.substring(0, SetUp.finalBuild.length - 5);
				D2Bot.printToConsole("Kolbot-SoloPlay: Info tag contained build which is unecessary. It has been fixed. New InfoTag/finalBuild :: " + SetUp.finalBuild, 9);
				foundError = true;
			}

			if (myData.me.finalBuild.includes(".")) {
				myData.me.finalBuild = myData.me.finalBuild.substring(myData.me.finalBuild.indexOf(".") + 1).capitalize(true);
				D2Bot.printToConsole("Kolbot-SoloPlay: Info tag was incorrect, it contained '.' which is unecessary and means you likely entered something along the lines of Classname.finalBuild. I have attempted to remedy this. If it is still giving you an error please re-read the documentation. New InfoTag/finalBuild :: " + SetUp.finalBuild, 9);
				foundError = true;
			}

			if (myData.me.finalBuild.includes(" ")) {
				myData.me.finalBuild = myData.me.finalBuild.trim().capitalize(true);
				D2Bot.printToConsole("Kolbot-SoloPlay: Info tag was incorrect, it contained a trailing space. I have attempted to remedy this. If it is still giving you an error please re-read the documentation. New InfoTag/finalBuild :: " + SetUp.finalBuild, 9);
				foundError = true;
			}

			if (myData.me.finalBuild.includes("-")) {
				myData.me.finalBuild = myData.me.finalBuild.substring(myData.me.finalBuild.indexOf("-") + 1).capitalize(true);
				D2Bot.printToConsole("Kolbot-SoloPlay: Info tag was incorrect, it contained '-' which is unecessary and means you likely entered something along the lines of Classname-finalBuild. I have attempted to remedy this. If it is still giving you an error please re-read the documentation. New InfoTag/finalBuild :: " + SetUp.finalBuild, 9);
				foundError = true;
			}

			if (foundError) {
				D2Bot.setProfile(null, null, null, null, null, SetUp.finalBuild);
				CharData.updateData("me", "finalBuild", SetUp.finalBuild);
				buildType = myData.me.finalBuild;
				template = ("SoloPlay/BuildFiles/" + sdk.charclass.nameOf(me.classid) + "." + buildType + "Build.js").toLowerCase();
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
			respec: finalBuild.respec,
			active: finalBuild.active,
		};
	},

	checkSpecialCase: function () {
		let goalReached = false, goal = "";

		switch (true) {
		case SetUp.finalBuild === "Bumper" && me.charlvl >= 40:
		case !!(SetUp.finalBuild === "Socketmule" && Misc.checkQuest(35, 1)):
		case !!(SetUp.finalBuild === "Imbuemule" && Misc.checkQuest(3, 1) && me.charlvl >= Developer.imbueStopLevel):
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
			let gameObj, printTotalTime = Developer.logPerformance;
			printTotalTime && (gameObj = Developer.readObj(Tracker.GTPath));

			if (Developer.fillAccount.bumpers || Developer.fillAccount.socketMules) {
				SetUp.makeNext();
			} else {
				D2Bot.printToConsole("Kolbot-SoloPlay " + goal + " goal reached." + (printTotalTime ? " (" + (Developer.formatTime(gameObj.Total + Developer.Timer(gameObj.LastSave))) + ")" : ""), 6);
				Developer.logPerformance && Tracker.update();
				D2Bot.stop();
			}
		}
	},

	// TODO: enable this for other items, i.e maybe don't socket tal helm in hell but instead go back and use nightmare so then we can use hell socket on tal armor?
	usePreviousSocketQuest: function () {
		if (me.classic) return;
		if (!Check.resistance().Status) {
			if (me.weaponswitch === 0 && Item.getEquippedItem(5).fname.includes("Lidless Wall") && !Item.getEquippedItem(5).socketed) {
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
			if ([sdk.itemtype.Jewel, sdk.itemtype.Rune].includes(item.itemType) || (item.itemType >= sdk.itemtype.Amethyst && item.itemType <= sdk.itemtype.Skull)) {
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
				return !item.isRuneword && !item.questItem && item.quality >= sdk.itemquality.Magic && (item.getStat(sdk.stats.NumSockets) > 0 || getBaseStat("items", item.classid, "gemsockets") > 0);
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
		let numSockets = item.getStat(sdk.stats.NumSockets);
		let curr = Config.socketables.find(({ classid }) => item.classid === classid);

		if (curr && curr.socketWith.length > 0) {
			hasWantedItems = socketedWith.some(el => curr.socketWith.includes(el.classid));
			if (hasWantedItems && socketedWith.length === numSockets) {
				return true; // this item is full
			}

			if (curr.socketWith.includes(sdk.items.runes.Hel)) {
				let merc = me.getMerc();
				switch (true) {
				case Item.autoEquipKeepCheck(item) && me.trueStr >= item.strreq && me.trueDex >= item.dexreq:
				case Item.autoEquipKeepCheckMerc(item) && !!merc && merc.rawStrength >= item.strreq && merc.rawDexterity >= item.dexreq:
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
					let hel = me.getItemsEx(sdk.items.runes.Hel, 0);
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

			hasWantedItems = socketedWith.some(el => gemType ? el.itemType === sdk.itemtype[gemType] : el.classid === sdk.items.runes[runeType]);
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
			if ([sdk.itemtype.Jewel, sdk.itemtype.Rune].includes(item.itemType) || (item.itemType >= sdk.itemtype.Amethyst && item.itemType <= sdk.itemtype.Skull)) {
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
