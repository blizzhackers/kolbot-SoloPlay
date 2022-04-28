/*
*	@filename	andariel.js
*	@author		theBGuy
*	@desc		andariel quest.
*/

// todo: clean this up
function andariel () {
	Town.townTasks();
	myPrint('starting andy');

	if (me.normal && Misc.checkQuest(6, 1)) {
		Pather.changeAct();

		return true;
	}

	let questBug = (!me.normal && !me.andariel);

	Pather.checkWP(sdk.areas.CatacombsLvl2, true) ? Pather.useWaypoint(sdk.areas.CatacombsLvl2) : Pather.getWP(sdk.areas.CatacombsLvl2);
	Precast.doPrecast(true);
	Pather.moveToExit([sdk.areas.CatacombsLvl3, sdk.areas.CatacombsLvl4], true);

	if (me.poisonRes < 75) {
		Town.doChores(true, {thawing: me.coldRes < 75, antidote: true});
		Pather.usePortal(sdk.areas.CatacombsLvl4, me.name);
	}

	Precast.doPrecast(true);

	let oldPickRange = Config.PickRange;
	
	if (questBug) {
		Config.PickRange = -1;
		me.barbarian && (Config.FindItem = false);
	} else {
		Config.PickRange = 5;	// Only pick what is directly around me
	}

	let coords = [
		[22572, 9635], [22554, 9618],
		[22542, 9600], [22572, 9582],
		[22554, 9566]
	];

	if (Pather.useTeleport()) {
		Pather.moveTo(22571, 9590);
	} else {
		while (coords.length) {
			if (getUnit(1, 156) && Math.round(getDistance(me, getUnit(1, 156)) < 15)) {
				break;
			}
			Pather.moveTo(coords[0][0], coords[0][1]);
			Attack.clearClassids(61);
			coords.shift();
		}
	}
	
	Config.MercWatch = false;

	Attack.killTarget("Andariel");

	if (questBug) {
		Config.TownCheck = false;
		Config.MercWatch = false;
		Config.HealStatus = false;
		Config.UseMerc = false;
		Config.TownHP = 0;
		Config.TownMP = 0;
		Config.PickRange = -1;
		Misc.townEnabled = false;
		CharData.updateConfig();

		if (Pather.changeAct()) {
			delay(2000 + me.ping);

			// Now check my area
			if (me.act === 2) {
				// Act change sucessful, Andy has been bugged
				let result = (Misc.checkQuest(6, 15) ? 'Sucessful' : 'Unsucessful');
				myPrint("Andy bugged was " + result);
				scriptBroadcast('quit');
			}
		}
	}

	delay(2000 + me.ping); // Wait for minions to die.
	Config.PickRange = oldPickRange;	// Reset to normal value
	Pickit.pickItems();
	Config.MercWatch = true;

	!me.andariel && Pather.changeAct();

	return true;
}
