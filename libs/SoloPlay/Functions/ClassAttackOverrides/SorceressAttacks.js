/**
*  @filename    SorceressAttacks.js
*  @author      theBGuy
*  @desc        Sorceress fixes to improve class attack functionality
*
*/

!isIncluded("common/Attacks/Sorceress.js") && include("common/Attacks/Sorceress.js");

const GameData = require('../../Modules/GameData');

const slowable = function (unit, freezeable = false) {
	return (!!unit && unit.attackable // those that we can attack
	&& Attack.checkResist(unit, 'cold')
	// those that are not frozen yet and those that can be frozen or not yet chilled
	&& (freezeable ? !unit.isFrozen && !unit.getStat(sdk.stats.CannotbeFrozen) : !el.isChilled)
	&& ![sdk.monsters.Andariel, 510].includes(unit.classid));
};

const frostNovaCheck = function () {
	return getUnits(1).some(function(el) {
		return !!el && el.attackable && el.distance < 7
			&& ![sdk.monsters.Andariel].includes(el.classid)
			&& !el.isChilled && Attack.checkResist(el, 'cold')
			&& !checkCollision(me, el, Coords_1.Collision.BLOCK_MISSILE);
	});
};

const inDanger = function () {
	let nearUnits = getUnits(sdk.unittype.Monster).filter((mon) => mon.attackable && mon.distance < 10);
	let dangerClose = nearUnits.find(mon => [sdk.enchant.ManaBurn, sdk.enchant.LightningEnchanted, sdk.enchant.FireEnchanted].some(chant => mon.getEnchant(chant)));
	return nearUnits.length > me.maxNearMonsters || dangerClose;
};

