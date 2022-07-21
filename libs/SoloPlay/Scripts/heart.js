/**
*  @filename    heart.js
*  @author      isid0re, theBGuy
*  @desc        get the heart for khalims will
*
*/

function heart () {
	Town.townTasks();
	print("ÿc8Kolbot-SoloPlayÿc0: starting heart");
	me.overhead("heart");

	Pather.checkWP(sdk.areas.KurastBazaar, true) ? Pather.useWaypoint(sdk.areas.KurastBazaar) : Pather.getWP(sdk.areas.KurastBazaar);
	Precast.doPrecast(true);

	if (!Pather.moveToExit([sdk.areas.KurastBazaar, sdk.areas.A3SewersLvl1, sdk.areas.A3SewersLvl2], true) || !Pather.moveToPreset(me.area, sdk.unittype.Object, 405)) {
		if (!me.getItem(sdk.items.quest.KhalimsHeart)) {
			print("ÿc8Kolbot-SoloPlayÿc0: Failed to get the heart");
			return false;
		}
	}

	Attack.clear(0x7); // clear level
	Quest.collectItem(sdk.items.quest.KhalimsHeart, 405);
	Quest.stashItem(sdk.items.quest.KhalimsHeart);

	return me.getItem(sdk.items.quest.KhalimsHeart);
}
