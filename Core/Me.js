/**
*  @filename    Me.js
*  @author      theBGuy
*  @desc        collection of me functions and prototypes
*
*/

includeIfNotIncluded("core/Prototypes.js");

/** @description me prototypes for soloplay with checks to ensure forwards compatibility */
if (!me.hasOwnProperty("maxNearMonsters")) {
  Object.defineProperty(me, "maxNearMonsters", {
    /** @returns {number} */
    get: function () {
      return Math.floor((4 * (1 / me.hpmax * me.hp)) + 1);
    }
  });
}

if (!me.hasOwnProperty("dualWielding")) {
  Object.defineProperty(me, "dualWielding", {
    /** @returns {boolean} */
    get: function () {
      // only classes that can duel wield
      if (!me.assassin && !me.barbarian) return false;
      let items = me.getItemsEx()
        .filter(function (item) {
          return item.isEquipped && item.isOnMain;
        });
      return items.length >= 2
        && items.every(function (item) {
          return !item.isShield && !getBaseStat("items", item.classid, "block");
        });
    }
  });
}

if (!me.hasOwnProperty("realFR")) {
  Object.defineProperty(me, "realFR", {
    /** @returns {number} */
    get: function () {
      return me.getStat(sdk.stats.FireResist);
    }
  });
}

if (!me.hasOwnProperty("realCR")) {
  Object.defineProperty(me, "realCR", {
    /** @returns {number} */
    get: function () {
      return me.getStat(sdk.stats.ColdResist);
    }
  });
}

if (!me.hasOwnProperty("realLR")) {
  Object.defineProperty(me, "realLR", {
    /** @returns {number} */
    get: function () {
      return me.getStat(sdk.stats.LightResist);
    }
  });
}

if (!me.hasOwnProperty("realPR")) {
  Object.defineProperty(me, "realPR", {
    /** @returns {number} */
    get: function () {
      return me.getStat(sdk.stats.PoisonResist);
    }
  });
}

if (!me.hasOwnProperty("FR")) {
  Object.defineProperty(me, "FR", {
    /** @returns {number} */
    get: function () {
      return Math.min(75 + this.getStat(sdk.stats.MaxFireResist), me.realFR - me.resPenalty);
    }
  });
}

if (!me.hasOwnProperty("CR")) {
  Object.defineProperty(me, "CR", {
    /** @returns {number} */
    get: function () {
      return Math.min(75 + this.getStat(sdk.stats.MaxColdResist), me.realCR - me.resPenalty);
    }
  });
}

if (!me.hasOwnProperty("LR")) {
  Object.defineProperty(me, "LR", {
    /** @returns {number} */
    get: function () {
      return Math.min(75 + this.getStat(sdk.stats.MaxLightResist), me.realLR - me.resPenalty);
    }
  });
}

if (!me.hasOwnProperty("PR")) {
  Object.defineProperty(me, "PR", {
    /** @returns {number} */
    get: function () {
      return Math.min(75 + this.getStat(sdk.stats.MaxPoisonResist), me.realPR - me.resPenalty);
    }
  });
}

if (!me.hasOwnProperty("className")) {
  Object.defineProperty(me, "className", {
    /** @returns {"Amazon" | "Sorceress" | "Necromancer" | "Paladin" | "Barbarian" | "Druid" | "Assassin" | false} */
    get: function () {
      return sdk.player.class.nameOf(me.classid);
    }
  });
}

/**
 * Soloplay specific but might as well keep with the format
 */
if (!me.hasOwnProperty("onFinalBuild")) {
  Object.defineProperty(me, "onFinalBuild", {
    /** @returns {boolean} */
    get: function () {
      return me.data.currentBuild === me.data.finalBuild;
    }
  });
}

if (!me.hasOwnProperty("mercid")) {
  Object.defineProperty(me, "mercid", {
    /**
     * Lazily resolves and caches the mercenary classid into me.data.merc.classid.
     * @returns {number} Mercenary classid, or 0 if no merc is present.
     */
    get: function () {
      return me.data.merc.classid || (function () {
        let merc = me.getMercEx();
        if (!merc) return 0;
        me.data.merc.classid = merc.classid;
        return merc.classid;
      })();
    }
  });
}

if (!me.hasOwnProperty("trueStr")) {
  Object.defineProperty(me, "trueStr", {
    /**
     * Lazily resolves and caches the character's raw strength into me.data.strength.
     * @returns {number}
     */
    get: function () {
      return me.data.strength || (function () {
        let str = me.rawStrength;
        me.data.strength = str;
        return str;
      })();
    }
  });
}

if (!me.hasOwnProperty("trueDex")) {
  Object.defineProperty(me, "trueDex", {
    /**
     * Lazily resolves and caches the character's raw dexterity into me.data.dexterity.
     * @returns {number}
     */
    get: function () {
      return me.data.dexterity || (function () {
        let dex = me.rawDexterity;
        me.data.dexterity = dex;
        return dex;
      })();
    }
  });
}

if (!me.hasOwnProperty("finalBuild")) {
  /** @type {Build | null} */
  let _finalBuild = null;

  Object.defineProperty(me, "finalBuild", {
    /**
     * Lazily requires and caches the character's final build module based on SetUp.finalBuild.
     * @returns {Build}
     */
    get: function () {
      if (_finalBuild) return _finalBuild;
      let className = me.className.toLowerCase();
      let build = (["Bumper", "Socketmule", "Imbuemule"].includes(SetUp.finalBuild)
        ? ["Javazon", "Cold", "Bone", "Hammerdin", "Whirlwind", "Wind", "Trapsin"][me.classid]
        : SetUp.finalBuild) + "Build";
      _finalBuild = require("../BuildFiles/" + className + "/" + className + "." + build);
      return _finalBuild;
    },
    /**
     * Only assigns when v has an AutoBuildTemplate property; otherwise silently ignored.
     * @param {Build} v
     */
    set: function (v) {
      if (v.hasOwnProperty("AutoBuildTemplate")) {
        // Object.assign(this.finalBuild, v);
        _finalBuild = v;
      }
    },
  });
}

if (!me.hasOwnProperty("currentBuild")) {
  /** @type {Build | null} */
  let _currentBuild = null;

  Object.defineProperty(me, "currentBuild", {
    /**
     * Lazily requires and caches the character's current build module based on SetUp.currentBuild.
     * @returns {Build}
     */
    get: function () {
      if (_currentBuild) return _currentBuild;
      let className = me.className.toLowerCase();
      let build = SetUp.currentBuild + "Build";
      _currentBuild = require("../BuildFiles/" + className + "/" + className + "." + build);
      return _currentBuild;
    },
    /**
     * Only assigns when v has an AutoBuildTemplate property; otherwise silently ignored.
     * @param {Build} v
     */
    set: function (v) {
      if (v.hasOwnProperty("AutoBuildTemplate")) {
        // Object.assign(this.currentBuild, v);
        _currentBuild = v;
      }
    },
  });
}

