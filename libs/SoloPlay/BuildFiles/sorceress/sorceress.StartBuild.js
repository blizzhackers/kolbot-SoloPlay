/**
*  @filename    Sorceress.startBuild.js
*  @author      isid0re, theBGuy
*  @desc        Blova build for before respecOne - respecs at level 26
*
*/


(function (module, require) {
  module.exports = (function () {
    const build = {
      AutoBuildTemplate: {},
      caster: true,
      skillstab: sdk.skills.tabs.Lightning,
      wantedskills: [sdk.skills.ChargedBolt, sdk.skills.StaticField],
      usefulskills: [sdk.skills.FrozenArmor, sdk.skills.Lightning],
      wantedMerc: MercData[sdk.skills.HolyFreeze],
      stats: [
        ["energy", 40], ["vitality", 15], ["energy", 45],
        ["vitality", 20], ["energy", 50], ["strength", 15],
        ["vitality", 25], ["energy", 60], ["vitality", 40],
        ["strength", 35], ["vitality", "all"]
      ],
      skills: [
        [sdk.skills.ChargedBolt, 3, false], // charlvl 4
        [sdk.skills.IceBolt, 1],            // charlvl 5
        [sdk.skills.FrozenArmor, 1],        // charlvl 6
        [sdk.skills.Telekinesis, 1],        // charlvl 7
        [sdk.skills.FrostNova, 1],          // charlvl 8
        [sdk.skills.StaticField, 1, false],
        [sdk.skills.IceBlast, 1, false],
        [sdk.skills.StaticField, 4],        // charlvl 10
        [sdk.skills.Teleport, 1, false],    // charlvl 18
        [sdk.skills.Nova, 7],               // charlvl 17
        [sdk.skills.StaticField, 6],        // charlvl 20
        [sdk.skills.IceBlast, 1],           // charlvl 22
        [sdk.skills.GlacialSpike, 1],       // charlvl 
        [sdk.skills.IceBlast, 4, false],    // charlvl 23
        [sdk.skills.Blizzard, 6, false],    // charlvl 29 (never gets here)
        [sdk.skills.ColdMastery, 1, false], // charlvl 30 (never gets here)
      ],

      active: function () {
        const { respecOne } = CharInfo;
        return me.charlvl < respecOne && !me.checkSkill(sdk.skills.ColdMastery, sdk.skills.subindex.HardPoints);
      },
    };

    const { buildAutoBuildTempObj } = require("../../Utils/General");
    
    build.AutoBuildTemplate[1] = buildAutoBuildTempObj(() => {
      Config.ScanShrines.indexOf(sdk.shrines.Combat) === -1 && Config.ScanShrines.push(sdk.shrines.Combat);
      Config.FieldID.Enabled = !Misc.checkQuest(sdk.quest.id.TheSearchForCain, sdk.quest.states.Completed);
      Config.FieldID.UsedSpace = 0;

      Config.BeltColumn = ["hp", "hp", "hp", "hp"];
      Config.HPBuffer = 4;
      Config.MPBuffer = 10;
      Config.AttackSkill = [-1, sdk.skills.FireBolt, -1, sdk.skills.FireBolt, -1, 0, 0];
      Config.LowManaSkill = [0, 0];
      SetUp.belt();
    });
    build.AutoBuildTemplate[2] = buildAutoBuildTempObj(() => {
      Config.ScanShrines.indexOf(sdk.shrines.Combat) === -1 && Config.ScanShrines.push(sdk.shrines.Combat);
      Config.FieldID.Enabled = !Misc.checkQuest(sdk.quest.id.TheSearchForCain, sdk.quest.states.Completed);
      Config.FieldID.UsedSpace = 0;

      Config.TownHP = me.hardcore ? 0 : 35;
      Config.LowManaSkill = [0, 0];
      Config.BeltColumn = ["hp", "hp", "mp", "mp"];
      Config.HPBuffer = 4;
      Config.MPBuffer = 10;
      if (me.checkSkill(sdk.skills.IceBlast, sdk.skills.subindex.SoftPoints)) {
        Config.AttackSkill = [-1, sdk.skills.ChargedBolt, sdk.skills.IceBlast, sdk.skills.ChargedBolt, sdk.skills.IceBlast, sdk.skills.IceBlast, 0];
      } else if (me.checkSkill(sdk.skills.IceBolt, sdk.skills.subindex.SoftPoints)) {
        Config.AttackSkill = [-1, sdk.skills.ChargedBolt, sdk.skills.IceBolt, sdk.skills.ChargedBolt, sdk.skills.IceBolt, sdk.skills.IceBolt, 0];
      } else {
        let secondSkill = Skill.canUse(sdk.skills.FireBolt) ? sdk.skills.FireBolt : sdk.skills.Attack;
        Config.AttackSkill = [-1, sdk.skills.ChargedBolt, secondSkill, sdk.skills.ChargedBolt, secondSkill, 0, 0];
      }
      SetUp.belt();
    });
    build.AutoBuildTemplate[12] = buildAutoBuildTempObj(() => {
      Config.HPBuffer = 4;
      Config.MPBuffer = 8;
      Config.AttackSkill = [-1, sdk.skills.Nova, sdk.skills.ChargedBolt, sdk.skills.Nova, sdk.skills.ChargedBolt, sdk.skills.FrostNova, sdk.skills.IceBlast];
      Config.DodgeHP = 50;
      Config.DodgeRange = me.checkSkill(sdk.skills.Blizzard, sdk.skills.subindex.SoftPoints) ? 15 : 7;
    });
    build.AutoBuildTemplate[24] = buildAutoBuildTempObj(() => {
      if (me.checkSkill(sdk.skills.Blizzard, sdk.skills.subindex.HardPoints)) {
        Config.AttackSkill = [-1, sdk.skills.Blizzard, sdk.skills.Nova, sdk.skills.Blizzard, sdk.skills.Nova, sdk.skills.Nova, sdk.skills.ChargedBolt];
      }
    });

    return build;
  })();
})(module, require);
