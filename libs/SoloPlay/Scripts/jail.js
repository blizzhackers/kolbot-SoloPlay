/*
*	@filename	jail.js
*	@author		theBGuy
*	@desc		jail runs for levels
*/

function jail () {
	Town.townTasks();
	print('ÿc8Kolbot-SoloPlayÿc0: starting jail');
	me.overhead("jail");
	let levels = [29, 30, 31];

	if (!Pather.checkWP(29)) {
		Pather.getWP(29);
	} else {
		Pather.useWaypoint(29);
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
