/**
*  @filename    BarbarianAttacks.js
*  @author      theBGuy
*  @desc        Barbarian fixes to improve class attack functionality
*
*/

!isIncluded("common/Attacks/Barbarian.js") && include("common/Attacks/Barbarian.js");

const GameData = require('../../Modules/GameData');

ClassAttack.warCryTick = 0;

let howlCheck = function () {
	let levelCheck = (me.getSkill(sdk.skills.Howl, 1) + me.charlvl + 1);
	return getUnits(1).filter(function (el) {
		return (!!el && el.attackable && el.distance < 6 && el.scareable && GameData.monsterLevel(el.classid, me.area) < levelCheck && !el.isStunned
			&& [sdk.states.BattleCry, sdk.states.AmplifyDamage, sdk.states.Decrepify, sdk.states.Terror, sdk.states.Taunt].every(state => !el.getState(state))
			&& !checkCollision(me, el, Coords_1.Collision.BLOCK_MISSILE));
	}).length > me.maxNearMonsters;
};

let battleCryCheck = function () {
	return getUnits(1).some(function (el) {
		if (el === undefined) return false;
		return (el.attackable && el.distance < 5 && el.curseable
			&& [sdk.states.BattleCry, sdk.states.AmplifyDamage, sdk.states.Decrepify, sdk.states.Terror, sdk.states.Taunt].every(state => !el.getState(state))
			&& !checkCollision(me, el, Coords_1.Collision.BLOCK_MISSILE));
	});
};

let warCryCheck = function () {
	return getUnits(1).some(function (el) {
		if (el === undefined) return false;
		return (el.attackable && el.distance < 5 && !(el.spectype & 0x7) && el.curseable
			&& ![sdk.units.monsters.Andariel, sdk.units.monsters.Duriel, sdk.units.monsters.Mephisto, sdk.units.monsters.Diablo, sdk.units.monsters.Baal, sdk.units.monsters.Tentacle1,
				sdk.units.monsters.BaalClone, sdk.units.monsters.KorlictheProtector, sdk.units.monsters.TalictheDefender, sdk.units.monsters.MadawctheGuardian].includes(el.classid)
			&& (!el.isStunned || getTickCount() - ClassAttack.warCryTick >= 1500) && !checkCollision(me, el, Coords_1.Collision.BLOCK_MISSILE));
	});
};

