/**
*  @filename    AttackOverrides.js
*  @author      theBGuy
*  @credit      jaenster
*  @desc        Attack.js fixes and related functions
*
*/

includeIfNotIncluded("core/Attack.js");

Attack.stopClear = false;
Attack.Result.NOOP = 4;

Attack.init = function () {
  const CLASSNAME = sdk.player.class.nameOf(me.classid);
  if (Config.Wereform) {
    include("core/Attacks/wereform.js");
  } else if (Config.CustomClassAttack && FileTools.exists("libs/core/Attacks/" + Config.CustomClassAttack + ".js")) {
    console.log("Loading custom attack file");
    include("core/Attacks/" + Config.CustomClassAttack + ".js");
  } else {
    if (!include("SoloPlay/Functions/ClassAttackOverrides/" + CLASSNAME + "Attacks.js")) {
      console.log(sdk.colors.Red + "Failed to include: " + "SoloPlay/Functions/ClassAttackOverrides/" + CLASSNAME + "Attacks.js");
      console.log(sdk.colors.Blue + "Loading default attacks instead");
      include("core/Attacks/" + CLASSNAME + ".js");
    }
  }

  if (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0) {
    showConsole();
    console.warn("ÿc1Bad attack config. Don't expect your bot to attack.");
  }

  this.getPrimarySlot();
  Skill.init();

  if (me.expansion) {
    Precast.checkCTA();
    this.checkInfinity();
    this.checkAuradin();
    this.getCurrentChargedSkillIds(true);
    this.checkBowOnSwitch(true);
  }
};

/**
 * @param {Monster} unit 
 * @returns { { timed: number, untimed: number }}
 */
Attack.decideSkill = function (unit) {
  let skills = { timed: -1, untimed: -1 };
  if (!unit) return skills;

  const index = (unit.isSpecial || unit.isPlayer) ? 1 : 3;
  const classid = unit.classid;

  // Get timed skill
  let checkSkill = Attack.getCustomAttack(unit)
    ? Attack.getCustomAttack(unit)[0]
    : Config.AttackSkill[index];

  if (Attack.checkResist(unit, checkSkill)
    && Attack.validSpot(unit.x, unit.y, checkSkill, classid)) {
    skills.timed = checkSkill;
  } else if (Config.AttackSkill[5] > -1
    && Attack.checkResist(unit, Config.AttackSkill[5])
    && Attack.validSpot(unit.x, unit.y, Config.AttackSkill[5], classid)) {
    skills.timed = Config.AttackSkill[5];
  }

  // Get untimed skill
  checkSkill = Attack.getCustomAttack(unit)
    ? Attack.getCustomAttack(unit)[1]
    : Config.AttackSkill[index + 1];

  if (Attack.checkResist(unit, checkSkill)
    && Attack.validSpot(unit.x, unit.y, checkSkill)) {
    skills.untimed = checkSkill;
  } else if (Config.AttackSkill[6] > -1
    && Attack.checkResist(unit, Config.AttackSkill[6])
    && Attack.validSpot(unit.x, unit.y, Config.AttackSkill[6], classid)) {
    skills.untimed = Config.AttackSkill[6];
  }

  // Low mana timed skill
  if (Config.LowManaSkill[0] > -1
    && Skill.getManaCost(skills.timed) > me.mp
    && Attack.checkResist(unit, Config.LowManaSkill[0])) {
    skills.timed = Config.LowManaSkill[0];
  }

  // Low mana untimed skill
  if (Config.LowManaSkill[1] > -1
    && Skill.getManaCost(skills.untimed) > me.mp
    && Attack.checkResist(unit, Config.LowManaSkill[1])) {
    skills.untimed = Config.LowManaSkill[1];
  }

  return skills;
};

Attack.getLowerResistPercent = function () {
  const calc = function (level) {
    return Math.floor(Math.min(25 + (45 * ((110 * level) / (level + 6)) / 100), 70));
  };
  if (me.expansion && CharData.skillData.haveChargedSkillOnSwitch(sdk.skills.LowerResist)) {
    return calc(
      CharData.skillData.chargedSkillsOnSwitch
        .find(chargeSkill => chargeSkill.skill === sdk.skills.LowerResist).level
    );
  }
  if (Skill.canUse(sdk.skills.LowerResist)) {
    return calc(me.getSkill(sdk.skills.LowerResist, sdk.skills.subindex.SoftPoints));
  }
  return 0;
};

/**
 * Check if monster is immmune to a damagetype
 * @param {Monster} unit 
 * @param {number} val 
 * @param {number} maxres 
 * @returns {boolean} true if they are not immune
 */
Attack.checkResist = function (unit, val = -1, maxres = 100) {
  if (!unit || !unit.type || unit.type === sdk.unittype.Player) return true;

  const damageType = typeof val === "number" ? this.getSkillElement(val) : val;
  const addLowerRes = !!(
    (Skill.canUse(sdk.skills.LowerResist)
    || CharData.skillData.haveChargedSkillOnSwitch(sdk.skills.LowerResist))
    && unit.curseable
  );

  // Static handler
  if (val === sdk.skills.StaticField && this.getResist(unit, damageType) < 100) {
    return unit.hpPercent > Config.CastStatic;
  }

  // TODO: sometimes unit is out of range of conviction so need to check that
  // baal in throne room doesn't have getState
  if (this.infinity && ["fire", "lightning", "cold"].includes(damageType) && unit.getState) {
    if (!unit.getState(sdk.states.Conviction)) {
      if (addLowerRes && !unit.getState(sdk.states.LowerResist) && ((unit.isSpecial) || me.necromancer)) {
        let lowerResPercent = this.getLowerResistPercent();
        return (this.getResist(unit, damageType) - (Math.floor((lowerResPercent + 85) / 5))) < 100;
      }
      return this.getResist(unit, damageType) < 117;
    }

    return this.getResist(unit, damageType) < maxres;
  }

  if (this.auradin && ["physical", "fire", "cold", "lightning"].includes(damageType)
    && me.getState(sdk.states.Conviction) && unit.getState) {
    // our main dps is not physical despite using zeal
    if (damageType === "physical") return true;
    if (!unit.getState(sdk.states.Conviction)) {
      return (this.getResist(unit, damageType) - (this.getConvictionPercent() / 5) < 100);
    }

    let valid = false;

    // check unit's fire resistance
    (me.getState(sdk.states.HolyFire)) && (valid = this.getResist(unit, "fire") < maxres);
    // check unit's light resistance but only if the above check failed
    (me.getState(sdk.states.HolyShock) && !valid) && (valid = this.getResist(unit, "lightning") < maxres);

    // TODO: maybe if still invalid at this point check physical resistance? Although if we are an auradin our physcial dps is low

    return valid;
  }

  if (addLowerRes && ["fire", "lightning", "cold", "poison"].includes(damageType) && unit.getState) {
    let lowerResPercent = this.getLowerResistPercent();
    if (!unit.getState(sdk.states.LowerResist) && ((unit.isSpecial && me.gold > 500000) || me.necromancer)) {
      return (this.getResist(unit, damageType) - (Math.floor(lowerResPercent / 5)) < 100);
    }
  }

  return this.getResist(unit, damageType) < maxres;
};

/**
 * @param {Monster} unit 
 * @returns {boolean} If we have a valid skill to use on this monster
 * @todo Maybe make this a prototype and use game data to also check if should attack not just can based on effort?
 */
Attack.canAttack = function (unit) {
  if (!unit) return false;
  if (!unit.isMonster) return false;
  if (me.sorceress) {
    return Config.AttackSkill.some(function (skill) {
      return skill > -1 && Attack.checkResist(unit, Attack.getSkillElement(skill));
    });
  }
  // Unique/Champion
  if (unit.isSpecial) {
    if (Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[1]))
      || Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[2]))) {
      return true;
    }
  } else {
    if (Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[3]))
      || Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[4]))) {
      return true;
    }
  }

  if (Config.AttackSkill.length === 7) {
    return Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[5]))
      || Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[6]));
  }

  return false;
};

/**
 * @param {number} range 
 * @param {number} x 
 * @param {number} y 
 * @returns {boolean}
 */
