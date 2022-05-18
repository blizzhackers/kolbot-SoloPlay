/**
*  @filename    barbarian.Start.js
*  @author      theBGuy
*  @credits     aim2kill (big shout out for all the testing an ideas for this build)
*  @desc        Double swing build for before respecOne
*
*/
js_strict(true);

!isIncluded("SoloPlay/Functions/Globals.js") && include("SoloPlay/Functions/Globals.js");
SetUp.include();

// preattack, primary skill for bosses, backup immune skill for bosses, primary skill for others, backup others
// Config.AttackSkill = [0, 0, 0, 0, 0];

let AutoBuildTemplate = {
	1:	{
		//SkillPoints: [-1],			// This doesn't matter. We don't have skill points to spend at lvl 1
		//StatPoints: [-1,-1,-1,-1,-1],	// This doesn't matter. We don't have stat points to spend at lvl 1
		Update: function () {
			Config.TownHP = me.hardcore ? 0 : 35;
			Config.BeltColumn = ["hp", "hp", "hp", "hp"];
			SetUp.belt();
			Config.MPBuffer = 4;
			Config.HPBuffer = 6;
			Config.AttackSkill = [-1, 0, 0, 0, 0];
			Config.LowManaSkill = [0, 0];
		}
	},

	2:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Bash, 0, 0, 0];
		}
	},

	6:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.BeltColumn = ["hp", "hp", "hp", "mp"];
			SetUp.belt();
			Config.HPBuffer = 2;
			Config.MPBuffer = 6;
			Config.AttackSkill = [-1, sdk.skills.DoubleSwing, -1, sdk.skills.DoubleSwing, -1];
		}
	},

	7:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.DoubleSwing, -1, sdk.skills.DoubleSwing, -1];
		}
	},

	12:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.BeltColumn = ["hp", "hp", "mp", "mp"];
			SetUp.belt();
			Config.AttackSkill = [-1, sdk.skills.DoubleSwing, -1, sdk.skills.DoubleSwing, -1];
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

	30:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Frenzy, -1, sdk.skills.Frenzy, -1];
		}
	},
};
