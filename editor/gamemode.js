game.module(
    'bamboo.editor.gamemode'
)
.require(
    'bamboo.editor.mode'
)
.body(function() {

bamboo.editor.GameMode = bamboo.editor.Mode.extend({
    world: null,
    wasPropertyPanelOpen: false,
    worldTime: 0,
    mask: null,

    init: function(editor) {
        this.super(editor);
        this.world = bamboo.World.createFromJSON(JSON.stringify(this.editor.world.toJSON()));

        this.wasPropertyPanelOpen = this.editor.propertyPanel.visible;
        this.editor.statusbar.setStatus('ESC - return to editor');
        this.editor.propertyPanel.visible = false;

        this.mask = new game.Graphics();
        this.mask.beginFill(0xffffff);
        var y = this.editor.worldTargetPos.y;
        var x = this.editor.worldTargetPos.x;
        var w = game.system.width - x - this.world.screenSize.width;
        var h = game.system.height - y - this.world.screenSize.height;

        this.mask.drawRect(0,0,game.system.width,y);
        this.mask.drawRect(0,0,x,game.system.height);

        this.mask.drawRect(0,y+this.world.screenSize.height,game.system.width,h);
        this.mask.drawRect(x+this.world.screenSize.width,0,w,game.system.height);

        this.editor.displayObject.removeChild(this.editor.world.displayObject);
        this.editor.displayObject.removeChild(this.editor.overlay);
        this.editor.displayObject.addChild(this.world.displayObject);
        this.editor.displayObject.addChild(this.mask);
        this.world.position = this.editor.worldTargetPos.clone();
        this.world.update(0);
    },

    update: function(dt) {
        this.worldTime += dt;
        this.world.update(this.worldTime);
    },

    onclick: function() {
        this.world.onclick();
    },
    onmousemove: function(p) {
    },

    onkeydown: function(keycode, p) {
        if(keycode === 27) // ESC
            return true;
        return false;
    },
    onkeyup: function(keycode, p) {
        if(keycode === 27) {// ESC
            this.editor.displayObject.addChild(this.editor.world.displayObject);
            this.editor.displayObject.addChild(this.editor.overlay);
            this.editor.displayObject.removeChild(this.world.displayObject);
            this.editor.displayObject.removeChild(this.mask);

            this.editor.propertyPanel.visible = this.wasPropertyPanelOpen;
            this.editor.controller.changeMode(new bamboo.editor.NodeMode(this.editor, p));
            return true;
        }
        return false;
    }
});

});