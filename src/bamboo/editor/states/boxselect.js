game.module(
    'bamboo.editor.states.boxselect'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.StateBoxSelect = bamboo.editor.State.extend({
    helpText: 'Box select',

    enter: function() {
        this.box = new game.Graphics();
        this.size = new game.Point();
        var pos = this.mode.editor.toWorldSpace(this.mode.editor.prevMousePos);
        this.mode.editor.activeLayer.toLocalSpace(pos, pos);
        this.box.position.set(pos.x, pos.y);
        this.mode.editor.activeLayer.displayObject.addChild(this.box);

        document.body.style.cursor = 'crosshair';
    },

    exit: function() {
        document.body.style.cursor = 'default';
    },

    click: function() {
        var tl = this.mode.editor.activeLayer.toWorldSpace(this.box.position);
        var br = this.mode.editor.activeLayer.toWorldSpace(this.size.add(this.box.position));

        if (tl.x > br.x) {
            var h = tl.x;
            tl.x = br.x;
            br.x = h;
        }
        if (tl.y > br.y) {
            var h = tl.y;
            tl.y = br.y;
            br.y = h;
        }

        var r = { tl: tl, br: br };
        var nodes = this.mode.editor.findNodesInside(r, this.mode.editor.activeLayer);

        if (nodes.length > 0) {
            if (this.mode.altDown) {
                for (var i = 0; i < nodes.length; i++) {
                    this.mode.editor.controller.deselectNode(nodes[i]);
                }
            }
            else {
                if (!this.mode.editor.activeNode) {
                    this.mode.editor.controller.setActiveNode(nodes[0]);
                }
                for (var i = 0; i < nodes.length; i++) {
                    this.mode.editor.controller.selectNode(nodes[i]);
                }
            }
        }
        else {
            var node = this.mode.editor.getNodeAt(this.mode.editor.prevMousePos, true);
            if (node) this.mode.editor.controller.setActiveNode(node);
            else {
                this.mode.editor.controller.deselectAllNodes();
                this.mode.editor.controller.setActiveNode();
            }
        }

        this.box.parent.removeChild(this.box);
        this.mode.editor.changeState('Select');
    },

    mousemove: function(event) {
        var mousePos = new game.Point(event.global.x, event.global.y);
        mousePos = this.mode.editor.toWorldSpace(mousePos);
        this.mode.editor.activeLayer.toLocalSpace(mousePos, mousePos);

        this.box.clear();
        this.box.lineStyle(1, 0xffffff);
        this.box.beginFill(0xffffff, 0.1);
        this.size = mousePos.subtract(this.box.position);
        this.box.drawRect(0, 0, this.size.x, this.size.y);
    }
});

});
