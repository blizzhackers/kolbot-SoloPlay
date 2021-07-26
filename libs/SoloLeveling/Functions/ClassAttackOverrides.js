/*
*	@filename	ClassAttackOverides.js
*	@author		theBGuy, isid0re
*	@desc		fixes to improve class attack functionality per class
*/

// Class Specific Attacks
switch (me.classid) {
case 0: //Amazon - theBGuy
	if (!isIncluded("common/Attacks/Amazon.js")) {
		include("common/Attacks/Amazon.js");
	}

	ClassAttack.decoyTick = getTickCount();

	ClassAttack.doAttack = function (unit, preattack) {
		var needRepair = [];
		let useDecoy = (me.getSkill(28, 0) && !me.normal);
		let useLightFury = me.getSkill(35, 1) >= 10;
		let usePlague = !me.normal && me.getSkill(25, 1) >= 1;
		let useJab = Item.getEquippedItem(4).tier >= 1000;
		let forcePlague = me.getSkill(25, 1) >= 15;	//Extra poison damage then attack

		if (me.charlvl >= 5) {
			needRepair = Town.needRepair();
		}

		if ((Config.MercWatch && Town.needMerc()) || needRepair.length > 0) {
			Town.visitTown(!!needRepair.length);
		}

		if (Config.AttackSkill[0] === 17) {
			if (!unit.getState(87)) {
				if (Math.round(getDistance(me, unit)) < Skill.getRange(Config.AttackSkill[0]) || !checkCollision(me, unit, 0x4)) {
					if ([156, 211, 242, 243, 544, 571, 391, 365, 267, 229].indexOf(unit.classid) > -1) {	//Act Bosses and mini-bosses are immune to Slow Missles and pointless to use on lister or Cows, Use Inner-Sight instead
						if (!unit.getState(17)) {	//Check if already in this state
							Skill.cast(8, Skill.getHand(8), unit);
						}
					} else {
						Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);
					}
				}
			}
		}

		if (useDecoy) {
			let decoy;
			let decoyDuration = (10 + me.getSkill(28, 1) * 5) * 1000;

			if (([156, 211, 242, 243, 544].indexOf(unit.classid) > -1) || !Attack.checkResist(unit, Config.AttackSkill[1])) {	//Act Bosses or Light Immunes
				for (let i = 0; i < 25; i += 1) {
					if (!me.getState(121)) {
						break;
					}

					delay(40);
				}

				let coord = CollMap.getRandCoordinate(unit.x, -2, 2, unit.y, -2, 2);

				if (Math.round(getDistance(me, unit)) > 4) { //Don't use decoy if within melee distance
					for (let i = 0; i < 5; i++) {
						decoy = getUnit(-1, 356);

						if (decoy) {
							break;
						}

						delay(100 + me.ping);
					}
					
					if ((getTickCount() - this.decoyTick >= decoyDuration) && Math.round(getDistance(me, unit)) > 4) { 
						if (Math.round(getDistance(me, unit)) > 10 || checkCollision(me, unit, 0x4)) {
							if (!Attack.getIntoPosition(unit, 10, 0x4)) {
								return 0;
							}
						}

						if (Skill.cast(28, 0, coord.x, coord.y)) {
							this.decoyTick = getTickCount();
						}

					}
				}
	
			}
			
		}

		if ((usePlague) && !Attack.checkResist(unit, Config.AttackSkill[1])) { //Only try attacking light immunes if I have my end game javelin - preAttack with Plague Javelin
			if ((Math.round(getDistance(me, unit)) <= 15) && !checkCollision(me, unit, 0x4)) {
				if (!unit.getState(87)) {	//Cast Slow-Missles, then proceed with Plague Jav. Lowers amount of damage from projectiles.
					Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);
				}

				if (Attack.checkResist(unit, 25) && !me.getState(121) && !unit.dead) {
					Skill.cast(25, Skill.getHand(25), unit);	
				}

				if (!useJab) {
					if (Math.round(getDistance(me, unit)) < 4) {	//We are within melee distance might as well use jab rather than stand there
						if (me.getSkill(10, 1)) {
							if (Math.round(getDistance(me, unit)) > Skill.getRange(10) || checkCollision(me, unit, 0x4)) {
								if (!Attack.getIntoPosition(unit, Skill.getRange(10), 0x4)) {
									return 0;
								}
							}

							if (Attack.checkResist(unit, 10) && !unit.dead) {	//Make sure monster is not physical immune
								Skill.cast(10, Skill.getHand(10), unit);	
							}
							
							return 1;
						}
					}
					
					return 1;
				}
				
			}
		}

		if (useJab && !Attack.checkResist(unit, Config.AttackSkill[1]) && !unit.getEnchant(17)) {	//Only try attacking light immunes if I have my end game javelin and they aren't lightning enchanted - use jab as main attack
			if (me.getSkill(10, 1)) {
				if (Math.round(getDistance(me, unit)) > Skill.getRange(10) || checkCollision(me, unit, 0x4)) {
					if (!Attack.getIntoPosition(unit, Skill.getRange(10), 0x4)) {
						return 0;
					}
				}

				if (Attack.checkResist(unit, 10) && !unit.dead) {	//Make sure monster is not physical immune
					Skill.cast(10, Skill.getHand(10), unit);	
				}
				
				return 1;
			}

		}

		if (forcePlague && Attack.checkResist(unit, 25) && !unit.getState(2) && !me.getState(121)) {
			if ((Math.round(getDistance(me, unit)) >= 8 && Math.round(getDistance(me, unit)) <= 15) && !checkCollision(me, unit, 0x4)) {
				Skill.cast(25, Skill.getHand(35), unit);

			}
		}

		if (useLightFury) {
			if ((Math.round(getDistance(me, unit)) >= 8 && Math.round(getDistance(me, unit)) <= 15) && !checkCollision(me, unit, 0x4)) {
				Skill.cast(35, Skill.getHand(35), unit);

			}

		}

		if (preattack && Config.AttackSkill[0] > 0 && !unit.dead && [8, 17].indexOf(Config.AttackSkill[0] > -1 && Attack.isCursable(unit) && Attack.checkResist(unit, Config.AttackSkill[0]) && (!me.getState(121) || !Skill.isTimed(Config.AttackSkill[0])))) {
			if (Config.AttackSkill[0] === 8) {
				if (!unit.getState(17)) {
					if (Math.round(getDistance(me, unit)) > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, 0x4)) {
						if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), 0x4)) {
							return 0;
						}
					}

					Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

					return 1;
				}

			}

			if (Config.AttackSkill[0] === 17) {
				if (!unit.getState(87)) {
					if (Math.round(getDistance(me, unit)) > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, 0x4)) {
						if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), 0x4)) {
							return 0;
						}
					}
					if ([156, 211, 242, 243, 544, 571, 391].indexOf(unit.classid) > -1) {	//Act Bosses are immune to Slow Missles and pointless to use on lister or Cows, Use Inner-Sight instead
						if(!unit.getState(17)) {	//Check if already in this state
							Skill.cast(8, Skill.getHand(8), unit);
						}
					} else {
						Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);
					}
				
					return 1;
				}

			}

		} else if (preattack && Config.AttackSkill[0] > 0 && Attack.checkResist(unit, Config.AttackSkill[0]) && (!me.getState(121) || !Skill.isTimed(Config.AttackSkill[0]))) {
			if (Math.round(getDistance(me, unit)) > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), 0x4)) {
					return 0;
				}
			}

			Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

			return 1;
		}

		var index, checkSkill, result,
			mercRevive = 0,
			timedSkill = -1,
			untimedSkill = -1;

		index = ((unit.spectype & 0x7) || unit.type === 0) ? 1 : 3;

		// Get timed skill
		if (Attack.getCustomAttack(unit)) {
			checkSkill = Attack.getCustomAttack(unit)[0];
		} else {
			checkSkill = Config.AttackSkill[index];
		}

		if (Attack.checkResist(unit, checkSkill)) {
			timedSkill = checkSkill;
		} else if (Config.AttackSkill[5] > -1 && Attack.checkResist(unit, Config.AttackSkill[5]) && ([56, 59].indexOf(Config.AttackSkill[5]) === -1 || Attack.validSpot(unit.x, unit.y))) {
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

		if (me.charlvl > 5){
			needRepair = Town.needRepair();	
		}
		
		if (needRepair && needRepair.length > 0 && me.getItem(518)) { // Repair check, make sure i have a tome
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

		if (timedSkill > -1 && (!me.getState(121) || !Skill.isTimed(timedSkill))) {
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
				if (timedSkill === 34 && me.getSkill(24, 1) >= 15) {
					if (Attack.getMonsterCount(me.x, me.y, 15) <= 3) {
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
			if (!me.getState(121)) {
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
		if (Config.MercWatch && Town.needMerc()) {
			print("mercwatch");
			Town.visitTown();
		}

		if (!me.getState(30) && me.getSkill(58, 1)) {
			Skill.cast(58, 0);
		}

		if (preattack && Config.AttackSkill[0] > 0 && Attack.checkResist(unit, Config.AttackSkill[0]) && (!me.getState(121) || !Skill.isTimed(Config.AttackSkill[0]))) {
			if (Math.round(getDistance(me, unit)) > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), 0x4)) {
					return false;
				}
			}

			Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

			if (me.getSkill(42, 1)) {
				for (let castStatic = 0; castStatic < 2; castStatic++) {
					if ((Skill.getManaCost(42) * 3) < me.mp) {
						Skill.cast(42, 0);
					}
				}
			}

			return true;
		}

		var index, staticRange, checkSkill, mark,
			merc = Merc.getMercFix(),
			timedSkill = -1,
			untimedSkill = -1;

		// Static
		if (Config.CastStatic < 100 && me.getSkill(42, 1) && Attack.checkResist(unit, "lightning") && Config.StaticList.some(
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
			staticRange = Math.floor((me.getSkill(42, 1) + 3) * 2 / 3); // adjusted static range (CuteBeast)

			while (!me.dead && Math.round(unit.hp * 100 / unit.hpmax) > Config.CastStatic && Attack.checkMonster(unit)) {
				Misc.townCheck();
				ClassAttack.doCast(unit, Config.AttackSkill[1], -1);

				if (getDistance(me, unit) > staticRange || checkCollision(me, unit, 0x4)) {
					if (!Attack.getIntoPosition(unit, staticRange, 0x4)) {
						return false;

					}
				}

				if (!Skill.cast(42, 0)) {
					break;
				}
			}
		}

		index = (unit.spectype !== 0 || unit.type === 0) ? 1 : 3;

		// Get timed skill
		if (Attack.getCustomAttack(unit)) {
			checkSkill = Attack.getCustomAttack(unit)[0];
		} else {
			checkSkill = Config.AttackSkill[index];
		}

		if (Attack.checkResist(unit, checkSkill) && ([56, 59].indexOf(checkSkill) === -1 || Attack.validSpot(unit.x, unit.y))) {
			timedSkill = checkSkill;
		} else if (Config.AttackSkill[5] > -1 && Attack.checkResist(unit, Config.AttackSkill[5]) && ([56, 59].indexOf(Config.AttackSkill[5]) === -1 || Attack.validSpot(unit.x, unit.y))) {
			timedSkill = Config.AttackSkill[5];
		}

		// Get untimed skill
		if (Attack.getCustomAttack(unit)) {
			checkSkill = Attack.getCustomAttack(unit)[1];
		} else {
			checkSkill = Config.AttackSkill[index + 1];
		}

		if (Attack.checkResist(unit, checkSkill) && ([56, 59].indexOf(checkSkill) === -1 || Attack.validSpot(unit.x, unit.y))) {
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

					if (Attack.checkResist(unit, "lightning") && me.getSkill(42, 1) && Math.round(unit.hp * 100 / unit.hpmax) > Config.CastStatic) {
						Skill.cast(42, 0);
					}

					mark = Attack.getNearestMonster();

					if (mark) {
						ClassAttack.doCast(mark, Config.AttackSkill[1], Config.AttackSkill[2]);
					} else if (me.getSkill(43, 0)) {
						Skill.cast(43, 0, unit.x, unit.y);
					}
				}

				return true;
			}

			break;
		}

		return false;
	};

	ClassAttack.doCast = function (unit, timedSkill, untimedSkill) {
		var i, walk, tick;

		// No valid skills can be found
		if (timedSkill < 0 && untimedSkill < 0) {
			return 2;
		}

		if (timedSkill > -1 && (!me.getState(121) || !Skill.isTimed(timedSkill))) {
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

			if (Skill.getManaCost(timedSkill) > me.mp) {
				tick = getTickCount();

				while (getTickCount() - tick < 1500) {
					if (Skill.getManaCost(timedSkill) < me.mp) {
						break;
					}

					delay(25);
				}
			}

			if (!unit.dead && !checkCollision(me, unit, 0x4)) {
				Skill.cast(timedSkill, Skill.getHand(timedSkill), unit);
			}

			return 1;
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

			if (Skill.getManaCost(untimedSkill) > me.mp) {
				tick = getTickCount();

				while (getTickCount() - tick < 1500) {
					if (Skill.getManaCost(untimedSkill) < me.mp) {
						break;
					}

					delay(25);
				}
			}

			if (!unit.dead) {
				Skill.cast(untimedSkill, Skill.getHand(untimedSkill), unit);
			}

			return 1;
		}

		for (i = 0; i < 25; i += 1) {
			if (!me.getState(121)) {
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
			skillNum = me.getSkill(70, 1);
			this.maxSkeletons = skillNum < 4 ? skillNum : (Math.floor(skillNum / 3) + 2);
		} else {
			this.maxSkeletons = Config.Skeletons;
		}

		if (Config.SkeletonMages === "max") {
			skillNum = me.getSkill(80, 1);
			this.maxMages = skillNum < 4 ? skillNum : (Math.floor(skillNum / 3) + 2);
		} else {
			this.maxMages = Config.SkeletonMages;
		}

		if (Config.Revives === "max") {
			skillNum = me.getSkill(95, 1);
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

	ClassAttack.doAttack = function (unit, preattack) {
		if (!this.cursesSet) {
			this.initCurses();
		}

		if (Config.MercWatch && Town.needMerc()) {
			Town.visitTown();
		}

		if (preattack && Config.AttackSkill[0] > 0 && Attack.checkResist(unit, Config.AttackSkill[0]) && (!me.getState(121) || !Skill.isTimed(Config.AttackSkill[0]))) {
			if (Math.round(getDistance(me, unit)) > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), 0x4)) {
					return 0;
				}
			}

			Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

			return 1;
		}

		var index, checkSkill, result,
			mercRevive = 0,
			timedSkill = -1,
			untimedSkill = -1;

		let useTerror = me.getSkill(77, 0);

		if (useTerror && Attack.getMonsterCount(me.x, me.y, 6, true) >= 3 && Skill.getManaCost(77) < me.mp && me.hp < Math.floor(me.hpmax * 75 / 100)) {
			Skill.cast(77, Skill.getHand(77));
		}

		index = ((unit.spectype & 0x7) || unit.type === 0) ? 1 : 3;

		if (Config.Curse[0] > 0 && Attack.isCursable(unit) && (unit.spectype & 0x7) && !unit.getState(this.curseState[0])) {
			if (getDistance(me, unit) > 25 || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, 25, 0x4)) {
					return 0;
				}
			}

			Skill.cast(Config.Curse[0], 0, unit);

			return 1;
		}

		if (Config.Curse[1] > 0 && Attack.isCursable(unit) && !(unit.spectype & 0x7) && !unit.getState(this.curseState[1])) {
			if (getDistance(me, unit) > 25 || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, 25, 0x4)) {
					return 0;
				}
			}

			Skill.cast(Config.Curse[1], 0, unit);

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
		} else if (Config.AttackSkill[5] > -1 && Attack.checkResist(unit, Config.AttackSkill[5]) && ([56, 59].indexOf(Config.AttackSkill[5]) === -1 || Attack.validSpot(unit.x, unit.y))) {
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

		if ((Config.LowManaSkill[0] === -1 && Config.LowManaSkill[1] === -1)) {
			if (me.getSkill(77, 1) >= 1 && Skill.getManaCost(77) > me.mp) {
				if (!checkCollision(me, unit, 0x4)) {
					Skill.cast(77, Skill.getHand(77), unit);

				}
			}
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
		var i, walk;

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

		if (timedSkill > -1 && (!me.getState(121) || !Skill.isTimed(timedSkill))) {
			switch (timedSkill) {
			case 92: // Poison Nova
				if (!this.novaTick || getTickCount() - this.novaTick > Config.PoisonNovaDelay * 1000) {
					if (Math.round(getDistance(me, unit)) > Skill.getRange(timedSkill) || checkCollision(me, unit, 0x4)) {
						if (!Attack.getIntoPosition(unit, Skill.getRange(timedSkill), 0x4)) {
							return 0;
						}
					}

					if (!unit.dead && Skill.cast(timedSkill, Skill.getHand(timedSkill), unit)) {
						this.novaTick = getTickCount();
					}
				}

				break;
			case 500: // Pure Summoner
				if (Math.round(getDistance(me, unit)) > Skill.getRange(timedSkill) || checkCollision(me, unit, 0x4)) {
					if (!Attack.getIntoPosition(unit, Skill.getRange(timedSkill), 0x4)) {
						return 0;
					}
				}

				delay(300);

				break;
			default:
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

				break;
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
			if (!me.getState(121)) {
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
					if (getDistance(me, corpse) <= range && this.checkCorpse(corpse)) { // within casting distance
						corpseList.push(copyUnit(corpse));
					}
				} while (corpse.getNext());
			}

MainLoop:
			while (corpseList.length > 0) {
				corpse = corpseList.shift();

				if (me.getMinionCount(4) < this.maxSkeletons) {
					if (!Skill.cast(70, 0, corpse)) {
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
					if (!Skill.cast(80, 0, corpse)) {
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

						if (!Skill.cast(95, 0, corpse)) {
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
							me.overhead("Exploding: " + corpse.classid + " " + corpse.name + " id:" + corpse.gid); // Added corpse ID so I can see when it blows another monster with the same ClassID and Name

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
                    !unit.getState(1) && // freeze
                    !unit.getState(96) && // revive
                    !unit.getState(99) && // redeemed
                    !unit.getState(104) && // nodraw
                    !unit.getState(107) && // shatter
                    !unit.getState(172) && // rest in peace
                    !unit.getState(118) // noselect
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

	break;
case 4: // Barbarian - theBGuy
	if (!isIncluded("common/Attacks/Barbarian.js")) {
		include("common/Attacks/Barbarian.js");
	}

	ClassAttack.tauntMonsters = function (unit, attackSkill) {
		if (!me.getSkill(137, 0)) {
			return;
		}

		if ([156, 211, 242, 243, 544, 571].indexOf(unit.classid) > -1) {
			return;
		}

		if (me.area === 120) {
			return;
		}

		let useHowl = me.getSkill(130, 0) && !me.getSkill(154, 0);
		let useWarCry = me.getSkill(154, 0);
		let range = me.area !== 131 ? 15 : 30;
		let rangedMobsClassIDs = [10, 11, 12, 13, 14, 118, 119, 120, 121, 131, 132, 133, 134, 135, 170, 171, 172, 173, 174, 238, 239, 240, 362, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 580, 581, 582, 583, 584, 645, 646, 647, 697];
		let dangerousAndSummoners = [636, 637, 638, 639, 640, 58, 59, 60, 61, 101, 102, 103, 104, 669, 670, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478];
		let list = Attack.buildMonsterList();

		if ([107, 108].indexOf(me.area) > -1) {
			rangedMobsClassIDs.push(305, 306);
		}

		let newList = list.filter(mob => mob.spectype === 0 && !mob.getState(27) && 
			((rangedMobsClassIDs.indexOf(mob.classid) > -1 && Math.round(getDistance(me, mob)) <= range) || (dangerousAndSummoners.indexOf(mob.classid) > -1 && Math.round(getDistance(me, mob)) <= 30)));

		newList.sort(Sort.units);

		if (newList.length >= 1) {
			for (let i = 0; i < newList.length; i++) {
				if (useHowl && Attack.getMonsterCount(me.x, me.y, 6) >= 3 && Skill.getManaCost(130) < me.mp) {
					Skill.cast(130, Skill.getHand(130));
				} else if (useWarCry && Attack.getMonsterCount(me.x, me.y, 6) >= 3 && Skill.getManaCost(154) < me.mp) {
					Skill.cast(154, Skill.getHand(154));
				}

				if (!newList[i].getState(27) && !newList[i].getState(56) && Skill.getManaCost(137) < me.mp && !checkCollision(me, newList[i], 0x4)) {
					print("Casting on: " + newList[i].name);
					Skill.cast(137, Skill.getHand(137), newList[i]);
				}

				this.doCast(unit, attackSkill);
			}
		}
	};

	ClassAttack.doAttack = function (unit, preattack) {
		let useHowl = me.getSkill(130, 0);
		let useTaunt = me.getSkill(137, 0);
		let useConc = me.getSkill(144, 0);
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

		if (useHowl && Attack.getMonsterCount(me.x, me.y, 6, true) >= 3 && Skill.getManaCost(130) < me.mp && me.hp < Math.floor(me.hpmax * 75 / 100)) {
			Skill.cast(130, Skill.getHand(130));
		}

		if (useTaunt) {
			this.tauntMonsters(unit, attackSkill);
		}

		if (preattack && Config.AttackSkill[0] > 0 && !unit.dead && Config.AttackSkill[0] === 154 && !me.getState(121)) {
			if (!unit.getState(89) && !unit.getState(60) && !unit.getState(56) && !unit.getState(27)) {		//Unit not already in Battle Cry, decrepify, terror, or taunt state. Don't want to overwrite helpful cureses
				if (Math.round(getDistance(me, unit)) > Skill.getRange(146) || checkCollision(me, unit, 0x4)) {
					if (!Attack.getIntoPosition(unit, Skill.getRange(146), 0x4)) {
						return 0;
					}
				}

				Skill.cast(146, Skill.getHand(146), unit);
			}
		}

		if (preattack && Config.AttackSkill[0] > 0 && !unit.dead && Config.AttackSkill[0] === 154 && [156, 211, 242, 243, 544].indexOf(unit.classid) === -1 && (Skill.getManaCost(Config.AttackSkill[0]) < me.mp) && Attack.checkResist(unit, 154) && !me.getState(121)) {
			if (!unit.getState(21)) {
				if (Math.round(getDistance(me, unit)) > Skill.getRange(154) || checkCollision(me, unit, 0x4)) {
					if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), 0x4)) {
						return 0;
					}
				}

				if (me.getSkill(154, 1) >= 15) {
					for (let i = 0; i < 2; i++) {
						if (Skill.getManaCost(Config.AttackSkill[0]) < me.mp) {
							Skill.cast(154, Skill.getHand(154), unit);
						}

						delay(50 + me.ping);
					}

					return 1;
				} else {
					Skill.cast(154, Skill.getHand(154), unit);

					return 1;
				}
			
			}
		} else if (preattack && Config.AttackSkill[0] > 0 && Attack.checkResist(unit, Attack.getSkillElement(Config.AttackSkill[0])) && (Skill.getManaCost(Config.AttackSkill[0]) < me.mp) && (!me.getState(121) || !Skill.isTimed(Config.AttackSkill[0]))) {
			if (Math.round(getDistance(me, unit)) > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), 0x4)) {
					return 0;
				}
			}

			Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

			return 1;
		}

		if (index === 1) {
			if (useHowl && Attack.getMonsterCount(me.x, me.y, 6, true) >= 3 && Skill.getManaCost(130) < me.mp) {
				Skill.cast(130, Skill.getHand(130));
			}
		}

		// Telestomp with barb is pointless
		return this.doCast(unit, attackSkill);
	};

	ClassAttack.doCast = function (unit, attackSkill) {
		var walk;
		let useConc = me.getSkill(144, 0);
		let useWhirl = me.getSkill(151, 1) && attackSkill !== 151; // If main attack skill is already whirlwind no need to use it twice

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

				if (!Attack.getIntoPosition(unit, Skill.getRange(attackSkill), 0x4, walk)) {
					return 0;
				}
			}

			if (!unit.dead) {
				Skill.cast(attackSkill, Skill.getHand(attackSkill), unit);

				if (useConc && !unit.dead) {
					Skill.cast(144, Skill.getHand(144), unit);
				}

				if (useWhirl && !unit.dead && Attack.getMonsterCount(me.x, me.y, 6) >= 3 || [156, 211, 242, 243, 544, 571].indexOf(unit.classid) > -1) {
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
		
		if (needRepair && needRepair.length > 0 && me.getItem(518)) { // Repair check, make sure i have a tome
			Town.visitTown(true);
		}

		if (pickit) {
			this.findItem(10);
		}
	};

	break;
case 5: // Druid
	if (!isIncluded("common/Attacks/Druid.js")) {
		include("common/Attacks/Druid.js");
	}

	ClassAttack.doCast = function (unit, timedSkill, untimedSkill) {
		var i, walk;

		// No valid skills can be found
		if (timedSkill < 0 && untimedSkill < 0) {
			return 2;
		}

		if (timedSkill > -1 && (!me.getState(121) || !Skill.isTimed(timedSkill))) {
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
			if (!me.getState(121)) {
				break;
			}

			delay(40);
		}

		return 1;
	};

	if (["Plaguewolf", "Wolf"].indexOf(SetUp.finalBuild) > -1 && me.charlvl >= SetUp.respecTwo()) {	//Make sure to only load this after finalBuild respec
		if (!isIncluded("common/Attacks/Wereform.js")) {
			include("common/Attacks/Wereform.js");
		}

		ClassAttack.doCast = function (unit, timedSkill, untimedSkill) {
			var i;

			// No valid skills can be found
			if (timedSkill < 0 && untimedSkill < 0) {
				return 2;
			}

			if (timedSkill > -1 && (!me.getState(121) || !Skill.isTimed(timedSkill))) {
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

				if (untimedSkill > -1 && (untimedSkill === 232 || untimedSkill === 238)) {		//Feral rage or Rabies
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

			for (i = 0; i < 25; i += 1) {
				if (!me.getState(121)) {
					break;
				}

				delay(40);
			}

			return 1;
		}
	}

	break;
case 6: // Assasin
	break;
}
