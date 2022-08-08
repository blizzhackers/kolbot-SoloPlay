/**
*  @filename    Sorceress.Leveling.js
*  @author      theBGuy
*  @desc        Blizzballer build for after respecOneB
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
			Config.AttackSkill = [-1, sdk.skills.Blizzard, sdk.skills.IceBlast, sdk.skills.Blizzard, sdk.skills.IceBlast, sdk.skills.Meteor, sdk.skills.FireBall];
			Config.LowManaSkill = [-1, -1];
			Config.SkipImmune = ["fire and cold"];

			Config.BeltColumn = ["hp", "hp", "mp", "mp"];
			SetUp.belt();
			Config.HPBuffer = me.expansion ? 2 : 5;
			Config.MPBuffer = me.expansion && me.charlvl < 80 ? 6 : me.classic ? 5 : 2;
		}
	},
};
