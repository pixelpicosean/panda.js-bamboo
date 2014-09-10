game.module(
    'bamboo.editor.ui'
)
.body(function() {

bamboo.Ui = game.Class.extend({
    windows: [],
    activeWindow: null,

    init: function() {
        this.overlay = document.createElement('div');
        this.overlay.style.position = 'absolute';
        this.overlay.style.left = '0px';
        this.overlay.style.top = '0px';
        this.overlay.style.width = '100%';
        this.overlay.style.height = '100%';
        this.overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        this.overlay.style.zIndex = 10;
        this.overlay.style.textAlign = 'center';
        this.overlay.style.lineHeight = window.innerHeight + 'px';
        this.overlay.style.display = 'none';
        this.overlay.style.pointerEvents = 'none';
        document.body.appendChild(this.overlay);

        // window.addEventListener('mousemove', this.mousemove.bind(this), false);
        // window.addEventListener('mouseup', this.mouseup.bind(this), false);
    },

    onResize: function() {
        this.overlay.style.lineHeight = window.innerHeight + 'px';
    },

    showOverlay: function() {
        this.overlay.style.display = 'block';
    },

    hideOverlay: function() {
        this.overlay.style.display = 'none';
    },

    setOverlay: function(text) {
        this.overlay.innerHTML = text;
        return this;
    },

    mousemove: function(event) {
        // if (this.activeWindow) this.activeWindow.mousemove(event);
    },

    mouseup: function() {
        // document.body.style.cursor = 'default';
        // this.activeWindow = null;
    },
    
    addWindow: function(x, y, width, height, align) {
        var w = new bamboo.UiWindow(x, y, width, height, align);
        this.windows.push(w);
        return w;
    },

    removeWindow: function(elem) {
        for (var i = this.windows.length - 1; i >= 0; i--) {
            if (this.windows[i] === elem) {
                elem.hide();
                this.windows.splice(i, 1);
                break;
            }
        }
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

bamboo.UiWindow = game.Class.extend({
    x: 'center',
    y: 'center',
    width: 400,
    height: 100,
    borderSize: 1,
    inputs: {},
    visible: false,
    align: 'left',

    init: function(x, y, width, height, align) {
        this.align = align || this.align;
        if (typeof(x) !== 'undefined') this.x = x;
        if (typeof(y) !== 'undefined') this.y = y;
        if (typeof(width) !== 'undefined') this.width = width;
        if (typeof(height) !== 'undefined') this.height = height;

        this.windowDiv = document.createElement('div');
        this.windowDiv.className = 'window';

        this.titleDiv = document.createElement('div');
        this.titleDiv.addEventListener('mousedown', this.mousedown.bind(this), false);
        this.titleDiv.className = 'title';

        this.mouseStartPos = new game.Point();
        this.origPosition = new game.Point();

        this.contentDiv = document.createElement('div');
        this.contentDiv.className = 'content';

        this.windowDiv.appendChild(this.titleDiv);
        this.windowDiv.appendChild(this.contentDiv);

        window.addEventListener('resize', this.update.bind(this), false);
        this.update();
    },

    mousedown: function() {
        // document.body.style.cursor = 'move';
        // this.ui.activeWindow = this;
        // this.mouseStartPos.set(event.clientX, event.clientY);
        // this.origPosition.set(this.x, this.y);
    },

    mousemove: function(event) {
        // this.x = this.origPosition.x + event.clientX - this.mouseStartPos.x;
        // this.y = this.origPosition.y + event.clientY - this.mouseStartPos.y;
        // this.update();
    },

    update: function() {
        if (this.width === 'window') this.windowDiv.style.width = window.innerWidth - this.borderSize * 2 + 'px';
        else this.windowDiv.style.width = (this.width - this.borderSize * 2) + 'px';

        if (this.height === 'window') this.windowDiv.style.height = window.innerHeight - this.borderSize * 2 + 'px';
        else this.windowDiv.style.height = (this.height - this.borderSize * 2) + 'px';

        if (this.x === 'center') this.windowDiv.style.left = window.innerWidth / 2 - this.width / 2 + 'px';
        else {
            if (this.align === 'right') this.windowDiv.style.left = window.innerWidth - this.x + 'px';
            else this.windowDiv.style.left = this.x + 'px';
        }

        if (this.y === 'center') this.windowDiv.style.top = window.innerHeight / 2 - this.height / 2 + 'px';
        else {
            if (this.align === 'bottom') this.windowDiv.style.top = window.innerHeight - this.y + 'px';
            else this.windowDiv.style.top = this.y + 'px';
        }
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
