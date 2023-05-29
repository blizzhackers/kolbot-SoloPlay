/**
*  @filename    assassin.StartBuild.js
*  @author      theBGuy
*  @desc        fire trap build for before respecOne
*
*/


(function (module, require) {
  module.exports = (function () {
    const build = {
      AutoBuildTemplate: {},
      caster: true,
      skillstab: sdk.skills.tabs.Traps,
      wantedskills: [sdk.skills.FireBlast, sdk.skills.WakeofFire],
      usefulskills: [sdk.skills.CloakofShadows, sdk.skills.ShadowWarrior],
      wantedMerc: MercData[sdk.skills.HolyFreeze],
      stats: [
        ["vitality", 35], ["energy", 35], ["strength", 33], ["dexterity", 33],
        ["vitality", 50], ["strength", 46], ["dexterity", 46],
        ["vitality", 70], ["strength", 50], ["dexterity", 50],
        ["energy", 50], ["vitality", "all"]
      ],
      skills: [
        [sdk.skills.FireBlast, 4, false],     // level 4
        [sdk.skills.ClawMastery, 1],          // level 5 (den)
        [sdk.skills.PsychicHammer, 1],        // level 6
        [sdk.skills.BurstofSpeed, 5],         // level 11
        [sdk.skills.WakeofFire, 1, false],    // level 12
        [sdk.skills.CloakofShadows, 1, true], // level 13
        [sdk.skills.WakeofFire, 10, false],   // level 24
        [sdk.skills.FireBlast, 6, false],     // level 26
        [sdk.skills.WakeofFire, 20, false],   // level 36
        [sdk.skills.FireBlast, 10],           // level 42
      ],

      active: function () {
        return me.charlvl < CharInfo.respecOne && !me.checkSkill(sdk.skills.LightningSentry, sdk.skills.subindex.HardPoints);
      },
    };

    const { buildAutoBuildTempObj } = require("../../Utils/General");
    
    build.AutoBuildTemplate[1] = buildAutoBuildTempObj(() => {
      Config.TownHP = me.hardcore ? 0 : 35;
      Config.BeltColumn = ["hp", "hp", "hp", "hp"];
      Config.HPBuffer = 4;
      Config.MPBuffer = 2;
      Config.AttackSkill = [-1, 0, 0, 0, 0, 0, 0];
      Config.LowManaSkill = [0, 0];
      SetUp.belt();
    });
    build.AutoBuildTemplate[2] = buildAutoBuildTempObj(() => {
      Config.BeltColumn = ["hp", "hp", "mp", "mp"];
      Config.HPBuffer = 2;
      Config.MPBuffer = 6;
      Config.AttackSkill = [-1, sdk.skills.FireBlast, -1, sdk.skills.FireBlast, -1, (me.checkSkill(sdk.skills.PsychicHammer, sdk.skills.subindex.SoftPoints) ? sdk.skills.PsychicHammer : 0), 0];
      Config.UseBoS = true;
      SetUp.belt();
    });
    build.AutoBuildTemplate[12] = buildAutoBuildTempObj(() => {
      Config.AttackSkill = [-1, sdk.skills.FireBlast, -1, sdk.skills.FireBlast, -1, (me.checkSkill(sdk.skills.PsychicHammer, sdk.skills.subindex.SoftPoints) ? sdk.skills.PsychicHammer : 0), 0];
      Config.UseTraps = true;
      Config.Traps = [sdk.skills.WakeofFire, sdk.skills.WakeofFire, sdk.skills.WakeofFire, -1, -1]; // Skill IDs for traps to be cast on all mosters except act bosses.
      Config.BossTraps = [sdk.skills.WakeofFire, sdk.skills.WakeofFire, sdk.skills.WakeofFire, sdk.skills.WakeofFire, sdk.skills.WakeofFire]; // Skill IDs for traps to be cast on act bosses.
      SetUp.belt();
    });

    return build;
  })();
})(module, require);
