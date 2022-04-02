/*
*	@filename	tombs.js
*	@author		isid0re, theBGuy
*	@desc		leveling in act 2 tombs
*/

function tombs () {
	myPrint('starting tombs');

	let tombID = [sdk.areas.TalRashasTomb1, sdk.areas.TalRashasTomb2, sdk.areas.TalRashasTomb3, sdk.areas.TalRashasTomb4, sdk.areas.TalRashasTomb5, sdk.areas.TalRashasTomb6, sdk.areas.TalRashasTomb7];
	Town.townTasks();

	for (let number = 0; number < tombID.length; number++) {
		Pather.checkWP(sdk.areas.CanyonofMagic, true) ? Pather.useWaypoint(sdk.areas.CanyonofMagic) : Pather.getWP(sdk.areas.CanyonofMagic);
		Precast.doPrecast(true);

		if (Pather.moveToExit(tombID[number], true, true)) {
			me.overhead("Tomb #" + (number + 1));

			let obj = getRoom().correcttomb === me.area ? getPresetUnit(me.area, 2, 152) : getPresetUnit(me.area, 2, 397);
			!!obj && Pather.moveToUnit(obj);

			Attack.clear(50);
			Pickit.pickItems();

			if (me.duriel && getUnit(2, 100)) {
				Pather.useUnit(2, 100, sdk.areas.DurielsLair);
				me.sorceress && !me.normal ? Attack.pwnDury() : Attack.killTarget("Duriel");
				Pickit.pickItems();
			}
		}

		Town.goToTown();
		Town.heal();
	}

	return true;
}
