/*
*	@filename	AssassinAttacks.js
*	@author		theBGuy
*	@desc		Assassin fixes to improve class attack functionality
*/

if (!isIncluded("common/Attacks/Assassin.js")) {
	include("common/Attacks/Assassin.js");
}

ClassAttack.mindBlast = function (unit) {
	if (!me.getSkill(sdk.skills.MindBlast, 1)) {
		return;
	}

	// Main bosses
	if (Attack.MainBosses.indexOf(unit.classid) > -1) {
		return;
	}

	// Duriel's Lair, Arreat Summit, Worldstone Chamber
	if ([sdk.areas.DurielsLair, sdk.areas.ArreatSummit, sdk.areas.WorldstoneChamber].indexOf(me.area) > -1) {
		return;
	}

	let list = Attack.buildMonsterList();
	let mindBlastMpCost = Skill.getManaCost(sdk.skills.MindBlast);
	list = list.filter(mob => !mob.isStunned && !mob.isUnderLowerRes && Attack.MainBosses.indexOf(mob.classid) === -1 && !checkCollision(me, mob, 0x4) &&
		(Math.round(getDistance(me, mob)) <= 6 || (Math.round(getDistance(me, mob)) >= 20 && Math.round(getDistance(me, mob)) <= 30)));

	// Cast on close mobs first
	list.sort(function (a, b) {
		return Math.round(getDistance(me, a)) - Math.round(getDistance(me, b));
	});

	if (list.length >= 1) {
		for (let i = 0; i < list.length; i++) {
			if (!list[i].dead && !checkCollision(me, list[i], 0x1) && me.mp > mindBlastMpCost * 2) {
				me.overhead("MindBlasting " + list[i].name);
				Skill.cast(sdk.skills.MindBlast, 0, list[i]);
			}
		}
	}
};

ClassAttack.placeTraps = function (unit, amount) {
	let i, j,
		traps = 0;

	this.lastTrapPos = {x: unit.x, y: unit.y};

	for (i = -1; i <= 1; i += 1) {
		for (j = -1; j <= 1; j += 1) {
			// Used for X formation
			if (Math.abs(i) === Math.abs(j)) {
				// Unit can be an object with x, y props too, that's why having "mode" prop is checked
				if (traps >= amount || (unit.hasOwnProperty("mode") && (unit.mode === 0 || unit.mode === 12))) {
					return true;
				}

				// Duriel, Mephisto, Diablo, Baal, other players
				if ((unit.hasOwnProperty("classid") && [211, 242, 243, 544].indexOf(unit.classid) > -1) || (unit.hasOwnProperty("type") && unit.type === 0)) {
					if (traps >= Config.BossTraps.length) {
						return true;
					}

					Skill.cast(Config.BossTraps[traps], 0, unit.x + i, unit.y + j);
				} else {
					if (traps >= Config.Traps.length) {
						return true;
					}

					switch (Config.Traps[traps]) {
					case sdk.skills.ChargedBoltSentry:
					case sdk.skills.LightningSentry:
						// Immune to lightning but not immune to fire, use fire trap if available
						if (!Attack.checkResist(unit, "lightning") && Attack.checkResist(unit, "fire")) {
							if (me.getSkill(sdk.skills.WakeofFire, 1)) {
								Skill.cast(sdk.skills.WakeofFire, 0, unit.x + i, unit.y + j);
							} else if (!me.getSkill(sdk.skills.WakeofFire, 1) && me.getSkill(sdk.skills.WakeofInferno, 1)) {
								Skill.cast(sdk.skills.WakeofInferno, 0, unit.x + i, unit.y + j);
							}

							break;
						} else {
							Skill.cast(Config.Traps[traps], 0, unit.x + i, unit.y + j);
						}

						break;
					case sdk.skills.WakeofFire:
					case sdk.skills.WakeofInferno:
						// Immune to fire but not immune to lightning, use light trap if available
						if (Attack.checkResist(unit, "lightning") && !Attack.checkResist(unit, "fire")) {
							if (me.getSkill(sdk.skills.LightningSentry, 1)) {
								Skill.cast(sdk.skills.LightningSentry, 0, unit.x + i, unit.y + j);
							} else if (!me.getSkill(sdk.skills.LightningSentry, 1) && me.getSkill(sdk.skills.ChargedBoltSentry, 1)) {
								Skill.cast(sdk.skills.ChargedBoltSentry, 0, unit.x + i, unit.y + j);
							}

							break;
						} else {
							Skill.cast(Config.Traps[traps], 0, unit.x + i, unit.y + j);
						}

						break;
					default:
						Skill.cast(Config.Traps[traps], 0, unit.x + i, unit.y + j);

						break;
					}
				}

				traps += 1;
			}
		}
	}

	return true;
};

