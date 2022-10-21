/**
*  @filename    SoloPlay.js
*  @author      theBGuy
*  @desc        Base thread for Kolbot-SoloPlay system
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
// Include SoloPlay's librarys
include("SoloPlay/Tools/Throwable.js");
include("SoloPlay/Tools/Developer.js");
include("SoloPlay/Tools/Tracker.js");
include("SoloPlay/Tools/CharData.js");
include("SoloPlay/Tools/SoloIndex.js");
include("SoloPlay/Functions/ConfigOverrides.js");
include("SoloPlay/Functions/Globals.js");

// @todo
// call loader from here and change loader to use the soloplay script files
// todo - global skip gid array

function main () {
	D2Bot.init(); // Get D2Bot# handle
	D2Bot.ingame();

	(function (global, original) {
		global.load = function (...args) {
			original.apply(this, args);
			delay(500);
		};
	})([].filter.constructor("return this")(), load);

	// wait until game is ready
	while (!me.gameReady) {
		delay(50);
	}

	clearAllEvents(); // remove any event listeners from game crash

	// load heartbeat if it isn't already running
	!getScript("tools/heartbeat.js") && load("tools/heartbeat.js");

	SetUp.include();
	SetUp.init();

	let sojCounter = 0;
	let sojPause = false;
	let startTime = getTickCount();

	this.scriptEvent = function (msg) {
		let obj;

		if (msg && typeof msg === "string" && msg !== "") {
			switch (true) {
			case msg === "soj":
				sojPause = true;
				sojCounter = 0;
				
				break;
			case msg.substring(0, 8) === "config--":
				console.debug("update config");
				Config = JSON.parse(msg.split("config--")[1]);

				break;
			case msg.substring(0, 7) === "skill--":
				console.debug("update skillData");
				obj = JSON.parse(msg.split("skill--")[1]);
				Misc.updateRecursively(CharData.skillData, obj);

				break;
			case msg.substring(0, 6) === "data--":
				console.debug("update myData");
				obj = JSON.parse(msg.split("data--")[1]);
				Misc.updateRecursively(myData, obj);

				break;
			case msg.toLowerCase() === "test":
				console.debug(sdk.colors.Green + "//-----------DataDump Start-----------//\nÿc8MainData ::\n", getScript(true).name,
					myData, "\nÿc8BuffData ::\n", CharData.buffData, "\nÿc8SkillData ::\n", CharData.skillData, "\n" + sdk.colors.Red + "//-----------DataDump End-----------//");

				break;
			}
		}
	};

	this.copyDataEvent = function (mode, msg) {
		// "Mule Profile" option from D2Bot#
		if (mode === 0 && msg === "mule") {
			if (AutoMule.getInfo() && AutoMule.getInfo().hasOwnProperty("muleInfo")) {
				if (AutoMule.getMuleItems().length > 0) {
					D2Bot.printToConsole("Mule triggered");
					scriptBroadcast("mule");
					scriptBroadcast("quit");
				} else {
					D2Bot.printToConsole("No items to mule.");
				}
			} else {
				D2Bot.printToConsole("Profile not enabled for muling.");
			}
		}
	};

	this.setup = function () {
		myPrint("start setup");
		NTIP.arrayLooping(nipItems.Quest, nipItems.General);

		try {
			if (impossibleClassicBuilds.includes(SetUp.finalBuild) && me.classic) {
				throw new Error("Kolbot-SoloPlay: " + SetUp.finalBuild + " cannot be used in classic. Change the info tag or remake as an expansion character...Shutting down");
			}

			if (impossibleNonLadderBuilds.includes(SetUp.finalBuild) && !Developer.addLadderRW) {
				throw new Error("Kolbot-SoloPlay: " + SetUp.finalBuild + " cannot be used in non-ladder as they require ladder runewords. Change the info tag or remake as an ladder character...Shutting down");
			}
		} catch (e) {
			D2Bot.printToConsole(e, sdk.colors.D2Bot.Red);
			FileTools.remove("data/" + me.profile + ".json");
			FileTools.remove("libs/SoloPlay/Data/" + me.profile + ".GameTime" + ".json");
			D2Bot.stop();
		}

		if (me.charlvl === 1) {
			let buckler = me.getItem(sdk.items.Buckler);
			!!buckler && buckler.isEquipped && buckler.drop();
		}

		Town.heal() && me.cancelUIFlags();
		Check.checkSpecialCase();

		// check if any of our currently equipped items are no longer usable - can happen after respec
		me.getItemsEx()
			.filter(item => item.isEquipped)
			.forEach(item => {
				if (me.getStat(sdk.stats.Strength) < item.strreq || me.getStat(sdk.stats.Dexterity) < item.dexreq) {
					myPrint("No longer able to use " + item.fname);
					Item.removeItem(null, item);
				}
			});
		
		// initialize final charms if we have any
		Item.initCharms();

		return true;
	};

	// Initialize libs - load config variables, build pickit list, attacks, containers and cubing and runeword recipes
	Config.init(true);
	Pickit.init(true);
	Attack.init();
	Storage.Init();
	CraftingSystem.buildLists();
	Runewords.init();
	Cubing.init();
	LocalChat.init();

	// Load event listeners
	addEventListener("scriptmsg", this.scriptEvent);
	addEventListener("copydata", this.copyDataEvent);

	// GameAction/AutoMule/TorchSystem/Gambling/Crafting handler
	if (GameAction.inGameCheck() || AutoMule.inGameCheck() || TorchSystem.inGameCheck() || Gambling.inGameCheck() || CraftingSystem.inGameCheck()) {
		return true;
	}

	me.maxgametime = Time.seconds(Config.MaxGameTime);
	const stats = DataFile.getStats();

	// Check for experience decrease -> log death. Skip report if life chicken is disabled.
	if (stats.name === me.name && me.getStat(sdk.stats.Experience) < stats.experience && Config.LifeChicken > 0) {
		D2Bot.printToConsole("You died in last game. | Area :: " + stats.lastArea + " | Script :: " + stats.lastScript, sdk.colors.D2Bot.Red);
		D2Bot.printToConsole("Experience decreased by " + (stats.experience - me.getStat(sdk.stats.Experience)), sdk.colors.D2Bot.Red);
		DataFile.updateStats("deaths");
		D2Bot.updateDeaths();
	}

	DataFile.updateStats(["experience", "name"]);

	// Load threads
	if (SoloEvents.inGameCheck()) return true;
	load("libs/SoloPlay/Threads/ToolsThread.js");
	load("libs/SoloPlay/Threads/EventThread.js");
	load("libs/SoloPlay/Threads/TownChicken.js");
	
	// Load guard if we want to see the stack as it runs
	if (Developer.debugging.showStack.enabled) {
		// check in case we reloaded and guard was still running
		let guard = getScript("libs/SoloPlay/Modules/Guard.js");
		!!guard && guard.running && guard.stop();
		Developer.debugging.showStack.profiles.some(profile => profile.toLowerCase() === "all" || profile.toLowerCase() === me.profile.toLowerCase()) && require("../SoloPlay/Modules/Guard");
		delay(1000);
	}

	if (Config.PublicMode) {
		Config.PublicMode === true ? require("libs/modules/SimpleParty") : load("tools/Party.js");
	}
	
	// Config.AntiHostile && load("tools/AntiHostile.js");

	// One time maintenance - check cursor, get corpse, clear leftover items, pick items in case anything important was dropped
	Cubing.cursorCheck();
	Town.getCorpse();
	Town.clearBelt();
	Pather.init(); // initialize wp data
	
	let { x, y } = me;
	Config.ClearInvOnStart && Town.clearInventory();
	[x, y].distance > 3 && Pather.moveTo(x, y);
	Pickit.pickItems();
	me.hpPercent <= 10 && Town.heal() && me.cancelUIFlags();

	if (Config.DebugMode) {
		delay(2000);
		let script = getScript();

		if (script) {
			do {
				console.log(script);
			} while (script.getNext());
		}
	}

	me.automap = Config.AutoMap;

	// Next game = drop keys
	TorchSystem.keyCheck() && scriptBroadcast("torch");

	// Auto skill and stat
	if (Config.AutoSkill.Enabled && include("common/AutoSkill.js")) {
		AutoSkill.init(Config.AutoSkill.Build, Config.AutoSkill.Save);
	}

	if (Config.AutoStat.Enabled && include("common/AutoStat.js")) {
		AutoStat.init(Config.AutoStat.Build, Config.AutoStat.Save, Config.AutoStat.BlockChance, Config.AutoStat.UseBulk);
	}

	// offline
	!me.realm && D2Bot.updateRuns();

	// Start Running Script
	this.setup();

	// Start Developer mode - this stops the script from progressing past this point and allows running specific scripts/functions through chat commands
	if (Developer.developerMode.enabled) {
		if (Developer.developerMode.profiles.some(profile => profile.toLowerCase() === me.profile.toLowerCase())) {
			Developer.debugging.pathing && (me.automap = true);
			Loader.runScript("developermode");
		}
	}

	if (Check.brokeCheck()) return true;
	Check.usePreviousSocketQuest(); // Currently only supports going back to nightmare to socket a lidless if one is equipped.
	myPrint("starting run");
	Loader.run();
	// we have scripts to retry so lets run them
	if (SoloIndex.retryList.length) {
		SoloIndex.scripts = SoloIndex.retryList.slice(0);
		Loader.run();
	}

	if (Config.MinGameTime && getTickCount() - startTime < Time.seconds(Config.MinGameTime)) {
		try {
			Town.goToTown();

			while (getTickCount() - startTime < Time.seconds(Config.MinGameTime)) {
				me.overhead("Stalling for " + Math.round(((startTime + Time.seconds(Config.MinGameTime)) - getTickCount()) / 1000) + " Seconds");
				delay(1000);
			}
		} catch (e1) {
			console.error(e1);
		}
	}

	DataFile.updateStats("gold");

	if (sojPause) {
		try {
			Town.doChores();
			me.maxgametime = 0;

			while (sojCounter < Config.SoJWaitTime) {
				me.overhead("Waiting for SoJ sales... " + (Config.SoJWaitTime - sojCounter) + " min");
				delay(6e4);

				sojCounter += 1;
			}
		} catch (e2) {
			console.error(e2);
		}
	}

	if (Config.LastMessage) {
		switch (typeof Config.LastMessage) {
		case "string":
			say(Config.LastMessage.replace("$nextgame", DataFile.getStats().nextGame, "i"));

			break;
		case "object":
			for (let i = 0; i < Config.LastMessage.length; i += 1) {
				say(Config.LastMessage[i].replace("$nextgame", DataFile.getStats().nextGame, "i"));
			}

			break;
		}
	}

	AutoMule.muleCheck() && scriptBroadcast("mule");
	CraftingSystem.checkFullSets() && scriptBroadcast("crafting");
	TorchSystem.keyCheck() && scriptBroadcast("torch");

	// Anni handler. Mule Anni if it's in unlocked space and profile is set to mule torch/anni.
	let anni = me.findItem(sdk.items.SmallCharm, sdk.items.mode.inStorage, -1, sdk.items.quality.Unique);

	if (anni && !Storage.Inventory.IsLocked(anni, Config.Inventory) && AutoMule.getInfo() && AutoMule.getInfo().hasOwnProperty("torchMuleInfo")) {
		scriptBroadcast("muleAnni");
	}

	scriptBroadcast("quit");

	return true;
}
