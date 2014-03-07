game.module(
    'bamboo.runtime.vec2'
)
.require(
    'engine.physics'
)
.body(function () {


function Vec2(x,y) {
    this.x = x || 0;
    this.y = y || 0;
}

window.Vec2 = Vec2;

Vec2.create = function(x, y) {
    return new Vec2(x,y);
};

Vec2.prototype.set = function(x, y) {
    this.x = x;
    this.y = y;
    return this;
};

Vec2.prototype.clone = function() {
    return new Vec2(this.x, this.y);
};

Vec2.prototype.add = function(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
};
Vec2.prototype.addc = function(v) {
    return new Vec2(this.x+v.x, this.y+v.y);
};

Vec2.prototype.subtract = function(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
};
Vec2.prototype.subtractc = function(v) {
    return new Vec2(this.x-v.x, this.y-v.y);
};

Vec2.prototype.length = function() {
    return Math.sqrt(this.x*this.x + this.y*this.y);
};
Vec2.prototype.lengthSq = function() {
    return this.x*this.x + this.y*this.y;
};

Vec2.prototype.dot = function(v) {
    return this.x * v.x + this.y * v.y;
};

Vec2.prototype.normalize = function() {
    var l = this.length();
    if(l !== 0) {
        this.x /= l;
        this.y /= l;
    }
    return this;
};
Vec2.prototype.normalizec = function() {
    return this.clone().normalize();
};

Vec2.prototype.multiply = function(f) {
    this.x *= f;
    this.y *= f;
    return this;
};
Vec2.prototype.multiplyc = function(f) {
    return new Vec2(this.x*f, this.y*f);
};

Vec2.prototype.multiplyAdd = function(v, f) {
    this.x += v.x*f;
    this.y += v.y*f;
    return this;
};

Vec2.prototype.distance = function(v) {
    var x = this.x - v.x;
    var y = this.y - v.y;
    return Math.sqrt(x*x + y*y);
};
Vec2.prototype.distanceSq = function(v) {
    var x = this.x - v.x;
    var y = this.y - v.y;
    return x*x + y*y;
};

Vec2.prototype.angle = function(v) {
    return Math.atan2(v.y, v.x) - Math.atan2(this.y, this.x);
};


PIXI.Point = Vec2;

});
