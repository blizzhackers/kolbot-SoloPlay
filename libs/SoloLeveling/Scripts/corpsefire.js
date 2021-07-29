/**
*	@filename	corpsefire.js
*	@author		theBGuy
*	@desc		clear den, kill corpsefire not for quest
*/

function corpsefire() {
	Town.doChores();
	Town.buyPots(10, "Thawing"); // thawing
	Town.drinkPots();
	Town.buyPots(10, "Antidote"); // antidote
	Town.drinkPots();

	print('ÿc9GuysSoloLevelingÿc0: starting corpsefire');
	me.overhead("starting corpsefire");

	if (!Pather.checkWP(3)) {
		Pather.getWP(3);
	} else {
		Pather.useWaypoint(3);
	}

	Precast.doPrecast(true);

	Pather.clearToExit(3, 2, true);
	Pather.clearToExit(2, 8, true);
	Attack.clearLevel();

	return true;
}
