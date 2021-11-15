/*
*	@filename	PaladinAttacks.js
*	@author		theBGuy
*	@desc		Paladin fixes to improve class attack functionality
*/

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

	if (!me.classic && index === 1 && !unit.dead) {
		if (Attack.currentChargedSkills.indexOf(sdk.skills.Weaken) > -1 && !unit.getState(sdk.states.Weaken) && !unit.getState(sdk.states.Decrepify) && Attack.isCursable(unit) &&
			(gold > 500000 || Attack.BossAndMiniBosses.indexOf(unit.classid) > -1 || [sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction].indexOf(me.area) > -1) && !checkCollision(me, unit, 0x4)) {
			// Switch cast weaken
			Attack.switchCastCharges(sdk.skills.Weaken, unit);
		}

		if (Attack.currentChargedSkills.indexOf(sdk.skills.Decrepify) > -1 && !unit.getState(sdk.states.Decrepify) && Attack.isCursable(unit) &&
			(gold > 500000 || Attack.BossAndMiniBosses.indexOf(unit.classid) > -1 || [sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction].indexOf(me.area) > -1) && !checkCollision(me, unit, 0x4)) {
			// Switch cast decrepify
			Attack.switchCastCharges(sdk.skills.Decrepify, unit);
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

	if (me.getState(sdk.states.Poison) && Attack.getMobCount(me.x, me.y, 10) === 0 && Skill.setSkill(sdk.skills.Cleansing, 0)) {
		let tick = getTickCount();
		while (getTickCount() - tick < 1500) {
			if (!me.getState(sdk.states.Poison)) {
				break;
			}

			delay(10);
		}
	}

	if (Config.Redemption instanceof Array && (me.hp * 100 / me.hpmax < Config.Redemption[0] || me.mp * 100 / me.mpmax < Config.Redemption[1]) && Skill.setSkill(sdk.skills.Redemption, 0)) {
		delay(1500);
	}
};
