/**
*  @filename    baal.js
*  @author      theBGuy
*  @credits     sonic
*  @desc        clear throne and kill baal
*
*/

function baal () {
  include("core/Common/Baal.js");
  Config.BossPriority = false;

  let decoyTick = 0;

  const preattack = function () {
    switch (me.classid) {
    case sdk.player.class.Amazon:
      if (Skill.canUse(sdk.skills.Decoy)) {
        let decoy = Game.getMonster(sdk.summons.Dopplezon);

        if (!decoy || (getTickCount() - decoyTick >= Skill.getDuration(sdk.skills.Decoy))) {
          Skill.cast(sdk.skills.Decoy, sdk.skills.hand.Right, 15092, 5028);
          decoyTick = getTickCount();
        }
      }

      break;
    case sdk.player.class.Sorceress:
      if ([sdk.skills.Meteor, sdk.skills.Blizzard, sdk.skills.FrozenOrb].includes(Config.AttackSkill[1])) {
        !me.skillDelay
          ? Skill.cast(Config.AttackSkill[1], sdk.skills.hand.Right, 15093, 5024)
          : delay(50);
      }

      return true;
    case sdk.player.class.Necromancer:
      if (Config.AttackSkill[3] === sdk.skills.PoisonNova) {
        if ([15093, 5029].distance > 3) {
          Pather.moveTo(15093, 5029);
        }

        Skill.cast(Config.AttackSkill[3], sdk.skills.hand.Left);
      } else if (Skill.canUse(sdk.skills.DimVision)) {
        Skill.cast(sdk.skills.DimVision, sdk.skills.hand.Right, 15093, 5024);
      }

      return true;
    case sdk.player.class.Paladin:
      if (Config.AttackSkill[3] !== sdk.skills.BlessedHammer) return false;
      if ([15093, 5029].distance > 3) {
        Pather.moveTo(15093, 5029);
      }
      Config.AttackSkill[4] > 0 && Skill.setSkill(Config.AttackSkill[4], sdk.skills.hand.Right);

      Skill.cast(Config.AttackSkill[3], sdk.skills.hand.Left);

      return true;
    case sdk.player.class.Druid:
      if ([sdk.skills.Tornado, sdk.skills.Fissure, sdk.skills.Volcano].includes(Config.AttackSkill[3])) {
        Skill.cast(Config.AttackSkill[3], sdk.skills.hand.Right, 15093, 5029);

        return true;
      }

      break;
    case sdk.player.class.Assassin:
      if (Config.UseTraps) {
        let check = ClassAttack.checkTraps({ x: 15093, y: 5029 });

        if (check) {
          ClassAttack.placeTraps({ x: 15093, y: 5029 }, 5);

          return true;
        }
      }

      if (Config.AttackSkill[3] === sdk.skills.ShockWeb) {
        return Skill.cast(Config.AttackSkill[3], sdk.skills.hand.Right, 15094, 5028);
      }

      break;
    }

    return false;
  };

  const clearWaves = function () {
    let boss;
    let tick = getTickCount();

    MainLoop:
    while (true) {
      if (!Game.getMonster(sdk.monsters.ThroneBaal)) return true;

      switch (Common.Baal.checkThrone()) {
      case 1:
        Attack.clearClassids(sdk.monsters.WarpedFallen, sdk.monsters.WarpedShaman) && (tick = getTickCount());

        break;
      case 2:
        boss = Game.getMonster("Achmel the Cursed");

        if (boss) {
          if (!Attack.canAttack(boss)) throw new Error("Immune boss");
          if (me.paladin && me.hell && Check.currentBuild().caster) throw new Error("Too much effort for hammerdin");
        }

        Attack.clearClassids(sdk.monsters.BaalSubjectMummy, sdk.monsters.BaalColdMage) && (tick = getTickCount());

        break;
      case 3:
        Attack.clearClassids(sdk.monsters.Council4) && (tick = getTickCount());
        Common.Baal.checkHydra() && (tick = getTickCount());

        break;
      case 4:
        Attack.clearClassids(sdk.monsters.VenomLord2) && (tick = getTickCount());

        break;
      case 5:
        boss = Game.getMonster("Lister the Tormentor");
        if (boss && !Attack.canAttack(boss)) throw new Error("Immune boss");

        Attack.clearClassids(sdk.monsters.ListerTheTormenter, sdk.monsters.Minion1, sdk.monsters.Minion2);

        break MainLoop;
      default:
        if (getTickCount() - tick < Time.seconds(7)) {
          if (Skill.canUse(sdk.skills.Cleansing) && me.getState(sdk.states.Poison)) {
            Skill.setSkill(sdk.skills.Cleansing, sdk.skills.hand.Right);
            Misc.poll(function () {
              if (Config.AttackSkill[3] === sdk.skills.BlessedHammer) {
                Skill.cast(Config.AttackSkill[3], sdk.skills.hand.Left);
              }
              return !me.getState(sdk.states.Poison) || me.mode === sdk.player.mode.GettingHit;
            }, Time.seconds(3), 100);
          }
        }

        if (getTickCount() - tick > Time.seconds(20)) {
          tick = getTickCount();
          Common.Baal.clearThrone();
        }

        if (!preattack()) {
          delay(50);
        }

        break;
      }

      switch (me.classid) {
      case sdk.player.class.Amazon:
      case sdk.player.class.Sorceress:
      case sdk.player.class.Assassin:
        if ([15116, 5026].distance > 3) {
          Pather.moveTo(15116, 5026);
        }
        break;
      case sdk.player.class.Necromancer:
        if (Config.AttackSkill[3] === sdk.skills.BoneSpear) {
          if ([15115, 5047].distance > 3) {
            Pather.moveTo(15115, 5047);
          }
        } else if (Config.AttackSkill[3] === sdk.skills.PoisonNova) {
          if ([15094, 5029].distance > 3) {
            Pather.moveTo(15094, 5029);
          }
        }

        break;
      case sdk.player.class.Paladin:
        if (Config.AttackSkill[3] === sdk.skills.BlessedHammer) {
          if ([15094, 5029].distance > 3) {
            Pather.moveTo(15094, 5029);
          }
          
          break;
        }
      // eslint-disable-next-line no-fallthrough
      case sdk.player.class.Druid:
        if ([sdk.skills.Fissure, sdk.skills.Volcano].includes(Config.AttackSkill[3])) {
          if ([15116, 5026].distance > 3) {
            Pather.moveTo(15116, 5026);
          }
          break;
        }

        if (Config.AttackSkill[3] === sdk.skills.Tornado) {
          if ([15094, 5029].distance > 3) {
            Pather.moveTo(15106, 5041);
          }
          break;
        }
      // eslint-disable-next-line no-fallthrough
      case sdk.player.class.Barbarian:
        if ([15101, 5045].distance > 3) {
          Pather.moveTo(15101, 5045);
        }
        break;
      }

      // If we've been in the throne for 30 minutes that's way too long
      if (getTickCount() - totalTick > Time.minutes(30)) {
        return false;
      }
      delay(10);
    }

    return true;
  };

  const unSafeCheck = function (soulAmount = 0, totalAmount = 0) {
    let count = 0;
    let soul = Game.getMonster(sdk.monsters.BurningSoul1);

    if (soul) {
      do {
        if (getDistance(me, soul) < 45) {
          count += 1;
        }
      } while (soul.getNext());
    }

    if (count > soulAmount) return true;

    let monster = Game.getMonster();

    if (monster) {
      do {
        if (!monster.getParent() && monster.classid !== sdk.monsters.BurningSoul1 && getDistance(me, monster) < 45) {
          count += 1;
        }
      } while (monster.getNext());
    }

    return count > totalAmount;
  };

  const canClearThrone = function () {
    Pather.moveTo(15094, 5029);
    let [canAttack, cantAttack] = [[], []];
    getUnits(sdk.unittype.Monster).filter(i => !!i && i.attackable).forEach(mon => {
      Attack.canAttack(mon) ? canAttack.push(mon) : cantAttack.push(mon);
    });

    console.debug("Can Attack: " + canAttack.length, " Can't Attack: " + cantAttack.length);

    return ((!canAttack.length && !cantAttack.length) || (canAttack.length > cantAttack.length));
  };

  // START
  Town.doChores(false, { fullChores: true });
  myPrint("starting baal");

  Pather.checkWP(sdk.areas.WorldstoneLvl2, true) ? Pather.useWaypoint(sdk.areas.WorldstoneLvl2) : Pather.getWP(sdk.areas.WorldstoneLvl2, true);
  Precast.doPrecast(true);
  const oldCPRange = Config.ClearPath.Range;
  const canTele = Pather.canTeleport();
  try {
    canTele && (Config.ClearPath.Range = 0);
    canTele
      ? Pather.moveToExit([sdk.areas.WorldstoneLvl3, sdk.areas.ThroneofDestruction], true, false)
      : (Pather.clearToExit(sdk.areas.WorldstoneLvl2, sdk.areas.WorldstoneLvl3, true) && Pather.clearToExit(sdk.areas.WorldstoneLvl3, sdk.areas.ThroneofDestruction, true));
  } finally {
    oldCPRange !== Config.ClearPath.Range && (Config.ClearPath.Range = oldCPRange);
  }

  // Enter throne room
  const dollQuit = me.hardcore;
  Pather.moveToEx(15095, 5029, { callback: () => {
    if (dollQuit && Game.getMonster(sdk.monsters.SoulKiller)) {
      throw new ScriptError("Unsafe for hardcore, dolls found");
    }
  } });
  Pather.moveTo(15113, 5040, 5);

  let totalTick = getTickCount();

  // souls hurt
  if (unSafeCheck(8, 20) && me.lightRes < 70 && me.nightmare) throw new Error("Unsafe to clear");
  if (!canClearThrone()) throw new Error("Too many mobs I can't attack");

  try {
    if (((me.hell && me.paladin && !Attack.auradin) || me.barbarian || me.gold < 25000 || (!me.baal && SetUp.finalBuild !== "Bumper"))) {
      Messaging.sendToScript(SoloEvents.filePath, "addBaalEvent");
    }
    
    Attack.clear(15);
    Common.Baal.clearThrone();

    if (me.coldRes < 75 || me.poisonRes < 75) {
      Town.doChores(null, { thawing: me.coldRes < 75, antidote: me.poisonRes < 75 });
      Town.move("portalspot");
      Pather.usePortal(sdk.areas.ThroneofDestruction, me.name);
    }

    if (!clearWaves()) throw new Error("Can't clear waves");

    Common.Baal.clearThrone(); // double check
    Pather.moveTo(15094, me.paladin ? 5029 : 5038);
    Pickit.pickItems();
    Pather.moveTo(15094, me.paladin ? 5029 : 5038);
    Pickit.pickItems();
    Pather.moveTo(15090, 5008);
    delay(2500 + me.ping);
    Precast.doPrecast(true);

    if (SetUp.finalBuild === "Bumper") throw new Error("BUMPER");

    if (Misc.poll(() => me.getMobCount(15) > 1)) {
      clearWaves();
    }

    Config.BossPriority = true;

    if (Common.Baal.killBaal()) {
      // Grab static gold
      NTIP.addLine("[name] == gold # [gold] >= 25");
      Pather.moveTo(15072, 5894);
      Pickit.pickItems();
      Pather.moveTo(15095, 5881);
      Pickit.pickItems();
    } else {
      console.log("ÿc8Kolbot-SoloPlayÿc0: Couldn't access portal.");
    }
  } catch (e) {
    console.warn(e.message ? e.message : e);
  } finally {
    Messaging.sendToScript(SoloEvents.filePath, "removeBaalEvent");
  }

  return true;
}
