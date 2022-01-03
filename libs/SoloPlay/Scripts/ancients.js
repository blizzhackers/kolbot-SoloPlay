/*
*	@filename	ancients.js
*	@author		isid0re, theBGuy
*	@desc		ancients quest
*/

function ancients () {
	// ancients resists
	let canAncients = function () {
		let ancient = getUnit(1);

		if (ancient) {
			do {
				if (!ancient.getParent() && !Attack.canAttack(ancient)) {
					return false;
				}
			} while (ancient.getNext());
		}

		return true;
	};

	// touch altar
	let touchAltar = function () {
		let tick = getTickCount();

		while (getTickCount() - tick < 5000) {
			if (getUnit(2, 546)) {
				break;
			}

			delay(20 + me.ping);
		}

		let altar = getUnit(2, 546);

		if (altar) {
			while (altar.mode !== 2) {
				Pather.moveToUnit(altar);
				altar.interact();
				delay(200 + me.ping);
				me.cancel();
			}

			return true;
		}

		return false;
	};

	// ancients prep
	let ancientsPrep = function () { 
		Town.goToTown();
		Town.fillTome(sdk.items.TomeofTownPortal);
		Town.buyPots(10, "Thawing");
		Town.drinkPots();
		Town.buyPots(10, "Antidote");
		Town.drinkPots();
		Town.buyPotions();
		Pather.usePortal(sdk.areas.ArreatSummit, me.name);
	};

	Town.townTasks();
	print('ÿc8Kolbot-SoloPlayÿc0: starting ancients');
	me.overhead("ancients");

	Pather.checkWP(sdk.areas.AncientsWay) ? Pather.useWaypoint(sdk.areas.AncientsWay) : Pather.getWP(sdk.areas.AncientsWay);
	Precast.doPrecast(true);
	Pather.clearToExit(sdk.areas.AncientsWay, sdk.areas.ArreatSummit, true); // enter Arreat Summit

	// failed to move to Arreat Summit
	if (me.area !== sdk.areas.ArreatSummit) {
		return false;
	}

	// ancients prep
	Town.townTasks();
	Town.buyPots(10, "Thawing");
	Town.drinkPots();
	Town.buyPots(10, "Antidote");
	Town.drinkPots();

	let tempConfig = Misc.copy(Config); // save and update config settings

	Config.TownCheck = false;
	Config.MercWatch = false;
	Config.TownHP = 0;
	Config.TownMP = 0;
	Config.HPBuffer = 15;
	Config.MPBuffer = 15;
	Config.LifeChicken = 10;
	Misc.updateConfig();
	me.overhead('updated settings');

	Town.buyPotions();
	if (!Pather.usePortal(sdk.areas.ArreatSummit, me.name)) {
		print("ÿc8Kolbot-SoloPlayÿc0: Failed to take portal back to Arreat Summit");
		Pather.clearToExit(sdk.areas.AncientsWay, sdk.areas.ArreatSummit, true); // enter Arreat Summit
	}
	
	Precast.doPrecast(true);

	// move to altar
	if (!Pather.moveToPreset(sdk.areas.ArreatSummit, sdk.unittype.Object, 546)) {
		print("ÿc8Kolbot-SoloPlayÿc0: Failed to move to ancients' altar");
	}

	touchAltar(); //activate altar

	// wait for ancients to spawn
	while (!getUnit(sdk.unittype.Monster, sdk.monsters.TalictheDefender)) {
		delay(250 + me.ping);
	}

	// reroll ancients if unable to attack
	while (!canAncients()) {
		Pather.makePortal(true);
		ancientsPrep();
		Pather.usePortal(sdk.areas.ArreatSummit, me.name);
		touchAltar();

		while (!getUnit(sdk.unittype.Monster, sdk.monsters.TalictheDefender)) {
			delay(10 + me.ping);
		}
	}

	for (let i = 0; i < 3 && !me.ancients; i++) {
		Attack.clearClassids(sdk.monsters.KorlictheProtector, sdk.monsters.TalictheDefender, sdk.monsters.MadawctheGuardian);
		Pather.moveTo(10048, 12628);

		if (!Misc.checkQuest(39, 0)) {
			me.overhead("Failed to kill anicents. Attempt: " + i);
			touchAltar(); //activate altar
		}
	}
	
	me.cancel();
	Config = tempConfig;
	Misc.updateConfig();
	me.overhead('restored settings');
	Precast.doPrecast(true);

	try {
		if (Misc.checkQuest(39, 0)) {
			Pather.clearToExit(sdk.areas.ArreatSummit, sdk.areas.WorldstoneLvl1, true);
			Pather.clearToExit(sdk.areas.WorldstoneLvl1, sdk.areas.WorldstoneLvl2, true);
			Pather.getWP(sdk.areas.WorldstoneLvl2);
		}
	} catch (err) {
		print('ÿc8Kolbot-SoloPlayÿc0: Cleared Ancients. Failed to get WSK Waypoint');
	}

	return true;
}
