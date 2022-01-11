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

	print('ÿc8Kolbot-SoloPlayÿc0: starting den');
	me.overhead("den");

	if (!Pather.checkWP(sdk.areas.ColdPlains)) {
		Pather.moveToExit(sdk.areas.BloodMoor, true);

		// make sure we are ready for cold plains
		me.charlvl < 2 && Attack.clearLevelUntilLevel(2);

		// now make portal at den entrace
		Pather.moveToExit(sdk.areas.DenofEvil, false, true);
		Pather.makePortal();
		Pather.getWP(sdk.areas.ColdPlains);

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
		while (!Misc.checkQuest(1, 0)) {
			print("ÿc8Kolbot-SoloPlayÿc0: Clearing den attempt: " + attempt);
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
				print("ÿc8Kolbot-SoloPlayÿc0: Failed to complete den");
				customGoToTown();

				break;
			}

			attempt++;
		}
	}

	me.getStat(sdk.stats.NewSkills) > 0 && AutoSkill.init(Config.AutoSkill.Build, Config.AutoSkill.Save);

	return true;
}