if (!me.hasOwnProperty("data")) {
  let _data = null;

  Object.defineProperty(me, "data", {
    /**
     * Lazily loads and caches character data, migrating older data-file shapes on first access.
     * @returns {MyData}
     */
    get: function () {
      if (_data) return _data;
      _data = CharData.getStats();
      // handle if it was an old data file
      if (!_data.hasOwnProperty("startTime")) {
        let oldData = copyObj(_data);
        _data = CharData.create();
        Object.assign(_data, oldData.me);
        Object.assign(_data.merc, oldData.merc);
        if (oldData.merc.hasOwnProperty("type")) {
          _data.merc.skillName = oldData.merc.type;
          _data.merc.skill = MercData.findByName(_data.merc.skillName, _data.merc.act).skill;
        }
      }
      return _data;
    },
    /**
     * Only assigns when v has a startTime property; otherwise silently ignored.
     * @param {MyData} v
     */
    set: function (v) {
      if (v.hasOwnProperty("startTime")) {
        _data = v;
      }
    },
  });

  Object.defineProperty(me, "update", {
    /**
     * Broadcasts this thread's me.data to every other running CharData thread.
     * @returns {void}
     */
    value: function () {
      let obj = JSON.stringify(copyObj(me.data));
      let myThread = getScript(true).name;
      CharData.threads.forEach(function (script) {
        let curr = getScript(script);
        if (curr && myThread !== curr.name) {
          curr.send("data--" + obj);
        }
      });
    },
  });
}

if (!me.hasOwnProperty("equipped")) {
  me.equipped = (function () {
    const _defaultsMap = new Map([
      ["gid", -1],
      ["classid", -1],
      ["name", ""],
      ["code", ""],
      ["fname", ""],
      ["quality", -1],
      ["ethereal", false],
      ["itemType", -1],
      ["strreq", -1],
      ["dexreq", -1],
      ["lvlreq", -1],
      ["sockets", -1],
      ["prefixnum", -1],
      ["suffixnum", -1],
    ]);

    /**
     * @constructor
     * @param {ItemUnit} item 
     */
    function EquippedItem (item) {
      /** @type {ItemUnit} */
      this._item = (item instanceof Unit)
        ? copyUnit(item)
        : null;
      /** @type {number} */
      this._gid = item
        ? item.gid
        : -1;
      /** @type {number} */
      this._bodylocation = item
        ? item.bodylocation
        : -1;

      return new Proxy(this, {
        /**
         * Proxy get trap: own properties first, then the wrapped item, then a documented default.
         * @param {EquippedItem} target
         * @param {string | symbol} prop
         * @returns {*}
         */
        get: function (target, prop) {
          if (prop in target) {
            return target[prop];
          }

          if (target._item && prop in target._item) {
            return target._item[prop];
          }

          return _defaultsMap.get(prop);
        }
      });
    }

    Object.defineProperties(EquippedItem.prototype, {
      location: {
        /** @this EquippedItem */
        get: function () {
          return this._item ? this._item.bodylocation : -1;
        },
      },
      durability: {
        /** @this EquippedItem */
        get: function () {
          return this._item ? this._item.durabilityPercent : -1;
        },
      },
      tier: {
        /** @this EquippedItem */
        get: function () {
          return this._item ? NTIP.GetTier(this._item) : -1;
        },
      },
      tierScore: {
        /** @this EquippedItem */
        get: function () {
          return this._item ? tierscore(this._item, 1, this._bodylocation) : -1;
        },
      },
      secondaryTier: {
        /** @this EquippedItem */
        get: function () {
          return this._item ? NTIP.GetSecondaryTier(this._item) : -1;
        },
      },
      socketed: {
        /** @this EquippedItem */
        get: function () {
          return this._item ? this._item.getItemsEx().length > 0 : false;
        },
      },
    });

    /**
     * @param {boolean} [strict=false]
     * @returns {boolean}
     */
    EquippedItem.prototype.twoHandedCheck = function (strict = false) {
      return this._item
        ? strict
          ? this._item.strictlyTwoHanded
          : this._item.twoHanded
        : false;
    };

    /**
     * @param {number} stat
     * @param {number} [subid]
     * @returns {number}
     */
    EquippedItem.prototype.getStat = function (stat, subid) {
      return this._item ? this._item.getStat(stat, subid) : -1;
    };

    /**
     * @param {number} stat
     * @param {number} [subid]
     * @returns {number}
     */
    EquippedItem.prototype.getStatEx = function (stat, subid) {
      return this._item ? this._item.getStatEx(stat, subid) : -1;
    };

    /** @type {Map<number, EquippedItem>} */
    const _bodyMap = new Map([
      [sdk.body.Head, new EquippedItem()],
      [sdk.body.Neck, new EquippedItem()],
      [sdk.body.Armor, new EquippedItem()],
      [sdk.body.RightArm, new EquippedItem()],
      [sdk.body.LeftArm, new EquippedItem()],
      [sdk.body.Gloves, new EquippedItem()],
      [sdk.body.RingRight, new EquippedItem()],
      [sdk.body.RingLeft, new EquippedItem()],
      [sdk.body.Belt, new EquippedItem()],
      [sdk.body.Feet, new EquippedItem()],
      [sdk.body.RightArmSecondary, new EquippedItem()],
      [sdk.body.LeftArmSecondary, new EquippedItem()],
    ]);

    // const _dummy = new EquippedItem();

    return {
      /**
       * @param {number} bodylocation 
       * @returns {EquippedItem}
       */
      get: function (bodylocation) {
        // if (!_bodyMap.has(bodylocation)) return _dummy;
        let item = _bodyMap.get(bodylocation);
        if (item._gid === -1
          || (item._gid !== item.gid
          || (item._bodylocation !== item.location && me.weaponswitch !== sdk.player.slot.Secondary))) {
          // item has changed - find the new item
          let newItem = me.getItemsEx()
            .filter(function (el) {
              return el.isEquipped && el.bodylocation === bodylocation;
            })
            .first();
          _bodyMap.set(bodylocation, new EquippedItem(newItem));
        }
        return _bodyMap.get(bodylocation);
      },
      /**
       * @param {number} bodylocation 
       * @returns {boolean}
       */
      has: function (bodylocation) {
        return _bodyMap.has(bodylocation);
      },
      /**
       * @param {number} bodylocation 
       * @param {ItemUnit} item
       */
      set: function (bodylocation, item) {
        if (_bodyMap.has(bodylocation) && item instanceof Unit) {
          _bodyMap.set(bodylocation, new EquippedItem(item));
        }
      },
      /** @description Initializes the equipped item map with the items currently equipped */
      init: function () {
        me.getItemsEx()
          .filter(function (item) {
            return item.isEquipped;
          })
          .forEach(function (item) {
            _bodyMap.set(item.bodylocation, new EquippedItem(item));
          });
      },
    };
  })();
}

