/*
*	@filename	ancients.js
*	@author		isid0re
*	@desc		ancients quest
*/

function ancients () {
	let canAncients = function () { // ancients resists
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

	let touchAltar = function () { // touch altar
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

	let ancientsPrep = function () { // ancients prep
		Town.goToTown(); // prep to revised settings
		Town.fillTome(518);
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

	if (!Pather.checkWP(sdk.areas.AncientsWay)) {
		Pather.getWP(sdk.areas.AncientsWay);
	} else {
		Pather.useWaypoint(sdk.areas.AncientsWay);
	}

	Precast.doPrecast(true);
	Pather.moveToExit(sdk.areas.ArreatSummit, true); // enter at ancients plateau

	Town.townTasks();
	Town.buyPots(10, "Thawing"); // prep to revised settings
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
	Pather.usePortal(sdk.areas.ArreatSummit, me.name);
	Precast.doPrecast(true);

	if (!Pather.moveToPreset(sdk.areas.ArreatSummit, 2, 546)) { // move to altar
		print("ÿc8Kolbot-SoloPlayÿc0: Failed to move to ancients' altar");
	}

	touchAltar(); //activate altar

	while (!getUnit(1, 541)) { //wait for ancients to spawn
		delay(250 + me.ping);
	}

	while (!canAncients()) {// reroll ancients if unable to attack
		Pather.makePortal(true);
		ancientsPrep();
		Pather.usePortal(sdk.areas.ArreatSummit, me.name);
		touchAltar();

		while (!getUnit(1, 542)) {
			delay(10 + me.ping);
		}
	}

	for (let i = 0; i < 3 && !me.ancients; i++) {
		Attack.clear(50);
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
