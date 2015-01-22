game.module(
    'bamboo.editor.ui'
)
.body(function() {

game.bamboo.ui = {
    windows: [],
    menu: null,

    removeAll: function() {
        this.menu.remove();
        for (var i = 0; i < this.windows.length; i++) {
            this.windows[i].remove();
        }
        this.windows.length = 0;
    },

    findWindow: function(id) {
        for (var i = 0; i < this.windows.length; i++) {
            if (this.windows[i].id === id) return this.windows[i];
        }
    },

    onResize: function() {
        this.menu.update();
        for (var i = 0; i < this.windows.length; i++) {
            if (typeof this.windows[i].onResize === 'function') {
                this.windows[i].onResize();
            }
            this.windows[i].update();
        }
    },
};

game.createClass('BambooWindow', {
    x: 0,
    y: 0,
    width: 400,
    inputs: {},
    visible: false,
    align: 'left',
    folded: true,
    titleHeight: 30,
    titlePadding: 10,
    fixed: false,
    parent: null,
    children: null,
    
    init: function(settings) {
        game.bamboo.ui.windows.push(this);
        game.merge(this, settings);

        this.windowDiv = document.createElement('div');
        this.windowDiv.className = 'window';
        if (settings.className) this.windowDiv.className += ' ' + settings.className;

        this.titleDiv = document.createElement('div');
        this.titleDiv.addEventListener('mousedown', this.mousedown.bind(this), false);
        this.titleDiv.className = 'title';

        this.contentDiv = document.createElement('div');
        this.contentDiv.className = 'content';

        this.windowDiv.appendChild(this.titleDiv);
        this.windowDiv.appendChild(this.contentDiv);

        this.updateSize();
        this.updatePosition();

        if (this.title) this.setTitle(this.title);
        document.body.appendChild(this.windowDiv);

        if (this.folded) {
            this.folded = false;
            this.toggleFold();
        }
        if (this.snappedTo) {
            var parent = game.bamboo.ui.findWindow(this.snappedTo);
            if (parent) parent.snap(this); 
        }
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
        this.windowDiv.style.width = this.width + 'px';

        if (this.folded) return;

        this.windowDiv.style.height = this.height + 'px';
        this.contentDiv.style.height = (this.height - this.titleHeight - 20) + 'px';

        this.updateHeight();
        
        if (this.children) {
            this.children.width = this.width;
            this.children.y = this.y + this.height;
            this.children.updatePosition();
            this.children.updateSize();
        }
    },

    bringFront: function() {
        this.hide();
        this.show();
        if (this.children) this.children.bringFront();
    },

    mousedown: function(event) {
        this.resizing = false;
        this.toggleFold();
    },

    toggleFold: function() {
        this.folded = !this.folded;
        
        if (this.folded) {
            this.windowDiv.style.height = this.titleHeight + 'px';
            this.updateHeight();
            if (this.children) {
                this.children.y = this.y + this.height;
                this.children.updatePosition();
            }
        }
        else {
            this.windowDiv.style.height = 'auto';
            this.updateHeight();
            this.updateSize();
        }
    },

    updateHeight: function() {
        this.height = this.windowDiv.clientHeight + 2;
    },

    mousemove: function(event) {
        if (this.parent) this.unsnap();
        if (this.resizing) {
            this.width = this.origSize.x + event.clientX - this.mouseStartPos.x;
            this.height = this.origSize.y + event.clientY - this.mouseStartPos.y;
            if (this.x + this.width > window.innerWidth) this.width = window.innerWidth - this.x;
            this.updateSize();
            if (typeof this.onResize === 'function') this.onResize();
        }
        else {
            this.snappedToEdge = null;
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
        if (this.centered) {
            this.x = game.system.width / 2 - this.width / 2;
            this.y = game.system.height / 2 - this.height / 2;
        }
        if (this.x + this.width > window.innerWidth) {
            this.x = window.innerWidth - this.width;
            if (this.snapToEdge) this.snappedToEdge = 'right';
        }
        if (this.y + this.height > window.innerHeight) this.y = window.innerHeight - this.height;
        if (this.x < this.minX) this.x = this.minX;
        if (this.y < this.minY) this.y = this.minY;

        if (this.snappedToEdge === 'right') {
            this.x = window.innerWidth - this.width;
        }

        this.updateHeight();
        
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

    close: function() {
        this.unsnap();
        this.children = null;
        this.hide();
    },

    hide: function() {
        if (!this.visible) return;
        this.visible = false;
        document.body.removeChild(this.windowDiv);
    },

    toggleVisibility: function() {
        if (this.visible) this.hide();
        else this.show();
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

game.createClass('BambooMenu', {
    height: 30,
    visible: true,
    menus: {},
    menuButtons: {},

    init: function(editor) {
        this.editor = editor;
        game.bamboo.ui.menu = this;
        
        this.windowDiv = document.createElement('div');
        this.windowDiv.className = 'window menu';
        this.windowDiv.style.lineHeight = this.height + 'px';
        this.windowDiv.style.height = this.height + 'px';
        this.windowDiv.style.left = '0px';
        this.windowDiv.style.top = '0px';
        this.windowDiv.style.overflow = 'visible';
        this.windowDiv.style.zIndex = 999999;

        this.contentDiv = document.createElement('div');
        this.windowDiv.appendChild(this.contentDiv);

        document.body.appendChild(this.windowDiv);
        this.initMenus();        
        this.update();
    },

    initMenus: function() {
        this.addMenu('Scene');
        this.addMenuItem('Scene', 'New scene...', function() {
            if (confirm('Are you sure?')) game.scene.loadScene();
        });
        this.addMenuItem('Scene', 'Load scene...', this.editor.showScenesWindow.bind(this.editor));
        this.addMenuItem('Scene', 'Save module', this.editor.saveAsModule.bind(this.editor));
        this.addMenuItem('Scene', 'Save JSON', this.editor.saveAsJSON.bind(this.editor));
        this.addMenuItem('Scene', 'Download module', this.editor.downloadAsModule.bind(this.editor));
        this.addMenuItem('Scene', 'Download JSON', this.editor.downloadAsJSON.bind(this.editor));

        this.addMenu('Node');
        this.addMenuItem('Node', 'Delete', this.editor.controller.deleteSelectedNodes.bind(this.editor.controller));
        this.addMenuItem('Node', 'Duplicate', this.editor.controller.duplicateSelectedNodes.bind(this.editor.controller));
        this.addMenuItem('Node', 'Parent/unparent', this.editor.controller.setNodeParent.bind(this.editor.controller));
        this.addMenuItem('Node', 'Move to top', this.editor.controller.moveNodeTop.bind(this.editor.controller));
        this.addMenuItem('Node', 'Move to bottom', this.editor.controller.moveNodeBottom.bind(this.editor.controller));

        this.addMenu('View');
        this.addMenuItem('View', 'Grid', this.editor.changeGrid.bind(this.editor));
        this.addMenuItem('View', 'Boundaries', this.editor.toggleBoundaries.bind(this.editor));
        this.addMenuItem('View', 'Nodes', this.editor.toggleViewNodes.bind(this.editor));
        this.addMenuItem('View', 'Lights', this.editor.boundary.toggleScreenDim.bind(this.editor.boundary));

        var version = document.createElement('div');
        version.innerHTML = game.bamboo.version;
        version.className = 'version';
        this.windowDiv.appendChild(version);
    },

    addMenu: function(name) {
        var menuButton = document.createElement('div');
        menuButton.className = 'menu';
        menuButton.innerHTML = name;
        menuButton.addEventListener('click', this.activate.bind(this, name));
        menuButton.addEventListener('mouseover', this.openMenu.bind(this, name));
        this.contentDiv.appendChild(menuButton);
        this.menuButtons[name] = menuButton;

        var menuContent = document.createElement('div');
        menuContent.className = 'menuContent';
        menuContent.style.display = 'none';
        menuContent.style.top = this.height + 'px';
        menuContent.style.left = menuButton.offsetLeft + 'px';
        this.windowDiv.appendChild(menuContent);
        this.menus[name] = menuContent;
    },

    addMenuItem: function(menu, name, callback) {
        if (!this.menus[menu]) return;

        var menuItem = document.createElement('div');
        menuItem.innerHTML = name;
        menuItem.addEventListener('click', this.menuItemClick.bind(this, menuItem));
        menuItem.className = 'menuItem';
        menuItem.parent = menu;
        menuItem.callback = callback;

        this.menus[menu].appendChild(menuItem);
    },

    addMenuItemSpacer: function(menu) {
        if (!this.menus[menu]) return;

        var menuSpacer = document.createElement('div');
        menuSpacer.className = 'menuSpacer';
        
        this.menus[menu].appendChild(menuSpacer);
    },

    menuItemClick: function(item) {
        if (typeof item.callback === 'function') item.callback();
        this.activate(item.parent);
        this.activeMenu = null;
    },

    activate: function(name) {
        if (this.activeMenu === name || !name) {
            this.closeMenu(this.activeMenu);
            this.active = false;
            this.activeMenu = null;
        }
        else {
            this.active = true;
            this.openMenu(name);
        }
    },

    openMenu: function(name) {
        if (!this.active) return;
        if (this.activeMenu === name) return;
        if (this.activeMenu) this.closeMenu(this.activeMenu);

        this.activeMenu = name;

        this.menuButtons[name].className = 'menu active';
        this.menus[name].style.display = 'block';
    },

    closeMenu: function(name) {
        this.menuButtons[name].className = 'menu';
        this.menus[name].style.display = 'none';
    },

    remove: function() {
        document.body.removeChild(this.windowDiv);
    },

    update: function() {
        this.windowDiv.style.width = window.innerWidth + 'px';
    }
});

});
