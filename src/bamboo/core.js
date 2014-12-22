game.bamboo = {
    version: '0.13.0',
    config: typeof bambooConfig !== 'undefined' ? bambooConfig : {}
};

game.scenes = {};
game.nodes = {};

game.createNode = function(name, className, content) {
    if (!content) {
        content = className;
        className = null;
    }
    var extendClass = className ? game.nodes[className] || className : game.Node;
    game.nodes[name] = extendClass.extend(content);
};

game.addBambooAssets = function(sceneName) {
    var sceneData = game.getSceneData(sceneName);
    for (var i = 0; i < sceneData.assets.length; i++) {
        game.addAsset(sceneData.assets[i]);
    }
};

game.removeBambooAssets = function(sceneName) {
    var sceneData = game.getSceneData(sceneName);
    for (var i = 0; i < sceneData.assets.length; i++) {
        game.removeAsset(sceneData.assets[i]);
    }
};

game.getSceneData = function(sceneName) {
    return game.scenes[sceneName];
};

game.module(
    'bamboo.core'
)
.require(
    'bamboo.runtime.node',
    'bamboo.runtime.point',
    'bamboo.runtime.scene',
    'engine.scene'
)
.body(function() {

    // Init pool
    game.bambooPool = new game.Pool();
    game.bambooPool.create('point');
    var poolSize = game.bamboo.config.poolSize || 10;
    for (var i = 0; i < poolSize; i++) {
        game.bambooPool.put('point', new game.Point());
    }

    game.Scene.inject({
        staticInit: function() {
            this._super();
            if (this.bambooScene) {
                this.bambooScene = new game.BambooScene(this.bambooScene);
                this.bambooScene.displayObject.addTo(this.stage);
                this.addObject(this.bambooScene);
            }
        }
    });

});
