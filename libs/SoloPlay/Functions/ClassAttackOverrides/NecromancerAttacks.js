/**
*  @filename    NecromancerAttacks.js
*  @author      theBGuy
*  @desc        Necromancer fixes to improve class attack functionality
*
*/

includeIfNotIncluded("core/Attacks/Necromancer.js");

(function () {
  const curseIndex = (function () {
    /**
     * @constructor
     * @param {number} skillId 
     * @param {number} state 
     * @param {number} priority 
     * @param {function(): boolean} useIf 
     */
    function Curse (skillId, priority, useIf) {
      this.name = getSkillById(skillId);
      this.skillId = skillId;
      this.state = Skill.getState(skillId);
      this.priority = priority;
      this.useIf = useIf;
    }

    Curse.prototype.have = function () {
      return Skill.canUse(this.skillId);
    };

    Curse.prototype.manaCost = function () {
      return Skill.getManaCost(this.skillId);
    };

    return [
      new Curse(sdk.skills.AmplifyDamage, 2,
        /** @param {Monster} unit */
        function (unit) {
          if (!unit || unit.getState(sdk.states.Decrepify)) return false;
          return !Attack.checkResist(unit, "magic") && !Attack.checkResist(unit, "physical");
        }
      ),
      new Curse(sdk.skills.DimVision, 1,
        /** @param {Monster} unit */
        function (unit) {
          if (!unit || unit.isSpecial) return false;
          if ([
            sdk.monsters.OblivionKnight1,
            sdk.monsters.OblivionKnight2,
            sdk.monsters.OblivionKnight3
          ].includes(unit.classid)) {
            return false;
          }
          return unit.distance > 15;
        }
      ),
      new Curse(sdk.skills.Weaken, 3,
        /** @param {Monster} unit */
        function (unit) {
          return !unit.getState(sdk.states.Decrepify)
            && !unit.getState(sdk.states.AmplifyDamage);
        }
      ),
      new Curse(sdk.skills.IronMaiden, 1,
        function () {
          return me.inArea(sdk.areas.DurielsLair) && me.normal;
        }
      ),
      new Curse(sdk.skills.Terror, 1,
        /**
         * @this Curse
         * @param {Monster} unit
         */
        function (unit) {
          if (!unit || !unit.scareable) return false;
          let _coll = (sdk.collision.BlockMissile | sdk.collision.BlockWall | sdk.collision.Casting);
          if (me.getMobCount(6, _coll, 0, true) < 3) return false;
          return this.manaCost() < me.mp && me.hpPercent < 75;
        }
      ),
      new Curse(sdk.skills.Confuse, 2,
        /** @param {Monster} unit */
        function (unit) {
          return unit.scareable && unit.distance > 8;
        }
      ),
      new Curse(sdk.skills.Attract, 1,
        /** @param {Monster} unit */
        function (unit) {
          return me.inArea(sdk.areas.ThroneofDestruction)
            && unit.distance > 8 && unit.scareable;
        }
      ),
      new Curse(sdk.skills.Decrepify, 1,
        function () {
          return true;
        }
      ),
      new Curse(sdk.skills.LowerResist, 1,
        /** @param {Monster} unit */
        function (unit) {
          if (SetUp.currentBuild !== "Poison") return false;
          return Attack.checkResist(unit, "poison");
        }
      )
    ];
  })();

  /** @param {Monster} unit */
  const doCurse = function (unit) {
    if (unit === undefined || unit.dead || !unit.curseable) return false;

    let curse = (curseIndex
      .filter(function (c) {
        return c.have() && c.useIf(unit);
      })
      .sort(function (a, b) {
        return a.priority - b.priority;
      })
      .find(c => c.manaCost() < me.mp) || false);

    if (curse && !unit.getState(curse.state)) {
      if (!checkCollision(me, unit, sdk.collision.Ranged)) {
        me.overhead("Cursing " + unit.name + " with " + curse.name);
        return Skill.cast(curse.skillId, sdk.skills.hand.Right, unit);
      } else {
        me.overhead(unit.name + " is blocked, skipping attempt to curse");
        let [timed, untimed] = unit.isSpecial ? [1, 2] : [3, 5];
        ClassAttack.doCast(unit, Config.AttackSkill[timed], Config.AttackSkill[untimed]);
      }
    }

    return false;
  };

  ClassAttack.bpTick = 0;

  /** 
   * @todo
   *   - bonemancer specific check for using bonespear vs bone spirit
   */

  // TODO: clean this up
  ClassAttack.doAttack = function (unit, preattack, once) {
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
    let gold = me.gold;
    const index = (unit.isSpecial || unit.isPlayer) ? 1 : 3;
    const useTerror = Skill.canUse(sdk.skills.Terror);
    const useBP = Skill.canUse(sdk.skills.BonePrison);
    const bpAllowedAreas = [
      sdk.areas.CatacombsLvl4, sdk.areas.Tristram, sdk.areas.MooMooFarm,
      sdk.areas.RockyWaste, sdk.areas.DryHills, sdk.areas.FarOasis,
      sdk.areas.LostCity, sdk.areas.ValleyofSnakes, sdk.areas.DurielsLair,
      sdk.areas.SpiderForest, sdk.areas.GreatMarsh, sdk.areas.FlayerJungle,
      sdk.areas.LowerKurast, sdk.areas.KurastBazaar, sdk.areas.UpperKurast,
      sdk.areas.KurastCauseway, sdk.areas.DuranceofHateLvl3, sdk.areas.OuterSteppes,
      sdk.areas.PlainsofDespair, sdk.areas.CityoftheDamned, sdk.areas.ChaosSanctuary,
      sdk.areas.BloodyFoothills, sdk.areas.FrigidHighlands, sdk.areas.ArreatSummit,
      sdk.areas.NihlathaksTemple, sdk.areas.WorldstoneLvl1, sdk.areas.WorldstoneLvl2,
      sdk.areas.WorldstoneLvl3, sdk.areas.ThroneofDestruction
    ];

    // Bone prison
    if (useBP && unit.distance > ([sdk.areas.DurielsLair, sdk.areas.ArreatSummit].includes(me.area) ? 6 : 10)
      && bpAllowedAreas.includes(me.area)
      && (index === 1 || [sdk.monsters.ListerTheTormenter, sdk.monsters.HellBovine].includes(unit.classid))
      && !checkCollision(me, unit, sdk.collision.Ranged)
      && Skill.getManaCost(sdk.skills.BonePrison) * 2 < me.mp
      && getTickCount() - this.bpTick > 2000) {
      if (Skill.cast(sdk.skills.BonePrison, sdk.skills.hand.Right, unit)) {
        this.bpTick = getTickCount();
      }
    }

    // write terrorCheck function, need to take into account if monsters are even scareable
    let _coll = (sdk.collision.BlockMissile | sdk.collision.BlockWall | sdk.collision.Casting);
    if (useTerror && me.getMobCount(6, _coll, 0, true) >= 3
      && Skill.getManaCost(sdk.skills.Terror) < me.mp && me.hpPercent < 75) {
      Skill.cast(sdk.skills.Terror, sdk.skills.hand.Right);
    }

    doCurse(unit);

    if (me.expansion && index === 1 && !unit.dead) {
      if (CharData.skillData.haveChargedSkill(sdk.skills.SlowMissiles)
        && unit.getEnchant(sdk.enchant.LightningEnchanted)
        && !unit.getState(sdk.states.SlowMissiles)
        && unit.curseable && (gold > 500000 && !unit.isBoss)
        && !checkCollision(me, unit, sdk.collision.Ranged)) {
        // Cast slow missiles
        Attack.castCharges(sdk.skills.SlowMissiles, unit);
      }
    }

    // maybe this should return an object with basic skill info besides the skillId. e.g timed, mana, range, and hand
    const skills = Attack.decideSkill(unit);

    /** @param {Monster} unit */
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
                }).first();
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
      && ([-1, sdk.skills.Attack].includes(skills.timed)
      || Skill.getManaCost(skills.timed) > me.mp
      || (Skill.getManaCost(skills.timed) * 3 > me.mp && [sdk.skills.Teeth].includes(skills.timed)))) {
      if (switchBowAttack(unit) === Attack.Result.SUCCESS) return Attack.Result.SUCCESS;
    }

    if (me.normal && gold < 5000
      && (skills.timed === -1 || Skill.getManaCost(skills.timed) > me.mp)) {
      if (skills.timed !== sdk.skills.Teeth
        && Skill.canUse(sdk.skills.Teeth)
        && Skill.getManaCost(sdk.skills.Teeth) < me.mp) {
        skills.timed = sdk.skills.Teeth;
      } else if (Skill.canUse(sdk.skills.PoisonDagger) && Skill.getManaCost(sdk.skills.PoisonDagger) < me.mp) {
        skills.timed = sdk.skills.PoisonDagger;
      } else if (me.getMobCount(6, Coords_1.Collision.BLOCK_MISSILE | Coords_1.BlockBits.BlockWall) >= 1) {
        // I have no mana and there are mobs around me, just attack
        skills.timed = sdk.skills.Attack;
      }
    }
    const result = this.doCast(unit, skills.timed, skills.untimed);

    if (result === Attack.Result.SUCCESS) {
      Config.ActiveSummon && this.raiseArmy();
      this.explodeCorpses(unit);
    } else if (result === Attack.Result.CANTATTACK && Attack.canTeleStomp(unit)) {
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

        Config.ActiveSummon && this.raiseArmy();
        this.explodeCorpses(unit);
        doCurse(unit);
        let closeMob = Attack.getNearestMonster({ skipGid: gid });
        if (!!closeMob) {
          let findSkill = Attack.decideSkill(closeMob);
          (this.doCast(closeMob, findSkill.timed, findSkill.untimed) === Attack.Result.SUCCESS)
          || (this.canCurse(unit, sdk.skills.Terror) && Skill.cast(sdk.skills.Terror, sdk.skills.hand.Right, unit));
        }
      }

      return Attack.Result.SUCCESS;
    }

    return result;
  };

  /**
   * @param {Monster} unit 
   * @param {number} timedSkill 
   * @param {number} untimedSkill 
   * @returns {AttackResult}
   */
  ClassAttack.doCast = function (unit, timedSkill, untimedSkill) {
    // No valid skills can be found
    if (timedSkill < 0 && untimedSkill < 0) {
      return Attack.Result.CANTATTACK;
    }
    // Check for bodies to exploit for CorpseExplosion before committing to an attack for non-summoner type necros
    if (Config.Skeletons + Config.SkeletonMages + Config.Revives === 0) {
      this.checkCorpseNearMonster(unit) && this.explodeCorpses(unit);
    }

    if (Skill.canUse(sdk.skills.BoneArmor) && !me.getState(sdk.states.BoneArmor)) {
      // make sure we keep this up
      Skill.cast(sdk.skills.BoneArmor, sdk.skills.hand.Right);
    }

    let walk;
    let lowMana = true;

    if (timedSkill > -1
      && (!me.getState(sdk.states.SkillDelay) || !Skill.isTimed(timedSkill))
      && me.mp > Skill.getManaCost(timedSkill)) {
      lowMana = false;
      let timedSkillRange = Skill.getRange(timedSkill);

      switch (timedSkill) {
      case sdk.skills.PoisonNova:
        if (!this.novaTick || getTickCount() - this.novaTick > Config.PoisonNovaDelay * 1000) {
          if (unit.distance > timedSkillRange || checkCollision(me, unit, sdk.collision.Ranged)) {
            if (!Attack.getIntoPosition(unit, timedSkillRange, sdk.collision.Ranged)) {
              return Attack.Result.FAILED;
            }
          }

          if (!unit.dead && Skill.cast(timedSkill, Skill.getHand(timedSkill), unit)) {
            this.novaTick = getTickCount();
          }
        }

        break;
      case sdk.skills.Summoner: // Pure Summoner
        if (unit.distance > timedSkillRange || checkCollision(me, unit, sdk.collision.Ranged)) {
          if (!Attack.getIntoPosition(unit, timedSkillRange, sdk.collision.Ranged)) {
            return Attack.Result.FAILED;
          }
        }

        delay(300);

        break;
      default:
        if (timedSkillRange < 4 && !Attack.validSpot(unit.x, unit.y)) {
          return Attack.Result.FAILED;
        }
        if (timedSkill === sdk.skills.Teeth) {
          let _coll = (sdk.collision.BlockMissile | sdk.collision.BlockWall | sdk.collision.Casting);
          timedSkillRange = me.getMobCount(6, _coll) <= 3 ? 8 : timedSkillRange;
        }

        if (unit.distance > timedSkillRange || checkCollision(me, unit, sdk.collision.Ranged)) {
          // Allow short-distance walking for melee skills
          walk = (
            timedSkillRange < 4
            && unit.distance < 10
            && !checkCollision(me, unit, sdk.collision.BlockWall)
          );
          if (!Attack.getIntoPosition(unit, timedSkillRange, sdk.collision.Ranged, walk)) {
            return Attack.Result.FAILED;
          }
        }

        if (!unit.dead) {
          // Try to find better spot
          if (unit.distance < 4 && timedSkillRange > 6) {
            Attack.getIntoPosition(unit, timedSkillRange, sdk.collision.BlockMissile, true);
          }

          Skill.cast(timedSkill, Skill.getHand(timedSkill), unit);
        }

        break;
      }
    }

    if (untimedSkill > -1 && me.mp > Skill.getManaCost(untimedSkill)) {
      lowMana = false;
      let untimedSkillRange = Skill.getRange(untimedSkill);

      if (untimedSkillRange < 4 && !Attack.validSpot(unit.x, unit.y)) {
        return Attack.Result.FAILED;
      }
      if (unit.distance > untimedSkillRange || checkCollision(me, unit, sdk.collision.Ranged)) {
        // Allow short-distance walking for melee skills
        walk = (
          untimedSkillRange < 4
          && unit.distance < 10
          && !checkCollision(me, unit, sdk.collision.BlockWall)
        );

        if (!Attack.getIntoPosition(unit, untimedSkillRange, sdk.collision.Ranged, walk)) {
          return Attack.Result.FAILED;
        }
      }

      !unit.dead && Skill.cast(untimedSkill, Skill.getHand(untimedSkill), unit);

      return Attack.Result.SUCCESS;
    }

    Misc.poll(() => !me.skillDelay, 1000, 40);

    // Delay for Poison Nova
    while (this.novaTick && getTickCount() - this.novaTick < Config.PoisonNovaDelay * 1000) {
      delay(40);
    }

    return lowMana ? Attack.Result.NEEDMANA : Attack.Result.SUCCESS;
  };

  /** @param {Monster} unit */
  ClassAttack.farCast = function (unit) {
    let timedSkill = Config.AttackSkill[1];
    let untimedSkill = Config.AttackSkill[2];

    // No valid skills can be found
    if (timedSkill < 0 && untimedSkill < 0) {
      return Attack.Result.CANTATTACK;
    }
    // Far to low a range for far casting
    if (Skill.getRange(timedSkill) < 4 && Skill.getRange(untimedSkill) < 4) {
      return Attack.Result.CANTATTACK;
    }

    // Bone prison
    if (unit.distance > 10
      && !checkCollision(me, unit, sdk.collision.Ranged)
      && Skill.getManaCost(sdk.skills.BonePrison) * 2 < me.mp
      && getTickCount() - this.bpTick > 2000) {
      if (Skill.cast(sdk.skills.BonePrison, sdk.skills.hand.Right, unit)) {
        this.bpTick = getTickCount();
      }
    }

    doCurse(unit);

    // Check for bodies to exploit for CorpseExplosion before committing to an attack for non-summoner type necros
    if (Config.Skeletons + Config.SkeletonMages + Config.Revives === 0) {
      this.checkCorpseNearMonster(unit) && this.explodeCorpses(unit);
    }

    if (timedSkill > -1 && (!me.getState(sdk.states.SkillDelay) || !Skill.isTimed(timedSkill))) {
      switch (timedSkill) {
      case sdk.skills.PoisonNova:
      case sdk.skills.Summoner: // Pure Summoner
        break;
      default:
        if (!unit.dead && !checkCollision(me, unit, sdk.collision.Ranged)) {
          Skill.cast(timedSkill, Skill.getHand(timedSkill), unit);
        }

        break;
      }
    }

    if (untimedSkill > -1) {
      if (Skill.getRange(untimedSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) {
        return Attack.Result.FAILED;
      }
      if (!unit.dead && !checkCollision(me, unit, sdk.collision.Ranged)) {
        Skill.cast(untimedSkill, Skill.getHand(untimedSkill), unit);
      }

      return Attack.Result.SUCCESS;
    }

    Misc.poll(() => !me.skillDelay, 1000, 40);

    return Attack.Result.SUCCESS;
  };

  /** @param {Monster} unit */
  ClassAttack.explodeCorpses = function (unit) {
    if (Config.ExplodeCorpses === 0 || unit.dead) return false;

    let corpseList = [];
    let useAmp = Skill.canUse(sdk.skills.AmplifyDamage);
    let ampManaCost = Skill.getManaCost(sdk.skills.AmplifyDamage);
    let explodeCorpsesManaCost = Skill.getManaCost(Config.ExplodeCorpses);
    let range = Math.floor((me.getSkill(Config.ExplodeCorpses, sdk.skills.subindex.SoftPoints) + 7) / 3);
    let corpse = Game.getMonster(-1, sdk.monsters.mode.Dead);

    if (corpse) {
      do {
        if (getDistance(unit, corpse) <= range
          && this.checkCorpse(corpse)) {
          corpseList.push(copyUnit(corpse));
        }
      } while (corpse.getNext());

      // Shuffle the corpseList so if running multiple necrobots they explode separate corpses not the same ones
      corpseList.length > 1 && (corpseList = corpseList.shuffle());

      if (this.isArmyFull()) {
        // We don't need corpses as we are not a Summoner Necro, Spam CE till monster dies or we run out of bodies.
        do {
          corpse = corpseList.shift();

          if (corpse) {
            if (!unit.dead && this.checkCorpse(corpse) && getDistance(corpse, unit) <= range) {
              // Added corpse ID so I can see when it blows another monster with the same ClassID and Name
              me.overhead("Exploding: " + corpse.classid + " " + corpse.name + " id:" + corpse.gid);

              if (useAmp && !unit.getState(sdk.states.AmplifyDamage)
                && !unit.getState(sdk.states.Decrepify)
                && me.mp > (ampManaCost + explodeCorpsesManaCost)) {
                Skill.cast(sdk.skills.AmplifyDamage, sdk.skills.hand.Right, unit);
              }

              if (Skill.cast(Config.ExplodeCorpses, sdk.skills.hand.Right, corpse)) {
                delay(me.ping + 1);
              }
            }
          }
        } while (corpseList.length > 0);
      } else {
        // We are a Summoner Necro, we should conserve corpses, only blow 2 at a time so we can check for needed re-summons.
        for (let i = 0; i <= 1; i += 1) {
          if (corpseList.length > 0) {
            corpse = corpseList.shift();

            if (corpse) {
              me.overhead("Exploding: " + corpse.classid + " " + corpse.name);

              if (useAmp && !unit.getState(sdk.states.AmplifyDamage)
                && !unit.getState(sdk.states.Decrepify)
                && me.mp > (ampManaCost + explodeCorpsesManaCost)) {
                Skill.cast(sdk.skills.AmplifyDamage, sdk.skills.hand.Right, unit);
              }

              if (Skill.cast(Config.ExplodeCorpses, sdk.skills.hand.Right, corpse)) {
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
})();
