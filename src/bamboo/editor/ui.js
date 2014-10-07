game.module(
    'bamboo.editor.ui'
)
.body(function() {

bamboo.Ui = game.Class.extend({
    activeWindow: null,
    windows: [],

    init: function() {
        window.addEventListener('mousemove', this.mousemove.bind(this), false);
        window.addEventListener('mouseup', this.mouseup.bind(this), false);
    },

    onResize: function() {
        for (var i = 0; i < this.windows.length; i++) {
            if (typeof this.windows[i].onResize === 'function') {
                this.windows[i].onResize();
            }
            this.windows[i].updatePosition();
            this.windows[i].updateSize();
        }
    },

    setActiveWindow: function(winElem) {
        this.activeWindow = winElem;
        if (this.activeWindow.resizing) document.body.style.cursor = 'nwse-resize';
        else document.body.style.cursor = 'move';
    },

    mousemove: function(event) {
        if (this.activeWindow) this.activeWindow.mousemove(event);
    },

    mouseup: function() {
        if (this.activeWindow) {
            document.body.style.cursor = 'default';
            this.activeWindow = null;
        }
    },
    
    addWindow: function(settings) {
        var winElem = new bamboo.Ui.Window(settings);
        winElem.ui = this;
        this.windows.push(winElem);
        return winElem;
    },

    removeWindow: function(winElem) {
        for (var i = this.windows.length - 1; i >= 0; i--) {
            if (this.windows[i] === winElem) {
                winElem.hide();
                this.windows.splice(i, 1);
                return true;
            }
        }
        return false;
    },

    removeAll: function() {
        this.hideAll();
        this.windows.length = 0;
    },

    hideAll: function() {
        for (var i = 0; i < this.windows.length; i++) {
            this.windows[i].hide();
        }
    },

    showAll: function() {
        for (var i = 0; i < this.windows.length; i++) {
            this.windows[i].show();
        }
    },

    update: function() {
        for (var i = 0; i < this.windows.length; i++) {
            this.windows[i].update();
        }
    }
});

bamboo.Ui.Window = game.Class.extend({
    x: 'center',
    y: 'center',
    width: 400,
    height: 100,
    borderSize: 1,
    inputs: {},
    visible: false,
    align: 'left',
    folded: false,
    titleHeight: 30,
    titlePadding: 8,
    fixed: false,
    minY: 0,
    minX: 0,
    closeable: false,
    resizable: false,
    minWidth: 200,
    minHeight: 200,
    parent: null,
    children: null,

    init: function(settings) {
        game.merge(this, settings);

        if (this.x === 'center') this.x = window.innerWidth / 2 - this.width / 2;
        if (this.y === 'center') this.y = window.innerHeight / 2 - this.height / 2;

        this.windowDiv = document.createElement('div');
        this.windowDiv.className = 'window';

        this.titleDiv = document.createElement('div');
        if (!this.fixed) this.titleDiv.addEventListener('mousedown', this.mousedown.bind(this), false);
        this.titleDiv.className = 'title';
        this.titleDiv.style.padding = this.titlePadding + 'px';
        this.titleDiv.style.height = (this.titleHeight - this.titlePadding * 2) + 'px';

        if (this.closeable) {
            // TODO
        }

        if (this.resizable) {
            var resizeDiv = document.createElement('div');
            resizeDiv.style.width = '15px';
            resizeDiv.style.height = '15px';
            // resizeDiv.style.backgroundColor = 'green';
            resizeDiv.style.position = 'absolute';
            resizeDiv.style.right = '0px';
            resizeDiv.style.bottom = '0px';
            resizeDiv.addEventListener('mousedown', this.resizeDown.bind(this));
            this.windowDiv.appendChild(resizeDiv);
            this.origSize = new game.Point();
        }

        this.mouseStartPos = new game.Point();
        this.origPosition = new game.Point();

        this.contentDiv = document.createElement('div');
        this.contentDiv.className = 'content';

        this.windowDiv.appendChild(this.titleDiv);
        this.windowDiv.appendChild(this.contentDiv);

        window.addEventListener('resize', this.update.bind(this), false);

        this.updateSize();
        this.updatePosition();
    },

    snap: function(target) {
        this.children = target;
        target.parent = this;

        target.x = this.x;
        target.y = this.y + this.height;
        target.width = this.width;
        target.updatePosition();
        target.updateSize();
    },

    unsnap: function() {
        if (this.parent) {
            this.parent.children = null;
            this.parent = null;
        }
    },

    updateSize: function() {
        if (this.resizable && !this.folded) {
            if (this.width < this.minWidth) this.width = this.minWidth;
            if (this.height < this.minHeight) this.height = this.minHeight;
        }

        if (this.children) {
            this.children.width = this.width;
            this.children.y = this.y + this.height;
            this.children.updatePosition();
            this.children.updateSize();
        }

        if (this.width === 'window') this.windowDiv.style.width = window.innerWidth - this.borderSize * 2 + 'px';
        else this.windowDiv.style.width = (this.width - this.borderSize * 2) + 'px';

        if (this.folded) return;
        if (this.height === 'window') this.windowDiv.style.height = window.innerHeight - this.borderSize * 2 + 'px';
        else this.windowDiv.style.height = (this.height - this.borderSize * 2) + 'px';
    },

    resizeDown: function() {
        this.resizing = true;
        this.ui.setActiveWindow(this);
        this.mouseStartPos.set(event.clientX, event.clientY);
        this.origSize.set(this.width, this.height);
    },

    bringFront: function() {
        this.hide();
        this.show();
        if (this.children) this.children.bringFront();
    },

    mousedown: function(event) {
        this.resizing = false;
        if (event.button === 2) {
            // Right mouse button
            this.toggleFold();
            return;
        }
        if (!this.ui) return;
        this.bringFront();
        this.ui.setActiveWindow(this);
        this.mouseStartPos.set(event.clientX, event.clientY);
        this.origPosition.set(this.x, this.y);
    },

    toggleFold: function() {
        this.folded = !this.folded;
        if (this.folded) {
            this.windowDiv.style.height = this.titleHeight + 'px';
            this.windowDiv.style.overflow = 'hidden';
            this.origHeight = this.height;
            this.height = this.titleHeight;
            if (this.children) {
                this.children.y = this.y + this.height;
                this.children.updatePosition();
            }
        }
        else {
            this.height = this.origHeight;
            this.windowDiv.style.overflow = 'auto';
            this.updateSize();
        }
    },

    mousemove: function(event) {
        if (this.parent) this.unsnap();
        if (this.resizing) {
            this.width = this.origSize.x + event.clientX - this.mouseStartPos.x;
            this.height = this.origSize.y + event.clientY - this.mouseStartPos.y;
            this.updateSize();
        }
        else {
            this.x = this.origPosition.x + event.clientX - this.mouseStartPos.x;
            this.y = this.origPosition.y + event.clientY - this.mouseStartPos.y;

            if (this.snappable) {
                for (var i = 0; i < this.ui.windows.length; i++) {
                    if (this.ui.windows[i].snappable && this.ui.windows[i] !== this) {
                        var target = this.ui.windows[i];
                        if (Math.abs(target.x - this.x) <= 10 &&
                            Math.abs((target.y + target.height) - this.y) <= 10) {
                            target.snap(this);
                            break;
                        }
                    }
                }
            }

            this.updatePosition();
        }
    },

    updatePosition: function() {
        if (this.x < this.minX) this.x = this.minX;
        if (this.y < this.minY) this.y = this.minY;
        if (this.x + this.width > window.innerWidth) this.x = window.innerWidth - this.width;
        if (this.y + this.titleHeight > window.innerHeight) this.y = window.innerHeight - this.titleHeight;
        
        if (this.children) {
            this.children.x = this.x;
            this.children.y = this.y + this.height;
            this.children.updatePosition();
        }

        this.windowDiv.style.left = this.x + 'px';
        this.windowDiv.style.top = this.y + 'px';
    },

    update: function() {
        this.updatePosition();
    },

    show: function() {
        if (this.visible) return;
        this.visible = true;
        document.body.appendChild(this.windowDiv);
        return this;
    },

    hide: function() {
        if (!this.visible) return;
        this.visible = false;
        document.body.removeChild(this.windowDiv);
    },

    clear: function() {
        this.contentDiv.innerHTML = '';
    },

    setTitle: function(title) {
        this.titleDiv.innerHTML = title;
        this.titleDiv.style.display = 'block';
        return this;
    },

    addText: function(content) {
        content = content.replace(/\(/g, '<span class="key">');
        content = content.replace(/\)/g, '</span>');
        var div = document.createElement('div');
        div.className = 'text';
        div.innerHTML = content;
        this.contentDiv.appendChild(div);
        return this;
    },

    addButton: function(title, callback) {
        var buttonDiv = document.createElement('div');
        buttonDiv.className = 'button';
        buttonDiv.innerHTML = title;
        if (callback) buttonDiv.addEventListener('click', callback.bind(this), false);
        this.contentDiv.appendChild(buttonDiv);
        return this;
    },

    addImage: function(url) {
        var img = new Image();
        img.src = 'src/bamboo/editor/media/' + url;
        this.contentDiv.appendChild(img);
        return this;
    },

    addImageButton: function(url, callback) {
        var img = new Image();
        img.src = 'src/bamboo/editor/media/' + url;
        var buttonDiv = document.createElement('div');
        buttonDiv.appendChild(img);
        buttonDiv.className = 'imageButton';
        if (callback) buttonDiv.addEventListener('click', callback.bind(this), false);
        this.contentDiv.appendChild(buttonDiv);
        return this;
    },

    addImageTextButton: function(text, imageUrl, callback) {
        var buttonDiv = document.createElement('div');
        buttonDiv.className = 'button';
        var img = new Image();
        img.src = 'src/bamboo/editor/media/' + imageUrl;
        buttonDiv.appendChild(img);
        var title = document.createElement('div');
        title.innerHTML = text;
        buttonDiv.appendChild(title);
        if (callback) buttonDiv.addEventListener('click', callback.bind(this), false);
        this.contentDiv.appendChild(buttonDiv);
        return this;
    },

    addInput: function(name, type, label, tooltip, value, callback) {
        var inputDiv = document.createElement('div');
        var labelElem = document.createElement('label');
        var inputElem;

        inputDiv.className = 'input';
        labelElem.innerHTML = label || name + ':';
        type = type || 'text';

        if (type === 'text' || type === 'checkbox' || type === 'color') {
            inputElem = document.createElement('input');
            inputElem.type = type;
            inputElem.name = name;
            inputElem.title = tooltip;
            inputElem.placeholder = tooltip;
            if (typeof(value) === 'number' || typeof(value) === 'string') inputElem.value = value;
            if (type === 'checkbox') inputElem.checked = !!value;
        }
        else if (type === 'select') {
            inputElem = document.createElement('select');
            inputElem.name = name;
            inputElem.title = tooltip;
        }
        else throw 'Invalid input type';

        this.inputs[name] = inputElem;

        inputDiv.appendChild(labelElem);
        inputDiv.appendChild(inputElem);

        if (typeof(callback) === 'function') inputElem.addEventListener('change', callback.bind(this, name), false);

        this.contentDiv.appendChild(inputDiv);
        return this;
    },

    addMultiInput: function(name, values, count, label, tooltip, callback)
    {
        var inputDiv = document.createElement('div');
        inputDiv.className = 'input';

        var labelElem = document.createElement('label');
        labelElem.innerHTML = label || name + ':';
        inputDiv.appendChild(labelElem);

        var multiDiv = document.createElement('div');
        multiDiv.className = 'multiInput';

        for (var i=0; i < count; i++) {
            var inputName = name + '.' + i;

            var inputElem = document.createElement('input');
            inputElem.type = 'text';
            inputElem.name = inputName;
            inputElem.title = tooltip;
            inputElem.value = values[i];
            inputElem.className = 'multiInputValue';

            this.inputs[inputName] = inputElem;

            multiDiv.appendChild(inputElem);

            if (typeof(callback) === 'function') inputElem.addEventListener('change', callback.bind(this, inputName), false);
        }

        inputDiv.appendChild(multiDiv);
        this.contentDiv.appendChild(inputDiv);

        return this;
    },

    addInputText: function(name, value, label, tooltip, callback) {
        return this.addInput(name, 'text', label, tooltip, value, callback);
    },

    addInputCheckbox: function(name, value, label, tooltip, callback) {
        return this.addInput(name, 'checkbox', label, tooltip, value, callback);
    },

    addInputColor: function(name, value, label, tooltip, callback) {
        return this.addInput(name, 'color', label, tooltip, value, callback);
    },

    addInputSelect: function(name, label, tooltip, callback) {
        return this.addInput(name, 'select', label, tooltip, null, callback);
    },

    addInputSelectOption: function(name, value, label, selected) {
        var elem = document.createElement('option');
        elem.value = value;
        elem.innerHTML = label;
        elem.selected = !!selected;

        this.inputs[name].appendChild(elem);
        return this;
    },

    setInputSelectValue: function(name, value) {
        this.inputs[name].value = value;
        return this;
    }
});

});
