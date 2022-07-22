/**
*  @filename    ConfigOverrides.js
*  @author      theBGuy
*  @desc        Modded Config.js to work with SoloPlay
*
*/

includeIfNotIncluded("common/Config.js");

Config.init = function (notify) {
	let configFilename = "";
	let classes = ["Amazon", "Sorceress", "Necromancer", "Paladin", "Barbarian", "Druid", "Assassin"];

	for (let i = 0; i <= 5; i++) {
		switch (i) {
		case 0: // Custom config
			if (!isIncluded("config/_customconfig.js")) {
				include("config/_customconfig.js");
			}

			for (let n in CustomConfig) {
				if (CustomConfig.hasOwnProperty(n)) {
					if (CustomConfig[n].indexOf(me.profile) > -1) {
						if (notify) {
							console.log("ÿc2Loading custom config: ÿc9" + n + ".js");
						}

						configFilename = n + ".js";

						break;
					}
				}
			}

			break;
		case 1:// Class.Profile.js
			configFilename = classes[me.classid] + "." + me.profile + ".js";

			break;
		case 2: // Realm.Class.Charname.js
			configFilename = me.realm + "." + classes[me.classid] + "." + me.charname + ".js";

			break;
		case 3: // Class.Charname.js
			configFilename = classes[me.classid] + "." + me.charname + ".js";

			break;
		case 4: // Profile.js
			configFilename = me.profile + ".js";

			break;
		case 5: // Class.js
			configFilename = classes[me.classid] + ".js";

			break;
		}

		if (configFilename && FileTools.exists("libs/SoloPlay/Config/" + configFilename)) {
			break;
		}
	}

	try {
		if (!include("SoloPlay/Config/" + configFilename)) {
			throw new Error();
		} else {
			notify && console.log("ÿc2Loaded: ÿc9SoloPlay/Config/" + configFilename);
		}
	} catch (e1) {
		console.log("ÿc1" + e1 + "\nÿc0If you are seeing this message you likely did not copy over all the files or are using the wrong kolbot version.");
		D2Bot.printToConsole("Please return to the kolbot-SoloPlay main github page and read the readMe. https://github.com/blizzhackers/kolbot-SoloPlay#readme", 8);

		throw new Error("Failed to load character config.");
	}

	try {
		LoadConfig.call();
	} catch (e2) {
		if (notify) {
			console.log("ÿc8Error in " + e2.fileName.substring(e2.fileName.lastIndexOf("\\") + 1, e2.fileName.length) + "(line " + e2.lineNumber + "): " + e2.message);

			throw new Error("Config.init: Error in character config.");
		}
	}

	if (Config.Silence && !Config.LocalChat.Enabled) {
		// Override the say function with print, so it just gets printed to console
		global._say = global.say;
		global.say = (what) => console.log("Tryed to say: " + what);
	}

	try {
		if (Config.AutoBuild.Enabled === true && include("SoloPlay/Functions/AutoBuildOverrides.js")) {
			AutoBuild.initialize();
		}
	} catch (e3) {
		console.log("ÿc8Error in libs/SoloPlay/Functions/AutoBuildOverrides.js (AutoBuild system is not active!)");
		console.log(e3.toSource());
	}
};
