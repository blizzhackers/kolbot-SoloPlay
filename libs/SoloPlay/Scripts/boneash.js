/**
*  @filename    boneash.js
*  @author      theBGuy
*  @desc        kill boneash for exp
*
*/

function boneash () {
	Town.townTasks();
	myPrint("starting boneash");

	Pather.checkWP(sdk.areas.InnerCloister, true) ? Pather.useWaypoint(sdk.areas.InnerCloister) : Pather.getWP(sdk.areas.InnerCloister);
	Precast.doPrecast(true);
	Pather.clearToExit(sdk.areas.InnerCloister, sdk.areas.Cathedral, true);
	Pather.moveTo(20047, 4898);
	Attack.killTarget(getLocaleString(sdk.locale.monsters.BoneAsh));

	return true;
}
