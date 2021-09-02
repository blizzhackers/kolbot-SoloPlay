/*
*	@filename	brain.js
*	@author		isid0re, theBGuy
*	@desc		get brain for khalims will
*/

function brain () {
	Town.townTasks();
	print('ÿc8Kolbot-SoloPlayÿc0: starting brain');
	me.overhead("brain");

	if (!Pather.checkWP(78)) {
		Pather.getWP(78);
	} else {
		Pather.useWaypoint(78);
	}

	Precast.doPrecast(true);
	Pather.clearToExit(78, 88, Pather.useTeleport());
	Pather.clearToExit(88, 89, Pather.useTeleport());
	Pather.clearToExit(89, 91, Pather.useTeleport());

	if (!Pather.moveToPreset(me.area, 2, 406)) {
		print('ÿc8Kolbot-SoloPlayÿc0: Failed to get the Brain');
	}

	Attack.clear(0x7);
	Quest.collectItem(555, 406);
	Quest.stashItem(555);

	return true;
}
