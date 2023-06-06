/**
*  @filename    necromancer.LevelingBuild.js
*  @author      theBGuy, isid0re
*  @desc        explosionmancer build for after respecOne
*
*/

// TODO: test summonnovamancer for classic (wouldn't be able to farcast diablo though :( )

(function (module) {
  module.exports = (function () {
    const build = {
      caster: true,
      skillstab: sdk.skills.tabs.PoisonandBone,
      wantedskills: [sdk.skills.CorpseExplosion, sdk.skills.BoneSpear],
      usefulskills: [
        sdk.skills.AmplifyDamage, sdk.skills.BoneArmor,
        sdk.skills.Decrepify, sdk.skills.BoneWall,
        sdk.skills.BonePrison, sdk.skills.BoneSpirit, sdk.skills.Teeth
      ],
      wantedMerc: MercData[sdk.skills.Might],
      skills: [
        // Total skills at respec = 29
        [sdk.skills.Decrepify, 1],    // points left 25
        [sdk.skills.SummonResist, 1], // points left 22
        [sdk.skills.BonePrison, 1],   // points left 16
        [sdk.skills.Attract, 1],      // points left 13
        [sdk.skills.BoneSpear, 9],    // points left 5
        [sdk.skills.BonePrison, 3],   // points left 3
        [sdk.skills.BoneSpear, 20, false],
        [sdk.skills.BoneSpirit, 1, false],
        [sdk.skills.BonePrison, 20, false],
        [sdk.skills.CorpseExplosion, 20, false],
        [sdk.skills.BoneWall, 20, false],
        [sdk.skills.Teeth, 20, false],
      ],
      stats: [],

      active: function () {
        return (me.charlvl > CharInfo.respecOne
          && me.charlvl > CharInfo.respecTwo
          && me.checkSkill(sdk.skills.BonePrison, sdk.skills.subindex.HardPoints)
          && !Check.finalBuild().active());
      },

      AutoBuildTemplate: {
        1:	{
          Update: function () {
            Config.TownHP = me.hardcore ? 0 : 35;
            Config.AttackSkill = [-1, sdk.skills.BoneSpear, -1, sdk.skills.BoneSpear, -1, -1, -1];
            Config.LowManaSkill = [sdk.skills.Teeth, -1];
            Config.ExplodeCorpses = sdk.skills.CorpseExplosion;
            Config.Golem = "Clay";
            Config.BeltColumn = ["hp", "hp", "mp", "mp"];
            Config.HPBuffer = me.expansion ? 2 : 4;
            Config.MPBuffer = me.expansion && me.charlvl < 80 ? 6 : me.classic ? 5 : 2;
            SetUp.belt();
          }
        }
      },
    };
    
    // Has to be set after its loaded
    build.stats = me.classic
      ? [
        ["dexterity", 51], ["strength", 80], ["energy", 100], ["vitality", "all"]
      ] : [
        ["strength", 48], ["energy", 50],
        ["vitality", 100], ["strength", 61],
        ["vitality", 165], ["vitality", 252],
        ["strength", 156], ["vitality", "all"]
      ];
    
    return build;
  })();
})(module);
