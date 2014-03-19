game.module(
    'bamboo.editor.nodemode'
)
.require(
    'bamboo.editor.mode',
    'bamboo.editor.selectionstate'
)
.body(function() {

game.addAsset('src/bamboo/editor/media/font.fnt');

bamboo.editor.NodeMode = bamboo.editor.Mode.extend({
    state: null,

    timeDisplay: null,
    animationRunning: false,
    shiftDown: false,
    ctrlDown: false,


    init: function(editor, p) {
        this.super(editor);
        this.state = new bamboo.editor.SelectionState(this, p);

        this.timeDisplay = new PIXI.BitmapText('', {font:'28px Buu'});
        this.timeDisplay.position = new Vec2(20,20);
        this.editor.overlay.addChild(this.timeDisplay);
        this.timeDisplay.visible = false;
    },

    exit: function() {
        if(this.animationRunning)
            this.stopAnimation();
        this.editor.overlay.removeChild(this.timeDisplay);
        this.state.cancel();
    },

    update: function(dt) {
        if(this.animationRunning) {
            this.setAnimationTime(this.animationTime + dt);
        }
    },

    startAnimation: function() {
        this.animationRunning = true;
        this.setAnimationTime(0);
        this.timeDisplay.visible = true;
    },
    stopAnimation: function() {
        this.animationRunning = false;
        this.setAnimationTime(0);
        this.timeDisplay.visible = false;
    },
    setAnimationTime: function(time) {
        this.animationTime = time;
        this.editor.world.update(this.animationTime);
        this.timeDisplay.setText(this.animationTime.toFixed(1)+'s');
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
            case 16:// SHIFT
                this.shiftDown = true;
                return true;
            case 17:// CTRL
                this.ctrlDown = true;
                // pass to state
                this.state.onkeydown(keycode, p);
                return true;
            case 27:// ESC
            case 32:// SPACE
                return true;
        }
        return this.state.onkeydown(keycode, p);
    },
    onkeyup: function(keycode, p) {
        // overrides from editor
        switch(keycode) {
            case 16:// SHIFT
                this.shiftDown = false;
                return true;
            case 17:// CTRL
                this.ctrlDown = false;
                // pass to state
                this.state.onkeyup(keycode, p);
                return true;
            case 27:// ESC - cancel
                this.state.cancel();
                this.changeState(new bamboo.editor.SelectionState(this, p));
                return true;
            case 32:// SPACE - start/stop animation
                if(this.animationRunning)
                    this.stopAnimation();
                else
                    this.startAnimation();
                return true;
        }
        return this.state.onkeyup(keycode, p);
    },

    changeState: function(newState) {
        this.state = newState;
    }
});

});
