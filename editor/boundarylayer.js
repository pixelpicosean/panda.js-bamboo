game.module(
    'bamboo.editor.boundarylayer'
)
.require(
)
.body(function() {

bamboo.BoundaryLayer = game.Class.extend({
    editor: null,
    boundaries: null,
    leftLine: null,
    topLine: null,
    rightLine: null,
    bottomLine: null,

    screenRect: null,
    screenDim: null,

    init: function(editor) {
        this.editor = editor;
        this.createGraphics();

        this.updateBoundary();
    },


    updateBoundary: function() {
        var w = this.editor.world;
        this.leftLine.position.x = w.position.x + w.boundaries.left - w.cameraPosition.x;
        this.topLine.position.y = w.position.y + w.boundaries.top - w.cameraPosition.y;
        this.rightLine.position.x = w.position.x + w.boundaries.right - w.cameraPosition.x;
        this.bottomLine.position.y = w.position.y + w.boundaries.bottom - w.cameraPosition.y;

        this.screenRect.position.x = w.position.x;
        this.screenRect.position.y = w.position.y;

        this.screenDim.clear();
        this.screenDim.beginFill(0x000000, 0.6);
        var miny = 0, maxy = game.system.height;
        if(w.position.y > 0) {
            miny = w.position.y;
            this.screenDim.drawRect(0,0,game.system.width, miny);
        }
        if(w.position.y + w.screenSize.height < game.system.height) {
            maxy = w.position.y+w.screenSize.height;
            this.screenDim.drawRect(0,maxy, game.system.width, game.system.height-maxy);
        }

        if(w.position.x > 0)
            this.screenDim.drawRect(0,miny, w.position.x,maxy-miny);
        if(w.position.x + w.screenSize.width < game.system.width)
            this.screenDim.drawRect(w.position.x+w.screenSize.width, miny, game.system.width-(w.position.x+w.screenSize.width), maxy-miny);
    },

    createGraphics: function() {
        this.boundaries = new game.Container();
        this.leftLine = new game.Graphics();
        this.topLine = new game.Graphics();
        this.rightLine = new game.Graphics();
        this.bottomLine = new game.Graphics();

        this.leftLine.lineStyle(2, 0x77ff55);
        this.leftLine.moveTo(-1,0);
        this.leftLine.lineTo(-1,game.system.height);
        this.topLine.lineStyle(2, 0x77ff55);
        this.topLine.moveTo(0,-1);
        this.topLine.lineTo(game.system.width,-1);
        this.rightLine.lineStyle(2, 0x77ff55);
        this.rightLine.moveTo(1,0);
        this.rightLine.lineTo(1,game.system.height);
        this.bottomLine.lineStyle(2, 0x77ff55);
        this.bottomLine.moveTo(0,1);
        this.bottomLine.lineTo(game.system.width,1);

        this.screenRect = new game.Graphics();
        this.screenRect.lineStyle(2, 0xffffff);
        this.screenRect.drawRect(-1,-1,this.editor.world.screenSize.width+2, this.editor.world.screenSize.height+2);

        this.screenDim = new game.Graphics();
        this.editor.overlay.addChild(this.screenDim);
        this.editor.overlay.addChild(this.boundaries);

        this.boundaries.addChild(this.leftLine);
        this.boundaries.addChild(this.topLine);
        this.boundaries.addChild(this.rightLine);
        this.boundaries.addChild(this.bottomLine);

        this.boundaries.addChild(this.screenRect);
    }
});

Object.defineProperty(bamboo.BoundaryLayer.prototype, 'boundariesVisible', {
    get: function() {
        return this.boundaries.visible;
    },
    set: function(value) {
        this.boundaries.visible = value;
    }
});

Object.defineProperty(bamboo.BoundaryLayer.prototype, 'dimVisible', {
    get: function() {
        return this.screenDim.visible;
    },
    set: function(value) {
        this.screenDim.visible = value;
    }
});

});
