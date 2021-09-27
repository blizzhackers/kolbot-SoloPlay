/*
*	@filename	jail.js
*	@author		theBGuy
*	@desc		jail runs for levels
*/

function jail () {
	Town.townTasks();
	print('ÿc8Kolbot-SoloPlayÿc0: starting jail');
	me.overhead("jail");
	let levels = [sdk.areas.JailLvl1, sdk.areas.JailLvl2, sdk.areas.JailLvl3];

	if (!Pather.checkWP(sdk.areas.JailLvl1)) {
		Pather.getWP(sdk.areas.JailLvl1);
	} else {
		Pather.useWaypoint(sdk.areas.JailLvl1);
	}

	for (let i = 1; i < levels.length; i++) {
		print('ÿc8Kolbot-SoloPlayÿc0: clearing jail level ' + i);
		me.overhead("clearing jail level " + i);

		Precast.doPrecast(true);
		Attack.clearLevel(0);
		Pather.clearToExit(me.area, levels[i], true)
	}

	return true;
}
