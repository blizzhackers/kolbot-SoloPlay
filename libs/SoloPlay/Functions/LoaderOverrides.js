/**
*  @filename    LoaderOverrides.js
*  @author      kolton
*  @desc        script loader, based on mBot's Sequencer.js, modifed by theBGuy for SoloPlay
*
*/

// TODO: make this a loader for the actual scripts run by SoloPlay rather than the just the SoloPlay base script

!isIncluded("common/Loader.js") && include("common/Loader.js");

Loader.getScripts = function () {
	let fileList = dopen("libs/SoloPlay/").getFiles();

	for (let i = 0; i < fileList.length; i += 1) {
		if (fileList[i].indexOf(".js") > -1) {
			this.fileList.push(fileList[i].substring(0, fileList[i].indexOf(".js")));
		}
	}
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
