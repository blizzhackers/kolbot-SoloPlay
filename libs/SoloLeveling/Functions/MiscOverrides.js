/*
*	@filename	MiscOverrides.js
*	@author		isid0re
*	@desc		Misc.js fixes to improve functionality and Merc Hiring/Autoequip
*/

if (!isIncluded("common/Misc.js")) {
	include("common/Misc.js");
}

if (!isIncluded("SoloLeveling/Tools/Developer.js")) {
	include("SoloLeveling/Tools/Developer.js");
}

// Cast a skill on self, Unit or coords. Always use packet casting for caster skills becasue it's more stable.
if (Developer.forcePacketCasting) {
	Skill.cast = function (skillId, hand, x, y, item) {
		var casterSkills = [36, 38, 39, 44, 45, 47, 48, 49, 53, 54, 55, 56, 59, 64, 67, 84, 87, 92, 93, 101, 112, 121, 130, 137, 138, 146, 149, 154, 155, 225, 229, 230, 234, 240, 244, 245, 249, 250, 251, 256, 261, 262, 271, 276];

		if (me.inTown && !this.townSkill(skillId)) {
			return false;
		}

		if (!item && !me.getSkill(skillId, 1)) {
			return false;
		}

		if (!this.wereFormCheck(skillId)) {
			return false;
		}

		// Check mana cost, charged skills don't use mana
		if (!item && this.getManaCost(skillId) > me.mp) {
			// Maybe delay on ALL skills that we don't have enough mana for?
			if (Config.AttackSkill.concat([42, 54]).concat(Config.LowManaSkill).indexOf(skillId) > -1) {
				delay(300);
			}

			return false;
		}

		if (skillId === undefined) {
			throw new Error("Skill.cast: Must supply a skill ID");
		}

		var i, n, clickType, shift;

		if (hand === undefined) {
			hand = 0;
		}

		if (x === undefined) {
			x = me.x;
		}

		if (y === undefined) {
			y = me.y;
		}

		if (!this.setSkill(skillId, hand, item)) {
			return false;
		}

		if ((casterSkills.indexOf(skillId) > -1) || Config.PacketCasting > 1) {
			switch (typeof x) {
			case "number":
				Packet.castSkill(hand, x, y);
				delay(250);

				break;
			case "object":
				Packet.unitCast(hand, x);
				delay(250);

				break;
			}
		} else {
			switch (hand) {
			case 0: // Right hand + No Shift
				clickType = 3;
				shift = 0;

				break;
			case 1: // Left hand + Shift
				clickType = 0;
				shift = 1;

				break;
			case 2: // Left hand + No Shift
				clickType = 0;
				shift = 0;

				break;
			case 3: // Right hand + Shift
				clickType = 3;
				shift = 1;

				break;
			}

			MainLoop:
			for (n = 0; n < 3; n += 1) {
				if (typeof x === "object") {
					clickMap(clickType, shift, x);
				} else {
					clickMap(clickType, shift, x, y);
				}

				delay(20);

				if (typeof x === "object") {
					clickMap(clickType + 2, shift, x);
				} else {
					clickMap(clickType + 2, shift, x, y);
				}

				for (i = 0; i < 8; i += 1) {
					if (me.attacking) {
						break MainLoop;
					}

					delay(20);
				}
			}

			while (me.attacking) {
				delay(10);
			}
		}

		if (this.isTimed(skillId)) { // account for lag, state 121 doesn't kick in immediately
			for (i = 0; i < 10; i += 1) {
				if ([4, 9].indexOf(me.mode) > -1) {
					break;
				}

				if (me.getState(121)) {
					break;
				}

				delay(10);
			}
		}

		return true;
	};
}

