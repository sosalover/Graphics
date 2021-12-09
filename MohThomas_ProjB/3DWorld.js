//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
// (JT: why the numbers? counts columns, helps me keep 80-char-wide listings)
//
// Chapter 5: ColoredTriangle.js (c) 2012 matsuda  AND
// Chapter 4: RotatingTriangle_withButtons.js (c) 2012 matsuda
// became:
//
// BasicShapes.js  MODIFIED for EECS 351-1, 
//									Northwestern Univ. Jack Tumblin
//		--converted from 2D to 4D (x,y,z,w) vertices
//		--extend to other attributes: color, surface normal, etc.
//		--demonstrate how to keep & use MULTIPLE colored shapes in just one
//			Vertex Buffer Object(VBO). 
//		--create several canonical 3D shapes borrowed from 'GLUT' library:
//		--Demonstrate how to make a 'stepped spiral' tri-strip,  and use it
//			to build a cylinder, sphere, and torus.
//
// Vertex shader program----------------------------------
var VSHADER_SOURCE = 
  'uniform mat4 u_ModelMatrix;\n' +
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program----------------------------------
var FSHADER_SOURCE = 
//  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
//  '#endif GL_ES\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

// Global Variables
var ANGLE_STEP = 45.0;		// Rotation angle rate (degrees/second)
var floatsPerVertex = 7;	// # of Float32Array elements used for each vertex
													// (x,y,z,w)position + (r,g,b)color
													// Later, see if you can add:
													// (x,y,z) surface normal + (tx,ty) texture addr.
var cop_x = 0.0;
var cop_y = 6.0;
var cop_z = 1.0;
var strafe_x = 0.0;
var strafe_y = 0.0;
var strafe_z = 0.0;

var theta = 300.3;
var dtilt = 0.9;


var isDrag=false;		// mouse-drag: true when user holds down mouse button
var xMclik=0.0;			// last mouse button-down position (in CVV coords)
var yMclik=0.0;   
var xMdragTot=0.0;	// total (accumulated) mouse-drag amounts (in CVV coords).
var yMdragTot=0.0;  

var qNew = new Quaternion(0,0,0,1); // most-recent mouse drag's rotation
var qTot = new Quaternion(0,0,0,1);	// 'current' orientation (made from qNew)
var quatMatrix = new Matrix4();	

var cubeSpinAngle = 0;
var cubeSpinAngleStep = 45.0;
var Cube2Angle  = 100.0;
var C2ANGLE_STEP = 45.0;
var C3ANGLE_STEP = 45.0;
var C4ANGLE_STEP = 45.0;
var Cube3Angle = 0.0;
var Cube4Angle = 0.0;
var Cube5Angle = 0.0;
var Cube2Range = 40.0;
var Cube3Range = 60.0;
var Cube4Range = 120.0;
var wingAngle = 0.0;
var wingAngleStep = 60.0;
var defaultPerspective = true;
var rollX = 0.0;
var rollY = 0.0;
var rollZ = 1.0;
var rollStep = 0.0;
var frustL;
var frustR;
var frustT;
var frustB;
var frustNear;
var frustFar;
var flyingMode = false;
var throttle = 0.1;
var yaw = 0.0;
var pitch = 0.0;
var trueUpVec = new Vector3([0, 0, 1]);


var spaceShipLocationX = 0;
var spaceShipLocationY = 0.3;
var spaceShipLastTime = Date.now();
var legJointAngle = 0.0;
var legJointAngleRate = 160.0;
var animalMoving = false;
var animalLocation = 0;
var clawAngle = 0;
var g_angle01 = 0;                  // initial rotation angle
var g_angle01Rate = 45.0; 
var ac1ZAngle = 0;
var ac1zAngleMax = 30;

var tailAngle = 0;
var tailAngleStep = 45.0;

