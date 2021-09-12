/**
*	@filename	orgtorch.js
*	@author		kolton, theBGuy (modified for Kolbot-SoloPlay)
*	@desc		Convert keys to organs and organs to torches.
*	@notes		Search for the word "Start" and follow the comments if you want to know what this script does and when.
*/

function orgtorch() {
	this.doneAreas = [];

	// Identify & mule
	this.checkTorch = function () {
		if (me.area === 136) {
			Pather.moveTo(25105, 5140);
			Pather.usePortal(109);
		}

		Town.doChores();

		let torch = me.findItem(604, 0, null, 7);

		if (!torch || torch === undefined) {
			return false;
		}

		if (!torch.getFlag(0x10)) {
			Town.identify();
		}

		for (let i = 0; i < 7; i++) {
			if (torch.getStat(83, i)) {
				Events.sendToList({profile: me.profile, ladder: me.ladder, torchType: i});

				return true;
			}
		}

		return false;
	};

	// Check whether the killer is alone in the game
	this.aloneInGame = function () {
		var party = getParty();

		if (party) {
			do {
				if (party.name !== me.name) {
					return false;
				}
			} while (party.getNext());
		}

		return true;
	};

	// Try to lure a monster - wait until it's close enough
	this.lure = function (bossId) {
		var tick,
			unit = getUnit(1, bossId);

		if (unit) {
			tick = getTickCount();

			while (getTickCount() - tick < 2000) {
				if (getDistance(me, unit) <= 10) {
					return true;
				}

				delay(50);
			}
		}

		return false;
	};

	// Check if we have complete sets of organs
	this.completeSetCheck = function () {
		var horns = me.findItems("dhn"),
			brains = me.findItems("mbr"),
			eyes = me.findItems("bey");

		if (!horns || !brains || !eyes) {
			return false;
		}

		// We just need one set to make a torch
		return horns.length && brains.length && eyes.length;
	};

	// Get fade in River of Flames
	this.getFade = function () {
		if (Check.haveItem("sword", "runeword", "Last Wish") || Check.haveItem("armor", "runeword", "Treachery")) {
			if (!me.getState(159)) {
				print("ÿc8Kolbot-SoloPlayÿc0: Getting Fade");
				Pather.useWaypoint(107);
				Precast.doPrecast(true);
				Pather.moveTo(7811, 5872);

				if (me.classid === 3 && me.getSkill(125, 1)) {
					Skill.setSkill(125, 0);
				}

				while (!me.getState(159)) {
					delay(100);
				}

				print("ÿc8Kolbot-SoloPlayÿc0: Fade Achieved.");
			}
		}

		return true;
	};

	// Open a red portal. Mode 0 = mini ubers, mode 1 = Tristram
	this.openPortal = function (mode) {
		var portal,
			item1 = mode === 0 ? me.findItem("pk1", 0) : me.findItem("dhn", 0),
			item2 = mode === 0 ? me.findItem("pk2", 0) : me.findItem("bey", 0),
			item3 = mode === 0 ? me.findItem("pk3", 0) : me.findItem("mbr", 0);

		Town.goToTown(5);
		Town.doChores();

		if (Town.openStash() && Cubing.emptyCube()) {
			if (!Storage.Cube.MoveTo(item1) || !Storage.Cube.MoveTo(item2) || !Storage.Cube.MoveTo(item3)) {
				return false;
			}

			if (!Cubing.openCube()) {
				return false;
			}

			transmute();
			delay(1000);

			portal = getUnit(2, "portal");

			if (portal) {
				do {
					switch (mode) {
					case 0:
						if ([133, 134, 135].indexOf(portal.objtype) > -1 && this.doneAreas.indexOf(portal.objtype) === -1) {
							this.doneAreas.push(portal.objtype);

							return copyUnit(portal);
						}

						break;
					case 1:
						if (portal.objtype === 136) {
							return copyUnit(portal);
						}

						break;
					}
				} while (portal.getNext());
			}
		}

		return false;
	};

	// Do mini ubers or Tristram based on area we're already in
	this.pandemoniumRun = function () {
		let i, findLoc, skillBackup;

		switch (me.area) {
		case 133: // Matron's Den
			Precast.doPrecast(true);
			Pather.moveToPreset(133, 2, 397, 2, 2);
			Attack.killTarget(707);
			Pickit.pickItems();
			Town.goToTown();

			break;
		case 134: // Forgotten Sands
			Precast.doPrecast(true);

			findLoc = [20196, 8694, 20308, 8588, 20187, 8639, 20100, 8550, 20103, 8688, 20144, 8709, 20263, 8811, 20247, 8665];

			for (i = 0; i < findLoc.length; i += 2) {
				Pather.moveTo(findLoc[i], findLoc[i + 1]);
				delay(500);

				if (getUnit(1, 708)) {
					break;
				}
			}

			Attack.killTarget(708);
			Pickit.pickItems();
			Town.goToTown();

			break;
		case 135: // Furnace of Pain
			Precast.doPrecast(true);
			Pather.moveToPreset(135, 2, 397, 2, 2);
			Attack.killTarget(706);
			Pickit.pickItems();
			Town.goToTown();

			break;
		case 136: // Tristram
			Pather.moveTo(25068, 5078);
			Precast.doPrecast(true);

			findLoc = [25040, 5101, 25040, 5166, 25122, 5170];

			for (i = 0; i < findLoc.length; i += 2) {
				Pather.moveTo(findLoc[i], findLoc[i + 1]);
			}

			if (me.paladin && me.getSkill(125, 1)) {
				Skill.setSkill(125, 0);
			}

			this.lure(704);
			Pather.moveTo(25129, 5198);
			
			if (me.paladin && me.getSkill(125, 1)) {
				Skill.setSkill(125, 0);
			}

			this.lure(704);

			if (!getUnit(1, 704)) {
				Pather.moveTo(25122, 5170);
			}

			/*if (me.paladin && me.getSkill(125, 1)) {
				skillBackup = Config.AttackSkill[2];
				Config.AttackSkill[2] = 125;

				Attack.init();
			}*/

			Attack.killTarget(704);

			/*if (skillBackup && me.classid === 3 && me.getSkill(125, 1)) {
				Config.AttackSkill[2] = skillBackup;

				Attack.init();
			}*/

			Pather.moveTo(25162, 5141);
			delay(3250);

			if (!getUnit(1, 709)) {
				Pather.moveTo(25122, 5170);
			}

			Attack.killTarget(709);

			if (!getUnit(1, 705)) {
				Pather.moveTo(25122, 5170);
			}

			Attack.killTarget(705);
			Pickit.pickItems();
			this.checkTorch();

			break;
		}
	};

	this.juvCheck = function () {
		var i,
			needJuvs = 0,
			col = Town.checkColumns(Storage.BeltSize());

		for (i = 0; i < 4; i += 1) {
			if (Config.BeltColumn[i] === "rv") {
				needJuvs += col[i];
			}
		}

		print("Need " + needJuvs + " juvs.");

		return needJuvs;
	};

	// Start
	var i, portal, tkeys, hkeys, dkeys, brains, eyes, horns, timer, farmer, busy, busyTick, chugs,
		neededItems = {pk1: 0, pk2: 0, pk3: 0, rv: 0};

	// Do town chores and quit if MakeTorch is true and we have a torch.
	this.checkTorch();

	// Count keys and organs
	tkeys = me.findItems("pk1", 0).length || 0;
	hkeys = me.findItems("pk2", 0).length || 0;
	dkeys = me.findItems("pk3", 0).length || 0;
	brains = me.findItems("mbr", 0).length || 0;
	eyes = me.findItems("bey", 0).length || 0;
	horns = me.findItems("dhn", 0).length || 0;

	// End the script if we don't have enough keys nor organs
	if ((tkeys < 3 || hkeys < 3 || dkeys < 3) && (brains < 1 || eyes < 1 || horns < 1)) {
		print("ÿc8Kolbot-SoloPlayÿc0: Not enough keys or organs.");

		return true;
	}

	Config.UseMerc = false;

	// We have enough keys, do mini ubers
	if (tkeys >= 3 && hkeys >= 3 && dkeys >= 3) {
		this.getFade();
		print("ÿc8Kolbot-SoloPlayÿc0: Making organs.");
		D2Bot.printToConsole("ÿc8Kolbot-SoloPlayÿc0 :: OrgTorch: Making organs.", 8);

		for (i = 0; i < 3; i += 1) {
			// Abort if we have a complete set of organs
			// check after at least one portal is made
			if (i > 0 && this.completeSetCheck()) {
				break;
			}

			portal = this.openPortal(0);

			if (portal) {
				switch (portal.objtype) {
				case 133: 	// Matron's
					Town.buyPots(10, "Thawing"); // thawing
					Town.drinkPots();
					Town.buyPots(10, "Antidote"); // antidote
					Town.drinkPots();
					Town.buyPots(10, "Antidote"); // antidote	// Double stack to ensure it lasts
					Town.drinkPots();

					break;
				case 134: 	// Sand's
					Town.buyPots(10, "Thawing"); // thawing
					Town.drinkPots();

					break;
				case 135: 	// Furnace
					Town.buyPots(10, "Thawing"); // thawing
					Town.drinkPots();
					Town.buyPots(10, "Antidote"); // antidote
					Town.drinkPots();

					break;
				}

				Town.move("stash");
				Pather.usePortal(null, null, portal);
			}

			this.pandemoniumRun();
		}
	}

	// Don't make torches if not configured to OR if the char already has one
	if (this.checkTorch()) {
		return true;
	}

	// Count organs
	brains = me.findItems("mbr", 0).length || 0;
	eyes = me.findItems("bey", 0).length || 0;
	horns = me.findItems("dhn", 0).length || 0;

	// We have enough organs, do Tristram
	if (brains && eyes && horns) {
		this.getFade();
		print("ÿc8Kolbot-SoloPlayÿc0: Making torch");
		D2Bot.printToConsole("ÿc8Kolbot-SoloPlayÿc0 :: OrgTorch: Making torch.", 8);

		portal = this.openPortal(1);

		if (portal) {
			Pather.usePortal(null, null, portal);
		}

		this.pandemoniumRun();
	}

	return true;
}