Attack.openChests = function (range, x, y) {
  if (!Config.OpenChests.Enabled || !Misc.openChestsEnabled) return false;
  range === undefined && (range = 5);
  x === undefined && (x = me.x);
  y === undefined && (y = me.y);

  /** @param {ObjectUnit} chest */
  const openChest = function (chest) {
    // Skip invalid/open and Countess chests
    if (!chest || chest.x === 12526 || chest.x === 12565 || chest.mode) return false;
    // locked chest, no keys
    if (!me.assassin && unit.islocked
      && !me.findItem(sdk.items.Key, sdk.items.mode.inStorage, sdk.storage.Inventory)) {
      return false;
    }
    if (Pather.getWalkDistance((chest.x + 1), (chest.y + 2)) > 10) {
      // chest is too far away
      console.debug("Chest too far away");
      return false;
    }
    if ([(chest.x + 1), (chest.y + 2)].distance > 5) {
      Pather.walkTo(chest.x + 1, chest.y + 2, 3);
    }
    Packet.entityInteract(chest);

    return Misc.poll(function () {
      return !chest || chest.mode !== sdk.objects.mode.Inactive;
    }, 300, 10);
  };
  const containers = [
    "chest", "loose rock", "hidden stash", "loose boulder",
    "corpseonstick", "casket", "armorstand", "weaponrack",
    "holeanim", "roguecorpse", "corpse", "tomb2", "tomb3", "chest3",
    "skeleton", "guardcorpse", "sarcophagus", "object2",
    "cocoon", "hollow log", "hungskeleton",
    "bonechest", "woodchestl", "woodchestr",
    "burialchestr", "burialchestl", "chestl",
    "chestr", "groundtomb", "tomb3l", "tomb1l",
    "deadperson", "deadperson2", "groundtombl", "casket", "barrel", "ratnest",
    "goo pile", "largeurn", "urn", "jug", "basket", "stash",
    "pillar", "skullpile", "skull pile",
    "jar3", "jar2", "jar1", "barrel wilderness",
    "explodingchest", "icecavejar1", "icecavejar2", "icecavejar3",
    "icecavejar4", "evilurn"
  ];
  const list = [];
  let unit = Game.getObject();

  if (unit) {
    do {
      if (unit.name
        && unit.mode === sdk.objects.mode.Inactive
        && containers.includes(unit.name.toLowerCase())
        && getDistance(unit, x, y) <= range
        && !checkCollision(me, unit, sdk.collision.BlockWalk)
        /* && unit.getMobCount(10) === 0 */) {
        list.push(copyUnit(unit));
      }
    } while (unit.getNext());
  }

  while (list.length) {
    list.sort(Sort.units);
    openChest(list.shift()) && Pickit.pickItems(5);
  }

  return true;
};

/**
 * @param {Monster | string | number} name 
 * @returns {boolean}
 */
Attack.killTarget = function (name) {
  if (!name || Config.AttackSkill[1] < 0) return false;
  typeof name === "string" && (name = name.toLowerCase());
  let target = (typeof name === "object"
    ? name
    : Misc.poll(function () {
      return Game.getMonster(name);
    }, 2000, 100));

  if (!target) {
    console.warn("ÿc8KillTargetÿc0 :: " + name + " not found. Performing Attack.Clear(25)");
    return (Attack.clear(25) && Pickit.pickItems());
  }

  // exit if target is immune
  if (target && !Attack.canAttack(target) && !Attack.canTeleStomp(target)) {
    console.warn("ÿc8KillTargetÿc0 :: Attack failed. " + target.name + " is immune.");
    return false;
  }

  const findTarget = function (gid, loc) {
    let path = getPath(me.area, me.x, me.y, loc.x, loc.y, 1, 5);
    if (!path) return false;

    if (path.some(function (node) {
      Pather.walkTo(node.x, node.y);
      return Game.getMonster(-1, -1, gid);
    })) {
      return Game.getMonster(-1, -1, gid);
    } else {
      return false;
    }
  };

  // think doing this might be safer for non-teleporters, alot of the time they end up either stuck in recursive node action <-> clear loop
  // or try to bull their way through mobs to the boss and instead should try to clear to them but without the loop
  if (!Pather.canTeleport() && Attack.clear(15, 0, target)) return true;
  
  const who = (!!target.name ? target.name : name);
  const gid = target.gid;
  let errorInfo = "";
  let [retry, attackCount] = [0, 0];
  let lastLoc = { x: me.x, y: me.y };
  let tick = getTickCount();

  try {
    console.log("ÿc7Kill ÿc0:: " + who);
    // disable opening chests while killing unit
    Misc.openChestsEnabled = false;

    while (attackCount < Config.MaxAttackCount && target.attackable && !this.skipCheck(target)) {
      // Check if unit got invalidated, happens if necro raises a skeleton from the boss's corpse.
      if (!target || !copyUnit(target).x) {
        target = Game.getMonster(-1, -1, gid);
        !target && (target = findTarget(gid, lastLoc));

        if (!target) {
          console.warn("ÿc1Failed to kill " + who + " (couldn't relocate unit)");
          break;
        }
      }

      if (Config.Dodge && me.hpPercent <= Config.DodgeHP) {
        this.deploy(target, Config.DodgeRange, 5, 9);
      }
      if (attackCount > 0 && attackCount % 15 === 0) {
        Skill.getRange(Config.AttackSkill[1]) < 4 && Packet.flash(me.gid);
      }
      me.overhead("KillTarget: " + target.name + " health " + target.hpPercent + " % left");
      let result = ClassAttack.doAttack(target, attackCount % 15 === 0);

      if (result === this.Result.FAILED) {
        if (retry++ > 3) {
          errorInfo = " (doAttack failed)";

          break;
        }

        Packet.flash(me.gid);
      } else if (result === this.Result.CANTATTACK) {
        errorInfo = " (No valid attack skills)";

        break;
      } else if (result === this.Result.NEEDMANA) {
        continue;
      } else {
        retry = 0;
      }

      lastLoc = { x: me.x, y: me.y };
      attackCount++;

      if (target.dead || Config.FastPick || attackCount % 5 === 0) {
        Config.FastPick ? Pickit.fastPick() : Pickit.essessntialsPick(false);
      }
    }

    attackCount === Config.MaxAttackCount && (errorInfo = " (attackCount exceeded: " + attackCount + ")");
    ClassAttack.afterAttack();
    Pickit.pickItems();

    if (!!target && target.attackable) {
      console.warn("ÿc1Failed to kill ÿc0" + who + errorInfo);
    } else {
      console.log("ÿc7Killed ÿc0:: " + who + "ÿc0 - ÿc7Duration: ÿc0" + Time.format(getTickCount() - tick));
    }
  } finally {
    // re-enable
    Misc.openChestsEnabled = true;
  }

  return (!target || !copyUnit(target).x || target.dead || !target.attackable);
};

Attack.clearLocations = function (list = []) {
  for (let x = 0; x < list.length; x++) {
    Attack.clear(20);
    Pather.moveTo(list[x][0], list[x][1]);
    Attack.clear(20);
    Pickit.pickItems();
  }

  return true;
};

/**
 * Clear around a certain node
 * @param {number} x 
 * @param {number} y 
 * @param {number} range 
 * @param {boolean} pickit 
 * @param {function(): boolean} [cb]
 * @returns {boolean}
 */
