/**
*	@filename	treehead.js
*	@author		theBGuy
*	@desc		kill Treehead
*/

function treehead() {
	Town.doChores();
	Pather.useWaypoint(sdk.areas.DarkWood);
	Precast.doPrecast(true);

	try {
		Pather.moveToPreset(me.area, 2, 30, 5, 5);
	} catch (e) {
		Attack.clear(5);
		// Try again
		if (Pather.moveToPreset(me.area, 2, 30, 5, 5)) {
			return false;
		}
	}

	Attack.killTarget(getLocaleString(2873));

	return true;
}
