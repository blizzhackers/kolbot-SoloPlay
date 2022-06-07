/**
*  @filename    amazon.Start.js
*  @author      theBGuy
*  @desc        Charged Strike build for before respecOne
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
			Config.BeltColumn = ["hp", "hp", "hp", "hp"];
			SetUp.belt();
			Config.HPBuffer = 4;
			Config.MPBuffer = 4;
			Config.AttackSkill = [-1, 0, 0, 0, 0, 0, 0];
			Config.LowManaSkill = [0, 0];
		}
	},

	2:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.TownHP = me.hardcore ? 0 : 35;
			Config.AttackSkill = [-1, sdk.skills.Jab, 0, sdk.skills.Jab, 0, 0, 0];
		}
	},

	6:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.TownHP = me.hardcore ? 0 : 35;
			Config.BeltColumn = ["hp", "hp", "mp", "mp"];
			SetUp.belt();
			Config.HPBuffer = me.expansion ? 2 : 4;
			Config.MPBuffer = 6;
			Config.AttackSkill = [-1, sdk.skills.PowerStrike, 0, sdk.skills.PowerStrike, 0, -1, -1];
		}
	},

	7:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.PowerStrike, 0, sdk.skills.PowerStrike, 0, -1, -1];
		}
	},

	18:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.ChargedStrike, 0, sdk.skills.ChargedStrike, 0, -1, -1];
		}
	},

	50:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [
				-1, sdk.skills.ChargedStrike, 0, (me.getSkill(sdk.skills.LightningStrike, 1) >= me.getSkill(sdk.skills.ChargedStrike, 1) ? sdk.skills.LightningStrike : sdk.skills.ChargedStrike), 0, -1, -1
			];
		}
	},
};
