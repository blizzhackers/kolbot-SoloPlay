/*
*	@filename	PaladinAttacks.js
*	@author		theBGuy
*	@desc		Paladin fixes to improve class attack functionality
*/

!isIncluded("common/Attacks/Paladin.js") && include("common/Attacks/Paladin.js");

ClassAttack.doAttack = function (unit = undefined, preattack = false) {
	if (!unit || unit.dead) return true;

	let gid = unit.gid,
		mercRevive = 0,
		attackSkill = -1,
		aura = -1,
		gold = me.gold;

	let index = ((unit.spectype & 0x7) || unit.type === 0) ? 1 : 3;

	if (Config.MercWatch && Town.needMerc()) {
		print("mercwatch");

		if (Town.visitTown()) {
			// lost reference to the mob we were attacking
			if (!unit || !copyUnit(unit).x || !getUnit(1, -1, -1, gid) || unit.dead) {
				return 1;
			}
		}
	}

	if (me.expansion && index === 1 && !unit.dead) {
		if (CharData.skillData.currentChargedSkills.includes(sdk.skills.SlowMissiles) && unit.getEnchant(sdk.enchant.LightningEnchanted) && !unit.getState(sdk.states.SlowMissiles) && unit.curseable &&
			(gold > 500000 && Attack.bossesAndMiniBosses.indexOf(unit.classid) === -1) && !checkCollision(me, unit, 0x4)) {
			// Cast slow missiles
			Attack.castCharges(sdk.skills.SlowMissiles, unit);
		}

		if (CharData.skillData.currentChargedSkills.includes(sdk.skills.InnerSight) && !unit.getState(sdk.states.InnerSight) && unit.curseable &&
			gold > 500000 && !checkCollision(me, unit, 0x4)) {
			// Cast slow missiles
			Attack.castCharges(sdk.skills.InnerSight, unit);
		}

		if (CharData.skillData.chargedSkillsOnSwitch.some(chargeSkill => chargeSkill.skill === sdk.skills.Decrepify) && !unit.getState(sdk.states.Decrepify) && unit.curseable &&
			(gold > 500000 || Attack.bossesAndMiniBosses.indexOf(unit.classid) > -1 || [sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction].indexOf(me.area) > -1) && !checkCollision(me, unit, 0x4)) {
			// Switch cast decrepify
			Attack.switchCastCharges(sdk.skills.Decrepify, unit);
		}
		
		if (CharData.skillData.chargedSkillsOnSwitch.some(chargeSkill => chargeSkill.skill === sdk.skills.Weaken) && !unit.getState(sdk.states.Weaken) && !unit.getState(sdk.states.Decrepify) && unit.curseable &&
			(gold > 500000 || Attack.bossesAndMiniBosses.indexOf(unit.classid) > -1 || [sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction].indexOf(me.area) > -1) && !checkCollision(me, unit, 0x4)) {
			// Switch cast weaken
			Attack.switchCastCharges(sdk.skills.Weaken, unit);
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

	// Classic auradin check
	if ([sdk.skills.HolyFire, sdk.skills.HolyFreeze, sdk.skills.HolyShock].includes(aura)) {
		// Monster immune to primary aura
		if (!Attack.checkResist(unit, aura)) {
			// Reset skills
			attackSkill = -1;
			aura = -1;

			// Set to secondary if not immune, check if using secondary attack aura if not check main skill for immunity
			if (Config.AttackSkill[5] > -1 && Attack.checkResist(unit, ([sdk.skills.HolyFire, sdk.skills.HolyFreeze, sdk.skills.HolyShock].includes(Config.AttackSkill[6]) ? Config.AttackSkill[6] : Config.AttackSkill[5]))) {
				attackSkill = Config.AttackSkill[5];
				aura = Config.AttackSkill[6];
			}
		}
	} else {
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
	}

	// Low mana skill
	if (Config.LowManaSkill[0] > -1 && Skill.getManaCost(attackSkill) > me.mp && Attack.checkResist(unit, Config.LowManaSkill[0])) {
		attackSkill = Config.LowManaSkill[0];
		aura = Config.LowManaSkill[1];
	}

	let result = this.doCast(unit, attackSkill, aura);

	if (result === 2 && Config.TeleStomp && Config.UseMerc && Pather.canTeleport() && Attack.checkResist(unit, "physical") && !!me.getMerc() && Attack.validSpot(unit.x, unit.y)) {
		let merc = me.getMerc();

		while (unit.attackable) {
			if (Misc.townCheck()) {
				if (!unit || !copyUnit(unit).x) {
					unit = Misc.poll(function () { return getUnit(1, -1, -1, gid); }, 1000, 80);
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
			!!closeMob && this.doCast(closeMob, attackSkill, aura);
		}

		return 1;
	}

	return result;
};

ClassAttack.getHammerPosition = function (unit) {
	let i, x, y, positions, check,
		baseId = getBaseStat("monstats", unit.classid, "baseid"),
		size = getBaseStat("monstats2", baseId, "sizex");

	// in case base stat returns something outrageous
	(typeof size !== "number" || size < 1 || size > 3) && (size = 3);

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
		size === 3 && positions.unshift([x + 2, y + 2]);

		break;
	}

	// If one of the valid positions is a position im at already
	if (positions.some(pos => pos.distance < 1)) return true;

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

		if ([check.x, check.y].validSpot && !CollMap.checkColl(unit, check, 0x4, 0)) {
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

	if (me.getState(sdk.states.Poison) && me.getMobCount(6, Coords_1.BlockBits.BlockWall) === 0 && Skill.setSkill(sdk.skills.Cleansing, 0)) {
		let tick = getTickCount();
		while (getTickCount() - tick < 1500) {
			me.overhead("Delaying for a second to get rid of Poison");
			if (!me.getState(sdk.states.Poison)) {
				break;
			}

			delay(10);
		}
	}

	if (Config.Redemption instanceof Array && (me.hpPercent < Config.Redemption[0] || me.mpPercent < Config.Redemption[1]) && Skill.setSkill(sdk.skills.Redemption, 0)) {
		delay(1500);
	}
};
