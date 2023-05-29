/**
*  @filename    paladin.levelingBuild.js
*  @author      isid0re, theBGuy
*  @desc        Blessed Hammer + Concentration leveling build
*               based on https://www.diabloii.net/forums/threads/max-damage-hammerdin-guide-by-captain_bogus-repost.127596/
*
*/


(function (module) {
  module.exports = (function () {
    const build = {
      caster: true,
      skillstab: sdk.skills.tabs.PalaCombat,
      wantedskills: [sdk.skills.BlessedHammer, sdk.skills.Concentration],
      usefulskills: [sdk.skills.HolyShield, sdk.skills.BlessedAim],
      wantedMerc: MercData[sdk.skills.HolyFreeze],
      stats: [],
      skills: [
        [sdk.skills.Might, 1],
        [sdk.skills.Smite, 1],
        [sdk.skills.Prayer, 1],
        [sdk.skills.HolyBolt, 1],
        [sdk.skills.Defiance, 1],
        [sdk.skills.Charge, 1],
        [sdk.skills.BlessedAim, 1],
        [sdk.skills.Cleansing, 1],
        [sdk.skills.BlessedAim, 6],
        [sdk.skills.BlessedHammer, 1],
        [sdk.skills.Concentration, 1],
        [sdk.skills.Vigor, 1],
        [sdk.skills.BlessedAim, 7],
        [sdk.skills.BlessedHammer, 2],
        [sdk.skills.Concentration, 2],
        [sdk.skills.Vigor, 2],
        [sdk.skills.BlessedHammer, 7],
        [sdk.skills.HolyShield, 1],
        [sdk.skills.Meditation, 1],
        [sdk.skills.BlessedHammer, 12],
        [sdk.skills.Redemption, 1],
        [sdk.skills.BlessedHammer, 20],
        [sdk.skills.Concentration, 3],
        [sdk.skills.Vigor, 3],
        [sdk.skills.Concentration, 4],
        [sdk.skills.Vigor, 4],
        [sdk.skills.Concentration, 5],
        [sdk.skills.Vigor, 5],
        [sdk.skills.Concentration, 6],
        [sdk.skills.Vigor, 6],
        [sdk.skills.Concentration, 7],
        [sdk.skills.Vigor, 7],
        [sdk.skills.Concentration, 8],
        [sdk.skills.Vigor, 8],
        [sdk.skills.Concentration, 9],
        [sdk.skills.Vigor, 9],
        [sdk.skills.Concentration, 10],
        [sdk.skills.Vigor, 10],
        [sdk.skills.Concentration, 11],
        [sdk.skills.Vigor, 11],
        [sdk.skills.Concentration, 12],
        [sdk.skills.Vigor, 12],
        [sdk.skills.Concentration, 13],
        [sdk.skills.Vigor, 13],
        [sdk.skills.Concentration, 14],
        [sdk.skills.Vigor, 14],
        [sdk.skills.Concentration, 15],
        [sdk.skills.Vigor, 15],
        [sdk.skills.Concentration, 16],
        [sdk.skills.Vigor, 16],
        [sdk.skills.Concentration, 17],
        [sdk.skills.Vigor, 17],
        [sdk.skills.Concentration, 18],
        [sdk.skills.Vigor, 18],
        [sdk.skills.Concentration, 19],
        [sdk.skills.Vigor, 19],
        [sdk.skills.Concentration, 20],
        [sdk.skills.Vigor, 20],
        [sdk.skills.BlessedAim, 20],
        [sdk.skills.HolyShield, 20]
      ],

      AutoBuildTemplate: {
        1:	{
          Update: function () {
            Config.TownHP = me.hardcore ? 0 : 35;
            Config.AttackSkill = [
              -1, sdk.skills.BlessedHammer, sdk.skills.Concentration,
              sdk.skills.BlessedHammer, sdk.skills.Concentration,
              sdk.skills.HolyBolt, sdk.skills.Concentration
            ];
            Config.LowManaSkill = [0, sdk.skills.Concentration];
            Config.BeltColumn = ["hp", "hp", "mp", "mp"];
            Config.HPBuffer = me.expansion ? 2 : 4;
            Config.MPBuffer = me.expansion && me.charlvl < 80 ? 6 : me.classic ? 5 : 2;
            (me.hell && !me.accessToAct(5)) && (Config.SkipImmune = ["magic"]);
            SetUp.belt();
          }
        }
      },

      active: function () {
        return (me.charlvl > CharInfo.respecOne && me.charlvl > CharInfo.respecTwo && me.checkSkill(sdk.skills.Concentration, sdk.skills.subindex.HardPoints) && !Check.finalBuild().active());
      },
    };

    // Has to be set after its loaded
    build.stats = me.classic
      ? [["dexterity", 51], ["strength", 80], ["vitality", "all"]]
      : [
        ["vitality", 60], ["dexterity", 30], ["strength", 27],
        ["vitality", 91], ["dexterity", 44], ["strength", 30],
        ["vitality", 96], ["dexterity", 59], ["strength", 60],
        ["vitality", 109], ["dexterity", 77], ["strength", 89],
        ["vitality", 137], ["dexterity", 89], ["strength", 103],
        ["vitality", 173], ["dexterity", 103],
        ["vitality", 208], ["dexterity", 118],
        ["vitality", 243], ["dexterity", 133],
        ["vitality", 279], ["dexterity", 147],
        ["vitality", "all"]
      ];
    
    return build;
  })();
})(module);
