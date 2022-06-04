/**
*  @filename    barbarian.Stepping.js
*  @author      theBGuy
*  @credits     aim2kill (big shout out for all the testing an ideas for this build)
*  @desc        Frenzy/War Cry build for after respecOne and before respecOneB
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
			Config.AttackSkill = [-1, 0, 0, 0, 0];
			Config.LowManaSkill = [0, 0];
			Config.BeltColumn = ["hp", "hp", "hp", "hp"];
			Config.TownHP = me.hardcore ? 0 : 35;
			SetUp.belt();
			Config.MPBuffer = 4;
			Config.HPBuffer = 6;
		}
	},

	2:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Bash, 0, 0, 0];
			Config.LowManaSkill = [0, 0];
		}
	},

	6:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.DoubleSwing, -1, sdk.skills.DoubleSwing, -1];
			Config.BeltColumn = me.charlvl < 13 ? ["hp", "hp", "hp", "mp"] : ["hp", "hp", "mp", "mp"];
			SetUp.belt();
			Config.HPBuffer = 2;
			Config.MPBuffer = 6;
		}
	},

	15:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.DoubleSwing, -1, sdk.skills.DoubleSwing, -1];
			if (me.getSkill(sdk.skills.DoubleSwing, 1) >= 9) {
				Config.LowManaSkill = [sdk.skills.DoubleSwing, 0];
			}
		}
	},

	24:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			if (me.getSkill(sdk.skills.Frenzy, 0)) {
				Config.AttackSkill = [-1, sdk.skills.Frenzy, -1, sdk.skills.Frenzy, -1];
			}

		}
	},
};
