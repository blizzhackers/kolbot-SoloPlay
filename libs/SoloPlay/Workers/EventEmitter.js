/**
 * @filename    EventEmitter.js
 * @author      Jaenster
 * @desc        Transpiled Global modifying UMD module to handle emitting events and add prototypes ("on", "emit", "once", "off")
 *              to Unit
 * 
 */

(function (factory) {
	if (typeof module === "object" && typeof module.exports === "object") {
		let v = factory(require, exports);
		if (v !== undefined) module.exports = v;
	} else if (typeof define === "function" && define.amd) {
		define(["require", "exports", "../../modules/Worker", "../Modules/Events"], factory);
	}
})(function (require, exports) {
	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });

	const Worker = require("../../modules/Worker");
	const Events = require("../Modules/Events");
	const old = {
		level: me.charlvl,
	};
	const gainedLevels = () => me.charlvl - old.level;

	let levelTimeout = getTickCount();

	// Start
	Worker.runInBackground.AutoBuild = function () {
		if (getTickCount() - levelTimeout < 1000) return true;
		levelTimeout = getTickCount();

		try {
			let levels = gainedLevels();

			if (levels > 0 && (Config.AutoSkill.Enabled || Config.AutoStat.Enabled)) {
				scriptBroadcast("toggleQuitlist");
				AutoBuild.print("Level up detected (", old.level, "-->", me.charlvl, ")");
				Config.AutoSkill.Enabled && AutoSkill.init(Config.AutoSkill.Build, Config.AutoSkill.Save);
				Config.AutoStat.Enabled && AutoStat.init(Config.AutoStat.Build, Config.AutoStat.Save, Config.AutoStat.BlockChance, Config.AutoStat.UseBulk);
				scriptBroadcast({ event: "level up" });
				AutoBuild.applyConfigUpdates(); // scriptBroadcast() won't trigger listener on this thread.

				AutoBuild.print("Incrementing cached character level to", old.level + 1);
				Tracker.leveling();

				// prevLevel doesn't get set to me.charlvl because
				// we may have gained multiple levels at once
				old.level += 1;

				scriptBroadcast("toggleQuitlist");
			}
		} catch (e) {
			console.error(e);
			console.warn("Something broke! StackWalk :: ", e.stack);

			return false;
		}

		return true;
	};
	AutoBuild.print("Loaded AutoBuild");
	console.log("ÿc8Kolbot-SoloPlayÿc0: Start AutoBuild");

	if (Developer.logPerformance && getScript(true).name.toString() === "libs\\soloplay\\soloplay.js") {
		Worker.runInBackground.intervalUpdate = function () {
			if (getTickCount() - Tracker.tick < Time.minutes(3)) return true;
			Tracker.tick = getTickCount();

			try {
				Tracker.update();
			} catch (e) {
				console.warn(e.message);
			}

			return true;
		};
	}
	
	// @ts-ignore
	Unit.prototype.on = Events.Events.prototype.on;
	// @ts-ignore
	Unit.prototype.off = Events.Events.prototype.off;
	// @ts-ignore
	Unit.prototype.once = Events.Events.prototype.once;
	// @ts-ignore
	Unit.prototype.emit = Events.Events.prototype.emit;
});
