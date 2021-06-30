/*
*	@filename	SoloLeveling.js
*	@author		isid0re
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

		return true;
	};

	this.runScripts = function () {
		let j, k, updatedDifficulty = Check.nextDifficulty();

		for (k = 0; k < SetUp.scripts.length; k += 1) {
			if (!me.inTown) {
				Town.goToTown();
			}

			if (updatedDifficulty) {
				DataFile.updateStats("setDifficulty", updatedDifficulty);
				D2Bot.setProfile(null, null, null, updatedDifficulty);
			}

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
