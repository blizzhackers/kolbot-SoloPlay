/**
*  @filename    SorceressAttacks.js
*  @author      theBGuy
*  @desc        Sorceress fixes to improve class attack functionality
*
*/

includeIfNotIncluded("common/Attacks/Sorceress.js");

const GameData = require("../../Modules/GameData");

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

const inDanger = function () {
	let count = 0;
	let nearUnits = getUnits(sdk.unittype.Monster).filter((mon) => mon && mon.attackable && mon.distance < 10);
	nearUnits.forEach(u => u.isSpecial ? (count += 2) : (count += 1));
	if (count > me.maxNearMonsters) return true;
	let dangerClose = nearUnits.find(mon => [sdk.enchant.ManaBurn, sdk.enchant.LightningEnchanted, sdk.enchant.FireEnchanted].some(chant => mon.getEnchant(chant)));
	return dangerClose;
};

ClassAttack.doAttack = function (unit, skipStatic = false, recheckSkill = false) {
	Developer.debugging.skills && console.log(sdk.colors.Green + "Test Start-----------------------------------------//");
	// unit became invalidated
	if (!unit || !unit.attackable) return Attack.Result.SUCCESS;
	
	let gid = unit.gid;
	let tick = getTickCount();
	let gold = me.gold;
	const index = (unit.isSpecial || unit.isPlayer) ? 1 : 3;

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
		if (CharData.skillData.haveChargedSkill([sdk.skills.SlowMissiles, sdk.skills.LowerResist, sdk.skills.Weaken]) && unit.curseable) {
			let isBoss = unit.isBoss;
			let dangerZone = [sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction].includes(me.area);
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
	}

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
	const compareDamage = (main, check) => {
		if (main.skill === check.skill) return false;
		return check.dmg > main.dmg;
	};
	const currLvl = me.charlvl;
	const data = {};
	data.static = buildDataObj(sdk.skills.StaticField);
	data.frostNova = buildDataObj(sdk.skills.FrostNova, 6, 7);
	data.glacialSpike = buildDataObj(sdk.skills.GlacialSpike, 18, 15);
	data.customTimed = buildDataObj(-1);
	data.customUntimed = buildDataObj(-1);
	data.mainTimed = buildDataObj(Config.AttackSkill[index]);
	data.mainUntimed = buildDataObj(Config.AttackSkill[index + 1]);
	data.secondaryTimed = buildDataObj(Config.AttackSkill[5]);
	data.secondaryUntimed = buildDataObj(Config.AttackSkill[6]);
	Object.keys(data).forEach(k => typeof data[k] === "object" && currLvl >= data[k].reqLvl && data[k].assignValues());

	if (Attack.getCustomAttack(unit)) {
		let ts = Attack.getCustomAttack(unit)[0];
		let uts = Attack.getCustomAttack(unit)[1];
		ts > 0 && (data.customTimed = {have: true, range: Skill.getRange(ts), mana: Skill.getManaCost(ts), timed: Skill.isTimed(ts), dmg: GameData.avgSkillDamage(ts, unit)});
		uts > 0 && (data.customUntimed = {have: true, range: Skill.getRange(uts), mana: Skill.getManaCost(uts), timed: Skill.isTimed(uts), dmg: GameData.avgSkillDamage(uts, unit)});
	}

	if (data.frostNova.have) {
		data.frostNova.mana = Skill.getManaCost(sdk.skills.FrostNova);
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
		data.glacialSpike.mana = Skill.getManaCost(sdk.skills.GlacialSpike);
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
			Skill.cast(sdk.skills.StaticField, sdk.skills.hand.Right, closeMobCheck) && Skill.cast(sdk.skills.StaticField, sdk.skills.hand.Right, closeMobCheck);
		}
	}

	// We lost track of the mob or killed it (recheck after using static)
	if (unit === undefined || !unit || !unit.attackable) return true;

	let timedSkill = buildDataObj(-1);
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
		timedSkill = (() => {
			switch (true) {
			case lowManaData.iBlast.have && me.mp > lowManaData.iBlast.mana && lowManaData.iBlast.dmg > Math.max(lowManaData.fBolt.dmg, lowManaData.cBolt.dmg, lowManaData.iBolt.dmg, lowManaData.tk.dmg):
				return lowManaData.iBlast;
			case lowManaData.iBolt.have && me.mp > lowManaData.iBolt.mana && lowManaData.iBolt.dmg > Math.max(lowManaData.fBolt.dmg, lowManaData.cBolt.dmg, lowManaData.tk.dmg):
				return lowManaData.iBolt;
			case lowManaData.cBolt.have && me.mp > lowManaData.cBolt.mana && lowManaData.cBolt.dmg > Math.max(lowManaData.fBolt.dmg, lowManaData.iBlast.dmg, lowManaData.iBolt.dmg, lowManaData.tk.dmg):
				return lowManaData.cBolt;
			case lowManaData.fBolt.have && me.mp > lowManaData.fBolt.mana && lowManaData.fBolt.dmg > Math.max(lowManaData.cBolt.dmg, lowManaData.iBlast.dmg, lowManaData.iBolt.dmg, lowManaData.tk.dmg):
				return lowManaData.fBolt;
			case lowManaData.tk.have && me.normal && me.mp > lowManaData.tk.mana && lowManaData.tk.dmg > Math.max(lowManaData.cBolt.dmg, lowManaData.iBlast.dmg, lowManaData.iBolt.dmg, lowManaData.fBolt.dmg):
				return lowManaData.tk;
			default:
				return (me.normal && me.checkForMobs({range: 10, coll: (sdk.collision.BlockWall | sdk.collision.Objects | sdk.collision.ClosedDoor)}) ? lowManaData.attack : buildDataObj(-1));
			}
		})();
		Object.assign(data, lowManaData);
	}

	if (timedSkill.skill === sdk.skills.ChargedBolt && data.secondaryUntimed.skill === sdk.skills.IceBolt && data.secondaryUntimed.have && slowable(unit)) {
		timedSkill = data.secondaryUntimed;
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
	// unit became invalidated
	if (!unit || !unit.attackable) return Attack.Result.SUCCESS;
	if (!!choosenSkill.skill && me.mp < choosenSkill.mana ) {
		return Attack.Result.NEEDMANA;
		// if (me.mode !== sdk.player.mode.GettingHit && me.getMobCount(10) === 0) {
		// 	console.log("No mana but safe right now, going to delay a bit");
		// 	let tick = getTickCount();
		// 	let howLongToDelay = Config.AttackSkill.some(sk => sk > 1 && Skill.canUse(sk)) ? Time.seconds(2) : Time.seconds(1);

		// 	while (getTickCount() - tick < howLongToDelay) {
		// 		if (me.mode === sdk.player.mode.GettingHit) {
		// 			console.debug("no longer safe, we are being attacked");
		// 			break;
		// 		} else if (me.mp > (choosenSkill.mana * 2)) {
		// 			break;
		// 		}

		// 		delay(40);
		// 	}
		// 	if (me.mp < (choosenSkill.mana * 2)) return Attack.Result.NEEDMANA;
		// }
	}
	// No valid skills can be found
	if (!!(choosenSkill.skill < 0)) return Attack.Result.CANTATTACK;

	// print damage values
	Developer.debugging.skills && choosenSkill.have && console.log(sdk.colors.Yellow + "(Selected Main :: " + getSkillById(choosenSkill.skill) + ") DMG: " + choosenSkill.dmg);

	if (![sdk.skills.FrostNova, sdk.skills.Nova, sdk.skills.StaticField].includes(choosenSkill.skill)) {
		if (Skill.canUse(sdk.skills.Teleport) && me.mp > Skill.getManaCost(sdk.skills.Teleport) + choosenSkill.mana && inDanger()) {
			//console.log("FINDING NEW SPOT");
			Attack.getIntoPosition(unit, choosenSkill.range, 0
                | Coords_1.BlockBits.LineOfSight
                | Coords_1.BlockBits.Ranged
                | Coords_1.BlockBits.Casting
                | Coords_1.BlockBits.ClosedDoor
                | Coords_1.BlockBits.Objects, false, true);
		} else if (inDanger()) {
			Attack.getIntoPosition(unit, choosenSkill.range + 1, Coords_1.Collision.BLOCK_MISSILE, true);
		}
	}

	if (choosenSkill.skill > -1 && (!me.skillDelay || !choosenSkill.timed)) {
		let ts = choosenSkill.skill, tsRange = choosenSkill.range, tsMana = choosenSkill.mana, ranged = tsRange > 4;

		if (ts === sdk.skills.ChargedBolt) {
			unit.getMobCount(6, Coords_1.Collision.BLOCK_MISSILE) < 3 && (tsRange = 5);
		}

		if (ts === sdk.skills.Attack) {
			if (me.hpPercent < 50 && me.mode !== sdk.player.mode.GettingHit && me.getMobCount(10) === 0) {
				console.log("Low health but safe right now, going to delay a bit");
				let tick = getTickCount();
				let howLongToDelay = Config.AttackSkill.some(sk => sk > 1 && Skill.canUse(sk)) ? Time.seconds(2) : Time.seconds(1);

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

		if (tsRange < 4 && !Attack.validSpot(unit.x, unit.y)) return Attack.Result.FAILED;

		// Only delay if there are no mobs in our immediate area
		if (tsMana > me.mp && me.getMobCount() === 0) {
			let tick = getTickCount();

			while (getTickCount() - tick < 750) {
				if (tsMana < me.mp) {
					break;
				} else if (me.mode === sdk.player.mode.GettingHit) {
					console.debug("no longer safe, we are being attacked");
					return Attack.Result.NEEDMANA;
				}

				delay(25);
			}
		}

		if (unit.distance > tsRange || Coords_1.isBlockedBetween(me, unit)) {
			// Allow short-distance walking for melee skills
			let walk = (tsRange < 4 || (ts === sdk.skills.ChargedBolt && tsRange === 5)) && unit.distance < 10 && !checkCollision(me, unit, Coords_1.BlockBits.BlockWall);

			if (ranged) {
				if (!Attack.getIntoPosition(unit, tsRange, Coords_1.Collision.BLOCK_MISSILE, walk)) return Attack.Result.FAILED;
			} else if (!Attack.getIntoPosition(unit, tsRange, Coords_1.BlockBits.Ranged, walk)) {
				return Attack.Result.FAILED;
			}
		}

		if (!unit.dead && !checkCollision(me, unit, Coords_1.BlockBits.Ranged)) {
			if (ts === sdk.skills.ChargedBolt) {
				let preHealth = unit.hp;
				let cRetry = 0;
				for (let i = 0; i < 3; i++) {
					!unit.dead && Skill.cast(ts, Skill.getHand(ts), unit.x, unit.y);
					if (!Misc.poll(() => unit.dead || unit.hp < preHealth, 300, 50)) {
						cRetry++;
						// we still might of missed so pick another coord
						if (!Attack.getIntoPosition(unit, (tsRange - cRetry), Coords_1.Collision.BLOCK_MISSILE, true)) return Attack.Result.FAILED;
						!unit.dead && Skill.cast(ts, Skill.getHand(ts), unit.x, unit.y);
					} else {
						break;
					}
				}
			} else if (ts === sdk.skills.StaticField) {
				let preHealth = unit.hp;
				let sRetry = 0;
				for (let i = 0; i < 4; i++) {
					if (!unit.dead) {
						Skill.cast(ts, Skill.getHand(ts), unit);
						if (!Misc.poll(() => unit.dead || unit.hp < preHealth, 200, 50)) {
							sRetry++;
							// we still might of missed so pick another coord
							if (!Attack.getIntoPosition(unit, (tsRange - sRetry), Coords_1.Collision.BLOCK_MISSILE, true)) return Attack.Result.FAILED;
							!unit.dead && Skill.cast(ts, Skill.getHand(ts), unit);
						}

						if (data.frostNova.have && me.mp > data.frostNova.mana) {
							frostNovaCheck() && Skill.cast(sdk.skills.FrostNova, sdk.skills.hand.Right);
						}

						if (tsMana > me.mp || unit.hpPercent < Config.CastStatic || inDanger()) {
							break;
						}
					} else {
						break;
					}
				}
			} else {
				let targetPoint = GameData.targetPointForSkill(ts, unit);

				if (unit.attackable) {
					if (targetPoint) {
						Skill.cast(ts, Skill.getHand(ts), targetPoint.x, targetPoint.y);
					} else {
						Skill.cast(ts, Skill.getHand(ts), unit);
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
			if (inDanger()) {
				break;
			}
		}

		delay(40);
	}

	return noMana ? Attack.Result.NEEDMANA : Attack.Result.SUCCESS;
};
