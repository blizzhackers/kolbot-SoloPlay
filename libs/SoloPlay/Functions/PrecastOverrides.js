/**
*  @filename    PrecastOverrides.js
*  @author      theBGuy
*  @desc        Precasting related functions
*
*/

includeIfNotIncluded("core/Precast.js");

Precast.enabled = true;

// TODO: check if some of the summons from charged items could be useful?
// Can't be on a weapon due to consistent switching but
// Clay Goldem from Stone RW, Iron Golem from Metalgrid, Posion Creeper from Carrior Wind ring, Oak, HoW, or SoB from wisp

new Overrides.Override(Precast, Precast.doPrecast, function (orignal, force, partial) {
  if (!Precast.enabled) return false;

  switch (me.classid) {
  case sdk.player.class.Paladin:
    // Force BO 30 seconds before it expires
    if (this.haveCTA > -1) {
      let forceBo = (force
        || Precast.skills.get(sdk.skills.BattleOrders).remaining() < 25
        || !me.getState(sdk.states.BattleCommand));
      forceBo && this.precastCTA(forceBo);
    }

    if (Precast.skills.get(sdk.skills.HolyShield).needToCast(force || partial, 15)
      && Math.round(Skill.getManaCost(sdk.skills.HolyShield) * 100 / me.mpmax) < 35) {
      if (Precast.skills.get(sdk.skills.HolyShield).needToCast(force || partial, 15)) {
        let _wearingShield = me.getItem(-1, sdk.items.mode.Equipped, Precast.shieldGid);
        if (!_wearingShield) {
          // try once to locate, in case we just swapped
          _wearingShield = me.usingShield();
          Precast.shieldGid = _wearingShield ? _wearingShield.gid : 0;
          if (!_wearingShield) {
            break;
          }
        }
        if (Precast.shieldGid > 0) {
          Precast.cast(sdk.skills.HolyShield);
        }
      }
    }

    break;
  case sdk.player.class.Barbarian:
    let needShout = (Precast.skills.get(sdk.skills.Shout).needToCast(force || partial));
    let needBo = (Precast.skills.get(sdk.skills.BattleOrders).needToCast(force || partial));
    let needBc = (Precast.skills.get(sdk.skills.BattleCommand).needToCast(force || partial));

    if (needShout || needBo || needBc) {
      let primary = Attack.getPrimarySlot();
      let { x, y } = me;
      (needBo || needBc) && me.switchWeapons(this.getBetterSlot(sdk.skills.BattleOrders));

      needBc && Precast.cast(sdk.skills.BattleCommand, x, y, false);
      needBo && Precast.cast(sdk.skills.BattleOrders, x, y, false);
      needShout && Precast.cast(sdk.skills.Shout, x, y, false);
      needBc && Precast.cast(sdk.skills.BattleCommand, x, y, false);

      me.weaponswitch !== primary && me.switchWeapons(primary);
    }

    if (CharData.skillData.haveChargedSkill(sdk.skills.Enchant)
      && !me.getState(sdk.states.Enchant)
      && me.gold > 500000) {
      // Cast enchant
      Attack.castCharges(sdk.skills.Enchant, me);
    }

    break;
  default:
    return orignal(force);
  }

  me.switchWeapons(Attack.getPrimarySlot());

  return true;
}).apply();

Precast.summon = function (skillId, minionType) {
  if (!Skill.canUse(skillId)) return false;

  let rv, retry = 0;
  let count = Skill.getMaxSummonCount(skillId);

  while (me.getMinionCount(minionType) < count) {
    rv = true;
    let coord = CollMap.getRandCoordinate(me.x, -3, 3, me.y, -3, 3);	// Get a random coordinate to summon using
    let unit = Attack.getNearestMonster({ skipImmune: false });

    if (unit && [sdk.summons.type.Golem, sdk.summons.type.Grizzly, sdk.summons.type.Shadow].includes(minionType)
      && unit.distance < 20 && !checkCollision(me, unit, sdk.collision.Ranged)) {
      try {
        if (Skill.cast(skillId, sdk.skills.hand.Right, unit)) {
          if (me.getMinionCount(minionType) === count) {
            continue;
          } else {
            retry++;
          }
        } else if (Skill.cast(skillId, sdk.skills.hand.Right, me.x, me.y)) {
          if (me.getMinionCount(minionType) === count) {
            continue;
          } else {
            retry++;
          }
        }
      } catch (e) {
        console.log(e);
      }
    }

    if (coord && Attack.castableSpot(coord.x, coord.y)) {
      Skill.cast(skillId, sdk.skills.hand.Right, coord.x, coord.y);

      if (me.getMinionCount(minionType) === count) {
        continue;
      } else {
        retry++;
      }
    } else if (Attack.castableSpot(me.x, me.y)) {
      Skill.cast(skillId, sdk.skills.hand.Right, me.x, me.y);

      if (me.getMinionCount(minionType) === count) {
        continue;
      } else {
        retry++;
      }
    }

    if (Skill.getManaCost(skillId) > me.mp && me.getMobCount(15) === 0) {
      delay(1000);
      retry++;
    }

    if (retry > count * 2) {
      if (me.inTown) {
        if (Town.heal()) {
          delay(100 + me.ping);
          me.cancel();
        }
        
        Town.move("portalspot");
        Skill.cast(skillId, sdk.skills.hand.Right, me.x, me.y);
      } else {
        coord = CollMap.getRandCoordinate(me.x, -6, 6, me.y, -6, 6);

        // Keep bots from getting stuck trying to summon
        if (coord && Attack.validSpot(coord.x, coord.y)) {
          Pather.moveTo(coord.x, coord.y);
          Skill.cast(skillId, sdk.skills.hand.Right, me.x, me.y);
        }
      }

      retry = 0;
    }
  }

  return !!rv;
};
