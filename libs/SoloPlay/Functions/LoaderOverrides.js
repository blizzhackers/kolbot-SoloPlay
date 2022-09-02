/**
*  @filename    LoaderOverrides.js
*  @author      kolton
*  @desc        script loader, based on mBot's Sequencer.js, modifed by theBGuy for SoloPlay
*
*/

// TODO: make this a loader for the actual scripts run by SoloPlay rather than the just the SoloPlay base script

includeIfNotIncluded("common/Loader.js");

Loader.getScripts = function () {
	let fileList = dopen("libs/SoloPlay/Scripts").getFiles();

	for (let i = 0; i < fileList.length; i += 1) {
		if (fileList[i].indexOf(".js") > -1) {
			this.fileList.push(fileList[i].substring(0, fileList[i].indexOf(".js")));
		}
	}
};

Loader.scriptName = function (offset = 0) {
	let index = this.scriptIndex + offset;

	if (index >= 0 && index < SoloIndex.scripts.length) {
		return SoloIndex.scripts[index];
	}

	return "SoloPlay";
};

Loader.loadScripts = function () {
	let reconfiguration, unmodifiedConfig = {};

	this.copy(Config, unmodifiedConfig);

	if (!this.fileList.length) {
		showConsole();

		throw new Error("You don't have any valid scripts in bots folder.");
	}

	for (let s in Scripts) {
		if (Scripts.hasOwnProperty(s) && Scripts[s]) {
			this.scriptList.push(s);
		}
	}

	for (this.scriptIndex = 0; this.scriptIndex < this.scriptList.length; this.scriptIndex++) {
		let script = this.scriptList[this.scriptIndex];

		if (this.fileList.indexOf(script) < 0) {
			if (FileTools.exists("libs/SoloPlay/" + script + ".js")) {
				console.warn("ÿc1Something went wrong in loader, file exists in folder but didn't get included during init process. Lets ignore the error and continue to include the script by name instead");
			} else {
				Misc.errorReport("ÿc1Script " + script + " doesn't exist.");

				continue;
			}
		}

		if (!include("SoloPlay/" + script + ".js")) {
			Misc.errorReport("Failed to include script: " + script);
			continue;
		}

		if (isIncluded("SoloPlay/" + script + ".js")) {
			try {
				if (typeof (global[script]) !== "function") throw new Error("Invalid script function name");

				if (this.skipTown.includes(script) || Town.goToTown()) {
					console.log("ÿc2Starting script: ÿc9" + script);
					Messaging.sendToScript("libs/SoloPlay/Threads/ToolsThread.js", JSON.stringify({currScript: script}));
					reconfiguration = typeof Scripts[script] === "object";

					if (reconfiguration) {
						console.log("ÿc2Copying Config properties from " + script + " object.");
						this.copy(Scripts[script], Config);
					}

					let tick = getTickCount();

					if (global[script]()) {
						console.log("ÿc7" + script + " :: ÿc0Complete ÿc0- ÿc7Duration: ÿc0" + (new Date(getTickCount() - tick).toISOString().slice(11, -5)));
					}
				}
			} catch (error) {
				Misc.errorReport(error, script);
			} finally {
				// Dont run for last script as that will clear everything anyway
				if (this.scriptIndex < this.scriptList.length) {
					// remove script function from global scope, so it can be cleared by GC
					delete global[script];
				}
					
				if (reconfiguration) {
					console.log("ÿc2Reverting back unmodified config properties.");
					this.copy(unmodifiedConfig, Config);
				}
			}
		}
	}
};

