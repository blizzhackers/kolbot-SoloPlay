/*
*	@filename	tombs.js
*	@author		isid0re
*	@desc		leveling in act 2 tombs
*/

function tombs () {
	print('ÿc8Kolbot-SoloPlayÿc0: starting tombs');
	me.overhead("tombs");

	let tombID = [sdk.areas.TalRashasTomb1, sdk.areas.TalRashasTomb2, sdk.areas.TalRashasTomb3, sdk.areas.TalRashasTomb4, sdk.areas.TalRashasTomb5, sdk.areas.TalRashasTomb6, sdk.areas.TalRashasTomb7];
	Town.townTasks();

	for (let number = 0; number < tombID.length; number += 1) {
		if (!Pather.checkWP(sdk.areas.CanyonofMagic)) {
			Pather.getWP(sdk.areas.CanyonofMagic);
		} else {
			Pather.useWaypoint(sdk.areas.CanyonofMagic);
		}

		Precast.doPrecast(true);

		if (Pather.moveToExit(tombID[number], true, true)) {
			me.overhead("Tomb #" + (number + 1));

			let gbox = getPresetUnit(me.area, 2, 397);
			let orifice = getPresetUnit(me.area, 2, 152);

			if (gbox) {
				Pather.moveToPreset(me.area, 2, 397);
			}

			if (orifice) {
				Pather.moveToPreset(me.area, 2, 152);
			}

			Attack.clear(50);
			Pickit.pickItems();
		}

		Town.goToTown();
		Town.heal();
	}

	return true;
}