Attack.clearPos = function (x, y, range = 15, pickit = true, cb = null) {
  /** @type {PathNode} */
  const _startPos = { x: x, y: y };
  const _mobCount = _startPos.mobCount({ range: range });
  console.debug("ÿc7ClearPosÿc0 :: " + _mobCount + " monsters around " + _startPos.x + ", " + _startPos.y);
  try {
    if (typeof (range) !== "number") throw new Error("Attack.clear: range must be a number.");
    if (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0 || Attack.stopClear || !x || !y) return false;
    NodeAction.enabled = false;

    while (!me.gameReady) {
      delay(40);
    }

    /** @type {Map<number, { attacks: number, name: string }} */
    const attacks = new Map();
    /** @type {Array<Monster>} */
    const monsterList = [];
    let start = false;
    let [retry, attackCount] = [0, 0];
    let target = Game.getMonster();

    if (target) {
      do {
        if (target.attackable && !this.skipCheck(target) && this.canAttack(target)) {
          // Speed optimization - don't go through monster list until there's at least one within clear range
          if (!start && getDistance(target, _startPos) <= range
            && (Pather.useTeleport() || !checkCollision(me, target, sdk.collision.BlockWalk))) {
            start = true;
          }

          monsterList.push(copyUnit(target));
        }
      } while (target.getNext());
    }

    while (start && monsterList.length > 0 && attackCount < 300) {
      if (me.dead || Attack.stopClear) return false;

      monsterList.sort(this.sortMonsters);
      target = copyUnit(monsterList[0]);

      if (target.x !== undefined
        && (getDistance(target, _startPos) <= range
        || (this.getScarinessLevel(target) > 7 && getDistance(me, target) <= range))
        && target.attackable) {
        if (Config.Dodge && me.hpPercent <= Config.DodgeHP) {
          this.deploy(target, Config.DodgeRange, 5, 9);
        }

        let _currMon = attacks.get(target.gid);
        const checkAttackSkill = (!!_currMon && _currMon.attacks > 0 && _currMon.attacks % 3 === 0);
        const result = ClassAttack.doAttack(target, checkAttackSkill);

        if (result) {
          retry = 0;

          if (result === this.Result.CANTATTACK) {
            monsterList.shift();

            continue;
          } else if (result === this.Result.NEEDMANA) {
            continue;
          }

          if (!_currMon) {
            _currMon = { attacks: 0, name: target.name };
            attacks.set(target.gid, _currMon);
          }

          _currMon.attacks += 1;
          attackCount += 1;
          let skillCheck;
          const isSpecial = target.isSpecial;
          const secAttack = me.barbarian ? (isSpecial ? 2 : 4) : 5;
          let checkSkill = Config.AttackSkill[isSpecial ? 1 : 3];
          let hammerCheck = me.paladin && checkSkill === sdk.skills.BlessedHammer;

          if (Config.AttackSkill[secAttack] > -1 && (!Attack.checkResist(target, checkSkill)
              || (hammerCheck && !ClassAttack.getHammerPosition(target)))) {
            skillCheck = Config.AttackSkill[secAttack];
          } else {
            skillCheck = checkSkill;
          }

          // Desync/bad position handler
          switch (skillCheck) {
          case sdk.skills.BlessedHammer:
            // Tele in random direction with Blessed Hammer
            if (_currMon.attacks > 0 && _currMon.attacks % (isSpecial ? 4 : 2) === 0) {
              let coord = CollMap.getRandCoordinate(me.x, -1, 1, me.y, -1, 1, 5);
              Pather.moveTo(coord.x, coord.y);
            }

            break;
          default:
            // Flash with melee skills
            if (_currMon.attacks > 0 && _currMon.attacks % (isSpecial ? 15 : 5) === 0
              && Skill.getRange(skillCheck) < 4) {
              Packet.flash(me.gid);
            }

            break;
          }

          // Skip non-unique monsters after 15 attacks, except in Throne of Destruction
          if (!me.inArea(sdk.areas.ThroneofDestruction) && !isSpecial && _currMon.attacks > 15) {
            console.warn("ÿc1Skipping " + target.name + " " + target.gid + " " + _currMon.attacks);
            monsterList.shift();
          }

          if (Config.FastPick || attackCount % 5 === 0) {
            Config.FastPick
              ? Pickit.fastPick()
              : target.dead
                ? Pickit.pickItems(6)
                : Pickit.essessntialsPick(false);
          } else {
            Pickit.pickItems(4);
          }
          Attack.openChests();
          // if (_startPos.distance > 15) {
          //   Pather.move(
          //     _startPos,
          //     { allowNodeActions: false, allowClearing: false, minDist: 10 }
          //   );
          // }
          if (typeof cb === "function" && cb()) {
            break;
          }
        } else {
          if (retry++ > 3) {
            monsterList.shift();
            retry = 0;
          }

          Packet.flash(me.gid);
        }
      } else {
        monsterList.shift();
      }
    }

    if (attackCount > 0) {
      ClassAttack.afterAttack(pickit);
      if (pickit) {
        Attack.openChests(range, x, y);
        Pickit.pickItems();
      }
    }
    if (Developer.debugging.pathing) {
      console.debug("Returning to position " + x + "/" + y + " distance: " + [x, y].distance);
    }
    if (_startPos.distance > 15) {
      Pather.move(
        _startPos,
        { allowNodeActions: false, allowClearing: false, minDist: 10 }
      );
    }
    // if ([x, y].distance > 5) {
    //   // todo - generate path and create hooks along it so we don't waste this movement time
    //   Pather.move({ x: x, y: y }, { allowClearing: false });
    // }
    console.debug("Start count: " + _mobCount + " End count: " + _startPos.mobCount({ range: range }));
    return _startPos.mobCount() < _mobCount;
  } finally {
    NodeAction.enabled = true;
  }
};

/**
 * @description Clear an already formed array of monstas
 * @param {Function | Array<Unit>} mainArg 
 * @param {Function} [sortFunc] 
 * @param {boolean} [refresh] 
 * @returns {boolean}
 */
Attack.clearList = function (mainArg, sortFunc, refresh) {
  if (typeof mainArg !== "function" && !Array.isArray(mainArg)) {
    throw new Error("clearList: Invalid argument");
  }
  /** @type {Map<number, { attacks: number, name: string }} */
  const attacks = new Map();
  let [retry, attackCount] = [0, 0];

  /** @type {Monster[]} */
  let monsterList = typeof mainArg === "function"
    ? mainArg.call()
    : mainArg.slice(0);
  !sortFunc && (sortFunc = this.sortMonsters);

  while (monsterList.length > 0 && attackCount < Config.MaxAttackCount) {
    if (me.dead) return false;

    if (refresh && attackCount > 0 && attackCount % refresh === 0) {
      monsterList = mainArg.call();
    }

    monsterList.sort(sortFunc);
    let target = copyUnit(monsterList[0]);

    if (target.x !== undefined && target.attackable) {
      if (Config.Dodge && me.hpPercent <= Config.DodgeHP) {
        this.deploy(target, Config.DodgeRange, 5, 9);
      }

      let _currMon = attacks.get(target.gid);
      const checkAttackSkill = (!!_currMon && _currMon.attacks > 0 && _currMon.attacks % 3 === 0);
      const result = ClassAttack.doAttack(target, checkAttackSkill);

      if (result) {
        retry = 0;

        if (result === this.Result.CANTATTACK) {
          monsterList.shift();

          continue;
        } else if (result === this.Result.NEEDMANA) {
          continue;
        }

        if (!_currMon) {
          _currMon = { attacks: 0, name: target.name };
          attacks.set(target.gid, _currMon);
        }

        _currMon.attacks += 1;
        let skillCheck;
        const isSpecial = target.isSpecial;
        const secAttack = me.barbarian ? (isSpecial ? 2 : 4) : 5;
        let checkSkill = Config.AttackSkill[isSpecial ? 1 : 3];
        let hammerCheck = me.paladin && checkSkill === sdk.skills.BlessedHammer;

        if (Config.AttackSkill[secAttack] > -1 && (!Attack.checkResist(target, checkSkill)
            || (hammerCheck && !ClassAttack.getHammerPosition(target)))) {
          skillCheck = Config.AttackSkill[secAttack];
        } else {
          skillCheck = checkSkill;
        }

        // Desync/bad position handler
        switch (skillCheck) {
        case sdk.skills.BlessedHammer:
          // Tele in random direction with Blessed Hammer
          if (_currMon.attacks > 0 && _currMon.attacks % (isSpecial ? 4 : 2) === 0) {
            let coord = CollMap.getRandCoordinate(me.x, -1, 1, me.y, -1, 1, 5);
            Pather.moveTo(coord.x, coord.y);
          }

          break;
        default:
          // Flash with melee skills
          if (_currMon.attacks > 0 && _currMon.attacks % (isSpecial ? 15 : 5) === 0
            && Skill.getRange(skillCheck) < 4) {
            Packet.flash(me.gid);
          }

          break;
        }

        // Skip non-unique monsters after 15 attacks, except in Throne of Destruction
        if (!me.inArea(sdk.areas.ThroneofDestruction) && !isSpecial && _currMon.attacks > 15) {
          console.warn("ÿc1Skipping " + target.name + " " + target.gid + " " + _currMon.attacks);
          monsterList.shift();
        }

        attackCount += 1;

        if (Config.FastPick || attackCount % 5 === 0) {
          Config.FastPick
            ? Pickit.fastPick()
            : target.dead
              ? Pickit.pickItems(6)
              : Pickit.essessntialsPick(false);
        } else {
          Pickit.pickItems(4);
        }
        Attack.openChests();
      } else {
        if (retry++ > 3) {
          monsterList.shift();
          retry = 0;
        }

        Packet.flash(me.gid);
      }
    } else {
      monsterList.shift();
    }
  }

  if (attackCount > 0) {
    ClassAttack.afterAttack(true);
    this.openChests(Config.OpenChests.Range);
    Pickit.pickItems();
  } else {
    Precast.doPrecast(false); // we didn't attack anything but check if we need to precast. TODO: better method of keeping track of precast skills
  }

  return true;
};

