/**
*  @filename    PaladinAttacks.js
*  @author      theBGuy
*  @desc        Paladin fixes to improve class attack functionality
*
*/

!isIncluded("common/Attacks/Paladin.js") && include("common/Attacks/Paladin.js");

ClassAttack.doAttack = function (unit = undefined, preattack = false) {
	if (!unit || unit.dead) return true;

	let gid = unit.gid;
	let mercRevive = 0;
	let attackSkill = -1;
	let aura = -1;
	let gold = me.gold;
	let index = (unit.isSpecial || unit.isPlayer) ? 1 : 3;

	if (Config.MercWatch && Town.needMerc()) {
		print("mercwatch");

		if (Town.visitTown()) {
			// lost reference to the mob we were attacking
			if (!unit || !copyUnit(unit).x || !Game.getMonster(-1, -1, gid) || unit.dead) {
				return 1;
			}
		}
	}

	if (me.expansion && index === 1 && unit.curseable) {
		let commonCheck = (gold > 500000 || Attack.bossesAndMiniBosses.includes(unit.classid) || [sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction].includes(me.area));

		if (CharData.skillData.haveChargedSkill(sdk.skills.SlowMissiles)
			&& unit.getEnchant(sdk.enchant.LightningEnchanted) && !unit.getState(sdk.states.SlowMissiles)
			&& (gold > 500000 && Attack.bossesAndMiniBosses.indexOf(unit.classid) === -1) && !checkCollision(me, unit, 0x4)) {
			// Cast slow missiles
			Attack.castCharges(sdk.skills.SlowMissiles, unit);
		}

		if (CharData.skillData.haveChargedSkill(sdk.skills.InnerSight) && !unit.getState(sdk.states.InnerSight)
			&& gold > 500000 && !checkCollision(me, unit, 0x4)) {
			// Cast Inner sight
			Attack.castCharges(sdk.skills.InnerSight, unit);
		}

		if (CharData.skillData.haveChargedSkillOnSwitch(sdk.skills.Decrepify)
			&& !unit.getState(sdk.states.Decrepify) && commonCheck && !checkCollision(me, unit, 0x4)) {
			// Switch cast decrepify
			Attack.switchCastCharges(sdk.skills.Decrepify, unit);
		}
		
		if (CharData.skillData.haveChargedSkillOnSwitch(sdk.skills.Weaken)
			&& !unit.getState(sdk.states.Weaken) && !unit.getState(sdk.states.Decrepify) && commonCheck && !checkCollision(me, unit, 0x4)) {
			// Switch cast weaken
			Attack.switchCastCharges(sdk.skills.Weaken, unit);
		}
	}

	// specials and dolls for now, should make dolls much less dangerous with the reduction of their damage
	if (Precast.haveCTA > -1 && !unit.dead && (index === 1 || [212, 213, 214, 215, 216, 690, 691].includes(unit.classid))
		&& unit.distance < 5 && !unit.getState(sdk.states.BattleCry) && unit.curseable) {
		Skill.switchCast(sdk.skills.BattleCry, {oSkill: true});
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
					unit = Misc.poll(() => Game.getMonster(-1, -1, gid), 1000, 80);
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

ClassAttack.afterAttack = function () {
	Precast.doPrecast(false);

	if (Skill.canUse(sdk.skills.Cleansing) && me.getState(sdk.states.Poison)
		&& me.getMobCount(12, Coords_1.BlockBits.BlockWall) === 0 && Skill.setSkill(sdk.skills.Cleansing, sdk.skills.hand.Right)) {
		Misc.poll(function () {
			me.overhead("Delaying for a second to get rid of Poison");

			return (!me.getState(sdk.states.Poison) || me.mode === 4/*Getting hit*/);
		}, 1500, 30);
	}

	if (Skill.canUse(sdk.skills.Redemption) && Config.Redemption instanceof Array
		&& (me.hpPercent < Config.Redemption[0] || me.mpPercent < Config.Redemption[1])
		&& Attack.checkNearCorpses(me) > 2 && Skill.setSkill(sdk.skills.Redemption, sdk.skills.hand.Right)) {
		delay(1500);
	}
};
