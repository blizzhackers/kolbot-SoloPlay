/**
*	@filename	EventThread.js
*	@author		theBGuy
*	@desc		thread to handle in game events for Kolbot-SoloPlay
*/

js_strict(true);

include("json2.js");
include("NTItemParser.dbl");
include("OOG.js");
include("AutoMule.js");
include("Gambling.js");
include("CraftingSystem.js");
include("TorchSystem.js");
include("MuleLogger.js");
include("common/Attack.js");
include("common/Cubing.js");
include("common/CollMap.js");
include("common/Config.js");
include("common/Loader.js");
include("common/misc.js");
include("common/util.js");
include("common/Pickit.js");
include("common/Pather.js");
include("common/Precast.js");
include("common/Prototypes.js");
include("common/Runewords.js");
include("common/Storage.js");
include("common/Town.js");

if (!isIncluded("SoloPlay/Tools/Developer.js")) {
	include("SoloPlay/Tools/Developer.js");
}

if (!isIncluded("SoloPlay/Functions/globals.js")) {
	include("SoloPlay/Functions/globals.js");
}

function main () {
	let action = [];

	print("ÿc8Kolbot-SoloPlayÿc0: Start EventThread");
	D2Bot.init();
	Config.init(false);
	Pickit.init(false);
	Attack.init();
	Storage.Init();
	CraftingSystem.buildLists();
	Runewords.init();
	Cubing.init();

	this.pauseForEvent = function () {
		var l, script,
			scripts = ["default.dbj", "libs/SoloPlay/Tools/TownChicken.js", "tools/antihostile.js", "tools/party.js", "tools/rushthread.js"];

		for (l = 0; l < scripts.length; l += 1) {
			script = getScript(scripts[l]);

			if (script && !script.running) {
				print("ÿc1Trying to townChicken, don't interfere.");

				return false;
			}

			if (script) {
				if (script.running) {
					// default.dbj
					if (l === 0) {
						print("ÿc1Pausing " + scripts[l]);
					}

					// Townchicken.dbj
					if (l === 1) {
						print("ÿc1Pausing " + scripts[l]);
					}

					script.pause();
				}
			}
		}

		return true;
	};

	this.resumeThreadsAfterEvent = function () {
		var l, script,
			scripts = ["default.dbj", "libs/SoloPlay/Tools/TownChicken.js", "tools/antihostile.js", "tools/party.js", "tools/rushthread.js"];

		for (l = 0; l < scripts.length; l += 1) {
			script = getScript(scripts[l]);

			if (script) {
				if (!script.running) {
					// default.dbj
					if (l === 0) {
						print("ÿc2Resuming " + scripts[l]);
					}

					// TownChicken
					if (l === 1) {
						print("ÿc2Resuming " + scripts[l]);
					}

					script.resume();
				}
			}
		}

		return true;
	};

	this.scriptEvent = function (msg) {
		// Added from Autosorc/Sorc.js
		if (msg && typeof msg === "string" && msg !== "" && msg.substring(0, 8) === "config--") {
			Config = JSON.parse(msg.split("config--")[1]);
		}
		
		switch (msg) {
		case "testing":
		case "finishDen":
		case "dodge":
		case "skip":
		case "killdclone":
			action.push(msg);

			break;
		default:
			break;
		}
	};

	this.receiveCopyData = function (id, info) {
		let list = [];

		if (id === 55) {
			let { profile, ladder, torchType } = JSON.parse(info);
			print("Mesage recived...processing");

			if (profile !== me.profile /*&& me.charlvl >= 65*/ && me.ladder === ladder) {
				if (torchType === me.classid && !me.findItem(604, 0, null, 7)) {
					print("Sent Response");
					Events.sendToProfile(profile, {profile: me.profile, level: me.charlvl})
				}
			}

			return;
		}

		if (id === 65) {
			let { profile, level } = JSON.parse(info);

			print("Sucess: profile that contacted me: " + profile + " level of char: " + level);
		}
	};

	addEventListener("scriptmsg", this.scriptEvent);
	addEventListener("gamepacket", Events.gamePacket);
	addEventListener('copydata', this.receiveCopyData);

	// Start
	while (true) {
		try {
			while (action.length) {
				if (this.pauseForEvent()) {
					try {
						Events[action.shift()]();
					} catch (e) {
						print(e);
					}

					this.resumeThreadsAfterEvent();
				} else {
					action.shift();
				}
			}
		} catch (e) {
			D2Bot.printToConsole(JSON.stringify(e));
			print(e);
		}

		delay(20);
	}

	return true;
}
