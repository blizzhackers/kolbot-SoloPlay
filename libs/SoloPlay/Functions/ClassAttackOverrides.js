/*
*	@filename	ClassAttackOverides.js
*	@author		theBGuy, isid0re
*	@desc		fixes to improve class attack functionality per class
*/

//var sdk = require('../modules/sdk');

// Class Specific Attacks
switch (me.classid) {
case 0: //Amazon - theBGuy
	if (!isIncluded("common/Attacks/Amazon.js")) {
		include("common/Attacks/Amazon.js");
	}

	ClassAttack.decoyTick = getTickCount();

	ClassAttack.doAttack = function (unit, preattack) {
		var needRepair = [];

		if (me.charlvl >= 5) {
			needRepair = Town.needRepair();
		}

		if ((Config.MercWatch && Town.needMerc()) || needRepair.length > 0) {
			Town.visitTown(!!needRepair.length);
		}

		var checkSkill, result, decoy,
			mercRevive = 0,
			timedSkill = -1,
			untimedSkill = -1,
			preattackRange = Skill.getRange(Config.AttackSkill[0]),
			decoyDuration = (10 + me.getSkill(sdk.skills.Dopplezon, 1) * 5) * 1000,
			gold = me.getStat(14) + me.getStat(15),
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
		if (index === 1 && !unit.dead) {
			if (!unit.getState(sdk.states.Weaken) && Attack.isCursable(unit) && (gold > 500000 || Attack.BossAndMiniBosses.indexOf(unit.classid) > -1 || [108, 131].indexOf(me.area) > -1) && !checkCollision(me, unit, 0x4)) {
				// Switch cast weaken
				Attack.switchCastCharges(sdk.skills.Weaken, unit);
			}

			if (!unit.getState(sdk.states.LowerResist) && Attack.isCursable(unit) && (gold > 500000 || Attack.BossAndMiniBosses.indexOf(unit.classid) > -1 || [108, 131].indexOf(me.area) > -1) && !checkCollision(me, unit, 0x4)) {
				// Switch cast lower resist
				Attack.switchCastCharges(sdk.skills.LowerResist, unit);
			}
		}

		if (useDecoy) {
			// Act Bosses or Immune to my main boss skill
			if (([156, 211, 242, 243, 544].indexOf(unit.classid) > -1) || !Attack.checkResist(unit, Config.AttackSkill[1])) {
				for (let i = 0; i < 25; i += 1) {
					if (!me.getState(sdk.states.SkillDelay)) {
						break;
					}

					delay(40);
				}

				// Don't use decoy if within melee distance
				if (Math.round(getDistance(me, unit)) > 4) {
					// Check to see if decoy has already been cast
					for (let i = 0; i < 5; i++) {
						decoy = getUnit(-1, 356);

						if (decoy) {
							break;
						}
					}
					
					if ((getTickCount() - this.decoyTick >= decoyDuration) && Math.round(getDistance(me, unit)) > 4) { 
						if (Math.round(getDistance(me, unit)) > 10 || checkCollision(me, unit, 0x4)) {
							if (!Attack.getIntoPosition(unit, 10, 0x4)) {
								return 0;
							}
						}

						let coord = CollMap.getRandCoordinate(unit.x, -2, 2, unit.y, -2, 2);

						if (!!coord) {
							Skill.cast(sdk.skills.Dopplezon, 0, coord.x, coord.y);
						}

						// Check if it was a sucess
						if (!!me.getMinionCount(8)) {
							this.decoyTick = getTickCount();
						}
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
					if (!unit.getState(sdk.states.LowerResist) && Attack.isCursable(unit) && (gold > 500000 || Attack.BossAndMiniBosses.indexOf(unit.classid) > -1 || [108, 131].indexOf(me.area) > -1) && !checkCollision(me, unit, 0x4)) {
						Attack.switchCastCharges(sdk.skills.LowerResist, unit);		// Switch cast lower resist
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
		if (useJab && !Attack.checkResist(unit, Config.AttackSkill[1]) && Attack.checkResist(unit, "physical") && !unit.getEnchant(17)) {
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

	ClassAttack.afterAttack = function () {
		var needRepair;

		if (Pather.useTeleport()){
			Misc.unShift();
		}

		Precast.doPrecast(false);

		if (me.charlvl > 5) {
			needRepair = Town.needRepair();	
		}
		
		// Repair check, make sure i have a tome
		if (needRepair && needRepair.length > 0 && me.getItem(518)) {
			Town.visitTown(true);
		}

		this.lightFuryTick = 0;
	};

	// Returns: 0 - fail, 1 - success, 2 - no valid attack skills
	ClassAttack.doCast = function (unit, timedSkill, untimedSkill) {
		var i, walk;

		// No valid skills can be found
		if (timedSkill < 0 && untimedSkill < 0) {
			return 2;
		}

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
			case 35:
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
					if (Attack.getMobCount(me.x, me.y, 15) <= 3) {
						timedSkill = 24;
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

		for (i = 0; i < 25; i += 1) {
			if (!me.getState(sdk.states.SkillDelay)) {
				break;
			}

			delay(40);
		}

		// Wait for Lightning Fury timeout
		while (this.lightFuryTick && getTickCount() - this.lightFuryTick < Config.LightningFuryDelay * 1000) {
			delay(40);
		}

		return 1;
	};

	break;
case 1: // Sorceress
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
		if (index === 1 && !unit.dead) {
			if (!unit.getState(sdk.states.Weaken) && Attack.isCursable(unit) && (gold > 500000 || Attack.BossAndMiniBosses.indexOf(unit.classid) > -1 || [108, 131].indexOf(me.area) > -1) && !checkCollision(me, unit, 0x4)) {
				// Switch cast weaken
				Attack.switchCastCharges(sdk.skills.Weaken, unit);
			}

			if (!unit.getState(sdk.states.LowerResist) && Attack.isCursable(unit) && (gold > 500000 || Attack.BossAndMiniBosses.indexOf(unit.classid) > -1 || [108, 131].indexOf(me.area) > -1) && !checkCollision(me, unit, 0x4)) {
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
		if (useStatic && Attack.getMobCount(me.x, me.y, staticRange) >= (me.area === 131 ? 1 : 2) && (staticManaCost * 3) < me.mp) {
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

	break;
case 2: // Necromancer
	if (!isIncluded("common/Attacks/Necromancer.js")) {
		include("common/Attacks/Necromancer.js");
	}

	ClassAttack.maxSkeletons = 0;
	ClassAttack.maxMages = 0;
	ClassAttack.maxRevives = 0;

	ClassAttack.setArmySize = function () {
		let skillNum;

		if (Config.Skeletons === "max") {
			skillNum = me.getSkill(sdk.skills.RaiseSkeleton, 1);
			this.maxSkeletons = skillNum < 4 ? skillNum : (Math.floor(skillNum / 3) + 2);
		} else {
			this.maxSkeletons = Config.Skeletons;
		}

		if (Config.SkeletonMages === "max") {
			skillNum = me.getSkill(sdk.skills.RaiseSkeletalMage, 1);
			this.maxMages = skillNum < 4 ? skillNum : (Math.floor(skillNum / 3) + 2);
		} else {
			this.maxMages = Config.SkeletonMages;
		}

		if (Config.Revives === "max") {
			skillNum = me.getSkill(sdk.skills.Revive, 1);
			this.maxRevives = skillNum;
		} else {
			this.maxRevives = Config.Revives;
		}		
	};

	// Returns: true - doesn't use summons or has all he can summon, false - not full of summons yet
	ClassAttack.isArmyFull = function () {
		// This necro doesn't summon anything so assume he's full
		if (Config.Skeletons + Config.SkeletonMages + Config.Revives === 0) {
			return true;
		}

		// Make sure we have a current count of summons needed
		this.setArmySize();

		// See if we're at full army count
		if (me.getMinionCount(4) < this.maxSkeletons) {
			return false;
		}
		if (me.getMinionCount(5) < this.maxMages) {
			return false;
		}
		if (me.getMinionCount(6) < this.maxRevives) {
			return false;
		}

		// If we got this far this necro has all the summons he needs
		return true;
	};

	ClassAttack.getCurseState = function (unit, curseID) {
		let state = 0;

		if (unit === undefined || unit.dead) {
			return false;
		}

		switch (curseID) {
		case 0: //nothing
			state = 0;

			break;
		case 66: //amplify damage
			state = 9;

			break;
		case 71: //dim vision
			state = 23;

			break;
		case 72: //weaken
			state = 19;

			break;
		case 76: //iron maiden
			state = 55;

			break;
		case 77: //terror
			state = 56;

			break;
		case 81: //confuse
			state = 59;

			break;
		case 82: //life tap
			state = 58;

			break;
		case 86: //attract
			state = 57;

			break;
		case 87: //decrepify
			state = 60;

			break;
		case 91: //lower resist
			state = 61;

			break;
		default:

			break;
		}

		return unit.getState(state);
	};

	ClassAttack.smartCurse = function (unit, index) {
		if (unit === undefined || unit.dead || !Attack.isCursable(unit)) {
			return false;
		}

		let type = index === 1 ? "Boss" : "Normal";
		let curseToCast = -1;
		let useWeaken = me.getSkill(sdk.skills.Weaken, 1);
		let useDim = me.getSkill(sdk.skills.DimVision, 1);
		let useAttract = me.getSkill(sdk.skills.Attract, 1) && me.area !== 131;
		let useConfuse = me.getSkill(sdk.skills.Confuse, 1) && me.area === 131;
		let useDecrep = me.getSkill(sdk.skills.Decrepify, 1);
		let useMaiden = me.getSkill(sdk.skills.IronMaiden, 1) && me.area === 73 && me.normal;
		let useAmp = (me.getSkill(sdk.skills.AmplifyDamage, 1) && !Attack.checkResist(unit, "magic") && !Attack.checkResist(unit, "physical"));
		let useLowerRes = (me.getSkill(sdk.skills.LowerResist, 1) && SetUp.currentBuild === "Poison" && Attack.checkResist(unit, "poison"));

		switch (type) {
		case "Boss":
			if (useMaiden && !this.getCurseState(unit, 71)) {
				curseToCast = 76;

				break;
			}

			if (useLowerRes && !this.getCurseState(unit, 61)) {
				curseToCast = 76;

				break;
			}

			if (useAmp && !this.getCurseState(unit, 66)) {
				curseToCast = 66;

				break;
			}

			if (useWeaken && !useDecrep && !useAmp && !useMaiden && Math.round(getDistance(me, unit)) < 15 && !this.getCurseState(unit, 72)) {
				curseToCast = 72;

				break;
			}

			if (useDecrep && !useMaiden && !this.getCurseState(unit, 87)) {
				curseToCast = 87;

				break;
			}

			break;
		case "Normal":
			if (useAttract && unit.classid !== 571 && Math.round(getDistance(me, unit)) > 8 && !checkCollision(me, unit, 0x4) && !this.getCurseState(unit, 86)) {
				// Save resources by only doing this check if all the other ones are met
				if (Attack.getMobCountAtPosition(unit.x, unit.y, 6, false, false) >= 2) {
					curseToCast = 86;
				}

				break;
			}

			if (useConfuse && unit.classid !== 571 && Math.round(getDistance(me, unit)) > 8 && !checkCollision(me, unit, 0x4) && !this.getCurseState(unit, 81)) {
				// Save resources by only doing this check if all the other ones are met
				if (Attack.getMobCountAtPosition(unit.x, unit.y, 6, false, false) >= 2) {
					curseToCast = 81;
				}

				break;
			}

			if (useLowerRes && !this.getCurseState(unit, 61)) {
				curseToCast = 76;

				break;
			}

			// Dim doesn't work on oblivion knights
			if (useDim && Math.round(getDistance(me, unit)) > 15 && !checkCollision(me, unit, 0x4) && [312, 701, 702].indexOf(unit.classid) === -1 && !this.getCurseState(unit, 71)) {
				curseToCast = 71;

				break;
			} 

			if (useAmp && !this.getCurseState(unit, 66)) {
				curseToCast = 66;

				break;
			}

			if (useWeaken && !useDecrep && Math.round(getDistance(me, unit)) < 15 && !this.getCurseState(unit, 72)) {
				curseToCast = 72;

				break;
			}

			if (useDecrep && !this.getCurseState(unit, 87) && (!this.getCurseState(unit, 71) || Math.round(getDistance(me, unit)) < 15)) {
				curseToCast = 87;

				break;
			}

			break;
		}

		if (curseToCast > 0 && Skill.getManaCost(curseToCast) < me.mp) {
			if (!checkCollision(me, unit, 0x4)) {
				me.overhead("Cursing " + unit.name + " with " + curseToCast + " monster is " + type);
				return Skill.cast(curseToCast, 0, unit);
			} else {
				me.overhead(unit.name + " is blocked, skipping attempt to curse");
				this.doCast(unit, Config.AttackSkill[type === "Boss" ? 1 : 3], Config.AttackSkill[type === "Boss" ? 2 : 5]);
			}
		}

		return false;
	};

	ClassAttack.bpTick = 0;

	ClassAttack.doAttack = function (unit, preattack) {
		var index, checkSkill, result,
			mercRevive = 0,
			timedSkill = -1,
			untimedSkill = -1;

		let useTerror = me.getSkill(sdk.skills.Terror, 0);
		let useBP = me.getSkill(sdk.skills.BonePrison, 1);

		if (!this.cursesSet) {
			this.initCurses();
		}

		if (Config.MercWatch && Town.needMerc()) {
			Town.visitTown();
		}

		index = ((unit.spectype & 0x7) || unit.type === 0) ? 1 : 3;

		let bpAllowedAreas = [37, 38, 39, 41, 42, 43, 44, 46, 73, 76, 77, 78, 79, 80, 81, 83, 102, 104, 105, 106, 108, 110, 111, 120, 121, 128, 129, 130, 131];

		// Bone prison
		if (useBP && Math.round(getDistance(me, unit)) > ([73, 120].indexOf(me.area) > -1 ? 6 : 10) && bpAllowedAreas.indexOf(me.area) > -1 && (index === 1 || [571, 391].indexOf(unit.classid) > -1)
			&& !checkCollision(me, unit, 0x4) && Skill.getManaCost(88) * 2 < me.mp && getTickCount() - this.bpTick > 2000) {
			if (Skill.cast(88, 0, unit)) {
				this.bpTick = getTickCount();
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


		if (useTerror && Attack.getMobCount(me.x, me.y, 6, null, true) >= 3 && Skill.getManaCost(sdk.skills.Terror) < me.mp && me.hp < Math.floor(me.hpmax * 75 / 100)) {
			Skill.cast(sdk.skills.Terror, 0);
		}

		this.smartCurse(unit, index);

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

		if (result === 1) {
			if (Config.ActiveSummon) {
				this.raiseArmy();
			}

			this.explodeCorpses(unit);
		} else if (result === 2 && Config.TeleStomp && Attack.checkResist(unit, "physical") && !!me.getMerc()) {
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

				if (Config.ActiveSummon) {
					this.raiseArmy();
				}

				this.explodeCorpses(unit);
			}

			return 1;
		}

		return result;
	};

	// Returns: 0 - fail, 1 - success, 2 - no valid attack skills
	ClassAttack.doCast = function (unit, timedSkill, untimedSkill) {
		var i, walk, timedSkillRange, untimedSkillRange;

		// No valid skills can be found
		if (timedSkill < 0 && untimedSkill < 0) {
			return 2;
		}

		// Check for bodies to exploit for CorpseExplosion before committing to an attack for non-summoner type necros
		if (Config.Skeletons + Config.SkeletonMages + Config.Revives === 0) {
			if (this.checkCorpseNearMonster(unit)) {
				this.explodeCorpses(unit);
			}
		}

		if (timedSkill > -1 && (!me.getState(sdk.states.SkillDelay) || !Skill.isTimed(timedSkill))) {
			timedSkillRange = Skill.getRange(timedSkill);

			switch (timedSkill) {
			case sdk.skills.PoisonNova:
				if (!this.novaTick || getTickCount() - this.novaTick > Config.PoisonNovaDelay * 1000) {
					if (Math.round(getDistance(me, unit)) > timedSkillRange || checkCollision(me, unit, 0x4)) {
						if (!Attack.getIntoPosition(unit, timedSkillRange, 0x4)) {
							return 0;
						}
					}

					if (!unit.dead && Skill.cast(timedSkill, Skill.getHand(timedSkill), unit)) {
						this.novaTick = getTickCount();
					}
				}

				break;
			case 500: // Pure Summoner
				if (Math.round(getDistance(me, unit)) > timedSkillRange || checkCollision(me, unit, 0x4)) {
					if (!Attack.getIntoPosition(unit, timedSkillRange, 0x4)) {
						return 0;
					}
				}

				delay(300);

				break;
			default:
				if (timedSkillRange < 4 && !Attack.validSpot(unit.x, unit.y)) {
					return 0;
				}

				if (timedSkill === sdk.skills.Teeth) {
					timedSkillRange = Attack.getMobCount(unit.x, unit.y, 6) <= 3 ? 6 : timedSkillRange;
				}

				if (Math.round(getDistance(me, unit)) > timedSkillRange || checkCollision(me, unit, 0x4)) {
					// Allow short-distance walking for melee skills
					walk = timedSkillRange < 4 && getDistance(me, unit) < 10 && !checkCollision(me, unit, 0x1);

					if (!Attack.getIntoPosition(unit, timedSkillRange, 0x4, walk)) {
						return 0;
					}
				}

				if (!unit.dead) {
					let closeMobCheck = Attack.getNearestMonster();

					if (Math.round(getDistance(me, unit)) < 4 && timedSkillRange > 6) {
						// Try to find better spot
						Attack.deploy(unit, 4, 5, 9);
					}

					Skill.cast(timedSkill, Skill.getHand(timedSkill), unit);
				}

				break;
			}
		}

		if (untimedSkill > -1) {
			untimedSkillRange = Skill.getRange(untimedSkill);

			if (untimedSkillRange < 4 && !Attack.validSpot(unit.x, unit.y)) {
				return 0;
			}

			if (Math.round(getDistance(me, unit)) > untimedSkillRange || checkCollision(me, unit, 0x4)) {
				// Allow short-distance walking for melee skills
				walk = Skill.getRange(untimedSkill) < 4 && getDistance(me, unit) < 10 && !checkCollision(me, unit, 0x1);

				if (!Attack.getIntoPosition(unit, untimedSkillRange, 0x4, walk)) {
					return 0;
				}
			}

			if (!unit.dead) {
				Skill.cast(untimedSkill, Skill.getHand(untimedSkill), unit);
			}

			return 1;
		}

		for (i = 0; i < 25; i += 1) {
			if (!me.getState(sdk.states.SkillDelay)) {
				break;
			}

			delay(40);
		}

		// Delay for Poison Nova
		while (this.novaTick && getTickCount() - this.novaTick < Config.PoisonNovaDelay * 1000) {
			delay(40);
		}

		return 1;
	};

	ClassAttack.farCast = function (unit) {
		var i, walk, timedSkill = Config.AttackSkill[1], untimedSkill = Config.AttackSkill[2];

		// No valid skills can be found
		if (timedSkill < 0 && untimedSkill < 0) {
			return 2;
		}

		// Far to low a range for far casting
		if (Skill.getRange(timedSkill) < 4 && Skill.getRange(untimedSkill) < 4) {
			return 2;
		}

		// Bone prison
		if (Math.round(getDistance(me, unit)) > 10 && !checkCollision(me, unit, 0x4) && Skill.getManaCost(88) * 2 < me.mp && getTickCount() - this.bpTick > 2000) {
			if (Skill.cast(88, 0, unit)) {
				this.bpTick = getTickCount();
			}
		}

		this.smartCurse(unit, 1);

		// Check for bodies to exploit for CorpseExplosion before committing to an attack for non-summoner type necros
		if (Config.Skeletons + Config.SkeletonMages + Config.Revives === 0) {
			if (this.checkCorpseNearMonster(unit)) {
				this.explodeCorpses(unit);
			}
		}

		if (timedSkill > -1 && (!me.getState(sdk.states.SkillDelay) || !Skill.isTimed(timedSkill))) {
			switch (timedSkill) {
			case 92: 	// Poison Nova
			case 500: 	// Pure Summoner (Note: unsure where the 500 is coming from)
				break;
			default:
				if (!unit.dead && !checkCollision(me, unit, 0x4)) {
					Skill.cast(timedSkill, Skill.getHand(timedSkill), unit);
				}

				break;
			}
		}

		if (untimedSkill > -1) {
			if (Skill.getRange(untimedSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) {
				return 0;
			}

			if (!unit.dead && !checkCollision(me, unit, 0x4)) {
				Skill.cast(untimedSkill, Skill.getHand(untimedSkill), unit);
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

	ClassAttack.raiseArmy = function (range) {
		var i, tick, count, corpse, corpseList, skill;

		if (!range) {
			range = 25;
		}

		this.setArmySize();

		for (i = 0; i < 3; i += 1) {
			corpse = getUnit(1, -1, 12);
			corpseList = [];

			if (corpse) {
				do {
					// within casting distance
					if (getDistance(me, corpse) <= range && this.checkCorpse(corpse)) {
						corpseList.push(copyUnit(corpse));
					}
				} while (corpse.getNext());
			}

MainLoop:
			while (corpseList.length > 0) {
				corpse = corpseList.shift();

				if (me.getMinionCount(4) < this.maxSkeletons) {
					if (!Skill.cast(sdk.skills.RaiseSkeleton, 0, corpse)) {
						return false;
					}

					count = me.getMinionCount(4);
					tick = getTickCount();

					while (getTickCount() - tick < 200) {
						if (me.getMinionCount(4) > count) {
							break;
						}

						delay(10);
					}
				} else if (me.getMinionCount(5) < this.maxMages) {
					if (!Skill.cast(sdk.skills.RaiseSkeletalMage, 0, corpse)) {
						return false;
					}

					count = me.getMinionCount(5);
					tick = getTickCount();

					while (getTickCount() - tick < 200) {
						if (me.getMinionCount(5) > count) {
							break;
						}

						delay(10);
					}
				} else if (me.getMinionCount(6) < this.maxRevives) {
					if (this.checkCorpse(corpse, true)) {
						print("Reviving " + corpse.name);

						if (!Skill.cast(sdk.skills.Revive, 0, corpse)) {
							return false;
						}

						count = me.getMinionCount(6);
						tick = getTickCount();

						while (getTickCount() - tick < 200) {
							if (me.getMinionCount(6) > count) {
								break;
							}

							delay(10);
						}
					}
				} else {
					return true;
				}
			}
		}

		return true;
	};

	ClassAttack.explodeCorpses = function (unit) {
		if (Config.ExplodeCorpses === 0 || unit.mode === 0 || unit.mode === 12) {
			return false;
		}

		var i,
			corpseList = [],
			useAmp = me.getSkill(sdk.skills.AmplifyDamage, 1),
			ampManaCost = Skill.getManaCost(66),
			explodeCorpsesManaCost = Skill.getManaCost(Config.ExplodeCorpses),
			range = Math.floor((me.getSkill(Config.ExplodeCorpses, 1) + 7) / 3),
			corpse = getUnit(1, -1, 12);

		if (corpse) {
			do {
				if (getDistance(unit, corpse) <= range && this.checkCorpse(corpse)) {
					corpseList.push(copyUnit(corpse));
				}
			} while (corpse.getNext());

			//Shuffle the corpseList so if running multiple necrobots they explode separate corpses not the same ones
			if (corpseList.length > 1) {
				corpseList = corpseList.shuffle();
			}

			if (this.isArmyFull()) {
				// We don't need corpses as we are not a Summoner Necro, Spam CE till monster dies or we run out of bodies.
				do {
					corpse = corpseList.shift();

					if (corpse) {
						if (!unit.dead && this.checkCorpse(corpse) && getDistance(corpse, unit) <= range) {
							// Added corpse ID so I can see when it blows another monster with the same ClassID and Name
							me.overhead("Exploding: " + corpse.classid + " " + corpse.name + " id:" + corpse.gid);

							if (useAmp && !unit.getState(sdk.states.AmplifyDamage) && !unit.getState(sdk.states.Decrepify) && me.mp > (ampManaCost + explodeCorpsesManaCost)) {
								Skill.cast(sdk.skills.AmplifyDamage, 0, unit);
							}

							if (Skill.cast(Config.ExplodeCorpses, 0, corpse)) {
								delay(me.ping + 1);
							}
						}
					}
				} while (corpseList.length > 0);
			} else {
				// We are a Summoner Necro, we should conserve corpses, only blow 2 at a time so we can check for needed re-summons.
				for (i = 0; i <= 1; i += 1) {
					if (corpseList.length > 0) {
						corpse = corpseList.shift();

						if (corpse) {
							me.overhead("Exploding: " + corpse.classid + " " + corpse.name);

							if (useAmp && !unit.getState(sdk.states.AmplifyDamage) && !unit.getState(sdk.states.Decrepify) && me.mp > (ampManaCost + explodeCorpsesManaCost)) {
								Skill.cast(sdk.skills.AmplifyDamage, 0, unit);
							}

							if (Skill.cast(Config.ExplodeCorpses, 0, corpse)) {
								delay(200);
							}
						}
					} else {
						break;
					}
				}
			}
		}

		return true;
	};

	ClassAttack.checkCorpse = function (unit, revive) {
		if (unit.mode !== 12) {
			return false;
		}

		if (revive === undefined) {
			revive = false;
		}

		var baseId = getBaseStat("monstats", unit.classid, "baseid"),
			badList = [312, 571];

		if (revive && ((unit.spectype & 0x7) || badList.indexOf(baseId) > -1 || (Config.ReviveUnstackable && getBaseStat("monstats2", baseId, "sizex") === 3))) {
			return false;
		}

		if (!getBaseStat("monstats2", baseId, revive ? "revive" : "corpseSel")) {
			return false;
		}

		if (getDistance(me, unit) <= 25 && !checkCollision(me, unit, 0x4) &&
                    !unit.getState(sdk.states.Freeze) &&
                    !unit.getState(sdk.states.Revive) &&
                    !unit.getState(sdk.states.Redeemed) &&
                    !unit.getState(sdk.states.CorpseNoDraw) &&
                    !unit.getState(sdk.states.Shatter) &&
                    !unit.getState(sdk.states.RestInPeace) &&
                    !unit.getState(sdk.states.CorpseNoSelect)
		) {
			return true;
		}

		return false;
	};

	break;
case 3: // Paladin
	if (!isIncluded("common/Attacks/Paladin.js")) {
		include("common/Attacks/Paladin.js");
	}

	ClassAttack.doAttack = function (unit, preattack) {
		var index, result,
			mercRevive = 0,
			attackSkill = -1,
			aura = -1,
			gold = me.getStat(14) + me.getStat(15);

		index = ((unit.spectype & 0x7) || unit.type === 0) ? 1 : 3;

		if (Config.MercWatch && Town.needMerc()) {
			print("mercwatch");
			Town.visitTown();
		}

		if (index === 1 && !unit.dead) {
			if (!unit.getState(sdk.states.Weaken) && Attack.isCursable(unit) && (gold > 500000 || Attack.BossAndMiniBosses.indexOf(unit.classid) > -1 || [108, 131].indexOf(me.area) > -1) && !checkCollision(me, unit, 0x4)) {
				// Switch cast weaken
				Attack.switchCastCharges(sdk.skills.Weaken, unit);
			}

			if (!unit.getState(sdk.states.Decrepify) && Attack.isCursable(unit) && (gold > 500000 || Attack.BossAndMiniBosses.indexOf(unit.classid) > -1 || [108, 131].indexOf(me.area) > -1) && !checkCollision(me, unit, 0x4)) {
				Attack.switchCastCharges(87, unit);		// Switch cast decrepify
			}
		}

		if (preattack && Config.AttackSkill[0] > 0 && Attack.checkResist(unit, Config.AttackSkill[0]) && (!me.getState(sdk.states.SkillDelay) || !Skill.isTimed(Config.AttackSkill[0]))) {
			if (getDistance(me, unit) > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), 0x4)) {
					return 0;
				}
			}

			Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

			return 1;
		}

		if (Attack.getCustomAttack(unit)) {
			attackSkill = Attack.getCustomAttack(unit)[0];
			aura = Attack.getCustomAttack(unit)[1];
		} else {
			attackSkill = Config.AttackSkill[index];
			aura = Config.AttackSkill[index + 1];
		}

		// Monster immune to primary skill
		if (!Attack.checkResist(unit, attackSkill)) {
			// Reset skills
			attackSkill = -1;
			aura = -1;

			// Set to secondary if not immune
			if (Config.AttackSkill[5] > -1 && Attack.checkResist(unit, Config.AttackSkill[5])) {
				attackSkill = Config.AttackSkill[5];
				aura = Config.AttackSkill[6];
			}
		}

		// Low mana skill
		if (Config.LowManaSkill[0] > -1 && Skill.getManaCost(attackSkill) > me.mp && Attack.checkResist(unit, Config.LowManaSkill[0])) {
			attackSkill = Config.LowManaSkill[0];
			aura = Config.LowManaSkill[1];
		}

		result = this.doCast(unit, attackSkill, aura);

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

	ClassAttack.getHammerPosition = function (unit) {
		var i, x, y, positions, check,
			baseId = getBaseStat("monstats", unit.classid, "baseid"),
			size = getBaseStat("monstats2", baseId, "sizex");

		// in case base stat returns something outrageous
		if (typeof size !== "number" || size < 1 || size > 3) {
			size = 3;
		}

		switch (unit.type) {
		case 0: // Player
			x = unit.x;
			y = unit.y;
			positions = [[x + 2, y], [x + 2, y + 1]];

			break;
		case 1: // Monster
			x = (unit.mode === 2 || unit.mode === 15) && getDistance(me, unit) < 10 && getDistance(me, unit.targetx, unit.targety) > 5 ? unit.targetx : unit.x;
			y = (unit.mode === 2 || unit.mode === 15) && getDistance(me, unit) < 10 && getDistance(me, unit.targetx, unit.targety) > 5 ? unit.targety : unit.y;
			positions = [[x + 2, y + 1], [x, y + 3], [x + 2, y - 1], [x - 2, y + 2], [x - 5, y]];

			if (size === 3) {
				positions.unshift([x + 2, y + 2]);
			}

			break;
		}

		for (i = 0; i < positions.length; i += 1) {
			if (getDistance(me, positions[i][0], positions[i][1]) < 1) {
				return true;
			}
		}

		for (i = 0; i < positions.length; i += 1) {
			check = {
				x: positions[i][0],
				y: positions[i][1]
			};

			if (Attack.validSpot(check.x, check.y) && !CollMap.checkColl(unit, check, 0x4, 0) && (Pather.useTeleport() || !checkCollision(me, unit, 0x1))) {
				if (this.reposition(positions[i][0], positions[i][1])) {
					return true;
				}
			}
		}

		return false;
	};

	ClassAttack.afterAttack = function () {
		Misc.unShift();
		Precast.doPrecast(false);

		if (me.getState(2) && Attack.getMobCount(me.x, me.y, 10) === 0 && Skill.setSkill(109, 0)) {
			let tick = getTickCount();
			while (getTickCount() - tick < 1500) {
				if (!me.getState(2)) {
					break;
				}

				delay(10);
			}
		}

		if (Config.Redemption instanceof Array && (me.hp * 100 / me.hpmax < Config.Redemption[0] || me.mp * 100 / me.mpmax < Config.Redemption[1]) && Skill.setSkill(124, 0)) {
			delay(1500);
		}
	};

	break;
case 4: // Barbarian - theBGuy
	if (!isIncluded("common/Attacks/Barbarian.js")) {
		include("common/Attacks/Barbarian.js");
	}

	ClassAttack.warCryTick = 0;

	ClassAttack.tauntMonsters = function (unit, attackSkill) {
		if (!me.getSkill(137, 0)) {
			return;
		}

		if ([156, 211, 242, 243, 544, 571].indexOf(unit.classid) > -1) {
			return;
		}

		// Duriel's Lair, Arreat Summit, Worldstone Chamber
		if ([73, 120, 132].indexOf(me.area) > -1) {
			return;
		}

		let range = me.area !== 131 ? 15 : 30;
		let useHowl = me.getSkill(sdk.skills.Howl, 0) && !me.getSkill(sdk.skills.WarCry, 0);
		let useBattleCry = me.getSkill(sdk.skills.BattleCry, 1);
		let useWarCry = me.getSkill(sdk.skills.WarCry, 0);
		let rangedMobsClassIDs = [10, 11, 12, 13, 14, 118, 119, 120, 121, 131, 132, 133, 134, 135, 170, 171, 172, 173, 174, 238, 239, 240, 310, 362, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 580, 581, 582, 583, 584, 645, 646, 647, 697];
		let dangerousAndSummoners = [636, 637, 638, 639, 640, 641, 58, 59, 60, 61, 101, 102, 103, 104, 105, 557, 558, 669, 670, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478];
		let list = Attack.buildMonsterList();

		if ([107, 108].indexOf(me.area) > -1) {
			rangedMobsClassIDs.push(305, 306);
		}

		let newList = list.filter(mob => [0, 8].indexOf(mob.spectype) > -1 && !mob.getState(sdk.states.Taunt) && !unit.getState(sdk.states.BattleCry) && !unit.getState(sdk.states.Decrepify) &&
			((rangedMobsClassIDs.indexOf(mob.classid) > -1 && Math.round(getDistance(me, mob)) <= range) || (dangerousAndSummoners.indexOf(mob.classid) > -1 && Math.round(getDistance(me, mob)) <= 30)));

		newList.sort(Sort.units);

		if (newList.length >= 1) {
			for (let i = 0; i < newList.length; i++) {
				if (Math.round(getDistance(me, newList[i])) <= 4 && useBattleCry) {
					Skill.cast(sdk.skills.BattleCry, 0);

					continue;
				}

				if (useHowl && Attack.getMobCount(me.x, me.y, 6, null, true) >= 3 && Skill.getManaCost(sdk.skills.Howl) < me.mp) {
					Skill.cast(sdk.skills.Howl, 0);
					this.doCast(unit, attackSkill);
				} else if (useWarCry && Attack.getMobCount(me.x, me.y, 6, null, true) >= 1 && Skill.getManaCost(sdk.skills.WarCry) < me.mp) {
					Skill.cast(sdk.skills.WarCry, 0);
				}

				if (!newList[i].getState(27) && !newList[i].getState(56) && !unit.getState(sdk.states.BattleCry) && !newList[i].dead && Skill.getManaCost(137) < me.mp && !checkCollision(me, newList[i], 0x4)) {
					me.overhead("Taunting: " + newList[i].name + " | classid: " + newList[i].classid);
					//print("Casting on: " + newList[i].name + " | spectype: " + newList[i].spectype + " | classid: " + newList[i].classid);
					Skill.cast(137, Skill.getHand(137), newList[i]);
				}

				this.doCast(unit, attackSkill);
			}
		}
	};

	ClassAttack.doAttack = function (unit, preattack) {
		let useHowl = me.getSkill(130, 1);
		let useGrimWard = me.getSkill(150, 1);
		let useTaunt = me.getSkill(137, 1);
		let useWarCry = me.getSkill(154, 1);
		let useBattleCry = me.getSkill(146, 1);
		let switchCast = (Precast.getBetterSlot(146) === 1 || Precast.getBetterSlot(154) === 1) ? true : false;
		Config.FindItemSwitch = Precast.getBetterSlot(142);

		var index, needRepair = [], attackSkill = -1;
			
		index = ((unit.spectype & 0x7) || unit.type === 0) ? 1 : 3;

		if (me.charlvl >= 5){
			needRepair = Town.needRepair();
		}

		if ((Config.MercWatch && Town.needMerc()) || needRepair.length > 0) {
			Town.visitTown(!!needRepair.length);
		}

		if (Attack.getCustomAttack(unit)) {
			attackSkill = Attack.getCustomAttack(unit)[0];
		} else {
			attackSkill = Config.AttackSkill[index];
		}

		if (!Attack.checkResist(unit, attackSkill)) {
			attackSkill = -1;

			if (Config.AttackSkill[index + 1] > -1 && me.getSkill(Config.AttackSkill[index + 1], 0) && Attack.checkResist(unit, Config.AttackSkill[index + 1])) {
				attackSkill = Config.AttackSkill[index + 1];
			}
		}

		// Low mana skill
		if (Skill.getManaCost(attackSkill) > me.mp && Config.LowManaSkill[0] > -1 && Attack.checkResist(unit, Config.LowManaSkill[0])) {
			attackSkill = Config.LowManaSkill[0];
		}

		if (useHowl && attackSkill !== 151 && [345, 571].indexOf(unit.classid) === -1 && Attack.getMobCount(me.x, me.y, 6, null, true) >= 3 && Skill.getManaCost(130) < me.mp && me.hp < Math.floor(me.hpmax * 75 / 100)) {
			if (useGrimWard) {
				this.grimWard(6);
			} else {
				Skill.cast(130, Skill.getHand(130));
			}
		}

		if (useTaunt) {
			this.tauntMonsters(unit, attackSkill);
		}

		if (!unit.dead && useBattleCry && !me.getState(sdk.states.SkillDelay)) {
			if (!unit.getState(sdk.states.BattleCry) && !unit.getState(sdk.states.Decrepify) && !unit.getState(sdk.states.Terror) && !unit.getState(sdk.states.Taunt)) {		//Unit not already in Battle Cry, decrepify, terror, or taunt state. Don't want to overwrite helpful cureses
				if (Math.round(getDistance(me, unit)) > Skill.getRange(146) || checkCollision(me, unit, 0x4)) {
					if (!Attack.getIntoPosition(unit, Skill.getRange(146), 0x4)) {
						return 0;
					}
				}

				if (switchCast) {
					me.switchWeapons(1);
				}

				Skill.cast(146, Skill.getHand(146), unit);

				if (switchCast && !useWarCry) {
					me.switchWeapons(0);
				}
			}
		}

		if (!unit.dead && useWarCry && [156, 211, 242, 243, 544, 562, 570, 540, 541, 542].indexOf(unit.classid) === -1 && Attack.isCursable(unit) && 
			(!unit.getState(sdk.states.Stunned) || getTickCount() - this.warCryTick >= 1500) && 
			Skill.getManaCost(154) < me.mp && Attack.checkResist(unit, 154) && !me.getState(sdk.states.SkillDelay) && Attack.getMobCount(me.x, me.y, 5, null, true) >= 1) {
			if (!unit.getState(sdk.states.Stunned)) {
				if (Math.round(getDistance(me, unit)) > Skill.getRange(154) || checkCollision(me, unit, 0x4)) {
					if (!Attack.getIntoPosition(unit, Skill.getRange(154), 0x4)) {
						return 0;
					}
				}

				if (switchCast) {
					me.switchWeapons(1);
				}

				//print("ÿc9doAttack ÿc0:: Non-Unique Monster Count in 5 yard radius: " + Attack.getMobCount(me.x, me.y, 5, null, true));

				if (me.getSkill(154, 1) >= 15) {
					for (let i = 0; i < 2; i++) {
						if (Skill.getManaCost(154) < me.mp) {
							Skill.cast(154, Skill.getHand(154), unit);
						}

						delay(50 + me.ping);
					}

					return 1;
				} else {
					Skill.cast(154, Skill.getHand(154), unit);
				}

				if (switchCast) {
					me.switchWeapons(0);
				}

				this.warCryTick = getTickCount();
			
				return 1;
			}
		}

		if (preattack && Config.AttackSkill[0] > 0 && Config.AttackSkill[0] !== 154 && me.getSkill(Config.AttackSkill[0], 1) && Attack.checkResist(unit, Attack.getSkillElement(Config.AttackSkill[0])) && (Skill.getManaCost(Config.AttackSkill[0]) < me.mp) && (!me.getState(sdk.states.SkillDelay) || !Skill.isTimed(Config.AttackSkill[0]))) {
			if (Math.round(getDistance(me, unit)) > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), 0x4)) {
					return 0;
				}
			}

			Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

			return 1;
		}

		if (index === 1) {
			if (useHowl && attackSkill !== 151 && [211, 243, 544, 562, 570, 571, 540, 541, 542].indexOf(unit.classid) === -1 && Attack.getMobCount(me.x, me.y, 5, null, true) >= 3 && Skill.getManaCost(130) < me.mp) {
				if (useGrimWard) {
					this.grimWard(6);
				} else if (!useWarCry) {
					Skill.cast(130, Skill.getHand(130));
				}
			}
		}

		// Telestomp with barb is pointless
		return this.doCast(unit, attackSkill);
	};

	ClassAttack.doCast = function (unit, attackSkill) {
		// In case of failing to switch back to main weapon slot
		if (me.weaponswitch === 1) {
			me.switchWeapons(0);
		}

		var walk;
		let useConc = me.getSkill(144, 0) && attackSkill === 152;
		let useFrenzy = me.getSkill(147, 0) && attackSkill === 152;
		let useWhirl = me.getSkill(151, 0) && attackSkill !== 151; // If main attack skill is already whirlwind no need to use it twice
		let useLeap = me.getSkill(143, 1);
		let useWarCry = me.getSkill(154, 1);
		let useBattleCry = me.getSkill(146, 1);
		let switchCast = (Precast.getBetterSlot(146) === 1 || Precast.getBetterSlot(154) === 1) ? true : false;
		Config.FindItem = me.getSkill(sdk.skills.FindItem, 1);	// Any points into the skill

		if (attackSkill < 0) {
			return 2;
		}

		switch (attackSkill) {
		case 151:
			if (Math.ceil(getDistance(me, unit)) > Skill.getRange(attackSkill) || checkCollision(me, unit, 0x1)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(attackSkill), 0x1, 2)) {
					return 0;
				}
			}

			if (!unit.dead) {
				this.whirlwind(unit);
			}

			return 1;
		default:
			if (Skill.getRange(attackSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) {
				return 0;
			}

			if (Math.round(getDistance(me, unit)) > Skill.getRange(attackSkill) || checkCollision(me, unit, 0x4)) {
				walk = Skill.getRange(attackSkill) < 4 && getDistance(me, unit) < 10 && !checkCollision(me, unit, 0x1);

				if (useLeap && !checkCollision(me, unit, 0x1) && Math.round(getDistance(me, unit)) > 6) {
					Skill.cast(143, 0, unit.x, unit.y);
				}

				if (!Attack.getIntoPosition(unit, Skill.getRange(attackSkill), 0x4, walk)) {
					return 0;
				}
			}

			if (!unit.dead) {
				Skill.cast(attackSkill, Skill.getHand(attackSkill), unit);

				// Unit not already in Battle Cry, decrepify, terror, or taunt state. Don't want to overwrite helpful cureses
				if (useBattleCry && Attack.getMobCount(me.x, me.y, 4) >= 1 &&
					!unit.getState(sdk.states.BattleCry) && !unit.getState(sdk.states.Decrepify) && !unit.getState(sdk.states.Terror) && !unit.getState(sdk.states.Taunt) && Skill.getManaCost(146) < me.mp) {
					if (switchCast) {
						me.switchWeapons(1);
					}

					Skill.cast(146, Skill.getHand(146), unit);

					if (switchCast && !useWarCry) {
						me.switchWeapons(1);
					}
				}

				if (useWarCry && !unit.dead && [156, 211, 242, 243, 544, 562, 570, 540, 541, 542].indexOf(unit.classid) === -1 && Attack.isCursable(unit) && (!unit.getState(sdk.states.Stunned) || getTickCount() - this.warCryTick >= 1500) && 
					Attack.getMobCount(me.x, me.y, 5, null, true) >= (me.area === 131 || Item.getEquippedItem(4).durability === 0 ? 1 : 3) && Skill.getManaCost(154) < me.mp && Attack.checkResist(unit, 154)) {
					if (switchCast) {
						me.switchWeapons(1);
					}

					//print("ÿc9doCast ÿc0:: Non-Unique Monster Count in 5 yard radius: " + Attack.getMobCount(me.x, me.y, 5, null, true));

					Skill.cast(154, Skill.getHand(154));
					this.warCryTick = getTickCount();

					if (switchCast) {
						me.switchWeapons(0);
					}
				}

				if (useFrenzy && !unit.dead && !me.getState(sdk.states.Frenzy)) {
					Skill.cast(144, Skill.getHand(144), unit);
				}

				if (useConc && !unit.dead) {
					Skill.cast(144, Skill.getHand(144), unit);
				}

				if (useWhirl && !unit.dead && (Attack.getMobCount(me.x, me.y, 6) >= 3 || ([156, 211, 242, 243, 544, 571].indexOf(unit.classid) > -1) && !me.hell)) {
					this.whirlwind(unit);
				}
			}

			return 1;
		}
	};

	ClassAttack.afterAttack = function (pickit) {
		var needRepair;

		if (Pather.useTeleport()) {
			Misc.unShift();
		}

		Precast.doPrecast(false);

		if (me.charlvl > 5) {
			needRepair = Town.needRepair();	
		}
		
		// Repair check, make sure i have a tome
		if (needRepair && needRepair.length > 0 && me.getItem(518)) {
			Town.visitTown(true);
		}

		if (pickit) {
			this.findItem(10);
		}
	};

	ClassAttack.findItemIgnoreGids = [];

	ClassAttack.findItem = function (range) {
		if (!Config.FindItem || !me.getSkill(sdk.skills.FindItem, 1)) {
			return false;
		}

		var i, j, tick, corpse, orgX, orgY, retry, pick = false,
			corpseList = [];

		orgX = me.x;
		orgY = me.y;

MainLoop:
		for (i = 0; i < 3; i += 1) {
			corpse = getUnit(1);

			if (corpse) {
				do {
					if ((corpse.mode === 0 || corpse.mode === 12) && getDistance(corpse, orgX, orgY) <= range && this.checkCorpse(corpse)) {
						corpseList.push(copyUnit(corpse));
					}
				} while (corpse.getNext());
			}

			if (corpseList.length > 0) {
				pick = true;

				while (corpseList.length > 0) {
					if (this.checkCloseMonsters(5)) {
						if (Config.FindItemSwitch) {
							me.switchWeapons(Attack.getPrimarySlot());
						}

						Attack.clear(10, false, false, false, false);

						retry = true;

						break MainLoop;
					}

					corpseList.sort(Sort.units);

					corpse = corpseList.shift();

					if (this.checkCorpse(corpse)) {
						if (getDistance(me, corpse) > 30 || checkCollision(me, corpse, 0x1)) {
							Pather.moveToUnit(corpse);
						}

						if (Config.FindItemSwitch) {
							me.switchWeapons(Attack.getPrimarySlot() ^ 1);
						}

	CorpseLoop:
						for (j = 0; j < 3; j += 1) {
							Skill.cast(sdk.skills.FindItem, 0, corpse);

							tick = getTickCount();

							while (getTickCount() - tick < 1000) {
								if (corpse.getState(sdk.states.CorpseNoSelect)) {
									Pickit.fastPick();

									break CorpseLoop;
								}

								delay(10);
							}
						}
					}
				}
			}
		}

		if (retry) {
			return this.findItem(me.area === 83 ? 60 : 20);
		}

		if (Config.FindItemSwitch && me.weaponswitch === 1) {
			me.switchWeapons(Attack.getPrimarySlot());
		}

		if (pick) {
			Pickit.pickItems();
		}

		return true;
	};

	ClassAttack.grimWard = function (range) {
		if (!me.getSkill(sdk.skills.GrimWard, 1)) {
			return false;
		}

		var i, j, tick, corpse, orgX, orgY, retry,
			corpseList = [];

		orgX = me.x;
		orgY = me.y;

MainLoop:
		for (i = 0; i < 3; i += 1) {
			corpse = getUnit(1);

			if (corpse) {
				do {
					if ((corpse.mode === 0 || corpse.mode === 12) && getDistance(corpse, orgX, orgY) <= range && this.checkCorpse(corpse)) {
						corpseList.push(copyUnit(corpse));
					}
				} while (corpse.getNext());
			}

			if (corpseList.length > 0) {

				while (corpseList.length > 0) {

					corpseList.sort(Sort.units);

					corpse = corpseList.shift();

					if (this.checkCorpse(corpse)) {
						if (getDistance(me, corpse) > 30 || checkCollision(me, corpse, 0x1)) {
							Pather.moveToUnit(corpse);
						}

	CorpseLoop:
						for (j = 0; j < 3; j += 1) {
							Skill.cast(sdk.skills.GrimWard, 0, corpse);

							tick = getTickCount();

							while (getTickCount() - tick < 1000) {
								if (corpse.getState(sdk.states.CorpseNoSelect)) {

									break CorpseLoop;
								}

								delay(10);
							}
						}
					}
				}
			}
		}

		return true;
	};

	ClassAttack.checkCorpse = function (unit) {
		if (unit.mode !== 0 && unit.mode !== 12) {
			return false;
		}

		if ([345, 346, 347].indexOf(unit.classid) === -1 && unit.spectype === 0) {
			return false;
		}

		// monstats2 doesn't contain guest monsters info. sigh..
		if (unit.classid <= 575 && !getBaseStat("monstats2", unit.classid, "corpseSel")) {
			return false;
		}

		if (getDistance(me, unit) <= 25 && !checkCollision(me, unit, 0x4) &&
				!unit.getState(sdk.states.Freeze) &&
                !unit.getState(sdk.states.Revive) &&
                !unit.getState(sdk.states.Redeemed) &&
                !unit.getState(sdk.states.CorpseNoDraw) &&
                !unit.getState(sdk.states.Shatter) &&
                !unit.getState(sdk.states.RestInPeace) &&
                !unit.getState(sdk.states.CorpseNoSelect)
				) {
			return true;
		}

		return false;
	};

	break;
case 5: // Druid
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
		}

		ClassAttack.afterAttack = function () {
			if (Pather.useTeleport()){
				Misc.unShift();
			}

			Precast.doPrecast(false);
		};

		break;
	default:
		if (!isIncluded("common/Attacks/Druid.js")) {
			include("common/Attacks/Druid.js");
		}

		ClassAttack.doAttack = function (unit, preattack) {
			var index, checkSkill, result,
				mercRevive = 0,
				timedSkill = -1,
				untimedSkill = -1,
				gold = me.getStat(14) + me.getStat(15);

			index = ((unit.spectype & 0x7) || unit.type === 0) ? 1 : 3;

			if (Config.MercWatch && Town.needMerc()) {
				Town.visitTown();
			}

			if (me.getSkill(250, 1) && !me.getState(sdk.states.Hurricane)) { // Rebuff Hurricane
				Skill.cast(250, 0);
			}

			if (me.getSkill(235, 1) && !me.getState(sdk.states.CycloneArmor)) { // Rebuff Cyclone Armor
				Skill.cast(235, 0);
			}

			if (index === 1 && !unit.dead) {
				if (!unit.getState(sdk.states.Weaken) && Attack.isCursable(unit) && (gold > 500000 || Attack.BossAndMiniBosses.indexOf(unit.classid) > -1 || [108, 131].indexOf(me.area) > -1) && !checkCollision(me, unit, 0x4)) {
					// Switch cast weaken
					Attack.switchCastCharges(sdk.skills.Weaken, unit);
				}

				if (!unit.getState(sdk.states.Decrepify) && Attack.isCursable(unit) && (gold > 500000 || Attack.BossAndMiniBosses.indexOf(unit.classid) > -1 || [108, 131].indexOf(me.area) > -1) && !checkCollision(me, unit, 0x4)) {
					Attack.switchCastCharges(87, unit);		// Switch cast decrepify
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
			var i, walk;

			// No valid skills can be found
			if (timedSkill < 0 && untimedSkill < 0) {
				return 2;
			}

			if (timedSkill > -1 && (!me.getState(sdk.states.SkillDelay) || !Skill.isTimed(timedSkill))) {
				switch (timedSkill) {
				case 245: // Tornado
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

			for (i = 0; i < 25; i += 1) {
				if (!me.getState(sdk.states.SkillDelay)) {
					break;
				}

				delay(40);
			}

			return 1;
		};

		break;	
	}

	break;
case 6: // Assasin
	if (!isIncluded("common/Attacks/Assassin.js")) {
		include("common/Attacks/Assassin.js");
	}

	ClassAttack.mindBlast = function (unit) {
		if (!me.getSkill(273, 1)) {
			return;
		}

		// Main bosses
		if ([156, 211, 242, 243, 544].indexOf(unit.classid) > -1) {
			return;
		}

		if ([73, 120, 132].indexOf(me.area) > -1) {		// Duriel's Lair, Arreat Summit, Worldstone Chamber
			return;
		}

		let list = Attack.buildMonsterList();
		let mindBlastMpCost = Skill.getManaCost(273);
		let list = list.filter(mob => !mob.isStunned && !mob.isUnderLowerRes && [156, 211, 242, 243, 544].indexOf(mob.classid) === -1 && !checkCollision(me, mob, 0x4) &&
		 	(Math.round(getDistance(me, mob)) <= 6 || (Math.round(getDistance(me, mob)) >= 20 && Math.round(getDistance(me, mob)) <= 30)));

		// Cast on close mobs first
		list.sort(function (a, b) {
			return Math.round(getDistance(me, a)) - Math.round(getDistance(me, b));
		});

		if (list.length >= 1) {
			for (let i = 0; i < list.length; i++) {
				if (!list[i].dead && !checkCollision(me, list[i], 0x1) && me.mp > mindBlastMpCost * 2) {
					me.overhead("MindBlasting " + list[i].name);
					Skill.cast(273, 0, list[i]);
				}
			}
		}
	};

	ClassAttack.placeTraps = function (unit, amount) {
		var i, j,
			traps = 0;

		this.lastTrapPos = {x: unit.x, y: unit.y};

		for (i = -1; i <= 1; i += 1) {
			for (j = -1; j <= 1; j += 1) {
				if (Math.abs(i) === Math.abs(j)) { // used for X formation
					// unit can be an object with x, y props too, that's why having "mode" prop is checked
					if (traps >= amount || (unit.hasOwnProperty("mode") && (unit.mode === 0 || unit.mode === 12))) {
						return true;
					}

					if ((unit.hasOwnProperty("classid") && [211, 242, 243, 544].indexOf(unit.classid) > -1) || (unit.hasOwnProperty("type") && unit.type === 0)) { // Duriel, Mephisto, Diablo, Baal, other players
						if (traps >= Config.BossTraps.length) {
							return true;
						}

						Skill.cast(Config.BossTraps[traps], 0, unit.x + i, unit.y + j);
					} else {
						if (traps >= Config.Traps.length) {
							return true;
						}

						switch (Config.Traps[traps]) {
						case 261: 	// Charged Bolt Sentry
						case 271: 	// Lightning Sentry
							if (!Attack.checkResist(unit, "lightning") && Attack.checkResist(unit, "fire")) {
								if (me.getSkill(262, 1)) {	// Wake of Fire
									Skill.cast(262, 0, unit.x + i, unit.y + j);
								} else if (!me.getSkill(262, 1) && me.getSkill(272, 1)) {	// Inferno
									Skill.cast(272, 0, unit.x + i, unit.y + j);
								}

								break;
							} else {
								Skill.cast(Config.Traps[traps], 0, unit.x + i, unit.y + j);
							}

							break;
						case 262: 	// Wake of Fire
						case 272: 	// Inferno
							if (Attack.checkResist(unit, "lightning") && !Attack.checkResist(unit, "fire")) {
								if (me.getSkill(271, 1)) {	// Lightning Sentry
									Skill.cast(271, 0, unit.x + i, unit.y + j);
								} else if (!me.getSkill(271, 1) && me.getSkill(261, 1)) {	// Inferno
									Skill.cast(261, 0, unit.x + i, unit.y + j);
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

		var checkTraps, checkSkill, result,
			mercRevive = 0,
			timedSkill = -1,
			untimedSkill = -1,
			index = ((unit.spectype & 0x7) || unit.type === 0) ? 1 : 3,
			gold = me.getStat(14) + me.getStat(15),
			shouldUseCloak = me.getSkill(264, 1) && !unit.isUnderLowerRes && ([156, 211, 242, 243, 544].indexOf(unit.classid) === -1 || ([156, 211, 242, 243, 544].indexOf(unit.classid) > -1 && Attack.getMobCountAtPosition(unit.x, unit.y, 20) > 1));

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
		if (Config.AggressiveCloak && Config.UseCloakofShadows && shouldUseCloak && !me.getState(sdk.states.SkillDelay) && !me.getState(153)) {
			if (getDistance(me, unit) < 20) {
				Skill.cast(264, 0);
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
		if (!Config.AggressiveCloak && Config.UseCloakofShadows && shouldUseCloak && getDistance(me, unit) < 20 && !me.getState(sdk.states.SkillDelay) && !me.getState(153)) {
			Skill.cast(264, 0);
		}

		// Handle Switch casting
		if (index === 1 && !unit.dead) {
			if (!unit.getState(61) && Attack.isCursable(unit) && (gold > 500000 || Attack.BossAndMiniBosses.indexOf(unit.classid) > -1 || [108, 131].indexOf(me.area) > -1) && !checkCollision(me, unit, 0x4)) {
				Attack.switchCastCharges(91, unit);		// Switch cast lower resist
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
		var timedSkill = Config.AttackSkill[1], untimedSkill = Config.AttackSkill[2];

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

	break;
}
