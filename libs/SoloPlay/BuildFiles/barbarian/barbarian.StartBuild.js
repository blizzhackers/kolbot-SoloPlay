/**
*  @filename    barbarian.StartBuild.js
*  @author      theBGuy
*  @credits     aim2kill (big shout out for all the testing an ideas for this build)
*  @desc        Double swing build for before respecOne
*
*/


(function (module, require) {
  module.exports = (function () {
    const build = {
      AutoBuildTemplate: {},
      caster: false,
      skillstab: sdk.skills.tabs.BarbCombat,
      wantedskills: [sdk.skills.BattleOrders, sdk.skills.Frenzy, sdk.skills.DoubleSwing, sdk.skills.SwordMastery],
      usefulskills: [sdk.skills.NaturalResistance, sdk.skills.IronSkin, sdk.skills.IncreasedSpeed, sdk.skills.Shout],
      wantedMerc: MercData[sdk.skills.Might],
      stats: [
        ["strength", 35], ["dexterity", 27], ["vitality", 45],
        ["strength", 48], ["dexterity", 30], ["vitality", 55],
        ["strength", 55], ["dexterity", 39], ["vitality", 65],
        ["strength", 60], ["dexterity", 40], ["vitality", 75],
        ["strength", 71], ["dexterity", 49], ["vitality", "all"],
      ],
      skills: [
        [sdk.skills.Bash, 1],               // charlevel 2
        [sdk.skills.Howl, 1],               // charlevel 3
        [sdk.skills.DoubleSwing, 6, false], // charlevel 9
        [sdk.skills.SwordMastery, 5],       // charlevel 13
        [sdk.skills.Taunt, 1],              // charlevel 14
        [sdk.skills.SwordMastery, 6],       // charlevel 15
        [sdk.skills.IronSkin, 1],           // charlevel 18
        [sdk.skills.BattleCry, 1],          // charlevel 18
        [sdk.skills.SwordMastery, 9],
        [sdk.skills.DoubleThrow, 1],
        [sdk.skills.Shout, 1],
        [sdk.skills.Taunt, 3, false],
        [sdk.skills.Frenzy, 1],
        [sdk.skills.BattleOrders, 4, false],
        [sdk.skills.Taunt, 20],
      ],

      active: function () {
        return me.charlvl < CharInfo.respecOne && !me.checkSkill(sdk.skills.WarCry, sdk.skills.subindex.HardPoints);
      },
    };

    const { buildAutoBuildTempObj } = require("../../Utils/General");
    
    build.AutoBuildTemplate[1] = buildAutoBuildTempObj(() => {
      Config.ScanShrines.indexOf(sdk.shrines.Combat) === -1 && Config.ScanShrines.push(sdk.shrines.Combat);
      Config.FieldID.Enabled = !Misc.checkQuest(sdk.quest.id.TheSearchForCain, sdk.quest.states.Completed);
      Config.FieldID.UsedSpace = 0;

      Config.TownHP = me.hardcore ? 0 : 35;
      Config.BeltColumn = ["hp", "hp", "hp", "hp"];
      Config.MPBuffer = 4;
      Config.HPBuffer = 6;
      Config.AttackSkill = [-1, 0, 0, 0, 0];
      Config.LowManaSkill = [0, 0];
      SetUp.belt();
    });
    build.AutoBuildTemplate[2] = buildAutoBuildTempObj(() => {
      if (me.checkSkill(sdk.skills.Bash, sdk.skills.subindex.HardPoints)) {
        Config.AttackSkill = [-1, sdk.skills.Bash, -1, sdk.skills.Attack, -1];
      }
    });
    build.AutoBuildTemplate[6] = buildAutoBuildTempObj(() => {
      Config.AttackSkill = [-1, sdk.skills.Bash, 0, 0, 0];
    });
    build.AutoBuildTemplate[12] = buildAutoBuildTempObj(() => {
      Config.BeltColumn = me.charlvl < 13 ? ["hp", "hp", "hp", "mp"] : ["hp", "hp", "mp", "mp"];
      Config.HPBuffer = me.expansion ? 2 : 4;
      Config.MPBuffer = 6;
      Config.AttackSkill = [-1, sdk.skills.DoubleSwing, -1, sdk.skills.DoubleSwing, -1];

      if (me.getSkill(sdk.skills.DoubleSwing, sdk.skills.subindex.SoftPoints) >= 9) {
        Config.LowManaSkill = [sdk.skills.DoubleSwing, 0];
      }
      SetUp.belt();
    });
    build.AutoBuildTemplate[24] = buildAutoBuildTempObj(() => {
      if (me.checkSkill(sdk.skills.Frenzy, sdk.skills.subindex.HardPoints)) {
        Config.AttackSkill = [-1, sdk.skills.Frenzy, -1, sdk.skills.Frenzy, -1];
      }
    });

    return build;
  })();
})(module, require);
