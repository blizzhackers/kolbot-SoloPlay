/**
*  @filename    Tracker.js
*  @author      theBGuy, isid0re
*  @desc        Track bot game performance and send to CSV file
*
*/

includeIfNotIncluded("core/experience.js");
includeIfNotIncluded("SoloPlay/Tools/Developer.js");
includeIfNotIncluded("SoloPlay/Functions/PrototypeOverrides.js");

const Tracker = {
	GTPath: "libs/SoloPlay/Data/" + me.profile + "/" + me.profile + "-GameTime.json",
	LPPath: "libs/SoloPlay/Data/" + me.profile + "/" + me.profile + "-LevelingPerformance.csv",
	SPPath: "libs/SoloPlay/Data/" + me.profile + "/" + me.profile + "-ScriptPerformance.csv",
	// Leveling Performance
	LPHeader: "Total Time,InGame Time,Split Time,Area,Character Level,Gained EXP,Gained EXP/Minute,Difficulty,Gold,Fire Resist,Cold Resist,Light Resist,Poison Resist,Current Build" + "\n",
	// Script Performance
	SPHeader: "Total Time,InGame Time,Sequence Time,Sequence,Character Level,Gained EXP,Gained EXP/Minute,EXP Gain %,Difficulty,Gold,Fire Resist,Cold Resist,Light Resist,Poison Resist,Current Build" + "\n",
	tick: 0,
	default: {
		"Total": 0,
		"InGame": 0,
		"OOG": 0,
		"LastLevel": 0,
		"LastSave": getTickCount()
	},

	initialize: function () {
		const GameTracker = Object.assign({}, this.default);

		// Create Files
		if (!FileTools.exists("libs/SoloPlay/Data/" + me.profile)) {
			let folder = dopen("libs/SoloPlay/Data");
			folder.create(me.profile);
		}

		!FileTools.exists(this.GTPath) && Tracker.writeObj(GameTracker, this.GTPath);
		!FileTools.exists(this.LPPath) && FileAction.write(this.LPPath, this.LPHeader);
		!FileTools.exists(this.SPPath) && FileAction.write(this.SPPath, this.SPHeader);

		return true;
	},

	getObj: function (path) {
		let obj, OBJstring = FileAction.read(path);

		try {
			obj = JSON.parse(OBJstring);
		} catch (e) {
			// If we failed, file might be corrupted, so create a new one
			Misc.errorReport(e, "Tracker");
			FileTools.remove(path);
			Tracker.initialize();
			OBJstring = FileAction.read(path);
			obj = JSON.parse(OBJstring);
		}

		if (obj) {
			return obj;
		}

		console.error("ÿc8Kolbot-SoloPlayÿc0: Failed to read Obj. (Tracker.getObj)");

		return false;
	},

	readObj: function (jsonPath) {
		let obj = this.getObj(jsonPath);
		return clone(obj);
	},

	writeObj: function (obj, path) {
		let string;
		try {
			string = JSON.stringify(obj, null, 2);
			// try to parse the string to ensure it converted correctly
			JSON.parse(string);
			// JSON.parse throws an error if it fails so if we are here now we are good
			FileAction.write(path, string);
		} catch (e) {
			console.warn("Malformed JSON object");
			console.error(e);
			return false;
		}

		return true;
	},

	resetGameTime: function () {
		Tracker.writeObj(Object.assign({}, this.default), this.GTPath);
	},

	reset: function () {
		this.resetGameTime();
		// for now just re-init the header so it's easier to look at the file and see where we restarted
		// might later save the files to a sub folder and re-init a new one
		FileTools.exists(this.LPPath) && FileAction.append(this.LPPath, this.LPHeader);
		FileTools.exists(this.SPPath) && FileAction.append(this.SPPath, this.SPHeader);
	},

	checkValidity: function () {
		const GameTracker = Tracker.readObj(this.GTPath);
		let found = false;
		GameTracker && Object.keys(GameTracker).forEach(function (key) {
			if (GameTracker[key] < 0) {
				console.debug("Negative value found");
				GameTracker[key] = 0;
				found = true;
			}
		});
		found && Tracker.writeObj(GameTracker, this.GTPath);
	},

	timer: function (tick) {
		return getTickCount() - tick;
	},

	formatTime: function (milliseconds) {
		let seconds = milliseconds / 1000;
		let sec = (seconds % 60).toFixed(0);
		let minutes = (Math.floor(seconds / 60) % 60).toFixed(0);
		let hours = Math.floor(seconds / 3600).toFixed(0);
		let timeString = hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + ":" + sec.toString().padStart(2, "0");

		return timeString;
	},

	totalDays: function (milliseconds) {
		let days = Math.floor(milliseconds / 86.4e6).toFixed(0);
		return days.toString().padStart(1, "0");
	},

	logLeveling: function (obj) {
		if (typeof obj === "object" && obj.hasOwnProperty("event") && obj.event === "level up") {
			Tracker.leveling();
		}
	},

	script: function (starttime, subscript, startexp) {
		const GameTracker = Tracker.readObj(Tracker.GTPath);

		// GameTracker
		// this seems to happen when my pc restarts so set last save equal to current tick count and then continue
		GameTracker.LastSave > getTickCount() && (GameTracker.LastSave = getTickCount());

		const newTick = me.gamestarttime >= GameTracker.LastSave ? me.gamestarttime : GameTracker.LastSave;
		GameTracker.InGame += Tracker.timer(newTick);
		GameTracker.Total += Tracker.timer(newTick);
		GameTracker.LastSave = getTickCount();
		Tracker.writeObj(GameTracker, Tracker.GTPath);

		// csv file
		const scriptTime = Tracker.timer(starttime);
		const currLevel = me.charlvl;
		const diffString = sdk.difficulty.nameOf(me.diff);
		const gainAMT = me.getStat(sdk.stats.Experience) - startexp;
		const gainTime = gainAMT / (scriptTime / 60000);
		const gainPercent = currLevel === 99 ? 0 : (gainAMT * 100 / Experience.nextExp[currLevel]).toFixed(6);
		const currentBuild = SetUp.currentBuild;
		const [GOLD, FR, CR, LR, PR] = [me.gold, me.realFR, me.realCR, me.realLR, me.realPR];
		const string = (
			Tracker.formatTime(GameTracker.Total) + "," + Tracker.formatTime(GameTracker.InGame) + "," + Tracker.formatTime(scriptTime)
			+ "," + subscript + "," + currLevel + "," + gainAMT + "," + gainTime + "," + gainPercent + "," + diffString
			+ "," + GOLD + "," + FR + "," + CR + "," + LR + "," + PR + "," + currentBuild + "\n"
		);

		FileAction.append(Tracker.SPPath, string);
		Tracker.tick = GameTracker.LastSave;

		return true;
	},

	leveling: function () {
		const GameTracker = Tracker.readObj(this.GTPath);

		// GameTracker
		// this seems to happen when my pc restarts so set last save equal to current tick count and then continue
		GameTracker.LastSave > getTickCount() && (GameTracker.LastSave = getTickCount());

		const newSave = getTickCount();
		const newTick = me.gamestarttime > GameTracker.LastSave ? me.gamestarttime : GameTracker.LastSave;
		const splitTime = Tracker.timer(GameTracker.LastLevel);
		GameTracker.InGame += Tracker.timer(newTick);
		GameTracker.Total += Tracker.timer(newTick);
		GameTracker.LastLevel = newSave;
		GameTracker.LastSave = newSave;
		Tracker.writeObj(GameTracker, Tracker.GTPath);

		// csv file
		const diffString = sdk.difficulty.nameOf(me.diff);
		const areaName = getAreaName(me.area);
		const currentBuild = SetUp.currentBuild;
		const gainAMT = me.getStat(sdk.stats.Experience) - Experience.totalExp[me.charlvl - 1];
		const gainTime = gainAMT / (splitTime / 60000);
		const [GOLD, FR, CR, LR, PR] = [me.gold, me.realFR, me.realCR, me.realLR, me.realPR];
		const string = (
			Tracker.formatTime(GameTracker.Total) + "," + Tracker.formatTime(GameTracker.InGame) + "," + Tracker.formatTime(splitTime) + ","
			+ areaName + "," + me.charlvl + "," + gainAMT + "," + gainTime + "," + diffString + ","
			+ GOLD + "," + FR + "," + CR + "," + LR + "," + PR + "," + currentBuild + "\n"
		);

		FileAction.append(Tracker.LPPath, string);
		Tracker.tick = GameTracker.LastSave;

		return true;
	},

	update: function (oogTick = 0) {
		let heartBeat = getScript("threads/heartbeat.js");
		if (!heartBeat) {
			console.debug("Couldn't find heartbeat");
			return false;
		}
		if (!me.ingame) {
			console.debug("Not in game");
			return false;
		}

		const GameTracker = Tracker.readObj(this.GTPath);

		// this seems to happen when my pc restarts so set last save equal to current tick count and then continue
		GameTracker.LastSave > getTickCount() && (GameTracker.LastSave = getTickCount());

		// make sure we aren't attempting to use a corrupted file (only way we get negative values)
		const newTick = me.gamestarttime > GameTracker.LastSave ? me.gamestarttime : GameTracker.LastSave;

		GameTracker.OOG += oogTick;
		GameTracker.InGame += Tracker.timer(newTick);
		GameTracker.Total += (Tracker.timer(newTick) + oogTick);
		GameTracker.LastSave = getTickCount();
		Tracker.writeObj(GameTracker, Tracker.GTPath);
		Tracker.tick = GameTracker.LastSave;

		return true;
	}
};
