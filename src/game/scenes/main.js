game.module(
    'game.scenes.main'
)
.require(
    'bamboo.core',
    'bamboo.runtime.nodes.layer',
    'bamboo.runtime.nodes.image'
)
.body(function() {

var json = {
    "name": "Main",
    "width": 1024,
    "height": 768,
    "bgcolor": "0xb7bdc5",
    "assets": [
        "panda.png"
    ],
    "nodes": [
        {
            "class": "Layer",
            "properties": {
                "parent": "Main",
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
                "name": "Image",
                "position": {
                    "x": 512,
                    "y": 384
                },
                "size": {
                    "x": 286,
                    "y": 99
                },
                "anchor": {
                    "x": 0.5,
                    "y": 0.5
                },
                "image": "panda.png"
            }
        }
    ]
};

bamboo.scenes.push(json);
for (var i = 0; i < json.assets.length; i++) {
    game.addAsset(json.assets[i]);
}

});