/*
 *    @filename   	Paladin.Hammerdin.js
 *	  @author	  	theBGuy
 *    @desc      	Paladin Hammerdin build
 */


js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1,-1,-1,-1,-1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.BlessedHammer, sdk.skills.Concentration, sdk.skills.BlessedHammer, sdk.skills.Concentration, sdk.skills.HolyBolt, sdk.skills.Concentration];
			Config.LowManaSkill = [0, sdk.skills.Concentration];

			if (me.hell && !Pather.accessToAct(5)) {
				Config.SkipImmune = ["magic"];
			}
		}
	},
};
