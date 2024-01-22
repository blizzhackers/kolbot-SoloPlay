/**
*  @filename    barbarian.js
*  @author      theBGuy
*  @desc        Barb specifics
*
*/

const CharInfo = {
  respecOne: me.expansion ? 30 : 30,
  respecTwo: me.expansion ? 74 : 74,
  levelCap: (function () {
    const currentDiff = sdk.difficulty.nameOf(me.diff);
    const softcoreMode = {
      "Normal": me.expansion ? 33 : 33,
      "Nightmare": me.expansion ? 75 : 75,
      "Hell": 100,
    };
    const hardcoreMode = {
      "Normal": me.expansion ? 36 : 33,
      "Nightmare": me.expansion ? 75 : 75,
      "Hell": 100,
    };

    return me.softcore ? softcoreMode[currentDiff] : hardcoreMode[currentDiff];
  })(),

  getActiveBuild: function () {
    const nSkills = me.getStat(sdk.stats.NewSkills);
    const currLevel = me.charlvl;
    const justRepeced = (nSkills >= currLevel);
    const { respecOne, respecTwo } = this;

    switch (true) {
    case currLevel < respecOne && !me.checkSkill(sdk.skills.WarCry, sdk.skills.subindex.HardPoints):
      return "Start";
    case currLevel >= respecOne && currLevel < respecTwo && justRepeced:
    case (
      currLevel >= respecOne
      && currLevel < respecTwo
      && me.checkSkill(sdk.skills.NaturalResistance, sdk.skills.subindex.HardPoints)
      && !me.checkSkill(sdk.skills.Berserk, sdk.skills.subindex.HardPoints)
    ):
      return "Stepping";
    case Check.finalBuild().respec() && justRepeced:
    case Check.finalBuild().active():
      return SetUp.finalBuild;
    default:
      return "Leveling";
    }
  },
};
