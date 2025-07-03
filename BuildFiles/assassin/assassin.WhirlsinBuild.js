/**
*  @filename    assassin.WhirlsinBuild.js
*  @author      theBGuy
*  @desc        Whirlwind based final build - uses Chaos runeword
*
*/


(function (module) {
  module.exports = (function () {
    const build = {
      caster: false,
      skillstab: sdk.skills.tabs.ShadowDisciplines,
      wantedskills: [sdk.skills.FireBlast, sdk.skills.LightningSentry, sdk.skills.DeathSentry, sdk.skills.ShadowMaster],
      usefulskills: [sdk.skills.ChargedBoltSentry, sdk.skills.BladeShield, sdk.skills.Fade],
      precastSkills: [sdk.skills.Fade, sdk.skills.ShadowMaster],
      wantedMerc: MercData[sdk.skills.HolyFreeze],
      stats: [
        ["strength", 130], ["dexterity", 99], ["vitality", "all"]
      ],
      skills: [
        [sdk.skills.Fade, 1],
        [sdk.skills.Venom, 1],
        [sdk.skills.MindBlast, 1],
        [sdk.skills.BladeShield, 1],
        [sdk.skills.ClawMastery, 20],
        [sdk.skills.DeathSentry, 1],
        [sdk.skills.ShadowMaster, 20, false],
        [sdk.skills.Venom, 20, false], // lvl 77 w/o quest skill pts
        [sdk.skills.Fade, 20, false],
        [sdk.skills.BladeShield, 20],
      ],

      charms: {
        ResLife: {
          max: 3,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid && check.allRes === 5 && check.getStat(sdk.stats.MaxHp) === 20);
          }
        },

        ResMf: {
          max: 2,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid && check.allRes === 5 && check.getStat(sdk.stats.MagicBonus) === 7);
          }
        },

        ResFHR: {
          max: 1,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid && check.allRes === 5 && check.getStat(sdk.stats.FHR) === 5);
          }
        },

        LifeMana: {
          max: 2,
          have: [],
          classid: sdk.items.SmallCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid && check.getStat(sdk.stats.MaxHp) === 20 && check.getStat(sdk.stats.MaxMana) === 17);
          }
        },

        Skiller: {
          max: 1,
          have: [],
          classid: sdk.items.GrandCharm,
          /** @param {ItemUnit} check */
          stats: function (check) {
            return (!check.unique && check.classid === this.classid && check.getStat(sdk.stats.AddSkillTab, sdk.skills.tabs.ShadowDisciplines) === 1
              && check.getStat(sdk.stats.MaxHp) >= 40);
          }
        },
      },

      AutoBuildTemplate: {
        1:	{
          Update: function () {
            Config.Dodge = false;
            Config.UseVenom = true;
            Config.UseTraps = true;
            Config.AttackSkill = [-1, sdk.skills.Whirlwind, -1, sdk.skills.Whirlwind, -1, -1, -1];
            Config.Traps = [sdk.skills.DeathSentry, sdk.skills.DeathSentry, sdk.skills.DeathSentry, sdk.skills.DeathSentry, sdk.skills.DeathSentry];
            Config.BossTraps = [-1, -1, -1, -1, -1];
          }
        },
      },

      respec: function () {
        return me.haveAll([{ name: sdk.locale.items.Chaos }, { name: sdk.locale.items.Fury }]);
      },

      active: function () {
        return this.respec() && me.getSkill(sdk.skills.ClawMastery, sdk.skills.subindex.HardPoints) === 20;
      },
    };
    
    let finalGear = [ // autoequip final gear
      // Final Weapon - Chaos Claw & Fury
      "[type] == assassinclaw && [flag] == runeword # [plusskillwhirlwind] == 1 # [tier] == 100000",
      "[type] == assassinclaw && [flag] == runeword # [itemallskills] == 2 && [ias] == 40 && [itemdeadlystrike] == 33 # [tier] == 200000",
      // Helmet - GFace
      "[name] == wingedhelm && [quality] == set && [flag] != ethereal # [fhr] >= 30 # [tier] == tierscore(item, 100000)",
      // Belt - Verdungos
      "[name] == mithrilcoil && [quality] == unique && [flag] != ethereal # [damageresist] == 15 # [tier] == tierscore(item, 110000)",
      // Boots - Gore Rider
      "[name] == warboots && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160 # [tier] == tierscore(item, 110000)",
      // Armor - Fortitude
      "[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [tier] == 100000",
      // Gloves - Trang-Ouls
      "[name] == heavybracers && [quality] == set && [flag] != ethereal # [fcr] == 20 # [tier] == 100000", // 
      // Amulet - Highlords
      "[type] == amulet && [quality] == unique # [lightresist] == 35 # [tier] == 100000",
      // Final Rings - Perfect Raven Frost & Bul-Kathos' Wedding Band
      "[type] == ring && [quality] == unique # [dexterity] == 20 && [tohit] == 250 # [tier] == 110000",
      "[type] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] == 5 # [tier] == 110000",
      // Rings - Raven Frost && Bul-Kathos' Wedding Band
      "[type] == ring && [quality] == unique # [dexterity] >= 15 && [tohit] >= 150 # [tier] == 100000",
      "[type] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] >= 3 # [tier] == 100000",
      // Switch Final Weapon - CTA
      "[minimumsockets] >= 5 && [flag] == runeword # [plusskillbattleorders] >= 1 # [secondarytier] == 100000",
      // Switch Final Shield - Spirit
      "[name] == monarch && [flag] == runeword # [fcr] >= 25 && [maxmana] >= 89 # [secondarytier] == 110000",
      // Switch Temporary Shield - Any 1+ all skill
      "[type] == shield # [itemallskills] >= 1 # [secondarytier] == tierscore(item, 50000)",
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
