/**
*  @filename    OOGOverrides.js
*  @author      theBGuy
*  @credit      isid0re
*  @desc        OOG.js fixes to improve functionality
*
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
			ControlAction.timeoutDelay("Character Name exists: " + info.charName + ". Making new Name.", 5e3);
			info.charName = NameGen();
			D2Bot.setProfile(null, null, info.charName, "Normal");
			delay(500);
			Controls.OkCentered.click();

			break;
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
	let singlePlayer = ![sdk.game.gametype.OpenBattlenet, sdk.game.gametype.BattleNet].includes(Profile().type);
	// offline doesn't have a character limit cap
	let cap = singlePlayer ? 999 : 24;
	let tick = getTickCount();
	let firstCheck;

	while (getLocation() !== sdk.game.locations.CharSelect) {
		if (getTickCount() - tick >= 5000) {
			break;
		}

		delay(25);
	}

	if (getLocation() === sdk.game.locations.CharSelectConnecting) {
		if (!Starter.charSelectConnecting()) {
			D2Bot.printToConsole("Stuck at connecting screen");
			D2Bot.restart();
		}
	}

	// start from beginning of the char list
	sendKey(0x24);

	while (getLocation() === sdk.game.locations.CharSelect && count < cap) {
		let control = Controls.CharSelectCharInfo0.control;

		if (control) {
			firstCheck = control.getText();
			do {
				let text = control.getText();

				if (text instanceof Array && typeof text[1] === "string") {
					count++;

					if (text[1].toLowerCase() === info.charName.toLowerCase()) {
						return true;
					}
				}
			} while (count < cap && control.getNext());
		}

		// check for additional characters up to 24 (online) or 999 offline (no character limit cap)
		if (count > 0 && count % 8 === 0) {
			if (Controls.CharSelectChar6.click()) {
				console.debug("scroll, count: " + count);
				me.blockMouse = true;

				sendKey(0x28);
				sendKey(0x28);
				sendKey(0x28);
				sendKey(0x28);

				me.blockMouse = false;

				let check = Controls.CharSelectCharInfo0.control;

				if (!!firstCheck && !!check) {
					let nameCheck = check.getText();

					if (firstCheck[1].toLowerCase() === nameCheck[1].toLowerCase()) {
						return false;
					}
				}
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

ControlAction.loginAccount = function (info) {
	me.blockMouse = true;

	let locTick,
		realms = {
			"uswest": 0,
			"useast": 1,
			"asia": 2,
			"europe": 3
		};

	let tick = getTickCount();

	MainLoop:
	while (true) {
		switch (getLocation()) {
		case sdk.game.locations.PreSplash:
			break;
		case sdk.game.locations.MainMenu:
			info.realm && ControlAction.clickRealm(realms[info.realm]);
			Controls.BattleNet.click();

			break;
		case sdk.game.locations.Login:
			Controls.LoginUsername.setText(info.account);
			Controls.LoginPassword.setText(info.password);
			Controls.Login.click();

			break;
		case sdk.game.locations.LoginUnableToConnect:
		case sdk.game.locations.RealmDown:
			// Unable to connect, let the caller handle it.
			me.blockMouse = false;

			return false;
		case sdk.game.locations.CharSelect:
			break MainLoop;
		case sdk.game.locations.SplashScreen:
			Controls.SplashScreen.click();

			break;
		case sdk.game.locations.CharSelectPleaseWait:
		case sdk.game.locations.MainMenuConnecting:
		case sdk.game.locations.CharSelectConnecting:
			break;
		case sdk.game.locations.CharSelectNoChars:
			// make sure we're not on connecting screen
			locTick = getTickCount();

			while (getTickCount() - locTick < 3000 && getLocation() === sdk.game.locations.CharSelectNoChars) {
				delay(25);
			}

			if (getLocation() === sdk.game.locations.CharSelectConnecting) {
				break;
			}

			break MainLoop; // break if we're sure we're on empty char screen
		case sdk.game.locations.Lobby:
		case sdk.game.locations.LobbyChat:
			// somehow we are in the lobby?
			Control.LobbyQuit.click();
			
			break;
		default:
			print(getLocation());

			me.blockMouse = false;

			return false;
		}

		if (getTickCount() - tick >= 20000) {
			return false;
		}

		delay(100);
	}

	delay(1000);

	me.blockMouse = false;

	return getLocation() === sdk.game.locations.CharSelect || getLocation() === sdk.game.locations.CharSelectNoChars;
};

Starter.randomNumberString = function (len) {
	len === undefined && (len = rand(2, 5));

	let rval = "",
		vals = "0123456789";

	for (let i = 0; i < len; i += 1) {
		rval += vals[rand(0, vals.length - 1)];
	}

	return rval;
};

Starter.charSelectConnecting = function () {
	if (getLocation() === sdk.game.locations.CharSelectConnecting) {
		// bugged? lets see if we can unbug it
		// Click create char button on infinite "connecting" screen
		Controls.CharSelectCreate.click();
		delay(1000);
		
		Controls.CharSelectExit.click();
		delay(1000);

		return (getLocation() !== sdk.game.locations.CharSelectConnecting);
	} else {
		return true;
	}
};
