/*
*	@filename	BarbarianAttacks.js
*	@author		theBGuy
*	@desc		Barbarian fixes to improve class attack functionality
*/

if (!isIncluded("common/Attacks/Barbarian.js")) {
	include("common/Attacks/Barbarian.js");
}

ClassAttack.warCryTick = 0;

ClassAttack.tauntMonsters = function (unit, attackSkill) {
	if (!me.getSkill(sdk.skills.Taunt, 0)) {
		return;
	}

	if (Attack.MainBosses.indexOf(unit.classid) > -1 || unit.classid === 571) {
		return;
	}

	// Duriel's Lair, Arreat Summit, Worldstone Chamber
	if ([sdk.areas.DurielsLair, sdk.areas.ArreatSummit, sdk.areas.WorldstoneChamber].indexOf(me.area) > -1) {
		return;
	}

	let range = me.area !== sdk.areas.ThroneofDestruction ? 15 : 30;
	let useHowl = me.getSkill(sdk.skills.Howl, 0) && !me.getSkill(sdk.skills.WarCry, 0);
	let useBattleCry = me.getSkill(sdk.skills.BattleCry, 1);
	let useWarCry = me.getSkill(sdk.skills.WarCry, 0);
	let rangedMobsClassIDs = [10, 11, 12, 13, 14, 118, 119, 120, 121, 131, 132, 133, 134, 135, 170, 171, 172, 173, 174, 238, 239, 240, 310, 362, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 580, 581, 582, 583, 584, 645, 646, 647, 697];
	let dangerousAndSummoners = [636, 637, 638, 639, 640, 641, 58, 59, 60, 61, 101, 102, 103, 104, 105, 557, 558, 669, 670, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478];
	let list = Attack.buildMonsterList();

	if ([sdk.areas.RiverofFlame, sdk.areas.ChaosSanctuary].indexOf(me.area) > -1) {
		rangedMobsClassIDs.push(305, 306);
	}

	let newList = list.filter(mob => [0, 8].indexOf(mob.spectype) > -1 && !mob.getState(sdk.states.Taunt) && !unit.getState(sdk.states.BattleCry) && !unit.getState(sdk.states.Decrepify) &&
		((rangedMobsClassIDs.indexOf(mob.classid) > -1 && Math.round(getDistance(me, mob)) <= range) || (dangerousAndSummoners.indexOf(mob.classid) > -1 && Math.round(getDistance(me, mob)) <= 30)));

	newList.sort(Sort.units);

	if (newList.length >= 1) {
		for (let i = 0; i < newList.length; i++) {
			if (Math.round(getDistance(me, newList[i])) <= 4 && useBattleCry) {
				Skill.cast(sdk.skills.BattleCry, 0);

				continue;
			}

			if (useHowl && Attack.getMobCount(me.x, me.y, 6, null, true) >= 3 && Skill.getManaCost(sdk.skills.Howl) < me.mp) {
				Skill.cast(sdk.skills.Howl, 0);
				this.doCast(unit, attackSkill);
			} else if (useWarCry && Attack.getMobCount(me.x, me.y, 6, null, true) >= 1 && Skill.getManaCost(sdk.skills.WarCry) < me.mp) {
				Skill.cast(sdk.skills.WarCry, 0);
			}

			if (!newList[i].getState(sdk.states.Taunt) && !newList[i].getState(sdk.states.Terror) && !unit.getState(sdk.states.BattleCry) &&
				!newList[i].dead && Skill.getManaCost(sdk.skills.Taunt) < me.mp && !checkCollision(me, newList[i], 0x4)) {
				me.overhead("Taunting: " + newList[i].name + " | classid: " + newList[i].classid);
				//print("Casting on: " + newList[i].name + " | spectype: " + newList[i].spectype + " | classid: " + newList[i].classid);
				Skill.cast(sdk.skills.Taunt, Skill.getHand(sdk.skills.Taunt), newList[i]);
			}

			this.doCast(unit, attackSkill);
		}
	}
};

