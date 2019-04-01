Particles = function(){
    // Arrays of particle velocities and sizes.
    this.velocityData = this.sizeData = this.positionData = this.texCoordData =[];
    var positions = [-1, 1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0, -1, -1, 0, 1, 1, 0];
    var texCoords = [0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1];
    var temp,speed,angle = 0.0;

    // Initialize all the particle data
    for(var i=1;i<=200;i++) {
        this.positionData = this.positionData.concat(positions); // Append position coordinates (6-verts per quad)
        // Append quad size (6-verts per quad) 
        temp = Math.random() * 100; // Here temp has value for position
        angle = Math.PI * Math.random();
        speed = 15.0 * Math.random();
        this.sizeData = this.sizeData.concat([temp,temp,temp,temp,temp,temp]);
        // Append quad velocity (6-verts per quad) // Here temp has value for velocity
        temp = [(speed+10)*Math.cos(2*angle)*Math.sin(2*angle), (speed+10)*Math.sin(2*angle)*Math.sin(2*angle), (speed+10)*Math.cos(2*angle)];
        this.velocityData = this.velocityData.concat([temp,temp, temp, temp, temp, temp]);
        this.texCoordData = this.texCoordData.concat(texCoords);         // Append texture coordinates (6-verts per quad)
    }
    // Create and fill the buffers with data
    this.positionBuffer = createArrayBuffer(this.positionData, 3);
    this.sizeBuffer = createArrayBuffer(this.sizeData, 1);
    this.velocityBuffer = createArrayBuffer(this.velocityData, 3);
    this.texCoordBuffer = createArrayBuffer(this.texCoordData, 2);
}

 //  Quad is how the walls are drawn, each as a simple textured square.
Quad = function () {
    // Create the shared buffers for all quads
    this.positionBuffer = Quad.positionBuffer = createArrayBuffer([ 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0 ], 3); // array is position data
    this.texCoordBuffer = Quad.texCoordBuffer = createArrayBuffer([ 0, 0, 0, 1, 1, 0, 1, 1 ], 2); // array is texture data
    this.setMatrixUniforms = 0;
};

/**
 *  Draw the actual quad as a triangle strip.
 */
Quad.prototype.draw = function (shaderProgram, matrix, pos, angle, scale) {
    setVertexAttribs(shaderProgram, [this.positionBuffer, this.texCoordBuffer]);
    var mvMatrix = mat4.create(matrix);
    mat4.translate(mvMatrix, pos);
    mat4.rotate(mvMatrix, angle, [0, 0, 1]);
    mat4.scale(mvMatrix, [scale, scale, scale]);
     // Set up transformation matrix, and send it to the shader.
    this.setMatrixUniforms = gl.uniformMatrix4fv(shaderProgram.uniform["uMVMatrix"], false, mvMatrix);;
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.positionBuffer.numItems);
};
/**
 *  The cylinder class encapsulates the whole tunnel. It is composed of a
 *  number of segments, positioned along a curve calculated by getTunnelOffset.
 *  The cylinder actually doesn't move; instead, the texture coordinates change
 *  to give the illusion of movement down the tunnel.
 */
