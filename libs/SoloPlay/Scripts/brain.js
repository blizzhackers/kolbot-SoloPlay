/*
*	@filename	brain.js
*	@author		isid0re, theBGuy
*	@desc		get brain for khalims will
*/

function brain () {
	Town.townTasks();
	myPrint('starting brain');

	Pather.checkWP(sdk.areas.FlayerJungle, true) ? Pather.useWaypoint(sdk.areas.FlayerJungle) : Pather.getWP(sdk.areas.FlayerJungle);
	Precast.doPrecast(true);
	Pather.clearToExit(sdk.areas.FlayerJungle, sdk.areas.FlayerDungeonLvl1, Pather.useTeleport());
	Pather.clearToExit(sdk.areas.FlayerDungeonLvl1, sdk.areas.FlayerDungeonLvl2, Pather.useTeleport());
	Pather.clearToExit(sdk.areas.FlayerDungeonLvl2, sdk.areas.FlayerDungeonLvl3, Pather.useTeleport());

	if (!Pather.moveToPreset(me.area, sdk.unittype.Object, 406)) {
		print('ÿc8Kolbot-SoloPlayÿc0: Failed to get the Brain');
	}

	Attack.clear(0x7);
	Quest.collectItem(sdk.items.quest.KhalimsBrain, 406);
	Quest.stashItem(sdk.items.quest.KhalimsBrain);

	return true;
}
