/**
*  @filename    AssassinAttacks.js
*  @author      theBGuy
*  @desc        Assassin fixes to improve class attack functionality
*
*/

!isIncluded("common/Attacks/Assassin.js") && include("common/Attacks/Assassin.js");

ClassAttack.mindBlast = function (unit) {
	if (!unit || !Skill.canUse(sdk.skills.MindBlast)) return;
	// Main bosses
	if (Attack.mainBosses.includes(unit.classid)) return;
	// Duriel's Lair, Arreat Summit, Worldstone Chamber
	if ([sdk.areas.DurielsLair, sdk.areas.ArreatSummit, sdk.areas.WorldstoneChamber].includes(me.area)) return;

	let mindBlastMpCost = Skill.getManaCost(sdk.skills.MindBlast);
	let list = getUnits(sdk.unittype.Monster)
		.filter(function (mob) {
			if (mob.attackable && !mob.isStunned && !mob.isUnderLowerRes && !mob.isUnique) {
				let dist = mob.distance;
				return (dist <= 6 || (dist >= 20 && dist <= 30));
			}
			return false;
		})
		.sort(Sort.units);

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
	let traps = 0;

	this.lastTrapPos = {x: unit.x, y: unit.y};

	for (let i = -1; i <= 1; i += 1) {
		for (let j = -1; j <= 1; j += 1) {
			// Used for X formation
			if (Math.abs(i) === Math.abs(j)) {
				// Unit can be an object with x, y props too, that's why having "mode" prop is checked
				if (traps >= amount || (unit.hasOwnProperty("mode") && (unit.mode === 0 || unit.mode === 12))) {
					return true;
				}

				// Duriel, Mephisto, Diablo, Baal, other players
				if ((unit.hasOwnProperty("classid") && [211, 242, 243, 544].includes(unit.classid)) || (unit.hasOwnProperty("type") && unit.type === 0)) {
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
							if (Skill.canUse(sdk.skills.WakeofFire)) {
								Skill.cast(sdk.skills.WakeofFire, 0, unit.x + i, unit.y + j);
							} else if (Skill.canUse(sdk.skills.WakeofInferno)) {
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
							if (Skill.canUse(sdk.skills.LightningSentry)) {
								Skill.cast(sdk.skills.LightningSentry, 0, unit.x + i, unit.y + j);
							} else if (Skill.canUse(sdk.skills.ChargedBoltSentry)) {
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
	if (!unit) return 1;
	let gid = unit.gid;

	if (Config.MercWatch && Town.needMerc()) {
		print("mercwatch");

		if (Town.visitTown()) {
			// lost reference to the mob we were attacking
			if (!unit || !copyUnit(unit).x || !getUnit(1, -1, -1, gid) || unit.dead) {
				return 1;
			}
		}
	}

	let checkSkill;
	let mercRevive = 0;
	let timedSkill = -1;
	let untimedSkill = -1;
	let index = ((unit.spectype & 0x7) || unit.type === 0) ? 1 : 3;
	let gold = me.gold;
	let shouldUseCloak = (Skill.canUse(sdk.skills.CloakofShadows) && !unit.isUnderLowerRes && unit.getMobCount(15, 0x1) > 1);

	this.mindBlast(unit);

	if (preattack && Config.AttackSkill[0] > 0 && Attack.checkResist(unit, Config.AttackSkill[0]) && (!me.skillDelay || !Skill.isTimed(Config.AttackSkill[0]))) {
		if (Math.round(getDistance(me, unit)) > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, 0x4)) {
			if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), 0x4)) {
				return 0;
			}
		}

		Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

		return 1;
	}

	// Cloak of Shadows (Aggressive) - can't be cast again until previous one runs out and next to useless if cast in precast sequence (won't blind anyone)
	if (Config.AggressiveCloak && Config.UseCloakofShadows && shouldUseCloak && !me.skillDelay && !me.getState(sdk.states.CloakofShadows)) {
		if (getDistance(me, unit) < 20) {
			Skill.cast(sdk.skills.CloakofShadows, 0);
		} else if (!Attack.getIntoPosition(unit, 20, 0x4)) {
			return 0;
		}
	}

	let checkTraps = this.checkTraps(unit);

	if (checkTraps) {
		if (Math.round(getDistance(me, unit)) > this.trapRange || checkCollision(me, unit, 0x4)) {
			if (!Attack.getIntoPosition(unit, this.trapRange, 0x4) || (checkCollision(me, unit, 0x1) && (getCollision(me.area, unit.x, unit.y) & 0x1))) {
				return 0;
			}
		}

		this.placeTraps(unit, checkTraps);
	}

	// Cloak of Shadows (Defensive; default) - can't be cast again until previous one runs out and next to useless if cast in precast sequence (won't blind anyone)
	if (!Config.AggressiveCloak && Config.UseCloakofShadows && shouldUseCloak && unit.distance < 20 && !me.skillDelay && !me.getState(sdk.states.CloakofShadows)) {
		Skill.cast(sdk.skills.CloakofShadows, 0);
	}

	// Handle Switch casting
	if (index === 1 && !unit.dead) {
		if (CharData.skillData.haveChargedSkill(sdk.skills.SlowMissiles) && unit.getEnchant(sdk.enchant.LightningEnchanted) && !unit.getState(sdk.states.SlowMissiles)
			&& unit.curseable && (gold > 500000 && Attack.bossesAndMiniBosses.indexOf(unit.classid) === -1) && !checkCollision(me, unit, 0x4)) {
			// Cast slow missiles
			Attack.castCharges(sdk.skills.SlowMissiles, unit);
		}
		
		if (CharData.skillData.haveChargedSkillOnSwitch(sdk.skills.LowerResist) && !unit.getState(sdk.states.LowerResist)
			&& unit.curseable && (gold > 500000 || Attack.bossesAndMiniBosses.includes(unit.classid) || [sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction].includes(me.area))
			&& !checkCollision(me, unit, 0x4)) {
			// Switch cast lower resist
			Attack.switchCastCharges(sdk.skills.LowerResist, unit);
		}
	}

	// Get timed skill
	checkSkill = Attack.getCustomAttack(unit) ? Attack.getCustomAttack(unit)[0] : Config.AttackSkill[index];

	if (Attack.checkResist(unit, checkSkill) && Attack.validSpot(unit.x, unit.y, checkSkill)) {
		timedSkill = checkSkill;
	} else if (Config.AttackSkill[5] > -1 && Attack.checkResist(unit, Config.AttackSkill[5]) && Attack.validSpot(unit.x, unit.y, Config.AttackSkill[5])) {
		timedSkill = Config.AttackSkill[5];
	}

	// Get untimed skill
	checkSkill = Attack.getCustomAttack(unit) ? Attack.getCustomAttack(unit)[1] : Config.AttackSkill[index + 1];

	if (Attack.checkResist(unit, checkSkill) && Attack.validSpot(unit.x, unit.y, checkSkill)) {
		untimedSkill = checkSkill;
	} else if (Config.AttackSkill[6] > -1 && Attack.checkResist(unit, Config.AttackSkill[6]) && Attack.validSpot(unit.x, unit.y, Config.AttackSkill[6])) {
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

	let result = this.doCast(unit, timedSkill, untimedSkill);

	if (result === 2 && Config.TeleStomp && Config.UseMerc && Pather.canTeleport() && Attack.checkResist(unit, "physical") && !!me.getMerc() && Attack.validSpot(unit.x, unit.y)) {
		let merc = me.getMerc();

		while (unit.attackable) {
			if (Misc.townCheck()) {
				if (!unit || !copyUnit(unit).x) {
					unit = Misc.poll(() => getUnit(1, -1, -1, gid), 1000, 80);
				}
			}

			if (!unit) return 1;

			if (Town.needMerc()) {
				if (Config.MercWatch && mercRevive++ < 1) {
					Town.visitTown();
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

			let closeMob = Attack.getNearestMonster({skipGid: gid});
			!!closeMob && this.doCast(closeMob, timedSkill, untimedSkill);
		}

		return 1;
	}

	return result;
};

ClassAttack.farCast = function (unit) {
	let timedSkill = Config.AttackSkill[1], untimedSkill = Config.AttackSkill[2];

	// No valid skills can be found
	if (timedSkill < 0 && untimedSkill < 0) return false;

	let checkTraps = this.checkTraps(unit);

	if (checkTraps) {
		if (unit.distance > 30 || checkCollision(me, unit, 0x4)) {
			if (!Attack.getIntoPosition(unit, 30, 0x4) || (checkCollision(me, unit, 0x1) && (getCollision(me.area, unit.x, unit.y) & 0x1))) {
				return false;
			}
		}

		this.placeTraps(unit, checkTraps);
	}

	if (timedSkill > -1 && (!me.skillDelay || !Skill.isTimed(timedSkill))) {
		!unit.dead && Skill.cast(timedSkill, Skill.getHand(timedSkill), unit);
	}

	if (untimedSkill > -1) {
		!unit.dead && Skill.cast(untimedSkill, Skill.getHand(untimedSkill), unit);
	}

	return true;
};
