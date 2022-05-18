/**
*  @filename    AutoBuildOverrides.js
*  @author      theBGuy
*  @credit      alogwe - orignal author
*  @desc        modified AutoBuild for easier use with Kolbot-SoloPlay
*
*/
js_strict(true);

!isIncluded("SoloPlay/Functions/MiscOverrides.js") && include("SoloPlay/Functions/MiscOverrides.js");
!isIncluded("SoloPlay/Functions/CubingOverrides.js") && include("SoloPlay/Functions/CubingOverrides.js");
!isIncluded("SoloPlay/Functions/ProtoTypesOverrides.js") && include("SoloPlay/Functions/ProtoTypesOverrides.js");
!isIncluded("SoloPlay/Functions/RunewordsOverrides.js") && include("SoloPlay/Functions/RunewordsOverrides.js");

const AutoBuild = new function AutoBuild () {
	Config.AutoBuild.DebugMode && (Config.AutoBuild.Verbose = true);

	let usingFinalBuildFile = false,
		debug = !!Config.AutoBuild.DebugMode,
		verbose = !!Config.AutoBuild.Verbose,
		configUpdateLevel = 0, lastSuccessfulUpdateLevel = 0;

	// Apply all Update functions from the build template in order from level 1 to me.charlvl.
	// By reapplying all of the changes to the Config object, we preserve
	// the state of the Config file without altering the saved char config.
	function applyConfigUpdates () {
		debug && this.print("Updating Config from level " + configUpdateLevel + " to " + me.charlvl);
		let reapply = true;

		while (configUpdateLevel < me.charlvl) {
			configUpdateLevel += 1;
			Skill.init();
			if (usingFinalBuildFile) {
				// kind of hacky/ugly solution but reduces unneeded files
				if (finalBuild.AutoBuildTemplate[configUpdateLevel] !== undefined) {
					finalBuild.AutoBuildTemplate[configUpdateLevel].Update.apply(Config);
					lastSuccessfulUpdateLevel = configUpdateLevel;
				} else if (reapply) {
					// re-apply from the last successful update - this is helpful if inside the build file there are conditional statements
					finalBuild.AutoBuildTemplate[lastSuccessfulUpdateLevel].Update.apply(Config);
					reapply = false;
				}
			} else {
				if (AutoBuildTemplate[configUpdateLevel] !== undefined) {
					AutoBuildTemplate[configUpdateLevel].Update.apply(Config);
					lastSuccessfulUpdateLevel = configUpdateLevel;
				} else if (reapply) {
					// re-apply from the last successful update - this is helpful if inside the build file there are conditional statements
					AutoBuildTemplate[lastSuccessfulUpdateLevel].Update.apply(Config);
					reapply = false;
				}
			}
		}
	}

	function getBuildType () {
		let build = Config.AutoBuild.Template;
		if (!build) {
			this.print("Config.AutoBuild.Template is either 'false', or invalid (" + build + ")");
			throw new Error("Invalid build template, read libs/config/Builds/README.txt for information");
		}
		return build;
	}

	function getCurrentScript () {
		return getScript(true).name.toLowerCase();
	}

	function getLogFilename () {
		let d = new Date();
		let dateString = d.getMonth() + "_" + d.getDate() + "_" + d.getFullYear();
		return "logs/AutoBuild." + me.realm + "." + me.charname + "." + dateString + ".log";
	}

	function getTemplateFilename () {
		let build = getBuildType();
		let template;
		if (["Start", "Stepping", "Leveling"].includes(build)) {
			template = "SoloPlay/Config/Builds/" + sdk.charclass.nameOf(me.classid) + "." + build + ".js";
		} else {
			usingFinalBuildFile = true;
			template = "SoloPlay/BuildFiles/" + sdk.charclass.nameOf(me.classid) + "." + build + "Build.js";
		}
		return template.toLowerCase();
	}

	function initialize () {
		let currentScript = getCurrentScript();
		let template = getTemplateFilename();
		this.print("Including build template " + template + " into " + currentScript);
		if (!include(template)) throw new Error("Failed to include template: " + template);

		// Only load() helper thread from default.dbj if it isn't loaded
		if (currentScript === "default.dbj" && !getScript("libs\\SoloPlay\\Threads\\AutoBuildThread.js")) {
			load("libs/SoloPlay/Threads/AutoBuildThread.js");
		}

		// All threads except autobuildthread.js use this event listener
		// to update their thread-local Config object
		if (currentScript !== "libs\\SoloPlay\\Threads\\AutoBuildThread.js") {
			addEventListener("scriptmsg", levelUpHandler);
		}

		// Resynchronize our Config object with all past changes
		// made to it by AutoBuild system
		applyConfigUpdates();
	}

	function levelUpHandler (obj) {
		if (typeof obj === "object" && obj.hasOwnProperty("event") && obj.event === "level up") {
			applyConfigUpdates();
		}
	}

	function log (message) { FileTools.appendText(getLogFilename(), message + "\n"); }

	// Only print to console from autobuildthread.js,
	// but log from all scripts
	function myPrint () {
		let args = Array.prototype.slice.call(arguments);
		args.unshift("AutoBuild:");
		let result = args.join(" ");
		verbose && print.call(this, result);
		debug && log.call(this, result);
	}

	this.print = myPrint;
	this.initialize = initialize;
	this.applyConfigUpdates = applyConfigUpdates;
};
