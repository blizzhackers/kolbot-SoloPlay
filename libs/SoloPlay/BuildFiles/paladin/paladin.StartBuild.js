/**
*  @filename    paladin.startBuild.js
*  @author      isid0re, theBGuy
*  @desc        Holy fire build for before respecOne, respecs at 19
*
*/


(function (module, require) {
  module.exports = (function () {
    const build = {
      AutoBuildTemplate: {},
      caster: false,
      skillstab: sdk.skills.tabs.PalaCombat,
      wantedskills: [sdk.skills.Zeal, sdk.skills.HolyFire],
      usefulskills: [
        (me.checkSkill(sdk.skills.HolyFire, sdk.skills.subindex.SoftPoints)
          ? sdk.skills.Sacrifice
          : sdk.skills.Might),
        sdk.skills.ResistFire
      ],
      wantedMerc: MercData[sdk.skills.HolyFreeze],
      stats: [
        ["vitality", 80],
        ["dexterity", 27],
        ["strength", 47],
        ["vitality", "all"],
      ],
      skills: [
        // Total skills points by respec = 20
        [sdk.skills.Might, 1],      // charlevel -> 2
        [sdk.skills.Sacrifice, 1],  // charlevel -> 3
        [sdk.skills.HolyFire, 1, false],   // charlevel -> 6
        [sdk.skills.ResistFire, 4], // charlevel -> 5
        [sdk.skills.HolyFire, 3],   // charlevel -> 8
        [sdk.skills.Smite, 1],      // charlevel -> 10
        [sdk.skills.Zeal, 1],       // charlevel -> 12
        [sdk.skills.Charge, 1],     // charlevel -> 12
        [sdk.skills.Zeal, 4, false],       // charlevel -> 15
        [sdk.skills.HolyFire, 6],   // charlevel -> 17
        [sdk.skills.ResistFire, 16] // respec at 19
      ],

      active: function () {
        return me.charlvl < CharInfo.respecOne && !me.checkSkill(sdk.skills.BlessedAim, sdk.skills.subindex.HardPoints);
      },
    };

    const { buildAutoBuildTempObj } = require("../../Utils/General");
    
    build.AutoBuildTemplate[1] = buildAutoBuildTempObj(() => {
      Config.SkipEnchant.indexOf("cold enchanted") === -1 && Config.SkipEnchant.push("cold enchanted");
      Config.ScanShrines.indexOf(sdk.shrines.Combat) === -1 && Config.ScanShrines.push(sdk.shrines.Combat);
      Config.FieldID.Enabled = !Misc.checkQuest(sdk.quest.id.TheSearchForCain, sdk.quest.states.Completed);
      Config.FieldID.UsedSpace = 0;

      Config.BeltColumn = ["hp", "hp", "hp", "hp"];
      Config.HPBuffer = 8;
      Config.AttackSkill = [-1, sdk.skills.Attack, -1, sdk.skills.Attack, -1, -1, -1];
      Config.LowManaSkill = [sdk.skills.Attack, -1];
      SetUp.belt();
    });
    build.AutoBuildTemplate[2] = buildAutoBuildTempObj(() => {
      Config.SkipEnchant.indexOf("cold enchanted") === -1 && Config.SkipEnchant.push("cold enchanted");
      Config.ScanShrines.indexOf(sdk.shrines.Combat) === -1 && Config.ScanShrines.push(sdk.shrines.Combat);
      Config.FieldID.Enabled = !Misc.checkQuest(sdk.quest.id.TheSearchForCain, sdk.quest.states.Completed);
      Config.FieldID.UsedSpace = 0;

      Config.BeltColumn = ["hp", "hp", "hp", "hp"];
      Config.HPBuffer = 8;
      const bossSkill = (me.checkSkill(sdk.skills.Sacrifice, sdk.skills.subindex.HardPoints) ? sdk.skills.Sacrifice : sdk.skills.Attack);
      Config.AttackSkill = [-1, bossSkill, sdk.skills.Might, sdk.skills.Attack, sdk.skills.Might, -1, -1];
      Config.LowManaSkill = [sdk.skills.Attack, sdk.skills.Might];
    });
    build.AutoBuildTemplate[6] = buildAutoBuildTempObj(() => {
      Config.HPBuffer = 8;
      const bossSkill = (me.checkSkill(sdk.skills.Sacrifice, sdk.skills.subindex.HardPoints) ? sdk.skills.Sacrifice : sdk.skills.Attack);
      Config.AttackSkill = [-1, bossSkill, sdk.skills.HolyFire, sdk.skills.Attack, sdk.skills.HolyFire, sdk.skills.Attack, sdk.skills.Might];
      Config.LowManaSkill = [sdk.skills.Attack, sdk.skills.HolyFire];
    });
    build.AutoBuildTemplate[9] = buildAutoBuildTempObj(() => {
      Config.HPBuffer = me.expansion ? 2 : 4;
      Config.MPBuffer = 6;
      Config.AttackSkill[0] = -1;
      Config.AttackSkill[1] = (me.checkSkill(sdk.skills.Sacrifice, sdk.skills.subindex.HardPoints) ? sdk.skills.Sacrifice : sdk.skills.Attack);
      Config.AttackSkill[2] = sdk.skills.HolyFire;
      Config.AttackSkill[3] = sdk.skills.Attack;
      Config.AttackSkill[4] = sdk.skills.HolyFire;
      Config.AttackSkill[5] = sdk.skills.Attack;
      Config.AttackSkill[6] = sdk.skills.Might;
    });
    build.AutoBuildTemplate[12] = buildAutoBuildTempObj(() => {
      if (me.checkSkill(sdk.skills.Zeal, sdk.skills.subindex.HardPoints)) {
        Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyFire, sdk.skills.Zeal, sdk.skills.HolyFire, 0, sdk.skills.Might];
      }
      Config.Charge = true;
    });

    return build;
  })();
})(module, require);
