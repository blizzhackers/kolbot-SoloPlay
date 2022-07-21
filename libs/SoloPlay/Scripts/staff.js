/*
*	@filename	staff.js
*	@author		isid0re, theBGuy
*	@desc		maggot lair for staff needed for act2 quests
*/

function staff () {
	Town.townTasks();
	print('ÿc8Kolbot-SoloPlayÿc0: starting staff');
	me.overhead("staff");

	Pather.checkWP(sdk.areas.FarOasis, true) ? Pather.useWaypoint(sdk.areas.FarOasis) : Pather.getWP(sdk.areas.FarOasis);
	Precast.doPrecast(true);
	Pather.clearToExit(sdk.areas.FarOasis, sdk.areas.MaggotLairLvl1, true);
	Pather.clearToExit(sdk.areas.MaggotLairLvl1, sdk.areas.MaggotLairLvl2, true);
	Pather.clearToExit(sdk.areas.MaggotLairLvl2, sdk.areas.MaggotLairLvl3, true);

	if (!Pather.moveToPreset(me.area, sdk.unittype.Object, 356)) {
		print('ÿc8Kolbot-SoloPlayÿc0: Failed to move to staff');
		return me.getItem(sdk.items.quest.ShaftoftheHoradricStaff);
	}

	Quest.collectItem(sdk.items.quest.ShaftoftheHoradricStaff, 356);
	Quest.stashItem(sdk.items.quest.ShaftoftheHoradricStaff);

	return me.getItem(sdk.items.quest.ShaftoftheHoradricStaff);
}

