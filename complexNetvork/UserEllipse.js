import {
    Tween,
} from './util';

export default class UserEllipse {
    data = void 0;
    w = 0;
    h = 0;
    dom = void 0;

    renderer = void 0;
    scene = void 0;
    camera = void 0;
    // animate
    clock = new THREE.Clock();
    // event
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // control
    controls = void 0;
    // test
    is_test = false;
    state = void 0;
    test_control = {
        is_enable_animate: true,
        is_enable_event: true,
    };


    positions = void 0;

    env = void 0;
    threshold = 100;
    group = void 0;
    axes = void 0;
    gui = void 0;
    request_animate_id = 0;

    // need to dispose;
    point_texture_lst = [];
    point_material_lst = [];
    point_geometry_lst = [];
    point_lst = [];
    line_material = void 0;
    line_geometry = void 0;
    line = void 0;
    other_width = 0;

    point_tween_lst = [];
    line_tween = void 0;
    explode_duration = 500;

    constructor(dom, data, env, other_width) {
        this.dom = dom;
        this.data =data;
        this.env = env;
        this.other_width = other_width;

        let svg_src_lst = [
            // '/static/threejs/01_good.svg',
            // '/static/threejs/02_good.svg',
            // '/static/threejs/03_good.svg',
            // '/static/threejs/04_good.svg',
            // '/static/threejs/05_good.svg',
            // '/static/threejs/06_good.svg',
            // '/static/threejs/01_bad.svg',
            // '/static/threejs/02_bad.svg',
            // '/static/threejs/03_bad.svg',
            // '/static/threejs/04_bad.svg',
            // '/static/threejs/05_bad.svg',
            // '/static/threejs/06_bad.svg',
            '/static/threejs/icon2/01.png',
            '/static/threejs/icon2/02.png',
            '/static/threejs/icon2/03.png',
            '/static/threejs/icon2/04.png',
            '/static/threejs/icon2/05.png',
            '/static/threejs/icon2/06.png',
            '/static/threejs/icon2/001.png',
            '/static/threejs/icon2/002.png',
            '/static/threejs/icon2/003.png',
            '/static/threejs/icon2/004.png',
            '/static/threejs/icon2/005.png',
            '/static/threejs/icon2/006.png',
        ];

        // getCanvasIncludeSvgByLst(svg_src_lst, true).then((canva_lst) => {
        //     this.point_texture_lst = [this.data[0].is_bad ? this.badPointSprite() : this.anotherSprite() ].concat(canva_lst.map((canva) => {
        //     // this.point_texture_lst = [this.badPointSprite()].concat(canva_lst.map((canva) => {
        //         let texture = new THREE.Texture(canva);
        //         texture.needsUpdate = true;
        //         return texture;
        //     }));
        //
        //     this.point_material_lst =  this.point_texture_lst.map((texture) => {
        //         let material = new THREE.ShaderMaterial({
        //             uniforms: {
        //                 texture: {
        //                     value: texture
        //                 }
        //             },
        //             vertexShader: vertexshader,
        //             fragmentShader: fragmentshader,
        //             blending: THREE.AdditiveBlending,
        //             // blending: THREE.NormalBlending,
        //             opacity: 1,
        //             depthTest: false,
        //             transparent: true,
        //             vertexColors: true,
        //             depthWrite: false,
        //         });
        //
        //         return material;
        //     });
        //
        //     this.init();
        //     this.animate();
        //
        // });



        this.point_texture_lst = [this.data[0].is_bad ? this.badPointSprite() : this.anotherSprite() ].concat(svg_src_lst.map((url) => {
            return new THREE.TextureLoader().load(url);
        }));

        this.point_material_lst =  this.point_texture_lst.map((texture, index) => {
            let size = index === 0 ? this.threshold : this.threshold / 4;
            let material = new THREE.PointsMaterial({
                size: size,
                // size: index === 0 ? this.threshold * 2 : this.threshold,
                // blending: THREE.NoBlending,
                blending: THREE.AdditiveBlending,
                map: texture,
                // sizeAttenuation: true,
                opacity: 1,
                transparent: true,
                depthTest: false,
                // color: 0xffffff,
                side: THREE.DoubleSide,
            });

            return material;
        });

        try {
            this.init();
        } catch(e) {
            console.error(e);
        }


        this.animate();
    }

