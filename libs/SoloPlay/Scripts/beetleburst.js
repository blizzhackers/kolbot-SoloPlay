/*
*	@filename	beetleburst.js
*	@author		isid0re
*	@desc		kill beetleburst for exp
*/

function beetleburst () {
	Town.townTasks();
	print('ÿc8Kolbot-SoloPlayÿc0: starting beetleburst');

	Pather.checkWP(sdk.areas.FarOasis, true) ? Pather.useWaypoint(sdk.areas.FarOasis) : Pather.getWP(sdk.areas.FarOasis);
	Precast.doPrecast(true);
	Pather.moveToPreset(me.area, sdk.unittype.Monster, 747);
	Attack.clear(15, 0, getLocaleString(2882));

	return true;
}
