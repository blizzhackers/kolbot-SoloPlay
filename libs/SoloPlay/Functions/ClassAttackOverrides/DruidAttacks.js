/*
*	@filename	DruidAttacks.js
*	@author		theBGuy
*	@desc		Druid fixes to improve class attack functionality
*/

switch (SetUp.currentBuild) {
case "Wolf":
case "Plaguewolf":
	if (!isIncluded("common/Attacks/Wereform.js")) {
		include("common/Attacks/Wereform.js");
	}

	ClassAttack.doCast = function (unit, timedSkill, untimedSkill) {
		// No valid skills can be found
		if (timedSkill < 0 && untimedSkill < 0) {
			return 2;
		}

		// Make sure I am in my choosen Wereform
		switch (Config.Wereform.toString().toLowerCase()) {
		case "1":
		case "werewolf":
			if (!me.getState(sdk.states.Wolf)) {
				Misc.shapeShift(Config.Wereform);
			}

			break;
		case "2":
		case "werebear":
			if (!me.getState(sdk.states.Bear)) {
				Misc.shapeShift(Config.Wereform);
			}

			break;
		}

		// Rebuff Armageddon
		if (me.getSkill(sdk.skills.Armageddon, 1) && !me.getState(sdk.states.Armageddon)) {
			Skill.cast(sdk.skills.Armageddon, 0);
		}

		if (timedSkill > -1 && (!me.getState(sdk.states.SkillDelay) || !Skill.isTimed(timedSkill))) {
			if (Skill.getRange(timedSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) {
				return 0;
			}

			// Teleport closer
			if (Math.ceil(getDistance(me, unit)) > 10) {
				if (Pather.useTeleport()) {
					Misc.unShift();
				}

				if (!Attack.getIntoPosition(unit, 10, 0x4)) {
					return 0;
				}
			}

			Misc.shapeShift(Config.Wereform);

			if (Math.round(getDistance(me, unit)) > Skill.getRange(timedSkill) || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(timedSkill), 0x4, true)) {
					return 0;
				}
			}

			if (!unit.dead) {
				Skill.cast(timedSkill, Skill.getHand(timedSkill), unit);
			}

			if (me.getSkill(sdk.skills.FeralRage, 1) && !me.getState(sdk.states.FeralRage)) {
				for (let i = 0; i < 2 && !unit.dead; i++) {
					Skill.cast(sdk.skills.FeralRage, Skill.getHand(sdk.skills.FeralRage), unit);
				}
			}

			if (me.getSkill(sdk.skills.Rabies, 1) && !unit.getState(sdk.states.Rabies) && !unit.dead) {
				Skill.cast(sdk.skills.Rabies, Skill.getHand(sdk.skills.Rabies), unit);
			}

			return 1;
		}

		if (untimedSkill > -1) {
			if (Skill.getRange(untimedSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) {
				return 0;
			}

			// Teleport closer
			if (Math.ceil(getDistance(me, unit)) > 10) {
				if (Pather.useTeleport()) {
					Misc.unShift();
				}

				if (!Attack.getIntoPosition(unit, 10, 0x4)) {
					return 0;
				}
			}

			Misc.shapeShift(Config.Wereform);

			if (Math.round(getDistance(me, unit)) > Skill.getRange(untimedSkill) || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(untimedSkill), 0x4, true)) {
					return 0;
				}
			}

			if (!unit.dead) {
				Skill.cast(untimedSkill, Skill.getHand(untimedSkill), unit);
			}

			return 1;
		}

		for (let i = 0; i < 25; i += 1) {
			if (!me.getState(sdk.states.SkillDelay)) {
				break;
			}

			delay(40);
		}

		return 1;
	};

	ClassAttack.afterAttack = function () {
		if (Pather.useTeleport()) { Misc.unShift(); }
		Precast.doPrecast(false);
	};

	break;
