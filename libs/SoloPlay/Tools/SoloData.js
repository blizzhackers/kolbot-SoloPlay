/*
*	@filename	SoloData.js
*	@author		theBGuy
*	@desc		Character Data and Tools Kolbot-SoloPlay
*/

const SoloData = {
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
			currentBuild: "Start",
			finalBuild: "",
			highestDifficulty: "Normal",
			setDifficulty: "Normal"
		},
		merc: {
			act: 0,
			difficulty: 0,
			type: "",
		}
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
			return SoloData.create();
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