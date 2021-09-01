/*
*	@filename	Developer.js
*	@author		theBGuy (this was really based off my orignal performance tracking)
*	@desc		Developer tools for SoloLeveling
*	@credits	kolton, D3STROY3R, Adaptist, isid0re
*/

const Developer = {
	logPerformance: true,	// enables logging statistics
	Overlay: true,	//enables overlay
	showInGameTimer: true,	// Shows in game timer on the overlay
	logEquipped: false,	//enables equipped items viewable from D2Bot# charviewer tab
	forcePacketCasting: {		//enables forced packet casting for skill.cast
		enabled: true,
		excludeProfiles: [""],	// Exclude these profiles
	},

	hideChickens: true, // disable printing chicken info in D2Bot console
	addLadderRW: true, // set to true to enable single player ladder runewords ONLY WORKS IF RUNEWORDS.TXT IS INSTALLED AND D2BS PROFILE IS CONFIGURED
	fillAccount: {		// set to true in use with tag Bumper or Socketmule to make next character after reaching goal until account is full
		Bumpers: false,
		Socketmules: false,
	},

	Debugging: {
		smallCharmVerbose: false,
		largeCharmVerbose: false,
		grandCharmVerbose: false,
		junkCheckVerbose: false,
		autoEquip: false,
	},

	developerMode: {		// Enables bot to load up without proceeding to run scripts. Allows easy testing of functions or scripts
		enabled: false,
		profiles: [""],		// Enter in the profiles that you wish to start in developermode, i.e "scl-sorc"
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

		print("ÿc9SoloLevelingÿc0: Failed to read Obj. (Developer.parseObj)");

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
