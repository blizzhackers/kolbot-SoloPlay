/*
*	@filename	SoloLeveling.js
*	@author		isid0re, theBGuy
*	@desc		Leveling for any class type. Uses predefined build templates.
*/

//---------------- Do Not Touch Below ----------------\\

if (!isIncluded("SoloLeveling/Tools/Tracker.js")) {
	include("SoloLeveling/Tools/Tracker.js");
}

function SoloLeveling () {
	this.setup = function () {
		print('ÿc9SoloLevelingÿc0: start setup');
		me.overhead('start setup');
		print("ÿc9SoloLevelingÿc0: quest items loaded to Pickit");
		NTIP.arrayLooping(nipItems.Quest);
		me.overhead('loading pickits');
		print("ÿc9SoloLevelingÿc0: general items loaded to Pickit");
		NTIP.arrayLooping(nipItems.General);
		print("ÿc9SoloLevelingÿc0: valuable items to sell loaded to Pickit");
		NTIP.arrayLooping(nipItems.Selling);
		print('ÿc9SoloLevelingÿc0: start run');
		me.overhead('starting run');

		if (["Bumper", "Socketmule"].indexOf(SetUp.finalBuild) > -1 && me.classic) {
			D2Bot.printToConsole("GuysSoloLeveling: " + SetUp.finalBuild + " cannot be used in classic. Change the info tag or remake as an expansion character...Shutting down", 9);
			FileTools.remove("data/" + me.profile + ".json");
			FileTools.remove("libs/SoloLeveling/Data/" + me.profile + ".GameTime" + ".json");
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
		let j, k, updatedDifficulty = Check.nextDifficulty();

		if (updatedDifficulty) {
			DataFile.updateStats("setDifficulty", updatedDifficulty);
			D2Bot.setProfile(null, null, null, updatedDifficulty);
		}

		if (Check.broken()) {
			D2Bot.setProfile(null, null, null, 'Normal');
			DataFile.updateStats("setDifficulty", 'Normal');
			D2Bot.printToConsole('GuysSoloLeveling: Oof I am broken, going back to normal to get easy gold');
			print("ÿc9GuysSoloLevelingÿc0: Oof I am broken, going back to normal to get easy gold");
			me.overhead("Oof I am broken, going back to normal to get easy gold");
			D2Bot.restart();
		}

		Check.usePreviousSocketQuest(); // Currently only supports going back to nightmare to socket a lidless if one is equipped. 

		for (k = 0; k < SetUp.scripts.length; k += 1) {
			if (!me.inTown) {
				Town.goToTown();
			}

			Check.checkSpecialCase();

			if (Check.Task(SetUp.scripts[k])) {
				if (!isIncluded("SoloLeveling/Scripts/" + SetUp.scripts[k] + ".js")) {
					include("SoloLeveling/Scripts/" + SetUp.scripts[k] + ".js");
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

				print("ÿc9GuysSoloLevelingÿc0: Old maxgametime: " + Developer.formatTime(me.maxgametime));
				me.maxgametime += (getTickCount() - tick);
				print("ÿc9GuysSoloLevelingÿc0: New maxgametime: " + Developer.formatTime(me.maxgametime));

				if (j === 5) {
					me.overhead("script " + SetUp.scripts[k] + " failed.");
				}
			}
		}

		return true;
	};

	// Start Running Script
	this.setup();
	this.runScripts();
	scriptBroadcast('quit');

	return true;
}