Skill.getRange = function (skillId) {
	switch (skillId) {
	case 0: // Normal Attack
		return Attack.usingBow() ? 20 : 3;
	case 1: // Kick
	case 5: // Left Hand Swing
	case 10: // Jab
	case 14: // Power Strike
	case 19: // Impale
	case 24: // Charged Strike
	case 30: // Fend
	case 34: // Lightning Strike
	case 46: // Blaze
	case 73: // Poison Dagger
	case 96: // Sacrifice
	case 97: // Smite
	case 106: // Zeal
	case 111: // Vengeance
	case 112: // Blessed Hammer
	case 116: // Conversion
	case 126: // Bash
	case 131: // Find Potion
	case 133: // Double Swing
	case 139: // Stun
	case 142: // Find Item
	case 144: // Concentrate
	case 147: // Frenzy
	case 150: // Grim Ward
	case 152: // Berserk
	case 232: // Feral Rage
	case 233: // Maul
	case 238: // Rabies
	case 239: // Fire Claws
	case 242: // Hunger
	case 248: // Fury
	case 255: // Dragon Talon
	case 260: // Dragon Claw
	case 270: // Dragon Tail
		return 3;
	case 146: // Battle Cry
	case 154: // War Cry
		return 4;
	case 44: // Frost Nova
	case 240: // Twister
	case 245: // Tornado
	case 500: // Summoner
		return 5;
	case 38: // Charged Bolt
		if (this.usePvpRange) {
			return 11;
		}

		return 6;
	case 48: // Nova
	case 151: // Whirlwind
		return 7;
	case 92: // Poison Nova
		return 8;
	case 249: // Armageddon
		return 9;
	case 15: // Poison Javelin
	case 25: // Plague Javelin
	case 101: // Holy Bolt
	case 107: // Charge
	case 130: // Howl
	case 225: // Firestorm
	case 229: // Molten Boulder
	case 243: // Shock Wave
		return 10;
	case 8: // Inner Sight
	case 17: // Slow Missiles
		return 13;
	case 35: // Lightning Fury
	case 64: // Frozen Orb
	case 67: // Teeth
	case 234: // Fissure
	case 244: // Volcano
	case 251: // Fire Blast
	case 256: // Shock Web
	case 257: // Blade Sentinel
	case 266: // Blade Fury
		return 15;
	case 7: // Fire Arrow
	case 12: // Multiple Shot
	case 16: // Exploding Arrow
	case 22: // Guided Arrow
	case 27: // Immolation Arrow
	case 31: // Freezing Arrow
	case 95: // Revive
	case 121: // Fist of the Heavens
	case 140: // Double Throw
	case 253: // Psychic Hammer
	case 275: // Dragon Flight
		return 20;
	case 91: // Lower Resist
		return 50;
	// Variable range
	case 42: // Static Field
		return Math.floor((me.getSkill(42, 1) + 4) * 2 / 3);
	case 132: // Leap
		var leap = [4, 7, 8, 10, 11, 12, 12, 13, 14, 14, 14, 14, 15, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 17];

		return leap[Math.min(me.getSkill(132, 1) - 1, 24)];
	case 230: // Arctic Blast
		var arctic = [5, 6, 6, 6, 6, 7, 7, 8, 8, 8, 8, 9, 9, 10, 10, 10, 10, 11, 11, 12];

		return arctic[Math.min(me.getSkill(230, 1) - 1, 19)];
	case 49: // Lightning
	case 84: // Bone Spear
	case 93: // Bone Spirit
		if (this.usePvpRange) {
			return 30;
		}

		return 15;
	case 47: // Fire Ball
	case 51: // Fire Wall
	case 53: // Chain Lightning
	case 56: // Meteor
	case 59: // Blizzard
	case 273: // Mind Blast
		if (this.usePvpRange) {
			return 30;
		}

		return 20;
	}

	// Every other skill
	if (this.usePvpRange) {
		return 30;
	}

	return 20;
};

Misc.checkQuest = function (id, state) {
	sendPacket(1, 0x40);
	delay(500 + me.ping);

	return me.getQuest(id, state);
};

