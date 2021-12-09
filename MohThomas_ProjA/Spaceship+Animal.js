
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
// =========================
// Use globals to avoid needlessly complex & tiresome function argument lists,
// and for user-adjustable controls.
// For example, the WebGL rendering context 'gl' gets used in almost every fcn;
// requiring 'gl' as an argument won't give us any added 'encapsulation'; make
// it global.  Later, if the # of global vars grows too large, we can put them 
// into one (or just a few) sensible global objects for better modularity.
//------------For WebGL-----------------------------------------------
var gl;           // webGL Rendering Context. Set in main(), used everywhere.
var g_canvas = document.getElementById('webgl');     
                  // our HTML-5 canvas object that uses 'gl' for drawing.
                  
// ----------For tetrahedron & its matrix---------------------------------
var g_vertsMax = 0;                 // number of vertices held in the VBO 
                                    // (global: replaces local 'n' variable)
var g_modelMatrix = new Matrix4();  // Construct 4x4 matrix; contents get sent
                                    // to the GPU/Shaders as a 'uniform' var.
var g_modelMatLoc;                  // that uniform's location in the GPU

//------------For Animation---------------------------------------------
var g_isRun = true;                 // run/stop for animation; used in tick().
var g_lastMS = Date.now();    			// Timestamp for most-recently-drawn image; 
                                    // in milliseconds; used by 'animate()' fcn 
                                    // (now called 'timerAll()' ) to find time
                                    // elapsed since last on-screen image.
var g_angle01 = 0;                  // initial rotation angle
var g_angle01Rate = 45.0;           // rotation speed, in degrees/second 

//------------For mouse click-and-drag: -------------------------------
var g_isDrag=false;		// mouse-drag: true when user holds down mouse button
var g_xMclik=0.0;			// last mouse button-down position (in CVV coords)
var g_yMclik=0.0;   
var g_xMdragTot=0.0;	// total (accumulated) mouse-drag amounts (in CVV coords).
var g_yMdragTot=0.0; 
var g_digits=5;			// DIAGNOSTICS: # of digits to print in console.log (
									//    console.log('xVal:', xVal.toFixed(g_digits)); // print 5 digits
var g_matrixStack = []; // Array for storing matrices

var spaceShipLocationX = 0;
var spaceShipLocationY = 0.3;
var spaceShipLastTime = Date.now();
var legJointAngle = 0.0;
var legJointAngleRate = 160.0;
var animalMoving = false;
var animalLocation = 0;
var clawAngle = 0;

var rVal = 1;
var ac1ZAngle = 0;
var ac1zAngleMax = 30;
var dragAnimal = false;

var redColor = true;
var greenColor = false;
var blueColor = false;

var go = true;
function pushMatrix(m) { // Store the specified matrix
	var m2 = new Matrix4(m);
	g_matrixStack.push(m2);
}
									 
function popMatrix() { // Retrieve a matrix from the array
	return g_matrixStack.pop();
}

