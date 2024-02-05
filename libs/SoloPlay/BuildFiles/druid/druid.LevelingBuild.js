/**
*  @filename    druid.LevelingBuild.js
*  @author      isid0re, theBGuy
*  @desc        Wind elemental build for after respecOne
*
*/


(function (module) {
  module.exports = (function () {
    const build = {
      caster: true,
      skillstab: 42, // elemental
      wantedskills: [sdk.skills.Tornado, sdk.skills.Hurricane, sdk.skills.Twister],
      usefulskills: [sdk.skills.CycloneArmor],
      wantedMerc: MercData[sdk.skills.BlessedAim],
      stats: [
        ["strength", 48], ["dexterity", 35], ["vitality", 165],
        ["strength", 61], ["vitality", 252], ["strength", 156], ["vitality", "all"]
      ],
      skills: [
        // Total skills at respec = 25 (assume hasn't killed izual yet)
        [sdk.skills.Tornado, 1],        // points left 21
        [sdk.skills.OakSage, 6],        // points left 15
        [sdk.skills.SummonDireWolf, 1], // points left 12
        [sdk.skills.CycloneArmor, 13],  // points left 0
        // Start
        [sdk.skills.Tornado, 13, false],
        [sdk.skills.Hurricane, 6, false],
        [sdk.skills.Tornado, 14, false],
        [sdk.skills.Hurricane, 7, false],
        [sdk.skills.Grizzly, 1, false],
        [sdk.skills.Tornado, 15, false],
        [sdk.skills.Hurricane, 8, false],
        [sdk.skills.Tornado, 20, false],
        [sdk.skills.Hurricane, 20, false],
        [sdk.skills.CycloneArmor, 20, false],
        [sdk.skills.OakSage, 20, false],
        [sdk.skills.Twister, 20],
      ],

      active: function () {
        return (me.charlvl > CharInfo.respecOne && me.charlvl > CharInfo.respecTwo && me.checkSkill(sdk.skills.Tornado, sdk.skills.subindex.HardPoints) && !Check.finalBuild().active());
      },

      AutoBuildTemplate: {
        1:	{
          Update: function () {
            Config.AttackSkill = [-1, sdk.skills.Tornado, -1, sdk.skills.Tornado, -1, sdk.skills.ArticBlast, -1];
            Config.LowManaSkill = [-1, -1];
            Config.SummonAnimal = "Grizzly";
            Config.SummonSpirit = "Oak Sage";
            Config.BeltColumn = ["hp", "hp", "mp", "mp"];
            Config.HPBuffer = 2;
            Config.MPBuffer = me.charlvl < 80 ? 6 : 2;
            SetUp.belt();
          }
        }
      },
    };
    
    return build;
  })();
})(module);
