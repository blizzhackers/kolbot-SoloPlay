/**
*  @filename    baal.js
*  @author      theBGuy
*  @author      sonic
*  @desc        clear throne and kill baal
*
*/

function baal () {
	Config.BossPriority = false;

	let decoyTick = 0;
	let decoyDuration = (me.amazon ? Skill.getDuration(sdk.skills.Decoy) : 0);

	let preattack = function () {
		switch (me.classid) {
		case sdk.charclass.Amazon:
			if (me.getSkill(sdk.skills.Decoy, 1)) {
				let decoy = getUnit(1, 356);

				if (!decoy || (getTickCount() - decoyTick >= decoyDuration)) {
					Skill.cast(sdk.skills.Decoy, 0, 15092, 5028);
					decoyTick = getTickCount();
				}
			}

			break;
		case sdk.charclass.Sorceress:
			if ([sdk.skills.Meteor, sdk.skills.Blizzard, sdk.skills.FrozenOrb].includes(Config.AttackSkill[1])) {
				if (me.getState(sdk.states.SkillDelay)) {
					delay(50);
				} else {
					Skill.cast(Config.AttackSkill[1], 0, 15093, 5024);
				}
			}

			return true;
		case sdk.charclass.Paladin:
			if (Config.AttackSkill[3] !== sdk.skills.BlessedHammer) {
				return false;
			}

			if (getDistance(me, 15093, 5029) > 3) {
				Pather.moveTo(15093, 5029);
			}

			if (Config.AttackSkill[4] > 0) {
				Skill.setSkill(Config.AttackSkill[4], 0);
			}

			Skill.cast(Config.AttackSkill[3], 1);

			return true;
		case sdk.charclass.Druid:
			if ([sdk.skills.Tornado, sdk.skills.Fissure, sdk.skills.Volcano].includes(Config.AttackSkill[3])) {
				Skill.cast(Config.AttackSkill[3], 0, 15093, 5029);

				return true;
			}

			break;
		case sdk.charclass.Assassin:
			if (Config.UseTraps) {
				let check = ClassAttack.checkTraps({x: 15093, y: 5029});

				if (check) {
					ClassAttack.placeTraps({x: 15093, y: 5029}, 5);

					return true;
				}
			}

			break;
		}

		return false;
	};

	let clearWaves = function () {
		let boss;
		let tick = getTickCount();

		MainLoop:
		while (true) {
			if (!getUnit(1, 543)) {
				break;
			}

			Misc.townCheck();

			switch (Common.Baal.checkThrone()) {
			case 1:
				Attack.clearClassids(23, 62);

				tick = getTickCount();

				break;
			case 2:
				boss = getUnit(1, "Achmel the Cursed");

				if (boss && !Attack.canAttack(boss)) {
					me.overhead("immune achmel");
					return false;
				}

				Attack.clearClassids(105, 381);

				tick = getTickCount();

				break;
			case 4:
				Attack.clearClassids(558);

				tick = getTickCount();

				break;
			case 3:
				Attack.clearClassids(557);

				tick = getTickCount();

				break;
			case 5:
				boss = getUnit(1, "Lister the Tormentor");

				if (boss && !Attack.canAttack(boss)) {
					me.overhead("immune lister");
					return false;
				}

				Attack.clearClassids(sdk.monsters.ListerTheTormenter, sdk.monsters.Minion1, sdk.monsters.Minion2);

				break MainLoop;
			default:
				if (getTickCount() - tick < 7e3) {
					if (me.paladin && me.getState(sdk.states.Poison)) {
						Skill.setSkill(sdk.skills.Cleansing, 0);
					}
				}

				if (getTickCount() - tick > 20000) {
					tick = getTickCount();
					Common.Baal.clearThrone();
				}

				if (!preattack()) {
					delay(50);
				}

				break;
			}

			// Thanks aim2kill
			if (me.barbarian ? getDistance(me, 15112, 5062) : getDistance(me, 15116, 5026) > 3) {
				me.barbarian ? Pather.moveTo(15112, 5062) : Pather.moveTo(15116, 5026);
			}

			// If we've been in the throne for 30 minutes that's way too long
			if (getTickCount() - totalTick > 30 * 60000) {
				return false;
			}

			delay(10);
		}

		return true;
	};

	let unSafeCheck = function (soulAmount, totalAmount) {
		let soul = getUnit(1, 641);
		let count = 0;

		if (soul) {
			do {
				if (getDistance(me, soul) < 45) {
					count += 1;
				}
			} while (soul.getNext());
		}

		if (count > soulAmount) {
			return true;
		}

		let monster = getUnit(1);

		if (monster) {
			do {
				if (!monster.getParent() && monster.classid !== 641 && getDistance(me, monster) < 45) {
					count += 1;
				}
			} while (monster.getNext());
		}

		return count > totalAmount;
	};

	let canClearThrone = function () {
		Pather.moveTo(15094, 5029);
		let monList = getUnits(1).filter(i => i.attackable);
		let canAttack = [], cantAttack = [];

		monList.forEach(mon => {
			Attack.canAttack(mon) ? canAttack.push(mon) : cantAttack.push(mon);
		});

		console.debug("Can Attack: " + canAttack.length, " Can't Attack: " + cantAttack.length);

		if (!canAttack.length && !cantAttack.length) {
			return true;
		} else {
			return (canAttack.length > cantAttack.length);
		}
	};

	// START
	Town.townTasks();
	myPrint('starting baal');

	Pather.checkWP(sdk.areas.WorldstoneLvl2, true) ? Pather.useWaypoint(sdk.areas.WorldstoneLvl2) : Pather.getWP(sdk.areas.WorldstoneLvl2, true);
	Precast.doPrecast(true);
	Pather.canTeleport()
		? Pather.moveToExit([sdk.areas.WorldstoneLvl3, sdk.areas.ThroneofDestruction], true)
		: (Pather.clearToExit(sdk.areas.WorldstoneLvl2, sdk.areas.WorldstoneLvl3, true) && Pather.clearToExit(sdk.areas.WorldstoneLvl3, sdk.areas.ThroneofDestruction, true));

	// Enter throne room
	Pather.moveTo(15095, 5029, 5);
	Pather.moveTo(15113, 5040, 5);

	let totalTick = getTickCount();

	// souls hurt
	if (unSafeCheck(8, 20) && me.lightRes < 70 && me.nightmare) {
		return true;
	}

	if (!canClearThrone()) {
		myPrint("Too many mobs I can't attack");
		return true;
	}

	try {
		if (((me.hell && me.paladin && !Attack.auradin) || me.barbarian || me.gold < 25000 || (!me.baal && SetUp.finalBuild !== "Bumper"))) {
			Messaging.sendToScript(SoloEvents.filePath, 'addBaalEvent');
		}
		
		Attack.clear(15);
		Common.Baal.clearThrone();

		if (me.coldRes < 75 || me.poisonRes < 75) {
			Town.doChores(null, {thawing: me.coldRes < 75, antidote: me.poisonRes < 75});
			Town.move("portalspot");
			Pather.usePortal(sdk.areas.ThroneofDestruction, me.name);
		}

		if (!clearWaves()) {
			throw new Error("Can't clear waves");
		}

		Common.Baal.clearThrone(); // double check
		Pather.moveTo(15094, me.paladin ? 5029 : 5038);
		Pickit.pickItems();
		Pather.moveTo(15094, me.paladin ? 5029 : 5038);
		Pickit.pickItems();
		Pather.moveTo(15090, 5008);
		delay(2500 + me.ping);
		Precast.doPrecast(true);

		if (SetUp.finalBuild === "Bumper") {
			throw new Error("BUMPER");
		}

		if (Misc.poll(() => me.getMobCount(15) > 1)) {
			clearWaves();
		}

		Config.BossPriority = true;

		if (Common.Baal.killBaal()) {
			// Grab static gold
			NTIP.addLine("[name] == gold # [gold] >= 25");
			Pather.moveTo(15072, 5894);
			Pickit.pickItems();
			Pather.moveTo(15095, 5881);
			Pickit.pickItems();
		} else {
			print("??c8Kolbot-SoloPlay??c0: Couldn't access portal.");
		}
	} catch (e) {
		//
	} finally {
		Messaging.sendToScript(SoloEvents.filePath, 'removeBaalEvent');
	}

	return true;
}
