/**
*  @filename    MuleloggerOverrides.js
*  @author      theBGuy
*  @desc        modified Mulelogger to add tier values to item description and log equipped items
*
*/

!isIncluded("MuleLogger.js") && include("MuleLogger.js");
!isIncluded("SoloPlay/Functions/NTIPOverrides.js") && include("SoloPlay/Functions/NTIPOverrides.js");
!isIncluded("SoloPlay/Functions/MiscOverrides.js") && include("SoloPlay/Functions/MiscOverrides.js");

MuleLogger.getItemDesc = function (unit, logIlvl) {
	let desc, index;
	let stringColor = "";

	logIlvl === undefined && (logIlvl = this.LogItemLevel);

	try {
		// Try a few times, sometimes it fails
		for (let u = 0; u < 5; u++) {
			desc = unit.description.split("\n");

			if (desc) {
				break;
			}

			delay(250 + me.ping * 2);
		}
	} catch (e) {
		// This isn't a fatal error just log and move on
		console.debug("Failed to get description of " + unit.fname);

		return false;
	}

	// Lines are normally in reverse. Add color tags if needed and reverse order.
	for (let i = 0; i < desc.length; i += 1) {
		// Remove sell value
		if (desc[i].indexOf(getLocaleString(3331)) > -1) {
			desc.splice(i, 1);

			i -= 1;
		} else {
			// Add color info
			if (!desc[i].match(/^(y|ÿ)c/)) {
				desc[i] = stringColor + desc[i];
			}

			// Find and store new color info
			index = desc[i].lastIndexOf("ÿc");

			if (index > -1) {
				stringColor = desc[i].substring(index, index + "ÿ".length + 2);
			}
		}

		desc[i] = desc[i].replace(/(y|ÿ)c([0-9!"+<:;.*])/g, "\\xffc$2").replace("ÿ", "\\xff", "g");
	}

	if (logIlvl && desc[desc.length - 1]) {
		desc[desc.length - 1] = desc[desc.length - 1].trim() + " (" + unit.ilvl + ")";
	}

	desc = desc.reverse().join("\\n");

	return desc;
};

// Added type parameter and logging tier value under picture on char viewer tab
MuleLogger.logItem = function (unit, logIlvl, type = "Player") {
	if (!isIncluded("common/misc.js")) {
		include("common/misc.js");
		include("common/util.js");
	}

	logIlvl === undefined && (logIlvl = this.LogItemLevel);

	let i, code, sock;
	let header = "";
	let name = unit.itemType + "_" + unit.fname.split("\n").reverse().join(" ").replace(/(y|ÿ)c[0-9!"+<:;.*]|\/|\\/g, "").trim();
	let desc = (this.getItemDesc(unit, logIlvl) || "");
	let color = (unit.getColor() || -1);

	if (NTIP.GetMercTier(unit) > 0 || NTIP.GetTier(unit) > 0 || NTIP.GetCharmTier(unit) > 0 || NTIP.GetSecondaryTier(unit) > 0) {
		if (unit.mode === sdk.itemmode.inStorage && type === "Player") {
			if (unit.isCharm) {
				desc += ("\n\\xffc0Autoequip charm tier: " + NTIP.GetCharmTier(unit));
			} else {
				desc += ("\n\\xffc0Autoequip tier: " + NTIP.GetTier(unit));

				if (NTIP.GetSecondaryTier(unit) > 0) {
					desc += ("\n\\xffc0Autoequip Secondary tier: " + NTIP.GetSecondaryTier(unit));
				}
			}
		} else if (unit.mode === sdk.itemmode.inStorage && type === "Merc") {
			desc += ("\n\\xffc0Autoequip merctier: " + NTIP.GetMercTier(unit));
		}
	}

	switch (unit.quality) {
	case sdk.itemquality.Set:
		switch (unit.classid) {
			case sdk.items.Sabre: // Angelic sabre
			code = "inv9sbu";

			break;
		case sdk.items.ShortWarBow: // Arctic short war bow
			code = "invswbu";

			break;
		case sdk.items.Helm: // Berserker's helm
			code = "invhlmu";

			break;
		case sdk.items.LargeShield: // Civerb's large shield
			code = "invlrgu";

			break;
		case sdk.items.LongSword: // Cleglaw's long sword
		case sdk.items.CrypticSword: // Szabi's cryptic sword
			code = "invlsdu";

			break;
		case sdk.items.SmallShield: // Cleglaw's small shield
			code = "invsmlu";

			break;
		case sdk.items.Buckler: // Hsaru's buckler
			code = "invbucu";

			break;
		case sdk.items.Cap: // Infernal cap / Sander's cap
			code = "invcapu";

			break;
		case sdk.items.BroadSword: // Isenhart's broad sword
			code = "invbsdu";

			break;
		case sdk.items.FullHelm: // Isenhart's full helm
			code = "invfhlu";

			break;
		case sdk.items.LargeShield: // Isenhart's gothic shield
			code = "invgtsu";

			break;
		case sdk.items.AncientArmor: // Milabrega's ancient armor
		case sdk.items.SacredArmor: // Immortal King's sacred armor
			code = "invaaru";

			break;
		case sdk.items.KiteShield: // Milabrega's kite shield
			code = "invkitu";

			break;
		case sdk.items.TowerShield: // Sigon's tower shield
			code = "invtowu";

			break;
		case sdk.items.FullPlateMail: // Tancred's full plate mail
			code = "invfulu";

			break;
		case sdk.items.MilitaryPick: // Tancred's military pick
			code = "invmpiu";

			break;
		case sdk.items.JaggedStar: // Aldur's jagged star
			code = "invmstu";

			break;
		case sdk.items.ColossusBlade: // Bul-Kathos' colossus blade
			code = "invgsdu";

			break;
		case sdk.items.OrnatePlate: // Grizwold's ornate plate
			code = "invxaru";

			break;
		case sdk.items.Cuirass: // Heaven's cuirass
		case sdk.items.ReinforcedMace: // Heaven's reinforced mace
		case sdk.items.Ward: // Heaven's ward
		case sdk.items.SpiredHelm: // Heaven's spired helm
			code = "inv" + unit.code + "s";

			break;
		case sdk.items.GrandCrown: // Hwanin's grand crown
			code = "invxrnu";

			break;
		case sdk.items.ScissorsSuwayyah: // Nalya's scissors suwayyah
			code = "invskru";

			break;
		case sdk.items.GrimHelm: // Nalya's grim helm
		case sdk.items.BoneVisage: // Trang-Oul's bone visage
			code = "invbhmu";

			break;
		case sdk.items.ElderStaff: // Naj's elder staff
			code = "invcstu";

			break;
		case sdk.items.RoundShield: // Orphan's round shield
			code = "invxmlu";

			break;
		case sdk.items.BoneWand: // Sander's bone wand
			code = "invbwnu";

			break;
		}

		break;
	case sdk.itemquality.Unique:
		for (i = 0; i < 401; i += 1) {
			if (unit.code === getBaseStat(17, i, 4).trim() && unit.fname.split("\n").reverse()[0].indexOf(getLocaleString(getBaseStat(17, i, 2))) > -1) {
				code = getBaseStat(17, i, "invfile");

				break;
			}
		}

		break;
	}

	if (!code) {
		if (["ci2", "ci3"].indexOf(unit.code) > -1) { // Tiara/Diadem
			code = unit.code;
		} else {
			code = getBaseStat(0, unit.classid, 'normcode') || unit.code;
		}

		code = code.replace(" ", "");

		if ([sdk.itemtype.Ring, sdk.itemtype.Amulet, sdk.itemtype.Jewel, sdk.itemtype.SmallCharm, sdk.itemtype.MediumCharm, sdk.itemtype.LargeCharm].indexOf(unit.itemType) > -1) {
			code += (unit.gfx + 1);
		}
	}

	sock = unit.getItems();

	if (sock) {
		for (i = 0; i < sock.length; i += 1) {
			if (sock[i].itemType === sdk.itemtype.Jewel) {
				desc += "\n\n";
				desc += this.getItemDesc(sock[i]);
			}
		}
	}

	desc += "$" + unit.gid + ":" + unit.classid + ":" + unit.location + ":" + unit.x + ":" + unit.y + (unit.getFlag(0x400000) ? ":eth" : "");

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
	let items = me.getItemsEx().filter(item => item.isEquipped || item.isEquippedCharm || (item.isInStorage && item.itemType === sdk.itemtype.Rune));

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

	if (!items || !items.length) {
		return;
	}

	items.sort((a, b) => b.itemType - a.itemType);

	for (let i = 0; i < items.length; i += 1) {
		parsedItem = this.logItem(items[i], true, "Player");

		// Always put name on Char Viewer items
		!parsedItem.header && (parsedItem.header = (me.account || "Single Player") + " / " + me.name);
		// Remove itemtype_ prefix from the name
		parsedItem.title = parsedItem.title.substr(parsedItem.title.indexOf("_") + 1);

		switch (items[i].mode) {
		case sdk.itemmode.inStorage:
			if (items[i].isInInventory && items[i].isEquippedCharm) {
				parsedItem.title += " (equipped charm)";
			} else {
				parsedItem.title += " (in stash)";
			}

			break;
		case sdk.itemmode.Equipped:
			parsedItem.title += (items[i].isOnSwap ? " (secondary equipped)" : " (equipped)");

			break;
		}

		string = JSON.stringify(parsedItem);
		finalString += (string + "\n");
	}

	if (Config.UseMerc) {
		let merc = Merc.getMercFix();

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
	print("Item logging done.");
};
