/**
*  @filename    travincal.js
*  @author      isid0re, theBGuy
*  @desc        travincal sequence for flail
*
*/

function travincal () {
	Quest.preReqs();
	Town.townTasks();
	myPrint("starting travincal");

	Pather.checkWP(sdk.areas.Travincal, true) ? Pather.useWaypoint(sdk.areas.Travincal) : Pather.getWP(sdk.areas.Travincal);
	Precast.doPrecast(true);

	let council = {
		x: me.x + 76,
		y: me.y - 67
	};

	Pather.moveToUnit(council);
	Attack.killTarget("Ismail Vilehand");
	Pickit.pickItems();

	// go to orb
	if (!Pather.moveToPreset(sdk.areas.Travincal, sdk.unittype.Object, sdk.units.CompellingOrb)) {
		console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to move to compelling orb");
	}

	let orb = Game.getObject(sdk.units.CompellingOrb);
	!!orb && Attack.clearPos(orb.x, orb.y, 15);

	// khalim's will quest not complete
	if (!me.travincal) {
		// cleared council didn't pick flail and hasn't already made flail
		if (!me.getItem(sdk.items.quest.KhalimsFlail) && !me.getItem(sdk.items.quest.KhalimsWill)) {
			let flail = Game.getItem(sdk.items.quest.KhalimsFlail);

			Pather.moveToUnit(flail);
			Pickit.pickItems();
			Pather.moveToPreset(sdk.areas.Travincal, sdk.unittype.Object, sdk.units.CompellingOrb);
		}

		// cube flail to will
		if (!me.getItem(sdk.items.quest.KhalimsWill) && me.getItem(sdk.items.quest.KhalimsFlail)) {
			Quest.cubeItems(sdk.items.quest.KhalimsWill,
				sdk.quest.item.KhalimsEye, sdk.quest.item.KhalimsHeart, sdk.quest.item.KhalimsBrain, sdk.quest.item.KhalimsFlail);
			delay(250 + me.ping);
		}

		// From SoloLeveling Commit eb818af
		if (!me.inTown && me.getItem(sdk.items.quest.KhalimsWill)) {
			Town.goToTown();
		}

		Quest.equipItem(sdk.items.quest.KhalimsWill, 4);
		delay(250 + me.ping);

		// return to Trav
		if (!Pather.usePortal(sdk.areas.Travincal, me.name)) {
			console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to go back to Travincal and smash orb");
		}

		Quest.smashSomething(sdk.units.CompellingOrb);
		Item.autoEquip(); // equip previous weapon
		Town.townTasks();

		// return to Trav
		if (!Pather.usePortal(sdk.areas.Travincal, me.name)) {
			console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to go back to Travincal and take entrance");
			Pather.useWaypoint(sdk.areas.Travincal);
			Pather.moveToPreset(sdk.areas.Travincal, sdk.unittype.Object, sdk.units.CompellingOrb);
		}

		// Wait until exit pops open
		Misc.poll(() => Game.getObject(sdk.units.DuranceEntryStairs).mode === sdk.units.objects.mode.Active, 10000);
		// Move close to the exit
		let exit_1 = Game.getObject(sdk.units.DuranceEntryStairs);
		// Since d2 sucks, move around the thingy
		Pather.moveToUnit(exit_1, 7, 7);
		// keep on clicking the exit until we are not @ travincal anymore
		Misc.poll(function () {
			if (me.area === sdk.areas.Travincal) {
				Pather.moveToUnit(exit_1);
				Misc.click(2, 0, exit_1);
			}
			return me.area === sdk.areas.DuranceofHateLvl1;
		}, 10000, 40);
		if (me.area !== sdk.areas.DuranceofHateLvl1) {
			Pather.moveToExit([sdk.areas.DuranceofHateLvl1, sdk.areas.DuranceofHateLvl2]);
		} else {
			Pather.journeyTo(sdk.areas.DuranceofHateLvl2);
		}
		Pather.getWP(sdk.areas.DuranceofHateLvl2);
		Pather.useWaypoint(sdk.areas.KurastDocktown);

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
