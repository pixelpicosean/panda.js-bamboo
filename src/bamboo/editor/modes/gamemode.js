game.module(
    'bamboo.editor.modes.gamemode'
)
.require(
    'bamboo.editor.mode'
)
.body(function() {

bamboo.editor.GameMode = bamboo.editor.Mode.extend({
    editorNodes: [],
    editorNodesVisible: false,

    init: function(editor) {
        this._super(editor);
        this.world = bamboo.World.createFromJSON(this.editor.world.toJSON());

        this.wasPropertyPanelOpen = this.editor.propertyPanel.layerWindow.visible;
        this.editor.statusbar.setStatus('Game mode: (V)iew nodes, ESC return to editor');
        this.editor.propertyPanel.hide();

        var x = game.system.width * 0.5 - this.world.screenSize.width * 0.5;
        var y = game.system.height * 0.5 - this.world.screenSize.height * 0.5;
        var w = game.system.width - x - this.world.screenSize.width;
        var h = game.system.height - y - this.world.screenSize.height;
        this.mask = new game.Graphics();
        this.mask.beginFill(0);
        this.mask.drawRect(0, 0, game.system.width, y);
        this.mask.drawRect(0, 0, x, game.system.height);
        this.mask.drawRect(0, y + this.world.screenSize.height, game.system.width, h);
        this.mask.drawRect(x + this.world.screenSize.width, 0, w, game.system.height);

        this.editor.displayObject.removeChild(this.editor.world.displayObject);
        this.editor.displayObject.removeChild(this.editor.overlay);

        this.editor.displayObject.addChild(this.world.displayObject);
        this.editor.displayObject.addChild(this.mask);

        this.world.position = new game.Vec2(x, y);
        this.world.update();

        // adds editor graphics to the world
        for (var i = 0; i < this.world.nodes.length; i++) {
            var node = this.world.nodes[i];
            this.editorNodes.push(new bamboo.nodes[node.getClassName()].editor(node, null));
            this.editorNodes[i].displayObject.visible = false;
        }
    },

    click: function(event) {
        this.world.click(event);
    },

    mousedown: function(event) {
        this.world.mousedown(event);
    },

    mousemove: function(event) {
        this.world.mousemove(event);
    },

    mouseup: function(event) {
        this.world.mouseup(event);
    },

    mouseout: function(event) {
        this.world.mouseout(event);
    },

    keydown: function(key) {
        if (key === 'ESC') {
            this.editor.displayObject.addChild(this.editor.world.displayObject);
            this.editor.displayObject.addChild(this.editor.overlay);
            this.editor.displayObject.removeChild(this.world.displayObject);
            this.editor.displayObject.removeChild(this.mask);

            if (this.wasPropertyPanelOpen) this.editor.propertyPanel.show();
            this.editor.controller.changeMode(new bamboo.editor.NodeMode(this.editor));
            return;
        }
        if (key === 'V') {
            this.editorNodesVisible = !this.editorNodesVisible;
            for (var i = 0; i < this.editorNodes.length; i++) {
                this.editorNodes[i].displayObject.visible = this.editorNodesVisible;
            }
            return;
        }

        this.world.keydown(key);
    },

    keyup: function(key) {
        this.world.keyup(key);
    },

    update: function() {
        this.world.update();
    }
});

});
