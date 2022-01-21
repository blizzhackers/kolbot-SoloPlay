var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Clear", "./sdk"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.currentWalkingPath = exports.getWalkDistance = void 0;
    var clear_1 = __importDefault(require("./Clear"));
    var sdk_1 = __importDefault(require("./sdk"));
    var getWalkDistance = function (x, y, area, xx, yy) {
        if (area === void 0) { area = me.area; }
        if (xx === void 0) { xx = me.x; }
        if (yy === void 0) { yy = me.y; }
        // distance between node x and x-1
        var path = getPath(area, x, y, xx, yy, 2, 5);
        return path && path.map(function (e, i, s) { return i && getDistance(s[i - 1], e) || 0; })
            .reduce(function (acc, cur) { return acc + cur; }, 0) || Infinity;
    };
    exports.getWalkDistance = getWalkDistance;
    var skipShrine = [];
    exports.currentWalkingPath = [];
    function moveTo(target, givenSettings) {
        var _a;
        var settings = Object.assign({}, {
            allowTeleport: true,
            startIndex: 0,
            rangeOverride: null,
            callback: undefined,
            allowClearing: true,
            clearFilter: function (m, n) { return getDistance(m, n) <= 14; },
        }, givenSettings);
        var shrinesPriority = [
            sdk_1.default.shrines.Mana,
            sdk_1.default.shrines.Experience,
            sdk_1.default.shrines.Skill,
            sdk_1.default.shrines.ManaRecharge,
            sdk_1.default.shrines.Stamina
        ];
        var stateForShrine = function (id) {
            if (id >= sdk_1.default.shrines.Armor && id <= sdk_1.default.shrines.Experience) {
                return id + 122;
            }
            return 0;
        };
        var searchShrine = function () { return getUnits(2, "shrine")
            .filter(function (el) { return el.mode === 0 && shrinesPriority.includes(el.objtype); })
            .filter(function (el) {
            // Dont do anything with shrines we already found
            if (skipShrine.includes(el.gid))
                return false;
            var currentIndex = shrinesPriority.findIndex(function (s) { return me.getState(stateForShrine(s)); });
            var index = shrinesPriority.indexOf(el.objtype);
            if (currentIndex === -1 || index <= currentIndex || stateForShrine(el.objtype) === 0) {
                if (el.objtype !== sdk_1.default.shrines.Mana || 100 / me.mpmax * me.mp >= 50) {
                    return true;
                }
                else {
                    return getDistance(me, el) <= 10;
                }
            }
            return false;
        })
            .filter(function (el) { return Pather.getWalkDistance(el.x, el.y, el.area, me.x, me.y, 0, 5) <= 40; })
            .sort(function (a, b) { return (shrinesPriority.indexOf(a.objtype) - shrinesPriority.indexOf(b.objtype)) || a.distance - b.distance; })
            .first(); };
        // convert presetunit to x,y target
        if (target instanceof PresetUnit)
            target = { x: target.roomx * 5 + target.x, y: target.roomy * 5 + target.y };

        var canTeleport = settings.allowTeleport && Pather.useTeleport();
        var clearPercentage = 100, didSkipTown = false;
        // To fix recursion issues
        var _prevpath = exports.currentWalkingPath;
        try {
            if (!Array.isArray(target))
                target = [target];
            var path_1 = target.map(function (target, index, self) {
                // The next node starts with the last node
                var fromx = !index ? me.x : self[index - 1].x, fromy = !index ? me.y : self[index - 1].y;
                // avoid d2bs issues
                if (typeof target.hook === 'undefined')
                    target.hook = undefined;
                var path = (getPath(me.area, target.x, target.y, fromx, fromy, 2, 4) || []);
                // sometimes the reduction path messes us that we dont have any path left to take (bugs in arcane)
                if (!path.length)
                    path = (getPath(me.area, target.x, target.y, fromx, fromy, 0, 4) || []);
                return path.map(function (el, idx) {
                    // last index of the path gets the hook. Since path is in reverse order, last node is idx 0
                    if (idx === 0 && target.hook) {
                        console.log('Assign the current hook -> ', target.hook);
                        return { x: el.x, y: el.y, index: index, hook: target.hook };
                    }
                    // normal ones dont -> hook: undefined to avoid d2bs issues
                    return { x: el.x, y: el.y, index: index, hook: undefined };
                });
            }).reduce(function (cur, acc) {
                // push each node to the list
                cur.forEach(function (el) { return acc.push(el); });
                return acc;
            }, []);
            if (!path_1)
                throw new Error('failed to generate path');
            path_1.reverse();
            var lines = path_1.map(function (node, i, self) { return i /*skip first*/ && new Line(self[i - 1].x, self[i - 1].y, node.x, node.y, 0x33, true); });
            path_1.forEach(function (el, idx) {
                if (el.hook && idx) {
                    console.log('path ', idx, 'has a hook');
                }
            });
            exports.currentWalkingPath = path_1;
            var pathCopy = path_1.slice();
            // find where to start (usefull to render a long path with nodes to walk back
            var startIndex = path_1.findIndex(function (path) { return path.index === settings.startIndex; });
            if (startIndex > -1)
                console.log('start idnex');
            var loops = 0, shrine_1;
            var _loop_1 = function (i, node, l) {
                if (settings.allowClearing && settings.clearFilter && canTeleport) {
                    j = i + 1;
                    var monsters = getUnits(sdk_1.default.unittype.Monsters)
                        .filter(function (m) { return m.attackable && settings.clearFilter(m, path_1[j]); });
                    while (j < path_1.length && !path_1[j].hook && monsters.length === 0 && exports.getWalkDistance(path_1[j].x, path_1[j].y) < 100 - 14 && settings.allowClearing) {
                        j += 1;
                        monsters = getUnits(sdk_1.default.unittype.Monsters)
                            .filter(function (m) { return m.attackable && settings.clearFilter(m, path_1[j]); });
                    }
                    i = Math.min(path_1.length - 1, j - 1);
                }
                node = path_1[i];
                path_1.index = i;
                lines.forEach(function (line, i) { return line.color = i < path_1.index ? 0x99 : 0x7A; });
                if (me.inTown && !didSkipTown) {
                    didSkipTown = true;
                    console.log('Total nodes -> ' + path_1.length);
                    var area = void 0, exits = [];
                    (area = getArea(me.area)) && (exits = area.exits);
                    var target_1 = exits.find(function (exit) {
                        var closeExitNode = path_1.findIndex(function (node) { return getDistance(node, exit) < 10; });
                        if (closeExitNode > -1) {
                            // i = Math.min(closeExitNode-3 , 1);
                            i = closeExitNode;
                            return true;
                        }
                        return false;
                    });
                    if (!target_1) {
                        console.log('Walking in town, but cant find any exit to walk to. So, simply walk normally');
                    }
                }
                var hookEvent = node.hook;
                me.overhead('Moving to node (' + i + '/' + l + ') -- ' + Math.round(node.distance * 100) / 100);
                if (node.distance < 5) {
                    i++;
                    // console.log('Skipping node as its too nearby -> Hook? ', hookEvent);
                    hookEvent && hookEvent();
                    return out_i_1 = i, out_node_1 = node, "continue";
                }
                //ToDo; teleport a part if we have enough mana and it saves us a bunch of nodes
                // Like if we can skip by 35 of distance, yet remove a walk path of 60, we rather use a single teleport
                // The path generated is long, we want sub nodes
                // fixme: this will never be true, because we get a path from target by chunks of distance 4, see line 89-91
                // so the distance to next node is always 4
                if (node.distance > 30) {
                    var d = exports.getWalkDistance(node.x, node.y);
                    // If walking to the node is twice as far as teleporting, we teleport
                    if (canTeleport && d * 2 > node.distance) {
                        if (node.distance > 35) {
                            Pather.moveTo(node.x, node.y, 4, settings.allowClearing);
                        }
                        else {
                            Pather.teleportTo(node.x, node.y);
                        }
                    }
                    else {
                        console.debug('DONT USE RECURSION HERE WTF?');
                        Pather.moveTo(node.x, node.y);
                    }
                }
                // decent fix for this
                me.cancel(0) && me.cancel(0) && me.cancel(0) && me.cancel(0);
                if (node.distance > 2) {
                    if (exports.getWalkDistance(node.x, node.y) * 0.9 > node.distance) {
                        Pather.moveTo(node.x, node.y);
                    }
                    else {
                        Pather.walkTo(node.x, node.y);
                    }
                }
                if (settings.callback && settings.callback())
                    return { value: void 0 };
                // ToDo; only if clearing makes sense in this area due to effort
                var range = 14 / 100 * clearPercentage;
                if (settings.allowClearing) {
                    clear_1.default({ nodes: path_1, range: settings.rangeOverride || Math.max(4, range), callback: settings.callback });
                }
                // console.log('after clear');
                // console.log('before pick');
                //Pickit.pickOnPath(path_1);
                Misc.openChests(8);
                // console.log('after pick');
                // if shrine found, click on it
                if ((shrine_1 = searchShrine())) {
                    skipShrine.push(shrine_1.gid);
                    var nearestShrine_1 = path_1.slice().sort(function (a, b) { return getDistance(shrine_1, a) - getDistance(shrine_1, b); }).first();
                    if (nearestShrine_1) {
                        (function (originalHook, shrineId) {
                            // First run original hook on this spot, if it had any
                            originalHook && originalHook();
                            // once we are near
                            nearestShrine_1.hook = function () {
                                console.log('Should take shrine');
                                var shrine = getUnits(2, "shrine").filter(function (el) { return el.gid === shrineId; }).first();
                                if (shrine) {
                                    // ToDo; use walk near / tk if we got it
                                    moveTo([{
                                            x: shrine.x,
                                            y: shrine.y,
                                            hook: function () {
                                                Misc.getShrine(shrine);
                                            }
                                        }]);
                                }
                            };
                        })(typeof nearestShrine_1.hook !== 'undefined' ? nearestShrine_1.hook : undefined, shrine_1.gid);
                    }
                }
                // if this wasnt our last node
                if (l - 1 !== i) {
                    if (path_1.index < i) {
                        console.debug('Walked back?');
                        // let nearestNode = pathCopy.filter(el => el.index === node.index).sort((a, b) => a.distance - b.distance).first();
                        i = path_1.index;
                        hookEvent && hookEvent();
                        return out_i_1 = i, out_node_1 = node, "continue";
                    }
                    else {
                        // Sometimes we go way out track due to clearing,
                        // lets find the nearest node on the path and go from there
                        // but not of the next node path
                        var nearestNode_1 = pathCopy.filter(function (el) { return el.index === node.index; }).sort(function (a, b) { return a.distance - b.distance; }).first();
                        // let nearestNode = path.slice(Math.min(path.index-10,0), path.index + 30).sort((a, b) => a.distance - b.distance).first();
                        // if the nearest node is still in 95% of our current node, we dont need to reset
                        if (nearestNode_1.distance > 5 && node.distance > 5 && 100 / node.distance * nearestNode_1.distance < 95) {
                            console.debug('reseting path to other node');
                            // reset i to the nearest node
                            var newIndex = path_1.findIndex(function (node) { return nearestNode_1.x === node.x && nearestNode_1.y === node.y; });
                            // Move forward
                            if (newIndex > i) {
                                // Hook all skipped nodes
                                for (var j_1 = i; j_1 < newIndex; j_1++) {
                                    var hookEvent_1 = (_a = path_1[i + j_1]) === null || _a === void 0 ? void 0 : _a.hook;
                                    hookEvent_1 && hookEvent_1();
                                }
                                i = newIndex;
                            }
                            hookEvent && hookEvent();
                            return out_i_1 = i, out_node_1 = node, "continue";
                        }
                    }
                    hookEvent && hookEvent();
                    i++;
                }
                out_i_1 = i;
                out_node_1 = node;
            };
            var j, out_i_1, out_node_1;
            for (var i = startIndex > 1 ? startIndex : 0, node = void 0, l = path_1.length; i < l; loops++) {
                var state_1 = _loop_1(i, node, l);
                i = out_i_1;
                node = out_node_1;
                if (typeof state_1 === "object")
                    return state_1.value;
            }
        }
        finally {
            // reset current path
            exports.currentWalkingPath = _prevpath;
            recursiveMoveTo--;
        }
    }
    exports.default = moveTo;
    var recursiveMoveTo = 0;
});
