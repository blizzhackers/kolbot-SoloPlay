/**
*  @filename    amulet.js
*  @author      isid0re, theBGuy
*  @desc        get the amulet from viper temple
*
*/

function amulet () {
	Town.townTasks();
	myPrint("starting amulet");

	Pather.checkWP(sdk.areas.LostCity, true) ? Pather.useWaypoint(sdk.areas.LostCity) : Pather.getWP(sdk.areas.LostCity);
	Precast.doPrecast(true);
	Pather.moveToExit([sdk.areas.ValleyofSnakes, sdk.areas.ClawViperTempleLvl1, sdk.areas.ClawViperTempleLvl2], true);
	Precast.doPrecast(true);

	if (!Pather.useTeleport()) {
		Pather.moveTo(15065, 14047);
		Pather.moveTo(15063, 14066);
		Pather.moveTo(15051, 14066);
		Pather.moveTo(15045, 14051);
	} else {
		Pather.moveTo(15045, 14051, null, false);
	}

	if (!Quest.collectItem(sdk.items.quest.ViperAmulet, 149)) {
		myPrint("Failed to collect viper amulet");
		return false;
	}

	Town.npcInteract("drognan");
	Quest.stashItem(sdk.items.quest.ViperAmulet);

	return true;
}
