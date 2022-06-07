/**
*  @filename    amazon.Leveling.js
*  @author      theBGuy
*  @desc        Lightning/poison javelin build for after respecOneB
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
			Config.AttackSkill = [sdk.skills.SlowMissiles, sdk.skills.ChargedStrike, 0, sdk.skills.LightningStrike, 0, -1, -1];
			Config.LowManaSkill = [0, 0];
			Config.TownHP = me.hardcore ? 0 : 35;
			Config.BeltColumn = ["hp", "hp", "mp", "mp"];
			SetUp.belt();
			Config.HPBuffer = me.expansion ? 2 : 4;
			Config.MPBuffer = 6;
		}
	}
};
