import { loadImage, ClickHandle, Tween, } from './util.js';

export default class ParticleEllipse {
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
    click_handle = void 0;
    request_animate_id = 0;

    // need to dispose;
    points = void 0;
    bad_points = void 0;

    point_geometry = void 0;
    point_material = void 0;
    point_texture = void 0;

    bad_point_geometry = void 0;
    bad_point_material = void 0;
    bad_point_texture = void 0;
    is_move_target = false;
    is_zoom = false;
    id = 0;
    camera_target_tween = void 0;
    camera_fov_tween = void 0;

    constructor(dom, data, env) {
        this.raycaster.params.Points.threshold = this.threshold;
        this.dom = dom;
        this.data =data;
        this.env = env;
        this.init();
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
        this.addEvent();
    }

    initCanvas() {
        this.w = parseInt(window.getComputedStyle(this.dom).getPropertyValue('width'));
        this.h =  parseInt(window.getComputedStyle(this.dom).getPropertyValue('height'));
    }

    initRenderer() {
        if (this.renderer === void 0) {
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.dom,
                // 在 css 中设置背景色透明显示渐变色
                alpha: true,
                // 开启抗锯齿
                antialias: true
            });

            // 这句要加，否则镜头会发虚
            this.renderer.setSize(this.w, this.h);
            // this.renderer.setSize(400, 400);
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
            this.camera.position.set(0, 2800, 5000);
            // this.camera.lookAt(this.scene.position);
        }
    }

    initControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        // 使动画循环使用时阻尼或自转 意思是否有惯性
        this.controls.enableDamping = true;
        //动态阻尼系数 就是鼠标拖拽旋转灵敏度
        this.controls.dampingFactor = 0.5;
        //是否可以缩放
        this.controls.enableZoom = true;
        //是否自动旋转
        this.controls.autoRotate = false;
        //设置相机距离原点的最远距离
        this.controls.minDistance = 0;
        //设置相机距离原点的最远距离
        this.controls.maxDistance = 8000;
        //是否开启右键拖拽 手机上可以禁止拖拽中心
        this.controls.enablePan = false;

        this.controls.minPolarAngle = Math.PI * 45 / 96;
        this.controls.maxPolarAngle = Math.PI * 45 / 96;
    }

    initTest() {
        this.initAxes();
        this.initState();
        this.initGui();
    }

    initAxes() {
        //轴辅助 （每一个轴的长度）
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

        let geometry = new THREE.SphereGeometry(300, 320, 300);
        geometry.applyMatrix(new THREE.Matrix4().makeScale(30.0, 1.6, 30.0));

        let count = geometry.vertices.length;
        let positions = new Float32Array(count * 3);
        let colors = new Float32Array(count * 3);
        let size = new Float32Array(count);
        let good_color = new THREE.Color(0xF0FFF0);
        let max_x = 0;
        let min_x = 0;
        let max_y = 0;
        let min_y = 0;
        let max_z = 0;
        let min_z = 0;

        for (var i = 0; i < count; i++) {
            let vertex = geometry.vertices[i];

            let x =  vertex.x + 400 * Math.random() - 200;
            let y = vertex.y + 500 * (2 * Math.random());
            let z = vertex.z + 400 * Math.random() - 200;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            if (x > max_x) {
                max_x = x;
            }

            if (x < min_x) {
                min_x = x;
            }

            if (y > max_y) {
                max_y = y;
            }

            if (y < min_y) {
                min_y = y;
            }

            if (z > max_z) {
                max_z = z;
            }

            if (z < min_z) {
                min_z = z;
            }

            colors[i * 3] = good_color.r;
            colors[i * 3 + 1] = good_color.g;
            colors[i * 3 + 2] = good_color.b;

            size[i] = 200;
        }

        // console.log(`max x is ${max_x}`);
        // console.log(`min x is ${min_x}`);
        // console.log(`max y is ${max_y}`);
        // console.log(`min y is ${min_y}`);
        // console.log(`max z is ${max_z}`);
        // console.log(`min z is ${min_z}`);

        this.point_geometry = new THREE.BufferGeometry();
        this.point_geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.point_geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.point_geometry.addAttribute('size', new THREE.BufferAttribute(size, 1).setDynamic(true));
        this.point_texture = this.anotherSprite();

        this.point_material = new THREE.ShaderMaterial( {
            color: 0xffffff,
            uniforms: {
                color: { value: new THREE.Color( 0xffffff ) },
                texture: {
                    value: this.point_texture
                }
            },
            vertexShader: vertexshader,
            fragmentShader: fragmentshader,
            blending: THREE.AdditiveBlending,
            // blending: THREE.NoBlending,
            depthTest: false,
            transparent: true,
            vertexColors: true,
            side: THREE.DoubleSide,
        } );

        // let shaderMaterial = new THREE.PointsMaterial({
        //     // color: 0xffffff,
        //     size: 100,
        //     // vertexColors: true, // 是否为几何体的每个顶点应用颜色，默认值是为所有面应用材质的颜色
        //     // blending: THREE.NoBlending,
        //     blending: THREE.AdditiveBlending,
        //     map: this.anotherSprite(),
        //     sizeAttenuation: true,
        //     opacity: 1,
        //     transparent: true,
        //     depthTest: false,
        // });

        this.points = new THREE.Points(this.point_geometry, this.point_material);
        console.log(this.points.geometry.attributes.position.count);
        this.group.add(this.points);



        let bad_point_count = this.data.length;
        let bad_point_positions =[];
        let bad_point_colors = [];
        let bad_point_size = [];
        let bad_point_custom_data = [];
        let bad_point_color = new THREE.Color(0x8B0000);

        for (var i = 0; i < bad_point_count; i++) {
            let group_obj = this.data[i];
            let group_user_count = group_obj.number;
            let center_position =  this.createClickPointPosition();

            for  (var j = 0; j < group_user_count; j++) {
                let position = this.getPositionByRandomSphere(50, center_position);
                bad_point_positions.push(position.x + 200 * Math.random() - 100);
                bad_point_positions.push(position.y + 200 * Math.random() - 100);
                bad_point_positions.push(position.z + 200 * Math.random() - 100);
                bad_point_size.push(200);
                bad_point_colors.push(bad_point_color.r);
                bad_point_colors.push(bad_point_color.g);
                bad_point_colors.push(bad_point_color.b);
                bad_point_custom_data.push(group_obj.community);
            }
        }

        this.bad_point_geometry = new THREE.BufferGeometry();
        this.bad_point_geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(bad_point_positions), 3));
        this.bad_point_geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(bad_point_colors), 3));
        this.bad_point_geometry.addAttribute('size', new THREE.BufferAttribute(new Float32Array(bad_point_size), 1));
        this.bad_point_geometry.addAttribute('custom', new THREE.BufferAttribute(new Float32Array(bad_point_custom_data), 1));
        this.bad_point_texture = this.badPointSprite();

        this.bad_point_material = new THREE.PointsMaterial({
            // color: 0xffffff,
            size: this.threshold * 2,
            // vertexColors: true, // 是否为几何体的每个顶点应用颜色，默认值是为所有面应用材质的颜色
            // blending: THREE.NoBlending,
            blending: THREE.AdditiveBlending,
            map: this.bad_point_texture,
            sizeAttenuation: true,
            opacity: 1,
            transparent: true,
            depthTest: false,
            side: THREE.DoubleSide,
        });

        this.bad_points = new THREE.Points(this.bad_point_geometry, this.bad_point_material);
        this.group.add(this.bad_points);
        this.scene.add(this.group);

        geometry.dispose();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    animate() {
        if (this.is_test) {
            this.stats.update();
        }

        if (this.test_control.is_enable_animate && !this.is_zoom) {
            this.group.rotateY(Math.PI/8000);
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

    addEvent() {
        this.click_handle = new ClickHandle(this, this.dom);
        this.click_handle.setHandle(this.mouseDownHandle.bind(this));
    }

    mouseDownHandle(event) {
        if (this.test_control.is_enable_event) {

            let x = event.clientX || event.changedTouches[0].clientX;
            let y = event.clientY || event.changedTouches[0].clientY;

            this.mouse.x = ((x - this.dom.getBoundingClientRect().left) / this.w) * 2 - 1;
            this.mouse.y = - ((y - this.dom.getBoundingClientRect().top) / this.h) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, this.camera);

            let intersects = this.raycaster.intersectObjects([this.bad_points], true);

            if (intersects.length > 0) {
                this.id = intersects[0].object.geometry.attributes.custom.array[intersects[0].index];
                this.test_control.is_enable_animate = false;
                let point = intersects[0];
                this.controls.target = point.point;
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
                    setTimeout(() => {
                        this.is_zoom = true;
                        this.camera_fov_tween.start();
                    });
                });

                this.camera_target_tween.start();

                this.camera_fov_tween = new Tween({
                    source: this.camera.fov,
                    target: 5,
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
                        path: `/complex_network/detail/${ this.id }`
                    });
                });


            }
        }
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

        this.group.remove(this.points);
        this.group.remove(this.bad_points);
        this.scene.remove(this.group);
        this.scene.remove(this.camera);

        if (this.point_geometry) {
            this.point_geometry.dispose();
        }

        if (this.point_material) {
            this.point_material.dispose();
        }

        if (this.point_texture) {
            this.point_texture.dispose();
        }

        if (this.bad_point_geometry) {
            this.bad_point_geometry.dispose();
        }

        if (this.bad_point_material) {
            this.bad_point_material.dispose();
        }

        if (this.bad_point_texture) {
            this.bad_point_texture.dispose();
        }

        this.scene.dispose();
        this.renderer.dispose();
    }

    createCanvasMaterial(color = '#FFFFFF' , size = 256) {
        let canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        let context = canvas.getContext('2d');
        // create exture object from canvas.
        let texture = new THREE.Texture(canvas);
        // Draw a circle
        let center = size/2;
        context.beginPath();
        context.arc(center, center, size/2, 0, 2 * Math.PI, false);
        context.closePath();
        context.fillStyle = color;
        context.fill();
        // need to set needsUpdate
        texture.needsUpdate = true;
        // return a texture made from the canvas
        return texture;
    }

    generateSprite() {
        let canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;

        let context = canvas.getContext('2d');
        let gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.2, 'rgba(0,255,255,1)');
        gradient.addColorStop(0.4, 'rgba(0,0,64,1)');
        gradient.addColorStop(1, 'rgba(0,0,0,1)');

        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        let texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    getCircle(size = 512) {
        let canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        let context = canvas.getContext('2d');
        // create exture object from canvas.
        let texture = new THREE.Texture(canvas);
        // Draw a circle
        let center = size/2;
        context.beginPath();
        context.arc(center, center, size/2, 0, 2 * Math.PI, false);
        context.closePath();
        context.fillStyle = 'rgba(255,255,255,1)';
        // context.fillStyle = 'rgba(0,0,0,1)';
        context.fill();
        // need to set needsUpdate
        texture.needsUpdate = true;
        // return a texture made from the canvas
        return texture;
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
            y: 1000 * (2 * Math.random() - 0.8),
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
}
