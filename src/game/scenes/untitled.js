game.module(
    'game.scenes.untitled'
)
.require(
    'bamboo.core',
    'bamboo.runtime.nodes.layer'
)
.body(function() {

var json = {
    "name": "Untitled",
    "width": 1024,
    "height": 768,
    "audio": [],
    "assets": [],
    "nodes": [
        {
            "class": "Layer",
            "properties": {
                "parent": "Untitled",
                "name": "main",
                "position": {
                    "x": 0,
                    "y": 0
                },
                "size": {
                    "x": 0,
                    "y": 0
                },
                "anchor": {
                    "x": 0,
                    "y": 0
                },
                "speedFactor": {
                    "x": 1,
                    "y": 1
                }
            }
        }
    ]
};

game.bamboo.scenes[json.name] = json;

});
