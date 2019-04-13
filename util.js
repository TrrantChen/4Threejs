export function getAngle(radian) {
    return radian / Math.PI * 180;
}

export function getRadian(angle) {
    return angle / 180 * Math.PI;
}

export class Tween {
    source = 0;
    current = 0;
    target = 0;
    duration = 0;
    start_time = 0;
    Now = window.performance.now.bind(window.performance);
    is_finish = false;
    start_callback = void 0;
    update_callback = void 0;
    env = void 0;

    constructor(option) {
        let default_option = {
            source: 0,
            target: 0,
            duration: 1000,
            env: window,
        };

        let current_option = Object.assign(default_option, option);

        if (Object.prototype.toString.call(current_option.source) === '[object Float32Array]') {
            let length = current_option.source.length;
            this.source = new Float32Array(length);
            for (var i = 0; i < length; i++) {
                this.source[i] = current_option.source[i];
            }
        }
        else {
            this.source = JSON.parse(JSON.stringify(current_option.source));
        }

        this.current = current_option.source;
        this.target = current_option.target;
        this.duration = current_option.duration;
        this.env = current_option.env;
    }

    start() {
        this.start_time = this.Now();

        if (this.start_callback) {
            this.start_callback.apply(this.env, []);
        }
    }

    update() {
        if (!this.is_finish) {
            let now = this.Now();
            let elapsed = (now - this.start_time) / this.duration;
            elapsed = elapsed > 1 ? 1 : elapsed;

            if (elapsed === 1) {
                this.is_finish = true;
            }

            this._calculateDistance(elapsed);

            if (this.update_callback) {
                this.update_callback.apply(this.env, [this.current]);
            }
        }
    }

    _calculateDistance(elapsed) {
        let type_str = Object.prototype.toString.call(this.source).replace(/\[|(object)|\]|\s/g, '');

        switch(type_str) {
            case "Array":
            case "Float32Array":
                for (var i = 0, length = this.source.length; i < length; i++) {
                    this.current[i]  = this.source[i] + (this.target[i] - this.source[i]) * elapsed;
                }

                break;
            case "Object":
            default:
                this.current.x = this.source.x + (this.target.x - this.source.x) * elapsed;
                this.current.y = this.source.y + (this.target.y - this.source.y) * elapsed;
                this.current.z = this.source.z + (this.target.z - this.source.z) * elapsed;
                break;
            case "Number":
            case "String":
                this.current = parseInt(this.source) + (parseInt(this.target) - parseInt(this.source)) * elapsed;
                break;
        }
    }

    setStartCallback(func) {
        this.start_callback = func;
    }

    setUpdateCallback(func) {
        this.update_callback = func;
    }
}

