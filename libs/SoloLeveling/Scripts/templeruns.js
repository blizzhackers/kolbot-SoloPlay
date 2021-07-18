/*
*	@filename	templeruns.js
*	@author		isid0re
*	@desc		temple runs for exp.
*	@credits	Xcon
*/

function templeruns () {
	print('ÿc9SoloLevelingÿc0: starting temple runs');
	me.overhead("temple runs");

	let temples = [[78, 79], [80, 94], [80, 95], [81, 96], [81, 97], [81, 82, 98], [81, 82, 99]];
	Town.townTasks();

	for (let run = 0; run < temples.length; run++) {
		if (!Pather.checkWP(temples[run][0])) {
			Pather.getWP(temples[run][0]);
		} else {
			Pather.useWaypoint(temples[run][0]);
		}

		Precast.doPrecast(true);

		if (Pather.moveToExit(temples[run], true, true)) {
			if (me.area === 79) {
				Misc.openChestsInArea(79);
			} else if (me.area === 94 && !me.lamessen) {
				me.overhead("lamessen");
				Pather.moveToPreset(94, 2, 193);
				Quest.collectItem(548, 193);
				Town.unfinishedQuests();
			} else {
				Attack.clearLevel(0xF);
			}
		}

		Town.goToTown();
	}

	if (!me.inTown) {
		Town.goToTown();

		if (!me.mephisto) {
			if (!Pather.checkWP(83)) {
				Pather.getWP(83);
				Town.goToTown();
			}
		}
	}

	return true;
}