if (!me.hasOwnProperty("telekinesis")) {
  Object.defineProperty(me, "telekinesis", {
    /** @returns {boolean} */
    get: function () {
      return Skill.haveTK;
    }
  });
}

me.canTpToTown = (function () {
  // can't tp from town or Uber Trist, and shouldn't tp from arreat summit
  const badTpAreas = [
    sdk.areas.RogueEncampment, sdk.areas.LutGholein, sdk.areas.KurastDocktown,
    sdk.areas.PandemoniumFortress, sdk.areas.Harrogath, sdk.areas.ArreatSummit, sdk.areas.UberTristram
  ];

  /** @returns {boolean} */
  return function () {
    // can't tp if dead - or not currently enabled to
    if (me.dead || SoloEvents.townChicken.disabled) return false;
    const myArea = me.area;
    if (badTpAreas.includes(myArea)) return false;
    // If we made it this far, we can only tp if we even have a tp
    return !!me.getTpTool();
  };
})();

/** @returns {MercUnit | null} */
me.getMercEx = function () {
  // mercrevivecost is non-zero only while the merc is dead; it reads 0 both when alive and when never hired
  if (!Config.UseMerc || me.classic || me.mercrevivecost) return null;
  let merc = Misc.poll(function () {
    return me.getMerc();
  }, 250, 50);

  return !!merc && !merc.dead ? merc : null;
};

/** @returns {ItemUnit[]} */
me.getEquippedItems = function () {
  return me.getItemsEx()
    .filter(function (item) {
      return item.isEquipped;
    });
};

/**
 * @param {number} bodyLoc
 * @returns {ItemUnit | null}
 */
me.getEquippedItem = function (bodyLoc) {
  if (!bodyLoc) return null;
  let equippedItem = me.getItemsEx()
    .filter(function (item) {
      return item.isEquipped && item.bodylocation === bodyLoc;
    });
  if (!equippedItem.length) return null;
  return equippedItem.first();
};

/** @param {number} bodyLoc */
me.getWeaponQuantityPercent = function (bodyLoc) {
  if (!bodyLoc) return 0;
  let weapon = me.getEquippedItem(bodyLoc);
  if (!weapon) return 0;
  return weapon.quantityPercent;
};

/**
 * @param {number} [classid=me.classid]
 * @returns {number[]}
 */
me.getSkillTabs = function (classid = me.classid) {
  return [
    [sdk.skills.tabs.BowandCrossbow, sdk.skills.tabs.PassiveandMagic, sdk.skills.tabs.JavelinandSpear],
    [sdk.skills.tabs.Fire, sdk.skills.tabs.Lightning, sdk.skills.tabs.Cold],
    [sdk.skills.tabs.Curses, sdk.skills.tabs.PoisonandBone, sdk.skills.tabs.NecroSummoning],
    [sdk.skills.tabs.PalaCombat, sdk.skills.tabs.Offensive, sdk.skills.tabs.Defensive],
    [sdk.skills.tabs.BarbCombat, sdk.skills.tabs.Masteries, sdk.skills.tabs.Warcries],
    [sdk.skills.tabs.DruidSummon, sdk.skills.tabs.ShapeShifting, sdk.skills.tabs.Elemental],
    [sdk.skills.tabs.Traps, sdk.skills.tabs.ShadowDisciplines, sdk.skills.tabs.MartialArts]
  ][classid];
};

