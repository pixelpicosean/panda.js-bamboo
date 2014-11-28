game.module(
    'bamboo.runtime.nodes.rotator'
)
.require(
    'bamboo.core',
    'bamboo.runtime.node'
)
.body(function() {

/**
    Rotator rotates it's children nodes.
    @class Rotator
    @namespace bamboo.Nodes
**/
game.createNode('Rotator', {
    active: true,
    offset: 0,

    trigger: function() {
        this.offset = this.scene.time;
        this.active = true;
    },

    ready: function() {
        if (this.triggered) this.active = false;
    },

    setProperty: function(name, value) {
        this._super(name, value);
        if (name === 'rotation') this.displayObject.rotation = value * (Math.PI / 180);
    },

    update: function() {
        if (!this.active) return;

        var elapsed = ((this.scene.time - this.offset) % this.duration) / this.duration;

        if (!this.loop && this.scene.time - this.offset >= this.duration) {
            elapsed = 1;
        }

        if (this.yoyo) {
            var rounds = Math.floor((this.scene.time - this.offset) / this.duration);
            if (rounds % 2 === 1) elapsed = 1.0 - elapsed;
        }

        var radians = this.degrees * (Math.PI / 180);
        this.displayObject.rotation = (this.rotation * (Math.PI / 180)) + radians * this.easing(elapsed);
    }
});

/**
    Start angle of rotator.
    @property {Number} rotation
    @default 0
**/
game.addNodeProperty('Rotator', 'rotation', 'number', 0);
/**
    Duration of rotation in seconds.
    @property {Number} duration
    @default 3
**/
game.addNodeProperty('Rotator', 'duration', 'number', 3);
/**
    How much to rotate in degrees.
    @property {Number} degrees
    @default 360
**/
game.addNodeProperty('Rotator', 'degrees', 'number', 360);
/**
    Easing function for rotation.
    @property {Easing} easing
**/
game.addNodeProperty('Rotator', 'easing', 'easing');
/**
    Should rotator loop.
    @property {Boolean} loop
**/
game.addNodeProperty('Rotator', 'loop', 'boolean');
/**
    Should rotator go back and forth.
    @property {Boolean} yoyo
**/
game.addNodeProperty('Rotator', 'yoyo', 'boolean');
/**
    Is rotator started from trigger.
    @property {Boolean} triggered
**/
game.addNodeProperty('Rotator', 'triggered', 'boolean');

});
