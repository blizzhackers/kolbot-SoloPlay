/*
*	@filename	AttackOverrides.js
*	@author		isid0re, theBGuy
*	@desc		Attack.js fixes to improve functionality
*/

if (!isIncluded("common/Attack.js")) {
	include("common/Attack.js");
}

Attack.killTarget = function (name) {
	var target,	attackCount = 0;

	for (let i = 0; !target && i < 5; i += 1) {
		target = getUnit(1, name);

		if (target) {
			break;
		}

		delay(200);
	}

	if (!target) {
		print("ÿc9SoloLevelingÿc0: " + name + " not found. Performing Attack.Clear(25)");
		Attack.clear(25);
		Pickit.pickItems();

		return true;
	}

	if (target && !Attack.canAttack(target)) { // exit if target is immune
		print("ÿc9SoloLevelingÿc0: Attack failed. " + target.name + " is immune.");

		return true;
	}

	while (attackCount < Config.MaxAttackCount) {
		if (Misc.townCheck()) {
			for (let i = 0; !target && i < 5; i += 1) {
				target = getUnit(1, name);

				if (target) {
					break;
				}

				delay(200);
			}
		}

		if (!target || !copyUnit(target).x) { // Check if unit got invalidated, happens if necro raises a skeleton from the boss's corpse.
			target = getUnit(1, name);

			if (!target) {
				break;
			}
		}

		if (Config.Dodge && me.hp * 100 / me.hpmax <= Config.DodgeHP) {
			this.deploy(target, Config.DodgeRange, 5, 9);
		}

		if (attackCount > 0 && attackCount % 15 === 0 && Skill.getRange(Config.AttackSkill[1]) < 4) {
			Packet.flash(me.gid);
		}

		if (!ClassAttack.doAttack(target, attackCount % 15 === 0)) {
			Packet.flash(me.gid);
		}

		attackCount += 1;
		ClassAttack.afterAttack();

		// spectype check from isid0re SoloLeveling commit 44d25cb
		if (!target || !copyUnit(target).x || target.dead || target.spectype === 0) {
			break;
		}
	}

	if (!target || !copyUnit(target).x || target.dead || target.spectype === 0) {
		Pickit.pickItems();
	}

	return true;
};

Attack.blitzkrieg = function (name) {
	if ((!me.getSkill(143, 1) && me.barbarian) || (!me.getSkill(143, 1) && !Pather.canTeleport())) {
		return false;
	}

	if (name === undefined || !name) {
		return false;
	}

	if (name !== 243) {	// Only do this for diablo at the moment
		return false;
	}

	var target,	attackCount = 0, blitzSkill = me.barbarian ? 143 : 54;

	for (let i = 0; !target && i < 5; i += 1) {
		target = getUnit(1, name);

		if (target) {
			break;
		}

		delay(200);
	}

	if (!target) {
		print("ÿc8Kolbot-SoloPlayÿc0: " + name + " not found. Performing Attack.Clear(25)");
		Attack.clear(25);
		Pickit.pickItems();

		return true;
	}

	if (target && !Attack.canAttack(target)) { // exit if target is immune
		print("ÿc8Kolbot-SoloPlayÿc0: Attack failed. " + target.name + " is immune.");

		return true;
	}

	me.overhead("blitzkrieg");

	while (attackCount < Config.MaxAttackCount) {
		if (Misc.townCheck()) {
			for (let i = 0; !target && i < 5; i += 1) {
				target = getUnit(1, name);

				if (target) {
					break;
				}

				delay(200);
			}
		}

		if (!target || !copyUnit(target).x) { // Check if unit got invalidated, happens if necro raises a skeleton from the boss's corpse.
			target = getUnit(1, name);

			if (!target) {
				break;
			}
		}

		if (blitzSkill === 143) {
			Skill.cast(blitzSkill, 0, target.x, target.y);
		}

		if (Config.Dodge && me.hp * 100 / me.hpmax <= Config.DodgeHP) {
			this.deploy(target, Config.DodgeRange, 5, 9);
		}

		if (attackCount > 0 && attackCount % 15 === 0 && Skill.getRange(Config.AttackSkill[1]) < 4) {
			Packet.flash(me.gid);
		}

		if (!ClassAttack.doAttack(target, attackCount % 15 === 0)) {
			Packet.flash(me.gid);
		}

		attackCount += 1;
		ClassAttack.afterAttack();

		let range = me.classid === 4 ? 15 : 20;
		let coord = CollMap.getRandCoordinate(target.x + 5, -1 * range, range, target.y + 5, -1 * range, range);
		Skill.cast(blitzSkill, 0, coord.x, coord.y);

		// spectype check from isid0re SoloLeveling commit 44d25cb
		if ( !target || !copyUnit(target).x || target.dead || target.spectype === 0) {
			break;
		}
	}

	if ( !target || !copyUnit(target).x || target.dead || target.spectype === 0) {
		Pickit.pickItems();
	}

	return true;
};

Attack.clearLocations = function (list) {
	for (let x = 0; x < list.length; x++) {
		Attack.clear(20);
		Pather.moveTo(list[x][0], list[x][1]);
		Attack.clear(20);
		Pickit.pickItems();
	}

	return true;
};

