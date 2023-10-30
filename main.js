var canvas;
var gl;

var program;

var near = 1;
var far = 100;

var left = -6.0;
var right = 6.0;
var ytop = 6.0;
var bottom = -6.0;

var lightPosition2 = vec4(100.0, 100.0, 100.0, 1.0);
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0);

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(0.4, 0.4, 0.4, 1.0);
var materialShininess = 30.0;

var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix, modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var RX = 0;
var RY = 0;
var RZ = 0;

var MS = []; // The modeling matrix stack
var TIME = 0.0; // Realtime
var dt = 0.0;
var prevTime = 0.0;
var resetTimerFlag = true;
var animFlag = false;
var controller;

var fishBodyColour = vec4(0.8, 0.165, 0.11, 1.0);
var seaweedColour = vec4(0.106, 0.639, 0.141, 1.0);
var diverColour = vec4(0.639, 0.071, 0.62, 1);

// These are used to store the current state of objects.
// In animation it is often useful to think of an object as having some DOF
// Then the animation is simply evolving those DOF over time.
var stonePosition = [0, -3.4, 0];
var stone2Position = [-1.4, -0.5, 0];

var fishStartPosition = [-2, 1, 0];
var fishEyePosition = [0.25, 0.25, 0];
var fishBodyPosition = [0, 0, -1.25];
var fishPosition = [2, 0, 0];
var fishRotation = [0, 0, 0];
var fishMovement = [1, 0, 1];
var tailPosition = [0, 0.25, -2.2];
var tailRotation = [0, 0, 0];

var seaweedRotation = [0, 0, 0];
var strandRotation = [0, 0, 0];
var middleSeaweedPosition = [0, 0.8, 0];
var leftSeaweedPosition = [-0.6, 0.2, 0];
var rightSeaweedPosition = [0.6, 0.2, 0];

var diverPosition = [4, 3, 0];
var diverMovement = [0, 0, 0];
var diverHeadPosition = [0, 1.15, 0];
var diverThighPosition = [0.3, -1, 0];
var legSway = [0, 0, 0];

var bubbleTimer = [0, 0, 0, 0];
var spawnDelay = [0, 0, 0, 0];
var bubbleMovement = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
];
var bubblePosition = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
];

var cubeRotation = [0, 0, 0];
var groundPosition = [0, -1.6, 0];

var cylinderRotation = [0, 1, 0];
var cylinderPosition = [1.1, 0, 0];

var coneRotation = [0, 0, 0];
var conePosition = [3, 0, 0];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Setting the colour which is needed during illumination of a surface
function setColor(c) {
  ambientProduct = mult(lightAmbient, c);
  diffuseProduct = mult(lightDiffuse, c);
  specularProduct = mult(lightSpecular, materialSpecular);

  gl.uniform4fv(
    gl.getUniformLocation(program, "ambientProduct"),
    flatten(ambientProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "diffuseProduct"),
    flatten(diffuseProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "specularProduct"),
    flatten(specularProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "lightPosition"),
    flatten(lightPosition)
  );
  gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
}

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.5, 0.5, 1.0, 1.0);

  gl.enable(gl.DEPTH_TEST);

  //
  //  Load shaders and initialize attribute buffers
  //
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  setColor(materialDiffuse);

  // Initialize some shapes, note that the curved ones are procedural which allows you to parameterize how nice they look
  // Those number will correspond to how many sides are used to "estimate" a curved surface. More = smoother
  Cube.init(program);
  Cylinder.init(20, program);
  Cone.init(20, program);
  Sphere.init(36, program);

  // Matrix uniforms
  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
  normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

  // Lighting Uniforms
  gl.uniform4fv(
    gl.getUniformLocation(program, "ambientProduct"),
    flatten(ambientProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "diffuseProduct"),
    flatten(diffuseProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "specularProduct"),
    flatten(specularProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "lightPosition"),
    flatten(lightPosition)
  );
  gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

  document.getElementById("animToggleButton").onclick = function () {
    if (animFlag) {
      animFlag = false;
    } else {
      animFlag = true;
      resetTimerFlag = true;
      window.requestAnimFrame(render);
    }
    //console.log(animFlag);

    controller = new CameraController(canvas);
    controller.onchange = function (xRot, yRot) {
      RX = xRot;
      RY = yRot;
      window.requestAnimFrame(render);
    };
  };

  render(0);
};

// Sets the modelview and normal matrix in the shaders
function setMV() {
  modelViewMatrix = mult(viewMatrix, modelMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
  normalMatrix = inverseTranspose(modelViewMatrix);
  gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix));
}

// Sets the projection, modelview and normal matrix in the shaders
function setAllMatrices() {
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
  setMV();
}

