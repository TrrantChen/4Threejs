function filterData(response) {
    let result = [];

    if (response.retcode === 0) {
        result = response.result_rows;
    }
    else {
        throw  response.retmsg;
    }

    return result;
}

export async function queryDataFromDb(url, params) {
    url = url.indexOf('/') === 0 ? url : `/${url}`;
    let response = await this.$http.post(url, params);

    let result = [];

    try {
        result = filterData(response);
    } catch(e) {
        console.log(e);
    }

    return result;
}

export function addResize(dom, callback) {

    if (dom) {

        let obj = document.createElement('object');
        obj.setAttribute('style','display:block; position: absolute; top: 0; left: 0; height:100%;width:100%;overflow:hidden;opacity:0;pointer-events:none;z-index:-1;');
        obj.onload = function() {

            this.contentDocument.defaultView.addEventListener('resize', function() {

                if (callback) {
                    callback();
                }

            })
        };
        obj.type='text/html';
        obj.data = 'about:blank';
        dom.appendChild(obj);

    }
}

export function convertPx(px) {
    px = parseInt(px || 160);
    return px / 1920 * convertRem2Px(10)
}

function convertRem2Px(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export class ClickHandle {
    env = void 0;
    dom = void 0;
    move_index = 0;
    mouse_down = void 0;
    mouse_move = void 0;
    mouse_up = void 0;
    touch_start = void 0;
    touch_move = void 0;
    touch_end = void 0;
    handle = void 0;
    changed_touches_length = 0;


    constructor(env, dom) {
        this.env = env;
        this.dom = dom;
        this._addEvent();
    }

    _addEvent() {
        this.mouse_down = this._startHandle.bind(this);
        this.mouse_move = this._moveHandle.bind(this);
        this.mouse_up = this._endHandle.bind(this);
        this.touch_start = this._startHandle.bind(this);
        this.touch_move = this._moveHandle.bind(this);
        this.touch_end = this._endHandle.bind(this);

        this.dom.addEventListener('mousedown', this.mouse_down);
        this.dom.addEventListener('touchstart', this.touch_start);
        this.dom.addEventListener('mousemove', this.mouse_move);
        this.dom.addEventListener('touchmove', this.touch_move);
        this.dom.addEventListener('mouseup', this.mouse_up);
        this.dom.addEventListener('touchend', this.touch_end);
    }

    _startHandle(event) {
        this.move_index = 0;
        this.changed_touches_length = event.touches ? event.touches.length : 0;
    }

    _moveHandle(event) {
        this.move_index++;
    }

    _endHandle(event) {
        if (
            this.move_index < 3
            && this.handle
            &&
            (
                event.changedTouches === void 0
                || (event.changedTouches && this.changed_touches_length < 2)
            )
        ) {
            this.handle(event);
        }
    }

    setHandle(handle) {
        this.handle = handle;
    }

    destory() {
        this.dom.removeEventListener('mousedown', this.mouse_down);
        this.dom.removeEventListener('touchstart', this.touch_start);
        this.dom.removeEventListener('mousemove', this.mouse_move);
        this.dom.removeEventListener('touchmove', this.touch_move);
        this.dom.removeEventListener('mouseup', this.mouse_up);
        this.dom.removeEventListener('touchend', this.touch_end);
    }
}

export function loadImage(src) {
    return new Promise((resolve) => {
        let img = new Image();
        img.onload = function() {
            resolve(img);
        };

        img.src = src;
    })
}

export function getCanvasIncludeSvg(src, is_rotate = false, size = 120) {
    return new Promise((resolve) => {
        let canvas = document.createElement('canvas');
        let w = size;
        let h = size;
        let l_width = 8;
        let l_color = '#1a7cc4';
        let ctx = canvas.getContext('2d');
        canvas.width = w;
        canvas.height = h;

        loadImage(src).then((img) => {
            if (is_rotate) {
                ctx.translate(w , h);
                ctx.rotate(Math.PI);
            }
            ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2, true);
            ctx.fillStyle = "#000000";
            ctx.fill();
            ctx.drawImage(img, 0, 0, w, h);
            // ctx.arc(w / 2, h / 2, w / 2 - l_width, 0, Math.PI * 2, true);
            // ctx.lineWidth = l_width;
            // ctx.strokeStyle = l_color;
            // ctx.stroke();
            resolve(canvas);
        });
    });
}

export function getCanvasIncludeSvgByLst(src_lst, is_rotate = false, size = 120) {
    return new Promise((resolve) => {
        Promise.all(src_lst.map((src) => {
            return getCanvasIncludeSvg(src, is_rotate,  size)
        })).then((canva_lst) => {
            resolve(canva_lst);
        })
    })
}

export function toThousands(num) {
    let tmp = num.toString();
    let tmp_arr = tmp.split('');
    let count = Math.floor(tmp_arr.length / 4);

    for (var i = 1; i <= count; i++) {
        tmp_arr.splice(tmp_arr.length - (3 * i + i - 1) , 0, ',')
    }

    return tmp_arr.join('');
}
