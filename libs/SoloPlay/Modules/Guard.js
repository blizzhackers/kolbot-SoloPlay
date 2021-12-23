(function (module, require, thread) {

    const Messaging = require('../../modules/Messaging');
    const Worker = require('../../modules/Worker');
    const sdk = require('./sdk');

    switch (thread) {
        case 'thread': {
            const lastXY = {
                area: me.area,
                x: me.x,
                y: me.y,
                stillValid: getTickCount(),
            };

            Worker.runInBackground.stuckFixer = function () {

                // Dont reset guard if we are actually on pause
                const script = getScript('default.dbj');
                if (!script || !script.running) {
                    lastXY.stillValid = getTickCount();
                }

                if (lastXY.area !== me.area || getDistance(lastXY, me) > 10) {
                    // print('Resetting -- ' + (getTickCount() - lastXY.stillValid));
                    lastXY.area = me.area;
                    lastXY.x = me.x;
                    lastXY.y = me.y;
                    lastXY.stillValid = getTickCount();
                }

                // In dura lvl 3 give us 2 minutes
                // const time = (me.area === sdk.areas.DuranceOfHateLvl3 || me.area === sdk.areas.ThroneOfDestruction || me.area === sdk.areas.ChaosSanctuary) ? 240e3 : 180e3;
                // if (getTickCount() - lastXY.stillValid > time) {
                //     print('Stuck at the same spot for over ' + ~~(time / 1000) + ' seconds, restarting');
                //     scriptBroadcast('quit')
                // }

                return true;
            }
            Worker.runInBackground.stackTrace = (new function () {
                let self = this;
                let stack;

                let myStack = '';

                // recv stack
                Messaging.on('Guard', (data => typeof data === 'object' && data && data.hasOwnProperty('stack') && (myStack = data.stack)));

                /**
                 * @constructor
                 * @param {function():string} callback
                 */
                function UpdateableText(callback) {
                    let element = new Text(callback(), self.x + 15, self.y + (7 * self.hooks.length), 0, 12, 0);
                    self.hooks.push(element);
                    this.update = () => {
                        element.text = callback();
                        element.visible = element.visible = [sdk.uiflags.Iventory,
                            sdk.uiflags.SkillWindow,
                            sdk.uiflags.TradePrompt,
                            sdk.uiflags.Stash,
                            sdk.uiflags.Cube,
                            sdk.uiflags.QuickSkill].every(f => !getUIFlag(f));
                    }
                }

                this.hooks = [];
                this.x = 500;
                this.y = 600 - (400 + (self.hooks.length * 15));
                // this.box = new Box(this.x-2, this.y-20, 250, (self.hooks.length * 15), 0, 0.2);


                for (let i = 0; i < 20; i++) {
                    (i => this.hooks.push(new UpdateableText(() => stack && stack.length > i && stack[i] || '')))(i);
                }

                this.update = () => {
                    stack = myStack.match(/[^\r\n]+/g);
                    stack = stack && stack.slice(6/*skip path to here*/).map(el => {
                        let line = el.substr(el.lastIndexOf(':') + 1),
                            functionName = el.substr(0, el.indexOf('@')),
                            filename = el.substr(el.lastIndexOf('\\') + 1);

                        filename = filename.substr(0, filename.indexOf('.'));

                        return filename + 'ÿc::ÿc0' + line + 'ÿc:@ÿc0' + functionName;
                    }).reverse();
                    this.hooks.filter(hook => hook.hasOwnProperty('update') && typeof hook.update === 'function' && hook.update());
                    return true;
                };

            }).update;

            Worker.runInBackground.ping = (new function () {
                let myHeartbeat = 0;

                // recv heartbeat
                Messaging.on('Guard', (data => typeof data === 'object' && data && data.hasOwnProperty('heartbeat') && (myHeartbeat = data.heartbeat)));

                this.update = function () {
                    // Do not deal with this shit if default is paused
                    const script = getScript('default.dbj');
                    if (!script || !script.running) {
                        myHeartbeat = getTickCount();
                        return true;
                    }
                    if (myHeartbeat && getTickCount() - myHeartbeat > 6e4) {
                        print('Default.dbj seems to have crashed');
                        myHeartbeat = 0;
                        if (script) script.stop();
                        print('Waiting 10 seconds to restart default.dbj')
                        delay(1e4)
                        load('default.dbj')
                        print('Starting default.dbj');
                    }
                    return true;
                }
            }).update;

            let quiting = false;
            addEventListener('scriptmsg', data => data === 'quit' && (quiting = true));

            while (!quiting) delay(1000);
            break;
        }
        case 'started': {
            let sendStack = getTickCount();
            Worker.push(function highPrio() {
                Worker.push(highPrio);
                if ((getTickCount() - sendStack) < 200 || (sendStack = getTickCount()) && false) return true;
                Messaging.send({Guard: {stack: (new Error).stack}});
                return true;
            });

            let timer = getTickCount();
            Worker.runInBackground.heartbeatForGuard = function () {
                if ((getTickCount() - timer) < 1000 || (timer = getTickCount()) && false) return true;


                // Drop broken eth items that arent a belt
                me.getItems()
                    .filter(el => //ToDo; minor point but this can fuck up zod bugged items
                        el.location === sdk.storage.Equipped
                        && el.getStat(sdk.stats.Durability) === 0
                        && el.bodylocation !== sdk.body.Belt
                        && el.getFlag(0x400000/*eth*/)
                    )
                    .forEach(item => item.drop());

                // Every second or so, we send a heartbeat tick
                Messaging.send({Guard: {heartbeat: getTickCount()}});

                return true;
            };
            break;
        }
        case 'loaded': {
            break;
        }
    }

}).call(null, typeof module === 'object' && module || {}, typeof require === 'undefined' && (include('require.js') && require) || require, getScript.startAsThread());