Cylinder = function (subdivs, pos, length, radius) {
    var temp_pos = pos[2];
    var positionData = [];
    var textureCoordData = [];
    this.numSegments = 35;
    var segmentLength = length / this.numSegments;
    var temp_end = temp_pos - length;
    this.speed = 0.01;
    this.acceleration = 0.08;
    this.maxSpeed = 1;
    this.straightSegments = this.numSegments/5;
    this.getTunnelOffset = function(segment) {
        return radius * Math.cos((segment-this.straightSegments)*2*Math.PI / (this.numSegments-this.straightSegments)) - radius;}
    this.lastWallPos = 128;
    // Generate the coordinates for the tunnel, segment by segment.
    for (var segment=0; segment < this.numSegments; segment++) {
        // Each segment is subdivided into a single triangle strip.
        for (var subdiv=0; subdiv <= subdivs; subdiv++) {
            var temp_radius = 0 ;
            var phi = subdiv * 2 * Math.PI / subdivs;
            if(segment>=this.straightSegments) // checking offset of tunnel
                temp_radius = this.getTunnelOffset(segment+1);
            positionData.push(radius * Math.cos(phi) + temp_radius);
            temp_radius = 0;
            positionData.push(radius * Math.sin(phi));
            textureCoordData.push(subdiv / subdivs);
            textureCoordData.push((segment+1) * 3 / this.numSegments);
            temp_end = pos[2] - (segment * segmentLength) - segmentLength;
            positionData.push(temp_end);

            if(segment>=this.straightSegments+1)
                temp_radius = this.getTunnelOffset(segment);
            positionData.push(radius * Math.cos(phi) + temp_radius);
            temp_radius = 0;
            positionData.push(radius * Math.sin(phi));
            textureCoordData.push(subdiv / subdivs);
            textureCoordData.push(segment * 3 / this.numSegments);
            temp_pos = pos[2] - (segment * segmentLength);
            positionData.push(temp_pos);
        }
    }

    // Create the buffers and fill them with data.
    this.length = length || 10;
    this.pos = pos || vec3.create([0,0,0]);
    this.positionBuffer = createArrayBuffer(positionData, 3);
    this.texCoordBuffer = createArrayBuffer(textureCoordData, 2);
    this.radius = radius || 5;
    // reset all cylinder varialbles
    this.walls = [];
    this.offset = this.angle = 0; 

    // Calculate the transformation on the cylinder. In this case, it's only
    // a rotation.
    this.setMatrixUniforms = function(shader) {
        var mvMatrix = mat4.create();
        mat4.identity(mvMatrix);
        mat4.rotate(mvMatrix, this.angle, [0, 0, 1]);
        shader.mvWallMatrix = mat4.create(mvMatrix);
        gl.uniformMatrix4fv(shader.uniform["uMVMatrix"], false, mvMatrix);
    };

    // Set up lighting uniforms for cylinder and walls.
    this.setupLighting = function(shaderProgram, wallProgram, particles, currentTime, gameInfo) {
       // Brighten slowly over the length of the cylinder.
            var t = (this.offset / 3 * this.length) / this.lastWallPos;
            var falloff = 0.0001 + (0.0002 - 0.0001) * t;
            var ambient = 0.05 + (0.3 - 0.05)*t;
            var shine = 10 + 10* t;
            gl.uniform1f(shaderProgram.uniform["uNearStrength"], 100.0);
            gl.uniform1f(shaderProgram.uniform["uAmbient"], ambient);
            gl.uniform1f(shaderProgram.uniform["uFalloff"], falloff);
            gl.useProgram(wallProgram);
            // Setup the same lighting effects for the wall shader.
            gl.uniform1f(wallProgram.uniform["uNearStrength"], 100.0);
            gl.uniform1f(wallProgram.uniform["uAmbient"], ambient);
            gl.uniform1f(wallProgram.uniform["uFalloff"], falloff);
            gl.uniform1f(wallProgram.uniform["uShine"], shine);
            gl.useProgram(shaderProgram);// Restore the cylinder shader.
    }
}

Cylinder.prototype.initShader = function(perspective)
{
    this.shader = loadShader("tunnel-vs", "tunnel-fs", ["aVertexPosition", "aTextureCoord"], ["uPMatrix", "uMVMatrix", "uTextureOffset", "uSampler","uNearStrength", "uFalloff", "uAmbient"]);
    gl.uniformMatrix4fv(this.shader.uniform["uPMatrix"], false, perspective);

    this.wallShader = loadShader("tunnel-vs", "wall-fs", ["aVertexPosition", "aTextureCoord"], ["uShine","uPMatrix", "uMVMatrix", "uTextureOffset", "uSampler", "uNearStrength", "uFalloff", "uAmbient"]);
    gl.uniformMatrix4fv(this.wallShader.uniform["uPMatrix"], false, perspective);
}

