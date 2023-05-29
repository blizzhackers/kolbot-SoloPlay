/**
*  @filename    amazon.StartBuild.js
*  @author      theBGuy
*  @desc        Charged Strike build for before respecOne
*
*/



(function (module, require) {
  module.exports = (function () {
    const build = {
      AutoBuildTemplate: {},
      caster: false,
      skillstab: sdk.skills.tabs.JavelinandSpear,
      wantedskills: [sdk.skills.ChargedStrike, sdk.skills.LightningStrike],
      usefulskills: [sdk.skills.CriticalStrike, sdk.skills.Penetrate, sdk.skills.Valkyrie, sdk.skills.Pierce],
      usefulStats: [sdk.stats.PierceLtng, sdk.stats.PassiveLightningMastery, sdk.stats.PassiveLightningPierce],
      wantedMerc: MercData[sdk.skills.HolyFreeze],
      stats: [
        ["strength", 34], ["vitality", 30], ["dexterity", 47],
        ["vitality", 45], ["strength", 47], ["dexterity", 65],
        ["vitality", "all"],
      ],
      skills: [
        [sdk.skills.Jab, 1, false],            // charlvl 2
        [sdk.skills.InnerSight, 1, false],     // charlvl 3
        [sdk.skills.CriticalStrike, 2, false], // charlvl 4
        [sdk.skills.PowerStrike, 1, false],    // charlvl 6
        [sdk.skills.Dodge, 1, false],          // charlvl 6
        [sdk.skills.PowerStrike, 5, false],    // charlvl 10
        [sdk.skills.SlowMissiles, 1, false],   // charlvl 12
        [sdk.skills.Avoid, 1, false],          // charlvl 12
        [sdk.skills.PowerStrike, 8, false],    // charlvl 15
        [sdk.skills.ChargedStrike, 1, false],  // charlvl 18
        [sdk.skills.Penetrate, 1, false],      // charlvl 18
        [sdk.skills.ChargedStrike, 5, false],  // charlvl 22
        [sdk.skills.Evade, 1, false],          // charLvl 24
        [sdk.skills.Decoy, 1, false],          // charlvl 24
        [sdk.skills.ChargedStrike, 20, false], // respec at 30
      ],

      active: function () {
        return me.charlvl < CharInfo.respecOne && !me.checkSkill(sdk.skills.LightningStrike, sdk.skills.subindex.HardPoints);
      },
    };

    const { buildAutoBuildTempObj } = require("../../Utils/General");

    build.AutoBuildTemplate[1] = buildAutoBuildTempObj(() => {
      Config.TownHP = me.hardcore ? 0 : 35;
      Config.BeltColumn = ["hp", "hp", "hp", "hp"];
      Config.HPBuffer = 8;
      Config.MPBuffer = 4;
      Config.AttackSkill = [-1, 0, 0, 0, 0, 0, 0];
      Config.LowManaSkill = [0, 0];
      SetUp.belt();
    });
    build.AutoBuildTemplate[2] = buildAutoBuildTempObj(() => {
      Config.TownHP = me.hardcore ? 0 : 35;
      Config.HPBuffer = 8;
      Config.MPBuffer = 4;
      Config.AttackSkill = [-1, sdk.skills.Jab, 0, sdk.skills.Jab, 0, 0, 0];
    });
    build.AutoBuildTemplate[6] = buildAutoBuildTempObj(() => {
      Config.TownHP = me.hardcore ? 0 : 35;
      Config.BeltColumn = ["hp", "hp", "mp", "mp"];
      Config.HPBuffer = me.expansion ? 4 : 6;
      Config.MPBuffer = 6;
      Config.AttackSkill = [-1, sdk.skills.PowerStrike, 0, sdk.skills.PowerStrike, 0, -1, -1];
      SetUp.belt();
    });
    build.AutoBuildTemplate[7] = buildAutoBuildTempObj(() => {
      Config.HPBuffer = me.expansion ? 4 : 6;
      Config.MPBuffer = 6;
      Config.AttackSkill = [-1, sdk.skills.PowerStrike, 0, sdk.skills.PowerStrike, 0, -1, -1];
    });
    build.AutoBuildTemplate[18] = buildAutoBuildTempObj(() => {
      Config.AttackSkill = [-1, sdk.skills.ChargedStrike, 0, sdk.skills.ChargedStrike, 0, -1, -1];
    });
    build.AutoBuildTemplate[50] = buildAutoBuildTempObj(() => {
      let mainSkill = Skill.canUse(sdk.skills.LightningStrike) ? sdk.skills.LightningStrike : sdk.skills.ChargedStrike;
      Config.AttackSkill = [-1, sdk.skills.ChargedStrike, 0, mainSkill, 0, -1, -1];
    });

    return build;
  })();
})(module, require);
