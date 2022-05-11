/*
 *    @filename   	Paladin.Auradin.js
 *	  @author	  	theBGuy
 *    @desc      	Paladin Auradin build
 */


js_strict(true);

!isIncluded("SoloPlay/Functions/Globals.js") && include("SoloPlay/Functions/Globals.js");
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.Vigor = false;
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.Conviction, sdk.skills.Zeal, sdk.skills.Conviction, -1, -1];
			Config.LowManaSkill = [-1, -1];

			if (!Check.haveItem("sword", "runeword", "Hand of Justice") || !Check.haveItem("armor", "runeword", "Dragon")) {
				Config.SkipImmune = ["lightning and physical"];
			} else {
				Config.SkipImmune = ["lightning and fire and physical"];	// Don't think this ever happens but should skip if it does
			}

			Config.BeltColumn = ["hp", "hp", "mp", "rv"];
			SetUp.belt();
		}
	},
};
