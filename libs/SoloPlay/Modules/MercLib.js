/* eslint-disable no-sparse-arrays */
/* eslint-disable eqeqeq */
/**
 *   @filename   Merc.js
 *   @author     dzik
 *   @desc       Merc parsing with hire function.
 *               Require BigInt.js library from here - https://pastebin.com/36440CrY
 Original library can be found here - https://github.com/Evgenus/BigInt
 *               All files should be saved into libs folder.
 *
 *
 *     Jaenster; changed it around a bit to make BigInt not mess with global scope
 *               + this exports stuff
 *               + proper modern classes
 */
(function (factory) {
	if (typeof module === "object" && typeof module.exports === "object") {
		let v = factory(require, exports);
		if (v !== undefined) module.exports = v;
	} else if (typeof define === "function" && define.amd) {
		define(["require", "exports", "./bigInt"], factory);
	}
})(function (require, exports) {
	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.mercPacket = exports.Merc = exports.Rnd = void 0;
	let bigInt_1 = require("./bigInt");
	/// The actual Merc.js code of dzik
	function leftShift(val, shift) {
		let l;
		while (shift >= bigInt_1.bpe) {
			l = Math.ceil((bigInt_1.bitSize(val) + bigInt_1.bpe - 1) / bigInt_1.bpe) + 1;
			if (val.length < l) {
				val = bigInt_1.expand(val, l);
			}
			bigInt_1.leftShift_(val, bigInt_1.bpe - 1);
			shift -= bigInt_1.bpe - 1;
		}
		if (shift > 0) {
			l = Math.ceil((bigInt_1.bitSize(val) + bigInt_1.bpe - 1) / bigInt_1.bpe) + 1;
			if (val.length < l) {
				val = bigInt_1.expand(val, l);
			}
			bigInt_1.leftShift_(val, shift);
		}
		return val;
	}
	function rightShift(val, shift) {
		while (shift >= bigInt_1.bpe) {
			bigInt_1.rightShift_(val, bigInt_1.bpe - 1);
			shift -= bigInt_1.bpe - 1;
		}
		if (shift > 0) {
			bigInt_1.rightShift_(val, shift);
		}
	}
	let Rnd = /** @class */ (function () {
		function Rnd(seed) {
			let tmp = bigInt_1.int2bigInt(666, 16, 0);
			tmp = leftShift(tmp, 32);
			this.val = bigInt_1.add(tmp, bigInt_1.str2bigInt(seed.toString(16), 16, 33));
		}
		Rnd.prototype.roll = function () {
			let tmp = bigInt_1.modInt(this.val, 0x100000000);
			let tmp2 = bigInt_1.mult(bigInt_1.str2bigInt(tmp.toString(16), 16, 33), bigInt_1.int2bigInt(1791398085, 33, 0));
			rightShift(this.val, 32);
			let res = bigInt_1.add(tmp2, this.val);
			let rescopy = bigInt_1.dup(res);
			rightShift(rescopy, 64);
			res = bigInt_1.sub(res, rescopy);
			this.val = res;
		};
		Rnd.prototype.get = function () {
			return bigInt_1.modInt(this.val, 0x100000000);
		};
		return Rnd;
	}());
	exports.Rnd = Rnd;
	let Merc = /** @class */ (function () {
		function Merc(name, seed) {
			this.id = name;
			this.name = getLocaleString(name);
			const getTable = function () {
				let list = [];
				let level = 0;
				let act = checkActByName(name);
				for (let i = 0; i < MercTable.length; i++) {
					if (MercTable[i][5] == act && MercTable[i][6] == me.diff + 1 && MercTable[i][2] == me.gametype * 100) {
						if (level == 0 || MercTable[i][7] == level) {
							list.push(MercTable[i]);
							level = MercTable[i][7];
						}
					}
				}
				return list;
			};
			const getMercInfo = function (index, infoindex) {
				if (validMercTable[index].hasOwnProperty(infoindex)) {
					return validMercTable[index][infoindex];
				}

				return false;
			};
			const checkActByName = function (name) {
				if (name >= 3411 && name <= 3451) {
					return 1;

				} else if (name >= 1019 && name <= 1039) {
					return 2;
				} else if (name >= 1040 && name <= 1059) {
					return 3;
				} else if (name >= 10835 && name <= 10901) {
					return 5;
				} else {
					return false;
				}
			};
			const validMercTable = getTable();
			let newseed = new Rnd(seed);
			newseed.roll();
			let index = (newseed.get()) % validMercTable.length;
			newseed.roll();
			this.level = (newseed.get()) % 5 + me.charlvl - 5;
			let lvl = this.level;
			let difference = this.level - getMercInfo(index, 7);
			this.hireling = getMercInfo(index, 0);
			this.typeid = getMercInfo(index, 3);
			this.subtype = getMercInfo(index, 1);
			this.skills = [];
			if (getMercInfo(index, 33) !== undefined) {
				this.skills.push({
					name: getMercInfo(index, 33),
					lvl: Math.floor(lvl * 10 / 32) // experimental
				});
			}
			if (getMercInfo(index, 39) !== undefined) {
				this.skills.push({
					name: getMercInfo(index, 39),
					lvl: Math.floor(lvl * 10 / 32) // experimental
				});
			}
			if (getMercInfo(index, 45) !== undefined) {
				this.skills.push({
					name: getMercInfo(index, 45),
					lvl: Math.floor(lvl * 10 / 32) // experimental
				});
			}
			this.cost = getMercInfo(index, 11) * (15 * difference + 100) / 100;
			if (this.cost < getMercInfo(index, 11)) {
				this.cost = getMercInfo(index, 11);
			}
			this.cost = Math.floor(this.cost);
			this.hp = getMercInfo(index, 13) + getMercInfo(index, 14) * difference;
			if (this.hp < 40) {
				this.hp = 40;
			}
			this.defense = getMercInfo(index, 15) + getMercInfo(index, 16) * difference;
			if (this.defense < 0) {
				this.defense = 0;
			}
			this.strength = getMercInfo(index, 17) + getMercInfo(index, 18) * difference;
			if (this.strength < 10) {
				this.strength = 10;
			}
			this.dexterity = getMercInfo(index, 19) + getMercInfo(index, 20) * difference;
			if (this.dexterity < 10) {
				this.dexterity = 10;
			}
			this.experience = this.level * this.level * (this.level + 1) * getMercInfo(index, 12);
			if (this.experience < 0) {
				this.experience = 0;
			}
			this.attackrating = getMercInfo(index, 21) + getMercInfo(index, 22) * difference;
			if (this.attackrating < 1) {
				this.attackrating = 1;
			}
			this.dmg_min = getMercInfo(index, 24) + getMercInfo(index, 26) * difference;
			if (this.dmg_min < 0) {
				this.dmg_min = 0;
			}
			this.dmg_max = getMercInfo(index, 25) + getMercInfo(index, 26) * difference;
			if (this.dmg_max < 1) {
				this.dmg_max = 1;
			}
			this.resists = getMercInfo(index, 27) + getMercInfo(index, 28) * difference;
			if (this.resists < 1) {
				this.resists = 1;
			}
		}
		Merc.prototype.hire = function () {
			let npc = getInteractedNPC();
			if (!npc) throw new Error("To buy merc you need to interact with npc first");
			if (me.gold < this.cost) throw new Error("Merc is too expensive to buy.");
			let before = me.gold;
			while (before === me.gold) {
				sendPacket(1, sdk.packets.send.HireMerc, 4, npc.gid, 4, this.id);
				delay((me.ping || 1) * 5);
			}
			return true;
		};
		return Merc;
	}());
	exports.Merc = Merc;
	let Mercs = [];
	exports.default = Mercs;
	function mercPacket(pByte) {
		switch (pByte[0]) {
		case 0x4f:
			// Clear mercenary list
			Mercs.splice(0, Mercs.length);
			break;
		case 0x4e:
			let name = ((pByte[1]) | (pByte[2] << 8)), seed = ((pByte[3]) | (pByte[4] << 8) | (pByte[5] << 16) | (pByte[6] << 24)) >>> 0;
			Mercs.push(new Merc(name, seed));
			break;
		}
	}
	exports.mercPacket = mercPacket;
	//addEventListener("gamepacket", mercPacket);
	//removeEventListener("gamepacket", mercPacket);
	const MercTable = [
		//       0.Hireling , 1.SubType          , 2.Version , 3.Id , 4.Class , 5.Act , 6.Diff , 7.Level , 8.Seller , 9.NameFirst , 10.NameLast , 11.Gold , 12.Exp/Lvl , 13.HP , 14.HP/Lvl , 15.Def , 16.Def/Lvl , Str , Str/Lvl , Dex , Dex/Lvl , AR   , AR/Lvl , Share , Dmg-Min , Dmg-Max , Dmg/Lvl , Resist , Resist/Lvl , WType1 , WType2 , HireDesc , DefaultChance , Skill1          , Mode1 , Chance1 , ChancePerLvl1 , Level1 , LvlPerLvl1 , Skill2         , Mode2 , Chance2 , ChancePerLvl2 , Level2 , LvlPerLvl2 , Skill3      , Mode3 , Chance3 , ChancePerLvl3 , Level3 , LvlPerLvl3 , Skill4 , Mode4 , Chance4 , ChancePerLvl4 , Level4 , LvlPerLvl4 , Skill5 , Mode5 , Chance5 , ChancePerLvl5 , Level5 , LvlPerLvl5 , Skill6 , Mode6 , Chance6 , ChancePerLvl6 , Level6 , LvlPerLvl6 , Head , Torso , Weapon , Shield
		["Rogue Scout", "Fire - Normal", 0, 0, 271, 1, 1, 3, 150, "merc01", "merc41", 100, 100, 45, 8, 15, 6, 35, 10, 45, 16, 10, 10, , 1, 3, 2, 0, 8, "bow", , "farw", 75, "Inner Sight", 4, 10, 0, 1, 10, "Fire Arrow", 4, 25, 8, 1, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 1, 2, 0],
		["Rogue Scout", "Fire - Normal", 0, 0, 271, 1, 1, 25, 150, "merc01", "merc41", 100, 100, 221, 13, 147, 12, 63, 10, 89, 16, 230, 20, 1, 7, 9, 4, 44, 7, "bow", , "farw", 75, "Inner Sight", 4, 10, 0, 8, 10, "Fire Arrow", 4, 69, 0, 8, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 1, 2, 0],
		["Rogue Scout", "Fire - Normal", 0, 0, 271, 1, 1, 49, 150, "merc01", "merc41", 100, 100, 533, 25, 435, 18, 93, 10, 137, 16, 710, 30, 2, 19, 21, 6, 86, 5, "bow", , "farw", 75, "Inner Sight", 4, 10, 0, 16, 10, "Fire Arrow", 4, 69, 0, 16, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 1, 2, 0],
		["Rogue Scout", "Ice - Normal", 0, 1, 271, 1, 1, 3, 150, "merc01", "merc41", 150, 105, 45, 8, 15, 6, 35, 10, 45, 16, 10, 10, , 1, 3, 2, 0, 8, "bow", , "carw", 75, "Inner Sight", 4, 10, 0, 1, 10, "Cold Arrow", 4, 25, 2, 1, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 1, 2, 0],
		["Rogue Scout", "Ice - Normal", 0, 1, 271, 1, 1, 25, 150, "merc01", "merc41", 150, 105, 221, 12, 147, 12, 63, 10, 89, 16, 230, 20, 1, 7, 9, 4, 44, 7, "bow", , "carw", 75, "Inner Sight", 4, 10, 0, 8, 10, "Cold Arrow", 4, 36, 0, 8, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 1, 2, 0],
		["Rogue Scout", "Ice - Normal", 0, 1, 271, 1, 1, 49, 150, "merc01", "merc41", 150, 105, 509, 16, 435, 18, 93, 10, 137, 16, 710, 30, 2, 19, 21, 6, 86, 5, "bow", , "carw", 75, "Inner Sight", 4, 10, 0, 16, 10, "Cold Arrow", 4, 36, 0, 16, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 1, 2, 0],
		["Rogue Scout", "Fire - Nightmare", 0, 2, 271, 1, 2, 25, 150, "merc01", "merc41", 6000, 110, 199, 12, 132, 12, 60, 10, 84, 16, 207, 20, 1, 6, 8, 4, 41, 7, "bow", , "farw", 75, "Inner Sight", 4, 10, 0, 7, 10, "Fire Arrow", 4, 69, 0, 7, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 1, 2, 0],
		["Rogue Scout", "Fire - Nightmare", 0, 2, 271, 1, 2, 49, 150, "merc01", "merc41", 6000, 110, 487, 16, 420, 18, 90, 10, 132, 16, 687, 30, 2, 18, 20, 6, 83, 5, "bow", , "farw", 75, "Inner Sight", 4, 10, 0, 15, 10, "Fire Arrow", 4, 69, 0, 15, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 1, 2, 0],
		["Rogue Scout", "Ice - Nightmare", 0, 3, 271, 1, 2, 25, 150, "merc01", "merc41", 7500, 115, 199, 12, 132, 12, 60, 10, 84, 16, 207, 20, 1, 6, 8, 4, 41, 7, "bow", , "carw", 75, "Inner Sight", 4, 10, 0, 7, 10, "Cold Arrow", 4, 69, 0, 7, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 1, 2, 0],
		["Rogue Scout", "Ice - Nightmare", 0, 3, 271, 1, 2, 49, 150, "merc01", "merc41", 7500, 115, 487, 16, 420, 18, 90, 10, 132, 16, 687, 30, 2, 18, 20, 6, 83, 5, "bow", , "carw", 75, "Inner Sight", 4, 10, 0, 15, 10, "Cold Arrow", 4, 69, 0, 15, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 1, 2, 0],
		["Rogue Scout", "Fire - Hell", 0, 4, 271, 1, 3, 49, 150, "merc01", "merc41", 12500, 120, 438, 16, 378, 18, 87, 10, 127, 16, 618, 30, 2, 17, 19, 6, 80, 5, "bow", , "farw", 75, "Inner Sight", 4, 10, 0, 14, 10, "Fire Arrow", 4, 69, 0, 14, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 1, 2, 0],
		["Rogue Scout", "Ice - Hell", 0, 5, 271, 1, 3, 49, 150, "merc01", "merc41", 14000, 125, 438, 16, 378, 18, 87, 10, 127, 16, 618, 30, 2, 17, 19, 6, 80, 5, "bow", , "carw", 75, "Inner Sight", 4, 10, 0, 14, 10, "Cold Arrow", 4, 69, 0, 14, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 1, 2, 0],
		["Rogue Scout", "Fire - Normal", 100, 0, 271, 1, 1, 3, 150, "merc01", "merc41", 100, 100, 45, 9, 15, 8, 35, 10, 45, 16, 10, 12, , 1, 3, 2, 0, 8, "bow", , "farw", 75, "Inner Sight", 4, 10, 0, 1, 10, "Fire Arrow", 4, 25, 5, 1, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 1, 2, 0],
		["Rogue Scout", "Fire - Normal", 100, 0, 271, 1, 1, 36, 150, "merc01", "merc41", 100, 100, 342, 18, 279, 15, 77, 10, 111, 16, 406, 24, 1, 9, 11, 4, 66, 7, "bow", , "farw", 75, "Inner Sight", 4, 10, 0, 12, 10, "Fire Arrow", 4, 67, 0, 12, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 1, 2, 0],
		["Rogue Scout", "Fire - Normal", 100, 0, 271, 1, 1, 67, 150, "merc01", "merc41", 100, 100, 900, 30, 744, 22, 116, 10, 173, 16, 1150, 36, 2, 25, 27, 6, 121, 5, "bow", , "farw", 75, "Inner Sight", 4, 10, 0, 22, 10, "Fire Arrow", 4, 67, 0, 22, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 1, 2, 0],
		["Rogue Scout", "Ice - Normal", 100, 1, 271, 1, 1, 3, 150, "merc01", "merc41", 150, 105, 45, 9, 15, 8, 35, 10, 45, 16, 10, 12, , 1, 3, 2, 0, 8, "bow", , "carw", 75, "Inner Sight", 4, 10, 0, 1, 10, "Cold Arrow", 4, 25, 5, 1, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 1, 2, 0],
		["Rogue Scout", "Ice - Normal", 100, 1, 271, 1, 1, 36, 150, "merc01", "merc41", 150, 105, 342, 18, 279, 15, 77, 10, 111, 16, 406, 24, 1, 9, 11, 4, 66, 7, "bow", , "carw", 75, "Inner Sight", 4, 10, 0, 12, 10, "Cold Arrow", 4, 67, 0, 12, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 1, 2, 0],
		["Rogue Scout", "Ice - Normal", 100, 1, 271, 1, 1, 67, 150, "merc01", "merc41", 150, 105, 900, 30, 744, 22, 116, 10, 173, 16, 1150, 36, 2, 25, 27, 6, 121, 5, "bow", , "carw", 75, "Inner Sight", 4, 10, 0, 22, 10, "Cold Arrow", 4, 67, 0, 22, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 1, 2, 0],
		["Rogue Scout", "Fire - Nightmare", 100, 2, 271, 1, 2, 36, 150, "merc01", "merc41", 6000, 110, 308, 18, 251, 15, 74, 10, 106, 16, 365, 24, 1, 8, 10, 4, 63, 7, "bow", , "farw", 75, "Inner Sight", 4, 10, 0, 11, 10, "Fire Arrow", 4, 69, 0, 11, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 1, 2, 0],
		["Rogue Scout", "Fire - Nightmare", 100, 2, 271, 1, 2, 67, 150, "merc01", "merc41", 6000, 110, 866, 30, 716, 22, 113, 10, 168, 16, 1109, 36, 2, 24, 26, 6, 118, 5, "bow", , "farw", 75, "Inner Sight", 4, 10, 0, 21, 10, "Fire Arrow", 4, 69, 0, 21, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 1, 2, 0],
		["Rogue Scout", "Ice - Nightmare", 100, 3, 271, 1, 2, 36, 150, "merc01", "merc41", 7500, 115, 308, 18, 251, 15, 74, 10, 106, 16, 365, 24, 1, 8, 10, 4, 63, 7, "bow", , "carw", 75, "Inner Sight", 4, 10, 0, 11, 10, "Cold Arrow", 4, 69, 0, 11, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 1, 2, 0],
		["Rogue Scout", "Ice - Nightmare", 100, 3, 271, 1, 2, 67, 150, "merc01", "merc41", 7500, 115, 866, 30, 716, 22, 113, 10, 168, 16, 1109, 36, 2, 24, 26, 6, 118, 5, "bow", , "carw", 75, "Inner Sight", 4, 10, 0, 21, 10, "Cold Arrow", 4, 69, 0, 21, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 1, 2, 0],
		["Rogue Scout", "Fire - Hell", 100, 4, 271, 1, 3, 67, 150, "merc01", "merc41", 12500, 120, 779, 30, 644, 22, 110, 10, 163, 16, 998, 36, 2, 23, 25, 6, 115, 5, "bow", , "farw", 75, "Inner Sight", 4, 10, 0, 20, 10, "Fire Arrow", 4, 69, 0, 20, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 1, 2, 0],
		["Rogue Scout", "Ice - Hell", 100, 5, 271, 1, 3, 67, 150, "merc01", "merc41", 14000, 125, 779, 30, 644, 22, 110, 10, 163, 16, 998, 36, 2, 23, 25, 6, 115, 5, "bow", , "carw", 75, "Inner Sight", 4, 10, 0, 20, 10, "Cold Arrow", 4, 69, 0, 20, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 1, 2, 0],
		["Desert Mercenary", "Comb-Normal", 0, 6, 338, 2, 1, 9, 198, "merca201", "merca221", 350, 110, 120, 10, 45, 9, 57, 14, 40, 12, 20, 10, 1, 7, 14, 4, 18, 8, "pole", "spea", "comb", 30, "Jab", 14, 70, 4, 3, 10, "Prayer", 1, 10, 0, 3, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Comb-Normal", 0, 6, 338, 2, 1, 31, 198, "merca201", "merca221", 350, 110, 340, 20, 243, 16, 96, 14, 73, 12, 240, 20, 3, 18, 25, 6, 62, 7, "pole", "spea", "comb", 30, "Jab", 14, 92, 4, 10, 10, "Prayer", 1, 10, 0, 10, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Comb-Normal", 0, 6, 338, 2, 1, 55, 198, "merca201", "merca221", 350, 110, 820, 35, 627, 24, 138, 14, 109, 12, 720, 30, 4, 36, 43, 8, 104, 4, "pole", "spea", "comb", 30, "Jab", 14, 116, 4, 18, 10, "Prayer", 1, 10, 0, 18, 0, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Def-Normal", 0, 7, 338, 2, 1, 9, 198, "merca201", "merca221", 350, 110, 120, 10, 45, 9, 57, 14, 40, 12, 20, 10, 1, 7, 14, 4, 18, 8, "pole", "spea", "def", 30, "Jab", 14, 70, 4, 3, 10, "Defiance", 1, 10, 0, 3, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Def-Normal", 0, 7, 338, 2, 1, 31, 198, "merca201", "merca221", 350, 110, 340, 20, 243, 16, 96, 14, 73, 12, 240, 20, 3, 18, 25, 6, 62, 7, "pole", "spea", "def", 30, "Jab", 14, 92, 4, 10, 10, "Defiance", 1, 10, 0, 10, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Def-Normal", 0, 7, 338, 2, 1, 55, 198, "merca201", "merca221", 350, 110, 820, 35, 627, 24, 138, 14, 109, 12, 720, 30, 4, 36, 43, 8, 104, 4, "pole", "spea", "def", 30, "Jab", 14, 116, 4, 18, 0, "Defiance", 1, 10, 0, 18, 0, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Off-Normal", 0, 8, 338, 2, 1, 9, 198, "merca201", "merca221", 350, 110, 120, 10, 45, 9, 57, 14, 40, 12, 20, 10, 1, 7, 14, 4, 18, 8, "pole", "spea", "off", 30, "Jab", 14, 70, 4, 3, 10, "Blessed Aim", 1, 10, 0, 3, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Off-Normal", 0, 8, 338, 2, 1, 31, 198, "merca201", "merca221", 350, 110, 340, 20, 243, 16, 96, 14, 73, 12, 240, 20, 3, 18, 25, 6, 62, 7, "pole", "spea", "off", 30, "Jab", 14, 92, 4, 10, 10, "Blessed Aim", 1, 10, 0, 10, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Off-Normal", 0, 8, 338, 2, 1, 55, 198, "merca201", "merca221", 350, 110, 820, 35, 627, 24, 138, 14, 109, 12, 720, 30, 4, 36, 43, 8, 104, 4, "pole", "spea", "off", 30, "Jab", 14, 116, 4, 18, 0, "Blessed Aim", 1, 10, 0, 18, 0, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Comb-Nightmare", 0, 9, 338, 2, 2, 31, 198, "merca201", "merca221", 7900, 120, 306, 20, 219, 16, 92, 14, 69, 12, 216, 20, 3, 16, 23, 6, 59, 7, "pole", "spea", "comb", 30, "Jab", 14, 120, 4, 9, 10, "Thorns", 1, 10, 0, 5, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Comb-Nightmare", 0, 9, 338, 2, 2, 55, 198, "merca201", "merca221", 7900, 120, 786, 35, 603, 24, 134, 14, 105, 12, 696, 30, 4, 34, 41, 8, 101, 4, "pole", "spea", "comb", 30, "Jab", 14, 144, 4, 17, 10, "Thorns", 1, 10, 0, 13, 0, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Def-Nightmare", 0, 10, 338, 2, 2, 31, 198, "merca201", "merca221", 7900, 120, 306, 20, 219, 16, 92, 14, 69, 12, 216, 20, 3, 16, 23, 6, 59, 7, "pole", "spea", "def", 30, "Jab", 14, 120, 4, 9, 10, "Holy Freeze", 1, 10, 0, 6, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Def-Nightmare", 0, 10, 338, 2, 2, 55, 198, "merca201", "merca221", 7900, 120, 786, 35, 603, 24, 134, 14, 105, 12, 696, 30, 4, 34, 41, 8, 101, 4, "pole", "spea", "def", 30, "Jab", 14, 144, 4, 17, 0, "Holy Freeze", 1, 10, 0, 14, 0, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Off-Nightmare", 0, 11, 338, 2, 2, 31, 198, "merca201", "merca221", 7900, 120, 306, 20, 219, 16, 92, 14, 69, 12, 216, 20, 3, 16, 23, 6, 59, 7, "pole", "spea", "off", 30, "Jab", 14, 120, 4, 9, 10, "Might", 1, 10, 0, 7, 8, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Off-Nightmare", 0, 11, 338, 2, 2, 55, 198, "merca201", "merca221", 7900, 120, 786, 35, 603, 24, 134, 14, 105, 12, 696, 30, 4, 34, 41, 8, 101, 4, "pole", "spea", "off", 30, "Jab", 14, 144, 4, 17, 0, "Might", 1, 10, 0, 13, 8, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Comb-Hell", 0, 12, 338, 2, 3, 55, 198, "merca201", "merca221", 15000, 130, 707, 35, 543, 24, 130, 14, 101, 12, 626, 30, 4, 32, 39, 8, 98, 4, "pole", "spea", "comb", 30, "Jab", 14, 104, 4, 16, 10, "Prayer", 1, 10, 0, 16, 0, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Def-Hell", 0, 13, 338, 2, 3, 55, 198, "merca201", "merca221", 15000, 130, 707, 35, 543, 24, 130, 14, 101, 12, 626, 30, 4, 32, 39, 8, 98, 4, "pole", "spea", "def", 30, "Jab", 14, 104, 4, 16, 0, "Defiance", 1, 10, 0, 16, 0, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Off-Hell", 0, 14, 338, 2, 3, 55, 198, "merca201", "merca221", 15000, 130, 707, 35, 543, 24, 130, 14, 101, 12, 626, 30, 4, 32, 39, 8, 98, 4, "pole", "spea", "off", 30, "Jab", 14, 104, 4, 16, 0, "Blessed Aim", 1, 10, 0, 16, 0, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Comb-Normal", 100, 6, 338, 2, 1, 9, 198, "merca201", "merca221", 350, 110, 120, 15, 45, 11, 57, 14, 40, 12, 20, 12, 1, 7, 14, 4, 18, 8, "pole", "spea", "comb", 30, "Jab", 14, 70, 4, 3, 10, "Prayer", 1, 10, 0, 3, 7, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Comb-Normal", 100, 6, 338, 2, 1, 43, 198, "merca201", "merca221", 350, 110, 630, 25, 419, 19, 117, 14, 91, 12, 428, 24, 3, 24, 31, 6, 86, 7, "pole", "spea", "comb", 30, "Jab", 14, 104, 4, 14, 10, "Prayer", 1, 10, 0, 11, 7, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Comb-Normal", 100, 6, 338, 2, 1, 75, 198, "merca201", "merca221", 350, 110, 1430, 40, 1027, 28, 173, 14, 139, 12, 1196, 36, 4, 48, 55, 8, 142, 4, "pole", "spea", "comb", 30, "Jab", 14, 136, 4, 24, 10, "Prayer", 1, 10, 0, 18, 0, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Def-Normal", 100, 7, 338, 2, 1, 9, 198, "merca201", "merca221", 350, 110, 120, 15, 45, 11, 57, 14, 40, 12, 20, 12, 1, 7, 14, 4, 18, 8, "pole", "spea", "def", 30, "Jab", 14, 70, 4, 3, 10, "Defiance", 1, 10, 0, 3, 7, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Def-Normal", 100, 7, 338, 2, 1, 43, 198, "merca201", "merca221", 350, 110, 630, 25, 419, 19, 117, 14, 91, 12, 428, 24, 3, 24, 31, 6, 86, 7, "pole", "spea", "def", 30, "Jab", 14, 104, 4, 14, 10, "Defiance", 1, 10, 0, 11, 7, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Def-Normal", 100, 7, 338, 2, 1, 75, 198, "merca201", "merca221", 350, 110, 1430, 40, 1027, 28, 173, 14, 139, 12, 1196, 36, 4, 48, 55, 8, 142, 4, "pole", "spea", "def", 30, "Jab", 14, 136, 4, 24, 0, "Defiance", 1, 10, 0, 18, 0, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Off-Normal", 100, 8, 338, 2, 1, 9, 198, "merca201", "merca221", 350, 110, 120, 15, 45, 11, 57, 14, 40, 12, 20, 12, 1, 7, 14, 4, 18, 8, "pole", "spea", "off", 30, "Jab", 14, 70, 4, 3, 10, "Blessed Aim", 1, 10, 0, 3, 7, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Off-Normal", 100, 8, 338, 2, 1, 43, 198, "merca201", "merca221", 350, 110, 630, 25, 419, 19, 117, 14, 91, 12, 428, 24, 3, 24, 31, 6, 86, 7, "pole", "spea", "off", 30, "Jab", 14, 104, 4, 14, 10, "Blessed Aim", 1, 10, 0, 11, 7, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Off-Normal", 100, 8, 338, 2, 1, 75, 198, "merca201", "merca221", 350, 110, 1430, 40, 1027, 28, 173, 14, 139, 12, 1196, 36, 4, 48, 55, 8, 142, 4, "pole", "spea", "off", 30, "Jab", 14, 136, 4, 24, 0, "Blessed Aim", 1, 10, 0, 18, 0, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Comb-Nightmare", 100, 9, 338, 2, 2, 43, 198, "merca201", "merca221", 7900, 120, 567, 25, 377, 19, 113, 14, 87, 12, 385, 24, 3, 22, 29, 6, 83, 7, "pole", "spea", "comb", 30, "Jab", 14, 120, 4, 13, 10, "Thorns", 1, 10, 0, 5, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Comb-Nightmare", 100, 9, 338, 2, 2, 75, 198, "merca201", "merca221", 7900, 120, 1367, 40, 985, 28, 169, 14, 135, 12, 1153, 36, 4, 46, 53, 8, 139, 4, "pole", "spea", "comb", 30, "Jab", 14, 152, 4, 23, 10, "Thorns", 1, 10, 0, 15, 0, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Def-Nightmare", 100, 10, 338, 2, 2, 43, 198, "merca201", "merca221", 7900, 120, 567, 25, 377, 19, 113, 14, 87, 12, 385, 24, 3, 22, 29, 6, 83, 7, "pole", "spea", "def", 30, "Jab", 14, 120, 4, 13, 10, "Holy Freeze", 1, 10, 0, 6, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Def-Nightmare", 100, 10, 338, 2, 2, 75, 198, "merca201", "merca221", 7900, 120, 1367, 40, 985, 28, 169, 14, 135, 12, 1153, 36, 4, 46, 53, 8, 139, 4, "pole", "spea", "def", 30, "Jab", 14, 152, 4, 23, 0, "Holy Freeze", 1, 10, 0, 16, 0, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Off-Nightmare", 100, 11, 338, 2, 2, 43, 198, "merca201", "merca221", 7900, 120, 567, 25, 377, 19, 113, 14, 87, 12, 385, 24, 3, 22, 29, 6, 83, 7, "pole", "spea", "off", 30, "Jab", 14, 120, 4, 13, 10, "Might", 1, 10, 0, 7, 8, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Off-Nightmare", 100, 11, 338, 2, 2, 75, 198, "merca201", "merca221", 7900, 120, 1367, 40, 985, 28, 169, 14, 135, 12, 1153, 36, 4, 46, 53, 8, 139, 4, "pole", "spea", "off", 30, "Jab", 14, 152, 4, 23, 0, "Might", 1, 10, 0, 15, 8, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Comb-Hell", 100, 12, 338, 2, 3, 75, 198, "merca201", "merca221", 15000, 130, 1230, 40, 887, 28, 165, 14, 131, 12, 1038, 36, 4, 44, 51, 8, 136, 4, "pole", "spea", "comb", 30, "Jab", 14, 104, 4, 22, 10, "Prayer", 1, 10, 0, 16, 0, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Def-Hell", 100, 13, 338, 2, 3, 75, 198, "merca201", "merca221", 15000, 130, 1230, 40, 887, 28, 165, 14, 131, 12, 1038, 36, 4, 44, 51, 8, 136, 4, "pole", "spea", "def", 30, "Jab", 14, 104, 4, 22, 0, "Defiance", 1, 10, 0, 16, 0, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Desert Mercenary", "Off-Hell", 100, 14, 338, 2, 3, 75, 198, "merca201", "merca221", 15000, 130, 1230, 40, 887, 28, 165, 14, 131, 12, 1038, 36, 4, 44, 51, 8, 136, 4, "pole", "spea", "off", 30, "Jab", 14, 104, 4, 22, 0, "Blessed Aim", 1, 10, 0, 16, 0, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 0],
		["Eastern Sorceror", "Fire-Normal", 0, 15, 359, 3, 1, 15, 252, "merca222", "merca241", 1000, 110, 160, 8, 80, 4, 49, 10, 40, 8, 15, 10, , 1, 7, 4, 25, 7, "swor", "shie", "fire", 10, "Inferno", 7, 60, 0, 6, 10, "Fire Ball", 7, 30, 0, 4, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Fire-Normal", 0, 15, 359, 3, 1, 37, 252, "merca222", "merca241", 1000, 110, 336, 14, 168, 10, 77, 10, 62, 8, 235, 20, 3, 12, 18, 4, 64, 7, "swor", "shie", "fire", 10, "Inferno", 7, 60, 0, 13, 10, "Fire Ball", 7, 30, 0, 11, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Fire-Normal", 0, 15, 359, 3, 1, 61, 252, "merca222", "merca241", 1000, 110, 672, 20, 408, 18, 107, 10, 86, 8, 715, 30, 5, 24, 30, 4, 106, 6, "swor", "shie", "fire", 10, "Inferno", 7, 60, 0, 21, 10, "Fire Ball", 7, 30, 0, 19, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Cold-Normal", 0, 16, 359, 3, 1, 15, 252, "merca222", "merca241", 1500, 120, 160, 8, 80, 4, 49, 10, 40, 8, 15, 10, , 1, 7, 4, 25, 7, "swor", "shie", "cold", 10, "Glacial Spike", 7, 60, 0, 1, 5, "Frozen Armor", 7, 1000, 0, 2, 10, "Ice Blast", 7, 240, 0, 6, 10, , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Cold-Normal", 0, 16, 359, 3, 1, 37, 252, "merca222", "merca241", 1500, 120, 336, 14, 168, 10, 77, 10, 62, 8, 235, 20, 3, 12, 18, 4, 64, 7, "swor", "shie", "cold", 10, "Glacial Spike", 7, 60, 0, 5, 5, "Frozen Armor", 7, 1000, 0, 9, 10, "Ice Blast", 7, 240, 0, 13, 10, , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Cold-Normal", 0, 16, 359, 3, 1, 61, 252, "merca222", "merca241", 1500, 120, 672, 20, 408, 16, 107, 10, 86, 8, 715, 30, 5, 24, 30, 4, 106, 4, "swor", "shie", "cold", 10, "Glacial Spike", 7, 60, 0, 9, 5, "Frozen Armor", 7, 1000, 0, 17, 10, "Ice Blast", 7, 240, 0, 21, 10, , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Ltng-Normal", 0, 17, 359, 3, 1, 15, 252, "merca222", "merca241", 1000, 110, 160, 8, 80, 4, 49, 10, 40, 8, 15, 10, , 1, 7, 4, 25, 7, "swor", "shie", "ltng", 10, "Charged Bolt", 7, 60, 0, 4, 5, "Lightning", 7, 30, 0, 3, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Ltng-Normal", 0, 17, 359, 3, 1, 37, 252, "merca222", "merca241", 1000, 110, 336, 14, 168, 10, 77, 10, 62, 8, 235, 20, 3, 12, 18, 4, 64, 7, "swor", "shie", "ltng", 10, "Charged Bolt", 7, 60, 0, 8, 5, "Lightning", 7, 30, 0, 10, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Ltng-Normal", 0, 17, 359, 3, 1, 61, 252, "merca222", "merca241", 1000, 110, 672, 20, 408, 16, 107, 10, 86, 8, 715, 30, 5, 24, 30, 4, 106, 4, "swor", "shie", "ltng", 10, "Charged Bolt", 7, 60, 0, 12, 5, "Lightning", 7, 30, 0, 18, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Fire-Nightmare", 0, 18, 359, 3, 2, 37, 252, "merca222", "merca241", 9500, 120, 302, 14, 151, 10, 73, 10, 58, 8, 212, 20, 3, 10, 16, 4, 61, 7, "swor", "shie", "fire", 10, "Inferno", 7, 60, 0, 12, 10, "Fire Ball", 7, 30, 0, 10, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Fire-Nightmare", 0, 18, 359, 3, 2, 61, 252, "merca222", "merca241", 9500, 120, 638, 20, 391, 16, 103, 10, 82, 8, 692, 30, 5, 22, 28, 4, 103, 4, "swor", "shie", "fire", 10, "Inferno", 7, 60, 0, 20, 10, "Fire Ball", 7, 30, 0, 18, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Cold-Nightmare", 0, 19, 359, 3, 2, 37, 252, "merca222", "merca241", 12000, 130, 302, 14, 151, 10, 73, 10, 58, 8, 212, 20, 3, 10, 16, 4, 61, 7, "swor", "shie", "cold", 10, "Glacial Spike", 7, 60, 0, 4, 5, "Frozen Armor", 7, 1000, 0, 8, 10, "Ice Blast", 7, 240, 0, 12, 10, , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Cold-Nightmare", 0, 19, 359, 3, 2, 61, 252, "merca222", "merca241", 12000, 130, 638, 20, 391, 16, 103, 10, 82, 8, 692, 30, 5, 22, 28, 4, 103, 4, "swor", "shie", "cold", 10, "Glacial Spike", 7, 60, 0, 8, 5, "Frozen Armor", 7, 1000, 0, 16, 10, "Ice Blast", 7, 240, 0, 20, 10, , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Ltng-Nightmare", 0, 20, 359, 3, 2, 37, 252, "merca222", "merca241", 10000, 120, 302, 14, 151, 10, 73, 10, 58, 8, 212, 20, 3, 10, 16, 4, 61, 7, "swor", "shie", "ltng", 10, "Charged Bolt", 7, 60, 0, 7, 5, "Lightning", 7, 30, 0, 9, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Ltng-Nightmare", 0, 20, 359, 3, 2, 61, 252, "merca222", "merca241", 10000, 120, 638, 20, 391, 16, 103, 10, 82, 8, 692, 30, 5, 22, 28, 4, 103, 4, "swor", "shie", "ltng", 10, "Charged Bolt", 7, 60, 0, 11, 5, "Lightning", 7, 30, 0, 17, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Fire-Hell", 0, 21, 359, 3, 3, 61, 252, "merca222", "merca241", 21000, 130, 574, 20, 352, 16, 99, 10, 78, 8, 623, 30, 5, 20, 26, 4, 100, 4, "swor", "shie", "fire", 10, "Inferno", 7, 60, 0, 19, 10, "Fire Ball", 7, 30, 0, 17, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Cold-Hell", 0, 22, 359, 3, 3, 61, 252, "merca222", "merca241", 27000, 140, 574, 20, 352, 16, 99, 10, 78, 8, 623, 30, 5, 20, 26, 4, 100, 4, "swor", "shie", "cold", 10, "Glacial Spike", 7, 60, 0, 7, 5, "Frozen Armor", 7, 1000, 0, 15, 10, "Ice Blast", 7, 240, 0, 19, 10, , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Ltng-Hell", 0, 23, 359, 3, 3, 61, 252, "merca222", "merca241", 21000, 130, 574, 20, 352, 16, 99, 10, 78, 8, 623, 30, 5, 20, 27, 4, 100, 4, "swor", "shie", "ltng", 10, "Charged Bolt", 7, 60, 0, 10, 5, "Lightning", 7, 30, 0, 16, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Fire-Normal", 100, 15, 359, 3, 1, 15, 252, "merca222", "merca241", 1000, 110, 160, 9, 80, 5, 49, 10, 40, 8, 15, 12, , 1, 7, 4, 25, 7, "swor", "shie", "fire", 10, "Inferno", 7, 60, 0, 6, 10, "Fire Ball", 7, 30, 0, 4, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Fire-Normal", 100, 15, 359, 3, 1, 49, 252, "merca222", "merca241", 1000, 110, 466, 18, 250, 13, 92, 10, 74, 8, 423, 24, 3, 18, 24, 4, 85, 7, "swor", "shie", "fire", 10, "Inferno", 7, 60, 0, 17, 10, "Fire Ball", 7, 30, 0, 15, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Fire-Normal", 100, 15, 359, 3, 1, 79, 252, "merca222", "merca241", 1000, 110, 1006, 27, 640, 25, 130, 10, 104, 8, 1143, 36, 5, 33, 39, 4, 138, 6, "swor", "shie", "fire", 10, "Inferno", 7, 60, 0, 27, 10, "Fire Ball", 7, 30, 0, 25, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Cold-Normal", 100, 16, 359, 3, 1, 15, 252, "merca222", "merca241", 1500, 120, 160, 9, 80, 5, 49, 10, 40, 8, 15, 12, , 1, 7, 4, 25, 7, "swor", "shie", "cold", 10, "Glacial Spike", 7, 60, 0, 1, 5, "Frozen Armor", 7, 1000, 0, 2, 10, "Ice Blast", 7, 240, 0, 6, 10, , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Cold-Normal", 100, 16, 359, 3, 1, 49, 252, "merca222", "merca241", 1500, 120, 466, 18, 250, 13, 92, 10, 74, 8, 423, 24, 3, 18, 24, 4, 85, 7, "swor", "shie", "cold", 10, "Glacial Spike", 7, 60, 0, 7, 5, "Frozen Armor", 7, 1000, 0, 13, 10, "Ice Blast", 7, 240, 0, 17, 10, , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Cold-Normal", 100, 16, 359, 3, 1, 79, 252, "merca222", "merca241", 1500, 120, 1006, 27, 640, 25, 130, 10, 104, 8, 1143, 36, 5, 33, 39, 4, 138, 4, "swor", "shie", "cold", 10, "Glacial Spike", 7, 60, 0, 12, 5, "Frozen Armor", 7, 1000, 0, 23, 10, "Ice Blast", 7, 240, 0, 27, 10, , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Ltng-Normal", 100, 17, 359, 3, 1, 15, 252, "merca222", "merca241", 1000, 110, 160, 9, 80, 5, 49, 10, 40, 8, 15, 12, , 1, 7, 4, 25, 7, "swor", "shie", "ltng", 10, "Charged Bolt", 7, 60, 0, 4, 5, "Lightning", 7, 30, 0, 3, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Ltng-Normal", 100, 17, 359, 3, 1, 49, 252, "merca222", "merca241", 1000, 110, 466, 18, 250, 13, 92, 10, 74, 8, 423, 24, 3, 18, 24, 4, 85, 7, "swor", "shie", "ltng", 10, "Charged Bolt", 7, 60, 0, 10, 5, "Lightning", 7, 30, 0, 14, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Ltng-Normal", 100, 17, 359, 3, 1, 79, 252, "merca222", "merca241", 1000, 110, 1006, 27, 640, 25, 130, 10, 104, 8, 1143, 36, 5, 33, 39, 4, 138, 4, "swor", "shie", "ltng", 10, "Charged Bolt", 7, 60, 0, 15, 5, "Lightning", 7, 30, 0, 24, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Fire-Nightmare", 100, 18, 359, 3, 2, 49, 252, "merca222", "merca241", 9500, 120, 419, 18, 225, 13, 88, 10, 70, 8, 381, 24, 3, 16, 22, 4, 82, 7, "swor", "shie", "fire", 10, "Inferno", 7, 60, 0, 16, 10, "Fire Ball", 7, 30, 0, 14, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Fire-Nightmare", 100, 18, 359, 3, 2, 79, 252, "merca222", "merca241", 9500, 120, 959, 27, 615, 25, 126, 10, 100, 8, 1101, 36, 5, 31, 37, 4, 135, 4, "swor", "shie", "fire", 10, "Inferno", 7, 60, 0, 26, 10, "Fire Ball", 7, 30, 0, 24, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Cold-Nightmare", 100, 19, 359, 3, 2, 49, 252, "merca222", "merca241", 12000, 130, 419, 18, 225, 13, 88, 10, 70, 8, 381, 24, 3, 16, 22, 4, 82, 7, "swor", "shie", "cold", 10, "Glacial Spike", 7, 60, 0, 6, 5, "Frozen Armor", 7, 1000, 0, 12, 10, "Ice Blast", 7, 240, 0, 16, 10, , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Cold-Nightmare", 100, 19, 359, 3, 2, 79, 252, "merca222", "merca241", 12000, 130, 959, 27, 615, 25, 126, 10, 100, 8, 1101, 36, 5, 31, 37, 4, 135, 4, "swor", "shie", "cold", 10, "Glacial Spike", 7, 60, 0, 11, 5, "Frozen Armor", 7, 1000, 0, 22, 10, "Ice Blast", 7, 240, 0, 26, 10, , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Ltng-Nightmare", 100, 20, 359, 3, 2, 49, 252, "merca222", "merca241", 10000, 120, 419, 18, 225, 13, 88, 10, 70, 8, 381, 24, 3, 16, 22, 4, 82, 7, "swor", "shie", "ltng", 10, "Charged Bolt", 7, 60, 0, 9, 5, "Lightning", 7, 30, 0, 13, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Ltng-Nightmare", 100, 20, 359, 3, 2, 79, 252, "merca222", "merca241", 10000, 120, 959, 27, 615, 25, 126, 10, 100, 8, 1101, 36, 5, 31, 37, 4, 135, 4, "swor", "shie", "ltng", 10, "Charged Bolt", 7, 60, 0, 14, 5, "Lightning", 7, 30, 0, 23, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Fire-Hell", 100, 21, 359, 3, 3, 79, 252, "merca222", "merca241", 21000, 130, 863, 27, 554, 25, 122, 10, 96, 8, 991, 36, 5, 29, 35, 4, 132, 4, "swor", "shie", "fire", 10, "Inferno", 7, 60, 0, 25, 10, "Fire Ball", 7, 30, 0, 23, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Cold-Hell", 100, 22, 359, 3, 3, 79, 252, "merca222", "merca241", 27000, 140, 863, 27, 554, 25, 122, 10, 96, 8, 991, 36, 5, 29, 35, 4, 132, 4, "swor", "shie", "cold", 10, "Glacial Spike", 7, 60, 0, 10, 5, "Frozen Armor", 7, 1000, 0, 21, 10, "Ice Blast", 7, 240, 0, 25, 10, , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Eastern Sorceror", "Ltng-Hell", 100, 23, 359, 3, 3, 79, 252, "merca222", "merca241", 21000, 130, 863, 27, 554, 25, 122, 10, 96, 8, 991, 36, 5, 29, 36, 4, 132, 4, "swor", "shie", "ltng", 10, "Charged Bolt", 7, 60, 0, 13, 5, "Lightning", 7, 30, 0, 22, 10, , , , , , , , , , , , , , , , , , , , , , , , , 2, 2, 2, 1],
		["Barbarian", "1hs-Normal", 0, 24, 561, 5, 1, 28, 515, "mercX101", "mercX167", 9000, 120, 288, 14, 180, 7, 101, 15, 63, 10, 150, 17, 1, 16, 20, 6, 56, 7, "swor", , , 50, "Bash", 5, 15, 0, 4, 10, "Stun", 5, 15, 0, 3, 8, , , , , , , , , , , , , , , , , , , , , , , , , 0, 0, 0, 0],
		["Barbarian", "1hs-Normal", 0, 24, 561, 5, 1, 42, 515, "mercX101", "mercX167", 9000, 120, 484, 21, 278, 20, 128, 15, 81, 10, 388, 27, 1, 27, 31, 8, 81, 7, "swor", , , 50, "Bash", 5, 50, 0, 9, 10, "Stun", 5, 50, 0, 7, 8, , , , , , , , , , , , , , , , , , , , , , , , , 0, 0, 0, 0],
		["Barbarian", "1hs-Normal", 0, 24, 561, 5, 1, 75, 515, "mercX101", "mercX167", 9000, 120, 1177, 35, 938, 40, 190, 15, 123, 10, 1279, 37, 1, 60, 64, 8, 139, 4, "swor", , , 50, "Bash", 5, 75, 0, 20, 0, "Stun", 5, 75, 0, 16, 0, , , , , , , , , , , , , , , , , , , , , , , , , 0, 0, 0, 0],
		["Barbarian", "1hs-Normal", 0, 25, 561, 5, 1, 28, 515, "mercX101", "mercX167", 9000, 120, 288, 14, 180, 7, 101, 15, 63, 10, 150, 17, 1, 16, 20, 6, 56, 7, "swor", , , 50, "Bash", 5, 15, 0, 4, 10, "Stun", 5, 15, 0, 3, 8, , , , , , , , , , , , , , , , , , , , , , , , , 0, 0, 0, 0],
		["Barbarian", "1hs-Normal", 0, 25, 561, 5, 1, 42, 515, "mercX101", "mercX167", 9000, 120, 484, 21, 278, 20, 128, 15, 81, 10, 388, 27, 1, 27, 31, 8, 81, 7, "swor", , , 50, "Bash", 5, 50, 0, 9, 10, "Stun", 5, 50, 0, 7, 8, , , , , , , , , , , , , , , , , , , , , , , , , 0, 0, 0, 0],
		["Barbarian", "1hs-Normal", 0, 25, 561, 5, 1, 75, 515, "mercX101", "mercX167", 9000, 120, 1177, 35, 938, 40, 190, 15, 123, 10, 1279, 37, 1, 60, 64, 8, 139, 4, "swor", , , 50, "Bash", 5, 75, 0, 20, 0, "Stun", 5, 75, 0, 16, 0, , , , , , , , , , , , , , , , , , , , , , , , , 0, 0, 0, 0],
		["Barbarian", "1hs-Nightmare", 0, 26, 561, 5, 2, 42, 515, "mercX101", "mercX167", 18000, 130, 436, 21, 250, 20, 125, 15, 76, 10, 349, 27, 4, 25, 29, 8, 78, 7, "swor", , , 50, "Bash", 5, 50, 0, 8, 10, "Stun", 5, 50, 0, 6, 8, , , , , , , , , , , , , , , , , , , , , , , , , 0, 0, 0, 0],
		["Barbarian", "1hs-Nightmare", 0, 26, 561, 5, 2, 75, 515, "mercX101", "mercX167", 18000, 130, 1129, 35, 910, 40, 187, 15, 118, 10, 1240, 37, 4, 58, 62, 8, 136, 4, "swor", , , 50, "Bash", 5, 75, 0, 19, 0, "Stun", 5, 75, 0, 15, 0, , , , , , , , , , , , , , , , , , , , , , , , , 0, 0, 0, 0],
		["Barbarian", "1hs-Nightmare", 0, 27, 561, 5, 2, 42, 515, "mercX101", "mercX167", 18000, 130, 436, 21, 250, 20, 125, 15, 76, 10, 349, 27, 4, 25, 29, 8, 78, 7, "swor", , , 50, "Bash", 5, 50, 0, 8, 10, "Stun", 5, 50, 0, 6, 8, , , , , , , , , , , , , , , , , , , , , , , , , 0, 0, 0, 0],
		["Barbarian", "1hs-Nightmare", 0, 27, 561, 5, 2, 75, 515, "mercX101", "mercX167", 18000, 130, 1129, 35, 910, 40, 187, 15, 118, 10, 1240, 37, 4, 58, 62, 8, 136, 4, "swor", , , 50, "Bash", 5, 75, 0, 19, 0, "Stun", 5, 75, 0, 15, 0, , , , , , , , , , , , , , , , , , , , , , , , , 0, 0, 0, 0],
		["Barbarian", "1hs-Hell", 0, 28, 561, 5, 3, 75, 515, "mercX101", "mercX167", 32000, 140, 1016, 35, 819, 40, 184, 15, 113, 10, 1116, 37, 6, 56, 60, 8, 133, 4, "swor", , , 50, "Bash", 5, 70, 0, 18, 0, "Stun", 5, 70, 0, 14, 0, , , , , , , , , , , , , , , , , , , , , , , , , 0, 0, 0, 0],
		["Barbarian", "1hs-Hell", 0, 29, 561, 5, 3, 75, 515, "mercX101", "mercX167", 32000, 140, 1016, 35, 819, 40, 184, 15, 113, 10, 1116, 37, 6, 56, 60, 8, 133, 4, "swor", , , 50, "Bash", 5, 70, 0, 18, 0, "Stun", 5, 70, 0, 14, 0, , , , , , , , , , , , , , , , , , , , , , , , , 0, 0, 0, 0],
		["Barbarian", "1hs-Normal", 100, 24, 561, 5, 1, 28, 515, "mercX101", "mercX167", 9000, 120, 288, 18, 180, 10, 101, 15, 63, 10, 150, 20, 1, 16, 20, 6, 56, 7, "swor", , , 50, "Bash", 5, 15, 0, 4, 10, "Stun", 5, 15, 0, 3, 8, , , , , , , , , , , , , , , , , , , , , , , , , 0, 0, 0, 0],
		["Barbarian", "1hs-Normal", 100, 24, 561, 5, 1, 58, 515, "mercX101", "mercX167", 9000, 120, 828, 27, 480, 35, 158, 15, 101, 10, 750, 35, 1, 39, 43, 8, 109, 7, "swor", , , 50, "Bash", 5, 50, 0, 14, 10, "Stun", 5, 50, 0, 11, 8, , , , , , , , , , , , , , , , , , , , , , , , , 0, 0, 0, 0],
		["Barbarian", "1hs-Normal", 100, 24, 561, 5, 1, 80, 515, "mercX101", "mercX167", 9000, 120, 1422, 45, 1250, 50, 200, 15, 129, 10, 1520, 45, 1, 61, 65, 8, 148, 4, "swor", , , 50, "Bash", 5, 75, 0, 21, 0, "Stun", 5, 75, 0, 17, 0, , , , , , , , , , , , , , , , , , , , , , , , , 0, 0, 0, 0],
		["Barbarian", "1hs-Normal", 100, 25, 561, 5, 1, 28, 515, "mercX101", "mercX167", 9000, 120, 288, 18, 180, 10, 101, 15, 63, 10, 150, 20, 1, 16, 20, 6, 56, 7, "swor", , , 50, "Bash", 5, 15, 0, 4, 10, "Stun", 5, 15, 0, 3, 8, , , , , , , , , , , , , , , , , , , , , , , , , 0, 0, 0, 0],
		["Barbarian", "1hs-Normal", 100, 25, 561, 5, 1, 58, 515, "mercX101", "mercX167", 9000, 120, 828, 27, 480, 35, 158, 15, 101, 10, 750, 35, 1, 39, 43, 8, 109, 7, "swor", , , 50, "Bash", 5, 50, 0, 14, 10, "Stun", 5, 50, 0, 11, 8, , , , , , , , , , , , , , , , , , , , , , , , , 0, 0, 0, 0],
		["Barbarian", "1hs-Normal", 100, 25, 561, 5, 1, 80, 515, "mercX101", "mercX167", 9000, 120, 1422, 45, 1250, 50, 200, 15, 129, 10, 1520, 45, 1, 61, 65, 8, 148, 4, "swor", , , 50, "Bash", 5, 75, 0, 21, 0, "Stun", 5, 75, 0, 17, 0, , , , , , , , , , , , , , , , , , , , , , , , , 0, 0, 0, 0],
		["Barbarian", "1hs-Nightmare", 100, 26, 561, 5, 2, 58, 515, "mercX101", "mercX167", 18000, 130, 745, 27, 432, 35, 155, 15, 96, 10, 675, 35, 4, 37, 41, 8, 106, 7, "swor", , , 50, "Bash", 5, 50, 0, 13, 10, "Stun", 5, 50, 0, 10, 8, , , , , , , , , , , , , , , , , , , , , , , , , 0, 0, 0, 0],
		["Barbarian", "1hs-Nightmare", 100, 26, 561, 5, 2, 80, 515, "mercX101", "mercX167", 18000, 130, 1339, 45, 1202, 50, 197, 15, 124, 10, 1445, 45, 4, 59, 63, 8, 145, 4, "swor", , , 50, "Bash", 5, 75, 0, 20, 0, "Stun", 5, 75, 0, 16, 0, , , , , , , , , , , , , , , , , , , , , , , , , 0, 0, 0, 0],
		["Barbarian", "1hs-Nightmare", 100, 27, 561, 5, 2, 58, 515, "mercX101", "mercX167", 18000, 130, 745, 27, 432, 35, 155, 15, 96, 10, 675, 35, 4, 37, 41, 8, 106, 7, "swor", , , 50, "Bash", 5, 50, 0, 13, 10, "Stun", 5, 50, 0, 10, 8, , , , , , , , , , , , , , , , , , , , , , , , , 0, 0, 0, 0],
		["Barbarian", "1hs-Nightmare", 100, 27, 561, 5, 2, 80, 515, "mercX101", "mercX167", 18000, 130, 1339, 45, 1202, 50, 197, 15, 124, 10, 1445, 45, 4, 59, 63, 8, 145, 4, "swor", , , 50, "Bash", 5, 75, 0, 20, 0, "Stun", 5, 75, 0, 16, 0, , , , , , , , , , , , , , , , , , , , , , , , , 0, 0, 0, 0],
		["Barbarian", "1hs-Hell", 100, 28, 561, 5, 3, 80, 515, "mercX101", "mercX167", 32000, 140, 1205, 45, 1082, 50, 194, 15, 119, 10, 1301, 45, 6, 57, 61, 8, 142, 4, "swor", , , 50, "Bash", 5, 70, 0, 19, 0, "Stun", 5, 70, 0, 15, 0, , , , , , , , , , , , , , , , , , , , , , , , , 0, 0, 0, 0],
		["Barbarian", "1hs-Hell", 100, 29, 561, 5, 3, 80, 515, "mercX101", "mercX167", 32000, 140, 1205, 45, 1082, 50, 194, 15, 119, 10, 1301, 45, 6, 57, 61, 8, 142, 4, "swor", , , 50, "Bash", 5, 70, 0, 19, 0, "Stun", 5, 70, 0, 15, 0, , , , , , , , , , , , , , , , , , , , , , , , , 0, 0, 0, 0]
	];
});
