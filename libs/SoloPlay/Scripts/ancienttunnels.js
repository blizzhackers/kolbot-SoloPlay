/*
*	@filename	ancienttunnels.js
*	@author		isid0re
*	@desc		ancient tunnel runs in act 2 for MF hunting and leveling.
*/

function ancienttunnels () {
	Town.townTasks();
	print('ÿc8Kolbot-SoloPlayÿc0: starting ancient tunnels');
	me.overhead("ancient tunnels");

	if (!Pather.checkWP(sdk.areas.LostCity)) {
		Pather.getWP(sdk.areas.LostCity);
	} else {
		Pather.useWaypoint(sdk.areas.LostCity);
	}

	Precast.doPrecast(true);

	if (Pather.moveToPreset(me.area, 2, 580) && Misc.openChests(5)) {
		Pickit.pickItems();
	}

	if (getPresetUnit(me.area, 1, 751) && Pather.moveToPreset(me.area, 1, 751)) {
		try {
			Attack.clear(15, 0, getLocaleString(2886));
		} catch (err) {
			print('ÿc8Kolbot-SoloPlayÿc0: Failed to kill Dark Elder');
		}
	}

	if (!Pather.moveToExit(sdk.areas.AncientTunnels, true)) {
		print("ÿc8Kolbot-SoloPlayÿc0: Failed to move to Ancient Tunnels");

		return false;
	}

	Attack.clearLevel();

	return true;
}
