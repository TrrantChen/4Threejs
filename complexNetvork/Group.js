import {
    getCanvasIncludeSvgByLst,
    ClickHandle, Tween,
} from './util';

export default class Group {
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
    threshold = 60;
    group = void 0;
    axes = void 0;
    gui = void 0;
    request_animate_id = 0;

    click_handle = void 0;

    uid_uuid_obj = {};
    // need to dispose;
    point_texture_lst = [];
    point_material_lst = [];
    uid_group = void 0;
    type_group = void 0;

    uid_geometry_lst = [];
    uid_point_lst = [];
    target_geometry_lst = [];
    target_point_lst = [];

    line_geometry = void 0;
    line_material = void 0;
    line = void 0;
    target_and_uid_relation_obj = {};
    calculate_scene_center_obj = {
        max: {
            x: 0,
            y: 0,
            z: 0,
        },
        min: {
            x: 0,
            y: 0,
            z: 0,
        }
    };
    center_point = void 0;
    is_zoom = false;
    is_finish_zoom = false;
    uid = 0;
    other_width = 0;
    is_move_target = false;
    is_zoom = false;
    camera_target_tween = void 0;
    camera_fov_tween = void 0;

    constructor(dom, data, env, other_width) {
        this.raycaster.params.Points.threshold = this.threshold / 2;
        this.dom = dom;
        this.other_width = other_width;
        this.data =data;
        this.env = env;

        let svg_src_lst = [
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

        let vertexshader = `
        		attribute float size;
        		varying vec3 vColor;
        		void main() {
        			vColor = color;
        			vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        			gl_PointSize = size * ( 300.0 / -mvPosition.z );
        			gl_Position = projectionMatrix * mvPosition;
        		}
        `;

        let fragmentshader = `
        		uniform sampler2D texture;
        		varying vec3 vColor;
        		void main() {
        			gl_FragColor = vec4( vColor, 1.0 );
        			gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
        		}
        `;

        // getCanvasIncludeSvgByLst(svg_src_lst, false, 400).then((canva_lst) => {
        //     this.point_texture_lst = [this.anotherSprite()].concat(canva_lst.map((canva) => {
        //         let texture = new THREE.Texture(canva);
        //         texture.needsUpdate = true;
        //         return texture;
        //     })).concat([this.badPointSprite()]);
        //
        //     this.point_material_lst =  this.point_texture_lst.map((texture, index) => {
        //         // let material = new THREE.ShaderMaterial({
        //         //     uniforms: {
        //         //         texture: {
        //         //             value: texture
        //         //         }
        //         //     },
        //         //     vertexShader: vertexshader,
        //         //     fragmentShader: fragmentshader,
        //         //     blending: THREE.AdditiveBlending,
        //         //     opacity: 1,
        //         //     depthTest: false,
        //         //     transparent: true,
        //         //     vertexColors: true,
        //         //     side: THREE.DoubleSide,
        //         //     depthWrite: false,
        //         // });
        //
        //         let size = (index === 0 || index === this.point_texture_lst.length - 1) ? this.threshold : this.threshold / 4;
        //
        //         let material = new THREE.PointsMaterial({
        //             size: size,
        //             // size: index === 0 ? this.threshold * 2 : this.threshold,
        //             // blending: THREE.NoBlending,
        //             blending: THREE.AdditiveBlending,
        //             map: texture,
        //             // sizeAttenuation: true,
        //             opacity: 1,
        //             transparent: true,
        //             depthTest: false,
        //             // color: 0xffffff,
        //             side: THREE.DoubleSide,
        //         });
        //
        //         return material;
        //     });
        //     this.init();
        //     this.animate();
        // });

        this.point_texture_lst = [this.anotherSprite()].concat(svg_src_lst.map((url) => {
            return new THREE.TextureLoader().load(url);
        })).concat([this.badPointSprite()]);

        this.point_material_lst =  this.point_texture_lst.map((texture, index) => {
            // let material = new THREE.ShaderMaterial({
            //     uniforms: {
            //         texture: {
            //             value: texture
            //         }
            //     },
            //     vertexShader: vertexshader,
            //     fragmentShader: fragmentshader,
            //     blending: THREE.AdditiveBlending,
            //     opacity: 1,
            //     depthTest: false,
            //     transparent: true,
            //     vertexColors: true,
            //     side: THREE.DoubleSide,
            //     depthWrite: false,
            // });

            let size = (index === 0 || index === this.point_texture_lst.length - 1) ? this.threshold : this.threshold / 4;

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

        this.init();
        this.animate();
    }

    init() {
        this.group = new THREE.Group();
        this.uid_group = new THREE.Group();
        this.type_group = new THREE.Group();

        this.initCanvas();
        this.initScene();
        this.initCamera();
        this.initMesh();
        this.initRenderer();

        if (this.is_test) {
            this.initTest();
        }

        this.initControls();
        this.addEvent();
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
                antialias: true
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
            this.camera.position.set(0, 0, 400);
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
        this.controls.maxDistance = 5000;
        this.controls.enablePan = false;

        if (this.center_point) {
            this.controls.target = this.center_point;
        }
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
        let hierarchy_distribute_sphere_radius = 0;
        let tmp_line_positions = [];
        let tmp_line_colors = [];
        let bad_color = 0xcf002f;
        let good_color = 0x1994d5;

        this.line_material = new THREE.LineBasicMaterial( {
            vertexColors: THREE.VertexColors,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        for (var hierarchy = 0, hierarchy_length = this.data.length; hierarchy < hierarchy_length; hierarchy++) {
            let uid_lst = this.data[hierarchy];
            hierarchy_distribute_sphere_radius = hierarchy_distribute_sphere_radius + uid_lst.length / 10 * 60;
            // hierarchy_distribute_sphere_radius = hierarchy_distribute_sphere_radius + 80;

            if (hierarchy === 0) {
                for (var uid of uid_lst) {
                    let bad_uid_position = this.getPositionByRandomSphere(hierarchy_distribute_sphere_radius, { x: 0, y: 0, z: 0});
                    this.updateCenterPosition(bad_uid_position);

                    let bad_uid_color = this.getColors(1, bad_color);
                    let bad_uid_create_geometry_lst = [
                        {
                            name: 'position',
                            data: bad_uid_position,
                            item_size: 3,
                        },
                        {
                            name: 'color',
                            data: bad_uid_color,
                            item_size: 3,
                        }
                    ];

                    let bad_uid_geometry = this.createGeometry(bad_uid_create_geometry_lst);

                    this.uid_geometry_lst.push({
                        type: this.point_material_lst.length - 1,
                        data: bad_uid_geometry,
                    });
                    this.uid_uuid_obj[bad_uid_geometry.uuid] = uid.uid;

                    for (var target_point of uid.target_list) {
                        if (this.target_and_uid_relation_obj[target_point.target] === void 0) {
                            this.target_and_uid_relation_obj[target_point.target] = {
                                type: target_point.type.toString(),
                            };

                            this.target_and_uid_relation_obj[target_point.target][hierarchy] = [bad_uid_position];
                        }
                        else {
                            if (this.target_and_uid_relation_obj[target_point.target][hierarchy]) {
                                this.target_and_uid_relation_obj[target_point.target][hierarchy].push(bad_uid_position);
                            }
                            else {
                                this.target_and_uid_relation_obj[target_point.target][hierarchy] = [bad_uid_position];
                            }
                        }
                    }
                }
            }
            else {
                for (var uid of uid_lst) {
                    let pre_hierarchy_uid_relate_current_uid_positions = [];

                    for (var target_point of uid.target_list) {

                        if (this.target_and_uid_relation_obj[target_point.target]) {
                            let uid_relate_target_positions = this.target_and_uid_relation_obj[target_point.target][hierarchy - 1];

                            if (uid_relate_target_positions) {
                                pre_hierarchy_uid_relate_current_uid_positions = pre_hierarchy_uid_relate_current_uid_positions.concat(uid_relate_target_positions);
                            }
                        }
                    }

                    let current_uid_position = {
                        x: 0,
                        y: 0,
                        z: 0,
                    };

                    if (pre_hierarchy_uid_relate_current_uid_positions.length !== 0) {
                        current_uid_position = this.calculateHierarchyUidPosition(pre_hierarchy_uid_relate_current_uid_positions, hierarchy_distribute_sphere_radius);

                        this.updateCenterPosition(current_uid_position);

                        let uid_colors = this.getColors(uid_lst.length, good_color);
                        let good_uid_create_geometry_lst = [
                            {
                                name: 'position',
                                data: current_uid_position,
                                item_size: 3,
                            }
                        ];

                        let good_uid_geometry = this.createGeometry(good_uid_create_geometry_lst);

                        this.uid_uuid_obj[good_uid_geometry.uuid] = uid.uid;

                        this.uid_geometry_lst.push({
                            type: 0,
                            data: good_uid_geometry,
                        });
                    }
                    else {
                        console.error(`pre_hierarchy_uid_relate_current_uid_positions length is 0, uid is ${uid.uid}`);
                    }

                    for (var target_point of uid.target_list) {
                        if (this.target_and_uid_relation_obj[target_point.target] === void 0) {
                            this.target_and_uid_relation_obj[target_point.target] =  {
                                type: target_point.type.toString(),
                            };

                            this.target_and_uid_relation_obj[target_point.target][hierarchy] = [current_uid_position];
                        }
                        else {
                            if (this.target_and_uid_relation_obj[target_point.target][hierarchy]) {
                                this.target_and_uid_relation_obj[target_point.target][hierarchy].push(current_uid_position);
                            }
                            else {
                                this.target_and_uid_relation_obj[target_point.target][hierarchy] = [current_uid_position];
                            }
                        }
                    }
                }
            }

        }

        let keys = Object.keys(this.target_and_uid_relation_obj);

        for (var key of keys) {
            let target_point_obj = this.target_and_uid_relation_obj[key];
            let target_color = this.getColors(1);
            let uid_position_lst = [];

            for (var hierarchy = 0, length = this.data.length; hierarchy < length; hierarchy++) {
                if (target_point_obj[hierarchy]) {
                    uid_position_lst = uid_position_lst.concat(target_point_obj[hierarchy]);
                }
            }

            let target_position = this.calculateCenterPosition(uid_position_lst);

            // this.updateCenterPosition(target_position);

            let target_create_geometry_lst = [
                {
                    name: 'position',
                    data: target_position,
                    item_size: 3,
                }
            ];

            let target_geometry = this.createGeometry(target_create_geometry_lst);
            this.target_geometry_lst.push({
                type: target_point_obj.type.toString(),
                data: target_geometry,
            });

            for (var uid_position of uid_position_lst) {

                // todo 添加间距控制
                // let line_uid_position = this.modifyLinePosition(uid_position, 1, true, target_position);
                // console.log(line_uid_position);
                // let line_target_position = this.modifyLinePosition(target_position, this.threshold, false);
                // console.log(line_target_position);

                this.createLinePositions(uid_position, target_position, tmp_line_positions);
                let start_color = new THREE.Color(0xff3030);
                let end_color = new THREE.Color(0xffffff);
                this.createLineColors(start_color, end_color, tmp_line_colors)
            }
        }

        let line_create_geometry_lst = [
            {
                name: 'position',
                data: tmp_line_positions,
                item_size: 3,
            },
            {
                name: 'color',
                data: tmp_line_colors,
                item_size: 3,
            }
        ];

        this.line_geometry = this.createGeometry(line_create_geometry_lst);

        this.line = new THREE.LineSegments(this.line_geometry, this.line_material);
        this.type_group.add(this.line);


        for (var geometry_obj of this.uid_geometry_lst) {
            let point = new THREE.Points(geometry_obj.data, this.point_material_lst[geometry_obj.type]);
            this.uid_group.add(point);
            this.uid_point_lst.push(point);
        }

        for (var geometry_obj of this.target_geometry_lst) {
            let point = new THREE.Points(geometry_obj.data, this.point_material_lst[geometry_obj.type]);
            this.type_group.add(point);
            this.target_point_lst.push(point);
        }

        this.scene.add(this.uid_group);
        this.scene.add(this.type_group);

        this.center_point = new THREE.Vector3(
            (this.calculate_scene_center_obj.max.x + this.calculate_scene_center_obj.min.x) / 2,
            (this.calculate_scene_center_obj.max.y + this.calculate_scene_center_obj.min.y) / 2,
            (this.calculate_scene_center_obj.max.z + this.calculate_scene_center_obj.min.z) / 2
        );
    }

    addEvent() {
        this.click_handle = new ClickHandle(this, this.dom);
        this.click_handle.setHandle(this.mouseDownHandle.bind(this));
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    animate() {
        if (this.is_test) {
            this.stats.update();
        }

        if (this.test_control.is_enable_animate) {
            this.uid_group.rotateY(Math.PI/8000);
            this.type_group.rotateY(Math.PI/8000);
        }

        if (this.is_move_target) {
            this.camera_target_tween.update();
        }

        if (this.is_zoom) {
            this.camera_fov_tween.update();
        }

        let delta = this.clock.getDelta();
        this.controls.update(delta);
        this.render();

        this.request_animate_id = requestAnimationFrame(() => {
            this.animate();
        });
    }

    destroy() {
        window.cancelAnimationFrame(this.request_animate_id);

        if (this.click_handle) {
            this.click_handle.destory();
        }

        this.dom = void 0;

        if (this.controls) {
            this.controls.dispose();
            this.controls = void 0;
        }

        if (this.gui) {
            this.gui.destroy();
            this.gui = void 0;
        }

        for (var point of this.uid_point_lst) {
            this.uid_group.remove(point);
        }

        for (var point of this.target_point_lst) {
            this.type_group.remove(point);
        }

        this.type_group.remove(this.line);
        this.line = void 0;

        this.scene.remove(this.uid_group);
        this.scene.remove(this.type_group);
        this.scene.remove(this.group);
        this.scene.remove(this.camera);

        for (var geometry of this.uid_geometry_lst) {
            geometry.data.dispose();
        }

        this.uid_geometry_lst = [];

        for (var geometry of this.target_geometry_lst) {
            geometry.data.dispose();
        }

        this.target_geometry_lst = [];

        this.line_geometry.dispose();
        this.line_material.dispose();

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

    getColors(count, color) {
        let tmp = new THREE.Color(color);
        let colors = new Float32Array(count * 3);

        for (var i = 0; i < count; i++) {
            colors[i * 3] = tmp.r;
            colors[i * 3 + 1] = tmp.g;
            colors[i * 3 + 2] = tmp.b;
        }

        return colors;
    }

    createGeometry(lst) {
        let geometry = new THREE.BufferGeometry();

        for (var obj of lst) {

            let name = obj.name;
            let data = obj.data;
            let item_size = obj.item_size;

            if (Array.isArray(data)) {
                data = new Float32Array(data);
            }
            else if (Object.prototype.toString.call(data) === "[object Object]") {
                switch(name) {
                    case 'position':
                        data = new Float32Array([data.x, data.y, data.z]);
                        break;
                    case 'color':
                        data = new Float32Array([data.r, data.g, data.b]);
                        break;
                    default:
                        console.error(`createGeometry error, data is ${data}`);
                        break;
                }
            }

            geometry.addAttribute(name, new THREE.BufferAttribute(data, item_size));
        }

        return geometry;
    }

    calculateHierarchyUidPosition(positions, radius) {
        let position = {
            x: 0,
            y: 0,
            z: 0,
        };

        let count = positions.length;
        let center = {
            x: 0,
            y: 0,
            z: 0,
        };

        for (var i = 0; i < count; i++) {
            center.x += positions[i].x;
            center.y += positions[i].y;
            center.z += positions[i].z;
        }

        center.x =  center.x / count;
        center.y =  center.y / count;
        center.z =  center.z / count;

        let vector = Math.sqrt(Math.pow(center.x, 2) + Math.pow(center.y, 2) + Math.pow(center.z, 2));

        // position.x = center.x * radius / vector + Math.random() * 100 - 50;
        // position.y = center.y * radius / vector + Math.random() * 100 - 50;
        // position.z = center.z * radius / vector + Math.random() * 100 - 50;

        position.x = center.x * radius / vector;
        position.y = center.y * radius / vector;
        position.z = center.z * radius / vector;

        position = this.getPositionByRandomSphere(40, position);
        // position = this.getPositionByRandomSphere(500, position);


        return position;
    }

    calculateCenterPosition(positions, radius = 40) {
        let center = {
            x: 0,
            y: 0,
            z: 0,
        };

        let count = positions.length;

        for (var i = 0; i < count; i++) {
            let position = positions[i];
            center.x += position.x;
            center.y += position.y;
            center.z += position.z;
        }


        // center.x = center.x / count + Math.random() * 80;
        // center.y = center.y / count + Math.random() * 80;
        // center.z = center.z / count + Math.random() * 80;

        center.x = center.x / count;
        center.y = center.y / count;
        center.z = center.z / count;

        radius = Math.random() * 20 + 10;
        // radius = 0;

        center = this.getPositionByRandomSphere(radius, center);
        // center = this.getPositionByRandomSphere(500, center);

        return center;
    }

    createLinePositions(start, end, positions) {
        positions.push(start.x);
        positions.push(start.y);
        positions.push(start.z);
        positions.push(end.x);
        positions.push(end.y);
        positions.push(end.z);
    }

    createLineColors(start, end, colors) {
        colors.push(start.r * 0.05);
        colors.push(start.g * 0.05);
        colors.push(start.b * 0.05);
        // colors.push(end.r - 0.8);
        // colors.push(end.g - 0.8);
        // colors.push(end.b - 0.8);
        // colors.push(0.018);
        // colors.push(0.018);
        // colors.push(0.018);
        colors.push(end.r * 0.02);
        colors.push(end.g * 0.02);
        colors.push(end.b * 0.02);
    }

    mouseDownHandle(event) {
        if (this.test_control.is_enable_event) {

            let x = event.clientX || event.changedTouches[0].clientX;
            let y = event.clientY || event.changedTouches[0].clientY;

            this.mouse.x = ((x - this.dom.getBoundingClientRect().left) / this.w) * 2 - 1;
            this.mouse.y = - ((y - this.dom.getBoundingClientRect().top) / this.h) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, this.camera);

            if (this.uid_group) {
                let intersects = this.raycaster.intersectObjects(this.uid_group.children, true);

                if (intersects.length > 0) {
                    this.uid = this.uid_uuid_obj[intersects[0].object.geometry.uuid];

                    this.test_control.is_enable_animate = false;
                    let point = intersects[0];

                    this.is_move_target = true;
                    this.camera_target_tween = new Tween({
                        source: new THREE.Vector3(0, 0, 0),
                        target: point.point,
                        duration: 400,
                        env: this,
                    });

                    this.camera_target_tween.setUpdateCallback((current) => {
                        this.controls.target = current;
                    });

                    this.camera_target_tween.setFinishCallback(() => {
                        this.is_zoom = true;
                        this.camera_fov_tween.start();
                    });

                    this.camera_target_tween.start();

                    this.camera_fov_tween = new Tween({
                        source: this.camera.fov,
                        target: 4,
                        duration: 400,
                        env: this,
                    });

                    this.camera_fov_tween.setUpdateCallback((current) => {
                        this.camera.fov = current;
                        this.camera.updateProjectionMatrix();
                        this.render();
                    });

                    this.camera_fov_tween.setFinishCallback(() => {
                        this.env.$router.push({
                            path: `/complex_network/user/${ this.uid }`
                        })
                    });



                }
            }
        }
    }

    updateCenterPosition(positions) {
        this.calculate_scene_center_obj.max.x = this.calculate_scene_center_obj.max.x > positions.x ? this.calculate_scene_center_obj.max.x : positions.x;
        this.calculate_scene_center_obj.max.y = this.calculate_scene_center_obj.max.y > positions.y ? this.calculate_scene_center_obj.max.y : positions.y;
        this.calculate_scene_center_obj.max.z = this.calculate_scene_center_obj.max.z > positions.z ? this.calculate_scene_center_obj.max.z : positions.z;
        this.calculate_scene_center_obj.min.x = this.calculate_scene_center_obj.min.x < positions.x ? this.calculate_scene_center_obj.min.x : positions.x;
        this.calculate_scene_center_obj.min.y = this.calculate_scene_center_obj.min.y < positions.y ? this.calculate_scene_center_obj.min.y : positions.y;
        this.calculate_scene_center_obj.min.z = this.calculate_scene_center_obj.min.z < positions.z ? this.calculate_scene_center_obj.min.z : positions.z;
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
            let r = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2) + Math.pow(vector.z, 2));

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
