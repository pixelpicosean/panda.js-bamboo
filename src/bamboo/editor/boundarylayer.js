game.module(
    'bamboo.editor.boundarylayer'
)
.body(function() {

bamboo.BoundaryLayer = game.Class.extend({
    init: function(editor) {
        this.editor = editor;
        this.displayObject = new game.Container();
        this.createGraphics();
        this.updateBoundary();
    },

    updateBoundary: function() {
        var world = this.editor.world;
        var left = game.system.width / 2 - game.System.width / 2;
        var top = game.system.height / 2 - game.System.height / 2;

        this.leftLine.position.x = left + world.displayObject.scale.x * (0 - world.cameraPosition.x);
        this.topLine.position.y = top + world.displayObject.scale.y * (0 - world.cameraPosition.y);
        this.rightLine.position.x = left + world.displayObject.scale.x * (world.width - world.cameraPosition.x);
        this.bottomLine.position.y = top + world.displayObject.scale.y * (world.height - world.cameraPosition.y);

        this.screenRect.clear();
        this.screenRect.lineStyle(2, 0xffffff);
        this.screenRect.drawRect(-1, -1, 2 + world.displayObject.scale.x * game.System.width, 2 + world.displayObject.scale.y * game.System.height);
        this.screenRect.position.x = left;
        this.screenRect.position.y = top;
        
        this.screenDim.clear();
        this.screenDim.beginFill(0, 0.5);

        var miny = 0;
        var maxy = game.system.height;
        
        if (top > 0) {
            miny = top;
            this.screenDim.drawRect(0, 0, game.system.width, miny);
        }

        if (top + world.displayObject.scale.y * game.System.height < game.system.height) {
            maxy = top + world.displayObject.scale.y * game.System.height;
            this.screenDim.drawRect(0, maxy, game.system.width, game.system.height - maxy);
        }

        if(left > 0) this.screenDim.drawRect(0, miny, left, maxy - miny);
        if(left + world.displayObject.scale.x * game.System.width < game.system.width) this.screenDim.drawRect(left + world.displayObject.scale.x * game.System.width, miny, game.system.width - (left + world.displayObject.scale.x * game.System.width), maxy - miny);
    },

    resetGraphics: function() {
        this.displayObject.removeChild(this.boundaries);
        this.displayObject.removeChild(this.screenDim);

        this.boundaries.removeChild(this.leftLine);
        this.boundaries.removeChild(this.topLine);
        this.boundaries.removeChild(this.rightLine);
        this.boundaries.removeChild(this.bottomLine);
        this.boundaries.removeChild(this.screenRect);

        this.createGraphics();
        this.updateBoundary();
    },

    createGraphics: function() {
        this.boundaries = new game.Container();
        this.leftLine = new game.Graphics();
        this.topLine = new game.Graphics();
        this.rightLine = new game.Graphics();
        this.bottomLine = new game.Graphics();
        this.screenRect = new game.Graphics();
        this.screenDim = new game.Graphics();

        var color = 0x77ff55;
        this.leftLine.lineStyle(2, color);
        this.leftLine.moveTo(-1, 0);
        this.leftLine.lineTo(-1, game.system.height);
        this.topLine.lineStyle(2, color);
        this.topLine.moveTo(0, -1);
        this.topLine.lineTo(game.system.width, -1);
        this.rightLine.lineStyle(2, color);
        this.rightLine.moveTo(1, 0);
        this.rightLine.lineTo(1, game.system.height);
        this.bottomLine.lineStyle(2, color);
        this.bottomLine.moveTo(0, 1);
        this.bottomLine.lineTo(game.system.width, 1);

        this.displayObject.addChild(this.boundaries);
        this.displayObject.addChild(this.screenDim);

        this.boundaries.addChild(this.leftLine);
        this.boundaries.addChild(this.topLine);
        this.boundaries.addChild(this.rightLine);
        this.boundaries.addChild(this.bottomLine);
        this.boundaries.addChild(this.screenRect);
    }
});

});