// Draws a 2x2x2 cube center at the origin
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCube() {
  setMV();
  Cube.draw();
}

// Draws a sphere centered at the origin of radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawSphere() {
  setMV();
  Sphere.draw();
}

// Draws a cylinder along z of height 1 centered at the origin
// and radius 0.5.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCylinder() {
  setMV();
  Cylinder.draw();
}

// Draws a cone along z of height 1 centered at the origin
// and base radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCone() {
  setMV();
  Cone.draw();
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modeling matrix with the result
function gTranslate(x, y, z) {
  modelMatrix = mult(modelMatrix, translate([x, y, z]));
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modeling matrix with the result
function gRotate(theta, x, y, z) {
  modelMatrix = mult(modelMatrix, rotate(theta, [x, y, z]));
}

// Post multiples the modelview matrix with a scaling matrix
// and replaces the modeling matrix with the result
function gScale(sx, sy, sz) {
  modelMatrix = mult(modelMatrix, scale(sx, sy, sz));
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
  modelMatrix = MS.pop();
}

function gPopN(n) {
  for (i = 0; i < n; i++) {
    gPop();
  }
}

// pushes the current modelViewMatrix in the stack MS
function gPush() {
  MS.push(modelMatrix);
}

function render(timestamp) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  eye = vec3(0, 0, 10);
  MS = []; // Initialize modeling matrix stack

  // initialize the modeling matrix to identity
  modelMatrix = mat4();

  // set the camera matrix
  viewMatrix = lookAt(eye, at, up);

  // set the projection matrix
  projectionMatrix = ortho(left, right, bottom, ytop, near, far);

  // set all the matrices
  setAllMatrices();

  if (animFlag) {
    // dt is the change in time or delta time from the last frame to this one
    // in animation typically we have some property or degree of freedom we want to evolve over time
    // For example imagine x is the position of a thing.
    // To get the new position of a thing we do something called integration
    // the simpelst form of this looks like:
    // x_new = x + v*dt
    // That is the new position equals the current position + the rate of of change of that position (often a velocity or speed), times the change in time
    // We can do this with angles or positions, the whole x,y,z position or just one dimension. It is up to us!
    dt = (timestamp - prevTime) / 1000.0;
    prevTime = timestamp;
  }

  //WCS
  gPush();
  {
    // Set the origin at the location of the stones
    gTranslate(stonePosition[0], stonePosition[1], stonePosition[2]);
    gPush();
    {
      // Draw the rocks!
      setColor(vec4(0.4, 0.4, 0.6, 1.0));
      gScale(0.6, 0.6, 0.6);
      drawSphere();
      gPush();
      {
        gTranslate(stone2Position[0], stone2Position[1], stone2Position[2]);
        //Smaller Rock
        gPush();
        {
          gScale(0.5, 0.5, 0.5);
          drawSphere();
        }
        gPop();
      }
      gPop();
    }
    gPop();

    // Fish
    gPush();
    {
      gTranslate(
        fishStartPosition[0],
        fishStartPosition[1],
        fishStartPosition[2]
      );
      // Fish  Movement
      // Rotates around 0, 0, 0 while swimming up and down in a sin wave
      renderFish();
    }
    gPop();

    // Seaweed
    renderSeaweedStrand(
      rightSeaweedPosition[0],
      rightSeaweedPosition[1],
      rightSeaweedPosition[2]
    );
    renderSeaweedStrand(
      middleSeaweedPosition[0],
      middleSeaweedPosition[1],
      middleSeaweedPosition[2]
    );
    renderSeaweedStrand(
      leftSeaweedPosition[0],
      leftSeaweedPosition[1],
      leftSeaweedPosition[2]
    );

    //Diver
    gPush();
    {
      setColor(diverColour);
      gTranslate(diverPosition[0], diverPosition[1], diverPosition[2]);
      diverMovement[0] = 0.5 * Math.sin(0.0005 * timestamp); // Left and right movement
      diverMovement[1] = 0.5 * Math.sin(0.0005 * timestamp); // Up and down movement
      gTranslate(diverMovement[0], diverMovement[1], diverMovement[2]);
      gRotate(-15, 0, 1, 0);
      gPush();
      {
        gScale(0.4, 0.8, 0.5);
        drawCube();
      }
      gPop();

      //Diver Leg
      renderDiverLeg(false);
      renderDiverLeg(true);

      // Diver Head
      gPush();
      {
        gTranslate(
          diverHeadPosition[0],
          diverHeadPosition[1],
          diverHeadPosition[2]
        );
        gPush();
        {
          gScale(0.333, 0.333, 0.333);
          drawSphere();
        }
        gPop();
      }
      gPop();
    }
    gPop();

    // Bubbles
    // Random number between 3 and 6
    for (i = 0; i < 4; i++) {
      if (timestamp > spawnDelay[i - 1] + 600 || i == 0) {
        spawnDelay[i] = timestamp;
        spawnBubbles(Math.floor(Math.random() * 3) + 4, i);
      }
    }

    // Ground Box
    gPush();
    {
      gTranslate(groundPosition[0], groundPosition[1], groundPosition[2]);
      gPush();
      {
        // setColor(vec4(1.0, 0.8, 0.6, 1.0));
        setColor(vec4(0.1, 0.1, 0.1, 1.0));
        gScale(6, 1, 1);
        drawCube();
      }
      gPop();
    }
    gPop();
  }
  gPop();

  if (animFlag) window.requestAnimFrame(render);

  function renderFish() {
    gPush();
    {
      setColor(vec4(0.4, 0.4, 0.6, 1.0));
      fishPosition[1] = Math.sin(0.001 * timestamp); // Up and down movement
      gTranslate(fishPosition[0], fishPosition[1], fishPosition[2]);
      // Rotation around seaweed at distance of 1
      fishRotation[1] = fishRotation[1] + 60 * dt;
      gRotate(fishRotation[1], 0, 1, 0);
      gTranslate(-fishPosition[0], fishPosition[2], fishPosition[2]);

      gPush();
      {
        gScale(0.5, 0.5, 0.5);
        drawCone();
      }
      gPop();
      //Fish Body -> Child of Head CS
      gPush();
      {
        setColor(fishBodyColour);
        gTranslate(
          fishBodyPosition[0],
          fishBodyPosition[1],
          fishBodyPosition[2]
        );
        gRotate(180, 0, 1, 0);
        gScale(0.5, 0.5, 2);
        drawCone();
      }
      gPop();

      gPush();
      {
        //Fish Tail Top fin
        gPush();
        {
          gTranslate(
            tailPosition[0],
            tailPosition[1],
            tailPosition[2] - 0.1333
          );
          gRotate(220, 1, 0, 0);
          tailRotation[1] = 15 * Math.sin(timestamp / 100); // Doesn't work
          gRotate(tailRotation[1], 0, 1, 0);
          gScale(0.12, 0.12, 0.7);
          drawCone();
        }
        gPop();

        // Fish tail bottom fin
        gPush();
        {
          gTranslate(tailPosition[0], -tailPosition[1], tailPosition[2]);
          gRotate(125, 1, 0, 0);
          tailRotation[1] = 15 * Math.sin(timestamp / 100); // Doesn't work
          gRotate(tailRotation[1], 0, 1, 0);
          gScale(0.1, 0.1, 0.5);
          drawCone();
        }
        gPop();
      }
      gPop();
      //Fish Eyes
      gPush();
      {
        setColor(vec4(1.0, 1.0, 1.0));

        // Right Eye
        gPush();
        {
          gTranslate(
            fishEyePosition[0],
            fishEyePosition[1],
            fishEyePosition[2]
          );
          gScale(0.1, 0.1, 0.1);
          drawSphere();
          gPush();
          {
            setColor(vec4(0.0, 0.0, 0.0));
            gScale(0.8, 0.8, 1.2);
            drawSphere();
          }
          gPop();
        }
        gPop();
        setColor(vec4(1.0, 1.0, 1.0));
        //Left Eye
        gPush();
        {
          gTranslate(
            -fishEyePosition[0],
            fishEyePosition[1],
            fishEyePosition[2]
          );
          gScale(0.1, 0.1, 0.1);
          drawSphere();
          gPush();
          {
            setColor(vec4(0.0, 0.0, 0.0));
            gScale(0.8, 0.8, 1.2);
            drawSphere();
          }
          gPop();
        }
        gPop();
      }
      gPop();
    }
    gPop();
  }

  function spawnBubbles(dif, i) {
    gPush();
    {
      //3-6 seconds before bubble reset
      if (timestamp > bubbleTimer[i] + dif * 1000 || bubbleTimer[i] == 0) {
        bubbleTimer[i] = timestamp; // Reset Timer
        //Reset Position to locate of Diver Head
        bubbleMovement[i][1] = 0;
        bubblePosition[i][0] =
          diverHeadPosition[0] + diverPosition[0] + diverMovement[0];
        bubblePosition[i][1] =
          diverHeadPosition[1] + diverPosition[1] + diverMovement[1];
        bubblePosition[i][2] = diverHeadPosition[2] + diverPosition[2];
        console.log(bubblePosition);
      }

      setColor(vec4(0.99, 0.99, 0.99, 0.8));
      bubbleMovement[i][1] = bubbleMovement[i][1] + dt; // Upwards Movement
      gTranslate(
        bubblePosition[i][0],
        bubblePosition[i][1],
        bubblePosition[i][2]
      );
      gTranslate(0, bubbleMovement[i][1], 0);
      gTranslate(0, 0, 0.5);
      gScale(0.1, 0.1, 0.1);
      drawSphere();
    }
    gPop();
  }

  // if isLeft, the x coordinate and sway angles are negative
  function renderDiverLeg(isLeft) {
    gPush();
    {
      // Set to left leg position or right leg
      if (isLeft) {
        gTranslate(
          -diverThighPosition[0],
          diverThighPosition[1],
          diverThighPosition[2]
        );
      } else {
        gTranslate(
          diverThighPosition[0],
          diverThighPosition[1],
          diverThighPosition[2]
        );
      }
      gRotate(45, 1, 0, 0);
      //Rotate legs alternating in a sine pattern
      legSway[0] = isLeft
        ? -15 * Math.sin(0.002 * timestamp)
        : 15 * Math.sin(0.002 * timestamp); // leg kicking
      gRotate(legSway[0], 1, 0, 0);
      gPush();
      {
        gScale(0.1, 0.5, 0.2);
        drawCube();
      }
      gPop();
      // Diver Shin
      gPush();
      {
        // Rotate from base
        gTranslate(0, -0.375, 0);
        gRotate(30, 1, 0, 0);
        gRotate(0.3 * legSway[0], 1, 0, 0);
        gTranslate(0, -0.375, 0);
        gScale(0.1, 0.4, 0.2);
        drawCube();
        // Diver Foot
        gPush();
        {
          gTranslate(0, -0.7, 1);
          gScale(1, 0.15, 1.4);
          drawCube();
        }
        gPop();
      }
      gPop();
    }
    gPop();
  }

  //Render Individual Strand with position of base
  function renderSeaweedStrand(i, j, k) {
    gPush();
    {
      setColor(seaweedColour);
      gTranslate(i, j, k);
      // 2.5 degrees * sin(timstamp) -> Translated down the entire kinetic chain equals a sway from -25 to 25 degrees
      seaweedRotation[2] = -2.5 * Math.sin(timestamp / 1000);
      gRotate(seaweedRotation[2], 0, 0, 1);
      gPush();
      {
        gScale(0.15, 0.3, 0.15);
        drawSphere();
      }
      gPop();

      for (i = 0; i < 9; i++) {
        gPush();
        //Sine pattern in the seaweed
        strandRotation[2] = 15 * Math.sin(timestamp / 1000 + i);
        gRotate(strandRotation[2], 0, 0, 1);
        // Rotate from Base
        gTranslate(0, 0.55, 0);
        gPush();
        {
          gScale(0.15, 0.3, 0.15);
          drawSphere();
        }
        gPop();
      }
      gPopN(9);
    }
    gPop();
  }
}

