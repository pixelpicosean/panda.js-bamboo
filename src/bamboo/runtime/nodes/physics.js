game.module(
    'bamboo.runtime.nodes.physics'
)
.require(
    'bamboo.core'
)
.body(function() {

/**
    Physics world.
    @class Physics
    @namespace bamboo.Nodes
**/
bamboo.createNode('Physics', {
    init: function() {
        this.displayObject = new game.Container();
        this.world.physics = new game.World();
    },

    ready: function() {
        this.world.physics.gravity.set(this.gravity.x, this.gravity.y);
    },

    update: function() {
        this.world.physics.update();
    }
});

/**
    Gravity for physics world.
    @property {Vector} gravity
    @default 0, 980
**/
bamboo.addNodeProperty('Physics', 'gravity', 'vector', [0, 980]);

});
