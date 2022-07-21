/**
*  @filename    tombs.js
*  @author      theBGuy
*  @desc        leveling in act 2 tombs
*
*/

function tombs () {
	myPrint("starting tombs");

	let tombID = [sdk.areas.TalRashasTomb1, sdk.areas.TalRashasTomb2, sdk.areas.TalRashasTomb3, sdk.areas.TalRashasTomb4, sdk.areas.TalRashasTomb5, sdk.areas.TalRashasTomb6, sdk.areas.TalRashasTomb7];
	Town.townTasks();

	for (let number = 0; number < tombID.length; number++) {
		Pather.checkWP(sdk.areas.CanyonofMagic, true) ? Pather.useWaypoint(sdk.areas.CanyonofMagic) : Pather.getWP(sdk.areas.CanyonofMagic);
		Precast.doPrecast(true);

		if (Pather.moveToExit(tombID[number], true, true)) {
			me.overhead("Tomb #" + (number + 1));

			let obj = getRoom().correcttomb === me.area ? Game.getPresetObject(me.area, sdk.units.HoradricStaffHolder) : Game.getPresetObject(me.area, sdk.units.SmallSparklyChest);
			!!obj && Pather.moveToUnit(obj);

			Attack.clear(50);
			Pickit.pickItems();

			if (me.duriel && Game.getObject(sdk.units.PortaltoDurielsLair)) {
				Pather.useUnit(sdk.unittype.Object, sdk.units.PortaltoDurielsLair, sdk.areas.DurielsLair);
				me.sorceress && !me.normal ? Attack.pwnDury() : Attack.killTarget("Duriel");
				Pickit.pickItems();
			}
		}

		Town.goToTown();
		Town.heal();
	}

	return true;
}
