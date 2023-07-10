/**
*  @filename    SkillOverrides.js
*  @author      theBGuy
*  @desc        Skill improvments for SoloPlay
*
*/

includeIfNotIncluded("core/Skill.js");
includeIfNotIncluded("SoloPlay/Tools/Developer.js");

Skill.forcePacket = (
  Developer.forcePacketCasting.enabled
  && !Developer.forcePacketCasting.excludeProfiles.includes(me.profile)
);
Skill.casterSkills = [
  sdk.skills.FireBolt, sdk.skills.ChargedBolt,
  sdk.skills.IceBolt, sdk.skills.FrostNova,
  sdk.skills.IceBlast, sdk.skills.FireBall,
  sdk.skills.Nova, sdk.skills.Lightning,
  sdk.skills.ChainLightning, sdk.skills.Teleport,
  sdk.skills.GlacialSpike, sdk.skills.Meteor,
  sdk.skills.Blizzard, sdk.skills.FrozenOrb,
  sdk.skills.BoneSpear, sdk.skills.Decrepify,
  sdk.skills.PoisonNova, sdk.skills.BoneSpirit,
  sdk.skills.HolyBolt, sdk.skills.BlessedHammer,
  sdk.skills.FistoftheHeavens, sdk.skills.Howl,
  sdk.skills.Taunt, sdk.skills.BattleCry,
  sdk.skills.WarCry, sdk.skills.Firestorm,
  sdk.skills.MoltenBoulder, sdk.skills.ArcticBlast,
  sdk.skills.Fissure, sdk.skills.Twister,
  sdk.skills.Volcano, sdk.skills.Armageddon,
  sdk.skills.Hurricane, sdk.skills.FireBlast,
  sdk.skills.ShockField, sdk.skills.ChargedBoltSentry,
  /* sdk.skills.WakeofFire, */ sdk.skills.LightningSentry, sdk.skills.DeathSentry
];

// Cast a skill on self, Unit or coords. Always use packet casting for caster skills becasue it's more stable.
Skill.cast = function (skillId, hand, x, y, item) {
  switch (true) {
  case me.inTown && !this.townSkill(skillId): // cant cast this in town
  case !item && (!Skill.canUse(skillId) || this.getManaCost(skillId) > me.mp): // Dont have this skill or dont have enough mana for this
  case !this.wereFormCheck(skillId): // can't cast in wereform
    return false;
  case skillId === undefined:
    throw new Error("Unit.cast: Must supply a skill ID");
  }

  hand === undefined && (hand = this.getHand(skillId));
  x === undefined && (x = me.x);
  y === undefined && (y = me.y);

  // Check mana cost, charged skills don't use mana
  if (!item && this.getManaCost(skillId) > me.mp) {
    // Maybe delay on ALL skills that we don't have enough mana for?
    if (Config.AttackSkill
      .concat([sdk.skills.StaticField, sdk.skills.Teleport])
      .concat(Config.LowManaSkill).includes(skillId)) {
      console.debug("Skill: " + getSkillById(skillId) + " manaCost: " + this.getManaCost(skillId) + " myMana: " + me.mp);
      delay(300);
    }

    return false;
  }

  if (!this.setSkill(skillId, hand, item)) return false;

  if (Config.PacketCasting > 1 || [sdk.skills.Teleport, sdk.skills.Telekinesis].includes(skillId)
    || (this.forcePacket && this.casterSkills.includes(skillId)
    && (!!me.realm || [sdk.skills.Teeth, sdk.skills.Tornado].indexOf(skillId) === -1))) {
    switch (typeof x) {
    case "number":
      Packet.castSkill(hand, x, y);
      delay(250);

      break;
    case "object":
      Packet.unitCast(hand, x);
      delay(250);

      break;
    }
  } else {
    let [clickType, shift] = (function () {
      switch (hand) {
      case sdk.skills.hand.Left: // Left hand + Shift
        return [sdk.clicktypes.click.map.LeftDown, sdk.clicktypes.shift.Shift];
      case sdk.skills.hand.LeftNoShift: // Left hand + No Shift
        return [sdk.clicktypes.click.map.LeftDown, sdk.clicktypes.shift.NoShift];
      case sdk.skills.hand.RightShift: // Right hand + Shift
        return [sdk.clicktypes.click.map.RightDown, sdk.clicktypes.shift.Shift];
      case sdk.skills.hand.Right: // Right hand + No Shift
      default:
        return [sdk.clicktypes.click.map.RightDown, sdk.clicktypes.shift.NoShift];
      }
    })();

    MainLoop:
    for (let n = 0; n < 3; n += 1) {
      typeof x === "object" ? clickMap(clickType, shift, x) : clickMap(clickType, shift, x, y);
      delay(20);
      typeof x === "object" ? clickMap(clickType + 2, shift, x) : clickMap(clickType + 2, shift, x, y);

      for (let i = 0; i < 8; i += 1) {
        if (me.attacking) {
          break MainLoop;
        }

        delay(20);
      }
    }

    while (me.attacking) {
      delay(10);
    }
  }

  // account for lag, state 121 doesn't kick in immediately
  if (this.isTimed(skillId)) {
    for (let i = 0; i < 10; i++) {
      if ([sdk.player.mode.GettingHit, sdk.player.mode.Blocking].includes(me.mode) || me.skillDelay) {
        break;
      }

      delay(10);
    }
  }

  return true;
};

