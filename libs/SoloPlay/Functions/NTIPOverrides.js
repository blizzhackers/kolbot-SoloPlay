/* eslint-disable dot-notation */
/**
*  @filename    NTIPOverrides.js
*  @author      theBGuy, isid0re
*  @desc        NTIPItemParser changes for AutoEquip
*
*/

includeIfNotIncluded("core/NTItemParser.js");
includeIfNotIncluded("SoloPlay/Functions/PrototypeOverrides.js");

/**
 * @todo
 *  - need a way to build and update/remove elements from checklists during gameplay
 *  - Build parser, takes obj then coverts to normal nip string
 */

NTIPAliasStat["addfireskills"] = [sdk.stats.ElemSkill, 1];
NTIPAliasStat["plusskillwhirlwind"] = [sdk.stats.NonClassSkill, sdk.skills.Whirlwind];
NTIP.MAX_TIER = 100000;
// think this might be ugly but want to work on seperating soloplay from the base so pickits don't interfere
NTIP.RuntimeCheckList = [];
NTIP.RuntimeStringArray = [];
NTIP.SoloCheckList = [];
NTIP.SoloCheckListNoTier = [];
NTIP.SoloStringArray = [];
NTIP.FinalGear = {
	list: [],
	strArray: [],
};

NTIP.generateTierFunc = function (tierType) {
	return function (item) {
		let tier = -1;

		const updateTier = (wanted) => {
			const tmpTier = wanted[tierType](item);

			if (tier < tmpTier) {
				tier = tmpTier;
			}
		};

		// Go through ALL lines that describe the item
		for (let i = 0; i < NTIP.SoloCheckList.length; i += 1) {
			if (NTIP.SoloCheckList[i].length !== 3) {
				continue;
			}

			const [type, stat, wanted] = NTIP.SoloCheckList[i];

			// If the line doesnt have a tier of this type, we dont need to call it
			if (typeof wanted === "object" && wanted && typeof wanted[tierType] === "function") {
				try {
					if (typeof type === "function") {
						if (type(item)) {
							if (typeof stat === "function") {
								if (stat(item)) {
									updateTier(wanted);
								}
							} else {
								updateTier(wanted);
							}
						}
					} else if (typeof stat === "function") {
						if (stat(item)) {
							updateTier(wanted);
						}
					}
				} catch (e) {
					const info = NTIP.SoloStringArray[i];
					Misc.errorReport("ÿc1Pickit Tier (" + tierType + ") error! Line # ÿc2" + info.line + " ÿc1Entry: ÿc0" + info.string + " (" + info.file + ") Error message: " + e.message + " Trigger item: " + item.fname.split("\n").reverse().join(" "));
				}
			}
		}

		return tier;
	};
};

/**
 * @function
 * @param item
 */
NTIP.GetTier = NTIP.generateTierFunc("Tier");

/**
 * @function
 * @param item
 */
NTIP.GetMercTier = NTIP.generateTierFunc("Merctier");

/**
 * @function
 * @param item
 */
NTIP.GetCharmTier = NTIP.generateTierFunc("Charmtier");

/**
 * @function
 * @param item
 */
NTIP.GetSecondaryTier = NTIP.generateTierFunc("Secondarytier");

NTIP.addLine = function (itemString) {
	const info = {
		line: NTIP.SoloCheckList.length + 1,
		file: "Kolbot-SoloPlay",
		string: itemString
	};

	const line = NTIP.ParseLineInt(itemString, info);

	if (line) {
		if (!itemString.toLowerCase().includes("tier")) {
			NTIP.SoloCheckListNoTier.push(line);
		} else {
			NTIP.SoloCheckListNoTier.push([false, false]);
		}

		NTIP.SoloCheckList.push(line);
		NTIP.SoloStringArray.push(info);
	}

	return true;
};

/**
 * @param {string[]} arr 
 * @returns {boolean}
 */
