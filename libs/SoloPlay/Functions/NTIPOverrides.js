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

/** @constructor */
function NTIPList () {
  /** @type {Array<Array<function>>} */
  this.list = [];
  /** @type {Array<{ line: string, file: string, string: string }>} */
  this.strArray = [];
}

NTIPList.prototype.add = function (parsedLine, info) {
  this.list.push(parsedLine);
  this.strArray.push(info);
};

NTIPList.prototype.remove = function (index) {
  this.list.splice(index, 1);
  this.strArray.splice(index, 1);
};

NTIPList.prototype.clear = function () {
  this.list = [];
  this.strArray = [];
};
// think this might be ugly but want to work on seperating soloplay from the base so pickits don't interfere
NTIP.SoloList = new NTIPList();
NTIP.Runtime = new NTIPList();
NTIP.FinalGear = new NTIPList();
NTIP.NoTier = new NTIPList();
// handle regular pickits
NTIP.CheckList = new NTIPList();
// NTIP.CheckListNoTier = new NTIPList(); // all items in a normal pickit are treated as no tier

NTIP.generateTierFunc = function (tierType) {
  return /** @param {ItemUnit} item */ function (item) {
    let tier = -1;

    const updateTier = function (wanted) {
      const tmpTier = wanted[tierType](item);

      if (tier < tmpTier) {
        tier = tmpTier;
      }
    };

    // Go through ALL lines that describe the item
    for (let i = 0; i < NTIP.SoloList.list.length; i++) {
      if (NTIP.SoloList.list[i].length !== 3) {
        continue;
      }

      const [type, stat, wanted] = NTIP.SoloList.list[i];

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
          const info = NTIP.SoloList.strArray[i];
          Misc.errorReport(
            "ÿc1Pickit Tier (" + tierType + ") error! Line # ÿc2"
            + info.line + " ÿc1Entry: ÿc0" + info.string
            + " (" + info.file + ") Error message: " + e.message
            + " Trigger item: " + item.fname.split("\n").reverse().join(" ")
          );
        }
      }
    }

    return tier;
  };
};

/**
 * @function
 * @param {ItemUnit} item
 */
NTIP.GetTier = NTIP.generateTierFunc("Tier");

/**
 * @function
 * @param {ItemUnit} item
 */
NTIP.GetMercTier = NTIP.generateTierFunc("Merctier");

/**
 * @function
 * @param {ItemUnit} item
 */
NTIP.GetCharmTier = NTIP.generateTierFunc("Charmtier");

/**
 * @function
 * @param {ItemUnit} item
 */
NTIP.GetSecondaryTier = NTIP.generateTierFunc("Secondarytier");

NTIP.addLine = function (itemString, filename = "Kolbot-SoloPlay") {
  const tierdItem = itemString.toLowerCase().includes("tier");
  const info = {
    line: tierdItem
      ? NTIP.SoloList.list.length + 1
      : NTIP.NoTier.list.length + 1,
    file: filename,
    string: itemString
  };

  const line = NTIP.ParseLineInt(itemString, info);

  if (line) {
    tierdItem
      ? NTIP.SoloList.add(line, info)
      : NTIP.NoTier.add(line, info);
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

      NTIP.FinalGear.add(line, info);
    }
  }

  return true;
};

// currently just using for quiver's but if that changes need to figure out way to seperate out sections
// so things can be deleted without affecting the entire list
NTIP.addToRuntime = function (itemString) {
  const info = {
    line: NTIP.Runtime.list.length + 1,
    file: "Kolbot-SoloPlay-Runtime",
    string: itemString
  };

  const line = NTIP.ParseLineInt(itemString, info);

  if (line) {
    NTIP.Runtime.add(line, info);
  }

  return true;
};

NTIP.buildList = function (...arraystoloop) {
  const filename = (new Error()).stack.match(/[^\r\n]+/g).at(1).split("\\").last() || "";
  for (let arr of arraystoloop) {
    if (Array.isArray(arr)) {
      for (let str of arr) {
        NTIP.addLine(str, filename);
      }
    }
  }

  return true;
};

/**
 * @param {ItemUnit} item 
 * @param {NTIPList} entryList 
 * @param {boolean} verbose 
 */
