/**
*  @filename    ancients.js
*  @author      theBGuy
*  @credit      sonic
*  @desc        ancients quest
*
*/

function ancients () {
	Town.townTasks();
	myPrint('starting ancients');

	Pather.checkWP(sdk.areas.AncientsWay) ? Pather.useWaypoint(sdk.areas.AncientsWay) : Pather.getWP(sdk.areas.AncientsWay);
	Precast.doPrecast(true);
	Pather.clearToExit(sdk.areas.AncientsWay, sdk.areas.ArreatSummit, true); // enter Arreat Summit

	// failed to move to Arreat Summit
	if (!me.inArea(sdk.areas.ArreatSummit)) {
		return false;
	}

	// ancients prep
	Town.townTasks({thawing: true, antidote: true, stamina: true});

	let tempConfig = Misc.copy(Config); // save and update config settings

	Config.TownCheck = false;
	Config.MercWatch = false;
	Config.TownHP = 0;
	Config.TownMP = 0;
	Config.HPBuffer = 15;
	Config.MPBuffer = 15;
	Config.LifeChicken = 10;
	CharData.updateConfig();
	me.overhead('updated settings');

	Town.buyPotions();
	if (!Pather.usePortal(sdk.areas.ArreatSummit, me.name)) {
		myPrint("Failed to take portal back to Arreat Summit");
		Pather.clearToExit(sdk.areas.AncientsWay, sdk.areas.ArreatSummit, true); // enter Arreat Summit
	}
	
	Precast.doPrecast(true);

	// move to altar
	if (!Pather.moveToPreset(sdk.areas.ArreatSummit, sdk.unittype.Object, sdk.units.objects.AncientsAltar)) {
		myPrint("Failed to move to ancients' altar");
	}

	Common.Ancients.touchAltar();
	Common.Ancients.startAncients(true, true);
	
	me.cancel();
	Config = tempConfig;
	CharData.updateConfig();
	me.overhead('restored settings');
	Precast.doPrecast(true);

	try {
		if (Misc.checkQuest(sdk.quest.id.RiteofPassage, 0)) {
			Pather.clearToExit(sdk.areas.ArreatSummit, sdk.areas.WorldstoneLvl1, true);
			Pather.clearToExit(sdk.areas.WorldstoneLvl1, sdk.areas.WorldstoneLvl2, true);
			Pather.getWP(sdk.areas.WorldstoneLvl2);
		}
	} catch (err) {
		myPrint('Cleared Ancients. Failed to get WSK Waypoint');
	}

	return true;
}
