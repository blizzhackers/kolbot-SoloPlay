/**
*  @filename    paladin.TorchadinBuild.js
*  @author      theBGuy
*  @desc        Zeal + Holy Fire based final build - uses HoJ + Dragon for level 30 Holy Fire
*
*/


(function (module) {
  module.exports = (function () {
    const build = {
      caster: false,
      skillstab: sdk.skills.tabs.PalaCombat,
      wantedskills: [sdk.skills.Zeal, sdk.skills.Conviction],
      usefulskills: [sdk.skills.HolyShield, sdk.skills.ResistFire, sdk.skills.Salvation],
      precastSkills: [sdk.skills.HolyShield],
      usefulStats: [sdk.stats.PassiveFireMastery, sdk.stats.PassiveFirePierce, sdk.stats.PierceFire],
      wantedMerc: MercData[sdk.skills.HolyFreeze],
      stats: [
        ["strength", 103], ["dexterity", 136],
        ["vitality", 300], ["dexterity", "block"], ["vitality", "all"]
      ],
      skills: [
        [sdk.skills.Conviction, 20],
        [sdk.skills.Zeal, 4],
        [sdk.skills.Salvation, 20],
        [sdk.skills.ResistFire, 20],
        [sdk.skills.Redemption, 1],
        [sdk.skills.HolyShield, 15],
        [sdk.skills.Zeal, 10],
        [sdk.skills.Sacrifice, 20],
      ],

      charms: {
        ResLife: {
          max: 6,
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

        Skiller: {
          max: 2,
          have: [],
          classid: sdk.items.GrandCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (
              !check.unique
              && check.classid === this.classid
              && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.Offensive) === 1
              && check.getStat(sdk.stats.MaxHp) >= 40
            );
          }
        },
      },

      AutoBuildTemplate: {
        1:	{
          Update: function () {
            Config.Vigor = false;
            Config.AttackSkill = [
              -1,
              sdk.skills.Zeal, sdk.skills.Conviction,
              sdk.skills.Zeal, sdk.skills.Conviction,
              -1, -1
            ];
            Config.LowManaSkill = [-1, -1];
            Config.SkipImmune = ["fire and physical"];
            Config.BeltColumn = ["hp", "hp", "mp", "rv"];
            SetUp.belt();
          }
        },
      },

      respec: function () {
        if (me.classic) {
          return false;
        }
        return (
          me.haveAll([
            { name: sdk.locale.items.HandofJustice },
            { name: sdk.locale.items.Dragon, itemtype: sdk.items.type.Armor }
          ])
        );
      },

      active: function () {
        return this.respec() && me.getSkill(sdk.skills.Conviction, sdk.skills.subindex.HardPoints) === 20;
      },
    };
    
    // autoequip final gear
    let finalGear = [
      // Final Weapon - HoJ
      "[type] == sword && [flag] == runeword # [holyfireaura] >= 16 # [tier] == 120000",
      // Temporary Weapon - Crescent Moon
      "[type] == sword && [flag] == runeword # [ias] >= 20 && [passiveltngpierce] >= 35 # [tier] == 110000",
      // Temporary Weapon - Voice of Reason
      "[type] == sword && [flag] == runeword # [passivecoldpierce] >= 24 # [tier] == 102500",
      // Final Helm - Upp'ed Vamp Gaze
      "[name] == bonevisage && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 100 && [lifeleech] >= 6 # [tier] == tierscore(item, 100000)",
      // Helm - Vamp Gaze
      "[name] == grimhelm && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 100 # [tier] == tierscore(item, 100000)",
      // Belt - TGods
      "[name] == warbelt && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == tierscore(item, 110000)",
      // Boots - Gore Rider
      "[name] == warboots && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == tierscore(item, 110000)",
      // Armor - Dragon
      "[type] == armor && [flag] != ethereal && [flag] == runeword # [holyfireaura] >= 14 # [tier] == 110000",
      // Shield - Exile
      "[type] == auricshields && [flag] == runeword # [defianceaura] >= 13 # [tier] == 110000",
      // Gloves - Laying of Hands
      "[name] == bramblemitts && [quality] == set && [flag] != ethereal # [ias] >= 20 # [tier] == 110000",
      // Amulet - Highlords
      "[type] == amulet && [quality] == unique # [lightresist] == 35 # [tier] == 100000",
      // Final Rings - Perfect Raven Frost & Bul-Kathos' Wedding Band
      "[type] == ring && [quality] == unique # [dexterity] == 20 && [tohit] == 250 # [tier] == 110000",
      "[type] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] == 5 # [tier] == 110000",
      // Rings - Raven Frost && Bul-Kathos' Wedding Band
      "[type] == ring && [quality] == unique # [dexterity] >= 15 && [tohit] >= 150 # [tier] == 100000",
      "[type] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] >= 3 # [tier] == 100000",
      // Switch - CTA
      "[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
      // Merc Final Armor - Fortitude
      "[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",
      // Merc Armor - Treachery
      "[type] == armor && [flag] == runeword # [ias] == 45 && [coldresist] == 30 # [merctier] == 50000 + mercscore(item)",
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