Attack.clearPosition = function (x, y, range, skipBlocked) {
	var monster, monList, tick;

	if (skipBlocked === true) {
		skipBlocked = 0x4;
	}

	while (true) {
		if (getDistance(me, x, y) > 5) {
			Pather.moveTo(x, y);
		}

		monster = getUnit(1);
		monList = [];

		if (monster) {
			do {
				if (getDistance(monster, x, y) <= range && this.checkMonster(monster) && this.canAttack(monster) &&
						(!skipBlocked || !checkCollision(me, monster, skipBlocked)) &&
						((me.classid === 1 && me.getSkill(54, 1)) || me.getStat(97, 54) || !checkCollision(me, monster, 0x1))) {
					monList.push(copyUnit(monster));
				}
			} while (monster.getNext());
		}

		if (!monList.length) {		
			return true;
		} else {
			this.clearList(monList);
		}

		delay(100);
	}

	return true;
};

Attack.buildMonsterList = function (skipBlocked) {
	var monster,
		monList = [];

	if (skipBlocked === true) {
		skipBlocked = 0x4;
	}

	monster = getUnit(1);

	if (monster) {
		do {
			if (this.checkMonster(monster)) {
				monList.push(copyUnit(monster));
			}
		} while (monster.getNext());
	}

	if (skipBlocked === 0x4) {
		return monList.filter(monster => !checkCollision(me, monster, skipBlocked))
	}

	return monList;
};

Attack.getMobCount = function (x, y, range, list, filter) {
	var i,
		count = 0,
		ignored = [243];

	if (filter === undefined) {
		filter = false;
	}

	if (list === undefined || list === null || !list.length) {
		list = this.buildMonsterList(true);
		list.sort(Sort.units);
		let newList;

		if (filter) {
			newList = list.filter(mob => mob.spectype === 0);

			for (i = 0; i < newList.length; i++) {
				if (ignored.indexOf(newList[i].classid) === -1 && this.checkMonster(newList[i]) && getDistance(x, y, newList[i].x, newList[i].y) <= range) {
					count += 1;
				}
			}

			return count;
		}
	}

	for (i = 0; i < list.length; i += 1) {
		if (ignored.indexOf(list[i].classid) === -1 && this.checkMonster(list[i]) && getDistance(x, y, list[i].x, list[i].y) <= range) {
			count += 1;
		}
	}

	return count;
};

Attack.getMobCountAtPosition = function (x, y, range, filter = false, debug = true) {
	var i,
		list = [],
		count = 0,
		ignored = [243];

	list = this.buildMonsterList(true);
	list.sort(Sort.units);

	if (filter) {
		list = list.filter(mob => mob.spectype === 0);
	}

	for (i = 0; i < list.length; i++) {
		if (ignored.indexOf(list[i].classid) === -1 && this.checkMonster(list[i]) && getDistance(x, y, list[i].x, list[i].y) <= range) {
			count += 1;
		}
	}

	if (debug) {
		print(count + " monsters at x: " + x + " y: " + y);
	}

	return count;
};

Attack.IsAuradin = false;

Attack.init = function () {
	if (Config.Wereform) {
		include("common/Attacks/wereform.js");
	} else if (Config.CustomClassAttack && FileTools.exists('libs/common/Attacks/'+Config.CustomClassAttack+'.js')) {
		print('Loading custom attack file');
		include('common/Attacks/'+Config.CustomClassAttack+'.js')
	} else {
		include("common/Attacks/" + this.classes[me.classid] + ".js");
	}

	if (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0) {
		showConsole();
		print("ÿc1Bad attack config. Don't expect your bot to attack.");
	}

	if (me.gametype === 1) {
		this.checkInfinity();
		this.getCharges();
		this.getPrimarySlot();
		this.checkIsAuradin();
	}
};

Attack.checkIsAuradin = function () {
	let i, item;

	// Check player Dragon or Dream
	item = me.getItem(-1, 1);

	if (item) {
		do {
			if (item.getPrefix(20533) || item.getPrefix(20535)) {
				this.IsAuradin = true;

				return true;
			}
		} while (item.getNext());
    }
    
    return false;
};
  
Attack.getSkillElement = function (skillId) {
	this.elements = ["physical", "fire", "lightning", "magic", "cold", "poison", "none"];

	switch (skillId) {
	case 74: // Corpse Explosion
	case 139: // Stun
	case 144: // Concentrate
	case 147: // Frenzy
	case 273: // Minge Blast
	case 500: // Summoner
		return "physical";
	case 101: // Holy Bolt
		return "holybolt"; // no need to use this.elements array because it returns before going over the array
	}

	var eType = getBaseStat("skills", skillId, "etype");

	if (typeof (eType) === "number") {
		return this.elements[eType];

	}

	return false;
};

