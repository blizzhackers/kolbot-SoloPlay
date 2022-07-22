/**
*  @filename    SoloEvents.js
*  @author      theBGuy
*  @desc        Handle events for Kolbot-SoloPlay
*
*/

const SoloEvents = {
	filePath: "libs/SoloPlay/Threads/EventThread.js",
	check: false,
	inGame: false,
	cloneWalked: false,
	townChicken: false,
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
			D2Bot.printToConsole("Kolbot-SoloPlay :: SoloEvents.outOfGameCheck(): Attempting to join other bots game", 6);
			this.inGame = true;
			me.blockmouse = true;

			delay(2000);
			joinGame(this.gameInfo.gameName, this.gameInfo.gamePass);

			me.blockmouse = false;

			delay(5000);

			while (me.ingame) {
				delay(1000);
			}

			console.log("ÿc8Kolbot-SoloPlayÿc0: End of SoloEvents.outOfGameCheck()");
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
					if (me.area !== sdk.areas.RogueEncampment) {
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
						for (let j = 0; j < 12 || me.findItem((anni ? 603 : 604), 0, -1, 7); j++) {
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

			console.log("Couldnt find player");
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
				console.log(e);
			}
		}

		return profileList;
	},

	getCharacterNames: function () {
		let characterInfo, realm = me.realm.toLowerCase(), charList = [];
		//realm = "useast";	// testing purposes

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
				console.log(e);
			}
		}

		return charList;
	},

	sendToProfile: function (profile, message, mode = 65) {
		if (profile.toLowerCase() !== me.profile.toLowerCase()) {
			sendCopyData(null, profile, mode, JSON.stringify(message));
		}
	},

	sendToList: function (message, mode = 55) {
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

	dropCharm: function (charm) {
		if (!charm || charm === undefined) return false;

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

		!me.inTown && Town.goToTown();

		if (Pather.accessToAct(2) && Pather.checkWP(sdk.areas.ArcaneSanctuary)) {
			Pather.useWaypoint(sdk.areas.ArcaneSanctuary);
			Precast.doPrecast(true);

			if (!Pather.usePortal(null)) {
				console.log("ÿc8Kolbot-SoloPlayÿc1: Failed to move to Palace Cellar");
			}
		} else if (Pather.checkWP(sdk.areas.InnerCloister)) {
			Pather.useWaypoint(sdk.areas.InnerCloister);
			Pather.moveTo(20047, 4898);
		} else {
			Pather.useWaypoint(sdk.areas.ColdPlains);
			Pather.moveToExit(sdk.areas.BloodMoor, true);
			Pather.clearToExit(sdk.areas.BloodMoor, sdk.areas.DenofEvil, true);
			Pather.moveToPreset(me.area, sdk.unittype.Monster, 774, 0, 0, false, true);
		}

		Attack.killTarget(sdk.monsters.DiabloClone);
		Pickit.pickItems();

		let newAnni = Game.getItem(603, sdk.itemmode.onGround);
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
		this.cloneWalked = false;
	},

	customMoveTo: function (x, y, givenSettings) {
		// Abort if dead
		if (me.dead) return false;

		let settings = Object.assign({}, {
			allowTeleport: false,
			allowClearing: false,
			allowTown: false,
			retry: 10,
		}, givenSettings);

		let path, adjustedNode, leaped = false,
			node = {x: x, y: y},
			fail = 0;

		me.cancelUIFlags();

		if (!x || !y) return false; // I don't think this is a fatal error so just return false
		if (typeof x !== "number" || typeof y !== "number") return false;
		if (getDistance(me, x, y) < 2) return true;

		let useTele = settings.allowTeleport && Pather.useTeleport();
		let tpMana = Skill.getManaCost(sdk.skills.Teleport);
		let mLair = [sdk.areas.MaggotLairLvl1, sdk.areas.MaggotLairLvl2, sdk.areas.MaggotLairLvl3].includes(me.area);

		path = getPath(me.area, x, y, me.x, me.y, useTele ? 1 : 0, useTele ? (mLair ? 30 : Pather.teleDistance) : Pather.walkDistance);

		if (!path) return false;

		path.reverse();
		PathDebug.drawPath(path);

		useTele && Config.TeleSwitch && path.length > 5 && me.switchWeapons(Attack.getPrimarySlot() ^ 1);

		while (path.length > 0) {
			// Abort if dead
			if (me.dead) return false;

			me.cancelUIFlags();

			node = path.shift();

			if (getDistance(me, node) > 2) {
				if (mLair) {
					adjustedNode = Pather.getNearestWalkable(node.x, node.y, 15, 3, 0x1 | 0x4 | 0x800 | 0x1000);

					if (adjustedNode) {
						node.x = adjustedNode[0];
						node.y = adjustedNode[1];
					}
				}

				if (useTele && tpMana < me.mp ? Pather.teleportTo(node.x, node.y) : Pather.walkTo(node.x, node.y, (fail > 0 || me.inTown) ? 2 : 4)) {
					if (!me.inTown) {
						if (Pather.recursion) {
							Pather.recursion = false;

							if (getDistance(me, node.x, node.y) > 5) {
								this.customMoveTo(node.x, node.y);
							}

							Pather.recursion = true;
						}

						settings.allowTown && Misc.townCheck();
					}
				} else {
					if (fail > 0 && !useTele && !me.inTown) {
						// Only do this once
						if (fail > 1 && me.getSkill(sdk.skills.LeapAttack, sdk.skills.subindex.SoftPoints) && !leaped) {
							Skill.cast(sdk.skills.LeapAttack, sdk.skills.hand.Right, node.x, node.y);
							leaped = true;
						}
					}

					path = getPath(me.area, x, y, me.x, me.y, useTele ? 1 : 0, useTele ? rand(25, 35) : rand(10, 15));
					if (!path) return false;

					fail += 1;
					path.reverse();
					PathDebug.drawPath(path);
					console.log("move retry " + fail);

					if (fail > 0) {
						Packet.flash(me.gid);

						if (fail >= settings.retry) {
							break;
						}
					}
				}
			}

			delay(5);
		}

		useTele && Config.TeleSwitch && me.switchWeapons(Attack.getPrimarySlot() ^ 1);
		PathDebug.removeHooks();

		return getDistance(me, node.x, node.y) < 5;
	},

	skip: function () {
		let tick = getTickCount();
		myPrint("Attempting baal wave skip");

		// Disable anything that will cause us to stop
		Precast.enabled = false;
		Misc.townEnabled = false;
		Pickit.enabled = false;
		me.barbarian && (Config.FindItem = false);

		// Prep, move to throne entrance
		while (getTickCount() - tick < 6500) {
			this.customMoveTo(15091, 5073, {allowTeleport: true});
		}

		tick = getTickCount();

		// 5 second delay (5000ms), then leave throne
		while (getTickCount() - tick < 5000) {
			this.customMoveTo(15098, 5082, {allowTeleport: true});
		}

		tick = getTickCount();
		this.customMoveTo(15099, 5078);		// Re-enter throne

		// 2 second delay (2000ms)
		while (getTickCount() - tick < 2000) {
			this.customMoveTo(15098, 5082);
		}

		this.customMoveTo(15099, 5078);

		// Re-enable
		Precast.enabled = true;
		Misc.townEnabled = true;
		Pickit.enabled = true;

		let skipWorked = getUnits(sdk.unittype.Monster)
			.some(function (el) {
				return !el.dead && el.attackable && el.classid !== sdk.monsters.ThroneBaal && el.x >= 15070 && el.x <= 15120 &&
                    el.y >= 5000 && el.y <= 5075;
			});
		myPrint("skip " + (skipWorked ? "worked" : "failed"));
	},

	dodge: function () {
		let diablo = Game.getMonster(243);
		// Credit @Jaenster
		let shouldDodge = function (coord) {
			return !!diablo && getUnits(sdk.unittype.Missile)
				// For every missle that isnt from our merc
				.filter((missile) => missile && diablo && diablo.gid === missile.owner)
				// if any
				.some(function (missile) {
					let xoff = Math.abs(coord.x - missile.targetx),
						yoff = Math.abs(coord.y - missile.targety),
						xdist = Math.abs(coord.x - missile.x),
						ydist = Math.abs(coord.y - missile.y);
					// If missile wants to hit is and is close to us
					return xoff < 10 && yoff < 10 && xdist < 15 && ydist < 15;
				});
		};
		
		if (diablo && shouldDodge(me)) {
			let tick = getTickCount();
			let overrides = {allowTeleport: false, allowClearing: false, allowTown: false};
			// Disable anything that will cause us to stop
			Precast.enabled = false;
			Misc.townEnabled = false;
			Pickit.enabled = false;
			console.log("DODGE");
			// Disable things that will cause us to stop
			let dist = me.assassin ? 15 : 3;

			while (getTickCount() - tick < 2000) {
				// Above D
				if (me.y <= diablo.y) {
					// Move east
					me.x <= diablo.x && this.customMoveTo(diablo.x + dist, diablo.y, overrides);

					// Move south
					me.x > diablo.x && this.customMoveTo(diablo.x, diablo.y + dist, overrides);
				}

				// Below D
				if (me.y > diablo.y) {
					// Move west
					me.x >= diablo.x && this.customMoveTo(diablo.x - dist, diablo.y, overrides);

					// Move north
					me.x < diablo.x && this.customMoveTo(diablo.x, diablo.y - dist, overrides);
				}
			}

			// Re-enable
			Precast.enabled = true;
			Misc.townEnabled = true;
			Pickit.enabled = true;
		}
	},

	finishDen: function () {
		Pickit.pickItems();

		// No Tome, or tome has no tps, or no scrolls
		if (!Town.canTpToTown()) {
			Pather.moveToExit([2, 3], true);
			Pather.getWP(3);
			Pather.useWaypoint(sdk.areas.RogueEncampment);
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
			myPrint("Andy bug " + (!me.getQuest(sdk.quest.id.SistersToTheSlaughter, 15) ? "sucessful" : "failed"));
			scriptBroadcast("quit");
		}
	},

	diaEvent: function (bytes = []) {
		if (!bytes.length) return;
		// dia lightning
		if (bytes[0] === 0x4C && bytes[6] === 193) {
			Messaging.sendToScript(SoloEvents.filePath, "dodge");
		}
	},

	skippedWaves: [],

	baalEvent: function (bytes = []) {
		if (!bytes.length) return;
		// baal wave
		if (bytes[0] === 0xA4) {
			if ((me.hell && me.paladin && !Attack.auradin)
				|| me.barbarian
				|| me.gold < 5000
				|| (!me.baal && SetUp.finalBuild !== "Bumper")) {
				let waveMonster = ((bytes[1]) | (bytes[2] << 8));
				let wave = [62, 105, 557, 558, 571].indexOf(waveMonster);
				console.debug("Wave # " + wave);
				if (SoloEvents.skippedWaves.includes(wave)) return;
				let waveBoss = {
					COLENZO: 0,
					ACHMEL: 1,
					BARTUC: 2,
					VENTAR: 3,
					LISTER: 4
				};

				switch (wave) {
				case waveBoss.COLENZO:
					break;
				case waveBoss.ACHMEL:
					if ((me.paladin && !Attack.auradin && me.hell)
						|| (me.barbarian && ((me.charlvl < Config.levelCap && !me.baal)
						|| me.hardcore))) {
						Messaging.sendToScript(SoloEvents.filePath, "skip");
						SoloEvents.skippedWaves.push(wave);
					}

					break;
				case waveBoss.BARTUC:
				case waveBoss.VENTAR:
					break;
				case waveBoss.LISTER:
					if ((me.barbarian && (me.charlvl < Config.levelCap || !me.baal || me.hardcore))
						|| (me.charlvl < Config.levelCap && (me.gold < 5000 || (!me.baal && SetUp.finalBuild !== "Bumper")))) {
						Messaging.sendToScript(SoloEvents.filePath, "skip");
						SoloEvents.skippedWaves.push(wave);
					}

					break;
				}
			}
		}
	},
};
