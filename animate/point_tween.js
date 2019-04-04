export class PointTween {
    d_lst= [];
    length = 0;
    per = [];
    now = 0;
    then = 0;
    fps = 60;
    time_fragment = 1000 / this.fps;
    count = 0;
    source = [];
    target = [];
    point = void 0;
    positions = [];
    start_time = 0;
    duration = 0;
    finish_lst = [];
    is_finish = false;

    constructor(source, target, duration, point) {
        this.duration = duration;
        this.point = point;
        this.length = source.length;
        this.then = Date.now();
        this.start_time = Date.now();
        this.source = source;
        this.target = target;
        this.count = duration * this.fps / 1000;
        this.positions = this.point.geometry.attributes.position.array;

        for (var i = 0; i < this.length; i++) {
            let distance = target[i] - source[i];
            this.d_lst.push(distance);
            this.per.push(distance / this.count);
            this.finish_lst.push(false);
        }
    }

    update() {
        this.now = Date.now();

        if (!this.is_finish) {
            if (this.now - this.then > this.time_fragment) {
                this.positions = this.point.geometry.attributes.position.array;

                for (var i = 0; i < this.length; i++) {
                    if (parseInt(this.positions[i] * 1000) > parseInt(this.target[i] * 1000)) {
                        this.positions[i] = this.target[i];
                        this.finish_lst[i] = true;
                        console.log(1)
                    }
                    else {
                        this.positions[i] += this.per[i];
                        console.log(2);
                    }
                }

                this.is_finish = this.finish_lst.every((value) => {
                    return value
                });

                this.point.geometry.attributes.position.needsUpdate = true;
                this.then = this.now;
            }
        }
        else {
            // debugger
        }



    }
}
