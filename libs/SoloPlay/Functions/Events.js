/*
*	@filename	Events.js
*	@author		theBGuy
*	@desc		Handle in game events for Kolbot-SoloPlay
*/

var Events = {
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

		while (getTickCount() - tick < 6500) { // prep
			Pather.moveTo(15091, 5073);
		}

		Config.NoTele = true;
		tick = getTickCount();

		while (getTickCount() - tick < 5000) { // 5 second delay (5000ms)
			Pather.moveTo(15098, 5082);	// leave throne
		}

		tick = getTickCount();
		Pather.moveTo(15099, 5078); // reenter throne

		while (getTickCount() - tick < 2000) {	// 2 second delay (2000ms)
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
		
		if (diablo) {
			// Disable things that will cause us to stop
			Attack.stopClear = true;
			Misc.townEnabled = false;

			while (getTickCount() - tick < 2000) {
				if (me.y <= diablo.y) { // above D
					if (me.x <= diablo.x) { //move east
						Pather.moveTo(diablo.x + 3, diablo.y, null, false);
					}

					if (me.x > diablo.x) { //move south
						Pather.moveTo(diablo.x, diablo.y + 3, null, false);
					}
				}

				if (me.y > diablo.y) { // below D
					if (me.x >= diablo.x) { //move west
						Pather.moveTo(diablo.x - 3, diablo.y, null, false);
					}

					if (me.x < diablo.x) { //move north
						Pather.moveTo(diablo.x, diablo.y - 3, null, false);
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
		if ((!me.getItem(518) || me.getItem(518).getStat(70) === 0) || (!me.getItem(529) && !me.getItem(518))) {
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

	getProfiles: function () {
		let profileInfo, realm = me.realm.toLowerCase(), profileList = [];
		realm = "useast";	// testing purposes

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

	gamePacket: function (bytes) {
		let wave, waveMonster;

		switch (bytes[0]) {
		case 0x89: // d2gs unique event
			if (me.area === 8) {	// den lights
				scriptBroadcast('finishDen');
			}

			break;
		case 0x4c: // diablo lightning dodge
			if (me.area === 108) {
				if (bytes[6] === 193) {
					if (!Pather.useTeleport() && (["Poison", "Summon"].indexOf(SetUp.currentBuild) > -1 || me.paladin || me.barbarian || me.druid || me.amazon || me.assassin)) {
						scriptBroadcast('dodge');
					}
				}
			}

			break;	
		case 0xa4: //baalwave
			if ((me.hell && me.paladin && !Attack.IsAuradin) || me.barbarian || me.gold < 5000 || me.druid) {
				waveMonster = ((bytes[1]) | (bytes[2] << 8));
				wave = [62, 105, 557, 558, 571].indexOf(waveMonster);

				switch (wave) {
				case 0: 
					break;
				case 1: 	// Achmel
					if ((me.paladin && !Attack.IsAuradin && me.hell) || (me.barbarian && ((me.charlvl < SetUp.levelCap && !me.baal) || me.playertype))) {
						scriptBroadcast('skip');
					}

					break;
				case 2:
				case 3:
					break;
				case 4: 	// Lister
					if ((me.barbarian && (me.charlvl < SetUp.levelCap || !me.baal || me.playertype)) || (me.charlvl < SetUp.levelCap && me.gold < 5000)) {
						scriptBroadcast('skip');
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
