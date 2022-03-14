/**
*	@filename	LoaderOverrides.js
*	@author		kolton
*	@desc		script loader, based on mBot's Sequencer.js, modifed by theBGuy for SoloPlay
*/

if (!isIncluded("common/Loader.js")) { include("common/Loader.js"); }

Loader.loadScripts = function () {
	let reconfiguration, script,
		unmodifiedConfig = {};

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
		script = this.scriptList[this.scriptIndex];

		if (this.fileList.indexOf(script) < 0) {
			if (FileTools.exists("bots/" + script + ".js")) {
				print("ÿc1Something went wrong in loader, file exists in folder but didn't get included during init process. Lets ignore the error and continue to include the script by name instead");
			} else {
				Misc.errorReport("ÿc1Script " + script + " doesn't exist.");
				continue;
			}
		}

		if (!include("bots/" + script + ".js")) {
			Misc.errorReport("Failed to include script: " + script);
			continue;
		}

		if (isIncluded("bots/" + script + ".js")) {
			try {
				if (typeof (global[script]) !== "function") {
					throw new Error("Invalid script function name");
				}

				if (this.skipTown.indexOf(script) > -1 || Town.goToTown()) {
					print("ÿc2Starting script: ÿc9" + script);
					Messaging.sendToScript("libs/SoloPlay/Tools/ToolsThread.js", JSON.stringify({currScript: script}));

					reconfiguration = typeof Scripts[script] === 'object';

					if (reconfiguration) {
						print("ÿc2Copying Config properties from " + script + " object.");
						this.copy(Scripts[script], Config);
					}

					global[script]();

					if (reconfiguration) {
						print("ÿc2Reverting back unmodified config properties.");
						this.copy(unmodifiedConfig, Config);
					}
				}
			} catch (error) {
				Misc.errorReport(error, script);
			}
		}
	}
};
