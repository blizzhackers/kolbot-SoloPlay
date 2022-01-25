/*
*	@filename	mephisto.js
*	@author		isid0re, theBGuy
*	@desc		mephisto quest
*/

function mephisto () {
	this.killCouncil = function () {
		let coords = [17600, 8125, 17600, 8015, 17643, 8068];

		for (let i = 0; i < coords.length; i += 2) {
			Pather.moveTo(coords[i], coords[i + 1]);
			Attack.clearList(Attack.getMob([345, 346, 347], 0, 40));
		}

		return true;
	};

	Town.townTasks();
	myPrint('starting mephisto');
	me.overhead("mephisto");

	Pather.checkWP(sdk.areas.DuranceofHateLvl2, true) ? Pather.useWaypoint(sdk.areas.DuranceofHateLvl2) : Pather.getWP(sdk.areas.DuranceofHateLvl2);
	Precast.doPrecast(true);
	Pather.clearToExit(sdk.areas.DuranceofHateLvl2, sdk.areas.DuranceofHateLvl3, true);
	
	if (me.area !== sdk.areas.DuranceofHateLvl3) {
		print('ÿc8Kolbot-SoloPlayÿc0: Failed to move to mephisto');
		return false;
	}

	// Town stuff
	if (me.coldRes < 75 || me.poisonRes < 75) {
		Town.doChores();
		Town.buyPots(10, "Thawing", true);
		Town.buyPots(10, "Antidote", true);

		// Re-enter portal
		Pather.usePortal(sdk.areas.DuranceofHateLvl3, me.name);
		Precast.doPrecast(true);
	}

	if (me.mephisto && !me.hell) {
		this.killCouncil();
	}

	let oldPickRange = Config.PickRange;
	let oldUseMerc = Config.MercWatch;

	if (me.mephisto) {
		Pather.moveTo(17587, 8069);
		delay(400);
	}

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
	Misc.poll(function () { return me.area === sdk.areas.PandemoniumFortress; }, 1000, 30);

	while (!me.gameReady) {
		delay(100 + me.ping);
	}

	return me.area === sdk.areas.PandemoniumFortress;
}
