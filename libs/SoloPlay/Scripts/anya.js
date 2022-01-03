/*
*	@filename	anya.js
*	@author		isid0re, theBGuy
*	@desc		Anya rescue from frozen river
*/

function anya () {
	Town.townTasks();
	print('ÿc8Kolbot-SoloPlayÿc0: starting anya');
	me.overhead("anya");

	if (!me.anya) {
		Pather.checkWP(sdk.areas.CrystalizedPassage, true) ? Pather.useWaypoint(sdk.areas.CrystalizedPassage) : Pather.getWP(sdk.areas.CrystalizedPassage);
		Precast.doPrecast(true);
		Pather.clearToExit(sdk.areas.CrystalizedPassage, sdk.areas.FrozenRiver, Pather.useTeleport());

		if (!Pather.moveToPreset(me.area, 2, 460)) {
			print("ÿc8Kolbot-SoloPlayÿc0: Failed to move to Anya");
			return false;
		}

		let frozenanya = getUnit(2, 558);

		if (frozenanya) {
			Pather.moveToUnit(frozenanya);
			sendPacket(1, 0x13, 4, 0x2, 4, frozenanya.gid);
			delay(1200 + me.ping);
			me.cancel();
		}

		Town.npcInteract("malah");
		Town.doChores();
		Pather.usePortal(sdk.areas.FrozenRiver, me.name);

		frozenanya = getUnit(2, 558);	// Check again in case she's no longer there from first intereaction

		if (frozenanya) {
			while (!frozenanya.mode) {
				sendPacket(1, 0x13, 4, 0x2, 4, frozenanya.gid);
				delay(300 + me.ping);
			}
		}

		Town.npcInteract("malah");
		Town.unfinishedQuests();
		Town.doChores();
		Town.npcInteract("anya");
	}

	if (me.anya) {
		if (!Pather.getPortal(sdk.areas.NihlathaksTemple)) {
			Town.npcInteract("anya");
		}

		if (!Pather.usePortal(sdk.areas.NihlathaksTemple)) {
			return true;
		}

		Precast.doPrecast(true);
		Pather.moveTo(10058, 13234);
		Attack.killTarget(getLocaleString(22497)); // pindleskin
		Pickit.pickItems();
	}

	return true;
}
