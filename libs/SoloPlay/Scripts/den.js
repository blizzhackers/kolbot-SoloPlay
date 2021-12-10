/*
*	@filename	den.js
*	@author		isid0re, theBGuy
*	@desc		den quest
*/

function den () {
	print('ÿc8Kolbot-SoloPlayÿc0: starting den');
	me.overhead("den");
	let retry = 0;

	if (!Pather.checkWP(sdk.areas.ColdPlains)) {
		Pather.moveToExit(sdk.areas.BloodMoor, true);
		Pather.moveToExit(sdk.areas.DenofEvil, false, true);
		Pather.makePortal();
		Pather.getWP(sdk.areas.ColdPlains);

		if (me.normal) {
			Attack.clearLevelUntilLevel(3);
		}

		Pather.getWP(sdk.areas.ColdPlains);
		Pather.useWaypoint(sdk.areas.RogueEncampment);
	}

	Town.doChores();
	Town.move("portalspot");

	// Check if there are any portals before trying to use one
	if (getUnit(sdk.unittype.Object, sdk.units.BluePortal)) {
		if (!Pather.usePortal(sdk.areas.BloodMoor, me.name)) {
			Pather.moveToExit(sdk.areas.BloodMoor, true);
		}
	} else {
		Pather.moveToExit(sdk.areas.BloodMoor, true);
	}

	Precast.doPrecast(true);
	Attack.clear(50);
	Pather.moveToExit(sdk.areas.DenofEvil, true);

	while (me.area === sdk.areas.DenofEvil) {
		print("ÿc8Kolbot-SoloPlayÿc0: Clearing den attempt: " + (retry + 1));
		Attack.clearLevel();

		if (Misc.checkQuest(1, 13)) {
			if (!Town.canTpToTown()) {
				Pather.moveToExit([sdk.areas.BloodMoor, sdk.areas.ColdPlains], true);
				Pather.getWP(sdk.areas.ColdPlains);
				Pather.useWaypoint(sdk.areas.RogueEncampment);
			} else {
				Town.goToTown();
			}

			Town.npcInteract("akara");
			
			break;
		}

		if (retry >= 5) {
			print("ÿc8Kolbot-SoloPlayÿc0: Failed to complete den");

			if (!Town.canTpToTown()) {
				Pather.moveToExit([sdk.areas.BloodMoor, sdk.areas.ColdPlains], true);
				Pather.getWP(sdk.areas.ColdPlains);
				Pather.useWaypoint(sdk.areas.RogueEncampment);
			} else {
				Town.goToTown();
			}

			break;
		}

		retry++;
	}

	return true;
}
