/*
*	@filename	OOGOverrides.js
*	@author		theBGuy
*	@desc		OOG.js fixes to improve functionality
* 	@credits	kolton, D3STROY3R, isid0re
*/

!isIncluded("OOG.js") && include("OOG.js");

ControlAction.makeCharacter = function (info) {
	me.blockMouse = true;
	!info.charClass && (info.charClass = "barbarian");

	let clickCoords = [];

	// cycle until in lobby
	while (getLocation() !== sdk.game.locations.Lobby) {
		switch (getLocation()) {
		case sdk.game.locations.CharSelect:
		case sdk.game.locations.CharSelectConnecting:
		case sdk.game.locations.CharSelectNoChars:
			let control = Controls.CharSelectCreate.control;

			// Create Character greyed out
			if (control && control.disabled === sdk.game.controls.Disabled) {
				me.blockMouse = false;

				return false;
			}

			Controls.CharSelectCreate.click();

			break;
		case sdk.game.locations.LobbyPleaseWait:
			D2Bot.restart(); // single player error on finding character

			break;
		case sdk.game.locations.CharacterCreate:
			switch (info.charClass) {
			case "barbarian":
				clickCoords = [400, 280];

				break;
			case "amazon":
				clickCoords = [100, 280];

				break;
			case "necromancer":
				clickCoords = [300, 290];

				break;
			case "sorceress":
				clickCoords = [620, 270];

				break;
			case "assassin":
				clickCoords = [200, 280];

				break;
			case "druid":
				clickCoords = [700, 280];

				break;
			case "paladin":
				clickCoords = [521, 260];

				break;
			}

			// coords:
			// zon: 100, 280
			// barb: 400, 280
			// necro: 300, 290
			// sin: 200, 280
			// paladin: 521 260
			// sorc: 620, 270
			// druid: 700, 280

			getControl().click(clickCoords[0], clickCoords[1]);
			delay(500);

			break;
		case sdk.game.locations.NewCharSelected:
			// hardcore char warning
			if (Controls.CharCreateHCWarningOk.control) {
				Controls.CharCreateHCWarningOk.click();
			} else {
				Controls.CharCreateCharName.setText(info.charName);

				if (!info.expansion) {
					switch (info.charClass) {
					case "druid":
					case "assassin":
						D2Bot.printToConsole("Error in profile name. Expansion characters cannot be made in classic", 9);
						D2Bot.stop();

						break;
					default:
						break;
					}

					Controls.CharCreateExpansion.click();
				}

				!info.ladder && Controls.CharCreateLadder.click();
				info.hardcore && Controls.CharCreateHardcore.click();
				Controls.CreateNewAccountOk.click();
			}

			break;
		case sdk.game.locations.OkCenteredErrorPopUp:
			// char name exists (text box 4, 268, 320, 264, 120)
			D2Bot.updateStatus("Character Name exists. Making new Name");
			D2Bot.printToConsole("Character Name exists. Making new Name");
			info.charName = NameGen();
			D2Bot.setProfile(null, null, info.charName, "Normal");
			delay(500);
			Controls.OkCentered.click();
			Controls.CharSelectExit.click();

			me.blockMouse = false;

			return false;
		default:
			break;
		}

		// Singleplayer loop break fix.
		if (me.ingame) {
			break;
		}

		delay(500);
	}

	me.blockMouse = false;

	return true;
};

ControlAction.findCharacter = function (info) {
	let count = 0;
	let tick = getTickCount();

	while (getLocation() !== sdk.game.locations.CharSelect) {
		if (getTickCount() - tick >= 5000) {
			break;
		}

		delay(25);
	}

	getLocation() === sdk.game.locations.CharSelectConnecting && D2Bot.restart();

	// start from beginning of the char list
	sendKey(0x24);

	while (getLocation() === sdk.game.locations.CharSelect && count < 24) {
		let control = Controls.CharSelectCharInfo0.control;

		if (control) {
			do {
				let text = control.getText();

				if (text instanceof Array && typeof text[1] === "string") {
					count++;

					if (text[1].toLowerCase() === info.charName.toLowerCase()) {
						return true;
					}
				}
			} while (count < 24 && control.getNext());
		}

		// check for additional characters up to 24
		if (count === 8 || count === 16) {
			if (Controls.CharSelectChar6.click()) {
				me.blockMouse = true;

				sendKey(0x28);
				sendKey(0x28);
				sendKey(0x28);
				sendKey(0x28);

				me.blockMouse = false;
			}
		} else {
			// no further check necessary
			break;
		}
	}

	return false;
};