// Danger is the damage expected over the next DANGER_HORIZON seconds as a share of the HP we hold
// above the chicken line, so one hard hitter, a fast pack still out of sight range, or ranged fire
// all count, and the same pack weighs more on a sorceress than on a barbarian.
(function () {
  const MonsterData = require("../Modules/GameData/MonsterData");
  const DANGER_HORIZON = 2;
  // 1 = the expected damage takes us down to the chicken line.
  const DANGER_THRESHOLD = 1;
  // Life percent treated as the floor when Config.LifeChicken is off.
  const DEFAULT_LIFE_FLOOR = 10;
  // Monsters swing roughly once a second once in reach (AI delay plus attack animation).
  const ATTACKS_PER_SEC = 1;
  const MELEE_REACH = 3;
  const RANGED_REACH = 12;
  // Beyond this nothing in the game closes the gap within the horizon.
  const SCAN_RADIUS = 40;
  // A missile whose shooter can't be costed is charged this share of max HP.
  const UNKNOWN_SHOOTER_HP_SHARE = 0.05;
  const dangerAuras = [sdk.states.Fanaticism, sdk.states.Conviction];
  // Unmeasured: no live hit under either aura has been sampled yet.
  const AURA_MULTIPLIER = 1.5;
  const dangerEnchants = [
    sdk.enchant.ManaBurn, sdk.enchant.LightningEnchanted, sdk.enchant.FireEnchanted
  ];
  // How far (in tiles) a missile's path may pass from the location and still count as a hit.
  const MISSILE_LANE = 3;
  /** @type {Map<number, { damaging: boolean, stationary: boolean }>} */
  const missileInfo = new Map();

  // missiles.txt "Skill" when the missile belongs to no skill.
  const NO_SKILL = 65535;

  /**
   * Damage comes from the missile's own row, its shooter (SrcDamage) or its skill (Fire Ball,
   * a shaman's fire bolt), and a skill missile only hurts if it collides. Measured on the
   * live table: this keeps 85 of the 86 missiles monsters fire (all but the catapult's
   * launch effect, whose child missile does the damage) and drops blood, glows and auras.
   * @param {number} classid
   */
  function getMissileInfo (classid) {
    let info = missileInfo.get(classid);
    if (!info) {
      const skill = Number(getBaseStat("missiles", classid, "Skill"));
      info = {
        damaging: Number(getBaseStat("missiles", classid, "MinDamage")) > 0
          || Number(getBaseStat("missiles", classid, "EMin")) > 0
          || Number(getBaseStat("missiles", classid, "SrcDamage")) > 0
          || (skill !== NO_SKILL && Number(getBaseStat("missiles", classid, "CollideType")) > 0),
        stationary: !Number(getBaseStat("missiles", classid, "Vel")),
      };
      missileInfo.set(classid, info);
    }
    return info;
  }

  /** @param {number} gid */
  function isHostilePlayer (gid) {
    return gid !== me.gid && getPlayerFlag(me.gid, gid, sdk.player.flag.Hostile);
  }

  /**
   * Who fired the missile, following missile-spawned missiles and merc/summon ownership.
   * Returns null when the shooter is us, our merc/summons, a friendly player or a town NPC;
   * monster is null when the shooter can't be costed (out of sight, or a hostile player).
   * @param {Unit} missile
   * @returns {{ monster: Monster | null } | null}
   */
  function getHostileShooter (missile) {
    /** @type {Unit} */
    let unit = missile;
    // A missile can be spawned by another missile (e.g. split or exploding shots).
    for (let i = 0; i < 3 && unit.type === sdk.unittype.Missile; i++) {
      const parent = unit.getParent();
      if (!parent || typeof parent !== "object") {
        // Owner out of sight: the missile still carries its owner's id and type.
        if (unit.ownertype === sdk.unittype.Player) {
          return isHostilePlayer(unit.owner) ? { monster: null } : null;
        }
        return unit.ownertype === sdk.unittype.Monster ? { monster: null } : null;
      }
      unit = parent;
    }

    if (unit.type === sdk.unittype.Player) {
      return isHostilePlayer(unit.gid) ? { monster: null } : null;
    }
    if (unit.type !== sdk.unittype.Monster) return null;

    // A merc or summon resolves to the player that owns it.
    const master = unit.getParent();
    if (master && typeof master === "object" && master.type === sdk.unittype.Player) {
      return isHostilePlayer(master.gid) ? { monster: null } : null;
    }
    const monster = /** @type {Monster} */ (unit);
    return monster.isNPC ? null : { monster: monster };
  }

  /**
   * Whether the missile threatens the location: a moving one whose path passes within
   * MISSILE_LANE of it ahead of the missile, or a stationary one lying within MISSILE_LANE.
   * @param {Unit} missile
   * @param {{ x: number, y: number }} loc
   * @param {boolean} stationary
   */
  function threatens (missile, loc, stationary) {
    const px = loc.x - missile.x;
    const py = loc.y - missile.y;
    if (stationary) return Math.sqrt(px * px + py * py) <= MISSILE_LANE;

    const dx = missile.targetx - missile.x;
    const dy = missile.targety - missile.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    // No target to read a heading from.
    if (!missile.targetx || !missile.targety || length === 0) return false;

    const ux = dx / length;
    const uy = dy / length;
    // Behind the missile: it is flying away from the location.
    if (px * ux + py * uy < 0) return false;
    return Math.abs(px * uy - py * ux) <= MISSILE_LANE;
  }

  /** @typedef {{ physical: number, elements: { type: number, damage: number }[] }} HitProfile */
  /** @type {{ area: number, hits: Map<string, HitProfile> }} */
  const hitCache = { area: -1, hits: new Map() };
  // monstats El*Mode values for the two attack animations elemental damage can ride on.
  const ATTACK1_MODE = 4;
  const ATTACK2_MODE = 5;
  // monstats El*Type -> [resist stat, max-resist stat]; other types (drains, stun) do no damage.
  /** @type {{ [type: string]: number[] }} */
  const ELEMENT_RESISTS = {
    1: [sdk.stats.FireResist, sdk.stats.MaxFireResist],
    2: [sdk.stats.LightResist, sdk.stats.MaxLightResist],
    3: [sdk.stats.MagicResist, sdk.stats.MaxMagicResist],
    4: [sdk.stats.ColdResist, sdk.stats.MaxColdResist],
    5: [sdk.stats.PoisonResist, sdk.stats.MaxPoisonResist],
  };

  /**
   * Base damage that monstats' damage percentages apply to, for a monster of this level:
   * MonLvl.txt's DM (classic) or L-DM (expansion) column for the difficulty, the row being the
   * level. Needs D2BS's "monlvl" table.
   * @param {number} level
   */
  function baseDamage (level) {
    const column = (me.classic ? "DM" : "L-DM") + ["", "(N)", "(H)"][me.diff];
    return Number(getBaseStat("monlvl", level, column)) || 0;
  }

  /** @param {number | string | undefined} a @param {number | string | undefined} b */
  function mean (a, b) {
    return ((Number(a) || 0) + (Number(b) || 0)) / 2;
  }

  /**
   * What one hit from this monster deals before our resists, split by element. Physical and
   * elemental columns are both percentages of the level's base damage (their Nightmare/Hell
   * values stay flat while monster level climbs). The unit's own level is exact where GameData's
   * area level is not: Nightmare bosses and Hell elites sit above it. Cached per area (party size).
   * @param {Monster} mon
   * @returns {HitProfile}
   */
  function hitProfile (mon) {
    if (hitCache.area !== me.area) {
      hitCache.area = me.area;
      hitCache.hits.clear();
    }
    const classid = mon.classid;
    const level = Number(mon.getStat(sdk.stats.Level)) || Number(GameData.monsterLevel(classid, me.area)) || 0;
    const key = classid + ":" + level;
    let profile = hitCache.hits.get(key);
    if (profile) return profile;
    const data = MonsterData.get(classid);
    profile = { physical: 0, elements: [] };
    if (data) {
      const base = baseDamage(level) * (Number(GameData.monsterDamageModifier()) || 1) / 100;
      const attack1 = mean(data.Attack1MinDmg, data.Attack1MaxDmg);
      const attack2 = mean(data.Attack2MinDmg, data.Attack2MaxDmg);
      const skill1 = mean(data.Skill1MinDmg, data.Skill1MaxDmg);
      const swings = [attack1, attack2, skill1].filter(function (d) { return d > 0; });
      profile.physical = swings.length
        ? swings.reduce(function (sum, d) { return sum + d; }, 0) / swings.length * base
        : 0;
      // An element rides one attack animation, so it lands on that share of the swings.
      const attackModes = (attack1 > 0 ? 1 : 0) + (attack2 > 0 ? 1 : 0) || 1;
      const sfx = ["", "(N)", "(H)"][me.diff];
      for (let i = 1; i <= 3; i++) {
        const type = Number(getBaseStat("monstats", classid, "El" + i + "Type"));
        const mode = Number(getBaseStat("monstats", classid, "El" + i + "Mode"));
        if (!ELEMENT_RESISTS[type] || (mode !== ATTACK1_MODE && mode !== ATTACK2_MODE)) continue;
        const chance = (Number(getBaseStat("monstats", classid, "El" + i + "Pct" + sfx)) || 0) / 100;
        const damage = chance * mean(
          getBaseStat("monstats", classid, "El" + i + "MinD" + sfx),
          getBaseStat("monstats", classid, "El" + i + "MaxD" + sfx)
        ) * base / attackModes;
        damage > 0 && profile.elements.push({ type: type, damage: damage });
      }
    }
    hitCache.hits.set(key, profile);
    return profile;
  }

  /**
   * Our resist to each damage type as the game applies it: the stat (shrines and potions
   * included) less the difficulty penalty, between -100 and 75 + max-resist (95 at most).
   * Magic resist takes no difficulty penalty.
   * @returns {{ physical: number, [type: string]: number }} share of each type that gets through
   */
  function damageTaken () {
    const penalty = me.classic ? [0, 20, 50][me.diff] : [0, 40, 100][me.diff];
    /** @type {{ physical: number, [type: string]: number }} */
    // Physical resist caps at 50 and goes negative under curses (Amplify Damage: -100, measured live).
    const taken = { physical: 1 - Math.max(-100, Math.min(50, me.getStat(sdk.stats.DamageResist) || 0)) / 100 };
    for (let type in ELEMENT_RESISTS) {
      const stats = ELEMENT_RESISTS[type];
      const cap = Math.min(95, 75 + (me.getStat(stats[1]) || 0));
      const resist = (me.getStat(stats[0]) || 0) - (Number(type) === 3 ? 0 : penalty);
      taken[type] = 1 - Math.max(-100, Math.min(cap, resist)) / 100;
    }
    return taken;
  }

  /**
   * Damage one hit from this monster deals to us after damage reduction and resists.
   * @param {Monster} mon
   * @param {{ physical: number, [type: string]: number }} taken
   */
  function hitDamage (mon, taken) {
    const profile = hitProfile(mon);
    let damage = profile.physical * taken.physical;
    for (let element of profile.elements) {
      damage += element.damage * taken[element.type];
    }
    return damage * auraMultiplier(mon);
  }

  /**
   * Fanaticism or Conviction makes a pack hit harder. Elites get no bump of their own: live hits
   * from uniques, champions and bosses measured ~1x this model in Normal and Hell (657-hit rig sample).
   * @param {Monster} mon
   */
  function auraMultiplier (mon) {
    return dangerAuras.some(function (state) { return mon.getState(state); }) ? AURA_MULTIPLIER : 1;
  }

  /**
   * Seconds before the monster can hit the location. Monstats speed is coordinate units per
   * second (measured live at 0.6-0.9x of it), so the run speed is a safe upper bound.
   * @param {Monster} mon
   * @param {{ x: number, y: number }} loc
   */
  function secondsToReach (mon, loc) {
    const reach = getBaseStat("monstats", mon.classid, "RangedType") ? RANGED_REACH : MELEE_REACH;
    const gap = getDistance(loc.x, loc.y, mon) - reach;
    if (gap <= 0) return 0;
    const data = MonsterData.get(mon.classid);
    if (!data) return 0;
    let speed = Math.max(Number(data.Velocity) || 0, Number(data.Run) || 0);
    if (mon.getState(sdk.states.Frozen)) {
      speed *= Math.max(0, 100 + (Number(data.ColdEffect) || 0)) / 100;
    }
    return speed > 0 ? gap / speed : Infinity;
  }

  /**
   * @param {{ x: number; y: number } | MeType} [checkLoc]
   * @returns {{ x: number, y: number }}
   */
  function locationOf (checkLoc) {
    return typeof checkLoc !== "undefined" && checkLoc.hasOwnProperty("x") ? checkLoc : me;
  }

  /**
   * HP we can lose before life drops to the chicken threshold (Config.LifeChicken, or
   * DEFAULT_LIFE_FLOOR percent when that is off); hpPercent <= LifeChicken is what chickens.
   */
  function hpAboveFloor () {
    const floor = Config.LifeChicken > 0 ? Config.LifeChicken : DEFAULT_LIFE_FLOOR;
    return me.hp - me.hpmax * floor / 100;
  }

  /**
   * Damage expected at the location over the next DANGER_HORIZON seconds, as a share of the HP
   * above the chicken line: 1 means we expect to reach it. At or under the line any damage scores.
   * @param {{ x: number; y: number } | MeType} [checkLoc]
   * @returns {number}
   */
  me.dangerScore = function (checkLoc) {
    const loc = locationOf(checkLoc);
    const taken = damageTaken();
    let expected = 0;
    let worstHit = 0;
    // Monsters already scored over the horizon: their missiles in flight are among those hits.
    /** @type {Set<number>} */
    const scored = new Set();

    for (let mon of getUnits(sdk.unittype.Monster)) {
      if (!mon || !mon.attackable || mon.isFrozen || getDistance(loc.x, loc.y, mon) > SCAN_RADIUS) continue;
      const hit = hitDamage(mon, taken);
      worstHit = Math.max(worstHit, hit);
      const active = DANGER_HORIZON - secondsToReach(mon, loc);
      if (active > 0) {
        expected += hit * ATTACKS_PER_SEC * active;
        scored.add(mon.gid);
      }
    }

    for (let missile of getUnits(sdk.unittype.Missile)) {
      if (!missile || getDistance(loc.x, loc.y, missile) > SCAN_RADIUS) continue;
      const info = getMissileInfo(missile.classid);
      if (!info.damaging || !threatens(missile, loc, info.stationary)) continue;
      const shooter = getHostileShooter(missile);
      if (!shooter || (shooter.monster && scored.has(shooter.monster.gid))) continue;
      expected += shooter.monster
        ? hitDamage(shooter.monster, taken)
        : Math.max(worstHit, me.hpmax * UNKNOWN_SHOOTER_HP_SHARE);
    }

    return expected / Math.max(1, hpAboveFloor());
  };

  /**
   * True when the expected damage over the next few seconds would take life to the chicken
   * threshold, or an enchanted elite (mana burn, lightning or fire enchanted) is within range.
   * @param {{ x: number; y: number } | MeType} [checkLoc]
   * @param {number} [range=10] radius for the enchanted-elite check
   * @returns {boolean}
   */
  me.inDanger = function (checkLoc, range) {
    if (me.dangerScore(checkLoc) >= DANGER_THRESHOLD) return true;
    const loc = locationOf(checkLoc);
    range === undefined && (range = 10);
    return getUnits(sdk.unittype.Monster).some(function (mon) {
      return mon && mon.attackable && getDistance(loc.x, loc.y, mon) < range
        && dangerEnchants.some(function (chant) { return mon.getEnchant(chant); });
    });
  };
})();

