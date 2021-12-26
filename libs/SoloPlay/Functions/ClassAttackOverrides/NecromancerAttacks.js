/*
*	@filename	NecromancerAttacks.js
*	@author		theBGuy
*	@desc		Necromancer fixes to improve class attack functionality
*/

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
	let useAttract = me.getSkill(sdk.skills.Attract, 1) && me.area !== sdk.areas.ThroneofDestruction;
	let useConfuse = me.getSkill(sdk.skills.Confuse, 1) && me.area === sdk.areas.ThroneofDestruction;
	let useDecrep = me.getSkill(sdk.skills.Decrepify, 1);
	let useMaiden = me.getSkill(sdk.skills.IronMaiden, 1) && me.area === sdk.areas.DurielsLair && me.normal;
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
	let index, checkSkill, result,
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
		&& !checkCollision(me, unit, 0x4) && Skill.getManaCost(sdk.skills.BonePrison) * 2 < me.mp && getTickCount() - this.bpTick > 2000) {
		if (Skill.cast(sdk.skills.BonePrison, 0, unit)) {
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


	if (useTerror && me.getMobCount(6, Coords_1.Collision.BLOCK_MISSILE | Coords_1.BlockBits.BlockWall | Coords_1.BlockBits.Casting, 0, true) >= 3 &&
		Skill.getManaCost(sdk.skills.Terror) < me.mp && me.hp < Math.floor(me.hpmax * 75 / 100)) {
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
	let i, walk, timedSkillRange, untimedSkillRange;

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
				timedSkillRange = me.getMobCount(6, Coords_1.Collision.BLOCK_MISSILE | Coords_1.BlockBits.BlockWall | Coords_1.BlockBits.Casting) <= 3 ? 6 : timedSkillRange;
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
	let i, timedSkill = Config.AttackSkill[1], untimedSkill = Config.AttackSkill[2];

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
		if (Skill.cast(sdk.skills.BonePrison, 0, unit)) {
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
		case sdk.skills.PoisonNova:
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
	let i, tick, count, corpse, corpseList;

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

	let i,
		corpseList = [],
		useAmp = me.getSkill(sdk.skills.AmplifyDamage, 1),
		ampManaCost = Skill.getManaCost(sdk.skills.AmplifyDamage),
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

	let baseId = getBaseStat("monstats", unit.classid, "baseid"),
		badList = [312, 571];

	if (revive && ((unit.spectype & 0x7) || badList.indexOf(baseId) > -1 || (Config.ReviveUnstackable && getBaseStat("monstats2", baseId, "sizex") === 3))) {
		return false;
	}

	if (!getBaseStat("monstats2", baseId, revive ? "revive" : "corpseSel")) {
		return false;
	}

	if (getDistance(me, unit) <= 25 && !checkCollision(me, unit, 0x4) &&
                !unit.getState(sdk.states.Frozen) &&
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
