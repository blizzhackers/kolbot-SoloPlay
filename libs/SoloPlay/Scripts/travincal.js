/*
*	@filename	travincal.js
*	@author		isid0re
*	@desc		travincal sequence for flail
*/

function travincal () {
	Quest.preReqs();
	Town.townTasks();
	print('ÿc8Kolbot-SoloPlayÿc0: starting travincal');
	me.overhead("travincal");

	if (!Pather.checkWP(sdk.areas.Travincal)) {
		Pather.getWP(sdk.areas.Travincal);
	} else {
		Pather.useWaypoint(sdk.areas.Travincal);
	}

	Precast.doPrecast(true);

	let council = {
		x: me.x + 76,
		y: me.y - 67
	};

	Pather.moveToUnit(council);
	Attack.killTarget("Ismail Vilehand");
	Pickit.pickItems();

	// go to orb
	if (!Pather.moveToPreset(sdk.areas.Travincal, 2, 404)) { 
		print('ÿc8Kolbot-SoloPlayÿc0: Failed to move to compelling orb');
	}

	Attack.clear(10); // clear area around orb

	// khalim's will quest not complete
	if (!me.travincal) {
		// cleared council didn't pick flail and hasn't already made flail
		if (!me.getItem(173) && !me.getItem(174)) { 
			let flail = getUnit(4, 173);

			Pather.moveToUnit(flail);
			Pickit.pickItems();
			Pather.moveToPreset(sdk.areas.Travincal, 2, 404);
		}

		// cube flail to will
		if (!me.getItem(174) && me.getItem(173)) { 
			Quest.cubeItems(174, 553, 554, 555, 173);
			delay(250 + me.ping);
		}

		// From SoloLeveling Commit eb818af
		if (!me.inTown && me.getItem(174)) {
			Town.goToTown();
		}

		// From SoloLeveling Commit eb818af
		//dual weild fix for assassin/barbarian
		if ([2, 69, 70].indexOf(Item.getEquippedItem(5).itemType) === -1) { 
			Item.removeItem(5);
		}

		Quest.equipItem(174, 4);
		delay(250 + me.ping);

		// return to Trav
		if (!Pather.usePortal(sdk.areas.Travincal, me.name)) { 
			print("ÿc8Kolbot-SoloPlayÿc0: Failed to go back to Travincal and smash orb");
		}

		Quest.smashSomething(404); // smash orb
		Item.autoEquip(); // equip previous weapon
		Town.doChores();

		// return to Trav
		if (!Pather.usePortal(sdk.areas.Travincal, me.name)) { 
			print("ÿc8Kolbot-SoloPlayÿc0: Failed to go back to Travincal and take entrance");
		}

		if (!Pather.moveToExit(sdk.areas.DuranceofHateLvl1, true)) {
			delay(250 + me.ping * 2);
			Pather.moveToExit(sdk.areas.DuranceofHateLvl1, true);
		}

		if (!Pather.checkWP(sdk.areas.DuranceofHateLvl2)) {
			Pather.getWP(sdk.areas.DuranceofHateLvl2);
		}
	}

	return true;
}
