pandaConfig.bamboo = pandaConfig.bamboo || {};

game.bamboo = {
    version: '0.8.0',
    scenes: {},
    nodes: {}
};

game.createNode = function(name, className, content) {
    if (!content) {
        content = className;
        className = null;
    }
    var extendClass = className ? game.bamboo.nodes[className] : game.bamboo.Node;
    game.bamboo.nodes[name] = extendClass.extend(content);
    game.bamboo.nodes[name].properties = {};
};

game.addNodeProperty = function(node, name, type, defaultValue, hidden, options) {
    node = game.bamboo.nodes[node] || game.bamboo.Node;
    node.properties[name] = new game.bamboo.Property(name, type, defaultValue, hidden, options);
};

game.addBambooAssets = function(sceneName) {
    var sceneData = game.bamboo.getSceneData(sceneName);
    for (var i = 0; i < sceneData.assets.length; i++) {
        game.addAsset(sceneData.assets[i]);
    }
};

game.removeBambooAssets = function(sceneName) {
    var sceneData = game.bamboo.getSceneData(sceneName);
    for (var i = 0; i < sceneData.assets.length; i++) {
        game.removeAsset(sceneData.assets[i]);
    }
};

game.bamboo.getSceneData = function(sceneName) {
    var sceneData = game.bamboo.scenes[sceneName];
    if (!sceneData) throw 'scene ' + sceneName + ' not found';
    return sceneData;
};

game.module(
    'bamboo.core'
)
.require(
    'bamboo.runtime.node',
    'bamboo.runtime.point',
    'bamboo.runtime.pool',
    'bamboo.runtime.property',
    'bamboo.runtime.scene',
    'engine.scene'
)
.body(function() {

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
