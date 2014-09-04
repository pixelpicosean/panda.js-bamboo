game.module(
    'bamboo.runtime.nodes.emitter'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {
'use strict';

bamboo.createNode('Emitter', {
    active: true,
    time: 0,
    count: 0,

    ready: function() {
        if (this.triggered) this.active = false;
    },

    emit: function() {
        this.time = 0;
        this.count++;
        if (this.target && typeof this.target.emit === 'function') this.target.emit(this);
    },

    trigger: function() {
        this.active = true;
    },

    update: function() {
        if (!this.active) return;
        this.time += game.system.delta;
        if (this.time >= this.interval) this.emit();
    }
});

bamboo.addNodeProperty('Emitter', 'target', 'node');
bamboo.addNodeProperty('Emitter', 'interval', 'number', 1);
bamboo.addNodeProperty('Emitter', 'triggered', 'boolean');

});
