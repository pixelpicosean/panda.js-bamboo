game.module(
    'bamboo.editor.camera'
)
.body(function() {
    
game.createClass('BambooCamera', {
    zoom: 1,

    init: function(editor) {
        this.editor = editor;

        this.position = new game.Point();
        this.center = new game.Point(game.system.width / 2 - this.editor.config.systemWidth / 2, game.system.height / 2 - this.editor.config.systemHeight / 2);
        this.offset = new game.Point();
    },

    set: function(x, y) {
        this.position.x = this.center.x - (x - this.offset.x);
        this.position.y = this.center.y - (y - this.offset.y);

        this.editor.boundary.update();
        this.editor.updateLayers();
    },

    reset: function() {
        console.log('TODO');
    },

    zoomIn: function() {
        this.zoom = this.zoom * 1.2;
        this.editor.mainContainer.scale.set(this.zoom, this.zoom);
    },

    zoomOut: function() {
        this.zoom = this.zoom / 1.2;
        this.editor.mainContainer.scale.set(this.zoom, this.zoom);
    },

    zoomReset: function() {
        this.zoom = 1;
        this.editor.mainContainer.scale.set(this.zoom, this.zoom);
    }
});

});
