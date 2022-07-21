/**
*  @filename    SoloPlay.js
*  @author      theBGuy
*  @credit      kolton (built off of Questing.js)
*  @desc        Base script file for Kolbot-SoloPlay system
*
*/

// todo: maybe turn this into a thread and use it as a default.dbj replacement
// call loader from here and change loader to use the soloplay script files

//---------------- Do Not Touch Below ----------------\\

includeIfNotIncluded("SoloPlay/Tools/Tracker.js");
includeIfNotIncluded("SoloPlay/Tools/CharData.js");

function SoloPlay () {
	this.setup = function () {
		myPrint("start setup");
		NTIP.arrayLooping(nipItems.Quest);
		NTIP.arrayLooping(nipItems.General);
		myPrint("starting run");

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
			let buckler = me.getItem(328);
			!!buckler && buckler.isEquipped && buckler.drop();
		}

		Town.heal() && me.cancelUIFlags();
		Check.checkSpecialCase();
		ensureData();

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

	this.runScripts = function () {
		let j, k;

		Check.brokeCheck();
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
					includeIfNotIncluded("SoloPlay/Scripts/" + SetUp.scripts[k] + ".js");

					tick = getTickCount();
					currentExp = me.getStat(sdk.stats.Experience);
					Messaging.sendToScript("libs/SoloPlay/Threads/ToolsThread.js", JSON.stringify({currScript: SetUp.scripts[k]}));

					for (j = 0; j < 5; j += 1) {
						if (this[SetUp.scripts[k]]()) {
							break;
						}
					}

					if (j === 5) {
						myPrint("script " + SetUp.scripts[k] + " failed.");
					}
				} catch (e) {
					console.errorReport(e);
				} finally {
					Developer.logPerformance && Tracker.script(tick, SetUp.scripts[k], currentExp);
					console.log("ÿc8Kolbot-SoloPlayÿc0: Old maxgametime: " + Developer.formatTime(me.maxgametime));
					me.maxgametime += (getTickCount() - tick);
					console.log("ÿc8Kolbot-SoloPlayÿc0: New maxgametime: " + Developer.formatTime(me.maxgametime));
					console.log("ÿc8Kolbot-SoloPlayÿc0 :: ÿc8" + SetUp.scripts[k] + "ÿc0 - ÿc7Duration: ÿc0" + Developer.formatTime(getTickCount() - tick));

					// remove script function from function scope, so it can be cleared by GC
					if (k < SetUp.scripts.length) {
						delete this[SetUp.scripts[k]];
					}
				}

				if (me.sorceress && me.hell && SetUp.scripts[k] === "bloodraven" && me.charlvl < 68) {
					console.debug("End-run, we are not ready to keep pushing yet");
					
					break;
				}

				if (me.dead) {
					// not sure how we got here but we are dead, why did toolsthread not quit lets check it
					let tThread = getScript("libs/SoloPlay/Threads/ToolsThread.js");
					if (!tThread || !tThread.running) {
						// well that explains why, toolsthread seems to have crashed lets restart it so we quit properly
						load("libs/SoloPlay/Threads/ToolsThread.js");
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

	scriptBroadcast("quit");

	return true;
}
