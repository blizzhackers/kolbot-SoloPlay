/*
*	@filename	mephisto.js
*	@author		isid0re, theBGuy
*	@desc		mephisto quest
*/

function mephisto () {
	Town.townTasks();
	print('ÿc8Kolbot-SoloPlayÿc0: starting mephisto');
	me.overhead("mephisto");

	if (!Pather.checkWP(sdk.areas.DuranceofHateLvl2)) {
		Pather.getWP(sdk.areas.DuranceofHateLvl2);
	} else {
		Pather.useWaypoint(sdk.areas.DuranceofHateLvl2);
	}

	Precast.doPrecast(true);
	Pather.clearToExit(sdk.areas.DuranceofHateLvl2, sdk.areas.DuranceofHateLvl3, true);
	
	if (me.area !== sdk.areas.DuranceofHateLvl3) {
		print('ÿc8Kolbot-SoloPlayÿc0: Failed to move to mephisto');
		return false;
	}

	// Town stuff
	Town.doChores();
	Town.buyPots(10, "Thawing");
	Town.drinkPots();
	Town.buyPots(10, "Antidote");
	Town.drinkPots();

	// Re-enter portal
	Pather.usePortal(sdk.areas.DuranceofHateLvl3, me.name);
	Precast.doPrecast(true);

	let oldPickRange = Config.PickRange;
	let oldUseMerc = Config.MercWatch;

	Pather.moveTo(17692, 8048);
	Pather.moveTo(17563, 8072);

	Config.MercWatch = oldUseMerc ? false : oldUseMerc;

	Attack.killTarget("Mephisto");

	Config.MercWatch = oldUseMerc;
	// Reset to normal value
	Config.PickRange = oldPickRange;
	
	Pickit.pickItems();
	Pather.moveTo(17581, 8070);
	delay(250 + me.ping * 2);
	Pather.usePortal(null);

	return true;
}