function main() {
//==============================================================================
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // 
  var n = initVertexBuffer(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

	// NEW!! Enable 3D depth-test when drawing: don't over-draw at any pixel 
	// unless the new Z value is closer to the eye than the old one..
//	gl.depthFunc(gl.LESS);			 // WebGL default setting: (default)
	gl.enable(gl.DEPTH_TEST); 	 
	 


  // Get handle to graphics system's storage location of u_ModelMatrix
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { 
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }
  // Create a local version of our model matrix in JavaScript 
  var modelMatrix = new Matrix4();
  
  	canvas.onmousedown	=	function(ev){myMouseDown( ev, gl, canvas) }; 
  // when user's mouse button goes down, call mouseDown() function
	canvas.onmousemove = 	function(ev){myMouseMove( ev, gl, canvas) };
						// when the mouse moves, call mouseMove() function					
	canvas.onmouseup = 		function(ev){myMouseUp(   ev, gl, canvas)};
  // Create, init current rotation angle value in JavaScript
  var currentAngle = 0.0;
  window.addEventListener("keydown", myKeyDown, false);
	// After each 'keydown' event, call the 'myKeyDown()' function.  The 'false' 
	// arg (default) ensures myKeyDown() call in 'bubbling', not 'capture' stage)
	// ( https://www.w3schools.com/jsref/met_document_addeventlistener.asp )
//-----------------  
  // Start drawing: create 'tick' variable whose value is this function:
  var tick = function() {
	rollX = animateRollX(rollX);
	rollY = animateRollY(rollY);
	rollZ = animateRollZ(rollZ);
	if (flyingMode){
			cop_x += Math.cos(theta)*throttle;
			cop_y += Math.sin(theta)*throttle;
			cop_z += (dtilt - cop_z)*throttle;
			dtilt += (dtilt - cop_z)*throttle;
			dtilt += yaw;
			theta += pitch;	
			trueUpVec.elements[0] = rollX;
			trueUpVec.elements[1] = rollY;
			trueUpVec.elements[2] = rollZ;
			trueUpVec = trueUpVec.normalize();
			
	}
	
	moveSpaceShip();
	g_angle01 = animateg(g_angle01);  // Update the rotation angle
	updateClawAngle();
	updateAC1Zangle();
	wingAngle = animateWing(wingAngle);
	cubeSpinAngle = animateSpin(cubeSpinAngle);
    currentAngle = animate(currentAngle);  // Update the rotation angle
	Cube2Angle = animateC2(Cube2Angle);
	Cube3Angle = animateC3(Cube3Angle);
	Cube4Angle = animateC4(Cube4Angle);
	tailAngle = animateTail(tailAngle);
	
	//Cube4Angle = animateC4(Cube4Angle);
	//Cube5Angle = animateC5(Cube5Angle);
		// Draw our canvas, re-sized to current browser-window 'inner' drawing area
	drawResize(gl, n, currentAngle, modelMatrix, u_ModelMatrix);  
    drawAll(gl, n, currentAngle, modelMatrix, u_ModelMatrix);   // Draw shapes
    // report current angle on console
    //console.log('currentAngle=',currentAngle);
    requestAnimationFrame(tick, canvas);   
    									// Request that the browser re-draw the webpage
  };
  tick();							// start (and continue) animation: draw current image
    
}

function initVertexBuffer(gl) {
//==============================================================================
// Create one giant vertex buffer object (VBO) that holds all vertices for all
// shapes.
 
 	// Make each 3D shape in its own array of vertices:
  makeSpaceship();
  makePyramid();
  makeDoor();
  makeCube();
  makeWorldAxes(); 
  makeHouse();
  makeGroundGrid();				// create, fill the gndVerts array
  // how many floats total needed to store all shapes?
	var mySiz = (gndVerts.length + worldVerts.length + cubeVerts.length + spaceShipVertices.length + houseVerts.length + doorVerts.length + pyramidVerts.length);					
	// How many vertices total?
	var nn = mySiz / floatsPerVertex;
	console.log('nn is', nn, 'mySiz is', mySiz, 'floatsPerVertex is', floatsPerVertex);
	// Copy all shapes into one big Float32 array:
  var colorShapes = new Float32Array(mySiz);
	// Copy them:  remember where to start for each shape:
		i = 0;
	spaceShipStart = i;
	for (j = 0; j<spaceShipVertices.length; i++, j++){
		colorShapes[i] = spaceShipVertices[j];
	}
	cubeStart = i;
	for(j=0; j<cubeVerts.length; i++, j++){
		colorShapes[i] = cubeVerts[j];
	}
		gndStart = i;						// next we'll store the ground-plane;
	for(j=0; j< gndVerts.length; i++, j++) {
		colorShapes[i] = gndVerts[j];
		}
		wrldStart = i;
	for(j=0; j<worldVerts.length; i++, j++){
		colorShapes[i] = worldVerts[j];
	}	houseStart = i;
	for(j=0; j<houseVerts.length; i++, j++){
		colorShapes[i] = houseVerts[j];
	}
		doorStart =i;
	for(j=0; j<doorVerts.length; i++, j++){
			colorShapes[i] = doorVerts[j];
	} pyramidStart = i;
	for (j=0; j<pyramidVerts.length; i++, j++){
		colorShapes[i] = pyramidVerts[j];
	}
	
	

  // Create a buffer object on the graphics hardware:
  var shapeBufferHandle = gl.createBuffer();  
  if (!shapeBufferHandle) {
    console.log('Failed to create the shape buffer object');
    return false;
  }

  // Bind the the buffer object to target:
  gl.bindBuffer(gl.ARRAY_BUFFER, shapeBufferHandle);
  // Transfer data from Javascript array colorShapes to Graphics system VBO
  // (Use sparingly--may be slow if you transfer large shapes stored in files)
  gl.bufferData(gl.ARRAY_BUFFER, colorShapes, gl.STATIC_DRAW);
    
  //Get graphics system's handle for our Vertex Shader's position-input variable: 
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

  var FSIZE = colorShapes.BYTES_PER_ELEMENT; // how many bytes per stored value?

  // Use handle to specify how to retrieve **POSITION** data from our VBO:
  gl.vertexAttribPointer(
  		a_Position, 	// choose Vertex Shader attribute to fill with data
  		4, 						// how many values? 1,2,3 or 4.  (we're using x,y,z,w)
  		gl.FLOAT, 		// data type for each value: usually gl.FLOAT
  		false, 				// did we supply fixed-point data AND it needs normalizing?
  		FSIZE * floatsPerVertex, // Stride -- how many bytes used to store each vertex?
  									// (x,y,z,w, r,g,b) * bytes/value
  		0);						// Offset -- now many bytes from START of buffer to the
  									// value we will actually use?
  gl.enableVertexAttribArray(a_Position);  
  									// Enable assignment of vertex buffer object's position data

  // Get graphics system's handle for our Vertex Shader's color-input variable;
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  // Use handle to specify how to retrieve **COLOR** data from our VBO:
  gl.vertexAttribPointer(
  	a_Color, 				// choose Vertex Shader attribute to fill with data
  	3, 							// how many values? 1,2,3 or 4. (we're using R,G,B)
  	gl.FLOAT, 			// data type for each value: usually gl.FLOAT
  	false, 					// did we supply fixed-point data AND it needs normalizing?
  	FSIZE * 7, 			// Stride -- how many bytes used to store each vertex?
  									// (x,y,z,w, r,g,b) * bytes/value
  	FSIZE * 4);			// Offset -- how many bytes from START of buffer to the
  									// value we will actually use?  Need to skip over x,y,z,w
  									
  gl.enableVertexAttribArray(a_Color);  
  									// Enable assignment of vertex buffer object's position data

	//--------------------------------DONE!
  // Unbind the buffer object 
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return nn;
}

// simple & quick-- 
// I didn't use any arguments such as color choices, # of verts,slices,bars, etc.
// YOU can improve these functions to accept useful arguments...
//
function makeWorldAxes(){
	worldVerts = new Float32Array([	 0.0,  0.0,  0.0, 1.0,		0.3,  0.3,  0.3,	// X axis line (origin: gray)
		 1.3,  0.0,  0.0, 1.0,		1.0,  0.3,  0.3,	// 						 (endpoint: red)
		 
		 0.0,  0.0,  0.0, 1.0,    0.3,  0.3,  0.3,	// Y axis line (origin: white)
		 0.0,  1.3,  0.0, 1.0,		0.3,  1.0,  0.3,	//						 (endpoint: green)

		 0.0,  0.0,  0.0, 1.0,		0.3,  0.3,  0.3,	// Z axis line (origin:white)
		 0.0,  0.0,  1.3, 1.0,		0.3,  0.3,  1.0,])	//						 (endpoint: blue)
}

function makeHouse(){
	var top = 0.5;
	var bottom = -0.5;
	var left = -0.5;
	var right = 0.5;
	var near = -0.5;
	var far = 0.5;

	houseVerts = new Float32Array([
		//Face1

		left, bottom, near,	1.0,		1.0, 0.0, 0.0,
		left, top/2, near,	1.0,		1.0, 0.0, 0.0,
		left/2, bottom, near,	1.0,	1.0, 0.0, 0.0,

		left/2, bottom, near,	1.0,	1.0, 0.0, 0.0,
		left/2, top/2, near,	1.0,	1.0, 0.0, 0.0,
		left, top/2, near,	1.0,		1.0, 0.0, 0.0,

		left, top/2, near,	1.0,		1.0, 0.0, 0.0,
		right, top, near,	1.0,		1.0, 0.0, 0.0,
		left, top, near,	1.0,		1.0, 0.0, 0.0,

		right, top/2, near,	1.0,		1.0, 0.0, 0.0,
		left, top/2, near,	1.0,		1.0, 0.0, 0.0,
		right, top, near,	1.0,		1.0, 0.0, 0.0,

		right/2, top/2, near,	1.0,	1.0, 0.0, 0.0,
		right/2, bottom, near,1.0,	1.0, 0.0, 0.0,
		right, top/2, near,	1.0,		1.0, 0.0, 0.0,

		right, bottom, near,1.0,		1.0, 0.0, 0.0,
		right, top/2, near,	1.0,		1.0, 0.0, 0.0,
		right/2, bottom, near,1.0,	1.0, 0.0, 0.0,

		//Face2
		right, bottom, near, 1.0, 		0.0, 0.0, 1.0,
		right, top, near, 1.0, 			0.0, 1.0, 1.0,
		right, bottom, far, 1.0,		0.0, 1.0, 0.0,

		right, bottom, far, 1.0,		0.0, 1.0, 0.0,
		right, top, far, 1.0, 			1.0, 0.0, 1.0,
		right, top, near, 1.0, 			0.0, 1.0, 1.0,

		//Face3
		left, bottom, far, 1.0, 		1.0, 0.0, 0.0,
		left, top, far, 1.0, 			0.0, 1.0, 1.0,
		right, bottom, far, 1.0, 		0.0, 0.0, 1.0,

		right, bottom, far, 1.0, 		0.0, 0.0, 1.0,
		right, top, far, 1.0, 			0.0, 1.0, 1.0,
		left, top, far, 1.0, 			0.0, 1.0, 1.0,

		//Face4
		left, bottom, near, 1.0, 		0.0, 0.0, 1.0,
		left, top, near, 1.0, 			0.0, 1.0, 1.0,
		left, bottom, far, 1.0,			0.0, 1.0, 0.0,

		left, bottom, far, 1.0,			0.0, 1.0, 0.0,
		left, top, far, 1.0, 			1.0, 0.0, 1.0,
		left, top, near, 1.0, 			0.0, 1.0, 1.0,

		//Face5
		right, bottom, near, 1.0, 		0.0, 0.0, 1.0,
		left, bottom, near, 1.0, 		1.0, 0.0, 0.0,
		left, bottom, far, 1.0, 		1.0, 0.0, 0.0,

		right, bottom, near, 1.0, 		0.0, 0.0, 1.0,
		right, bottom, far, 1.0, 		0.0, 0.0, 1.0,
		left, bottom, far, 1.0, 		1.0, 0.0, 0.0,

		//Face6
		right, top, near, 1.0, 		0.0, 0.0, 1.0,
		left, top, near, 1.0, 		1.0, 0.0, 0.0,
		left, top, far, 1.0, 		1.0, 0.0, 0.0,

		right, top, near, 1.0, 		0.0, 0.0, 1.0,
		right, top, far, 1.0, 		0.0, 0.0, 1.0,
		left, top, far, 1.0, 		1.0, 0.0, 0.0,]);
}
function makeDoor(){
	doorVerts = new Float32Array([
		0, 0, 0, 1, 		1, 1, 1,
		0, 0.75, 0, 1, 		1, 1, 1,
		0.5, 0.75, 0, 1,    1, 1, 1,

		0.5, 0.75, 0, 1,    1, 1, 1,
		0, 0.75, 0, 1, 		1, 1, 1,
		0.5, 0, 0, 1, 		1, 1, 1,
	]);
}
function makeCube(){
	var top = 0.5;
	var bottom = -0.5;
	var left = -0.5;
	var right = 0.5;
	var near = -0.5;
	var far = 0.5;

	cubeVerts = new Float32Array([
		//Face1
		left, bottom, near, 1.0, 		1.0, 0.0, 0.0,
		left, top, near, 1.0, 			0.0, 1.0, 1.0,
		right, bottom, near, 1.0, 		0.0, 0.0, 1.0,

		right, bottom, near, 1.0, 		0.0, 0.0, 1.0,
		right, top, near, 1.0, 			0.0, 1.0, 1.0,
		left, top, near, 1.0, 			0.0, 1.0, 1.0,

		//Face2
		right, bottom, near, 1.0, 		0.0, 0.0, 1.0,
		right, top, near, 1.0, 			0.0, 1.0, 1.0,
		right, bottom, far, 1.0,		0.0, 1.0, 0.0,

		right, bottom, far, 1.0,		0.0, 1.0, 0.0,
		right, top, far, 1.0, 			1.0, 0.0, 1.0,
		right, top, near, 1.0, 			0.0, 1.0, 1.0,

		//Face3
		left, bottom, far, 1.0, 		1.0, 0.0, 0.0,
		left, top, far, 1.0, 			0.0, 1.0, 1.0,
		right, bottom, far, 1.0, 		0.0, 0.0, 1.0,

		right, bottom, far, 1.0, 		0.0, 0.0, 1.0,
		right, top, far, 1.0, 			0.0, 1.0, 1.0,
		left, top, far, 1.0, 			0.0, 1.0, 1.0,

		//Face4
		left, bottom, near, 1.0, 		0.0, 0.0, 1.0,
		left, top, near, 1.0, 			0.0, 1.0, 1.0,
		left, bottom, far, 1.0,			0.0, 1.0, 0.0,

		left, bottom, far, 1.0,			0.0, 1.0, 0.0,
		left, top, far, 1.0, 			1.0, 0.0, 1.0,
		left, top, near, 1.0, 			0.0, 1.0, 1.0,

		//Face5
		right, bottom, near, 1.0, 		0.0, 0.0, 1.0,
		left, bottom, near, 1.0, 		1.0, 0.0, 0.0,
		left, bottom, far, 1.0, 		1.0, 0.0, 0.0,

		right, bottom, near, 1.0, 		0.0, 0.0, 1.0,
		right, bottom, far, 1.0, 		0.0, 0.0, 1.0,
		left, bottom, far, 1.0, 		1.0, 0.0, 0.0,

		//Face6
		right, top, near, 1.0, 		0.0, 0.0, 1.0,
		left, top, near, 1.0, 		1.0, 0.0, 0.0,
		left, top, far, 1.0, 		1.0, 0.0, 0.0,

		right, top, near, 1.0, 		0.0, 0.0, 1.0,
		right, top, far, 1.0, 		0.0, 0.0, 1.0,
		left, top, far, 1.0, 		1.0, 0.0, 0.0,
	]);

}

function makePyramid() {
	pyramidVerts = new Float32Array([
		0, 0, 1.0, 1.0, 			1.0, 0.0, 0.0,
		0.33, 0.33, 0.0, 1.0, 		1.0, 0.0, 0.0,
		0.33, -0.33, 0.0, 1.0,  	1.0, 0.0, 0.0,

		0, 0, 1.0, 1.0, 			1.0, 0.0, 0.0,
		0.33, -0.33, 0.0, 1.0, 		1.0, 0.0, 0.0,
		-0.33, -0.33, 0.0, 1.0,  	1.0, 0.0, 0.0,

		0, 0, 1.0, 1.0, 			1.0, 0.0, 0.0,
		-0.33, 0.33, 0.0, 1.0, 		1.0, 0.0, 0.0,
		-0.33, -0.33, 0.0, 1.0,  	1.0, 0.0, 0.0,

		0, 0, 1.0, 1.0, 			1.0, 0.0, 0.0,
		0.33, 0.33, 0.0, 1.0, 		1.0, 0.0, 0.0,
		-0.33, 0.33, 0.0, 1.0,  		1.0, 0.0, 0.0,

		0.33, -0.33, 0.0, 1.0, 		1.0, 0.0, 0.0,
		0.33, 0.33, 0.0, 1.0,  	1.0, 0.0, 0.0,
		-0.33, -0.33, 0.0, 1.0,  	1.0, 0.0, 0.0,

		-0.33, 0.33, 0.0, 1.0, 		1.0, 0.0, 0.0,
		-0.33, -0.33, 0.0, 1.0,  	1.0, 0.0, 0.0,
		0.33, 0.33, 0.0, 1.0,  	1.0, 0.0, 0.0,

	])
}


function makeCylinder() {
//==============================================================================
// Make a cylinder shape from one TRIANGLE_STRIP drawing primitive, using the
// 'stepped spiral' design described in notes.
// Cylinder center at origin, encircles z axis, radius 1, top/bottom at z= +/-1.
//
 var ctrColr = new Float32Array([0.2, 0.2, 0.2]);	// dark gray
 var topColr = new Float32Array([0.4, 0.7, 0.4]);	// light green
 var botColr = new Float32Array([0.5, 0.5, 1.0]);	// light blue
 var capVerts = 16;	// # of vertices around the topmost 'cap' of the shape
 var botRadius = 1.6;		// radius of bottom of cylinder (top always 1.0)
 
 // Create a (global) array to hold this cylinder's vertices;
 cylVerts = new Float32Array(  ((capVerts*6) -2) * floatsPerVertex);
										// # of vertices * # of elements needed to store them. 

	// Create circle-shaped top cap of cylinder at z=+1.0, radius 1.0
	// v counts vertices: j counts array elements (vertices * elements per vertex)
	for(v=1,j=0; v<2*capVerts; v++,j+=floatsPerVertex) {	
		// skip the first vertex--not needed.
		if(v%2==0)
		{				// put even# vertices at center of cylinder's top cap:
			cylVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,1,1
			cylVerts[j+1] = 0.0;	
			cylVerts[j+2] = 1.0; 
			cylVerts[j+3] = 1.0;			// r,g,b = topColr[]
			cylVerts[j+4]=ctrColr[0]; 
			cylVerts[j+5]=ctrColr[1]; 
			cylVerts[j+6]=ctrColr[2];
		}
		else { 	// put odd# vertices around the top cap's outer edge;
						// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
						// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
			cylVerts[j  ] = Math.cos(Math.PI*(v-1)/capVerts);			// x
			cylVerts[j+1] = Math.sin(Math.PI*(v-1)/capVerts);			// y
			//	(Why not 2*PI? because 0 < =v < 2*capVerts, so we
			//	 can simplify cos(2*PI * (v-1)/(2*capVerts))
			cylVerts[j+2] = 1.0;	// z
			cylVerts[j+3] = 1.0;	// w.
			// r,g,b = topColr[]
			cylVerts[j+4]=topColr[0]; 
			cylVerts[j+5]=topColr[1]; 
			cylVerts[j+6]=topColr[2];			
		}
	}
	// Create the cylinder side walls, made of 2*capVerts vertices.
	// v counts vertices within the wall; j continues to count array elements
	for(v=0; v< 2*capVerts; v++, j+=floatsPerVertex) {
		if(v%2==0)	// position all even# vertices along top cap:
		{		
				cylVerts[j  ] = Math.cos(Math.PI*(v)/capVerts);		// x
				cylVerts[j+1] = Math.sin(Math.PI*(v)/capVerts);		// y
				cylVerts[j+2] = 1.0;	// z
				cylVerts[j+3] = 1.0;	// w.
				// r,g,b = topColr[]
				cylVerts[j+4]=topColr[0]; 
				cylVerts[j+5]=topColr[1]; 
				cylVerts[j+6]=topColr[2];			
		}
		else		// position all odd# vertices along the bottom cap:
		{
				cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v-1)/capVerts);		// x
				cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);		// y
				cylVerts[j+2] =-1.0;	// z
				cylVerts[j+3] = 1.0;	// w.
				// r,g,b = topColr[]
				cylVerts[j+4]=botColr[0]; 
				cylVerts[j+5]=botColr[1]; 
				cylVerts[j+6]=botColr[2];			
		}
	}
	// Create the cylinder bottom cap, made of 2*capVerts -1 vertices.
	// v counts the vertices in the cap; j continues to count array elements
	for(v=0; v < (2*capVerts -1); v++, j+= floatsPerVertex) {
		if(v%2==0) {	// position even #'d vertices around bot cap's outer edge
			cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v)/capVerts);		// x
			cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v)/capVerts);		// y
			cylVerts[j+2] =-1.0;	// z
			cylVerts[j+3] = 1.0;	// w.
			// r,g,b = topColr[]
			cylVerts[j+4]=botColr[0]; 
			cylVerts[j+5]=botColr[1]; 
			cylVerts[j+6]=botColr[2];		
		}
		else {				// position odd#'d vertices at center of the bottom cap:
			cylVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,-1,1
			cylVerts[j+1] = 0.0;	
			cylVerts[j+2] =-1.0; 
			cylVerts[j+3] = 1.0;			// r,g,b = botColr[]
			cylVerts[j+4]=botColr[0]; 
			cylVerts[j+5]=botColr[1]; 
			cylVerts[j+6]=botColr[2];
		}
	}
}
function makeSphere() {
//==============================================================================
// Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like 
// equal-lattitude 'slices' of the sphere (bounded by planes of constant z), 
// and connect them as a 'stepped spiral' design (see makeCylinder) to build the
// sphere from one triangle strip.
  var slices = 13;		// # of slices of the sphere along the z axis. >=3 req'd
											// (choose odd # or prime# to avoid accidental symmetry)
  var sliceVerts	= 27;	// # of vertices around the top edge of the slice
											// (same number of vertices on bottom of slice, too)
  var topColr = new Float32Array([0.7, 0.7, 0.7]);	// North Pole: light gray
  var equColr = new Float32Array([0.3, 0.7, 0.3]);	// Equator:    bright green
  var botColr = new Float32Array([0.9, 0.9, 0.9]);	// South Pole: brightest gray.
  var sliceAngle = Math.PI/slices;	// lattitude angle spanned by one slice.

	// Create a (global) array to hold this sphere's vertices:
  sphVerts = new Float32Array(  ((slices * 2* sliceVerts) -2) * floatsPerVertex);
										// # of vertices * # of elements needed to store them. 
										// each slice requires 2*sliceVerts vertices except 1st and
										// last ones, which require only 2*sliceVerts-1.
										
	// Create dome-shaped top slice of sphere at z=+1
	// s counts slices; v counts vertices; 
	// j counts array elements (vertices * elements per vertex)
	var cos0 = 0.0;					// sines,cosines of slice's top, bottom edge.
	var sin0 = 0.0;
	var cos1 = 0.0;
	var sin1 = 0.0;	
	var j = 0;							// initialize our array index
	var isLast = 0;
	var isFirst = 1;
	for(s=0; s<slices; s++) {	// for each slice of the sphere,
		// find sines & cosines for top and bottom of this slice
		if(s==0) {
			isFirst = 1;	// skip 1st vertex of 1st slice.
			cos0 = 1.0; 	// initialize: start at north pole.
			sin0 = 0.0;
		}
		else {					// otherwise, new top edge == old bottom edge
			isFirst = 0;	
			cos0 = cos1;
			sin0 = sin1;
		}								// & compute sine,cosine for new bottom edge.
		cos1 = Math.cos((s+1)*sliceAngle);
		sin1 = Math.sin((s+1)*sliceAngle);
		// go around the entire slice, generating TRIANGLE_STRIP verts
		// (Note we don't initialize j; grows with each new attrib,vertex, and slice)
		if(s==slices-1) isLast=1;	// skip last vertex of last slice.
		for(v=isFirst; v< 2*sliceVerts-isLast; v++, j+=floatsPerVertex) {	
			if(v%2==0)
			{				// put even# vertices at the the slice's top edge
							// (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
							// and thus we can simplify cos(2*PI(v/2*sliceVerts))  
				sphVerts[j  ] = sin0 * Math.cos(Math.PI*(v)/sliceVerts); 	
				sphVerts[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts);	
				sphVerts[j+2] = cos0;		
				sphVerts[j+3] = 1.0;			
			}
			else { 	// put odd# vertices around the slice's lower edge;
							// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
							// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
				sphVerts[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);		// x
				sphVerts[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);		// y
				sphVerts[j+2] = cos1;																				// z
				sphVerts[j+3] = 1.0;																				// w.		
			}
			if(s==0) {	// finally, set some interesting colors for vertices:
				sphVerts[j+4]=topColr[0]; 
				sphVerts[j+5]=topColr[1]; 
				sphVerts[j+6]=topColr[2];	
				}
			else if(s==slices-1) {
				sphVerts[j+4]=botColr[0]; 
				sphVerts[j+5]=botColr[1]; 
				sphVerts[j+6]=botColr[2];	
			}
			else {
					sphVerts[j+4]=Math.random();// equColr[0]; 
					sphVerts[j+5]=Math.random();// equColr[1]; 
					sphVerts[j+6]=Math.random();// equColr[2];					
			}
		}
	}
}
function makeSpaceship(){
	var c30 = Math.sqrt(0.75);					// == cos(30deg) == sqrt(3) / 2
	var sq2	= Math.sqrt(2.0);
	var rVal = 1;
	spaceShipVertices = new Float32Array([
		// Vertex coordinates(x,y,z,w) and color (R,G,B) for a color tetrahedron:
		  //		Apex on +z axis; equilateral triangle base at z=0
	  /*	Nodes:
			   0.0,	 0.0, sq2, 1.0,			1.0, 	1.0,	1.0,	// Node 0 (apex, +z axis;  white)
		   c30, -0.5, 0.0, 1.0, 		0.0,  0.0,  1.0, 	// Node 1 (base: lower rt; red)
		   0.0,  1.0, 0.0, 1.0,  		1.0,  0.0,  0.0,	// Node 2 (base: +y axis;  grn)
		  -c30, -0.5, 0.0, 1.0, 		0.0,  1.0,  0.0, 	// Node 3 (base:lower lft; blue)
	  
	  */
				  // Face 0: (left side)  
		   0.0,	 0.0, sq2, 1.0,			1.0, 	1.0,	1.0,	// Node 0
		   c30, -0.5, 0.0, 1.0, 		0.0,  0.0,  1.0, 	// Node 1
		   0.0,  1.0, 0.0, 1.0,  		1.0,  0.0,  0.0,	// Node 2
				  // Face 1: (right side)
			   0.0,	 0.0, sq2, 1.0,			1.0, 	1.0,	1.0,	// Node 0
		   0.0,  1.0, 0.0, 1.0,  		1.0,  0.0,  0.0,	// Node 2
		  -c30, -0.5, 0.0, 1.0, 		0.0,  1.0,  0.0, 	// Node 3
			  // Face 2: (lower side)
			   0.0,	 0.0, sq2, 1.0,			1.0, 	1.0,	1.0,	// Node 0 
		  -c30, -0.5, 0.0, 1.0, 		0.0,  1.0,  0.0, 	// Node 3
		   c30, -0.5, 0.0, 1.0, 		0.0,  0.0,  1.0, 	// Node 1 
			   // Face 3: (base side)  
		  -c30, -0.5,  0.0, 1.0, 		0.0,  1.0,  0.0, 	// Node 3
		   0.0,  1.0,  0.0, 1.0,  	1.0,  0.0,  0.0,	// Node 2
		   c30, -0.5,  0.0, 1.0, 		0.0,  0.0,  1.0, 	// Node 1
		   
		   0.0, 0.0, 0.0, 1.0,			0.5, 0.5, 0.5,		// gray at origin
		   0.5, 0.0, 0.0, 1.0,     	1.0, 1.0, 0.0,	  // yellow
		   0.0, 0.5, 0.0, 1.0,			0.0, 1.0, 1.0,		// cyan
	  /*SPACESHIP BASE VERTICES*/
	  
		  -0.5/Math.sqrt(3), 0, 0.5, 1,			rVal, 0.0, 0.0, //1  #15
		  -0.5, 0, 0, 1,							0.0, 1.0, 1.0, //2
		  0, 0, 0, 1,								rVal, 1.0, 0.0, //0
	  
		  -0.5, 0, 0, 1,							rVal, 0.0, 0.0, //2
		  -0.5/Math.sqrt(3), 0,-0.5, 1,			rVal, 0.0, 0.0, //3
		  0, 0, 0, 1,								rVal, 0.0, 0.0, //0
	  
		  -0.5/Math.sqrt(3), 0,-0.5, 1,			rVal, 0.0, 0.0, //3
		  0.5/Math.sqrt(3), 0, -0.5, 1,			rVal, 0.0, 0.0, //4
		  0, 0, 0, 1,								rVal, 0.0, 0.0, //0
	  
		  0.5/Math.sqrt(3), 0, -0.5, 1,			rVal, 0.0, 0.0, //4
		  0.5, 0, 0, 1,							rVal, 0.0, 0.0, //5
		  0, 0, 0, 1,								rVal, 0.0, 0.0, //0
	  
		  0.5, 0, 0, 1,							rVal, 0.0, 0.0, //5
		  0.5/Math.sqrt(3), 0, 0.5, 1,			rVal, 0.0, 0.0, //6
		  0, 0, 0, 1,								rVal, 0.0, 0.0, //0
	  
		  0.5/Math.sqrt(3), 0, 0.5, 1,			rVal, 0.0, 0.0, //6
		  -0.5/Math.sqrt(3), 0, 0.5, 1,			rVal, 0.0, 0.0, //1
		  0, 0, 0, 1,								rVal, 0.0, 0.0, //0
	  
		  -0.5/Math.sqrt(3), 0, 0.5, 1,			rVal, 0.0, 0.0, //1
		  -0.5/Math.sqrt(3), -0.2, 0.5, 1,		rVal, 1.0, 0.0, //1d
		  -0.5, 0, 0, 1,							rVal, 0.0, 0.0, //2
	  
		  -0.5, 0, 0, 1,							rVal, 0.0, 0.0, //2
		  -0.5, -0.2, 0, 1,						rVal, 1.0, 0.0, //2d
		  -0.5/Math.sqrt(3), -0.2, 0.5, 1,		rVal, 1.0, 0.0, //1d
	  
		  -0.5, 0, 0, 1,							rVal, 0.0, 0.0, //2
		  -0.5, -0.2, 0, 1,						rVal, 1.0, 0.0, //2d
		  -0.5/Math.sqrt(3), 0,-0.5, 1,			rVal, 0.0, 0.0, //3
	  
		  -0.5/Math.sqrt(3), 0,-0.5, 1,			rVal, 0.0, 0.0, //3
		  -0.5/Math.sqrt(3), -0.2,-0.5, 1,		rVal, 1.0, 0.0, //3d
		  -0.5, -0.2, 0, 1,						rVal, 1.0, 0.0, //2d
	  
		  -0.5/Math.sqrt(3), 0,-0.5, 1,			rVal, 0.0, 0.0, //3
		  -0.5/Math.sqrt(3), -0.2,-0.5, 1,		rVal, 1.0, 0.0, //3d
		  0.5/Math.sqrt(3), 0, -0.5, 1,			rVal, 0.0, 0.0, //4
	  
		  0.5/Math.sqrt(3), 0, -0.5, 1,			rVal, 0.0, 0.0, //4
		  0.5/Math.sqrt(3), -0.2, -0.5, 1,		rVal, 1.0, 0.0, //4d
		  -0.5/Math.sqrt(3), -0.2,-0.5, 1,		rVal, 1.0, 0.0, //3d
	  
		  0.5/Math.sqrt(3), 0, -0.5, 1,			rVal, 0.0, 0.0, //4
		  0.5/Math.sqrt(3), -0.2, -0.5, 1,		rVal, 1.0, 0.0, //4d
		  0.5, 0, 0, 1,							rVal, 0.0, 1.0, //5
	  
		  0.5, 0, 0, 1,							rVal, 0.0, 0.0, //5
		  0.5, -0.2, 0, 1,						rVal, 1.0, 0.0, //5d
		  0.5/Math.sqrt(3), -0.2, -0.5, 1,		rVal, 1.0, 0.0, //4d
	  
		  0.5, 0, 0, 1,							rVal, 0.0, 0.0, //5
		  0.5, -0.2, 0, 1,						rVal, 1.0, 0.0, //5d
		  0.5/Math.sqrt(3), 0, 0.5, 1,			rVal, 0.0, 0.0, //6
	  
		  0.5/Math.sqrt(3), 0, 0.5, 1,			rVal, 0.0, 0.0, //6
		  0.5/Math.sqrt(3), -0.2, 0.5, 1,			rVal, 1.0, 0.0, //6d
		  0.5, -0.2, 0, 1,						rVal, 1.0, 0.0, //5d
	  
		  -0.5/Math.sqrt(3), 0, 0.5, 1,			rVal, 0.0, 0.0, //1
		  -0.5/Math.sqrt(3), -0.2, 0.5, 1,		rVal, 1.0, 0.0, //1d
		  0.5/Math.sqrt(3), 0, 0.5, 1,			rVal, 0.0, 0.0, //6
	  
		  0.5/Math.sqrt(3), 0, 0.5, 1,			rVal, 0.0, 0.0, //6
		  0.5/Math.sqrt(3), -0.2, 0.5, 1,			rVal, 1.0, 0.0, //6d
		  -0.5/Math.sqrt(3), -0.2, 0.5, 1,			rVal, 1.0, 0.0, //1d
	  
		  -0.5/Math.sqrt(3), 0, 0.5, 1,			rVal, 0.0, 0.0, //1
		  -0.5/Math.sqrt(3), -0.2, 0.5, 1,			rVal, 1.0, 0.0, //1d
		  .5/Math.sqrt(3), -0.2, 0.5, 1,			rVal, 1.0, 0.0, //6d			#71
	  //SPACESHIP TOP VERTICES
		  0, 0, -0.5, 1, 							0.0, 0.5, 0.5,
		  0, 0.5, -0.5, 1, 						0.0, 0.5, 0.5,
		  0.5, 0, -0.5, 1,						0.0, 0.5, 0.5,
		  0.5, 0.5, -0.5, 1, 						0.0, 0.5, 0.5,
	  
		  0, 0, 0.5, 1, 							0.0, 0.5, 0.5,
		  0, 0.5, 0.5, 1, 						0.0, 0.5, 0.5,
		  0.5, 0, 0.5, 1,							0.0, 0.5, 0.5,
		  0.5, 0.5, 0.5, 1, 						0.0, 0.5, 0.5,
	  
		  0, 0, 0.5, 1,							0.0, 0.5, 0.5,
		  0, 0.5, 0.5, 1, 						0.0, 0.5, 0.5,
		  0, 0, -0.5, 1, 							0.0, 0.5, 0.5,
		  0, 0.5, -0.5, 1, 						0.0, 0.5, 0.5,
	  
		  0, 0, 0.5, 1, 							0.0, 0.5, 0.5,
		  0, 0, -0.5, 1, 							0.0, 0.5, 0.5,
		  0.5, 0, 0.5, 1,							0.0, 0.5, 0.0,
		  0.5, 0, -0.5, 1,						0.0, 0.5, 0.5,
	  
		  0.5, 0, 0.5, 1,							0.0, 0.5, 0.5,
		  0.5, 0.5, 0.5, 1, 						0.0, 0.5, 0.5,
		  0.5, 0, -0.5, 1,						0.0, 0.5, 0.5,
		  0.5, 0.5, -0.5, 1, 						0.0, 0.5, 0.5,
	  
		  0, 0, 0.5, 1, 							0.0, 0.5, 0.5,
		  0, 0.5, -0.5, 1, 						0.0, 0.5, 0.5,
		  0.5, 0.5, 0.5, 1, 						0.0, 0.5, 0.5,
		  0.5, 0.5, -0.5, 1, 						0.0, 0.5, 0.5,
	  
		  //ABDUCTION BEAM VERTICES
		  -0.5/Math.sqrt(3), 0, 0.5, 1,			1.0, 0.0, 0.0, //1 //96
		  -0.5/Math.sqrt(3)+0.2/Math.sqrt(2), 0, 0.5-0.2/Math.sqrt(2), 1,			0.0, 1.0, 0.0, //1a
		  -0.5, 0, 0, 1,							1.0, 0.0, 1.0, //2
		  -0.3, 0, 0, 1,							0.0, 1.0, 0.0, //2a
		  -0.5/Math.sqrt(3), 0,-0.5, 1,			0.0, 1.0, 0.0, //3
		  -0.5/Math.sqrt(3)+0.2/Math.sqrt(2), 0,-0.5+0.2/Math.sqrt(2), 1,			0.0, 1.0, 0.0, //3a
		  0.5/Math.sqrt(3), 0, -0.5, 1,			0.0, 1.0, 0.0, //4
		  0.5/Math.sqrt(3)-0.2/Math.sqrt(2), 0, -0.5+0.2/Math.sqrt(2), 1,			0.0, 1.0, 0.0, //4a
		  0.5, 0, 0, 1,							0.0, 1.0, 0.0, //5
		  0.3, 0, 0, 1,							0.0, 1.0, 0.0, //5a
		  0.5/Math.sqrt(3), 0, 0.5, 1,			0.0, 1.0, 0.0, //6
		  0.5/Math.sqrt(3)-0.2/Math.sqrt(2), 0, 0.5-0.2/Math.sqrt(2), 1,			0.0, 1.0, 0.0, //6a
		  -0.5/Math.sqrt(3), 0, 0.5, 1,			0.0, 1.0, 0.0, //1
		  -0.5/Math.sqrt(3)+0.2/Math.sqrt(2), 0, 0.5-0.2/Math.sqrt(2), 1,			0.0, 1.0, 0.0, //1a //109
	  
		  //ANIMAL BODY VERTICES
		  0, 0, -0.25, 1, 						1, 0, 0, //110
		  0, 0.5, -0.25, 1, 						0.929, 0.588, 0.043,
		  0.5, 0, -0.25, 1,						0, 0, 1,
		  0.5, 0.5, -0.25, 1, 					0.929, 0.588, 0.043,
	  
		  0, 0, 0.25, 1, 							0.929, 0.588, 0.043,
		  0, 0.5, 0.25, 1, 						0.929, 0.588, 0.043,
		  0.5, 0, 0.25, 1,						0.929, 0.588, 0.043,
		  0.5, 0.5, 0.25, 1, 						0.929, 0.588, 0.043,
	  
		  0, 0, 0.25, 1,							1, 0, 0,
		  0, 0.5, 0.25, 1, 						0, 1, 0,
		  0, 0, -0.25, 1, 						0, 0, 1,
		  0, 0.5, -0.25, 1, 						1, 0, 0,
	  
		  0, 0, 0.25, 1, 							0.929, 0.588, 0.043,
		  0, 0, -0.25, 1, 						0.929, 0.588, 0.043,
		  0.5, 0, 0.25, 1,						0.929, 0.588, 0.043,
		  0.5, 0, -0.25, 1,						0.929, 0.588, 0.043,
	  
		  0.5, 0, 0.25, 1,						0.929, 0.588, 0.043,
		  0.5, 0.5, 0.25, 1, 						0.929, 0.588, 0.043,
		  0.5, 0, -0.25, 1,						0.929, 0.588, 0.043,
		  0.5, 0.5, -0.25, 1, 					0.929, 0.588, 0.043,
	  
		  0, 0, 0.25, 1, 							0.929, 0.588, 0.043,
		  0, 0.5, -0.25, 1, 						0.929, 0.588, 0.043,
		  0.5, 0.5, 0.25, 1, 						0.929, 0.588, 0.043,
		  0.5, 0.5, -0.25, 1, 					0.929, 0.588, 0.043,
		  
		  //ANIMAL HEAD
		  0, 0, 0, 1,								1,0,0, //134
		  0, 0.2, 0, 1, 							0.929, 0.588, 0.043,
		  0.4, 0, 0, 1, 							0, 0, 1,
		  
		  0, 0, -.14, 1,								1, 0, 0, //137
		  0, 0.2, -.14, 1, 							0, 1, 0,
		  0.4, 0, -.14, 1, 							0, 0, 1,
	  
		  0.4, 0, 0, 1, 								0.929, 0.588, 0.043,
		  0, 0.2, 0, 1, 								0.929, 0.588, 0.043,
		  0, 0.2, -.14, 1, 							0.929, 0.588, 0.043,
	  
		  0.4, 0, 0, 1, 								0.929, 0.588, 0.043,   //143
		  0, 0.2, -.14, 1, 							0.929, 0.588, 0.043,
		  0.4, 0, -.14, 1, 							0.929, 0.588, 0.043,
	  
		  //Continuing with spaceship
		  -.15, -.2, .15, 1, 								0.3, 0.3, 0.3, //146
		  -.15, -.2, -.15, 1, 							0.3, 0.3, 0.3,
		  .15, -.2, .15, 1, 								0.3, 0.3, 0.3,
		  .15, -.2, -.15, 1, 								0.3, 0.3, 0.3,
	  
		  -.15, -.2, .15, 1, 								0.3, 0.3, 0.3, //150
		  -.15, -.4, .15, 1, 								0.3, 0.3, 0.3, 
		  .15, -.2, .15, 1, 								0.3, 0.3, 0.3,
		  .15, -.4, .15, 1, 								0.3, 0.3, 0.3,
	  
		  .15, -.2, -.15, 1, 								0.3, 0.3, 0.3, //154
		  .15, -.2, .15, 1, 								0.3, 0.3, 0.3,
		  .15, -.4, -.15, 1, 								0.3, 0.3, 0.3,
		  .15, -.4, .15, 1, 								0.3, 0.3, 0.3,
	  
		  -.15, -.4, -.15, 1, 							0.3, 0.3, 0.3, //158
		  -.15, -.2, -.15, 1, 							0.3, 0.3, 0.3,
		  .15, -.4, -.15, 1, 								0.3, 0.3, 0.3,
		  .15, -.2, -.15, 1, 								0.3, 0.3, 0.3,
	  
		  -.15, -.4, -.15, 1, 							0.3, 0.3, 0.3, //162
		  -.15, -.2, -.15, 1, 							0.3, 0.3, 0.3,
		  -.15, -.4, .15, 1, 								0.3, 0.3, 0.3,
		  -.15, -.2, .15, 1, 								0.3, 0.3, 0.3,
	  
		  -.15, -.4, -.15, 1, 							0.3, 0.3, 0.3, //166
		  -.15, -.4, .15, 1, 								0.3, 0.3, 0.3, 
		  .15, -.4, .15, 1, 								0.3, 0.3, 0.3,
		  .15, -.4, -.15, 1, 								0.3, 0.3, 0.3,
	  
	  //Creating arm component 1.
		  -.10, -.2, .10, 1, 								1.0, 0.0, 0.0, //170
		  -.10, -.2, -.10, 1, 							0.0, 1.0, 0.0,
		  .10, -.2, .10, 1, 								0.0, 0.0, 1.0,
		  .10, -.2, -.10, 1, 								1.0, 0.0, 0.0,
	  
		  -.10, -.2, .10, 1, 								0.0, 1.0, 0.0, //174
		  -.10, -.6, .10, 1, 								0.0, 0.0, 1.0,
		  .10, -.2, .10, 1, 								1.0, 0.0, 0.0,
		  .10, -.6, .10, 1, 								0.0, 1.0, 0.0,
	  
		  .10, -.2, -.10, 1, 								0.0, 0.0, 1.0, //178
		  .10, -.2, .10, 1, 								1.0, 0.0, 0.0,
		  .10, -.6, -.10, 1, 								0.0, 1.0, 0.0,
		  .10, -.6, .10, 1, 								0.0, 0.0, 1.0,
	  
		  -.10, -.6, -.10, 1, 							1.0, 0.0, 0.0, //182
		  -.10, -.2, -.10, 1, 							0.0, 1.0, 0.0,
		  .10, -.6, -.10, 1, 								0.0, 0.0, 1.0,
		  .10, -.2, -.10, 1, 								1.0, 0.0, 0.0,
	  
		  -.10, -.6, -.10, 1, 							0.0, 1.0, 0.0, //186
		  -.10, -.2, -.10, 1, 							0.0, 0.0, 1.0,
		  -.10, -.6, .10, 1, 								1.0, 0.0, 0.0,
		  -.10, -.2, .10, 1, 								0.0, 1.0, 0.0,
	  
		  -.10, -.6, -.10, 1, 							0.0, 0.0, 1.0, //190
		  -.10, -.6, .10, 1, 								1.0, 0.0, 0.0, 
		  .10, -.6, .10, 1, 								0.0, 1.0, 0.0,
		  .10, -.6, -.10, 1, 								0.0, 0.0, 1.0,
		  //Creating ac2
	  
		  0, 0, 0, 1,									1, 0, 0, //194
		  0, 0.2, 0, 1, 								0, 1, 0,
		  0.4, 0, 0, 1, 								0, 0, 1,
		  
		  0, 0, -.14, 1,								1, 0, 0, //197
		  0, 0.2, -.14, 1, 							1, 0, 0,
		  0.4, 0, -.14, 1, 							1, 0, 0,
	  
		  0.4, 0, 0, 1, 								1, 0, 0,
		  0, 0.2, 0, 1, 								1, 0, 0,
		  0, 0.2, -.14, 1, 							1, 0, 0,
	  
		  0.4, 0, 0, 1, 								1, 0, 0,   //203
		  0, 0.2, -.14, 1, 							1, 0, 0,
		  0.4, 0, -.14, 1, 							1, 0, 0,
	  
		  0, 0, 0, 1,									1, 0, 0, //206
		  0.4, 0, 0, 1, 								1, 0, 0,
		  0, 0, -.14, 1,								1, 0, 0,
		  0.4, 0, -.14, 1, 							1, 0, 0,
	  
		  //REDESIGNING TOP OF SPACESHIP
	  
		  0, 1, 0, 1, 								1,0, 0, //210
		  0, 0, 1, 1,									0, 0, 1,
		  0.5877, 0, 0.809, 1,						0, 1, 0,
		  0.809,0,  0.5877, 1,						0.1, 0.3, 0.7,
		  0.809,0,  -0.5877, 1,						0.1, 0.3, 0.7,
		  0.5877,0,  -0.809, 1, 						0.1, 0.3, 0.7,
		  0,0, -1,	1,								0.1, 0.3, 0.7,
		  -.5877, 0, -.809, 1, 						0.1, 0.3, 0.7,
		  -.809, 0, -.5877, 1, 						0.1, 0.3, 0.7,
		  -1, 0, 0, 1,								0.1, 0.3, 0.7,
		  -.809, 0, .5877, 1, 						0.1, 0.3, 0.7,
		  -.5877, 0, .809, 1, 						0.1, 0.3, 0.7,
		  0, 0, 1, 1,									1,0, 0,
	  
		  //Green base
		  //223
		  -0.5/Math.sqrt(3), 0, 0.5, 1,			0.0, 1.0, 0.0, //1  #15
		  -0.5, 0, 0, 1,							0.0, 1.0, 1.0, //2
		  0, 0, 0, 1,								0.0, 1.0, 0.0, //0
	  
		  -0.5, 0, 0, 1,							0.0, 1.0, 0.0, //2
		  -0.5/Math.sqrt(3), 0,-0.5, 1,			0.0, 1.0, 0.0, //3
		  0, 0, 0, 1,								0.0, 1.0, 0.0, //0
	  
		  -0.5/Math.sqrt(3), 0,-0.5, 1,			0.0, 1.0, 0.0, //3
		  0.5/Math.sqrt(3), 0, -0.5, 1,			0.0, 1.0, 0.0, //4
		  0, 0, 0, 1,								0.0, 1.0, 0.0, //0
	  
		  0.5/Math.sqrt(3), 0, -0.5, 1,			0.0, 1.0, 0.0, //4
		  0.5, 0, 0, 1,							0.0, 1.0, 0.0, //5
		  0, 0, 0, 1,								0.0, 1.0, 0.0, //0
	  
		  0.5, 0, 0, 1,							0.0, 1.0, 0.0, //5
		  0.5/Math.sqrt(3), 0, 0.5, 1,			0.0, 1.0, 0.0, //6
		  0, 0, 0, 1,								0.0, 1.0, 0.0, //0
	  
		  0.5/Math.sqrt(3), 0, 0.5, 1,			0.0, 1.0, 0.0, //6
		  -0.5/Math.sqrt(3), 0, 0.5, 1,			0.0, 1.0, 0.0, //1
		  0, 0, 0, 1,								0.0, 1.0, 0.0, //0
	  
		  -0.5/Math.sqrt(3), 0, 0.5, 1,			0.0, 1.0, 0.0, //1
		  -0.5/Math.sqrt(3), -0.2, 0.5, 1,		0.0, 1.0, 0.0, //1d
		  -0.5, 0, 0, 1,							0.0, 1.0, 0.0, //2
	  
		  -0.5, 0, 0, 1,							0.0, 1.0, 0.0, //2
		  -0.5, -0.2, 0, 1,						0.0, 1.0, 0.0, //2d
		  -0.5/Math.sqrt(3), -0.2, 0.5, 1,		0.0, 1.0, 0.0, //1d
	  
		  -0.5, 0, 0, 1,							0.0, 1.0, 0.0, //2
		  -0.5, -0.2, 0, 1,						0.0, 1.0, 0.0, //2d
		  -0.5/Math.sqrt(3), 0,-0.5, 1,			0.0, 1.0, 0.0, //3
	  
		  -0.5/Math.sqrt(3), 0,-0.5, 1,			0.0, 1.0, 0.0, //3
		  -0.5/Math.sqrt(3), -0.2,-0.5, 1,		0.0, 1.0, 0.0, //3d
		  -0.5, -0.2, 0, 1,						0.0, 1.0, 0.0, //2d
	  
		  -0.5/Math.sqrt(3), 0,-0.5, 1,			0.0, 1.0, 0.0, //3
		  -0.5/Math.sqrt(3), -0.2,-0.5, 1,		0.0, 1.0, 0.0, //3d
		  0.5/Math.sqrt(3), 0, -0.5, 1,			0.0, 1.0, 0.0, //4
	  
		  0.5/Math.sqrt(3), 0, -0.5, 1,			0.0, 1.0, 0.0, //4
		  0.5/Math.sqrt(3), -0.2, -0.5, 1,		0.0, 1.0, 0.0, //4d
		  -0.5/Math.sqrt(3), -0.2,-0.5, 1,		0.0, 1.0, 0.0, //3d
	  
		  0.5/Math.sqrt(3), 0, -0.5, 1,			1.0, 1.0, 0.0, //4
		  0.5/Math.sqrt(3), -0.2, -0.5, 1,		0.0, 1.0, 0.0, //4d
		  0.5, 0, 0, 1,							0.0, 0.0, 1.0, //5
	  
		  0.5, 0, 0, 1,							0.0, 1.0, 0.0, //5
		  0.5, -0.2, 0, 1,						0.0, 1.0, 0.0, //5d
		  0.5/Math.sqrt(3), -0.2, -0.5, 1,		0.0, 1.0, 0.0, //4d
	  
		  0.5, 0, 0, 1,							0.0, 1.0, 0.0, //5
		  0.5, -0.2, 0, 1,						0.0, 1.0, 0.0, //5d
		  0.5/Math.sqrt(3), 0, 0.5, 1,			0.0, 1.0, 0.0, //6
	  
		  0.5/Math.sqrt(3), 0, 0.5, 1,			0.0, 1.0, 0.0, //6
		  0.5/Math.sqrt(3), -0.2, 0.5, 1,			0.0, 1.0, 0.0, //6d
		  0.5, -0.2, 0, 1,						0.0, 1.0, 0.0, //5d
	  
		  -0.5/Math.sqrt(3), 0, 0.5, 1,			0.0, 1.0, 0.0, //1
		  -0.5/Math.sqrt(3), -0.2, 0.5, 1,		0.0, 1.0, 0.0, //1d
		  0.5/Math.sqrt(3), 0, 0.5, 1,			0, 1.0, 0.0, //6
	  
		  0.5/Math.sqrt(3), 0, 0.5, 1,			0, 1.0, 0.0, //6
		  0.5/Math.sqrt(3), -0.2, 0.5, 1,			0, 1.0, 0.0, //6d
		  -0.5/Math.sqrt(3), -0.2, 0.5, 1,		0, 1.0, 0.0, //1d
	  
		  -0.5/Math.sqrt(3), 0, 0.5, 1,			1.0, 1.0, 0.0, //1
		  -0.5/Math.sqrt(3), -0.2, 0.5, 1,		0, 1.0, 0.0, //1d
		  .5/Math.sqrt(3), -0.2, 0.5, 1,			0, 1.0, 1.0, //6d
	  
		  
	  
		]);
}
function makeTorus() {
//==============================================================================
// 		Create a torus centered at the origin that circles the z axis.  
// Terminology: imagine a torus as a flexible, cylinder-shaped bar or rod bent 
// into a circle around the z-axis. The bent bar's centerline forms a circle
// entirely in the z=0 plane, centered at the origin, with radius 'rbend'.  The 
// bent-bar circle begins at (rbend,0,0), increases in +y direction to circle  
// around the z-axis in counter-clockwise (CCW) direction, consistent with our
// right-handed coordinate system.
// 		This bent bar forms a torus because the bar itself has a circular cross-
// section with radius 'rbar' and angle 'phi'. We measure phi in CCW direction 
// around the bar's centerline, circling right-handed along the direction 
// forward from the bar's start at theta=0 towards its end at theta=2PI.
// 		THUS theta=0, phi=0 selects the torus surface point (rbend+rbar,0,0);
// a slight increase in phi moves that point in -z direction and a slight
// increase in theta moves that point in the +y direction.  
// To construct the torus, begin with the circle at the start of the bar:
//					xc = rbend + rbar*cos(phi); 
//					yc = 0; 
//					zc = -rbar*sin(phi);			(note negative sin(); right-handed phi)
// and then rotate this circle around the z-axis by angle theta:
//					x = xc*cos(theta) - yc*sin(theta) 	
//					y = xc*sin(theta) + yc*cos(theta)
//					z = zc
// Simplify: yc==0, so
//					x = (rbend + rbar*cos(phi))*cos(theta)
//					y = (rbend + rbar*cos(phi))*sin(theta) 
//					z = -rbar*sin(phi)
// To construct a torus from a single triangle-strip, make a 'stepped spiral' 
// along the length of the bent bar; successive rings of constant-theta, using 
// the same design used for cylinder walls in 'makeCyl()' and for 'slices' in 
// makeSphere().  Unlike the cylinder and sphere, we have no 'special case' 
// for the first and last of these bar-encircling rings.
//
var rbend = 1.0;										// Radius of circle formed by torus' bent bar
var rbar = 0.5;											// radius of the bar we bent to form torus
var barSlices = 23;									// # of bar-segments in the torus: >=3 req'd;
																		// more segments for more-circular torus
var barSides = 13;										// # of sides of the bar (and thus the 
																		// number of vertices in its cross-section)
																		// >=3 req'd;
																		// more sides for more-circular cross-section
// for nice-looking torus with approx square facets, 
//			--choose odd or prime#  for barSides, and
//			--choose pdd or prime# for barSlices of approx. barSides *(rbend/rbar)
// EXAMPLE: rbend = 1, rbar = 0.5, barSlices =23, barSides = 11.

	// Create a (global) array to hold this torus's vertices:
 torVerts = new Float32Array(floatsPerVertex*(2*barSides*barSlices +2));
//	Each slice requires 2*barSides vertices, but 1st slice will skip its first 
// triangle and last slice will skip its last triangle. To 'close' the torus,
// repeat the first 2 vertices at the end of the triangle-strip.  Assume 7

var phi=0, theta=0;										// begin torus at angles 0,0
var thetaStep = 2*Math.PI/barSlices;	// theta angle between each bar segment
var phiHalfStep = Math.PI/barSides;		// half-phi angle between each side of bar
																			// (WHY HALF? 2 vertices per step in phi)
	// s counts slices of the bar; v counts vertices within one slice; j counts
	// array elements (Float32) (vertices*#attribs/vertex) put in torVerts array.
	for(s=0,j=0; s<barSlices; s++) {		// for each 'slice' or 'ring' of the torus:
		for(v=0; v< 2*barSides; v++, j+=7) {		// for each vertex in this slice:
			if(v%2==0)	{	// even #'d vertices at bottom of slice,
				torVerts[j  ] = (rbend + rbar*Math.cos((v)*phiHalfStep)) * 
																						 Math.cos((s)*thetaStep);
							  //	x = (rbend + rbar*cos(phi)) * cos(theta)
				torVerts[j+1] = (rbend + rbar*Math.cos((v)*phiHalfStep)) *
																						 Math.sin((s)*thetaStep);
								//  y = (rbend + rbar*cos(phi)) * sin(theta) 
				torVerts[j+2] = -rbar*Math.sin((v)*phiHalfStep);
								//  z = -rbar  *   sin(phi)
				torVerts[j+3] = 1.0;		// w
			}
			else {				// odd #'d vertices at top of slice (s+1);
										// at same phi used at bottom of slice (v-1)
				torVerts[j  ] = (rbend + rbar*Math.cos((v-1)*phiHalfStep)) * 
																						 Math.cos((s+1)*thetaStep);
							  //	x = (rbend + rbar*cos(phi)) * cos(theta)
				torVerts[j+1] = (rbend + rbar*Math.cos((v-1)*phiHalfStep)) *
																						 Math.sin((s+1)*thetaStep);
								//  y = (rbend + rbar*cos(phi)) * sin(theta) 
				torVerts[j+2] = -rbar*Math.sin((v-1)*phiHalfStep);
								//  z = -rbar  *   sin(phi)
				torVerts[j+3] = 1.0;		// w
			}
			torVerts[j+4] = Math.random();		// random color 0.0 <= R < 1.0
			torVerts[j+5] = Math.random();		// random color 0.0 <= G < 1.0
			torVerts[j+6] = Math.random();		// random color 0.0 <= B < 1.0
		}
	}
	// Repeat the 1st 2 vertices of the triangle strip to complete the torus:
			torVerts[j  ] = rbend + rbar;	// copy vertex zero;
						  //	x = (rbend + rbar*cos(phi==0)) * cos(theta==0)
			torVerts[j+1] = 0.0;
							//  y = (rbend + rbar*cos(phi==0)) * sin(theta==0) 
			torVerts[j+2] = 0.0;
							//  z = -rbar  *   sin(phi==0)
			torVerts[j+3] = 1.0;		// w
			torVerts[j+4] = Math.random();		// random color 0.0 <= R < 1.0
			torVerts[j+5] = Math.random();		// random color 0.0 <= G < 1.0
			torVerts[j+6] = Math.random();		// random color 0.0 <= B < 1.0
			j+=7; // go to next vertex:
			torVerts[j  ] = (rbend + rbar) * Math.cos(thetaStep);
						  //	x = (rbend + rbar*cos(phi==0)) * cos(theta==thetaStep)
			torVerts[j+1] = (rbend + rbar) * Math.sin(thetaStep);
							//  y = (rbend + rbar*cos(phi==0)) * sin(theta==thetaStep) 
			torVerts[j+2] = 0.0;
							//  z = -rbar  *   sin(phi==0)
			torVerts[j+3] = 1.0;		// w
			torVerts[j+4] = Math.random();		// random color 0.0 <= R < 1.0
			torVerts[j+5] = Math.random();		// random color 0.0 <= G < 1.0
			torVerts[j+6] = Math.random();		// random color 0.0 <= B < 1.0
}

