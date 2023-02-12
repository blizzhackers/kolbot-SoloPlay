/**
*  @filename    SorceressAttacks.js
*  @author      theBGuy
*  @desc        Sorceress fixes to improve class attack functionality
*
*/

includeIfNotIncluded("core/Attacks/Sorceress.js");

(function() {
	const slowable = function (unit, freezeable = false) {
		return (!!unit && unit.attackable // those that we can attack
			&& Attack.checkResist(unit, "cold")
			// those that are not frozen yet and those that can be frozen or not yet chilled
			&& (freezeable ? !unit.isFrozen && !unit.getStat(sdk.stats.CannotbeFrozen) : !unit.isChilled)
			&& ![sdk.monsters.Andariel, sdk.monsters.Lord5].includes(unit.classid));
	};

	const frostNovaCheck = function () {
	// return getUnits(sdk.unittype.Monster).some(function(el) {
	// 	return !!el && el.distance < 7 && el.attackable
	// 		&& ![sdk.monsters.Andariel].includes(el.classid)
	// 		&& !el.isChilled && Attack.checkResist(el, 'cold')
	// 		&& !checkCollision(me, el, Coords_1.Collision.BLOCK_MISSILE);
	// });

		// don't build whole list - since we are just trying if at least one passes the test
		// todo - test to time difference between these two methods
		let mob = Game.getMonster();
		if (mob) {
			do {
				if (mob.distance < 7 && ![sdk.monsters.Andariel].includes(mob.classid) && mob.attackable
				&& !mob.isChilled && Attack.checkResist(mob, "cold") && !checkCollision(me, mob, Coords_1.Collision.BLOCK_MISSILE)) {
					return true;
				}
			} while (mob.getNext());
		}
		return false;
	};

	/**
	 * @param {Monster} unit 
	 */
	const battleCryCheck = function (unit, force = false) {
		// specials and dolls for now, should make dolls much less dangerous with the reduction of their damage
		if (Precast.haveCTA > -1 && !unit.dead && (force || unit.isSpecial || unit.isDoll)
			&& unit.distance < 5 && !unit.getState(sdk.states.BattleCry) && unit.curseable) {
			console.debug("BATTLECRY");
			Skill.switchCast(sdk.skills.BattleCry, { oSkill: true });
		}
	};

	/**
	 * @typedef {Object} dataObj
	 * @property {number} skill
	 * @property {number} reqLvl
	 * @property {number} range
	 * @property {boolean} have
	 * @property {number} mana
	 * @property {boolean} timed
	 * @property {number} dmg
	 * @property {Function} assignValues
	 * @property {Function} calcDmg
	 */

	/**
	 * @param {number} skillId
	 * @param {number} [reqLvl]
	 * @param {number} [range]
	 * @returns {dataObj}
	 */
	const buildDataObj = (skillId = -1, reqLvl = 1, range = 0) => ({
		have: false, skill: skillId, range: range ? range : Infinity, mana: Infinity, timed: false, reqLvl: reqLvl, dmg: 0,
		assignValues: function (range) {
			this.have = Skill.canUse(this.skill);
			if (!this.have) return;
			this.range = range || Skill.getRange(this.skill);
			this.mana = Skill.getManaCost(this.skill);
			this.timed = Skill.isTimed(this.skill);
		},
		calcDmg: function (unit) {
			if (!this.have) return;
			this.dmg = GameData.avgSkillDamage(this.skill, unit);
		}
	});

	/**
	 * @param {dataObj} main 
	 * @param {dataObj} check 
	 * @returns {boolean}
	 */
	const compareDamage = (main, check) => {
		if (main.skill === check.skill) return false;
		return check.dmg > main.dmg;
	};

	/**
	 * @param {Monster} unit 
	 * @param {boolean} force 
	 * @todo keep track of when, what, and who we last casted on to prevent spamming charged skills in a short period of time
	 */
	ClassAttack.switchCurse = function (unit, force) {
		if (CharData.skillData.haveChargedSkill([sdk.skills.SlowMissiles, sdk.skills.LowerResist, sdk.skills.Weaken]) && unit.curseable) {
			const gold = me.gold;
			const isBoss = unit.isBoss;
			const dangerZone = [sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction].includes(me.area);
			if (force && checkCollision(me, unit, sdk.collision.Ranged)) {
				if (!Attack.getIntoPosition(unit, 35, sdk.collision.Ranged)) return;
			}
			// If we have slow missles we might as well use it, currently only on Lighting Enchanted mobs as they are dangerous
			// Might be worth it to use on souls too TODO: test this idea
			if (CharData.skillData.haveChargedSkill(sdk.skills.SlowMissiles) && gold > 500000 && !isBoss
				&& unit.getEnchant(sdk.enchant.LightningEnchanted) && !unit.getState(sdk.states.SlowMissiles)
				&& !checkCollision(me, unit, sdk.collision.Ranged)) {
				// Cast slow missiles
				Attack.castCharges(sdk.skills.SlowMissiles, unit);
			}
			// Handle Switch casting
			if (CharData.skillData.haveChargedSkillOnSwitch(sdk.skills.LowerResist)
				&& (gold > 500000 || isBoss || dangerZone)
				&& !unit.getState(sdk.states.LowerResist)
				&& !checkCollision(me, unit, sdk.collision.Ranged)) {
				// Switch cast lower resist
				Attack.switchCastCharges(sdk.skills.LowerResist, unit);
			}

			if (CharData.skillData.haveChargedSkillOnSwitch(sdk.skills.Weaken)
				&& (gold > 500000 || isBoss || dangerZone)
				&& !unit.getState(sdk.states.Weaken) && !unit.getState(sdk.states.LowerResist)
				&& !checkCollision(me, unit, sdk.collision.Ranged)) {
				// Switch cast weaken
				Attack.switchCastCharges(sdk.skills.Weaken, unit);
			}
		}
	};

	/**
	 * @param {Unit} unit
	 * @returns {dataObj}
	 */
	ClassAttack.decideDistanceSkill = function (unit) {
		const data = {};
		const currLvl = me.charlvl;
		data.iceBlast = buildDataObj(sdk.skills.IceBlast, 6, 20);
		data.fireBall = buildDataObj(sdk.skills.FireBall, 12, 20);
		data.lightning = buildDataObj(sdk.skills.Lightning, 12);
		data.glacialSpike = buildDataObj(sdk.skills.GlacialSpike, 18, 25);
		data.blizzard = buildDataObj(sdk.skills.Blizzard, 24, 40);
		data.meteor = buildDataObj(sdk.skills.Meteor, 24, 40);
		data.frozenOrb = buildDataObj(sdk.skills.FrozenOrb, 30);
		data.hydra = buildDataObj(sdk.skills.Hydra, 30, 40);
		Object.keys(data).forEach(k => typeof data[k] === "object" && currLvl >= data[k].reqLvl && data[k].assignValues());
		Object.keys(data).forEach(k => typeof data[k] === "object" && data[k].have && data[k].calcDmg(unit));

		let skillCheck = Object.keys(data)
			.filter(k => typeof data[k] === "object" && data[k].have && me.mp > data[k].mana
				&& (!data[k].timed || !me.skillDelay))
			.sort((a, b) => data[b].dmg - data[a].dmg).first();
		return typeof data[skillCheck] === "object" ? data[skillCheck] : buildDataObj(-1);
	};

	ClassAttack.doAttack = function (unit, recheckSkill = false, once = false) {
		Developer.debugging.skills && console.log(sdk.colors.Green + "Test Start-----------------------------------------//");
		// unit became invalidated
		if (!unit || !unit.attackable) return Attack.Result.SUCCESS;
	
		const currLvl = me.charlvl;
		const index = (unit.isSpecial || unit.isPlayer) ? 1 : 3;
		let gid = unit.gid;
		let tick = getTickCount();
		let gold = me.gold;

		if (Config.MercWatch && Town.needMerc() && gold > me.mercrevivecost * 3) {
			console.debug("mercwatch");

			if (Town.visitTown()) {
				// lost reference to the mob we were attacking
				if (!unit || !copyUnit(unit).x || !Game.getMonster(-1, -1, gid) || unit.dead) {
					console.debug("Lost reference to unit");
					return Attack.Result.SUCCESS;
				}
				gold = me.gold; // reset value after town
			}
		}

		// Keep Energy Shield active
		Skill.canUse(sdk.skills.EnergyShield) && !me.getState(sdk.states.EnergyShield) && Skill.cast(sdk.skills.EnergyShield, sdk.skills.hand.Right);
		// Keep Thunder-Storm active
		Skill.canUse(sdk.skills.ThunderStorm) && !me.getState(sdk.states.ThunderStorm) && Skill.cast(sdk.skills.ThunderStorm, sdk.skills.hand.Right);

		// Handle Charge skill casting
		if (index === 1 && me.expansion && !unit.dead) {
			ClassAttack.switchCurse(unit);
		}

		const data = {};
		data.static = buildDataObj(sdk.skills.StaticField, 6);
		data.frostNova = buildDataObj(sdk.skills.FrostNova, 6, 7);
		data.iceBlast = buildDataObj(sdk.skills.IceBlast, 6, 15);
		data.nova = buildDataObj(sdk.skills.Nova, 12);
		data.fireBall = buildDataObj(sdk.skills.FireBall, 12);
		data.lightning = buildDataObj(sdk.skills.Lightning, 12);
		data.glacialSpike = buildDataObj(sdk.skills.GlacialSpike, 18, 15);
		data.frozenOrb = buildDataObj(sdk.skills.FrozenOrb, 30);
		data.hydra = buildDataObj(sdk.skills.Hydra, 30);
		data.customTimed = buildDataObj(-1);
		data.customUntimed = buildDataObj(-1);
		// @todo handle if these are already include in the above list, or should I just build all used skils instead and ignore these?
		data.mainTimed = buildDataObj(Config.AttackSkill[index]);
		data.mainUntimed = buildDataObj(Config.AttackSkill[index + 1]);
		data.secondaryTimed = buildDataObj(Config.AttackSkill[5]);
		data.secondaryUntimed = buildDataObj(Config.AttackSkill[6]);

		if (Attack.getCustomAttack(unit)) {
			let [ts, uts] = Attack.getCustomAttack(unit);
			ts > 0 && (data.customTimed = buildDataObj(ts));
			uts > 0 && (data.customUntimed = buildDataObj(uts));
		}

		Object.keys(data).forEach(k => typeof data[k] === "object" && currLvl >= data[k].reqLvl && data[k].assignValues());

		if (data.frostNova.have) {
			if (me.mp > data.frostNova.mana) {
				frostNovaCheck() && Skill.cast(sdk.skills.FrostNova, sdk.skills.hand.Right);
				let ticktwo = getTickCount();
				// if the nova cause the death of any monsters around us, its worth it
				if (GameData.calculateKillableFallensByFrostNova() > 0) {
					Developer.debugging.skills && console.log("took " + ((getTickCount() - ticktwo) / 1000) + " seconds to check calculateKillableFallensByFrostNova. frost nova will kill fallens");
					Skill.cast(sdk.skills.FrostNova, sdk.skills.hand.Right);
				}
			}
		}

		if (data.glacialSpike.have) {
			if (me.mp > data.glacialSpike.mana * 2) {
				let shouldSpike = unit && unit.distance < 10 &&
			getUnits(sdk.unittype.Monster).filter(function (el) {
				return getDistance(el, unit) < 4 && slowable(el, true);
			}).length > 1;
				if (shouldSpike && !Coords_1.isBlockedBetween(me, unit)) {
					Developer.debugging.skills && console.log("SPIKE");
					Skill.cast(sdk.skills.GlacialSpike, sdk.skills.hand.Right, unit);
				}
			}
		}

		// We lost track of the mob or killed it
		if (unit === undefined || !unit || !unit.attackable) return Attack.Result.SUCCESS;

		// Set damage values
		// redo gamedata to be more efficent
		Object.keys(data).forEach(k => typeof data[k] === "object" && data[k].have && data[k].calcDmg(unit));
    
		// log damage values
		if (Developer.debugging.skills) {
			Object.keys(data).forEach(k => typeof data[k] === "object" && console.log(getSkillById(data[k].skill) + " : " + data[k].dmg));
		}

		// If we have enough mana for Static and it will do more damage than our other skills then duh use it
		// should this return afterwards since the calulations will now be different?
		if (data.static.have && (data.static.mana * 3) < me.mp) {
			let closeMobCheck = getUnits(sdk.unittype.Monster)
				.filter(unit => !!unit && unit.attackable && unit.distance < data.static.range)
				.find(unit => Attack.checkResist(unit, "lightning") && unit.hpPercent > Config.CastStatic);
			if (!!closeMobCheck && data.static.dmg > Math.max(data.mainTimed.dmg, data.mainUntimed.dmg, data.secondaryTimed.dmg, data.secondaryUntimed.dmg) && !Coords_1.isBlockedBetween(me, closeMobCheck)) {
				Developer.debugging.skills && console.log("STATIC");
				// check if we should use battle cry from cta if we have it
				battleCryCheck(closeMobCheck);
				Skill.cast(sdk.skills.StaticField, sdk.skills.hand.Right, closeMobCheck) && Skill.cast(sdk.skills.StaticField, sdk.skills.hand.Right, closeMobCheck);
			}
		}

		// We lost track of the mob or killed it (recheck after using static)
		if (unit === undefined || !unit || !unit.attackable) return true;
	
		/**
		 * @todo static field is a good skill but if we are currently out of range, check how dangerous it is to tele to spot before choosing that as our skill
		 */
		let sortedList = Object.keys(data)
			.filter(k => typeof data[k] === "object" && data[k].have && me.mp > data[k].mana
			&& (!data[k].timed || !me.skillDelay) && (data[k].skill !== sdk.skills.StaticField || !recheckSkill))
			.sort((a, b) => data[b].dmg - data[a].dmg);
		if (!sortedList.length) return Attack.Result.FAILED;
		let skillCheck = data[sortedList[0]].skill === sdk.skills.StaticField && unit.distance > data.static.range && me.inDanger(unit, 15)
			? sortedList.at(1)
			: sortedList.at(0);
		let timedSkill = typeof data[skillCheck] === "object" ? data[skillCheck] : buildDataObj(-1);

		// throw in another attack when using charged bolt as sometimes it misses
		const lowManaData = {};
		lowManaData.fBolt = buildDataObj(sdk.skills.FireBolt);
		lowManaData.cBolt = buildDataObj(sdk.skills.ChargedBolt);
		lowManaData.iBolt = buildDataObj(sdk.skills.IceBolt);
		lowManaData.iBlast = buildDataObj(sdk.skills.IceBlast);
		lowManaData.tk = buildDataObj(sdk.skills.Telekinesis, 6, 20);
		lowManaData.attack = buildDataObj(sdk.skills.Attack, 1, 4);
		if (timedSkill.skill === sdk.skills.ChargedBolt && recheckSkill) {
			let temp = timedSkill;
			Object.keys(data).forEach(k => {
				if (typeof data[k] === "object" && data[k].have && compareDamage(temp, data[k])) {
					temp = data[k];
				}
			});
			if (temp.skill !== timedSkill.skill) {
				timedSkill = temp;
			}
		}
		if (!timedSkill.have || timedSkill.mana > me.mp) {
			Developer.debugging.skills && console.log("Choosing lower mana skill, Was I not able to use one of my better skills? (" + (!timedSkill.have) + "). Did I not have enough mana? " + (timedSkill.mana > me.mp));
			Object.keys(lowManaData).forEach(k => typeof lowManaData[k] === "object" && currLvl >= lowManaData[k].reqLvl && lowManaData[k].assignValues() && lowManaData[k].calcDmg(unit));
			const timedSkillCheck = Object.keys(lowManaData)
				.filter(k => typeof lowManaData[k] === "object" && lowManaData[k].have && me.mp > lowManaData[k].mana)
				.sort((a, b) => lowManaData[b].dmg - lowManaData[a].dmg).first();
			console.debug(timedSkillCheck);
			timedSkill = (() => {
				switch (true) {
				case !!timedSkillCheck && [lowManaData.tk.skill, lowManaData.attack.skill].indexOf(lowManaData[timedSkillCheck].skill) === -1:
					return lowManaData[timedSkillCheck];
				case !!timedSkillCheck && lowManaData[timedSkillCheck].skill === lowManaData.tk.skill && me.normal:
					return lowManaData.tk;
				default:
					if (me.charlvl < 5) return lowManaData.attack;
					return (me.normal && me.checkForMobs({range: 10, coll: (sdk.collision.BlockWall | sdk.collision.Objects | sdk.collision.ClosedDoor)}) ? lowManaData.attack : buildDataObj(-1));
				}
			})();
			Object.assign(data, lowManaData);
		}

		if (timedSkill.skill === sdk.skills.ChargedBolt && data.secondaryUntimed.skill === sdk.skills.IceBolt && data.secondaryUntimed.have && slowable(unit)) {
			timedSkill = data.secondaryUntimed;
		}

		const switchBowAttack = (unit) => {
			if (Attack.getIntoPosition(unit, 20, sdk.collision.Ranged)) {
				try {
					const checkForShamans = unit.isFallen && !me.inArea(sdk.areas.BloodMoor);
					for (let i = 0; i < 5 && unit.attackable; i++) {
						if (checkForShamans && !once) {
						// before we waste time let's see if there is a shaman we should kill
							const shaman = getUnits(sdk.unittype.Monster)
								.filter(mon => mon.distance < 20 && mon.isShaman && mon.attackable)
								.sort((a, b) => a.distance - b.distance).first();
							if (shaman) return ClassAttack.doAttack(shaman, null, true);
						}
						if (!Attack.useBowOnSwitch(unit, sdk.skills.Attack, i === 5)) return Attack.Result.FAILED;
						if (unit.distance < 8 || me.inDanger()) {
							if (once) return Attack.Result.FAILED;
							let closeMob = getUnits(sdk.unittype.Monster)
								.filter(mon => mon.distance < 10 && mon.attackable && mon.gid !== gid)
								.sort(Attack.walkingSortMonsters).first();
							if (closeMob) return ClassAttack.doAttack(closeMob, null, true);
						}
					}
				} finally {
					me.weaponswitch !== sdk.player.slot.Main && me.switchWeapons(sdk.player.slot.Main);
				}
			}
			return unit.dead ? Attack.Result.SUCCESS : Attack.Result.FAILED;
		};

		if (CharData.skillData.bowData.bowOnSwitch
			&& (index !== 1 || !unit.name.includes(getLocaleString(sdk.locale.text.Ghostly)))
			&& ([-1, sdk.skills.Attack].includes(timedSkill.skill)
			|| timedSkill.mana > me.mp
			|| (timedSkill.mana * 3 > me.mp && [sdk.skills.FireBolt, sdk.skills.ChargedBolt].includes(timedSkill.skill)))) {
			if (switchBowAttack(unit) === Attack.Result.SUCCESS) return Attack.Result.SUCCESS;
		}

		switch (ClassAttack.doCast(unit, timedSkill, data)) {
		case Attack.Result.FAILED:
			Developer.debugging.skills && console.log(sdk.colors.Red + "Fail Test End----Time elasped[" + ((getTickCount() - tick) / 1000) + " seconds]----------------------//");
			break;
		case Attack.Result.SUCCESS:
			Developer.debugging.skills && console.log(sdk.colors.Red + "Sucess Test End----Time elasped[" + ((getTickCount() - tick) / 1000) + " seconds]----------------------//");
			return Attack.Result.SUCCESS;
		case Attack.Result.CANTATTACK: // Try to telestomp
			if (Pather.canTeleport() && Attack.checkResist(unit, "physical") && !!me.getMerc()
				&& Attack.validSpot(unit.x, unit.y)
				&& (Config.TeleStomp || (!me.hell && (unit.getMobCount(10) < me.maxNearMonsters && unit.isSpecial)))) {
				let merc = me.getMerc();
				let haveTK = Skill.canUse(sdk.skills.Telekinesis);
				let mercRevive = 0;

				while (unit.attackable) {
					if (Misc.townCheck()) {
						if (!unit || !copyUnit(unit).x) {
							unit = Misc.poll(() => Game.getMonster(-1, -1, gid), 1000, 80);
						}
					}

					if (!unit) return Attack.Result.SUCCESS;

					if (Town.needMerc()) {
						if (Config.MercWatch && mercRevive < 3) {
							Town.visitTown() && (mercRevive++);
						} else {
							return Attack.Result.CANTATTACK;
						}

						(merc === undefined || !merc) && (merc = me.getMerc());
					}

					if (!!merc && getDistance(merc, unit) > 5) {
						Pather.moveToUnit(unit);

						let spot = Attack.findSafeSpot(unit, 10, 5, 9);
						!!spot && Pather.walkTo(spot.x, spot.y);
					}

					if (Attack.checkResist(unit, "lightning") && data.static.have && unit.hpPercent > Config.CastStatic) {
						Skill.cast(sdk.skills.StaticField, sdk.skills.hand.Right);
					}

					let closeMob = Attack.getNearestMonster({skipGid: gid});
					!!closeMob ? this.doCast(closeMob, timedSkill, data) : haveTK && Skill.cast(sdk.skills.Telekinesis, sdk.skills.hand.Right, unit);
				}

				return Attack.Result.SUCCESS;
			}

			break;
		}

		return Attack.Result.FAILED;
	};

	ClassAttack.doCast = function (unit, choosenSkill, data) {
		let noMana = false;
		let { skill, range, mana, timed } = choosenSkill;
		// unit became invalidated
		if (!unit || !unit.attackable) return Attack.Result.SUCCESS;
		if (!!skill && me.mp < mana) {
			return Attack.Result.NEEDMANA;
		}
		// No valid skills can be found
		if (skill < 0) return Attack.Result.CANTATTACK;

		// print damage values
		Developer.debugging.skills && choosenSkill.have && console.log(sdk.colors.Yellow + "(Selected Main :: " + getSkillById(skill) + ") DMG: " + choosenSkill.dmg);

		if (![sdk.skills.FrostNova, sdk.skills.Nova, sdk.skills.StaticField].includes(skill)) {
			// need like a potential danger check, sometimes while me might not be immeadiate danger because there aren't a whole
			// lot of monsters around, we can suddenly be in danger if a ranged monsters hits us or if one of the monsters near us
			// does a lot of damage quickly
			if (Skill.canUse(sdk.skills.Teleport) && me.mp > Skill.getManaCost(sdk.skills.Teleport) + mana && me.inDanger()) {
				//console.log("FINDING NEW SPOT");
				Attack.getIntoPosition(unit, range, 0
                | Coords_1.BlockBits.LineOfSight
                | Coords_1.BlockBits.Ranged
                | Coords_1.BlockBits.Casting
                | Coords_1.BlockBits.ClosedDoor
                | Coords_1.BlockBits.Objects, false, true);
			} else if (me.inDanger()) {
				Attack.getIntoPosition(unit, range + 1, Coords_1.Collision.BLOCK_MISSILE, true);
			}
		}

		if (skill > -1 && (!me.skillDelay || !timed)) {
			let ranged = range > 4;

			if (skill === sdk.skills.ChargedBolt && !unit.hasEnchant(sdk.enchant.ManaBurn, sdk.enchant.ColdEnchanted)) {
				unit.getMobCount(6, Coords_1.Collision.BLOCK_MISSILE) < 3 && (range = 7);
			}

			if (skill === sdk.skills.Attack) {
				if (me.hpPercent < 50 && me.mode !== sdk.player.mode.GettingHit && !me.checkForMobs({range: 12})) {
					console.log("Low health but safe right now, going to delay a bit");
					let tick = getTickCount();
					const howLongToDelay = Config.AttackSkill.some(sk => sk > 1 && Skill.canUse(sk)) ? Time.seconds(2) : Time.seconds(1);

					while (getTickCount() - tick < howLongToDelay) {
						if (me.mode === sdk.player.mode.GettingHit) {
							console.debug("no longer safe, we are being attacked");
							break;
						} else if (me.hpPercent >= 55) {
							return 3;
						}

						delay(40);
					}
				}
			}

			if (range < 4 && !Attack.validSpot(unit.x, unit.y)) return Attack.Result.FAILED;

			// Only delay if there are no mobs in our immediate area
			if (mana > me.mp && !me.checkForMobs({range: 12})) {
				let tick = getTickCount();

				while (getTickCount() - tick < 750) {
					if (mana < me.mp) {
						break;
					} else if (me.mode === sdk.player.mode.GettingHit) {
						console.debug("no longer safe, we are being attacked");
						return Attack.Result.NEEDMANA;
					}

					delay(25);
				}
			}

			// try to prevent missing when the monster is moving by getting just a bit closer
			if ([sdk.skills.FireBolt, sdk.skills.IceBolt].includes(skill)) {
				range = 12;
			}
			if (unit.distance > range || Coords_1.isBlockedBetween(me, unit)) {
			// Allow short-distance walking for melee skills
				let walk = (range < 4 || (skill === sdk.skills.ChargedBolt && range === 7)) && unit.distance < 10 && !checkCollision(me, unit, Coords_1.BlockBits.BlockWall);
			
				if (ranged) {
					if (!Attack.getIntoPosition(unit, range, Coords_1.Collision.BLOCK_MISSILE, walk)) return Attack.Result.FAILED;
				} else if (!Attack.getIntoPosition(unit, range, Coords_1.BlockBits.Ranged, walk)) {
					return Attack.Result.FAILED;
				}
			}

			if (!unit.dead && !checkCollision(me, unit, Coords_1.BlockBits.Ranged)) {
				if (skill === sdk.skills.ChargedBolt) {
					let preHealth = unit.hp;
					let cRetry = 0;
					unit.distance <= 1 && Attack.getIntoPosition(unit, range, Coords_1.Collision.BLOCK_MISSILE, true);
					for (let i = 0; i < 3; i++) {
						!unit.dead && Skill.cast(skill, Skill.getHand(skill), unit.x, unit.y);
						if (!Misc.poll(() => unit.dead || unit.hp < preHealth, 300, 50)) {
							cRetry++;
							// we still might of missed so pick another coord
							if (!Attack.getIntoPosition(unit, (range - cRetry), Coords_1.Collision.BLOCK_MISSILE, true)) return Attack.Result.FAILED;
							!unit.dead && Skill.cast(skill, Skill.getHand(skill), unit.x, unit.y);
						} else {
							break;
						}
					}
				} else if (skill === sdk.skills.StaticField) {
					let preHealth = unit.hp;
					let sRetry = 0;
					for (let i = 0; i < 4; i++) {
						if (!unit.dead) {
							// if we are already in close then it might be worth it to use battle cry if we have it
							battleCryCheck(unit);
							Skill.cast(skill, Skill.getHand(skill), unit);
							if (!Misc.poll(() => unit.dead || unit.hp < preHealth, 200, 50)) {
								sRetry++;
								// we still might of missed so pick another coord
								if (!Attack.getIntoPosition(unit, (range - sRetry), Coords_1.Collision.BLOCK_MISSILE, true)) return Attack.Result.FAILED;
								!unit.dead && Skill.cast(skill, Skill.getHand(skill), unit);
							}

							if (data.frostNova.have && me.mp > data.frostNova.mana) {
								frostNovaCheck() && Skill.cast(sdk.skills.FrostNova, sdk.skills.hand.Right);
							}

							if (mana > me.mp || unit.hpPercent < Config.CastStatic) {
								break;
							}
							if (me.inDanger()) {
								Attack.deploy(unit, range, 5, 9);
								break;
							}
						} else {
							break;
						}
					}
				} else {
					let targetPoint = GameData.targetPointForSkill(skill, unit);

					if (unit.attackable) {
						if (targetPoint) {
							Skill.cast(skill, Skill.getHand(skill), targetPoint.x, targetPoint.y);
						} else {
							Skill.cast(skill, Skill.getHand(skill), unit);
						}

						if ([sdk.skills.FireBolt, sdk.skills.IceBolt].includes(skill)) {
							let preHealth = unit.hp;
							let missileDelay = GameData.timeTillMissleImpact(skill, unit);
							missileDelay > 0 && Misc.poll(() => unit.dead || unit.hp < preHealth, missileDelay, 50);
							delay(50);
						}
					}
				}
			}

			return Attack.Result.SUCCESS;
		} else {
			console.debug(choosenSkill);
			noMana = true;
		}

		for (let i = 0; i < 25; i++) {
			if (!me.skillDelay) {
				break;
			}
			if (i % 5 === 0) {
				if (me.inDanger()) {
					break;
				}
			}

			delay(40);
		}

		return noMana ? Attack.Result.NEEDMANA : Attack.Result.SUCCESS;
	};
})();
