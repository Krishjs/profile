var krishjs = {};
(function (kjs) {
    kjs.position = function (x, y, z) {
        this._x = x;
        this._y = y;
        this._z = z;
    };
    Object.defineProperties(kjs.position.prototype, {
        x: {
            get: function () {
                return this._x;
            },
            set: function (value) {
                this._x = value;
                this.onChangeCallBack();
            }
        },
    });
    Object.assign(kjs.position.prototype,{
        onChangeCallBack:function(){
            
        }
    });
    kjs.universe = {
        home: null
    };
    kjs.home = function (container, width, height, position) {
        this.container = container;
        this._width = width;
        this._height = height;
        this._position = position;
    };
    Object.defineProperties(kjs.home.prototype, {

    });
    Object.assign(kjs.home.prototype, {
        init: function () {

        }
    });
})(krishjs);