ClassAttack.doAttack = function (unit, preattack) {
	let useHowl = me.getSkill(sdk.skills.Howl, 1);
	let useGrimWard = me.getSkill(sdk.skills.GrimWard, 1);
	let useTaunt = me.getSkill(sdk.skills.Taunt, 1);
	let useWarCry = me.getSkill(sdk.skills.WarCry, 1);
	let useBattleCry = me.getSkill(sdk.skills.BattleCry, 1);
	let switchCast = (Precast.getBetterSlot(sdk.skills.BattleCry) === 1 || Precast.getBetterSlot(sdk.skills.WarCry) === 1) ? true : false;
	Config.FindItemSwitch = Precast.getBetterSlot(sdk.skills.FindItem);

	let index, needRepair = [], attackSkill = -1;
		
	index = ((unit.spectype & 0x7) || unit.type === 0) ? 1 : 3;

	if (me.charlvl >= 5) {
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

	if (useHowl && attackSkill !== 151 && [345, 571].indexOf(unit.classid) === -1 && Attack.getMobCount(me.x, me.y, 6, null, true) >= 3 && Skill.getManaCost(sdk.skills.Howl) < me.mp && me.hp < Math.floor(me.hpmax * 75 / 100)) {
		if (useGrimWard) {
			this.grimWard(6);
		} else {
			Skill.cast(sdk.skills.Howl, Skill.getHand(sdk.skills.Howl));
		}
	}

	if (useTaunt) {
		this.tauntMonsters(unit, attackSkill);
	}

	if (!unit.dead && useBattleCry && !me.getState(sdk.states.SkillDelay)) {
		// Unit not already in Battle Cry, decrepify, terror, or taunt state. Don't want to overwrite helpful cureses
		if (!unit.getState(sdk.states.BattleCry) && !unit.getState(sdk.states.Decrepify) && !unit.getState(sdk.states.Terror) && !unit.getState(sdk.states.Taunt)) {
			if (Math.round(getDistance(me, unit)) > Skill.getRange(sdk.skills.BattleCry) || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(sdk.skills.BattleCry), 0x4)) {
					return 0;
				}
			}

			if (switchCast) {
				me.switchWeapons(1);
			}

			Skill.cast(sdk.skills.BattleCry, Skill.getHand(sdk.skills.BattleCry), unit);

			if (switchCast && !useWarCry) {
				me.switchWeapons(0);
			}
		}
	}

	if (!unit.dead && useWarCry && [156, 211, 242, 243, 544, 562, 570, 540, 541, 542].indexOf(unit.classid) === -1 && Attack.isCursable(unit) &&
		(!unit.getState(sdk.states.Stunned) || getTickCount() - this.warCryTick >= 1500) &&
		Skill.getManaCost(sdk.skills.WarCry) < me.mp && Attack.checkResist(unit, sdk.skills.WarCry) && !me.getState(sdk.states.SkillDelay) && Attack.getMobCount(me.x, me.y, 5, null, true) >= 1) {
		if (!unit.getState(sdk.states.Stunned)) {
			if (Math.round(getDistance(me, unit)) > Skill.getRange(sdk.skills.WarCry) || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(sdk.skills.WarCry), 0x4)) {
					return 0;
				}
			}

			if (switchCast) {
				me.switchWeapons(1);
			}

			//print("ÿc9doAttack ÿc0:: Non-Unique Monster Count in 5 yard radius: " + Attack.getMobCount(me.x, me.y, 5, null, true));

			if (me.getSkill(sdk.skills.WarCry, 1) >= 15) {
				for (let i = 0; i < 2; i++) {
					if (Skill.getManaCost(sdk.skills.WarCry) < me.mp) {
						Skill.cast(sdk.skills.WarCry, Skill.getHand(sdk.skills.WarCry), unit);
					}

					delay(50 + me.ping);
				}

				return 1;
			} else {
				Skill.cast(sdk.skills.WarCry, Skill.getHand(sdk.skills.WarCry), unit);
			}

			if (switchCast) {
				me.switchWeapons(0);
			}

			this.warCryTick = getTickCount();
		
			return 1;
		}
	}

	if (preattack && Config.AttackSkill[0] > 0 && Config.AttackSkill[0] !== sdk.skills.WarCry && me.getSkill(Config.AttackSkill[0], 1) && Attack.checkResist(unit, Attack.getSkillElement(Config.AttackSkill[0])) &&
		(Skill.getManaCost(Config.AttackSkill[0]) < me.mp) && (!me.getState(sdk.states.SkillDelay) || !Skill.isTimed(Config.AttackSkill[0]))) {
		if (Math.round(getDistance(me, unit)) > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, 0x4)) {
			if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), 0x4)) {
				return 0;
			}
		}

		Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

		return 1;
	}

	if (index === 1) {
		if (useHowl && attackSkill !== sdk.skills.Whirlwind && [211, 243, 544, 562, 570, 571, 540, 541, 542].indexOf(unit.classid) === -1 &&
			Attack.getMobCount(me.x, me.y, 5, null, true) >= 3 && Skill.getManaCost(sdk.skills.Howl) < me.mp) {
			if (useGrimWard) {
				this.grimWard(6);
			} else if (!useWarCry) {
				Skill.cast(sdk.skills.Howl, Skill.getHand(sdk.skills.Howl));
			}
		}
	}

	// Telestomp with barb is pointless
	return this.doCast(unit, attackSkill);
};

