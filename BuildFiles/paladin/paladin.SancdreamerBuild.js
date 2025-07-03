/**
*  @filename    paladin.SancdreamerBuild.js
*  @author      theBGuy
*  @desc        Zeal + Sanctuary based final build - uses Duel Dream Runewords/CoH/Last Wish/Verdungos/RavenFrost + Wisp/Gore Riders/Highlords/Laying of Hands
*               Auras: Level 30 Holy Shock, Level 17 Might
*               Ctc: Level 18 life tap, Level 11 Fade, Level 15 Confuse, Level 16 Lightning
*               Stats: 75 Fire Res/75 Cold Res/85 Light Res/75 Poison Res, Max Block, 34% Damage Reduction, 20% Cold Absorb, 10-20% Light Absorb, 85% Crushing Blow
*
*/


(function (module) {
  module.exports = (function () {
    const build = {
      caster: false,
      skillstab: sdk.skills.tabs.PalaCombat,
      wantedskills: [sdk.skills.Zeal, sdk.skills.Sanctuary],
      usefulskills: [sdk.skills.HolyShield, sdk.skills.Sacrifice, sdk.skills.ResistLightning],
      precastSkills: [sdk.skills.HolyShield],
      usefulStats: [
        sdk.stats.PassiveLightningMastery,
        sdk.stats.PassiveLightningPierce,
        sdk.stats.PierceLtng,
        sdk.stats.PassiveMagMastery,
        sdk.stats.PassiveMagPierce
      ],
      wantedMerc: MercData[sdk.skills.HolyFreeze],
      stats: [
        ["strength", 103], ["dexterity", 136], ["vitality", 300], ["dexterity", "block"], ["vitality", "all"]
      ],
      skills: [
        [sdk.skills.Sanctuary, 20],
        [sdk.skills.Zeal, 4],
        [sdk.skills.ResistLightning, 20],
        [sdk.skills.Cleansing, 20],
        [sdk.skills.Redemption, 1],
        [sdk.skills.HolyShield, 15],
        [sdk.skills.Sacrifice, 19],
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
              sdk.skills.Zeal, sdk.skills.Sanctuary,
              sdk.skills.Zeal, sdk.skills.Sanctuary,
              -1, -1
            ];
            Config.LowManaSkill = [-1, -1];

            Config.SkipImmune = ["lightning and magic and physical"];	// Don't think this ever happens but should skip if it does
            Config.BeltColumn = ["hp", "hp", "mp", "rv"];
            SetUp.belt();
          }
        },
      },

      respec: function () {
        if (me.classic) {
          return false;
        }
        return me.haveAll([
          { name: sdk.locale.items.Dream, itemtype: sdk.items.type.AuricShields },
          { name: sdk.locale.items.Dream, itemtype: sdk.items.type.Helm },
          { name: sdk.locale.items.LastWish }
        ]);
      },

      active: function () {
        return this.respec() && me.getSkill(sdk.skills.Sanctuary, sdk.skills.subindex.HardPoints) === 20;
      },
    };
    
    let finalGear = [ // autoequip final gear
      // Final Weapon - Last Wish
      "[type] == sword && [flag] == runeword # [mightaura] >= 17 # [tier] == 120000",
      // Temporary Weapon - Crescent Moon
      "[type] == sword && [flag] == runeword # [ias] >= 20 && [passiveltngpierce] >= 35 # [tier] == 110000",
      // Temporary Weapon - Voice of Reason
      "[type] == sword && [flag] == runeword # [passivecoldpierce] >= 24 # [tier] == 102500",
      // Helm - Dream
      "[type] == helm && [flag] == runeword # [holyshockaura] >= 15 # [tier] == 110000",
      // Belt - Verdungos
      "[name] == mithrilcoil && [quality] == unique && [flag] != ethereal # [damageresist] == 15 # [tier] == tierscore(item, 110000)",
      // Boots - Gore Rider
      "[name] == warboots && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == tierscore(item, 110000)",
      // Armor - CoH
      "[type] == armor && [flag] == runeword && [flag] != ethereal # [fireresist] == 65 && [hpregen] == 7 # [tier] == 100000",
      // Shield - Dream
      "[type] == auricshields && [flag] != ethereal && [flag] == runeword # [holyshockaura] >= 15 # [tier] == 110000",
      // Gloves  - Laying of Hands
      "[name] == bramblemitts && [quality] == set && [flag] != ethereal # [ias] >= 20 # [tier] == 110000",
      // Amulet - Highlords
      "[type] == amulet && [quality] == unique # [lightresist] == 35 # [tier] == 100000",
      // Final Rings - Perfect Raven Frost & Perfect Wisp
      "[type] == ring && [quality] == unique # [dexterity] == 20 && [tohit] == 250 # [tier] == 110000",
      "[type] == ring && [quality] == unique # [itemabsorblightpercent] == 20 # [tier] == 110000",
      // Rings - Raven Frost & Wisp
      "[type] == ring && [quality] == unique # [dexterity] >= 15 && [tohit] >= 150 # [tier] == 100000",
      "[type] == ring && [quality] == unique # [itemabsorblightpercent] >= 10 # [tier] == 100000",
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
