/**
*  @filename    EventWorker.js
*  @author      theBGuy
*  @desc        worker thread to handle in game events for Kolbot-SoloPlay
*
*/

/**
 * @todo make this actually work. Issue is if we interrupt a task and peform an event function, once that is over we've desynced from
 * whatever we were orignally doing. In some cases this might be fine to just end whatever it was we were running
 * e.g. after receiving finishDen we could kill the den script and perform the event function. We would be able to continue with the next
 * script normally afterwards. We can't do that for something like diablo lightning dodge or baal wave skipping though, in those cases it
 * might be fine to just continue because in theory we shouldn't be too far from our orginal action so minor desync in physical coordinates
 * but not completly different area. We wouldn't be able to do that for diablo clone though.
 */
(function() {
	// Only load this in global scope
	if (getScript(true).name.toLowerCase() === "libs\\soloplay\\soloplay.js") {
		const Worker = require("../../modules/Worker");

		let tickDelay = 0;
		let [action, profiles] = [[], []];

		const scriptEventWorker = function (msg) {
			if (msg && typeof msg === "string" && msg !== "") {
				switch (msg) {
				case "testing":
				case "finishDen":
				case "dodge":
				case "skip":
				case "killdclone":
					action.push(msg);

					break;
				case "addDiaEvent":
					console.log("Added dia lightning listener");
					addEventListener("gamepacket", SoloEvents.diaEvent);

					break;
				case "removeDiaEvent":
					console.log("Removed dia lightning listener");
					removeEventListener("gamepacket", SoloEvents.diaEvent);

					break;
				case "addBaalEvent":
					console.log("Added baal wave listener");
					addEventListener("gamepacket", SoloEvents.baalEvent);

					break;
				case "removeBaalEvent":
					console.log("Removed baal wave listener");
					removeEventListener("gamepacket", SoloEvents.baalEvent);

					break;
				// ignore common scriptBroadcast messages that aren't relevent to this thread
				case "mule":
				case "muleTorch":
				case "muleAnni":
				case "torch":
				case "crafting":
				case "getMuleMode":
				case "pingquit":
					return;
				}
			}
		};

		const receiveCopyDataWorker = function (id, info) {
			// Torch
			if (id === 55) {
				let { profile, ladder, torchType } = JSON.parse(info);
				console.log("Mesage recived for torch...processing");

				if (profile !== me.profile && (me.hell || (me.nightmare && me.baal)) && me.ladder === ladder) {
					if (torchType === me.classid && !me.findItem(604, 0, null, 7)) {
						console.log("Sent Response");
						SoloEvents.sendToProfile(profile, {profile: me.profile, level: me.charlvl, event: 604});
					}
				}

				return;
			}

			// Annhilus
			if (id === 60) {
				let { profile, ladder } = JSON.parse(info);
				console.log("Mesage recived for Annhilus...processing");

				if (profile !== me.profile && (me.hell || (me.nightmare && me.baal)) && me.ladder === ladder) {
					if (!me.findItem(603, 0, null, 7)) {
						console.log("Sent Response");
						SoloEvents.sendToProfile(profile, {profile: me.profile, level: me.charlvl, event: 603});
					}
				}

				return;
			}

			if (id === 65) {
				let { profile, level, event } = JSON.parse(info);

				console.log("Sucess: profile that contacted me: " + profile + " level of char: " + level);
				SoloEvents.profileResponded = true;
				profiles.push({profile: profile, level: level, event: event});
				tickDelay += 1000;
			}

			if (id === 70) {
				Messaging.sendToScript("D2BotSoloPlay.dbj", "event");
				delay(100 + me.ping);
				scriptBroadcast("quit");
			}
		};

		addEventListener("scriptmsg", scriptEventWorker);
		// should this just be added to the starter? would remove needing 3 copydata event listeners (entry, default, and here)
		addEventListener("copydata", receiveCopyDataWorker);

		let waitTick = getTickCount();

		// Start
		Worker.runInBackground.EventWorker = function () {
			if (getTickCount() - waitTick < 100 || SoloEvents.townChicken.running) return true;
			waitTick = getTickCount();

			try {
				while (action.length) {
					try {
						SoloEvents[action.shift()]();
					} catch (e) {
						console.log(e);
					}
				}

				if (profiles.length > 0) {
					let tick = getTickCount();

					while (getTickCount() - tick < tickDelay) {
						delay(500);
					}

					let lowestLevelProf = profiles.sort((a, b) => a.level - b.level).first();

					SoloEvents.sendToProfile(lowestLevelProf.profile, lowestLevelProf.event, 70);
					D2Bot.joinMe(lowestLevelProf.profile, me.gamename.toLowerCase(), "", me.gamepassword.toLowerCase(), true);
					profiles = [];
				}
			} catch (e) {
				D2Bot.printToConsole(JSON.stringify(e));
				console.log(e);
			}

			return true;
		};

		try {
			console.log("ÿc8Kolbot-SoloPlayÿc0: Start EventThread");
			console.log(Worker.runInBackground);
		} catch (e) {
			console.error(e);
		}
	}
})();
