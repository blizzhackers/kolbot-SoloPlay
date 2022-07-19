/*
*	@filename	pits.js
*	@author		isid0re, theBGuy
*	@desc		pits A1 for MF and gold
*/

function pits () {
	Town.townTasks();
	myPrint('starting pits');

	Pather.checkWP(sdk.areas.BlackMarsh, true) ? Pather.useWaypoint(sdk.areas.BlackMarsh) : Pather.getWP(sdk.areas.BlackMarsh);
	Precast.doPrecast(true);

	if (!Pather.moveToExit([sdk.areas.TamoeHighland, sdk.areas.PitLvl1], true)) {
		myPrint("Failed to move to Pit level 1");
		return false;
	}

	Attack.clearLevel();

	if (!Pather.moveToExit(sdk.areas.PitLvl2, true)) {
		myPrint("Failed to move to Pit level 2");
		return true;
	}

	Attack.clearLevel();
	Misc.openChestsInArea(sdk.areas.PitLvl2);

	return true;
}