ClassAttack.doAttack = function (unit, skipStatic = false) {
	Developer.debugging.skills && print(sdk.colors.Green + "Test Start-----------------------------------------//");
	if (!unit) return 1;
	let gid = unit.gid;

	let tick = getTickCount();
	let timedSkill = {have: false, skill: -1, range: undefined, mana: undefined, dmg: 0};
	let index = (unit.isSpecial || unit.isPlayer) ? 1 : 3;
	let gold = me.gold;

	if (Config.MercWatch && Town.needMerc() && gold > me.mercrevivecost * 3) {
		console.debug("mercwatch");

		if (Town.visitTown()) {
			// lost reference to the mob we were attacking
			if (!unit || !copyUnit(unit).x || !getUnit(1, -1, -1, gid) || unit.dead) {
				console.debug("Lost reference to unit");
				return 1;
			}
		}
	}

	// Keep Energy Shield active
	Skill.canUse(sdk.skills.EnergyShield) && !me.getState(sdk.states.EnergyShield) && Skill.cast(sdk.skills.EnergyShield, 0);
	// Keep Thunder-Storm active
	Skill.canUse(sdk.skills.ThunderStorm) && !me.getState(sdk.states.ThunderStorm) && Skill.cast(sdk.skills.ThunderStorm, 0);

	// Handle Charge skill casting
	if (me.expansion && index === 1 && !unit.dead) {
		// If we have slow missles we might as well use it, currently only on Lighting Enchanted mobs as they are dangerous
		// Might be worth it to use on souls too TODO: test this idea
		if (CharData.skillData.currentChargedSkills.includes(sdk.skills.SlowMissiles) && unit.getEnchant(sdk.enchant.LightningEnchanted) && !unit.getState(sdk.states.SlowMissiles) && unit.curseable &&
			(gold > 500000 && Attack.bossesAndMiniBosses.indexOf(unit.classid) === -1) && !checkCollision(me, unit, 0x4)) {
			// Cast slow missiles
			Attack.castCharges(sdk.skills.SlowMissiles, unit);
		}
		// Handle Switch casting
		if (CharData.skillData.chargedSkillsOnSwitch.some(chargeSkill => chargeSkill.skill === sdk.skills.LowerResist) && !unit.getState(sdk.states.LowerResist) && unit.curseable &&
			(gold > 500000 || Attack.bossesAndMiniBosses.includes(unit.classid) || [sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction].includes(me.area)) && !checkCollision(me, unit, 0x4)) {
			// Switch cast lower resist
			Attack.switchCastCharges(sdk.skills.LowerResist, unit);
		}

		if (CharData.skillData.chargedSkillsOnSwitch.some(chargeSkill => chargeSkill.skill === sdk.skills.Weaken) && !unit.getState(sdk.states.Weaken) && !unit.getState(sdk.states.LowerResist) && unit.curseable &&
			(gold > 500000 || Attack.bossesAndMiniBosses.includes(unit.classid) || [sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction].includes(me.area)) && !checkCollision(me, unit, 0x4)) {
			// Switch cast weaken
			Attack.switchCastCharges(sdk.skills.Weaken, unit);
		}
	}

	let data = {
		static: {
			have: Skill.canUse(sdk.skills.StaticField), skill: sdk.skills.StaticField, range: Skill.getRange(sdk.skills.StaticField), mana: Skill.getManaCost(sdk.skills.StaticField),
			dmg: 0,
		},
		frostNova: {
			have: Skill.canUse(sdk.skills.FrostNova), skill: sdk.skills.FrostNova, range: 7, mana: Skill.getManaCost(sdk.skills.FrostNova), timed: false,
		},
		glacialSpike: {
			have: Skill.canUse(sdk.skills.GlacialSpike), skill: sdk.skills.GlacialSpike, range: 15, mana: Skill.getManaCost(sdk.skills.GlacialSpike), timed: false, dmg: 0,
		},
		customTimed: {
			have: false, skill: -1, range: undefined, mana: undefined, timed: undefined, dmg: 0,
		},
		customUntimed: {
			have: false, skill: -1, range: undefined, mana: undefined, timed: undefined, dmg: 0,
		},
		mainTimed: {
			have: Skill.canUse(Config.AttackSkill[index]), skill: Config.AttackSkill[index], range: Skill.getRange(Config.AttackSkill[index]), mana: Skill.getManaCost(Config.AttackSkill[index]),
			timed: Skill.isTimed(Config.AttackSkill[index]), dmg: 0,
		},
		mainUntimed: {
			have: Skill.canUse(Config.AttackSkill[index + 1]), skill: Config.AttackSkill[index + 1], range: Skill.getRange(Config.AttackSkill[index + 1]), mana: Skill.getManaCost(Config.AttackSkill[index + 1]),
			timed: Skill.isTimed(Config.AttackSkill[index + 1]), dmg: 0,
		},
		secondaryTimed: {
			have: Skill.canUse(Config.AttackSkill[5]), skill: Config.AttackSkill[5], range: Skill.getRange(Config.AttackSkill[5]), mana: Skill.getManaCost(Config.AttackSkill[5]),
			timed: Skill.isTimed(Config.AttackSkill[5]), dmg: 0,
		},
		secondaryUntimed: {
			have: Skill.canUse(Config.AttackSkill[6]), skill: Config.AttackSkill[6], range: Skill.getRange(Config.AttackSkill[6]), mana: Skill.getManaCost(Config.AttackSkill[6]),
			timed: Skill.isTimed(Config.AttackSkill[6]), dmg: 0,
		},
	};

	if (Attack.getCustomAttack(unit)) {
		let ts = Attack.getCustomAttack(unit)[0];
		let uts = Attack.getCustomAttack(unit)[1];
		ts > 0 && (data.customTimed = {have: true, range: Skill.getRange(ts), mana: Skill.getManaCost(ts), timed: Skill.isTimed(ts), dmg: GameData.avgSkillDamage(ts, unit)});
		uts > 0 && (data.customUntimed = {have: true, range: Skill.getRange(uts), mana: Skill.getManaCost(uts), timed: Skill.isTimed(uts), dmg: GameData.avgSkillDamage(uts, unit)});
	}

	if (data.frostNova.have && me.mp > data.frostNova.mana) {
		frostNovaCheck() && Skill.cast(sdk.skills.FrostNova, 0);
		let ticktwo = getTickCount();
		// if the nova cause the death of any monsters around us, its worth it
		if (GameData.calculateKillableFallensByFrostNova() > 0) {
			Developer.debugging.skills && print("took " + ((getTickCount() - ticktwo) / 1000) + " seconds to check calculateKillableFallensByFrostNova. frost nova will kill fallens");
			Skill.cast(sdk.skills.FrostNova, 0);
		}
	}

	if (data.glacialSpike.have && me.mp > data.glacialSpike.mana * 2) {
		let shouldSpike = unit && unit.distance < 10 &&
		getUnits(1).filter(function (el) {
			return getDistance(el, unit) < 4 && slowable(el, true);
		}).length > 1;
		if (shouldSpike && !Coords_1.isBlockedBetween(me, unit)) {
			Developer.debugging.skills && print("SPIKE");
			Skill.cast(sdk.skills.GlacialSpike, 0, unit);
		}
	}

	// We lost track of the mob or killed it
	if (unit === undefined || !unit || unit.dead) return true;

	// Set damage values
	data.static.have && (data.static.dmg = GameData.avgSkillDamage(data.static.skill, unit));
	data.glacialSpike.have && ![data.mainUntimed.skill, data.secondaryUntimed.skill].includes(data.glacialSpike.skill) && (data.glacialSpike.dmg = GameData.avgSkillDamage(data.glacialSpike.skill, unit));
	data.mainTimed.have && (data.mainTimed.dmg = GameData.avgSkillDamage(data.mainTimed.skill, unit));
	data.mainUntimed.have && (data.mainUntimed.dmg = GameData.avgSkillDamage(data.mainUntimed.skill, unit));
	data.secondaryTimed.have && (data.secondaryTimed.dmg = GameData.avgSkillDamage(data.secondaryTimed.skill, unit));
	data.secondaryUntimed.have && (data.secondaryUntimed.dmg = GameData.avgSkillDamage(data.secondaryUntimed.skill, unit));
    
	// print damage values
	if (Developer.debugging.skills) {
		data.static.have && print(getSkillById(data.static.skill) + " : " + data.static.dmg);
		data.mainTimed.have && print(getSkillById(data.mainTimed.skill) + " Main: " + data.mainTimed.dmg);
		data.mainUntimed.have && print(getSkillById(data.mainUntimed.skill) + " MainUnTimed: " + data.mainUntimed.dmg);
		data.secondaryTimed.have && print(getSkillById(data.secondaryTimed.skill) + " Second: " + data.secondaryTimed.dmg);
		data.secondaryUntimed.have && print(getSkillById(data.secondaryUntimed.skill) + " SecondUnTimed: " + data.secondaryUntimed.dmg);
	}

	// If we have enough mana for Static and it will do more damage than our other skills then duh use it
	if (data.static.have && (data.static.mana * 3) < me.mp) {
		let closeMobCheck = getUnits(1)
			.filter(unit => !!unit && unit.attackable && unit.distance < data.static.range)
			.find(unit => Attack.checkResist(unit, "lightning") && unit.hpPercent > Config.CastStatic);
		if (!!closeMobCheck && data.static.dmg > Math.max(data.mainTimed.dmg, data.mainUntimed.dmg, data.secondaryTimed.dmg, data.secondaryUntimed.dmg) && !Coords_1.isBlockedBetween(me, closeMobCheck)) {
			Developer.debugging.skills && print("STATIC");
			Skill.cast(sdk.skills.StaticField, 0, closeMobCheck);
		}
	}

	// We lost track of the mob or killed it (recheck after using static)
	if (unit === undefined || !unit || unit.dead) return true;

	// Choose Skill
	switch (true) {
	case !skipStatic && data.static.have && data.static.dmg > Math.max(data.mainTimed.dmg, data.secondaryTimed.dmg, data.mainUntimed.dmg, data.secondaryUntimed.dmg) && unit.getMobCount(15, Coords_1.Collision.BLOCK_MISSILE) < 5:
		timedSkill = data.static;
		break;
	case data.mainTimed.have && me.mp > data.mainTimed.mana && (!data.mainTimed.timed || !me.skillDelay) && data.mainTimed.dmg > Math.max(data.secondaryTimed.dmg, data.mainUntimed.dmg, data.secondaryUntimed.dmg):
		timedSkill = data.mainTimed;
		break;
	case data.secondaryTimed.have && me.mp > data.secondaryTimed.mana && (!data.secondaryTimed.timed || !me.skillDelay) && data.secondaryTimed.dmg > Math.max(data.mainTimed.dmg, data.mainUntimed.dmg, data.secondaryUntimed.dmg):
		timedSkill = data.secondaryTimed;
		break;
	case data.mainUntimed.have && me.mp > data.mainUntimed.mana && data.mainUntimed.dmg > Math.max(data.secondaryUntimed.dmg, data.glacialSpike.dmg):
		timedSkill = data.mainUntimed;
		break;
	case data.secondaryUntimed.have && me.mp > data.secondaryUntimed.mana && data.secondaryUntimed.dmg > Math.max(data.mainUntimed.dmg, data.glacialSpike.dmg):
		timedSkill = data.secondaryUntimed;
		break;
	}

	if (!timedSkill.have || timedSkill.mana > me.mp) {
		Developer.debugging.skills && print("Choosing lower mana skill, Was I not able to use one of my better skills? (" + (!timedSkill.have) + "). Did I not have enough mana? " + (timedSkill.mana > me.mp));
		let lowManaData = {
			fBolt: {
				have: Skill.canUse(sdk.skills.FireBolt), skill: sdk.skills.FireBolt, range: Skill.getRange(sdk.skills.FireBolt), mana: Skill.getManaCost(sdk.skills.FireBolt),
				timed: false, dmg: GameData.avgSkillDamage(sdk.skills.FireBolt, unit),
			},
			cBolt: {
				have: Skill.canUse(sdk.skills.ChargedBolt), skill: sdk.skills.ChargedBolt, range: Skill.getRange(sdk.skills.ChargedBolt), mana: Skill.getManaCost(sdk.skills.ChargedBolt),
				timed: false, dmg: GameData.avgSkillDamage(sdk.skills.ChargedBolt, unit),
			},
			iBolt: {
				have: Skill.canUse(sdk.skills.IceBolt), skill: sdk.skills.IceBolt, range: Skill.getRange(sdk.skills.IceBolt), mana: Skill.getManaCost(sdk.skills.IceBolt),
				timed: false, dmg: GameData.avgSkillDamage(sdk.skills.IceBolt, unit),
			},
			iBlast: {
				have: Skill.canUse(sdk.skills.IceBlast), skill: sdk.skills.IceBlast, range: Skill.getRange(sdk.skills.IceBlast), mana: Skill.getManaCost(sdk.skills.IceBlast),
				timed: false, dmg: GameData.avgSkillDamage(sdk.skills.IceBlast, unit),
			},
			tk: {
				have: Skill.canUse(sdk.skills.Telekinesis), skill: sdk.skills.Telekinesis, range: Skill.getRange(sdk.skills.Telekinesis), mana: Skill.getManaCost(sdk.skills.Telekinesis),
				timed: false, dmg: GameData.avgSkillDamage(sdk.skills.Telekinesis, unit),
			},
			attack: {
				have: true, skill: 0, range: 3, mana: 0,
				timed: false, dmg: GameData.avgSkillDamage(sdk.skills.Attack, unit),
			},
		};

		switch (true) {
		case lowManaData.iBlast.have && me.mp > lowManaData.iBlast.mana && lowManaData.iBlast.dmg > Math.max(lowManaData.fBolt.dmg, lowManaData.cBolt.dmg, lowManaData.iBolt.dmg, lowManaData.tk.dmg):
			timedSkill = lowManaData.iBlast;

			break;
		case lowManaData.iBolt.have && me.mp > lowManaData.iBolt.mana && lowManaData.iBolt.dmg > Math.max(lowManaData.fBolt.dmg, lowManaData.cBolt.dmg, lowManaData.tk.dmg):
			timedSkill = lowManaData.iBolt;

			break;
		case lowManaData.cBolt.have && me.mp > lowManaData.cBolt.mana && lowManaData.cBolt.dmg > Math.max(lowManaData.fBolt.dmg, lowManaData.iBlast.dmg, lowManaData.iBolt.dmg, lowManaData.tk.dmg):
			timedSkill = lowManaData.cBolt;

			break;
		case lowManaData.fBolt.have && me.mp > lowManaData.fBolt.mana && lowManaData.fBolt.dmg > Math.max(lowManaData.cBolt.dmg, lowManaData.iBlast.dmg, lowManaData.iBolt.dmg, lowManaData.tk.dmg):
			timedSkill = lowManaData.fBolt;

			break;
		case lowManaData.tk.have && me.mp > lowManaData.tk.mana && lowManaData.tk.dmg > Math.max(lowManaData.cBolt.dmg, lowManaData.iBlast.dmg, lowManaData.iBolt.dmg, lowManaData.fBolt.dmg):
			me.normal && (timedSkill = lowManaData.tk);

			break;
		default:
			!unit.getEnchant(sdk.enchant.ManaBurn) && me.normal && (timedSkill = lowManaData.attack);

			break;
		}
	}

	if (timedSkill === sdk.skills.ChargedBolt && data.secondaryUntimed.skill === sdk.skills.IceBolt && data.secondaryUntimed.have && slowable(unit)) {
		timedSkill = sdk.skills.IceBolt;
	}

	if (timedSkill === sdk.skills.ChargedBolt && data.secondaryUntimed.skill === sdk.skills.IceBolt) {
		console.log("Slowable? ", slowable(unit));
	}

	switch (ClassAttack.doCast(unit, timedSkill, data)) {
	case 0: // Fail
		Developer.debugging.skills && print(sdk.colors.Red + "Fail Test End----Time elasped[" + ((getTickCount() - tick) / 1000) + " seconds]----------------------//");
		break;
	case 1: // Success
		Developer.debugging.skills && print(sdk.colors.Red + "Sucess Test End----Time elasped[" + ((getTickCount() - tick) / 1000) + " seconds]----------------------//");
		return true;
	case 2: // Try to telestomp
		if (Pather.canTeleport() && Attack.checkResist(unit, "physical") && !!me.getMerc()
			&& Attack.validSpot(unit.x, unit.y)
			&& (Config.TeleStomp || (!me.hell && (unit.getMobCount(10) < me.maxNearMonsters && unit.isSpecial)))) {
			let merc = me.getMerc();
			let haveTK = Skill.canUse(sdk.skills.Telekinesis);
			let mercRevive = 0;

			while (unit.attackable) {
				if (Misc.townCheck()) {
					if (!unit || !copyUnit(unit).x) {
						unit = Misc.poll(() => getUnit(1, -1, -1, gid), 1000, 80);
					}
				}

				if (!unit) return 1;

				if (Town.needMerc()) {
					if (Config.MercWatch && mercRevive < 3) {
						Town.visitTown() && (mercRevive++);
					} else {
						return 2;
					}

					(merc === undefined || !merc) && (merc = me.getMerc());
				}

				if (!!merc && getDistance(merc, unit) > 5) {
					Pather.moveToUnit(unit);

					let spot = Attack.findSafeSpot(unit, 10, 5, 9);
					!!spot && Pather.walkTo(spot.x, spot.y);
				}

				if (Attack.checkResist(unit, "lightning") && data.static.have && unit.hpPercent > Config.CastStatic) {
					Skill.cast(sdk.skills.StaticField, 0);
				}

				let closeMob = Attack.getNearestMonster({skipGid: gid});
				!!closeMob ? this.doCast(closeMob, timedSkill, data) : haveTK && Skill.cast(sdk.skills.Telekinesis, 0, unit);
			}

			return true;
		}

		break;
	}

	return false;
};

