/*
*	@filename	AmazonAttacks.js
*	@author		theBGuy
*	@desc		Amazon fixes to improve class attack functionality
*/

// TODO: clean up this whole file

!isIncluded("common/Attacks/Amazon.js") && include("common/Attacks/Amazon.js");

ClassAttack.decoyTick = getTickCount();

ClassAttack.doAttack = function (unit, preattack) {
	if (!unit) return 1;
	let gid = unit.gid;
	let needRepair = me.charlvl < 5 ? [] : Town.needRepair();

	if ((Config.MercWatch && Town.needMerc()) || needRepair.length > 0) {
		print("towncheck");

		if (Town.visitTown(!!needRepair.length)) {
			// lost reference to the mob we were attacking
			if (!unit || !copyUnit(unit).x || !getUnit(1, -1, -1, gid) || unit.dead) {
				return 1;
			}
		}
	}

	let checkSkill,
		mercRevive = 0,
		timedSkill = -1,
		untimedSkill = -1,
		preattackRange = Skill.getRange(Config.AttackSkill[0]),
		decoyDuration = (10 + me.getSkill(sdk.skills.Decoy, 1) * 5) * 1000,
		gold = me.gold,
		index = ((unit.spectype & 0x7) || unit.type === 0) ? 1 : 3;

	let useInnerSight = me.getSkill(sdk.skills.InnerSight, 1);
	let useSlowMissiles = me.getSkill(sdk.skills.SlowMissiles, 1);
	let useDecoy = (me.getSkill(sdk.skills.Dopplezon, 1) && !me.normal);
	let useLightFury = me.getSkill(sdk.skills.LightningFury, 1) >= 10;
	let usePlague = !me.normal && me.getSkill(sdk.skills.PlagueJavelin, 1);
	let useJab = Item.getEquippedItem(4).tier >= 1000 && me.getSkill(sdk.skills.Jab, 1);
	let forcePlague = me.getSkill(sdk.skills.PlagueJavelin, 1) >= 15;	//Extra poison damage then attack

	// Precast Section -----------------------------------------------------------------------------------------------------------------//
	if (useSlowMissiles) {
		if (!unit.getState(sdk.states.SlowMissiles)) {
			if ((Math.round(getDistance(me, unit)) > 3 || unit.getEnchant(sdk.enchant.LightningEnchanted)) && Math.round(getDistance(me, unit)) < 13 && !checkCollision(me, unit, 0x4)) {
				// Act Bosses and mini-bosses are immune to Slow Missles and pointless to use on lister or Cows, Use Inner-Sight instead
				if ([156, 211, 242, 243, 544, 571, 391, 365, 267, 229].indexOf(unit.classid) > -1) {
					// Check if already in this state
					if (!unit.getState(sdk.states.InnerSight)) {
						Skill.cast(sdk.skills.InnerSight, 0, unit);
					}
				} else {
					Skill.cast(sdk.skills.SlowMissiles, 0, unit);
				}
			}
		}
	}

	if (unit.getEnchant(sdk.enchant.ManaBurn) && me.getSkill(sdk.skills.LightningFury, 1) && Attack.getMobCountAtPosition(unit.x, unit.y, 7) > 2) {
		useLightFury = true;
	}

	if (unit.getEnchant(sdk.enchant.ManaBurn) && me.getSkill(sdk.skills.PlagueJavelin, 1) && Attack.getMobCountAtPosition(unit.x, unit.y, 7) > 2) {
		forcePlague = true;
	}

	if (useInnerSight) {
		if (!unit.getState(sdk.states.InnerSight)) {
			if (Math.round(getDistance(me, unit)) > 3 && Math.round(getDistance(me, unit)) < 13 && !checkCollision(me, unit, 0x4)) {
				Skill.cast(sdk.skills.InnerSight, 0, unit);
			}
		}
	}

	// Handle Switch casting
	if (me.expansion && index === 1 && !unit.dead) {
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

	if (useDecoy) {
		// Act Bosses or Immune to my main boss skill
		if ((Attack.mainBosses.includes(unit.classid)) || !Attack.checkResist(unit, Config.AttackSkill[1])) {
			for (let i = 0; i < 25; i += 1) {
				if (!me.getState(sdk.states.SkillDelay)) {
					break;
				}

				delay(40);
			}

			// Don't use decoy if within melee distance
			if (Math.round(getDistance(me, unit)) > 4) {
				// Check to see if decoy has already been cast
				let decoy;

				for (let i = 0; i < 5; i++) {
					decoy = getUnit(-1, 356);

					if (decoy) {
						break;
					}
				}
				
				if (!decoy && (getTickCount() - this.decoyTick >= decoyDuration) && Math.round(getDistance(me, unit)) > 4) {
					if (Math.round(getDistance(me, unit)) > 10 || checkCollision(me, unit, 0x4)) {
						if (!Attack.getIntoPosition(unit, 10, 0x4)) {
							return 0;
						}
					}

					let coord = CollMap.getRandCoordinate(unit.x, -2, 2, unit.y, -2, 2);
					!!coord && Skill.cast(sdk.skills.Decoy, 0, coord.x, coord.y);

					// Check if it was a sucess
					!!me.getMinionCount(8) && (this.decoyTick = getTickCount());
				}
			}
		}
	}

	// Only try attacking light immunes if I have my end game javelin - preAttack with Plague Javelin
	if ((usePlague) && !Attack.checkResist(unit, "lightning")) {
		if ((Math.round(getDistance(me, unit)) <= 15) && !checkCollision(me, unit, 0x4)) {
			// Cast Slow-Missles, then proceed with Plague Jav. Lowers amount of damage from projectiles.
			if (!unit.getState(sdk.states.SlowMissiles) && useSlowMissiles) {
				Skill.cast(sdk.skills.SlowMissiles, 0, unit);
			}

			// Handle Switch casting
			if (!unit.dead) {
				if (!unit.getState(sdk.states.LowerResist) && unit.curseable &&
					(gold > 500000 || Attack.bossesAndMiniBosses.indexOf(unit.classid) > -1 || [sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction].indexOf(me.area) > -1) && !checkCollision(me, unit, 0x4)) {
					// Switch cast lower resist
					Attack.switchCastCharges(sdk.skills.LowerResist, unit);
				}
			}

			if (Attack.checkResist(unit, "poison") && !me.getState(sdk.states.SkillDelay) && !unit.dead) {
				Skill.cast(sdk.skills.PlagueJavelin, Skill.getHand(sdk.skills.PlagueJavelin), unit);
			}

			if (!useJab) {
				// We are within melee distance might as well use jab rather than stand there
				if (Math.round(getDistance(me, unit)) < 4) {
					if (me.getSkill(sdk.skills.Jab, 1)) {
						if (Math.round(getDistance(me, unit)) > 3 || checkCollision(me, unit, 0x4)) {
							if (!Attack.getIntoPosition(unit, 3, 0x4)) {
								return 0;
							}
						}

						// Make sure monster is not physical immune
						if (Attack.checkResist(unit, "physical") && !unit.dead) {
							Skill.cast(sdk.skills.Jab, Skill.getHand(sdk.skills.Jab), unit);
						}
						
						return 1;
					}
				}
				
				return 1;
			}
		}
	}

	// Only try attacking immunes if I have my end game javelin and they aren't lightning enchanted - use jab as main attack
	if (useJab && !Attack.checkResist(unit, Config.AttackSkill[1]) && Attack.checkResist(unit, "physical") && !unit.getEnchant(sdk.enchant.LightningEnchanted)) {
		if (Math.round(getDistance(me, unit)) > 3 || checkCollision(me, unit, 0x4)) {
			if (!Attack.getIntoPosition(unit, 3, 0x4)) {
				return 0;
			}
		}

		if (!unit.dead) {
			Skill.cast(sdk.skills.Jab, Skill.getHand(sdk.skills.Jab), unit);
		}
		
		return 1;
	}

	if (forcePlague && Attack.checkResist(unit, "poison") && !unit.getState(sdk.states.Poison) && !me.getState(sdk.states.SkillDelay)) {
		if ((Math.round(getDistance(me, unit)) >= 8 && Math.round(getDistance(me, unit)) <= 15) && !checkCollision(me, unit, 0x4)) {
			Skill.cast(sdk.skills.PlagueJavelin, Skill.getHand(sdk.skills.PlagueJavelin), unit);
		}
	}

	if (useLightFury) {
		if ((Math.round(getDistance(me, unit)) >= 8 && Math.round(getDistance(me, unit)) <= 15) && !checkCollision(me, unit, 0x4)) {
			Skill.cast(sdk.skills.LightningFury, Skill.getHand(sdk.skills.LightningFury), unit);
		}
	}

	if (preattack && Config.AttackSkill[0] > 0 && [8, 17].indexOf(Config.AttackSkill[0]) === -1 && Attack.checkResist(unit, Config.AttackSkill[0]) && (!me.getState(sdk.states.SkillDelay) || !Skill.isTimed(Config.AttackSkill[0]))) {
		if (Math.round(getDistance(me, unit)) > preattackRange || checkCollision(me, unit, 0x4)) {
			if (!Attack.getIntoPosition(unit, preattackRange, 0x4)) {
				return 0;
			}
		}

		Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

		return 1;
	}

	// Get timed skill
	checkSkill = Attack.getCustomAttack(unit) ? Attack.getCustomAttack(unit)[0] : Config.AttackSkill[index];

	if (Attack.checkResist(unit, checkSkill) && Attack.validSpot(unit.x, unit.y, checkSkill)) {
		timedSkill = checkSkill;
	} else if (Config.AttackSkill[5] > -1 && Attack.checkResist(unit, Config.AttackSkill[5]) && ([56, 59].indexOf(Config.AttackSkill[5]) === -1 || Attack.validSpot(unit.x, unit.y))) {
		timedSkill = Config.AttackSkill[5];
	}

	// Get untimed skill
	checkSkill = Attack.getCustomAttack(unit) ? Attack.getCustomAttack(unit)[1] : Config.AttackSkill[index + 1];

	if (Attack.checkResist(unit, checkSkill) && Attack.validSpot(unit.x, unit.y, checkSkill)) {
		untimedSkill = checkSkill;
	} else if (Config.AttackSkill[6] > -1 && Attack.checkResist(unit, Config.AttackSkill[6]) && ([56, 59].indexOf(Config.AttackSkill[6]) === -1 || Attack.validSpot(unit.x, unit.y))) {
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

ClassAttack.afterAttack = function () {
	Precast.doPrecast(false);

	let needRepair = me.charlvl < 5 ? [] : Town.needRepair();
	
	// Repair check, make sure i have a tome
	if (needRepair.length > 0 && me.getItem(sdk.items.TomeofTownPortal)) {
		Town.visitTown(true);
	}

	this.lightFuryTick = 0;
};

// Returns: 0 - fail, 1 - success, 2 - no valid attack skills
ClassAttack.doCast = function (unit, timedSkill, untimedSkill) {
	let walk;

	// No valid skills can be found
	if (timedSkill < 0 && untimedSkill < 0) return 2;

	// Arrow/bolt check
	if (this.bowCheck) {
		switch (this.bowCheck) {
		case "bow":
			if (!me.getItem("aqv", 1)) {
				Town.visitTown();
			}

			break;
		case "crossbow":
			if (!me.getItem("cqv", 1)) {
				Town.visitTown();
			}

			break;
		}
	}

	if (timedSkill > -1 && (!me.getState(sdk.states.SkillDelay) || !Skill.isTimed(timedSkill))) {
		switch (timedSkill) {
		case sdk.skills.LightningFury:
			if (!this.lightFuryTick || getTickCount() - this.lightFuryTick > Config.LightningFuryDelay * 1000) {
				if (Math.round(getDistance(me, unit)) > Skill.getRange(timedSkill) || checkCollision(me, unit, 0x4)) {
					if (!Attack.getIntoPosition(unit, Skill.getRange(timedSkill), 0x4)) {
						return 0;
					}
				}

				if (!unit.dead && Skill.cast(timedSkill, Skill.getHand(timedSkill), unit)) {
					this.lightFuryTick = getTickCount();
				}

				return 1;
			}

			break;
		default:
			// If main attack skill is lightning strike and charged strike's skill level is at least level 15, check current monster count. If monster count is less than 3, use CS as its more effective with small mobs
			if (timedSkill === sdk.skills.LightningStrike && me.getSkill(sdk.skills.ChargedStrike, 1) >= 15) {
				if (me.getMobCount(15, Coords_1.BlockBits.LineOfSight | Coords_1.BlockBits.Ranged | Coords_1.BlockBits.ClosedDoor | Coords_1.BlockBits.BlockWall) <= 3) {
					timedSkill = sdk.skills.ChargedStrike;
				}
			}

			if (Skill.getRange(timedSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) {
				return 0;
			}

			if (Math.round(getDistance(me, unit)) > Skill.getRange(timedSkill) || checkCollision(me, unit, 0x4)) {
				// Allow short-distance walking for melee skills
				walk = Skill.getRange(timedSkill) < 4 && getDistance(me, unit) < 10 && !checkCollision(me, unit, 0x1);

				if (!Attack.getIntoPosition(unit, Skill.getRange(timedSkill), 0x4, walk)) {
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

		if (Math.round(getDistance(me, unit)) > Skill.getRange(untimedSkill) || checkCollision(me, unit, 0x4)) {
			// Allow short-distance walking for melee skills
			walk = Skill.getRange(untimedSkill) < 4 && getDistance(me, unit) < 10 && !checkCollision(me, unit, 0x1);

			if (!Attack.getIntoPosition(unit, Skill.getRange(untimedSkill), 0x4, walk)) {
				return 0;
			}
		}

		if (!unit.dead) {
			Skill.cast(untimedSkill, Skill.getHand(untimedSkill), unit);
		}

		return 1;
	}

	Misc.poll(() => !me.skillDelay, 1000, 40);

	// Wait for Lightning Fury timeout
	while (this.lightFuryTick && getTickCount() - this.lightFuryTick < Config.LightningFuryDelay * 1000) {
		delay(40);
	}

	return 1;
};
