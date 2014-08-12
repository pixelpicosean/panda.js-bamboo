## How to

### Move Camera
Camera (viewport) can be translated by pressing and holdinf middle mouse button and moving the mouse.

### Zoom
Scrolling with the mouse wheel zooms the viewport

### Add a Node
A new node can be added by pressing Shift+A key combination. This will open a dialog from where the node type and parent can be choosed.
When the new node is added to the world it is attached to the mouse cursor and the position must be applied by clicking. Pressing the ESC-key during positioning will cancel the add and remove the newly added node from world.

### Select / Deselect
Nodes can be selected by clicking. Clicking while holding shift-key allows multi-selection. If shift-key is not pressed while clicking the previous selection will be cleared. Alt-key acts as a deselect-modifier. By holding it and clicking already selected nodes, those will become deselected.
There is also a box-selection tool which can be activated by pressing letter B. This works so that one corner of the selection-box is positioned to the place where the cursor is when the letter is pressed, after this the other corner will move with the cursor. The selection is applied by clicing.
Letter A will select everything if nothing was selected, otherwise pressing the letter will de-select everything.

### Remove Nodes
Del-key will remove selected nodes.

### Move Nodes
Pressing letter G will initiate move-node state for the selected nodes. This means that when the letter is pressed all nodes will become attached to the cursor. ESC-key can be used to cancel the move. Clicking the mouse button will apply the new positions.
By pressing X or Y will lock the movement to that axis.
Ctrl key will act as a snap 10px intervals.

### Rotate Nodes
Pressing letter R will initiate rotate-node state which works the same way as the move-node state. ESC to cancel, click to apply.
Ctrl will snap 5 degree increments.

### Scale Nodes
Letter S initiates the scaling, which keeps the aspect ratio of the nodes. To scale only on one axis letters X or Y can be used. Also Ctrl snaps 0.1 intervals.

### Duplicate Nodes
Letter D duplicates selected nodes. The new nodes are attached to the cursor and must be positioned by clicking. Pressing ESC-key will cancel the duplication and remove the nodes.

### Assign Node Group
Node groups can be used as a shortcuts/modules/etc.
To assign selected nodes to a certain group, press Ctrl+<0..9>

### Select Node Group
To select assigned node group, press the number that was used for assigning

### Find Node
This can be useful with the node groups. By pressing letter F the selected nodes will be centered on the viewport.

### Parent / Unparent Node
To parent nodes, select nodes to be parented and the select the node that will be the parent so that the parent is the active node. Then press the letter P.
To unparent (move nodes back to layer) select nodes and press Shift+P.

### Change Node Z-Order
Selected node can be lifted/sinked with page up/down keys. Home/end keys will move the node topmost/bottommost.

### Start / Stop Animation
To see how animations look like, press spacebar. Animation time is shown on top left corner. To stop the animation press spacebar again.

### Edit Node
Pressing Tab will change the editor to edit node mode. This allows to edit node internal data (e.g. path points). While in edit mode there is blue background drawn behind the node. To exit from edit mode press Tabulator again.

### Enter Game
To enter game just press Enter. Press Esc to get back to editor from game.

### Property panel visibility
Property panel can be hidden/shown by pressing letter T.

### Boundary lines visibility
Can be toggled with letter H

### Boundary dim visibility
Can be toggled with letter Z.

### Node editor visual visibility
There is three states available: Fully visible, party opaque and transparent. The states can be toggled with letter V.
