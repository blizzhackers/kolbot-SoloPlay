/**
*  @filename    DruidAttacks.js
*  @author      theBGuy
*  @desc        Druid fixes to improve class attack functionality
*
*/

/**
 * @todo
 * Test traveling in wolf form/ utilizing wereform if we have it and need to perform normal attack
 */

includeIfNotIncluded("core/Attacks/Druid.js");

(function () {
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
    "Firestorm": new ClassData(sdk.skills.Firestorm),
    "MoltenBoulder": new ClassData(sdk.skills.MoltenBoulder),
    "ArcticBlast": new ClassData(sdk.skills.ArcticBlast),
    "Fissure": new ClassData(sdk.skills.Fissure),
    "Twister": new ClassData(sdk.skills.Twister),
    "Tornado": new ClassData(sdk.skills.Tornado),
    "Volcano": new ClassData(sdk.skills.Volcano),
    // "Hurricane": new ClassData(sdk.skills.Hurricane),
    // "Armageddon": new ClassData(sdk.skills.Armageddon),
  };

  /**
   * hacky for now - fire skills are wonky with the skill delays
   * better solution might be tracking what was last cast and the actual
   * delay of each 
   */
  AttackData.Firestorm.timed = false;

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
  const initAttackData = (currLvl = me.charlvl) => {
    AttackDataKeys.forEach(sk => {
      if (currLvl >= AttackData[sk].reqLvl) {
        AttackData[sk].assignValues();
      }
    });
  };

  /**
   * Helper function to init damage value for unit
   * @param {Monster} unit
   */
  const setDamageValues = (unit) => {
    AttackDataKeys.forEach(sk => {
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
  const isHighestDmg = (skill) => {
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
  * @param {Monster} unit 
  * @param {boolean} recheck 
  * @returns {AttackResult}
  */
  ClassAttack.doAttack = function (unit, recheck) {
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
    const currLvl = me.charlvl;
    const index = (unit.isSpecial || unit.isPlayer) ? 1 : 3;

    // maybe every couple attacks or just the first one?
    Precast.doPrecast();

    if (index === 1 && !unit.dead && unit.curseable) {
      const commonCheck = (gold > 500000 || unit.isBoss || [sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction].includes(me.area));

      if (CharData.skillData.haveChargedSkill(sdk.skills.SlowMissiles) && unit.getEnchant(sdk.enchant.LightningEnchanted) && !unit.getState(sdk.states.SlowMissiles)
        && (gold > 500000 && !unit.isBoss) && !checkCollision(me, unit, sdk.collision.Ranged)) {
        // Cast slow missiles
        Attack.castCharges(sdk.skills.SlowMissiles, unit);
      }

      if (CharData.skillData.haveChargedSkill(sdk.skills.InnerSight) && !unit.getState(sdk.states.InnerSight)
        && gold > 500000 && !checkCollision(me, unit, sdk.collision.Ranged)) {
        // Cast slow missiles
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

    initAttackData(currLvl);
    setDamageValues(unit);

    let selectedSkillKey = AttackDataKeys
      .filter(k => AttackData[k].have && me.mp > AttackData[k].mana && (!AttackData[k].timed || !me.skillDelay))
      .sort((a, b) => AttackData[b].dmg - AttackData[a].dmg)
      .first();
    if (!selectedSkillKey) return Attack.Result.FAILED;

    /** @type {ClassData} */
    let selectedSkill = typeof AttackData[selectedSkillKey] === "object" ? AttackData[selectedSkillKey] : DummyData;

    switch (selectedSkill.skill) {
    case sdk.skills.Attack:
      if (!me.normal || (me.charlvl > 6 && !me.checkForMobs({ range: 10, coll: (sdk.collision.BlockWall | sdk.collision.ClosedDoor) }))) {
        selectedSkill = DummyData;
      }
    }

    // console.debug(AttackData);
    // console.debug("Choose skill :: " + getSkillById(selectedSkill.skill) + " Damage: " + selectedSkill.dmg);

    let result = ClassAttack.doCast(unit, selectedSkill);

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
        !!closeMob && ClassAttack.doCast(closeMob, selectedSkill);
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
  ClassAttack.doCast = function (unit, choosenSkill) {
    let { skill, range, mana, timed } = choosenSkill;
    // unit became invalidated
    if (!unit || !unit.attackable) return Attack.Result.SUCCESS;
    if (!!skill && me.mp < mana) {
      return Attack.Result.NEEDMANA;
    }
    // No valid skills can be found
    if (skill < 0) return Attack.Result.CANTATTACK;

    /**
     * @todo handling targetting for fissure/molten moulder/volcano
     */

    if (range > 8 && me.inDanger()) {
      Attack.getIntoPosition(unit, range + 1, Coords_1.Collision.BLOCK_MISSILE, true);
    }
    
    if (!me.skillDelay || !timed) {
      switch (skill) {
      case sdk.skills.Tornado:
        if (Math.ceil(unit.distance) > range || checkCollision(me, unit, sdk.collision.Ranged)) {
          if (!Attack.getIntoPosition(unit, range, sdk.collision.Ranged)) {
            return Attack.Result.FAILED;
          }
        }

        // Randomized x coord changes tornado path and prevents constant missing
        if (!unit.dead) {
          Skill.cast(skill, Skill.getHand(skill), unit.x + rand(-1, 1), unit.y);
        }

        return Attack.Result.SUCCESS;
      default:
        if (range < 4 && !Attack.validSpot(unit.x, unit.y)) return Attack.Result.FAILED;

        if (Math.ceil(unit.distance) > range || checkCollision(me, unit, sdk.collision.Ranged)) {
          // Allow short-distance walking for melee skills
          let walk = range < 4 && unit.distance < 10 && !checkCollision(me, unit, sdk.collision.BlockWall);

          if (!Attack.getIntoPosition(unit, range, sdk.collision.Ranged, walk)) {
            return Attack.Result.FAILED;
          }
        }

        !unit.dead && Skill.cast(skill, Skill.getHand(skill), unit);

        return Attack.Result.SUCCESS;
      }
    }

    Misc.poll(() => !me.skillDelay, 1000, 40);

    return Attack.Result.SUCCESS;
  };
})();
