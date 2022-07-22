/**
*  @filename    lamessen.js
*  @author      isid0re, theBGuy
*  @desc        get the lam essen's tome
*
*/

function lamessen () {
	Town.townTasks();
	console.log("ÿc8Kolbot-SoloPlayÿc0: starting lamessen");
	me.overhead("lamessen");

	Pather.checkWP(sdk.areas.KurastBazaar, true) ? Pather.useWaypoint(sdk.areas.KurastBazaar) : Pather.getWP(sdk.areas.KurastBazaar);
	Precast.doPrecast(true);

	if (!Pather.moveToExit(sdk.areas.RuinedTemple, true) || !Pather.moveToPreset(me.area, sdk.unittype.Object, 193)) {
		console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to move to LamEssen Tome");
		return true;
	}

	Quest.collectItem(sdk.items.quest.LamEsensTome, 193);
	Town.unfinishedQuests();

	return true;
}