ClassAttack.tauntMonsters = function (unit, attackSkill, data) {
	// Don't have skill
	// Only mob in these areas are bosses
	// Can't taunt Main bosses or MinionsofDestruction
	if (!Skill.canUse(sdk.skills.Taunt) || !data) return;
	if ([sdk.areas.DurielsLair, sdk.areas.ArreatSummit, sdk.areas.WorldstoneChamber].includes(me.area)) return;
	if (Attack.mainBosses.includes(unit.classid) || unit.classid === sdk.units.monsters.ListerTheTormenter) return;

	let range = (me.area !== sdk.areas.ThroneofDestruction ? 15 : 30);
	let rangedMobsClassIDs = [
		sdk.units.monsters.Afflicted, sdk.units.monsters.Tainted, sdk.units.monsters.Misshapen1, sdk.units.monsters.Disfigured, sdk.units.monsters.Damned1, sdk.units.monsters.Gloam1, sdk.units.monsters.SwampGhost,
		sdk.units.monsters.BurningSoul2, sdk.units.monsters.BlackSoul1, sdk.units.monsters.GhoulLord1, sdk.units.monsters.NightLord, sdk.units.monsters.DarkLord1, sdk.units.monsters.BloodLord1,
		sdk.units.monsters.Banished, sdk.units.monsters.SkeletonArcher, sdk.units.monsters.ReturnedArcher1, sdk.units.monsters.BoneArcher1, sdk.units.monsters.BurningDeadArcher1, sdk.units.monsters.HorrorArcher1,
		sdk.units.monsters.Sexton, sdk.units.monsters.Cantor, sdk.units.monsters.Heirophant1, sdk.units.monsters.DoomKnight, sdk.units.monsters.VenomLord1, sdk.units.monsters.Horror1, sdk.units.monsters.Horror2,
		sdk.units.monsters.Horror3, sdk.units.monsters.Horror4, sdk.units.monsters.Horror5, sdk.units.monsters.Lord1, sdk.units.monsters.Lord2, sdk.units.monsters.Lord3, sdk.units.monsters.Lord4,
		sdk.units.monsters.Lord4, sdk.units.monsters.Afflicted2, sdk.units.monsters.Tainted, sdk.units.monsters.Misshapen2, sdk.units.monsters.Disfigured2, sdk.units.monsters.Damned2, sdk.units.monsters.DarkShaman2,
		sdk.units.monsters.DevilkinShaman, sdk.units.monsters.DarkShaman2, sdk.units.monsters.DarkLord2
	];
	let dangerousAndSummoners = [
		sdk.units.monsters.Dominus2, sdk.units.monsters.Witch1, sdk.units.monsters.VileWitch2, sdk.units.monsters.Gloam2, sdk.units.monsters.BlackSoul2, sdk.units.monsters.BurningSoul1,
		sdk.units.monsters.FallenShaman, sdk.units.monsters.CarverShaman2, sdk.units.monsters.DevilkinShaman2, sdk.units.monsters.DarkShaman1, sdk.units.monsters.HollowOne, sdk.units.monsters.Guardian1,
		sdk.units.monsters.Unraveler1, sdk.units.monsters.Ancient1, sdk.units.monsters.BaalSubjectMummy, sdk.units.monsters.Council4, sdk.units.monsters.VenomLord2, sdk.units.monsters.Ancient2,
		sdk.units.monsters.Ancient3, sdk.units.monsters.Succubusexp1, sdk.units.monsters.VileTemptress, sdk.units.monsters.StygianHarlot, sdk.units.monsters.Temptress1, sdk.units.monsters.Temptress2,
		sdk.units.monsters.Dominus1, sdk.units.monsters.VileWitch1, sdk.units.monsters.StygianFury, sdk.units.monsters.Witch2, sdk.units.monsters.Witch3
	];

	[sdk.areas.RiverofFlame, sdk.areas.ChaosSanctuary].includes(me.area) && rangedMobsClassIDs.push(305, 306);
	
	let list = Game.getMonster()
		.filter(function (mob) {
			return ([0, 8].includes(mob.spectype) && [sdk.states.BattleCry, sdk.states.Decrepify, sdk.states.Taunt].every(state => !mob.getState(state))
				&& ((rangedMobsClassIDs.includes(mob.classid) && mob.distance <= range) || (dangerousAndSummoners.includes(mob.classid) && mob.distance <= 30)));
		})
		.sort(Sort.units);

	if (list.length >= 1) {
		for (let i = 0; i < list.length; i++) {
			let currMob = list[i];
			if (battleCryCheck() && Skill.cast(sdk.skills.BattleCry, 0)) {
				continue;
			}

			if (data.howl.have && !data.warCry.have && data.howl.mana < me.mp && howlCheck()) {
				Skill.cast(sdk.skills.Howl, 0);
			} else if (data.warCry.have && data.warCry.mana < me.mp && warCryCheck()) {
				Skill.cast(sdk.skills.WarCry, 0);
			}

			if (!!currMob && !currMob.dead && [sdk.states.Terror, sdk.states.BattleCry, sdk.states.Decrepify, sdk.states.Taunt].every(state => !currMob.getState(state))
				&& data.taunt.mana < me.mp && !Coords_1.isBlockedBetween(me, currMob)) {
				me.overhead("Taunting: " + currMob.name + " | classid: " + currMob.classid);
				Skill.cast(sdk.skills.Taunt, 0, currMob);
			}

			this.doCast(unit, attackSkill, data);
		}
	}
};

