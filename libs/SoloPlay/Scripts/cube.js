/*
*	@filename	cube.js
*	@author		isid0re, theBGuy
*	@desc		get horadric cube
*/

function cube () {
	Town.townTasks();
	myPrint('starting cube');

	Pather.checkWP(sdk.areas.HallsoftheDeadLvl2, true) ? Pather.useWaypoint(sdk.areas.HallsoftheDeadLvl2) : Pather.getWP(sdk.areas.HallsoftheDeadLvl2);
	Precast.doPrecast(true);
	Pather.clearToExit(sdk.areas.HallsoftheDeadLvl2, sdk.areas.HallsoftheDeadLvl3, Pather.useTeleport());
	Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.HoradricCubeChest);
	Attack.securePosition(me.x, me.y, 30, 3000, true);
	Quest.collectItem(sdk.items.quest.Cube, sdk.quest.chest.HoradricCubeChest);
	Quest.stashItem(sdk.items.quest.Cube);

	return me.getItem(sdk.items.quest.Cube);
}
