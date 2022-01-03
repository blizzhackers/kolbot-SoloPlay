/*
*	@filename	AttackOverrides.js
*	@author		theBGuy
*	@credits	jaenster, isid0re (for killTarget func)
*	@desc		Attack.js fixes to improve functionality
*/

if (!isIncluded("common/Attack.js")) { include("common/Attack.js"); }

let Coords_1 = require("../Modules/Coords");

Attack.isAuradin = false;
Attack.stopClear = false;
Attack.currentChargedSkills = [];
Attack.chargedSkillsOnSwitch = [];
Attack.MainBosses = [sdk.monsters.Andariel, sdk.monsters.Duriel, sdk.monsters.Mephisto, sdk.monsters.Diablo, sdk.monsters.Baal];
Attack.BossAndMiniBosses = [
	sdk.monsters.Andariel, sdk.monsters.Duriel, sdk.monsters.Mephisto, sdk.monsters.Diablo, sdk.monsters.Baal,
	sdk.monsters.Radament, sdk.monsters.Summoner, sdk.monsters.Izual, sdk.monsters.BloodRaven, sdk.monsters.Griswold,
	sdk.monsters.Hephasto, sdk.monsters.KorlictheProtector, sdk.monsters.TalictheDefender, sdk.monsters.MadawctheGuardian
];

Attack.init = function () {
	if (Config.Wereform) {
		include("common/Attacks/wereform.js");
	} else if (Config.CustomClassAttack && FileTools.exists('libs/common/Attacks/' + Config.CustomClassAttack + '.js')) {
		print('Loading custom attack file');
		include('common/Attacks/' + Config.CustomClassAttack + '.js');
	} else {
		if (!include("SoloPlay/Functions/ClassAttackOverrides/" + this.classes[me.classid] + "Attacks.js")) {
			print(sdk.colors.Red + "Failed to include: " + "SoloPlay/Functions/ClassAttackOverrides/" + this.classes[me.classid] + "Attacks.js");
			print(sdk.colors.Blue + "Loading default attacks instead");
			include("common/Attacks/" + this.classes[me.classid] + ".js");
		}
	}

	if (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0) {
		showConsole();
		print("ÿc1Bad attack config. Don't expect your bot to attack.");
	}

	if (me.expansion) {
		this.checkInfinity();
		this.checkIsAuradin();
		this.getPrimarySlot();
		this.getCurrentChargedSkillIds();
	}
};

Attack.getLowerResistPercent = function () {
	let calc = function (level) { return Math.floor(Math.min(25 + (45 * ((110 * level) / (level + 6)) / 100), 70))};
	if (me.expansion && Attack.chargedSkillsOnSwitch.some(chargeSkill => chargeSkill.skill === sdk.skills.LowerResist)) {
		return calc(Attack.chargedSkillsOnSwitch.find(chargeSkill => chargeSkill.skill === sdk.skills.LowerResist).level);
	}
	if (me.getSkill(sdk.skills.LowerResist, 1)) {
		return calc(me.getSkill(sdk.skills.LowerResist, 1));
	}
	return 0;
};

Attack.getConvictionPercent = function () {
	let calc = function (level) { return Math.floor(Math.min(25 + (5 * level), 150))};
	if (me.expansion && this.checkInfinity()) {
		return calc(12);
	}
	if (me.getSkill(sdk.skills.Conviction, 1)) {
		return calc(me.getSkill(sdk.skills.Conviction, 1));
	}
	return 0;
};

