/**
*  @filename    CharData.js
*  @author      theBGuy
*  @desc        Character Data and Tools for Kolbot-SoloPlay
*
*/

includeIfNotIncluded("SoloPlay/Tools/Tracker.js");

const CharData = (function () {
  const _create = function () {
    let obj = Object.assign({}, this._default);
    let string = JSON.stringify(obj, null, 2);

    if (!FileTools.exists("libs/SoloPlay/Data/" + me.profile)) {
      let folder = dopen("libs/SoloPlay/Data");
      folder && folder.create(me.profile);
    }

    FileAction.write(this.filePath, string);

    return obj;
  };

  const _getObj = function () {
    if (!FileTools.exists(this.filePath)) return this.create();

    let obj;
    let string = FileAction.read(this.filePath);

    try {
      obj = JSON.parse(string);
    } catch (e) {
      // If we failed, file might be corrupted, so create a new one
      obj = this.create();
    }

    return obj ? obj : this._default;
  };

  const _getStats = function () {
    let obj = this.getObj();
    return clone(obj);
  };

  const _updateData = function (arg, property, value) {
    let obj = this.getObj();
    typeof arg !== "string" && (arg = arg.toString());
    typeof arg === "string" && (arg = arg.toLowerCase());

    if (typeof property === "object") {
      obj = Object.assign(obj, property);
      return FileAction.write(this.filePath, JSON.stringify(obj, null, 2));
    }

    if (obj.hasOwnProperty(property)) {
      obj[property] = value;
      return FileAction.write(this.filePath, JSON.stringify(obj, null, 2));
    } else if (obj.hasOwnProperty(arg) && obj[arg].hasOwnProperty(property)) {
      obj[arg][property] = value;
      return FileAction.write(this.filePath, JSON.stringify(obj, null, 2));
    }

    return false;
  };
  
  return {
    filePath: "libs/SoloPlay/Data/" + me.profile + "/" + me.profile + "-CharData.json",
    threads: [
      "libs/SoloPlay/SoloPlay.js", "libs/SoloPlay/Threads/TownChicken.js",
      "libs/SoloPlay/Threads/ToolsThread.js", "libs/SoloPlay/Threads/EventThread.js"
    ],
    _default: (function () {
      let diffObj = { respecUsed: false, imbueUsed: false, socketUsed: false };
      return {
        initialized: false,
        normal: Object.assign({}, diffObj),
        nightmare: Object.assign({}, diffObj),
        hell: Object.assign({}, diffObj),
        task: "",
        startTime: 0,
        charName: "",
        classid: -1,
        level: 1,
        strength: 0,
        dexterity: 0,
        currentBuild: "Start",
        finalBuild: "",
        highestDifficulty: "Normal",
        setDifficulty: "Normal",
        charms: {},
        charmGids: [],
        merc: {
          act: 1,
          classid: sdk.mercs.Rogue,
          difficulty: sdk.difficulty.Normal,
          strength: 0,
          dexterity: 0,
          skill: 0,
          skillName: "",
          gear: [],
        }
      };
    })(),

    login: (function () {
      return {
        filePath: "libs/SoloPlay/Data/" + me.profile + "/" + me.profile + "-LoginData.json",
        _default: { account: "", pass: "", currentChar: "", tag: "", charCount: 0, existing: false },

        create: function () {
          return _create.call(this);
        },
        getObj: function () {
          return _getObj.call(this);
        },

        getStats: function () {
          return _getStats.call(this);
        },

        updateData: function (arg, property, value) {
          return _updateData.call(this, arg, property, value);
        },
      };
    })(),

    charms: (function () {
      /**
       * @constructor
       * @param {number} classid 
       */
      function Charm (classid) {
        this.classid = classid;
      }

      Charm.prototype.count = function () {
        let [curr, max] = [0, 0];
        Object.keys(me.data.charms).forEach(function (cKey) {
          if (me.data.charms[cKey].classid === this.classid) {
            curr += me.data.charms[cKey].have.length;
            max += me.data.charms[cKey].max;
          }
        });

        return {
          curr: curr,
          max: max
        };
      };
      /** @type {Map<number, Charm} */
      const charmMap = new Map([
        [sdk.items.SmallCharm, new Charm(sdk.items.SmallCharm)],
        ["small", new Charm(sdk.items.SmallCharm)],
        [sdk.items.LargeCharm, new Charm(sdk.items.LargeCharm)],
        ["large", new Charm(sdk.items.LargeCharm)],
        [sdk.items.GrandCharm, new Charm(sdk.items.GrandCharm)],
        ["grand", new Charm(sdk.items.GrandCharm)]
      ]);

      return charmMap;
    })(),

    pots: (function () {
      /**
      * @constructor
      * @param {number} state 
      * @param {Function} check 
      */
      function BuffPot (state, check) {
        this.state = state;
        this.check = check || (() => true);
        this.tick = 0;
        this.duration = 0;
      }

      BuffPot.prototype.active = function () {
        return me.getState(this.state);
      };

      BuffPot.prototype.timeLeft = function () {
        return this.duration > 0 ? this.duration - (getTickCount() - this.tick) : 0;
      };

      BuffPot.prototype.need = function () {
        return (this.check() && (!this.active() || this.timeLeft() < Time.minutes(5)));
      };

      /** @type {Map<number | string, BuffPot>} */
      const _buffPots = new Map();
      _buffPots.set(sdk.items.StaminaPotion, new BuffPot(sdk.states.StaminaPot,
        () => Skill.canUse(sdk.skills.Vigor) || Pather.canTeleport())
      );
      _buffPots.set(sdk.items.ThawingPotion, new BuffPot(sdk.states.Thawing, () => me.coldRes < 75));
      _buffPots.set(sdk.items.AntidotePotion, new BuffPot(sdk.states.Antidote, () => me.poisonRes < 75));

      // hacky for now - just to handle the old way of accessing buff pots
      _buffPots.set("stamina", _buffPots.get(sdk.items.StaminaPotion));
      _buffPots.set("thawing", _buffPots.get(sdk.items.ThawingPotion));
      _buffPots.set("antidote", _buffPots.get(sdk.items.AntidotePotion));

      return _buffPots;
    }()),

    skillData: {
      skills: [],
      currentChargedSkills: [],
      chargedSkills: [],
      chargedSkillsOnSwitch: [],
      /**
      * @todo fix this, it's ugly
      */
      bow: {
        initialized: false,
        onSwitch: false,
        bowGid: 0,
        bowType: 0,
        arrows: 0,
        quiverType: 0,
        setBowInfo: function (bow, init = false) {
          if (bow === undefined) return;
          this.bowGid = bow.gid;
          this.bowType = bow.itemType;
          this.bowOnSwitch = bow.isOnSwap;
          SetUp.bowQuiver();
          init && (this.initialized = true);
          !init && CharData.skillData.update();
        },
        setArrowInfo: function (quiver) {
          if (quiver === undefined) return;
          this.arrows = Math.floor((quiver.getStat(sdk.stats.Quantity) * 100) / getBaseStat("items", quiver.classid, "maxstack"));
          this.quiverType = quiver.itemType;
        },
        resetBowData: function () {
          this.bowOnSwitch = false;
          [this.bowGid, this.bowType, this.arrows, this.quiverType] = [0, 0, 0, 0];
          NTIP.Runtime.clear();
          CharData.skillData.update();
        },
      },

      init: function (skillIds, mainSkills, switchSkills) {
        this.currentChargedSkills = skillIds.slice(0);
        this.chargedSkills = mainSkills.slice(0);
        this.chargedSkillsOnSwitch = switchSkills.slice(0);
        this.skills = me.getSkill(4).map((skill) => skill[0]);
      },

      update: function () {
        let obj = JSON.stringify(copyObj(this));
        let myThread = getScript(true).name;
        CharData.threads.forEach(function (script) {
          let curr = getScript(script);
          if (curr && myThread !== curr.name) {
            curr.send("skill--" + obj);
          }
        });
      },

      haveChargedSkill: function (skillid = []) {
        // convert to array if not one
        !Array.isArray(skillid) && (skillid = [skillid]);
        return this.currentChargedSkills
          .some(function (s) {
            return skillid.includes(s);
          });
      },

      haveChargedSkillOnSwitch: function (skillid = 0) {
        return this.chargedSkillsOnSwitch
          .some(function (chargeSkill) {
            return chargeSkill.skill === skillid;
          });
      }
    },

    // updates config obj across all threads - excluding our current
    updateConfig: function () {
      let obj = JSON.stringify(copyObj(Config));
      let myThread = getScript(true).name;
      CharData.threads.forEach(function (script) {
        let curr = getScript(script);
        if (curr && myThread !== curr.name) {
          curr.send("config--" + obj);
        }
      });
    },

    /**
     * @returns {MyData}
     */
    create: function () {
      return _create.call(this);
    },

    /**
     * @returns {MyData}
     */
    getObj: function () {
      return _getObj.call(this);
    },

    /**
     * @returns {MyData}
     */
    getStats: function () {
      return _getStats.call(this);
    },

    updateData: function (arg, property, value) {
      while (me.ingame && !me.gameReady) {
        delay(100);
      }

      console.trace();

      return _updateData.call(this, arg, property, value);
    },

    delete: function (deleteMain = false) {
      if (deleteMain && FileTools.exists("data/" + me.profile + ".json")) {
        FileTools.remove("data/" + me.profile + ".json");
      }
        
      FileTools.exists(this.filePath) && FileTools.remove(this.filePath);
      FileTools.exists(Tracker.GTPath) && FileTools.remove(Tracker.GTPath);

      return !(FileTools.exists(this.filePath) && FileTools.exists("libs/SoloPlay/Data/" + me.profile + ".GameTime" + ".json"));
    },
  };
})();
