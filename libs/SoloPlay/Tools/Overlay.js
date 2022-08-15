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

const Overlay = {
	resfix: {x: -10, y: me.screensize ? 0 : -120},
	quest: {x: 8, y: 368},
	qYMod: {1: 368, 2: 384, 3: 384, 4: 414, 5: 384},
	dashboard: {x: 120, y: 470},
	timer: {x: 0, y: 595},
	build: SetUp.currentBuild,
	realm: (me.realm ? me.realm : "SinglePlayer"),
	difficulty: () => sdk.difficulty.nameOf(me.diff),
	level: () => myData.me.level,
	text: {
		hooks: [],
		GameTracker: Developer.readObj(Tracker.GTPath),
		enabled: true,
		charlvl: 0,
		tick: 0,

		clock: function () {
			this.GameTracker === undefined && (this.GameTracker = Developer.readObj(Tracker.GTPath));
			this.tick = getTickCount();
			let currInGame = getTickCount() - me.gamestarttime;
			let totalTime = Developer.formatTime(this.GameTracker.Total + currInGame);
			let totalInGame = Developer.formatTime(this.GameTracker.InGame + currInGame);

			return ("Total: ÿc0" + totalTime + "ÿc4 InGame: ÿc0" + totalInGame + "ÿc4 OOG: ÿc0" + Developer.formatTime(this.GameTracker.OOG));
		},

		timer: function () {
			return (new Date(getTickCount() - me.gamestarttime).toISOString().slice(11, -5));
		},

		check: function () {
			if (!this.enabled) {
				this.flush();

				return;
			}

			// Double check in case still got here before being ready
			if (!me.gameReady && !me.ingame && !me.area) return;

			this.GameTracker === undefined && (this.GameTracker = Developer.readObj(Tracker.GTPath));
			
			!this.getHook("dashboard") && this.add("dashboard");
			!this.getHook("credits") && this.add("credits");
			
			if (!this.getHook("InGameTimer")) {
				this.add("InGameTimer");
			} else {
				if (getTickCount() - this.tick >= 1000) {
					this.getHook("InGameTimer").hook.text = "ÿc0" + this.timer();
				}
			}

			if (!this.getHook("times")) {
				this.add("times");
			} else {
				if (getTickCount() - this.tick >= 1000) {
					this.getHook("times").hook.text = this.clock();
				}
			}

			if (!this.getHook("level")) {
				this.add("level");
			} else if (this.charlvl !== Overlay.level()) {
				this.charlvl = Overlay.level();
				this.getHook("level").hook.text = "Name: ÿc0" + me.name + "ÿc4  Diff: ÿc0" + Overlay.difficulty() + "ÿc4  Level: ÿc0" + this.charlvl;
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
				this.charlvl = Overlay.level();
				this.hooks.push({
					name: "level",
					hook: new Text("Name: ÿc0" + me.name + "ÿc4  Diff: ÿc0" + Overlay.difficulty() + "ÿc4  Level: ÿc0" + this.charlvl, Overlay.dashboard.x, Overlay.dashboard.y + Overlay.resfix.y + 30, 4, 13, 0)
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
					hook: new Text("ÿc0" + this.timer(), Overlay.timer.x + 7, Overlay.timer.y + Overlay.resfix.y, 0, 13, 0)
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
		}
	},

	quests: {
		enabled: true,
		hooks: [],
		font: 12,
		qHooks: [],

		data: {
			Den: {
				complete: false,
				condition: () => me.getQuest(sdk.quest.id.DenofEvil, sdk.quest.states.Completed)
			},
			BloodRaven: {
				complete: false,
				condition: () => me.getQuest(sdk.quest.id.SistersBurialGrounds, sdk.quest.states.Completed)
			},
			Tristram: {
				complete: false,
				condition: () => me.getQuest(sdk.quest.id.TheSearchForCain, sdk.quest.states.Completed)
			},
			Countess: {
				complete: false,
				condition: () => me.getQuest(sdk.quest.id.ForgottenTower, sdk.quest.states.Completed)
			},
			Smith: {
				complete: false,
				condition: () => (me.getQuest(sdk.quest.id.ToolsoftheTrade, sdk.quest.states.Completed) || me.getQuest(sdk.quest.id.ToolsoftheTrade, sdk.quest.states.ReqComplete))
			},
			Andariel: {
				complete: false,
				condition: () => me.getQuest(sdk.quest.id.SistersToTheSlaughter, sdk.quest.states.Completed)
			},
			Cube: {
				complete: false,
				condition: () => me.cube
			},
			Radament: {
				complete: false,
				condition: () => me.getQuest(sdk.quest.id.RadamentsLair, sdk.quest.states.Completed)
			},
			HoradricStaff: {
				complete: false,
				condition: () => me.getQuest(sdk.quest.id.TheHoradricStaff, sdk.quest.states.Completed)
			},
			Amulet: {
				complete: false,
				condition: () => me.getQuest(sdk.quest.id.TheTaintedSun, sdk.quest.states.Completed)
			},
			Summoner: {
				complete: false,
				condition: () => me.getQuest(sdk.quest.id.TheSummoner, sdk.quest.states.Completed)
			},
			Duriel: {
				complete: false,
				condition: () => me.getQuest(sdk.quest.id.TheSevenTombs, sdk.quest.states.Completed)
			},
			GoldenBird: {
				complete: false,
				condition: () => me.getQuest(sdk.quest.id.TheGoldenBird, sdk.quest.states.Completed)
			},
			KhalimsWill: {
				complete: false,
				condition: () => me.getQuest(sdk.quest.id.KhalimsWill, sdk.quest.states.Completed)
			},
			LamEsen: {
				complete: false,
				condition: () => me.getQuest(sdk.quest.id.LamEsensTome, sdk.quest.states.Completed)
			},
			Travincal: {
				complete: false,
				condition: () => me.getQuest(sdk.quest.id.TheBlackenedTemple, sdk.quest.states.Completed)
			},
			Mephisto: {
				complete: false,
				condition: () => me.getQuest(sdk.quest.id.TheGuardian, sdk.quest.states.Completed)
			},
			Izual: {
				complete: false,
				condition: () => me.getQuest(sdk.quest.id.TheFallenAngel, sdk.quest.states.Completed)
			},
			HellForge: {
				complete: false,
				condition: () => (me.getQuest(sdk.quest.id.HellsForge, sdk.quest.states.Completed) || me.getQuest(sdk.quest.id.HellsForge, sdk.quest.states.ReqComplete))
			},
			Diablo: {
				complete: false,
				condition: () => me.getQuest(sdk.quest.id.TerrorsEnd, sdk.quest.states.Completed)
			},
			Shenk: {
				complete: false,
				condition: () => (me.getQuest(sdk.quest.id.SiegeOnHarrogath, sdk.quest.states.Completed) || me.getQuest(sdk.quest.id.SiegeOnHarrogath, sdk.quest.states.ReqComplete))
			},
			Barbies: {
				complete: false,
				condition: () => me.getQuest(sdk.quest.id.RescueonMountArreat, sdk.quest.states.Completed)
			},
			Anya: {
				complete: false,
				condition: () => me.getQuest(sdk.quest.id.PrisonofIce, sdk.quest.states.Completed)
			},
			Ancients: {
				complete: false,
				condition: () => me.getQuest(sdk.quest.id.RiteofPassage, sdk.quest.states.Completed)
			},
			Baal: {
				complete: false,
				condition: () => me.getQuest(sdk.quest.id.EyeofDestruction, sdk.quest.states.Completed)
			},
		},

		questStatus: function (q = "") {
			if (typeof this.data[q] === "undefined") return "undefined";
			if (this.data[q].complete) return "ÿc2Complete";
			let status = this.data[q].condition();
			if (!!status) {
				this.data[q].complete = true;
				return "ÿc2Complete";
			}
			return "ÿc1Incomplete";
		},

		getRes: function () {
			// Double check in case still got here before being ready
			if (!me.gameReady || !me.ingame || !me.area) return "";
			return ("FR: ÿc1" + me.FR + "ÿc4  CR: ÿc3" + me.CR + "ÿc4  LR: ÿc9" + me.LR + "ÿc4  PR: ÿc2" + me.PR + "ÿc4  CurrentBuild: ÿc0" + Overlay.build);
		},

		getStats: function () {
			// Double check in case still got here before being ready
			if (!me.gameReady || !me.ingame || !me.area) return "";

			let textLine = ("MF: ÿc8" + me.getStat(sdk.stats.MagicBonus) + "ÿc4  FHR: ÿc8" + (me.FHR) + "ÿc4  FBR: ÿc8" + (me.FBR) + "ÿc4  FCR: ÿc8" + (me.FCR)
				+ "ÿc4  IAS: ÿc8" + (me.IAS));

			return textLine;
		},

		check: function () {
			if (!this.enabled || !me.gameReady || !me.ingame || !me.area || me.dead) {
				this.flush();

				return;
			}

			!this.getHook("resistances", this.hooks) ? this.add("resistances") : this.getHook("resistances", this.hooks).hook.text = this.getRes();
			!this.getHook("stats", this.hooks) ? this.add("stats") : this.getHook("stats", this.hooks).hook.text = this.getStats();
			!this.getHook("questheader") && this.add("questheader");

			switch (me.act) {
			case 1:
				!this.getHook("Den") ? this.add("Den") : this.getHook("Den").hook.text = "Den: " + this.questStatus("Den");
				!this.getHook("BloodRaven") ? this.add("BloodRaven") : this.getHook("BloodRaven").hook.text = "Blood Raven: " + this.questStatus("BloodRaven");
				!this.getHook("Tristram") ? this.add("Tristram") : this.getHook("Tristram").hook.text = "Tristram: " + this.questStatus("Tristram");
				!this.getHook("Countess") ? this.add("Countess") : this.getHook("Countess").hook.text = "Countess: " + this.questStatus("Countess");
				!this.getHook("Smith") ? this.add("Smith") : this.getHook("Smith").hook.text = "Smith: " + this.questStatus("Smith");
				!this.getHook("Andariel") ? this.add("Andariel") : this.getHook("Andariel").hook.text = "Andariel: " + this.questStatus("Andariel");

				break;
			case 2:
				!this.getHook("Radament") ? this.add("Radament") : this.getHook("Radament").hook.text = "Radament: " + this.questStatus("Radament");
				//!this.getHook("Cube") ? this.add("Cube") : this.getHook("Cube").hook.text = "Horadric Cube: " + this.questStatus("Cube");
				!this.getHook("HoradricStaff") ? this.add("HoradricStaff") : this.getHook("HoradricStaff").hook.text = "Horadric Staff: " + this.questStatus("HoradricStaff");
				!this.getHook("Amulet") ? this.add("Amulet") : this.getHook("Amulet").hook.text = "Amulet: " + this.questStatus("Amulet");
				!this.getHook("Summoner") ? this.add("Summoner") : this.getHook("Summoner").hook.text = "Summoner: " + this.questStatus("Summoner");
				!this.getHook("Duriel") ? this.add("Duriel") : this.getHook("Duriel").hook.text = "Duriel: " + this.questStatus("Duriel");

				break;
			case 3:
				!this.getHook("GoldenBird") ? this.add("GoldenBird") : this.getHook("GoldenBird").hook.text = "Golden Bird: " + this.questStatus("GoldenBird");
				!this.getHook("KhalimsWill") ? this.add("KhalimsWill") : this.getHook("KhalimsWill").hook.text = "Khalim's Will: " + this.questStatus("KhalimsWill");
				!this.getHook("LamEsen") ? this.add("LamEsen") : this.getHook("LamEsen").hook.text = "LamEsen: " + this.questStatus("LamEsen");
				!this.getHook("Travincal") ? this.add("Travincal") : this.getHook("Travincal").hook.text = "Travincal: " + this.questStatus("Travincal");
				!this.getHook("Mephisto") ? this.add("Mephisto") : this.getHook("Mephisto").hook.text = "Mephisto: " + this.questStatus("Mephisto");

				break;
			case 4:
				!this.getHook("Izual") ? this.add("Izual") : this.getHook("Izual").hook.text = "Izual: " + this.questStatus("Izual");
				!this.getHook("HellForge") ? this.add("HellForge") : this.getHook("HellForge").hook.text = "HellForge: " + this.questStatus("HellForge");
				!this.getHook("Diablo") ? this.add("Diablo") : this.getHook("Diablo").hook.text = "Diablo: " + this.questStatus("Diablo");

				break;
			case 5:
				!this.getHook("Shenk") ? this.add("Shenk") : this.getHook("Shenk").hook.text = "Shenk: " + this.questStatus("Shenk");
				!this.getHook("Barbies") ? this.add("Barbies") : this.getHook("Barbies").hook.text = "Barbies: " + this.questStatus("Barbies");
				!this.getHook("Anya") ? this.add("Anya") : this.getHook("Anya").hook.text = "Anya: " + this.questStatus("Anya");
				!this.getHook("Ancients") ? this.add("Ancients") : this.getHook("Ancients").hook.text = "Ancients: " + this.questStatus("Ancients");
				!this.getHook("Baal") ? this.add("Baal") : this.getHook("Baal").hook.text = "Baal: " + this.questStatus("Baal");

				break;
			}

			!this.getHook("questbox") && this.add("questbox");
		},

		add: function (name) {
			switch (name) {
			case "resistances":
				this.hooks.push({
					name: "resistances",
					hook: new Text(this.getRes(), Overlay.dashboard.x, Overlay.dashboard.y + Overlay.resfix.y + 45, 4, 13, 0)
				});

				break;
			case "stats":
				this.hooks.push({
					name: "stats",
					hook: new Text(this.getStats(), Overlay.dashboard.x, Overlay.dashboard.y + Overlay.resfix.y + 60, 4, 13, 0)
				});

				break;
			case "questbox":
				this.qHooks.push({
					name: "questbox",
					hook: new Box(Overlay.quest.x - 8, Overlay.quest.y + Overlay.resfix.y - 17, 145, 10 + [0, 105, 90, 90, 60, 90][me.act], 0x0, 4, 0)
				});

				this.qHooks.push({
					name: "questframe",
					hook: new Frame(Overlay.quest.x - 8, Overlay.quest.y + Overlay.resfix.y - 17, 145, 10 + [0, 105, 90, 90, 60, 90][me.act], 0)
				});

				this.getHook("questbox").hook.zorder = 0;

				break;
			case "questheader":
				Overlay.quest.y = Overlay.qYMod[me.act];

				this.qHooks.push({
					name: "questheader",
					hook: new Text("Quests in Act: ÿc0" + me.act, Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y, 4, 0, 0)
				});

				break;
			case "Den":
				this.qHooks.push({
					name: "Den",
					hook: new Text("Den: " + this.questStatus("Den"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "BloodRaven":
				this.qHooks.push({
					name: "BloodRaven",
					hook: new Text("Blood Raven: " + this.questStatus("BloodRaven"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Tristram":
				this.qHooks.push({
					name: "Tristram",
					hook: new Text("Tristram: " + this.questStatus("Tristram"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Countess":
				this.qHooks.push({
					name: "Countess",
					hook: new Text("Countess: " + this.questStatus("Countess"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Smith":
				this.qHooks.push({
					name: "Smith",
					hook: new Text("Smith: " + this.questStatus("Smith"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Andariel":
				this.qHooks.push({
					name: "Andariel",
					hook: new Text("Andariel: " + this.questStatus("Andariel"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Radament":
				this.qHooks.push({
					name: "Radament",
					hook: new Text("Radament: " + this.questStatus("Radament"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "HoradricStaff":
				this.qHooks.push({
					name: "HoradricStaff",
					hook: new Text("Horadric Staff: " + this.questStatus("HoradricStaff"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Amulet":
				this.qHooks.push({
					name: "Amulet",
					hook: new Text("Amulet: " + this.questStatus("Amulet"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Summoner":
				this.qHooks.push({
					name: "Summoner",
					hook: new Text("Summoner: " + this.questStatus("Summoner"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Duriel":
				this.qHooks.push({
					name: "Duriel",
					hook: new Text("Duriel: " + this.questStatus("Duriel"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "GoldenBird":
				this.qHooks.push({
					name: "GoldenBird",
					hook: new Text("Golden Bird: " + this.questStatus("GoldenBird"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "KhalimsWill":
				this.qHooks.push({
					name: "KhalimsWill",
					hook: new Text("Khalim's Will: " + this.questStatus("KhalimsWill"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "LamEsen":
				this.qHooks.push({
					name: "LamEsen",
					hook: new Text("LamEsen: " + this.questStatus("LamEsen"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Travincal":
				this.qHooks.push({
					name: "Travincal",
					hook: new Text("Travincal: " + this.questStatus("Travincal"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Mephisto":
				this.qHooks.push({
					name: "Mephisto",
					hook: new Text("Mephisto: " + this.questStatus("Mephisto"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Izual":
				this.qHooks.push({
					name: "Izual",
					hook: new Text("Izual: " + this.questStatus("Izual"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "HellForge":
				this.qHooks.push({
					name: "HellForge",
					hook: new Text("HellForge: " + this.questStatus("HellForge"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Diablo":
				this.qHooks.push({
					name: "Diablo",
					hook: new Text("Diablo: " + this.questStatus("Diablo"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Shenk":
				this.qHooks.push({
					name: "Shenk",
					hook: new Text("Shenk: " + this.questStatus("Shenk"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Barbies":
				this.qHooks.push({
					name: "Barbies",
					hook: new Text("Barbies: " + this.questStatus("Barbies"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Anya":
				this.qHooks.push({
					name: "Anya",
					hook: new Text("Anya: " + this.questStatus("Anya"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Ancients":
				this.qHooks.push({
					name: "Ancients",
					hook: new Text("Ancients: " + this.questStatus("Ancients"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Baal":
				this.qHooks.push({
					name: "Baal",
					hook: new Text("Baal: " + this.questStatus("Baal"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			}
		},

		getHook: function (name, hooks) {
			while (!me.gameReady || !me.ingame || !me.area) {
				delay(500);
			}

			hooks === undefined && (hooks = this.qHooks);

			for (let i = 0; i < hooks.length; i += 1) {
				if (hooks[i].name === name) {
					return hooks[i];
				}
			}

			return false;
		},

		flush: function () {
			while (this.hooks.length) {
				this.hooks.shift().hook.remove();
			}

			while (this.qHooks.length) {
				this.qHooks.shift().hook.remove();
			}
		}
	},

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
			Overlay.quests.enabled ? Overlay.quests.check() : Overlay.quests.flush();
		}

		return msg ? true : (me.gameReady && me.ingame && !me.dead) ? status() : false;
	},

	disable: function (all = false) {
		me.overhead("Disable");

		if (all) {
			me.overhead("Disable All");
			Overlay.text.flush();
			Overlay.quests.flush();
			Overlay.text.enabled = false;
			Overlay.quests.enabled = false;
		} else {
			Overlay.quests.flush();
			Overlay.quests.enabled = false;
			console.log(Overlay.quests.enabled);
		}

		delay(100);

		return true;
	},

	flush: function () {
		Overlay.quests.flush();

		return true;
	},
};