// A simple camera controller which uses an HTML element as the event
// source for constructing a view matrix. Assign an "onchange"
// function to the controller as follows to receive the updated X and
// Y angles for the camera:
//
//   var controller = new CameraController(canvas);
//   controller.onchange = function(xRot, yRot) { ... };
//
// The view matrix is computed elsewhere.
function CameraController(element) {
  var controller = this;
  this.onchange = null;
  this.xRot = 0;
  this.yRot = 0;
  this.scaleFactor = 3.0;
  this.dragging = false;
  this.curX = 0;
  this.curY = 0;

  // Assign a mouse down handler to the HTML element.
  element.onmousedown = function (ev) {
    controller.dragging = true;
    controller.curX = ev.clientX;
    controller.curY = ev.clientY;
  };

  // Assign a mouse up handler to the HTML element.
  element.onmouseup = function (ev) {
    controller.dragging = false;
  };

  // Assign a mouse move handler to the HTML element.
  element.onmousemove = function (ev) {
    if (controller.dragging) {
      // Determine how far we have moved since the last mouse move
      // event.
      var curX = ev.clientX;
      var curY = ev.clientY;
      var deltaX = (controller.curX - curX) / controller.scaleFactor;
      var deltaY = (controller.curY - curY) / controller.scaleFactor;
      controller.curX = curX;
      controller.curY = curY;
      // Update the X and Y rotation angles based on the mouse motion.
      controller.yRot = (controller.yRot + deltaX) % 360;
      controller.xRot = controller.xRot + deltaY;
      // Clamp the X rotation to prevent the camera from going upside
      // down.
      if (controller.xRot < -90) {
        controller.xRot = -90;
      } else if (controller.xRot > 90) {
        controller.xRot = 90;
      }
      // Send the onchange event to any listener.
      if (controller.onchange != null) {
        controller.onchange(controller.xRot, controller.yRot);
      }
    }
  };
}