ClassAttack.doCast = function (unit, timedSkill, data) {
	// No valid skills can be found
	if (unit === undefined || !!(timedSkill.skill < 0)) return 2;

	// print damage values
	Developer.debugging.skills && timedSkill.have && print(sdk.colors.Yellow + "(Selected Main :: " + getSkillById(timedSkill.skill) + ") DMG: " + timedSkill.dmg);

	if (![sdk.skills.FrostNova, sdk.skills.Nova, sdk.skills.StaticField].includes(timedSkill.skill) && Skill.canUse(sdk.skills.Teleport)) {
		if (inDanger() && me.mp > Skill.getManaCost(sdk.skills.Teleport) + timedSkill.mana) {
			//print("FINDING NEW SPOT");
			Attack.getIntoPosition(unit, timedSkill.range, 0
                | Coords_1.BlockBits.LineOfSight
                | Coords_1.BlockBits.Ranged
                | Coords_1.BlockBits.Casting
                | Coords_1.BlockBits.ClosedDoor
                | Coords_1.BlockBits.Objects, false, true);
		}
	}

	if (timedSkill.skill > -1 && (!me.skillDelay || !timedSkill.timed)) {
		let ts = timedSkill.skill, tsRange = timedSkill.range, tsMana = timedSkill.mana, ranged = tsRange > 4;

		if (ts === sdk.skills.ChargedBolt) {
			unit.getMobCount(6, Coords_1.Collision.BLOCK_MISSILE) < 3 && (tsRange = 5);
		}

		if (tsRange < 4 && !Attack.validSpot(unit.x, unit.y)) return 0;

		if (unit.distance > tsRange || Coords_1.isBlockedBetween(me, unit)) {
			// Allow short-distance walking for melee skills
			let walk = (tsRange < 4 || (ts === sdk.skills.ChargedBolt && tsRange === 5)) && unit.distance < 10 && !checkCollision(me, unit, Coords_1.BlockBits.BlockWall);

			if (ranged) {
				if (!Attack.getIntoPosition(unit, timedSkill.range, Coords_1.Collision.BLOCK_MISSILE, walk)) return 0;
			} else if (!Attack.getIntoPosition(unit, tsRange, Coords_1.BlockBits.Ranged, walk)) {
				return 0;
			}
		}

		// Only delay if there are no mobs in our immediate area
		if (tsMana > me.mp && me.getMobCount() === 0) {
			let tick = getTickCount();

			while (getTickCount() - tick < 750) {
				if (tsMana < me.mp) {
					break;
				}

				delay(25);
			}
		}

		if (!unit.dead && !checkCollision(me, unit, Coords_1.BlockBits.Ranged)) {
			if (ts === sdk.skills.ChargedBolt) {
				// Randomized x coord changes bolt path and prevents constant missing
				!unit.dead && Skill.cast(ts, Skill.getHand(ts), unit.x + rand(-2, 2), unit.y);
			} else if (ts === sdk.skills.StaticField) {
				for (let i = 0; i < 4; i++) {
					if (!unit.dead) {
						Skill.cast(ts, Skill.getHand(ts), unit);

						if (data.frostNova.have && me.mp > data.frostNova.mana) {
							frostNovaCheck() && Skill.cast(sdk.skills.FrostNova, 0);
						}

						if (inDanger() || tsMana > me.mp || unit.hpPercent < Config.CastStatic) {
							break;
						}
					} else {
						break;
					}
				}
			} else {
				let targetPoint = GameData.targetPointForSkill(ts, unit);

				if (targetPoint) {
					Skill.cast(ts, Skill.getHand(ts), targetPoint.x, targetPoint.y);
				} else {
					Skill.cast(ts, Skill.getHand(ts), unit);
				}
			}
		}

		return 1;
	}

	for (let i = 0; i < 25; i++) {
		if (!me.skillDelay) {
			break;
		}
		if (i % 5 === 0) {
			if (inDanger()) {
				break;
			}
		}

		delay(40);
	}

	return 1;
};
