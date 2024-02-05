/**
*  @filename    Overlay.js
*  @author      theBGuy
*  @credit      Adpist for first gen Overlay, isid0re for styleing and tracker
*  @desc        overlay for Kolbot-SoloPlay
*
*/

includeIfNotIncluded("SoloPlay/Tools/Developer.js");
includeIfNotIncluded("SoloPlay/Tools/Tracker.js");
includeIfNotIncluded("SoloPlay/Functions/PrototypeOverrides.js");

/**
 * @todo Clean this up, probably needs to be entirely rewritten
 * - show current script
 */
const Overlay = {
  timeOut: 0,
  resfix: { x: -10, y: me.screensize ? 0 : -120 },
  quest: { x: 8, y: 368 },
  qYMod: { 1: 368, 2: 384, 3: 384, 4: 414, 5: 384 },
  dashboard: { x: 120, y: 470 },
  timer: { x: 0, y: 595 },
  build: SetUp.currentBuild,
  script: "",
  realm: (me.realm ? me.realm : "SinglePlayer"),
  difficulty: sdk.difficulty.nameOf(me.diff),
  level: function () {
    return me.data.level;
  },
  
  text: (function () {
    const _gameTracker = Tracker.readObj(Tracker.GTPath);
    let [_tick, _charlvl] = [0, 0];

    const _format = function (ms = 0) {
      const hours = Math.floor(ms / 3600000);
      const minutes = Math.floor((ms % 3600000) / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);

      /** @param {number} num */
      const pad = function (num) {
        return (num < 10 ? "0" + num : num);
      };

      return pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
    };

    const _timer = function () {
      return (new Date(getTickCount() - me.gamestarttime).toISOString().slice(11, -5));
    };

    return {
      /** @type {Array<{ name: string, hook: Hook }>} */
      hooks: [],
      enabled: true,

      clock: function () {
        if (!Developer.logPerformance) return "";
        _gameTracker === undefined && (Object.assign(_gameTracker, Tracker.readObj(Tracker.GTPath)));
        _tick = getTickCount();
        let currInGame = getTickCount() - me.gamestarttime;
        let totalTime = _format(_gameTracker.Total + currInGame);
        let totalInGame = _format(_gameTracker.InGame + currInGame);

        return ("Total: ÿc0" + totalTime + "ÿc4 InGame: ÿc0" + totalInGame + "ÿc4 OOG: ÿc0" + _format(_gameTracker.OOG));
      },

      check: function () {
        if (!this.enabled) {
          this.flush();

          return;
        }

        // Double check in case still got here before being ready
        if (!me.gameReady && !me.ingame && !me.area) return;

        !this.getHook("dashboard") && this.add("dashboard");
        !this.getHook("credits") && this.add("credits");
        
        if (!this.getHook("InGameTimer")) {
          this.add("InGameTimer");
        } else {
          if (getTickCount() - _tick >= 1000) {
            this.getHook("InGameTimer").hook.text = "ÿc0" + _timer();
          }
        }

        if (Developer.logPerformance) {
          if (!this.getHook("times")) {
            this.add("times");
          } else {
            if (getTickCount() - _tick >= 1000) {
              this.getHook("times").hook.text = this.clock();
            }
          }
        }

        if (!this.getHook("level")) {
          this.add("level");
        } else if (_charlvl !== Overlay.level()) {
          _charlvl = Overlay.level();
          this.getHook("level").hook.text = "Name: ÿc0" + me.name + "ÿc4  Diff: ÿc0" + Overlay.difficulty + "ÿc4  Level: ÿc0" + _charlvl;
        }
      },

      add: function (name) {
        switch (name) {
        case "dashboard":
          this.hooks.push({
            name: "dashboard",
            hook: new Box(Overlay.dashboard.x + Overlay.resfix.x, Overlay.dashboard.y + Overlay.resfix.y, 370, 80, 0x0, 4, 0)
          });

          this.hooks.push({
            name: "dashboardframe",
            hook: new Frame(Overlay.dashboard.x + Overlay.resfix.x, Overlay.dashboard.y + Overlay.resfix.y, 370, 80, 0)
          });

          this.getHook("dashboard").hook.zorder = 0;

          break;
        case "credits":
          this.hooks.push({
            name: "credits",
            hook: new Text("Kolbot-SoloPlay by: ÿc0 theBGuy" + "ÿc4  Realm: ÿc0" + Overlay.realm, Overlay.dashboard.x, Overlay.dashboard.y + Overlay.resfix.y + 15, 4, 13, 0)
          });

          break;
        case "level":
          _charlvl = Overlay.level();
          this.hooks.push({
            name: "level",
            hook: new Text("Name: ÿc0" + me.name + "ÿc4  Diff: ÿc0" + Overlay.difficulty + "ÿc4  Level: ÿc0" + _charlvl, Overlay.dashboard.x, Overlay.dashboard.y + Overlay.resfix.y + 30, 4, 13, 0)
          });

          break;
        case "times":
          this.hooks.push({
            name: "times",
            hook: new Text(this.clock(), Overlay.dashboard.x, Overlay.dashboard.y + Overlay.resfix.y + 75, 4, 13, 0)
          });

          break;
        case "InGameTimer":
          this.hooks.push({
            name: "timerBoard",
            hook: new Box(Overlay.timer.x, Overlay.timer.y - 15 + Overlay.resfix.y, 68, 18, 0, 4, 0)
          });

          this.hooks.push({
            name: "timerFrame",
            hook: new Frame(Overlay.timer.x, Overlay.timer.y - 15 + Overlay.resfix.y, 68, 18, 0)
          });

          this.hooks.push({
            name: "InGameTimer",
            hook: new Text("ÿc0" + _timer(), Overlay.timer.x + 7, Overlay.timer.y + Overlay.resfix.y, 0, 13, 0)
          });

          break;
        }
      },

      getHook: function (name) {
        for (let i = 0; i < this.hooks.length; i++) {
          if (this.hooks[i].name === name) {
            return this.hooks[i];
          }
        }

        return false;
      },

      flush: function () {
        while (this.hooks.length) {
          this.hooks.shift().hook.remove();
        }
        return true;
      }
    };
  })(),

  quests: (function () {
    const QuestData = require("../../core/GameData/QuestData");

    /**
     * @constructor
     * @param {string} name 
     * @param {number} id 
     * @param {boolean} [preReq] 
     */
    function QuestHook (name, id, preReq = false) {
      this.name = name;
      this.id = id;
      this.preReq = preReq;
    }

    /**
     * @this {QuestHook}
     * @returns {string}
     */
    QuestHook.prototype.status = function () {
      return QuestData.get(this.id).complete(this.preReq) ? "ÿc2Complete" : "ÿc1Incomplete";
    };

    /**
     * @this {QuestHook}
     * @returns {{ name: string, hook: Hook }}
     */
    QuestHook.prototype.hook = function () {
      return {
        name: this.name,
        hook: new Text(this.name + ": " + this.status(), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * _qHooks.length), 4, _font, 0)
      };
    };

    function StatsHook (name, status, hook) {
      this.name = name;
      this.status = status;
      /**
       * @private
       * @type {function(): Hook}
       */
      this._hook = hook;
    }

    /**
     * @this {StatsHook}
     * @returns {{ name: string, hook: Hook }}
     */
    StatsHook.prototype.hook = function () {
      return {
        name: this.name,
        hook: this._hook()
      };
    };

    const _quests = new Map([
      // Act 1
      ["Den", new QuestHook("Den", sdk.quest.id.DenofEvil)],
      ["Blood Raven", new QuestHook("Blood Raven", sdk.quest.id.SistersBurialGrounds)],
      ["Tristram", new QuestHook("Tristram", sdk.quest.id.TheSearchForCain)],
      ["Countess", new QuestHook("Countess", sdk.quest.id.ForgottenTower)],
      ["Smith", new QuestHook("Smith", sdk.quest.id.ToolsoftheTrade, true)],
      ["Andariel", new QuestHook("Andariel", sdk.quest.id.SistersToTheSlaughter)],
      // Act 2
      ["Cube", new QuestHook("Cube", sdk.quest.id.TheHoradricStaff)],
      ["Radament", new QuestHook("Radament", sdk.quest.id.RadamentsLair)],
      ["Staff", new QuestHook("Staff", sdk.quest.id.TheHoradricStaff)],
      ["Amulet", new QuestHook("Amulet", sdk.quest.id.TheTaintedSun)],
      ["Summoner", new QuestHook("Summoner", sdk.quest.id.TheSummoner)],
      ["Duriel", new QuestHook("Duriel", sdk.quest.id.TheSevenTombs)],
      // Act 3
      ["Golden Bird", new QuestHook("Golden Bird", sdk.quest.id.TheGoldenBird)],
      ["Khalim's Will", new QuestHook("Khalim's Will", sdk.quest.id.KhalimsWill)],
      ["Lam Esen", new QuestHook("Lam Esen", sdk.quest.id.LamEsensTome)],
      ["Travincal", new QuestHook("Travincal", sdk.quest.id.TheBlackenedTemple)],
      ["Mephisto", new QuestHook("Mephisto", sdk.quest.id.TheGuardian)],
      // Act 4
      ["Izual", new QuestHook("Izual", sdk.quest.id.TheFallenAngel)],
      ["Hell Forge", new QuestHook("Hell Forge", sdk.quest.id.HellsForge, true)],
      ["Diablo", new QuestHook("Diablo", sdk.quest.id.TerrorsEnd)],
      // Act 5
      ["Shenk", new QuestHook("Shenk", sdk.quest.id.SiegeOnHarrogath, true)],
      ["Barbies", new QuestHook("Barbies", sdk.quest.id.RescueonMountArreat)],
      ["Anya", new QuestHook("Anya", sdk.quest.id.PrisonofIce)],
      ["Ancients", new QuestHook("Ancients", sdk.quest.id.RiteofPassage)],
      ["Baal", new QuestHook("Baal", sdk.quest.id.EyeofDestruction)]
    ]);

    const _acts = new Map([
      [1, ["Den", "Blood Raven", "Tristram", "Countess", "Smith", "Andariel"]],
      [2, [/* "Cube",  */"Radament", "Staff", "Amulet", "Summoner", "Duriel"]],
      [3, ["Golden Bird", "Khalim's Will", "Lam Esen", "Travincal", "Mephisto"]],
      [4, ["Izual", "Hell Forge", "Diablo"]],
      [5, ["Shenk", "Barbies", "Anya", "Ancients", "Baal"]]
    ]);

    const _res = function () {
      return (
        "FR: ÿc1" + me.FR
        + "ÿc4  CR: ÿc3" + me.CR
        + "ÿc4  LR: ÿc9" + me.LR
        + "ÿc4  PR: ÿc2" + me.PR
        + "ÿc4  CurrentBuild: ÿc0" + Overlay.build
      );
    };

    const _stats = function () {
      return (
        "MF: ÿc8" + me.getStat(sdk.stats.MagicBonus)
        + "ÿc4  FHR: ÿc8" + (me.FHR)
        + "ÿc4  FBR: ÿc8" + (me.FBR)
        + "ÿc4  FCR: ÿc8" + (me.FCR)
        + "ÿc4  IAS: ÿc8" + (me.IAS)
      );
    };

    const _statsMap = new Map([
      [
        "stats",
        new StatsHook("stats", _stats, () => new Text(_stats(), Overlay.dashboard.x, Overlay.dashboard.y + Overlay.resfix.y + 60, 4, 13, 0))
      ],
      [
        "res",
        new StatsHook("res", _res, () => new Text(_res(), Overlay.dashboard.x, Overlay.dashboard.y + Overlay.resfix.y + 45, 4, 13, 0))
      ],
      [
        "gold",
        new StatsHook(
          "gold",
          function () {
            return "ÿc6Goldÿc0: ÿc0" + me.gold;
          },
          function () {
            let x = me.screensize ? 275 : 195;
            let y = Overlay.resfix.y + 586;
            return new Text("ÿc6Goldÿc0: ÿc0" + me.gold, x, y, 4, 6, 0);
          }
        )
      ],
    ]);

    const _font = 12;
    /** @type {Array<{ name: string, hook: Hook }>} */
    const _qHooks = [];
    /** @type {Array<{ name: string, hook: Hook }>} */
    const _hooks = [];

    return {
      enabled: true,

      /**
       * @param {string} name 
       * @returns {void}
       */
      addQuest: function (name) {
        const quest = _quests.get(name);
        if (!quest) return;

        _qHooks.push(quest.hook());
      },

      /**
       * @param {string} name 
       * @returns {void}
       */
      updateQuest: function (name) {
        const quest = _quests.get(name);
        if (!quest) return;

        const hook = this.getHook(name);
        if (!hook) {
          this.addQuest(name);
        } else {
          hook.hook.text = quest.name + ": " + quest.status();
        }
      },

      /**
       * @param {string} name 
       * @returns {void}
       */
      updateStats: function (name) {
        const hook = this.getHook(name, _hooks);
        if (!hook) {
          const stat = _statsMap.get(name);
          if (!stat) return;
          _hooks.push(stat.hook());
        } else {
          hook.hook.text = _statsMap.get(name).status();
        }
      },

      check: function () {
        if (!this.enabled || !me.gameReady || !me.ingame || !me.area || me.dead) {
          this.flush();

          return;
        }

        this.updateStats("res");
        this.updateStats("stats");
        this.updateStats("gold");
        !this.getHook("questheader") && this.add("questheader");

        _acts.get(me.act).forEach((quest) => this.updateQuest(quest));

        !this.getHook("questbox") && this.add("questbox");
      },

      /**
       * @param {string} name 
       */
      add: function (name) {
        switch (name) {
        case "questbox":
          _qHooks.push({
            name: "questbox",
            hook: new Box(Overlay.quest.x - 8, Overlay.quest.y + Overlay.resfix.y - 17, 145, 10 + [0, 105, 90, 90, 60, 90][me.act], 0x0, 4, 0)
          });

          _qHooks.push({
            name: "questframe",
            hook: new Frame(Overlay.quest.x - 8, Overlay.quest.y + Overlay.resfix.y - 17, 145, 10 + [0, 105, 90, 90, 60, 90][me.act], 0)
          });

          this.getHook("questbox").hook.zorder = 0;

          break;
        case "questheader":
          Overlay.quest.y = Overlay.qYMod[me.act];

          _qHooks.push({
            name: "questheader",
            hook: new Text("Quests in Act: ÿc0" + me.act, Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y, 4, 0, 0)
          });

          break;
        }
      },

      /**
       * @param {string} name 
       * @param {Array<{ name: string, hook: Hook }>} [hooks] 
       * @returns {{ name: string, hook: Hook } | false}
       */
      getHook: function (name, hooks) {
        while (!me.gameReady || !me.ingame || !me.area) {
          delay(500);
        }

        hooks === undefined && (hooks = _qHooks);

        for (let i = 0; i < hooks.length; i += 1) {
          if (hooks[i].name === name) return hooks[i];
        }

        return false;
      },

      flush: function () {
        while (_hooks.length) {
          _hooks.shift().hook.remove();
        }

        while (_qHooks.length) {
          _qHooks.shift().hook.remove();
        }
        return true;
      }
    };
  })(),
  
  update: function (msg = false) {
    function status () {
      let hide = [
        sdk.uiflags.Inventory, sdk.uiflags.StatsWindow, sdk.uiflags.QuickSkill, sdk.uiflags.SkillWindow,
        sdk.uiflags.ChatBox, sdk.uiflags.EscMenu, sdk.uiflags.KeytotheCairnStonesScreen, sdk.uiflags.Shop,
        sdk.uiflags.SubmitItem, sdk.uiflags.Quest, sdk.uiflags.Party, sdk.uiflags.Msgs, sdk.uiflags.Stash,
        sdk.uiflags.Cube, sdk.uiflags.Help, sdk.uiflags.MercScreen
      ];

      if (!me.gameReady || !me.ingame || !me.area || me.dead) {
        Overlay.disable(true);
      } else {
        while (!me.gameReady) {
          delay(100);
        }
      
        for (let flag = 0; flag < hide.length; flag++) {
          if (getUIFlag(hide[flag])) {
            Overlay.text.flush();
            Overlay.quests.flush();

            while (getUIFlag(hide[flag])) {
              delay(100);
            }

            Misc.poll(() => me.gameReady);
            flag = 0;
          } else {
            Overlay.text.enabled = true;
          }
        }
      }

      Overlay.text.check();
      if (Overlay.quests.enabled) {
        Overlay.quests.check();
      } else {
        if (Overlay.timeOut > 0 && getTickCount() > Overlay.timeOut) {
          Overlay.quests.enabled = true;
          Overlay.timeOut = 0;
        }
        Overlay.quests.flush();
      }
    }

    return msg ? true : (me.gameReady && me.ingame && !me.dead) ? status() : false;
  },

  disable: function (all = false) {
    me.overhead("Disable");

    if (all) {
      me.overhead("Disable All");
      Overlay.text.flush() && Overlay.quests.flush();
      [Overlay.text.enabled, Overlay.quests.enabled] = [false, false];
      Overlay.timeOut = getTickCount() + Time.seconds(15);
    } else {
      Overlay.quests.flush();
      Overlay.quests.enabled = false;
      console.log(Overlay.quests.enabled);
    }

    delay(100);

    return true;
  },

  flush: function () {
    return Overlay.quests.flush();
  },
};
