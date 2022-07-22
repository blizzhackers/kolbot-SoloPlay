/**
*  @filename    lowerkurast.js
*  @author      isid0re, theBGuy
*  @desc        LK runs for MF, rune drops, and gold
*
*/

function lowerkurast () {
	Town.townTasks();
	console.log("ÿc8Kolbot-SoloPlayÿc0: starting lower kurast");
	me.overhead("lower kurast");

	Pather.checkWP(sdk.areas.LowerKurast, true) ? Pather.useWaypoint(sdk.areas.LowerKurast) : Pather.getWP(sdk.areas.LowerKurast);
	Precast.doPrecast(true);
	Misc.openChestsInArea(sdk.areas.LowerKurast);

	return true;
}
