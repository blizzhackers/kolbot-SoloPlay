/**
*	@filename	river.js
*	@author		theBGuy
*	@desc		Clear Worldstone levels
*/

function river() {
	print('ÿc9GuysSoloLevelingÿc0: starting river');
	me.overhead("river");

	Town.doChores();

	if (!Pather.checkWP(107)) {
		Pather.getWP(107);
	} else {
		Pather.useWaypoint(107);
	}

	Precast.doPrecast(true);
	Attack.clearLevel(Config.ClearType);

	return true;
}