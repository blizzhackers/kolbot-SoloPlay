/**
*  @filename    BarbarianAttacks.js
*  @author      theBGuy
*  @desc        Barbarian fixes to improve class attack functionality
*
*/

includeIfNotIncluded("core/Attacks/Barbarian.js");

/**
*  @todo:
*   - use leap to stun in close distance
*   - use leap attack with getIntoPosition, long distance or when targetting summoners
*   - use leap/leap attack with dodge, useful if we can't tele it provides a similar benefit
*/
(function () {
  ClassAttack.warCryTick = 0;

  const howlCheck = function () {
    let levelCheck = (me.getSkill(sdk.skills.Howl, sdk.skills.subindex.SoftPoints) + me.charlvl + 1);
    return getUnits(sdk.unittype.Monster)
      .filter(function (el) {
        return (!!el && el.attackable && el.distance < 6
          && el.scareable && GameData.monsterLevel(el.classid, me.area) < levelCheck && !el.isStunned
          && [
            sdk.states.BattleCry, sdk.states.AmplifyDamage,
            sdk.states.Decrepify, sdk.states.Terror, sdk.states.Taunt
          ].every(state => !el.getState(state))
          && !checkCollision(me, el, Coords_1.Collision.BLOCK_MISSILE));
      }).length > me.maxNearMonsters;
  };

  const battleCryCheck = function () {
    return getUnits(sdk.unittype.Monster).some(function (el) {
      if (el === undefined) return false;
      return (el.attackable && el.distance < 5 && el.curseable
        && [
          sdk.states.BattleCry, sdk.states.AmplifyDamage,
          sdk.states.Decrepify, sdk.states.Terror, sdk.states.Taunt
        ].every(state => !el.getState(state))
        && !checkCollision(me, el, Coords_1.Collision.BLOCK_MISSILE));
    });
  };

  const warCryCheck = function () {
    return getUnits(sdk.unittype.Monster).some(function (el) {
      if (el === undefined) return false;
      return (el.attackable && el.distance < 5 && !(el.isSpecial) && el.curseable
        && ![
          sdk.monsters.Andariel, sdk.monsters.Duriel,
          sdk.monsters.Mephisto, sdk.monsters.Diablo,
          sdk.monsters.Baal, sdk.monsters.Tentacle1,
          sdk.monsters.BaalClone, sdk.monsters.KorlictheProtector,
          sdk.monsters.TalictheDefender, sdk.monsters.MadawctheGuardian
        ].includes(el.classid)
        && (!el.isStunned || getTickCount() - ClassAttack.warCryTick >= 1500)
        && !checkCollision(me, el, Coords_1.Collision.BLOCK_MISSILE));
    });
  };

  ClassAttack.tauntMonsters = function (unit, attackSkill, data) {
    // Don't have skill
    // Only mob in these areas are bosses
    // Can't taunt Main bosses or MinionsofDestruction
    if (!Skill.canUse(sdk.skills.Taunt) || !data) return;
    if ([sdk.areas.DurielsLair, sdk.areas.ArreatSummit, sdk.areas.WorldstoneChamber].includes(me.area)) return;
    if (unit.isPrimeEvil || unit.classid === sdk.monsters.ListerTheTormenter) return;

    let range = (!me.inArea(sdk.areas.ThroneofDestruction) ? 15 : 30);
    let rangedMobsClassIDs = [
      sdk.monsters.Afflicted, sdk.monsters.Tainted,
      sdk.monsters.Misshapen1, sdk.monsters.Disfigured,
      sdk.monsters.Damned1, sdk.monsters.Gloam1,
      sdk.monsters.SwampGhost, sdk.monsters.BurningSoul2,
      sdk.monsters.BlackSoul1, sdk.monsters.GhoulLord1,
      sdk.monsters.NightLord, sdk.monsters.DarkLord1, sdk.monsters.BloodLord1,
      sdk.monsters.Banished, sdk.monsters.SkeletonArcher,
      sdk.monsters.ReturnedArcher1, sdk.monsters.BoneArcher1,
      sdk.monsters.BurningDeadArcher1, sdk.monsters.HorrorArcher1,
      sdk.monsters.Sexton, sdk.monsters.Cantor,
      sdk.monsters.Heirophant1, sdk.monsters.DoomKnight,
      sdk.monsters.VenomLord1, sdk.monsters.Horror1, sdk.monsters.Horror2,
      sdk.monsters.Horror3, sdk.monsters.Horror4,
      sdk.monsters.Horror5, sdk.monsters.Lord1,
      sdk.monsters.Lord2, sdk.monsters.Lord3, sdk.monsters.Lord4,
      sdk.monsters.Lord4, sdk.monsters.Afflicted2,
      sdk.monsters.Tainted, sdk.monsters.Misshapen2,
      sdk.monsters.Disfigured2, sdk.monsters.Damned2, sdk.monsters.DarkShaman2,
      sdk.monsters.DevilkinShaman, sdk.monsters.DarkShaman2, sdk.monsters.DarkLord2
    ];
    let dangerousAndSummoners = [
      sdk.monsters.Dominus2, sdk.monsters.Witch1,
      sdk.monsters.VileWitch2, sdk.monsters.Gloam2,
      sdk.monsters.BlackSoul2, sdk.monsters.BurningSoul1,
      sdk.monsters.FallenShaman, sdk.monsters.CarverShaman2,
      sdk.monsters.DevilkinShaman2, sdk.monsters.DarkShaman1,
      sdk.monsters.HollowOne, sdk.monsters.Guardian1,
      sdk.monsters.Unraveler1, sdk.monsters.Ancient1,
      sdk.monsters.BaalSubjectMummy, sdk.monsters.Council4,
      sdk.monsters.VenomLord2, sdk.monsters.Ancient2,
      sdk.monsters.Ancient3, sdk.monsters.Succubusexp1,
      sdk.monsters.VileTemptress, sdk.monsters.StygianHarlot,
      sdk.monsters.Temptress1, sdk.monsters.Temptress2,
      sdk.monsters.Dominus1, sdk.monsters.VileWitch1,
      sdk.monsters.StygianFury, sdk.monsters.Witch2, sdk.monsters.Witch3
    ];

    if ([sdk.areas.RiverofFlame, sdk.areas.ChaosSanctuary].includes(me.area)) {
      rangedMobsClassIDs.push(sdk.monsters.Strangler1, sdk.monsters.StormCaster1);
    }
    
    let list = getUnits(sdk.unittype.Monster)
      .filter(function (mob) {
        return ([sdk.monsters.spectype.All, sdk.monsters.spectype.Minion].includes(mob.spectype)
          && [sdk.states.BattleCry, sdk.states.Decrepify, sdk.states.Taunt].every(state => !mob.getState(state))
          && ((rangedMobsClassIDs.includes(mob.classid) && mob.distance <= range)
          || (dangerousAndSummoners.includes(mob.classid) && mob.distance <= 30)));
      })
      .sort(Sort.units);

    if (list.length >= 1) {
      for (let i = 0; i < list.length; i++) {
        let currMob = list[i];
        if (battleCryCheck() && Skill.cast(sdk.skills.BattleCry, sdk.skills.hand.Right)) {
          continue;
        }

        if (data.howl.have && !data.warCry.have && data.howl.mana < me.mp && howlCheck()) {
          Skill.cast(sdk.skills.Howl, sdk.skills.hand.Right);
        } else if (data.warCry.have && data.warCry.mana < me.mp && warCryCheck()) {
          Skill.cast(sdk.skills.WarCry, sdk.skills.hand.Right);
        }

        if (!!currMob && !currMob.dead
          && [
            sdk.states.Terror, sdk.states.BattleCry,
            sdk.states.Decrepify, sdk.states.Taunt
          ].every(state => !currMob.getState(state))
          && data.taunt.mana < me.mp && !Coords_1.isBlockedBetween(me, currMob)) {
          me.overhead("Taunting: " + currMob.name + " | classid: " + currMob.classid);
          Skill.cast(sdk.skills.Taunt, sdk.skills.hand.Right, currMob);
        }

        this.doCast(unit, attackSkill, data);
      }
    }
  };

  /**
   * @param {Monster} unit 
   * @param {boolean} preattack 
   * @returns {AttackResult}
   */
  ClassAttack.doAttack = function (unit, preattack = false) {
    if (unit === undefined || !unit || unit.dead) return true;

    let gid = unit.gid;
    let needRepair = [], gold = me.gold;
    me.charlvl >= 5 && (needRepair = me.needRepair());

    if ((Config.MercWatch && me.needMerc()) || needRepair.length > 0) {
      console.log("towncheck");

      if (Town.visitTown(!!needRepair.length)) {
        // lost reference to the mob we were attacking
        if (!unit || !copyUnit(unit).x || !Game.getMonster(-1, -1, gid) || unit.dead) {
          return Attack.Result.SUCCESS;
        }
      }
    }
    
    const index = (unit.isSpecial || unit.isPlayer) ? 1 : 3;
    let attackSkill = Attack.getCustomAttack(unit)
      ? Attack.getCustomAttack(unit)[0]
      : Config.AttackSkill[index];

    if (!Attack.checkResist(unit, attackSkill)) {
      attackSkill = -1;

      if (Config.AttackSkill[index + 1] > -1
        && Skill.canUse(Config.AttackSkill[index + 1])
        && Attack.checkResist(unit, Config.AttackSkill[index + 1])) {
        attackSkill = Config.AttackSkill[index + 1];
      }
    }

    if (me.expansion && index === 1 && !unit.dead) {
      if (CharData.skillData.haveChargedSkill(sdk.skills.SlowMissiles)
        && unit.getEnchant(sdk.enchant.LightningEnchanted)
        && !unit.getState(sdk.states.SlowMissiles) && unit.curseable &&
        (gold > 500000 && !unit.isBoss) && !checkCollision(me, unit, sdk.collision.Ranged)) {
        // Cast slow missiles
        Attack.castCharges(sdk.skills.SlowMissiles, unit);
      }

      if (CharData.skillData.haveChargedSkill(sdk.skills.InnerSight)
      && !unit.getState(sdk.states.InnerSight) && unit.curseable &&
        gold > 500000 && !checkCollision(me, unit, sdk.collision.Ranged)) {
        // Cast slow missiles
        Attack.castCharges(sdk.skills.InnerSight, unit);
      }
    }

    const buildDataObj = (skillId = -1, reqLvl = 1) => ({
      have: false, skill: skillId, range: Infinity, mana: Infinity, timed: false, reqLvl: reqLvl,
      assignValues: function (range) {
        this.have = Skill.canUse(this.skill);
        if (!this.have) return;
        this.range = range || Skill.getRange(this.skill);
        this.mana = Skill.getManaCost(this.skill);
        this.timed = Skill.isTimed(this.skill);
      }
    });
    const currLvl = me.charlvl;
    const data = {
      switchCast: false,
      howl: buildDataObj(sdk.skills.Howl, 1),
      bash: buildDataObj(sdk.skills.Bash, 1),
      taunt: buildDataObj(sdk.skills.Taunt, 6),
      leap: buildDataObj(sdk.skills.Leap, 6),
      doubleSwing: buildDataObj(sdk.skills.DoubleSwing, 6),
      stun: buildDataObj(sdk.skills.Stun, 12),
      battleCry: buildDataObj(sdk.skills.BattleCry, 18),
      concentrate: buildDataObj(sdk.skills.Concentrate, 18),
      leapAttack: buildDataObj(sdk.skills.LeapAttack, 18),
      grimWard: buildDataObj(sdk.skills.GrimWard, 24),
      warCry: buildDataObj(sdk.skills.WarCry, 30),
      whirlwind: buildDataObj(sdk.skills.Whirlwind, 30),
      main: buildDataObj(Config.AttackSkill[index], 1),
      secondary: buildDataObj(Config.AttackSkill[index + 1], 1),
    };
    
    // TODO: calculate damage values for physcial attacks
    Object.keys(data).forEach(k => typeof data[k] === "object" && currLvl >= data[k].reqLvl && data[k].assignValues());
    // console.debug(data);

    // Low mana skill
    if (Skill.getManaCost(attackSkill) > me.mp
      && Config.LowManaSkill[0] > -1
      && Attack.checkResist(unit, Config.LowManaSkill[0])) {
      attackSkill = Config.LowManaSkill[0];
    }

    if ([sdk.skills.DoubleSwing, sdk.skills.DoubleThrow, sdk.skills.Frenzy].includes(attackSkill)
      && !me.dualWielding || !Skill.canUse(attackSkill)) {
      let oneHandSk = [data.bash, data.stun, data.concentrate, data.leapAttack, data.whirlwind]
        .filter((skill) => skill.have && me.mp > skill.mana)
        .sort((a, b) => GameData.physicalAttackDamage(b.skill) - GameData.physicalAttackDamage(a.skill)).first();
      attackSkill = oneHandSk ? oneHandSk.skill : 0;
    }

    if (data.howl.have && attackSkill !== sdk.skills.Whirlwind
      && data.howl.mana < me.mp && howlCheck() && me.hpPercent <= 85) {
      data.grimWard.have ? this.grimWard(6) : Skill.cast(sdk.skills.Howl, sdk.skills.hand.Right);
    }

    data.taunt.have && this.tauntMonsters(unit, attackSkill, data);

    if (!unit.dead && data.battleCry.have && !me.skillDelay) {
      // Unit not already in Battle Cry, decrepify, terror, or taunt state. Don't want to overwrite helpful cureses
      if ([
        sdk.states.BattleCry, sdk.states.Decrepify,
        sdk.states.Terror, sdk.states.Taunt
      ].every(state => !unit.getState(state))) {
        if (unit.distance > data.battleCry.range || checkCollision(me, unit, sdk.collision.Ranged)) {
          if (!Attack.getIntoPosition(unit, data.battleCry.range, sdk.collision.Ranged)) {
            return Attack.Result.FAILED;
          }
        }

        if (unit.distance < data.battleCry.range) {
          data.switchCast
            ? Skill.switchCast(sdk.skills.BattleCry, { hand: sdk.skills.hand.Right, switchBack: !data.warCry.have })
            : Skill.cast(sdk.skills.BattleCry, sdk.skills.hand.Right);
        }
      }
    }

    // TODO: write GameData.killableSummonsByWarCry
    if (data.warCry.have && data.warCry.mana < me.mp && !me.skillDelay && warCryCheck()) {
      data.switchCast
        ? Skill.switchCast(sdk.skills.WarCry, { hand: 0 })
        : Skill.cast(sdk.skills.WarCry, sdk.skills.hand.Right, unit);
      this.warCryTick = getTickCount();
    }

    // Probably going to get rid of preattack
    if (preattack && Config.AttackSkill[0] > 0
      && Config.AttackSkill[0] !== sdk.skills.WarCry && Skill.canUse(Config.AttackSkill[0])
      && Attack.checkResist(unit, Attack.getSkillElement(Config.AttackSkill[0]))
      && (Skill.getManaCost(Config.AttackSkill[0]) < me.mp)
      && (!me.getState(sdk.states.SkillDelay) || !Skill.isTimed(Config.AttackSkill[0]))) {
      if (unit.distance > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, sdk.collision.Ranged)) {
        if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), sdk.collision.Ranged)) {
          return Attack.Result.FAILED;
        }
      }

      Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

      return Attack.Result.SUCCESS;
    }

    if (index === 1) {
      if (data.howl.have && attackSkill !== sdk.skills.Whirlwind && data.howl.mana < me.mp && howlCheck()) {
        data.grimWard.have
          ? this.grimWard(6)
          : !data.warCry.have
            ? Skill.cast(sdk.skills.Howl, Skill.getHand(sdk.skills.Howl))
            : null;
      }
    }

    if (attackSkill === sdk.skills.DoubleThrow
      && (me.getWeaponQuantity() <= 3 || me.getWeaponQuantity(sdk.body.LeftArm) <= 3)
      && data.secondary.have) {
      attackSkill = data.secondary.skill;
    }

    // Telestomp with barb is pointless
    return this.doCast(unit, attackSkill, data);
  };

  ClassAttack.doCast = function (unit, attackSkill, data) {
    // In case of failing to switch back to main weapon slot
    me.weaponswitch === 1 && me.switchWeapons(0);
    // No attack skill
    if (attackSkill < 0 || !data) return Attack.Result.CANTATTACK;

    switch (attackSkill) {
    case sdk.skills.Whirlwind:
      if (unit.distance > Skill.getRange(attackSkill) || checkCollision(me, unit, sdk.collision.BlockWall)) {
        if (!Attack.getIntoPosition(unit, Skill.getRange(attackSkill), sdk.collision.BlockWall, 2)) {
          return Attack.Result.FAILED;
        }
      }

      !unit.dead && Attack.whirlwind(unit);

      return Attack.Result.SUCCESS;
    default:
      if (Skill.getRange(attackSkill) < 4 && !Attack.validSpot(unit.x, unit.y, attackSkill, unit.classid)) {
        return Attack.Result.FAILED;
      }

      if (unit.distance > Skill.getRange(attackSkill) || checkCollision(me, unit, sdk.collision.Ranged)) {
        let walk = (
          Skill.getRange(attackSkill) < 4
          && unit.distance < 10
          && !checkCollision(me, unit, sdk.collision.BlockWall)
        );

        // think this should be re-written in pather with some form of leap pathing similar to teleport
        // leap/leap attack is incredibly useful because we can leap straight to chaos or over mobs/doors/some walls ect
        if (data.leapAttack.have && !checkCollision(me, unit, sdk.collision.BlockWall) && unit.distance > 6) {
          Skill.cast(sdk.skills.LeapAttack, sdk.skills.hand.Right, unit.x, unit.y);
        }

        if (!Attack.getIntoPosition(unit, Skill.getRange(attackSkill), sdk.collision.Ranged, walk)) {
          return Attack.Result.FAILED;
        }
      }

      if (!unit.dead) {
        Skill.cast(attackSkill, Skill.getHand(attackSkill), unit);

        if (!unit.dead && attackSkill === sdk.skills.Berserk && me.dualWielding
          && Skill.canUse(sdk.skills.Frenzy) && unit.distance < 4 && !me.getState(sdk.states.Frenzy)) {
          Skill.cast(sdk.skills.Frenzy, Skill.getHand(sdk.skills.Frenzy), unit);
        }

        if (!unit.dead && attackSkill === sdk.skills.Berserk
          && data.concentrate.have && me.mp > data.concentrate.mana) {
          Skill.cast(sdk.skills.Concentrate, Skill.getHand(sdk.skills.Concentrate), unit);
        }

        // Remove this for now, needs more data calculations to decide if its actually worth using (% dmg, %crushing blow, # of mobs filtering phys immunes unless maybe we do ele dmg from something)
        // if (useWhirl && !unit.dead && (me.getMobCount(6, Coords_1.Collision.BLOCK_MISSILE | Coords_1.BlockBits.BlockWall) >= 3 || ([156, 211, 242, 243, 544, 571].indexOf(unit.classid) > -1) && !me.hell)) {
        // 	this.whirlwind(unit);
        // }
      }

      return Attack.Result.SUCCESS;
    }
  };

  ClassAttack.afterAttack = function (pickit = false) {
    Precast.doPrecast(false);

    let needRepair = me.charlvl < 5 ? [] : me.needRepair();
    
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
    let pick = false;
    let corpseList = [];
    const { x: orgX, y: orgY } = me;

    MainLoop:
    for (let i = 0; i < 3; i++) {
      let corpse = Game.getMonster();

      if (corpse) {
        do {
          if (corpse.dead && getDistance(corpse, orgX, orgY) <= range && this.checkCorpse(corpse)) {
            corpseList.push(copyUnit(corpse));
          }
        } while (corpse.getNext());
      }

      if (corpseList.length > 0) {
        pick = true;

        while (corpseList.length > 0) {
          if (this.checkCloseMonsters(10)) {
            Config.FindItemSwitch && me.switchWeapons(Attack.getPrimarySlot());
            Attack.clearPos(me.x, me.y, 10, false);

            continue MainLoop;
          }

          corpseList.sort(Sort.units);
          const check = corpseList.shift();
          let attempted = false;
          let invalidated = false;
          // get the actual corpse rather than the copied unit
          corpse = Game.getMonster(check.classid, sdk.monsters.mode.Dead, check.gid);

          if (this.checkCorpse(corpse)) {
            if (corpse.distance > 30 || Coords_1.isBlockedBetween(me, corpse)) {
              Pather.moveNearUnit(corpse, 5);
            }

            Config.FindItemSwitch && me.switchWeapons(Attack.getPrimarySlot() ^ 1);
            
            CorpseLoop:
            for (let j = 0; j < 3; j += 1) {
              // sometimes corpse can become invalidated - necro summoned from it or baal wave clearing, ect
              // this still doesn't seem to capture baal wave clearing
              if (j > 0) {
                corpse = Game.getMonster(check.classid, sdk.monsters.mode.Dead, check.gid);
                if (!this.checkCorpse(corpse)) {
                  invalidated = true;
                  break;
                }
              }
              // see if we can find a new position if we failed the first time - sometimes findItem is bugged
              j > 0 && Attack.getIntoPosition(corpse, 5, sdk.collision.BlockWall, Pather.useTeleport(), true);
              // only delay if we actually casted the skill
              if (Skill.cast(sdk.skills.FindItem, sdk.skills.hand.Right, corpse)) {
                let tick = getTickCount();
                attempted = true;

                while (getTickCount() - tick < 1000) {
                  if (corpse.getState(sdk.states.CorpseNoSelect)) {
                    Config.FastPick ? Pickit.fastPick() : Pickit.pickItems(range);

                    break CorpseLoop;
                  }

                  delay(10);
                }
              }
            }
          }

          if (attempted && !invalidated && corpse && !corpse.getState(sdk.states.CorpseNoSelect)) {
            !me.inArea(sdk.areas.ThroneofDestruction) && D2Bot.printToConsole("Failed to hork " + JSON.stringify(corpse) + " at " + getAreaName(me.area));
            console.debug("Failed to hork " + JSON.stringify(corpse) + " at " + getAreaName(me.area));
          }
        }
      }
    }

    Config.FindItemSwitch && me.weaponswitch === 1 && me.switchWeapons(Attack.getPrimarySlot());
    pick && Pickit.pickItems();

    return true;
  };

  /**
   * @param {Monster} unit 
   * @param {number} [range] 
   * @returns {boolean}
   */
  ClassAttack.grimWard = function (unit, range = 10) {
    if (!Skill.canUse(sdk.skills.GrimWard)) return false;
    if (!unit || !unit.dead) return false;

    let corpseList = getUnits(sdk.unittype.Monster)
      .filter(function (mon) {
        return mon.dead && mon.distance < 30 && getDistance(mon, unit) <= range && this.checkCorpse(mon);
      })
      .sort(function (a, b) {
        return getDistance(a, unit) - getDistance(b, unit);
      });

    for (let corpse of corpseList) {
      // corpseList uses copyUnit, so we need to get the actual corpse
      let checkCorpse = Game.getMonster(corpse.classid, -1, corpse.gid);

      if (checkCorpse && this.checkCorpse(checkCorpse)) {
        for (let j = 0; j < 3; j += 1) {
          if (Skill.cast(sdk.skills.GrimWard, sdk.skills.hand.Right, checkCorpse)) {
            if (Misc.poll(function () {
              return checkCorpse.getState(sdk.states.CorpseNoSelect);
            }, 1000)) {
              return true;
            }
          }
        }
      }
    }

    return false;
  };
})();
