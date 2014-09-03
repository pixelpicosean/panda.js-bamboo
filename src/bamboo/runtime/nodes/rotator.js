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

    update: function() {
        if (!this.active) return;

        var elapsed = ((this.world.time - this.offset) % this.duration) / this.duration;

        if (!this.loop && this.world.time - this.offset >= this.duration) {
            elapsed = 1;
        }

        // if (this.mode === 'backAndForth') {
        //     var rounds = Math.floor((this.world.time+this.duration*0.5) / this.duration);
        //     if (rounds % 2 !== 0) f = 1 - f;
        // }

        var radians = this.degrees * (Math.PI / 180);
        
        this.displayObject.rotation = this.rotation + radians * this.easing(elapsed);
    }
});

bamboo.addNodeProperty('Rotator', 'duration', 'number', 3);
bamboo.addNodeProperty('Rotator', 'degrees', 'number', 360);
bamboo.addNodeProperty('Rotator', 'easing', 'easing');
bamboo.addNodeProperty('Rotator', 'loop', 'boolean');
bamboo.addNodeProperty('Rotator', 'triggered', 'boolean');

});
