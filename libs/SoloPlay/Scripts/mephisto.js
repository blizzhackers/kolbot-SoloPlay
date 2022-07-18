/*
*	@filename	mephisto.js
*	@author		isid0re, theBGuy
*	@desc		mephisto quest
*/

function mephisto () {
	this.killCouncil = function () {
		let coords = [17600, 8125, 17600, 8015, 17643, 8068];

		for (let i = 0; i < coords.length; i += 2) {
			[coords[i], coords[i + 1]].distance > 60 && Pather.moveNear(coords[i], coords[i + 1], 60);
			if ([coords[i], coords[i + 1]].mobCount(30) === 0) continue;
			Pather.moveTo(coords[i], coords[i + 1]);
			Attack.clearList(Attack.getMob([sdk.units.monsters.Council1, sdk.units.monsters.Council2, sdk.units.monsters.Council3], 0, 40));
		}

		return true;
	};

	Town.townTasks();
	myPrint('starting mephisto');

	Pather.checkWP(sdk.areas.DuranceofHateLvl2, true) ? Pather.useWaypoint(sdk.areas.DuranceofHateLvl2) : Pather.getWP(sdk.areas.DuranceofHateLvl2);
	Precast.doPrecast(true);
	Pather.clearToExit(sdk.areas.DuranceofHateLvl2, sdk.areas.DuranceofHateLvl3, true);
	
	if (!me.inArea(sdk.areas.DuranceofHateLvl3)) {
		myPrint('Failed to move to mephisto');
		return false;
	}

	// Town stuff
	if (me.coldRes < 75 || me.poisonRes < 75) {
		Town.doChores(null, {thawing: me.coldRes < 75, antidote: me.poisonRes < 75});
		// Re-enter portal
		Pather.usePortal(sdk.areas.DuranceofHateLvl3, me.name);
		Precast.doPrecast(true);
	}

	let oldPickRange = Config.PickRange;
	let oldUseMerc = Config.MercWatch;

	if (me.mephisto) {
		Pather.moveTo(17587, 8069);
		delay(400);
	}

	Pather.moveTo(17563, 8072);

	Config.MercWatch = oldUseMerc ? false : oldUseMerc;

	Attack.killTarget(sdk.units.monsters.Mephisto);

	Config.MercWatch = oldUseMerc;
	// Reset to normal value
	Config.PickRange = oldPickRange;
	
	Pickit.pickItems();

	if (me.mephisto && !me.hell) {
		this.killCouncil();
	}

	Pather.moveTo(17581, 8070);
	delay(250 + me.ping * 2);
	Pather.useUnit(sdk.unittype.Object, sdk.units.portals.RedPortalToAct4, sdk.areas.PandemoniumFortress);
	Misc.poll(() => me.inArea(sdk.areas.PandemoniumFortress), 1000, 30);

	while (!me.gameReady) {
		delay(40);
	}

	return me.inArea(sdk.areas.PandemoniumFortress);
}