Loader.run = function () {
	let updatedDifficulty = Check.nextDifficulty();
	updatedDifficulty && CharData.updateData("me", "setDifficulty", updatedDifficulty);

	for (this.scriptIndex = 0; this.scriptIndex < SoloIndex.scripts.length; this.scriptIndex++) {
		!me.inTown && Town.goToTown();
		Check.checkSpecialCase();
		const scriptName = SoloIndex.scripts[this.scriptIndex];

		if (SoloIndex.index[scriptName] !== undefined && SoloIndex.index[scriptName].shouldRun()) {
			let j;
			let tick;
			let currentExp;

			try {
				includeIfNotIncluded("SoloPlay/Scripts/" + scriptName + ".js");

				tick = getTickCount();
				currentExp = me.getStat(sdk.stats.Experience);
				Messaging.sendToScript("libs/SoloPlay/Threads/ToolsThread.js", JSON.stringify({currScript: scriptName}));

				for (j = 0; j < 5; j += 1) {
					if (global[scriptName]()) {
						break;
					}
				}

				(j === 5) && myPrint("script " + scriptName + " failed.");
			} catch (e) {
				console.warn("ÿc8Kolbot-SoloPlayÿc0: ", (typeof e === "object" ? e.message : e));
				console.error(e);
			} finally {
				SoloIndex.doneList.push(scriptName);
				// skip logging if we didn't actually finish it
				!SoloIndex.retryList.includes(scriptName) && Developer.logPerformance && Tracker.script(tick, scriptName, currentExp);
				console.log("ÿc8Kolbot-SoloPlayÿc0: Old maxgametime: " + Developer.formatTime(me.maxgametime));
				me.maxgametime += (getTickCount() - tick);
				console.log("ÿc8Kolbot-SoloPlayÿc0: New maxgametime: " + Developer.formatTime(me.maxgametime));
				console.log("ÿc8Kolbot-SoloPlayÿc0 :: ÿc8" + scriptName + "ÿc0 - ÿc7Duration: ÿc0" + Developer.formatTime(getTickCount() - tick));

				// remove script function from function scope, so it can be cleared by GC
				if (this.scriptIndex < SoloIndex.scripts.length) {
					delete global[scriptName];
				}
			}

			if (me.sorceress && me.hell && scriptName === "bloodraven" && me.charlvl < 68) {
				console.debug("End-run, we are not ready to keep pushing yet");
					
				break;
			}

			if (me.dead) {
				// not sure how we got here but we are dead, why did toolsthread not quit lets check it
				let tThread = getScript("libs/SoloPlay/Threads/ToolsThread.js");
				if (!tThread || !tThread.running) {
					// well that explains why, toolsthread seems to have crashed lets restart it so we quit properly
					load("libs/SoloPlay/Threads/ToolsThread.js");
				}
			}
		}
	}

	// Re-check to see if after this run we now meet difficulty requirments
	if (!updatedDifficulty) {
		updatedDifficulty = Check.nextDifficulty(false);
		updatedDifficulty && CharData.updateData("me", "setDifficulty", updatedDifficulty);
	}

	return true;
};

Loader.runScript = function (script, configOverride) {
	let tick;
	let currentExp;
	let failed = false;
	let reconfiguration, unmodifiedConfig = {};
	let mainScript = this.scriptName();
		
	function buildScriptMsg () {
		let str = "ÿc9" + mainScript + " ÿc0:: ";

		if (Loader.tempList.length && Loader.tempList[0] !== mainScript) {
			Loader.tempList.forEach(s => str += "ÿc9" + s + " ÿc0:: ");
		}
			
		return str;
	}

	this.copy(Config, unmodifiedConfig);

	if (includeIfNotIncluded("SoloPlay/Scripts/" + script + ".js")) {
		try {
			if (typeof (global[script]) !== "function") throw new Error("Invalid script function name");
			if (this.skipTown.includes(script) || Town.goToTown()) {
				let mainScriptStr = (mainScript !== script ? buildScriptMsg() : "");
				this.tempList.push(script);
				console.log(mainScriptStr + "ÿc2Starting script: ÿc9" + script);
				Messaging.sendToScript("libs/SoloPlay/Threads/ToolsThread.js", JSON.stringify({currScript: script}));

				if (typeof configOverride === "function") {
					reconfiguration = true;
					configOverride();
				}

				tick = getTickCount();
				currentExp = me.getStat(sdk.stats.Experience);

				if (global[script]()) {
					console.log(mainScriptStr + "ÿc7" + script + " :: ÿc0Complete ÿc0- ÿc7Duration: ÿc0" + (Time.format(getTickCount() - tick)));
				}
			}
		} catch (e) {
			failed = true;
			console.warn("ÿc8Kolbot-SoloPlayÿc0: " + (e.message ? e.message : e));
		} finally {
			SoloIndex.doneList.push(script);
			Developer.logPerformance && Tracker.script(tick, script, currentExp);
			delete global[script];
			this.tempList.pop();
				
			if (reconfiguration) {
				console.log("ÿc2Reverting back unmodified config properties.");
				this.copy(unmodifiedConfig, Config);
			}
		}
	} else {
		console.warn("Failed to include: " + script);
	}

	return !failed;
};
