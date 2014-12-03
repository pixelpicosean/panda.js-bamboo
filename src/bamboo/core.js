pandaConfig.bamboo = pandaConfig.bamboo || {};

game.bamboo = {
    version: '0.10.0'
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
    game.nodes[name].properties = {};
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
    var sceneData = game.scenes[sceneName];
    if (!sceneData) throw 'scene ' + sceneName + ' not found';
    return sceneData;
};

game.module(
    'bamboo.core'
)
.require(
    'bamboo.runtime.node',
    'bamboo.runtime.point',
    'bamboo.runtime.scene',
    'engine.scene',
    'engine.tween'
)
.body(function() {

    // Init pool
    game.bambooPool = new game.Pool();
    game.bambooPool.create('point');
    var poolSize = game.config.bamboo.poolSize || 10;
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

    // Helper functions for easing
    // game.Tween.Easing.getNamesList = function() {
    //     var names = [];
    //     for (var i in game.Tween.Easing) {
    //         for (var o in game.Tween.Easing[i]) {
    //             names.push(i + '.' + o);
    //         }
    //     }
    //     return names;
    // };

    // game.Tween.Easing.getByName = function(name) {
    //     if (!name) return game.Tween.Easing.Linear.None;
    //     name = name.split('.');
    //     return game.Tween.Easing[name[0]][name[1]];
    // };

    // game.Tween.Easing.getName = function(easing) {
    //     for (var i in game.Tween.Easing) {
    //         for (var o in game.Tween.Easing[i]) {
    //             if (easing === game.Tween.Easing[i][o]) return i + '.' + o;
    //         }
    //     }
    // };

});
