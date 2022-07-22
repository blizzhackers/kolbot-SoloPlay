/**
*  @filename    ancienttunnels.js
*  @author      isid0re, theBGuy
*  @desc        ancient tunnel runs in act 2 for MF hunting and leveling.
*
*/

function ancienttunnels () {
	Town.townTasks();
	myPrint("starting ancient tunnels");

	Pather.checkWP(sdk.areas.LostCity, true) ? Pather.useWaypoint(sdk.areas.LostCity) : Pather.getWP(sdk.areas.LostCity);
	Precast.doPrecast(true);

	if (me.hell && me.classic) {
		Attack.clearLevel();
	} else {
		try {
			Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.units.SuperChest) && Misc.openChests(5) && Pickit.pickItems();
		} catch (e) {
			console.error(e);
		}

		try {
			Pather.moveToPreset(me.area, sdk.unittype.Monster, sdk.monsters.preset.DarkElder) && Attack.clear(15, 0, getLocaleString(sdk.locale.monsters.DarkElder));
		} catch (e) {
			console.warn("ÿc8Kolbot-SoloPlayÿc0: Failed to kill Dark Elder");
		}
	}

	if (!Pather.moveToExit(sdk.areas.AncientTunnels, true)) {
		console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to move to Ancient Tunnels");
		return false;
	}

	Attack.clearLevel();

	return true;
}