NTIP.buildFinalGear = function (arr) {
	for (let i = 0; i < arr.length; i++) {
		const info = {
			line: NTIP.FinalGear.list.length + 1,
			file: "Kolbot-SoloPlay",
			string: arr[i]
		};

		/** @type {string} */
		const line = NTIP.ParseLineInt(arr[i], info);

		if (line) {
			let lineCheck = arr[i].toLowerCase();

			switch (true) {
			case !lineCheck.includes("tier"):
			case lineCheck.includes("merctier"):
			case lineCheck.includes("secondarytier"):
			case lineCheck.includes("charmtier"):
				continue;
			}

			NTIP.FinalGear.list.push(line);
			NTIP.FinalGear.strArray.push(info);
		}
	}

	return true;
};

// currently just using for quiver's but if that changes need to figure out way to seperate out sections
// so things can be deleted without affecting the entire list
NTIP.addToRuntime = function (itemString) {
	const info = {
		line: NTIP.RuntimeCheckList.length + 1,
		file: "Kolbot-SoloPlay-Runtime",
		string: itemString
	};

	const line = NTIP.ParseLineInt(itemString, info);

	if (line) {
		NTIP.RuntimeCheckList.push(line);
		NTIP.RuntimeStringArray.push(info);
	}

	return true;
};

NTIP.resetRuntimeList = () => {
	NTIP.RuntimeCheckList.length = 0;
	NTIP.RuntimeStringArray.length = 0;
};

NTIP.buildList = function (...arraystoloop) {
	for (let arr of arraystoloop) {
		if (Array.isArray(arr)) {
			for (let i = 0; i < arr.length; i++) {
				NTIP.addLine(arr[i]);
			}
		}
	}

	return true;
};

NTIP.hasStats = function (item, entryList = [], verbose = false) {
	let hasStat = false, line = "", stats;
	const list = entryList.length ? entryList : NTIP.SoloCheckList;
	const stringArr = entryList.length ? stringArray : NTIP.SoloStringArray;

	for (let i = 0; i < list.length; i++) {
		try {
			// eslint-disable-next-line no-unused-vars
			let [type, stat, wanted] = list[i];

			if (typeof type === "function") {
				if (type(item)) {
					if (typeof stat === "function") {
						if (stat(item)) {
							hasStat = true;
							stats = stat;
							line = stringArr[i].file + " #" + stringArr[i].line + " " + stringArr[i].string;

							break;
						}
					} else {
						hasStat = false;

						break;
					}
				}
			}
		} catch (e) {
			console.log(e);
			hasStat = false;

			break;
		}
	}

	if (hasStat && verbose) {
		console.debug(stats);
		console.debug(line);
	}

	return hasStat;
};

// this method for charms needs work
NTIP.getInvoQuantity = function (item, entryList = []) {
	const list = entryList.length ? entryList : NTIP.SoloCheckList;

	for (let i = 0; i < list.length; i++) {
		try {
			const [type, stat, wanted] = list[i];

			if (typeof type === "function") {
				if (type(item)) {
					if (typeof stat === "function") {
						if (stat(item)) {
							if (wanted && wanted.InvoQuantity && !isNaN(wanted.InvoQuantity)) {
								return wanted.InvoQuantity;
							}
						}
					} else {
						if (wanted && wanted.InvoQuantity && !isNaN(wanted.InvoQuantity)) {
							return wanted.InvoQuantity;
						}
					}
				}
			} else if (typeof stat === "function") {
				if (stat(item)) {
					if (wanted && wanted.InvoQuantity && !isNaN(wanted.InvoQuantity)) {
						return wanted.InvoQuantity;
					}
				}
			}
		} catch (e) {
			return -1;
		}
	}

	return -1;
};