ClassAttack.doAttack = function (unit = undefined, preattack = false) {
	if (unit === undefined || !unit || unit.dead) return true;

	let gid = unit.gid;
	let needRepair = [], gold = me.gold;
	me.charlvl >= 5 && (needRepair = Town.needRepair());

	if ((Config.MercWatch && Town.needMerc()) || needRepair.length > 0) {
		print("towncheck");

		if (Town.visitTown(!!needRepair.length)) {
			// lost reference to the mob we were attacking
			if (!unit || !copyUnit(unit).x || !Game.getMonsters(-1, -1, gid) || unit.dead) {
				return 1;
			}
		}
	}
	
	let index = (unit.isSpecial || unit.isPlayer) ? 1 : 3;
	let attackSkill = Attack.getCustomAttack(unit) ? Attack.getCustomAttack(unit)[0] : Config.AttackSkill[index];

	if (!Attack.checkResist(unit, attackSkill)) {
		attackSkill = -1;

		if (Config.AttackSkill[index + 1] > -1 && Skill.canUse(Config.AttackSkill[index + 1]) && Attack.checkResist(unit, Config.AttackSkill[index + 1])) {
			attackSkill = Config.AttackSkill[index + 1];
		}
	}

	if (me.expansion && index === 1 && !unit.dead) {
		if (CharData.skillData.haveChargedSkill(sdk.skills.SlowMissiles) && unit.getEnchant(sdk.enchant.LightningEnchanted) && !unit.getState(sdk.states.SlowMissiles) && unit.curseable &&
			(gold > 500000 && Attack.bossesAndMiniBosses.indexOf(unit.classid) === -1) && !checkCollision(me, unit, 0x4)) {
			// Cast slow missiles
			Attack.castCharges(sdk.skills.SlowMissiles, unit);
		}

		if (CharData.skillData.haveChargedSkill(sdk.skills.InnerSight) && !unit.getState(sdk.states.InnerSight) && unit.curseable &&
			gold > 500000 && !checkCollision(me, unit, 0x4)) {
			// Cast slow missiles
			Attack.castCharges(sdk.skills.InnerSight, unit);
		}
	}

	// TODO: calculate damage values for physcial attacks
	let data = {
		switchCast: me.expansion && !!(Precast.getBetterSlot(sdk.skills.BattleCry) === 1 || Precast.getBetterSlot(sdk.skills.WarCry) === 1),
		howl: {
			have: Skill.canUse(sdk.skills.Howl), skill: sdk.skills.Howl, range: Skill.getRange(sdk.skills.Howl), mana: Skill.getManaCost(sdk.skills.Howl)
		},
		taunt: {
			have: Skill.canUse(sdk.skills.Taunt), skill: sdk.skills.Taunt, mana: Skill.getManaCost(sdk.skills.Taunt)
		},
		grimWard: {
			have: Skill.canUse(sdk.skills.GrimWard), skill: sdk.skills.GrimWard, range: 15, mana: Skill.getManaCost(sdk.skills.GrimWard)
		},
		battleCry: {
			have: Skill.canUse(sdk.skills.BattleCry), skill: sdk.skills.BattleCry, range: Skill.getRange(sdk.skills.BattleCry), mana: Skill.getManaCost(sdk.skills.BattleCry)
		},
		warCry: {
			have: Skill.canUse(sdk.skills.WarCry), skill: sdk.skills.WarCry, range: Skill.getRange(sdk.skills.WarCry), mana: Skill.getManaCost(sdk.skills.WarCry)
		},
		bash: {
			have: Skill.canUse(sdk.skills.Bash), skill: sdk.skills.Bash, range: Skill.getRange(sdk.skills.Bash), mana: Skill.getManaCost(sdk.skills.Bash)
		},
		stun: {
			have: Skill.canUse(sdk.skills.Stun), skill: sdk.skills.Stun, range: Skill.getRange(sdk.skills.Stun), mana: Skill.getManaCost(sdk.skills.Stun)
		},
		concentrate: {
			have: Skill.canUse(sdk.skills.Concentrate), skill: sdk.skills.Concentrate, range: Skill.getRange(sdk.skills.Concentrate), mana: Skill.getManaCost(sdk.skills.Concentrate)
		},
		leap: {
			have: Skill.canUse(sdk.skills.Leap), skill: sdk.skills.Leap, range: Skill.getRange(sdk.skills.Leap), mana: Skill.getManaCost(sdk.skills.Leap)
		},
		leapAttack: {
			have: Skill.canUse(sdk.skills.LeapAttack), skill: sdk.skills.LeapAttack, range: Skill.getRange(sdk.skills.LeapAttack), mana: Skill.getManaCost(sdk.skills.LeapAttack)
		},
		doubleSwing: {
			have: Skill.canUse(sdk.skills.DoubleSwing), skill: sdk.skills.DoubleSwing, range: Skill.getRange(sdk.skills.DoubleSwing), mana: Skill.getManaCost(sdk.skills.DoubleSwing)
		},
		whirlwind: {
			have: Skill.canUse(sdk.skills.Whirlwind), skill: sdk.skills.Whirlwind, range: Skill.getRange(sdk.skills.Whirlwind), mana: Skill.getManaCost(sdk.skills.Whirlwind)
		},
		main: {
			have: Skill.canUse(Config.AttackSkill[index]), skill: Config.AttackSkill[index], range: Skill.getRange(Config.AttackSkill[index]), mana: Skill.getManaCost(Config.AttackSkill[index]),
			timed: Skill.isTimed(Config.AttackSkill[index])
		},
		secondary: {
			have: Skill.canUse(Config.AttackSkill[index + 1]), skill: Config.AttackSkill[index + 1], range: Skill.getRange(Config.AttackSkill[index + 1]), mana: Skill.getManaCost(Config.AttackSkill[index + 1]),
			timed: Skill.isTimed(Config.AttackSkill[index + 1])
		},
	};

	// Low mana skill
	if (Skill.getManaCost(attackSkill) > me.mp && Config.LowManaSkill[0] > -1 && Attack.checkResist(unit, Config.LowManaSkill[0])) {
		attackSkill = Config.LowManaSkill[0];
	}

	if ([sdk.skills.DoubleSwing, sdk.skills.DoubleThrow, sdk.skills.Frenzy].includes(attackSkill) && !me.duelWielding) {
		let oneHandSk = [data.bash, data.stun, data.concentrate, data.leapAttack, data.whirlwind]
			.filter((skill) => skill.have && me.mp > skill.mana)
			.sort((a, b) => GameData.physicalAttackDamage(b.skill) - GameData.physicalAttackDamage(a.skill))
			.first();
		attackSkill = oneHandSk ? oneHandSk.skill : 0;
	}

	if (data.howl.have && attackSkill !== 151 && data.howl.mana < me.mp && howlCheck() && me.hpPercent <= 85) {
		data.grimWard.have ? this.grimWard(6) : Skill.cast(sdk.skills.Howl, 0);
	}

	data.taunt.have && this.tauntMonsters(unit, attackSkill, data);

	if (!unit.dead && data.battleCry.have && !me.skillDelay) {
		// Unit not already in Battle Cry, decrepify, terror, or taunt state. Don't want to overwrite helpful cureses
		if ([sdk.states.BattleCry, sdk.states.Decrepify, sdk.states.Terror, sdk.states.Taunt].every(state => !unit.getState(state))) {
			if (unit.distance > data.battleCry.range || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, data.battleCry.range, 0x4)) {
					return 0;
				}
			}

			if (unit.distance < data.battleCry.range) {
				data.switchCast ? Skill.switchCast(sdk.skills.BattleCry, {hand: 0, switchBack: !data.warCry.have}) : Skill.cast(sdk.skills.BattleCry, 0, unit);
			}
		}
	}

	// TODO: write GameData.killableSummonsByWarCry
	if (data.warCry.have && data.warCry.mana < me.mp && !me.skillDelay && warCryCheck()) {
		data.switchCast ? Skill.switchCast(sdk.skills.WarCry, {hand: 0}) : Skill.cast(sdk.skills.WarCry, 0, unit);
		this.warCryTick = getTickCount();
	}

	// Probably going to get rid of preattack
	if (preattack && Config.AttackSkill[0] > 0 && Config.AttackSkill[0] !== sdk.skills.WarCry && Skill.canUse(Config.AttackSkill[0])
		&& Attack.checkResist(unit, Attack.getSkillElement(Config.AttackSkill[0])) && (Skill.getManaCost(Config.AttackSkill[0]) < me.mp)
		&& (!me.getState(sdk.states.SkillDelay) || !Skill.isTimed(Config.AttackSkill[0]))) {
		if (unit.distance > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, 0x4)) {
			if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), 0x4)) {
				return 0;
			}
		}

		Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

		return 1;
	}

	if (index === 1) {
		if (data.howl.have && attackSkill !== sdk.skills.Whirlwind && data.howl.mana < me.mp && howlCheck()) {
			data.grimWard.have ? this.grimWard(6) : !data.warCry.have ? Skill.cast(sdk.skills.Howl, Skill.getHand(sdk.skills.Howl)) : null;
		}
	}

	// Telestomp with barb is pointless
	return this.doCast(unit, attackSkill, data);
};

