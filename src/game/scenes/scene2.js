game.module(
    'game.scenes.scene2'
)
.require(
    'bamboo.core',
    'bamboo.runtime.nodes.layer',
    'bamboo.runtime.nodes.image'
)
.body(function() {

var json = {
    "name": "Scene2",
    "width": 1024,
    "height": 768,
    "audio": [],
    "assets": [
        "panda2.png"
    ],
    "nodes": [
        {
            "class": "Layer",
            "properties": {
                "parent": "Scene2",
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
        },
        {
            "class": "Image",
            "properties": {
                "parent": "main",
                "name": "Image2",
                "position": {
                    "x": 384,
                    "y": 352
                },
                "size": {
                    "x": 70,
                    "y": 63
                },
                "anchor": {
                    "x": 0.5,
                    "y": 0.5
                },
                "image": "panda2.png",
                "alpha": 1
            }
        }
    ]
};

game.bamboo.scenes[json.name] = json;

});
