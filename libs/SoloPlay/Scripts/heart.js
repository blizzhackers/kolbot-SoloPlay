/**
*  @filename    heart.js
*  @author      isid0re, theBGuy
*  @desc        get the heart for khalims will
*
*/

function heart () {
	Town.townTasks();
	myPrint("starting heart");

	Pather.checkWP(sdk.areas.KurastBazaar, true) ? Pather.useWaypoint(sdk.areas.KurastBazaar) : Pather.getWP(sdk.areas.KurastBazaar);
	Precast.doPrecast(true);

	if (!Pather.moveToExit([sdk.areas.KurastBazaar, sdk.areas.A3SewersLvl1, sdk.areas.A3SewersLvl2], true)
		|| !Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.KhalimsHeartChest)) {
		if (!me.getItem(sdk.items.quest.KhalimsHeart)) {
			console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to get the heart");
			return false;
		}
	}

	Attack.clear(0x7); // clear level
	Quest.collectItem(sdk.items.quest.KhalimsHeart, sdk.quest.chest.KhalimsHeartChest);
	Quest.stashItem(sdk.items.quest.KhalimsHeart);

	return me.getItem(sdk.items.quest.KhalimsHeart);
}