/**
 * @param {number} skillId 
 * @param {number} subId 
 * @returns boolean
 * @description small function to force boolean return value when checking if we have a skill
 */
me.checkSkill = function (skillId = 0, subId = 0) {
  return !!me.getSkill(skillId, subId);
};

/** @returns {boolean} */
me.switchToPrimary = function () {
  if (me.classic) return true;
  return me.switchWeapons(sdk.player.slot.Main);
};

/** @returns {boolean} */
me.switchToSecondary = function () {
  if (me.classic) return true;
  return me.switchWeapons(sdk.player.slot.Secondary);
};

/**
 * @description Check if healing is needed, based on character config
 * @returns {boolean}
 */
me.needHealing = function () {
  if (me.hpPercent <= Config.HealHP || me.mpPercent <= Config.HealMP) {
    if (me.hpPercent >= 90 && me.mpPercent >= 90
      && Town.getDistance(Town.tasks.get(me.act).Heal) > 10) {
      // it's not convenient to heal right now, and we aren't in danger
      return false;
    }
    return true;
  }
  if (!Config.HealStatus) return false;
  // Status effects
  return ([
    sdk.states.Poison,
    sdk.states.AmplifyDamage,
    sdk.states.Frozen,
    sdk.states.Weaken,
    sdk.states.Decrepify,
    sdk.states.LowerResist
  ].some(function (state) {
    return me.getState(state);
  }));
};