    init() {
        this.group = new THREE.Group();
        this.initCanvas();
        this.initScene();
        this.initCamera();
        this.initMesh();
        this.initRenderer();

        if (this.is_test) {
            this.initTest();
        }

        this.initControls();
    }

    initCanvas() {
        let w = parseInt(window.getComputedStyle(this.dom).getPropertyValue('width')) + this.other_width;
        this.dom.style.width = w + 'px';
        this.dom.style.left = (0 - this.other_width) + 'px';
        this.w = w;
        this.h =  parseInt(window.getComputedStyle(this.dom).getPropertyValue('height'));
    }

    initRenderer() {
        if (this.renderer === void 0) {
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.dom,
                alpha: true,
                antialias: true,
                // sortObjects: false,
            });

            this.renderer.setSize(this.w, this.h);
            // this.renderer.setClearColor(0xffffff);
            this.renderer.gammaInput = true;
            this.renderer.gammaOutput = true;
            this.renderer.setPixelRatio(window.devicePixelRatio);
        }
    }

    initScene() {
        if (this.scene === void 0) {
            this.scene = new THREE.Scene();
        }
    }

    initCamera() {
        if (this.camera === void 0) {
            this.camera = new THREE.PerspectiveCamera(45, this.w / this.h, 1, 100000);
            this.camera.position.set(0, 0, 300);
            // this.camera.lookAt(this.scene.position);
        }
    }

    initControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.5;
        this.controls.enableZoom = true;
        this.controls.autoRotate = false;
        this.controls.minDistance = 20;
        this.controls.maxDistance = 15000;
        this.controls.enablePan = false;

        // this.controls.minPolarAngle = Math.PI * 45 / 96;
        // this.controls.maxPolarAngle = Math.PI * 45 / 96;
    }

    initTest() {
        this.initAxes();
        this.initState();
        this.initGui();
    }

    initAxes() {
        if (this.axes === void 0) {
            this.axes = new THREE.AxesHelper(500);
            this.scene.add(this.axes);
        }
    }

    initState() {
        this.stats = new Stats();
        this.stats.dom.style.position = 'absolute';
        this.stats.dom.style.top = '0px';
        document.body.appendChild(this.stats.dom);
    }

    initGui() {
        this.gui = new dat.GUI();
        this.gui.add(this.test_control, 'is_enable_animate').onChange((value) => {
            console.log(value);
        });
        this.gui.add(this.test_control, 'is_enable_event').onChange((value) => {
            console.log(value);
        });
    }

    initMesh() {
        let bad_color = new THREE.Color(0xffffff);
        let good_color = new THREE.Color(0xffffff);
        let line_source_positions = [];
        let line_target_positions = [];
        let line_positions = [];
        let line_colors = [];

        let max_distance = 0;
        let distance_lst = [];

        for (var item of this.data) {
            let point_geometry = new THREE.BufferGeometry();
            let point_color = item.is_bad ? bad_color : good_color;
            let point_colors = [point_color.r, point_color.g, point_color.b];
            let point_positions =[0, 0, 0];
            let point_size = 100;

            point_geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(point_positions), 3));
            point_geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(point_colors), 3));
            point_geometry.addAttribute('size', new THREE.BufferAttribute(new Float32Array([point_size]), 1));

            this.point_geometry_lst.push({
                type: 0,
                data: point_geometry,
            });

            let radius = 0;
            let adjustment = item.target_list.length / 30;

            for (var target of item.target_list) {
                let color = target.is_bad ? bad_color : good_color;
                radius = Math.random() * adjustment * 30 + 40;
                let position = this.getPositionByRandomSphere(radius, {
                    x: point_positions[0],
                    y: point_positions[1],
                    z: point_positions[2],
                });
                let size = 20;
                let start_positions = this.modifyLinePosition({
                    x: point_positions[0],
                    y: point_positions[1],
                    z: point_positions[2]
                }, 5, true, position);

                line_source_positions.push(0);
                line_source_positions.push(0);
                line_source_positions.push(0);
                line_source_positions.push(0);
                line_source_positions.push(0);
                line_source_positions.push(0);

                line_positions.push(start_positions.x);
                line_positions.push(start_positions.y);
                line_positions.push(start_positions.z);
                // line_positions.push(point_positions[0]);
                // line_positions.push(point_positions[1]);
                // line_positions.push(point_positions[2]);
                line_positions.push(position.x);
                line_positions.push(position.y);
                line_positions.push(position.z);

                let distance = Math.sqrt(Math.pow((position.x - point_positions[0]), 2) + Math.pow((position.y - point_positions[1]), 2) + Math.pow((position.z - point_positions[2]), 2));
                distance_lst.push(distance);

                if (distance > max_distance) {
                    max_distance = distance;
                }

                let point_source_position = {
                    x: 0,
                    y: 0,
                    z: 0,
                };
                let point_target_position = position;

                let geometry = new THREE.BufferGeometry();

                geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array([
                    point_source_position.x,
                    point_source_position.y,
                    point_source_position.z,
                ]), 3));
                geometry.addAttribute('size', new THREE.BufferAttribute(new Float32Array([
                    size
                ]), 1));
                geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array([
                    color.r,
                    color.g,
                    color.b,
                ]), 3));

                let tween = new Tween({
                    source: point_source_position,
                    target: point_target_position,
                    duration: this.explode_duration,
                    env: this,
                });

                this.point_tween_lst.push(tween);

                this.point_geometry_lst.push({
                    type: target.type,
                    data: geometry,
                    is_bad: parseInt(target.is_bad) === 1,
                });
            }
        }

        for (var distance of distance_lst) {
            // let alpha = (1.0 - distance / (max_distance + 10)) * 0.4;
            let alpha = 0.03;
            line_colors.push(alpha);
            line_colors.push(alpha);
            line_colors.push(alpha);
            line_colors.push(alpha);
            line_colors.push(alpha);
            line_colors.push(alpha);
        }

        line_target_positions = line_positions;
        this.line_material = new THREE.LineBasicMaterial({
            vertexColors: THREE.VertexColors,
            blending: THREE.AdditiveBlending,
            transparent: true,
            size: 0.2
        });
        this.line_geometry = new THREE.BufferGeometry();
        this.line_geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(line_source_positions), 3));
        this.line_geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(line_colors), 3));
        this.line = new THREE.LineSegments(this.line_geometry, this.line_material);
        this.group.add(this.line);

        this.line_tween = new Tween({
            source: line_source_positions,
            target: line_target_positions,
            duration: this.explode_duration,
            env: this,
        });

        this.line_tween.setUpdateCallback((current) => {
            this.line.geometry.attributes.position.array = new Float32Array(current);
            this.line.geometry.attributes.position.needsUpdate = true;
        });

        this.line_tween.start();

        for (var i = 0, length = this.point_geometry_lst.length; i < length; i++) {
            let obj = this.point_geometry_lst[i];
            let index = parseInt(obj.type) === 0 ? 0 : (obj.is_bad ? obj.type + 6 : obj.type);
            let material = this.point_material_lst[index];
            // let material = this.point_material_lst[0];
            let point = new THREE.Points(obj.data, material);

            if (i !== 0) {
                let tween = this.point_tween_lst[i - 1];

                tween.setUpdateCallback((current) => {
                    point.geometry.attributes.position.array = new Float32Array([
                        current.x,
                        current.y,
                        current.z
                    ]);

                    point.geometry.attributes.position.needsUpdate = true;
                });

                tween.start();
            }

            this.point_lst.push(point);
            this.group.add(point);
        }

        this.scene.add(this.group);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    animate() {
        if (this.is_test) {
            this.stats.update();
        }

        if (this.test_control.is_enable_animate) {
            this.group.rotateY(Math.PI/4000);
        }

        for (var tween of this.point_tween_lst) {
            tween.update();
        }

        this.line_tween.update();

        let delta = this.clock.getDelta();
        this.controls.update(delta);
        this.render();

        this.request_animate_id = requestAnimationFrame(() => {
            this.animate();
        });
    }

    destroy() {
        window.cancelAnimationFrame(this.request_animate_id);

        this.dom = void 0;

        if (this.controls) {
            this.controls.dispose();
            this.controls = void 0;
        }

        if (this.gui) {
            this.gui.destroy();
            this.gui = void 0;
        }



        for (var point of this.point_lst) {
            this.group.remove(point);
        }

        this.group.remove(this.line);
        this.scene.remove(this.group);
        this.scene.remove(this.camera);

        if (this.line_material) {
            this.line_material.dispose();
        }

        if (this.line_geometry) {
            this.line_geometry.dispose();
        }

        for (var point_geometry of this.point_geometry_lst) {
            point_geometry.data.dispose();
        }

        this.point_geometry_lst = [];

        for (var point_material of this.point_material_lst) {
            point_material.dispose();
        }

        this.point_material_lst = [];

        for (var point_texture of this.point_texture_lst) {
            point_texture.dispose();
        }

        this.point_texture_lst = [];
        this.scene.dispose();
        this.renderer.dispose();
    }

    anotherSprite() {
        var canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        let texture = new THREE.Texture(canvas);
        var ctx = canvas.getContext('2d');
        var gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.2, 'rgba(240,255,240,1)');
        gradient.addColorStop(0.22, 'rgba(0,150,255,.2)');
        gradient.addColorStop(1, 'rgba(0,50,255,0)');
        ctx.fillStyle = gradient; // "#FFFFFF"; // gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        texture.needsUpdate = true;

        return texture;
    }

    badPointSprite() {
        var canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        let texture = new THREE.Texture(canvas);
        var ctx = canvas.getContext('2d');
        var gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
        // gradient.addColorStop(0, 'rgba(255,193,193,1)');
        gradient.addColorStop(0, 'rgba(255,48,48,1)');
        gradient.addColorStop(0.2, 'rgba(255, 0, 0,1)');
        gradient.addColorStop(0.22, 'rgba(238, 44, 44,.2)');
        gradient.addColorStop(1, 'rgba(250,128,114,0)');
        ctx.fillStyle = gradient; // "#FFFFFF"; // gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        texture.needsUpdate = true;

        return texture;
    }

    createClickPointPosition() {
        return {
            x: 10000 * Math.random() - 5000,
            y: 1000 * (2 * Math.random() - 0.5),
            z: 10000 * Math.random() - 5000,
        }
    }

    getPositionByRandomSphere(radius = 10, origin = { x: 0, y: 0, z: 0 }) {
        let u = Math.random();
        let v = Math.random();
        let theta = 2 * Math.PI * u;
        let phi = Math.acos(2 * v - 1);
        let x = Math.sin(theta) * Math.sin(phi);
        let y = Math.cos(theta) * Math.sin(phi);
        let z = Math.cos(phi);

        return {
            x: x * radius + origin.x,
            y: y * radius + origin.y,
            z: z * radius + origin.z
        }
    }
    modifyLinePosition(position, distance, is_add, vector) {

        let x = position.x;
        let y = position.y;
        let z = position.z;
        let result = {
            x: 0,
            y: 0,
            z: 0,
        };

        if (is_add) {
            let r = Math.sqrt(Math.pow(vector.x - x, 2) + Math.pow(vector.y - y, 2) + Math.pow(vector.z - z, 2));

            result.x = x + vector.x * distance / r;
            result.y = y + vector.y * distance / r;
            result.z = z + vector.z * distance / r;
        }
        else {
            let r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));

            result.x = x - x * distance / r;
            result.y = y - y * distance / r;
            result.z = z - z * distance / r;
        }

        return result;
    }
}