Attack.checkResist = function (unit, val, maxres) {
	// Ignore player resistances
	if (unit.type === 0) {
		return true;
	}

	var damageType = typeof val === "number" ? this.getSkillElement(val) : val;

	if (maxres === undefined) {
		maxres = 100;
	}

	// Static handler
	if (val === 42 && this.getResist(unit, damageType) < 100) {
		return (unit.hp * 100 / 128) > Config.CastStatic;
	}

	if (this.infinity && ["fire", "lightning", "cold"].indexOf(damageType) > -1 && unit.getState) { // baal in throne room doesn't have getState
		if (!unit.getState(28)) {
			return this.getResist(unit, damageType) < 117;
		}

		return this.getResist(unit, damageType) < maxres;
	}

	if (this.IsAuradin && ["physical"].indexOf(damageType) > -1 && unit.getState) { // baal in throne room doesn't have getState
		return true;
	}

	return this.getResist(unit, damageType) < maxres;
};

Attack.isCursable = function (unit) {
	if (copyUnit(unit).name === undefined || unit.name.indexOf(getLocaleString(11086)) > -1) { // "Possessed"
		return false;
	}

	if (unit.getState(57)) { // attract can't be overridden
		return false;
	}

	switch (unit.classid) {
	case 190: // maggotegg1
	case 191: // maggotegg1
	case 192: // maggotegg1
	case 193: // maggotegg1
	case 194: // maggotegg1
	case 206: // Foul Crow Nest
	case 207: // BloodHawkNest
	case 208: // BlackVultureNest
	case 228: // sarcophagus
	case 258: // Water Watcher
	case 261: // Water Watcher
	case 266: // Flavie
	case 273: // gargoyle trap
	case 348: // Turret
	case 349: // Turret
	case 350: // Turret
	case 371: // lightning spire
	case 372: // firetower
	case 432: // Barricade Door
	case 433: // Barricade Door
	case 434: // Prison Door
	case 435: // Barricade Tower
	case 499: // Catapult
	case 524: // Barricade Wall Right
	case 525: // Barricade Wall Left
	case 562: // Festering Appendages
	case 563: // Festering Appendages
	case 528: // Evil Demon Hut
	case 681: // maggotegg1 (WSK)
		return false;
	}

	return true;
};

Attack.stopClear = false;

// Clear an entire area based on monster spectype
Attack.clearLevel = function (spectype) {
	var room, result, rooms, myRoom, currentArea, previousArea;

	function RoomSort(a, b) {
		return getDistance(myRoom[0], myRoom[1], a[0], a[1]) - getDistance(myRoom[0], myRoom[1], b[0], b[1]);
	}

	room = getRoom();

	if (!room) {
		return false;
	}

	if (spectype === undefined) {
		spectype = 0;
	}

	rooms = [];

	currentArea = getArea().id;

	do {
		rooms.push([room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2]);
	} while (room.getNext());

	while (rooms.length > 0) {
		// get the first room + initialize myRoom var
		if (!myRoom) {
			room = getRoom(me.x, me.y);
		}

		if (room) {
			if (room instanceof Array) { // use previous room to calculate distance
				myRoom = [room[0], room[1]];
			} else { // create a new room to calculate distance (first room, done only once)
				myRoom = [room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2];
			}
		}

		rooms.sort(RoomSort);
		room = rooms.shift();

		result = Pather.getNearestWalkable(room[0], room[1], 18, 3);

		if (result) {
			Pather.moveTo(result[0], result[1], 3, spectype);
			previousArea = result;

			if ([29, 30, 31].indexOf(me.area) > -1 && me.amazon && me.hell) {
				if (Attack.stopClear) {
					me.overhead("Tainted monster type found. Moving to next sequence");
					print("ÿc8Kolbot-SoloPlayÿc0: Tainted monster type found. Moving to next sequence");
					Attack.stopClear = false;	// Reset value
					return true;
				}
			}

			if (!this.clear(40, spectype)) {
				break;
			}
		}
		// Make sure bot does not get stuck in different area.
		else if (currentArea !== getArea().id) {
			Pather.moveTo(previousArea[0], previousArea[1], 3, spectype);
		}
	}

	return true;
};

