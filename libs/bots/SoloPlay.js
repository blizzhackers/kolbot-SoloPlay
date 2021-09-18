/*
*	@filename	SoloPlay.js
*	@author		isid0re, theBGuy
*	@desc		Base script file for Kolbot-SoloPlay system
*/

//---------------- Do Not Touch Below ----------------\\

if (!isIncluded("SoloPlay/Tools/Tracker.js")) {
	include("SoloPlay/Tools/Tracker.js");
}

function SoloPlay () {
	this.setup = function () {
		print('ÿc8Kolbot-SoloPlayÿc0: start setup');
		me.overhead('start setup');
		NTIP.arrayLooping(nipItems.Quest);
		me.overhead('loading pickits');
		NTIP.arrayLooping(nipItems.General);
		NTIP.arrayLooping(nipItems.Selling);
		print('ÿc8Kolbot-SoloPlayÿc0: start run');
		me.overhead('starting run');

		if (["Bumper", "Socketmule"].indexOf(SetUp.finalBuild) > -1 && me.classic) {
			D2Bot.printToConsole("Kolbot-SoloPlay: " + SetUp.finalBuild + " cannot be used in classic. Change the info tag or remake as an expansion character...Shutting down", 9);
			FileTools.remove("data/" + me.profile + ".json");
			FileTools.remove("libs/SoloPlay/Data/" + me.profile + ".GameTime" + ".json");
			D2Bot.stop();
		}

		if (me.charlvl === 1) {
			let buckler = me.getItem(328);

			if (buckler) {
				if (buckler.location === 1) {
					buckler.drop();
				}
			}
		}

		if (me.hp / me.hpmax < 1) {
			Town.heal();
			me.cancel();
		}

		Check.checkSpecialCase();

		return true;
	};

	this.runScripts = function () {
		let j, k;

		switch (Check.broken()) {
		case 1:
			D2Bot.setProfile(null, null, null, 'Nightmare');
			DataFile.updateStats("setDifficulty", 'Nightmare');
			D2Bot.printToConsole('Kolbot-SoloPlay: Oof I am nearly broken, going back to nightmare to get back on my feet');
			print("ÿc8Kolbot-SoloPlayÿc0: Oof I am nearly broken, going back to nightmare to get back on my feet");
			me.overhead("Oof I am nearly broken, going back to nightmare to get back on my feet");
			D2Bot.restart();

			break;
		case 2:
			D2Bot.setProfile(null, null, null, 'Normal');
			DataFile.updateStats("setDifficulty", 'Normal');
			D2Bot.printToConsole('Kolbot-SoloPlay: Oof I am broken, going back to normal to get easy gold');
			print("ÿc8Kolbot-SoloPlayÿc0: Oof I am broken, going back to normal to get easy gold");
			me.overhead("Oof I am broken, going back to normal to get easy gold");
			D2Bot.restart();

			break;
		default:
			break;
		}

		Check.usePreviousSocketQuest(); // Currently only supports going back to nightmare to socket a lidless if one is equipped. 

		for (k = 0; k < SetUp.scripts.length; k += 1) {
			if (!me.inTown) {
				Town.goToTown();
			}

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

				if (Developer.logPerformance) {
					Tracker.Script(tick, SetUp.scripts[k], currentExp);
				}

				print("ÿc8Kolbot-SoloPlayÿc0: Old maxgametime: " + Developer.formatTime(me.maxgametime));
				me.maxgametime += (getTickCount() - tick);
				print("ÿc8Kolbot-SoloPlayÿc0: New maxgametime: " + Developer.formatTime(me.maxgametime));

				if (j === 5) {
					me.overhead("script " + SetUp.scripts[k] + " failed.");
				}
			}
		}

		return true;
	};

	// Start Running Script
	this.setup();

	if (Developer.developerMode.enabled) {
		if (Developer.developerMode.profiles.indexOf(me.profile) > -1) {
			if (!isIncluded("SoloPlay/Scripts/developermode.js")) {
				include("SoloPlay/Scripts/developermode.js");
			}

			if (isIncluded("SoloPlay/Scripts/developermode.js")) {
				this.developermode();
			} else {
				print("ÿc8Kolbot-SoloPlayÿc0: Failed to include developermode");
			}
		}
	}

	let updatedDifficulty = Check.nextDifficulty();

	if (updatedDifficulty) {
		DataFile.updateStats("setDifficulty", updatedDifficulty);
		D2Bot.setProfile(null, null, null, updatedDifficulty);
	}

	this.runScripts();

	// Re-check to see if after this run we now meet difficulty requirments
	if (!updatedDifficulty) {
		updatedDifficulty = Check.nextDifficulty(false);

		if (updatedDifficulty) {
			DataFile.updateStats("setDifficulty", updatedDifficulty);
			D2Bot.setProfile(null, null, null, updatedDifficulty);
		}
	}

	scriptBroadcast('quit');

	return true;
}
