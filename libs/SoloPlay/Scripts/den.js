/*
*	@filename	den.js
*	@author		theBGuy
*	@desc		den quest
*/

function den () {
	let customGoToTown = function () {
		if (me.inTown) { return; }
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
		Pather.moveToExit(sdk.areas.DenofEvil, false, true);
		Pather.makePortal();
		Pather.getWP(sdk.areas.ColdPlains);

		if (me.normal && me.charlvl < 3) {
			Attack.clearLevelUntilLevel(3);
		}

		Pather.getWP(sdk.areas.ColdPlains);
		Pather.useWaypoint(sdk.areas.RogueEncampment);
	}

	Town.doChores();
	Town.move("portalspot");

	// Check if there are any portals before trying to use one
	!!getUnit(sdk.unittype.Object, sdk.units.BluePortal) ? Pather.usePortal(sdk.areas.BloodMoor, me.name) : Pather.moveToExit(sdk.areas.BloodMoor, true);

	// START
	let retry = 0;
	Precast.doPrecast(true);
	Attack.clear(50);
	Pather.moveToExit(sdk.areas.DenofEvil, true);

	while (me.area === sdk.areas.DenofEvil) {
		print("ÿc8Kolbot-SoloPlayÿc0: Clearing den attempt: " + (retry + 1));
		Attack.clearLevel();

		if (me.area !== sdk.areas.DenofEvil) { 
			break; 
		}

		if (Misc.checkQuest(1, 13)) {
			customGoToTown();
			Town.npcInteract("akara");
			
			break;
		}

		if (retry >= 5) {
			print("ÿc8Kolbot-SoloPlayÿc0: Failed to complete den");
			customGoToTown();

			break;
		}

		retry++;
	}

	me.getStat(sdk.stats.NewSkills) > 0 && AutoSkill.init(Config.AutoSkill.Build, Config.AutoSkill.Save);

	return true;
}
