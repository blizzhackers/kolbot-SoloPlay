/**
*  @filename    PaladinAttacks.js
*  @author      theBGuy
*  @desc        Paladin fixes to improve class attack functionality
*
*/

includeIfNotIncluded("core/Attacks/Paladin.js");

/**
 * @todo build selectAura method
 */

const MercWatch = {
  last: 0,
};


// eslint-disable-next-line no-unused-vars
ClassAttack.doAttack = function (unit = undefined, preattack = false, once = false) {
  if (!unit || !unit.attackable) return Attack.Result.SUCCESS;

  let gid = unit.gid;
  let mercRevive = 0;
  let gold = me.gold;
  let [attackSkill, aura] = [-1, -1];
  const index = (unit.isSpecial || unit.isPlayer) ? 1 : 3;

  // prevent running back to town quickly if our merc is just weak
  if (Config.MercWatch && me.needMerc() && getTickCount() - MercWatch.last > Time.seconds(5)) {
    console.log("mercwatch");

    if (Town.visitTown()) {
      // lost reference to the mob we were attacking
      if (!unit || !copyUnit(unit).x || !Game.getMonster(-1, -1, gid) || unit.dead) {
        return Attack.Result.SUCCESS;
      }
    }
    MercWatch.last = getTickCount();
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
    Skill.switchCast(sdk.skills.BattleCry, { oSkill: true });
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

  /**
   * @param {Monster} unit 
   * @returns {AttackResult}
   */
  const switchBowAttack = (unit) => {
    if (Attack.getIntoPosition(unit, 20, sdk.collision.Ranged)) {
      try {
        const checkForShamans = unit.isFallen && !me.inArea(sdk.areas.BloodMoor);
        for (let i = 0; i < 5 && unit.attackable; i++) {
          if (checkForShamans && !once) {
            // before we waste time let's see if there is a shaman we should kill
            const shaman = getUnits(sdk.unittype.Monster)
              .filter(mon => mon.distance < 20 && mon.isShaman && mon.attackable)
              .sort((a, b) => a.distance - b.distance).first();
            if (shaman) return ClassAttack.doAttack(shaman, null, true);
          }
          if (!Attack.useBowOnSwitch(unit, sdk.skills.Attack, i === 5)) return Attack.Result.FAILED;
          if (unit.distance < 8 || me.inDanger()) {
            if (once) return Attack.Result.FAILED;
            let closeMob = getUnits(sdk.unittype.Monster)
              .filter(mon => mon.distance < 10 && mon.attackable && mon.gid !== gid)
              .sort(Attack.walkingSortMonsters).first();
            if (closeMob) return ClassAttack.doAttack(closeMob, null, true);
          }
        }
      } finally {
        me.weaponswitch !== sdk.player.slot.Main && me.switchWeapons(sdk.player.slot.Main);
      }
    }
    return unit.dead ? Attack.Result.SUCCESS : Attack.Result.FAILED;
  };

  if (CharData.skillData.bow.onSwitch
    && (index !== 1 || !unit.name.includes(getLocaleString(sdk.locale.text.Ghostly)))
    && (unit.distance >= 12 || (unit.distance >= 8 && unit.isMoving && (unit.targetx !== me.x || unit.targety !== me.y)))
    && ([-1, sdk.skills.Attack].includes(attackSkill) || Skill.getManaCost(attackSkill) > me.mp)) {
    if (switchBowAttack(unit) === Attack.Result.SUCCESS) return Attack.Result.SUCCESS;
  }

  let result = this.doCast(unit, attackSkill, aura);

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
      !!closeMob && this.doCast(closeMob, attackSkill, aura);
    }

    return Attack.Result.SUCCESS;
  }

  return result;
};

ClassAttack.reposition = function (x, y) {
  if (typeof x !== "number" || typeof y !== "number") return false;
  if ([x, y].distance > 1) {
    if (Pather.useTeleport()) {
      [x, y].distance > 30 ? Pather.moveTo(x, y) : Pather.teleportTo(x, y, 3);
    } else {
      if ([x, y].distance <= 4 && !CollMap.checkColl(me, { x: x, y: y }, sdk.collision.BlockWalk, 3)) {
        Misc.click(0, 0, x, y);
      } else if (!CollMap.checkColl(me, { x: x, y: y }, sdk.collision.BlockWalk, 3)) {
        Pather.walkTo(x, y);
      } else {
        // don't clear while trying to reposition
        Pather.moveToEx(x, y, { clearSettings: { allowClearing: false } });
      }

      delay(200);
    }
  }

  return true;
};

ClassAttack.getHammerPosition = function (unit) {
  let x, y, positions, baseId = getBaseStat("monstats", unit.classid, "baseid");
  let size = getBaseStat("monstats2", baseId, "sizex");
  const coll = unit.isMonsterObject ? sdk.collision.WallOrRanged : sdk.collision.BlockWalk;
  const canTele = Pather.canTeleport();

  // in case base stat returns something outrageous
  (typeof size !== "number" || size < 1 || size > 3) && (size = 3);

  switch (unit.type) {
  case sdk.unittype.Player:
    ({ x, y } = unit);
    positions = [[x + 2, y], [x + 2, y + 1]];

    break;
  case sdk.unittype.Monster:
    let commonCheck = (unit.isMoving && unit.distance < 10);
    x = commonCheck && getDistance(me, unit.targetx, unit.targety) > 5 ? unit.targetx : unit.x;
    y = commonCheck && getDistance(me, unit.targetx, unit.targety) > 5 ? unit.targety : unit.y;
    positions = [[x + 2, y + 1], [x, y + 3], [x + 2, y - 1], [x - 2, y + 2], [x - 5, y]];
    size === 3 && positions.unshift([x + 2, y + 2]);

    break;
  }

  // If one of the valid positions is a position im at already
  for (let i = 0; i < positions.length; i += 1) {
    let check = { x: positions[i][0], y: positions[i][1] };
    if (canTele && check.distance < 1) return true;
    if (!canTele && (check.distance < 1 && !CollMap.checkColl(unit, check, coll, 1))
      || (check.distance <= 4 && me.getMobCount(6) > 2)) {
      return true;
    }
  }

  for (let i = 0; i < positions.length; i += 1) {
    let check = { x: positions[i][0], y: positions[i][1] };

    if (Attack.validSpot(check.x, check.y) && !CollMap.checkColl(unit, check, coll, 0)) {
      if (this.reposition(check.x, check.y)) return true;
    }
  }

  console.debug("Failed to find a hammer position for " + unit.name + " distance from me: " + unit.distance);

  return false;
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
    && !me.checkForMobs({ range: 12, coll: Coords_1.BlockBits.BlockWall }) && Skill.setSkill(sdk.skills.Cleansing, sdk.skills.hand.Right)) {
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