ClassAttack.doCast = function (unit, attackSkill, data) {
	// In case of failing to switch back to main weapon slot
	me.weaponswitch === 1 && me.switchWeapons(0);
	// No attack skill
	if (attackSkill < 0 || !data) return 2;

	let walk;

	switch (attackSkill) {
	case sdk.skills.Whirlwind:
		if (unit.distance > Skill.getRange(attackSkill) || checkCollision(me, unit, 0x1)) {
			if (!Attack.getIntoPosition(unit, Skill.getRange(attackSkill), 0x1, 2)) {
				return 0;
			}
		}

		!unit.dead && Attack.whirlwind(unit);

		return 1;
	default:
		if (Skill.getRange(attackSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) {
			return 0;
		}

		if (Math.round(getDistance(me, unit)) > Skill.getRange(attackSkill) || checkCollision(me, unit, 0x4)) {
			walk = (Skill.getRange(attackSkill) < 4 && unit.distance < 10 && !checkCollision(me, unit, 0x1));

			// think this should be re-written in pather with some form of leap pathing similar to teleport
			// leap/leap attack is incredibly useful because we can leap straight to chaos or over mobs/doors/some walls ect
			if (data.leapAttack.have && !checkCollision(me, unit, 0x1) && unit.distance > 6) {
				Skill.cast(sdk.skills.LeapAttack, 0, unit.x, unit.y);
			}

			if (!Attack.getIntoPosition(unit, Skill.getRange(attackSkill), 0x4, walk)) {
				return 0;
			}
		}

		if (!unit.dead) {
			Skill.cast(attackSkill, Skill.getHand(attackSkill), unit);

			if (!unit.dead && attackSkill === sdk.skills.Berserk && me.duelWielding
				&& Skill.canUse(sdk.skills.Frenzy) && unit.distance < 4 && !me.getState(sdk.states.Frenzy)) {
				Skill.cast(sdk.skills.Frenzy, Skill.getHand(sdk.skills.Frenzy), unit);
			}

			if (!unit.dead && attackSkill === sdk.skills.Berserk && data.concentrate.have && me.mp > data.concentrate.mana) {
				Skill.cast(sdk.skills.Concentrate, Skill.getHand(sdk.skills.Concentrate), unit);
			}

			// Remove this for now, needs more data calculations to decide if its actually worth using (% dmg, %crushing blow, # of mobs filtering phys immunes unless maybe we do ele dmg from something)
			// if (useWhirl && !unit.dead && (me.getMobCount(6, Coords_1.Collision.BLOCK_MISSILE | Coords_1.BlockBits.BlockWall) >= 3 || ([156, 211, 242, 243, 544, 571].indexOf(unit.classid) > -1) && !me.hell)) {
			// 	this.whirlwind(unit);
			// }
		}

		return 1;
	}
};

ClassAttack.afterAttack = function (pickit = false) {
	Precast.doPrecast(false);

	let needRepair = me.charlvl < 5 ? [] : Town.needRepair();
	
	// Repair check, make sure i have a tome
	if (needRepair.length > 0 && me.getItem(sdk.items.TomeofTownPortal)) {
		Town.visitTown(true);
	}

	pickit && this.findItem(10);
};

ClassAttack.findItemIgnoreGids = [];
ClassAttack.findItem = function (range = 10) {
	if (!Config.FindItem || !Skill.canUse(sdk.skills.FindItem)) return false;

	Config.FindItemSwitch = (me.expansion && Precast.getBetterSlot(sdk.skills.FindItem));
	let retry = false, pick = false, corpseList = [];
	let orgX = me.x, orgY = me.y;

	MainLoop:
	for (let i = 0; i < 3; i++) {
		let corpse = Game.getMonster();

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
					Config.FindItemSwitch && me.switchWeapons(Attack.getPrimarySlot());
					Attack.clearPos(me.x, me.y, 10, false);
					retry = true;

					break MainLoop;
				}

				corpseList.sort(Sort.units);
				corpse = corpseList.shift();

				if (this.checkCorpse(corpse)) {
					if (corpse.distance > 30 || Coords_1.isBlockedBetween(me, corpse)) {
						Pather.moveToUnit(corpse);
					}

					Config.FindItemSwitch && me.switchWeapons(Attack.getPrimarySlot() ^ 1);
					
					CorpseLoop:
					for (let j = 0; j < 3; j += 1) {
						Skill.cast(sdk.skills.FindItem, 0, corpse);

						let tick = getTickCount();

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

	if (retry) return this.findItem(me.area === sdk.areas.Travincal ? 60 : 20);
	Config.FindItemSwitch && me.weaponswitch === 1 && me.switchWeapons(Attack.getPrimarySlot());
	pick && Pickit.pickItems();

	return true;
};

ClassAttack.grimWard = function (range = 10) {
	if (!Skill.canUse(sdk.skills.GrimWard)) return false;
	let corpseList = [], orgX = me.x, orgY = me.y;

	for (let i = 0; i < 3; i += 1) {
		let corpse  = Game.getMonster();

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
					if (corpse.distance > 30 || Coords_1.isBlockedBetween(me, corpse)) {
						Pather.moveToUnit(corpse);
					}

					CorpseLoop:
					for (let j = 0; j < 3; j += 1) {
						Skill.cast(sdk.skills.GrimWard, 0, corpse);

						let tick = getTickCount();

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
