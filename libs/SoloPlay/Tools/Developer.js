/**
*  @filename    Developer.js
*  @author      theBGuy
*  @desc        Tools/Settings for Kolbot-SoloPlay
*
*/

const Developer = {
	// @desc - set to true if using the PlugY mod - allows use of larger stash
	plugyMode: false,
	// @desc - log game/bot statistics to .csv files located at SoloPlay/Data/
	logPerformance: true,
	// @desc - show in game overlay (see bottom of README.md for example)
	overlay: true,
	// @desc - show Total, InGame, and OOG (out of game) time in the D2bot# status window
	displayClockInConsole: false,
	// @desc - log currently equipped items to D2Bot# charviewer tab
	logEquipped: false,
	// @desc - disable printing chicken info in D2Bot console
	hideChickens: true,
	// @desc - enable ladder runewords in single player mode ONLY WORKS IF RUNEWORDS.TXT IS INSTALLED AND D2BS PROFILE IS CONFIGURED
	//   or patch.json has been updated (see Single Player Additions in README.md)
	addLadderRW: !me.profile.toLowerCase().contains("nl"),
	// @desc - hide casting animations for better stability (reduce d2bs crashes)
	forcePacketCasting: {
		enabled: true,
		// @desc - allow specific profiles to show casting animations without disabling it for every profile running (helpful when debugging)
		excludeProfiles: [""],
	},
	// @desc - set to true in use with tag Bumper, Socketmule, or Imbuemule to make next character after reaching goal until account is full
	fillAccount: {
		bumpers: false,
		socketMules: false,
		imbueMule: false,
	},
	// @desc - set level for imbueMule to stop at
	imbueStopLevel: 30,
	// @desc - stop a profile once it reaches a certain level
	stopAtLevel: {
		enabled: false,
		profiles: [
			// ["scl-example-001", 60],
			// ["hcl-example-001", 40]
		],
	},
	// @desc - allows a profile to loaded without starting any of the scripts. enables chat commands for testing. See Scripts/developermode.js for more info.
	developerMode: {
		enabled: false,
		// Enter in the profiles that you wish to start in developermode, i.e "scl-sorc"
		profiles: [""],
	},
	// @desc [experimental don't use] - set email during account creation
	setEmail: {
		enabled: false,
		//email: "",
		//domain: "",
		profiles: [],
		realms: ["asia"]
	},
	// @desc - enable/disable logging debug info to the console
	debugging: {
		smallCharm: false,
		largeCharm: false,
		grandCharm: false,
		junkCheck: false,
		autoEquip: false,
		crafting: false,
		pathing: false,
		skills: false,
		showStack: {
			enabled: false,
			// @desc - Enter in the profiles that you wish to see the stack walk for, this loads up guard.js and displays on the overlay
			profiles: [""],
		},
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
			OBJstring = Misc.fileAction(path, 0);
			obj = JSON.parse(OBJstring);
		}

		if (obj) {
			return obj;
		}

		print("ÿc8Kolbot-SoloPlayÿc0: Failed to read Obj. (Developer.parseObj)");

		return false;
	},

	readObj: function (jsonPath) {
		let obj = this.getObj(jsonPath);
		return Misc.clone(obj);
	},

	writeObj: function (obj, path) {
		let string;
		try {
			string = JSON.stringify(obj, null, 2);
			// try to parse the string to ensure it converted correctly
			JSON.parse(string);
			// JSON.parse throws an error if it fails so if we are here now we are good
			Misc.fileAction(path, 1, string);
		} catch (e) {
			console.warn("Malformed JSON object");
			Misc.errorReport(e, "Developer");
			return false;
		}

		return true;
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
};

// Set after Developer has been initialized - always load guard in developer mode
if (Developer.developerMode.enabled && Developer.developerMode.profiles.some(profile => profile.toLowerCase() === me.profile.toLowerCase())) {
	Developer.debugging.pathing = true;
	//Developer.debugging.skills = true;
	Developer.debugging.showStack.enabled = true;
	Developer.debugging.showStack.profiles.push(me.profile.toLowerCase());
}
