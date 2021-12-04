/**
*	@filename	a5chests.js
*	@author		theBGuy
*	@desc		Open super-chests in configured act 5 areas
*/

function a5chests() {
	print('ÿc8Kolbot-SoloPlayÿc0: starting a5 chests');
	me.overhead("a5 chests");

	let areas = [sdk.areas.Abaddon, sdk.areas.PitofAcheron, sdk.areas.InfernalPit, sdk.areas.GlacialTrail, sdk.areas.DrifterCavern, sdk.areas.IcyCellar];

	Town.doChores();

	for (let i = 0; i < areas.length; i++) {
		try {
			if (!Pather.canTeleport() && me.nightmare && [sdk.areas.Abaddon, sdk.areas.PitofAcheron, sdk.areas.InfernalPit].indexOf(areas[i]) > -1) {
				continue;
			} else if (!Pather.canTeleport() && me.nightmare && me.charlvl >= 70 && [sdk.areas.Abaddon, sdk.areas.PitofAcheron, sdk.areas.InfernalPit, sdk.areas.GlacialTrail, sdk.areas.DrifterCavern].indexOf(areas[i]) > -1) {
				continue;
			}

			print("ÿc8Kolbot-SoloPlayÿc0: Moving to " + Pather.getAreaName(areas[i]));
			me.overhead("Moving to " + Pather.getAreaName(areas[i]));
			Pather.journeyTo(areas[i]);
			Precast.doPrecast();
			Misc.openChestsInArea(areas[i]);
			Town.doChores();
		} catch (e) {
			print("ÿc8Kolbot-SoloPlayÿc0: Failed to move to " + Pather.getAreaName(areas[i]));
			print("ÿc8Kolbot-SoloPlayÿc0: " + e);
			continue;
		}
	}

	return true;
}