function main() {
//==============================================================================
/*REPLACED THIS: 
// Retrieve <canvas> element:
 var canvas = document.getElementById('webgl'); 
//with global variable 'g_canvas' declared & set above.
*/
  
  // Get gl, the rendering context for WebGL, from our 'g_canvas' object
  gl = getWebGLContext(g_canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Initialize a Vertex Buffer in the graphics system to hold our vertices
  g_maxVerts = initVertexBuffer(gl);  
  if (g_maxVerts < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

	// Register the Keyboard & Mouse Event-handlers------------------------------
	// When users move, click or drag the mouse and when they press a key on the 
	// keyboard the operating system create a simple text-based 'event' message.
	// Your Javascript program can respond to 'events' if you:
	// a) tell JavaScript to 'listen' for each event that should trigger an
	//   action within your program: call the 'addEventListener()' function, and 
	// b) write your own 'event-handler' function for each of the user-triggered 
	//    actions; Javascript's 'event-listener' will call your 'event-handler'
	//		function each time it 'hears' the triggering event from users.
	//
  // KEYBOARD:
  // The 'keyDown' and 'keyUp' events respond to ALL keys on the keyboard,
  //      including shift,alt,ctrl,arrow, pgUp, pgDn,f1,f2...f12 etc. 
	window.addEventListener("keydown", myKeyDown, false);
	// After each 'keydown' event, call the 'myKeyDown()' function.  The 'false' 
	// arg (default) ensures myKeyDown() call in 'bubbling', not 'capture' stage)
	// ( https://www.w3schools.com/jsref/met_document_addeventlistener.asp )
	window.addEventListener("keyup", myKeyUp, false);
	// Called when user RELEASES the key.  Now rarely used...

	// MOUSE:
	// Create 'event listeners' for a few vital mouse events 
	// (others events are available too... google it!).  
	window.addEventListener("mousedown", myMouseDown); 
	// (After each 'mousedown' event, browser calls the myMouseDown() fcn.)
  window.addEventListener("mousemove", myMouseMove); 
	window.addEventListener("mouseup", myMouseUp);	
	window.addEventListener("click", myMouseClick);				
	window.addEventListener("dblclick", myMouseDblClick); 
	// Note that these 'event listeners' will respond to mouse click/drag 
	// ANYWHERE, as long as you begin in the browser window 'client area'.  
	// You can also make 'event listeners' that respond ONLY within an HTML-5 
	// element or division. For example, to 'listen' for 'mouse click' only
	// within the HTML-5 canvas where we draw our WebGL results, try:
	// g_canvasID.addEventListener("click", myCanvasClick);
  //
	// Wait wait wait -- these 'mouse listeners' just NAME the function called 
	// when the event occurs!   How do the functions get data about the event?
	//  ANSWER1:----- Look it up:
	//    All mouse-event handlers receive one unified 'mouse event' object:
	//	  https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
	//  ANSWER2:----- Investigate:
	// 		All Javascript functions have a built-in local variable/object named 
	//    'argument'.  It holds an array of all values (if any) found in within
	//	   the parintheses used in the function call.
  //     DETAILS:  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments
	// END Keyboard & Mouse Event-Handlers---------------------------------------
	
  // Specify the color for clearing <canvas>
  gl.clearColor(0.3, 0.3, 0.3, 1.0);

	// NEW!! Enable 3D depth-test when drawing: don't over-draw at any pixel 
	// unless the new Z value is closer to the eye than the old one..
	gl.depthFunc(gl.LESS);
	gl.enable(gl.DEPTH_TEST); 	  
	
  // Get handle to graphics system's storage location of u_ModelMatrix
  g_modelMatLoc = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!g_modelMatLoc) { 
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }
/* REPLACED by global var 'g_ModelMatrix' (declared, constructed at top)
  // Create a local version of our model matrix in JavaScript 
  var modelMatrix = new Matrix4();
*/
/* REPLACED by global g_angle01 variable (declared at top)
  // Create, init current rotation angle value in JavaScript
  var currentAngle = 0.0;
*/

  // ANIMATION: create 'tick' variable whose value is this function:
  //----------------- 
  var tick = function() {
    if (go){
	g_angle01 = animate(g_angle01);  // Update the rotation angle
	moveSpaceShip();
	updateAC1Zangle();
	updateClawAngle();}
	drawAll();   // Draw all parts
//    console.log('g_angle01=',g_angle01.toFixed(g_digits)); // put text in console.

//	Show some always-changing text in the webpage :  
//		--find the HTML element called 'CurAngleDisplay' in our HTML page,
//			 	(a <div> element placed just after our WebGL 'canvas' element)
// 				and replace it's internal HTML commands (if any) with some
//				on-screen text that reports our current angle value:
//		--HINT: don't confuse 'getElementByID() and 'getElementById()
		document.getElementById('CurAngleDisplay').innerHTML= 
			'Flex Angle of Entire Claw = '+ac1zAngleMax.toFixed(g_digits);
		// Also display our current mouse-dragging state:
		
		//--------------------------------
    requestAnimationFrame(tick, g_canvas);   
    									// Request that the browser re-draw the webpage
    									// (causes webpage to endlessly re-draw itself)
  };
  tick();							// start (and continue) animation: draw current image
	
}

function initVertexBuffer() {
//==============================================================================
// NOTE!  'gl' is now a global variable -- no longer needed as fcn argument!

	var c30 = Math.sqrt(0.75);					// == cos(30deg) == sqrt(3) / 2
	var sq2	= Math.sqrt(2.0);
				 

  var colorShapes = new Float32Array([
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
  g_vertsMax = 66;		// 12 tetrahedron vertices.
  								// we can also draw any subset of these we wish,
  								// such as the last 3 vertices.(onscreen at upper right)
	
  // Create a buffer object
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

  var FSIZE = colorShapes.BYTES_PER_ELEMENT; // how many bytes per stored value?
    
  //Get graphics system's handle for our Vertex Shader's position-input variable: 
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Use handle to specify how to retrieve position data from our VBO:
  gl.vertexAttribPointer(
  		a_Position, 	// choose Vertex Shader attribute to fill with data
  		4, 						// how many values? 1,2,3 or 4.  (we're using x,y,z,w)
  		gl.FLOAT, 		// data type for each value: usually gl.FLOAT
  		false, 				// did we supply fixed-point data AND it needs normalizing?
  		FSIZE * 7, 		// Stride -- how many bytes used to store each vertex?
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
  // Use handle to specify how to retrieve color data from our VBO:
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

/* REMOVED -- global 'g_vertsMax' means we don't need it anymore
  return nn;
*/
}
function drawSpaceShipBase(){
	pushMatrix(g_modelMatrix);
	
	g_modelMatrix.translate(spaceShipLocationX, spaceShipLocationY, 0);
	g_modelMatrix.rotate(15, -1, 0, 0);
	g_modelMatrix.rotate(g_angle01, 0, 1, 0);  // Make new drawing axes that
	g_modelMatrix.scale(0.7, 0.7, 0.7);
	pushMatrix(g_modelMatrix);
  	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
  	if(redColor){
		gl.drawArrays(gl.TRIANGLES, 15, 18);
		gl.drawArrays(gl.TRIANGLES, 33, 36);
	}else if(greenColor){
		gl.drawArrays(gl.TRIANGLES, 223, 18);
		gl.drawArrays(gl.TRIANGLES, 241, 36);
	}
	gl.drawArrays(gl.TRIANGLE_STRIP, 146, 4);
	gl.drawArrays(gl.TRIANGLE_STRIP, 150, 4);
	gl.drawArrays(gl.TRIANGLE_STRIP, 154, 4);
	gl.drawArrays(gl.TRIANGLE_STRIP, 158, 4);
	gl.drawArrays(gl.TRIANGLE_STRIP, 162, 4);
	gl.drawArrays(gl.TRIANGLE_STRIP, 166, 4);
	g_modelMatrix = popMatrix();
}
function drawSpaceShipTop(){
	pushMatrix(g_modelMatrix);
	g_modelMatrix.scale(0.4, 0.4, 0.4);
	g_modelMatrix.rotate(-g_angle01*5, 0, 1, 0);  // Make new drawing axes that
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_FAN, 210, 13);
	g_modelMatrix = popMatrix();
	
}
function drawArmComponent1(){
	
	pushMatrix(g_modelMatrix);
	g_modelMatrix.scale(1, 1.25, 1);
	g_modelMatrix.translate(0, 0, 0);
	g_modelMatrix.rotate(ac1ZAngle, 0, 0, 1);
	pushMatrix(g_modelMatrix);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP, 170, 4);
	gl.drawArrays(gl.TRIANGLE_STRIP, 174, 4);
	gl.drawArrays(gl.TRIANGLE_STRIP, 178, 4);
	gl.drawArrays(gl.TRIANGLE_STRIP, 182, 4);
	gl.drawArrays(gl.TRIANGLE_STRIP, 186, 4);
	gl.drawArrays(gl.TRIANGLE_STRIP, 190, 4);
	g_modelMatrix = popMatrix();
}

function drawArmComponent2a(){
	pushMatrix(g_modelMatrix);
	g_modelMatrix.rotate(270,0,0,1);
	g_modelMatrix.translate(.58,.07,0.07);
	g_modelMatrix.rotate(clawAngle, 0, 0, 1);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP, 194, 16);
	g_modelMatrix = popMatrix();
}
function drawArmComponent2b(){
	pushMatrix(g_modelMatrix);
	g_modelMatrix.rotate(270,0,0,1);
	g_modelMatrix.translate(.58,-0.07,0.07);
	g_modelMatrix.rotate(90, 1, 0, 0);
	g_modelMatrix.rotate(clawAngle, 0, 0, 1);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP, 194, 16);
	g_modelMatrix = popMatrix();
}
function drawArmComponent2c(){
	pushMatrix(g_modelMatrix);
	g_modelMatrix.rotate(270,0,0,1);
	g_modelMatrix.translate(.58,0.07,-0.07);
	g_modelMatrix.rotate(270, 1, 0, 0);
	g_modelMatrix.rotate(clawAngle, 0, 0, 1);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP, 194, 16);
	g_modelMatrix = popMatrix();
}
function drawArmComponent2d(){
	pushMatrix(g_modelMatrix);
	g_modelMatrix.rotate(270,0,0,1);
	g_modelMatrix.translate(.58,-0.07,-.07);
	g_modelMatrix.rotate(180, 1, 0, 0);
	g_modelMatrix.rotate(clawAngle, 0, 0, 1);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP, 194, 16);
	g_modelMatrix = popMatrix();
}
function drawAnimalBody(){
	popMatrix();
	g_modelMatrix = popMatrix();
	pushMatrix(g_modelMatrix);
	g_modelMatrix.translate(g_xMdragTot,g_yMdragTot,0);
	g_modelMatrix.translate(-0.4, -.8, 0);
	g_modelMatrix.rotate(20, 1, 1, 1);
	g_modelMatrix.rotate(40, 0, 2, -1);
	g_modelMatrix.scale(1, 0.5, 0.5);
	g_modelMatrix.translate(animalLocation, 0, 0);
	pushMatrix(g_modelMatrix);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP, 110, 24);
	g_modelMatrix = popMatrix();
}
function drawAnimalNeck(){
	pushMatrix(g_modelMatrix);
	g_modelMatrix.translate(-.20, .4, 0);
	pushMatrix(g_modelMatrix);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP, 134, 12);
	g_modelMatrix = popMatrix();
}
function drawAnimalHead(){
	pushMatrix(g_modelMatrix);
	g_modelMatrix.translate(-.1, 0, 0);
	g_modelMatrix.scale(0.33, 0.66, 0.66);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP, 110, 24);
}
function drawAnimalLeg(){
	
	pushMatrix(g_modelMatrix);
	
	g_modelMatrix.scale(0.5,1,1);
	legJointAngle = runLegs(legJointAngle);
	g_modelMatrix.translate(-.1, .05, 0);
	g_modelMatrix.rotate(270, 0,.66, 1);
	
	if (animalMoving){
	g_modelMatrix.rotate(legJointAngle, 0, 0, 1);}
	//g_modelMatrix.rotate(legJointAngleRate, 0, 0, 1);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP, 134, 12);
	g_modelMatrix = popMatrix();
}
function drawAnimalLegs(){
	popMatrix();
	g_modelMatrix = popMatrix();
	g_modelMatrix.translate(0.1, 0, -.1);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	drawAnimalLeg();
	g_modelMatrix.translate(0, 0, .3);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	drawAnimalLeg();
	g_modelMatrix.translate(0.3, 0, 0);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	drawAnimalLeg();
	g_modelMatrix.translate(0, 0, -.2);
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	drawAnimalLeg();
}

