export class PointTween {
    d_lst= [];
    length = 0;
    per = [];
    start_time = 0;

    constructor(source, target, interval) {
        this.length = source.length;
        this.start_time = new Date().getTime();
        for (var i = 0; i < length; i++) {
            let distance = target[i] - source[i];
            this.d_lst.push(distance);

            this.per.push()
        }
    }

    update() {
        
    }
}
