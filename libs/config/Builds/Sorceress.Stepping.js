/*
 *    @filename   	Sorceress.Stepping.js
 *	  @author	  	theBGuy
 *    @desc       	sorceress Blizzard build for before respecOneB - respecs at level 65
 */


js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1,-1,-1,-1,-1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Blizzard, sdk.skills.IceBlast, sdk.skills.Blizzard, sdk.skills.IceBlast, -1, -1];
			Config.BeltColumn = ["hp", "hp", "mp", "mp"];
			SetUp.belt();
			Config.HPBuffer = me.expansion ? 2 : 5;
			Config.MPBuffer = me.expansion && me.charlvl < 80 ? 6 : me.classic ? 5 : 2;
			Config.SkipImmune = ["cold"];
		}
	},
};