NTIP.hasStats = function (item, entryList, verbose = false) {
  let stats;
  let hasStat = false;
  let line = "";
  const list = entryList && entryList.hasOwnProperty("list") && entryList.list.length
    ? entryList.list
    : NTIP.SoloList.list;
  const stringArr = entryList && entryList.hasOwnProperty("strArray") && entryList.strArray.length
    ? entryList.strArray
    : NTIP.SoloList.strArray;

  for (let i = 0; i < list.length; i++) {
    try {
      let [type, stat] = list[i];

      if (typeof type !== "function" || typeof stat !== "function") {
        continue;
      }
      if (type(item)) {
        if (stat(item)) {
          hasStat = true;
          stats = stat;
          line = stringArr[i].file + " #" + stringArr[i].line + " " + stringArr[i].string;

          break;
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
/**
 * @param {ItemUnit} item 
 * @param {NTIPList} entryList 
 */
NTIP.getInvoQuantity = function (item, entryList) {
  const list = entryList && entryList.hasOwnProperty("list") && entryList.list.length
    ? entryList.list
    : NTIP.SoloList.list;

  for (let el of list) {
    try {
      const [type, stat, wanted] = el;

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

/**
 * @param {ItemUnit} item 
 * @param {NTIPList} entryList 
 */
NTIP.getMaxQuantity = function (item, entryList) {
  const list = entryList && entryList.hasOwnProperty("list") && entryList.list.length
    ? entryList.list
    : NTIP.SoloList.list;

  for (let el of list) {
    try {
      let [type, stat, wanted] = el;

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

/**
 * @param {ItemUnit} item 
 * @param {NTIPList} entryList 
 * @param {boolean} verbose 
 */
NTIP.CheckItem = function (item, entryList, verbose = false) {
  let rval = {};
  let result = 0;
  const identified = item.getFlag(sdk.items.flags.Identified);

  /**
   * @param {any[]} list 
   * @param {string[]} stringArr 
   * @returns 
   */
  const iterateList = function (list, stringArr) {
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
                    if (item.getParent() && item.getParent().name === me.name
                      && item.mode === sdk.items.mode.inStorage
                      && num === wanted.MaxQuantity) {
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
                  if (item.getParent() && item.getParent().name === me.name
                    && item.mode === sdk.items.mode.inStorage
                    && num === wanted.MaxQuantity) {
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
                if (item.getParent() && item.getParent().name === me.name
                  && item.mode === sdk.items.mode.inStorage
                  && num === wanted.MaxQuantity) {
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
          Misc.errorReport(
            "ÿc1Pickit error! Line # ÿc2" + stringArr[i].line
            + " ÿc1Entry: ÿc0" + stringArr[i].string + " (" + stringArr[i].file
            + ") Error message: " + pickError.message
            + " Trigger item: " + item.fname.split("\n").reverse().join(" ")
          );
          list.splice(i, 1); // Remove the element from the list
          stringArr.splice(i, 1); // Remove the element from the list
        } else {
          Misc.errorReport("ÿc1Pickit error in runeword config!");
        }

        result = 0;
      }
    }

    if (verbose) {
      if (!identified && result === 1) {
        result = -1;
      }

      rval.result = result;
      rval.line = (function () {
        if (stringArr[i] === undefined) return null;
        return result === 1
          ? stringArr[i].file + " #" + stringArr[i].line + " [" + stringArr[i].string + "]"
          : null;
      })();

      return rval;
    }

    return result;
  };

  if (entryList && entryList.hasOwnProperty("list") && Array.isArray(entryList.list)) {
    return iterateList(entryList.list, entryList.strArray);
  }

  const listOfLists = [
    NTIP.SoloList,
    NTIP.NoTier,
    NTIP.Runtime,
    NTIP.CheckList,
  ];

  for (let obj of listOfLists) {
    iterateList(obj.list, obj.strArray);
    if (verbose ? rval.result !== 0 : result !== 0) {
      break;
    }
  }

  return verbose ? rval : result;
};

/**
 * @param {string} filepath 
 * @param {boolean} notify 
 * @returns {boolean}
 */
NTIP.OpenFile = function (filepath, notify) {
  if (!FileTools.exists(filepath)) {
    if (notify) {
      Misc.errorReport("ÿc1NIP file doesn't exist: ÿc0" + filepath);
    }

    return false;
  }

  let nipfile, tick = getTickCount(), entries = 0;
  const filename = filepath.substring(filepath.lastIndexOf("/") + 1, filepath.length);

  try {
    nipfile = File.open(filepath, 0);
  } catch (fileError) {
    notify && Misc.errorReport("ÿc1Failed to load NIP: ÿc0" + filename);
  }

  if (!nipfile) return false;

  let lines = nipfile.readAllLines();
  let lineNumber = 1;
  nipfile.close();

  /**
   * @note removed tier'd check for normal pick files as soloplay handles that
   */
  for (let entry of lines) {
    const info = {
      index: NTIP.CheckList.list.length + 1,
      line: lineNumber,
      file: filename,
      string: entry
    };

    let line = NTIP.ParseLineInt(entry, info);

    if (line) {
      NTIP.CheckList.add(line, info);
      entries++;
    }
    lineNumber++;
  }

  if (notify) {
    console.log(
      "ÿc4Loaded NIP: ÿc2" + filename + "ÿc4. Lines: ÿc2" + lines.length
      + "ÿc4. Valid entries: ÿc2" + entries
      + ". ÿc4Time: ÿc2" + (getTickCount() - tick) + " ms"
    );
  }

  return true;
};

NTIP.ParseLineInt = function (input, info) {
  let i, property, p_start, p_section, p_keyword, value;

  let p_end = input.indexOf("//");

  if (p_end !== -1) {
    input = input.substring(0, p_end);
  }

  input = input.replace(/\s+/g, "").toLowerCase();

  if (input.length < 5) {
    return null;
  }

  const _props = new Map([
    ["wsm", 'getBaseStat("items", item.classid, "speed")'],
    ["weaponspeed", 'getBaseStat("items", item.classid, "speed")'],
    ["minimumsockets", 'getBaseStat("items", item.classid, "gemsockets")'],
    ["strreq", "item.strreq"],
    ["dexreq", "item.dexreq"],
    ["2handed", 'getBaseStat("items", item.classid, "2handed")'],
    ["color", "item.getColor()"],
    ["type", "item.itemType"],
    ["name", "item.classid"],
    ["classid", "item.classid"],
    ["class", "item.itemclass"],
    ["quality", "item.quality"],
    ["level", "item.ilvl"],
    ["europe", '("' + me.realm.toLowerCase() + '"===" europe")'],
    ["uswest", '("' + me.realm.toLowerCase() + '"===" uswest")'],
    ["useast", '("' + me.realm.toLowerCase() + '"===" useast")'],
    ["asia", '("' + me.realm.toLowerCase() + '"===" asia")'],
    ["ladder", "me.ladder"],
    ["hardcore", "(!!me.playertype)"],
    ["classic", "(!me.gametype)"],
    ["distance", "(item.onGroundOrDropping && item.distance || Infinity)"],
  ]);

  let p_result = input.split("#");

  if (p_result[0] && p_result[0].length > 4) {
    p_section = p_result[0].split("[");

    p_result[0] = p_section[0];

    for (i = 1; i < p_section.length; i += 1) {
      p_end = p_section[i].indexOf("]") + 1;
      property = p_section[i].substring(0, p_end - 1);

      switch (property) {
      case "flag":
        if (p_section[i][p_end] === "!") {
          p_result[0] += "!item.getFlag(";
        } else {
          p_result[0] += "item.getFlag(";
        }

        p_end += 2;

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
      default:
        if (!_props.has(property)) {
          Misc.errorReport("Unknown property: " + property + " File: " + info.file + " Line: " + info.line);
          
          return false;
        }
        p_result[0] += _props.get(property);
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
        try {
          switch (property) {
          case "color":
            if (NTIPAliasColor[p_keyword] === undefined) {
              throw new Error("Unknown color: " + p_keyword + " File: " + info.file + " Line: " + info.line);
            }

            p_result[0] += NTIPAliasColor[p_keyword];

            break;
          case "type":
            if (NTIPAliasType[p_keyword] === undefined) {
              throw new Error("Unknown type: " + p_keyword + " File: " + info.file + " Line: " + info.line);
            }

            p_result[0] += NTIPAliasType[p_keyword];

            break;
          case "name":
            if (NTIPAliasClassID[p_keyword] === undefined) {
              throw new Error("Unknown name: " + p_keyword + " File: " + info.file + " Line: " + info.line);
            }

            p_result[0] += NTIPAliasClassID[p_keyword];

            break;
          case "class":
            if (NTIPAliasClass[p_keyword] === undefined) {
              throw new Error("Unknown class: " + p_keyword + " File: " + info.file + " Line: " + info.line);
            }

            p_result[0] += NTIPAliasClass[p_keyword];

            break;
          case "quality":
            if (NTIPAliasQuality[p_keyword] === undefined) {
              throw new Error("Unknown quality: " + p_keyword + " File: " + info.file + " Line: " + info.line);
            }

            p_result[0] += NTIPAliasQuality[p_keyword];

            break;
          case "flag":
            if (NTIPAliasFlag[p_keyword] === undefined) {
              throw new Error("Unknown flag: " + p_keyword + " File: " + info.file + " Line: " + info.line);
            }

            p_result[0] += NTIPAliasFlag[p_keyword] + ")";

            break;
          case "prefix":
          case "suffix":
            p_result[0] += "\"" + p_keyword + "\")";

            break;
          }
        } catch (e) {
          Misc.errorReport(e);

          return false;
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

      /** @type {string} */
      let keyword = p_keyword.toLowerCase();

      switch (keyword) {
      // Charm equip specific
      case "invoquantity":
        let quantity = Number(p_section[i].split("==")[1].match(/\d+/g));

        if (!isNaN(quantity)) {
          p_result[2].InvoQuantity = quantity;
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
          p_result[2][keyword.capitalize()] = (new Function("return function(item) { return " + p_section[i].split("==")[1] + ";}")).call(null); // generate function out of
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