Cylinder.prototype.draw = function(particles, currentTime, gameInfo)
{
    gl.useProgram(this.shader);
    enableAttributes(this.shader);
    this.setMatrixUniforms(this.shader);// Setup transformation and bind buffers
    this.setupLighting(this.shader, this.wallShader, particles, currentTime, gameInfo);
    setVertexAttribs(this.shader, [this.positionBuffer, this.texCoordBuffer]);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1f(this.shader.uniform["uTextureOffset"], this.offset);
    this.texture.bind();// Bind texture and apply texture offset for movement.
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.positionBuffer.numItems);// Draw the cylinder.
    disableAttributes(this.shader);
     
    var wallOffset = this.offset/3*this.length;
    gl.useProgram(this.wallShader);
    enableAttributes(this.wallShader);
    mat4.translate(this.shader.mvWallMatrix, [0, 0, wallOffset]);
    this.wallTexture.bind();


    // Draw each wall, calculating the correct offset to account for the 
    // curvature of the tunnel.
    for (var i=0; i<this.walls.length; i++) {
        var transformedX = 0;
        var transformedZ = this.walls[i].pos[2] + wallOffset;
        var segment = -( transformedZ ) * this.numSegments / this.length;
        if (-transformedZ < this.length && transformedZ < 0) {
            if(segment>= this.straightSegments+1)
                var transformedX = this.getTunnelOffset(segment);
            this.walls[i].draw(this.wallShader, this.shader.mvWallMatrix, transformedX, this);
        }
    }
    disableAttributes(this.wallShader);
};


// Set the tunnel texture.
Cylinder.prototype.setBackground = function (tex,tex1) {
    this.texture = tex;
    this.wallTexture = tex1;
}

/**
 *  Walls are defined by two angles. They sweep from angle1 to angle2,
 *  clockwise, and are positioned at an absolute z value.
 *  The geometry is very simple, just a single quad.
 */
Wall = function(angle1, angle2, radius, z){
    this.scale = 2*radius;
    this.angle2 = angle2;
    this.angle1 = angle1;
    // Coordinates of the two end points on the tunnel. we compute angle perpendicular to the line from (x1,y1) to (x2,y2).
    this.angle = Math.PI + Math.atan2((Math.sin(angle2)-Math.sin(angle1))*radius,(Math.cos(angle2)-Math.cos(angle1))*radius);
    // Create normalized vector from end points
    var dirY = Math.sin(angle2) - Math.sin(angle1);
    var dirX = Math.cos(angle2) - Math.cos(angle1);
    var dirtemp = Math.sqrt(dirX * dirX + dirY * dirY);
    dirY /= dirtemp;
    dirX /= dirtemp;

    // Find midpoint of (x1,y1)-(x2,y2).
    var midY = (Math.sin(angle1) + Math.sin(angle2))/2*radius;
    var midX = (Math.cos(angle1) + Math.cos(angle2))/2*radius;

    // Set bottom left corner of quad
    this.pos = vec3.create([midX + radius * dirX, midY + radius * dirY, -z]);
    this.quad = new Quad();    // Create quad
};

Wall.prototype.draw = function(shaderProgram, matrix, transformedX) {
    // Translate our position to account for the curvature of the tunnel.
    var newpos = [this.pos[0]+transformedX, this.pos[1], this.pos[2]];
    // Actually draw the quad.
    this.quad.draw(shaderProgram, matrix, newpos, this.angle, this.scale);
}

/**
 *  The ball is actually made up of two point sprites, slightly offset in z.
 *  The top texture is the actual ball, while the texture behind it shows
 *  the glow effect.
 *  To give some visual effect when turning, the front texture moves slightly
 *  in the direction of movement.
 */
