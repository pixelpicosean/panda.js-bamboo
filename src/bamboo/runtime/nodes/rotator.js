game.module(
    'bamboo.runtime.nodes.rotator'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {

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

bamboo.addNodeProperty('Rotator', 'rotation', 'number', 0);
bamboo.addNodeProperty('Rotator', 'duration', 'number', 3);
bamboo.addNodeProperty('Rotator', 'degrees', 'number', 360);
bamboo.addNodeProperty('Rotator', 'easing', 'easing');
bamboo.addNodeProperty('Rotator', 'loop', 'boolean');
bamboo.addNodeProperty('Rotator', 'yoyo', 'boolean');
bamboo.addNodeProperty('Rotator', 'triggered', 'boolean');

});
