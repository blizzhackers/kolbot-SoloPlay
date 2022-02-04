/**
*	@filename	TownChicken.js
*	@author		kolton, theBGuy (modified for Kolbot-SoloPlay)
*	@desc		handle town chicken
*/

js_strict(true);

include("json2.js");
include("NTItemParser.dbl");
include("OOG.js");
include("Gambling.js");
include("CraftingSystem.js");
include("common/Attack.js");
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

if (!isIncluded("SoloPlay/Tools/Developer.js")) { include("SoloPlay/Tools/Developer.js"); }
if (!isIncluded("SoloPlay/Tools/Tracker.js")) { include("SoloPlay/Tools/Tracker.js"); }
if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }

function main() {
	let townCheck = false;
	print("ÿc8Kolbot-SoloPlayÿc0: Start TownChicken thread");

	// Init config and attacks
	D2Bot.init();
	SetUp.include();
	Config.init();
	Pickit.init();
	Attack.init();
	Storage.Init();
	CraftingSystem.buildLists();
	Runewords.init();
	Cubing.init();

	let useHowl = me.barbarian && me.getSkill(sdk.skills.Howl, 0);
	let useTerror = me.necromancer && me.getSkill(sdk.skills.Terror, 0);

	this.togglePause = function () {
		let scripts = ["default.dbj", "tools/antihostile.js"];

		for (let i = 0; i < scripts.length; i += 1) {
			let script = getScript(scripts[i]);

			if (script) {
				if (script.running) {
					if (scripts[i] === "default.dbj") {
						print("ÿc8TownChicken :: ÿc1Pausing.");
					}

					script.pause();
				} else {
					if (scripts[i] === "default.dbj") {
						// don't resume if dclone walked
						if (!SoloEvents.cloneWalked) {
							print("ÿc8TownChicken :: ÿc2Resuming.");
							script.resume();
						}
					} else {
						script.resume();
					}
				}
			}
		}

		return true;
	};

	this.getNearestMonster = function () {
		let gid, distance,
			monster = getUnit(1),
			range = 30;

		if (monster) {
			do {
				if (monster.hp > 0 && Attack.checkMonster(monster) && !monster.getParent()) {
					distance = getDistance(me, monster);

					if (distance < range) {
						range = distance;
						gid = monster.gid;
					}
				}
			} while (monster.getNext());
		}

		monster = gid ? getUnit(1, -1, -1, gid) : false;

		if (monster) {
			print("ÿc9TownChickenÿc0 :: Closest monster to me: " + monster.name + " | Monster classid: " + monster.classid);
			return monster.classid;
		}

		return -1;
	};

	this.scriptEvent = function (msg) {
		let obj;

		if (msg && typeof msg === "string" && msg !== "") {
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
		case "townCheck":
			switch (me.area) {
			case sdk.areas.ArreatSummit:
				print("Don't tp from Arreat Summit.");

				break;
			case sdk.areas.UberTristram:
				print("Can't tp from uber trist.");

				break;
			default:
				print("townCheck message recieved. First check passed.");
				townCheck = true;

				break;
			}

			break;
		case "quit":
			//quitFlag = true;
			// Maybe stop townChicken thread? Would that keep us from the crash that happens when we try to leave game while townChickening

			break;
		default:
			break;
		}
	};

	addEventListener("scriptmsg", this.scriptEvent);

	while (true) {
		if (Town.canTpToTown() && (townCheck ||
			(Config.TownHP > 0 && me.hpPercent < Config.TownHP) ||
			(Config.TownMP > 0 && me.mpPercent < Config.TownMP))) {
			this.togglePause();

			while (!me.gameReady) {
				if (me.dead) return false;

				delay(100);
			}

			if (me.dead) return false;

			try {
				myPrint("ÿc8TownChicken :: ÿc0Going to town");
				Attack.stopClear = true;
				SoloEvents.townChicken = true;
				
				if (useHowl || useTerror) {
					if ([156, 211, 242, 243, 544, 571, 345].indexOf(this.getNearestMonster()) === -1) {
						if (useHowl && Skill.getManaCost(130) < me.mp) {
							Skill.cast(130, 0);
						}

						if (useTerror && Skill.getManaCost(77) < me.mp) {
							Skill.cast(77, 0, Attack.getNearestMonster(true));
						}
					}
				}
				
				Town.visitTown();
			} catch (e) {
				Misc.errorReport(e, "TownChicken.js");
				scriptBroadcast("quit");

				return false;
			} finally {
				this.togglePause();

				Attack.stopClear = false;
				SoloEvents.townChicken = false;
				townCheck = false;
			}
		}

		delay(50);
	}
}
