game.module(
    'game.main'
)
.require(
    // Load Bamboo core
    'bamboo.core',
    // Load Bamboo scene modules
    'game.scenes.scene1',
    'game.scenes.scene2',
    // Load custom node
    'game.nodes.mynode'
)
.body(function() {

game.createScene('Main', {
    // Load Bamboo scene using bambooScene property
    bambooScene: 'Scene1',

    init: function() {
        // Bamboo scene initiated
        console.log(this.bambooScene); // Bamboo scene object
    },

    click: function() {
        // Remove Bamboo assets from memory
        game.removeBambooAssets('Scene1');

        // Add Bamboo assets to load queue
        game.addBambooAssets('Scene2');

        var loader = new game.Loader('Test');
        loader.start();
    }
});

game.createScene('Test', {
    init: function() {
        // Load Bamboo scene manually
        var scene = new game.BambooScene('Scene2');
        
        // Make Bamboo scene update every frame
        this.addObject(scene);
        
        // Add Bamboo scene to stage
        scene.displayObject.addTo(this.stage);
    }
});

// Add Bamboo assets to load queue
game.addBambooAssets('Scene1');

});
