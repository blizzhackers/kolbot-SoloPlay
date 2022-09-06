/**
*  @filename    PaladinAttacks.js
*  @author      theBGuy
*  @desc        Paladin fixes to improve class attack functionality
*
*/

includeIfNotIncluded("common/Attacks/Paladin.js");

// eslint-disable-next-line no-unused-vars
ClassAttack.doAttack = function (unit = undefined, preattack = false, once = false) {
	if (!unit || !unit.attackable) return Attack.Result.SUCCESS;

	let gid = unit.gid;
	let mercRevive = 0;
	let gold = me.gold;
	let [attackSkill, aura] = [-1, -1];
	const index = (unit.isSpecial || unit.isPlayer) ? 1 : 3;

	if (Config.MercWatch && Town.needMerc()) {
		console.log("mercwatch");

		if (Town.visitTown()) {
			// lost reference to the mob we were attacking
			if (!unit || !copyUnit(unit).x || !Game.getMonster(-1, -1, gid) || unit.dead) {
				return Attack.Result.SUCCESS;
			}
		}
		gold = me.gold; // reset value after town
	}

	if (me.expansion && index === 1 && unit.curseable) {
		const commonCheck = (gold > 500000 || unit.isBoss || [sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction].includes(me.area));

		if (CharData.skillData.haveChargedSkill(sdk.skills.SlowMissiles)
			&& unit.getEnchant(sdk.enchant.LightningEnchanted) && !unit.getState(sdk.states.SlowMissiles)
			&& (gold > 500000 && !unit.isBoss) && !checkCollision(me, unit, sdk.collision.Ranged)) {
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

	if (Attack.getCustomAttack(unit)) {
		[attackSkill, aura] = Attack.getCustomAttack(unit);
	} else {
		attackSkill = Config.AttackSkill[index];
		aura = Config.AttackSkill[index + 1];
	}

	// Classic auradin check
	if (this.attackAuras.includes(aura)) {
		// Monster immune to primary aura
		if (!Attack.checkResist(unit, aura)) {
			// Reset skills
			[attackSkill, aura] = [-1, -1];

			// Set to secondary if not immune, check if using secondary attack aura if not check main skill for immunity
			if (Config.AttackSkill[5] > -1 && Attack.checkResist(unit, (this.attackAuras.includes(Config.AttackSkill[6]) ? Config.AttackSkill[6] : Config.AttackSkill[5]))) {
				attackSkill = Config.AttackSkill[5];
				aura = Config.AttackSkill[6];
			}
		}
	} else {
		// Monster immune to primary skill
		if (!Attack.checkResist(unit, attackSkill)) {
			// Reset skills
			[attackSkill, aura] = [-1, -1];

			// Set to secondary if not immune
			if (Config.AttackSkill[5] > -1 && Attack.checkResist(unit, Config.AttackSkill[5])) {
				attackSkill = Config.AttackSkill[5];
				aura = Config.AttackSkill[6];
			}
		}
	}

	if (attackSkill === sdk.skills.Attack && !unit.isFallen && Skill.canUse(sdk.skills.Sacrifice) && me.hpPercent > 75) {
		attackSkill = sdk.skills.Sacrifice;
	}

	// Low mana skill
	if (Config.LowManaSkill[0] > -1 && Skill.getManaCost(attackSkill) > me.mp && Attack.checkResist(unit, Config.LowManaSkill[0])) {
		[attackSkill, aura] = Config.LowManaSkill;
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

ClassAttack.doCast = function (unit, attackSkill = -1, aura = -1) {
	if (attackSkill < 0) return Attack.Result.CANTATTACK;
	// unit became invalidated
	if (!unit || !unit.attackable) return Attack.Result.SUCCESS;
	me.weaponswitch !== sdk.player.slot.Main && me.switchWeapons(sdk.player.slot.Main);
	
	const currSkill = {
		Hand: Skill.getHand(attackSkill),
		Range: Skill.getRange(attackSkill)
	};
	
	switch (attackSkill) {
	case sdk.skills.BlessedHammer:
		// todo: add doll avoid to other classes
		if (Config.AvoidDolls && unit.isDoll) {
			this.dollAvoid(unit);
			aura > -1 && Skill.setSkill(aura, sdk.skills.hand.Right);
			Skill.cast(attackSkill, currSkill.Hand, unit);

			return Attack.Result.SUCCESS;
		}

		// todo: maybe if we are currently surrounded and no tele to just attack from where we are
		// hammers cut a pretty wide arc so likely this would be enough to clear our path
		if (!this.getHammerPosition(unit)) {
			// Fallback to secondary skill if it exists
			if (Config.AttackSkill[5] > -1 && Config.AttackSkill[5] !== sdk.skills.BlessedHammer && Attack.checkResist(unit, Config.AttackSkill[5])) {
				return this.doCast(unit, Config.AttackSkill[5], Config.AttackSkill[6]);
			}

			return Attack.Result.FAILED;
		}

		if (unit.distance > 9 || !unit.attackable) return Attack.Result.SUCCESS;

		aura > -1 && Skill.setSkill(aura, sdk.skills.hand.Right);

		for (let i = 0; i < 3; i += 1) {
			Skill.cast(attackSkill, currSkill.Hand, unit);

			if (!unit.attackable || unit.distance > 9 || unit.isPlayer) {
				break;
			}
		}

		return Attack.Result.SUCCESS;
	case sdk.skills.HolyBolt:
		if (unit.distance > currSkill.Range + 3 || CollMap.checkColl(me, unit, sdk.collision.Ranged)) {
			if (!Attack.getIntoPosition(unit, currSkill.Range, sdk.collision.Ranged)) {
				return Attack.Result.FAILED;
			}
		}

		CollMap.reset();

		if (unit.distance > currSkill.Range || CollMap.checkColl(me, unit, sdk.collision.FriendlyRanged, 2)) {
			if (!Attack.getIntoPosition(unit, currSkill.Range, sdk.collision.FriendlyRanged, true)) {
				return Attack.Result.FAILED;
			}
		}

		if (!unit.dead) {
			aura > -1 && Skill.setSkill(aura, sdk.skills.hand.Right);
			Skill.cast(attackSkill, currSkill.Hand, unit);
		}

		return Attack.Result.SUCCESS;
	case sdk.skills.FistoftheHeavens:
		if (!me.skillDelay) {
			if (unit.distance > currSkill.Range || CollMap.checkColl(me, unit, sdk.collision.FriendlyRanged, 2)) {
				if (!Attack.getIntoPosition(unit, currSkill.Range, sdk.collision.FriendlyRanged, true)) {
					return Attack.Result.FAILED;
				}
			}

			if (!unit.dead) {
				aura > -1 && Skill.setSkill(aura, sdk.skills.hand.Right);
				Skill.cast(attackSkill, currSkill.Hand, unit);

				return Attack.Result.SUCCESS;
			}
		}

		break;
	case sdk.skills.Attack:
	case sdk.skills.Sacrifice:
	case sdk.skills.Zeal:
	case sdk.skills.Vengeance:
		if (!Attack.validSpot(unit.x, unit.y, attackSkill, unit.classid)) {
			return Attack.Result.FAILED;
		}
		
		// 3591 - wall/line of sight/ranged/items/objects/closeddoor 
		if (unit.distance > 3 || checkCollision(me, unit, sdk.collision.WallOrRanged)) {
			if (!Attack.getIntoPosition(unit, 3, sdk.collision.WallOrRanged, true)) {
				return Attack.Result.FAILED;
			}
		}

		if (unit.attackable) {
			aura > -1 && Skill.setSkill(aura, sdk.skills.hand.Right);
			return (Skill.cast(attackSkill, sdk.skills.hand.LeftNoShift, unit) ? Attack.Result.SUCCESS : Attack.Result.FAILED);
		}

		break;
	default:
		if (currSkill.Range < 4 && !Attack.validSpot(unit.x, unit.y, attackSkill, unit.classid)) return Attack.Result.FAILED;

		if (unit.distance > currSkill.Range || checkCollision(me, unit, sdk.collision.Ranged)) {
			let walk = (attackSkill !== sdk.skills.Smite && currSkill.Range < 4 && unit.distance < 10 && !checkCollision(me, unit, sdk.collision.BlockWall));

			// walk short distances instead of tele for melee attacks. teleport if failed to walk
			if (!Attack.getIntoPosition(unit, currSkill.Range, sdk.collision.Ranged, walk)) return Attack.Result.FAILED;
		}

		if (!unit.dead) {
			aura > -1 && Skill.setSkill(aura, sdk.skills.hand.Right);
			Skill.cast(attackSkill, currSkill.Hand, unit);
		}

		return Attack.Result.SUCCESS;
	}

	Misc.poll(() => !me.skillDelay, 1000, 40);

	return Attack.Result.SUCCESS;
};

ClassAttack.afterAttack = function () {
	Precast.doPrecast(false);

	if (Skill.canUse(sdk.skills.Cleansing) && me.hpPercent < 85 && me.getState(sdk.states.Poison)
		&& !me.checkForMobs({range: 12, coll: Coords_1.BlockBits.BlockWall}) && Skill.setSkill(sdk.skills.Cleansing, sdk.skills.hand.Right)) {
		me.overhead("Delaying for a second to get rid of Poison");
		Misc.poll(() => (!me.getState(sdk.states.Poison) || me.mode === sdk.player.mode.GettingHit), 1500, 50);
	}

	if (Skill.canUse(sdk.skills.Meditation) && me.mpPercent < 50 && !me.getState(sdk.states.Meditation)
		&& Skill.setSkill(sdk.skills.Meditation, sdk.skills.hand.Right)) {
		Misc.poll(() => (me.mpPercent >= 50 || me.mode === sdk.player.mode.GettingHit), 1500, 50);
	}

	if (Skill.canUse(sdk.skills.Redemption) && Config.Redemption instanceof Array
		&& (me.hpPercent < Config.Redemption[0] || me.mpPercent < Config.Redemption[1])
		&& Attack.checkNearCorpses(me) > 2 && Skill.setSkill(sdk.skills.Redemption, sdk.skills.hand.Right)) {
		Misc.poll(() => (me.hpPercent >= Config.Redemption[0] && me.mpPercent >= Config.Redemption[1]), 1500, 50);
	}
};
