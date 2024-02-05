/**
*  @filename    paladin.SmiterBuild.js
*  @author      theBGuy
*  @desc        Smite + Fanaticism based final build
*
*/


(function (module) {
  module.exports = (function () {
    const build = {
      caster: false,
      skillstab: sdk.skills.tabs.PalaCombat,
      wantedskills: [sdk.skills.Smite, sdk.skills.Fanaticism],
      usefulskills: [sdk.skills.HolyShield, sdk.skills.Salvation],
      precastSkills: [sdk.skills.HolyShield],
      wantedMerc: MercData[sdk.skills.HolyFreeze],
      stats: [
        ["strength", 115], ["dexterity", 136], ["vitality", 300],
        ["dexterity", "block"], ["vitality", "all"]
      ],
      skills: [
        [sdk.skills.Smite, 20],
        [sdk.skills.HolyShield, 20],
        [sdk.skills.Fanaticism, 20],
        [sdk.skills.Salvation, 5],
        [sdk.skills.ResistLightning, 15],
        [sdk.skills.ResistFire, 14],
        [sdk.skills.ResistCold, 10]
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
              && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.PalaCombat) === 1
              && check.getStat(sdk.stats.MaxHp) >= 40
            );
          }
        },
      },

      AutoBuildTemplate: {
        1:	{
          Update: function () {
            Config.AttackSkill = [
              -1,
              sdk.skills.Smite, sdk.skills.Fanaticism,
              sdk.skills.Smite, sdk.skills.Fanaticism,
              sdk.skills.BlessedHammer, sdk.skills.Concentration
            ];
            Config.LowManaSkill = [0, sdk.skills.Fanaticism];
            Config.BeltColumn = ["hp", "hp", "mp", "rv"];
            SetUp.belt();
          }
        },
      },

      respec: function () {
        if (me.classic) {
          return me.charlvl >= 75 && me.diablo;
        } else {
          return me.checkItem({ name: sdk.locale.items.Grief, itemtype: sdk.items.type.Sword }).have;
        }
      },

      active: function () {
        return this.respec() && me.getSkill(sdk.skills.Smite, sdk.skills.subindex.HardPoints) === 20;
      },
    };
    
    let finalGear = [ // autoequip final gear
      // Weapon - Grief
      "[type] == sword && [flag] == runeword # [ias] >= 30 && [itemdeadlystrike] == 20 && [passivepoispierce] >= 20 # [tier] == 100000",
      // Helm - GFace
      "[name] == wingedhelm && [quality] == set && [flag] != ethereal # [fhr] >= 30 # [tier] == tierscore(item, 100000)",
      // Belt - Tgods
      "[name] == warbelt && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160  # [tier] == tierscore(item, 100000)",
      // Boots - Goblin Toes
      "[name] == lightplatedboots && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 50 # [tier] == tierscore(item, 100000)",
      // Armor - Enigma
      "[type] == armor && [flag] != ethereal && [flag] == runeword # [itemallskills] == 2 # [tier] == 100000",
      // Shield - HoZ
      "[name] == gildedshield && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 150 # [tier] == tierscore(item, 100000)",
      // Gloves - Drac's
      "[name] == vampirebonegloves && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 100 && [strength] >= 12 && [lifeleech] >= 9 # [tier] == tierscore(item, 100000)",
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
