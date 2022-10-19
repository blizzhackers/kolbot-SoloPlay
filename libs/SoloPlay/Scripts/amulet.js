/**
*  @filename    amulet.js
*  @author      isid0re, theBGuy
*  @desc        get the amulet from viper temple
*
*/

function amulet () {
	Town.doChores(false, { fullChores: true });
	myPrint("starting amulet");

	Pather.checkWP(sdk.areas.LostCity, true) ? Pather.useWaypoint(sdk.areas.LostCity) : Pather.getWP(sdk.areas.LostCity);
	Precast.doPrecast(true);
	Pather.moveToExit([sdk.areas.ValleyofSnakes, sdk.areas.ClawViperTempleLvl1, sdk.areas.ClawViperTempleLvl2], true);
	Precast.doPrecast(true);

	if (!Pather.useTeleport()) {
		// change this to be array loop, sometimes bot gets lucky to have a clearish path to the chest but
		// then because Attack.clear on nodeaction we move from the chest even though we were there and the vipers can't get to the altar
		Pather.moveTo(15065, 14047);
		Pather.moveTo(15063, 14066);
		Pather.moveTo(15051, 14066);
		Pather.moveTo(15045, 14051);
	} else {
		Pather.moveTo(15045, 14051, null, false);
	}

	if (!Quest.collectItem(sdk.quest.item.ViperAmulet, sdk.quest.chest.ViperAmuletChest)) {
		myPrint("Failed to collect viper amulet");
		return false;
	}

	Town.npcInteract("drognan");
	Quest.stashItem(sdk.items.quest.ViperAmulet);

	return true;
}
