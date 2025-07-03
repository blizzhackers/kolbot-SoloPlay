/**
*  @filename    Sorceress.LevelingBuild.js
*  @author      theBGuy
*  @desc        Blizzballer build for after respecOneB
*
*/


(function (module) {
  module.exports = (function () {
    const build = {
      caster: true,
      skillstab: sdk.skills.tabs.Cold,
      wantedskills: [sdk.skills.Blizzard, sdk.skills.FireBall, sdk.skills.ColdMastery],
      usefulskills: [sdk.skills.GlacialSpike, sdk.skills.Meteor, sdk.skills.FireMastery, sdk.skills.StaticField],
      usefulStats: [
        sdk.stats.PassiveColdPierce,
        sdk.stats.PassiveColdMastery,
        sdk.stats.PassiveFireMastery,
        sdk.stats.PassiveFirePierce
      ],
      wantedMerc: MercData[sdk.skills.HolyFreeze],
      stats: [],
      skills: [],

      active: function () {
        const { respecOne, respecTwo } = CharInfo;
        return (
          me.charlvl > respecOne && me.charlvl > respecTwo
          && me.checkSkill(sdk.skills.FireMastery, sdk.skills.subindex.HardPoints)
          && !Check.finalBuild().active()
        );
      },

      AutoBuildTemplate: {
        1:	{
          Update: function () {
            Config.AttackSkill = [
              -1,
              sdk.skills.Blizzard, sdk.skills.IceBlast,
              sdk.skills.Blizzard, sdk.skills.IceBlast,
              sdk.skills.Meteor, sdk.skills.FireBall,
              sdk.skills.Nova, sdk.skills.StaticField
            ];
            Config.LowManaSkill = [-1, -1];
            Config.SkipImmune = ["fire and cold"];
            Config.BeltColumn = ["hp", "hp", "mp", "mp"];
            Config.HPBuffer = me.expansion ? 2 : 5;
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
        ["energy", 50], ["strength", 48], ["vitality", 165],
        ["strength", 61], ["vitality", 200], ["strength", 127],
        ["vitality", 252], ["dexterity", "block"], ["vitality", "all"]
      ];
		
    build.skills = me.classic
      ? [
        // Total skills at respec = 70
        [sdk.skills.Warmth, 1],      // points left 69
        [sdk.skills.FrozenArmor, 1], // points left 68
        [sdk.skills.StaticField, 6], // points left 62
        [sdk.skills.Teleport, 4],    // points left 57
        [sdk.skills.Meteor, 8],      // points left 44
        [sdk.skills.FireMastery, 1], // points left 43
        [sdk.skills.ColdMastery, 1], // points left 42
        [sdk.skills.FrozenOrb, 1],   // points left 36
        [sdk.skills.FireBall, 10],   // points left 27
        [sdk.skills.Blizzard, 20],   // points left 8
        [sdk.skills.IceBlast, 12],   // points left 0
        [sdk.skills.Meteor, 10],
        [sdk.skills.IceBlast, 20],
        [sdk.skills.ColdMastery, 17],
        [sdk.skills.FireBolt, 20],
      ] : [
        // Total skills at respec = 70
        [sdk.skills.Warmth, 1],      // points left 69
        [sdk.skills.FrozenArmor, 1], // points left 68
        [sdk.skills.StaticField, 1], // points left 67
        [sdk.skills.Teleport, 1],    // points left 65
        [sdk.skills.Meteor, 1],      // points left 59
        [sdk.skills.FireMastery, 1], // points left 58
        [sdk.skills.ColdMastery, 1], // points left 57
        [sdk.skills.LightningMastery, 1], // points left 56
        [sdk.skills.Nova, 1],        // points left 55
        [sdk.skills.FrozenOrb, 1],   // points left 51
        [sdk.skills.FireBall, 20],   // points left 32
        [sdk.skills.Blizzard, 20],   // points left 13
        [sdk.skills.Nova, 5],        // points left 8
        [sdk.skills.IceBlast, 15],   // points left 0
        [sdk.skills.Meteor, 15],
        [sdk.skills.IceBlast, 20],
        [sdk.skills.Meteor, 20],
        [sdk.skills.ColdMastery, 5],
        [sdk.skills.FireBolt, 20],
      ];
		
    return build;
  })();
})(module);
