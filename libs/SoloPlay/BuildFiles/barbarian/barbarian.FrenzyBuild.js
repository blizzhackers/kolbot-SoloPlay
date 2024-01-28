/**
*  @filename    barbarian.FrenzyBuild.js
*  @author      theBGuy
*  @desc        Frenzy based final build
*
*/


(function (module) {
  module.exports = (function () {
    const build = {
      caster: false,
      skillstab: sdk.skills.tabs.BarbCombat,
      wantedskills: [sdk.skills.BattleOrders, sdk.skills.Frenzy, sdk.skills.DoubleSwing],
      usefulskills: [sdk.skills.NaturalResistance, sdk.skills.IronSkin, sdk.skills.IncreasedSpeed],
      precastSkills: [sdk.skills.BattleOrders, sdk.skills.WarCry],
      wantedMerc: MercData[sdk.skills.Might],
      stats: [
        ["strength", 103], ["dexterity", 79], ["vitality", 90],
        ["dexterity", 136], ["strength", 150], ["vitality", "all"],
      ],
      skills: [
        [sdk.skills.DoubleSwing, 9, true],
        [sdk.skills.SwordMastery, 6, false],
        [sdk.skills.BattleCommand, 1, true],
        [sdk.skills.WarCry, 1, true],
        [sdk.skills.NaturalResistance, 5, true],
        [sdk.skills.Berserk, 5, true],
        [sdk.skills.Frenzy, 20, false],
        [sdk.skills.BattleOrders, 20, false], // lvl 77 w/o quest skill pts
        [sdk.skills.SwordMastery, 20, false],
        [sdk.skills.DoubleSwing, 20, false],
      ],

      charms: {
        ResLife: {
          max: 4,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (
              !check.unique
              && check.classid === this.classid
              && check.allRes === 5
              && check.getStat(sdk.stats.MaxHp) === 20
            );
          }
        },

        ResMf: {
          max: 2,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (
              !check.unique
              && check.classid === this.classid
              && check.allRes === 5
              && check.getStat(sdk.stats.MagicBonus) === 7
            );
          }
        },

        ResFHR: {
          max: 2,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (
              !check.unique
              && check.classid === this.classid
              && check.allRes === 5
              && check.getStat(sdk.stats.FHR) === 5
            );
          }
        },

        SkillerCombat: {
          max: 1,
          have: [],
          classid: sdk.items.GrandCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (
              !check.unique
              && check.classid === this.classid
              && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.BarbCombat) === 1
              && check.getStat(sdk.stats.MaxHp) >= 40
            );
          }
        },

        SkillerMasteries: {
          max: 1,
          have: [],
          classid: sdk.items.GrandCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (
              !check.unique
              && check.classid === this.classid
              && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.Masteries) === 1
              && check.getStat(sdk.stats.MaxHp) >= 40
            );
          }
        },
      },

      AutoBuildTemplate: {
        1:	{
          Update: function () {
            Config.AttackSkill = [sdk.skills.WarCry, sdk.skills.Frenzy, -1, sdk.skills.Frenzy, -1];
            Config.LowManaSkill = me.getSkill(sdk.skills.DoubleSwing, sdk.skills.subindex.SoftPoints) >= 9
              ? [sdk.skills.DoubleSwing, 0]
              : [0, -1];
            Config.BeltColumn = ["hp", "hp", "mp", "rv"];
            Config.MPBuffer = 2;
            Config.HPBuffer = 2;
          }
        },
      },

      respec: function () {
        if (me.classic) {
          return me.charlvl >= 75 && me.diablo;
        } else {
          return me.haveAll([{ name: sdk.locale.items.Grief }, { name: sdk.locale.items.BreathoftheDying }]);
        }
      },

      active: function () {
        return this.respec() && me.getSkill(sdk.skills.Frenzy, sdk.skills.subindex.HardPoints) === 20;
      },
    };
    
    let finalGear = [ // autoequip final gear
      // Final Weapon - Grief & BoTD
      "[name] == phaseblade && [flag] == runeword # [ias] >= 30 # [tier] == 100000",
      "[name] == colossusblade && [flag] == runeword # [ias] >= 60 && [enhanceddamage] >= 350 # [tier] == 100000",
      // Helmet - Arreat's Face
      "[name] == slayerguard && [quality] == unique && [flag] != ethereal # [barbarianskills] == 2 # [tier] == tierscore(item, 100000)",
      // Belt - Dungo's
      "[name] == mithrilcoil && [quality] == unique && [flag] != ethereal # [damageresist] >= 10 && [vitality] >= 30 # [tier] == tierscore(item, 100000)",
      // Boots - Gore Rider
      "[name] == warboots && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == tierscore(item, 100000)",
      // Armor - Fortitude
      "[type] == armor && [flag] != ethereal && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 30 # [tier] == 100000",
      // Gloves - Laying of Hands
      "[name] == bramblemitts && [quality] == set && [flag] != ethereal # [ias] == 20 # [tier] == 100000",
      // Amulet - Atma's
      "[type] == amulet && [quality] == unique # [poisonresist] == 75 # [tier] == tierscore(item, 100000)",
      // Final Rings - Perfect Raven Frost & Bul-Kathos' Wedding Band
      "[type] == ring && [quality] == unique # [dexterity] == 20 && [tohit] == 250 # [tier] == 110000",
      "[type] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] == 5 # [tier] == 110000",
      // Rings - Raven Frost && Bul-Kathos' Wedding Band
      "[type] == ring && [quality] == unique # [dexterity] >= 15 && [tohit] >= 150 # [tier] == 100000",
      "[type] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] >= 3 # [tier] == 100000",
      // Switch -  BO Sticks
      "[type] >= 1 && ([quality] == magic || [flag] == runeword) && [2handed] == 0 # [itemallskills]+[warcriesskilltab]+[barbarianskills] >= 1 # [secondarytier] == 100000 + secondaryscore(item)",
      // Merc Armor - Fortitude
      "[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",
      // Merc Final Helmet - Eth Andy's
      "[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",
      // Merc Helmet - Andy's
      "[name] == demonhead && [quality] == unique && [flag] != ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 40000 + mercscore(item)",
    ];

    NTIP.buildList(finalGear);
    NTIP.buildFinalGear(finalGear);

    return build;
  })();
})(module);
