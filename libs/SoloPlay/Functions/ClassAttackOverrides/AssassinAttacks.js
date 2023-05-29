/**
*  @filename    AssassinAttacks.js
*  @author      theBGuy
*  @desc        Assassin fixes to improve class attack functionality
*
*/

/**
 * @todo
 * Test utilizing marital art skills if we have them
 */

includeIfNotIncluded("core/Attacks/Assassin.js");

ClassAttack.mindBlast = function (unit) {
  if (!unit || !Skill.canUse(sdk.skills.MindBlast)) return;
  // Main bosses
  if (unit.isPrimeEvil) return;
  // Duriel's Lair, Arreat Summit, Worldstone Chamber
  if ([sdk.areas.DurielsLair, sdk.areas.ArreatSummit, sdk.areas.WorldstoneChamber].includes(me.area)) return;

  const mindBlastMpCost = Skill.getManaCost(sdk.skills.MindBlast);
  let list = getUnits(sdk.unittype.Monster)
    .filter(function (mob) {
      if (mob.attackable && !mob.isStunned && !mob.isUnderLowerRes && !mob.isUnique) {
        let dist = mob.distance;
        return (dist <= 6 || (dist >= 20 && dist <= 30));
      }
      return false;
    })
    .sort(Sort.units);

  if (list.length >= 1) {
    for (let i = 0; i < list.length; i++) {
      if (!list[i].dead && !checkCollision(me, list[i], sdk.collision.BlockWall) && me.mp > mindBlastMpCost * 2) {
        me.overhead("MindBlasting " + list[i].name);
        Skill.cast(sdk.skills.MindBlast, sdk.skills.hand.Right, list[i]);
      }
    }
  }
};