Attack.checkIsAuradin = function () {
	let item;

	// Check player Dragon, Dream, or HoJ
	item = me.getItem(-1, sdk.itemmode.Equipped);

	if (item) {
		do {
			if (item.getPrefix(sdk.locale.items.Dragon) || item.getPrefix(sdk.locale.items.Dream) || item.getPrefix(sdk.locale.items.HandofJustice)) {
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
	case sdk.skills.HolyFire:
		return "fire";
	case sdk.skills.HolyFreeze:
		return "cold";
	case sdk.skills.HolyShock:
		return "lightning";
	case sdk.skills.CorpseExplosion:
	case sdk.skills.Stun:
	case sdk.skills.Concentrate:
	case sdk.skills.Frenzy:
	case sdk.skills.MindBlast:
	case 500: // Summoner
		return "physical";
	case sdk.skills.HolyBolt:
		return "holybolt"; // no need to use this.elements array because it returns before going over the array
	}

	let eType = getBaseStat("skills", skillId, "etype");

	if (typeof (eType) === "number") {
		return this.elements[eType];

	}

	return false;
};

Attack.checkResist = function (unit, val, maxres) {
	if (unit === undefined || !unit || !unit.type || unit.type === sdk.unittype.Player) {
		return true;
	}

	let damageType = typeof val === "number" ? this.getSkillElement(val) : val;
	let addLowerRes = this.isCursable(unit) && !!(me.getSkill(sdk.skills.LowerResist, 1) || Attack.chargedSkillsOnSwitch.some(chargeSkill => chargeSkill.skill === sdk.skills.LowerResist));

	maxres === undefined && (maxres = 100);

	// Static handler
	if (val === sdk.skills.StaticField && this.getResist(unit, damageType) < 100) {
		return (unit.hp * 100 / 128) > Config.CastStatic;
	}

	// baal in throne room doesn't have getState
	if (this.infinity && ["fire", "lightning", "cold"].includes(damageType) && unit.getState) {
		if (!unit.getState(sdk.states.Conviction)) {
			if (addLowerRes && !unit.getState(sdk.states.LowerResist) && (unit.spectype & 0x7 || me.necromancer)) {
				let lowerResPercent = this.getLowerResistPercent();
				return (this.getResist(unit, damageType) - (Math.floor((lowerResPercent + 85) / 5))) < 100;
			}
			return this.getResist(unit, damageType) < 117;
		}

		return this.getResist(unit, damageType) < maxres;
	}

	if (this.IsAuradin && ["physical", "fire", "cold", "lightning"].includes(damageType) && me.getState(sdk.states.Conviction) && unit.getState) {
		let valid = false;

		// our main dps is not physical despite using zeal
		if (damageType === "physical") { return true; }

		if (!unit.getState(sdk.states.Conviction)) {
			return (this.getResist(unit, damageType) - (this.getConvictionPercent() / 5) < 100);
		}

		// check unit's fire resistance
		if (me.getState(sdk.states.HolyFire)) {
			valid = this.getResist(unit, "fire") < maxres;
		}

		// check unit's light resistance but only if the above check failed
		if (me.getState(sdk.states.HolyShock) && !valid) {
			valid = this.getResist(unit, "lightning") < maxres;
		}

		// TODO: maybe if still invalid at this point check physical resistance? Although if we are an auradin our physcial dps is low

		return valid;
	}

	if (addLowerRes && ["fire", "lightning", "cold", "poison"].includes(damageType) && unit.getState) {
		let lowerResPercent = this.getLowerResistPercent();
		if (!unit.getState(sdk.states.LowerResist) && (unit.spectype & 0x7 || me.necromancer)) {
			return (this.getResist(unit, damageType) - (Math.floor(lowerResPercent / 5)) < 100);
		}
	}

	return this.getResist(unit, damageType) < maxres;
};

Attack.canAttack = function (unit) {
	if (unit.type === sdk.unittype.Monster) {
		// Unique/Champion
		if (unit.spectype & 0x7) {
			if (Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[1])) || Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[2]))) {
				return true;
			}
		} else {
			if (Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[3])) || Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[4]))) {
				return true;
			}
		}

		if (Config.AttackSkill.length === 7) {
			return Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[5])) || Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[6]));
		}
	}

	return false;
};

