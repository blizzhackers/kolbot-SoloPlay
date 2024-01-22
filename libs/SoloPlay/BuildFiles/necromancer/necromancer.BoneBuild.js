/**
*  @filename    necromancer.BoneBuild.js
*  @author      theBGuy, isid0re
*  @desc        Bone Spear based final build
*
*/


(function (module) {
  module.exports = (function () {
    const build = {
      caster: true,
      skillstab: sdk.skills.tabs.PoisonandBone,
      wantedskills: [sdk.skills.BoneSpirit, sdk.skills.BoneSpear, sdk.skills.Teeth],
      usefulskills: [
        sdk.skills.AmplifyDamage, sdk.skills.BoneArmor,
        sdk.skills.Decrepify, sdk.skills.BoneWall, sdk.skills.BonePrison
      ],
      precastSkills: [sdk.skills.BoneArmor],
      wantedMerc: MercData[sdk.skills.Might],
      skills: [
        [sdk.skills.BoneSpirit, 1],
        [sdk.skills.BonePrison, 1],
        [sdk.skills.SummonResist, 1],
        [sdk.skills.Decrepify, 1],
        [sdk.skills.Attract, 1],
        [sdk.skills.BoneSpear, 20, false],
        [sdk.skills.BonePrison, 20, false],
        [sdk.skills.BoneWall, 20, false],
        [sdk.skills.BoneSpirit, 20, false],
        [sdk.skills.Teeth, 20, false],
      ],
      stats: [],

      charms: {
        ResLife: {
          max: 4,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid
              && check.allRes === 5 && check.getStat(sdk.stats.MaxHp) === 20);
          }
        },

        ResMf: {
          max: 3,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid
              && check.allRes === 5 && check.getStat(sdk.stats.MagicBonus) === 7);
          }
        },

        ResFHR: {
          max: 1,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid
              && check.allRes === 5 && check.getStat(sdk.stats.FHR) === 5);
          }
        },

        Skiller: {
          max: 2,
          have: [],
          classid: sdk.items.GrandCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid
              && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.PoisonandBone) === 1
              && check.getStat(sdk.stats.MaxHp) >= 40);
          }
        },
      },

      AutoBuildTemplate: {
        1:	{
          Update: function () {
            Config.AttackSkill = [-1, sdk.skills.BoneSpear, -1, sdk.skills.BoneSpear, -1, -1, -1];
            Config.ExplodeCorpses = sdk.skills.CorpseExplosion;
            Config.Golem = "Clay";
          }
        },
      },

      respec: function () {
        if (me.classic) {
          return me.charlvl >= 75 && me.diablo;
        } else {
          return me.checkItem({ name: sdk.locale.items.Enigma, itemtype: sdk.items.type.Armor }).have;
        }
      },

      active: function () {
        return this.respec() && me.getSkill(sdk.skills.BoneSpear, sdk.skills.subindex.HardPoints) === 20;
      },
    };
    
    build.stats = me.classic
      ? [
        ["dexterity", 51], ["strength", 80], ["energy", 100], ["vitality", "all"]
      ]
      : [
        ["strength", 48], ["dexterity", 35], ["vitality", 165],
        ["strength", 61], ["vitality", 252], ["strength", 156], ["vitality", "all"]
      ];
    
    let finalGear = me.classic
      ? [
        // Weapon - Spectral Shard
        "[name] == blade && [quality] == unique # [fcr] == 20 && [allres] == 10 # [tier] == 100000",
        // Helm - Tarnhelm
        "[name] == skullcap && [quality] == unique # [itemallskills] == 1 && [itemmagicbonus] >= 25 # [tier] == tierscore(item, 100000)",
        // Shield
        "[type] == shield && [quality] >= magic # [necromancerskills] == 2 && [allres] >= 16 # [tier] == tierscore(item, 100000)",
        // Rings - SoJ
        "[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000",
        // Amulet
        "[type] == amulet && [quality] >= magic # [necromancerskills] == 2 && [fcr] == 10 # [tier] == tierscore(item, 100000)",
        // Boots
        "[type] == boots && [quality] >= magic # [frw] >= 20 && [fhr] == 10 && [coldresist]+[lightresist] >= 10 # [tier] == tierscore(item, 100000)",
        // Belt
        "[type] == belt && [quality] >= magic # [fhr] >= 20 && [maxhp] >= 40 && [fireresist]+[lightresist] >= 20 # [tier] == tierscore(item, 100000)",
        // Gloves - Magefist
        "[name] == lightgauntlets && [quality] == unique # [fcr] >= 20 && [addfireskills] == 1 # [tier] == tierscore(item, 100000)",
      ] : [
        // Weapon - White
        "[type] == wand && [flag] == runeword # [skillbonespear] == 8 && [skillbonespirit] == 6 # [tier] == 100000",
        // Helmet - Harlequin's Crest
        "[name] == shako && [quality] == unique && [flag] != ethereal # [damageresist] == 10 # [tier] == tierscore(item, 100000)",
        // Belt - Arach's
        "[name] == spiderwebsash && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == tierscore(item, 100000)",
        // Final Boots - Sandstorm Treks
        "[name] == scarabshellboots && [quality] == unique # [strength]+[vitality] >= 20 # [tier] == tierscore(item, 100000)",
        // Boots - War Traveler
        "[name] == battleboots && [quality] == unique && [flag] != ethereal # [itemmagicbonus] >= 50 # [tier] == tierscore(item, 5000)",
        // Armor - Enigma
        "[type] == armor && [flag] != ethereal && [flag] == runeword # [itemallskills] == 2 # [tier] == 100000",
        // Shield - Perfect Spirit Monarch
        "[name] == monarch && [flag] == runeword # [fcr] == 35 && [maxmana] == 112 # [tier] == 100000",
        // Final Gloves - Perfect 2x Upp'ed Magefist
        "[name] == crusadergauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] == 30 && [addfireskills] == 1 # [tier] == 110000",
        // Gloves - 2x Upp'ed Magefist
        "[name] == crusadergauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 20 && [addfireskills] == 1 # [tier] == tierscore(item, 100000)",
        // Gloves - Upp'ed Magefist
        "[name] == battlegauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 20 && [addfireskills] == 1 # [tier] == tierscore(item, 100000)",
        // Gloves - Magefist
        "[name] == lightgauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 20 && [addfireskills] == 1 # [tier] == tierscore(item, 100000)",
        // Amulet - Maras
        "[type] == amulet && [quality] == unique # [strength] == 5 && [coldresist] >= 30 # [tier] == tierscore(item, 100000)",
        // Rings - Dwarf Star & SoJ
        "[type] == ring && [quality] == unique # [maxhp] >= 40 && [magicdamagereduction] >= 12 # [tier] == 99000",
        "[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000",
        // Switch - CTA
        "[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
        // Merc Armor - Fortitude
        "[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",
        // Merc Final Helmet - Eth Andy's
        "[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000 + mercscore(item)",
        // Merc Helmet - Andy's
        "[name] == demonhead && [quality] == unique && [flag] != ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 40000 + mercscore(item)",
      ];

    NTIP.buildList(finalGear);
    if (me.expansion && me.equipped.get(sdk.body.RightArmSecondary).prefixnum === sdk.locale.items.CalltoArms) {
      // Switch - Spirit
      NTIP.addLine("[name] == monarch && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [secondarytier] == 110000");
    }
    NTIP.buildFinalGear(finalGear);

    return build;
  })();
})(module);
