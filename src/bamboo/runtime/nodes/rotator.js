game.module(
    'bamboo.runtime.nodes.rotator'
)
.require(
    'bamboo.core',
    'bamboo.runtime.node'
)
.body(function() {

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

// game.addNodeProperty('Rotator', 'rotation', 'number', 0);
// game.addNodeProperty('Rotator', 'duration', 'number', 3);
// game.addNodeProperty('Rotator', 'degrees', 'number', 360);
// game.addNodeProperty('Rotator', 'easing', 'easing');
// game.addNodeProperty('Rotator', 'loop', 'boolean');
// game.addNodeProperty('Rotator', 'yoyo', 'boolean');
// game.addNodeProperty('Rotator', 'triggered', 'boolean');

});
