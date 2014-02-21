game.module(
    'bamboo.editor.boundarylayer'
)
.require(
)
.body(function() {

bamboo.BoundaryLayer = game.Class.extend({
    editor: null,
    leftLine: null,
    topLine: null,
    rightLine: null,
    bottomLine: null,

    screen: null,
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

        this.screen.position.x = w.position.x;
        this.screen.position.y = w.position.y;

        this.screenDim.clear();
        this.screenDim.beginFill(0x000000, 0.8);
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

        this.screen = new game.Graphics();
        this.screen.lineStyle(2, 0xffffff);
        this.screen.drawRect(-1,-1,this.editor.world.screenSize.width+2, this.editor.world.screenSize.height+2);

        this.screenDim = new game.Graphics();
        this.editor.overlay.addChild(this.screenDim);

        this.editor.overlay.addChild(this.leftLine);
        this.editor.overlay.addChild(this.topLine);
        this.editor.overlay.addChild(this.rightLine);
        this.editor.overlay.addChild(this.bottomLine);

        this.editor.overlay.addChild(this.screen);
    }
});

});
