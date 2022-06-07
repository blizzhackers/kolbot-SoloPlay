/**
*  @filename    barbarian.Leveling.js
*  @author      theBGuy
*  @credits     aim2kill (big shout out for all the testing an ideas for this build)
*  @desc        Frenzy/War Cry build for after respecOneB
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
			Config.AttackSkill = [-1, sdk.skills.Frenzy, sdk.skills.Berserk, sdk.skills.Frenzy, sdk.skills.Berserk];
			Config.LowManaSkill = [sdk.skills.DoubleSwing, 0];
			Config.BeltColumn = ["hp", "hp", "hp", "mp"];
			Config.TownHP = me.hardcore ? 0 : 35;
			SetUp.belt();
			Config.MPBuffer = me.expansion ? 2 : 4;
			Config.HPBuffer = 6;
		}
	}
};
