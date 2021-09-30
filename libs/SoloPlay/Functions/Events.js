/*
*	@filename	Events.js
*	@author		theBGuy
*	@desc		Handle events for Kolbot-SoloPlay
*/

var Events = {
	check: false,
	inGame: false,
	profileResponded: false,
	gameInfo: {
		gameName: "",
		gamePass: "",
	},

	outOfGameCheck: function () {
		if (!this.check) {
			return false;
		}

		if (this.gameInfo.gameName.length > 0) {
			D2Bot.printToConsole("Kolbot-SoloPlay :: Events.outOfGameCheck(): Attempting to join other bots game", 6);
			this.inGame = true;
			me.blockmouse = true;

			delay(2000);
			joinGame(this.gameInfo.gameName, this.gameInfo.gamePass);

			me.blockmouse = false;

			delay(5000);

			while (me.ingame) {
				delay(1000);
			}

			print("ÿc8Kolbot-SoloPlayÿc0: End of Events.outOfGameCheck()");
			this.inGame = false;
			this.check = false;
			this.gameInfo.gameName = "";
			this.gameInfo.gamePass = "";

			return true;
		}

		return false;
	},

	inGameCheck: function () {
		if (me.ingame && me.hell && !me.classic && Misc.getPlayerCount() > 1) {
			let possibleChars = this.getCharacterNames();

			for (let i = 0; i < possibleChars.length; i++) {
				if (Misc.findPlayer(possibleChars[i].toLowerCase())) {
					if (me.area !== 1) {
						Town.goToTown(1);
					}

					Town.move("stash");

					let torch, anni, tick = getTickCount();

					me.overhead("Waiting for charm to drop");
					while (getTickCount() - tick < 120 * 1000) {
						anni = me.findItem(603, 3, null, 7);
						torch = me.findItem(604, 3, null, 7);

						if (torch || anni) {
							break;
						}
					}

					if (torch || anni) {
						for (let i = 0; i < 12 || me.findItem((anni ? 603 : 604), 0, -1, 7); i++) {
							Town.move("stash");
							me.overhead("Looking for " + (anni ? "Annihilus" : "Torch"));
							Pickit.pickItems();
							delay(10000);	// 10 seconds
						}
					} else {
						me.overhead("No charm on ground");
					}

					quit();
					return true;
				}
			}

			print("Couldnt find player");
		}

		return false;
	},

	getProfiles: function () {
		let profileInfo, realm = me.realm.toLowerCase(), profileList = [];
		//realm = "useast";	// testing purposes

		if (!FileTools.exists("logs/Kolbot-SoloPlay/" + realm)) {
			return profileList;
		}

		let files = dopen("logs/Kolbot-SoloPlay/" + realm + "/").getFiles();

		for (let i = 0; i < files.length; i++) {
			try {
				profileInfo = Developer.readObj("logs/Kolbot-SoloPlay/" + realm + "/" + files[i]);
				if (profileList.indexOf(profileInfo.profile) === -1) {
					profileList.push(profileInfo.profile);
				}
			} catch (e) {
				print(e);
			}
		}

		return profileList;
	},

	getCharacterNames: function () {
		let characterInfo, realm = me.realm.toLowerCase(), charList = [];
		realm = "useast";	// testing purposes

		if (!FileTools.exists("logs/Kolbot-SoloPlay/" + realm)) {
			return profileList;
		}

		let files = dopen("logs/Kolbot-SoloPlay/" + realm + "/").getFiles();

		for (let i = 0; i < files.length; i++) {
			try {
				characterInfo = Developer.readObj("logs/Kolbot-SoloPlay/" + realm + "/" + files[i]);
				if (charList.indexOf(characterInfo.charName) === -1) {
					charList.push(characterInfo.charName);
				}
			} catch (e) {
				print(e);
			}
		}

		return charList;
	},

	sendToProfile: function (profile, message, mode=65) {
		if (profile.toLowerCase() !== me.profile.toLowerCase()) {
			sendCopyData(null, profile, mode, JSON.stringify(message));
		}
	},

	sendToList: function (message, mode=55) {
		let profiles = this.getProfiles();

		if (!profiles || profiles === undefined) {
			return false;
		}

		return profiles.forEach((profileName) => {
			if (profileName.toLowerCase() !== me.profile.toLowerCase()) {
				sendCopyData(null, profileName, mode, JSON.stringify(message));
			}
		});
	},

	testing: function () {
		if (!me.inTown) {
			Town.goToTown(1);
		}

		Pather.useWaypoint(3);
		Pather.clearToExit(3, 2, true);
		Pather.clearToExit(2, 8, true);
		Attack.clearLevel();
		Town.goToTown();

		return true;
	},

	dropCharm: function (charm) {
		if (!charm || charm === undefined) {
			return false;
		}

		D2Bot.printToConsole("Kolbot-SoloPlay :: Dropping " + charm.name, 8);
		let orginalLocation = {act: me.act, area: me.area, x: me.x, y: me.y};

		if (!me.inTown) {
			Town.goToTown(1);
			Town.move("stash");
			charm.drop();
		}

		if (me.act !== orginalLocation.act) {
			Town.goToTown(orginalLocation.act);
		}

		Town.move("portalspot");

		if (!Pather.usePortal(orginalLocation.area)) {
			Pather.journeyTo(orginalLocation.area);
		}

		return Pather.moveTo(orginalLocation.x, orginalLocation.y);
	},

	killdclone: function () {
		D2Bot.printToConsole("Kolbot-SoloPlay :: Trying to kill DClone.", 8);
		let orginalLocation = {area: me.area, x: me.x, y: me.y};

		if (Pather.accessToAct(2) && Pather.checkWP(sdk.areas.ArcaneSanctuary)) {
			Pather.useWaypoint(sdk.areas.ArcaneSanctuary);
			Precast.doPrecast(true);

			if (!Pather.usePortal(null)) {
				print("ÿc8Kolbot-SoloPlayÿc1: Failed to move to Palace Cellar");
			}
		} else if (Pather.checkWP(sdk.areas.InnerCloister)) {
			Pather.moveTo(20047, 4898);
		} else {
			Pather.useWaypoint(sdk.areas.RogueEncampment);
			Pather.moveToExit(sdk.areas.ColdPlains, true);
			Pather.clearToExit(sdk.areas.ColdPlains, sdk.areas.DenofEvil, true);
			Pather.moveToPreset(me.area, 1, 774, 0, 0, false, true);
		}

		Attack.killTarget(333);
		Pickit.pickItems();

		let newAnni = getUnit(4, 603, 3);
		let oldAnni = me.findItem(603, 0, -1, 7);

		if (newAnni && oldAnni) {
			this.sendToList({profile: me.profile, ladder: 32}, 60);

			let tick = getTickCount();

			while (getTickCount() - tick < 10000) {
				me.overhead("Waiting to see if I get a response from other profiles");

				if (this.profileResponded) {
					me.overhead("Recieved response, dropping old Annihilus in Rogue Encampment");
					break;
				}

				delay(50);
			}

			if (newAnni && oldAnni && this.profileResponded) {
				this.dropCharm(oldAnni);
			} else {
				me.overhead("No response from other profiles");
			}

			this.profileResponded = false;
			Pickit.pickItems();
		}

		if ((newAnni && oldAnni && !this.profileResponded) && AutoMule.getInfo() && AutoMule.getInfo().hasOwnProperty("torchMuleInfo")) {
			scriptBroadcast("muleAnni");
		}

		// Move back to where we orignally where
		Pather.journeyTo(orginalLocation.area);
		Pather.moveTo(orginalLocation.x, orginalLocation.y);
	},

	skip: function () {
		let oldPickRange = Config.PickRange;

		// Disable anything that will cause us to stop
		Precast.enabled = false;
		Misc.townEnabled = false;
		Config.PickRange = 0;
		if (me.barbarian) {
			Config.FindItem = false;
		}

		let tick = getTickCount();
		me.overhead("Attempting baal wave skip");

		// Prep, move to throne entrance
		while (getTickCount() - tick < 6500) {
			Pather.moveTo(15091, 5073);
		}

		Config.NoTele = true;
		tick = getTickCount();

		// 5 second delay (5000ms), then leave throne
		while (getTickCount() - tick < 5000) {
			Pather.moveTo(15098, 5082);
		}

		tick = getTickCount();
		Pather.moveTo(15099, 5078);		// Re-enter throne

		// 2 second delay (2000ms)
		while (getTickCount() - tick < 2000) {
			Pather.moveTo(15098, 5082);
		}

		Pather.moveTo(15099, 5078);

		// Re-enable
		Config.NoTele = false;
		Config.PickRange = oldPickRange;
		Precast.enabled = true;
		Misc.townEnabled = true;
	},

	dodge: function () {
		let diablo = getUnit(1, 243);
		let tick = getTickCount();
		// Credit @Jaenster
		let shouldDodge = function (coord) {
			return diablo && getUnits(3)
				// For every missle that isnt from our merc
				.filter(function (missile) { return missile && diablo && diablo.gid === missile.owner; })
				// if any
				.some(function (missile) {
				var xoff = Math.abs(coord.x - missile.targetx), yoff = Math.abs(coord.y - missile.targety), xdist = Math.abs(coord.x - missile.x), ydist = Math.abs(coord.y - missile.y);
				// If missile wants to hit is and is close to us
				return xoff < 10 && yoff < 10 && xdist < 15 && ydist < 15;
			});
		};
		
		if (diablo && shouldDodge(me)) {
			print("DODGE");
			// Disable things that will cause us to stop
			Attack.stopClear = true;
			Misc.townEnabled = false;
			let dist = me.assassin ? 15 : 3;

			while (getTickCount() - tick < 2000) {
				// Above D
				if (me.y <= diablo.y) {
					// Move east
					if (me.x <= diablo.x) {
						Pather.moveTo(diablo.x + dist, diablo.y, null, false);
					}

					// Move south
					if (me.x > diablo.x) {
						Pather.moveTo(diablo.x, diablo.y + dist, null, false);
					}
				}

				// Below D
				if (me.y > diablo.y) {
					// Move west
					if (me.x >= diablo.x) {
						Pather.moveTo(diablo.x - dist, diablo.y, null, false);
					}

					// Move north
					if (me.x < diablo.x) {
						Pather.moveTo(diablo.x, diablo.y - dist, null, false);
					}
				}
			}

			// Re-enable
			Attack.stopClear = false;
			Misc.townEnabled = true;
		}
	},

	finishDen: function () {
		Pickit.pickItems();

		// No Tome, or tome has no tps, or no scrolls
		if (!Town.canTpToTown()) {
			Pather.moveToExit([2, 3], true);
			Pather.getWP(3);
			Pather.useWaypoint(1);
		} else {
			Town.goToTown();
		}

		Town.npcInteract("akara");
	},

	bugAndy: function () {
		Town.goToTown();
		Pather.changeAct();
		delay(2000 + me.ping);

		// Now check my area
		if (me.act === 2) {
			// Act change sucessful, Andy has been bugged
			print("ÿc8Kolbot-SoloPlayÿc0: Andy bug " + (!me.getQuest(6, 15) ? "sucessful" : "failed"));
			me.overhead("Andy bug " + (!me.getQuest(6, 15) ? "sucessful" : "failed"));
			scriptBroadcast('quit');
		}
	},

	gamePacket: function (bytes) {
		let wave, waveMonster;

		switch (bytes[0]) {
		case 0x89: // d2gs unique event
			if (me.area === sdk.areas.DenofEvil) {
				Messaging.sendToScript("libs/SoloPlay/Tools/EventThread.js", 'finishDen');
			}

			break;
		case 0x4c: // diablo lightning dodge
			if (me.area === sdk.areas.ChaosSanctuary) {
				if (bytes[6] === 193) {
					if (!Pather.useTeleport() && (["Poison", "Summon"].indexOf(SetUp.currentBuild) > -1 || me.paladin || me.barbarian || me.druid || me.amazon || me.assassin)) {
						Messaging.sendToScript("libs/SoloPlay/Tools/EventThread.js", 'dodge');
					}
				}
			}

			break;	
		case 0xa4: //baalwave
			if ((me.hell && me.paladin && !Attack.IsAuradin) || me.barbarian || me.gold < 5000 || (!me.baal && SetUp.finalBuild !== "Bumper")) {
				waveMonster = ((bytes[1]) | (bytes[2] << 8));
				wave = [62, 105, 557, 558, 571].indexOf(waveMonster);

				switch (wave) {
				case 0: 
					break;
				case 1: 	// Achmel
					if ((me.paladin && !Attack.IsAuradin && me.hell) || (me.barbarian && ((me.charlvl < SetUp.levelCap && !me.baal) || me.playertype))) {
						Messaging.sendToScript("libs/SoloPlay/Tools/EventThread.js", 'skip');
					}

					break;
				case 2:
				case 3:
					break;
				case 4: 	// Lister
					if ((me.barbarian && (me.charlvl < SetUp.levelCap || !me.baal || me.playertype)) || (me.charlvl < SetUp.levelCap && (me.gold < 5000 || (!me.baal && SetUp.finalBuild !== "Bumper")))) {
						Messaging.sendToScript("libs/SoloPlay/Tools/EventThread.js", 'skip');
					}

					break;
				}
			}

			break;
		default:
			break;
		}
	},
};