Misc.townCheck = function () {
	var i, potion, check,
		needhp = true,
		needmp = true;

	// Can't tp from uber trist or when dead
	if (me.area === 136 || me.dead) {
		return false;
	}

	if (Config.TownCheck && !me.inTown) {
		try {
			if (me.charlvl > 2 && me.gold > 500) {
				for (i = 0; i < 4; i += 1) {
					if (Config.BeltColumn[i] === "hp" && Config.MinColumn[i] > 0) {
						potion = me.getItem(-1, 2); // belt item

						if (potion) {
							do {
								if (potion.code.indexOf("hp") > -1) {
									needhp = false;

									break;
								}
							} while (potion.getNext());
						}

						if (needhp) {
							print("We need healing potions");

							check = true;
						}
					}

					if (Config.BeltColumn[i] === "mp" && Config.MinColumn[i] > 0) {
						potion = me.getItem(-1, 2); // belt item

						if (potion) {
							do {
								if (potion.code.indexOf("mp") > -1) {
									needmp = false;

									break;
								}
							} while (potion.getNext());
						}

						if (needmp) {
							print("We need mana potions");

							check = true;
						}
					}
				}
			}

			if (Config.OpenChests && Town.needKeys()) {
				check = true;
			}
		} catch (e) {
			check = false;
		}
	}

	if (check) {
		scriptBroadcast("townCheck");
		delay(500);

		return true;
	}

	return false;
};

Misc.openChest = function (unit) {
	// Skip invalid and Countess chests
	if (!unit || unit.x === 12526 || unit.x === 12565) {
		return false;
	}

	// already open
	if (unit.mode) {
		return true;
	}

	// locked chest, no keys
	if (me.classid !== 6 && unit.islocked && !me.findItem(543, 0, 3)) {
		return false;
	}

	var i, tick;

	for (i = 0; i < 7; i += 1) {
		if (Pather.moveTo(unit.x + 1, unit.y + 2, 3) && getDistance(me, unit.x + 1, unit.y + 2) < 5) {
			//Misc.click(0, 0, unit);
			sendPacket(1, 0x13, 4, unit.type, 4, unit.gid);
		}

		tick = getTickCount();

		while (getTickCount() - tick < 1000) {
			if (unit.mode) {
				return true;
			}

			delay(10);
		}

		Packet.flash(me.gid);
	}

	if (!me.idle) {
		Misc.click(0, 0, me.x, me.y); // Click to stop walking in case we got stuck
	}

	return false;
};

Misc.openChests = function (range) {
	var unit,
		unitList = [],
		containers = [ "loose rock", "hidden stash", "loose boulder", "chest", "chest3", "armorstand", "holeanim", "weaponrack"],
		pita = ["barrel", "largeurn", "jar3", "jar2", "jar1", "urn", "jug"]; // pain in the ass

	if (!range) {
		range = 15;
	}

	if (Config.OpenChests === 2) {
		containers = [
			"chest", "loose rock", "hidden stash", "loose boulder", "corpseonstick", "casket", "armorstand", "weaponrack", "barrel", "holeanim", "tomb2", "tomb3", "roguecorpse", "ratnest", "corpse", "goo pile", "largeurn", "urn", "chest3", "jug", "skeleton", "guardcorpse", "sarcophagus", "object2", "cocoon", "basket", "stash", "hollow log", "hungskeleton", "pillar", "skullpile", "skull pile", "jar3", "jar2", "jar1", "bonechest", "woodchestl", "woodchestr", "barrel wilderness", "burialchestr", "burialchestl", "explodingchest", "chestl", "chestr", "groundtomb", "icecavejar1", "icecavejar2", "icecavejar3", "icecavejar4", "deadperson", "deadperson2", "evilurn", "tomb1l", "tomb3l", "groundtombl"
		];
	}

	unit = getUnit(2);

	if (unit) {
		do {
			if (unit.name && unit.mode === 0 && getDistance(me.x, me.y, unit.x, unit.y) <= range && containers.indexOf(unit.name.toLowerCase()) > -1) {
				unitList.push(copyUnit(unit));
			}

			if (unit.name && getDistance(me.x, me.y, unit.x, unit.y) <= 2 && pita.indexOf(unit.name.toLowerCase()) > -1) {
				unitList.push(copyUnit(unit));
			}

		} while (unit.getNext());
	}

	while (unitList.length > 0) {
		unitList.sort(Sort.units);
		unit = unitList.shift();

		if (unit && (Pather.useTeleport() || !checkCollision(me, unit, 0x4)) && this.openChest(unit)) {
			Pickit.pickItems();
		}
	}

	return true;
};

