/**
*  @filename    AutoStatOverrides.js
*  @author      theBGuy
*  @credit      IMBA - orignal author
*  @desc        modified AutoStat for SoloPlay
*
*/

!isIncluded("common/AutoStat.js") && include("common/AutoStat.js");

AutoStat.init = function (statBuildOrder, save = 0, block = 0, bulkStat = true) {
	AutoStat.statBuildOrder = statBuildOrder;
	AutoStat.save = save;
	AutoStat.block = block;
	AutoStat.bulkStat = bulkStat;

	let usedStatPoints = false;

	if (!AutoStat.statBuildOrder || !AutoStat.statBuildOrder.length) {
		print("AutoStat: No build array specified");

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
		myData = CharData.getStats();
		myData.me.level = me.charlvl;
		myData.me.strength = me.rawStrength;
		myData.me.dexterity = me.rawDexterity;
		CharData.updateData("me", myData) && updateMyData();
	}

	print("AutoStat: Finished allocating stat points");

	return true;
};
