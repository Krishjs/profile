var krishjs = {};
var krishjs = krishjs || {};
krishjs.detector = {
    //Copied from the Threejs detector src: https://github.com/mrdoob/three.js/blob/master/examples/js/Detector.js
    webgl: (function () {
        try {
            var canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    })(),
    canvas: !!window.CanvasRenderingContext2D,
    workers: !!window.Worker,
    fileapi: window.File && window.FileReader && window.FileList && window.Blob,
};
(function (kjs) {

    function Position(x, y, z) {
        this._x = x !== undefined ? x : 0;
        this._y = y !== undefined ? y : 0;
        this._z = z !== undefined ? z : 0;
        this.onChangeCallBack = function () {};
    };

    function Color(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.onChangeCallBack = function () {};
    };

    Object.defineProperties(Position.prototype, {
        x: {
            get: function () {
                return this._x;
            },
            set: function (value) {
                this._x = value;
                this.onChangeCallBack();
            }
        },
        y: {
            get: function () {
                return this._y;
            },
            set: function (value) {
                this._y = value;
                this.onChangeCallBack();
            }
        },
        z: {
            get: function () {
                return this._z;
            },
            set: function (value) {
                this._z = value;
                this.onChangeCallBack();
            }
        },
    });

    Object.assign(Position.prototype, {
        onChange: function (callBack) {
            this.onChangeCallBack = callBack;
        }
    });

    kjs.threejs = {};

    kjs.threejs.helper = {
        raycaster: null,
        font: null,
        init: function () {
            this.raycaster = new THREE.Raycaster(), self = this;
            var loader = new THREE.FontLoader();
            loader.load('fonts/FontAwesome_Regular.json', function (response) {
                self.font = response;
            });
        },
        settings: {
            segments: 32,
            camera: {
                angle: 60,
                width: window.innerWidth,
                height: window.innerHeight,
                nearclip: 1,
                farclip: 10000,
                positionX: 0,
                positionY: 160,
                positionZ: 400
            }
        },
        getScene: function () {
            return new THREE.Scene();
        },
        getCamera: function (settings) {
            if (settings === undefined) {
                settings = this.settings.camera;
            }
            var camera = new THREE.PerspectiveCamera(settings.angle, settings.width / settings.height,
                settings.nearclip, settings.farclip);
            camera.position.set(settings.positionX, settings.positionY, settings.positionZ);
            return camera;
        },
        getRenderer: function () {
            return kjs.detector.webgl ? new THREE.WebGLRenderer({
                precision: "mediump",
                antialias: true
            }) : new THREE.CanvasRenderer();
        },
        getControls: function (camera, domElement) {
            if (camera === undefined) {
                nakal.logger.error("Fatal Error! Camera not found")
            }
            var controls = new THREE.TrackballControls(camera, domElement);
            controls.noPan = !0;
            return controls;
        },
        getGeometry: function () {
            return new THREE.Geometry();
        },
        getMesh: function (geometry, material) {
            if (material) {
                return new THREE.Mesh(geometry, material);
            }
            return new THREE.Mesh(geometry);
        },
        getMaterial: function (color, wireframe) {
            return new THREE.MeshLambertMaterial({
                color: color || this.getRandomColor(),
                transparent: false,
                opacity: this.Opacity.Normal,
                flatShading: false,
                wireframe: wireframe === undefined ? false : true,
                side: THREE.DoubleSide
            });
        },
        getMaterials: function (geometry) {
            var materials = [];
            for (var i = 0; i < geometry.faces.length; i++) {
                materials.push(new THREE.MeshPhongMaterial({
                    color: "#000000",
                    shading: THREE.DoubleSided,
                    wireframe: i % 2 === 0,
                    overdraw: true
                }));
            }
            return materials;
        },
        gradTexture: function (color) {
            var c = document.createElement("canvas");
            var ct = c.getContext("2d");
            var size = 1024;
            c.width = 16;
            c.height = size;
            var gradient = ct.createLinearGradient(0, 0, 0, size);
            var i = color[0].length;
            while (i--) {
                gradient.addColorStop(color[0][i], color[1][i]);
            }
            ct.fillStyle = gradient;
            ct.fillRect(0, 0, 16, size);
            var texture = new THREE.Texture(c);
            texture.needsUpdate = true;
            return texture;
        },
        getBackGround: function () {
            var buffgeoBack = new THREE.BufferGeometry();
            buffgeoBack.fromGeometry(new THREE.IcosahedronGeometry(3000, 2));
            var bg = new THREE.Mesh(buffgeoBack, new THREE.MeshBasicMaterial({
                map: this.gradTexture([
                    [0.75, 0.6, 0.4, 0.25],
                    ['#1B1D1E', '#3D4143', '#72797D', '#b0babf']
                ]),
                side: THREE.BackSide,
                depthWrite: false,
                fog: false
            }));
            return bg;
        },
        getCubeGeometry: function (x, y, z) {
            var geometry = new THREE.BoxGeometry(x, y, z);
            return geometry;
        },
        getCube: function (geometry, material) {
            return new THREE.Mesh(geometry, material || this.getMaterial());
        },
        getPlane: function (x, y, z, material) {
            var geometry = new THREE.PlaneGeometry(x, y, z);
            return new THREE.Mesh(geometry, material || this.getMaterial());
        },
        getGroup: function () {
            return new THREE.Group();
        },
        getGroupAndaddObject: function (objects) {
            var group = new THREE.Group();
            objects.forEach(function (obj) {
                group.add(obj);
            });
            return group;
        },
        Opacity: {
            Normal: 1,
            Highlight: 0.6,
            Dim: 0.3
        },
        ArrayOrSingle: function (obj, fn) {
            var self = this;
            if (obj instanceof Array) {
                obj.forEach(function (material, index, actual) {
                    fn.call(self, material, index, actual);
                });
            } else {
                fn(obj);
            }
        },
        isGroup: function (obj) {
            return obj instanceof THREE.Group;
        },
        setVisible: function (obj, flag) {
            obj.material.visible = flag;
        },
        addAmbientlight: function (scene) {
            var ambientLight = new THREE.AmbientLight(0x333333, 0.5);
            scene.add(ambientLight);
            return ambientLight;
        },
        addDirectionallight: function (scene) {
            var light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
            scene.add(light);
            return light;
        },
        getRandomColor: function () {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }
    };
    kjs.physics = {};

    kjs.physics.helper = {
        init: function () {

        },
        settings: {
            worldscale: 100,
        },
        getWorld: function () {
            return new OIMO.World({
                info: true,
                worldscale: 100
            });
        },
        getPlane: function (size, object3D, world, move) {
            return {
                type: 'plane',
                size: size,
                pos: object3D.position.toArray(),
                rot: object3D.rotation.toArray().slice(0, 3).map(function (radian) {
                    return radian * (180 / Math.PI);
                }),
                density: 1,
                friction: 0.2,
                restitution: 0.2,
                belongsTo: 1,
                collidesWith: 0xffffffff,
                world: world,
                move: move
            };
        },
        getCube: function (size, object3D, world, move) {
            return {
                type: 'box',
                size: size,
                pos: object3D.position.toArray(),
                rot: object3D.rotation.toArray().slice(0, 3).map(function (radian) {
                    return radian * (180 / Math.PI);
                }),
                density: 1,
                friction: 0.2,
                restitution: 0.2,
                belongsTo: 1,
                collidesWith: 0xffffffff,
                world: world,
                move: move
            };
        }
    };
    kjs.events = {};

    kjs.events = {
        register: function (evt, fn) {
            window.addEventListener(evt, fn, false);
        }
    };

    kjs.animator = {
        events: [],
        init: function () {
            var self = this;
            requestAnimationFrame(function () {
                self.animate();
            });
        },
        animate: function () {
            this.init();
            this.events.forEach(function (evt) {
                evt.method.apply(evt.scope, []);
            });
        },
        register: function (evt) {
            this.events.push({
                method: evt.method,
                scope: evt.scope
            });
        }
    };

    kjs.home = function (parameter) {

        var helper = kjs.threejs.helper;
        var physicsHelper = kjs.physics.helper;
        var getHandler = function (fn, scope) {
            return function () {
                return fn.apply(scope, Array.prototype.slice.call(arguments));
            }
        };

        this.container = parameter.frame;

        this.scene = helper.getScene();
        this.camera = helper.getCamera();
        this.renderer = helper.getRenderer();
        this.renderer.setSize(parameter.width, parameter.height);
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = 0;
        this.renderer.domElement.style.zIndex = -1;
        this.renderer.domElement.style.left = 0;
        this.container.appendChild(this.renderer.domElement);
        this.controls = helper.getControls(this.camera, this.renderer.domElement);
        this.ambientLight = helper.addAmbientlight(this.scene);
        this.light = helper.addDirectionallight(this.scene);

        this.background = helper.getBackGround();
        this.scene.add(this.background);
        var ToRad = 0.0174532925199432957;

        function addStaticBox(size, position, rotation, sc) {
            var mesh = new THREE.Mesh(new THREE.BufferGeometry().fromGeometry(new THREE.BoxGeometry(1, 1, 1)),
                new THREE.MeshPhongMaterial({
                    shininess: 10,
                    color: 0x3D4143,
                    transparent: true,
                    opacity: 0.5
                }));
            mesh.scale.set(size[0], size[1], size[2]);
            mesh.position.set(position[0], position[1], position[2]);
            mesh.rotation.set(rotation[0] * ToRad, rotation[1] * ToRad, rotation[2] * ToRad);
            mesh.userData.isFloor = true;
            sc.add(mesh);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
        }
        addStaticBox([400, 80, 400], [0, -40, 0], [0, 0, 0], this.scene);
        this._width = parameter.width !== undefined ? parameter.width : 1;
        this._height = parameter.height !== undefined ? parameter.height : 1;
        this._length = parameter.length !== undefined ? parameter.length : 1;
        this._position = parameter.position !== undefined ? parameter.position : new Position();
        this._onresizemanager = parameter.onresizeManager;
        this.world = physicsHelper.getWorld();
        this.floor = helper.getPlane(parameter.width, parameter.height, parameter.height, new THREE.MeshBasicMaterial({
            color: 0xC0C0C0,
        }));
        this.floor.position.y = -10;
        var ground = this.world.add({
            size: [400, 80, 400],
            pos: [0, -40, 0],
            world: this.world
        });
        //this.floor.rotation.x = -Math.PI / 2;
        this.floor.userData.isFloor = true;
        //this.scene.add(this.floor);
        this.physicalFloor = this.world.add(physicsHelper.getCube([parameter.width, parameter.height, parameter.height], this.floor, this.world, false));
        this.floor.userData.body = this.physicalFloor;
        this.resizeHandler = function () {
            var dimension = this._onresizemanager();
            var width = dimension.width;
            var height = dimension.height;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
            this.animate();
        };
        this.updatePhysics = function () {
            var index = this.scene.children.length;
            while (index--) {
                var mesh = this.scene.children[index];
                var body = mesh.userData.body;
                if (!mesh.userData.isFloor &&
                    body !== undefined && !body.sleeping) {
                    console.log(body.getPosition());
                    mesh.position.copy(body.getPosition());
                    mesh.quaternion.copy(body.getQuaternion());
                }
            }
            this.world.step();
        };

        this.animate = function () {
            this.controls.update();
            this.light.position.copy(this.camera.position);
            this.renderer.render(this.scene, this.camera);
            this.updatePhysics();
        };

        kjs.events.register('resize', getHandler(this.resizeHandler, this));

        kjs.animator.register({
            method: this.animate,
            scope: this
        });
    };

    Object.defineProperties(kjs.home.prototype, {
        position: {
            get: function () {
                return this.position;
            },
            set: function (value) {
                this.position = value;
                this.onPositionChange()
            }
        },
    });

    Object.assign(kjs.home.prototype, {
        init: function () {

        },
        addTile: function (tile) {
            this.scene.add(tile.Object3D);
        }
    });

    function DominoTile(width, height, length) {

        this._width = width !== undefined ? width : 5;
        this._height = height !== undefined ? height : 20;
        this._length = length !== undefined ? length : 10;

        this.type = 'DominoTile';

        this.isTile = true;

        this.color = new Color();

        this.Object3D = null;

        this.physicalObject = null;

        this.render = function (world) {
            var helper = kjs.threejs.helper;
            var physicsHelper = kjs.physics.helper;
            this.Object3D = helper.getCube(helper.getCubeGeometry(this._width, this._height, this._length), helper.getMaterial('#966F33'));
            //this.physicalObject = world.add(physicsHelper.getCube([this._width, this._height, this._length], this.Object3D, world, true));
            //this.Object3D.userData.body = this.physicalObject;
        };
    };

    Object.defineProperties(DominoTile.prototype, {
        width: {
            get: function () {
                return this._width;
            },
            set: function (value) {
                this._width = value;
                this.onWidthChange();
            }
        },
        height: {
            get: function () {
                return this._height;
            },
            set: function (value) {
                this._height = value;
                this.onWidthChange();
            }
        },
        length: {
            get: function () {
                return this._length;
            },
            set: function (value) {
                this._length = value;
                this.onLengthChange();
            }
        },
    });

    Object.assign(DominoTile.prototype, {
        setColor: function () {

        }
    });
    kjs.universe = {
        home: null,
        init: function () {
            this.home = new kjs.home({
                frame: document.getElementById('container'),
                width: window.innerWidth,
                height: window.innerHeight,
                onresizeManager: function () {
                    return {
                        width: window.innerWidth,
                        height: window.innerHeight
                    };
                }
            });

            var index = 0;
            for (; index < 100;) {
                var tile = new DominoTile();
                tile.render(this.home.world);
                tile.Object3D.position.x = (window.innerWidth / 2) - (index * 10);                
                tile.physicalObject = this.home.world.add({
                    type: 'box',
                    size: [tile.width, tile.height, tile.length],
                    pos: [tile.Object3D.position.x, tile.Object3D.position.y, tile.Object3D.position.z],
                    move: true,
                    world: this.home.world
                });
                tile.Object3D.userData.body = tile.physicalObject;
                this.home.addTile(tile);
                index++;
            }
            //this.home.world.gravity = new OIMO.Vec3(0, 9.8, 0);
        },
    };

    kjs.universe.init();
    kjs.animator.init();

})(krishjs);