// Clear an entire area based on settings
Attack.clearLevelEx = function (givenSettings = {}) {
  function RoomSort (a, b) {
    return getDistance(myRoom[0], myRoom[1], a[0], a[1]) - getDistance(myRoom[0], myRoom[1], b[0], b[1]);
  }

  // credit @jaenstr
  const settings = Object.assign({}, {
    spectype: Config.ClearType,
    quitWhen: () => {}
  }, givenSettings);

  let room = getRoom();
  if (!room) return false;
  
  const currentArea = getArea().id;
  let result, myRoom, previousArea, rooms = [];

  do {
    rooms.push([room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2]);
  } while (room.getNext());

  while (rooms.length > 0) {
    // get the first room + initialize myRoom var
    !myRoom && (room = getRoom(me.x, me.y));

    if (room) {
      // use previous room to calculate distance
      if (room instanceof Array) {
        myRoom = [room[0], room[1]];
      } else {
        // create a new room to calculate distance (first room, done only once)
        myRoom = [room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2];
      }
    }

    rooms.sort(RoomSort);
    room = rooms.shift();
    result = Pather.getNearestWalkable(room[0], room[1], 18, 3);

    if (result) {
      Pather.moveTo(result[0], result[1], 3, settings.spectype);
      previousArea = result;

      if (settings.quitWhen()) return true;
      if (!this.clear(40, settings.spectype)) {
        break;
      }
    } else if (currentArea !== getArea().id) {
      // Make sure bot does not get stuck in different area.
      Pather.moveTo(previousArea[0], previousArea[1], 3, settings.spectype);
    }
  }

  return true;
};

// Clear an entire area until area is done or level is reached
Attack.clearLevelUntilLevel = function (charlvl = undefined, spectype = 0) {
  function RoomSort (a, b) {
    return getDistance(myRoom[0], myRoom[1], a[0], a[1]) - getDistance(myRoom[0], myRoom[1], b[0], b[1]);
  }

  let room = getRoom();
  if (!room) return false;

  !charlvl && (charlvl = me.charlvl + 1);
  let result, myRoom, previousArea;
  let rooms = [];
  /** @type {PathNode} */
  let node = { x: null, y: null };
  const currentArea = getArea().id;

  do {
    rooms.push([room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2]);
  } while (room.getNext());

  myPrint("Starting Clear until level My level: " + me.charlvl + " wanted level: " + charlvl);

  while (rooms.length > 0) {
    // get the first room + initialize myRoom var
    !myRoom && (room = getRoom(me.x, me.y));

    if (room) {
      if (room instanceof Array) { // use previous room to calculate distance
        myRoom = [room[0], room[1]];
      } else { // create a new room to calculate distance (first room, done only once)
        myRoom = [room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2];
      }
    }

    rooms.sort(RoomSort);
    room = rooms.shift();
    result = Pather.getNearestWalkable(room[0], room[1], 18, 3);

    if (result) {
      node = { x: result[0], y: result[1] };
      Pather.move(node, { retry: 3, clearSettings: { spectype: spectype } });
      previousArea = result;

      if (Attack.stopClear) {
        Attack.stopClear = false;	// Reset value
        return true;
      }

      if (me.charlvl >= charlvl) {
        myPrint("Clear until level requirment met. My level: " + me.charlvl + " wanted level: " + charlvl);
        return true;
      }

      if (!this.clear(40, spectype)) {
        break;
      }
    } else if (currentArea !== getArea().id) {
      // Make sure bot does not get stuck in different area.
      node = { x: previousArea[0], y: previousArea[1] };
      Pather.move(node, { retry: 3, clearSettings: { spectype: spectype } });
    }
  }

  return true;
};

/**
 * @description Clear monsters in a section based on range and spectype or clear monsters around a boss monster
 * @param {number} [range] - area radius to clear around
 * @param {number} [spectype] - type of monsters to clear
 * @param {number | Monster} [bossId] - gid, classid, or Monster unit to clear
 * @param {{ (a: Monster, b: Monster) => number }} [sortfunc] - how to sort the monsters we are clearing, defaults to Attack.sortMonsters
 * @param {boolean} [pickit] - Are we allowed to pick items when we are done
 * @returns {AttackResult} - (0) on failure, (1) on success, (4) on no operation performed
 * @todo
 * - change to passing an object
 * - if we are skipping a certain monster because of enchant or aura we should skip any monsters within the area of that scary monster
 * - maybe include refresh call every x amount of attacks in case the we've changed position and the monster we are targetting isn't actually the right one anymore
 * - should we stop clearing after boss is killed if we are using bossid?
 */
Attack.clear = function (range, spectype, bossId, sortfunc, pickit = true) {
  if (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0 || Attack.stopClear) return false;

  while (!me.gameReady) {
    delay(40);
  }

  range === undefined && (range = 25);
  if (typeof (range) !== "number") throw new Error("Attack.clear: range must be a number.");
  spectype === undefined && (spectype = 0);
  bossId === undefined && (bossId = false);
  const canTeleport = Pather.canTeleport();
  !sortfunc && (sortfunc = canTeleport ? this.sortMonsters : Attack.walkingSortMonsters);

  /** @type {Map<number, { attacks: number, name: string }} */
  const attacks = new Map();
  let boss, orgx, orgy, start, skillCheck;
  let tick = getTickCount();
  let [killedBoss, logged] = [false, false];
  let [retry, attackCount] = [0, 0];
  let clearResult = Attack.Result.NOOP;

  if (bossId) {
    boss = Misc.poll(function () {
      switch (true) {
      case typeof bossId === "object":
        return bossId;
      case ((typeof bossId === "number" && bossId > 999)):
        return Game.getMonster(-1, -1, bossId);
      default:
        return Game.getMonster(bossId);
      }
    }, 2000, 100);

    if (!boss) {
      console.warn("Attack.clear: " + bossId + " not found");
      return Attack.clear(10);
    }

    ({ orgx, orgy } = { orgx: boss.x, orgy: boss.y });
  } else {
    ({ orgx, orgy } = { orgx: me.x, orgy: me.y });
  }

  const monsterList = [];
  let target = Game.getMonster();

  if (target) {
    do {
      if ((!spectype || (target.spectype & spectype)) && target.attackable && !this.skipCheck(target)) {
        // Speed optimization - don't go through monster list until there's at least one within clear range
        if (!start && getDistance(target, orgx, orgy) <= range
          && (canTeleport || !checkCollision(me, target, sdk.collision.BlockWalk))) {
          start = true;
        }

        monsterList.push(copyUnit(target));
      }
    } while (target.getNext());
  }

  // if (!canTeleport && range < 10 && !me.inArea(sdk.areas.BloodMoor) && monsterList.some(mon => mon.isFallen)) {
  // 	// handle shamans if they are just out of the range we were meant to clear but we have fallens in the list
  // }

  while (start && monsterList.length > 0 && attackCount < 300) {
    if (me.dead || Attack.stopClear) return false;
    
    boss && (({ orgx, orgy } = { orgx: boss.x, orgy: boss.y }));
    monsterList.sort(sortfunc);
    target = copyUnit(monsterList[0]);
    
    if ((target.x === undefined || !target.attackable) && monsterList.shift()) {
      // console.debug("Attack.clear: Invalid target, skipping | ", target);
      continue;
    }

    if ((getDistance(target, orgx, orgy) <= range
      || (this.getScarinessLevel(target) > 7 && target.distance <= range))) {
      if (Config.Dodge && me.hpPercent <= Config.DodgeHP) {
        this.deploy(target, Config.DodgeRange, 5, 9);
      }
      tick = getTickCount();

      if (!logged && boss && boss.gid === target.gid) {
        logged = true;
        console.log("ÿc7Clear ÿc0:: " + (!!target.name ? target.name : bossId));
      }

      let _currMon = attacks.get(target.gid);
      const checkAttackSkill = (!!_currMon && _currMon.attacks > 0 && _currMon.attacks % 3 === 0);
      const result = ClassAttack.doAttack(target, checkAttackSkill);

      if (result) {
        // console.debug("Attack.clear: " + result);
        retry = 0;

        if (result === this.Result.CANTATTACK) {
          monsterList.shift();

          continue;
        } else if (result === this.Result.NEEDMANA) {
          continue;
        }

        if (!_currMon) {
          _currMon = { attacks: 0, name: target.name };
          attacks.set(target.gid, _currMon);
        }

        _currMon.attacks += 1;
        attackCount += 1;
        let isSpecial = target.isSpecial;
        let secAttack = me.barbarian ? (isSpecial ? 2 : 4) : 5;
        let checkSkill = Config.AttackSkill[isSpecial ? 1 : 3];
        let hammerCheck = me.paladin && checkSkill === sdk.skills.BlessedHammer;

        if (Config.AttackSkill[secAttack] > -1 && (!Attack.checkResist(target, checkSkill)
            || (hammerCheck && !ClassAttack.getHammerPosition(target)))) {
          skillCheck = Config.AttackSkill[secAttack];
        } else {
          skillCheck = checkSkill;
        }

        // Desync/bad position handler
        switch (skillCheck) {
        case sdk.skills.BlessedHammer:
          // Tele in random direction with Blessed Hammer
          if (_currMon.attacks > 0 && _currMon.attacks % (isSpecial ? 4 : 2) === 0) {
            let coord = CollMap.getRandCoordinate(me.x, -1, 1, me.y, -1, 1, 5);
            Pather.moveTo(coord.x, coord.y);
          }

          break;
        default:
          // Flash with melee skills
          if (_currMon.attacks > 0 && _currMon.attacks % (isSpecial ? 15 : 5) === 0
            && Skill.getRange(skillCheck) < 4) {
            Packet.flash(me.gid);
          }

          break;
        }

        // Skip non-unique monsters after 15 attacks, except in Throne of Destruction
        if (!me.inArea(sdk.areas.ThroneofDestruction) && !isSpecial && _currMon.attacks > 15) {
          console.warn("ÿc1Skipping " + target.name + " " + target.gid + " " + _currMon.attacks);
          monsterList.shift();
        }

        // we cleared this monster so subtract amount of attacks from current attack count in order to prevent pre-maturely ending clear
        if (Config.FastPick || attackCount % 5 === 0) {
          Config.FastPick
            ? Pickit.fastPick()
            : target.dead
              ? Pickit.pickItems(6)
              : Pickit.essessntialsPick(false);
        } else {
          Pickit.pickItems(4);
        }
        Attack.openChests(4);
        if (target.dead) {
          clearResult = Attack.Result.SUCCESS;
          if (boss && boss.gid === target.gid) {
            killedBoss = true;
            console.log(
              "ÿc7Cleared ÿc0:: " + (!!target.name ? target.name : bossId)
              + "ÿc0 - ÿc7Duration: ÿc0" + Time.format(getTickCount() - tick)
            );
          }
          attackCount -= _currMon.attacks;
        }
      } else {
        if (Coords_1.isBlockedBetween(me, target)) {
          let collCheck = Coords_1.getCollisionBetweenCoords(me.x, me.y, target.x, target.y);
          if (collCheck !== sdk.collision.MonsterObject) {
            console.log("ÿc1Skipping " + target.name + " because they are blocked. Collision: " + collCheck.toString(16));
            monsterList.shift();
            retry = 0;

            continue;
          }
        }

        if (retry++ > 3) {
          monsterList.shift();
          retry = 0;
        }

        Packet.flash(me.gid);
      }
    } else {
      monsterList.shift();
    }
  }

  if (attackCount > 0) {
    ClassAttack.afterAttack(pickit);
    this.openChests(range, orgx, orgy);
    pickit && Pickit.pickItems();
  }

  if (boss && !killedBoss) {
    // check if boss corpse is around
    // sometimes this fails, need better check for it
    if (boss.dead) {
      console.log("ÿc7Cleared ÿc0:: " + (!!boss.name ? boss.name : bossId) + "ÿc0 - ÿc7Duration: ÿc0" + Time.format(getTickCount() - tick));
    } else {
      console.log("ÿc7Clear ÿc0:: ÿc1Failed to clear ÿc0:: " + (!!boss.name ? boss.name : bossId));
      return Attack.Result.FAILED;
    }
  }

  return clearResult;
};