// Clear monsters in a section based on range and spectype or clear monsters around a boss monster
Attack.clear = function (range, spectype, bossId, sortfunc, pickit) { // probably going to change to passing an object
	while (!me.gameReady) {
		delay(40);
	}

	if (range === undefined) {
		range = 25;
	}

	if (spectype === undefined) {
		spectype = 0;
	}

	if (bossId === undefined) {
		bossId = false;
	}

	if (sortfunc === undefined) {
		sortfunc = false;
	}

	if (pickit === undefined) {
		pickit = true;
	}

	if (typeof (range) !== "number") {
		throw new Error("Attack.clear: range must be a number.");
	}

	var i, boss, orgx, orgy, target, result, monsterList, start, coord, skillCheck, secAttack,
		retry = 0,
		gidAttack = [],
		attackCount = 0;

	if (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0) {
		return false;
	}

	if (Attack.stopClear) {
		return false;
	}

	if (!sortfunc) {
		sortfunc = this.sortMonsters;
	}

	if (bossId) {
		for (i = 0; !boss && i < 5; i += 1) {
			boss = bossId > 999 ? getUnit(1, -1, -1, bossId) : getUnit(1, bossId);

			delay(200);
		}

		if (!boss) {
			throw new Error("Attack.clear: " + bossId + " not found");
		}

		orgx = boss.x;
		orgy = boss.y;
	} else {
		orgx = me.x;
		orgy = me.y;
	}

	monsterList = [];
	target = getUnit(1);

	if (target) {
		do {
			if ((!spectype || (target.spectype & spectype)) && this.checkMonster(target) && this.skipCheck(target)) {
				// Speed optimization - don't go through monster list until there's at least one within clear range
				if (!start && getDistance(target, orgx, orgy) <= range &&
						(me.getSkill(54, 1) || !Scripts.Follower || !checkCollision(me, target, 0x1))) {
					start = true;
				}

				monsterList.push(copyUnit(target));
			}
		} while (target.getNext());
	}

	while (start && monsterList.length > 0 && attackCount < 300) {
		if (boss) {
			orgx = boss.x;
			orgy = boss.y;
		}

		if (me.dead || Attack.stopClear) {
			return false;
		}

		//monsterList.sort(Sort.units);
		monsterList.sort(sortfunc);

		target = copyUnit(monsterList[0]);

		if ([29, 30, 31].indexOf(me.area) > -1 && me.amazon && me.hell) {
			if ([11, 12, 13, 14].indexOf(target.classid) > -1) {
				Attack.stopClear = true;
			}
		}

		if (target.x !== undefined && (getDistance(target, orgx, orgy) <= range || (this.getScarinessLevel(target) > 7 && getDistance(me, target) <= range)) && this.checkMonster(target)) {
			if (Config.Dodge && me.hp * 100 / me.hpmax <= Config.DodgeHP) {
				this.deploy(target, Config.DodgeRange, 5, 9);
			}

			Misc.townCheck(true);
			//me.overhead("attacking " + target.name + " spectype " + target.spectype + " id " + target.classid);

			result = ClassAttack.doAttack(target, attackCount % 15 === 0);

			if (result) {
				retry = 0;

				if (result === 2) {
					monsterList.shift();

					continue;
				}

				for (i = 0; i < gidAttack.length; i += 1) {
					if (gidAttack[i].gid === target.gid) {
						break;
					}
				}

				if (i === gidAttack.length) {
					gidAttack.push({gid: target.gid, attacks: 0, name: target.name});
				}

				gidAttack[i].attacks += 1;
				attackCount += 1;

				if (me.classid === 4) {
					secAttack = (target.spectype & 0x7) ? 2 : 4;
				} else {
					secAttack = 5;
				}

				if (Config.AttackSkill[secAttack] > -1 && (!Attack.checkResist(target, Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3]) ||
						(me.classid === 3 && Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3] === 112 && !ClassAttack.getHammerPosition(target)))) {
					skillCheck = Config.AttackSkill[secAttack];
				} else {
					skillCheck = Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3];
				}

				// Desync/bad position handler
				switch (skillCheck) {
				case 112:
					//print(gidAttack[i].name + " " + gidAttack[i].attacks);

					// Tele in random direction with Blessed Hammer
					if (gidAttack[i].attacks > 0 && gidAttack[i].attacks % ((target.spectype & 0x7) ? 4 : 2) === 0) {
						//print("random move m8");
						coord = CollMap.getRandCoordinate(me.x, -1, 1, me.y, -1, 1, 5);
						Pather.moveTo(coord.x, coord.y);
					}

					break;
				default:
					// Flash with melee skills
					if (gidAttack[i].attacks > 0 && gidAttack[i].attacks % ((target.spectype & 0x7) ? 15 : 5) === 0 && Skill.getRange(skillCheck) < 4) {
						Packet.flash(me.gid);
					}

					break;
				}

				// Skip non-unique monsters after 15 attacks, except in Throne of Destruction
				if (me.area !== 131 && !(target.spectype & 0x7) && gidAttack[i].attacks > 15) {
					print("ÿc1Skipping " + target.name + " " + target.gid + " " + gidAttack[i].attacks);
					monsterList.shift();
				}

				if (target.mode === 0 || target.mode === 12 || Config.FastPick === 2) {
					Pickit.fastPick();
				}
			} else {
				if (retry++ > 3) {
					monsterList.shift();
					retry = 0;
				}

				Packet.flash(me.gid);
			}
		} else {
			monsterList.shift();
		}
	}

	ClassAttack.afterAttack(pickit);
	this.openChests(range, orgx, orgy);

	if (attackCount > 0 && pickit) {
		Pickit.pickItems();
	}

	return true;
};

