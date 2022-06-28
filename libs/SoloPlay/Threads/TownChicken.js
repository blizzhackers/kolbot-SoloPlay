/**
*  @filename    TownChicken.js
*  @author      kolton, theBGuy (modified for Kolbot-SoloPlay)
*  @desc        modified TownChicken for use with Kolbot-SoloPlay
*
*/
js_strict(true);

include("json2.js");
include("NTItemParser.dbl");
include("OOG.js");
include("Gambling.js");
include("CraftingSystem.js");
include("common/Attack.js");
include("common/Common.js");
include("common/Cubing.js");
include("common/Config.js");
include("common/CollMap.js");
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

SetUp.include();

function main() {
	let townCheck = false;
	console.log("ÿc8Kolbot-SoloPlayÿc0: Start TownChicken thread");

	// Init config and attacks
	D2Bot.init();
	Config.init();
	Pickit.init();
	Attack.init();
	Storage.Init();
	CraftingSystem.buildLists();
	Runewords.init();
	Cubing.init();

	let useHowl = Skill.canUse(sdk.skills.Howl);
	let useTerror = Skill.canUse(sdk.skills.Terror);

	let Overrides = require('../../modules/Override');

	new Overrides.Override(Town, Town.visitTown, function () {
		console.log("ÿc8Start ÿc0:: ÿc8visitTown");
	
		let preArea = me.area;
		let preAct = sdk.areas.actOf(preArea);

		// not an essential function -> handle thrown errors
		try {
			this.goToTown();
		} catch (e) {
			return false;
		}

		this.doChores();

		me.act !== preAct && this.goToTown(preAct);
		this.move("portalspot");

		if (!Pather.usePortal(null, me.name)) {
			try {
				Pather.usePortal(preArea, me.name);
			} catch (e) {
				throw new Error("Town.visitTown: Failed to go back from town");
			}
		}

		console.log("ÿc8End ÿc0:: ÿc8visitTown - currentArea: " + Pather.getAreaName(me.area));

		return true;
	}).apply();

	new Overrides.Override(Attack, Attack.getNearestMonster, function (orignal, givenSettings = {}) {
		let settings = Object.assign({
			skipBlocked: false,
			skipImmune: false
		}, givenSettings);
		let monster = orignal(settings);
		
		if (monster) {
			console.log("ÿc9TownChickenÿc0 :: Closest monster to me: " + monster.name + " | Monster classid: " + monster.classid);
			return monster.classid;
		}

		return -1;
	}).apply();

	new Overrides.Override(NodeAction, NodeAction.go, function () {
		return;
	}).apply();

	let pausedScripts = [];
	const scripts = ["default.dbj", "tools/antihostile.js"/* , "libs/SoloPlay/Modules/Guard.js" */];

	// keep track of what scripts we paused to reduce getScript calls
	this.togglePause = function () {
		let mode = pausedScripts.length ? "Resuming" : "Pausing";

		switch (mode) {
		case "Pausing":
			for (let i = 0; i < scripts.length; i += 1) {
				let script = getScript(scripts[i]);

				if (!!script && script.running) {
					pausedScripts.push(script);
					scripts[i] === "default.dbj" && console.log("ÿc8TownChicken:: ÿc1Pausing " + scripts[i]);
					script.pause();
				}
			}

			break;
		case "Resuming":
			while (pausedScripts.length) {
				let script = pausedScripts.shift();
				// don't resume if dclone walked
				if (script.name === "default.dbj" || script.name.match("guard", "gi")) {
					if (!SoloEvents.cloneWalked) {
						script.name === "default.dbj" && print("ÿc8TownChicken:: ÿc2Resuming threads");
						!!script && !script.running && script.resume();
					}
				} else {
					!!script && !script.running && script.resume();
				}
			}

			break;
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
			case "townCheck":
				switch (me.area) {
				case sdk.areas.ArreatSummit:
				case sdk.areas.UberTristram:
					console.warn("Don't tp from " + Pather.getAreaName(me.area));
					return;
				default:
					console.log("townCheck message recieved. First check passed.");
					townCheck = true;

					return;
				}
			case "quit":
				//quitFlag = true;
				// Maybe stop townChicken thread? Would that keep us from the crash that happens when we try to leave game while townChickening

				break;
			default:
				break;
			}

			switch (true) {
			case msg.substring(0, 8) === "config--":
				console.debug("update config");
				Config = JSON.parse(msg.split("config--")[1]);

				break;
			case msg.substring(0, 7) === "skill--":
				console.debug("update skillData");
				obj = JSON.parse(msg.split("skill--")[1]);
				Misc.updateRecursively(CharData.skillData, obj);

				break;
			case msg.substring(0, 6) === "data--":
				console.debug("update myData");
				obj = JSON.parse(msg.split("data--")[1]);
				Misc.updateRecursively(myData, obj);

				break;
			case msg.toLowerCase() === "test":
				console.debug(sdk.colors.Green + "//-----------DataDump Start-----------//\nÿc8MainData ::\n",
					myData, "\nÿc8BuffData ::\n", CharData.buffData, "\nÿc8SkillData ::\n", CharData.skillData, "\n" + sdk.colors.Red + "//-----------DataDump End-----------//");

				break;
			}
		}
	};

	addEventListener("scriptmsg", this.scriptEvent);

	while (true) {
		if (!me.inTown && (townCheck
			|| ((Config.TownHP > 0 && me.hpPercent < Config.TownHP)
			|| (Config.TownMP > 0 && me.mpPercent < Config.TownMP)))) {
			// should we exit if we can't tp to town?
			if (Town.canTpToTown()) {
				this.togglePause();

				while (!me.gameReady) {
					if (me.dead) {
						scriptBroadcast("quit");
						return false;
					}
					delay(40);
				}
				
				let t4 = getTickCount();
				try {
					myPrint("ÿc8TownChicken :: ÿc0Going to town");
					Attack.stopClear = true;
					SoloEvents.townChicken = true;
					
					// determine if this is really worth it
					if (useHowl || useTerror) {
						if ([156, 211, 242, 243, 544, 571, 345].indexOf(Attack.getNearestMonster()) === -1) {
							if (useHowl && Skill.getManaCost(130) < me.mp) {
								Skill.cast(130, 0);
							}

							if (useTerror && Skill.getManaCost(77) < me.mp) {
								Skill.cast(77, 0, Attack.getNearestMonster({skipImmune: false}));
							}
						}
					}
					
					Town.visitTown();
				} catch (e) {
					Misc.errorReport(e, "TownChicken.js");
					scriptBroadcast("quit");

					return false;
				} finally {
					console.log("Took: " + formatTime(getTickCount() - t4) + " to visit town");
					this.togglePause();

					Attack.stopClear = false;
					SoloEvents.townChicken = false;
					townCheck = false;
				}
			}
		}

		delay(50);
	}
}
