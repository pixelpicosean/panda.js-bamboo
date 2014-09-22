game.module(
    'bamboo.runtime.nodes.physics'
)
.require(
    'bamboo.core'
)
.body(function() {
    
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

bamboo.addNodeProperty('Physics', 'gravity', 'vector', [0, 980]);

});
