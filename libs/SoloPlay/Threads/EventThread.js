/**
*  @filename    EventThread.js
*  @author      theBGuy
*  @desc        thread to handle in game events for Kolbot-SoloPlay
*
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
include("common/Common.js");
include("common/Cubing.js");
include("common/CollMap.js");
include("common/Config.js");
include("common/misc.js");
include("common/util.js");
include("common/Pickit.js");
include("common/Pather.js");
include("common/Precast.js");
include("common/Prototypes.js");
include("common/Runewords.js");
include("common/Town.js");
include("SoloPlay/Tools/Developer.js");
include("SoloPlay/Tools/Tracker.js");
include("SoloPlay/Functions/Globals.js");

function main () {
	let action = [];
	let profiles = [];
	let tickDelay = 0;

	print("ÿc8Kolbot-SoloPlayÿc0: Start EventThread");
	D2Bot.init();
	SetUp.include();
	Config.init(false);
	Pickit.init(false);
	Attack.init();
	Storage.Init();
	CraftingSystem.buildLists();
	Runewords.init();
	Cubing.init();

	this.pauseForEvent = function () {
		let scripts = ["default.dbj", "libs/SoloPlay/Threads/TownChicken.js", "tools/antihostile.js", "tools/party.js"];

		for (let l = 0; l < scripts.length; l += 1) {
			let script = getScript(scripts[l]);

			if (SoloEvents.townChicken) {
				console.warn("ÿc8EventThread :: ÿc1Trying to townChicken, don't interfere.");
				return false;
			}

			if (script) {
				if (script.running) {
					scripts[l] === "default.dbj" && console.log("ÿc8EventThread :: ÿc1Pausing " + scripts[l]);
					scripts[l] === "libs/SoloPlay/Threads/TownChicken.js" && !SoloEvents.cloneWalked && console.log("ÿc8EventThread :: ÿc1Pausing " + scripts[l]);

					// don't pause townchicken during clone walk
					if (scripts[l] !== "libs/SoloPlay/Threads/TownChicken.js" || !SoloEvents.cloneWalked) {
						script.pause();
					}
				}
			}
		}

		return true;
	};

	this.resumeThreadsAfterEvent = function () {
		let scripts = ["default.dbj", "libs/SoloPlay/Threads/TownChicken.js", "tools/antihostile.js", "tools/party.js"];

		for (let l = 0; l < scripts.length; l += 1) {
			let script = getScript(scripts[l]);

			if (script) {
				if (!script.running) {
					scripts[l] === "default.dbj" && console.log("ÿc8EventThread :: ÿc2Resuming " + scripts[l]);
					scripts[l] === "libs/SoloPlay/Threads/TownChicken.js" && console.log("ÿc8EventThread :: ÿc2Resuming " + scripts[l]);

					script.resume();
				}
			}
		}

		return true;
	};

	this.scriptEvent = function (msg) {
		let obj;
		
		if (msg && typeof msg === "string" && msg !== "") {
			switch (msg) {
			// ignore common scriptBroadcast messages that aren't relevent to this thread
			case "mule":
			case "muleTorch":
			case "muleAnni":
			case "torch":
			case "crafting":
			case "getMuleMode":
			case "pingquit":
				return;
			}

			let updated = false;
			switch (true) {
			case msg.substring(0, 8) === "config--":
				console.debug("update config");
				Config = JSON.parse(msg.split("config--")[1]);
				updated = true;

				break;
			case msg.substring(0, 7) === "skill--":
				console.debug("update skillData");
				obj = JSON.parse(msg.split("skill--")[1]);
				Misc.updateRecursively(CharData.skillData, obj);
				updated = true;

				break;
			case msg.substring(0, 6) === "data--":
				console.debug("update myData");
				obj = JSON.parse(msg.split("data--")[1]);
				Misc.updateRecursively(myData, obj);
				updated = true;

				break;
			case msg.toLowerCase() === "test":
				console.debug(sdk.colors.Green + "//-----------DataDump Start-----------//\nÿc8MainData ::\n",
					myData, "\nÿc8BuffData ::\n", CharData.buffData, "\nÿc8SkillData ::\n", CharData.skillData, "\n" + sdk.colors.Red + "//-----------DataDump End-----------//");
				updated = true;

				break;
			}

			if (updated) return;
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
		// Torch
		if (id === 55) {
			let { profile, ladder, torchType } = JSON.parse(info);
			print("Mesage recived for torch...processing");

			if (profile !== me.profile && (me.hell || (me.nightmare && me.baal)) && me.ladder === ladder) {
				if (torchType === me.classid && !me.findItem(604, 0, null, 7)) {
					print("Sent Response");
					SoloEvents.sendToProfile(profile, {profile: me.profile, level: me.charlvl, event: 604});
				}
			}

			return;
		}

		// Annhilus
		if (id === 60) {
			let { profile, ladder } = JSON.parse(info);
			print("Mesage recived for Annhilus...processing");

			if (profile !== me.profile && (me.hell || (me.nightmare && me.baal)) && me.ladder === ladder) {
				if (!me.findItem(603, 0, null, 7)) {
					print("Sent Response");
					SoloEvents.sendToProfile(profile, {profile: me.profile, level: me.charlvl, event: 603});
				}
			}

			return;
		}

		if (id === 65) {
			let { profile, level, event } = JSON.parse(info);

			print("Sucess: profile that contacted me: " + profile + " level of char: " + level);
			SoloEvents.profileResponded = true;
			profiles.push({profile: profile, level: level, event: event});
			tickDelay += 1000;
		}

		if (id === 70) {
			Messaging.sendToScript("D2BotSoloPlay.dbj", "event");
			delay(100 + me.ping);
			scriptBroadcast("quit");
		}
	};

	addEventListener("scriptmsg", this.scriptEvent);
	addEventListener("gamepacket", SoloEvents.gamePacket);
	addEventListener('copydata', this.receiveCopyData); // should this just be added to the starter? would remove needing 3 copydata event listeners (entry, default, and here)

	// Start
	while (true) {
		try {
			while (action.length) {
				if (this.pauseForEvent()) {
					try {
						SoloEvents[action.shift()]();
					} catch (e) {
						print(e);
					}

					this.resumeThreadsAfterEvent();
				} else {
					action.shift();
				}
			}

			if (profiles.length > 0) {
				let tick = getTickCount();

				while (getTickCount() - tick < tickDelay) {
					delay(500);
				}

				profiles.sort(function(a, b) {
					return a.level - b.level;
				});

				let lowestLevelProf = profiles.first();

				SoloEvents.sendToProfile(lowestLevelProf.profile, lowestLevelProf.event, 70);
				D2Bot.joinMe(lowestLevelProf.profile, me.gamename.toLowerCase(), "", me.gamepassword.toLowerCase(), true);
				profiles = [];
			}
		} catch (e) {
			D2Bot.printToConsole(JSON.stringify(e));
			print(e);
		}

		delay(20);
	}
}
