/*
*	@filename	SoloPlay.js
*	@author		theBGuy
*	@credits	isid0re
*	@desc		Base script file for Kolbot-SoloPlay system
*/

// todo: maybe turn this into a thread and use it as a default.dbj replacement
// call loader from here and change loader to use the soloplay script files

//---------------- Do Not Touch Below ----------------\\

!isIncluded("SoloPlay/Tools/Tracker.js") && include("SoloPlay/Tools/Tracker.js");
!isIncluded("SoloPlay/Tools/CharData.js") && include("SoloPlay/Tools/CharData.js");

function SoloPlay () {
	this.setup = function () {
		myPrint('start setup');
		NTIP.arrayLooping(nipItems.Quest);
		NTIP.arrayLooping(nipItems.General);
		myPrint('starting run');

		try {
			if (impossibleClassicBuilds.includes(SetUp.finalBuild) && me.classic) {
				throw new Error("Kolbot-SoloPlay: " + SetUp.finalBuild + " cannot be used in classic. Change the info tag or remake as an expansion character...Shutting down");
			}

			if (impossibleNonLadderBuilds.includes(SetUp.finalBuild) && !Developer.addLadderRW) {
				throw new Error("Kolbot-SoloPlay: " + SetUp.finalBuild + " cannot be used in non-ladder as they require ladder runewords. Change the info tag or remake as an ladder character...Shutting down");
			}
		} catch (e) {
			D2Bot.printToConsole(e, 9);
			FileTools.remove("data/" + me.profile + ".json");
			FileTools.remove("libs/SoloPlay/Data/" + me.profile + ".GameTime" + ".json");
			D2Bot.stop();
		}

		if (me.charlvl === 1) {
			if (!myData.initialized) {
				myData.me.startTime = me.gamestarttime;
				myData.me.level = me.charlvl;
				myData.me.classid = me.classid;
				myData.me.charName = me.name;
				myData.me.strength = me.rawStrength;
				myData.me.dexterity = me.rawDexterity;
				myData.initialized = true;
				CharData.updateData("me", myData) && updateMyData();
			}
			
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
			return goToDifficulty('Nightmare', 'Oof I am nearly broken, going back to nightmare to get back on my feet');
		case 2:
			return goToDifficulty('Normal', 'Oof I am broken, going back to normal to get easy gold');
		default:
			break;
		}

		Check.usePreviousSocketQuest(); // Currently only supports going back to nightmare to socket a lidless if one is equipped.

		let updatedDifficulty = Check.nextDifficulty();

		if (updatedDifficulty) {
			CharData.updateData("me", "setDifficulty", updatedDifficulty);
			D2Bot.setProfile(null, null, null, updatedDifficulty);
		}

		for (k = 0; k < SetUp.scripts.length; k++) {
			!me.inTown && Town.goToTown();
			Check.checkSpecialCase();

			if (Check.task(SetUp.scripts[k])) {
				let tick;
				let currentExp;

				try {
					if (!isIncluded("SoloPlay/Scripts/" + SetUp.scripts[k] + ".js")) {
						include("SoloPlay/Scripts/" + SetUp.scripts[k] + ".js");
					}

					tick = getTickCount();
					currentExp = me.getStat(13);

					for (j = 0; j < 5; j += 1) {
						if (this[SetUp.scripts[k]]()) {
							break;
						}
					}

					if (j === 5) {
						myPrint("script " + SetUp.scripts[k] + " failed.");
					}
				} catch (e) {
					console.warn(e);
				} finally {
					Developer.logPerformance && Tracker.script(tick, SetUp.scripts[k], currentExp);
					console.log("ÿc8Kolbot-SoloPlayÿc0: Old maxgametime: " + Developer.formatTime(me.maxgametime));
					me.maxgametime += (getTickCount() - tick);
					console.log("ÿc8Kolbot-SoloPlayÿc0: New maxgametime: " + Developer.formatTime(me.maxgametime));
					console.log("ÿc8Kolbot-SoloPlayÿc0 :: ÿc7" + SetUp.scripts[k] + " ÿc7Duration: ÿc0" + Developer.formatTime(tick));

					// remove script function from function scope, so it can be cleared by GC
					if (k < SetUp.scripts.length) {
						delete this[SetUp.scripts[k]];
					}
				}
			}
		}

		// Re-check to see if after this run we now meet difficulty requirments
		if (!updatedDifficulty) {
			updatedDifficulty = Check.nextDifficulty(false);

			if (updatedDifficulty) {
				CharData.updateData("me", "setDifficulty", updatedDifficulty);
				D2Bot.setProfile(null, null, null, updatedDifficulty);
			}
		}

		return true;
	};

	this.scriptEvent = function (msg) {
		let obj;

		if (msg && typeof msg === "string" && msg !== "") {
			switch (true) {
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

	addEventListener("scriptmsg", this.scriptEvent);

	// Start Running Script
	this.setup();

	// Start Developer mode - this stops the script from progressing past this point and allows running specific scripts/functions through chat commands
	if (Developer.developerMode.enabled) {
		if (Developer.developerMode.profiles.some(profile => profile.toLowerCase() === me.profile.toLowerCase())) {
			if (include("SoloPlay/Scripts/developermode.js")) {
				Developer.debugging.pathing && (me.automap = true);
				this.developermode();
			} else {
				print("ÿc8Kolbot-SoloPlayÿc0: Failed to include developermode");
			}
		}
	}

	this.runScripts();

	scriptBroadcast('quit');

	return true;
}