Misc.useWell = function (range) {
	let unit = getUnit(2, "Well", 0),
		unitList = [];

	if (!range) {
		range = 15;
	}

	if (unit) {
		do {
			if (unit.mode === 0 && getDistance(me, unit) <= range) {
				unitList.push(copyUnit(unit));
			}
		} while (unit.getNext());
	}

	while (unitList.length > 0) {
		unitList.sort(Sort.units);
		unit = unitList.shift();

		if (unit && (Pather.useTeleport() || !checkCollision(me, unit, 0x4))) {
			this.getWell(unit);
		}
	}

	return true;
};

Misc.getWell = function (unit) {
	if (unit.mode !== 0) {
		return true;
	}

	let i, tick;

	for (i = 0; i < 3; i += 1) {
		if (getDistance(me, unit) < 4 || Pather.moveToUnit(unit, 3, 0)) {
			Misc.click(0, 0, unit);
		}

		tick = getTickCount();

		while (getTickCount() - tick < 1000) {
			if (unit.mode !== 0) {
				return true;
			}

			delay(10);
		}
	}

	return false;
};

Misc.getExpShrine = function (shrineLocs) {
	if (me.getState(137)) {
		return true;
	}

	for (let get = 0; get < shrineLocs.length; get++) {
		if (!Pather.checkWP(shrineLocs[get])) {
			Pather.getWP(shrineLocs[get]);
		} else {
			Pather.useWaypoint(shrineLocs[get]);
		}

		Precast.doPrecast(true);
		Misc.getShrinesInArea(shrineLocs[get], 15, true);

		if (me.getState(137)) {
			break;
		}

		if (!me.inTown) {
			Town.goToTown();
		}
	}

	return true;
};

Misc.gamePause = function () {
	let script = getScript("default.dbj");

	if (script) {
		if (script.running) {
			print("ÿc1Pausing.");
			script.pause();
		} else {
			print("ÿc2Resuming.");
			script.resume();
		}
	}

	return true;
};

Misc.gamePacket = function (bytes) {// various game events
	let diablo, tick, wave, waveMonster;

	switch (bytes[0]) {
	case 0x89: // den completion lights
		if (me.area === 8) {
			Misc.gamePause();
			Pickit.pickItems();

			if (!me.getItem(518)) {
				Pather.moveToExit([2, 3], true);
				Pather.getWP(3);
				Pather.useWaypoint(1);
			} else {
				Town.goToTown();
			}

			Town.npcInteract("akara");
			Misc.gamePause();
		}

		break;
		/*	case 0x4c: // diablo lightning dodge
		if (bytes[6] === 193 && !me.getSkill(54, 0)) {
			diablo = getUnit(1, 243);
			tick = getTickCount();
			Misc.gamePause();

			while (getTickCount() - tick < 2000) {
				if (me.y <= diablo.y) { // above D
					if (me.x <= diablo.x) { //move east
						Pather.moveTo(diablo.x + 3, diablo.y);
					}

					if (me.x > diablo.x) { //move south
						Pather.moveTo(diablo.x, diablo.y + 3);
					}
				}

				if (me.y > diablo.y) { // below D
					if (me.x >= diablo.x) { //move west
						Pather.moveTo(diablo.x - 3, diablo.y);
					}

					if (me.x < diablo.x) { //move north
						Pather.moveTo(diablo.x, diablo.y - 3);
					}
				}
			}

			Misc.gamePause();
		}

		break;	*/
	case 0xa4: //baalwave
		if (me.hell && !Attack.IsAuradin) {
			waveMonster = ((bytes[1]) | (bytes[2] << 8));
			wave = [23, 381, 557, 558, 571].indexOf(waveMonster);

			if (wave > -1) {
				Misc.gamePause();
				tick = getTickCount();
				print('ÿc9SoloLevelingÿc0: baal wave #' + (wave + 1));
				me.overhead("wave " + (wave + 1));

				while (getTickCount() - tick < 6500) { //prep
					Pather.moveTo(15092, 5073);
				}

				Config.NoTele = true;
				tick = getTickCount();

				while (getTickCount() - tick < 5000) { // 5 second delay (5000ms)
					Pather.moveTo(15098, 5082);	// leave throne
				}

				tick = getTickCount();
				Pather.moveTo(15099, 5078); // reenter throne

				while (getTickCount() - tick < 2000) {// 2 second delay (2000ms)
					Pather.moveTo(15098, 5082);
				}

				Pather.moveTo(15098, 5073);
				Config.NoTele = false;
				Misc.gamePause();
			}
		}

		break;
	default:
		break;
	}
};

