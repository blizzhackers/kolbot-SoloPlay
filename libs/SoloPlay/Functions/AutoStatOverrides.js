/**
*  @filename    AutoStatOverrides.js
*  @author      theBGuy
*  @credit      IMBA - orignal author
*  @desc        modified AutoStat for SoloPlay
*
*/

includeIfNotIncluded("core/Auto/AutoStat.js");

AutoStat.init = function (statBuildOrder, save = 0, block = 0, bulkStat = true) {
  AutoStat.statBuildOrder = statBuildOrder;
  AutoStat.save = save;
  AutoStat.block = block;
  AutoStat.bulkStat = bulkStat;

  let usedStatPoints = false;

  if (!AutoStat.statBuildOrder || !AutoStat.statBuildOrder.length) {
    console.log("AutoStat: No build array specified");

    return false;
  }

  while (me.getStat(sdk.stats.StatPts) > AutoStat.save) {
    AutoStat.addStatPoint() && (usedStatPoints = true);
    delay(150 + me.ping); // spending multiple single stat at a time with short delay may cause r/d

    // break out of loop if we have stat points available but finished allocating as configured
    if (me.getStat(sdk.stats.StatPts) === AutoStat.remaining) {
      AutoStat.count += 1;
    }

    if (AutoStat.count > 2) {
      break;
    }
  }

  if (usedStatPoints) {
    me.data.level = me.charlvl;
    me.data.strength = me.rawStrength;
    me.data.dexterity = me.rawDexterity;
    CharData.updateData("me", me.data) && me.update();
  }

  console.log("AutoStat: Finished allocating stat points");

  return true;
};
