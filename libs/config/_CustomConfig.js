/* Format:
	var CustomConfig = {
		"Config_Filename_Without_Extension": ["array", "of", "profiles"]

		Multiple entries are separated by commas


	};
*/

var CustomConfig, configCheck = me.profile.toUpperCase().split("-");

if (getScript("D2BotMap.dbj")) {
	CustomConfig = {
		"ManualPlay": me.profile,
	};
}

if (getScript("D2BotSoloPlay.dbj") && !!configCheck[1]) {
	try {
		if (me.classid === 0 && configCheck[1].toString().substring(0, 3).includes("ZON")) {
			CustomConfig = {
				"Amazon.SoloPlay": me.profile,
			};
		}

		if (me.classid === 1 && configCheck[1].toString().substring(0, 3).includes("SOR")) {
			CustomConfig = {
				"Sorceress.SoloPlay": me.profile,
			};
		}

		if (me.classid === 2 && configCheck[1].toString().substring(0, 3).includes("NEC")) {
			CustomConfig = {
				"Necromancer.SoloPlay": me.profile,
			};
		}

		if (me.classid === 3 && configCheck[1].toString().substring(0, 3).includes("PAL")) {
			CustomConfig = {
				"Paladin.SoloPlay": me.profile,
			};
		}

		if (me.classid === 4 && configCheck[1].toString().substring(0, 3).includes("BAR")) {
			CustomConfig = {
				"Barbarian.SoloPlay": me.profile,
			};
		}

		if (me.classid === 5 && configCheck[1].toString().substring(0, 3).includes("DRU")) {
			CustomConfig = {
				"Druid.SoloPlay": me.profile,
			};
		}

		if (me.classid === 6 && configCheck[1].toString().substring(0, 3).includes("SIN")) {
			CustomConfig = {
				"Assassin.SoloPlay": me.profile,
			};
		}	
	} catch(e) {
		print("ÿc1" + e + "\nÿc0If you are seeing this message you likely did not read the readMe on the github page. First, the most common problem is not using this version of kolbot -> github.com/blizzhackers/kolbot");
		print("The second most common error is an incorrect profile name format and third is incorrect Info Tag in d2bot#. Please return to the Kolbot-SoloPlay main github page and read the readMe\n");
		D2Bot.printToConsole("Please return to the Kolbot-SoloPlay main github page and read the readMe. https://github.com/theBGuy/Kolbot-SoloPlay/blob/main/README.md", 8);
	}
}