Misc.checkItemForSocketing = function () {
	if (me.gametype === 0 || !me.getQuest(35, 1)) {
		return false;
	}

	let item;
	let items = me.getItems();

	if (Check.Build().caster) {
		if (me.diff === 0) {
			for (let i = 0; i < items.length; i++) {
				if (items[i].classid === 30 && items[i].ilvl >= 15 && items[i].getStat(194) === 0 && [2, 3].indexOf(items[i].quality) > -1) {	//Broad Sword
					item = items[i];
					break;
				}
			}
		} else if (me.diff === 1) {
			for (let i = 0; i < items.length; i++) {
				if ([151, 254].indexOf(items[i].classid) > -1 && items[i].getStat(194) === 0 && [2, 3].indexOf(items[i].quality) > -1 && items[i].getFlag(0x400000)) {	//Eth Bill or Colossus Volgue
					item = items[i];
					break;
				}
			}
		} else if (me.classid === 1) {	//Sorc uses tal helm
			for (let i = 0; i < items.length; i++) {
				if (items[i].classid === 358 && items[i].getStat(194) === 0 && items[i].quality === 5) {	//Tal Helm
					item = items[i];
					break;
				}
			}
		} else if (me.classid === 5) {	//Druid uses Jalal's
			for (let i = 0; i < items.length; i++) {
				if (items[i].classid === 472 && items[i].getStat(194) === 0 && items[i].quality === 5) {	//Jalal's
					item = items[i];
					break;
				}
			}
		} else {						//Otherwise Shako
			for (let i = 0; i < items.length; i++) {
				if (items[i].classid === 422 && items[i].getStat(194) === 0 && items[i].quality === 7) {	//Shako
					item = items[i];
					break;
				}
			}
		}
	} else {	
		if (me.classid === 0) {		//Amazon
			if (me.diff === 0) {
				for (let i = 0; i < items.length; i++) {
					if (items[i].classid === 151 && items[i].ilvl >= 25 && items[i].getStat(194) === 0 && [2, 3].indexOf(items[i].quality) > -1) {	//Bill
						item = items[i];
						break;
					}
				}
			} else if (me.diff === 1) {
				for (let i = 0; i < items.length; i++) {
					if ([151, 254].indexOf(items[i].classid) > -1 && items[i].getStat(194) === 0 && [2, 3].indexOf(items[i].quality) > -1 && items[i].getFlag(0x400000)) {	//Eth Bill or Colossus Volgue
						item = items[i];
						break;
					}
				}
			} else {
				for (let i = 0; i < items.length; i++) {
					if (items[i].classid === 422 && items[i].getStat(194) === 0 && items[i].quality === 7) {	//Shako
						item = items[i];
						break;
					}
				}
			}	
		}

		if (me.classid === 4) {		//Barbarian
			if (me.diff === 0) {
				if (!haveItem("scepter", "runeword", "Honor")) {
					for (let i = 0; i < items.length; i++) {
						if (items[i].classid === 17 && items[i].ilvl >= 21 && items[i].getStat(194) === 0 && [2, 3].indexOf(items[i].quality) > -1) {
							item = items[i];
							break;
						}
					}
				} else {
					for (let i = 0; i < items.length; i++) {
						if (items[i].classid === 477 && items[i].getStat(194) === 0 && items[i].quality === 7) {	//Arreat's
							item = items[i];
							break;
						}
					}
				}
			}		
		}
		
	}

	return item;
};

