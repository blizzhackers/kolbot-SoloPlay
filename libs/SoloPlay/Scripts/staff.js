/*
*	@filename	staff.js
*	@author		isid0re, theBGuy
*	@desc		maggot lair for staff needed for act2 quests
*/

function staff () {
	Town.townTasks();
	print('ÿc8Kolbot-SoloPlayÿc0: starting staff');
	me.overhead("staff");

	if (!Pather.checkWP(sdk.areas.FarOasis)) {
		Pather.getWP(sdk.areas.FarOasis);
	} else {
		Pather.useWaypoint(sdk.areas.FarOasis);
	}

	Precast.doPrecast(true);

	Pather.clearToExit(sdk.areas.FarOasis, sdk.areas.MaggotLairLvl1, true);
	Pather.clearToExit(sdk.areas.MaggotLairLvl1, sdk.areas.MaggotLairLvl2, true);
	Pather.clearToExit(sdk.areas.MaggotLairLvl2, sdk.areas.MaggotLairLvl3, true);

	if (!Pather.moveToPreset(me.area, 2, 356)) {
		print('ÿc8Kolbot-SoloPlayÿc0: Failed to get staff');
		return false;
	}

	Quest.collectItem(92, 356);
	Quest.stashItem(92);

	return true;
}

