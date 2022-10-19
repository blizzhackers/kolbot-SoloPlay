/**
*  @filename    templeruns.js
*  @author      isid0re, theBGuy
*  @author      Xcon
*  @desc        temple runs for exp
*
*/

function templeruns () {
	myPrint("starting temple runs");
	// todo - calculate effort required to clear temple and decide whether to run it or move to next
	const temples = [
		[sdk.areas.FlayerJungle, sdk.areas.LowerKurast], [sdk.areas.KurastBazaar, sdk.areas.RuinedTemple],
		[sdk.areas.KurastBazaar, sdk.areas.DisusedFane], [sdk.areas.UpperKurast, sdk.areas.ForgottenReliquary],
		[sdk.areas.UpperKurast, sdk.areas.ForgottenTemple], [sdk.areas.UpperKurast, sdk.areas.KurastCauseway, sdk.areas.RuinedFane], [sdk.areas.UpperKurast, sdk.areas.KurastCauseway, sdk.areas.DisusedReliquary]
	];
	Town.doChores(false, { fullChores: true });

	for (let run = 0; run < temples.length; run++) {
		Pather.checkWP(temples[run][0], true) ? Pather.useWaypoint(temples[run][0]) : Pather.getWP(temples[run][0]);
		Precast.doPrecast(true);

		if (Pather.moveToExit(temples[run], true, true)) {
			if (me.inArea(sdk.areas.LowerKurast)) {
				Misc.openChestsInArea(sdk.areas.LowerKurast);
			} else if (me.inArea(sdk.areas.RuinedTemple) && !me.lamessen) {
				me.overhead("lamessen");
				Pather.moveToPreset(sdk.areas.RuinedTemple, sdk.unittype.Object, sdk.quest.chest.LamEsensTomeHolder);
				Quest.collectItem(sdk.quest.item.LamEsensTome, sdk.quest.chest.LamEsensTomeHolder);
				Quest.unfinishedQuests();
			} else {
				Attack.clearLevel(0xF);
			}
		}

		Town.goToTown();
	}

	if (!me.inTown) {
		Town.goToTown();

		if (!me.mephisto) {
			if (!Pather.checkWP(sdk.areas.Travincal)) {
				Pather.getWP(sdk.areas.Travincal);
				Town.goToTown();
			}
		}
	}

	return true;
}
