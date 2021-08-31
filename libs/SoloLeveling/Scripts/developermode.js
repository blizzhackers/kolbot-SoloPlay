/**
*	@filename	developermode.js
*	@author		theBGuy
*	@desc		developer mode made easy
*/

function developermode() {
	let done = false;
	let runCommand = function (msg) {
		if (msg.length <= 1) {
			return;
		}

		let cmd = msg.split(" ")[0].split(".")[1];
		let msgList = msg.split(" ");
		let script = "";

		switch (cmd.toLowerCase()) {
		case "run":
			if (msgList.length < 2) {
				print("ÿc1Missing arguments");
				break;
			}

			script =  msgList[1].toLowerCase();

			if (!isIncluded("SoloLeveling/Scripts/" + script + ".js")) {
				include("SoloLeveling/Scripts/" + script + ".js");
			}

			if (isIncluded("SoloLeveling/Scripts/" + script + ".js")) {
				for (let j = 0; j < 5; j += 1) {
					if (this[script]()) {
						break;
					}
				}
			} else {
				print("Failed to include: " + script);
			}

			break;
		case "done":
			done = true;

			break;
		}
	};

	// Sent packet handler
	let PacketSent = function (pBytes) {
		let ID = pBytes[0].toString(16);

		if (ID === "15") { //Block all commands or irc chat from being sent to server
			if (pBytes[3] === 46) {
				let str = "";

				for (let b = 3; b < pBytes.length - 3; b++) {
					str += String.fromCharCode(pBytes[b]);
				}

				if (pBytes[3] === 46) {
					runCommand(str);
					return true;
				}
			}
		}

		return false;
	};

	print('ÿc9GuysSoloLevelingÿc0: starting developermode');
	me.overhead("Started developer mode");
	addEventListener("gamepacketsent", PacketSent);
	Config.Silence = false;

	while (!done) {
		delay(100);
	}

	removeEventListener("gamepacketsent", PacketSent);
	Config.Silence = true;
	return true;
}
