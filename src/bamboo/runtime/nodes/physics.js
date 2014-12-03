game.module(
    'bamboo.runtime.nodes.physics'
)
.require(
    'bamboo.core'
)
.body(function() {

game.createNode('Physics', {
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

// game.addNodeProperty('Physics', 'gravity', 'vector', [0, 980]);

});