NTIP.getMaxQuantity = function (item, entryList = []) {
	const list = entryList.length ? entryList : NTIP.SoloCheckList;

	for (let i = 0; i < list.length; i++) {
		try {
			let [type, stat, wanted] = list[i];

			if (typeof type === "function") {
				if (type(item)) {
					if (typeof stat === "function") {
						if (stat(item)) {
							if (wanted && wanted.MaxQuantity && !isNaN(wanted.MaxQuantity)) {
								return wanted.MaxQuantity;
							}
						}
					} else {
						if (wanted && wanted.MaxQuantity && !isNaN(wanted.MaxQuantity)) {
							return wanted.MaxQuantity;
						}
					}
				}
			} else if (typeof stat === "function") {
				if (stat(item)) {
					if (wanted && wanted.MaxQuantity && !isNaN(wanted.MaxQuantity)) {
						return wanted.MaxQuantity;
					}
				}
			}
		} catch (e) {
			return -1;
		}
	}

	return -1;
};

NTIP.CheckItem = function (item, entryList, verbose = false) {
	let rval = {};
	let result = 0;
	const identified = item.getFlag(sdk.items.flags.Identified);

	/**
	 * 
	 * @param {any[]} list 
	 * @param {string[]} stringArr 
	 * @returns 
	 */
	const iterateList = (list, stringArr) => {
		let i, num;

		for (i = 0; i < list.length; i++) {
			try {
				// Get the values in separated variables (its faster)
				const [type, stat, wanted] = list[i];

				if (typeof type === "function") {
					if (type(item)) {
						if (typeof stat === "function") {
							if (stat(item)) {
								if (wanted && wanted.MaxQuantity && !isNaN(wanted.MaxQuantity)) {
									num = NTIP.CheckQuantityOwned(type, stat);

									if (num < wanted.MaxQuantity) {
										result = 1;

										break;
									} else {
										// attempt at inv fix for maxquantity
										if (item.getParent() && item.getParent().name === me.name && item.mode === sdk.items.mode.inStorage && num === wanted.MaxQuantity) {
											result = 1;

											break;
										}
									}
								} else {
									result = 1;

									break;
								}
							} else if (!identified && result === 0 || !identified && result === 1) {
								result = -1;

								if (verbose && stringArr[i] !== undefined) {
									rval.line = stringArr[i].file + " #" + stringArr[i].line;
								}
							}
						} else {
							if (wanted && wanted.MaxQuantity && !isNaN(wanted.MaxQuantity)) {
								num = NTIP.CheckQuantityOwned(type, null);

								if (num < wanted.MaxQuantity) {
									result = 1;

									break;
								} else {
									// attempt at inv fix for maxquantity
									if (item.getParent() && item.getParent().name === me.name && item.mode === sdk.items.mode.inStorage && num === wanted.MaxQuantity) {
										result = 1;

										break;
									}
								}
							} else {
								result = 1;

								break;
							}
						}
					}
				} else if (typeof stat === "function") {
					if (stat(item)) {
						if (wanted && wanted.MaxQuantity && !isNaN(wanted.MaxQuantity)) {
							num = NTIP.CheckQuantityOwned(null, stat);

							if (num < wanted.MaxQuantity) {
								result = 1;

								break;
							} else {
								// attempt at inv fix for maxquantity
								if (item.getParent() && item.getParent().name === me.name && item.mode === sdk.items.mode.inStorage && num === wanted.MaxQuantity) {
									result = 1;

									break;
								}
							}
						} else {
							result = 1;

							break;
						}
					} else if (!identified && result === 0 || !identified && result === 1) {
						result = -1;

						if (verbose && stringArr[i] !== undefined) {
							rval.line = stringArr[i].file + " #" + stringArr[i].line;
						}
					}
				}
			} catch (pickError) {
				showConsole();

				if (!entryList) {
					Misc.errorReport("ÿc1Pickit error! Line # ÿc2" + stringArr[i].line + " ÿc1Entry: ÿc0" + stringArr[i].string + " (" + stringArr[i].file + ") Error message: " + pickError.message + " Trigger item: " + item.fname.split("\n").reverse().join(" "));

					list.splice(i, 1); // Remove the element from the list
				} else {
					Misc.errorReport("ÿc1Pickit error in runeword config!");
				}

				result = 0;
			}
		}

		if (verbose) {
			rval.result = result;
			rval.line = (() => {
				if (stringArr[i] === undefined) return null;
				return result === 1 ? stringArr[i].file + " #" + stringArr[i].line : null;
			})();

			if (!identified && result === 1) {
				rval.result = -1;
			}

			return rval;
		}

		return result;
	};

	const listOfLists = [
		[NTIP.SoloCheckList, NTIP.SoloStringArray],
		[NTIP_CheckList, stringArray],
		[NTIP.RuntimeCheckList, NTIP.RuntimeStringArray]
	];
	if (Array.isArray(entryList)) return iterateList(entryList, stringArray);

	for (let i = 0; i < listOfLists.length; i++) {
		iterateList(listOfLists[i][0], listOfLists[i][1]);
		if ((verbose && rval.result !== 0) || (!verbose && result !== 0)) {
			break;
		}
	}

	return verbose ? rval : result;
};

