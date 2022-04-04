/*
*	@filename	Tracker.js
*	@author		isid0re, theBGuy
*	@desc		Track bot game performance and send to CSV file
*/

if (!isIncluded("SoloPlay/Tools/Developer.js")) { include("SoloPlay/Tools/Developer.js"); }
if (!isIncluded("SoloPlay/Functions/PrototypesOverrides.js")) { include("SoloPlay/Functions/PrototypesOverrides.js"); }
if (!isIncluded("SoloPlay/Functions/MiscOverrides.js")) { include("SoloPlay/Functions/MiscOverrides.js"); }

const Tracker = {
	GTPath: "libs/SoloPlay/Data/" + me.profile + "/" + me.profile + "-GameTime.json",
	LPPath: "libs/SoloPlay/Data/" + me.profile + "/" + me.profile + "-LevelingPerformance.csv",
	SPPath: "libs/SoloPlay/Data/" + me.profile + "/" + me.profile + "-ScriptPerformance.csv",
	tick: 0,
	default: {
		"Days": 0,
		"Total": 0,
		"InGame": 0,
		"OOG": 0,
		"LastLevel": 0,
		"LastSave": getTickCount()
	},

	initialize: function () {
		// File Structure
		let LPHeader = "Total Time,InGame Time,Split Time,Area,Character Level,Gained EXP,Gained EXP/Minute,Difficulty,Fire Resist,Cold Resist,Light Resist,Poison Resist,Current Build" + "\n"; //Leveling Performance
		let SPHeader = "Total Time,InGame Time,Sequence Time,Sequence,Character Level,Gained EXP,Gained EXP/Minute,Difficulty,Fire Resist,Cold Resist,Light Resist,Poison Resist,Current Build" + "\n"; //Script Performance
		let GameTracker = Object.assign({}, this.default);

		// Create Files
		if (!FileTools.exists("libs/SoloPlay/Data/" + me.profile)) {
			folder = dopen("libs/SoloPlay/Data");
			folder.create(me.profile);
		}

		!FileTools.exists(this.GTPath) && Developer.writeObj(GameTracker, this.GTPath);
		!FileTools.exists(this.LPPath) && Misc.fileAction(this.LPPath, 1, LPHeader);
		!FileTools.exists(this.SPPath) && Misc.fileAction(this.SPPath, 1, SPHeader);

		return true;
	},

	checkValidity: function () {
		let GameTracker = Developer.readObj(this.GTPath);
		let found = false;
		GameTracker && Object.keys(GameTracker).forEach(function (key) {
			if (GameTracker[key] < 0) {
				console.debug("Negative value found");
				GameTracker[key] = 0;
				found = true;
			}
		});
		found && Developer.writeObj(GameTracker, this.GTPath);
	},

	logLeveling: function (obj) {
		if (typeof obj === "object" && obj.hasOwnProperty("event") && obj["event"] === "level up") {
			Tracker.leveling();
		}
	},

	script: function (starttime, subscript, startexp) {
		let GameTracker = Developer.readObj(Tracker.GTPath);

		// GameTracker
		// this seems to happen when my pc restarts so set last save equal to current tick count and then continue
		GameTracker.LastSave > getTickCount() && (GameTracker.LastSave = getTickCount());

		let newTick = me.gamestarttime >= GameTracker.LastSave ? me.gamestarttime : GameTracker.LastSave;
		GameTracker.InGame += Developer.Timer(newTick);
		GameTracker.Total += Developer.Timer(newTick);
		GameTracker.Days += Developer.Timer(newTick);
		GameTracker.LastSave = getTickCount();
		Developer.writeObj(GameTracker, Tracker.GTPath);

		// csv file
		let scriptTime = Developer.Timer(starttime);
		let diffString = sdk.difficulty.nameOf(me.diff);
		let gainAMT = me.getStat(13) - startexp;
		let gainTime = gainAMT / (scriptTime / 60000);
		let currentBuild = SetUp.currentBuild;
		let FR = me.getStat(39);
		let CR = me.getStat(43);
		let LR = me.getStat(41);
		let PR = me.getStat(45);
		let string = Developer.formatTime(GameTracker.Total) + "," + Developer.formatTime(GameTracker.InGame) + "," + Developer.formatTime(scriptTime) + "," + subscript + "," + me.charlvl + "," + gainAMT + "," + gainTime + "," + diffString + "," + FR + "," + CR + "," + LR + "," + PR + "," + currentBuild + "\n";

		Misc.fileAction(Tracker.SPPath, 2, string);
		this.tick = GameTracker.LastSave;

		return true;
	},

	leveling: function () {
		let GameTracker = Developer.readObj(this.GTPath);

		// GameTracker
		// this seems to happen when my pc restarts so set last save equal to current tick count and then continue
		GameTracker.LastSave > getTickCount() && (GameTracker.LastSave = getTickCount());

		let newSave = getTickCount();
		let newTick = me.gamestarttime > GameTracker.LastSave ? me.gamestarttime : GameTracker.LastSave;
		let splitTime = Developer.Timer(GameTracker.LastLevel);
		GameTracker.InGame += Developer.Timer(newTick);
		GameTracker.Total += Developer.Timer(newTick);
		GameTracker.Days += Developer.Timer(newTick);
		GameTracker.LastLevel = newSave;
		GameTracker.LastSave = newSave;
		Developer.writeObj(GameTracker, Tracker.GTPath);

		// csv file
		let diffString = sdk.difficulty.nameOf(me.diff);
		let areaName = Pather.getAreaName(me.area);
		let currentBuild = SetUp.currentBuild;
		let gainAMT = me.getStat(13) - Experience.totalExp[me.charlvl - 1];
		let gainTime = gainAMT / (splitTime / 60000);
		let FR = me.getStat(39);
		let CR = me.getStat(43);
		let LR = me.getStat(41);
		let PR = me.getStat(45);
		let string = Developer.formatTime(GameTracker.Total) + "," + Developer.formatTime(GameTracker.InGame) + "," + Developer.formatTime(splitTime) + "," + areaName + "," + me.charlvl + "," + gainAMT + "," + gainTime + "," + diffString + "," + FR + "," + CR + "," + LR + "," + PR + "," + currentBuild + "\n";

		Misc.fileAction(Tracker.LPPath, 2, string);
		this.tick = GameTracker.LastSave;

		return true;
	},

	update: function (oogTick = 0) {
		let heartBeat = getScript("tools/heartbeat.js");
		if (!heartBeat) {
			console.debug("Couldn't find heartbeat");
			return false;
		}
		if (!me.ingame) {
			console.debug("Not in game");
			return false;
		}

		let GameTracker = Developer.readObj(this.GTPath);

		// this seems to happen when my pc restarts so set last save equal to current tick count and then continue
		GameTracker.LastSave > getTickCount() && (GameTracker.LastSave = getTickCount());

		// make sure we aren't attempting to use a corrupted file (only way we get negative values)
		let newTick = me.gamestarttime > GameTracker.LastSave ? me.gamestarttime : GameTracker.LastSave;

		GameTracker.OOG += oogTick;
		GameTracker.InGame += Developer.Timer(newTick);
		GameTracker.Total += (Developer.Timer(newTick) + oogTick);
		GameTracker.Days += (Developer.Timer(newTick) + oogTick);
		GameTracker.LastSave = getTickCount();
		Developer.writeObj(GameTracker, Tracker.GTPath);
		this.tick = GameTracker.LastSave;

		return true;
	}
};

if (getScript(true).name.toString() === 'default.dbj') {
    const Worker = require('../../modules/Worker');

    Worker.runInBackground.intervalUpdate = function () {
        if (getTickCount() - Tracker.tick < 3 * 60000) return true;
        Tracker.tick = getTickCount();
        try {
            Tracker.update();
        } catch (e) {
            console.error(e.message);
        }

        return true;
    };
}
