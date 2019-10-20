const Me = imports.misc.extensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;

const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Signals = imports.signals;


var Timer = GObject.registerClass({
    Properties: {
        'interval': GObject.ParamSpec.uint('interval', 'Interval', 'The interval that the callback is called.',
            GObject.ParamFlags.READABLE, 0, GLib.MAXUINT32, 300),
    },
},
class DeskChangerTimer extends GObject.Object {
    _init(interval = 300, callback = null, params = {}) {
        if (callback && typeof callback !== 'function') {
            throw 'callback must be function';
        }

        this._callback = callback;
        this._interval = parseInt(interval);
        super._init(params);
        this._timer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, this._interval, this.__callback__.bind(this));
        Utils.debug(`added timer ${this._timer}`);
    }

    get callback() {
        return this._callback;
    }

    get interval() {
        return this._interval;
    }

    __callback__() {
        this.emit('callback', this._callback, this._interval);

        if (this._callback) {
            return Boolean(this._callback());
        }

        return true;
    }

    destroy() {
        Utils.debug(`removing timer ${this._timer}`);
        GLib.remove_source(this._timer);
    }
});

Signals.addSignalMethods(Timer.prototype);


var TimerHourly = GObject.registerClass(
class DeskChangerTimerHourly extends Timer {
    _init(callback, params = {}) {
        this._done = false;
        super._init(5, callback, params);
    }

    __callback__() {
        let date = new Date();

        if (date.getMinutes() === 0 && date.getSeconds() < 10) {
            if (!this._done) {
                this._done = true;
                return super.__callback__();
            }

            return true;
        }

        this._done = false;
        return true;
    }
});