/*
*	@filename	beetleburst.js
*	@author		isid0re
*	@desc		kill beetleburst for exp
*/

function beetleburst () {
	Town.townTasks();
	myPrint('starting beetleburst');

	Pather.checkWP(sdk.areas.FarOasis, true) ? Pather.useWaypoint(sdk.areas.FarOasis) : Pather.getWP(sdk.areas.FarOasis);
	Precast.doPrecast(true);
	Pather.moveToPreset(me.area, sdk.unittype.Monster, sdk.units.monsters.Beetleburst); // 747 missing on sdk.js (Beetleburst: 717, on sdk.js)
	Attack.clear(15, 0, getLocaleString(sdk.locale.monsters.Beetleburst));

	return true;
}
