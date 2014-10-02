game.module(
    'bamboo.runtime.nodes.emitter'
)
.require(
    'bamboo.core',
    'bamboo.runtime.node'
)
.body(function() {
'use strict';

/**
    Emitter calls targets emit function.
    @class Emitter
    @namespace bamboo.Nodes
**/
bamboo.createNode('Emitter', {
    active: true,
    time: 0,
    /**
        Number of times emitted.
        @property {Number} count
    **/
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

/**
    @property {Node} target
**/
bamboo.addNodeProperty('Emitter', 'target', 'node');
/**
    How often to emit.
    @property {Number} interval
    @default 1
**/
bamboo.addNodeProperty('Emitter', 'interval', 'number', 1);
/**
    Is emitter activated from trigger.
    @property {Boolean} triggered
**/
bamboo.addNodeProperty('Emitter', 'triggered', 'boolean');

});
