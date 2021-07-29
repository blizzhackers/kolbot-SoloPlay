/**
*	@filename	worldstone.js
*	@author		kolton
*	@desc		Clear Worldstone levels
*/

function worldstone() {
	print('ÿc9GuysSoloLevelingÿc0: starting worldstone');
	me.overhead("worldstone");

	Town.doChores();

	Town.buyPots(8, "Antidote");
	Town.drinkPots();
	Town.buyPots(8, "Thawing");
	Town.drinkPots();

	Pather.useWaypoint(129);
	Precast.doPrecast(true);
	Attack.clearLevel(Config.ClearType);

	if (Pather.moveToExit(128, true)) {
		Attack.clearLevel(Config.ClearType);
	}

	if (Pather.moveToExit([129, 130], true)) {
		Attack.clearLevel(Config.ClearType);
	}

	return true;
}