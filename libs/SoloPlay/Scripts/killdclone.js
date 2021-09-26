/**
*	@filename	killdclone.js
*	@author		kolton, theBGuy
*	@desc		Kill d-clone
*/

function killdclone() {
	if (Pather.accessToAct(2) && Pather.checkWP(sdk.areas.ArcaneSanctuary)) {
		Pather.useWaypoint(sdk.areas.ArcaneSanctuary);
		Precast.doPrecast(true);

		if (!Pather.usePortal(null)) {
			print("Failed to move to Palace Cellar");
		}
	} else if (Pather.checkWP(sdk.areas.InnerCloister)) {
		Pather.moveTo(20047, 4898);
	} else {
		Pather.useWaypoint(sdk.areas.RogueEncampment);
		Pather.moveToExit(sdk.areas.ColdPlains, true);
		Pather.clearToExit(sdk.areas.ColdPlains, sdk.areas.DenOfEvil, true);
		Pather.moveToPreset(me.area, 1, 774, 0, 0, false, true);
	}

	Attack.killTarget(333);
	Pickit.pickItems();

	if (AutoMule.getInfo() && AutoMule.getInfo().hasOwnProperty("torchMuleInfo")) {
		scriptBroadcast("muleAnni");
	}

	return true;
}
