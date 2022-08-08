/**
*  @filename    barbarian.Stepping.js
*  @author      theBGuy
*  @credits     aim2kill (big shout out for all the testing an ideas for this build)
*  @desc        Frenzy/War Cry build for after respecOne and before respecOneB
*
*/
js_strict(true);

includeIfNotIncluded("SoloPlay/Functions/Globals.js");
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 0, 0, 0, 0];
			Config.LowManaSkill = [0, 0];
			Config.TownHP = me.hardcore ? 0 : 35;
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
			Config.HPBuffer = me.expansion ? 2 : 4;
			Config.MPBuffer = 6;
		}
	},

	15:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.DoubleSwing, -1, sdk.skills.DoubleSwing, -1];
			if (me.getSkill(sdk.skills.DoubleSwing, sdk.skills.subindex.SoftPoints) >= 9) {
				Config.LowManaSkill = [sdk.skills.DoubleSwing, 0];
			}
		}
	},

	24:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			if (me.getSkill(sdk.skills.Frenzy, sdk.skills.subindex.HardPoints)) {
				Config.AttackSkill = [-1, sdk.skills.Frenzy, -1, sdk.skills.Frenzy, -1];
			}

		}
	},
};
