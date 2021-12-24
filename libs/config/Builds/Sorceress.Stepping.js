/*
 *    @filename   	Sorceress.Stepping.js
 *	  @author	  	theBGuy
 *    @desc       	sorceress Blizzard build for before respecOneB - respecs at level 65
 */

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1,-1,-1,-1,-1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Blizzard, sdk.skills.IceBlast, sdk.skills.Blizzard, sdk.skills.IceBlast, -1, -1];
			Config.BeltColumn = ["hp", "hp", "mp", "mp"];
			Config.MinColumn[0] = Config.BeltColumn[0] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
			Config.MinColumn[1] = Config.BeltColumn[1] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
			Config.MinColumn[2] = Config.BeltColumn[2] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
			Config.MinColumn[3] = Config.BeltColumn[3] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
			Config.HPBuffer = 2;
			Config.MPBuffer = me.charlvl < 80 ? 6 : 2;
			Config.SkipImmune = ["cold"];
		}
	},
};
