/**
*  @filename    druid.Leveling.js
*  @author      isid0re, theBGuy
*  @desc        Wind elemental build for after respecOne
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
			Config.AttackSkill = [-1, sdk.skills.Tornado, -1, sdk.skills.Tornado, -1, sdk.skills.ArticBlast, -1];
			Config.LowManaSkill = [-1, -1];
			Config.SummonAnimal = "Grizzly";
			Config.SummonSpirit = "Oak Sage";
			Config.BeltColumn = ["hp", "hp", "mp", "mp"];
			SetUp.belt();
			Config.HPBuffer = 2;
			Config.MPBuffer = me.charlvl < 80 ? 6 : 2;
		}
	},
};