ClassAttack.doCast = function (unit, attackSkill) {
	// In case of failing to switch back to main weapon slot
	if (me.weaponswitch === 1) {
		me.switchWeapons(0);
	}

	let walk;
	let useConc = me.getSkill(sdk.skills.Concentrate, 0) && attackSkill === sdk.skills.Berserk;
	let useFrenzy = me.getSkill(sdk.skills.Frenzy, 0) && attackSkill === sdk.skills.Berserk;
	let useWhirl = me.getSkill(sdk.skills.Whirlwind, 0) && attackSkill !== sdk.skills.Whirlwind; // If main attack skill is already whirlwind no need to use it twice
	let useLeap = me.getSkill(sdk.skills.LeapAttack, 1);
	let useWarCry = me.getSkill(sdk.skills.WarCry, 1);
	let useBattleCry = me.getSkill(sdk.skills.BattleCry, 1);
	let switchCast = (Precast.getBetterSlot(sdk.skills.BattleCry) === 1 || Precast.getBetterSlot(sdk.skills.WarCry) === 1) ? true : false;
	Config.FindItem = me.getSkill(sdk.skills.FindItem, 1);	// Any points into the skill

	if (attackSkill < 0) {
		return 2;
	}

	switch (attackSkill) {
	case sdk.skills.Whirlwind:
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

			if (useLeap && !checkCollision(me, unit, 0x1) && Math.round(getDistance(me, unit)) > 6) {
				Skill.cast(sdk.skills.LeapAttack, 0, unit.x, unit.y);
			}

			if (!Attack.getIntoPosition(unit, Skill.getRange(attackSkill), 0x4, walk)) {
				return 0;
			}
		}

		if (!unit.dead) {
			Skill.cast(attackSkill, Skill.getHand(attackSkill), unit);

			// Unit not already in Battle Cry, decrepify, terror, or taunt state. Don't want to overwrite helpful cureses
			if (useBattleCry && Attack.getMobCount(me.x, me.y, 4) >= 1 &&
				!unit.getState(sdk.states.BattleCry) && !unit.getState(sdk.states.Decrepify) && !unit.getState(sdk.states.Terror) && !unit.getState(sdk.states.Taunt) && Skill.getManaCost(sdk.skills.BattleCry) < me.mp) {
				if (switchCast) {
					me.switchWeapons(1);
				}

				Skill.cast(sdk.skills.BattleCry, Skill.getHand(sdk.skills.BattleCry), unit);

				if (switchCast && !useWarCry) {
					me.switchWeapons(1);
				}
			}

			if (useWarCry && !unit.dead && [156, 211, 242, 243, 544, 562, 570, 540, 541, 542].indexOf(unit.classid) === -1 &&
				Attack.isCursable(unit) && (!unit.getState(sdk.states.Stunned) || getTickCount() - this.warCryTick >= 1500) &&
				Attack.getMobCount(me.x, me.y, 5, null, true) >= (me.area === sdk.areas.ThroneofDestruction || Item.getEquippedItem(4).durability === 0 ? 1 : 3)
				&& Skill.getManaCost(sdk.skills.WarCry) < me.mp && Attack.checkResist(unit, sdk.skills.WarCry)) {
				if (switchCast) {
					me.switchWeapons(1);
				}

				//print("ÿc9doCast ÿc0:: Non-Unique Monster Count in 5 yard radius: " + Attack.getMobCount(me.x, me.y, 5, null, true));

				Skill.cast(sdk.skills.WarCry, Skill.getHand(sdk.skills.WarCry));
				this.warCryTick = getTickCount();

				if (switchCast) {
					me.switchWeapons(0);
				}
			}

			if (useFrenzy && !unit.dead && !me.getState(sdk.states.Frenzy)) {
				Skill.cast(sdk.skills.Frenzy, Skill.getHand(sdk.skills.Frenzy), unit);
			}

			if (useConc && !unit.dead) {
				Skill.cast(sdk.skills.Concentrate, Skill.getHand(sdk.skills.Concentrate), unit);
			}

			if (useWhirl && !unit.dead && (Attack.getMobCount(me.x, me.y, 6) >= 3 || ([156, 211, 242, 243, 544, 571].indexOf(unit.classid) > -1) && !me.hell)) {
				this.whirlwind(unit);
			}
		}

		return 1;
	}
};

