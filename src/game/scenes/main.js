game.module(
    'game.scenes.main'
)
.require(
    'bamboo.core',
    'bamboo.runtime.nodes.layer'
)
.body(function() {

game.json['game.scenes.main'] = {
    "name": "Main",
    "width": 1024,
    "height": 768,
    "bgcolor": "0x000000",
    "camera": {
        "position": {
            "x": 0,
            "y": 0
        }
    },
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
                    "x": 64,
                    "y": 64
                },
                "rotation": 0,
                "scale": {
                    "x": 1,
                    "y": 1
                },
                "anchor": {
                    "x": 0,
                    "y": 0
                },
                "speedFactor": 1
            }
        }
    ]
}

});
