/**
*  @filename    CharData.js
*  @author      theBGuy
*  @desc        Character Data and Tools for Kolbot-SoloPlay
*
*/

includeIfNotIncluded("SoloPlay/Tools/Tracker.js");

const CharData = {
	filePath: "libs/SoloPlay/Data/" + me.profile + "/" + me.profile + "-CharData.json",
	threads: ["libs/SoloPlay/SoloPlay.js", "libs/SoloPlay/Threads/TownChicken.js", "libs/SoloPlay/Threads/ToolsThread.js", "libs/SoloPlay/Threads/EventThread.js"],
	default: {
		initialized: false,
		normal: {
			respecUsed: false,
			imbueUsed: false,
			socketUsed: false,
		},
		nightmare: {
			respecUsed: false,
			imbueUsed: false,
			socketUsed: false,
		},
		hell: {
			respecUsed: false,
			imbueUsed: false,
			socketUsed: false,
		},
		me: {
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
		},
		merc: {
			act: 1,
			classid: 271,
			difficulty: 0,
			type: "",
			gear: [],
		}
	},

	loginData: {
		filePath: "libs/SoloPlay/Data/" + me.profile + "/" + me.profile + "-LoginData.json",
		default: {Acc: "", Pass: "", Char: "", existing: false},

		create: function () {
			let obj = Object.assign({}, this.default);
			let string = JSON.stringify(obj, null, 2);

			if (!FileTools.exists("libs/SoloPlay/Data/" + me.profile)) {
				let folder = dopen("libs/SoloPlay/Data");
				folder && folder.create(me.profile);
			}

			Misc.fileAction(this.filePath, 1, string);

			return obj;
		},

		getObj: function () {
			if (!FileTools.exists(this.filePath)) return CharData.loginData.create();

			let obj;
			let string = Misc.fileAction(this.filePath, 0);

			try {
				obj = JSON.parse(string);
			} catch (e) {
			// If we failed, file might be corrupted, so create a new one
				obj = this.create();
			}

			return obj ? obj : this.default;
		},

		getStats: function () {
			let obj = this.getObj();
			return Misc.clone(obj);
		},

		updateData: function (arg, property, value) {
			let obj = this.getObj();
			typeof arg !== "string" && (arg = arg.toString());
			typeof arg === "string" && (arg = arg.toLowerCase());

			if (typeof property === "object") {
				obj = Object.assign(obj, property);
				return Misc.fileAction(this.filePath, 1, JSON.stringify(obj, null, 2));
			}

			if (!!obj[arg] && obj[arg].hasOwnProperty(property)) {
				obj[arg][property] = value;
				return Misc.fileAction(this.filePath, 1, JSON.stringify(obj, null, 2));
			}

			return false;
		},
	},

	charmData: {
		getCountInfo: function () {
			const finalCharmKeys = Object.keys(myData.me.charms);
			let [curr, max] = [0, 0];

			for (let i = 0; i < finalCharmKeys.length; i++) {
				let cKey = finalCharmKeys[i];
				if (myData.me.charms[cKey].classid === this.id) {
					curr += myData.me.charms[cKey].have.length;
					max += myData.me.charms[cKey].max;
				}
			}

			return {
				curr: curr,
				max: max
			};
		},
		small: {
			id: sdk.items.SmallCharm,
		},
		large: {
			id: sdk.items.LargeCharm,
		},
		grand: {
			id: sdk.items.GrandCharm,
		}
	},

	buffData: {
		stamina: {
			tick: 0,
			duration: 0,
			active: function () {
				return me.getState(sdk.states.StaminaPot);
			},
			timeLeft: function () {
				return this.duration > 0 ? this.duration - (getTickCount() - this.tick) : 0;
			},
			need: function () {
				return (!this.active() || this.timeLeft() < Time.minutes(5));
			},
		},

		thawing: {
			tick: 0,
			duration: 0,
			active: function () {
				return me.getState(sdk.states.Thawing);
			},
			timeLeft: function () {
				return this.duration > 0 ? this.duration - (getTickCount() - this.tick) : 0;
			},
			need: function () {
				return (me.coldRes < 75 && (!this.active() || this.timeLeft() < Time.minutes(5)));
			},
		},

		antidote: {
			tick: 0,
			duration: 0,
			active: function () {
				return me.getState(sdk.states.Antidote);
			},
			timeLeft: function () {
				return this.duration > 0 ? this.duration - (getTickCount() - this.tick) : 0;
			},
			need: function () {
				// don't really like the hardcoded time value of 5 minutes, its okay but feel like it should be more dynamic
				return (me.poisonRes < 75 && (!this.active() || this.timeLeft() < Time.minutes(5)));
			},
		},

		update: function () {
			const obj = JSON.stringify(Misc.copy(this));
			const myThread = getScript(true).name;
			CharData.threads.forEach(function (script) {
				let curr = getScript(script);
				if (curr && myThread !== curr.name) {
					curr.send("buff--" + obj);
				}
			});
		},
	},

	skillData: {
		skills: [],
		currentChargedSkills: [],
		chargedSkills: [],
		chargedSkillsOnSwitch: [],
		bowData: {
			initialized: false,
			bowOnSwitch: false,
			bowGid: 0,
			bowType: 0,
			arrows: 0,
			quiverType: 0,
			setBowInfo: function (bow, init = false) {
				if (bow === undefined) return;
				this.bowGid = bow.gid;
				this.bowType = bow.itemType;
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
				NTIP.resetRuntimeList();
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
			let obj = JSON.stringify(Misc.copy(this));
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
			return this.currentChargedSkills.some(s => skillid.includes(s));
		},

		haveChargedSkillOnSwitch: function (skillid = 0) {
			return this.chargedSkillsOnSwitch.some(chargeSkill => chargeSkill.skill === skillid);
		}
	},

	// updates config obj across all threads - excluding our current
	updateConfig: function () {
		let obj = JSON.stringify(Misc.copy(Config));
		let myThread = getScript(true).name;
		CharData.threads.forEach(function (script) {
			let curr = getScript(script);
			if (curr && myThread !== curr.name) {
				curr.send("config--" + obj);
			}
		});
	},

	create: function () {
		let obj = Object.assign({}, this.default);
		let string = JSON.stringify(obj, null, 2);

		if (!FileTools.exists("libs/SoloPlay/Data/" + me.profile)) {
			let folder = dopen("libs/SoloPlay/Data");
			folder && folder.create(me.profile);
		}

		Misc.fileAction(this.filePath, 1, string);

		return obj;
	},

	getObj: function () {
		if (!FileTools.exists(this.filePath)) return CharData.create();

		let obj;
		let string = Misc.fileAction(this.filePath, 0);

		try {
			obj = JSON.parse(string);
		} catch (e) {
			// If we failed, file might be corrupted, so create a new one
			obj = this.create();
		}

		return obj ? obj : this.default;
	},

	getStats: function () {
		let obj = this.getObj();
		return Misc.clone(obj);
	},

	updateData: function (arg, property, value) {
		while (me.ingame && !me.gameReady) {
			delay(100);
		}

		console.trace();

		let obj = this.getObj();
		typeof arg !== "string" && (arg = arg.toString());
		typeof arg === "string" && (arg = arg.toLowerCase());

		if (typeof property === "object") {
			obj = Object.assign(obj, property);
			return Misc.fileAction(this.filePath, 1, JSON.stringify(obj, null, 2));
		}

		if (!!obj[arg] && obj[arg].hasOwnProperty(property)) {
			obj[arg][property] = value;
			return Misc.fileAction(this.filePath, 1, JSON.stringify(obj, null, 2));
		}

		return false;
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

CharData.charmData.small.getCountInfo = CharData.charmData.getCountInfo.bind(CharData.charmData.small);
CharData.charmData.large.getCountInfo = CharData.charmData.getCountInfo.bind(CharData.charmData.large);
CharData.charmData.grand.getCountInfo = CharData.charmData.getCountInfo.bind(CharData.charmData.grand);
