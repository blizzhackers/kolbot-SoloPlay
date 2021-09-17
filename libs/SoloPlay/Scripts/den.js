/*
*	@filename	den.js
*	@author		isid0re, theBGuy
*	@desc		den quest
*/

function den () {
	print('ÿc8Kolbot-SoloPlayÿc0: starting den');
	me.overhead("den");

	if (!Pather.checkWP(3)) {
		Pather.moveToExit(2, true);
		Pather.moveToExit(8, false, true);
		Pather.makePortal();
		Pather.getWP(3);

		if (me.normal) {
			Attack.clearLevelUntilLevel(3);
		}

		Pather.getWP(3);
		Pather.useWaypoint(1);
	}

	Town.doChores();

	if (!Pather.usePortal(2, me.name)) {
		Pather.moveToExit(2, true);
	}

	Precast.doPrecast(true);
	Attack.clear(50);
	Pather.moveToExit(8, true);

	while (me.area === 8) {
		Attack.clearLevel();

		if (Misc.checkQuest(1, 13)) {
			if (!Town.canTpToTown()) {
				Pather.moveToExit([2, 3], true);
				Pather.getWP(3);
				Pather.useWaypoint(1);
			} else {
				Town.goToTown();
			}

			Town.npcInteract("akara");
			
			break;
		}
	}

	return true;
}
