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

	let questBug = false;
	if (!me.normal && !me.andariel) {
		questBug = true;
	}

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
	
	if (questBug) {
		Config.PickRange = -1;

		if (me.barbarian) {
			Config.FindItem = false;
		}
	}

	Pather.moveTo(22572, 9635);
	Pather.moveTo(22554, 9618);
	Pather.moveTo(22542, 9600);
	Pather.moveTo(22572, 9582);
	Pather.moveTo(22554, 9566);
	Pather.moveTo(22546, 9554);
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
	Pickit.pickItems();
	Config.MercWatch = true;

	if (!me.andariel) {
		Pather.changeAct();
	}

	return true;
}