/**
 * @param {number} [beltSize] - Defaults to Storage.BeltSize() when omitted.
 * @returns {boolean}
 */
me.cleanUpInvoPotions = function (beltSize) {
  beltSize === undefined && (beltSize = Storage.BeltSize());
  const beltMax = (beltSize * 4);
  /**
   * belt 4x4 locations
   * 12 13 14 15
   * 8  9  10 11
   * 4  5  6  7
   * 0  1  2  3
   */
  const beltCapRef = [(0 + beltMax), (1 + beltMax), (2 + beltMax), (3 + beltMax)];
  // check if we have empty belt slots
  let needCleanup = Storage.Belt.checkColumns(beltSize).some(slot => slot > 0);

  if (needCleanup) {
    const potsInInventory = me.getItemsEx()
      .filter(function (p) {
        return p.isInInventory
          && [
            sdk.items.type.HealingPotion,
            sdk.items.type.ManaPotion,
            sdk.items.type.RejuvPotion
          ].includes(p.itemType);
      })
      .sort(function (a, b) {
        return a.itemType - b.itemType;
      });

    if (potsInInventory.length > 0) {
      console.debug("We have potions in our invo, put them in belt before we perform townchicken check");
    }
    // Start interating over all the pots we have in our inventory
    beltSize > 1 && potsInInventory.forEach(function (p) {
      let moved = false;
      // get free space in each slot of our belt
      let freeSpace = Storage.Belt.checkColumns(beltSize);
      for (let i = 0; i < 4 && !moved; i += 1) {
        // checking that current potion matches what we want in our belt
        if (freeSpace[i] > 0 && p.code && p.code.startsWith(Config.BeltColumn[i])) {
          // Pick up the potion and put it in belt if the column is empty, and we don't have any other columns empty
          // prevents shift-clicking potion into wrong column
          if (freeSpace[i] === beltSize || freeSpace.some((spot) => spot === beltSize)) {
            let x = freeSpace[i] === beltSize
              ? i
              : (beltCapRef[i] - (freeSpace[i] * 4));
            Packet.placeInBelt(p, x);
          } else {
            clickItemAndWait(sdk.clicktypes.click.item.ShiftLeft, p.x, p.y, p.location);
          }
          Misc.poll(function () {
            return !me.itemoncursor;
          }, 300, 30);
          moved = Storage.Belt.checkColumns(beltSize)[i] === freeSpace[i] - 1;
        }
        Cubing.cursorCheck();
      }
    });
  }

  return true;
};

/**
 * @param {ItemUnit} tome
 * @param {number} scrollId
 * @returns {number} Count of scrolls successfully placed into the tome.
 */
me.cleanUpScrolls = function (tome, scrollId) {
  if (!tome || !scrollId) return 0;

  let cleanedUp = 0;
  let myScrolls = me.getItemsEx()
    .filter(function (el) {
      return el.isInInventory && el.classid === scrollId;
    });
  
  if (myScrolls.length) {
    try {
      // If we are at an npc already, open the window otherwise moving potions around fails
      if (getUIFlag(sdk.uiflags.NPCMenu) && !getUIFlag(sdk.uiflags.Shop)) {
        console.info(null, "Opening npc menu to clean up scrolls");
        Misc.useMenu(sdk.menu.Trade) || me.cancelUIFlags();
      }

      myScrolls.forEach(function (el) {
        if (tome && tome.getStat(sdk.stats.Quantity) < 20) {
          let currQuantity = tome.getStat(sdk.stats.Quantity);
          if (el.toCursor()) {
            new PacketBuilder()
              .byte(sdk.packets.send.ScrollToMe)
              .dword(el.gid)
              .dword(tome.gid)
              .send();
            Misc.poll(function () {
              return !me.itemoncursor;
            }, 100, 25);

            if (tome.getStat(sdk.stats.Quantity) > currQuantity) {
              console.info(null, "Placed scroll in tome");
              cleanedUp++;
            }
          } else {
            console.warn("failed to place scroll in tome");
          }
        }
      });
    } catch (e) {
      console.error(e);
      me.cancelUIFlags();
    }
  }

  return cleanedUp;
};

/** @returns {boolean} */
me.needBeltPots = function () {
  // we aren't using MinColumn if none of the values are set
  if (!Config.MinColumn.some(el => el > 0)) return false;
  // no hp pots or mp pots in Config.BeltColumn (who uses only rejuv pots?)
  if (!Config.BeltColumn.some(el => ["hp", "mp"].includes(el))) return false;
  
  // Start
  if (me.charlvl > 2 && me.gold > 1000) {
    let pots = { hp: [], mp: [], };
    const beltSize = Storage.BeltSize();
    
    // only run this bit if we aren't wearing a belt for now
    beltSize === 1 && me.cleanUpInvoPotions(beltSize);
    // now check what's in our belt
    me.getItemsEx(-1, sdk.items.mode.inBelt)
      .filter(function (p) {
        return p.x < 4
          && [sdk.items.type.HealingPotion, sdk.items.type.ManaPotion].includes(p.itemType);
      })
      .forEach(function (p) {
        if (p.itemType === sdk.items.type.HealingPotion) {
          pots.hp.push(copyUnit(p));
        } else if (p.itemType === sdk.items.type.ManaPotion) {
          pots.mp.push(copyUnit(p));
        }
      });

    // quick check
    if ((Config.BeltColumn.includes("hp") && !pots.hp.length)
      || (Config.BeltColumn.includes("mp") && !pots.mp.length)) {
      return true;
    }

    // should we check the actual amount in the column?
    // For now just keeping the way it was and checking if a column is empty
    for (let i = 0; i < 4; i += 1) {
      if (Config.MinColumn[i] <= 0) {
        continue;
      }

      switch (Config.BeltColumn[i]) {
      case "hp":
        if (!pots.hp.some(p => p.x === i)) {
          console.debug("Column: " + (i + 1) + " needs hp pots");
          return true;
        }
        break;
      case "mp":
        if (!pots.mp.some(p => p.x === i)) {
          console.debug("Column: " + (i + 1) + " needs mp pots");
          return true;
        }
        break;
      }
    }
  }

  return false;
};