Skill.switchCast = function (skillId, givenSettings = {}) {
  const settings = Object.assign({}, {
    hand: undefined,
    x: undefined,
    y: undefined,
    switchBack: true,
    oSkill: false
  }, givenSettings);

  switch (true) {
  case me.classic: // No switch in classic
  case me.inTown && !this.townSkill(skillId): // cant cast this in town
  case this.getManaCost(skillId) > me.mp: // dont have enough mana for this
  case !this.wereFormCheck(skillId): // can't cast in wereform
  //case (!me.getSkill(skillId, sdk.skills.subindex.SoftPoints) && !settings.oSkill): // Dont have this skill
    return false;
  case skillId === undefined:
    throw new Error("Unit.cast: Must supply a skill ID");
  }

  settings.hand === undefined && (settings.hand = this.getHand(skillId));
  settings.x === undefined && (settings.x = me.x);
  settings.y === undefined && (settings.y = me.y);

  // Check mana cost, charged skills don't use mana
  if (this.getManaCost(skillId) > me.mp) {
    // Maybe delay on ALL skills that we don't have enough mana for?
    if (Config.AttackSkill.concat([sdk.skills.StaticField, sdk.skills.Teleport]).concat(Config.LowManaSkill).includes(skillId)) {
      delay(300);
    }

    return false;
  }

  // switch to secondary
  me.weaponswitch === 0 && me.switchWeapons(1);

  // Failed to set the skill, switch back
  if (!this.setSkill(skillId, settings.hand)) {
    me.switchWeapons(0);
    return false;
  }

  if (me.paladin && settings.hand !== sdk.skills.hand.Right) {
    // set aura
    Skill.setSkill(Config.AttackSkill[2], sdk.skills.hand.Right);
  }

  if ((this.forcePacket && this.casterSkills.includes(skillId)
    && (!!me.realm || [sdk.skills.Teeth, sdk.skills.Tornado].indexOf(skillId) === -1))
    || Config.PacketCasting > 1
    || skillId === sdk.skills.Teleport) {
    switch (typeof settings.x) {
    case "number":
      Packet.castSkill(settings.hand, settings.x, settings.y);

      break;
    case "object":
      Packet.unitCast(settings.hand, settings.x);

      break;
    }
    // make sure we give enough time back so we don't fail our next cast
    delay(250);
  } else {
    let [clickType, shift] = (function () {
      switch (settings.hand) {
      case sdk.skills.hand.Left: // Left hand + Shift
        return [sdk.clicktypes.click.map.LeftDown, sdk.clicktypes.shift.Shift];
      case sdk.skills.hand.LeftNoShift: // Left hand + No Shift
        return [sdk.clicktypes.click.map.LeftDown, sdk.clicktypes.shift.NoShift];
      case sdk.skills.hand.RightShift: // Right hand + Shift
        return [sdk.clicktypes.click.map.RightDown, sdk.clicktypes.shift.Shift];
      case sdk.skills.hand.Right: // Right hand + No Shift
      default:
        return [sdk.clicktypes.click.map.RightDown, sdk.clicktypes.shift.NoShift];
      }
    })();

    MainLoop:
    for (let n = 0; n < 3; n += 1) {
      typeof settings.x === "object"
        ? clickMap(clickType, shift, settings.x)
        : clickMap(clickType, shift, settings.x, settings.y);
      delay(20);
      typeof settings.x === "object"
        ? clickMap(clickType + 2, shift, settings.x)
        : clickMap(clickType + 2, shift, settings.x, settings.y);

      for (let i = 0; i < 8; i++) {
        if (me.attacking) {
          break MainLoop;
        }

        delay(20);
      }
    }

    while (me.attacking) {
      delay(10);
    }
  }

  // account for lag, state 121 doesn't kick in immediately
  if (this.isTimed(skillId)) {
    for (let i = 0; i < 10; i++) {
      if ([sdk.player.mode.GettingHit, sdk.player.mode.Blocking].includes(me.mode) || me.skillDelay) {
        break;
      }

      delay(10);
    }
  }

  // switch back to main secondary
  me.weaponswitch === 1 && settings.switchBack && me.switchWeapons(0);

  return true;
};
