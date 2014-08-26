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
        this.leftLine.position.x = this.editor.worldTargetPos.x + world.displayObject.scale.x * (0 - world.cameraPosition.x);
        this.topLine.position.y = this.editor.worldTargetPos.y + world.displayObject.scale.y * (0 - world.cameraPosition.y);
        this.rightLine.position.x = this.editor.worldTargetPos.x + world.displayObject.scale.x * (world.width - world.cameraPosition.x);
        this.bottomLine.position.y = this.editor.worldTargetPos.y + world.displayObject.scale.y * (world.height - world.cameraPosition.y);

        this.screenRect.clear();
        this.screenRect.lineStyle(2, 0xffffff);
        this.screenRect.drawRect(-1, -1, 2 + world.displayObject.scale.x * game.System.width, 2 + world.displayObject.scale.y * game.System.height);
        this.screenRect.position.x = this.editor.worldTargetPos.x;
        this.screenRect.position.y = this.editor.worldTargetPos.y;
        
        this.screenDim.clear();
        this.screenDim.beginFill(0x000000, 0.7);

        var miny = 0;
        var maxy = game.system.height;
        
        if (this.editor.worldTargetPos.y > 0) {
            miny = this.editor.worldTargetPos.y;
            this.screenDim.drawRect(0, 0, game.system.width, miny);
        }

        if (this.editor.worldTargetPos.y + world.displayObject.scale.y * game.System.height < game.system.height) {
            maxy = this.editor.worldTargetPos.y + world.displayObject.scale.y * game.System.height;
            this.screenDim.drawRect(0, maxy, game.system.width, game.system.height - maxy);
        }

        if(this.editor.worldTargetPos.x > 0) this.screenDim.drawRect(0, miny, this.editor.worldTargetPos.x, maxy - miny);
        if(this.editor.worldTargetPos.x + world.displayObject.scale.x * game.System.width < game.system.width) this.screenDim.drawRect(this.editor.worldTargetPos.x + world.displayObject.scale.x * game.System.width, miny, game.system.width - (this.editor.worldTargetPos.x + world.displayObject.scale.x * game.System.width), maxy - miny);
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