/** @returns {boolean} */
me.needBufferPots = function () {
  // not using buffers
  if (Config.HPBuffer < 0 && Config.MPBuffer < 0) return false;
  
  // Start
  if (me.charlvl > 2 && me.gold > 1000) {
    const pots = { hp: 0, mp: 0, };
    const beltSize = Storage.BeltSize();
    
    // only run this bit if we aren't wearing a belt for now
    beltSize === 1 && me.cleanUpInvoPotions(beltSize);
    // now check what's in our belt
    me.getItemsEx()
      .filter(function (p) {
        return p.isInInventory
          && [sdk.items.type.HealingPotion, sdk.items.type.ManaPotion].includes(p.itemType);
      })
      .forEach(function (p) {
        if (p.itemType === sdk.items.type.HealingPotion) {
          pots.hp++;
        } else if (p.itemType === sdk.items.type.ManaPotion) {
          pots.mp++;
        }
      });

    return (pots.mp < Config.MPBuffer || pots.hp < Config.HPBuffer);
  }

  return false;
};

/** @returns {boolean} */
me.needPotions = function () {
  return me.needBeltPots() || me.needBufferPots();
};

/**
 * Always returns true; the return value does not reflect whether any potions were moved.
 * @returns {boolean}
 */
me.clearBelt = function () {
  let item = me.getItem(-1, sdk.items.mode.inBelt);
  let clearList = [];

  if (item) {
    do {
      switch (item.itemType) {
      case sdk.items.type.HealingPotion:
        if (Config.BeltColumn[item.x % 4] !== "hp") {
          clearList.push(copyUnit(item));
        }

        break;
      case sdk.items.type.ManaPotion:
        if (Config.BeltColumn[item.x % 4] !== "mp") {
          clearList.push(copyUnit(item));
        }

        break;
      case sdk.items.type.RejuvPotion:
        if (Config.BeltColumn[item.x % 4] !== "rv") {
          clearList.push(copyUnit(item));
        }

        break;
      case sdk.items.type.StaminaPotion:
      case sdk.items.type.AntidotePotion:
      case sdk.items.type.ThawingPotion:
        clearList.push(copyUnit(item));
      }
    } while (item.getNext());

    while (clearList.length > 0) {
      let pot = clearList.shift();
      (Storage.Inventory.CanFit(pot) && Storage.Inventory.MoveTo(pot)) || pot.interact();
      delay(200);
    }
  }

  return true;
};

/** @returns {ItemUnit | null} */
me.getIdTool = function () {
  let items = me.getItemsEx()
    .filter(function (i) {
      return i.isInInventory
        && [sdk.items.ScrollofIdentify, sdk.items.TomeofIdentify].includes(i.classid);
    });
  if (!items.length) return null;
  let scroll = items.find(function (i) {
    return i.isInInventory && i.classid === sdk.items.ScrollofIdentify;
  });
  if (scroll) return scroll;
  let tome = items.find(function (i) {
    return i.isInInventory && i.classid === sdk.items.TomeofIdentify;
  });
  if (tome && tome.getStat(sdk.stats.Quantity) > 0) return tome;

  return null;
};

/** @returns {ItemUnit | null} */
me.getTpTool = function () {
  let items = me.getItemsEx(-1, sdk.items.mode.inStorage)
    .filter(function (i) {
      return i.isInInventory && [sdk.items.ScrollofTownPortal, sdk.items.TomeofTownPortal].includes(i.classid);
    });
  if (!items.length) return null;
  let tome = items.find(function (i) {
    return i.classid === sdk.items.TomeofTownPortal && i.getStat(sdk.stats.Quantity) > 0;
  });
  if (tome) return tome;
  let scroll = items.find(function (i) {
    return i.classid === sdk.items.ScrollofTownPortal;
  });
  if (scroll) return scroll;
  return null;
};

/** @returns {ItemUnit[]} */
me.getUnids = function () {
  let list = [];
  let item = me.getItem(-1, sdk.items.mode.inStorage);

  if (!item) return [];

  do {
    if (item.isInInventory && !item.identified) {
      list.push(copyUnit(item));
    }
  } while (item.getNext());

  return list;
};

/** @returns {boolean} */
me.fieldID = function () {
  let list = me.getUnids();
  if (!list) return false;
  const loc = me.inTown ? "Town" : "Field";

  while (list.length > 0) {
    let idTool = me.getIdTool();
    if (!idTool) return false;

    let item = list.shift();
    let result = Pickit.checkItem(item);
    // Force ID for unid items matching autoEquip/cubing criteria
    Town.needForceID(item) && (result.result = -1);

    // unid item that should be identified
    if (result.result === Pickit.Result.UNID) {
      Town.identifyItem(item, idTool, Config.FieldID.PacketID);
      delay(50);
      result = Pickit.checkItem(item);
    }
    Town.itemResult(item, result, loc, false);
  }

  delay(200);
  me.cancel();

  return true;
};

/**
 * @param {number} [weaponLoc=sdk.body.RightArm]
 * @returns {number}
 */
me.getWeaponQuantity = function (weaponLoc = sdk.body.RightArm) {
  let currItem = me.getItemsEx(-1, sdk.items.mode.Equipped)
    .filter(function (i) {
      return i.bodylocation === weaponLoc;
    })
    .first();
  return !!currItem ? currItem.getStat(sdk.stats.Quantity) : 0;
};

/**
 * @param {number} repairPercent
 * @param {boolean} [chargedItems]
 * @returns {ItemUnit[]}
 */
