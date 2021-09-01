/**
*	@filename	river.js
*	@author		theBGuy
*	@desc		clear river of flame from city of the damned to hephasto then to the waypoint
*/

function river() {
	print('ÿc8Kolbot-SoloPlayÿc0: starting river');
	me.overhead("river");

	Town.doChores();

	Town.buyPots(8, "Antidote");
	Town.drinkPots();
	Town.buyPots(8, "Thawing");
	Town.drinkPots();

	if (!Pather.checkWP(106)) {
		Pather.getWP(106);
	} else {
		Pather.useWaypoint(106);
	}

	Precast.doPrecast(true);
	Pather.clearToExit(106, 107, true);

	if (!Pather.moveToPreset(me.area, 2, 376)) {
		print("ÿc8Kolbot-SoloPlayÿc0: Failed to move to Hephasto");
	}

	try {
		Attack.clear(20, 0, getLocaleString(1067)); // Hephasto The Armorer
	} catch (err) {
		print('ÿc8Kolbot-SoloPlayÿc0: Failed to kill Hephasto');
	}

	Pather.getWP(107, true);

	return true;
}
