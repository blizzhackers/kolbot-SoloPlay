/**
*  @filename    amazon.Stepping.js
*  @author      theBGuy
*  @desc        Lighting/Charged Strike build for after respecOne and before respecOneB
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
			Config.AttackSkill = [-1, 0, 0, 0, 0, 0, 0];
			Config.LowManaSkill = [0, 0];
			Config.TownHP = me.hardcore ? 0 : 35;
			Config.BeltColumn = ["hp", "hp", "hp", "hp"];
			SetUp.belt();
			Config.HPBuffer = 3;
			Config.MPBuffer = 4;
		}
	},

	18:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [sdk.skills.SlowMissiles, sdk.skills.ChargedStrike, 0, sdk.skills.ChargedStrike, 0, -1, -1];
			Config.BeltColumn = ["hp", "hp", "mp", "mp"];
			SetUp.belt();
			Config.HPBuffer = 2;
			Config.MPBuffer = 6;
		}
	},

	35:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [sdk.skills.SlowMissiles, sdk.skills.ChargedStrike, 0, sdk.skills.LightningStrike, 0, -1, -1];

		}
	},

	50:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [sdk.skills.SlowMissiles, sdk.skills.ChargedStrike, 0, sdk.skills.LightningStrike, 0, -1, -1];

		}
	}
};