Attack.clearPos = function (x, y, range, pickit) { // probably going to change to passing an object
	while (!me.gameReady) {
		delay(40);
	}

	if (range === undefined) {
		range = 15;
	}

	if (pickit === undefined) {
		pickit = true;
	}

	if (typeof (range) !== "number") {
		throw new Error("Attack.clear: range must be a number.");
	}

	var i, boss, orgx, orgy, target, result, monsterList, start, coord, skillCheck, secAttack,
		retry = 0,
		gidAttack = [],
		attackCount = 0;

	if (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0) {
		return false;
	}

	if (Attack.stopClear) {
		return false;
	}

	monsterList = [];
	target = getUnit(1);

	if (target) {
		do {
			if (this.checkMonster(target) && this.skipCheck(target) && this.canAttack(target)) {
				// Speed optimization - don't go through monster list until there's at least one within clear range
				if (!start && getDistance(target, x, y) <= range &&
						(me.sorceress && me.getSkill(54, 1)) || me.getStat(97, 54) || !checkCollision(me, target, 0x1)) {
					start = true;
				}

				monsterList.push(copyUnit(target));
			}
		} while (target.getNext());
	}

	while (start && monsterList.length > 0 && attackCount < 300) {
		if (me.dead || Attack.stopClear) {
			return false;
		}

		monsterList.sort(this.sortMonsters);

		target = copyUnit(monsterList[0]);

		if ([29, 30, 31].indexOf(me.area) > -1 && me.amazon && me.hell) {
			if ([11, 12, 13, 14].indexOf(target.classid) > -1) {
				Attack.stopClear = true;
			}
		}

		if (target.x !== undefined && (getDistance(target, x, y) <= range || (this.getScarinessLevel(target) > 7 && getDistance(me, target) <= range)) && this.checkMonster(target)) {
			if (Config.Dodge && me.hp * 100 / me.hpmax <= Config.DodgeHP) {
				this.deploy(target, Config.DodgeRange, 5, 9);
			}

			Misc.townCheck(true);
			//me.overhead("attacking " + target.name + " spectype " + target.spectype + " id " + target.classid);

			result = ClassAttack.doAttack(target, attackCount % 15 === 0);

			if (result) {
				retry = 0;

				if (result === 2) {
					monsterList.shift();

					continue;
				}

				for (i = 0; i < gidAttack.length; i += 1) {
					if (gidAttack[i].gid === target.gid) {
						break;
					}
				}

				if (i === gidAttack.length) {
					gidAttack.push({gid: target.gid, attacks: 0, name: target.name});
				}

				gidAttack[i].attacks += 1;
				attackCount += 1;

				if (me.classid === 4) {
					secAttack = (target.spectype & 0x7) ? 2 : 4;
				} else {
					secAttack = 5;
				}

				if (Config.AttackSkill[secAttack] > -1 && (!Attack.checkResist(target, Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3]) ||
						(me.classid === 3 && Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3] === 112 && !ClassAttack.getHammerPosition(target)))) {
					skillCheck = Config.AttackSkill[secAttack];
				} else {
					skillCheck = Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3];
				}

				// Desync/bad position handler
				switch (skillCheck) {
				case 112:
					//print(gidAttack[i].name + " " + gidAttack[i].attacks);

					// Tele in random direction with Blessed Hammer
					if (gidAttack[i].attacks > 0 && gidAttack[i].attacks % ((target.spectype & 0x7) ? 4 : 2) === 0) {
						//print("random move m8");
						coord = CollMap.getRandCoordinate(me.x, -1, 1, me.y, -1, 1, 5);
						Pather.moveTo(coord.x, coord.y);
					}

					break;
				default:
					// Flash with melee skills
					if (gidAttack[i].attacks > 0 && gidAttack[i].attacks % ((target.spectype & 0x7) ? 15 : 5) === 0 && Skill.getRange(skillCheck) < 4) {
						Packet.flash(me.gid);
					}

					break;
				}

				// Skip non-unique monsters after 15 attacks, except in Throne of Destruction
				if (me.area !== 131 && !(target.spectype & 0x7) && gidAttack[i].attacks > 15) {
					print("ÿc1Skipping " + target.name + " " + target.gid + " " + gidAttack[i].attacks);
					monsterList.shift();
				}

				if (target.mode === 0 || target.mode === 12 || Config.FastPick === 2) {
					Pickit.fastPick();
				}
			} else {
				if (retry++ > 3) {
					monsterList.shift();
					retry = 0;
				}

				Packet.flash(me.gid);
			}
		} else {
			monsterList.shift();
		}
	}

	ClassAttack.afterAttack(pickit);
	this.openChests(range, x, y);

	if (attackCount > 0 && pickit) {
		Pickit.pickItems();
	}

	return true;
};

// Sort monsters based on distance, spectype and classId (summoners are attacked first)
Attack.sortMonsters = function (unitA, unitB) {
	// No special sorting for were-form
	if (Config.Wereform) {
		return getDistance(me, unitA) - getDistance(me, unitB);
	}

	// Barb optimization
	if (me.classid === 4) {
		if (!Attack.checkResist(unitA, Attack.getSkillElement(Config.AttackSkill[(unitA.spectype & 0x7) ? 1 : 3]))) {
			return 1;
		}

		if (!Attack.checkResist(unitB, Attack.getSkillElement(Config.AttackSkill[(unitB.spectype & 0x7) ? 1 : 3]))) {
			return -1;
		}
	}

	// Put monsters under Attract curse at the end of the list - They are helping us
	if (unitA.getState(57)) {
		return 1;
	}

	if (unitB.getState(57)) {
		return -1;
	}

	// Added Oblivion Knights
	var ids = [312, 58, 59, 60, 61, 62, 101, 102, 103, 104, 105, 278, 279, 280, 281, 282, 298, 299, 300, 645, 646, 647, 662, 663, 664, 667, 668, 669, 670, 675, 676];

	if (me.area !== 61 && ids.indexOf(unitA.classid) > -1 && ids.indexOf(unitB.classid) > -1) {
		// Kill "scary" uniques first (like Bishibosh)
		if ((unitA.spectype & 0x04) && (unitB.spectype & 0x04)) {
			return getDistance(me, unitA) - getDistance(me, unitB);
		}

		if (unitA.spectype & 0x04) {
			return -1;
		}

		if (unitB.spectype & 0x04) {
			return 1;
		}

		return getDistance(me, unitA) - getDistance(me, unitB);
	}

	if (ids.indexOf(unitA.classid) > -1) {
		return -1;
	}

	if (ids.indexOf(unitB.classid) > -1) {
		return 1;
	}

	if (Config.BossPriority) {
		if ((unitA.spectype & 0x5) && (unitB.spectype & 0x5)) {
			return getDistance(me, unitA) - getDistance(me, unitB);
		}

		if (unitA.spectype & 0x5) {
			return -1;
		}

		if (unitB.spectype & 0x5) {
			return 1;
		}
	}

	return getDistance(me, unitA) - getDistance(me, unitB);
};

