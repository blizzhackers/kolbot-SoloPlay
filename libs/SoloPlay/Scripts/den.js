/*
*	@filename	den.js
*	@author		theBGuy
*	@desc		den quest
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

	if (!Pather.checkWP(sdk.areas.ColdPlains)) {
		Pather.moveToExit(sdk.areas.BloodMoor, true);

		// make sure we are ready for cold plains
		me.charlvl < 2 && Attack.clearLevelUntilLevel(2);

		// now make portal at den entrace
		Pather.moveToExit(sdk.areas.DenofEvil, false, true);
		Pather.makePortal();
		Pather.getWP(sdk.areas.ColdPlains);

		// check if we need to do chores - if so use waypoint to town (preserves portal if we made one at den) - return to cold plains using waypoint
		Storage.Inventory.UsedSpacePercent() > 50 && Pather.useWaypoint(sdk.areas.RogueEncampment) && Town.doChores() && Pather.useWaypoint(sdk.areas.ColdPlains);

		// make sure we are ready for den
		me.charlvl < 3 && Attack.clearLevelUntilLevel(3);

		Pather.getWP(sdk.areas.ColdPlains);
		Pather.useWaypoint(sdk.areas.RogueEncampment);
	}

	Town.doChores();
	Town.move("portalspot");

	// Check if there are any portals before trying to use one
	!!getUnit(sdk.unittype.Object, sdk.units.BluePortal) ? Pather.usePortal(sdk.areas.BloodMoor, me.name) : Pather.moveToExit(sdk.areas.BloodMoor, true);

	// START
	let attempt = 1;
	Precast.doPrecast(true);
	Attack.clear(50);
	Pather.moveToExit(sdk.areas.DenofEvil, true);

	if (me.area === sdk.areas.DenofEvil) {
		const Worker = require('../../modules/Worker');
		let corpseTick = getTickCount();
		let corpsefire;

		Worker.runInBackground.corpseTracker = function () {
			if (me.area === sdk.areas.DenofEvil) {
				if (getTickCount() - corpseTick < 1000) return true;
				corpseTick = getTickCount();
				corpsefire = getUnit(sdk.unittype.Monster, getLocaleString(sdk.locale.monsters.Corpsefire));

				if (corpsefire && !Attack.canAttack(corpsefire)) {
					myPrint("Exit den. Corpsefire is immune");
					throw new Error('ÿc8Kolbot-SoloPlayÿc0: Exit den. Corpsefire is immune');
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
	}

	me.getStat(sdk.stats.NewSkills) > 0 && AutoSkill.init(Config.AutoSkill.Build, Config.AutoSkill.Save);

	return true;
}
