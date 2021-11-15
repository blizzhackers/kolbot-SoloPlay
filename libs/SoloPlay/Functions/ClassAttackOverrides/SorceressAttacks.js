/*
*	@filename	SorceressAttacks.js
*	@author		theBGuy
*	@desc		Sorceress fixes to improve class attack functionality
*/

if (!isIncluded("common/Attacks/Sorceress.js")) {
	include("common/Attacks/Sorceress.js");
}

ClassAttack.doAttack = function (unit, preattack) {
	var checkSkill, mark,
		merc = Merc.getMercFix(),
		timedSkill = -1,
		untimedSkill = -1,
		index = (unit.spectype !== 0 || unit.type === 0) ? 1 : 3,
		staticRange = Math.floor((me.getSkill(sdk.skills.StaticField, 1) + 3) * 2 / 3),
		gold = me.getStat(14) + me.getStat(15);

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

	// Skills
	let closeMobCheck;
	let useFNova = me.getSkill(sdk.skills.FrostNova, 0);
	let useStatic = me.getSkill(sdk.skills.StaticField, 1);
	let staticManaCost = Skill.getManaCost(sdk.skills.StaticField);

	// Handle Switch casting
	if (!me.classic && index === 1 && !unit.dead) {
		if (Attack.currentChargedSkills.indexOf(sdk.skills.Weaken) > -1 && !unit.getState(sdk.states.Weaken) && !unit.getState(sdk.states.LowerResist) && Attack.isCursable(unit) &&
			(gold > 500000 || Attack.BossAndMiniBosses.indexOf(unit.classid) > -1 || [sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction].indexOf(me.area) > -1) && !checkCollision(me, unit, 0x4)) {
			// Switch cast weaken
			Attack.switchCastCharges(sdk.skills.Weaken, unit);
		}

		if (Attack.currentChargedSkills.indexOf(sdk.skills.LowerResist) > -1 && !unit.getState(sdk.states.LowerResist) && Attack.isCursable(unit) &&
			(gold > 500000 || Attack.BossAndMiniBosses.indexOf(unit.classid) > -1 || [sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction].indexOf(me.area) > -1) && !checkCollision(me, unit, 0x4)) {
			// Switch cast lower resist
			Attack.switchCastCharges(sdk.skills.LowerResist, unit);
		}
	}

	// If we have enough mana for FNova and there are 2 or mobs around us
	if (useFNova && Skill.getManaCost(sdk.skills.FrostNova) * 2 < me.mp && Attack.getMobCount(me.x, me.y, 6) >= 2) {
		closeMobCheck = Attack.getNearestMonster();

		if (!!closeMobCheck && Attack.checkResist(closeMobCheck, "cold") && !closeMobCheck.isChilled && !closeMobCheck.dead) {
			Skill.cast(sdk.skills.FrostNova, 0, closeMobCheck);
		}
	}

	// If we have enough mana for Static and there are 2 or more mobs around us, get the closest one and cast static on them
	if (useStatic && Attack.getMobCount(me.x, me.y, staticRange) >= (me.area === sdk.areas.ThroneofDestruction ? 1 : 2) && (staticManaCost * 3) < me.mp) {
		for (let castStatic = 0; castStatic < 2; castStatic++) {
			closeMobCheck = Attack.getNearestMonster();
			if (!!closeMobCheck && Attack.checkResist(unit, "lightning") && staticManaCost < me.mp && !closeMobCheck.dead && Math.round(closeMobCheck.hp * 100 / closeMobCheck.hpmax) > Config.CastStatic) {
				Skill.cast(42, 0);
			}
		}
	}

	// Static
	if (Config.CastStatic < 100 && useStatic && Attack.checkResist(unit, "lightning") && Config.StaticList.some(
		function (id) {
			if (unit) {
				switch (typeof id) {
				case "number":
					if (unit.classid && unit.classid === id) {
						return 1;
					}

					break;
				case "string":
					if (unit.name && unit.name.toLowerCase() === id.toLowerCase()) {
						return 1;
					}

					break;
				default:
					throw new Error("Bad Config.StaticList settings.");
				}
			}

			return 0;
		}
	) && Math.round(unit.hp * 100 / unit.hpmax) > Config.CastStatic) {
		while (!me.dead && Math.round(unit.hp * 100 / unit.hpmax) > Config.CastStatic && Attack.checkMonster(unit)) {
			Misc.townCheck();
			ClassAttack.doCast(unit, Config.AttackSkill[1], -1);

			if (getDistance(me, unit) > staticRange || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, staticRange, 0x4)) {
					return false;

				}
			}

			if ((staticManaCost * 2) < me.mp) {
				Skill.cast(sdk.skills.StaticField, 0, unit);
			}
		}
	}

	// Get timed skill
	if (Attack.getCustomAttack(unit)) {
		checkSkill = Attack.getCustomAttack(unit)[0];
	} else {
		checkSkill = Config.AttackSkill[index];
	}

	if (Attack.checkResist(unit, checkSkill) && ([sdk.skills.Meteor, sdk.skills.Blizzard].indexOf(checkSkill) === -1 || Attack.validSpot(unit.x, unit.y))) {
		timedSkill = checkSkill;
	} else if (Config.AttackSkill[5] > -1 && Attack.checkResist(unit, Config.AttackSkill[5]) && ([sdk.skills.Meteor, sdk.skills.Blizzard].indexOf(Config.AttackSkill[5]) === -1 || Attack.validSpot(unit.x, unit.y))) {
		timedSkill = Config.AttackSkill[5];
	}

	// Get untimed skill
	if (Attack.getCustomAttack(unit)) {
		checkSkill = Attack.getCustomAttack(unit)[1];
	} else {
		checkSkill = Config.AttackSkill[index + 1];
	}

	if (Attack.checkResist(unit, checkSkill) && ([sdk.skills.Meteor, sdk.skills.Blizzard].indexOf(checkSkill) === -1 || Attack.validSpot(unit.x, unit.y))) {
		untimedSkill = checkSkill;
	} else if (Config.AttackSkill[6] > -1 && Attack.checkResist(unit, Config.AttackSkill[6]) && ([sdk.skills.Meteor, sdk.skills.Blizzard].indexOf(Config.AttackSkill[6]) === -1 || Attack.validSpot(unit.x, unit.y))) {
		untimedSkill = Config.AttackSkill[6];
	}

	// Low mana timed skill
	if (Config.LowManaSkill[0] > -1 && Skill.getManaCost(timedSkill) > me.mp && Attack.checkResist(unit, Config.LowManaSkill[0])) {
		timedSkill = Config.LowManaSkill[0];
	}

	// Low mana untimed skill
	if (Config.LowManaSkill[1] > -1 && Skill.getManaCost(untimedSkill) > me.mp && Attack.checkResist(unit, Config.LowManaSkill[1])) {
		untimedSkill = Config.LowManaSkill[1];
	}

	if (untimedSkill === sdk.skills.GlacialSpike) {
		if (me.getSkill(sdk.skills.IceBlast, 1) > me.getSkill(sdk.skills.GlacialSpike, 1)) {
			untimedSkill = sdk.skills.IceBlast;
		}
	}

	if (me.normal && me.charlvl > 12 && gold < 5000 && Skill.getManaCost(timedSkill) > me.mp) {
		switch (SetUp.currentBuild) {
		case "Start":
			if (me.getSkill(sdk.skills.ChargedBolt, 1) && Skill.getManaCost(sdk.skills.ChargedBolt) < me.mp) {
				timedSkill = sdk.skills.ChargedBolt;
			} else if (Attack.getMobCount(me.x, me.y, 6) >= 1) {
				// I have no mana and there are mobs around me, just attack
				timedSkill = sdk.skills.Attack;
			}

			break;
		default:
			break;	
		}
	}

	// TODO: Figure out a way to dynamically use lower level/mana skills, no point in useing a 24+ mana skill if it would take a 4 mana skill to kill mob
	/*if (me.normal && (gold < 5000 || Skill.getManaCost(timedSkill) * 1.5 > me.mp)) {
		if (SetUp.currentBuild === "Start" && (me.getSkill(38, 1) && me.getSkill(45, 1) && (me.getSkill(39, 1)))) {
			if (me.getSkill(55, 1) && Skill.getManaCost(55) < me.mp) {
				timedSkill = 55;	// Glacial Spike
			} else if (Attack.getMobCountAtPosition(me.x, me.y, 6) >= 2 && Skill.getManaCost(38) < me.mp) {
				timedSkill = 38;	// Charged Bolt
			} else if (Skill.getManaCost(45) < me.mp) {
				timedSkill = 45;	// Ice Blast
			} else {
				timedSkill = 39;	// Ice Bolt
			}
		} else if (SetUp.currentBuild === "Leveling" && (me.getSkill(36, 1) && me.getSkill(39, 1))) {
			if (me.getSkill(36, 1) && Attack.checkResist(unit, "fire") && !Attack.checkResist(unit, "cold") && Skill.getManaCost(36) < me.mp) {
				timedSkill = 36;	// Fire Bolt
			} else if (Skill.getManaCost(45) < me.mp) {
				timedSkill = 45;	// Glacial Spike
			} else if (Skill.getManaCost(45) < me.mp) {
				timedSkill = 45;	// Ice Blast
			} else {
				timedSkill = 39;	// Ice Bolt
			}
		}

		if (Skill.getManaCost(timedSkill) > me.mp && Attack.getMobCountAtPosition(me.x, me.y, 6) >= 1) {
			timedSkill = 0;	// I have no mana and there are mobs around me, just attack
		}
	}*/

	switch (ClassAttack.doCast(unit, timedSkill, untimedSkill)) {
	case 0: // Fail
		break;
	case 1: // Success
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
					Skill.cast(sdk.skills.Telekinesis, 0, unit.x, unit.y);
				}
			}

			return true;
		}

		break;
	}

	return false;
};