//From legacy sonic
Attack.clearClassids = function (...ids) {
    let monster = getUnit(1);

    if (monster) {
        let list = [];

        do {
            if (ids.includes(monster.classid) && Attack.checkMonster(monster)) {
                list.push(copyUnit(monster));
            }
        } while (monster.getNext());

        Attack.clearList(list);
    }

    return true;
};

Attack.getSwitchItemCharges = function (skillId) {
	if (skillId === undefined || !skillId) {
		return false;
	}

	let chargedItems;

	let validCharge = function (itemCharge) {
		return itemCharge.skill === skillId && itemCharge.charges > 1;
	};

	chargedItems = [];

	me.getItems(-1)
		.filter(item => item && item.bodylocation === 11)	//Switch weapon
			.forEach(function (item) {
				let stats = item.getStat(-2);

				if (stats.hasOwnProperty(204)) {
					if (stats[204] instanceof Array) {
						stats = stats[204].filter(validCharge);
						stats.length && chargedItems.push({
							charge: stats.first(),
							item: item
						});
					} else {
						if (stats[204].skill === skillId && stats[204].charges > 1) {
							chargedItems.push({
								charge: stats[204].charges,
								item: item
							});
						}
					}
				}
			});

	if (chargedItems.length === 0) {
		return false;
	}

	return true;
};

Attack.switchCastCharges = function (skillId, unit) {
	if (skillId === undefined || unit === undefined) {
		return false;
	}

	if (Attack.getSwitchItemCharges(skillId)) {
		me.switchWeapons(1);
		me.castSwitchChargedSkill(skillId, unit);
		me.switchWeapons(0);
	} else {
		//print("ÿc8Kolbot-SoloPlayÿc0: No item with charges or no charges available");
		return false;
	}

	return true;
};

Attack.BossAndMiniBosses = [156, 211, 242, 243, 544, 229, 250, 256, 267, 365, 409, 540, 541, 542];

Attack.dollAvoid = function (unit) {
	var i, cx, cy,
		distance = 14;

	for (i = 0; i < 2 * Math.PI; i += Math.PI / 6) {
		cx = Math.round(Math.cos(i) * distance);
		cy = Math.round(Math.sin(i) * distance);

		if (Attack.validSpot(unit.x + cx, unit.y + cy)) {
			return Pather.moveTo(unit.x + cx, unit.y + cy);
		}
	}

	return false;
};

Attack.spotOnDistance = function (spot, distance, area) {
	if (area === void 0) { area = me.area; }
	var nodes = getPath(area, me.x, me.y, spot.x, spot.y, 2, 5);
	if (!nodes) {
		return { x: me.x, y: me.y };
	}

	return nodes.find(function (node) { return getDistance(spot, node) < distance; }) || { x: me.x, y: me.y };
};

