/**
*  @filename    MuleloggerOverrides.js
*  @author      theBGuy
*  @desc        modified Mulelogger to add tier values to item description and log equipped items
*
*/

includeIfNotIncluded("MuleLogger.js");
includeIfNotIncluded("SoloPlay/Functions/NTIPOverrides.js");
includeIfNotIncluded("SoloPlay/Functions/MiscOverrides.js");

// Added type parameter and logging tier value under picture on char viewer tab
MuleLogger.logItem = function (unit, logIlvl, type = "Player") {
	if (!isIncluded("common/misc.js")) {
		include("common/misc.js");
		include("common/util.js");
	}

	logIlvl === undefined && (logIlvl = this.LogItemLevel);

	let header = "";
	let name = unit.itemType + "_" + unit.fname.split("\n").reverse().join(" ").replace(/(y|ÿ)c[0-9!"+<:;.*]|\/|\\/g, "").trim();
	let desc = (Misc.getItemDesc(unit, logIlvl) || "");
	let color = (unit.getColor() || -1);
	let code = Misc.getItemCode(unit);

	if (NTIP.GetMercTier(unit) > 0 || NTIP.GetTier(unit) > 0 || NTIP.GetCharmTier(unit) > 0 || NTIP.GetSecondaryTier(unit) > 0) {
		if (unit.mode === sdk.items.mode.inStorage && type === "Player") {
			if (unit.isCharm) {
				desc += ("\n\\xffc0Autoequip charm tier: " + NTIP.GetCharmTier(unit));
			} else {
				desc += ("\n\\xffc0Autoequip tier: " + NTIP.GetTier(unit));

				if (NTIP.GetSecondaryTier(unit) > 0) {
					desc += ("\n\\xffc0Autoequip Secondary tier: " + NTIP.GetSecondaryTier(unit));
				}
			}
		} else if (unit.mode === sdk.items.mode.inStorage && type === "Merc") {
			desc += ("\n\\xffc0Autoequip merctier: " + NTIP.GetMercTier(unit));
		}
	}

	let sock = unit.getItems();

	if (sock) {
		for (let i = 0; i < sock.length; i += 1) {
			if (sock[i].itemType === sdk.items.type.Jewel) {
				desc += "\n\n";
				desc += Misc.getItemDesc(sock[i]);
			}
		}
	}

	desc += "$" + unit.gid + ":" + unit.classid + ":" + unit.location + ":" + unit.x + ":" + unit.y + (unit.getFlag(sdk.items.flags.Ethereal) ? ":eth" : "");

	return {
		itemColor: color,
		image: code,
		title: name,
		description: desc,
		header: header,
		sockets: Misc.getItemSockets(unit)
	};
};

MuleLogger.logEquippedItems = function () {
	while (!me.gameReady) {
		delay(100);
	}

	let folder, string, parsedItem;
	let realm = me.realm || "Single Player";
	let finalString = "";
	let items = me.getItemsEx().filter(item => item.isEquipped || item.isEquippedCharm || (item.isInStorage && item.itemType === sdk.items.type.Rune));
	if (!items || !items.length) return;
	items.sort((a, b) => b.itemType - a.itemType);

	if (!FileTools.exists("mules/" + realm)) {
		folder = dopen("mules");
		folder.create(realm);
	}

	if (!FileTools.exists("mules/" + realm + "/" + "Kolbot-SoloPlay")) {
		folder = dopen("mules/" + realm);
		folder.create("Kolbot-SoloPlay");
	}

	if (!FileTools.exists("mules/" + realm + "/" + "Kolbot-SoloPlay/" + me.account)) {
		folder = dopen("mules/" + realm + "/Kolbot-SoloPlay");
		folder.create(me.account);
	}

	for (let i = 0; i < items.length; i += 1) {
		parsedItem = this.logItem(items[i], true, "Player");
		// Always put name on Char Viewer items
		!parsedItem.header && (parsedItem.header = (me.account || "Single Player") + " / " + me.name);
		// Remove itemtype_ prefix from the name
		parsedItem.title = parsedItem.title.substr(parsedItem.title.indexOf("_") + 1);

		switch (items[i].mode) {
		case sdk.items.mode.inStorage:
			parsedItem.title += ((items[i].isInInventory && items[i].isEquippedCharm) ? " (equipped charm)" : " (in stash)");

			break;
		case sdk.items.mode.Equipped:
			parsedItem.title += (items[i].isOnSwap ? " (secondary equipped)" : " (equipped)");

			break;
		}

		string = JSON.stringify(parsedItem);
		finalString += (string + "\n");
	}

	if (Config.UseMerc) {
		let merc = Mercenary.getMercFix();

		if (merc) {
			items = merc.getItemsEx();

			for (let i = 0; i < items.length; i += 1) {
				parsedItem = this.logItem(items[i], true, "Merc");
				parsedItem.title += " (merc)";

				string = JSON.stringify(parsedItem);
				finalString += (string + "\n");
			}
		}

	}

	let charClass = ["amazon-", "sorceress-", "necromancer-", "paladin-", "barbarian-", "druid-", "assassin-"][me.classid];

	// hccl = hardcore classic ladder
	// scnl = softcore expan nonladder
	FileTools.writeText("mules/" + realm + "/" + "Kolbot-SoloPlay/" + me.account + "/" + charClass + "-" + me.profile + "-" + me.name + "." + ( me.playertype ? "hc" : "sc" ) + (me.classic ? "c" : "" ) + ( me.ladder > 0 ? "l" : "nl" ) + ".txt", finalString);
	console.log("Item logging done.");
};
