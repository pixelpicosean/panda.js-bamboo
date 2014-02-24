game.module(
    'bamboo.editor.nodemode'
)
.require(
    'bamboo.editor.mode',
    'bamboo.editor.selectionstate'
)
.body(function() {

bamboo.editor.NodeMode = bamboo.editor.Mode.extend({
    state: null,

    init: function(editor, p) {
        this.super(editor);
        this.state = new bamboo.editor.SelectionState(this, p);
    },

    update: function(dt) {
    },

    onclick: function(p) {
        this.state.apply();
        this.changeState(new bamboo.editor.SelectionState(this, p));
    },
    onmousemove: function(p) {
        this.state.onmousemove(p);
    },
    onkeydown: function(keycode, p) {
        // overrides from mode
        switch(keycode) {
            case 27:// ESC
                return true;
        }
        return this.state.onkeydown(keycode, p);
    },
    onkeyup: function(keycode, p) {
        // overrides from editor
        switch(keycode) {
            case 27:// ESC - cancel
                this.state.cancel();
                this.changeState(new bamboo.editor.SelectionState(this, p));
                return true;
        }
        return this.state.onkeyup(keycode, p);
    },

    changeState: function(newState) {
        this.state = newState;
    }
});

});
