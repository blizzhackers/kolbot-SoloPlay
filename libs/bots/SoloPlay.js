/*
*	@filename	SoloPlay.js
*	@author		theBGuy
*	@credits	isid0re
*	@desc		Base script file for Kolbot-SoloPlay system
*/

//---------------- Do Not Touch Below ----------------\\

if (!isIncluded("SoloPlay/Tools/Tracker.js")) { include("SoloPlay/Tools/Tracker.js"); }
if (!isIncluded("SoloPlay/Tools/CharData.js")) { include("SoloPlay/Tools/CharData.js"); }

function SoloPlay () {
	this.setup = function () {
		myPrint('start setup');
		NTIP.arrayLooping(nipItems.Quest);
		NTIP.arrayLooping(nipItems.General);
		myPrint('starting run');

		if (impossibleClassicBuilds.includes(SetUp.finalBuild) && me.classic) {
			D2Bot.printToConsole("Kolbot-SoloPlay: " + SetUp.finalBuild + " cannot be used in classic. Change the info tag or remake as an expansion character...Shutting down", 9);
			FileTools.remove("data/" + me.profile + ".json");
			FileTools.remove("libs/SoloPlay/Data/" + me.profile + ".GameTime" + ".json");
			D2Bot.stop();
		}

		if (impossibleNonLadderBuilds.includes(SetUp.finalBuild) && !Developer.addLadderRW) {
			D2Bot.printToConsole("Kolbot-SoloPlay: " + SetUp.finalBuild + " cannot be used in non-ladder as they require ladder runewords. Change the info tag or remake as an ladder character...Shutting down", 9);
			FileTools.remove("data/" + me.profile + ".json");
			FileTools.remove("libs/SoloPlay/Data/" + me.profile + ".GameTime" + ".json");
			D2Bot.stop();
		}

		if (me.charlvl === 1) {
			myData.me.startTime === 0 && CharData.updateData("me", "startTime", me.gamestarttime);
			let buckler = me.getItem(328);
			!!buckler && buckler.isEquipped && buckler.drop();
		}

		Town.heal() && me.cancelUIFlags();
		Check.checkSpecialCase();
		ensureData();

		return true;
	};

	this.runScripts = function () {
		let j, k;

		switch (Check.broken()) {
		case 1:
			goToDifficulty('Nightmare', 'Oof I am nearly broken, going back to nightmare to get back on my feet');

			break;
		case 2:
			goToDifficulty('Normal', 'Oof I am broken, going back to normal to get easy gold');

			break;
		default:
			break;
		}

		Check.usePreviousSocketQuest(); // Currently only supports going back to nightmare to socket a lidless if one is equipped. 

		for (k = 0; k < SetUp.scripts.length; k++) {
			!me.inTown && Town.goToTown();
			Check.checkSpecialCase();

			if (Check.Task(SetUp.scripts[k])) {
				if (!isIncluded("SoloPlay/Scripts/" + SetUp.scripts[k] + ".js")) {
					include("SoloPlay/Scripts/" + SetUp.scripts[k] + ".js");
				}

				let tick = getTickCount();
				let currentExp = me.getStat(13);

				for (j = 0; j < 5; j += 1) {
					if (this[SetUp.scripts[k]]()) {
						break;
					}
				}

				Developer.logPerformance && Tracker.Script(tick, SetUp.scripts[k], currentExp);
				print("ÿc8Kolbot-SoloPlayÿc0: Old maxgametime: " + Developer.formatTime(me.maxgametime));
				me.maxgametime += (getTickCount() - tick);
				print("ÿc8Kolbot-SoloPlayÿc0: New maxgametime: " + Developer.formatTime(me.maxgametime));

				if (j === 5) {
					myPrint("script " + SetUp.scripts[k] + " failed.");
				}
			}
		}

		return true;
	};

	this.scriptEvent = function (msg) {
		let temp;

		if (msg && typeof msg === "string" && msg !== "") {
			switch (true) {
			case msg.substring(0, 6) === "buff--":
				console.debug("update buffData");
				temp = JSON.parse(msg.split("buff--")[1]);
				Misc.updateRecursively(CharData.buffData, temp);

				break;
			case msg.substring(0, 7) === "skill--":
				console.debug("update skillData");
				temp = JSON.parse(msg.split("skill--")[1]);
				Misc.updateRecursively(CharData.skillData, temp);

				break;
			case msg.toLowerCase() === "test":
				console.debug(CharData.buffData);
				console.debug(CharData.skillData);

				break;
			}
		}
	};

	addEventListener("scriptmsg", this.scriptEvent);

	// Start Running Script
	this.setup();

	// Start Developer mode - this stops the script from progressing past this point and allows running specific scripts/functions through chat commands
	if (Developer.developerMode.enabled) {
		if (Developer.developerMode.profiles.some(profile => profile.toLowerCase() === me.profile.toLowerCase())) {
			if (!isIncluded("SoloPlay/Scripts/developermode.js")) {
				include("SoloPlay/Scripts/developermode.js");
			}

			if (isIncluded("SoloPlay/Scripts/developermode.js")) {
				Developer.debugging.pathing && (me.automap = true);
				this.developermode();
			} else {
				print("ÿc8Kolbot-SoloPlayÿc0: Failed to include developermode");
			}
		}
	}

	let updatedDifficulty = Check.nextDifficulty();

	if (updatedDifficulty) {
		CharData.updateData("me", "setDifficulty", updatedDifficulty);
		D2Bot.setProfile(null, null, null, updatedDifficulty);
	}

	this.runScripts();

	// Re-check to see if after this run we now meet difficulty requirments
	if (!updatedDifficulty) {
		updatedDifficulty = Check.nextDifficulty(false);

		if (updatedDifficulty) {
			CharData.updateData("me", "setDifficulty", updatedDifficulty);
			D2Bot.setProfile(null, null, null, updatedDifficulty);
		}
	}

	scriptBroadcast('quit');

	return true;
}