Misc.checkItemForImbueing = function () {
	if (!me.getQuest(3, 1)) {
		return false;
	}

	let item;
	let items = me.getItems();

	switch(me.classid) {
	case 0: 	//Amazon
		if (Item.getEquippedItem(4).tier < 100000) { //Only use imbue if not using final weapon
			if (me.diff === 0) {
				for (let i = 0; i < items.length; i++) {
					if (items[i].classid === 285  && items[i].getStat(194) === 0 && [2, 3].indexOf(items[i].quality) > -1) {	//Maiden Javelin
						item = items[i];
						break;
					}
				}
			} else if (me.diff === 1) {
				for (let i = 0; i < items.length; i++) {
					if (items[i].classid === 295  && items[i].getStat(194) === 0 && [2, 3].indexOf(items[i].quality) > -1) {	//Ceremonial Javelin
						item = items[i];
						break;
					}
				}
			} else {	
				for (let i = 0; i < items.length; i++) {
					if (items[i].classid === 305  && items[i].getStat(194) === 0 && [2, 3].indexOf(items[i].quality) > -1) {	//Matriarchal Javelin
						item = items[i];
						break;
					}
				}	
				
			}
		}
		
		break;
	case 1: 	//Sorceress
		if (Item.getEquippedItem(4).tier < 777) {	//Less than a spirit sword
			if (me.diff === 0) {
				for (let i = 0; i < items.length; i++) {
					if (items[i].classid === 280  && items[i].getStat(194) === 0 && [2, 3].indexOf(items[i].quality) > -1) {	//Jared's Stone
						item = items[i];
						break;
					}
				}
			} else if (me.diff === 1) {
				for (let i = 0; i < items.length; i++) {
					if (items[i].classid === 290  && items[i].getStat(194) === 0 && [2, 3].indexOf(items[i].quality) > -1) {	//Swirling Crystal
						item = items[i];
						break;
					}
				}
			} else {
				for (let i = 0; i < items.length; i++) {
					if (items[i].classid === 300  && items[i].getStat(194) === 0 && [2, 3].indexOf(items[i].quality) > -1) {	//Dimensional Shard
						item = items[i];
						break;
					}
				}
			}	
		}
		
		break;
	case 2: 	//Necromancer
		if (Item.getEquippedItem(5).tier < 1000) {	//Less than spirit shield
			if (me.diff === 0) {
				for (let i = 0; i < items.length; i++) {
					if (items[i].classid === 417  && items[i].getStat(194) === 0 && [2, 3].indexOf(items[i].quality) > -1) {	//Demon Head
						item = items[i];
						break;
					}
				}
			} else if (me.diff === 1) {
				for (let i = 0; i < items.length; i++) {
					if (items[i].classid === 487  && items[i].getStat(194) === 0 && [2, 3].indexOf(items[i].quality) > -1) {	//Hierophant Trophy
						item = items[i];
						break;
					}
				}
			} else {
				for (let i = 0; i < items.length; i++) {
					if (items[i].classid === 507  && items[i].getStat(194) === 0 && [2, 3].indexOf(items[i].quality) > -1) {	//Bloodlord Skull
						item = items[i];
						break;
					}
				}
			}
		}
		
		break;
	case 3: 	//Paladin
		if (Item.getEquippedItem(4).tier < 777) {	//Less than a spirit sword
			if (me.diff === 0) {
				for (let i = 0; i < items.length; i++) {
					if (items[i].classid === 17  && items[i].getStat(194) === 0 && [2, 3].indexOf(items[i].quality) > -1) {	//War Scepter
						item = items[i];
						break;
					}
				}
			} else if (me.diff === 1) {
				for (let i = 0; i < items.length; i++) {
					if (items[i].classid === 110  && items[i].getStat(194) === 0 && [2, 3].indexOf(items[i].quality) > -1) {	//Divine Scepter
						item = items[i];
						break;
					}
				}
			} else {
				for (let i = 0; i < items.length; i++) {
					if (items[i].classid === 213  && items[i].getStat(194) === 0 && [2, 3].indexOf(items[i].quality) > -1) {	//Caduceus
						item = items[i];
						break;
					}
				}
			}	
		}
		
		break;
	case 4: 	//Barbarian
		if (Item.getEquippedItem(1).tier < 100000) {	//Less than final helm
			if (me.diff === 0) {
				for (let i = 0; i < items.length; i++) {
					if (items[i].classid === 407  && items[i].getStat(194) === 0 && [2, 3].indexOf(items[i].quality) > -1) {	//Avenger Guard
						item = items[i];
						break;
					}
				}
			} else if (me.diff === 1) {
				for (let i = 0; i < items.length; i++) {
					if (items[i].classid === 477  && items[i].getStat(194) === 0 && [2, 3].indexOf(items[i].quality) > -1) {	//Slayer Guard
						item = items[i];
						break;
					}
				}
			} else {
				for (let i = 0; i < items.length; i++) {
					if (items[i].classid === 493  && items[i].getStat(194) === 0 && [2, 3].indexOf(items[i].quality) > -1) {	//Carnage Helm
						item = items[i];
						break;
					}
				}
			}
		}
		
		break;
	case 5: 	//Druid
		if (Item.getEquippedItem(1).tier < 100000) {	//Less than final helm
			if (me.diff === 0) {
				for (let i = 0; i < items.length; i++) {
					if (items[i].classid === 402  && items[i].getStat(194) === 0 && [2, 3].indexOf(items[i].quality) > -1) {	//Spirit Mask
						item = items[i];
						break;
					}
				}
			} else if (me.diff === 1) {
				for (let i = 0; i < items.length; i++) {
					if (items[i].classid === 472  && items[i].getStat(194) === 0 && [2, 3].indexOf(items[i].quality) > -1) {	//Totemic Mask
						item = items[i];
						break;
					}
				}
			} else {
				for (let i = 0; i < items.length; i++) {
					if (items[i].classid === 492  && items[i].getStat(194) === 0 && [2, 3].indexOf(items[i].quality) > -1) {	//Dream Spirit
						item = items[i];
						break;
					}
				}
			}
		}

		break;
	case 6: 	//Assassin
		if (Item.getEquippedItem(4).tier < 777) {	//Less than a spirit sword
			if (me.diff === 0) {
				for (let i = 0; i < items.length; i++) {
					if (items[i].classid === 179  && items[i].getStat(194) === 0 && [2, 3].indexOf(items[i].quality) > -1) {	//Claws
						item = items[i];
						break;
					}
				}
			} else if (me.diff > 0) {
				for (let i = 0; i < items.length; i++) {
					if (items[i].classid === 187  && items[i].getStat(194) === 0 && [2, 3].indexOf(items[i].quality) > -1) {	//Greater Talons
						item = items[i];
						break;
					}
				}
			} 	
		}

		break;
	default:
		break;
	}

	return item;
};