Attack.isCursable = function (unit) {
	if (unit === undefined || !unit) { return false; }
	if (copyUnit(unit).name === undefined || unit.name.indexOf(getLocaleString(11086)) > -1) { // "Possessed"
		return false;
	}

	// attract can't be overridden
	if (unit.getState(sdk.states.Attract)) {
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

Attack.openChests = function (range, x, y) {
	if (!Config.OpenChests) { return false; }
	range === undefined && (range = 10);
	x === undefined && (x = me.x);
	y === undefined && (y = me.y);

	let mobs = getUnits(sdk.unittype.Monster)
		.filter(mob => !!mob && mob.attackable && mob.distance < 7);
	if (mobs.length > 1) { return false; }

	let unit,
		list = [],
		ids = ["chest", "chest3", "weaponrack", "armorstand"];

	unit = getUnit(2);

	if (unit) {
		do {
			if (unit.name && getDistance(unit, x, y) <= range && ids.indexOf(unit.name.toLowerCase()) > -1) {
				list.push(copyUnit(unit));
			}
		} while (unit.getNext());
	}

	while (list.length) {
		list.sort(Sort.units);

		if (Misc.openChest(list.shift())) {
			Pickit.pickItems();
		}
	}

	return true;
};

Attack.killTarget = function (name) {
	let target,	attackCount = 0;

	typeof name === "string" && (name = name.toLowerCase());

	for (let i = 0; !target && i < 5; i++) {
		target = getUnit(sdk.unittype.Monster, name);
		if (target) { break; }
		delay(200);
	}

	if (!target) {
		print("ÿc8KillTargetÿc0 :: " + name + " not found. Performing Attack.Clear(25)");
		Attack.clear(25);
		Pickit.pickItems();

		return true;
	}

	// exit if target is immune
	if (target && !Attack.canAttack(target)) {
		print("ÿc8KillTargetÿc0 :: Attack failed. " + target.name + " is immune.");

		return true;
	}

	let gid = target.gid;

	while (attackCount < Config.MaxAttackCount) {
		if (Misc.townCheck()) {
			if (!target || !copyUnit(target).x) {
				target = Misc.poll(function () { return getUnit(sdk.unittype.Monster, name); }, 15e3, 30);
			}
		}

		// Check if unit got invalidated, happens if necro raises a skeleton from the boss's corpse.
		if (!target || !copyUnit(target).x) {
			target = getUnit(1, -1, -1, gid);

			if (!target) {
				break;
			}
		}

		me.overhead("KillTarget: " + target.name + " health " + ((target.hp / target.hpmax) * 100) + " % left");

		if (Config.Dodge && me.hpPercent <= Config.DodgeHP) {
			this.deploy(target, Config.DodgeRange, 5, 9);
		}

		if (attackCount > 0 && attackCount % 15 === 0 && Skill.getRange(Config.AttackSkill[1]) < 4) {
			Packet.flash(me.gid);
		}

		if (!ClassAttack.doAttack(target, attackCount % 15 === 0)) {
			Packet.flash(me.gid);
		}

		attackCount += 1;

		// spectype check from isid0re SoloLeveling commit 44d25cb
		if (!target || !copyUnit(target).x || target.dead || target.spectype === 0) {
			break;
		}
	}

	ClassAttack.afterAttack();
	if (!target || !copyUnit(target).x || target.dead || target.spectype === 0) {
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

Attack.clearPos = function (x, y, range, pickit) {
	while (!me.gameReady) {
		delay(40);
	}

	range === undefined && (range = 15);
	pickit === undefined && (pickit = true);

	if (typeof (range) !== "number") { throw new Error("Attack.clear: range must be a number."); }
	if (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0) { return false; }
	if (Attack.stopClear) { return false; }

	let i, target, result, start, coord, skillCheck, secAttack,
		retry = 0,
		monsterList = [],
		gidAttack = [],
		attackCount = 0;

	target = getUnit(1);

	if (target) {
		do {
			if (this.checkMonster(target) && this.skipCheck(target) && this.canAttack(target)) {
				// Speed optimization - don't go through monster list until there's at least one within clear range
				if (!start && getDistance(target, x, y) <= range &&
						(Pather.useTeleport() || !checkCollision(me, target, 0x1))) {
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
			if (Config.Dodge && me.hpPercent <= Config.DodgeHP) {
				this.deploy(target, Config.DodgeRange, 5, 9);
			}

			Misc.townCheck(true);
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

				if (me.barbarian) {
					secAttack = (target.spectype & 0x7) ? 2 : 4;
				} else {
					secAttack = 5;
				}

				if (Config.AttackSkill[secAttack] > -1 && (!Attack.checkResist(target, Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3]) ||
						(me.paladin && Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3] === 112 && !ClassAttack.getHammerPosition(target)))) {
					skillCheck = Config.AttackSkill[secAttack];
				} else {
					skillCheck = Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3];
				}

				// Desync/bad position handler
				switch (skillCheck) {
				case sdk.skills.BlessedHammer:
					// Tele in random direction with Blessed Hammer
					if (gidAttack[i].attacks > 0 && gidAttack[i].attacks % ((target.spectype & 0x7) ? 4 : 2) === 0) {
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
				if (me.area !== sdk.areas.ThroneofDestruction && !(target.spectype & 0x7) && gidAttack[i].attacks > 15) {
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

Attack.buildMonsterList = function (skipBlocked) {
	let monster, monList = [];

	skipBlocked === true && (skipBlocked = 0x4);

	monster = getUnit(1);

	if (monster) {
		do {
			if (this.checkMonster(monster)) {
				monList.push(copyUnit(monster));
			}
		} while (monster.getNext());
	}

	if (skipBlocked === 0x4) {
		return monList.filter(mob => !checkCollision(me, mob, skipBlocked));
	}

	return monList;
};

Attack.getMobCountAtPosition = function (x, y, range, filter = false, debug = true) {
	let i,
		list = [],
		count = 0,
		ignored = [243];

	list = this.buildMonsterList(true);
	list.sort(Sort.units);
	debug = Developer.debugging.pathing;

	if (filter) {
		list = list.filter(mob => mob.spectype === 0);
	}

	for (i = 0; i < list.length; i++) {
		if (ignored.indexOf(list[i].classid) === -1 && this.checkMonster(list[i]) && getDistance(x, y, list[i].x, list[i].y) <= range) {
			count += 1;
		}
	}

	if (debug) {
		print(sdk.colors.Yellow + "getMobCountAtPosition :: " + sdk.colors.White + count + " monsters at x: " + x + " y: " + y);
	}

	return count;
};

// Clear an entire area based on monster spectype
Attack.clearLevel = function (spectype) {
	let room, result, rooms, myRoom, currentArea, previousArea;
	spectype === undefined && (spectype = 0);

	function RoomSort(a, b) {
		return getDistance(myRoom[0], myRoom[1], a[0], a[1]) - getDistance(myRoom[0], myRoom[1], b[0], b[1]);
	}

	room = getRoom();

	if (!room) { return false; }

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
		} else if (currentArea !== getArea().id) {
			// Make sure bot does not get stuck in different area.
			Pather.moveTo(previousArea[0], previousArea[1], 3, spectype);
		}
	}

	return true;
};

// Clear an entire area until area is done or level is reached
Attack.clearLevelUntilLevel = function (charlvl, spectype) {
	let room, result, rooms, myRoom, currentArea, previousArea;
	charlvl === undefined && (charlvl = me.charlvl + 1);
	spectype === undefined && (spectype = 0);

	function RoomSort(a, b) {
		return getDistance(myRoom[0], myRoom[1], a[0], a[1]) - getDistance(myRoom[0], myRoom[1], b[0], b[1]);
	}

	room = getRoom();

	if (!room) { return false; }

	rooms = [];

	currentArea = getArea().id;

	do {
		rooms.push([room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2]);
	} while (room.getNext());

	print("ÿc8Kolbot-SoloPlayÿc0: Starting Clear until level My level: " + me.charlvl + " wanted level: " + charlvl);
	me.overhead("Starting Clear until level My level: " + me.charlvl + " wanted level: " + charlvl);

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

			if (Attack.stopClear) {
				Attack.stopClear = false;	// Reset value
				return true;
			}

			if (me.charlvl >= charlvl) {
				print("ÿc8Kolbot-SoloPlayÿc0: Clear until level requirment met. My level: " + me.charlvl + " wanted level: " + charlvl);
				me.overhead("Clear until level requirment met. My level: " + me.charlvl + " wanted level: " + charlvl);
				return true;
			}

			if (!this.clear(40, spectype)) {
				break;
			}
		} else if (currentArea !== getArea().id) {
			// Make sure bot does not get stuck in different area.
			Pather.moveTo(previousArea[0], previousArea[1], 3, spectype);
		}
	}

	return true;
};

// Clear monsters in a section based on range and spectype or clear monsters around a boss monster
// probably going to change to passing an object
Attack.clear = function (range, spectype, bossId, sortfunc, pickit) {
	while (!me.gameReady) {
		delay(40);
	}

	range === undefined && (range = 25);
	spectype === undefined && (spectype = 0);
	bossId === undefined && (bossId = false);
	sortfunc === undefined && (sortfunc = this.sortMonsters);
	pickit === undefined && (pickit = true);

	if (typeof (range) !== "number") { throw new Error("Attack.clear: range must be a number."); }
	if (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0) { return false; }
	if (Attack.stopClear) { return false; }

	let i, boss, orgx, orgy, target, result, monsterList, start, coord, skillCheck, secAttack,
		retry = 0,
		gidAttack = [],
		attackCount = 0;

	if (bossId) {
		for (i = 0; !boss && i < 5; i++) {
			boss = bossId > 999 ? getUnit(sdk.unittype.Monster, -1, -1, bossId) : getUnit(sdk.unittype.Monster, bossId);

			delay(200);
		}

		if (!boss) {
			print("Attack.clear: " + bossId + " not found");

			orgx = me.x;
			orgy = me.y;
		} else {
			orgx = boss.x;
			orgy = boss.y;
		}
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
						(Pather.canTeleport() || !Scripts.Follower || !checkCollision(me, target, 0x1))) {
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

		if (me.dead || Attack.stopClear) { return false; }

		monsterList.sort(sortfunc);
		target = copyUnit(monsterList[0]);

		if ([29, 30, 31].indexOf(me.area) > -1 && me.amazon && me.hell) {
			if ([11, 12, 13, 14].indexOf(target.classid) > -1) {
				Attack.stopClear = true;
			}
		}

		if (target.x !== undefined && (getDistance(target, orgx, orgy) <= range || (this.getScarinessLevel(target) > 7 && target.distance <= range)) && this.checkMonster(target)) {
			if (Config.Dodge && me.hpPercent <= Config.DodgeHP) {
				this.deploy(target, Config.DodgeRange, 5, 9);
			}

			Misc.townCheck(true);
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

				if (me.barbarian) {
					secAttack = (target.spectype & 0x7) ? 2 : 4;
				} else {
					secAttack = 5;
				}

				if (Config.AttackSkill[secAttack] > -1 && (!Attack.checkResist(target, Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3]) ||
						(me.paladin && Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3] === sdk.skills.BlessedHammer && !ClassAttack.getHammerPosition(target)))) {
					skillCheck = Config.AttackSkill[secAttack];
				} else {
					skillCheck = Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3];
				}

				// Desync/bad position handler
				switch (skillCheck) {
				case sdk.skills.BlessedHammer:
					// Tele in random direction with Blessed Hammer
					if (gidAttack[i].attacks > 0 && gidAttack[i].attacks % ((target.spectype & 0x7) ? 4 : 2) === 0) {
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
				if (me.area !== sdk.areas.ThroneofDestruction && !(target.spectype & 0x7) && gidAttack[i].attacks > 15) {
					print("ÿc1Skipping " + target.name + " " + target.gid + " " + gidAttack[i].attacks);
					monsterList.shift();
				}

				if (target.mode === 0 || target.mode === 12 || Config.FastPick === 2) {
					Pickit.fastPick();
				}
			} else {
				if (Coords_1.isBlockedBetween(me, target)) {
					print("ÿc1Skipping " + target.name + " because they are blocked. Collision: " + Coords_1.getCollisionBetweenCoords(me.x, me.y, target.x, target.y).toString(16));
					monsterList.shift();
					retry = 0;
				}

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

// Sort monsters based on distance, spectype and classId (summoners are attacked first)
Attack.sortMonsters = function (unitA, unitB) {
	// No special sorting for were-form
	if (Config.Wereform) {
		return getDistance(me, unitA) - getDistance(me, unitB);
	}

	// Barb optimization
	if (me.barbarian) {
		if (!Attack.checkResist(unitA, Attack.getSkillElement(Config.AttackSkill[(unitA.spectype & 0x7) ? 1 : 3]))) {
			return 1;
		}

		if (!Attack.checkResist(unitB, Attack.getSkillElement(Config.AttackSkill[(unitB.spectype & 0x7) ? 1 : 3]))) {
			return -1;
		}
	}

	// Baal optimization
	if (me.area === sdk.areas.WorldstoneChamber) {
		if (unitA.classid === sdk.monsters.Baal) {
			return -1;
		}

		if (unitB.classid === sdk.monsters.Baal) {
			return 1;
		}
	}

	// Put monsters under Attract curse at the end of the list - They are helping us
	if (unitA.getState(sdk.states.Attract)) {
		return 1;
	}

	if (unitB.getState(sdk.states.Attract)) {
		return -1;
	}

	// Added Oblivion Knights
	let ids = [312, 58, 59, 60, 61, 62, 101, 102, 103, 104, 105, 278, 279, 280, 281, 282, 298, 299, 300, 645, 646, 647, 662, 663, 664, 667, 668, 669, 670, 675, 676];

	if (me.area !== sdk.areas.ClawViperTempleLvl2 && ids.indexOf(unitA.classid) > -1 && ids.indexOf(unitB.classid) > -1) {
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

// Take a array of coords - path and clear
// pick parameter is range of items to pick
// From legacy sonic
Attack.clearCoordList = function (list, pick) {
	for (let node of list) {
		Attack.clear(node.radius);
		Pather.moveTo(node.x, node.y);
		Attack.clear(node.radius);

		if (pick) {
			Pickit.pickItems(pick);
		}
	}
};

Attack.getCurrentChargedSkillIds = function () {
	// Reset values
	Attack.currentChargedSkills = [];
	Attack.chargedSkillsOnSwitch = [];

	// Item must be equipped, or a charm in inventory
	me.getItems(-1)
		.filter(item => item && (item.isEquipped || (item.isInInventory && [sdk.itemtype.SmallCharm, sdk.itemtype.MediumCharm, sdk.itemtype.LargeCharm].includes(item.itemType))))
		.forEach(function (item) {
			let stats = item.getStat(-2);

			if (stats.hasOwnProperty(204)) {
				if (stats[204] instanceof Array) {
					for (let i = 0; i < stats[204].length; i += 1) {
						if (stats[204][i] !== undefined) {
							// add to total list
							if (stats[204][i].charges > 0 && !Attack.currentChargedSkills.includes(stats[204][i].skill)) {
								Attack.currentChargedSkills.push(stats[204][i].skill);
							}

							// add to switch only list for use with swtich casting
							if (stats[204][i].charges > 0 && !Attack.chargedSkillsOnSwitch.some(chargeSkill => chargeSkill.skill === stats[204][i].skill) && item.isOnSwap) {
								Attack.chargedSkillsOnSwitch.push({skill: stats[204][i].skill, level: stats[204][i].level});
							}
						}
					}
				} else {
					// add to total list
					if (stats[204].charges > 0 && !Attack.currentChargedSkills.includes(stats[204].skill)) {
						Attack.currentChargedSkills.push(stats[204].skill);
					}

					// add to switch only list for use with swtich casting
					if (stats[204].charges > 0 && !Attack.chargedSkillsOnSwitch.some(chargeSkill => chargeSkill.skill === stats[204].skill) && item.isOnSwap) {
						Attack.chargedSkillsOnSwitch.push({skill: stats[204].skill, level: stats[204].skill});
					}
				}
			}
		});

	return true;
};

Attack.getItemCharges = function (skillId) {
	if (skillId === undefined || !skillId) {
		return false;
	}

	let chargedItems = [], validCharge = function (itemCharge) {
		return itemCharge.skill === skillId && itemCharge.charges > 1;
	};

	// Item must equipped, or a charm in inventory
	me.getItems(-1)
		.filter(item => item && (item.isEquipped || (item.isInInventory && [sdk.itemtype.SmallCharm, sdk.itemtype.MediumCharm, sdk.itemtype.LargeCharm].indexOf(item.itemType) > -1)))
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

Attack.castCharges = function (skillId, unit) {
	if (skillId === undefined || unit === undefined || !Skill.wereFormCheck(skillId) || (me.inTown && !Skill.townSkill(skillId))) {
		return false;
	}

	me.castChargedSkill(skillId, unit);

	if (me.weaponswitch === 1) {
		me.switchWeapons(0);
	}

	return true;
};

Attack.switchCastCharges = function (skillId, unit) {
	if (skillId === undefined || unit === undefined || !Skill.wereFormCheck(skillId) || (me.inTown && !Skill.townSkill(skillId))) {
		return false;
	}

	me.castSwitchChargedSkill(skillId, unit);

	if (me.weaponswitch === 1) {
		me.switchWeapons(0);
	}

	return true;
};

Attack.throwPotion = function (unit) {
	if (!unit || unit === undefined) {
		return false;
	}

	me.switchWeapons(0);

	let onSwap = false;
	let throwPotion = me.getItems()
		.filter(item => item.mode === 1 && item.itemType === 38 && item.getStat(70))
		.last();

	if (!!throwPotion) {
		if ([11, 12].indexOf(throwPotion.bodylocation) && me.weaponswitch === 0) {
			me.switchWeapons(1);
			onSwap = true;
		}

		Skill.cast(2, 1, unit);

		if (onSwap) {
			me.switchWeapons(0);
		}
	} else {
		return false;
	}

	return true;
};

Attack.dollAvoid = function (unit) {
	let i, cx, cy,
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
	let nodes = getPath(area, me.x, me.y, spot.x, spot.y, 2, 5);
	if (!nodes) { return { x: me.x, y: me.y }; }
	return nodes.find(function (node) { return getDistance(spot, node) < distance; }) || { x: me.x, y: me.y };
};

 // Its the inverse of spotOnDistance, its a spot going in the direction of the spot
Attack.inverseSpotDistance = function (spot, distance, otherSpot) {
    if (otherSpot === void 0) { otherSpot = me; }
    let x = otherSpot.x, y = otherSpot.y, area = otherSpot.area;
    let nodes = getPath(area, x, y, spot.x, spot.y, 2, 5);
    return nodes && nodes.find(function (node) { return node.distance > distance; }) || { x: x, y: y };
};

Attack.shouldDodge = function (coord, monster) {
	return !!monster && getUnits(3)
		// for every missle that isnt from our merc
		.filter(missile => missile && monster && monster.gid === missile.owner)
		// if any
		.some(missile => {
			let xoff = Math.abs(coord.x - missile.targetx),
				yoff = Math.abs(coord.y - missile.targety),
				xdist = Math.abs(coord.x - missile.x),
				ydist = Math.abs(coord.y - missile.y);

			// If missile wants to hit is and is close to us
			return xoff < 7 && yoff < 7 && xdist < 13 && ydist < 13;
		});
};

Attack.pwnMeph = function () {
	// TODO: fill out
};

// Credit @Jaenster - modified by me(theBGuy) for other classes
Attack.pwnDia = function () {
	// Can't farcast if our skill main attack isn't meant for it
	if ((!me.sorceress && !me.necromancer && !me.assassin) || (["Poison", "Summon"].includes(SetUp.currentBuild)) || (Skill.getRange(Config.AttackSkill[1]) < 10)) {
		return false;
	}

	let calculateSpots = function (center, skillRange) {
		let coords = [];
		for (let i = 0; i < 360; i++) {
			coords.push({
				x: Math.floor(center.x + skillRange * Math.cos(i) + 0.5),
				y: Math.floor(center.y + skillRange * Math.sin(i) + 0.5),
			});
		}
		return coords.filter(function (e, i, s) { return s.indexOf(e) === i; }) // only unique spots
			.filter(function (el) { return Attack.validSpot(el.x, el.y); });
	};

	let checkMobs = function () {
		getUnits(1).some(function(el) {
	    	if (el === undefined) { return false; }
	    	return el.attackable && el.classid !== sdk.monsters.Diablo && el.distance < 20;
	    });
	} 

	let getDiablo = function () { checkMobs() && (Attack.clear(20)); return getUnit(sdk.unittype.Monster, sdk.monsters.Diablo); };
	{
		let nearSpot = Attack.spotOnDistance({ x: 7792, y: 5292 }, 35);
		Pather.moveToUnit(nearSpot);
	}

	let dia = Misc.poll(getDiablo, 15e3, 30);

	if (!dia) {
		// Move to Star
		Pather.moveTo(7788, 5292, 3, 30);
		dia = Misc.poll(getDiablo, 15e3, 30);
	}

	if (!dia) {
		print("No diablo");
		return false;
	}

	let tick = getTickCount();
	let lastPosition = { x: 7791, y: 5293 };
	let minRange, minDist, maxRange, maxDist;
	let manaTP, manaSK, manaStatic, rangeStatic;

	// set values
	switch (me.classid) {
	case sdk.charclass.Sorceress:
		manaTP = Skill.getManaCost(sdk.skills.Teleport);
		manaSK = Skill.getManaCost(Config.AttackSkill[1]);
		manaStatic = Skill.getManaCost(sdk.skills.StaticField);
		rangeStatic = Skill.getRange(sdk.skills.StaticField);

		switch (Config.AttackSkill[1]) {
		case sdk.skills.FrozenOrb:
			minDist = 15;
			maxDist = 20;
			minRange = 10;
			maxRange = 20;

			break;
		case sdk.skills.Lightning:
			minDist = 20;
			maxDist = 25;
			minRange = 18;
			maxRange = 25;

			break;
		case sdk.skills.Blizzard:
		case sdk.skills.Meteor:
			minDist = 40;
			maxDist = 45;
			minRange = 15;
			maxRange = 58;

			break;
		}

		break;
	case sdk.charclass.Necromancer:
		minDist = 35;
		maxDist = 40;
		minRange = 15;
		maxRange = 50;

		break;
	case sdk.charclass.Assassin:
		minDist = 25;
		maxDist = 30;
		minRange = 15;
		maxRange = 30;

		break;	
	}
	
	Attack.stopClear = true;

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

			if (getDistance(me, dia) < minDist || getDistance(me, dia) > maxDist || getTickCount() - tick > 25e3) {
				let spot = calculateSpots(dia, ((minRange + maxRange) / 2))
					.filter(function (loc) { return getDistance(me, loc) > minRange && getDistance(me, loc) < maxRange; } /*todo, in neighbour room*/)
					.filter(function (loc) {
						let collision = getCollision(me.area, loc.x, loc.y);
						// noinspection JSBitwiseOperatorUsage
						let isLava = !!(collision & Coords_1.BlockBits.IsOnFloor);
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
					if (me.gold < 10000 && me.sorceress) {
						Pather.walkTo(spot.x, spot.y);
					} else {
						Pather.moveTo(spot.x, spot.y, 15, false);
					}
				}
			}

			if (me.sorceress && me.mp < manaSK + manaTP) {
                me.overhead('Dont attack, save mana for teleport');
                delay(10);
                continue;
            }

			if (me.necromancer || me.assassin) {
				me.overhead("FarCasting: Diablo's health " + dia.hpPercent + " % left");
				ClassAttack.farCast(dia);
			} else {
				// If we got enough mana to teleport close to diablo, static the bitch, and jump back
                let diabloMissiles = getUnits(3).filter(function (unit) { var _a; return ((_a = unit.getParent()) === null || _a === void 0 ? void 0 : _a.gid) === dia.gid; });
                print('Diablo missiles: ' + diabloMissiles.length);
                print('Diablo mode:' + dia.mode);
                me.overhead('Dia life ' + (~~(dia.hp / 128 * 100)).toString() + '%');
                if (me.mp > manaStatic + manaTP + manaTP && diabloMissiles.length < 3 && ![4, 5, 7, 8, 9, 10, 11].includes(dia.mode) && dia.hpPercent > Config.CastStatic) {
                    let x = me.x, y = me.y;
                    // Find a spot close to Diablo
                    let spot = Attack.spotOnDistance(dia, rangeStatic * (2 / 3));
                    Pather.moveTo(spot.x, spot.y);
                    Skill.cast(sdk.skills.StaticField);
                    // Walk randomly away from diablo
                    let randFn = function (v) { return function () { return v + rand(0, 20) - 10; }; };
                    let rX = randFn(x), rY = randFn(y);
                    [
                        Attack.inverseSpotDistance({ x: x, y: y }, 3),
                        Attack.inverseSpotDistance({ x: rX(), y: rY() }, 5),
                        Attack.inverseSpotDistance({ x: rX(), y: rY() }, 7),
                        Attack.inverseSpotDistance({ x: rX(), y: rY() }, 10),
                    ].forEach(function (_a) {
                        var x = _a.x, y = _a.y;
                        return Misc.click(0, 0, x, y);
                    });
                    Pather.moveTo(x, y);
                }
				Skill.cast(Config.AttackSkill[1], 0, dia);

				if (!!dia && !checkCollision(me, dia, Coords_1.Collision.BLOCK_MISSILE) && Skill.getRange(Config.AttackSkill[2]) > 15) {
					Skill.cast(Config.AttackSkill[2], 0, dia);
				}
			}
		}

		if (dia && dia.dead) {
			break;
		}

		if (!dia) {
			let path = getPath(me.area, me.x, me.y, lastPosition.x, lastPosition.y, 1, 5);

			// failed to make a path from me to the old spot
			if (!path) { break; }

			// walk close to old node, if we dont find dia continue
			if (!path.some(function (node) {
				Pather.walkTo(node.x, node.y);
				return getDiablo();
			})) {
				break;
			}
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
	Attack.stopClear = false;

	return dia;
};

Attack.getNearestMonster = function (skipBlocked = false) {
	let gid, distance,
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
		monster = getUnit(sdk.unittype.Monster, -1, -1, gid);
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

	let grid, index, currCount,
		monList = [],
		count = 999;
		/* idealPos = {
			x: Math.round(Math.cos(Math.atan2(me.y - unit.y, me.x - unit.x)) * Config.DodgeRange + unit.x),
			y: Math.round(Math.sin(Math.atan2(me.y - unit.y, me.x - unit.x)) * Config.DodgeRange + unit.y)
		}; */

	monList = this.buildMonsterList();

	monList.sort(Sort.units);

	if (this.getMonsterCount(me.x, me.y, 15, monList) === 0) {
		return true;
	}

	CollMap.getNearbyRooms(unit.x, unit.y);

	grid = this.buildGrid(unit.x - distance, unit.x + distance, unit.y - distance, unit.y + distance, spread);

	if (!grid.length) { return false; }

	function sortGrid(a, b) {
		return getDistance(b.x, b.y, unit.x, unit.y) - getDistance(a.x, a.y, unit.x, unit.y);
	}

	grid.sort(sortGrid);

	for (let i = 0; i < grid.length; i += 1) {
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

Attack.getIntoPosition = function (unit, distance, coll, walk, force) {
	if (!unit || !unit.x || !unit.y) { return false; }

	walk === true && (walk = 1);
	force == undefined && (force = false);
	
	if (distance < 4 && (!unit.hasOwnProperty("mode") || (unit.mode !== 0 && unit.mode !== 12))) {
		if (walk) {
			if (getDistance(me, unit) > 8 || checkCollision(me, unit, coll)) {
				Pather.walkTo(unit.x, unit.y, 3);
			}
		} else {
			Pather.moveTo(unit.x, unit.y, 0);
		}

		return !CollMap.checkColl(me, unit, coll);
	}

	let cx, cy, currCount, count = 999, potentialSpot = {x: undefined, y: undefined},
		coords = [],
		fullDistance = distance,
		name = unit.hasOwnProperty("name") ? unit.name : "",
		angle = Math.round(Math.atan2(me.y - unit.y, me.x - unit.x) * 180 / Math.PI),
		angles = [0, 15, -15, 30, -30, 45, -45, 60, -60, 75, -75, 90, -90, 135, -135, 180];

	let index = ((unit.spectype & 0x7) || unit.type === 0) ? 1 : 3;
	let caster = force && !me.inTown;

	//let t = getTickCount();

	for (let n = 0; n < 3; n += 1) {
		if (n > 0) {
			distance -= Math.floor(fullDistance / 3 - 1);
		}

		for (let i = 0; i < angles.length; i += 1) {
			cx = Math.round((Math.cos((angle + angles[i]) * Math.PI / 180)) * distance + unit.x);
			cy = Math.round((Math.sin((angle + angles[i]) * Math.PI / 180)) * distance + unit.y);

			if (Pather.checkSpot(cx, cy, 0x1, false)) {
				coords.push({x: cx, y: cy});
			}
		}

		//print("ÿc9potential spots: ÿc2" + coords.length);

		if (coords.length > 0) {
			coords.sort(Sort.units);

			for (let i = 0; i < coords.length; i += 1) {
				// Valid position found
				if (!CollMap.checkColl({x: coords[i].x, y: coords[i].y}, unit, coll, 1)) {
					//print("ÿc9optimal pos build time: ÿc2" + (getTickCount() - t) + " ÿc9distance from target: ÿc2" + getDistance(cx, cy, unit.x, unit.y));
					currCount = coords[i].mobCount(7);

					if (caster) {
						potentialSpot.x !== undefined && (potentialSpot = {x: coords[i].x, y: coords[i].y});

						if (currCount < count) {
							count = currCount;
							potentialSpot = {x: coords[i].x, y: coords[i].y};
							Developer.debugging.pathing	&& (print(sdk.colors.Blue + "CheckedSpot" + sdk.colors.Yellow + ": x: " + coords[i].x + " y: " + coords[i].y + " mob amount: " + sdk.colors.NeonGreen + count));
						}

						if (currCount !== 0) {
							Developer.debugging.pathing	&& (print(sdk.colors.Red + "Not Zero, check next: currCount: " + sdk.colors.NeonGreen + " " + currCount));
							continue;
						}
					}

					// I am already in my optimal position
					if (Math.round(getDistance(me, coords[i])) < 3) {
						return true;
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

					Developer.debugging.pathing && (print(sdk.colors.Purple + "SecondCheck :: " + sdk.colors.Yellow + "Moving to: x: " + coords[i].x + " y: " + coords[i].y + " mob amount: " + sdk.colors.NeonGreen + currCount));

					return true;
				}
			}
		}
	}

	if (caster && potentialSpot.x !== undefined) {
		if (potentialSpot.distance < 3) { return true; }
		if (Pather.useTeleport()) {
			Pather.teleportTo(potentialSpot.x, potentialSpot.y);
		} else {
			switch (walk) {
			case 1:
				Pather.walkTo(potentialSpot.x, potentialSpot.y, 2);

				break;
			case 2:
				if (potentialSpot.distance < 6 && !CollMap.checkColl(me, potentialSpot, 0x5)) {
					Pather.walkTo(potentialSpot.x, potentialSpot.y, 2);
				} else {
					Pather.moveTo(potentialSpot.x, potentialSpot.y, 1);
				}

				break;
			default:
				Pather.moveTo(potentialSpot.x, potentialSpot.y, 1);

				break;
			}
		}

		Developer.debugging.pathing && (print(sdk.colors.Orange + "DefaultCheck :: " + sdk.colors.Yellow + "Moving to: x: " + potentialSpot.x + " y: " + potentialSpot.y + " mob amount: " + sdk.colors.NeonGreen + count));

		return true;
	}

	if (name) {
		print("ÿc4Attackÿc0: No valid positions for: " + name);
	}

	return false;
};

Attack.castableSpot = function (x, y) {
	let result;

	// Just in case
	if (!me.area || !x || !y) {
		return false;
	}

	try { // Treat thrown errors as invalid spot
		result = getCollision(me.area, x, y);
	} catch (e) {
		return false;
	}

	
	return !(result === undefined || !!(result & Coords_1.BlockBits.Casting) || !!(result & Coords_1.Collision.BLOCK_MISSILE) || (result & 0x400) || (result & 0x1));
};

Attack.test = function () {
	return true;
};

Attack.test2 = function (unit, distance, coll, walk, force) {
	
};
