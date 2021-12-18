/*
*	@filename	Developer.js
*	@author		theBGuy
*	@desc		Developer tools for Kolbot-SoloPlay
*	@credits	kolton, D3STROY3R, Adaptist, isid0re
*/

const Developer = {
	plugyMode: false,		// set to true if using the PlugY mod
	logPerformance: true,	// log game/bot statistics to .csv files located at SoloPlay/Data/
	Overlay: true,			// show in game overlay (see bottom of README.md for example)
	logEquipped: false,		// log currently equipped items to D2Bot# charviewer tab
	hideChickens: true, 	// disable printing chicken info in D2Bot console
	addLadderRW: !me.profile.toLowerCase().contains("nl"), // enable ladder runewords in single player mode ONLY WORKS IF RUNEWORDS.TXT IS INSTALLED AND D2BS PROFILE IS CONFIGURED or patch.json has been updated (see Single Player Additions in README.md)
	forcePacketCasting: { 	// hide casting animations for better stability (reduce d2bs crashes)
		enabled: true,
		excludeProfiles: [""],	// allow specific profiles to show casting animations without disabling it for every profile running (helpful when debugging)
	},
	fillAccount: {			// set to true in use with info-tag Bumper or Socketmule to make next character after reaching goal until account is full
		Bumpers: false,
		Socketmules: false,
	},
	stopAtLevel: { 			// stop a profile once it reaches a certain level
		enabled: false,
		profiles: [
			// ["scl-example-001", 60],
			// ["hcl-example-001", 40]
		],
	},
	developerMode: { 		// allows a profile to loaded without starting any of the scripts. enables chat commands for testing. See Scripts/developermode.js for more info.
		enabled: false,
		profiles: [""],		// Enter in the profiles that you wish to start in developermode, i.e "scl-sorc"
	},
	Debugging: { 			// print more info to the in game console
		smallCharmVerbose: false,
		largeCharmVerbose: false,
		grandCharmVerbose: false,
		junkCheckVerbose: false,
		autoEquip: false,
		crafting: false,
		pathing: false,
	},

	/*  Developer tools */
	getObj: function (path) {
		let obj, OBJstring = Misc.fileAction(path, 0);

		try {
			obj = JSON.parse(OBJstring);
		} catch (e) {
			// If we failed, file might be corrupted, so create a new one
			Misc.errorReport(e, "Developer");
			FileTools.remove(path);
			Tracker.initialize();
			OBJstring = Misc.fileAction(Path, 0);
			obj = JSON.parse(OBJstring);
		}

		if (obj) {
			return obj;
		}

		print("ÿc8Kolbot-SoloPlayÿc0: Failed to read Obj. (Developer.parseObj)");

		return false;
	},

	readObj: function (jsonPath) { //getStats
		let obj = this.getObj(jsonPath);

		return Misc.clone(obj);
	},

	writeObj: function (obj, path) {
		let string = JSON.stringify(obj, null, 2);
		Misc.fileAction(path, 1, string);

		return true;
	},

	Timer: function (tick) {
		return getTickCount() - tick;
	},

	formatTime: function (milliseconds) {
		let seconds = milliseconds / 1000,
			sec = (seconds % 60).toFixed(0),
			minutes = (Math.floor(seconds / 60) % 60).toFixed(0),
			hours = Math.floor(seconds / 3600).toFixed(0),
			timeString = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + sec.toString().padStart(2, '0');

		return timeString;
	},
};