// Take a array of coords - path and clear
// pick parameter is range of items to pick
// From legacy sonic
Attack.clearCoordList = function (list, pick) {
  for (let node of list) {
    Attack.clear(node.radius);
    Pather.moveTo(node.x, node.y);
    Attack.clear(node.radius);
    pick && Pickit.pickItems(pick);
  }
};

Attack.checkBowOnSwitch = function (firstInit = false) {
  const preBow = CharData.skillData.bow.onSwitch;
  const _bows = [sdk.items.type.AmazonBow, sdk.items.type.Bow, sdk.items.type.Crossbow];
  const _quivers = [sdk.items.type.BowQuiver, sdk.items.type.CrossbowQuiver];
  const checkTypes = [].concat(_bows, _quivers);
  
  me.weaponswitch !== sdk.player.slot.Main && me.switchWeapons(sdk.player.slot.Main);
  const items = me.getItemsEx()
    .filter(function (item) {
      return item && item.isEquipped && item.isOnSwap && checkTypes.includes(item.itemType);
    });
  if (preBow && !items.some(item => _bows.includes(item.itemType))) {
    CharData.skillData.bow.resetBowData();
    return;
  }
  items.forEach(function (item) {
    if (_bows.includes(item.itemType)) {
      CharData.skillData.bow.onSwitch = true;
      if (CharData.skillData.bow.bowGid !== item.gid) {
        CharData.skillData.bow.setBowInfo(item, firstInit);
      }
    } else if (_quivers.includes(item.itemType)) {
      if (CharData.skillData.bow.quiverType !== item.itemType) {
        CharData.skillData.bow.setArrowInfo(item, firstInit);
      }
    }
  });
};

Attack.haveDependancy = function (itemType) {
  return [sdk.items.type.AmazonBow, sdk.items.type.Bow, sdk.items.type.Crossbow].includes(itemType)
    ? me.getItem("aqv", sdk.items.mode.Equipped)
    : me.getItem("cqv", sdk.items.mode.Equipped);
};

Attack.useBowOnSwitch = function (unit, skillId = 0, switchBack = true) {
  if (!CharData.skillData.bow.onSwitch) return false;
  if (!this.haveDependancy(CharData.skillData.bow.bowType)) return false;
  return Skill.switchCast(skillId, { hand: sdk.skills.hand.Left, x: unit, switchBack: switchBack });
};

// maybe store the copyUnit of the item or at least gid so we don't need to iterate through all our items to find the one with the charged skill when we need it
Attack.getCurrentChargedSkillIds = function (init = false) {
  /**
   * @typedef {Object} Charge
   * @property {number} skill
   * @property {number} level
   * @property {number} charges
   * @property {number} maxcharges
   */
  
  /**
   * @constructor
   * @param {Charge} charge
   * @param {number} gid
   */
  function ChargedSkill (charge, gid) {
    this.skill = charge.skill;
    this.level = charge.level;
    this.charges = charge.charges;
    this.maxcharges = charge.maxcharges;
    this.gid = gid;
  }

  /** @type {Array<number>} */
  const currentChargedSkills = [];
  /** @type {Array<ChargedSkill>[]} */
  const [chargedSkills, chargedSkillsOnSwitch] = [[], []];

  // Item must be equipped - removed charms as I don't think at any point using hydra from torch has ever been worth it
  me.getItemsEx(-1)
    .filter(item => item && ((item.isEquipped && !item.rare)))
    .forEach(function (item) {
      let stats = item.getStat(-2);
      if (!stats.hasOwnProperty(sdk.stats.ChargedSkill)) return;
      
      /** @type {Array<Charge> | Charge} */
      let charges = stats[sdk.stats.ChargedSkill];
      // simplfy calc by making it an array if it isn't already
      if (!(charges instanceof Array)) charges = [charges];

      for (let charge of charges) {
        if (!charge || !charge.hasOwnProperty("skill")) continue;
        // add to total list of skillIds
        if (charge.charges > 0 && !currentChargedSkills.includes(charge.skill)) {
          currentChargedSkills.push(charge.skill);
          chargedSkills.push(new ChargedSkill(charge, item.gid));
        }

        // add to switch only list for use with swtich casting
        if (charge.charges > 0
          && !chargedSkillsOnSwitch.some(cSk => cSk.skill === charge.skill)
          && item.isOnSwap) {
          chargedSkillsOnSwitch.push(new ChargedSkill(charge, item.gid));
        }
      }
    });

  // only update other threads if this isn't being called from Attack.init
  if (CharData.skillData.currentChargedSkills.length > 0 || init) {
    switch (true) {
    case !currentChargedSkills.equals(CharData.skillData.currentChargedSkills):
    case Object.keys(Misc.recursiveSearch(chargedSkillsOnSwitch, CharData.skillData.chargedSkillsOnSwitch)).length > 0:
    case Object.keys(Misc.recursiveSearch(chargedSkills, CharData.skillData.chargedSkills)).length > 0:
      CharData.skillData.init(currentChargedSkills, chargedSkills, chargedSkillsOnSwitch);
      break;
    }
  }

  return true;
};

/**
 * @param {number} skillId 
 * @returns {boolean}
 */
