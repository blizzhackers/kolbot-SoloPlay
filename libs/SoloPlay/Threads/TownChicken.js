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
	let fastTown = false;
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

	let Overrides = require("../../modules/Override");

	new Overrides.Override(Attack, Attack.getNearestMonster, function (orignal, givenSettings = {}) {
		const settings = Object.assign({
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

	NodeAction.go = function () {
		return;
	};

	Pather.usePortal = function (targetArea, owner, unit, dummy) {
		if (targetArea && me.area === targetArea) return true;

		me.cancelUIFlags();

		function townAreaCheck (area = 0) {
			return [sdk.areas.RogueEncampment, sdk.areas.LutGholein, sdk.areas.KurastDocktown, sdk.areas.PandemoniumFortress, sdk.areas.Harrogath].includes(area);
		}

		let preArea = me.area;
		let leavingTown = townAreaCheck(preArea);

		for (let i = 0; i < 13; i += 1) {
			if (me.dead || me.area !== preArea) {
				break;
			}

			if (i > 0 && owner && me.inTown) {
				Town.move("portalspot");
			}

			let portal = unit ? copyUnit(unit) : Pather.getPortal(targetArea, owner);

			if (portal) {
				let redPortal = portal.classid === sdk.objects.RedPortal;

				if (portal.area === me.area) {
					if (Skill.useTK(portal) && i < 3) {
						portal.distance > 21 && (me.inTown && me.act === 5 ? Town.move("portalspot") : Pather.moveNearUnit(portal, 20));
						if (Skill.cast(sdk.skills.Telekinesis, sdk.skills.hand.Right, portal)) {
							if (Misc.poll(() => {
								if (me.area !== preArea) {
									Pather.lastPortalTick = getTickCount();
									delay(100);

									return true;
								}

								return false;
							}, 500, 50)) {
								return true;
							}
						}
					} else {
						portal.distance > 5 && this.moveToUnit(portal);

						if (getTickCount() - this.lastPortalTick > (leavingTown ? 2500 : 1000)) {
							i < 2 ? Packet.entityInteract(portal) : Misc.click(0, 0, portal);
							!!redPortal && delay(150);
						} else {
							// only delay if we are in town and leaving town, don't delay if we are attempting to portal from out of town since this is the chicken thread
							// and we are likely being attacked
							leavingTown && delay(300);
							
							continue;
						}
					}
				}

				if (dummy) {
					// try clicking portal
					Misc.click(0, 0, portal);
				}

				// Portal to/from Arcane
				if (portal.classid === sdk.objects.ArcaneSanctuaryPortal && portal.mode !== sdk.objects.mode.Active) {
					Misc.click(0, 0, portal);
					let tick = getTickCount();

					while (getTickCount() - tick < 2000) {
						if (portal.mode === sdk.objects.mode.Active || me.inArea(sdk.areas.ArcaneSanctuary)) {
							break;
						}

						delay(10);
					}
				}

				let tick = getTickCount();

				while (getTickCount() - tick < 500) {
					if (me.area !== preArea) {
						this.lastPortalTick = getTickCount();
						delay(100);

						return true;
					}

					delay(10);
				}

				i > 1 && (i % 3) === 0 && Packet.flash(me.gid);
			} else {
				console.log("Didn't find portal, retry: " + i);
				i > 3 && me.inTown && Town.move("portalspot", false);
				if (i === 12) {
					let p = Game.getObject("portal");
					console.debug(p);
					if (!!p && Misc.click(0, 0, p) && Misc.poll(() => me.area !== preArea, 1000, 100)) {
						this.lastPortalTick = getTickCount();
						delay(100);

						return true;
					}
				}
				Packet.flash(me.gid);
			}

			delay(250);
		}

		return (targetArea ? me.area === targetArea : me.area !== preArea);
	};

	Pather.makePortal = function (use = false) {
		if (me.inTown) return true;

		let oldGid = -1;

		for (let i = 0; i < 5; i += 1) {
			if (me.dead) return false;

			let tpTool = me.getTpTool();
			if (!tpTool) return false;

			let oldPortal = Game.getObject(sdk.objects.BluePortal);
			if (oldPortal) {
				do {
					if (oldPortal.getParent() === me.name) {
						oldGid = oldPortal.gid;
						break;
					}
				} while (oldPortal.getNext());
			}
			
			let pingDelay = i === 0 ? 100 : me.gameReady ? (me.ping + 25) : 350;

			if (tpTool.use() || Game.getObject("portal")) {
				let tick = getTickCount();

				while (getTickCount() - tick < Math.max(500 + i * 100, pingDelay * 2 + 100)) {
					let portal = getUnits(sdk.unittype.Object, "portal")
						.filter((p) => p.getParent() === me.name && p.gid !== oldGid)
						.first();

					if (!!portal) {
						if (use) {
							if (this.usePortal(null, null, copyUnit(portal))) {
								return true;
							}
							break; // don't spam usePortal
						} else {
							return copyUnit(portal);
						}
					} else {
						// check dummy
						let dummy = Game.getObject("portal");
						if (dummy) {
							console.debug(dummy);
							if (use) {
								return Pather.usePortal(null, null, dummy, true);
							} else {
								return copyUnit(dummy);
							}
						}
					}

					delay(10);
				}
			} else {
				console.log("Failed to use tp tool");
				Packet.flash(me.gid, pingDelay);
				delay(200 + pingDelay);
			}

			delay(40);
		}

		return false;
	};

	Town.visitTown = function () {
		console.log("ÿc8Start ÿc0:: ÿc8visitTown");
	
		let preArea = me.area;
		let preAct = sdk.areas.actOf(preArea);

		if (!me.inTown && !me.getTpTool()) {
			console.warn("Can't chicken to town. Quit");
			scriptBroadcast("quit");
		}

		// not an essential function -> handle thrown errors
		try {
			me.cancelUIFlags();
			Town.goToTown();
		} catch (e) {
			return false;
		}

		Town.doChores();

		console.debug("Current act: " + me.act + " Prev Act: " + preAct);
		me.act !== preAct && Town.goToTown(preAct);
		Town.move("portalspot");

		if (!Pather.usePortal(null, me.name)) {
			try {
				Pather.usePortal(preArea, me.name);
			} catch (e) {
				throw new Error("Town.visitTown: Failed to go back from town");
			}
		}

		console.log("ÿc8End ÿc0:: ÿc8visitTown - currentArea: " + Pather.getAreaName(me.area));

		return me.area === preArea;
	};

	this.togglePause = function () {
		let scripts = ["libs/SoloPlay/SoloPlay.js", "tools/antihostile.js"];

		for (let i = 0; i < scripts.length; i++) {
			let script = getScript(scripts[i]);

			if (script) {
				if (script.running) {
					scripts[i] === "libs/SoloPlay/SoloPlay.js" && console.log("ÿc8TownChicken:: ÿc1Pausing " + scripts[i]);

					script.pause();
				} else {
					if (scripts[i] === "libs/SoloPlay/SoloPlay.js") {
						// don't resume if dclone walked
						if (!SoloEvents.cloneWalked) {
							console.log("ÿc8TownChicken :: ÿc2Resuming threads");
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
			case "fastTown":
				fastTown = true;
				
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
	let tGuard = getScript("libs/SoloPlay/Modules/TownGuard.js");
	!!tGuard && tGuard.running && tGuard.stop();
	Developer.debugging.showStack.profiles.some(profile => profile.toLowerCase() === "all" || profile.toLowerCase() === me.profile.toLowerCase()) && require("../Modules/TownGuard");
	
	// START
	// test for getUnit bug
	let test = Game.getMonster();
	test === null && console.warn("getUnit is bugged");

	const useHowl = Skill.canUse(sdk.skills.Howl);
	const useTerror = Skill.canUse(sdk.skills.Terror);

	Config.DebugMode = true;

	while (true) {
		if (!me.inTown && (townCheck || fastTown
			|| ((Config.TownHP > 0 && me.hpPercent < Config.TownHP)
			|| (Config.TownMP > 0 && me.mpPercent < Config.TownMP)))) {
			// should we exit if we can't tp to town?
			if (townCheck && !Town.canTpToTown()) {
				townCheck = false;

				continue;
			}
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
							Skill.cast(130, sdk.skills.hand.Right);
						}

						if (useTerror && Skill.getManaCost(77) < me.mp) {
							Skill.cast(77, sdk.skills.hand.Right, Attack.getNearestMonster({skipImmune: false}));
						}
					}
				}
				
				Town.visitTown();
			} catch (e) {
				Misc.errorReport(e, "TownChicken.js");
				scriptBroadcast("quit");

				return false;
			} finally {
				Packet.flash(me.gid, 100);
				console.log("ÿc8TownChicken :: Took: " + Time.format(getTickCount() - t4) + " to visit town");
				this.togglePause();

				Attack.stopClear = false;
				SoloEvents.townChicken = false;
				townCheck = false;
				fastTown = false;
			}
		}

		delay(50);
	}
}
