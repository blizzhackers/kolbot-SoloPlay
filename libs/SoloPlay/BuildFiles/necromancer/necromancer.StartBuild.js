/**
*  @filename    necromancer.StartBuild.js
*  @author      theBGuy, isid0re
*  @desc        Bonemancer build for before respecOne
*
*/


(function (module, require) {
  module.exports = (function () {
    const build = {
      AutoBuildTemplate: {},
      caster: true,
      skillstab: sdk.skills.tabs.PoisonandBone,
      wantedskills: [sdk.skills.Teeth, sdk.skills.BoneSpear],
      usefulskills: [sdk.skills.AmplifyDamage, sdk.skills.BoneArmor, sdk.skills.Decrepify, sdk.skills.BoneWall],
      wantedMerc: MercData[sdk.skills.Might],
      stats: [
        ["strength", 20], ["energy", 45],
        ["vitality", 70], ["strength", 35],
        ["energy", 85], ["vitality", "all"]
      ],
      skills: [
        [sdk.skills.Teeth, 4],           // charlvl 4
        // [sdk.skills.BoneArmor, 1],       // charlvl 7
        [sdk.skills.AmplifyDamage, 1],   // charlvl 5
        [sdk.skills.ClayGolem, 1],       // charlvl 6
        [sdk.skills.BoneArmor, 1],       // charlvl 7
        [sdk.skills.Weaken, 1],          // charlvl 8
        [sdk.skills.DimVision, 1],       // charlvl 9
        [sdk.skills.Teeth, 7],           // charlvl 11
        [sdk.skills.GolemMastery, 1],    // charlvl 12
        [sdk.skills.IronMaiden, 1],      // charlvl 13
        [sdk.skills.CorpseExplosion, 1], // charlvl 14
        [sdk.skills.BoneWall, 3],        // charlvl 17
        [sdk.skills.BoneSpear, 6],       // charlvl 23
        [sdk.skills.Decrepify, 1],       // charlvl 24
        [sdk.skills.BoneSpear, 20],      // charlvl -> Until respec at 26
      ],

      active: function () {
        return me.charlvl < CharInfo.respecOne && !me.checkSkill(sdk.skills.BonePrison, sdk.skills.subindex.HardPoints);
      },
    };

    const { buildAutoBuildTempObj } = require("../../Utils/General");
    
    build.AutoBuildTemplate[1] = buildAutoBuildTempObj(() => {
      Config.ScanShrines.indexOf(sdk.shrines.Combat) === -1 && Config.ScanShrines.push(sdk.shrines.Combat);
      Config.FieldID.Enabled = !Misc.checkQuest(sdk.quest.id.TheSearchForCain, sdk.quest.states.Completed);
      Config.FieldID.UsedSpace = 0;
          
      Config.TownHP = me.hardcore ? 0 : 35;
      Config.BeltColumn = ["hp", "hp", "hp", "hp"];
      Config.HPBuffer = 6;
      Config.MPBuffer = 8;
      Config.AttackSkill = [-1, 0, 0, 0, 0, -1, -1];
      Config.LowManaSkill = [0, 0];
      Config.Golem = "Clay";
      SetUp.belt();
    });
    build.AutoBuildTemplate[2] = buildAutoBuildTempObj(() => {
      Config.ScanShrines.indexOf(sdk.shrines.Combat) === -1 && Config.ScanShrines.push(sdk.shrines.Combat);
      Config.FieldID.Enabled = !Misc.checkQuest(sdk.quest.id.TheSearchForCain, sdk.quest.states.Completed);
      Config.FieldID.UsedSpace = 0;
          
      Config.AttackSkill = [-1, sdk.skills.Teeth, -1, sdk.skills.Teeth, -1, -1, -1];
      Config.BeltColumn = ["hp", "hp", "mp", "mp"];
      Config.HPBuffer = Storage.BeltSize() < 4 ? 4 : 2;
      Config.MPBuffer = 8;
      Config.RejuvBuffer = 6;
      SetUp.belt();
    });
    build.AutoBuildTemplate[18] = buildAutoBuildTempObj(() => {
      Config.AttackSkill = [-1, sdk.skills.Teeth, -1, sdk.skills.Teeth, -1, -1, -1];
      Config.ExplodeCorpses = sdk.skills.CorpseExplosion;

      if (me.checkSkill(sdk.skills.BoneSpear, sdk.skills.subindex.HardPoints)) {
        Config.AttackSkill = [-1, sdk.skills.BoneSpear, -1, sdk.skills.BoneSpear, -1, -1, -1];
        Config.LowManaSkill = [sdk.skills.Teeth, -1];
      }
    });

    return build;
  })();
})(module, require);
