/**
*  @filename    den.js
*  @author      theBGuy
*  @desc        den quest
*
*/

function den () {
	let customGoToTown = function () {
		if (me.inTown) return;
		if (!Town.canTpToTown()) {
			Pather.moveToExit([sdk.areas.BloodMoor, sdk.areas.ColdPlains], true);
			Pather.getWP(sdk.areas.ColdPlains);
			Pather.useWaypoint(sdk.areas.RogueEncampment);
		} else {
			Town.goToTown();
		}
	};

	myPrint('starting den');

	if (!Pather.checkWP(sdk.areas.ColdPlains) || me.charlvl < 4) {
		Pather.moveToExit(sdk.areas.BloodMoor, true);

		// make sure we are ready for cold plains
		let clearUntil = me.charlvl === 1 ? /*just started*/ 2 : 3; // if this is our second attempt, then bloor moor should be repopulated with mobs
		me.charlvl < clearUntil && Attack.clearLevelUntilLevel(clearUntil);

		// now make portal at den entrace
		Pather.moveToExit(sdk.areas.DenofEvil, false, true);
		Pather.makePortal();
		Pather.getWP(sdk.areas.ColdPlains);

		// check if we need to do chores - if so use waypoint to town (preserves portal if we made one at den) - return to cold plains using waypoint
		Storage.Inventory.UsedSpacePercent() > 50 && Pather.useWaypoint(sdk.areas.RogueEncampment) && Town.doChores() && Pather.useWaypoint(sdk.areas.ColdPlains);

		// make sure we are ready for den
		clearUntil = me.charlvl === 2 ? /*just started*/ 3 : 4;
		me.charlvl < clearUntil && Attack.clearLevelUntilLevel(clearUntil);

		Pather.getWP(sdk.areas.ColdPlains);
		Pather.useWaypoint(sdk.areas.RogueEncampment);
	}

	Town.doChores();
	Town.move("portalspot");

	// Check if there are any portals before trying to use one
	let p = getUnit(sdk.unittype.Object, sdk.units.BluePortal);
	
	if (!!p && [sdk.areas.BloodMoor, sdk.areas.DenofEvil].includes(p.objtype)) {
		Pather.usePortal(null, me.name);
	} else {
		Pather.moveToExit(sdk.areas.BloodMoor, true);
	}

	// START
	let attempt = 1;
	let killTracker = false;
	let denLights = false;
	Precast.doPrecast(true);
	Attack.clear(20);
	Pather.moveToExit(sdk.areas.DenofEvil, true);

	this.denLightsListener = function (bytes = []) {
		if (!bytes.length) return;
		// d2gs unique event - den lights
		if (bytes[0] === 0x89) {
			denLights = true;
		}
	};

	if (me.area === sdk.areas.DenofEvil) {
		addEventListener("gamepacket", this.denLightsListener);
		const Worker = require('../../modules/Worker');
		let corpseTick = getTickCount();
		let corpsefire;

		try {
			if (!me.normal) {
				Worker.runInBackground.corpseTracker = function () {
					if (killTracker) return false;
					if (me.area === sdk.areas.DenofEvil) {
						if (getTickCount() - corpseTick < 1000) return true;
						corpseTick = getTickCount();
						corpsefire = getUnit(sdk.unittype.Monster, getLocaleString(sdk.locale.monsters.Corpsefire));

						if (corpsefire && !Attack.canAttack(corpsefire)) {
							killTracker = true;
							myPrint("Exit den. Corpsefire is immune");
							throw new Error('ÿc8Kolbot-SoloPlayÿc0: Exit den. Corpsefire is immune');
						}
					}

					return true;
				};
			}

			Worker.runInBackground.denLightsTracker = function () {
				if (killTracker) return false;
				if (me.area === sdk.areas.DenofEvil) {
					if (denLights) {
						killTracker = true;
						throw new Error('DEN COMPLETE');
					}
				}

				return true;
			};

			while (!Misc.checkQuest(1, 0)) {
				console.log("ÿc8Kolbot-SoloPlayÿc0: Clearing den attempt: " + attempt);
				Attack.clearLevel();

				if (me.area !== sdk.areas.DenofEvil) {
					break;
				}

				if (Misc.checkQuest(1, 13)) {
					customGoToTown();
					Town.npcInteract("akara");
					
					break;
				}

				if (attempt >= 5) {
					console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to complete den");
					customGoToTown();

					break;
				}

				attempt++;
			}

		} catch (e) {
			//
		} finally {
			removeEventListener("gamepacket", this.denLightsListener);
			SoloEvents.finishDen();
			killTracker = true;
			me.getStat(sdk.stats.NewSkills) > 0 && AutoSkill.init(Config.AutoSkill.Build, Config.AutoSkill.Save);
		}
	}

	return true;
}
