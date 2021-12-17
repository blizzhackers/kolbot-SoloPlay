/*
*	@filename	lamessen.js
*	@author		isid0re
*	@desc		get the lam essen's tome
*/

function lamessen () {
	Town.townTasks();
	print('ÿc8Kolbot-SoloPlayÿc0: starting lamessen');
	me.overhead("lamessen");

	if (!Pather.checkWP(sdk.areas.KurastBazaar)) {
		Pather.getWP(sdk.areas.KurastBazaar);
	} else {
		Pather.useWaypoint(sdk.areas.KurastBazaar);
	}

	Precast.doPrecast(true);

	if (!Pather.moveToExit(sdk.areas.RuinedTemple, true) || !Pather.moveToPreset(me.area, 2, 193)) {
		print('ÿc8Kolbot-SoloPlayÿc0: Failed to move to LamEssen Tome');
		return true;
	}

	Quest.collectItem(sdk.items.quest.LamEsensTome, 193);
	Town.unfinishedQuests();

	return true;
}
