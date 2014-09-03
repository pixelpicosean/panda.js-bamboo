game.module(
    'bamboo.runtime.point'
)
.require(
    'engine.renderer'
)
.body(function () {

// Replace this with game.Vector ?
game.Point = game.Class.extend({
    x: 0,
    y: 0,

    init: function(x, y) {
        this.x = x || this.x;
        this.y = y || this.y;
    },

    set: function(x, y) {
        this.x = x;
        this.y = y;
        return this;
    },

    copy: function(v) {
        this.set(v.x, v.y);
        return this;
    },

    clone: function() {
        var point = bamboo.pool.get();
        point.set(this.x, this.y);
        return point;
    },

    add: function(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    },

    addc: function(v) {
        var point = bamboo.pool.get();
        point.set(this.x + v.x, this.y + v.y);
        return point;
    },

    subtract: function(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    },

    subtractc: function(v) {
        var point = bamboo.pool.get();
        point.set(this.x - v.x, this.y - v.y);
        return point;
    },

    length: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    lengthSq: function() {
        return this.x * this.x + this.y * this.y;
    },

    dot: function(v) {
        return this.x * v.x + this.y * v.y;
    },

    normalize: function() {
        var l = this.length();
        if (l !== 0) {
            this.x /= l;
            this.y /= l;
        }
        return this;
    },

    normalizec: function() {
        return this.clone().normalize();
    },

    multiply: function(f) {
        this.x *= f;
        this.y *= f;
        return this;
    },

    multiplyc: function(f) {
        var point = bamboo.pool.get();
        point.set(this.x * f, this.y * f);
        return point;
    },

    multiplyAdd: function(v, f) {
        this.x += v.x * f;
        this.y += v.y * f;
        return this;
    },

    multiplyAddc: function(v, f) {
        var point = bamboo.pool.get();
        point.set(this.x + v.x * f, this.y + v.y * f);
        return point;
    },

    distance: function(v) {
        var x = this.x - v.x;
        var y = this.y - v.y;
        return Math.sqrt(x * x + y * y);
    },

    distanceSq: function(v) {
        var x = this.x - v.x;
        var y = this.y - v.y;
        return x * x + y * y;
    },

    angle: function(v) {
        return Math.atan2(v.y, v.x) - Math.atan2(this.y, this.x);
    }
});

});