// Credit @Jaenster
Attack.pwnDia = function () {
	if (!me.sorceress && !me.necromancer && !me.assassin) {
		print("Not a far caster");
		return false;
	}

	if ((["Poison", "Summon"].indexOf(SetUp.currentBuild) > -1)) {
		print("Not a far caster");
		return false;
	}

	var Coords_1 = require("../Modules/Coords");

	var calculateSpots = function (center, skillRange) {
	var coords = [];
	for (var i = 0; i < 360; i++) {
		coords.push({
		x: Math.floor(center.x + skillRange * Math.cos(i) + .5),
		y: Math.floor(center.y + skillRange * Math.sin(i) + .5),
		});
	}
	return coords.filter(function (e, i, s) { return s.indexOf(e) === i; }) // only unique spots
		.filter(function (el) { return Attack.validSpot(el.x, el.y); });
	};

	var getDiablo = function () { return getUnit(1, 243); };
	{
		let nearSpot = Attack.spotOnDistance({ x: 7792, y: 5292 }, 35);
		Pather.moveToUnit(nearSpot);
	}

	let dia = Misc.poll(getDiablo, 15e3, 30);

	if (!dia) {
		Pather.moveTo(7788, 5292, 3, 30);	// Move to Star
		dia = Misc.poll(getDiablo, 15e3, 30);
	}

	if (!dia) {
		print("No diablo");
		return false;
	}

	let tick = getTickCount();
	let lastPosition = { x: 7791, y: 5293 };
	let maxRange = me.assassin ? 15 : me.necromancer ? 30 : 58;

	do {
		// give up in 10 minutes
		if (getTickCount() - tick > 60 * 1000 * 10) {
			break;
		}

		while ((dia = getDiablo())) {
			if (dia.dead) {
				me.overhead("Diablo's dead");
				break;
			}

			if (getDistance(me, dia) < 40 || getDistance(me, dia) > 45 || getTickCount() - tick > 25e3) {
				var spot = calculateSpots(dia, 42.5)
					.filter(function (spot) { return getDistance(me, spot) > 15 && getDistance(me, spot) < maxRange; } /*todo, in neighbour room*/)
					.filter(function (spot) {
					var collision = getCollision(me.area, spot.x, spot.y);
					// noinspection JSBitwiseOperatorUsage
					var isLava = !!(collision & Coords_1.BlockBits.IsOnFloor);
					if (isLava) {
						return false; // this spot is on lava, fuck this
					}
					// noinspection JSBitwiseOperatorUsage
					return !(collision & (Coords_1.BlockBits.BlockWall));
				})
					.sort(function (a, b) { return getDistance(me, a) - getDistance(me, b); })
					.first();
				tick = getTickCount();
				if (spot !== undefined) {
					Pather.moveTo(spot.x, spot.y, 15, false);
				}
			}

			me.overhead("FarCasting: Diablo's health " + ((dia.hp / dia.hpmax) * 100) + " % left");

			if (me.necromancer) {
				ClassAttack.farCast(dia);
			} else {
				Skill.cast(Config.AttackSkill[1], 0, dia);
			}
		}

		if (dia && dia.dead) {
			break;
		}

		if (!dia) {
			var path = getPath(me.area, me.x, me.y, lastPosition.x, lastPosition.y, 1, 5);

			if (!path) {
				break; // failed to make a path from me to the old spot
			}

			// walk close to old node, if we dont find dia continue
			if (!path.some(function (node) {
				Pather.walkTo(node.x, node.y);
				return getDiablo();
			}))
			break;
		}
	} while (true);

	if (dia) {
		Pather.moveTo(dia);
	} else {
		Pather.moveTo(7774, 5305);
	}

	Pickit.pickItems();

	Pather.moveTo(7792, 5291);	// Move back to star
	Pickit.pickItems();

	return dia;
};

Attack.getNearestMonster = function (skipBlocked = false) {
	var gid, distance,
		monster = getUnit(1),
		range = 30;

	if (monster) {
		do {
			if (monster.hp > 0 && Attack.checkMonster(monster) && !monster.getParent()) {
				distance = getDistance(me, monster);

				if (distance < range && (!skipBlocked || (!checkCollision(me, monster, 0x4) || !checkCollision(me, monster, 0x1)))) {
					range = distance;
					gid = monster.gid;
				}
			}
		} while (monster.getNext());
	}

	if (gid) {
		monster = getUnit(1, -1, -1, gid);
	} else {
		monster = false;
	}

	if (monster) {
		return monster;
	}

	return false;
};

Attack.deploy = function (unit, distance, spread, range) {
	if (arguments.length < 4) {
		throw new Error("deploy: Not enough arguments supplied");
	}

	var i, grid, index, currCount,
		tick = getTickCount(),
		monList = [],
		count = 999,
		idealPos = {
			x: Math.round(Math.cos(Math.atan2(me.y - unit.y, me.x - unit.x)) * Config.DodgeRange + unit.x),
			y: Math.round(Math.sin(Math.atan2(me.y - unit.y, me.x - unit.x)) * Config.DodgeRange + unit.y)
		};

	monList = this.buildMonsterList();

	monList.sort(Sort.units);

	if (this.getMonsterCount(me.x, me.y, 15, monList) === 0) {
		return true;
	}

	CollMap.getNearbyRooms(unit.x, unit.y);

	grid = this.buildGrid(unit.x - distance, unit.x + distance, unit.y - distance, unit.y + distance, spread);

	if (!grid.length) {
		return false;
	}

	function sortGrid(a, b) {
		return getDistance(b.x, b.y, unit.x, unit.y) - getDistance(a.x, a.y, unit.x, unit.y);
	}

	grid.sort(sortGrid);

	for (i = 0; i < grid.length; i += 1) {
		if (!(CollMap.getColl(grid[i].x, grid[i].y, true) & 0x1) && !CollMap.checkColl(unit, {x: grid[i].x, y: grid[i].y}, 0x4)) {
			currCount = this.getMonsterCount(grid[i].x, grid[i].y, range, monList);

			if (currCount < count) {
				index = i;
				count = currCount;
			}

			if (currCount === 0) {
				break;
			}
		}
	}

	if (typeof index === "number") {
		return Pather.moveTo(grid[index].x, grid[index].y, 0);
	}

	return false;
};