me.getItemsForRepair = function (repairPercent, chargedItems) {
  const lowLevelCheck = me.charlvl < 5;
  // lower the required percent as we are a low level
  (lowLevelCheck && repairPercent > 30) && (repairPercent = 15);
  let itemList = [];
  let item = me.getItem(-1, sdk.items.mode.Equipped);

  if (item) {
    do {
      if (lowLevelCheck && !item.isOnMain && !item.isOnSwap) continue;
      // Skip ethereal items
      if (!item.ethereal) {
        // Skip indestructible items
        if (!item.getStat(sdk.stats.Indestructible)) {
          switch (item.itemType) {
          // Quantity check
          case sdk.items.type.ThrowingKnife:
          case sdk.items.type.ThrowingAxe:
          case sdk.items.type.Javelin:
          case sdk.items.type.AmazonJavelin:
            let quantity = item.getStat(sdk.stats.Quantity);

            // Stat 254 = increased stack size
            if (typeof quantity === "number"
              && quantity * 100 / (getBaseStat("items", item.classid, "maxstack") + item.getStat(sdk.stats.ExtraStack)) <= repairPercent) {
              itemList.push(copyUnit(item));
            }

            break;
          default:
            // Durability check
            if (item.durabilityPercent <= repairPercent) {
              itemList.push(copyUnit(item));
            }

            break;
          }
        }

        if (chargedItems) {
          // Charged item check
          let charge = item.getStat(-2)[sdk.stats.ChargedSkill];

          if (typeof (charge) === "object") {
            if (charge instanceof Array) {
              for (let i = 0; i < charge.length; i += 1) {
                if (charge[i] !== undefined && charge[i].hasOwnProperty("charges")
                  && charge[i].charges * 100 / charge[i].maxcharges <= repairPercent) {
                  itemList.push(copyUnit(item));
                }
              }
            } else if (charge.charges * 100 / charge.maxcharges <= repairPercent) {
              itemList.push(copyUnit(item));
            }
          }
        }
      }
    } while (item.getNext());
  }

  return itemList;
};

/** @returns {string[]} */
me.needRepair = function () {
  let repairAction = [];
  let bowCheck = Attack.usingBow();
  let switchBowCheck = CharData.skillData.bow.onSwitch;
  if (getInteractedNPC() && !getUIFlag(sdk.uiflags.Shop)) {
    // fix crash with d2bs
    me.cancel();
  }
  let canAfford = me.gold >= me.getRepairCost();
  !bowCheck && switchBowCheck && (bowCheck = (function () {
    switch (CharData.skillData.bow.bowType) {
    case sdk.items.type.Bow:
    case sdk.items.type.AmazonBow:
      return "bow";
    case sdk.items.type.Crossbow:
      return "crossbow";
    default:
      return "";
    }
  })());

  if (bowCheck) {
    let [quiver, inventoryQuiver] = (function () {
      switch (bowCheck) {
      case "crossbow":
        return [
          me.getItem("cqv", sdk.items.mode.Equipped),
          me.getItem("cqv", sdk.items.mode.inStorage)
        ];
      case "bow":
      default:
        return [
          me.getItem("aqv", sdk.items.mode.Equipped),
          me.getItem("aqv", sdk.items.mode.inStorage)
        ];
      }
    })();

    // Out of arrows/bolts
    if (!quiver) {
      inventoryQuiver
        ? switchBowCheck
          ? Item.secondaryEquip(inventoryQuiver, sdk.body.LeftArmSecondary)
          : Item.equip(inventoryQuiver, 5)
        : repairAction.push("buyQuiver") && repairAction.push("buyQuiver");
      if (me.gold < 200) {
        return [];
      }
    } else {
      let quantity = quiver.getStat(sdk.stats.Quantity);

      if (typeof quantity === "number"
        && quantity * 100 / getBaseStat("items", quiver.classid, "maxstack") <= Config.RepairPercent) {
        inventoryQuiver
          ? switchBowCheck
            ? Item.secondaryEquip(inventoryQuiver, sdk.body.LeftArmSecondary)
            : Item.equip(inventoryQuiver, 5)
          : repairAction.push("buyQuiver") && repairAction.push("buyQuiver");
      }
    }
  }

  // Repair durability/quantity/charges
  if (canAfford && this.getItemsForRepair(Config.RepairPercent, true).length > 0) {
    repairAction.push("repair");
  }

  return repairAction;
};

/** @returns {boolean} */
me.needMerc = function () {
  if (me.classic || !Config.UseMerc || me.gold < me.mercrevivecost || me.mercrevivecost === 0) return false;

  Misc.poll(function () {
    return me.gameReady;
  }, 1000, 100);
  // me.getMerc() might return null if called right after taking a portal, that's why there's retry attempts
  for (let i = 0; i < 3; i += 1) {
    let merc = me.getMercEx();
    if (!!merc && !merc.dead) return false;

    delay(100);
  }

  // In case we never had a merc and Config.UseMerc is still set to true for some odd reason
  return true;
};

/** @returns {boolean} */
me.sortInventory = function () {
  return Storage.Inventory.SortItems(
    Config.SortSettings.ItemsSortedFromLeft,
    Config.SortSettings.ItemsSortedFromRight
  );
};

/**
 * @description Returns boolean if we have all the runes given by itemInfo array
 * @param {number[]} itemInfo - Array of rune classids
 * @returns Boolean
 */
me.haveRunes = function (itemInfo = []) {
  if (!Array.isArray(itemInfo) || typeof itemInfo[0] !== "number") return false;
  let itemList = this.getItemsEx()
    .filter(i => i.isInStorage && i.itemType === sdk.items.type.Rune);
  if (!itemList.length || itemList.length < itemInfo.length) return false;
  const checkedGids = new Set();

  return itemInfo.every(function (rune) {
    return itemList.some(function (item) {
      if (item.classid === rune && !checkedGids.has(item.gid)) {
        checkedGids.add(item.gid);
        return true;
      }
      return false;
    });
  });
};

/**
 * Get a list of items that match the given criteria.
 * @param {ItemUnit | {
 * itemType?: number,
 * classid?: number,
 * mode?: number,
 * quality?: number,
 * sockets?: number,
 * location?: number,
 * ethereal?: boolean,
 * cb?: (item: ItemUnit) => boolean
 * }} itemInfo 
 * @param {boolean} skipSame
 * @returns {ItemUnit[]}
 */
me.getOwned = function (itemInfo = {}, skipSame = false) {
  let itemList = [];
  let item = me.getItem();

  if (item) {
    do {
      if (itemInfo.itemType !== undefined && itemInfo.itemType !== item.itemType) continue;
      if (itemInfo.classid !== undefined && itemInfo.classid !== item.classid) continue;
      if (itemInfo.mode !== undefined && itemInfo.mode !== item.mode) continue;
      if (itemInfo.quality !== undefined && itemInfo.quality !== item.quality) continue;
      if (itemInfo.sockets !== undefined && itemInfo.sockets !== item.sockets) continue;
      if (itemInfo.location !== undefined && itemInfo.location !== item.location) continue;
      if (itemInfo.ethereal !== undefined && itemInfo.ethereal !== item.ethereal) continue;
      if (typeof itemInfo.cb === "function" && !itemInfo.cb(item)) continue;
      if (skipSame && itemInfo.gid !== undefined && itemInfo.gid !== item.gid) continue;
      itemList.push(copyUnit(item));
    } while (item.getNext());
  }

  return itemList;
};
