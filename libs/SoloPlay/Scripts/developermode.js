/**
*	@filename	developermode.js
*	@author		theBGuy
*	@desc		developer mode made easy, run scripts by typing .run scriptname and run functions by typeing .command function name. Example being .run andariel or .command Town.doChores()
*/

function developermode() {
	let done = false;
	let action = false;
	let command = false;
	let runCommand = function (msg) {
		if (msg.length <= 1) {
			return;
		}

		let cmd = msg.split(" ")[0].split(".")[1];
		let msgList = msg.split(" ");

		switch (cmd.toLowerCase()) {
		case "run":
			if (msgList.length < 2) {
				print("ÿc1Missing arguments");
				break;
			}

			action =  msgList[1].toLowerCase();

			break;
		case "done":
			done = true;

			break;
		case "testing":
			scriptBroadcast('testing');

			break;
		case "command":
			if (msgList.length < 2) {
				print("ÿc1Missing arguments");
				break;
			}
			
			command = msgList[1];

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

	print('ÿc8Kolbot-SoloPlayÿc0: starting developermode');
	me.overhead("Started developer mode");
	addEventListener("gamepacketsent", PacketSent);
	Config.Silence = false;

	while (!done) {
		if (action) {
			if (!isIncluded("SoloPlay/Scripts/" + action + ".js")) {
				include("SoloPlay/Scripts/" + action + ".js");
			}

			if (isIncluded("SoloPlay/Scripts/" + action + ".js")) {
				for (let j = 0; j < 5; j += 1) {
					if (this[action]()) {
						break;
					}
				}
			} else {
				print("Failed to include: " + action);
			}

			me.overhead("Done with action");
			action = false;
		}

		if (command) {
			try {
				eval(command);
			} catch (e) {
				print(e);
			}

			me.overhead("Done with action");
			command = false;
		}

		delay(100);
	}

	removeEventListener("gamepacketsent", PacketSent);
	Config.Silence = true;
	
	return true;
}
