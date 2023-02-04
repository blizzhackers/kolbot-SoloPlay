/**
*  @filename    AutoBuildWorker.js
*  @author      theBGuy
*  @desc        worker thread to handle in game events for Kolbot-SoloPlay
*
*/

/**
 * @todo make this actually work. Issue is if we interrupt a task and peform an event function, once that is over we've desynced from
 * whatever we were orignally doing. In some cases this might be fine to just end whatever it was we were running
 * e.g. after receiving finishDen we could kill the den script and perform the event function. We would be able to continue with the next
 * script normally afterwards. We can't do that for something like diablo lightning dodge or baal wave skipping though, in those cases it
 * might be fine to just continue because in theory we shouldn't be too far from our orginal action so minor desync in physical coordinates
 * but not completly different area. We wouldn't be able to do that for diablo clone though.
 */
(function() {
	let debug = !!Config.AutoBuild.DebugMode, prevLevel	= me.charlvl;
	const usingFinalBuild = !["Start", "Stepping", "Leveling"].includes(Config.AutoBuild.Template);
	const SPEND_POINTS = true; // For testing, it actually allows skill and stat point spending.
	const STAT_ID_TO_NAME = [
		getLocaleString(sdk.locale.text.Strength),
		getLocaleString(sdk.locale.text.Energy),
		getLocaleString(sdk.locale.text.Dexterity),
		getLocaleString(sdk.locale.text.Vitality)
	];
	let currAutoBuild;

	// Will check if value exists in an Array
	Array.prototype.contains = (val) => this.indexOf(val) > -1;

	function skillInValidRange (id) {
		switch (me.classid) {
		case sdk.player.class.Amazon:
			return sdk.skills.MagicArrow <= id && id <= sdk.skills.LightningFury;
		case sdk.player.class.Sorceress:
			return sdk.skills.FireBolt <= id && id <= sdk.skills.ColdMastery;
		case sdk.player.class.Necromancer:
			return sdk.skills.AmplifyDamage <= id && id <= sdk.skills.Revive;
		case sdk.player.class.Paladin:
			return sdk.skills.Sacrifice <= id && id <= sdk.skills.Salvation;
		case sdk.player.class.Barbarian:
			return sdk.skills.Bash <= id && id <= sdk.skills.BattleCommand;
		case sdk.player.class.Druid:
			return sdk.skills.Raven <= id && id <= sdk.skills.Hurricane;
		case sdk.player.class.Assassin:
			return sdk.skills.FireBlast <= id && id <= sdk.skills.PhoenixStrike;
		default:
			return false;
		}
	}

	const gainedLevels = () => me.charlvl - prevLevel;

	function canSpendPoints () {
		let unusedStatPoints = me.getStat(sdk.stats.StatPts);
		let haveUnusedStatpoints = unusedStatPoints >= 5;	// We spend 5 stat points per level up
		let unusedSkillPoints = me.getStat(sdk.stats.NewSkills);
		let haveUnusedSkillpoints = unusedSkillPoints >= 1;	// We spend 1 skill point per level up
		debug && AutoBuild.print("Stat points:", unusedStatPoints, "     Skill points:", unusedSkillPoints);
		return haveUnusedStatpoints && haveUnusedSkillpoints;
	}

	function spendStatPoint (id) {
		let unusedStatPoints = me.getStat(sdk.stats.StatPts);
		if (SPEND_POINTS) {
			useStatPoint(id);
			AutoBuild.print("useStatPoint(" + id + "): " + STAT_ID_TO_NAME[id]);
		} else {
			AutoBuild.print("Fake useStatPoint(" + id + "): " + STAT_ID_TO_NAME[id]);
		}
		delay(100);											// TODO: How long should we wait... if at all?
		return (unusedStatPoints - me.getStat(sdk.stats.StatPts) === 1);	// Check if we spent one point
	}

	// TODO: What do we do if it fails? report/ignore/continue?
	function spendStatPoints () {
		if (currAutoBuild[me.charlvl] === undefined) return true;
		let stats = currAutoBuild[me.charlvl].StatPoints;
		let errorMessage = "\nInvalid stat point set in build template " + getTemplateFilename() + " at level " + me.charlvl;
		let spentEveryPoint = true;
		let unusedStatPoints = me.getStat(sdk.stats.StatPts);
		let len = stats.length;

		if (Config.AutoStat.Enabled) {
			return spentEveryPoint;
		}

		if (len > unusedStatPoints) {
			len = unusedStatPoints;
			AutoBuild.print("Warning: Number of stats specified in your build template at level " + me.charlvl + " exceeds the available unused stat points" +
			"\nOnly the first " + len + " stats " + stats.slice(0, len).join(", ") + " will be added");
		}

		// We silently ignore stats set to -1
		for (let i = 0; i < len; i++) {
			let id = stats[i];
			let statIsValid = (typeof id === "number") && (0 <= id && id <= 3);

			if (id === -1) {
				continue;
			} else if (statIsValid) {
				let preStatValue = me.getStat(id);
				let pointSpent = spendStatPoint(id);
				if (SPEND_POINTS) {
					if (!pointSpent) {
						spentEveryPoint = false;
						AutoBuild.print("Attempt to spend point " + (i + 1) + " in " + STAT_ID_TO_NAME[id] + " may have failed!");
					} else if (debug) {
						AutoBuild.print("Stat (" + (i + 1) + "/" + len + ") Increased " + STAT_ID_TO_NAME[id] + " from " + preStatValue + " to " + me.getStat(id));
					}
				}
			} else {
				throw new Error("Stat id must be one of the following:\n0:" + STAT_ID_TO_NAME[0] +
				",\t1:" + STAT_ID_TO_NAME[1] + ",\t2:" + STAT_ID_TO_NAME[2] + ",\t3:" + STAT_ID_TO_NAME[3] + errorMessage);
			}
		}

		return spentEveryPoint;
	}

	function getTemplateFilename () {
		let buildType = Config.AutoBuild.Template;
		let className = sdk.player.class.nameOf(me.classid);
		let templateFilename = "SoloPlay/BuildFiles/" + className + "/" + className + "." + buildType + "Build.js";
		return templateFilename;
	}

	function getRequiredSkills (id) {
		function searchSkillTree (id) {
			let results = [];
			let skillTreeRight = getBaseStat("skills", id, sdk.stats.PreviousSkillRight);
			let skillTreeMiddle = getBaseStat("skills", id, sdk.stats.PreviousSkillMiddle);
			let skillTreeLeft = getBaseStat("skills", id, sdk.stats.PreviousSkillLeft);

			results.push(skillTreeRight);
			results.push(skillTreeMiddle);
			results.push(skillTreeLeft);

			for (let i = 0; i < results.length; i++) {
				let skill = results[i];
				let skillInValidRange = (sdk.skills.Attack < skill && skill <= sdk.skills.PhoenixStrike) && (![sdk.skills.IdentifyScroll, sdk.skills.BookofIdentify, sdk.skills.TownPortalScroll, sdk.skills.BookofTownPortal].contains(skill));
				let hardPointsInSkill = me.getSkill(skill, sdk.skills.subindex.HardPoints);

				if (skillInValidRange && !hardPointsInSkill) {
					requirements.push(skill);
					searchSkillTree(skill);	// search children;
				}
			}
		}

		let requirements = [];
		searchSkillTree(id);
		const increasing = () => a - b;
		return requirements.sort(increasing);
	}

	function spendSkillPoint (id) {
		let unusedSkillPoints = me.getStat(sdk.stats.NewSkills);
		let skillName = getSkillById(id) + " (" + id + ")";
		if (SPEND_POINTS) {
			useSkillPoint(id);
			AutoBuild.print("useSkillPoint(): " + skillName);
		} else {
			AutoBuild.print("Fake useSkillPoint(): " + skillName);
		}
		delay(200);											// TODO: How long should we wait... if at all?
		return (unusedSkillPoints - me.getStat(sdk.stats.NewSkills) === 1);	// Check if we spent one point
	}

	function spendSkillPoints () {
		if (currAutoBuild[me.charlvl] === undefined) return true;
		let skills = currAutoBuild[me.charlvl].SkillPoints;
		let errInvalidSkill = "\nInvalid skill point set in build template " + getTemplateFilename() + " for level " + me.charlvl;
		let spentEveryPoint = true;
		let unusedSkillPoints = me.getStat(sdk.stats.NewSkills);
		let len = skills.length;

		if (Config.AutoSkill.Enabled) {
			return spentEveryPoint;
		}

		if (len > unusedSkillPoints) {
			len = unusedSkillPoints;
			AutoBuild.print("Warning: Number of skills specified in your build template at level " + me.charlvl + " exceeds the available unused skill points" +
			"\nOnly the first " + len + " skills " + skills.slice(0, len).join(", ") + " will be added");
		}

		// We silently ignore skills set to -1
		for (let i = 0; i < len; i++) {
			let id = skills[i];

			if (id === -1) {
				continue;
			} else if (!skillInValidRange(id)) {
				throw new Error("Skill id " + id + " is not a skill for your character class" + errInvalidSkill);
			}

			let skillName = getSkillById(id) + " (" + id + ")";
			let requiredSkills = getRequiredSkills(id);
			if (requiredSkills.length > 0) {
				throw new Error("You need prerequisite skills " + requiredSkills.join(", ") + " before adding " + skillName + errInvalidSkill);
			}

			let requiredLevel = getBaseStat("skills", id, sdk.stats.MinimumRequiredLevel);
			if (me.charlvl < requiredLevel) {
				throw new Error("You need to be at least level " + requiredLevel + " before you get " + skillName + errInvalidSkill);
			}

			let pointSpent = spendSkillPoint(id);

			if (SPEND_POINTS) {
				if (!pointSpent) {
					spentEveryPoint = false;
					AutoBuild.print("Attempt to spend skill point " + (i + 1) + " in " + skillName + " may have failed!");
				} else if (debug) {
					let actualSkillLevel = me.getSkill(id, sdk.skills.subindex.SoftPoints);
					AutoBuild.print("Skill (" + (i + 1) + "/" + len + ") Increased " + skillName + " by one (level: ", actualSkillLevel + ")");
				}
			}

			delay(200);	// TODO: How long should we wait... if at all?
		}

		return spentEveryPoint;
	}

	// Only load this in global scope
	if (getScript(true).name.toLowerCase() === "libs\\soloplay\\soloplay.js") {
		const Worker = require("../../modules/Worker");

		let waitTick = getTickCount();
		currAutoBuild = usingFinalBuild ? finalBuild.AutoBuildTemplate : build.AutoBuildTemplate;

		// Start
		Worker.runInBackground.AutoBuild = function () {
			if (getTickCount() - waitTick < 1000) return true;
			waitTick = getTickCount();

			try {
				let levels = gainedLevels();

				if (levels > 0 && (canSpendPoints() || Config.AutoSkill.Enabled || Config.AutoStat.Enabled)) {
					scriptBroadcast("toggleQuitlist");
					AutoBuild.print("Level up detected (", prevLevel, "-->", me.charlvl, ")");
					spendSkillPoints();
					spendStatPoints();
					Config.AutoSkill.Enabled && AutoSkill.init(Config.AutoSkill.Build, Config.AutoSkill.Save);
					Config.AutoStat.Enabled && AutoStat.init(Config.AutoStat.Build, Config.AutoStat.Save, Config.AutoStat.BlockChance, Config.AutoStat.UseBulk);
					scriptBroadcast({event: "level up"});
					AutoBuild.applyConfigUpdates(); // scriptBroadcast() won't trigger listener on this thread.

					debug && AutoBuild.print("Incrementing cached character level to", prevLevel + 1);

					// prevLevel doesn't get set to me.charlvl because
					// we may have gained multiple levels at once
					prevLevel += 1;

					scriptBroadcast("toggleQuitlist");
				}
			} catch (err) {
				print("Something broke!");
				print("Error:" + err.toSource());
				print("Stack trace: \n" + err.stack);

				return false;
			}

			return true;
		};

		try {
			AutoBuild.print("Loaded helper thread");
			console.log("ÿc8Kolbot-SoloPlayÿc0: Start AutoBuildThread");
			console.log(Worker.runInBackground);
		} catch (e) {
			console.error(e);
		}
	}
})();