default:
	if (!isIncluded("common/Attacks/Druid.js")) {
		include("common/Attacks/Druid.js");
	}

	ClassAttack.doAttack = function (unit, preattack) {
		let index, checkSkill, result,
			mercRevive = 0,
			timedSkill = -1,
			untimedSkill = -1,
			gold = me.getStat(14) + me.getStat(15);

		index = ((unit.spectype & 0x7) || unit.type === 0) ? 1 : 3;

		if (Config.MercWatch && Town.needMerc()) {
			Town.visitTown();
		}

		// Rebuff Hurricane
		if (me.getSkill(sdk.skills.Hurricane, 1) && !me.getState(sdk.states.Hurricane)) {
			Skill.cast(sdk.skills.Hurricane, 0);
		}

		// Rebuff Cyclone Armor
		if (me.getSkill(sdk.skills.CycloneArmor, 1) && !me.getState(sdk.states.CycloneArmor)) {
			Skill.cast(sdk.skills.CycloneArmor, 0);
		}

		if (index === 1 && !unit.dead) {
			if (Attack.chargedSkillsOnSwitch.some(chargeSkill => chargeSkill.skill === sdk.skills.Decrepify) && !unit.getState(sdk.states.Decrepify) && Attack.isCursable(unit) &&
				(gold > 500000 || Attack.BossAndMiniBosses.indexOf(unit.classid) > -1 || [sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction].indexOf(me.area) > -1) && !checkCollision(me, unit, 0x4)) {
				// Switch cast decrepify
				Attack.switchCastCharges(sdk.skills.Decrepify, unit);
			}
			
			if (Attack.chargedSkillsOnSwitch.some(chargeSkill => chargeSkill.skill === sdk.skills.Weaken) && !unit.getState(sdk.states.Weaken) && !unit.getState(sdk.states.Decrepify) && Attack.isCursable(unit) &&
				(gold > 500000 || Attack.BossAndMiniBosses.indexOf(unit.classid) > -1 || [sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction].indexOf(me.area) > -1) && !checkCollision(me, unit, 0x4)) {
				// Switch cast weaken
				Attack.switchCastCharges(sdk.skills.Weaken, unit);
			}
		}

		if (preattack && Config.AttackSkill[0] > 0 && Attack.checkResist(unit, Config.AttackSkill[0]) && (!me.getState(sdk.states.SkillDelay) || !Skill.isTimed(Config.AttackSkill[0]))) {
			if (Math.round(getDistance(me, unit)) > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), 0x4)) {
					return 0;
				}
			}

			Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

			return 1;
		}

		// Get timed skill
		if (Attack.getCustomAttack(unit)) {
			checkSkill = Attack.getCustomAttack(unit)[0];
		} else {
			checkSkill = Config.AttackSkill[index];
		}

		if (Attack.checkResist(unit, checkSkill)) {
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

		if (Attack.checkResist(unit, checkSkill)) {
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

		if (me.normal && me.charlvl > 12 && gold < 5000 && Skill.getManaCost(timedSkill) > me.mp) {
			switch (SetUp.currentBuild) {
			case "Start":
				if (me.getSkill(sdk.skills.Firestorm, 1) && Skill.getManaCost(sdk.skills.Firestorm) < me.mp) {
					timedSkill = sdk.skills.Firestorm;
				} else if (Attack.getMobCount(me.x, me.y, 6) >= 1) {
					// I have no mana and there are mobs around me, just attack
					timedSkill = sdk.skills.Attack;
				}

				break;
			default:
				break;
			}
		}

		result = this.doCast(unit, timedSkill, untimedSkill);

		if (result === 2 && Config.TeleStomp && Attack.checkResist(unit, "physical") && !!me.getMerc()) {
			while (Attack.checkMonster(unit)) {
				if (Town.needMerc()) {
					if (Config.MercWatch && mercRevive++ < 1) {
						Town.visitTown();
					} else {
						return 2;
					}
				}

				if (getDistance(me, unit) > 3) {
					Pather.moveToUnit(unit);
				}

				this.doCast(unit, Config.AttackSkill[1], Config.AttackSkill[2]);
			}

			return 1;
		}

		return result;
	};

	ClassAttack.doCast = function (unit, timedSkill, untimedSkill) {
		let walk;

		// No valid skills can be found
		if (timedSkill < 0 && untimedSkill < 0) { return 2; }

		// Rebuff Hurricane
		if (me.getSkill(sdk.skills.Hurricane, 1) && !me.getState(sdk.states.Hurricane)) {
			Skill.cast(sdk.skills.Hurricane, 0);
		}

		if (timedSkill > -1 && (!me.getState(sdk.states.SkillDelay) || !Skill.isTimed(timedSkill))) {
			switch (timedSkill) {
			case sdk.skills.Tornado:
				if (Math.ceil(getDistance(me, unit)) > (Skill.getRange(timedSkill)) || checkCollision(me, unit, 0x4)) {
					if (!Attack.getIntoPosition(unit, (Skill.getRange(timedSkill)), 0x4)) {
						return 0;
					}
				}

				// Randomized x coord changes tornado path and prevents constant missing
				if (!unit.dead) {
					Skill.cast(timedSkill, Skill.getHand(timedSkill), unit.x + rand(-1, 1), unit.y);
				}

				return 1;
			default:
				if (Skill.getRange(timedSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) {
					return 0;
				}

				if (Math.ceil(getDistance(me, unit)) > (Skill.getRange(timedSkill)) || checkCollision(me, unit, 0x4)) {
					// Allow short-distance walking for melee skills
					walk = Skill.getRange(timedSkill) < 4 && getDistance(me, unit) < 10 && !checkCollision(me, unit, 0x1);

					if (!Attack.getIntoPosition(unit, (Skill.getRange(timedSkill)), 0x4, walk)) {
						return 0;
					}
				}

				if (!unit.dead) {
					Skill.cast(timedSkill, Skill.getHand(timedSkill), unit);
				}

				return 1;
			}
		}

		if (untimedSkill > -1) {
			if (Skill.getRange(untimedSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) {
				return 0;
			}

			if (Math.ceil(getDistance(me, unit)) > (Skill.getRange(untimedSkill)) || checkCollision(me, unit, 0x4)) {
				// Allow short-distance walking for melee skills
				walk = Skill.getRange(untimedSkill) < 4 && getDistance(me, unit) < 10 && !checkCollision(me, unit, 0x1);

				if (!Attack.getIntoPosition(unit, (Skill.getRange(untimedSkill)), 0x4, walk)) {
					return 0;
				}
			}

			if (!unit.dead) {
				Skill.cast(untimedSkill, Skill.getHand(untimedSkill), unit);
			}

			return 1;
		}

		for (let i = 0; i < 25; i += 1) {
			if (!me.getState(sdk.states.SkillDelay)) {
				break;
			}

			delay(40);
		}

		return 1;
	};

	break;
}
