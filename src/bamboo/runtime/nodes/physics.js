game.module(
    'bamboo.runtime.nodes.physics'
)
.require(
    'bamboo.core'
)
.body(function() {

/**
    @class Physics
**/
bamboo.createNode('Physics', {
    init: function() {
        this.displayObject = new game.Container();
        this.scene.world = new game.World();
    },

    ready: function() {
        this.scene.world.gravity.set(this.gravity.x, this.gravity.y);
    },

    update: function() {
        this.scene.world.update();
    }
});

/**
    Gravity for physics world.
    @property {Vector} gravity
    @default 0, 980
**/
bamboo.addNodeProperty('Physics', 'gravity', 'vector', [0, 980]);

});
