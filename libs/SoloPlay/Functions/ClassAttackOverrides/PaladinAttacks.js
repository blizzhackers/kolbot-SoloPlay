/**
*  @filename    PaladinAttacks.js
*  @author      theBGuy
*  @desc        Paladin fixes to improve class attack functionality
*
*/

includeIfNotIncluded("common/Attacks/Paladin.js");

ClassAttack.doAttack = function (unit = undefined, preattack = false) {
	if (!unit || unit.dead) return true;

	let gid = unit.gid;
	let mercRevive = 0;
	let attackSkill = -1;
	let aura = -1;
	let gold = me.gold;
	let index = (unit.isSpecial || unit.isPlayer) ? 1 : 3;

	if (Config.MercWatch && Town.needMerc()) {
		console.log("mercwatch");

		if (Town.visitTown()) {
			// lost reference to the mob we were attacking
			if (!unit || !copyUnit(unit).x || !Game.getMonster(-1, -1, gid) || unit.dead) {
				return Attack.Result.SUCCESS;
			}
		}
	}

	if (me.expansion && index === 1 && unit.curseable) {
		let commonCheck = (gold > 500000 || Attack.bossesAndMiniBosses.includes(unit.classid) || [sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction].includes(me.area));

		if (CharData.skillData.haveChargedSkill(sdk.skills.SlowMissiles)
			&& unit.getEnchant(sdk.enchant.LightningEnchanted) && !unit.getState(sdk.states.SlowMissiles)
			&& (gold > 500000 && Attack.bossesAndMiniBosses.indexOf(unit.classid) === -1) && !checkCollision(me, unit, sdk.collision.Ranged)) {
			// Cast slow missiles
			Attack.castCharges(sdk.skills.SlowMissiles, unit);
		}

		if (CharData.skillData.haveChargedSkill(sdk.skills.InnerSight) && !unit.getState(sdk.states.InnerSight)
			&& gold > 500000 && !checkCollision(me, unit, sdk.collision.Ranged)) {
			// Cast Inner sight
			Attack.castCharges(sdk.skills.InnerSight, unit);
		}

		if (CharData.skillData.haveChargedSkillOnSwitch(sdk.skills.Decrepify)
			&& !unit.getState(sdk.states.Decrepify) && commonCheck && !checkCollision(me, unit, sdk.collision.Ranged)) {
			// Switch cast decrepify
			Attack.switchCastCharges(sdk.skills.Decrepify, unit);
		}
		
		if (CharData.skillData.haveChargedSkillOnSwitch(sdk.skills.Weaken)
			&& !unit.getState(sdk.states.Weaken) && !unit.getState(sdk.states.Decrepify) && commonCheck && !checkCollision(me, unit, sdk.collision.Ranged)) {
			// Switch cast weaken
			Attack.switchCastCharges(sdk.skills.Weaken, unit);
		}
	}

	// specials and dolls for now, should make dolls much less dangerous with the reduction of their damage
	if (Precast.haveCTA > -1 && !unit.dead && (index === 1 || unit.isDoll)
		&& unit.distance < 5 && !unit.getState(sdk.states.BattleCry) && unit.curseable) {
		Skill.switchCast(sdk.skills.BattleCry, {oSkill: true});
	}

	if (preattack && Config.AttackSkill[0] > 0 && Attack.checkResist(unit, Config.AttackSkill[0]) && (!me.getState(sdk.states.SkillDelay) || !Skill.isTimed(Config.AttackSkill[0]))) {
		if (unit.distance > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, sdk.collision.Ranged)) {
			if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), sdk.collision.Ranged)) {
				return Attack.Result.FAILED;
			}
		}

		Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

		return Attack.Result.SUCCESS;
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

	if (result === Attack.Result.CANTATTACK && Attack.canTeleStomp(unit)) {
		let merc = me.getMerc();

		while (unit.attackable) {
			if (Misc.townCheck()) {
				if (!unit || !copyUnit(unit).x) {
					unit = Misc.poll(() => Game.getMonster(-1, -1, gid), 1000, 80);
				}
			}

			if (!unit) return Attack.Result.SUCCESS;

			if (Town.needMerc()) {
				if (Config.MercWatch && mercRevive++ < 1) {
					Town.visitTown();
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

			let closeMob = Attack.getNearestMonster({skipGid: gid});
			!!closeMob && this.doCast(closeMob, attackSkill, aura);
		}

		return Attack.Result.SUCCESS;
	}

	return result;
};

ClassAttack.afterAttack = function () {
	Precast.doPrecast(false);

	if (Skill.canUse(sdk.skills.Cleansing) && me.getState(sdk.states.Poison)
		&& me.getMobCount(12, Coords_1.BlockBits.BlockWall) === 0 && Skill.setSkill(sdk.skills.Cleansing, sdk.skills.hand.Right)) {
		Misc.poll(function () {
			me.overhead("Delaying for a second to get rid of Poison");

			return (!me.getState(sdk.states.Poison) || me.mode === sdk.units.player.mode.GettingHit);
		}, 1500, 30);
	}

	if (Skill.canUse(sdk.skills.Redemption) && Config.Redemption instanceof Array
		&& (me.hpPercent < Config.Redemption[0] || me.mpPercent < Config.Redemption[1])
		&& Attack.checkNearCorpses(me) > 2 && Skill.setSkill(sdk.skills.Redemption, sdk.skills.hand.Right)) {
		delay(1500);
	}
};
