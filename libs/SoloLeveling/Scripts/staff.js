/*
*	@filename	staff.js
*	@author		isid0re
*	@desc		maggot lair for staff needed for act2 quests
*/

function staff () {
	Town.townTasks();
	print('ÿc9SoloLevelingÿc0: starting staff');
	me.overhead("staff");

	if (!Pather.checkWP(43)) {
		Pather.getWP(43);
	} else {
		Pather.useWaypoint(43);
	}

	Precast.doPrecast(true);

	Pather.clearToExit(43, 62, true); //Far Oasis -> ML1
	Pather.clearToExit(62, 63, true); //ML1 -> ML2
	Pather.clearToExit(63, 64, true); //ML2 -> ML3

	if (!Pather.moveToPreset(me.area, 2, 356)) {
		print('ÿc9GuysSoloLevelingÿc0: Failed to get staff');
		return false;
	}

	Quest.collectItem(92, 356);
	Quest.stashItem(92);

	return true;
}