Misc.addSocketables = function () {
	let item;
	let items = me.getItems();

	for (let i = 0; i < items.length; i++) {
		if (items[i].classid === 422 && items[i].getStat(194) === 1 && items[i].quality === 7 && !items[i].getItem()) {	//Shako
			item = items[i];
			break;
		}

		if (items[i].classid === 477 && items[i].getStat(194) === 1 && items[i].quality === 7 && !items[i].getItem()) {	//Arreats
			item = items[i];
			break;
		}

		if (items[i].classid === 472 && items[i].getStat(194) === 1 && items[i].quality === 7 && !items[i].getItem()) {	//Jalal's
			item = items[i];
			break;
		}

		if (items[i].classid === 358 && items[i].getStat(194) === 1 && items[i].quality === 5 && !items[i].getItem()) {	//Tal Helm
			item = items[i];
			break;
		}

		if (items[i].classid === 427 && items[i].getStat(194) >= 1 && items[i].quality === 7 && !items[i].getItem()) {	//Crown of Ages
			item = items[i];
			break;
		}

		if (items[i].classid === 375 && items[i].getStat(194) >= 1 && items[i].quality === 7 && !items[i].getItem()) {	//Moser's
			item = items[i];
			break;
		}
	}

	if (item) {
		let socketable;
		let multiple = [];
		let ready = false; 

		for (let i = 0; i < items.length; i++) {
			if (items[i].classid === 631 && [422, 472, 358].indexOf(item.classid) > -1) {	//Um Rune and Shako, Jalal's, Tal Helm
				socketable = items[i];
				break;
			}

			if (items[i].classid === 641 && item.classid === 477) {	//Cham Rune and Arreat's
				socketable = items[i];
				break;
			}

			if (items[i].classid === 631 && item.classid === 427 && multiple.indexOf(items[i]) === -1) {	//Um Rune and CoA
				if (item.getStat(194) === 2) {
					if (multiple.length < item.getStat(194)) {
						multiple.push(items[i]);
						continue;
					} else {
						ready = true;
						break;
					}	
				} else {
					socketable = items[i];
					break;
				}	
			}

			if (items[i].classid === 586 && item.classid === 375 && multiple.indexOf(items[i]) === -1) {	//P-diamond to Moser's
				if (item.getStat(194) === 2) {
					if (multiple.length < item.getStat(194)) {
						multiple.push(items[i]);
						continue;
					} else {
						ready = true;
						break;
					}	
				} else {
					socketable = items[i];
					break;
				}	
			}
		}

		if (socketable) {
			if (Misc.addSocketableToItem(item, socketable)) {
				D2Bot.printToConsole("Added socketable: " + socketable.fname + " to " + item.fname, 6);
			} else {
				print("Failed to add socketable to item");
			}
			
		}

		if (multiple.length > 0 && ready) {
			for (let i = 0; i < multiple.length; i++) {
				if (Misc.addSocketableToItem(item, multiple[i])) {
					D2Bot.printToConsole("Added socketable: " + multiple[i].fname + " to " + item.fname, 6);
					delay(250 + me.ping);
				} else {
					print("Failed to add socketable to item");
				}
			}
		}
	}
};

