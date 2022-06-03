/**
*  @filename    paladin.Leveling.js
*  @author      isid0re, theBGuy
*  @desc        Holy fire build for before respecOne, respecs at 19
*
*/
js_strict(true);

!isIncluded("SoloPlay/Functions/Globals.js") && include("SoloPlay/Functions/Globals.js");
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.TownHP = me.hardcore ? 0 : 35;
			Config.AttackSkill = [-1, sdk.skills.BlessedHammer, sdk.skills.Concentration, sdk.skills.BlessedHammer, sdk.skills.Concentration, sdk.skills.HolyBolt, sdk.skills.Concentration];
			Config.LowManaSkill = [0, sdk.skills.Concentration];
			Config.BeltColumn = ["hp", "hp", "mp", "mp"];
			SetUp.belt();
			Config.HPBuffer = 2;
			Config.MPBuffer = 6;

			if (me.hell && !Pather.accessToAct(5)) {
				Config.SkipImmune = ["magic"];
			}
		}
	},
};