ClassAttack.switchCurse = function (unit, force) {
  if (CharData.skillData.haveChargedSkill([sdk.skills.SlowMissiles, sdk.skills.LowerResist, sdk.skills.Weaken]) && unit.curseable) {
    const gold = me.gold;
    const isBoss = unit.isBoss;
    const dangerZone = [sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction].includes(me.area);
    if (force && checkCollision(me, unit, sdk.collision.Ranged)) {
      if (!Attack.getIntoPosition(unit, 35, sdk.collision.Ranged)) return;
    }
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
};

ClassAttack.placeTraps = function (unit, amount) {
  let traps = 0;

  this.lastTrapPos = { x: unit.x, y: unit.y };

  for (let i = -1; i <= 1; i += 1) {
    for (let j = -1; j <= 1; j += 1) {
      // Used for X formation
      if (Math.abs(i) === Math.abs(j)) {
        // Unit can be an object with x, y props too, that's why having "mode" prop is checked
        if (traps >= amount || (unit.hasOwnProperty("mode") && unit.dead)) return true;

        // Duriel, Mephisto, Diablo, Baal, other players
        if ((unit.hasOwnProperty("classid") && [sdk.monsters.Duriel, sdk.monsters.Mephisto, sdk.monsters.Diablo, sdk.monsters.Baal].includes(unit.classid))
            || (unit.hasOwnProperty("type") && unit.isPlayer)) {
          if (traps >= Config.BossTraps.length) {
            return true;
          }

          Skill.cast(Config.BossTraps[traps], sdk.skills.hand.Right, unit.x + i, unit.y + j);
        } else {
          if (traps >= Config.Traps.length) return true;

          switch (Config.Traps[traps]) {
          case sdk.skills.ChargedBoltSentry:
          case sdk.skills.LightningSentry:
            // Immune to lightning but not immune to fire, use fire trap if available
            if (!Attack.checkResist(unit, "lightning") && Attack.checkResist(unit, "fire")) {
              if (Skill.canUse(sdk.skills.WakeofFire)) {
                Skill.cast(sdk.skills.WakeofFire, sdk.skills.hand.Right, unit.x + i, unit.y + j);
              } else if (Skill.canUse(sdk.skills.WakeofInferno)) {
                Skill.cast(sdk.skills.WakeofInferno, sdk.skills.hand.Right, unit.x + i, unit.y + j);
              }

              break;
            } else {
              Skill.cast(Config.Traps[traps], sdk.skills.hand.Right, unit.x + i, unit.y + j);
            }

            break;
          case sdk.skills.WakeofFire:
          case sdk.skills.WakeofInferno:
            // Immune to fire but not immune to lightning, use light trap if available
            if (!Attack.checkResist(unit, "fire") && Attack.checkResist(unit, "lightning")) {
              if (Skill.canUse(sdk.skills.LightningSentry)) {
                Skill.cast(sdk.skills.LightningSentry, sdk.skills.hand.Right, unit.x + i, unit.y + j);
              } else if (Skill.canUse(sdk.skills.ChargedBoltSentry)) {
                Skill.cast(sdk.skills.ChargedBoltSentry, sdk.skills.hand.Right, unit.x + i, unit.y + j);
              }

              break;
            } else {
              Skill.cast(Config.Traps[traps], sdk.skills.hand.Right, unit.x + i, unit.y + j);
            }

            break;
          default:
            Skill.cast(Config.Traps[traps], sdk.skills.hand.Right, unit.x + i, unit.y + j);

            break;
          }
        }

        traps += 1;
      }
    }
  }

  return true;
};

ClassAttack.doAttack = function (unit, preattack) {
  if (!unit) return Attack.Result.SUCCESS;
  let gid = unit.gid;

  if (Config.MercWatch && me.needMerc()) {
    console.log("mercwatch");

    if (Town.visitTown()) {
      // lost reference to the mob we were attacking
      if (!unit || !copyUnit(unit).x || !Game.getMonster(-1, -1, gid) || unit.dead) {
        return Attack.Result.SUCCESS;
      }
    }
  }

  let mercRevive = 0;
  let shouldUseCloak = (Skill.canUse(sdk.skills.CloakofShadows) && !unit.isUnderLowerRes && unit.getMobCount(15, sdk.collision.BlockWall) > 1);
  const index = (unit.isSpecial || unit.isPlayer) ? 1 : 3;

  this.mindBlast(unit);

  if (preattack && Config.AttackSkill[0] > 0 && Attack.checkResist(unit, Config.AttackSkill[0]) && (!me.skillDelay || !Skill.isTimed(Config.AttackSkill[0]))) {
    if (unit.distance > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, sdk.collision.Ranged)) {
      if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), sdk.collision.Ranged)) {
        return Attack.Result.FAILED;
      }
    }

    Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

    return Attack.Result.SUCCESS;
  }

  // Cloak of Shadows (Aggressive) - can't be cast again until previous one runs out and next to useless if cast in precast sequence (won't blind anyone)
  if (Config.AggressiveCloak && Config.UseCloakofShadows && shouldUseCloak && !me.skillDelay && !me.getState(sdk.states.CloakofShadows)) {
    if (unit.distance < 20) {
      Skill.cast(sdk.skills.CloakofShadows, sdk.skills.hand.Right);
    } else if (!Attack.getIntoPosition(unit, 20, sdk.collision.Ranged)) {
      return Attack.Result.FAILED;
    }
  }

  let checkTraps = this.checkTraps(unit);

  if (checkTraps) {
    if (unit.distance > this.trapRange || checkCollision(me, unit, sdk.collision.Ranged)) {
      if (!Attack.getIntoPosition(unit, this.trapRange, sdk.collision.Ranged) || (checkCollision(me, unit, sdk.collision.BlockWall) && (getCollision(me.area, unit.x, unit.y) & sdk.collision.BlockWall))) {
        return Attack.Result.FAILED;
      }
    }

    this.placeTraps(unit, checkTraps);
  }

  // Cloak of Shadows (Defensive; default) - can't be cast again until previous one runs out and next to useless if cast in precast sequence (won't blind anyone)
  if (!Config.AggressiveCloak && Config.UseCloakofShadows && shouldUseCloak && unit.distance < 20 && !me.skillDelay && !me.getState(sdk.states.CloakofShadows)) {
    Skill.cast(sdk.skills.CloakofShadows, sdk.skills.hand.Right);
  }

  // Handle Switch casting
  if (index === 1 && !unit.dead) {
    ClassAttack.switchCurse(unit);
  }

  let skills = Attack.decideSkill(unit);
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
      !!closeMob && this.doCast(closeMob, skills.timed, skills.untimed);
    }

    return Attack.Result.SUCCESS;
  }

  return result;
};

ClassAttack.farCast = function (unit) {
  let timedSkill = Config.AttackSkill[1], untimedSkill = Config.AttackSkill[2];

  // No valid skills can be found
  if (timedSkill < 0 && untimedSkill < 0) return false;

  let checkTraps = this.checkTraps(unit);

  if (checkTraps) {
    if (unit.distance > 30 || checkCollision(me, unit, sdk.collision.Ranged)) {
      if (!Attack.getIntoPosition(unit, 30, sdk.collision.Ranged) || (checkCollision(me, unit, sdk.collision.BlockWall) && (getCollision(me.area, unit.x, unit.y) & sdk.collision.BlockWall))) {
        return false;
      }
    }

    this.placeTraps(unit, checkTraps);
  }

  ClassAttack.switchCurse(unit);

  if (timedSkill > -1 && (!me.skillDelay || !Skill.isTimed(timedSkill))) {
    !unit.dead && Skill.cast(timedSkill, Skill.getHand(timedSkill), unit);
  }

  if (untimedSkill > -1) {
    !unit.dead && Skill.cast(untimedSkill, Skill.getHand(untimedSkill), unit);
  }

  return true;
};
