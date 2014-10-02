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
bamboo.createNode('Rotator', {
    active: true,
    offset: 0,

    trigger: function() {
        this.offset = this.world.time;
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

        var elapsed = ((this.world.time - this.offset) % this.duration) / this.duration;

        if (!this.loop && this.world.time - this.offset >= this.duration) {
            elapsed = 1;
        }

        if (this.yoyo) {
            var rounds = Math.floor((this.world.time - this.offset) / this.duration);
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
bamboo.addNodeProperty('Rotator', 'rotation', 'number', 0);
/**
    Duration of rotation in seconds.
    @property {Number} duration
    @default 3
**/
bamboo.addNodeProperty('Rotator', 'duration', 'number', 3);
/**
    How much to rotate in degrees.
    @property {Number} degrees
    @default 360
**/
bamboo.addNodeProperty('Rotator', 'degrees', 'number', 360);
/**
    Easing function for rotation.
    @property {Easing} easing
**/
bamboo.addNodeProperty('Rotator', 'easing', 'easing');
/**
    Should rotator loop.
    @property {Boolean} loop
**/
bamboo.addNodeProperty('Rotator', 'loop', 'boolean');
/**
    Should rotator go back and forth.
    @property {Boolean} yoyo
**/
bamboo.addNodeProperty('Rotator', 'yoyo', 'boolean');
/**
    Is rotator started from trigger.
    @property {Boolean} triggered
**/
bamboo.addNodeProperty('Rotator', 'triggered', 'boolean');

});
