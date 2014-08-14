game.module(
    'bamboo.editor.modes.nodemode'
)
.require(
    'bamboo.editor.mode'
)
.body(function() {

game.addAsset('../src/bamboo/editor/media/font.fnt');

bamboo.editor.NodeMode = bamboo.editor.Mode.extend({
    helpText: 'Node mode: (P)lay animation, ESC cancel',
    state: null,
    timeDisplay: null,
    zoomDisplay: null,
    zoomTween: null,
    animationRunning: false,
    shiftDown: false,
    altDown: false,
    ctrlDown: false,

    init: function(editor) {
        this._super(editor);

        this.state = new bamboo.editor.SelectionState(this);

        this.timeDisplay = new game.BitmapText('', { font: 'Buu' });
        this.timeDisplay.position.set(20, 20);
        this.timeDisplay.visible = false;
        this.editor.overlay.addChild(this.timeDisplay);

        this.zoomDisplay = new game.BitmapText('', { font: 'Buu' });
        this.zoomDisplay.position.set(20, 50);
        this.zoomDisplay.visible = false;
        this.editor.overlay.addChild(this.zoomDisplay);
    },

    exit: function() {
        if (this.animationRunning) this.stopAnimation();

        this.editor.overlay.removeChild(this.timeDisplay);
        this.editor.overlay.removeChild(this.zoomDisplay);
        this.state.cancel();
    },

    zoomChanged: function(newZoom) {
        this.zoomDisplay.visible = true;
        this.zoomDisplay.alpha = 1.0;
        this.zoomDisplay.setText((newZoom*100.0).toFixed(2)+'%');
        if (this.zoomTween) this.zoomTween.stop();
        this.zoomTween = new game.Tween(this.zoomDisplay).to({alpha:0.0}, 300).easing(game.Tween.Easing.Quadratic.In);
        var self = this;
        this.zoomTween.onComplete(function() {
            self.zoomTween = null;
        });
        this.zoomTween.start();
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

    click: function(event) {
        this.state.apply(event);
        this.changeState(new bamboo.editor.SelectionState(this));
    },

    mousemove: function(event) {
        this.state.mousemove(event);
    },

    keydown: function(key) {
        if (key === 'ESC') {
            this.state.cancel();
            this.changeState(new bamboo.editor.SelectionState(this));
            return;
        }
        if (key === 'P') {
            if (this.animationRunning) this.stopAnimation();
            else this.startAnimation();
            return;
        }

        this.state.keydown(key);
    },

    keyup: function(key) {
        this.state.keyup(key);
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
            case 18:// ALT
                this.altDown = true;
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
            case 18:// ALT
                 this.altDown = false;
                 return true;
            case 32:// SPACE - start/stop animation
                if (this.animationRunning)
                    this.stopAnimation();
                else
                    this.startAnimation();
                return true;
        }
        return this.state.onkeyup(keycode, p);
    },

    filedrop: function(event) {
        if (this.state.filedrop) this.state.filedrop(event);
    },

    changeState: function(newState) {
        this.state = newState;
    },

    update: function() {
        if (this.animationRunning) {
            this.setAnimationTime(this.animationTime + game.system.delta);
        }
    }
});

});
