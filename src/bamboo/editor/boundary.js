game.module(
    'bamboo.editor.boundary'
)
.body(function() {

game.createClass('BambooBoundary', {
    dimAlpha: 0.5,
    dimColor: 0x000000,
    lineColor: 0x77ff55,
    gridAlpha: 0.3,
    gridColor: 0xeeeeee,
    screenRectColor: 0x474747,

    init: function(editor) {
        this.editor = editor;
        
        this.container = new game.Container();
        this.boundaries = new game.Container().addTo(this.container);
        this.screenDim = new game.Graphics().addTo(this.container);
        this.screenDim.alpha = this.dimAlpha;
        this.screenRect = new game.Graphics().addTo(this.container);

        this.leftLine = new game.Graphics().addTo(this.boundaries);
        this.topLine = new game.Graphics().addTo(this.boundaries);
        this.rightLine = new game.Graphics().addTo(this.boundaries);
        this.bottomLine = new game.Graphics().addTo(this.boundaries);
        this.grid = new game.Graphics().addTo(this.boundaries);

        this.updateLines();
        this.updateGrid();
    },

    updateLines: function() {
        this.leftLine.lineStyle(1, this.lineColor);
        this.leftLine.moveTo(0, 0);
        this.leftLine.lineTo(0, game.system.height);

        this.topLine.lineStyle(1, this.lineColor);
        this.topLine.moveTo(0, 0);
        this.topLine.lineTo(game.system.width, 0);
        
        this.rightLine.lineStyle(1, this.lineColor);
        this.rightLine.moveTo(0, 0);
        this.rightLine.lineTo(0, game.system.height);
        
        this.bottomLine.lineStyle(1, this.lineColor);
        this.bottomLine.moveTo(0, 0);
        this.bottomLine.lineTo(game.system.width, 0);
    },

    updateGrid: function() {
        this.grid.clear();
        var gridSize = this.editor.config.gridSize;
        if (gridSize === 0) return;

        var x = Math.ceil(this.editor.scene.width / gridSize);
        var y = Math.ceil(this.editor.scene.height / gridSize);

        this.grid.lineStyle(1, this.gridColor, this.gridAlpha);
        for (var i = 1; i < x; i++) {
            this.grid.moveTo(i * gridSize, 0);
            this.grid.lineTo(i * gridSize, this.editor.scene.height);
        }
        for (var i = 1; i < y; i++) {
            this.grid.moveTo(0, i * gridSize);
            this.grid.lineTo(this.editor.scene.width, i * gridSize);
        }
    },

    update: function() {
        var centerX = game.system.width / 2;
        var centerY = game.system.height / 2;
        var systemLeft = centerX - this.editor.config.systemWidth / 2;
        var systemTop = centerY - this.editor.config.systemHeight / 2;
        var sceneLeft = centerX - this.editor.scene.width / 2;
        var sceneTop = centerY - this.editor.scene.height / 2;
        
        this.leftLine.position.x = sceneLeft - this.editor.camera.position.x - 1;
        this.topLine.position.y = sceneTop - this.editor.camera.position.y - 1;
        this.rightLine.position.x = this.leftLine.position.x + this.editor.scene.width + 2;
        this.bottomLine.position.y = this.topLine.position.y + this.editor.scene.height + 2;

        this.grid.position.x = this.leftLine.position.x + 1;
        this.grid.position.y = this.topLine.position.y + 1;

        this.screenRect.clear();
        this.screenRect.lineStyle(1, this.screenRectColor);
        this.screenRect.drawRect(-1, -1, this.editor.config.systemWidth + 2, this.editor.config.systemHeight + 2);
        this.screenRect.position.x = systemLeft;
        this.screenRect.position.y = systemTop;
        
        this.screenDim.clear();
        this.screenDim.beginFill(this.dimColor);

        var miny = 0;
        var maxy = game.system.height;
        
        if (systemTop > 0) {
            miny = systemTop;
            this.screenDim.drawRect(0, 0, game.system.width, miny);
        }

        if (systemTop + this.editor.config.systemHeight < game.system.height) {
            maxy = (systemTop + this.editor.config.systemHeight);
            this.screenDim.drawRect(0, maxy, game.system.width, game.system.height - maxy);
        }

        if (systemLeft > 0) this.screenDim.drawRect(0, miny, systemLeft, (maxy - miny));
        if (systemLeft + this.editor.config.systemWidth < game.system.width) this.screenDim.drawRect(systemLeft + this.editor.config.systemWidth, miny, game.system.width - (systemLeft + this.editor.config.systemWidth), maxy - miny);
    },

    toggleScreenDim: function() {
        this.dimAlpha += 0.25;
        if (this.dimAlpha > 1) this.dimAlpha = 0;
        this.screenDim.alpha = this.dimAlpha;
    }
});

});
