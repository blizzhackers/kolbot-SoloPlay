/*
*	@filename	den.js
*	@author		isid0re, theBGuy
*	@desc		den quest
*/

function den () {
	print('ÿc8Kolbot-SoloPlayÿc0: starting den');
	me.overhead("den");

	if (!Pather.checkWP(sdk.areas.ColdPlains)) {
		Pather.moveToExit(sdk.areas.BloodMoor, true);
		Pather.moveToExit(sdk.areas.DenofEvil, false, true);
		Pather.makePortal();
		Pather.getWP(sdk.areas.ColdPlains);

		if (me.normal) {
			Attack.clearLevelUntilLevel(sdk.areas.ColdPlains);
		}

		Pather.getWP(sdk.areas.ColdPlains);
		Pather.useWaypoint(sdk.areas.RogueEncampment);
	}

	Town.doChores();

	if (!Pather.usePortal(sdk.areas.BloodMoor, me.name)) {
		Pather.moveToExit(sdk.areas.BloodMoor, true);
	}

	Precast.doPrecast(true);
	Attack.clear(50);
	Pather.moveToExit(sdk.areas.DenofEvil, true);

	while (me.area === sdk.areas.DenofEvil) {
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
	}

	return true;
}
