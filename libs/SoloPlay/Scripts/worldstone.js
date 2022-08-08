/**
*  @filename    worldstone.js
*  @author      kolton
*  @desc        Clear Worldstone levels
*
*/

function worldstone() {
	myPrint("starting worldstone");

	Town.doChores(null, {thawing: me.coldRes < 75, antidote: me.poisonRes < 75});

	Pather.useWaypoint(sdk.areas.WorldstoneLvl2);
	Precast.doPrecast(true);
	Attack.clearLevel(Config.ClearType);
	Pather.moveToExit(sdk.areas.WorldstoneLvl1, true) && Attack.clearLevel(Config.ClearType);
	Pather.moveToExit([sdk.areas.WorldstoneLvl2, sdk.areas.WorldstoneLvl3], true) && Attack.clearLevel(Config.ClearType);

	return true;
}
