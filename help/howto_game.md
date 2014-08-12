## Directory structure

    src/
      bamboo/              - source files for this framework
      engine/              - source files for Panda.js game engine
      game/                - source files containing game logic and game-specific components
      
    bamboo/editor/         - files used by the editor
      media/               - contains images used in editor ui
      nodes/               - contains the editor node representations of the basic runtime nodes
      core.js              - main module to import when the editor is used, handles level loading, input handling and other very high-level functions
      editor.js            - contains all base logic for the editor UI. Keeps track of nodes, modes and any permanent data in editor
      editorcontroller.js  - all data kept in editor should be modified through this interface
      mode.js              - base class for editor modes
      node.js              - base class for any editor side node
      nodemode.js          - the main mode where user spends the most time in
      selectionstate.js    - the main state, allows user to select nodes, and forwards other tasks to different states
      state.js             - base class for states (all states are under nodemode)
      
    bamboo/runtime/        - files required to run the game
      nodes/               - contains some basic nodes like LayerNode and ImageNode
      core.js              - main module to import in game. This module contains basic Scene-class which can be used for testing.
      node.js              - base class for all nodes. Contains basic logic: parenting, position, etc.
      property.js          - property class which contains information of node properties
      vec2.js              - vector math module. This class is used throughout the library
      world.js             - world-node aka root-node. Keeps track of all nodes in the game. Also handles inputs and camera.
      
## How to create a new node (game component)

There is some basic components included in the package. If there is one missing or you just want to add new functionality to some existing one, here is how to do it:

1. Derive your node from either bamboo.Node or some of the existing ones from bamboo.nodes.*
In this class you should include code only needed in game side, e.g. drawing, reactions to changes in world, time, etc.
The class must be placed under bamboo.nodes namespace so the runtime will know from where to instantiate the class.

2. Create property-descriptor for the new node
This descriptor will provide the necessary information to the runtime to populate the world during loading phase. The descriptor should list all properties from the node that must be saved to level-JSON.

3. Derive editor node from the same class editor node you derived the node.
E.g if you derived bamboo.nodes.Image you must derive your editor node from bamboo.nodes.Image.editor.
This class gives you possibility to draw and present some additional information to the editor user. This class will be automatically instantiated only in the editor.

## How to create a new game from scratch

Derive your own world from bamboo.World

Here you can handle inputs from the user, listen changes in nodes and react to anything that happens in the game.
This class should as minimum provide a getClassName() method which returns the class name of the world. The world class must be placed under bamboo namespace.

In bare minimum you can now e.g. create a game in which all nodes try to follow your finger, or tapping the screen will add a new node.

Normally you might want to create a player node (see above) in where you could handle physics, inputs related to player movement, etc.
