game.module(
    'bamboo.editor.boundarylayer'
)
.body(function() {

game.bamboo.BoundaryLayer = game.Class.extend({
    dimAmount: 0.5,

    init: function(editor) {
        this.editor = editor;
        this.displayObject = new game.Container();
        this.createGraphics();
        this.updateBoundary();
    },

    toggleScreenDim: function() {
        this.dimAmount += 0.25;
        if (this.dimAmount > 1) this.dimAmount = 0;
        this.updateBoundary();
    },

    updateBoundary: function() {
        var left = (game.system.width / 2 - game.System.width / 2);
        var top = (game.system.height / 2 - game.System.height / 2);

        this.leftLine.position.x = left + (0 - this.editor.camera.position.x) - 1;
        this.topLine.position.y = top + (0 - this.editor.camera.position.y) - 1;
        this.rightLine.position.x = left + (this.editor.scene.width - this.editor.camera.position.x) + 1;
        this.bottomLine.position.y = top + (this.editor.scene.height - this.editor.camera.position.y) + 1;

        this.grid.position.x = this.leftLine.position.x + 1;
        this.grid.position.y = this.topLine.position.y + 1;

        this.screenRect.clear();
        this.screenRect.lineStyle(1, 0xffffff);
        this.screenRect.drawRect(-1, -1, 2 + game.System.width, 2 + game.System.height);
        this.screenRect.position.x = left;
        this.screenRect.position.y = top;
        
        this.screenDim.clear();
        this.screenDim.beginFill(0x2a2a2a, this.dimAmount);

        var miny = 0;
        var maxy = game.system.height;
        
        if (top > 0) {
            miny = top;
            this.screenDim.drawRect(0, 0, game.system.width, miny);
        }

        if (top + game.System.height < game.system.height) {
            maxy = Math.round(top + game.System.height);
            this.screenDim.drawRect(0, maxy, game.system.width, game.system.height - maxy);
        }

        if (left > 0) this.screenDim.drawRect(0, miny, left, (maxy - miny));
        if (left + game.System.width < game.system.width) this.screenDim.drawRect(left + game.System.width, miny, game.system.width - (left + game.System.width), maxy - miny);
    },

    resetGraphics: function() {
        this.displayObject.removeChild(this.boundaries);
        this.displayObject.removeChild(this.screenDim);

        this.boundaries.removeChild(this.leftLine);
        this.boundaries.removeChild(this.topLine);
        this.boundaries.removeChild(this.rightLine);
        this.boundaries.removeChild(this.bottomLine);
        this.boundaries.removeChild(this.screenRect);
        this.boundaries.removeChild(this.grid);

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
        this.leftLine.lineStyle(1, color);
        this.leftLine.moveTo(0, 0);
        this.leftLine.lineTo(0, game.system.height);
        this.topLine.lineStyle(1, color);
        this.topLine.moveTo(0, 0);
        this.topLine.lineTo(game.system.width, 0);
        this.rightLine.lineStyle(1, color);
        this.rightLine.moveTo(0, 0);
        this.rightLine.lineTo(0, game.system.height);
        this.bottomLine.lineStyle(1, color);
        this.bottomLine.moveTo(0, 0);
        this.bottomLine.lineTo(game.system.width, 1);

        this.displayObject.addChild(this.boundaries);
        this.displayObject.addChild(this.screenDim);

        this.boundaries.addChild(this.leftLine);
        this.boundaries.addChild(this.topLine);
        this.boundaries.addChild(this.rightLine);
        this.boundaries.addChild(this.bottomLine);
        this.boundaries.addChild(this.screenRect);

        this.grid = new game.Graphics();
        this.boundaries.addChild(this.grid);

        if (this.editor.gridSize === 0) return;

        var x = Math.ceil(this.editor.scene.width / this.editor.gridSize);
        var y = Math.ceil(this.editor.scene.height / this.editor.gridSize);

        this.grid.lineStyle(1, 0xffffff, 0.3);
        for (var i = 1; i < x; i++) {
            this.grid.moveTo(i * this.editor.gridSize, 0);
            this.grid.lineTo(i * this.editor.gridSize, this.editor.scene.height);
        }
        for (var i = 1; i < y; i++) {
            this.grid.moveTo(0, i * this.editor.gridSize);
            this.grid.lineTo(this.editor.scene.width, i * this.editor.gridSize);
        }
    }
});

});