Attack.getIntoPosition = function (unit, distance, coll, walk) {
	if (!unit || !unit.x || !unit.y) {
		return false;
	}

	if (walk === true) {
		walk = 1;
	}

	if (distance < 4 && (!unit.hasOwnProperty("mode") || (unit.mode !== 0 && unit.mode !== 12))) {
		//me.overhead("Short range");

		if (walk) {
			if (getDistance(me, unit) > 8 || checkCollision(me, unit, coll)) {
				Pather.walkTo(unit.x, unit.y, 3);
			}
		} else {
			Pather.moveTo(unit.x, unit.y, 0);
		}

		return !CollMap.checkColl(me, unit, coll);
	}

	var n, i, cx, cy, t,
		coords = [],
		fullDistance = distance,
		name = unit.hasOwnProperty("name") ? unit.name : "",
		angle = Math.round(Math.atan2(me.y - unit.y, me.x - unit.x) * 180 / Math.PI),
		angles = [0, 15, -15, 30, -30, 45, -45, 60, -60, 75, -75, 90, -90, 135, -135, 180];

	let index = ((unit.spectype & 0x7) || unit.type === 0) ? 1 : 3;
	let caster = Skill.getRange(Config.AttackSkill[index]) > 4;

	t = getTickCount();

	function sortLoc (a, b) {
		return Attack.getMobCountAtPosition(a.x, a.y, 5, false, false) - Attack.getMobCountAtPosition(b.x, b.y, 5, false, false);
	}

	for (n = 0; n < 3; n += 1) {
		if (n > 0) {
			distance -= Math.floor(fullDistance / 3 - 1);
		}

		for (i = 0; i < angles.length; i += 1) {
			cx = Math.round((Math.cos((angle + angles[i]) * Math.PI / 180)) * distance + unit.x);
			cy = Math.round((Math.sin((angle + angles[i]) * Math.PI / 180)) * distance + unit.y);

			if (Pather.checkSpot(cx, cy, 0x1, false)) {
				coords.push({x: cx, y: cy});
			}
		}

		//print("ÿc9potential spots: ÿc2" + coords.length);

		if (coords.length > 0) {
			coords.sort(Sort.units);

			if (caster) {	// Not a melee skill 
				coords.sort(sortLoc);
			}

			for (i = 0; i < coords.length; i += 1) {
				// Valid position found
				if (!CollMap.checkColl({x: coords[i].x, y: coords[i].y}, unit, coll, 1)) {
					//print("ÿc9optimal pos build time: ÿc2" + (getTickCount() - t) + " ÿc9distance from target: ÿc2" + getDistance(cx, cy, unit.x, unit.y));

					if (Math.round(getDistance(me, coords[i])) < 3) {
						return true;	// I am already in my optimal position
					}

					switch (walk) {
					case 1:
						Pather.walkTo(coords[i].x, coords[i].y, 2);

						break;
					case 2:
						if (getDistance(me, coords[i]) < 6 && !CollMap.checkColl(me, coords[i], 0x5)) {
							Pather.walkTo(coords[i].x, coords[i].y, 2);
						} else {
							Pather.moveTo(coords[i].x, coords[i].y, 1);
						}

						break;
					default:
						Pather.moveTo(coords[i].x, coords[i].y, 1);

						break;
					}

					if (caster) {
						print("Moving to: x: " + coords[i].x + " y: " + coords[i].y + " mob amount: " + Attack.getMobCountAtPosition(coords[i].x, coords[i].y, 5));
					}

					return true;
				}
			}
		}
	}

	if (name) {
		print("ÿc4Attackÿc0: No valid positions for: " + name);
	}

	return false;
};

Attack.test2 = function (unit, distance, spread, range) {
	if (arguments.length < 4) {
		throw new Error("deploy: Not enough arguments supplied");
	}

	var i, grid, index, currCount,
		tick = getTickCount(),
		monList = [],
		count = 999,
		idealPos = {
			x: Math.round(Math.cos(Math.atan2(me.y - unit.y, me.x - unit.x)) * Config.DodgeRange + unit.x),
			y: Math.round(Math.sin(Math.atan2(me.y - unit.y, me.x - unit.x)) * Config.DodgeRange + unit.y)
		};

	let hooks = [];

	monList = this.buildMonsterList();

	monList.sort(Sort.units);

	if (this.getMonsterCount(me.x, me.y, 15, monList) === 0) {
		return true;
	}

	CollMap.getNearbyRooms(unit.x, unit.y);

	grid = this.buildGrid(unit.x - distance, unit.x + distance, unit.y - distance, unit.y + distance, spread);
	grid.concat(this.buildGrid(me.x - distance, me.x + distance, me.y - distance, me.y + distance, spread));

	if (!grid.length) {
		return false;
	}

	function sortGrid(a, b) {
		return getDistance(b.x, b.y, unit.x, unit.y) - getDistance(a.x, a.y, unit.x, unit.y);
	}

	grid.sort(sortGrid);

	for (i = 0; i < grid.length; i += 1) {
		if (!(CollMap.getColl(grid[i].x, grid[i].y, true) & 0x1) && !CollMap.checkColl(unit, {x: grid[i].x, y: grid[i].y}, 0x4)) {
			//currCount = this.getMonsterCount(grid[i].x, grid[i].y, range, monList);
			currCount = this.getMobCountAtPosition(grid[i].x, grid[i].y, range);

			hooks.push(new Text(currCount.toString(), grid[i].x, grid[i].y, 0x84, 0, 0, true));

			if (currCount < count) {
				index = i;
				count = currCount;
			}

			if (currCount === 0) {
				break;
			}
		}
	}

	if (typeof index === "number") {
		return Pather.moveTo(grid[index].x, grid[index].y, 0, false);
	}

	return false;
};
