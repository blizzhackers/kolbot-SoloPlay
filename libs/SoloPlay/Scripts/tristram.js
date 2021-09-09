/*
*	@filename	Tristram.js
*	@author		isid0re, theBGuy
*	@desc		rescue cain and leveling
*/

function tristram () {
	let spots = [
		[25176, 5128], [25175, 5145], [25171, 5159], [25166, 5178],
		[25173, 5192], [25153, 5198], [25136, 5189], [25127, 5167],
		[25120, 5148], [25101, 5136], [25119, 5106], [25121, 5080],
		[25119, 5061], [4933, 4363]
	];

	Town.townTasks();
	print('ÿc8Kolbot-SoloPlayÿc0: starting tristram');
	me.overhead("tristram");

	if (!Misc.checkQuest(4, 4) && !me.getItem(525)) { // missing task or key
		if (!me.getItem(524)) { // missing scroll 
			if (!Pather.checkWP(6)) {
				Pather.getWP(6);
				Pather.useWaypoint(5);
			} else {
				Pather.useWaypoint(5);
			}

			Precast.doPrecast(true);

			if (!Pather.moveToPreset(5, 2, 30, 5, 5)) {
				print("ÿc8Kolbot-SoloPlayÿc0: Failed to move to Tree of Inifuss");
			}

			Quest.collectItem(524, 30);
			Pickit.pickItems();
		}

		if (me.getItem(524)) {
			Town.npcInteract("akara");
		}
	}

	if (!Pather.checkWP(4)) {
		Pather.getWP(4);
	} else {
		Pather.useWaypoint(4);
	}

	Precast.doPrecast(true);
	Pather.moveToPreset(4, 1, 737, 10, 10, false, true);
	Attack.killTarget(getLocaleString(2872)); // Rakanishu
	Pather.moveToPreset(4, 2, 17, null, null, true);

	if (!Misc.checkQuest(4, 4)) {
		try { // go to tristram @jaenster
			let stones = [
				getUnit(2, 17),
				getUnit(2, 18),
				getUnit(2, 19),
				getUnit(2, 20),
				getUnit(2, 21)
			];

			while (stones.some(function (stone) { return !stone.mode; })) {
				for (var i = 0, stone = void 0; i < stones.length; i++) {
					stone = stones[i];
					Misc.openChest(stone);
					Attack.securePosition(me.x, me.y, 10, 0);
					delay(10);
				}
			}

			while (!Pather.usePortal(38)) {
				Attack.securePosition(me.x, me.y, 10, 1000);
			}
		} catch (err) {
			Pather.usePortal(38);
		}
	} else {
		Pather.usePortal(38);
	}

	if (me.area === 38) {
		if (!me.tristram) {
			let clearCoords = [
				{"x":25166,"y":5108,"radius":10},
				{"x":25164,"y":5115,"radius":10},
				{"x":25163,"y":5121,"radius":10},
				{"x":25158,"y":5126,"radius":10},
				{"x":25151,"y":5125,"radius":10},
				{"x":25145,"y":5129,"radius":10},
				{"x":25142,"y":5135,"radius":10}
			];
        	Attack.clearCoordList(clearCoords);

			let gibbet = getUnit(2, 26);

			if (gibbet && !gibbet.mode) {
				Pather.moveTo(gibbet.x, gibbet.y);
				Misc.openChest(gibbet);
			}

			Town.npcInteract("akara");
			Pather.usePortal(38, me.name);
		}

		Attack.clearLocations(spots);
	}

	return true;
}