Attack.getItemCharges = function (skillId) {
  if (!skillId) return false;

  /** @param {Charge} itemCharge */
  let validCharge = function (itemCharge) {
    return itemCharge.skill === skillId && itemCharge.charges > 1;
  };
  
  let items = me.getItemsEx()
    .filter(function (item) {
      return item && item.isEquipped && !item.rare;
    });
  for (let item of items) {
    let stats = item.getStat(-2);
    if (!stats.hasOwnProperty(sdk.stats.ChargedSkill)) continue;

    /** @type {Array<Charge> | Charge} */
    let charges = stats[sdk.stats.ChargedSkill];
    // simplfy calc by making it an array if it isn't already
    if (!(charges instanceof Array)) charges = [charges];

    for (let charge of charges) {
      if (!charge || !charge.hasOwnProperty("skill")) continue;
      if (validCharge(charge)) return true;
    }
  }

  return false;
};

/**
 * @param {number} skillId 
 * @param {Monster} unit 
 * @returns {boolean}
 */
Attack.castCharges = function (skillId, unit) {
  if (!skillId || !unit || !Skill.wereFormCheck(skillId)
    || (me.inTown && !Skill.townSkill(skillId))) {
    return false;
  }

  try {
    me.castChargedSkillEx(skillId, unit) && delay(25);
  } finally {
    me.weaponswitch === 1 && me.switchWeapons(0);
  }

  return true;
};

/**
 * @param {number} skillId 
 * @param {Monster} unit 
 * @returns {boolean}
 */
Attack.switchCastCharges = function (skillId, unit) {
  if (!skillId || !unit || !Skill.wereFormCheck(skillId)
    || (me.inTown && !Skill.townSkill(skillId))) {
    return false;
  }

  try {
    me.castSwitchChargedSkill(skillId, unit) && delay(25);
  } finally {
    me.switchToPrimary();
  }

  return true;
};

/**
 * Position ourselves further from a doll to attack
 * @param {Monster} unit 
 * @returns {boolean}
 */
Attack.dollAvoid = function (unit) {
  if (!unit) return false;
  let distance = 14;

  for (let i = 0; i < 2 * Math.PI; i += Math.PI / 6) {
    let cx = Math.round(Math.cos(i) * distance);
    let cy = Math.round(Math.sin(i) * distance);
    if (Attack.validSpot(unit.x + cx, unit.y + cy)) {
      // don't clear while trying to reposition
      return Pather.moveToEx(unit.x + cx, unit.y + cy, { clearSettings: { allowClearing: false } });
    }
  }

  return false;
};

// Its the inverse of spotOnDistance, its a spot going in the direction of the spot
Attack.inverseSpotDistance = function (spot, distance, otherSpot) {
  otherSpot === undefined && (otherSpot = me);
  let x = otherSpot.x, y = otherSpot.y, area = otherSpot.area;
  let nodes = getPath(area, x, y, spot.x, spot.y, 2, 5);
  return nodes && nodes.find(function (node) {
    return node.distance > distance;
  }) || { x: x, y: y };
};

/**
 * @param {PathNode} coord 
 * @param {Monster} monster 
 * @returns {boolean}
 */
Attack.shouldDodge = function (coord, monster) {
  return !!monster && getUnits(sdk.unittype.Missile)
    .filter(function (missile) {
      // for every missle that isnt from our merc
      return missile && monster && monster.gid === missile.owner;
    })
    .some(function (missile) {
      // if any
      let xoff = Math.abs(coord.x - missile.targetx);
      let yoff = Math.abs(coord.y - missile.targety);
      let xdist = Math.abs(coord.x - missile.x);
      let ydist = Math.abs(coord.y - missile.y);

      // If missile wants to hit is and is close to us
      return xoff < 7 && yoff < 7 && xdist < 13 && ydist < 13;
    });
};

new Overrides.Override(Attack,
  Attack.sortMonsters,
  /**
   * @override
   * @param {(a: Monster, b: Monster) => number} orignal 
   * @param {Monster} unitA 
   * @param {Monster} unitB 
   * @returns {number}
   */
  function (orignal, unitA, unitB) {
    /** @param {Monster} m */
    const stateCheck = function (m) {
      return [sdk.states.Fanaticism, sdk.states.Conviction]
        .some(function (state) {
          return m.getState(state);
        });
    };
    if ((unitA.isSpecial && stateCheck(unitA)) && (unitB.isSpecial && stateCheck(unitB))) {
      return getDistance(me, unitA) - getDistance(me, unitB);
    }
    if (unitA.isSpecial && stateCheck(unitA)) return -1;
    if (unitB.isSpecial && stateCheck(unitB)) return 1;
    return orignal(unitA, unitB);
  }
).apply();

/**
 * @param {Monster} unitA 
 * @param {Monster} unitB 
 */
Attack.walkingSortMonsters = function (unitA, unitB) {
  // sort main bosses first
  if ((unitA.isPrimeEvil) && (unitB.isPrimeEvil)) {
    return getDistance(me, unitA) - getDistance(me, unitB);
  }
  if (unitA.isPrimeEvil) return -1;
  if (unitB.isPrimeEvil) return 1;

  // Barb optimization
  if (me.barbarian) {
    let skillElm = Attack.getSkillElement(Config.AttackSkill[(unitA.isSpecial) ? 1 : 3]);
    if (!Attack.checkResist(unitA, skillElm)) {
      return 1;
    }

    if (!Attack.checkResist(unitB, skillElm)) {
      return -1;
    }
  }

  // Put monsters under Attract curse at the end of the list - They are helping us
  if (unitA.getState(sdk.states.Attract)) return 1;
  if (unitB.getState(sdk.states.Attract)) return -1;

  const ids = [
    sdk.monsters.OblivionKnight1, sdk.monsters.OblivionKnight2, sdk.monsters.OblivionKnight3,
    sdk.monsters.FallenShaman, sdk.monsters.CarverShaman, sdk.monsters.CarverShaman2,
    sdk.monsters.DevilkinShaman, sdk.monsters.DevilkinShaman2, sdk.monsters.DarkShaman1,
    sdk.monsters.DarkShaman2, sdk.monsters.WarpedShaman, sdk.monsters.HollowOne, sdk.monsters.Guardian1,
    sdk.monsters.Guardian2, sdk.monsters.Unraveler1, sdk.monsters.Unraveler2,
    sdk.monsters.Ancient1, sdk.monsters.BaalSubjectMummy, sdk.monsters.BloodRaven, sdk.monsters.RatManShaman,
    sdk.monsters.FetishShaman, sdk.monsters.FlayerShaman1, sdk.monsters.FlayerShaman2,
    sdk.monsters.SoulKillerShaman1, sdk.monsters.SoulKillerShaman2, sdk.monsters.StygianDollShaman1,
    sdk.monsters.StygianDollShaman2, sdk.monsters.FleshSpawner1, sdk.monsters.FleshSpawner2,
    sdk.monsters.StygianHag, sdk.monsters.Grotesque1, sdk.monsters.Ancient2, sdk.monsters.Ancient3,
    sdk.monsters.Grotesque2, sdk.monsters.FoulCrowNest, sdk.monsters.BlackVultureNest,
    sdk.monsters.BloodHawkNest, sdk.monsters.BloodHookNest, sdk.monsters.BloodWingNest,
    sdk.monsters.CloudStalkerNest, sdk.monsters.FeederNest, sdk.monsters.SuckerNest
  ];

  if (!me.inArea(sdk.areas.ClawViperTempleLvl2)
    && ids.includes(unitA.classid)
    && ids.includes(unitB.classid)) {
    // Kill "scary" uniques first (like Bishibosh)
    if ((unitA.isUnique) && (unitB.isUnique)) {
      return getDistance(me, unitA) - getDistance(me, unitB);
    }
    if (unitA.isUnique) return -1;
    if (unitB.isUnique) return 1;

    return getDistance(me, unitA) - getDistance(me, unitB);
  }

  if (ids.includes(unitA.classid)) return -1;
  if (ids.includes(unitB.classid)) return 1;

  if ((unitA.isSuperUnique) && (unitB.isSuperUnique)) {
    return getDistance(me, unitA) - getDistance(me, unitB);
  }
  if (unitA.isSuperUnique) return -1;
  if (unitB.isSuperUnique) return 1;

  // fallens are annoying, put them later if we have line of sight of another monster
  if (unitA.isFallen && unitB.isFallen) {
    return getDistance(me, unitA) - getDistance(me, unitB);
  }
  const _coll = (sdk.collision.BlockWall | sdk.collision.LineOfSight | sdk.collision.Ranged);
  if (!unitA.isFallen && !checkCollision(me, unitA, _coll)) return -1;
  if (!unitB.isFallen && !checkCollision(me, unitA, _coll)) return 1;

  return getDistance(me, unitA) - getDistance(me, unitB);
};

