# WebGL-and-basic-shader-concepts.
In this we will let you develop a tunnel runner with keyboard controllers. This will be an arcade game (inspired by ​ http://www.y8.com/games/Tunnel_Rush​ ) where the player moves through a tunnel and avoids obstacles by switching lanes.

The world is an octahedron shaped tunnel and the player runs on the bottom side. To dodge
obstacles, the player can rotate the tunnel to change the bottom side or jump. The obstacles
should initially be stationary and in later levels moving (like the game link).
# Objects and Physics:
You should incorporate the basic physics into the behaviour/ motion of the objects. The
minimum set of factors you need to consider are:
1. An octahedral infinite tunnel.
2. Stationary obstacles and in later levels rotating/moving ones
3. Switching the bottom side. Doing so should change the gravity too. Gravity is always
downwards. (see the game link)
# Shader Tasks:
These tasks must be done using shaders and not javascript
1. Make the world grayscale temporarily (using a button or timed)
2. Textured walls
3. Make the tiles flash periodically

# Project Files:

* index.html   - contains the main tunneltilt game state, render loop, and menus
* shaders.html - contains the source code for the shaders used in tunneltilt
* gl-utils.js  - contains various WebGL helper functions
* events.js    - contains mouse / touch and accelerometer handlers for tunneltilt
* geometry.js  - contains the geometry and respective logic for tunneltilt
* sound.js     - contains code for playing sounds in WebWorks
* loader.js    - contains XMLHttpRequest logic for asset load notification
* data         - a folder that contains the images, sound, and levels for tunneltilt
* gl-matrix    - a folder that contains gl-matrix-min.js a high performance matrix

                 Use arrow to rotate tunnel and avoid ball from collision
