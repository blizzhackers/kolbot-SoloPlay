/**
*  @filename    SorceressAttacks.js
*  @author      theBGuy
*  @desc        Sorceress fixes to improve class attack functionality
*
*/

includeIfNotIncluded("core/Attacks/Sorceress.js");

(function () {
  /**
   * Can we slow this monster
   * @param {Monster} unit 
   * @param {boolean} freezeable 
   * @returns {boolean}
   */
  const slowable = function (unit, freezeable = false) {
    return (!!unit && unit.attackable // those that we can attack
      && Attack.checkResist(unit, "cold")
      // those that are not frozen yet and those that can be frozen or not yet chilled
      && (freezeable ? !unit.isFrozen && !unit.getStat(sdk.stats.CannotbeFrozen) : !unit.isChilled)
      && ![sdk.monsters.Andariel, sdk.monsters.Lord5].includes(unit.classid));
  };

  const frostNovaCheck = function () {
    // don't build whole list - since we are just trying if at least one passes the test
    // todo - test to time difference between these two methods
    let mob = Game.getMonster();
    if (mob) {
      do {
        if (mob.distance < 7 && ![sdk.monsters.Andariel].includes(mob.classid) && mob.attackable
          && !mob.isChilled && Attack.checkResist(mob, "cold")
          && !checkCollision(me, mob, Coords_1.Collision.BLOCK_MISSILE)) {
          return true;
        }
      } while (mob.getNext());
    }
    return false;
  };

  /**
   * @param {Monster} unit 
   */
  const battleCryCheck = function (unit, force = false) {
    // specials and dolls for now, should make dolls much less dangerous with the reduction of their damage
    if (Precast.haveCTA > -1 && !unit.dead && (force || unit.isSpecial || unit.isDoll)
      && unit.distance < 5 && !unit.getState(sdk.states.BattleCry) && unit.curseable) {
      console.debug("BATTLECRY");
      Skill.switchCast(sdk.skills.BattleCry, { oSkill: true });
    }
  };

  /**
   * @constructor
   * @param {number} skillId
   * @param {number} reqLvl
   * @param {number} range
   */
  function ClassData (skillId = -1, range = 0) {
    this.have = false;
    this.skill = skillId;
    this.range = range ? range : Skill.getRange(skillId);
    this.mana = Infinity;
    this.dmg = 0;
    this.timed = Skill.isTimed(skillId);
    this.reqLvl = getBaseStat("skills", skillId, "reqlevel");
  }

  /**
   * Initialize data values
   * @param {number} [range] 
   * @returns {void}
   */
  ClassData.prototype.assignValues = function (range) {
    this.have = Skill.canUse(this.skill);
    if (!this.have) return;
    this.range = range || Skill.getRange(this.skill);
    this.mana = Skill.getManaCost(this.skill);
  };

  /**
   * Calculate effective damage for a certain monster unit
   * @param {Monster} unit 
   * @returns {void}
   */
  ClassData.prototype.calcDmg = function (unit) {
    if (!this.have) return;
    this.dmg = GameData.avgSkillDamage(this.skill, unit);
  };

  const AttackData = {
    "Attack": new ClassData(sdk.skills.Attack, 4),
    "FireBolt": new ClassData(sdk.skills.FireBolt),
    "ChargedBolt": new ClassData(sdk.skills.ChargedBolt),
    "IceBolt": new ClassData(sdk.skills.IceBolt),
    "Inferno": new ClassData(sdk.skills.Inferno),
    "Telekinesis": new ClassData(sdk.skills.Telekinesis, 20),
    "StaticField": new ClassData(sdk.skills.StaticField),
    "IceBlast": new ClassData(sdk.skills.IceBlast),
    "FrostNova": new ClassData(sdk.skills.FrostNova),
    "FireBall": new ClassData(sdk.skills.FireBall),
    // Blaze: new ClassData(sdk.skills.Blaze),
    "Lightning": new ClassData(sdk.skills.Lightning),
    "Nova": new ClassData(sdk.skills.Nova),
    "FireWall": new ClassData(sdk.skills.FireWall),
    "ChainLightning": new ClassData(sdk.skills.ChainLightning),
    "GlacialSpike": new ClassData(sdk.skills.GlacialSpike),
    "Meteor": new ClassData(sdk.skills.Meteor),
    // ThunderStorm: new ClassData(sdk.skills.ThunderStorm),
    "Blizzard": new ClassData(sdk.skills.Blizzard),
    "Hydra": new ClassData(sdk.skills.Hydra),
    "FrozenOrb": new ClassData(sdk.skills.FrozenOrb),
  };

  /**
   * The keys never change so this makes it easier to iterate without calling Object.keys each time
   * @type {Array<keyof typeof AttackData>}
   */
  const AttackDataKeys = Object.keys(AttackData);
  
  /**
   * Helper function to re-init AttackData
   * @param {number} currLvl
   * @todo decide when AttackData need to be re-initialized becasue doing it every attack is a waste
   */
  const initAttackData = function (currLvl = me.charlvl) {
    AttackDataKeys.forEach(function (sk) {
      if (currLvl >= AttackData[sk].reqLvl) {
        AttackData[sk].assignValues();
      }
    });
  };

  /**
   * Helper function to init damage value for unit
   * @param {Monster} unit
   */
  const setDamageValues = function (unit) {
    AttackDataKeys.forEach(function (sk) {
      if (AttackData[sk].have) {
        AttackData[sk].calcDmg(unit);
      }
    });
  };

  /**
   * Check if this skill is the most damaging
   * @param {ClassData} skill 
   * @returns {boolean}
   */
  const isHighestDmg = function (skill) {
    for (let key of AttackDataKeys) {
      if (AttackData[key].dmg > skill.dmg) {
        return false;
      }
    }
    return true;
  };

  /**
   * Used to handle times when there isn't a valid skill we can use, to prevent throwing error
   */
  const DummyData = new ClassData(-1, -1);
  /**
   * Makes checking cases with it easier
   */
  const TELEPORT = new ClassData(sdk.skills.Teleport, 40);

  /**
   * @param {Monster} unit 
   * @param {boolean} force 
   * @todo keep track of when, what, and who we last casted on to prevent spamming charged skills in a short period of time
   */
  ClassAttack.switchCurse = function (unit, force) {
    if (!CharData.skillData.haveChargedSkill([sdk.skills.SlowMissiles, sdk.skills.LowerResist, sdk.skills.Weaken])) {
      return;
    }
    if (unit.curseable) {
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

  /**
   * @param {Monster} unit
   * @param {boolean} [checkDelay]
   * @returns {dataObj}
   */
  ClassAttack.decideDistanceSkill = function (unit, checkDelay = false) {
    const currLvl = me.charlvl;
    let selected = AttackDataKeys
      .filter(function (sk) {
        if (currLvl < AttackData[sk].reqLvl || AttackData[sk].range < 20) return false;
        AttackData[sk].assignValues();
        if (!AttackData[sk].have) return false;
        AttackData[sk].calcDmg(unit);
        /**
         * For now, no skill delay check.
         * Things to consider:
         * 1) If the skill we choose is timed and we are in skillDelay, how long is left to wait?
         * 2) If not long then what is the damage difference between the skill we choose and the runner up non-timed skill
         * 3) If the non-timed skill will do enough damage to kill this monster then use it, or if we have more than 1-2 seconds to wait
         * and we don't need to move to cast the non-timed skill.
         * 4) Anything else?
         */
        return AttackData[sk].dmg > 0 && (!checkDelay || (!AttackData[sk].timed || !me.skillDelay));
      })
      .sort(function (a, b) {
        return AttackData[b].dmg - AttackData[a].dmg;
      })
      .first();
    return typeof AttackData[selected] === "object"
      ? AttackData[selected]
      : DummyData;
  };

  /**
   * @override
   * @param {Monster} unit 
   * @param {boolean} recheckSkill 
   * @param {boolean} once 
   * @returns {AttackResult}
   */
  ClassAttack.doAttack = function (unit, recheckSkill = false, once = false) {
    if (Developer.debugging.skills) {
      console.log(sdk.colors.Green + "Test Start-----------------------------------------//");
    }
    // unit became invalidated
    if (!unit || !unit.attackable) return Attack.Result.SUCCESS;
  
    const currLvl = me.charlvl;
    const index = (unit.isSpecial || unit.isPlayer) ? 1 : 3;
    let gid = unit.gid;
    let tick = getTickCount();
    let gold = me.gold;

    if (Config.MercWatch && me.needMerc() && gold > me.mercrevivecost * 3) {
      console.debug("mercwatch");

      if (Town.visitTown()) {
        // lost reference to the mob we were attacking
        if (!unit || !copyUnit(unit).x || !Game.getMonster(-1, -1, gid) || unit.dead) {
          console.debug("Lost reference to unit");
          return Attack.Result.SUCCESS;
        }
        gold = me.gold; // reset value after town
      }
    }

    // maybe every couple attacks or just the first one?
    Precast.doPrecast();

    // Handle Charge skill casting
    if (index === 1 && me.expansion && !unit.dead) {
      ClassAttack.switchCurse(unit);
    }

    initAttackData(currLvl);
    TELEPORT.assignValues();

    if (AttackData.FrostNova.have) {
      if (me.mp > AttackData.FrostNova.mana) {
        frostNovaCheck() && Skill.cast(sdk.skills.FrostNova, sdk.skills.hand.Right);
        let ticktwo = getTickCount();
        // if the nova cause the death of any monsters around us, its worth it
        if (GameData.calculateKillableFallensByFrostNova() > 0) {
          if (Developer.debugging.skills) {
            console.log(
              "took " + ((getTickCount() - ticktwo) / 1000)
              + " seconds to check calculateKillableFallensByFrostNova. frost nova will kill fallens"
            );
          }
          Skill.cast(sdk.skills.FrostNova, sdk.skills.hand.Right);
        }
      }
    }

    if (AttackData.GlacialSpike.have) {
      if (me.mp > AttackData.GlacialSpike.mana * 2) {
        let shouldSpike = unit && unit.distance < 10 &&
        getUnits(sdk.unittype.Monster).filter(function (el) {
          return getDistance(el, unit) < 4 && slowable(el, true);
        }).length > 1;
        if (shouldSpike && !Coords_1.isBlockedBetween(me, unit)) {
          Developer.debugging.skills && console.log("SPIKE");
          Skill.cast(sdk.skills.GlacialSpike, sdk.skills.hand.Right, unit);
        }
      }
    }

    // We lost track of the mob or killed it
    if (unit === undefined || !unit || !unit.attackable) return Attack.Result.SUCCESS;

    // Set damage values
    // redo gamedata to be more efficent
    setDamageValues(unit);
    
    // log damage values
    // if (Developer.debugging.skills) {
    // 	Object.keys(data).forEach(k => typeof data[k] === "object" && console.log(getSkillById(data[k].skill) + " : " + data[k].dmg));
    // }

    let rebuild = false;

    // If we have enough mana for Static and it will do more damage than our other skills then duh use it
    // should this return afterwards since the calulations will now be different?
    if (AttackData.StaticField.have && (AttackData.StaticField.mana * 3) < me.mp) {
      let closeMobCheck = getUnits(sdk.unittype.Monster)
        .filter(function (unit) {
          return !!unit && unit.attackable && unit.distance < AttackData.StaticField.range;
        })
        .find(function (unit) {
          return Attack.checkResist(unit, "lightning") && unit.hpPercent > Config.CastStatic;
        });
      if (!!closeMobCheck && isHighestDmg(AttackData.StaticField) && !Coords_1.isBlockedBetween(me, closeMobCheck)) {
        Developer.debugging.skills && console.log("STATIC");
        // check if we should use battle cry from cta if we have it
        battleCryCheck(closeMobCheck);
        [sdk.skills.StaticField, sdk.skills.StaticField]
          .every(skill => Skill.cast(skill, sdk.skills.hand.Right, closeMobCheck));
        rebuild = true;
      }
    }

    // We lost track of the mob or killed it (recheck after using static)
    if (unit === undefined || !unit || !unit.attackable) return Attack.Result.SUCCESS;

    rebuild && setDamageValues(unit);
  
    /**
     * @todo static field is a good skill but if we are currently out of range, check how dangerous it is to tele to spot before choosing that as our skill
     */
    let sortedList = AttackDataKeys
      .filter(function (k) {
        return (AttackData[k].have && me.mp > AttackData[k].mana
          && (!AttackData[k].timed || !me.skillDelay)
          && (AttackData[k].skill !== sdk.skills.StaticField || !recheckSkill));
      })
      .sort(function (a, b) {
        return AttackData[b].dmg - AttackData[a].dmg;
      });
    if (!sortedList.length) return Attack.Result.FAILED;

    // A bit ugly but handle static and charged bolt here
    let skillCheck = (
      (AttackData[sortedList[0]].skill === sdk.skills.StaticField
      && unit.distance > AttackData.StaticField.range && me.inDanger(unit, 15))
      || (AttackData[sortedList[0]].skill === sdk.skills.ChargedBolt && recheckSkill)
    )
      ? sortedList.at(1)
      : sortedList.at(0);
    
    /** @type {ClassData} */
    let selectedSkill = typeof AttackData[skillCheck] === "object"
      ? AttackData[skillCheck]
      : DummyData;

    switch (selectedSkill.skill) {
    case sdk.skills.ChargedBolt:
      if (selectedSkill.skill === sdk.skills.ChargedBolt && AttackData.IceBolt.have && slowable(unit)) {
        selectedSkill = AttackData.IceBolt;
      }

      break;
    case sdk.skills.Telekinesis:
      // maybe check if we are able to telestomp?
      if (!me.normal) {
        selectedSkill = DummyData;
      }

      break;
    case sdk.skills.Attack:
      if (!me.normal || (me.charlvl > 6
        && !me.checkForMobs({ range: 10, coll: (sdk.collision.BlockWall | sdk.collision.ClosedDoor) }))) {
        selectedSkill = DummyData;
      }
    }

    /**
     * @param {Monster} unit 
     * @returns {AttackResult}
     */
    const switchBowAttack = function (unit) {
      if (Attack.getIntoPosition(unit, 20, sdk.collision.Ranged)) {
        try {
          const checkForShamans = unit.isFallen && !me.inArea(sdk.areas.BloodMoor);
          for (let i = 0; i < 5 && unit.attackable; i++) {
            if (checkForShamans && !once) {
              // before we waste time let's see if there is a shaman we should kill
              const shaman = getUnits(sdk.unittype.Monster)
                .filter(function (mon) {
                  return mon.distance < 20 && mon.isShaman && mon.attackable;
                })
                .sort(function (a, b) {
                  return a.distance - b.distance;
                })
                .first();
              if (shaman) return ClassAttack.doAttack(shaman, null, true);
            }
            if (!Attack.useBowOnSwitch(unit, sdk.skills.Attack, i === 5)) return Attack.Result.FAILED;
            if (unit.distance < 8 || me.inDanger()) {
              if (once) return Attack.Result.FAILED;
              let closeMob = getUnits(sdk.unittype.Monster)
                .filter(function (mon) {
                  return mon.distance < 10 && mon.attackable && mon.gid !== gid;
                })
                .sort(Attack.walkingSortMonsters)
                .first();
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
      && ([-1, sdk.skills.Attack].includes(selectedSkill.skill)
      || selectedSkill.mana > me.mp
      || (selectedSkill.mana * 3 > me.mp
        && [sdk.skills.FireBolt, sdk.skills.ChargedBolt].includes(selectedSkill.skill)))) {
      if (switchBowAttack(unit) === Attack.Result.SUCCESS) return Attack.Result.SUCCESS;
    }
    
    if (selectedSkill === sdk.skills.Attack && me.inDanger(unit, 10)) {
      // try to stay safer for now, probably should see if there are any easy targets we can pick off
      return Attack.Result.CANTATTACK;
    }

    let result = ClassAttack.doCast(unit, selectedSkill);

    switch (result) {
    case Attack.Result.FAILED:
      if (Developer.debugging.skills) {
        console.log(
          sdk.colors.Red + "Fail Test End----Time elasped["
          + ((getTickCount() - tick) / 1000) + " seconds]----------------------//"
        );
      }
      
      return Attack.Result.FAILED;
    case Attack.Result.SUCCESS:
      if (Developer.debugging.skills) {
        console.log(
          sdk.colors.Red + "Sucess Test End----Time elasped["
          + ((getTickCount() - tick) / 1000) + " seconds]----------------------//"
        );
      }
      
      return Attack.Result.SUCCESS;
    case Attack.Result.CANTATTACK: // Try to telestomp
      if (Pather.canTeleport() && Attack.checkResist(unit, "physical") && !!me.getMerc()
        && Attack.validSpot(unit.x, unit.y)
        && (Config.TeleStomp || (!me.hell && (unit.getMobCount(10) < me.maxNearMonsters && unit.isSpecial)))) {
        let merc = me.getMerc();
        let haveTK = Skill.canUse(sdk.skills.Telekinesis);
        let mercRevive = 0;

        while (unit.attackable) {
          if (!unit) return Attack.Result.SUCCESS;

          if (me.needMerc()) {
            if (Config.MercWatch && mercRevive < 3) {
              Town.visitTown() && (mercRevive++);
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

          if (Attack.checkResist(unit, "lightning") && AttackData.StaticField.have
            && unit.hpPercent > Config.CastStatic) {
            Skill.cast(sdk.skills.StaticField, sdk.skills.hand.Right);
          }

          let closeMob = Attack.getNearestMonster({ skipGid: gid });
          !!closeMob
            ? this.doCast(closeMob, selectedSkill)
            : haveTK && Packet.telekinesis(unit);
        }

        return Attack.Result.SUCCESS;
      }

      return Attack.Result.CANTATTACK;
    default:
      return result;
    }
  };

  /**
   * @override
   * @param {Monster} unit 
   * @param {ClassData} choosenSkill 
   * @returns {AttackResult}
   */
  ClassAttack.doCast = function (unit, choosenSkill) {
    let noMana = false;
    let { skill, range, mana, timed } = choosenSkill;
    // unit became invalidated
    if (!unit || !unit.attackable) return Attack.Result.SUCCESS;
    if (!!skill && me.mp < mana) {
      return Attack.Result.NEEDMANA;
    }
    // No valid skills can be found
    if (skill < 0) return Attack.Result.CANTATTACK;
    // print damage values
    if (Developer.debugging.skills && choosenSkill.have) {
      console.log(sdk.colors.Yellow + "(Selected Main :: " + getSkillById(skill) + ") DMG: " + choosenSkill.dmg);
    }

    if (![sdk.skills.FrostNova, sdk.skills.Nova, sdk.skills.StaticField].includes(skill)) {
      // need like a potential danger check, sometimes while me might not be immeadiate danger because there aren't a whole
      // lot of monsters around, we can suddenly be in danger if a ranged monsters hits us or if one of the monsters near us
      // does a lot of damage quickly
      if (TELEPORT.have && me.mp > TELEPORT.mana + mana && me.inDanger()) {
        //console.log("FINDING NEW SPOT");
        Attack.getIntoPosition(unit, range, 0
                | Coords_1.BlockBits.LineOfSight
                | Coords_1.BlockBits.Ranged
                | Coords_1.BlockBits.Casting
                | Coords_1.BlockBits.ClosedDoor
                | Coords_1.BlockBits.Objects, false, true);
      } else if (me.inDanger()) {
        Attack.getIntoPosition(unit, range + 1, Coords_1.Collision.BLOCK_MISSILE, true);
      } else if (unit.distance < 3 && range > 4) {
        Attack.getIntoPosition(unit, range, Coords_1.Collision.BLOCK_MISSILE, true);
      }
    }

    if (!me.skillDelay || !timed) {
      let ranged = range > 4;

      if (skill === sdk.skills.ChargedBolt
        && !unit.hasEnchant(sdk.enchant.ManaBurn, sdk.enchant.ColdEnchanted)) {
        unit.getMobCount(6, Coords_1.Collision.BLOCK_MISSILE) < 3 && (range = 7);
      }

      if (skill === sdk.skills.Attack) {
        if (me.hpPercent < 50 && me.mode !== sdk.player.mode.GettingHit && !me.checkForMobs({ range: 12 })) {
          console.log("Low health but safe right now, going to delay a bit");
          let tick = getTickCount();
          const howLongToDelay = Config.AttackSkill
            .some(sk => sk > 1 && Skill.canUse(sk)) ? Time.seconds(2) : Time.seconds(1);

          while (getTickCount() - tick < howLongToDelay) {
            if (me.mode === sdk.player.mode.GettingHit) {
              console.debug("no longer safe, we are being attacked");
              break;
            } else if (me.hpPercent >= 55) {
              return 3;
            }

            delay(40);
          }
        }
      }

      if (range < 4 && !Attack.validSpot(unit.x, unit.y)) {
        return Attack.Result.FAILED;
      }

      // Only delay if there are no mobs in our immediate area
      if (mana > me.mp && !me.checkForMobs({ range: 12 })) {
        let tick = getTickCount();

        while (getTickCount() - tick < 750) {
          if (mana < me.mp) {
            break;
          } else if (me.mode === sdk.player.mode.GettingHit) {
            console.debug("no longer safe, we are being attacked");
            return Attack.Result.NEEDMANA;
          }

          delay(25);
        }
      }

      // try to prevent missing when the monster is moving by getting just a bit closer
      if ([sdk.skills.FireBolt, sdk.skills.IceBolt].includes(skill)) {
        range = 12;
      }
      
      if (unit.distance > range || Coords_1.isBlockedBetween(me, unit)) {
        // Allow short-distance walking for melee skills
        let walk = (
          (range < 4 || (skill === sdk.skills.ChargedBolt && range === 7))
          && unit.distance < 10 && !checkCollision(me, unit, sdk.collision.BlockWalk)
        );
      
        if (ranged) {
          if (!Attack.getIntoPosition(unit, range, Coords_1.Collision.BLOCK_MISSILE, walk)) {
            return Attack.Result.FAILED;
          }
        } else if (!Attack.getIntoPosition(unit, range, Coords_1.BlockBits.Ranged, walk)) {
          return Attack.Result.FAILED;
        }
      }

      if (!unit.dead && !checkCollision(me, unit, Coords_1.BlockBits.Ranged)) {
        if (skill === sdk.skills.ChargedBolt) {
          let preHealth = unit.hp;
          let cRetry = 0;
          unit.distance <= 1 && Attack.getIntoPosition(unit, range, Coords_1.Collision.BLOCK_MISSILE, true);
          for (let i = 0; i < 3; i++) {
            !unit.dead && Skill.cast(skill, Skill.getHand(skill), unit.x, unit.y);
            if (!Misc.poll(() => unit.dead || unit.hp < preHealth, 300, 50)) {
              cRetry++;
              // we still might of missed so pick another coord
              if (!Attack.getIntoPosition(unit, (range - cRetry), Coords_1.Collision.BLOCK_MISSILE, true)) {
                return Attack.Result.FAILED;
              }
              !unit.dead && Skill.cast(skill, Skill.getHand(skill), unit.x, unit.y);
            } else {
              break;
            }
          }
        } else if (skill === sdk.skills.StaticField) {
          let preHealth = unit.hp;
          let sRetry = 0;
          for (let i = 0; i < 4; i++) {
            if (!unit.dead) {
              // if we are already in close then it might be worth it to use battle cry if we have it
              battleCryCheck(unit);
              // if we are in danger then don't cast and move - this is causing too much rubberbanding
              // if (!unit.isPrimeEvil
              //   && (unit.distance <= 3 && !unit.isStunned && !unit.isFrozen) || me.inDanger()) {
              //   // don't cast, just run
              //   Attack.deploy(unit, 25, 5, 9);
              //   return Attack.Result.FAILED;
              // }
              Skill.cast(skill, Skill.getHand(skill), unit);
              if (!Misc.poll(() => unit.dead || unit.hp < preHealth, 200, 50)) {
                sRetry++;
                // we still might of missed so pick another coord
                if (!Attack.getIntoPosition(unit, (range - sRetry), Coords_1.Collision.BLOCK_MISSILE, true)) {
                  return Attack.Result.FAILED;
                }
                !unit.dead && Skill.cast(skill, Skill.getHand(skill), unit);
              }

              if (AttackData.FrostNova.have && me.mp > AttackData.FrostNova.mana) {
                frostNovaCheck() && Skill.cast(sdk.skills.FrostNova, sdk.skills.hand.Right);
              }

              if (mana > me.mp || unit.hpPercent < Config.CastStatic) {
                break;
              }
              if (me.inDanger()) {
                Attack.deploy(unit, range, 5, 9);
                break;
              }
            } else {
              break;
            }
          }
        } else {
          let targetPoint = GameData.targetPointForSkill(skill, unit);

          if (unit.attackable) {
            if (targetPoint) {
              Skill.cast(skill, Skill.getHand(skill), targetPoint.x, targetPoint.y);
            } else {
              Skill.cast(skill, Skill.getHand(skill), unit);
            }

            if ([sdk.skills.FireBolt, sdk.skills.IceBolt].includes(skill)) {
              let preHealth = unit.hp;
              let missileDelay = GameData.timeTillMissleImpact(skill, unit);
              if (missileDelay > 0) {
                Misc.poll(function () {
                  return unit.dead || unit.hp < preHealth;
                }, missileDelay, 50);
              }
              delay(50);
            }
          }
        }
      }

      return Attack.Result.SUCCESS;
    } else {
      console.debug(choosenSkill);
      noMana = true;
    }

    for (let i = 0; i < 25; i++) {
      if (!me.skillDelay) {
        break;
      }
      if (i % 5 === 0) {
        if (me.inDanger()) {
          break;
        }
      }

      delay(40);
    }

    return noMana ? Attack.Result.NEEDMANA : Attack.Result.SUCCESS;
  };
})();
