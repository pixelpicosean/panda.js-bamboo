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
    editorNodes: [],
    editorNodesVisible: false,

    init: function(editor) {
        this._super(editor);
        this.world = bamboo.World.createFromJSON(JSON.stringify(this.editor.world.toJSON()));

        this.wasPropertyPanelOpen = this.editor.propertyPanel.visible;
        this.editor.statusbar.setStatus('ESC - return to editor');
        this.editor.propertyPanel.visible = false;

        this.mask = new game.Graphics();
        this.mask.beginFill(0xffffff);
        var x = game.system.width*0.5 - this.world.screenSize.width*0.5;
        var y = game.system.height*0.5 - this.world.screenSize.height*0.5;
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
        this.world.position = new Vec2(x,y);
        this.world.update(0);

        /////////
        // adds editor graphics to the world
        for(var i=0; i<this.world.nodes.length; i++) {
            var node = this.world.nodes[i];
            this.editorNodes.push(new bamboo.nodes[node.getClassName()].editor(node, null));
            this.editorNodes[i].displayObject.visible = false;
        }
    },

    update: function(dt) {
        this.worldTime += dt;
        this.world.update(this.worldTime);
    },

    onclick: function() {
        this.world.onclick();
    },

    onmousedown: function(p) {
        this.world.onmousedown();
    },

    onmousemove: function(p) {
        this.world.onmousemove(p);
    },

    onmouseup: function(p) {
        this.world.onmouseup();
    },

    onmouseout: function() {
        this.world.onmouseout();
    },

    onkeydown: function(keycode, p) {
        if(keycode === 27) // ESC
            return true;
        if(keycode === 86)// V
            return true;
        return this.world.onkeydown(keycode);
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
        } else if(keycode === 86) {// V
            this.editorNodesVisible = !this.editorNodesVisible;
            for(var i=0;i<this.editorNodes.length;i++) {
                this.editorNodes[i].displayObject.visible = this.editorNodesVisible;
            }
        }
        return this.world.onkeyup(keycode);
    }
});

});
