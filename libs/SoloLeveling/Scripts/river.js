/**
*	@filename	river.js
*	@author		theBGuy
*	@desc		Clear Worldstone levels
*/

function river() {
	print('ÿc9GuysSoloLevelingÿc0: starting river');
	me.overhead("river");

	Town.doChores();

	Town.buyPots(8, "Antidote");
	Town.drinkPots();
	Town.buyPots(8, "Thawing");
	Town.drinkPots();

	if (!Pather.checkWP(107)) {
		Pather.getWP(107);
	} else {
		Pather.useWaypoint(107);
	}

	Precast.doPrecast(true);
	Attack.clearLevel(Config.ClearType);

	return true;
}