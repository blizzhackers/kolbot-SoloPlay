/**
*  @filename    AmazonAttacks.js
*  @author      theBGuy
*  @desc        Amazon fixes to improve class attack functionality
*
*/

// TODO: clean up this whole file

includeIfNotIncluded("core/Attacks/Amazon.js");

ClassAttack.decoyTick = getTickCount();

// todo: take into account auras as well - conviction/fanat/might can all be dangerous
// mayve include dolls too?
let inDanger = function (unit) {
  let nearUnits = getUnits(sdk.unittype.Monster).filter((mon) => mon.attackable && getDistance(unit, mon) < 10);
  let dangerClose = nearUnits.find(mon => mon.getEnchant(sdk.enchant.ManaBurn) || mon.getEnchant(sdk.enchant.LightningEnchanted));
  return {
    check: nearUnits.length > me.maxNearMonsters || dangerClose,
    mobs: nearUnits.length
  };
};

ClassAttack.decideSkill = function (unit) {
  let skills = { timed: -1, untimed: -1 };
  if (!unit) return skills;

  let index = (unit.isSpecial || unit.isPlayer) ? 1 : 3;

  // Get timed skill
  let checkSkill = Attack.getCustomAttack(unit) ? Attack.getCustomAttack(unit)[0] : Config.AttackSkill[index];

  if (Attack.checkResist(unit, checkSkill) && Attack.validSpot(unit.x, unit.y, checkSkill)) {
    skills.timed = checkSkill;
  } else if (Config.AttackSkill[5] > -1 && Attack.checkResist(unit, Config.AttackSkill[5]) && Attack.validSpot(unit.x, unit.y, Config.AttackSkill[5])) {
    skills.timed = Config.AttackSkill[5];
  }

  // Get untimed skill
  checkSkill = Attack.getCustomAttack(unit) ? Attack.getCustomAttack(unit)[1] : Config.AttackSkill[index + 1];

  if (Attack.checkResist(unit, checkSkill) && Attack.validSpot(unit.x, unit.y, checkSkill)) {
    skills.untimed = checkSkill;
  } else if (Config.AttackSkill[6] > -1 && Attack.checkResist(unit, Config.AttackSkill[6]) && Attack.validSpot(unit.x, unit.y, Config.AttackSkill[6])) {
    skills.untimed = Config.AttackSkill[6];
  }

  // Low mana timed skill
  if (Config.LowManaSkill[0] > -1 && Skill.getManaCost(skills.untimed) > me.mp && Attack.checkResist(unit, Config.LowManaSkill[0])) {
    skills.timed = Config.LowManaSkill[0];
  }

  // Low mana untimed skill
  if (Config.LowManaSkill[1] > -1 && Skill.getManaCost(skills.untimed) > me.mp && Attack.checkResist(unit, Config.LowManaSkill[1])) {
    skills.untimed = Config.LowManaSkill[1];
  }

  return skills;
};

