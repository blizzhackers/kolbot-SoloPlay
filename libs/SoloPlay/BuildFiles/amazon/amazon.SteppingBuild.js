/**
*  @filename    amazon.SteppingBuild.js
*  @author      theBGuy
*  @desc        Lighting/Charged Strike build for after respecOne and before respecOneB
*
*/


(function (module) {
  module.exports = (function () {
    const build = {
      caster: false,
      skillstab: sdk.skills.tabs.JavelinandSpear,
      wantedskills: [sdk.skills.ChargedStrike, sdk.skills.LightningStrike],
      usefulskills: [sdk.skills.CriticalStrike, sdk.skills.Penetrate, sdk.skills.Valkyrie, sdk.skills.Pierce],
      usefulStats: [sdk.stats.PierceLtng, sdk.stats.PassiveLightningMastery, sdk.stats.PassiveLightningPierce],
      wantedMerc: MercData[sdk.skills.HolyFreeze],
      stats: [],
      skills: [
        // points at respec 33
        [sdk.skills.LightningStrike, 1],         // points left 27
        [sdk.skills.Valkyrie, 1],                // points left 20
        [sdk.skills.Penetrate, 1],               // points left 18
        [sdk.skills.ChargedStrike, 13],          // points left 6
        [sdk.skills.PowerStrike, 5],             // points left 2
        [sdk.skills.LightningFury, 1],           // points left 0
        [sdk.skills.LightningStrike, 20, false], // charlvl ?
        [sdk.skills.ChargedStrike, 20, false],   // charlvl 52
        [sdk.skills.LightningFury, 20, false],   // respec at 64
      ],

      AutoBuildTemplate: {
        1:	{
          Update: function () {
            let mainSkill = Skill.canUse(sdk.skills.LightningStrike) ? sdk.skills.LightningStrike : sdk.skills.ChargedStrike;
            Config.AttackSkill = [-1, sdk.skills.ChargedStrike, 0, mainSkill, 0, -1, -1];
            Config.BeltColumn = ["hp", "hp", "mp", "mp"];
            Config.HPBuffer = me.expansion ? 2 : 4;
            Config.MPBuffer = 6;
            SetUp.belt();
          }
        }
      },

      active: function () {
        return me.charlvl > CharInfo.respecOne && me.charlvl < CharInfo.respecTwo && me.checkSkill(sdk.skills.LightningStrike, sdk.skills.subindex.HardPoints) && me.getSkill(sdk.skills.PlagueJavelin, sdk.skills.subindex.HardPoints) <= 5;
      },
    };
    
    // Has to be set after its loaded
    me.classic && build.usefulStats.push(sdk.stats.PassivePoisonMastery, sdk.stats.PassivePoisonPierce, sdk.stats.PiercePois);
    build.stats = me.classic
      ? [
        ["dexterity", 65], ["strength", 75], ["vitality", "all"]
      ] : [
        ["strength", 34], ["vitality", 30], ["dexterity", 47],
        ["vitality", 45], ["strength", 47], ["dexterity", 65],
        ["vitality", 65], ["strength", 53], ["dexterity", 118],
        ["vitality", 100], ["strength", 118], ["dexterity", 151],
        ["strength", 156], ["vitality", "all"],
      ];
    
    return build;
  })();
})(module);