Ball = function (tunnelRadius) {
    // Set up the coordinates of our quad and the texture coords that will be mapped to that quad
    var texCoordData = [0, 0, 1, 0, 0, 1, 1, 1];
    var texCoordData2 = [0, 1, 1, 1, 0, 0, 1, 0];
    var positionData = [-1, 1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0];
    // Create and fill buffer data.
    this.texCoordBuffer2 = createArrayBuffer(texCoordData2, 2);
    this.texCoordBuffer = createArrayBuffer(texCoordData, 2);
    this.positionBuffer = createArrayBuffer(positionData, 3);
    this.glowOffset = 0;
    this.ballGlow = 0;
    this.setMatrixUniforms = function(shader, glow) {
        var mvMatrix = mat4.create();
        mat4.identity(mvMatrix);
        if (!glow) {
            mat4.translate(mvMatrix, [-this.glowOffset, Math.abs(this.glowOffset/2),0]);
        }
        if (this.ballGlow >= 0.27)
            this.ballGlow = -this.ballGlow;
        else
            this.ballGlow += 0.007;
        mat4.rotate(mvMatrix, 0.1, [0, 1, 0]);
        mat4.translate(mvMatrix, [0, -12, this.ball_start]);
        if (glow)
            mat4.scale(mvMatrix, [5.0+Math.abs(this.ballGlow), 5.0+Math.abs(this.ballGlow), 5.0]);
        else
            mat4.scale(mvMatrix, [5.0, 5.0, 5.0]);
        gl.uniformMatrix4fv(shader.uniform["uMVMatrix"], false, mvMatrix);
    };
    this.ball_start = -30;this.rotationSpeed = 0;this.ball_close = 5;this.maxRotationSpeed = Math.PI; this.ballangle_close = 5;
};

Ball.prototype.initShader = function(perspective) {
    this.shader = loadShader("ball-quad-vs", "ball-quad-fs", ["aPosition", "aTextureCoord"], ["uPMatrix", "uMVMatrix", "uSampler", "uAmbient", "uTransparency"]);
    gl.uniformMatrix4fv(this.shader.uniform["uPMatrix"], false, perspective);
}

Ball.prototype.draw = function (gameInfo, currentTime) {
    gl.useProgram(this.shader);// Enable shader program and attributes.
    enableAttributes(this.shader);
    var ball_ambient = 0;
    gl.activeTexture(gl.TEXTURE0);
    ball_ambient = 1.01 + (3 - 1.01)*(cylinder.offset / 3 * cylinder.length) / cylinder.lastWallPos;// Brighten slowly as we progress.
    gl.uniform1f(this.shader.uniform["uAmbient"], ball_ambient);

    gl.enable(gl.BLEND);   // Enable blending so the bottom texture will show through.
    setVertexAttribs(this.shader, [this.positionBuffer, this.texCoordBuffer2]);// Set up buffer data.
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);

    gl.uniform1f(this.shader.uniform["uTransparency"], 1.0 - ball_ambient/40.0);// Draw the ball.
    this.setMatrixUniforms(this.shader, false);
    setVertexAttribs(this.shader, [this.positionBuffer, this.texCoordBuffer]);
    this.texture.bind();
    gl.enable(gl.DEPTH_TEST);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.disable(gl.BLEND);    // Disable blending again - it's expensive.
    disableAttributes(this.shader);
}

Ball.prototype.setTexture = function (tex,glow) {
    this.texture = tex;
    this.glowTexture = glow;
}

Ball.prototype.didCrash = function (cylinder) {
    var a,b;
    var pos = cylinder.offset / 3 * cylinder.length;
    pos = pos - this.ball_start;
    var angle = (3*Math.PI/2-cylinder.angle); // Convert from cylinder angle to wall angle
    angle = (angle * 180 / Math.PI)%360;    
    if (angle < 0)
        angle += 360;
    // For each wall, check for collision.
    for (var i=0; i<cylinder.walls.length; i++) {
        var current_wall = cylinder.walls[i];
        a = pos+this.ball_close;
        b = pos-this.ball_close;
        if (current_wall.pos[2] > -a && current_wall.pos[2] < -b) {
            var angle1 = current_wall.angle1 *180 / Math.PI;
            angle1 = (angle1 - this.ballangle_close) % 360;
            var angle2 = current_wall.angle2 * 180 / Math.PI; 
            angle2 = (angle2 + this.ballangle_close) % 360;
            if (angle1 < 0 || angle2 < 0){
                angle1 = (angle1 + 360)%360;
                angle2 = (angle2 + 360)%360;
            }
            // Since the angle could wrap around, this is just a simple test whether the ball angle is between angle1 and angle2.
            if ((angle1 < angle2 && angle > angle1 && angle < angle2))  return true;
            if ((angle1 > angle2 && (angle > angle1 || angle < angle2))) return true;
        }
    }
    return false;
}