function makeGroundGrid() {
//==============================================================================
// Create a list of vertices that create a large grid of lines in the x,y plane
// centered at x=y=z=0.  Draw this shape using the GL_LINES primitive.

	var xcount = 1000;			// # of lines to draw in x,y to make the grid.
	var ycount = 1000;		
	var xymax	= 500.0;			// grid size; extends to cover +/-xymax in x and y.
 	var xColr = new Float32Array([0.0, 0.5, 0.3]);	// bright yellow
 	var yColr = new Float32Array([0.5, 0.3, 0.3]);	// bright green.
 	
	// Create an (global) array to hold this ground-plane's vertices:
	gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
						// draw a grid made of xcount+ycount lines; 2 vertices per line.
						
	var xgap = xymax/(xcount-1);		// HALF-spacing between lines in x,y;
	var ygap = xymax/(ycount-1);		// (why half? because v==(0line number/2))
	
	// First, step thru x values as we make vertical lines of constant-x:
	for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
		if(v%2==0) {	// put even-numbered vertices at (xnow, -xymax, 0)
			gndVerts[j  ] = -xymax + (v  )*xgap;	// x
			gndVerts[j+1] = -xymax;								// y
			gndVerts[j+2] = 0.0;									// z
			gndVerts[j+3] = 1.0;									// w.
		}
		else {				// put odd-numbered vertices at (xnow, +xymax, 0).
			gndVerts[j  ] = -xymax + (v-1)*xgap;	// x
			gndVerts[j+1] = xymax;								// y
			gndVerts[j+2] = 0.0;									// z
			gndVerts[j+3] = 1.0;									// w.
		}
		gndVerts[j+4] = xColr[0];			// red
		gndVerts[j+5] = xColr[1];			// grn
		gndVerts[j+6] = xColr[2];			// blu
	}
	// Second, step thru y values as wqe make horizontal lines of constant-y:
	// (don't re-initialize j--we're adding more vertices to the array)
	for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
		if(v%2==0) {		// put even-numbered vertices at (-xymax, ynow, 0)
			gndVerts[j  ] = -xymax;								// x
			gndVerts[j+1] = -xymax + (v  )*ygap;	// y
			gndVerts[j+2] = 0.0;									// z
			gndVerts[j+3] = 1.0;									// w.
		}
		else {					// put odd-numbered vertices at (+xymax, ynow, 0).
			gndVerts[j  ] = xymax;								// x
			gndVerts[j+1] = -xymax + (v-1)*ygap;	// y
			gndVerts[j+2] = 0.0;									// z
			gndVerts[j+3] = 1.0;									// w.
		}
		gndVerts[j+4] = yColr[0];			// red
		gndVerts[j+5] = yColr[1];			// grn
		gndVerts[j+6] = yColr[2];			// blu
	}
}
function myKeyDown(kev){
	var aimVec1 = new Vector3([Math.cos(theta), Math.sin(theta), dtilt - cop_z]);
	var upVec1 = new Vector3([0, 0, 1]);
	var perpVec1 = aimVec1.cross(upVec1)
	switch(kev.code) {
		case "KeyA":
			if (!flyingMode){
			cop_x -= perpVec1.elements[0]*0.1;
			cop_y -= perpVec1.elements[1]*0.1;}
			if (flyingMode){
				rollStep += 0.01;
			}
			break;
		case "KeyD":
			if (!flyingMode){
			cop_x += perpVec1.elements[0]*0.1;
			cop_y += perpVec1.elements[1]*0.1;}
			if (flyingMode){
				rollStep -= 0.01;
			}
			break;
		case "KeyS":
			if (!flyingMode){
			cop_x -= Math.cos(theta)*0.1;
			cop_y -= Math.sin(theta)*0.1;
			cop_z -= (dtilt - cop_z)*0.1;
			dtilt -= (dtilt - cop_z)*0.1;}
			if (flyingMode){
				throttle -= 0.05;
			}
			break;
		case "KeyW":	
		if (!flyingMode){
			cop_x += Math.cos(theta)*0.1;
			cop_y += Math.sin(theta)*0.1;
			cop_z += (dtilt - cop_z)*0.1;
			dtilt += (dtilt - cop_z)*0.1;}
		if (flyingMode){
			throttle += 0.05;
		}
			break;
		case "KeyO":
			break;
    	case "KeyL":
			break;
		
		//----------------Arrow keys------------------------
		case "ArrowLeft": 	
			if (!flyingMode) theta += 0.1;
			if (flyingMode) pitch +=0.005;
			break;
		case "ArrowRight":
			if (!flyingMode) theta -=0.1;
			if (flyingMode) pitch -= 0.005;
  			break;
		case "ArrowUp":		
			if (!flyingMode) dtilt += 0.1;
			if (flyingMode){
				yaw += 0.005;
			}
  			break;
		case "ArrowDown":
			if (!flyingMode) dtilt -= 0.1;
			if (flyingMode){
				yaw -= 0.005;
			}
			break;	
	 	default:
      		break;
	}
}
function drawAll(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
//==============================================================================
  // Clear <canvas>  colors AND the depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  var canvas = document.getElementById('webgl');
  modelMatrix.setIdentity();    // DEFINE 'world-space' coords.
  gl.viewport(0,0, canvas.width/2,canvas.height);			
  var vpAspect = canvas.width/2 /(canvas.height);	

// STEP 2: add in a 'perspective()' function call here to define 'camera lens':
if (defaultPerspective){  
modelMatrix.perspective(	35.0,   // FOVY: top-to-bottom vertical image angle, in degrees
                            vpAspect,   // Image Aspect Ratio: camera lens width/height
                           	1.0,   // camera z-near distance (always positive; frustum begins at z = -znear)
                        	1000.0); } // camera z-far distance (always positive; frustum ends at z = -zfar)
else {
	modelMatrix.frustum(frustL, frustR, frustB, frustT, frustNear, frustFar);
}

  modelMatrix.lookAt( cop_x, cop_y, cop_z,	// center of projection
					  cop_x + Math.cos(theta), cop_y + Math.sin(theta),  dtilt,	// look-at point 
					  trueUpVec.elements[0], trueUpVec.elements[1], trueUpVec.elements[2]);	// View UP vector.
  drawWorld (gl, n, currentAngle, modelMatrix, u_ModelMatrix);
  

  modelMatrix.setIdentity();
  gl.viewport(canvas.width/2,											// Viewport lower-left corner
	0, 			// location(in pixels)
  	canvas.width/2, 				// viewport width,
 	 canvas.height);			// viewport height in pixels.
  modelMatrix.ortho(-333*vpAspect/200,333*vpAspect/200,-333.0/200,333.0/200,1.0,1000.0);
  modelMatrix.lookAt( cop_x, cop_y, cop_z,	// center of projection
	cop_x + Math.cos(theta), cop_y + Math.sin(theta), dtilt,	// look-at point 
	trueUpVec.elements[0], trueUpVec.elements[1], trueUpVec.elements[2]);	// View UP vector.	// View UP vector.
  drawWorld(gl, n, currentAngle, modelMatrix, u_ModelMatrix);

}
function drawWorld(gl, n, currentAngle, modelMatrix, u_ModelMatrix){
	
	pushMatrix(modelMatrix);  // SAVE world drawing coords.
		//---------Draw Ground Plane, without spinning.
		// position it.
		modelMatrix.translate( 0.4, -0.4, 0.0);	
		modelMatrix.scale(0.1, 0.1, 0.1);				// shrink by 10X:

		// Drawing:
		// Pass our current matrix to the vertex shaders:
		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
		// Draw just the ground-plane's vertices
		gl.drawArrays(gl.LINES, 								// use this drawing primitive, and
								gndStart/floatsPerVertex,	// start at this vertex number, and
								gndVerts.length/floatsPerVertex);	// draw this many vertices.
														
	modelMatrix = popMatrix();  // RESTORE 'world' drawing coords.
	
	//bird
	pushMatrix(modelMatrix);
			modelMatrix.translate(2.5,-2,1);
			
			modelMatrix.rotate(90, 1, 0, 0);
			modelMatrix.rotate(115, 0, 1, 0);
			modelMatrix.scale(0.4, 0.4, .8);
			gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
			gl.drawArrays(gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
			pushMatrix(modelMatrix);
				modelMatrix.translate(0, 0, 0.60);
				modelMatrix.scale(0.5, 0.5, 0.25);
				gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
				gl.drawArrays(gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
			modelMatrix = popMatrix();
			pushMatrix(modelMatrix);
				modelMatrix.translate(0.4, 0, 0.3);
				modelMatrix.scale(1.5, 0.5, 0.25);
				modelMatrix.rotate(-20, 0, 1, 0);
				modelMatrix.rotate(wingAngle, 0, 1, 0);
				modelMatrix.translate(0.6, 0, -0.4);
				gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
				gl.drawArrays(gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
			modelMatrix = popMatrix();
			pushMatrix(modelMatrix);
				modelMatrix.translate(-0.4, 0, 0.3);
				modelMatrix.scale(1.5, 0.5, 0.25);
				modelMatrix.rotate(20, 0, 1, 0);
				modelMatrix.rotate(-wingAngle, 0, 1, 0);
				modelMatrix.translate(-0.6, 0, -0.4);
				gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
				gl.drawArrays(gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
			modelMatrix = popMatrix();
			pushMatrix(modelMatrix);
				modelMatrix.translate(-.3, 0, -0.9);
				modelMatrix.scale(0.5, 0.5, 0.5);gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
				gl.drawArrays(gl.TRIANGLES, pyramidStart/floatsPerVertex, pyramidVerts.length/floatsPerVertex);
			modelMatrix = popMatrix();
			pushMatrix(modelMatrix);
				modelMatrix.translate(.3, 0, -0.9);
				modelMatrix.scale(0.5, 0.5, 0.5);gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
				gl.drawArrays(gl.TRIANGLES, pyramidStart/floatsPerVertex, pyramidVerts.length/floatsPerVertex);
			modelMatrix = popMatrix();
	modelMatrix = popMatrix();



	pushMatrix(modelMatrix);
		
		modelMatrix.translate(3, 0, 0.5);
		modelMatrix.scale(0.5, 0.5, 0.5);
		modelMatrix.rotate(90, 1, 0, 0);
		quatMatrix.setFromQuat(qTot.x, -qTot.y, qTot.z, qTot.w);	// Quaternion-->Matrix
		modelMatrix.concat(quatMatrix);	// apply that matrix
		
		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
		gl.drawArrays (gl.TRIANGLES, houseStart/floatsPerVertex, houseVerts.length/floatsPerVertex);
		gl.drawArrays(gl.LINES,wrldStart/floatsPerVertex,worldVerts.length/floatsPerVertex);
		pushMatrix(modelMatrix);
			
		
			modelMatrix.translate(-0.25, -0.5, -.5);
			modelMatrix.rotate(Cube2Angle, 0, 1, 0);
			gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
			gl.drawArrays(gl.TRIANGLES, doorStart/floatsPerVertex, doorVerts.length/floatsPerVertex);
		modelMatrix = popMatrix();
	modelMatrix = popMatrix();
	
	pushMatrix(modelMatrix);
		modelMatrix.scale(1,1,1);
		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
		
		gl.drawArrays(gl.LINES,wrldStart/floatsPerVertex,worldVerts.length/floatsPerVertex);
	modelMatrix = popMatrix();
			//dog
	
	pushMatrix(modelMatrix);
		modelMatrix.translate(1.5, 1.5, 0.25);
		modelMatrix.scale(0.5, 0.25, 0.25);	
		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
		gl.drawArrays(gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
		pushMatrix(modelMatrix);
			modelMatrix.translate(-0.5, 0, 0);
			modelMatrix.scale(0.5, 0.5, 0.5);
			modelMatrix.rotate(90, 0, 1, 0);
			modelMatrix.rotate(tailAngle, 1, 0.25, 0);
			modelMatrix.translate(0, 0, -1.0);
			gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
			gl.drawArrays(gl.TRIANGLES, pyramidStart/floatsPerVertex, pyramidVerts.length/floatsPerVertex);
		modelMatrix = popMatrix();
		pushMatrix(modelMatrix);
			modelMatrix.translate(0.5, 0, 0.77);
			modelMatrix.scale(0.25, 1, 0.5);
			gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
			gl.drawArrays(gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
		modelMatrix = popMatrix();
		pushMatrix(modelMatrix);
			modelMatrix.translate(0.3, 0.23, -0.7);
			modelMatrix.scale(0.25, 0.25, 0.4);
			gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
			gl.drawArrays(gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
		modelMatrix = popMatrix();
		pushMatrix(modelMatrix);
			modelMatrix.translate(0.3, -0.23, -0.7);
			modelMatrix.scale(0.25, 0.25, 0.4);
			gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
			gl.drawArrays(gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
		modelMatrix = popMatrix();
		pushMatrix(modelMatrix);
			modelMatrix.translate(-0.3, -0.23, -0.7);
			modelMatrix.scale(0.25, 0.25, 0.4);
			gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
			gl.drawArrays(gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
		modelMatrix = popMatrix();
		pushMatrix(modelMatrix);
			modelMatrix.translate(-0.3, 0.23, -0.7);
			modelMatrix.scale(0.25, 0.25, 0.4);
			gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
			gl.drawArrays(gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
		modelMatrix = popMatrix();
	modelMatrix = popMatrix();
	pushMatrix(modelMatrix);
			modelMatrix.translate(0.5,0.5,1.0);
			modelMatrix.scale(0.5, 0.5, -0.5);
			modelMatrix.rotate(cubeSpinAngle, 0, 0, 1);
			gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
			gl.drawArrays (gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
			pushMatrix(modelMatrix);
				modelMatrix.translate(-0.5,0,.5)
				modelMatrix.scale(0.5, 0.5, 0.5);
				modelMatrix.rotate(Cube2Angle, 0, 1, 0);
				modelMatrix.translate(-0.5,0,-0.5);
				gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
				gl.drawArrays (gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
				pushMatrix(modelMatrix);
					modelMatrix.translate(-0.5,0,-.5)
					modelMatrix.scale(0.5, 0.5, 0.5);
					modelMatrix.rotate(Cube3Angle, 0, 1, 0);
					modelMatrix.translate(-0.5,0,-0.5);
					gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
					gl.drawArrays (gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
					pushMatrix(modelMatrix);
						modelMatrix.translate(-0.5,0,-.5);
						modelMatrix.scale(0.5, 0.5, 0.5);
						modelMatrix.rotate(Cube4Angle, 0, 1, 0);
						modelMatrix.translate(-0.5,0,-0.5);
						gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
						gl.drawArrays (gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
					modelMatrix = popMatrix();	
				modelMatrix = popMatrix();	
			modelMatrix = popMatrix();
			

			pushMatrix(modelMatrix);
				modelMatrix.translate(0.5,0,.5)
				modelMatrix.scale(0.5, 0.5, 0.5);
				modelMatrix.rotate(Cube2Angle+90, 0, -1, 0);
				modelMatrix.translate(-0.5,0,-0.5);
				gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
				gl.drawArrays (gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
				pushMatrix(modelMatrix);
					modelMatrix.translate(-0.5,0,-.5)
					modelMatrix.scale(0.5, 0.5, 0.5);
					modelMatrix.rotate(Cube3Angle, 0, -1, 0);
					modelMatrix.translate(-0.5,0,-0.5);
					gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
					gl.drawArrays (gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
					pushMatrix(modelMatrix);
						modelMatrix.translate(-0.5,0,-.5);
						modelMatrix.scale(0.5, 0.5, 0.5);
						modelMatrix.rotate(Cube4Angle, 0, -1, 0);
						modelMatrix.translate(-0.5,0,-0.5);
						gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
						gl.drawArrays (gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
					modelMatrix = popMatrix();	
				modelMatrix = popMatrix();	
			modelMatrix = popMatrix();

			pushMatrix(modelMatrix);
			modelMatrix.translate(0,-0.5,.5)
			modelMatrix.scale(0.5, 0.5, 0.5);
			modelMatrix.rotate(Cube2Angle, 1, 0, 0);
			modelMatrix.translate(0,0.5,0.5);
			gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
			gl.drawArrays (gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
			pushMatrix(modelMatrix);
				modelMatrix.translate(0,0.5,.5)
				modelMatrix.scale(0.5, 0.5, 0.5);
				modelMatrix.rotate(Cube3Angle, 1, 0, 0);
				modelMatrix.translate(0,0.5,0.5);
				gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
				gl.drawArrays (gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
				pushMatrix(modelMatrix);
					modelMatrix.translate(0,0.5,.5)
					modelMatrix.scale(0.5, 0.5, 0.5);
					modelMatrix.rotate(Cube4Angle, 1, 0, 0);
					modelMatrix.translate(0,0.5,0.5);
					gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
					gl.drawArrays (gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
				modelMatrix = popMatrix();	
			modelMatrix = popMatrix();	
		modelMatrix = popMatrix();
			
	modelMatrix = popMatrix();
	
	pushMatrix(modelMatrix);
		modelMatrix.translate(0.5, -3.0, 1.0);
		modelMatrix.rotate(90,1,0,0);
		
		drawSpaceShipBase(modelMatrix, gl, u_ModelMatrix);
		drawSpaceShipTop(modelMatrix, gl, u_ModelMatrix);
		/*
		drawArmComponent1(modelMatrix, gl, u_ModelMatrix);
		drawArmComponent2a(modelMatrix, gl, u_ModelMatrix);
		drawArmComponent2b(modelMatrix, gl, u_ModelMatrix);
		drawArmComponent2c(modelMatrix, gl, u_ModelMatrix);
		drawArmComponent2d(modelMatrix, gl, u_ModelMatrix);*/
		//drawAbductionBeams(modelMatrix, gl, u_ModelMatrix);
	modelMatrix = popMatrix();
}


function drawSpaceShipBase(modelMatrix, gl, u_ModelMatrix){
	pushMatrix(modelMatrix);
		modelMatrix.translate(spaceShipLocationX, spaceShipLocationY, 0);
		modelMatrix.rotate(15, -1, 0, 0);
		modelMatrix.rotate(g_angle01, 0, 1, 0);  // Make new drawing axes that
		modelMatrix.scale(0.7, 0.7, 0.7);
  			gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
			gl.drawArrays(gl.TRIANGLES, 15, 18);
			gl.drawArrays(gl.TRIANGLES, 33, 36);
			gl.drawArrays(gl.TRIANGLE_STRIP, 146, 4);
			gl.drawArrays(gl.TRIANGLE_STRIP, 150, 4);
			gl.drawArrays(gl.TRIANGLE_STRIP, 154, 4);
			gl.drawArrays(gl.TRIANGLE_STRIP, 158, 4);
			gl.drawArrays(gl.TRIANGLE_STRIP, 162, 4);
			gl.drawArrays(gl.TRIANGLE_STRIP, 166, 4);
	modelMatrix = popMatrix();
}
function drawSpaceShipTop(modelMatrix, gl, u_ModelMatrix){
	pushMatrix(modelMatrix);
		modelMatrix.scale(0.4, 0.4, 0.4);
		modelMatrix.rotate(-g_angle01*5, 0, 1, 0);  // Make new drawing axes that
		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
		gl.drawArrays(gl.TRIANGLE_FAN, 210, 13);
	modelMatrix = popMatrix();
	
}
function drawArmComponent1(modelMatrix, gl, u_ModelMatrix){
	
	pushMatrix(modelMatrix);
		modelMatrix.scale(1, 1.25, 1);
		modelMatrix.translate(0, 0, 0);
		modelMatrix.rotate(ac1ZAngle, 0, 0, 1);
		
			gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
			gl.drawArrays(gl.TRIANGLE_STRIP, 170, 4);
			gl.drawArrays(gl.TRIANGLE_STRIP, 174, 4);
			gl.drawArrays(gl.TRIANGLE_STRIP, 178, 4);
			gl.drawArrays(gl.TRIANGLE_STRIP, 182, 4);
			gl.drawArrays(gl.TRIANGLE_STRIP, 186, 4);
			gl.drawArrays(gl.TRIANGLE_STRIP, 190, 4);
	modelMatrix = popMatrix();
}

function drawArmComponent2a(modelMatrix, gl, u_ModelMatrix){
	pushMatrix(modelMatrix);
		modelMatrix.rotate(270,0,0,1);
		modelMatrix.translate(.58,.07,0.07);
		modelMatrix.rotate(clawAngle, 0, 0, 1);
		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
		gl.drawArrays(gl.TRIANGLE_STRIP, 194, 16);
	modelMatrix = popMatrix();
}
function drawArmComponent2b(modelMatrix, gl, u_ModelMatrix){
	pushMatrix(modelMatrix);
		modelMatrix.rotate(270,0,0,1);
		modelMatrix.translate(.58,-0.07,0.07);
		modelMatrix.rotate(90, 1, 0, 0);
		modelMatrix.rotate(clawAngle, 0, 0, 1);
		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
		gl.drawArrays(gl.TRIANGLE_STRIP, 194, 16);
	modelMatrix = popMatrix();
}
function drawArmComponent2c(modelMatrix, gl, u_ModelMatrix){
	pushMatrix(modelMatrix);
		modelMatrix.rotate(270,0,0,1);
		modelMatrix.translate(.58,0.07,-0.07);
		modelMatrix.rotate(270, 1, 0, 0);
		modelMatrix.rotate(clawAngle, 0, 0, 1);
		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
		gl.drawArrays(gl.TRIANGLE_STRIP, 194, 16);
	modelMatrix = popMatrix();
}
function drawArmComponent2d(modelMatrix, gl, u_ModelMatrix){
	pushMatrix(modelMatrix);
		modelMatrix.rotate(270,0,0,1);
		modelMatrix.translate(.58,-0.07,-.07);
		modelMatrix.rotate(180, 1, 0, 0);
		modelMatrix.rotate(clawAngle, 0, 0, 1);
		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
		gl.drawArrays(gl.TRIANGLE_STRIP, 194, 16);
	modelMatrix = popMatrix();
}
function drawAbudctionBeam(scale, y, modelMatrix, gl, u_ModelMatrix){
	pushMatrix(modelMatrix);
		modelMatrix.translate(0, y, 0);
		modelMatrix.scale(scale, scale, scale)
		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
		gl.drawArrays(gl.TRIANGLE_STRIP, 96, 12);
		gl.drawArrays(gl.TRIANGLE_STRIP, 106, 4);
	modelMatrix = popMatrix();
}
function drawAbductionBeams(modelMatrix, gl, u_ModelMatrix){
	if ((g_angle01 > 0 )&& (g_angle01 < 30) || (g_angle01 >90 && g_angle01 < 120 ) || (g_angle01 >-180 && g_angle01 < -150 ) || (g_angle01 >-90 && g_angle01 < -60 )) {
		drawAbudctionBeam(1, -.3, modelMatrix, gl, u_ModelMatrix);}
		if ((g_angle01 > 30 && g_angle01 < 60) || (g_angle01 >120 && g_angle01 < 150 ) || (g_angle01 >-150 && g_angle01 < -120 ) || (g_angle01 >-60 && g_angle01 < -30 )){
		drawAbudctionBeam(0.75, -.6, modelMatrix, gl, u_ModelMatrix);}
		if ((g_angle01 > 60 && g_angle01 < 90) || (g_angle01 >150 && g_angle01 < 180 ) || (g_angle01 >-120 && g_angle01 < -90) || (g_angle01 >-30 && g_angle01 < 0 )){
		drawAbudctionBeam(0.5, -0.9, modelMatrix, gl, u_ModelMatrix);}
}
function drawResize(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
	//==============================================================================
	// Called when user re-sizes their browser window , because our HTML file
	// contains:  <body onload="main()" onresize="winResize()">
	
		//Report our current browser-window contents:
		var g_canvas = document.getElementById('webgl');
																	// http://www.w3schools.com/jsref/obj_window.asp
	
		
		//Make canvas fill the top 3/4 of our browser window:
		var xtraMargin = 16;    // keep a margin (otherwise, browser adds scroll-bars)
		g_canvas.width = innerWidth - xtraMargin;
		g_canvas.height = (innerHeight*3/4) - xtraMargin;
		// IMPORTANT!  Need a fresh drawing in the re-sized viewports.
		drawAll(gl, n, currentAngle, modelMatrix, u_ModelMatrix);				// draw in all viewports.
	}

// Last time that this function was called:  (used for animation timing)
g_last0 = Date.now();
function animateSpin(angle) {
	//==============================================================================
	  // Calculate the elapsed time
	  var now = Date.now();
	  var elapsed = now - g_last0;
	  g_last0 = now;    
	  // Update the current rotation angle (adjusted by the elapsed time)
	  //  limit the angle to move smoothly between +20 and -85 degrees:
	//  if(angle >  120.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
	//  if(angle < -120.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;
	  
	  var newAngle = angle + (cubeSpinAngleStep * elapsed) / 1000.0;
	  return newAngle %= 360;
	}
var g_last = Date.now();


function animate(angle) {
//==============================================================================
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;    
  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +20 and -85 degrees:
//  if(angle >  120.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
//  if(angle < -120.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;
  
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}
g_last1 = Date.now();
function animateC2(angle){
	var now = Date.now();
  	var elapsed = now - g_last1;
  	g_last1 = now;    
  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +20 and -85 degrees:
 if(angle >  20+Cube2Range && C2ANGLE_STEP > 0) C2ANGLE_STEP = -C2ANGLE_STEP;
if(angle < 20-Cube2Range && C2ANGLE_STEP < 0) C2ANGLE_STEP = -C2ANGLE_STEP;
  
  var newAngle = angle + (C2ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}
g_last2 = Date.now();
function animateC3(angle){
	var now = Date.now();
  	var elapsed = now - g_last2;
  	g_last2 = now;    
  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +20 and -85 degrees:
 if(angle > 50+Cube3Range && C3ANGLE_STEP > 0) C3ANGLE_STEP = -C3ANGLE_STEP;
 if(angle < 50-Cube3Range && C3ANGLE_STEP < 0) C3ANGLE_STEP = -C3ANGLE_STEP;
  
  var newAngle = angle + (C3ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}
g_last3 = Date.now();
function animateC4(angle){
	var now = Date.now();
  	var elapsed = now - g_last3;
  	g_last3 = now;    
  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +20 and -85 degrees:
 if(angle > -20 + Cube4Range && C4ANGLE_STEP > 0) C4ANGLE_STEP = -C4ANGLE_STEP;
 if(angle < -20 - Cube4Range && C4ANGLE_STEP < 0) C4ANGLE_STEP = -C4ANGLE_STEP;
  
  var newAngle = angle + (C4ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}
g_lastTail = Date.now();
function animateTail(angle){
	var now = Date.now();
	var elapsed = now - g_lastTail;
	g_lastTail = now;    
// Update the current rotation angle (adjusted by the elapsed time)
//  limit the angle to move smoothly between +20 and -85 degrees:
if(angle > 50 && tailAngleStep > 0) tailAngleStep = -tailAngleStep;
if(angle < -50  && tailAngleStep < 0) tailAngleStep = -tailAngleStep;

var newAngle = angle + (tailAngleStep * elapsed) / 1000.0;
return newAngle %= 360;
}
g_last_wing = Date.now();
function animateWing(angle){
	var now = Date.now();
	var elapsed = now - g_last_wing;
	g_last_wing = now;    
// Update the current rotation angle (adjusted by the elapsed time)
//  limit the angle to move smoothly between +20 and -85 degrees:
if(angle > 70 && wingAngleStep > 0) wingAngleStep = -wingAngleStep;
if(angle < -20  && wingAngleStep < 0) wingAngleStep = -wingAngleStep;

var newAngle = angle + (wingAngleStep * elapsed) / 1000.0;
return newAngle %= 360;
}
function animateRollX(rX){
	var newRX = rX += rollStep;
	
	return newRX;
}
function animateRollY(rY){
	var newRY = rY += rollStep;
	
	return newRY;
}
function animateRollZ(rZ){
	var newRZ = rZ -= rollStep;
	
	return newRZ;
}
var xstep = 0.003;
var ystep = 0.003;
function moveSpaceShip(){
	
	spaceShipLocationX += xstep;
	spaceShipLocationY += ystep;
	if (spaceShipLocationX > 0.45){
		xstep = -xstep;
	}else if(spaceShipLocationX < -0.45){
		
		xstep = -xstep;
	}
	if (spaceShipLocationY > 0.45){
	
		ystep = -ystep;
	}else if(spaceShipLocationY < -0.45){
		
		ystep = -ystep;
	}
}
var zAngleStep = 0.1;


function updateAC1Zangle(){
	ac1ZAngle += zAngleStep;
	if (ac1ZAngle > ac1zAngleMax || ac1ZAngle < -ac1zAngleMax){
		zAngleStep = -zAngleStep
	}
}
var clawAngleStep = 0.7;
var angleMultiple = 1;
function updateClawAngle(){
	
	
	clawAngle += clawAngleStep *angleMultiple;
	if (clawAngle > 40 || clawAngle < 0){
		angleMultiple = -angleMultiple;
	}
	
}
g_last_g = Date.now();
function animateg(angle) {
	//==============================================================================
	  // Calculate the elapsed time
	  var now = Date.now();
	  var elapsed = now - g_last_g;
	  g_last_g = now;
	  
	  // Update the current rotation angle (adjusted by the elapsed time)
	  //  limit the angle to move smoothly between +120 and -85 degrees:
	//  if(angle >  120.0 && g_angle01Rate > 0) g_angle01Rate = -g_angle01Rate;
	//  if(angle <  -85.0 && g_angle01Rate < 0) g_angle01Rate = -g_angle01Rate;
	  
	  var newAngle = angle + (g_angle01Rate * elapsed) / 1000.0;
	  if(newAngle > 180.0) newAngle = newAngle - 360.0;
	  if(newAngle <-180.0) newAngle = newAngle + 360.0;
	  return newAngle;
	}

//==================HTML Button Callbacks
function Cube2AngleSubmit() {
	// Read HTML edit-box contents:
		var UsrTxt = document.getElementById('Cube2Angle').value;	
	  	Cube2Range = parseFloat(UsrTxt);     // convert string to float number 
	};
function Cube3AngleSubmit() {
		// Read HTML edit-box contents:
		var UsrTxt = document.getElementById('Cube3Angle').value;	
		Cube3Range = parseFloat(UsrTxt);     // convert string to float number 
};
function Cube4AngleSubmit() {
	// Read HTML edit-box contents:
		var UsrTxt = document.getElementById('Cube4Angle').value;	
		Cube4Range = parseFloat(UsrTxt);     // convert string to float number 
};
function NewPerspectiveSubmit(){
	var UsrTxt = document.getElementById('FrustLeft').value;
	frustL = parseFloat(UsrTxt);

	var UsrTxt = document.getElementById('FrustRight').value;
	frustR = parseFloat(UsrTxt);

	var UsrTxt = document.getElementById('FrustBottom').value;
	frustB = parseFloat(UsrTxt);

	var UsrTxt = document.getElementById('FrustTop').value;
	frustT= parseFloat(UsrTxt);

	var UsrTxt = document.getElementById('FrustNear').value;
	frustNear = parseFloat(UsrTxt);

	var UsrTxt = document.getElementById('FrustFar').value;
	frustFar = parseFloat(UsrTxt);

	defaultPerspective = false;
}
function fly(){
	flyingMode = true;
}
function stopFly(){
	flyingMode = false;
	trueUpVec = new Vector3([0, 0, 1]);
}
function Revert(){
	defaultPerspective = true;
}
function myMouseDown(ev, gl, canvas) {
	//==============================================================================
	// Called when user PRESSES down any mouse button;
	// 									(Which button?    console.log('ev.button='+ev.button);   )
	// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
	//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  
	
	// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
	  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
	  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	  var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
	//  console.log('myMouseDown(pixel coords): xp,yp=\t',xp,',\t',yp);
	  
		// Convert to Canonical View Volume (CVV) coordinates too:
	  var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
							   (canvas.width/2);			// normalize canvas to -1 <= x < +1,
		var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
								 (canvas.height/2);
	//	console.log('myMouseDown(CVV coords  ):  x, y=\t',x,',\t',y);
		
		isDrag = true;											// set our mouse-dragging flag
		xMclik = x;													// record where mouse-dragging began
		yMclik = y;
	};
	
	
	function myMouseMove(ev, gl, canvas) {
	//==============================================================================
	// Called when user MOVES the mouse with a button already pressed down.
	// 									(Which button?   console.log('ev.button='+ev.button);    )
	// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
	//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  
	
		if(isDrag==false) return;				// IGNORE all mouse-moves except 'dragging'
	
		// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
	  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
	  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
		var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
	//  console.log('myMouseMove(pixel coords): xp,yp=\t',xp,',\t',yp);
	  
		// Convert to Canonical View Volume (CVV) coordinates too:
	  var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
							   (canvas.width/2);			// normalize canvas to -1 <= x < +1,
		var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
								 (canvas.height/2);
	
		// find how far we dragged the mouse:
		xMdragTot += (x - xMclik);					// Accumulate change-in-mouse-position,&
		yMdragTot += (y - yMclik);
		// AND use any mouse-dragging we found to update quaternions qNew and qTot.
		dragQuat(x - xMclik, y - yMclik);
		
		xMclik = x;													// Make NEXT drag-measurement from here.
		yMclik = y;
		
		// Show it on our webpage, in the <div> element named 'MouseText':	
	};
	
	function myMouseUp(ev, gl, canvas) {
	//==============================================================================
	// Called when user RELEASES mouse button pressed previously.
	// 									(Which button?   console.log('ev.button='+ev.button);    )
	// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
	//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  
	
	// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
	  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
	  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
		var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
	//  console.log('myMouseUp  (pixel coords): xp,yp=\t',xp,',\t',yp);
	  
		// Convert to Canonical View Volume (CVV) coordinates too:
	  var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
							   (canvas.width/2);			// normalize canvas to -1 <= x < +1,
		var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
								 (canvas.height/2);
	//	console.log('myMouseUp  (CVV coords  ):  x, y=\t',x,',\t',y);
		
		isDrag = false;											// CLEAR our mouse-dragging flag, and
		// accumulate any final bit of mouse-dragging we did:
		xMdragTot += (x - xMclik);
		yMdragTot += (y - yMclik);
	//	console.log('myMouseUp: xMdragTot,yMdragTot =',xMdragTot,',\t',yMdragTot);
	
		// AND use any mouse-dragging we found to update quaternions qNew and qTot;
		dragQuat(x - xMclik, y - yMclik);
	
		// Show it on our webpage, in the <div> element named 'MouseText':
			
	};
	
	function dragQuat(xdrag, ydrag) {
	//==============================================================================
	// Called when user drags mouse by 'xdrag,ydrag' as measured in CVV coords.
	// We find a rotation axis perpendicular to the drag direction, and convert the 
	// drag distance to an angular rotation amount, and use both to set the value of 
	// the quaternion qNew.  We then combine this new rotation with the current 
	// rotation stored in quaternion 'qTot' by quaternion multiply.  Note the 
	// 'draw()' function converts this current 'qTot' quaternion to a rotation 
	// matrix for drawing. 
		var res = 5;
		var qTmp = new Quaternion(0,0,0,1);
		
		var dist = Math.sqrt(xdrag*xdrag + ydrag*ydrag);
		
		/*var aimVec = new Vector3([Math.cos(theta), Math.sin(theta), dtilt-cop_z]);
		var tempZVec = new Vector3([Math.cos(theta+Math.PI/2), Math.sin(theta+Math.PI/2), 0])
		var upVec = aimVec.cross(tempZVec).normalize();
		var newX_axis = (aimVec.cross(upVec)).normalize();*/
		//console.log("aimVec: ", aimVec);
		//console.log("newX axis: ", newX_axis);
		
		/*var realDrag = new Vector3([xdrag*newX_axis.elements[0] + ydrag*upVec.elements[0], 
			xdrag*newX_axis.elements[1] + ydrag*upVec.elements[1], 
			xdrag*newX_axis.elements[2] + ydrag*upVec.elements[2]]);
		//console.log(realDrag);
		var newRotation = realDrag.cross(aimVec);*/
		//console.log(newRotation);
		// console.log('xdrag,ydrag=',xdrag.toFixed(5),ydrag.toFixed(5),'dist=',dist.toFixed(5));
		qNew.setFromAxisAngle(-ydrag + 0.0001, xdrag + 0.0001, 0.0, dist*150.0);
		//qNew.setFromAxisAngle(newRotation.elements[0] + 0.0001, newRotation.elements[1] + 0.0001, newRotation.elements[2] + 0.0001, dist*150.0);
		// (why add tiny 0.0001? To ensure we never have a zero-length rotation axis)
								// why axis (x,y,z) = (-yMdrag,+xMdrag,0)? 
								// -- to rotate around +x axis, drag mouse in -y direction.
								// -- to rotate around +y axis, drag mouse in +x direction.
								
		qTmp.multiply(qNew,qTot);			// apply new rotation to current rotation. 
		//--------------------------
		// IMPORTANT! Why qNew*qTot instead of qTot*qNew? (Try it!)
		// ANSWER: Because 'duality' governs ALL transformations, not just matrices. 
		// If we multiplied in (qTot*qNew) order, we would rotate the drawing axes
		// first by qTot, and then by qNew--we would apply mouse-dragging rotations
		// to already-rotated drawing axes.  Instead, we wish to apply the mouse-drag
		// rotations FIRST, before we apply rotations from all the previous dragging.
		//------------------------
		// IMPORTANT!  Both qTot and qNew are unit-length quaternions, but we store 
		// them with finite precision. While the product of two (EXACTLY) unit-length
		// quaternions will always be another unit-length quaternion, the qTmp length
		// may drift away from 1.0 if we repeat this quaternion multiply many times.
		// A non-unit-length quaternion won't work with our quaternion-to-matrix fcn.
		// Matrix4.prototype.setFromQuat().
	//	qTmp.normalize();						// normalize to ensure we stay at length==1.0.
		qTot.copy(qTmp);
		// show the new quaternion qTot on our webpage in the <div> element 'QuatValue'
		
	};
 