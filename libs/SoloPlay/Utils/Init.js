/**
*  @filename    Init.js
*  @author      theBGuy
*  @desc        Initialization process for main soloplay thread
*
*/

(function() {
	// Only load this in global scope
	if (getScript(true).name.toLowerCase() === "libs\\soloplay\\soloplay.js") {
		myPrint("start setup");
		const { nipItems, impossibleClassicBuilds, impossibleNonLadderBuilds } = require("../Utils/General");
		NTIP.buildList(nipItems.Quest, nipItems.General);

		try {
			if (impossibleClassicBuilds.includes(SetUp.finalBuild) && me.classic) {
				throw new Error("Kolbot-SoloPlay: " + SetUp.finalBuild + " cannot be used in classic. Change the info tag or remake as an expansion character...Shutting down");
			}

			if (impossibleNonLadderBuilds.includes(SetUp.finalBuild) && !Developer.addLadderRW) {
				throw new Error("Kolbot-SoloPlay: " + SetUp.finalBuild + " cannot be used in non-ladder as they require ladder runewords. Change the info tag or remake as an ladder character...Shutting down");
			}
		} catch (e) {
			D2Bot.printToConsole(e, sdk.colors.D2Bot.Red);
			FileTools.remove("data/" + me.profile + ".json");
			FileTools.remove("libs/SoloPlay/Data/" + me.profile + ".GameTime" + ".json");
			D2Bot.stop();
		}

		if (me.charlvl === 1) {
			let buckler = me.getItem(sdk.items.Buckler);
			!!buckler && buckler.isEquipped && buckler.drop();
		}

		Town.heal() && me.cancelUIFlags();
		Check.checkSpecialCase();

		// check if any of our currently equipped items are no longer usable - can happen after respec
		me.getItemsEx()
			.filter(item => item.isEquipped)
			.forEach(item => {
				if (me.getStat(sdk.stats.Strength) < item.strreq
					|| me.getStat(sdk.stats.Dexterity) < item.dexreq
					|| item.ethereal && item.isBroken) {
					myPrint("No longer able to use: " + item.fname);
					Item.removeItem(null, item);
				} else if (sdk.quest.items.includes(item.classid)) {
					myPrint("Removing Quest Item: " + item.fname);
					Item.removeItem(null, item);
				}
			});
		
		me.getItemsEx()
			.filter(item => item.isInInventory && sdk.quest.items.includes(item.classid))
			.forEach(item => {
				Quest.stashItem(item);
			});
		
		me.cancelUIFlags();
		// initialize final charms if we have any
		CharmEquip.init();
	}
	return true;
})();