function initializeCanvas(){
	gl.clearColor(0.5294, 0.8078, 0.9216, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
// Great question from student:
// "?How can I get the screen-clearing color (or any of the many other state
//		variables of OpenGL)?  'glGet()' doesn't seem to work..."
// ANSWER: from WebGL specification page: 
//							https://www.khronos.org/registry/webgl/specs/1.0/
//	search for 'glGet()' (ctrl-f) yields:
//  OpenGL's 'glGet()' becomes WebGL's 'getParameter()'

	clrColr = new Float32Array();
	clrColr = gl.getParameter(gl.COLOR_CLEAR_VALUE);
}
function drawSampleTriangle(){
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	// Draw triangles: start at vertex 12 and draw 3 vertices
// gl.drawArrays(gl.TRIANGLES, 12, 3);
	gl.drawArrays(gl.TRIANGLES,12,3 );
}
function drawAbudctionBeam(scale, y){
	pushMatrix(g_modelMatrix);
	g_modelMatrix.translate(0, y, 0);
	g_modelMatrix.scale(scale, scale, scale)
	gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP, 96, 12);
	gl.drawArrays(gl.TRIANGLE_STRIP, 106, 4);
	g_modelMatrix = popMatrix();
}
function drawAbductionBeams(){
	if ((g_angle01 > 0 )&& (g_angle01 < 30) || (g_angle01 >90 && g_angle01 < 120 ) || (g_angle01 >-180 && g_angle01 < -150 ) || (g_angle01 >-90 && g_angle01 < -60 )) {
		drawAbudctionBeam(1, -.3);}
		if ((g_angle01 > 30 && g_angle01 < 60) || (g_angle01 >120 && g_angle01 < 150 ) || (g_angle01 >-150 && g_angle01 < -120 ) || (g_angle01 >-60 && g_angle01 < -30 )){
		drawAbudctionBeam(0.75, -.6);}
		if ((g_angle01 > 60 && g_angle01 < 90) || (g_angle01 >150 && g_angle01 < 180 ) || (g_angle01 >-120 && g_angle01 < -90) || (g_angle01 >-30 && g_angle01 < 0 )){
		drawAbudctionBeam(0.5, -0.9);}
}
function drawSpinningTetrahedron(){
	g_modelMatrix.setTranslate(-0.8,-0.8, 0.0);  // 'set' means DISCARD old matrix,
	// (drawing axes centered in CVV), and then make new
	// drawing axes moved to the lower-left corner of CVV. 

g_modelMatrix.scale(1,1,-1);							// convert to left-handed coord sys
															// to match WebGL display canvas.
g_modelMatrix.scale(0.5, 0.5, 0.5);
	// if you DON'T scale, tetra goes outside the CVV; clipped!
g_modelMatrix.rotate(g_angle01, 0, 1, 0);  // Make new drawing axes that

// DRAW TETRA:  Use this matrix to transform & draw 
//						the first set of vertices stored in our VBO:
// Pass our current matrix to the vertex shaders:
gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
// Draw triangles: start at vertex 0 and draw 12 vertices
gl.drawArrays(gl.TRIANGLES, 0, 12);

// NEXT, create different drawing axes, and...
g_modelMatrix.setTranslate(0.4, 0.4, 0.0);  // 'set' means DISCARD old matrix,
	// (drawing axes centered in CVV), and then make new
	// drawing axes moved to the lower-left corner of CVV.
g_modelMatrix.scale(1,1,-1);							// convert to left-handed coord sys
															// to match WebGL display canvas.
g_modelMatrix.scale(0.3, 0.3, 0.3);				// Make it smaller.
}
function drawInteractiveWedge(){
	// Attempt 2: perp-axis rotation:
							// rotate on axis perpendicular to the mouse-drag direction:
							var dist = Math.sqrt(g_xMdragTot*g_xMdragTot + g_yMdragTot*g_yMdragTot);
							// why add 0.001? avoids divide-by-zero in next statement
							// in cases where user didn't drag the mouse.)
	g_modelMatrix.rotate(dist*120.0, -g_yMdragTot+0.0001, g_xMdragTot+0.0001, 0.0);
				// Acts weirdly as rotation amounts get far from 0 degrees.
				// ?why does intuition fail so quickly here?

	//-------------------------------
	// Attempt 3: Quaternions? What will work better?

					// YOUR CODE HERE

	//-------------------------------
	// DRAW 2 TRIANGLES:		Use this matrix to transform & draw
	//						the different set of vertices stored in our VBO:
  gl.uniformMatrix4fv(g_modelMatLoc, false, g_modelMatrix.elements);
  		// Draw only the last 2 triangles: start at vertex 6, draw 6 vertices
  gl.drawArrays(gl.TRIANGLES, 6,6);
}
function drawAll() {
//==============================================================================
  
	initializeCanvas();
	g_modelMatrix.setTranslate(0,0,0);
	pushMatrix(g_modelMatrix);  	//drawSampleTriangle();
 	drawSpaceShipBase();
	drawSpaceShipTop();
	drawAbductionBeams();
	drawArmComponent1();
	drawArmComponent2a();
	drawArmComponent2b();
	drawArmComponent2c();
	drawArmComponent2d();
	drawAnimalBody();
	drawAnimalNeck();
	drawAnimalHead();
	drawAnimalLegs();
	//drawSpinningTetrahedron();
	//drawInteractiveWedge();
}

