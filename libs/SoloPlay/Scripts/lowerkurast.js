/*
*	@filename	lowerkurast.js
*	@author		isid0re
*	@desc		LK runs for MF, rune drops, and gold
*/

function lowerkurast () {
	Town.townTasks();
	print('ÿc8Kolbot-SoloPlayÿc0: starting lower kurast');
	me.overhead("lower kurast");

	if (!Pather.checkWP(sdk.areas.LowerKurast)) {
		Pather.getWP(sdk.areas.LowerKurast);
	} else {
		Pather.useWaypoint(sdk.areas.LowerKurast);
	}

	Precast.doPrecast(true);
	Misc.openChestsInArea(sdk.areas.LowerKurast);

	return true;
}
