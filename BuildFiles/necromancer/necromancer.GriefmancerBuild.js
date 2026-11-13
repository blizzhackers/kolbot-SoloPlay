/**
*  @filename    necromancer.Griefmancer.js
*  @author      Kumitssu, Secret Ninja, theGuy, 
*  @desc        Hybrid - frontliner with summons. 90 IAS, 50 CB, 85 DS, 10 OW. 75 fire, 45 cold, 75 light, 45 poison res, 90 IAS, 50 CB, 85+ DS, 10 OW
*
*/


(function (module) {
  module.exports = (function () {
    const build = {
      caster: false,
      skillstab: sdk.skills.tabs.NecroSummoning,
      wantedskills: [sdk.skills.RaiseSkeleton, sdk.skills.CorpseExplosion],
      usefulskills: [sdk.skills.AmplifyDamage, sdk.skills.SkeletonMastery, sdk.skills.BoneArmor, sdk.skills.Decrepify],
      precastSkills: [sdk.skills.BoneArmor],
      wantedMerc: MercData[sdk.skills.BlessedAim],
      stats: [
        ["strength", 156], ["dexterity", 136], ["vitality", 300],
        ["dexterity", "block"], ["vitality", "all"]
      ],
      skills: [
        [sdk.skills.SummonResist, 1],
        [sdk.skills.BonePrison, 1],
        [sdk.skills.Decrepify, 1],
        [sdk.skills.RaiseSkeleton, 20, false],
        [sdk.skills.SkeletonMastery, 20, false],
        [sdk.skills.CorpseExplosion, 20, false],
        [sdk.skills.AmplifyDamage, 20, false],
        [sdk.skills.Revive, 20, false],
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
        LifeMana: {
          max: 2,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (
              !check.unique
              && check.classid === this.classid
              && check.getStat(sdk.stats.MaxHp) === 20
              && check.getStat(sdk.stats.MaxMana) === 17
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
              && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.NecroSummoning) === 1
              && check.getStat(sdk.stats.MaxHp) >= 40
            );
          }
        },
      },

      AutoBuildTemplate: {
        1:	{
          /** @returns {void} */
          Update: function () {
            Config.AttackSkill = [-1, sdk.skills.Attack, -1, sdk.skills.Attack, -1, sdk.skills.Attack, -1];
            Config.LowManaSkill = [0, 0];
            Config.ActiveSummon = true;
            Config.Skeletons = "max";
            Config.SkeletonMages = "max";
            Config.Revives = "max";
            Config.Golem = "Clay";
            Config.MPBuffer = me.expansion ? 4 : 6;
          }
        },
      },

      /** @returns {boolean} */
      respec: function () {
        return (
          me.haveAll([
            { name: sdk.locale.items.Enigma, itemtype: sdk.items.type.Armor },
            { name: sdk.locale.items.Grief, itemtype: sdk.items.type.Sword }
          ])
        );
      },

      /** @returns {boolean} */
      active: function () {
        return this.respec() && me.getSkill(sdk.skills.RaiseSkeleton, sdk.skills.subindex.HardPoints) === 20;
      },
    };

    let finalGear = [
      // Weapon - Grief
      "[type] == sword && [flag] == runeword # [ias] >= 30 && [itemdeadlystrike] == 20 && [passivepoispierce] >= 20 # [tier] == 100000",
      // Helm - GFace
      "[name] == wingedhelm && [quality] == set && [flag] != ethereal # [fhr] >= 30 # [tier] == tierscore(item, 100000)",
      // Belt - Nosferatu
      "[name] == vampirefangbelt && [quality] == unique && [flag] != ethereal # [lifeleech] == 7 # [tier] == tierscore(item, 100000)",
      // Boots - Gore Rider
      "[name] == warboots && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == tierscore(item, 110000)",
      // Armor - Enigma
      "[type] == armor && [flag] != ethereal && [flag] == runeword # [itemallskills] == 2 # [tier] == 100000",
      // Sanctuary
      "[type] == shield # [fhr] >= 20 && [enhanceddefense] >= 130 && [fireresist] >= 50 # [tier] == 100000",
      // Gloves - Laying of Hand's
      "[name] == bramblemitts && [quality] == set && [flag] != ethereal # [ias] >= 20 # [tier] == 110000",
      // Amulet - Metalgrid
      "[name] == amulet && [quality] == unique # [tohit] >= 450 && [plusdefense] >= 350 && [fireresist] >= 35 # [tier] == 110000",
      // Final Rings - Perfect Raven Frost &  (blood ring in the future)
      "[type] == ring && [quality] == unique # [dexterity] == 20 && [tohit] == 250 # [tier] == 110000",
      "[type] == ring && [quality] == unique # [dexterity] == 20 && [tohit] == 250 # [tier] == 110000",
      // Rings - Dual Raven Frost
      "[type] == ring && [quality] == unique # [dexterity] >= 15 && [tohit] >= 150 # [tier] == 100000",
      "[type] == ring && [quality] == unique # [dexterity] >= 15 && [tohit] >= 150 # [tier] == 100000",
      // Switch - CTA
      "[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
      // Switch - Spirit
      "[name] == monarch && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [secondarytier] == 110000",
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
