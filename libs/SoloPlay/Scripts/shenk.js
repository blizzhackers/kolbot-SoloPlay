/*
*	@filename	shenk.js
*	@author		isid0re, theBGuy
*	@desc		shenk quest for sockets, wp's, and mf
*/

function shenk () {
	Town.townTasks();
	print('ÿc8Kolbot-SoloPlayÿc0: starting shenk');
	me.overhead("shenk");

	Pather.checkWP(sdk.areas.FrigidHighlands, true) ? Pather.useWaypoint(sdk.areas.FrigidHighlands) : Pather.getWP(sdk.areas.FrigidHighlands);
	Precast.doPrecast(true);
	let Eldritch = getUnit(1, getLocaleString(22500));

	if (Eldritch && Attack.canAttack(Eldritch)) {// Eldritch the Rectifier
		Pather.moveTo(3745, 5084);
		Attack.killTarget(getLocaleString(22500));
		Pickit.pickItems();
	}

	Pather.moveToExit(sdk.areas.BloodyFoothills, true);
	Pather.moveTo(3883, 5113);
	Attack.killTarget(getLocaleString(22435)); // Shenk the Overseer
	Pickit.pickItems();

	return true;
}
