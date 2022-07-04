/**
*  @filename    tristram.js
*  @author      theBGuy
*  @credit      sonic, autosmurf
*  @desc        rescue cain and leveling
*
*/

function tristram () {
	let spots = [
		[25176, 5128], [25175, 5145], [25171, 5159], [25166, 5178],
		[25173, 5192], [25153, 5198], [25136, 5189], [25127, 5167],
		[25120, 5148], [25101, 5136], [25119, 5106], [25121, 5080],
		[25119, 5061], [4933, 4363]
	];

	Town.townTasks();
	myPrint('starting tristram');

	// Tristram portal hasn't been opened
	if (!Misc.checkQuest(4, 4)) {
		// missing scroll and key
		if (!me.getItem(sdk.items.quest.ScrollofInifuss) && !me.getItem(sdk.items.quest.KeytotheCairnStones)) {
			if (!Pather.checkWP(sdk.areas.BlackMarsh, true)) {
				Pather.getWP(sdk.areas.BlackMarsh);
				Pather.useWaypoint(sdk.areas.DarkWood);
			} else {
				Pather.useWaypoint(sdk.areas.DarkWood);
			}

			Precast.doPrecast(true);

			if (!Pather.moveToPreset(sdk.areas.DarkWood, 2, 30, 5, 5)) {
				print("ÿc8Kolbot-SoloPlayÿc0: Failed to move to Tree of Inifuss");
				return false;
			}

			Quest.collectItem(524, 30);
			Pickit.pickItems();
		}

		if (me.getItem(sdk.items.quest.ScrollofInifuss)) {
			if (!me.inTown) {
				Town.goToTown();
			}

			Town.npcInteract("akara");
		}
	}

	Pather.checkWP(sdk.areas.StonyField, true) ? Pather.useWaypoint(sdk.areas.StonyField) : Pather.getWP(sdk.areas.StonyField);
	Precast.doPrecast(true);
	Pather.moveToPreset(sdk.areas.StonyField, 1, 737, 10, 10, false, true);
	Attack.killTarget(getLocaleString(2872)); // Rakanishu
	Pather.moveToPreset(sdk.areas.StonyField, 2, 17, null, null, true);

	if (!Misc.checkQuest(4, 4) && me.getItem(sdk.items.quest.KeytotheCairnStones)) {
		try {
			let stones = [
				object(sdk.quest.chest.StoneAlpha),
				object(sdk.quest.chest.StoneBeta),
				object(sdk.quest.chest.StoneGamma),
				object(sdk.quest.chest.StoneDelta),
				object(sdk.quest.chest.StoneLambda)
			];

			while (stones.some((stone) => !stone.mode)) {
				for (let i = 0; i < stones.length; i++) {
					let stone = stones[i];

					if (Misc.openChest(stone)) {
						stones.splice(i, 1);
						i--;
					}
					Attack.securePosition(me.x, me.y, 10, 0);
					delay(10);
				}
			}

			let tick = getTickCount();
			// wait up to two minutes
			while (getTickCount() - tick < 60 * 1000 * 2) {
				if (Pather.usePortal(sdk.areas.Tristram)) {
					break;
				}
				Attack.securePosition(me.x, me.y, 10, 1000);
			}
		} catch (err) {
			Pather.usePortal(sdk.areas.Tristram);
		}
	} else {
		Pather.usePortal(sdk.areas.Tristram);
	}

	if (me.area === sdk.areas.Tristram) {
		if (!me.tristram) {
			let clearCoords = [
				{"x": 25166, "y": 5108, "radius": 10},
				{"x": 25164, "y": 5115, "radius": 10},
				{"x": 25163, "y": 5121, "radius": 10},
				{"x": 25158, "y": 5126, "radius": 10},
				{"x": 25151, "y": 5125, "radius": 10},
				{"x": 25145, "y": 5129, "radius": 10},
				{"x": 25142, "y": 5135, "radius": 10}
			];
			Attack.clearCoordList(clearCoords);

			let gibbet = getUnit(2, 26);

			if (gibbet && !gibbet.mode) {
				Pather.moveTo(gibbet.x, gibbet.y);
				Misc.openChest(gibbet);
			}

			Town.npcInteract("akara");
			Pather.usePortal(sdk.areas.Tristram, me.name);
		}

		Attack.clearLocations(spots);
	}

	return true;
}
