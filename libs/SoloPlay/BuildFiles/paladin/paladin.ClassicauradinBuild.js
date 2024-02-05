/**
*  @filename    paladin.ClassicauradinBuild.js
*  @author      theBGuy
*  @desc        Classic Auradin (HolyShock/Freeze based) based final build
*
*/


(function (module) {
  module.exports = (function () {
    // idea: since this is based on the classic build, could do tri-element instead of just normal auradin
    // max Holy Shock/Freeze then use HoJ + Dragon Armor/Shield for level 44 Holy Fire
    // could even then do infinity for the merc to still have some conviction
    const build = {
      caster: false,
      skillstab: sdk.skills.tabs.PalaCombat,
      wantedskills: [sdk.skills.Zeal, sdk.skills.HolyShock],
      usefulskills: [sdk.skills.HolyShield, sdk.skills.HolyFreeze, sdk.skills.ResistCold, sdk.skills.ResistLightning],
      precastSkills: [sdk.skills.HolyShield],
      wantedMerc: MercData[sdk.skills.HolyFreeze],
      skills: [
        [sdk.skills.Zeal, 4],
        [sdk.skills.Redemption, 1],
        [sdk.skills.HolyShield, 1],
        [sdk.skills.HolyShock, 20],
        [sdk.skills.HolyFreeze, 20],
        [sdk.skills.Salvation, 20, false],
        [sdk.skills.ResistLightning, 20, false],
        [sdk.skills.Zeal, 20, false],
      ],
      stats: [],

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
              sdk.skills.Zeal, sdk.skills.HolyShock,
              sdk.skills.Zeal, sdk.skills.HolyShock,
              sdk.skills.Zeal, sdk.skills.HolyFreeze
            ];
            Config.LowManaSkill = [-1, -1];
            Config.SkipImmune = ["lightning and cold and physical"];	// Don't think this ever happens but should skip if it does

            Config.BeltColumn = ["hp", "hp", "mp", "rv"];
          }
        },
      },

      respec: function () {
        if (me.classic) {
          return me.charlvl >= 75 && me.diablo;
        }
        return me.haveAll([
          { name: sdk.locale.items.Dream, itemtype: sdk.items.type.AuricShields },
          { name: sdk.locale.items.Dream, itemtype: sdk.items.type.Helm }
        ]);
      },

      active: function () {
        return this.respec() && me.getSkill(sdk.skills.HolyShock, sdk.skills.subindex.HardPoints) === 20;
      },
    };
    
    build.stats = me.classic
      ? [
        ["strength", 80], ["vitality", "all"]
      ]
      : [
        ["strength", 103], ["dexterity", 136], ["vitality", 300],
        ["dexterity", "block"], ["vitality", "all"]
      ];
    
    let finalGear = me.classic
      ? [
        // Weapon
        "[name] == warscepter && [quality] >= magic # [paladinskills] == 2 && [ias] == 40 && [skillholyshock] >= 1 # [tier] == tierscore(item, 100000)",
        // Helm - Tarnhelm
        "[name] == skullcap && [quality] == unique # [itemallskills] == 1 && [itemmagicbonus] >= 25 # [tier] == tierscore(item, 100000)",
        // Shield
        "[type] == shield && [quality] >= magic # [paladinskills] == 2 && [allres] >= 16 # [tier] == tierscore(item, 100000)",
        // Rings - SoJ
        "[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000",
        // Amulet
        "[type] == amulet && [quality] >= magic # [paladinskills] == 2 && [allres] >= 16 # [tier] == tierscore(item, 100000)",
        // Boots - Hsaru's Iron Heel
        "[name] == chainboots && [quality] == set # [frw] == 20 # [tier] == 100000",
        // Belt - Hsaru's Iron Stay
        "[name] == belt && [quality] == set # [coldresist] == 20 && [maxhp] == 20 # [tier] == 100000",
      ] : [
        // Final Weapon - HoJ
        "[type] == sword && [flag] == runeword # [holyfireaura] >= 16 # [tier] == 120000",
        // Weapon - Crescent Moon
        "[type] == sword && [flag] == runeword # [ias] >= 20 && [passiveltngpierce] >= 35 # [tier] == 110000",
        // Weapon - Voice of Reason
        "[type] == sword && [flag] == runeword # [passivecoldpierce] >= 24 # [tier] == 102500",
        // Helm - Dream
        "[type] == helm && [flag] == runeword # [holyshockaura] >= 15 # [tier] == 110000",
        // Belt - TGods
        "[name] == warbelt && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == tierscore(item, 110000)",
        // Boots - Gore Rider
        "[name] == warboots && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == tierscore(item, 110000)",
        // Armor - Dragon
        "[type] == armor && [flag] != ethereal && [flag] == runeword # [holyfireaura] >= 14 # [tier] == 110000",
        // Shield - Dream
        "[type] == auricshields && [flag] != ethereal && [flag] == runeword # [holyshockaura] >= 15 # [tier] == 110000",
        // Gloves - Laying of Hand's
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