// Last time that this function was called:  (used for animation timing)
var g_last = Date.now();

function animateg(angle) {
//==============================================================================
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  
  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +120 and -85 degrees:
//  if(angle >  120.0 && g_angle01Rate > 0) g_angle01Rate = -g_angle01Rate;
//  if(angle <  -85.0 && g_angle01Rate < 0) g_angle01Rate = -g_angle01Rate;
  
  var newAngle = angle + (g_angle01Rate * elapsed) / 1000.0;
  if(newAngle > 180.0) newAngle = newAngle - 360.0;
  if(newAngle <-180.0) newAngle = newAngle + 360.0;
  return newAngle;
}
g_last = Date.now();
function runLegs(angle){
	var now = Date.now();
	var elapsed = now - g_last;
	g_last = now;
	var newAngle = angle;
	if (newAngle >= 30){ 
		legJointAngleRate = -160;
	}else if (newAngle <=-30){ 
		legJointAngleRate = 160;
	}
	newAngle = angle + (legJointAngleRate*elapsed) /1000.0;
	return newAngle;
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
	var rangeslider = document.getElementById("sliderRange");
	clawAngleStep = rangeslider.value/10;
	clawAngle += clawAngleStep *angleMultiple;
	if (clawAngle > 40 || clawAngle < 0){
		angleMultiple = -angleMultiple;
	}
	
}