ClassAttack.afterAttack = function (pickit) {
	let needRepair;

	if (Pather.useTeleport()) {
		Misc.unShift();
	}

	Precast.doPrecast(false);

	if (me.charlvl > 5) {
		needRepair = Town.needRepair();
	}
	
	// Repair check, make sure i have a tome
	if (needRepair && needRepair.length > 0 && me.getItem(518)) {
		Town.visitTown(true);
	}

	if (pickit) {
		this.findItem(10);
	}
};

ClassAttack.findItemIgnoreGids = [];

ClassAttack.findItem = function (range) {
	if (!Config.FindItem || !me.getSkill(sdk.skills.FindItem, 1)) {
		return false;
	}

	let i, j, tick, corpse, orgX, orgY, retry, pick = false,
		corpseList = [];

	orgX = me.x;
	orgY = me.y;

	MainLoop:
	for (i = 0; i < 3; i += 1) {
		corpse = getUnit(1);

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
					if (Config.FindItemSwitch) {
						me.switchWeapons(Attack.getPrimarySlot());
					}

					Attack.clear(10, false, false, false, false);

					retry = true;

					break MainLoop;
				}

				corpseList.sort(Sort.units);

				corpse = corpseList.shift();

				if (this.checkCorpse(corpse)) {
					if (getDistance(me, corpse) > 30 || checkCollision(me, corpse, 0x1)) {
						Pather.moveToUnit(corpse);
					}

					if (Config.FindItemSwitch) {
						me.switchWeapons(Attack.getPrimarySlot() ^ 1);
					}

					CorpseLoop:
					for (j = 0; j < 3; j += 1) {
						Skill.cast(sdk.skills.FindItem, 0, corpse);

						tick = getTickCount();

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

	if (retry) {
		return this.findItem(me.area === sdk.areas.Travincal ? 60 : 20);
	}

	if (Config.FindItemSwitch && me.weaponswitch === 1) {
		me.switchWeapons(Attack.getPrimarySlot());
	}

	if (pick) {
		Pickit.pickItems();
	}

	return true;
};

ClassAttack.grimWard = function (range) {
	if (!me.getSkill(sdk.skills.GrimWard, 1)) {
		return false;
	}

	let i, j, tick, corpse, orgX, orgY,
		corpseList = [];

	orgX = me.x;
	orgY = me.y;

	for (i = 0; i < 3; i += 1) {
		corpse = getUnit(1);

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
					if (getDistance(me, corpse) > 30 || checkCollision(me, corpse, 0x1)) {
						Pather.moveToUnit(corpse);
					}

					CorpseLoop:
					for (j = 0; j < 3; j += 1) {
						Skill.cast(sdk.skills.GrimWard, 0, corpse);

						tick = getTickCount();

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

ClassAttack.checkCorpse = function (unit) {
	if (unit.mode !== 0 && unit.mode !== 12) {
		return false;
	}

	if ([345, 346, 347].indexOf(unit.classid) === -1 && unit.spectype === 0) {
		return false;
	}

	// monstats2 doesn't contain guest monsters info. sigh..
	if (unit.classid <= 575 && !getBaseStat("monstats2", unit.classid, "corpseSel")) {
		return false;
	}

	if (getDistance(me, unit) <= 25 && !checkCollision(me, unit, 0x4) &&
			!unit.getState(sdk.states.Freeze) &&
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
