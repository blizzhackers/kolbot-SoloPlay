/*
*	@filename	SorceressAttacks.js
*	@author		theBGuy
*	@desc		Sorceress fixes to improve class attack functionality
*/

if (!isIncluded("common/Attacks/Sorceress.js")) { include("common/Attacks/Sorceress.js"); }
const GameData = require('../../Modules/GameData');

ClassAttack.doAttack = function (unit, preAttack = false) {
	Developer.debugging.skills && (print(sdk.colors.Green + "Test Start-----------------------------------------//"));
	let tick = getTickCount();
	let checkSkill, mark,
		merc = Merc.getMercFix(),
		timedSkill = {have: false, skill: -1, range: undefined, mana: undefined, dmg: 0},
		untimedSkill = {have: false, skill: -1, range: undefined, mana: undefined, dmg: 0},
		index = (unit.spectype !== 0 || unit.type === 0) ? 1 : 3,
		gold = me.gold;

	if (Config.MercWatch && Town.needMerc()) {
		print("mercwatch");
		Town.visitTown();
	}

	// Keep Energy Shield active
	if (!me.getState(sdk.states.EnergyShield) && me.getSkill(sdk.skills.EnergyShield, 1)) {
		Skill.cast(sdk.skills.EnergyShield, 0);
	}

	// Keep Thunder-Storm active
	if (!me.getState(sdk.states.ThunderStorm) && me.getSkill(sdk.skills.ThunderStorm, 1)) {
		Skill.cast(sdk.skills.ThunderStorm, 0);
	}

	// Handle Charge skill casting
	if (me.expansion && index === 1 && !unit.dead) {
		// If we have slow missles we might as well use it, currently only on Lighting Enchanted mobs as they are dangerous
		// Might be worth it to use on souls too TODO: test this idea
		if (Attack.currentChargedSkills.indexOf(sdk.skills.SlowMissiles) > -1 && unit.getEnchant(sdk.enchant.LightningEnchanted) && !unit.getState(sdk.states.SlowMissiles) && Attack.isCursable(unit) &&
			(gold > 500000 && Attack.BossAndMiniBosses.indexOf(unit.classid) === -1) && !checkCollision(me, unit, 0x4)) {
			// Cast slow missiles
			Attack.castCharges(sdk.skills.SlowMissiles, unit);
		}
		// Handle Switch casting
		if (Attack.chargedSkillsOnSwitch.some(chargeSkill => chargeSkill.skill === sdk.skills.LowerResist) && !unit.getState(sdk.states.LowerResist) && Attack.isCursable(unit) &&
			(gold > 500000 || Attack.BossAndMiniBosses.indexOf(unit.classid) > -1 || [sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction].indexOf(me.area) > -1) && !checkCollision(me, unit, 0x4)) {
			// Switch cast lower resist
			Attack.switchCastCharges(sdk.skills.LowerResist, unit);
		}

		if (Attack.chargedSkillsOnSwitch.some(chargeSkill => chargeSkill.skill === sdk.skills.Weaken) && !unit.getState(sdk.states.Weaken) && !unit.getState(sdk.states.LowerResist) && Attack.isCursable(unit) &&
			(gold > 500000 || Attack.BossAndMiniBosses.indexOf(unit.classid) > -1 || [sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction].indexOf(me.area) > -1) && !checkCollision(me, unit, 0x4)) {
			// Switch cast weaken
			Attack.switchCastCharges(sdk.skills.Weaken, unit);
		}
	}

	let data = {
        static: {
            have: me.getSkill(sdk.skills.StaticField, 1), skill: sdk.skills.StaticField, range: Skill.getRange(sdk.skills.StaticField), mana: Skill.getManaCost(sdk.skills.StaticField),
            dmg: 0,
        },
        frostNova: {
            have: me.getSkill(sdk.skills.FrostNova, 1), skill: sdk.skills.FrostNova, range: 7, mana: Skill.getManaCost(sdk.skills.FrostNova),
        },
        glacialSpike: {
            have: me.getSkill(sdk.skills.GlacialSpike, 1), skill: sdk.skills.GlacialSpike, range: 15, mana: Skill.getManaCost(sdk.skills.GlacialSpike), dmg: 0,
        },
        customTimed: {
        	have: false, skill: -1, range: undefined, mana: undefined, dmg: 0,
        },
        customUntimed: {
        	have: false, skill: -1, range: undefined, mana: undefined, dmg: 0,
        },
        mainTimed: {
            have: me.getSkill(Config.AttackSkill[index], 1), skill: Config.AttackSkill[index], range: Skill.getRange(Config.AttackSkill[index]), mana: Skill.getManaCost(Config.AttackSkill[index]),
            dmg: 0,
        },
        mainUntimed: {
            have: me.getSkill(Config.AttackSkill[index + 1], 1), skill: Config.AttackSkill[index + 1], range: Skill.getRange(Config.AttackSkill[index + 1]), mana: Skill.getManaCost(Config.AttackSkill[index + 1]),
            dmg: 0,
        },
        secondaryTimed: {
            have: me.getSkill(Config.AttackSkill[5], 1), skill: Config.AttackSkill[5], range: Skill.getRange(Config.AttackSkill[5]), mana: Skill.getManaCost(Config.AttackSkill[5]),
            dmg: 0,
        },
        secondaryUntimed: {
            have: me.getSkill(Config.AttackSkill[6], 1), skill: Config.AttackSkill[6], range: Skill.getRange(Config.AttackSkill[6]), mana: Skill.getManaCost(Config.AttackSkill[6]),
            dmg: 0,
        },
    };

    if (Attack.getCustomAttack(unit)) {
    	let ts = Attack.getCustomAttack(unit)[0];
    	let uts = Attack.getCustomAttack(unit)[1];
		ts > 0 && (data.customTimed = {have: true, range: Skill.getRange(ts), mana: Skill.getManaCost(ts), dmg: GameData.avgSkillDamage(ts, unit)});
		uts > 0 && (data.customUntimed = {have: true, range: Skill.getRange(uts), mana: Skill.getManaCost(uts), dmg: GameData.avgSkillDamage(uts, unit)});
	}

    if (data.frostNova.have && me.mp > data.frostNova.mana) {
        let checkMobs = getUnits(1).some(function(el) {
        	if (el === undefined) { return false; }
        	return el.attackable && el.distance < 7 && !el.isChilled && Attack.checkResist(el, 'cold');
        });
        if (checkMobs) {
            Skill.cast(sdk.skills.FrostNova, 0);
        }
        let ticktwo = getTickCount();
        // if the nova cause the death of any monsters around us, its worth it
        if (GameData.calculateKillableFallensByFrostNova() > 0) {
        	Developer.debugging.skills && (print("took " + ((getTickCount() - ticktwo) / 1000) + " seconds to check calculateKillableFallensByFrostNova. frost nova will kill fallens"));
            Skill.cast(sdk.skills.FrostNova, 0);
        }
    }

    if (data.glacialSpike.have && me.mp > data.glacialSpike.mana * 2) {
    	let shouldSpike = unit && unit.distance < 10 &&
    		getUnits(1).filter(function (el) { return getDistance(el, unit) < 4
                && el.attackable // those that we can attack
                && Attack.checkResist(el, 'cold')
                && !el.isFrozen // those that are not frozen yet
                && !el.getStat(sdk.stats.CannotbeFrozen) // those that can be frozen
                && el.classid !== 510; }).length > 1;
    	if (shouldSpike && !Coords_1.isBlockedBetween(me, unit)) {
    		Developer.debugging.skills && (print("SPIKE"));
    		Skill.cast(sdk.skills.GlacialSpike, 0, unit);
    	}
    }

    // We lost track of the mob or killed it
    if (unit === undefined || !unit || unit.dead) { return true; }

    // Set damage values
    data.static.have && (data.static.dmg = GameData.avgSkillDamage(data.static.skill, unit));
    data.glacialSpike.have && ![data.mainUntimed.skill, data.secondaryUntimed.skill].includes(data.glacialSpike.skill) && (data.glacialSpike.dmg = GameData.avgSkillDamage(data.glacialSpike.skill, unit));
    data.mainTimed.have && (data.mainTimed.dmg = GameData.avgSkillDamage(data.mainTimed.skill, unit));
    data.mainUntimed.have && (data.mainUntimed.dmg = GameData.avgSkillDamage(data.mainUntimed.skill, unit));
    data.secondaryTimed.have && (data.secondaryTimed.dmg = GameData.avgSkillDamage(data.secondaryTimed.skill, unit));
    data.secondaryUntimed.have && (data.secondaryUntimed.dmg = GameData.avgSkillDamage(data.secondaryUntimed.skill, unit));
    
    // print damage values
    if (Developer.debugging.skills) {
	    data.static.have && (print(getSkillById(data.static.skill) + " Static: " + data.static.dmg));
	    data.mainTimed.have && (print(getSkillById(data.mainTimed.skill) + " Main: " + data.mainTimed.dmg));
	    data.mainUntimed.have && (print(getSkillById(data.mainUntimed.skill) + " MainUnTimed: " + data.mainUntimed.dmg));
	    data.secondaryTimed.have && (print(getSkillById(data.secondaryTimed.skill) + " Second: " + data.secondaryTimed.dmg));
	    data.secondaryUntimed.have && (print(getSkillById(data.secondaryUntimed.skill) + " SecondUnTimed: " + data.secondaryUntimed.dmg));
    }

	// If we have enough mana for Static and it will do more damage than our other skills then duh use it
	if (data.static.have && (data.static.mana * 3) < me.mp) {
		let tickone = getTickCount();
		let closeMobCheck = getUnits(1)
			.filter(unit => !!unit && unit.attackable && unit.distance < data.static.range)
			.find(unit => Attack.checkResist(unit, "lightning") && Math.round(unit.hp * 100 / unit.hpmax) > Config.CastStatic)
		if (!!closeMobCheck && data.static.dmg > Math.max(data.mainTimed.dmg, data.mainUntimed.dmg, data.secondaryTimed.dmg, data.secondaryUntimed.dmg) && !Coords_1.isBlockedBetween(me, closeMobCheck)) {
			Developer.debugging.skills && (print("STATIC"));
			Skill.cast(sdk.skills.StaticField, 0, closeMobCheck);
		}
	}

	// We lost track of the mob or killed it (recheck after using static)
    if (unit === undefined || !unit || unit.dead) { return true; }

    let monCountNearUnit = function (unit, range = 15) {
    	if (unit === undefined) {
    		return 0;
    	}

    	return getUnits(1).filter(function (el) { return getDistance(el, unit) < range
            && el.attackable // those that we can attack
            && !checkCollision(el, unit, Coords_1.Collision.BLOCK_MISSILE)}).length;
    };

	// Get timed
	switch (true) {
	case data.static.have && data.static.dmg > Math.max(data.mainTimed.dmg, data.secondaryTimed.dmg) && monCountNearUnit(unit) < 5:
		timedSkill = data.static;
		break;
	case data.mainTimed.have && data.mainTimed.dmg > data.secondaryTimed.dmg && Attack.castableSpot(unit.x, unit.y):
		timedSkill = data.mainTimed;
		break;
	case data.secondaryTimed.have && data.secondaryTimed.dmg > data.mainTimed.dmg && Attack.castableSpot(unit.x, unit.y):
		timedSkill = data.secondaryTimed;
		break;
	}
	// Get untimed
	switch (true) {
	case data.static.have && data.static.dmg > Math.max(data.mainUntimed.dmg, data.secondaryUntimed.dmg) && monCountNearUnit(unit) < 5:
		untimedSkill = data.static;
		break;
	case data.mainUntimed.have && data.mainUntimed.dmg > Math.max(data.secondaryUntimed.dmg, data.glacialSpike.dmg) && Attack.castableSpot(unit.x, unit.y):
		untimedSkill = data.mainUntimed;
		break;
	case data.secondaryUntimed.have && data.secondaryUntimed.dmg > Math.max(data.mainUntimed.dmg, data.glacialSpike.dmg) && Attack.castableSpot(unit.x, unit.y):
		untimedSkill = data.secondaryUntimed;
		break;
	}

	if (!timedSkill.have || timedSkill.mana > me.mp) {
		let lowManaData = {
			fBolt: {
				have: me.getSkill(sdk.skills.FireBolt, 1),
	            skill: sdk.skills.FireBolt,
	            range: Skill.getRange(sdk.skills.FireBolt),
	            mana: Skill.getManaCost(sdk.skills.FireBolt),
	            dmg: GameData.avgSkillDamage(sdk.skills.FireBolt, unit),
			},
			cBolt: {
				have: me.getSkill(sdk.skills.ChargedBolt, 1),
	            skill: sdk.skills.ChargedBolt,
	            range: Skill.getRange(sdk.skills.ChargedBolt),
	            mana: Skill.getManaCost(sdk.skills.ChargedBolt),
	            dmg: GameData.avgSkillDamage(sdk.skills.ChargedBolt, unit),
			},
			iBolt: {
				have: me.getSkill(sdk.skills.IceBolt, 1),
	            skill: sdk.skills.IceBolt,
	            range: Skill.getRange(sdk.skills.IceBolt),
	            mana: Skill.getManaCost(sdk.skills.IceBolt),
	            dmg: GameData.avgSkillDamage(sdk.skills.IceBolt, unit),
			},
			tk: {
				have: me.getSkill(sdk.skills.Telekinesis, 1),
	            skill: sdk.skills.Telekinesis,
	            range: Skill.getRange(sdk.skills.Telekinesis),
	            mana: Skill.getManaCost(sdk.skills.Telekinesis),
	            dmg: GameData.avgSkillDamage(sdk.skills.Telekinesis, unit),
			},
			iBlast: {
				have: me.getSkill(sdk.skills.IceBlast, 1),
	            skill: sdk.skills.IceBlast,
	            range: Skill.getRange(sdk.skills.IceBlast),
	            mana: Skill.getManaCost(sdk.skills.IceBlast),
	            dmg: GameData.avgSkillDamage(sdk.skills.IceBlast, unit),
			},
			attack: {
				have: true,
	            skill: 0,
	            range: 3,
	            mana: 0,
	            dmg: GameData.avgSkillDamage(sdk.skills.Attack, unit),
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
			timedSkill = lowManaData.tk;

			break;
		default:
			timedSkill = lowManaData.attack;

			break;
		}
	}

	switch (ClassAttack.doCast(unit, timedSkill, untimedSkill)) {
	case 0: // Fail
		Developer.debugging.skills && (print(sdk.colors.Red + "Fail Test End----Time elasped[" + ((getTickCount() - tick) / 1000) + " seconds]----------------------//"));
		break;
	case 1: // Success
		Developer.debugging.skills && (print(sdk.colors.Red + "Sucess Test End----Time elasped[" + ((getTickCount() - tick) / 1000) + " seconds]----------------------//"));
		return true;
	case 2: // Try to telestomp
		if (Config.TeleStomp && Attack.checkResist(unit, "physical") && Config.UseMerc) {
			while (Attack.checkMonster(unit)) {
				Misc.townCheck();

				if (!merc) {
					Town.visitTown();
				}

				if (getDistance(me, unit) > 3) {
					Pather.moveToUnit(unit);
				}

				if (Attack.checkResist(unit, "lightning") && me.getSkill(sdk.skills.StaticField, 1) && Math.round(unit.hp * 100 / unit.hpmax) > Config.CastStatic) {
					Skill.cast(sdk.skills.StaticField, 0);
				}

				mark = Attack.getNearestMonster();

				if (mark) {
					ClassAttack.doCast(mark, Config.AttackSkill[1], Config.AttackSkill[2]);
				} else if (me.getSkill(sdk.skills.Telekinesis, 0)) {
					Skill.cast(sdk.skills.Telekinesis, 0, unit);
				}
			}

			return true;
		}

		break;
	}

	return false;
};

ClassAttack.doCast = function (unit, timedSkill, untimedSkill) {
	let walk, tick;

	// No valid skills can be found
	if (unit === undefined || !!timedSkill.skill < 0 && !!untimedSkill.skill < 0) {
		return 2;
	}

	if (![sdk.skills.FrostNova, sdk.skills.Nova].includes(timedSkill.skill, untimedSkill.skill) && me.getSkill(sdk.skills.Teleport, 1)) {
		let maxNearMonsters = Math.floor((4 * (1 / me.hpmax * me.hp)) + 1);
		let nearUnits = getUnits(sdk.unittype.Monster).filter(function (mon) {return mon.attackable && mon.distance < 10; }).length;
		if (nearUnits > maxNearMonsters && me.mp > Skill.getManaCost(sdk.skills.Teleport) + (!!timedSkill.mana ? timedSkill.mana : untimedSkill.mana)) {
			//print("FINDING NEW SPOT");
			Attack.getIntoPosition(unit, (!me.getState(sdk.states.SkillDelay) && !!timedSkill.range ? timedSkill.range : untimedSkill.range), 0
                | Coords_1.BlockBits.LineOfSight
                | Coords_1.BlockBits.Ranged
                | Coords_1.BlockBits.Casting
                | Coords_1.BlockBits.ClosedDoor
                | Coords_1.BlockBits.Objects, false, true);
		}
	}

	if (timedSkill.skill > -1 && (!me.getState(sdk.states.SkillDelay) || !Skill.isTimed(timedSkill.skill))) {
		let ts = timedSkill.skill, tsRange = timedSkill.range, tsMana = timedSkill.mana;

		if (ts === sdk.skills.ChargedBolt) {
			if (Attack.getMobCountAtPosition(unit.x, unit.y, 6) < 3) {
				tsRange = 5;
			}
		}

		if (tsRange < 4 && !Attack.validSpot(unit.x, unit.y)) {
			return 0;
		}

		if (Math.round(getDistance(me, unit)) > tsRange || checkCollision(me, unit, 0x4)) {
			// Allow short-distance walking for melee skills
			walk = (tsRange < 4 || (ts === sdk.skills.ChargedBolt && tsRange === 5)) && getDistance(me, unit) < 10 && !checkCollision(me, unit, 0x1);

			if (!Attack.getIntoPosition(unit, tsRange, 0x4, walk)) {
				return 0;
			}
		}

		// Only delay if there are no mobs in our immediate area
		if (tsMana > me.mp && Attack.getMobCount(me.x, me.y, 8) === 0) {
			tick = getTickCount();

			while (getTickCount() - tick < 750) {
				if (tsMana < me.mp) { break; }

				delay(25);
			}
		}

		if (!unit.dead && !checkCollision(me, unit, 0x4)) {
			if (ts === sdk.skills.ChargedBolt) {
				// Randomized x coord changes bolt path and prevents constant missing
				if (!unit.dead) {
					Skill.cast(ts, Skill.getHand(ts), unit.x + rand(-1, 1), unit.y);
				}
			} else {
				Skill.cast(ts, Skill.getHand(ts), unit);
			}
		}

		return 1;
	}

	if (untimedSkill.skill > -1) {
		let uts = untimedSkill.skill, utsRange = untimedSkill.range, utsMana = untimedSkill.mana;

		if (utsRange < 4 && !Attack.validSpot(unit.x, unit.y)) {
			return 0;
		}

		if (Math.round(getDistance(me, unit)) > utsRange || checkCollision(me, unit, 0x4)) {
			// Allow short-distance walking for melee skills
			walk = utsRange < 4 && getDistance(me, unit) < 10 && !checkCollision(me, unit, 0x1);

			if (!Attack.getIntoPosition(unit, utsRange, 0x4, walk)) {
				return 0;
			}
		}

		// Only delay if there are no mobs in our immediate area
		if (utsMana > me.mp && Attack.getMobCount(me.x, me.y, 8) === 0) {
			tick = getTickCount();

			while (getTickCount() - tick < 750) {
				if (utsMana < me.mp) { break; }

				delay(25);
			}
		}

		if (!unit.dead) {
			Skill.cast(uts, Skill.getHand(uts), unit);

			// Cast gspike, we are in close with nova so this can freeze the mobs around us
			if (!unit.dead && uts === sdk.skills.Nova && (me.getSkill(sdk.skills.GlacialSpike, 0))) {
				Skill.cast(sdk.skills.GlacialSpike, 0, unit);
			}
		}

		return 1;
	}

	for (let i = 0; i < 25; i += 1) {
		if (!me.getState(sdk.states.SkillDelay)) { break; }

		delay(40);
	}

	return 1;
};