//==================HTML Button Callbacks======================

function angleSubmit() {
// Called when user presses 'Submit' button on our webpage
//		HOW? Look in HTML file (e.g. ControlMulti.html) to find
//	the HTML 'input' element with id='usrAngle'.  Within that
//	element you'll find a 'button' element that calls this fcn.

// Read HTML edit-box contents:
	var UsrTxt = document.getElementById('usrAngle').value;	
// Display what we read from the edit-box: use it to fill up
// the HTML 'div' element with id='editBoxOut':
  document.getElementById('EditBoxOut').innerHTML ='You Typed: '+UsrTxt;
   // print in console, and
  ac1zAngleMax = parseFloat(UsrTxt);     // convert string to float number 
};

function redButtonHit(){
	redColor = true;
	blueColor = false;
	greenColor = false;
}
function greenButtonHit(){
	redColor = false;
	blueColor = false;
	greenColor = true;
}
function blueButtonHit(){
	redColor = false;
	blueColor = true;
	greenColor = false;
}


function clearDrag() {
// Called when user presses 'Clear' button in our webpage
	g_xMdragTot = 0.0;
	g_yMdragTot = 0.0;
}

function spinUp() {
// Called when user presses the 'Spin >>' button on our webpage.
// ?HOW? Look in the HTML file (e.g. ControlMulti.html) to find
// the HTML 'button' element with onclick='spinUp()'.
  g_angle01Rate += 25; 
}