ClassAttack.doAttack = function (unit) {
  if (!unit) return Attack.Result.SUCCESS;
  let gid = unit.gid;
  let needRepair = me.charlvl < 5 ? [] : me.needRepair();

  if ((Config.MercWatch && me.needMerc()) || needRepair.length > 0) {
    console.log("towncheck");

    if (Town.visitTown(!!needRepair.length)) {
      // lost reference to the mob we were attacking
      if (!unit || !copyUnit(unit).x || !Game.getMonster(-1, -1, gid) || unit.dead) {
        return Attack.Result.SUCCESS;
      }
    }
  }

  let mercRevive = 0;
  let gold = me.gold;
  let index = ((unit.isSpecial) || unit.isPlayer) ? 1 : 3;
  
  // todo: assign main attack damage, if we have a range skill but we are attacking a mob thats resistant with our close up skill, move away and use far attack
  // figure out better slow-missiles casting
  // need to re-write to include damage calculations - when should we use poison over light or phys over light
  const data = {
    innerSight: {
      skill: sdk.skills.InnerSight,
      level: me.getSkill(sdk.skills.InnerSight, sdk.skills.subindex.SoftPoints),
      range: 15,
      mana: Skill.getManaCost(sdk.skills.InnerSight),
      use: function () {
        return this.level > 0;
      }
    },
    slowMissiles: {
      skill: sdk.skills.SlowMissiles,
      level: me.getSkill(sdk.skills.SlowMissiles, sdk.skills.subindex.SoftPoints),
      range: 15,
      mana: Skill.getManaCost(sdk.skills.SlowMissiles),
      use: function () {
        return this.level > 0;
      }
    },
    decoy: {
      skill: sdk.skills.Dopplezon,
      level: me.getSkill(sdk.skills.Dopplezon, sdk.skills.subindex.SoftPoints),
      range: 20,
      mana: Skill.getManaCost(sdk.skills.Dopplezon),
      duration: Skill.getDuration(sdk.skills.Dopplezon),
      force: false,
      use: function () {
        return ((this.level > 0 && !me.normal) || this.force);
      }
    },
    lightFury: {
      skill: sdk.skills.LightningFury,
      level: me.getSkill(sdk.skills.LightningFury, sdk.skills.subindex.SoftPoints),
      range: Skill.getRange(sdk.skills.LightningFury),
      mana: Skill.getManaCost(sdk.skills.LightningFury),
      force: false,
      use: function () {
        return (this.level >= 10 || this.force);
      }
    },
    plagueJav: {
      skill: sdk.skills.PlagueJavelin,
      level: me.getSkill(sdk.skills.PlagueJavelin, sdk.skills.subindex.SoftPoints),
      range: Skill.getRange(sdk.skills.PlagueJavelin),
      mana: Skill.getManaCost(sdk.skills.PlagueJavelin),
      force: false,
      use: function () {
        return ((!me.normal && this.level > 0) || this.level >= 15 || this.force);
      }
    },
    jab: {
      skill: sdk.skills.Jab,
      level: me.getSkill(sdk.skills.Jab, sdk.skills.subindex.SoftPoints),
      range: Skill.getRange(sdk.skills.Jab),
      mana: Skill.getManaCost(sdk.skills.Jab),
      use: function () {
        return (this.level > 0 && me.equipped.get(sdk.body.RightArm).tier >= 1000);
      }
    },
  };

  // Pre-attacks Section -----------------------------------------------------------------------------------------------------------------//
  if (data.slowMissiles.use()) {
    if (!unit.getState(sdk.states.SlowMissiles)) {
      if ((unit.distance > 3 || unit.getEnchant(sdk.enchant.LightningEnchanted)) && unit.distance < 13 && !checkCollision(me, unit, sdk.collision.Ranged)) {
        // Act Bosses and mini-bosses are immune to Slow Missles and pointless to use on lister or Cows, Use Inner-Sight instead
        if ([156, 211, 242, 243, 544, 571, 391, 365, 267, 229].includes(unit.classid)) {
          // Check if already in this state
          if (!unit.getState(sdk.states.InnerSight)) {
            Skill.cast(sdk.skills.InnerSight, sdk.skills.hand.Right, unit);
          }
        } else {
          Skill.cast(sdk.skills.SlowMissiles, sdk.skills.hand.Right, unit);
        }
      }
    }
  }

  // if inDanger and within melee distance should we try to find a better spot?
  if (inDanger(unit).check) {
    data.lightFury.level && (data.lightFury.force = data.lightFury.level > 10);
    data.plagueJav.level && (data.plagueJav.force = data.plagueJav.level > 10);
    data.decoy.level && (data.decoy.force = true);
  }

  if (data.innerSight.use()) {
    if (!unit.getState(sdk.states.InnerSight) && unit.distance > 3 && unit.distance < 13 && !checkCollision(me, unit, sdk.collision.Ranged)) {
      Skill.cast(sdk.skills.InnerSight, sdk.skills.hand.Right, unit);
    }
  }

  // Handle Switch casting
  let commonCheck = (gold > 500000 || unit.isBoss || [sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction].includes(me.area));
  if (me.expansion && index === 1 && unit.curseable) {
    if (CharData.skillData.haveChargedSkillOnSwitch(sdk.skills.LowerResist)
      && !unit.getState(sdk.states.LowerResist) && commonCheck && !checkCollision(me, unit, sdk.collision.Ranged)) {
      // Switch cast lower resist
      Attack.switchCastCharges(sdk.skills.LowerResist, unit);
    }

    if (CharData.skillData.haveChargedSkillOnSwitch(sdk.skills.Weaken) && !unit.getState(sdk.states.Weaken)
      && !unit.getState(sdk.states.LowerResist) && commonCheck && !checkCollision(me, unit, sdk.collision.Ranged)) {
      // Switch cast weaken
      Attack.switchCastCharges(sdk.skills.Weaken, unit);
    }
  }

  // specials and dolls for now, should make dolls much less dangerous with the reduction of their damage
  if (Precast.haveCTA > -1 && unit.curseable && (index === 1 || unit.isDoll)
    && unit.distance < 5 && !unit.getState(sdk.states.BattleCry) && unit.curseable) {
    Skill.switchCast(sdk.skills.BattleCry, { oSkill: true });
  }

  if (data.decoy.use()) {
    // Act Bosses or Immune to my main boss skill
    if ((unit.isPrimeEvil) || !Attack.checkResist(unit, Config.AttackSkill[1]) || data.decoy.force) {
      Misc.poll(() => !me.skillDelay, 1000, 40);

      // Don't use decoy if within melee distance
      if (unit.distance > 5) {
        // Check to see if decoy has already been cast
        let decoy = me.getMinionCount(8);
        
        if ((!decoy || data.decoy.force) && (getTickCount() - this.decoyTick >= data.decoy.duration)) {
          if (unit.distance > 10 || checkCollision(me, unit, 0x7)) {
            if (!Attack.getIntoPosition(unit, 10, 0x7)) {
              return Attack.Result.FAILED;
            }
          }

          let coord = CollMap.getRandCoordinate(unit.x, -2, 2, unit.y, -2, 2);
          !!coord && Skill.cast(sdk.skills.Decoy, sdk.skills.hand.Right, coord.x, coord.y);

          // Check if it was a sucess
          !!me.getMinionCount(8) && (this.decoyTick = getTickCount());
        }
      }
    }
  }

  // Only try attacking light immunes if I have my end game javelin - preAttack with Plague Javelin
  if (data.plagueJav.use() && !Attack.checkResist(unit, "lightning")) {
    if (unit.distance <= 15 && !checkCollision(me, unit, sdk.collision.Ranged)) {
      // Cast Slow-Missles, then proceed with Plague Jav. Lowers amount of damage from projectiles.
      !unit.getState(sdk.states.SlowMissiles) && data.slowMissiles.use() && Skill.cast(sdk.skills.SlowMissiles, sdk.skills.hand.Right, unit);

      // Handle Switch casting
      if (!unit.dead) {
        // should we switch cast any mob thats light immune?
        if (!unit.getState(sdk.states.LowerResist) && unit.curseable && commonCheck && !checkCollision(me, unit, sdk.collision.Ranged)) {
          // Switch cast lower resist
          Attack.switchCastCharges(sdk.skills.LowerResist, unit);
        }
      }

      if (Attack.checkResist(unit, "poison") && !me.skillDelay && !unit.dead) {
        Skill.cast(sdk.skills.PlagueJavelin, Skill.getHand(sdk.skills.PlagueJavelin), unit);
      }

      if (!data.jab.use() && data.jab.level) {
        // We are within melee distance might as well use jab rather than stand there
        // Make sure monster is not physical immune
        if (unit.distance < 4 && Attack.checkResist(unit, "physical")) {
          if (checkCollision(me, unit, 0x7)) {
            if (!Attack.getIntoPosition(unit, 3, 0x7)) {
              return Attack.Result.FAILED;
            }
          }

          !unit.dead && Skill.cast(sdk.skills.Jab, Skill.getHand(sdk.skills.Jab), unit);
            
          return Attack.Result.SUCCESS;
        }
        
        return Attack.Result.SUCCESS;
      }
    }
  }

  // Only try attacking immunes if I have my end game javelin and they aren't lightning enchanted - use jab as main attack
  // why? don't remember reason I did this
  // if (data.jab.use() && !Attack.checkResist(unit, Config.AttackSkill[1]) && Attack.checkResist(unit, "physical") && !unit.getEnchant(sdk.enchant.LightningEnchanted)) {
  // 	if ((unit.distance > 3 || checkCollision(me, unit, sdk.collision.Ranged)) && !Attack.getIntoPosition(unit, 3, sdk.collision.BlockWall)) {
  // 		return Attack.Result.FAILED;
  // 	}

  // 	!unit.dead && Skill.cast(sdk.skills.Jab, Skill.getHand(sdk.skills.Jab), unit);
    
  // 	return Attack.Result.SUCCESS;
  // }

  if (data.plagueJav.use() && Attack.checkResist(unit, "poison") && !unit.getState(sdk.states.Poison) && !me.skillDelay) {
    if (((data.plagueJav.force || unit.distance >= 8) && unit.distance <= 25) && !checkCollision(me, unit, sdk.collision.Ranged)) {
      Skill.cast(sdk.skills.PlagueJavelin, Skill.getHand(sdk.skills.PlagueJavelin), unit);
    }
  }

  if (data.lightFury.use()) {
    if ((unit.distance >= 8 && unit.distance <= 25) && !checkCollision(me, unit, sdk.collision.Ranged)) {
      if (Skill.cast(sdk.skills.LightningFury, Skill.getHand(sdk.skills.LightningFury), unit) && data.lightFury.force) return Attack.Result.SUCCESS;
    }
  }

  let skills = this.decideSkill(unit);
  let result = this.doCast(unit, skills.timed, skills.untimed);

  if (result === Attack.Result.CANTATTACK && Attack.canTeleStomp(unit)) {
    let merc = me.getMerc();

    while (unit.attackable) {
      if (!unit) return Attack.Result.SUCCESS;

      if (me.needMerc()) {
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

      let closeMob = Attack.getNearestMonster({ skipGid: gid });
      
      if (!!closeMob) {
        let findSkill = this.decideSkill(closeMob);
        (this.doCast(closeMob, findSkill.timed, findSkill.untimed) === 1) || (data.decoy.level && Skill.cast(sdk.skills.Decoy, sdk.skills.hand.Right, unit));
      }
    }

    return Attack.Result.SUCCESS;
  }

  return result;
};

ClassAttack.afterAttack = function () {
  Precast.doPrecast(false);

  let needRepair = me.charlvl < 5 ? [] : me.needRepair();
  
  // Repair check, make sure i have a tome
  if (needRepair.length > 0 && me.getItem(sdk.items.TomeofTownPortal)) {
    Town.visitTown(true);
  }

  this.lightFuryTick = 0;
};

// Returns: 0 - fail, 1 - success, 2 - no valid attack skills
ClassAttack.doCast = function (unit, timedSkill, untimedSkill) {
  let walk;

  // No valid skills can be found
  if (timedSkill < 0 && untimedSkill < 0) return Attack.Result.CANTATTACK;

  // Arrow/bolt check
  if (this.bowCheck) {
    switch (true) {
    case this.bowCheck === "bow" && !me.getItem("aqv", sdk.items.mode.Equipped):
    case this.bowCheck === "crossbow" && !me.getItem("cqv", sdk.items.mode.Equipped):
      console.log("Bow check");
      Town.visitTown();

      break;
    }
  }

  if (timedSkill > -1 && (!me.getState(sdk.states.SkillDelay) || !Skill.isTimed(timedSkill))) {
    switch (timedSkill) {
    case sdk.skills.LightningFury:
      if (!this.lightFuryTick || getTickCount() - this.lightFuryTick > Config.LightningFuryDelay * 1000) {
        if (unit.distance > Skill.getRange(timedSkill) || checkCollision(me, unit, sdk.collision.Ranged)) {
          if (!Attack.getIntoPosition(unit, Skill.getRange(timedSkill), sdk.collision.Ranged)) {
            return Attack.Result.FAILED;
          }
        }

        if (!unit.dead && Skill.cast(timedSkill, Skill.getHand(timedSkill), unit)) {
          this.lightFuryTick = getTickCount();
        }

        return Attack.Result.SUCCESS;
      }

      break;
    default:
      // If main attack skill is lightning strike and charged strike's skill level is at least level 15, check current monster count. If monster count is less than 3, use CS as its more effective with small mobs
      if (timedSkill === sdk.skills.LightningStrike && me.getSkill(sdk.skills.ChargedStrike, sdk.skills.subindex.SoftPoints) >= 15) {
        if (me.getMobCount(15, Coords_1.BlockBits.LineOfSight | Coords_1.BlockBits.Ranged | Coords_1.BlockBits.ClosedDoor | Coords_1.BlockBits.BlockWall) <= 3) {
          timedSkill = sdk.skills.ChargedStrike;
        }
      }

      if (Skill.getRange(timedSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) return Attack.Result.FAILED;

      if (unit.distance > Skill.getRange(timedSkill) || checkCollision(me, unit, sdk.collision.Ranged)) {
        // Allow short-distance walking for melee skills
        walk = (Skill.getRange(timedSkill) < 4
            && unit.distance < 10
            && !checkCollision(me, unit, sdk.collision.BlockWall)
          );

        if (!Attack.getIntoPosition(unit, Skill.getRange(timedSkill), sdk.collision.Ranged, walk)) {
          return Attack.Result.FAILED;
        }
      }

      !unit.dead && Skill.cast(timedSkill, Skill.getHand(timedSkill), unit);

      return Attack.Result.SUCCESS;
    }
  }

  if (untimedSkill > -1) {
    if (Skill.getRange(untimedSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) return Attack.Result.FAILED;

    if (unit.distance > Skill.getRange(untimedSkill) || checkCollision(me, unit, sdk.collision.Ranged)) {
      // Allow short-distance walking for melee skills
      walk = (Skill.getRange(untimedSkill) < 4
          && unit.distance < 10
          && !checkCollision(me, unit, sdk.collision.BlockWall)
        );

      if (!Attack.getIntoPosition(unit, Skill.getRange(untimedSkill), sdk.collision.Ranged, walk)) {
        return Attack.Result.FAILED;
      }
    }

    !unit.dead && Skill.cast(untimedSkill, Skill.getHand(untimedSkill), unit);

    return Attack.Result.SUCCESS;
  }

  Misc.poll(() => !me.skillDelay, 1000, 40);

  // Wait for Lightning Fury timeout
  while (this.lightFuryTick && getTickCount() - this.lightFuryTick < Config.LightningFuryDelay * 1000) {
    delay(40);
  }

  return Attack.Result.SUCCESS;
};