ClassAttack.doAttack = function (unit, preattack) {
	if (Config.MercWatch && Town.needMerc()) {
		Town.visitTown();
	}

	let checkTraps, checkSkill, result,
		mercRevive = 0,
		timedSkill = -1,
		untimedSkill = -1,
		index = ((unit.spectype & 0x7) || unit.type === 0) ? 1 : 3,
		gold = me.getStat(14) + me.getStat(15),
		shouldUseCloak = (me.getSkill(sdk.skills.CloakofShadows, 1) && !unit.isUnderLowerRes &&
						(Attack.MainBosses.indexOf(unit.classid) === -1 || (Attack.MainBosses.indexOf(unit.classid) > -1 && Attack.getMobCountAtPosition(unit.x, unit.y, 20) > 1)));

	this.mindBlast(unit);

	if (preattack && Config.AttackSkill[0] > 0 && Attack.checkResist(unit, Config.AttackSkill[0]) && (!me.getState(sdk.states.SkillDelay) || !Skill.isTimed(Config.AttackSkill[0]))) {
		if (Math.round(getDistance(me, unit)) > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, 0x4)) {
			if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), 0x4)) {
				return 0;
			}
		}

		Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

		return 1;
	}

	// Cloak of Shadows (Aggressive) - can't be cast again until previous one runs out and next to useless if cast in precast sequence (won't blind anyone)
	if (Config.AggressiveCloak && Config.UseCloakofShadows && shouldUseCloak && !me.getState(sdk.states.SkillDelay) && !me.getState(sdk.states.CloakofShadows)) {
		if (getDistance(me, unit) < 20) {
			Skill.cast(sdk.skills.CloakofShadows, 0);
		} else if (!Attack.getIntoPosition(unit, 20, 0x4)) {
			return 0;
		}
	}

	checkTraps = this.checkTraps(unit);

	if (checkTraps) {
		if (Math.round(getDistance(me, unit)) > this.trapRange || checkCollision(me, unit, 0x4)) {
			if (!Attack.getIntoPosition(unit, this.trapRange, 0x4) || (checkCollision(me, unit, 0x1) && (getCollision(unit.area, unit.x, unit.y) & 0x1))) {
				return 0;
			}
		}

		this.placeTraps(unit, checkTraps);
	}

	// Cloak of Shadows (Defensive; default) - can't be cast again until previous one runs out and next to useless if cast in precast sequence (won't blind anyone)
	if (!Config.AggressiveCloak && Config.UseCloakofShadows && shouldUseCloak && getDistance(me, unit) < 20 && !me.getState(sdk.states.SkillDelay) && !me.getState(sdk.states.CloakofShadows)) {
		Skill.cast(sdk.skills.CloakofShadows, 0);
	}

	// Handle Switch casting
	if (index === 1 && !unit.dead) {
		if (Attack.chargedSkillsOnSwitch.some(chargeSkill => chargeSkill.skill === sdk.skills.LowerResist) && !unit.getState(sdk.states.LowerResist) && unit.curseable &&
			(gold > 500000 || Attack.BossAndMiniBosses.indexOf(unit.classid) > -1 || [sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction].indexOf(me.area) > -1) && !checkCollision(me, unit, 0x4)) {
			// Switch cast lower resist
			Attack.switchCastCharges(sdk.skills.LowerResist, unit);
		}
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

ClassAttack.farCast = function (unit) {
	let timedSkill = Config.AttackSkill[1], untimedSkill = Config.AttackSkill[2];

	// No valid skills can be found
	if (timedSkill < 0 && untimedSkill < 0) {
		return false;
	}

	let checkTraps = this.checkTraps(unit);

	if (checkTraps) {
		if (Math.round(getDistance(me, unit)) > 30 || checkCollision(me, unit, 0x4)) {
			if (!Attack.getIntoPosition(unit, 30, 0x4) || (checkCollision(me, unit, 0x1) && (getCollision(unit.area, unit.x, unit.y) & 0x1))) {
				return false;
			}
		}

		this.placeTraps(unit, checkTraps);
	}

	if (timedSkill > -1 && (!me.getState(sdk.states.SkillDelay) || !Skill.isTimed(timedSkill))) {
		if (!unit.dead) {
			Skill.cast(timedSkill, Skill.getHand(timedSkill), unit);
		}
	}

	if (untimedSkill > -1) {
		if (!unit.dead) {
			Skill.cast(untimedSkill, Skill.getHand(untimedSkill), unit);
		}
	}

	//print("FarCasting: Diablo's health " + ((unit.hp / unit.hpmax) * 100) + " % left" + " my distance from diablo: " + Math.round(getDistance(me, unit)));

	return true;
};
