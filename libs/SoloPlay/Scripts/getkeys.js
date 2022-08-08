/**
*  @filename    getkeys.js
*  @author      theBGuy
*  @desc        Run key bosses
*
*/

function getkeys() {
	Town.doChores();

	if (!me.findItems(sdk.items.quest.KeyofTerror) || me.findItems(sdk.items.quest.KeyofTerror).length < 3) {
		try {
			if (includeIfNotIncluded("SoloPlay/Scripts/countess.js")) {
				this.countess();
			}
		} catch (countessError) {
			console.log("ÿc8Kolbot-SoloPlayÿc0: Countess failed");
		}
	}

	if (!me.findItems(sdk.items.quest.KeyofHate) || me.findItems(sdk.items.quest.KeyofHate).length < 3) {
		try {
			if (includeIfNotIncluded("SoloPlay/Scripts/summoner.js")) {
				this.summoner();
			}
		} catch (summonerError) {
			console.log("ÿc8Kolbot-SoloPlayÿc0: Summoner failed");
		}
	}

	if (!me.findItems(sdk.items.quest.KeyofDestruction) || me.findItems(sdk.items.quest.KeyofDestruction).length < 3) {
		try {
			if (includeIfNotIncluded("SoloPlay/Scripts/nith.js")) {
				this.nith();
			}
		} catch (nihlathakError) {
			console.log("ÿc8Kolbot-SoloPlayÿc0: Nihlathak failed");
		}
	}

	return true;
}
