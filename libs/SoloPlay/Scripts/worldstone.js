/**
*	@filename	worldstone.js
*	@author		kolton
*	@desc		Clear Worldstone levels
*/

function worldstone() {
	myPrint('starting worldstone');

	Town.doChores();
	Town.buyPots(10, "Antidote", true);
	Town.buyPots(10, "Thawing", true);

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
