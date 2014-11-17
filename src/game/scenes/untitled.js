game.module(
    'game.scenes.untitled'
)
.require(
    'bamboo.core',
    'bamboo.runtime.nodes.layer',
    'bamboo.runtime.nodes.image'
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
                },
                "cacheAsBitmap": false,
                "fixed": false
            }
        },
        {
            "class": "Image",
            "properties": {
                "parent": "main",
                "name": "Image",
                "position": {
                    "x": 384,
                    "y": 288
                },
                "size": {
                    "x": 128,
                    "y": 160
                },
                "anchor": {
                    "x": 0.5,
                    "y": 0.5
                },
                "image": false,
                "alpha": 1,
                "flipX": false,
                "flipY": false
            }
        },
        {
            "class": "Image",
            "properties": {
                "parent": "main",
                "name": "Image2",
                "position": {
                    "x": 512,
                    "y": 192
                },
                "size": {
                    "x": 160,
                    "y": 128
                },
                "anchor": {
                    "x": 0,
                    "y": 0
                },
                "image": false,
                "alpha": 1,
                "flipX": false,
                "flipY": false
            }
        }
    ]
};

game.bamboo.scenes[json.name] = json;

});
