var krishjs = {};
(function (kjs) {

    function Position (x, y, z) {
        this._x = x !== undefined ? x : 0;
        this._y = y !== undefined ? y : 0;
        this._z = z !== undefined ? z : 0;
        this.onChangeCallBack = function () {};
    };

    function Color (r, g, b) {
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

    kjs.universe = {
        home: null
    };

    kjs.home = function (container, width, height,length, position) {
        this.container = container;
        this._width = width !== undefined ? width :  1;
        this._height = height !== undefined ? height :  1;
        this._length = length !== undefined ? length :  1;
        this._position = position !== undefined ? position :  new Position();
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

        }
    });

    function DominoTile() {

        this._width = width;
        this._height = height;
        this._length = length;

        this.type = 'DominoTile';

        this.isTile = true;

        this.color = new Color();
  
        this.render = function () {

        }
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

})(krishjs);