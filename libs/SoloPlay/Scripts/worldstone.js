/**
*	@filename	worldstone.js
*	@author		kolton
*	@desc		Clear Worldstone levels
*/

function worldstone() {
	print('ÿc8Kolbot-SoloPlayÿc0: starting worldstone');
	me.overhead("worldstone");

	Town.doChores();

	Town.buyPots(8, "Antidote");
	Town.drinkPots();
	Town.buyPots(8, "Thawing");
	Town.drinkPots();

	Pather.useWaypoint(sdk.areas.WorldstoneLvl2);
	Precast.doPrecast(true);
	Attack.clearLevel(Config.ClearType);

	if (Pather.moveToExit(sdk.areas.WorldstoneLvl1, true)) {
		Attack.clearLevel(Config.ClearType);
	}

	if (Pather.moveToExit([sdk.areas.WorldstoneLvl2, sdk.areas.WorldstoneLvl3], true)) {
		Attack.clearLevel(Config.ClearType);
	}

	return true;
}
