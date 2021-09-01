/**
*	@filename	a1chests.js
*	@author		theBGuy
*	@desc		Open super-chests in configured act 1 areas
*/

function a1chests() {
	print('ÿc9GuysSoloLevelingÿc0: starting a1 chests');
	me.overhead("a1 chests");

	let areas = [13, 14, 15, 16];

	Town.doChores();

	for (let i = 0; i < areas.length; i++) {
		try {
			// Don't run pits for its chest, when it was cleared during the pits script
			if (((me.sorceress && me.charlvl >= 80) || me.barbarian) && areas[i] === 16) {
				continue;
			}

			print("ÿc9GuysSoloLevelingÿc0: Moving to " + Pather.getAreaName(areas[i]));
			me.overhead("Moving to " + Pather.getAreaName(areas[i]));
			Pather.journeyTo(areas[i]);
			Precast.doPrecast();
			Misc.openChestsInArea(areas[i]);
			Town.doChores();
		} catch (e) {
			print("ÿc9GuysSoloLevelingÿc0: Failed to move to " + Pather.getAreaName(areas[i]));
			print("ÿc9GuysSoloLevelingÿc0: " + e);
			continue;
		}
	}

	return true;
}