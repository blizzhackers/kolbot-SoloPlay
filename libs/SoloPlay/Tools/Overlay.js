/*
*	@filename	Overlay.js
*	@author		theBGuy
*	@desc		overlay thread for Kolbot-SoloPlay
*	@credits 	Adpist for first gen Overlay, isid0re for styleing and tracker, kolton
*/

if (!isIncluded("SoloPlay/Tools/Developer.js")) { include("SoloPlay/Tools/Developer.js"); }
if (!isIncluded("SoloPlay/Tools/Tracker.js")) { include("SoloPlay/Tools/Tracker.js"); }
if (!isIncluded("SoloPlay/Functions/ProtoTypesOverrides.js")) { include("SoloPlay/Functions/ProtoTypesOverrides.js"); }

const Overlay = {
	resfix: {x: -10, y: me.screensize ? 0 : -120},
	quest: {x: 8, y: 368},
	qYMod: {1: 368, 2: 384, 3: 384, 4: 414, 5: 384},
	dashboard: {x: 120, y: 470},
	timer: {x: 0, y: 595},
	build: SetUp.currentBuild,
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
			let totalDays = Developer.totalDays(this.GameTracker.Days);

			return "Total: ÿc0" + totalTime + "ÿc4 InGame: ÿc0" + totalInGame + "ÿc4 OOG: ÿc0" + Developer.formatTime(this.GameTracker.OOG);
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
			} else if (this.charlvl !== me.charlvl) {
				this.getHook("level").hook.text = "Name: ÿc0" + me.name + "ÿc4  Diff: ÿc0" + sdk.difficulty.nameOf(me.diff) + "ÿc4  Level: ÿc0" + me.charlvl;
				this.charlvl = me.charlvl;
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
					hook: new Text("Kolbot-SoloPlay by: ÿc0 theBGuy" + "ÿc4  Realm: ÿc0" + (me.realm ? me.realm : "SinglePlayer"), Overlay.dashboard.x, Overlay.dashboard.y + Overlay.resfix.y + 15, 4, 13, 0)
				});

				break;
			case "level":
				this.charlvl = me.charlvl;
				this.hooks.push({
					name: "level",
					hook: new Text("Name: ÿc0" + me.name + "ÿc4  Diff: ÿc0" + sdk.difficulty.nameOf(me.diff) + "ÿc4  Level: ÿc0" + this.charlvl, Overlay.dashboard.x, Overlay.dashboard.y + Overlay.resfix.y + 30, 4, 13, 0)
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

		getRes: function () {
			// Double check in case still got here before being ready
			if (!me.gameReady || !me.ingame || !me.area) return "";

			return "FR: ÿc1" + me.FR + "ÿc4  CR: ÿc3" + me.CR + "ÿc4  LR: ÿc9" + me.LR + "ÿc4  PR: ÿc2" + me.PR + "ÿc4  CurrentBuild: ÿc0" + Overlay.build;
		},

		getStats: function () {
			// Double check in case still got here before being ready
			if (!me.gameReady || !me.ingame || !me.area) return "";

			let textLine = "MF: ÿc8" + me.getStat(80) + "ÿc4  FHR: ÿc8" + (me.FHR) + "ÿc4  FBR: ÿc8" + (me.FBR) + "ÿc4  FCR: ÿc8" + (me.FCR)
				+ "ÿc4  IAS: ÿc8" + (me.IAS);

			return textLine;
		},

		check: function () {
			if (!this.enabled) {
				this.flush();

				return;
			}

			if (!me.gameReady || !me.ingame || !me.area || me.dead) {
				this.flush();

				return;
			}

			if (!this.getHook("resistances", this.hooks)) {
				this.add("resistances");
			} else {
				this.getHook("resistances", this.hooks).hook.text = this.getRes();
			}

			if (!this.getHook("stats", this.hooks)) {
				this.add("stats");
			} else {
				this.getHook("stats", this.hooks).hook.text = this.getStats();
			}

			!this.getHook("questheader") && this.add("questheader");

			switch (me.act) {
			case 1:
				if (!this.getHook("Den")) {
					this.add("Den");
				} else {
					this.getHook("Den").hook.text = "Den: " + (me.getQuest(1, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("BloodRaven")) {
					this.add("BloodRaven");
				} else {
					this.getHook("BloodRaven").hook.text = "Blood Raven: " + (me.getQuest(2, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Tristram")) {
					this.add("Tristram");
				} else {
					this.getHook("Tristram").hook.text = "Tristram: " + (me.getQuest(4, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Countess")) {
					this.add("Countess");
				} else {
					this.getHook("Countess").hook.text = "Countess: " + (me.getQuest(5, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Smith")) {
					this.add("Smith");
				} else {
					this.getHook("Smith").hook.text = "Smith: " + (me.getQuest(3, 0) || me.getQuest(3, 1) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Andariel")) {
					this.add("Andariel");
				} else {
					this.getHook("Andariel").hook.text = "Andariel: " + (me.getQuest(6, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				break;
			case 2:
				if (!this.getHook("Cube")) {
					this.add("Cube");
				} else {
					this.getHook("Cube").hook.text = "Horadric Cube: " + (me.getItem(553) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Radament")) {
					this.add("Radament");
				} else {
					this.getHook("Radament").hook.text = "Radament: " + (me.getQuest(9, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("HoradricStaff")) {
					this.add("HoradricStaff");
				} else {
					this.getHook("HoradricStaff").hook.text = "Horadric Staff: " + (me.getQuest(10, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Amulet")) {
					this.add("Amulet");
				} else {
					this.getHook("Amulet").hook.text = "Amulet: " + (me.getQuest(11, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Summoner")) {
					this.add("Summoner");
				} else {
					this.getHook("Summoner").hook.text = "Summoner: " + (me.getQuest(13, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Duriel")) {
					this.add("Duriel");
				} else {
					this.getHook("Duriel").hook.text = "Duriel: " + (me.getQuest(14, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				break;
			case 3:
				if (!this.getHook("GoldenBird")) {
					this.add("GoldenBird");
				} else {
					this.getHook("GoldenBird").hook.text = "Golden Bird: " + (me.getQuest(20, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Khalim'sWill")) {
					this.add("Khalim'sWill");
				} else {
					this.getHook("Khalim'sWill").hook.text = "Khalim's Will: " + (me.getQuest(18, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("LamEsen")) {
					this.add("LamEsen");
				} else {
					this.getHook("LamEsen").hook.text = "LamEsen: " + (me.getQuest(17, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Travincal")) {
					this.add("Travincal");
				} else {
					this.getHook("Travincal").hook.text = "Travincal: " + (me.getQuest(21, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Mephisto")) {
					this.add("Mephisto");
				} else {
					this.getHook("Mephisto").hook.text = "Mephisto: " + (me.getQuest(22, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				break;
			case 4:
				if (!this.getHook("Izual")) {
					this.add("Izual");
				} else {
					this.getHook("Izual").hook.text = "Izual: " + (me.getQuest(25, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("HellForge")) {
					this.add("HellForge");
				} else {
					this.getHook("HellForge").hook.text = "HellForge: " + (me.getQuest(27, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Diablo")) {
					this.add("Diablo");
				} else {
					this.getHook("Diablo").hook.text = "Diablo: " + (me.getQuest(26, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				break;
			case 5:
				if (!this.getHook("Shenk")) {
					this.add("Shenk");
				} else {
					this.getHook("Shenk").hook.text = "Shenk: " + ((me.getQuest(35, 0) || me.getQuest(35, 1)) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Barbies")) {
					this.add("Barbies");
				} else {
					this.getHook("Barbies").hook.text = "Barbies: " + (me.getQuest(36, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Anya")) {
					this.add("Anya");
				} else {
					this.getHook("Anya").hook.text = "Anya: " + (me.getQuest(37, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Ancients")) {
					this.add("Ancients");
				} else {
					this.getHook("Ancients").hook.text = "Ancients: " + (me.getQuest(39, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Baal")) {
					this.add("Baal");
				} else {
					this.getHook("Baal").hook.text = "Baal: " + (me.getQuest(40, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

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
					hook: new Text("Den: " + (me.getQuest(1, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "BloodRaven":
				this.qHooks.push({
					name: "BloodRaven",
					hook: new Text("Blood Raven: " + (me.getQuest(2, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Tristram":
				this.qHooks.push({
					name: "Tristram",
					hook: new Text("Tristram: " + (me.getQuest(4, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Countess":
				this.qHooks.push({
					name: "Countess",
					hook: new Text("Countess: " + (me.getQuest(5, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Smith":
				this.qHooks.push({
					name: "Smith",
					hook: new Text("Smith: " + (me.getQuest(3, 0) || me.getQuest(3, 1) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Andariel":
				this.qHooks.push({
					name: "Andariel",
					hook: new Text("Andariel: " + (me.getQuest(6, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Radament":
				this.qHooks.push({
					name: "Radament",
					hook: new Text("Radament: " + (me.getQuest(9, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "HoradricStaff":
				this.qHooks.push({
					name: "HoradricStaff",
					hook: new Text("Horadric Staff: " + (me.getQuest(10, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Amulet":
				this.qHooks.push({
					name: "Amulet",
					hook: new Text("Amulet: " + (me.getQuest(11, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Summoner":
				this.qHooks.push({
					name: "Summoner",
					hook: new Text("Summoner: " + (me.getQuest(13, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Duriel":
				this.qHooks.push({
					name: "Duriel",
					hook: new Text("Duriel: " + (me.getQuest(14, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "GoldenBird":
				this.qHooks.push({
					name: "GoldenBird",
					hook: new Text("Golden Bird: " + (me.getQuest(20, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Khalim'sWill":
				this.qHooks.push({
					name: "Khalim'sWill",
					hook: new Text("Khalim's Will: " + (me.getQuest(18, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "LamEsen":
				this.qHooks.push({
					name: "LamEsen",
					hook: new Text("LamEsen: " + (me.getQuest(17, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Travincal":
				this.qHooks.push({
					name: "Travincal",
					hook: new Text("Travincal: " + (me.getQuest(21, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Mephisto":
				this.qHooks.push({
					name: "Mephisto",
					hook: new Text("Mephisto: " + (me.getQuest(22, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Izual":
				this.qHooks.push({
					name: "Izual",
					hook: new Text("Izual: " + (me.getQuest(25, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "HellForge":
				this.qHooks.push({
					name: "HellForge",
					hook: new Text("HellForge: " + (me.getQuest(27, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Diablo":
				this.qHooks.push({
					name: "Diablo",
					hook: new Text("Diablo: " + (me.getQuest(26, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Shenk":
				this.qHooks.push({
					name: "Shenk",
					hook: new Text("Shenk: " + ((me.getQuest(35, 0) || me.getQuest(35, 1)) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Barbies":
				this.qHooks.push({
					name: "Barbies",
					hook: new Text("Barbies: " + (me.getQuest(36, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Anya":
				this.qHooks.push({
					name: "Anya",
					hook: new Text("Anya: " + (me.getQuest(37, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Ancients":
				this.qHooks.push({
					name: "Ancients",
					hook: new Text("Ancients: " + (me.getQuest(39, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			case "Baal":
				this.qHooks.push({
					name: "Baal",
					hook: new Text("Baal: " + (me.getQuest(26, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.quest.x, Overlay.quest.y + Overlay.resfix.y + (15 * this.qHooks.length), 4, this.font, 0)
				});

				break;
			}
		},

		getHook: function (name, hooks) {
			while (!me.gameReady || !me.ingame || !me.area) {
				delay(500 + me.ping);
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
							delay(100 + me.ping);
						}

						Misc.poll((function () { return me.gameReady; }));
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
			print(Overlay.quests.enabled);
		}

		delay(100);

		return true;
	},

	flush: function () {
		Overlay.quests.flush();

		return true;
	},
};
