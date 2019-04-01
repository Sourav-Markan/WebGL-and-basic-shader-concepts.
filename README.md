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
