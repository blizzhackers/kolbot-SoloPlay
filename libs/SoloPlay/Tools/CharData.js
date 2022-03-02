/*
*	@filename	CharData.js
*	@author		theBGuy
*	@desc		Character Data and Tools for Kolbot-SoloPlay
*/

const CharData = {
	filePath: "libs/SoloPlay/Data/" + me.profile + "/" + me.profile + "-CharData.json",
	default: {
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
			startTime: 0,
			charName: "",
			level: 1,
			strength: 0,
			dexterity: 0,
			currentBuild: "Start",
			finalBuild: "",
			highestDifficulty: "Normal",
			setDifficulty: "Normal"
		},
		merc: {
			act: 1,
			classid: 271,
			difficulty: 0,
			type: "",
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
		},

		update: function () {
			let scripts = ["default.dbj", "libs/SoloPlay/Tools/TownChicken.js", "libs/SoloPlay/Tools/ToolsThread.js"];
			let obj = JSON.stringify(Misc.copy(this));
			let myThread = getScript(true).name;
			scripts.forEach(function (script) {
				let curr = getScript(script);
				if (curr && myThread !== curr.name) {
					Messaging.sendToScript(script, "buff--" + obj);
				}
			});
		},
	},

	skillData: {
		skills: [],
		currentChargedSkills: [],
		chargedSkillsOnSwitch: [],

		init: function (all, switchSkills) {
			this.currentChargedSkills = all.slice(0);
			this.chargedSkillsOnSwitch = switchSkills.slice(0);
			this.skills = me.getSkill(4).map(function (skill) { return skill[0]; });
		},

		update: function () {
			let scripts = ["default.dbj", "libs/SoloPlay/Tools/TownChicken.js", "libs/SoloPlay/Tools/ToolsThread.js", "libs/SoloPlay/Tools/EventThread.js"];
			let obj = JSON.stringify(Misc.copy(this));
			let myThread = getScript(true).name;
			scripts.forEach(function (script) {
				let curr = getScript(script);
				if (curr && myThread !== curr.name) {
					Messaging.sendToScript(script, "skill--" + obj);
				}
			});
		},
	},

	// updates config obj across all threads - excluding our current
	updateConfig: function () {
		let scripts = ["default.dbj", "libs/SoloPlay/Tools/TownChicken.js", "libs/SoloPlay/Tools/ToolsThread.js", "libs/SoloPlay/Tools/EventThread.js"/*, "libs/SoloPlay/Tools/AutoBuildThread.js"*/];
		let obj = JSON.stringify(Misc.copy(Config));
		let myThread = getScript(true).name;
		scripts.forEach(function (script) {
			let curr = getScript(script);
			if (curr && myThread !== curr.name) {
				Messaging.sendToScript(script, "config--" + obj);
			}
		});
	},

	create: function () {
		let obj = Object.assign({}, this.default);
		let string = JSON.stringify(obj);

		if (!FileTools.exists("libs/SoloPlay/Data/" + me.profile)) {
			let folder = dopen("libs/SoloPlay/Data");
			folder && folder.create(me.profile);
		}

		Misc.fileAction(this.filePath, 1, string);

		return obj;
	},

	getObj: function () {
		let obj;

		if (!FileTools.exists(this.filePath)) {
			return CharData.create();
		}

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

		let obj = this.getObj();
		typeof arg !== "string" && (arg = arg.toString());
		typeof arg === "string" && (arg = arg.toLowerCase());

		if (typeof property === "object") {
			obj = Object.assign(obj, property);
			return Misc.fileAction(this.filePath, 1, JSON.stringify(obj));
		}

		if (!!obj[arg] && obj[arg].hasOwnProperty(property)) {
			obj[arg][property] = value;
			return Misc.fileAction(this.filePath, 1, JSON.stringify(obj));
		}

		return false;
	},

	delete: function (deleteMain = false) {
		if (deleteMain && FileTools.exists("data/" + me.profile + ".json")) {
			FileTools.remove("data/" + me.profile + ".json");
		}
			
		if (FileTools.exists(this.filePath)) {
			FileTools.remove(this.filePath);
		}

		if (FileTools.exists("libs/SoloPlay/Data/" + me.profile + ".GameTime" + ".json")) {
			FileTools.remove("libs/SoloPlay/Data/" + me.profile + ".GameTime" + ".json");
		}

		return !(FileTools.exists(this.filePath) && FileTools.exists("libs/SoloPlay/Data/" + me.profile + ".GameTime" + ".json"));
	},
}
