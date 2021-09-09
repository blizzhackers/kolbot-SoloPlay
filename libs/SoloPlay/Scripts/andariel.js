/*
*	@filename	andariel.js
*	@author		isid0re, theBGuy
*	@desc		andariel quest.
*/

function andariel () {
	Town.townTasks();
	print('ÿc8Kolbot-SoloPlayÿc0: starting andy');
	me.overhead("andy");

	if (me.normal && Misc.checkQuest(6, 1)) {
		Pather.changeAct();

		return true;
	}

	let questBug = (!me.normal && !me.andariel);

	if (!Pather.checkWP(35)) {
		Pather.getWP(35);
	} else {
		Pather.useWaypoint(35);
	}

	Precast.doPrecast(true);
	Pather.moveToExit([36, 37], true);

	if (Check.Resistance().PR < 75 + me.getStat(46)) {
		Town.doChores();
		Town.buyPots(10, "Antidote"); // antidote
		Town.drinkPots();
		Pather.usePortal(37, me.name);
	}

	Precast.doPrecast(true);

	let oldPickRange = Config.PickRange;
	
	if (questBug) {
		Config.PickRange = -1;

		if (me.barbarian) {
			Config.FindItem = false;
		}
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
		let tempConfig = Misc.copy(Config); // save and update config settings
		let updateConfig = {
			TownCheck: false,
			MercWatch: false,
			HealStatus: false,
			TownHP: 0,
			TownMP: 0,
			PickRange: -1
		};

		Misc.townEnabled = false;
		Object.assign(Config, updateConfig);

		if (Pather.changeAct()) {
			delay(2000 + me.ping);

			// Now check my area
			if (me.act === 2) {
				// Act change sucessful, Andy has been bugged
				print("ÿc8Kolbot-SoloPlayÿc0: Andy bugged, leaving game to ensure it stays that way");
				me.overhead("Andy bugged, leaving game to ensure it stays that way");
				scriptBroadcast('quit');
			}
		}
	}

	delay(2000 + me.ping); // Wait for minions to die.
	Config.PickRange = oldPickRange;	// Reset to normal value
	Pickit.pickItems();
	Config.MercWatch = true;

	if (!me.andariel) {
		Pather.changeAct();
	}

	return true;
}