NTIP.OpenFile = function (filepath, notify) {
	if (!FileTools.exists(filepath)) {
		if (notify) {
			Misc.errorReport("ÿc1NIP file doesn't exist: ÿc0" + filepath);
		}

		return false;
	}

	let nipfile, tick = getTickCount(), entries = 0;
	let filename = filepath.substring(filepath.lastIndexOf("/") + 1, filepath.length);

	try {
		nipfile = File.open(filepath, 0);
	} catch (fileError) {
		notify && Misc.errorReport("ÿc1Failed to load NIP: ÿc0" + filename);
	}

	if (!nipfile) return false;

	let lines = nipfile.readAllLines();
	nipfile.close();

	for (let i = 0; i < lines.length; i += 1) {
		const info = {
			line: i + 1,
			file: filename,
			string: lines[i]
		};

		let line = NTIP.ParseLineInt(lines[i], info);

		if (line) {
			entries += 1;
			NTIP_CheckList.push(line);

			if (!lines[i].toLowerCase().match("tier")) {
				NTIP_CheckListNoTier.push(line);
			} else {
				NTIP_CheckListNoTier.push([false, false]);
			}

			stringArray.push(info);
		}
	}

	if (notify) {
		console.log("ÿc4Loaded NIP: ÿc2" + filename + "ÿc4. Lines: ÿc2" + lines.length + "ÿc4. Valid entries: ÿc2" + entries + ". ÿc4Time: ÿc2" + (getTickCount() - tick) + " ms");
	}

	return true;
};

