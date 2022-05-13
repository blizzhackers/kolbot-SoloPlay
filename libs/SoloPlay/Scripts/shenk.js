/*
*	@filename	shenk.js
*	@author		isid0re, theBGuy
*	@desc		shenk quest for sockets, wp's, and mf
*/

function shenk () {
	Town.townTasks();
	myPrint('starting shenk');

	Pather.checkWP(sdk.areas.FrigidHighlands, true) ? Pather.useWaypoint(sdk.areas.FrigidHighlands) : Pather.getWP(sdk.areas.FrigidHighlands);
	Precast.doPrecast(true);
	Pather.moveTo(3745, 5084);
	Attack.killTarget(getLocaleString(sdk.locale.monsters.EldritchtheRectifier));

	Pather.moveToExit(sdk.areas.BloodyFoothills, true);
	Pather.moveTo(3883, 5113);
	Attack.killTarget(getLocaleString(sdk.locale.monsters.ShenktheOverseer));

	return true;
}