function spinDown() {
// Called when user presses the 'Spin <<' button
 g_angle01Rate -= 25; 
}

function runStop() {
// Called when user presses the 'Run/Stop' button
  go = !go;
}

//===================Mouse and Keyboard event-handling Callbacks

function myMouseDown(ev) {
//==============================================================================
// Called when user PRESSES down any mouse button;
// 									(Which button?    console.log('ev.button='+ev.button);   )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
  var yp = g_canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseDown(pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - g_canvas.width/2)  / 		// move origin to center of canvas and
  						 (g_canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - g_canvas.height/2) /		//										 -1 <= y < +1.
							 (g_canvas.height/2);
//	console.log('myMouseDown(CVV coords  ):  x, y=\t',x,',\t',y);
	
	g_isDrag = true;											// set our mouse-dragging flag
	g_xMclik = x;													// record where mouse-dragging began
	g_yMclik = y;
	// report on webpage
	};


function myMouseMove(ev) {
//==============================================================================
// Called when user MOVES the mouse with a button already pressed down.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

	if(g_isDrag==false) return;				// IGNORE all mouse-moves except 'dragging'

	// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = g_canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseMove(pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - g_canvas.width/2)  / 		// move origin to center of canvas and
  						 (g_canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - g_canvas.height/2) /		//										 -1 <= y < +1.
							 (g_canvas.height/2);
//	console.log('myMouseMove(CVV coords  ):  x, y=\t',x,',\t',y);

	// find how far we dragged the mouse:
	if (dragAnimal){
	g_xMdragTot += (x - g_xMclik);					// Accumulate change-in-mouse-position,&
	g_yMdragTot += (y - g_yMclik);}
	// Report new mouse position & how far we moved on webpage:
	

	g_xMclik = x;													// Make next drag-measurement from here.
	g_yMclik = y;
};