Attack.pwnDury = function () {
  const getDuriel = function () {
    return Game.getMonster(sdk.monsters.Duriel);
  };
  let duriel = Misc.poll(getDuriel);

  if (!duriel) return false;
  const tick = getTickCount();
  const gid = duriel.gid;
  const saveSpots = [
    { x: 22648, y: 15688 },
    { x: 22624, y: 15725 },
  ];

  // @todo - keep track of last position to attempt relocating dury if we've lost reference
  try {
    Attack.stopClear = true;
    while (!duriel.dead) {
      if (getTickCount() - tick > Time.minutes(10)) {
        break;
      }
      if (!duriel || !copyUnit(duriel).x) {
        duriel = Misc.poll(getDuriel, 1000, 80);
        if (!duriel || !duriel.attackable) return true;
      }
      //ToDo; figure out static
      if (duriel.getState(sdk.states.Frozen) && duriel.distance < 7 || duriel.distance < 12) {
        let safeSpot = saveSpots.sort(function (a, b) {
          return getDistance(duriel, b) - getDistance(duriel, a);
        }).first();
        Pather.teleportTo(safeSpot.x, safeSpot.y);
      }
      ClassAttack.doAttack(duriel, true);
    }
  } finally {
    Attack.stopClear = false;
  }

  return true;
};

Attack.pwnMeph = function () {
  // TODO: fill out
};

// Credit @Jaenster - modified by me(theBGuy) for other classes
Attack.pwnDia = function () {
  // Can't farcast if our skill main attack isn't meant for it
  if ((!me.sorceress && !me.necromancer && !me.assassin)
    || (["Poison", "Summon"].includes(SetUp.currentBuild))
    || (Skill.getRange(Config.AttackSkill[1]) < 10)) {
    return false;
  }

  const calculateSpots = function (center, skillRange) {
    let coords = [];
    for (let i = 0; i < 360; i++) {
      coords.push({
        x: Math.floor(center.x + skillRange * Math.cos(i) + 0.5),
        y: Math.floor(center.y + skillRange * Math.sin(i) + 0.5),
      });
    }
    // only unique spots
    return coords.filter(function (e, i, s) {
      return s.indexOf(e) === i;
    }).filter(function (el) {
      return Attack.validSpot(el.x, el.y);
    });
  };

  const checkMobs = function () {
    let mobs = getUnits(sdk.unittype.Monster).filter(function (el) {
      return !!el && el.attackable && el.classid !== sdk.monsters.Diablo && el.distance < 20;
    });
    return mobs;
  };

  const getDiablo = function () {
    let check = checkMobs();
    !!check && Attack.clearList(check);
    return Game.getMonster(sdk.monsters.Diablo);
  };
  {
    let nearSpot = Pather.spotOnDistance({ x: 7792, y: 5292 }, 35, { returnSpotOnError: false });
    Pather.moveToUnit(nearSpot);
  }

  let dia = Misc.poll(getDiablo, 15e3, 30);

  if (!dia) {
    // Move to Star
    Pather.moveTo(7788, 5292, 3, 30);
    dia = Misc.poll(getDiablo, 15e3, 30);
  }

  if (!dia) {
    console.log("No diablo");
    return false;
  }

  let tick = getTickCount();
  let lastPosition = { x: 7791, y: 5293 };
  let manaTP, manaSK, manaStatic, rangeStatic;
  let [minDist, maxDist, minRange, maxRange] = (() => {
    // set values
    switch (me.classid) {
    case sdk.player.class.Sorceress:
      [manaTP, manaSK] = [Skill.getManaCost(sdk.skills.Teleport), Skill.getManaCost(Config.AttackSkill[1])];
      [manaStatic, rangeStatic] = [Skill.getManaCost(sdk.skills.StaticField), Skill.getRange(sdk.skills.StaticField)];

      switch (Config.AttackSkill[1]) {
      case sdk.skills.FrozenOrb:
        return [15, 20, 10, 20];
      case sdk.skills.Lightning:
        return [20, 25, 18, 25];
      default:
      case sdk.skills.Blizzard:
      case sdk.skills.Meteor:
        return [40, 45, 15, 58];
      }
    case sdk.player.class.Necromancer:
      return [35, 40, 15, 50];
    case sdk.player.class.Assassin:
      return [25, 30, 15, 30];
    default:
      return [15, 20, 10, 20];
    }
  })();
  
  const shouldWalk = function (spot) {
    if (!Pather.canTeleport()) return true;
    return (spot.distance < 10 || me.gold < 10000 || me.mpPercent < 50);
  };

  Attack.stopClear = true;

  do {
    // give up in 10 minutes
    if (getTickCount() - tick > Time.minutes(10)) {
      break;
    }

    while ((dia = getDiablo())) {
      if (dia.dead) {
        me.overhead("Diablo's dead");
        break;
      }

      if (getDistance(me, dia) < minDist || getDistance(me, dia) > maxDist || getTickCount() - tick > 25e3) {
        let spot = calculateSpots(dia, ((minRange + maxRange) / 2))
          .filter(function (loc) {
            return getDistance(me, loc) > minRange && getDistance(me, loc) < maxRange; /*todo, in neighbour room*/
          })
          .filter(function (loc) {
            let collision = getCollision(me.area, loc.x, loc.y);
            // noinspection JSBitwiseOperatorUsage
            let isLava = !!(collision & Coords_1.BlockBits.IsOnFloor);
            // this spot is on lava, fuck this
            if (isLava) return false;
            // noinspection JSBitwiseOperatorUsage
            return !(collision & (Coords_1.BlockBits.BlockWall));
          })
          .sort(function (a, b) {
            return getDistance(me, a) - getDistance(me, b);
          })
          .first();
        tick = getTickCount();
        if (spot !== undefined) {
          shouldWalk(spot)
            ? Pather.walkTo(spot.x, spot.y)
            : Pather.move(spot, { allowClearing: false, retry: 15 });
        }
      }

      if (me.sorceress && me.mp < manaSK + manaTP) {
        me.overhead("Dont attack, save mana for teleport");
        delay(10);
        continue;
      }

      if (me.necromancer || me.assassin) {
        me.overhead("FarCasting: Diablo's health " + dia.hpPercent + " % left");
        ClassAttack.farCast(dia);
      } else {
        // If we got enough mana to teleport close to diablo, static the bitch, and jump back
        let diabloMissiles = getUnits(sdk.unittype.Missile).filter(function (unit) {
          let _a;
          return ((_a = unit.getParent()) === null || _a === void 0 ? void 0 : _a.gid) === dia.gid;
        });
        console.log("Diablo missiles: " + diabloMissiles.length);
        console.log("Diablo mode:" + dia.mode);
        me.overhead("Dia life " + (~~(dia.hp / 128 * 100)).toString() + "%");
        if (me.mp > manaStatic + manaTP + manaTP
          && diabloMissiles.length < 3 && !dia.attacking
          && dia.hpPercent > Config.CastStatic) {
          let [x, y] = me;
          ClassAttack.switchCurse(dia, true); // curse him if we can
          // re-check his mode
          if (!dia.attacking) {
            // Find a spot close to Diablo
            let spot = Pather.spotOnDistance(dia, rangeStatic * (2 / 3), { returnSpotOnError: false });
            Pather.moveToEx(spot.x, spot.y, { allowClearing: false });
            Skill.cast(sdk.skills.StaticField);
            // move back to previous spot
            Pather.moveToEx(x, y, { allowClearing: false });
          }
        }
        Skill.cast(Config.AttackSkill[1], sdk.skills.hand.Right, dia);

        if (!!dia && !checkCollision(me, dia, Coords_1.Collision.BLOCK_MISSILE)
          && Skill.getRange(Config.AttackSkill[2]) > 15) {
          Skill.cast(Config.AttackSkill[2], sdk.skills.hand.Right, dia);
        }
      }
    }

    if (dia && dia.dead) {
      break;
    }

    if (!dia) {
      let path = getPath(me.area, me.x, me.y, lastPosition.x, lastPosition.y, 1, 5);

      // failed to make a path from me to the old spot
      if (!path) {
        break;
      }

      // walk close to old node, if we dont find dia continue
      if (!path.some(function (node) {
        Pather.walkTo(node.x, node.y);
        return getDiablo();
      })) {
        break;
      }
    }
  } while (true);

  !!dia ? Pather.moveTo(dia) : Pather.moveTo(7774, 5305);
  Pickit.pickItems();
  Pather.moveTo(7792, 5291);	// Move back to star
  Pickit.pickItems();
  Attack.stopClear = false;

  return dia;
};

Attack.pwnAncients = function () {
  // @todo fillout
};