NTIP.ParseLineInt = function (input, info) {
	let i, property, p_start, p_end, p_section, p_keyword, p_result, value;

	p_end = input.indexOf("//");

	if (p_end !== -1) {
		input = input.substring(0, p_end);
	}

	input = input.replace(/\s+/g, "").toLowerCase();

	if (input.length < 5) {
		return null;
	}

	p_result = input.split("#");

	if (p_result[0] && p_result[0].length > 4) {
		p_section = p_result[0].split("[");

		p_result[0] = p_section[0];

		for (i = 1; i < p_section.length; i += 1) {
			p_end = p_section[i].indexOf("]") + 1;
			property = p_section[i].substring(0, p_end - 1);

			switch (property) {
			case "wsm":
			case "weaponspeed":
				p_result[0] += 'getBaseStat("items", item.classid, "speed")';

				break;
			case "minimumsockets":
				p_result[0] += 'getBaseStat("items", item.classid, "gemsockets")';

				break;
			case "strreq":
				p_result[0] += "item.strreq";

				break;
			case "dexreq":
				p_result[0] += "item.dexreq";

				break;
			case "2handed":
				p_result[0] += 'getBaseStat("items", item.classid, "2handed")';

				break;
			case "color":
				p_result[0] += "item.getColor()";

				break;
			case "type":
				p_result[0] += "item.itemType";

				break;
			case "name":
				p_result[0] += "item.classid";

				break;
			case "class":
				p_result[0] += "item.itemclass";

				break;
			case "quality":
				p_result[0] += "item.quality";

				break;
			case "flag":
				if (p_section[i][p_end] === "!") {
					p_result[0] += "!item.getFlag(";
				} else {
					p_result[0] += "item.getFlag(";
				}

				p_end += 2;

				break;
			case "level":
				p_result[0] += "item.ilvl";

				break;
			case "prefix":
				if (p_section[i][p_end] === "!") {
					p_result[0] += "!item.getPrefix(";
				} else {
					p_result[0] += "item.getPrefix(";
				}

				p_end += 2;

				break;
			case "suffix":
				if (p_section[i][p_end] === "!") {
					p_result[0] += "!item.getSuffix(";
				} else {
					p_result[0] += "item.getSuffix(";
				}

				p_end += 2;

				break;
			case "europe":
			case "uswest":
			case "useast":
			case "asia":
				p_result[0] += '("' + me.realm.toLowerCase() + '"==="' + property.toLowerCase() + '")';

				break;
			case "ladder":
				p_result[0] += "me.ladder";

				break;
			case "hardcore":
				p_result[0] += "(!!me.playertype)";

				break;
			case "classic":
				p_result[0] += "(!me.gametype)";

				break;
			default:
				Misc.errorReport("Unknown property: " + property + " File: " + info.file + " Line: " + info.line);

				return false;
			}

			for (p_start = p_end; p_end < p_section[i].length; p_end += 1) {
				if (!NTIP.IsSyntaxInt(p_section[i][p_end])) {
					break;
				}
			}

			p_result[0] += p_section[i].substring(p_start, p_end);

			if (p_section[i].substring(p_start, p_end) === "=") {
				Misc.errorReport("Unexpected = at line " + info.line + " in " + info.file);

				return false;
			}

			for (p_start = p_end; p_end < p_section[i].length; p_end += 1) {
				if (NTIP.IsSyntaxInt(p_section[i][p_end])) {
					break;
				}
			}

			p_keyword = p_section[i].substring(p_start, p_end);

			if (isNaN(p_keyword)) {
				switch (property) {
				case "color":
					if (NTIPAliasColor[p_keyword] === undefined) {
						Misc.errorReport("Unknown color: " + p_keyword + " File: " + info.file + " Line: " + info.line);

						return false;
					}

					p_result[0] += NTIPAliasColor[p_keyword];

					break;
				case "type":
					if (NTIPAliasType[p_keyword] === undefined) {
						Misc.errorReport("Unknown type: " + p_keyword + " File: " + info.file + " Line: " + info.line);

						return false;
					}

					p_result[0] += NTIPAliasType[p_keyword];

					break;
				case "name":
					if (NTIPAliasClassID[p_keyword] === undefined) {
						Misc.errorReport("Unknown name: " + p_keyword + " File: " + info.file + " Line: " + info.line);

						return false;
					}

					p_result[0] += NTIPAliasClassID[p_keyword];

					break;
				case "class":
					if (NTIPAliasClass[p_keyword] === undefined) {
						Misc.errorReport("Unknown class: " + p_keyword + " File: " + info.file + " Line: " + info.line);

						return false;
					}

					p_result[0] += NTIPAliasClass[p_keyword];

					break;
				case "quality":
					if (NTIPAliasQuality[p_keyword] === undefined) {
						Misc.errorReport("Unknown quality: " + p_keyword + " File: " + info.file + " Line: " + info.line);

						return false;
					}

					p_result[0] += NTIPAliasQuality[p_keyword];

					break;
				case "flag":
					if (NTIPAliasFlag[p_keyword] === undefined) {
						Misc.errorReport("Unknown flag: " + p_keyword + " File: " + info.file + " Line: " + info.line);

						return false;
					}

					p_result[0] += NTIPAliasFlag[p_keyword] + ")";

					break;
				case "prefix":
				case "suffix":
					p_result[0] += "\"" + p_keyword + "\")";

					break;
				}
			} else {
				if (property === "flag" || property === "prefix" || property === "suffix") {
					p_result[0] += p_keyword + ")";
				} else {
					p_result[0] += p_keyword;
				}
			}

			p_result[0] += p_section[i].substring(p_end);
		}
	} else {
		p_result[0] = "";
	}

	if (p_result[1] && p_result[1].length > 4) {
		p_section = p_result[1].split("[");
		p_result[1] = p_section[0];

		for (i = 1; i < p_section.length; i += 1) {
			p_end = p_section[i].indexOf("]");
			p_keyword = p_section[i].substring(0, p_end);

			if (isNaN(p_keyword)) {
				if (NTIPAliasStat[p_keyword] === undefined) {
					Misc.errorReport("Unknown stat: " + p_keyword + " File: " + info.file + " Line: " + info.line);

					return false;
				}

				p_result[1] += "item.getStatEx(" + NTIPAliasStat[p_keyword] + ")";
			} else {
				p_result[1] += "item.getStatEx(" + p_keyword + ")";
			}

			p_result[1] += p_section[i].substring(p_end + 1);
		}
	} else {
		p_result[1] = "";
	}

	if (p_result[2] && p_result[2].length > 0) {
		p_section = p_result[2].split("[");
		p_result[2] = {};

		for (i = 1; i < p_section.length; i += 1) {
			p_end = p_section[i].indexOf("]");
			p_keyword = p_section[i].substring(0, p_end);

			let keyword = p_keyword.toLowerCase();

			switch (keyword) {
			// Charm equip specific
			case "invoquantity":
				let quantity = Number(p_section[i].split("==")[1].match(/\d+/g));

				if (!isNaN(quantity)) {
					p_result[2].InvoQuantity = quantity;
				}

				break;
			case "finalcharm":
				let check = Boolean(p_section[i].split("==")[1].match(/(\b(?!split\b)[^ $]+\b)/g));

				if (!isNaN(check)) {
					p_result[2].FinalCharm = check;
				}

				break;
			case "maxquantity":
				value = Number(p_section[i].split("==")[1].match(/\d+/g));

				if (!isNaN(value)) {
					p_result[2].MaxQuantity = value;
				}

				break;
			case "tier":
			case "secondarytier":
			case "charmtier":
			case "merctier":
				try {
					p_result[2][keyword.charAt(0).toUpperCase() + keyword.slice(1)] = (new Function("return function(item) { return " + p_section[i].split("==")[1] + ";}")).call(null); // generate function out of
				} catch (e) {
					Misc.errorReport("ÿc1Pickit Tier (" + keyword + ") error! Line # ÿc2" + info.line + " ÿc1Entry: ÿc0" + info.string + " (" + info.file + ") Error message: " + e.message);
				}

				break;
			default:
				Misc.errorReport("Unknown 3rd part keyword: " + p_keyword.toLowerCase() + " File: " + info.file + " Line: " + info.line);

				return false;
			}
		}
	}

	// Compile the line, to 1) remove the eval lines, and 2) increase the speed
	for (let i = 0; i < 2; i++) {
		if (p_result[i].length) {
			try {
				p_result[i] = (new Function("return function(item) { return " + p_result[i] + ";}")).call(null); // generate function out of
			} catch (e) {
				Misc.errorReport("ÿc1Pickit error! Line # ÿc2" + info.line + " ÿc1Entry: ÿc0" + info.string + " (" + info.file + ") Error message: " + e.message);

				return null ; // failed load this line so return false
			}
		} else {
			p_result[i] = undefined;
		}

	}

	return p_result;
};