function myMouseUp(ev) {
//==============================================================================
// Called when user RELEASES mouse button pressed previously.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = g_canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseUp  (pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - g_canvas.width/2)  / 		// move origin to center of canvas and
  						 (g_canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - g_canvas.height/2) /		//										 -1 <= y < +1.
							 (g_canvas.height/2);
	console.log('myMouseUp  (CVV coords  ):  x, y=\t',x,',\t',y);
	
	g_isDrag = false;											// CLEAR our mouse-dragging flag, and
	// accumulate any final bit of mouse-dragging we did:
	if (dragAnimal){
	g_xMdragTot += (x - g_xMclik);
	g_yMdragTot += (y - g_yMclik);}
	// Report new mouse position:
	};

function myMouseClick(ev) {
//=============================================================================
// Called when user completes a mouse-button single-click event 
// (e.g. mouse-button pressed down, then released)
// 									   
//    WHICH button? try:  console.log('ev.button='+ev.button); 
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!) 
//    See myMouseUp(), myMouseDown() for conversions to  CVV coordinates.

  // STUB
	console.log("myMouseClick() on button: ", ev.button); 
}	

function myMouseDblClick(ev) {
//=============================================================================
// Called when user completes a mouse-button double-click event 
// 									   
//    WHICH button? try:  console.log('ev.button='+ev.button); 
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!) 
//    See myMouseUp(), myMouseDown() for conversions to  CVV coordinates.

  // STUB
	console.log("myMouse-DOUBLE-Click() on button: ", ev.button); 
}	

function myKeyDown(kev) {
//===============================================================================
// Called when user presses down ANY key on the keyboard;
//
// For a light, easy explanation of keyboard events in JavaScript,
// see:    http://www.kirupa.com/html5/keyboard_events_in_javascript.htm
// For a thorough explanation of a mess of JavaScript keyboard event handling,
// see:    http://javascript.info/tutorial/keyboard-events
//
// NOTE: Mozilla deprecated the 'keypress' event entirely, and in the
//        'keydown' event deprecated several read-only properties I used
//        previously, including kev.charCode, kev.keyCode. 
//        Revised 2/2019:  use kev.key and kev.code instead.
//
// Report EVERYTHING in console:
  console.log(  "--kev.code:",    kev.code,   "\t\t--kev.key:",     kev.key, 
              "\n--kev.ctrlKey:", kev.ctrlKey,  "\t--kev.shiftKey:",kev.shiftKey,
              "\n--kev.altKey:",  kev.altKey,   "\t--kev.metaKey:", kev.metaKey);

// and report EVERYTHING on webpage:
	switch(kev.code) {
		case "KeyP":
			if(g_isRun==true) {
			  g_isRun = false;    // STOP animation
			  }
			else {
			  g_isRun = true;     // RESTART animation
			  tick();
			  }
			break;
		//------------------WASD navigation-----------------
		case "KeyM":
			dragAnimal = true;
    	case "KeyD":
			break;
		case "KeyS":
			animalMoving = true;
			animalLocation += 0.01;
			break;
		case "KeyW":
			animalMoving = true;
			animalLocation -= 0.01;
			break;
		//----------------Arrow keys------------------------
		case "ArrowLeft": 	
			
			// and print on webpage in the <div> element with id='Result':
  		
			break;
		case "ArrowRight":
  			break;
		case "ArrowUp":		
			
  		break;
		case "ArrowDown":
			break;	
	 	default:
      		break;
	}
}

function myKeyUp(kev) {
//===============================================================================
// Called when user releases ANY key on the keyboard; captures scancodes well
	if (kev.keyCode = 'KeyW'){
		animalMoving = false;
	}
	if (kev.keyCode = 'KeyM'){
		dragAnimal = false;
	}
	
}