Misc.addSocketableToItem = function (item, rune) {
	if (item.getStat(194) === 0) {
		return false;
	}

	if (item.mode === 1) {
		let i, tick, bodyLoc = item.bodylocation;

		if (!Storage.Inventory.CanFit(item)) { //No space to get the item back
			print("No space to get item back");
			return false;
		} else {
			if(!Storage.Inventory.MoveTo(item)) {
				return false;
			}	
		}

		if (!rune.toCursor()) {
			return false;
		}

		for (i = 0; i < 3; i += 1) {
			sendPacket(1, 0x28, 4, rune.gid, 4, item.gid);

			tick = getTickCount();

			while (getTickCount() - tick < 2000) {
				if (!me.itemoncursor) {
					delay(300);

					break;
				}

				delay(10);
			}

			if (item.getItem()) {
				Misc.logItem("Added " + rune.name + " to: ", item);

				if (bodyLoc) {
					Item.equip(item, bodyLoc);
				} 

				return true;	
			}
		}

		return false;
	} else {
		if (Runewords.socketItem(item, rune)) {
			Misc.logItem("Added " + rune.name + " to: ", item);
			return true;
		}
			
	}

	return false;
};

Packet.openMenu = function (unit) { // singleplayer delay(0) fix
	if (unit.type !== 1) {
		throw new Error("openMenu: Must be used on NPCs.");
	}

	if (getUIFlag(0x08)) {
		return true;
	}

	var i, tick;

	for (i = 0; i < 5; i += 1) {
		if (getDistance(me, unit) > 4) {
			Pather.moveToUnit(unit);
		}

		sendPacket(1, 0x13, 4, 1, 4, unit.gid);
		tick = getTickCount();

		while (getTickCount() - tick < 5000) {
			if (getUIFlag(0x08)) {
				delay(Math.max(500, me.ping * 2));

				return true;
			}

			if (getInteractedNPC() && getTickCount() - tick > 1000) {
				me.cancel();
			}

			delay(100);
		}

		sendPacket(1, 0x2f, 4, 1, 4, unit.gid);
		delay(me.ping * 2 + 1);
		sendPacket(1, 0x30, 4, 1, 4, unit.gid);
		delay(me.ping * 2 + 1);
		this.flash(me.gid);
	}

	return false;
};