/**
 * @param {Monster} unit 
 * @param {number} distance 
 * @param {number} spread 
 * @param {number} range 
 * @returns {boolean}
 */
Attack.deploy = function (unit, distance = 10, spread = 5, range = 9) {
  !unit && (unit = me);
  let index, currCount;
  let count = 999;
  let monList = (this.buildMonsterList() || []).sort(Sort.units);

  if (this.getMonsterCount(me.x, me.y, 15, monList) === 0) return true;

  CollMap.getNearbyRooms(unit.x, unit.y);
  let grid = this.buildGrid(unit.x - distance, unit.x + distance, unit.y - distance, unit.y + distance, spread);

  if (!grid.length) return false;
  grid.sort(function (a, b) {
    return getDistance(b.x, b.y, unit.x, unit.y) - getDistance(a.x, a.y, unit.x, unit.y);
  });

  let lines = new WeakMap();
  for (let { x, y } of grid) {
    lines.set(new Line(x + 1, y + 1, x, y, 0x62, true));
  }

  for (let i = 0; i < grid.length; i += 1) {
    if (!(CollMap.getColl(grid[i].x, grid[i].y, true) & sdk.collision.BlockWall)
      && !CollMap.checkColl(unit, { x: grid[i].x, y: grid[i].y }, sdk.collision.Ranged)) {
      currCount = this.getMonsterCount(grid[i].x, grid[i].y, range, monList);

      if (currCount < count) {
        index = i;
        count = currCount;
      }

      if (currCount === 0) {
        break;
      }
    }
  }

  return typeof index === "number"
    ? Pather.move(grid[index], { allowNodeActions: false })
    : false;
};

/**
 * Attempt to find non blocked position to attack from
 * @param {Monster} unit 
 * @param {number} distance 
 * @param {number} coll 
 * @param {boolean} walk 
 * @param {boolean} force 
 * @returns {boolean}
 * @todo maybe recursion check?
 */
Attack.getIntoPosition = function (unit = false, distance = 0, coll = 0, walk = false, force = false) {
  if (!unit || !unit.x || !unit.y) return false;
  Developer.debugging.pathing && console.time("getIntoPosition");
  const useTele = Pather.useTeleport();
  const name = unit.hasOwnProperty("name") ? unit.name : "";
  const angle = Math.round(Math.atan2(me.y - unit.y, me.x - unit.x) * 180 / Math.PI);
  const angles = [0, 15, -15, 30, -30, 45, -45, 60, -60, 75, -75, 90, -90, 135, -135, 180];
  const caster = (force || (distance > 4 && !me.inTown && Skill.getRange(Config.AttackSkill[1]) > 8));
  const minMonCount = caster && distance < 8 ? 1 : 0;
  const _coll = (sdk.collision.WallOrRanged | sdk.collision.Objects | sdk.collision.IsOnFloor);
  const _pathSettings = { clearSettings: { allowClearing: !useTele, range: useTele ? 10 : 5, retry: 5 } };

  walk === true && (walk = 1);

  if (distance < 4 && (!unit.hasOwnProperty("mode") || !unit.dead)) {
    /**
     * if we are surrounded by monsters it can be near impossible to get into position
     * what would be good is if we are surrounded either pick an AoE skill and cast or
     * just attack whatever monster is the nearest to us, this would also be a good place
     * for necro's use of terror and barbs use of howl/leap/leapAttack/whirlwind
     */
    // we are actually able to walk to where we want to go, hopefully prevent wall hugging
    if (walk && (unit.distance < 8 || !CollMap.checkColl(me, unit, _coll))) {
      Pather.walkTo(unit.x, unit.y, 3);
    } else if (walk && (unit.distance < 4 && CollMap.checkColl(me, unit, sdk.collision.MonsterIsOnFloorDarkArea))) {
      console.debug("Are we in a doorway?");
      return true;
    } else {
      // don't clear while trying to reposition
      Pather.move(unit, _pathSettings);
    }

    return !CollMap.checkColl(me, unit, coll);
  }

  let count = 999;
  let potentialSpot = { x: null, y: null };
  let fullDistance = distance;

  const coords = [];
  const nearMobs = getUnits(sdk.unittype.Monster)
    .filter(function (m) {
      return m.getStat(sdk.stats.Alignment) !== 2;
    });
  for (let n = 0; n < 3; n += 1) {
    const temp = [];
    (n > 0) && (distance -= Math.floor(fullDistance / 3 - 1));

    for (let currAngle of angles) {
      const _angle = ((angle + currAngle) * Math.PI / 180);
      let cx = Math.round((Math.cos(_angle)) * distance + unit.x);
      let cy = Math.round((Math.sin(_angle)) * distance + unit.y);

      // ignore this spot as it's too close to our current position when we are forcing a new location
      if (force && [cx, cy].distance < distance) continue;
      if (Pather.checkSpot(cx, cy, sdk.collision.BlockWall, false)) {
        coords.push({ x: cx, y: cy });
        temp.push({ x: cx, y: cy });
      }
    }
    if (!temp.length) continue;

    coords.sort(Sort.units);
    
    // If one of the valid positions is a position I am at already - and we aren't trying to force a new spot
    if (!force) {
      for (let coord of temp) {
        if ((getDistance(me, coord.x, coord.y) < 1
          && !CollMap.checkColl(unit, { x: coord.x, y: coord.y }, _coll, 1))
          || (getDistance(me, coord.x, coord.y) <= 5 && me.getMobCount(6) > 2)) {
          return true;
        }
      }
    }
  }
  for (let coord of coords) {
    // Valid position found - no collision between the spot and the unit
    if (!CollMap.checkColl({ x: coord.x, y: coord.y }, unit, coll, 1)) {
      const currCount = nearMobs
        .filter(function (m) {
          return getDistance(coord.x, coord.y, m.x, m.y) < 8;
        }).length;

      // this might be a valid spot but also check the mob count at that node
      if (caster) {
        potentialSpot.x === null && (potentialSpot = { x: coord.x, y: coord.y });

        if (currCount < count) {
          count = currCount;
          potentialSpot = { x: coord.x, y: coord.y };
        }

        if (currCount > minMonCount) {
          continue;
        }
      }

      // I am already in my optimal position
      if (coord.distance < 3) return true;

      // we are actually able to walk to where we want to go, hopefully prevent wall hugging
      if (walk && (coord.distance < 6 || !CollMap.checkColl(me, unit, _coll))) {
        Pather.walkTo(coord.x, coord.y, 2);
      } else {
        Pather.move(coord, _pathSettings);
      }
      if (Developer.debugging.pathing) {
        console.log(
          sdk.colors.Purple + "SecondCheck :: " + sdk.colors.Yellow
          + "Moving to: x: " + coord.x + " y: " + coord.y
          + " mob amount: " + sdk.colors.NeonGreen + currCount
        );
        console.timeEnd("getIntoPosition");
      }
      return true;
    }
  }

  if (caster && potentialSpot.x !== null) {
    if (potentialSpot.distance < 3) return true;
    if ((function () {
      if (Pather.useTeleport() && Pather.teleportTo(potentialSpot.x, potentialSpot.y)) {
        return true;
      }
      switch (walk) {
      case 1:
        return Pather.walkTo(potentialSpot.x, potentialSpot.y, 2);
      case 2:
      default:
        if (potentialSpot.distance < 6 && !CollMap.checkColl(me, potentialSpot, sdk.collision.WallOrRanged)) {
          return Pather.walkTo(potentialSpot.x, potentialSpot.y, 2);
        }
        // return Pather.moveTo(potentialSpot.x, potentialSpot.y, 1);
        return Pather.move(potentialSpot, _pathSettings);
      }
    })()) {
      if (Developer.debugging.pathing) {
        console.log(
          sdk.colors.Orange + "DefaultCheck :: " + sdk.colors.Yellow
          + "Moving to: x: " + potentialSpot.x + " y: " + potentialSpot.y
          + " mob amount: " + sdk.colors.NeonGreen + count
        );
        console.timeEnd("getIntoPosition");
      }
      return true;
    }
  }

  console.warn("ÿc4Attackÿc0: Failed to get into valid position" + (name ? " for: " + name : ""));

  return false;
};

Attack.castableSpot = function (x = undefined, y = undefined) {
  // Just in case
  if (!me.area || !x || !y) return false;

  let result;

  try { // Treat thrown errors as invalid spot
    result = getCollision(me.area, x, y);
  } catch (e) {
    return false;
  }

  return !(result === undefined
    || !!(result & Coords_1.BlockBits.Casting)
    || !!(result & Coords_1.Collision.BLOCK_MISSILE)
    || (result & sdk.collision.Objects)
    || (result & sdk.collision.BlockWall));
};
