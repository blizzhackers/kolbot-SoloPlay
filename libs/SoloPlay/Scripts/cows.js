/**
*	@filename	cows.js
*	@author		kolton, modified by isid0re and theBGuy for SoloPlay, leave if near cow king by theBGuy
*	@desc		clear the Moo Moo Farm without killing the Cow King
*/

function cows () {
	this.buildCowRooms = function () {
		let i, j, room, kingPreset, badRooms, badRooms2,
			finalRooms = [],
			indexes = [];

		kingPreset = getPresetUnit(sdk.areas.MooMooFarm, sdk.unittype.Monster, sdk.monsters.preset.TheCowKing);
		badRooms = getRoom(kingPreset.roomx * 5 + kingPreset.x, kingPreset.roomy * 5 + kingPreset.y).getNearby();

		for (i = 0; i < badRooms.length; i += 1) {
			badRooms2 = badRooms[i].getNearby();

			for (j = 0; j < badRooms2.length; j += 1) {
				if (indexes.indexOf(badRooms2[j].x + "" + badRooms2[j].y) === -1) {
					indexes.push(badRooms2[j].x + "" + badRooms2[j].y);
				}
			}
		}

		room = getRoom();

		do {
			if (indexes.indexOf(room.x + "" + room.y) === -1) {
				finalRooms.push([room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2]);
			}
		} while (room.getNext());

		return finalRooms;
	};

	this.clearCowLevel = function () {
		let room, result, myRoom,
			rooms = this.buildCowRooms();

		function RoomSort (a, b) {
			return getDistance(myRoom[0], myRoom[1], a[0], a[1]) - getDistance(myRoom[0], myRoom[1], b[0], b[1]);
		}

		while (rooms.length > 0) {
			if (!myRoom) {
				room = getRoom(me.x, me.y);
			}

			if (room) {
				if (room instanceof Array) {
					myRoom = [room[0], room[1]];
				} else {
					myRoom = [room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2];
				}
			}

			rooms.sort(RoomSort);
			room = rooms.shift();

			result = Pather.getNearestWalkable(room[0], room[1], 10, 2);

			if (result) {
				Pather.moveTo(result[0], result[1], 3);

				if (!Attack.clear(30)) {
					return false;
				}
			}
		}

		return true;
	};

	this.getLeg = function () {
		if (me.getItem(sdk.items.quest.WirtsLeg)) {
			return me.getItem(sdk.items.quest.WirtsLeg);
		}

		// Cain is incomplete, complete it then continue
		if (!me.tristram) {
			if (!isIncluded("SoloPlay/Scripts/tristram.js")) {
				include("SoloPlay/Scripts/tristram.js");
			}

			for (let i = 0; i < 5; i++) {
				tristram();

				if (me.tristram) {
					break;
				}
			}

			if (!me.inTown) {
				Town.goToTown();
			}
		}

		Pather.useWaypoint(sdk.areas.StonyField);
		Precast.doPrecast(true);
		Pather.moveToPreset(sdk.areas.StonyField, sdk.unittype.Monster, sdk.monsters.preset.Rakanishu, 8, 8);
		Pather.usePortal(sdk.areas.Tristram);

		if (me.area === sdk.areas.Tristram) {
			Pather.moveTo(25048, 5177);
			Quest.collectItem(sdk.items.quest.WirtsLeg, 268);
			Pickit.pickItems();
			Town.goToTown();
		} else {
			return false;
		}

		return me.getItem(sdk.items.quest.WirtsLeg);
	};

	this.openPortal = function (portalID, ...classIDS) {
		if (me.area !== sdk.areas.RogueEncampment) {
			Town.goToTown(1);
		}

		if (!Town.openStash()) {
			print('ÿc8Kolbot-SoloPlayÿc0: Failed to open stash. (openPortal)');
		}

		if (!Cubing.emptyCube()) {
			print('ÿc8Kolbot-SoloPlayÿc0: Failed to empty cube. (openPortal)');
		}

		if (!me.getItem(sdk.items.quest.WirtsLeg)) {
			return false;
		}

		let cubingItem;

		for (let classID of classIDS) {
			cubingItem = me.getItem(classID);

			if (!cubingItem || !Storage.Cube.MoveTo(cubingItem)) {
				return false;
			}
		}

		while (!Cubing.openCube()) {
			delay(1 + me.ping * 2);
			Packet.flash(me.gid);
		}

		let cowPortal;
		let tick = getTickCount();

		while (getTickCount() - tick < 5000) {
			if (Cubing.openCube()) {
				transmute();
				delay(750 + me.ping);
				cowPortal = Pather.getPortal(portalID);

				if (cowPortal) {
					break;
				}
			}
		}

		me.cancel();

		return true;
	};

	if (!me.diffCompleted) {
		print('ÿc8Kolbot-SoloPlayÿc0: Final quest incomplete, cannot make cows yet');
		return true;
	}

	// START
	Town.townTasks();
	print('ÿc8Kolbot-SoloPlayÿc0: starting cows');
	me.overhead("cows");

	if (!Pather.getPortal(sdk.areas.MooMooFarm) && !this.getLeg()) {
		return true;
	}
	
	Town.doChores();
	this.openPortal(sdk.areas.MooMooFarm, sdk.items.quest.WirtsLeg, sdk.items.TomeofTownPortal);
	Town.buyBook();

	if (Pather.canTeleport()) {
		Misc.getExpShrine([sdk.areas.StonyField, sdk.areas.DarkWood, sdk.areas.BlackMarsh]);
	} else {
		Misc.getExpShrine([sdk.areas.BloodMoor]);
	}
	
	Town.move("stash");

	if (Pather.usePortal(sdk.areas.MooMooFarm)) {
		Precast.doPrecast(true);
		this.clearCowLevel();
	}

	return true;
}