// need open bnet check
ControlAction.makeAccount = function (info) {
	me.blockMouse = true;

	let tick,
		realms = {
			"uswest": 0,
			"useast": 1,
			"asia": 2,
			"europe": 3
		};

	// cycle until in empty char screen
	while (getLocation() !== sdk.game.locations.CharSelectNoChars) {
		switch (getLocation()) {
		case sdk.game.locations.MainMenu:
			ControlAction.clickRealm(realms[info.realm]);
			Controls.BattleNet.click();

			break;
		case sdk.game.locations.Login:
			Controls.CreateNewAccount.click();

			break;
		case sdk.game.locations.LoginError:
		case sdk.game.locations.LoginUnableToConnect:
			return false;
		case sdk.game.locations.SplashScreen:
			Controls.SplashScreen.click();

			break;
		case sdk.game.locations.MainMenuConnecting:
			tick = getTickCount();

			while (getLocation() === sdk.game.locations.MainMenuConnecting) {
				if (getTickCount() - tick > 10000) {
					Controls.LoginCancelWait.click();
				}

				delay(500);
			}

			break;
		case sdk.game.locations.CharacterCreate:
			Controls.CharSelectExit.click();

			break;
		case sdk.game.locations.OkCenteredErrorPopUp:
			info.account = "";
			info.password = "";
			D2Bot.setProfile(info.account, info.password);
			D2Bot.restart(true);

			break;
		case sdk.game.locations.TermsOfUse:
			Controls.TermsOfUseAgree.click();

			break;
		case sdk.game.locations.CreateNewAccount:
			Controls.CreateNewAccountName.setText(info.account);
			Controls.CreateNewAccountPassword.setText(info.password);
			Controls.CreateNewAccountConfirmPassword.setText(info.password);
			Controls.CreateNewAccountOk.click();

			break;
		case sdk.game.locations.PleaseRead:
			Controls.PleaseReadOk.click();

			break;
		case sdk.game.locations.RegisterEmail:
			Controls.EmailDontRegisterContinue.control ? Controls.EmailDontRegisterContinue.click() : Controls.EmailDontRegister.click();

			break;
		default:
			break;
		}

		delay(100);
	}

	me.blockMouse = false;

	return true;
};

ControlAction.deleteAndRemakeChar = function (info) {
	me.blockMouse = true;

	ControlAction.findCharacter(info);

	MainLoop:
	// Cycle until in lobby
	while (getLocation() !== sdk.game.locations.Lobby) {
		switch (getLocation()) {
		case sdk.game.locations.CharSelect:
			let control = Controls.CharSelectCharInfo0.control;

			if (control) {
				do {
					let text = control.getText();

					if (text instanceof Array && typeof text[1] === "string" && text[1].toLowerCase() === info.charName.toLowerCase()) {
						control.click();
						Controls.CharSelectDelete.click();
						delay(500);
						Controls.CharDeleteYes.click();

						break MainLoop;
					}
				} while (control.getNext());
			}

			break;
		case sdk.game.locations.CharSelectNoChars:
			break MainLoop;

		case sdk.game.locations.Disconnected:
		case sdk.game.locations.OkCenteredErrorPopUp:
			me.blockMouse = false;

			return false;
		default:
			break;
		}

		delay(100);
	}

	me.blockMouse = false;

	// Delete old files - leaving csv file's for now as I don't think they interfere with the overlay
	CharData.delete(true);
	DataFile.create();
	CharData.updateData("me", "finalBuild", Starter.profileInfo.tag);
	Developer.logPerformance && Tracker.initialize();
	D2Bot.printToConsole("Deleted: " + info.charName + ". Now remaking...", 6);
	ControlAction.makeCharacter(Starter.profileInfo);

	return true;
};

ControlAction.saveInfo = function (info) {
	// Data-file already exists
	if (FileTools.exists("logs/Kolbot-SoloPlay/" + info.realm + "/" + info.charClass + "-" + info.charClass + "-" + info.charName + ".json")) {
		return;
	}

	let folder;

	if (!FileTools.exists("logs/Kolbot-SoloPlay")) {
		folder = dopen("logs");
		folder.create("Kolbot-SoloPlay");
	}

	if (!FileTools.exists("logs/Kolbot-SoloPlay/" + info.realm)) {
		folder = dopen("logs/Kolbot-SoloPlay");
		folder.create(info.realm);
	}

	if (!FileTools.exists("logs/Kolbot-SoloPlay/" + info.realm + "/" + info.charClass + "-" + info.charName + ".json")) {
		FileTools.writeText("logs/Kolbot-SoloPlay/" + info.realm + "/" + info.charClass + "-" + info.charName + ".json", JSON.stringify(info));
	}
};
