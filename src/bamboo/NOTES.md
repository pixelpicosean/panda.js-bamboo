## Layout

+-----------------------------------------------+
|                   MENUBAR                     |
+---+-----------------------------------+-------+
|   |                                   |       |
|   |                                   |       |
| T |                                   |   S   |
| O |                                   |   I   |
| O |                                   |   D   |
| L |             EDITOR                |   E   |
| B |                                   |   B   |
| A |                                   |   A   |
| R |                                   |   R   |
|   |                                   |       |
|   |                                   |       |
+---+-----------------------------------+-------+

## Hierarchy

ui
|
canvas
|
stage
|
+---mainContainer
    |
    +---overlayContainer
    |   |
    |   +---screenRect
    |   |
    |   +---screenDim
    |   |
    |   +---boundaries
    |       |
    |       +---grid
    |       |
    |       +---bottomLine
    |       |
    |       +---rightLine
    |       |
    |       +---topLine
    |       |
    |       +---leftLine
    |
    +---editorContainer
    |   |
    |   +---layer.editorNode.displayObject
    |           |
    |           +---node.editorNode.displayObject
    |               |
    |               +---anchorBox
    |               |
    |               +---parentSelectionRect
    |               |
    |               +---editableRect
    |               |
    |               +---nameText
    |               |
    |               +---connectedToLine
    |               |
    |               +---touchRect
    |               |
    |               +---activeRect
    |               |
    |               +---selectionRect
    |               |
    |               +---debugDisplayObject
    |
    +---sceneContainer
        |
        +---layer.displayObject
            |
            +---node.displayObject