ClassAttack.doCast = function (unit, timedSkill, untimedSkill) {
	var i, walk, tick, timedSkillRange, untimedSkillRange,
		manaCostTimedSkill, manaCostUntimedSkill;

	// No valid skills can be found
	if (timedSkill < 0 && untimedSkill < 0) {
		return 2;
	}

	if (timedSkill > -1 && (!me.getState(sdk.states.SkillDelay) || !Skill.isTimed(timedSkill))) {
		manaCostTimedSkill = Skill.getManaCost(timedSkill)
		timedSkillRange = Skill.getRange(timedSkill);

		if (timedSkill === sdk.skills.ChargedBolt) {
			if (Attack.getMobCountAtPosition(unit.x, unit.y, 6) < 3) {
				timedSkillRange = 5;
			}
		}

		if (Skill.getRange(timedSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) {
			return 0;
		}

		if (Math.round(getDistance(me, unit)) > timedSkillRange || checkCollision(me, unit, 0x4)) {
			// Allow short-distance walking for melee skills
			walk = (timedSkillRange < 4 || (timedSkill === 38 && timedSkillRange === 5)) && getDistance(me, unit) < 10 && !checkCollision(me, unit, 0x1);

			if (!Attack.getIntoPosition(unit, timedSkillRange, 0x4, walk)) {
				return 0;
			}
		}

		// Only delay if there are no mobs in our immediate area
		if (manaCostTimedSkill > me.mp && Attack.getMobCount(me.x, me.y, 8) === 0) {
			tick = getTickCount();

			while (getTickCount() - tick < 750) {
				if (manaCostTimedSkill < me.mp) {
					break;
				}

				delay(25);
			}
		}

		if (!unit.dead && !checkCollision(me, unit, 0x4)) {
			let closeMobCheck = Attack.getNearestMonster();

			if (!!closeMobCheck && [36, 39, 45, 44, 48].indexOf(timedSkill) === -1 && [44, 48].indexOf(untimedSkill) === -1 && timedSkillRange > 10) {
				if (Math.round(getDistance(me, closeMobCheck)) < 4 && Attack.getMobCountAtPosition(closeMobCheck.x, closeMobCheck.y, 6) > 2) {
					if (me.getSkill(sdk.skills.GlacialSpike, 0) && me.mp > (Skill.getManaCost(sdk.skills.GlacialSpike) + manaCostTimedSkill) &&
						!closeMobCheck.isFrozen && !closeMobCheck.dead && !checkCollision(me, closeMobCheck, 0x4)) {
						Skill.cast(sdk.skills.GlacialSpike, 0, closeMobCheck);
					}
					// Try to find better spot
					Attack.deploy(unit, 4, 5, 9);
				}
			}

			Skill.cast(timedSkill, Skill.getHand(timedSkill), unit);
		}

		return 1;
	}

	if (untimedSkill > -1) {
		manaCostUntimedSkill = Skill.getManaCost(untimedSkill);
		untimedSkillRange = Skill.getRange(untimedSkill);

		if (untimedSkillRange < 4 && !Attack.validSpot(unit.x, unit.y)) {
			return 0;
		}

		if (Math.round(getDistance(me, unit)) > untimedSkillRange || checkCollision(me, unit, 0x4)) {
			// Allow short-distance walking for melee skills
			walk = untimedSkillRange < 4 && getDistance(me, unit) < 10 && !checkCollision(me, unit, 0x1);

			if (!Attack.getIntoPosition(unit, untimedSkillRange, 0x4, walk)) {
				return 0;
			}
		}

		// Only delay if there are no mobs in our immediate area
		if (manaCostUntimedSkill > me.mp && Attack.getMobCount(me.x, me.y, 8) === 0) {
			tick = getTickCount();

			while (getTickCount() - tick < 750) {
				if (manaCostUntimedSkill < me.mp) {
					break;
				}

				delay(25);
			}
		}

		if (!unit.dead) {
			Skill.cast(untimedSkill, Skill.getHand(untimedSkill), unit);

			// Cast gspike, we are in close with nova so this can freeze the mobs around us
			if (!unit.dead && untimedSkill === sdk.skills.Nova && (me.getSkill(sdk.skills.GlacialSpike, 0))) {
				Skill.cast(sdk.skills.GlacialSpike, 0, unit);
			}
		}

		return 1;
	}

	for (i = 0; i < 25; i += 1) {
		if (!me.getState(sdk.states.SkillDelay)) {
			break;
		}

		delay(40);
	}

	return 1;
};
