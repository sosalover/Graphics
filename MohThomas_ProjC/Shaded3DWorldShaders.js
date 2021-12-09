
var cop_x = 0.0;
var cop_y = 6.0;
var cop_z = 1.0;
var theta = 300.3;
var dtilt = 0.9;
var materialNumber = 0;
var vpAspect;
var globalPhong = 0.0;
var globalLightPosition = new Vector3([0.0, 0.0, 100.0]);
var wingAngle = 0.0;
var wingAngleStep = 60.0;

var globalLightOn = 1.0;
var globalSpecifiedIa = [0.4, 0.2, 0.2];
var globalSpecifiedId =  [0.4, 0.1, 0.5];
var globalSpecifiedIs = [0.4, 0.3, 0.3];
var globalLightSpecified = 0.0;
var lastIa = [0.4, 0.2, 0.2];
var lastId = [0.4, 0.1, 0.5];
var lastIs = [0.4, 0.3, 0.3];

var floatsPerVertex0;
//=============================================================================
//=============================================================================

function lightSwitch(){
  if(globalLightOn == 1.0){
    lastIa = globalSpecifiedIa;
    lastId = globalSpecifiedId;
    lastIs = globalSpecifiedIs;

    globalSpecifiedIa = [0.0, 0.0, 0.0];
    globalSpecifiedId = [0.0, 0.0, 0.0];
    globalSpecifiedIs = [0.0, 0.0, 0.0];
    globalLightOn = 0.0;}
  else if(globalLightOn == 0.0){
    globalSpecifiedIa = lastIa;
    globalSpecifiedId = lastId;
    globalSpecifiedIs = lastIs;
    globalLightOn = 1.0;
  }
  globalLightSpecified = 1.0;
  
}
function setLightSpecification(){
  var UsrTxt = document.getElementById('Iax').value;
	var iax= parseFloat(UsrTxt);

  var UsrTxt = document.getElementById('Iay').value;
	var iay= parseFloat(UsrTxt);

  var UsrTxt = document.getElementById('Iaz').value;
	var iaz= parseFloat(UsrTxt);

	var UsrTxt = document.getElementById('Idx').value;
	var idx = parseFloat(UsrTxt);

  var UsrTxt = document.getElementById('Idy').value;
	var idy = parseFloat(UsrTxt);

  var UsrTxt = document.getElementById('Idz').value;
	var idz = parseFloat(UsrTxt);

	var UsrTxt = document.getElementById('Isx').value;
	var isx = parseFloat(UsrTxt);

  var UsrTxt = document.getElementById('Isy').value;
	var isy = parseFloat(UsrTxt);

  var UsrTxt = document.getElementById('Isz').value;
	var isz = parseFloat(UsrTxt);
  
  globalLightSpecified = 1.0;
  globalSpecifiedIa = [iax, iay, iaz];
  globalSpecifiedId = [idx, idy, idz];
  globalSpecifiedIs = [isx, isy, isz];
}
function setLightPosition(){
  var UsrTxt = document.getElementById('LightX').value;
	var x= parseFloat(UsrTxt);

	var UsrTxt = document.getElementById('LightY').value;
	var y = parseFloat(UsrTxt);

	var UsrTxt = document.getElementById('LightZ').value;
	var z = parseFloat(UsrTxt);
  globalLightPosition = new Vector3([x, y, z]);
  document.getElementById("LightingPositionText").innerHTML =`Current Light Position: (${x}, ${y}, ${z})`;
}
function setvpAspect(vp){
  vpAspect = vp;
}
function PhongLighting(){
  globalPhong = 0.0;
  document.getElementById("LightingText").innerHTML = "Current Lighting: Phong";
}
function BlinnPhongLighting(){
  globalPhong = 1.0;
  document.getElementById("LightingText").innerHTML = "Current Lighting: Blinn-Phong";
}
function myKeyDown(kev){
  var aimVec1 = new Vector3([Math.cos(theta), Math.sin(theta), dtilt - cop_z]);
	var upVec1 = new Vector3([0, 0, 1]);
	var perpVec1 = aimVec1.cross(upVec1);
  switch(kev.code){
    case "KeyA":
      cop_x -= perpVec1.elements[0]*0.1;
			cop_y -= perpVec1.elements[1]*0.1;
      break;
    case "KeyD":
      cop_x += perpVec1.elements[0]*0.1;
			cop_y += perpVec1.elements[1]*0.1;
      break;
    case "KeyS":
      cop_x -= Math.cos(theta)*0.1;
			cop_y -= Math.sin(theta)*0.1;
			cop_z -= (dtilt - cop_z)*0.1;
			dtilt -= (dtilt - cop_z)*0.1;
      break;
    case "KeyW":
      cop_x += Math.cos(theta)*0.1;
			cop_y += Math.sin(theta)*0.1;
			cop_z += (dtilt - cop_z)*0.1;
			dtilt += (dtilt - cop_z)*0.1;
      break;
    case "ArrowLeft":
      theta+=0.1;
      break;
    case "ArrowRight":
      theta-=0.1;
      break;
    case "ArrowUp":
      dtilt+=0.1;
      break;
    case "ArrowDown":
      dtilt-=0.1;
      break;
    case "KeyM":
      materialNumber = (materialNumber + 1) % 11;
  }
}

function VBObox0() {
//=============================================================================
//=============================================================================
// CONSTRUCTOR for one re-usable 'VBObox0' object that holds all data and fcns
// needed to render vertices from one Vertex Buffer Object (VBO) using one 
// separate shader program (a vertex-shader & fragment-shader pair) and one
// set of 'uniform' variables.

// Constructor goal: 
// Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
// written into code) in all other VBObox functions. Keeping all these (initial)
// values here, in this one coonstrutor function, ensures we can change them 
// easily WITHOUT disrupting any other code, ever!
  
	this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
  'precision highp float;\n' +				// req'd in OpenGL ES if we use 'float'
  //
  'uniform mat4 u_ModelMat0;\n' +
  'attribute vec4 a_Pos0;\n' +
  'attribute vec3 a_Colr0;\n'+
  'varying vec3 v_Colr0;\n' +
  //
  'void main() {\n' +
  '  gl_Position = u_ModelMat0 * a_Pos0;\n' +
  '	 v_Colr0 = a_Colr0;\n' +
  ' }\n';

	this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
  'precision mediump float;\n' +
  'varying vec3 v_Colr0;\n' +
  'void main() {\n' +
  '  gl_FragColor = vec4(v_Colr0, 1.0);\n' + 
  '}\n';

	//this.vboContents = //---------------------------------------------------------
	makeWorldAxes(); 
  makeGroundGrid();
  
  var mySiz = (worldVerts.length + gndVerts.length );
  floatsPerVertex0 = 7;
  this.vboVerts = mySiz / floatsPerVertex0;
  				
  this.vboContents = new Float32Array(mySiz);
  var i = 0;
  axesStart = i;
	for(j=0; j<worldVerts.length; i++, j++){
		this.vboContents[i] = worldVerts[j];
  }
  gndStart = i;
  for(j=0; j< gndVerts.length; i++, j++) {
		this.vboContents[i] = gndVerts[j];
	}
  /*new Float32Array ([						// Array of vertex attribute values we will
  															// transfer to GPU's vertex buffer object (VBO)
	// 1st triangle:
  	 0.0,	 0.5,	0.0, 1.0,		1.0, 0.0, 0.0, //1 vertex:pos x,y,z,w; color: r,g,b
    -0.5, -0.5, 0.0, 1.0,		0.0, 1.0, 0.0,
     0.5, -0.5, 0.0, 1.0,		0.0, 0.0, 1.0,
 // 2nd triangle:
		 0.0,  0.0, 0.0, 1.0,   1.0, 1.0, 1.0,		// (white)
		 0.3,  0.0, 0.0, 1.0,   0.0, 0.0, 1.0,		// (blue)
		 0.0,  0.3, 0.0, 1.0,   0.5, 0.5, 0.5,		// (gray)
		 ]);

	this.vboVerts = 6;*/						// # of vertices held in 'vboContents' array
	this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;
	                              // bytes req'd by 1 vboContents array element;
																// (why? used to compute stride and offset 
																// in bytes for vertexAttribPointer() calls)
  this.vboBytes = this.vboContents.length * this.FSIZE;               
                                // total number of bytes stored in vboContents
                                // (#  of floats in vboContents array) * 
                                // (# of bytes/float).
	this.vboStride = this.vboBytes / this.vboVerts; 
	                              // (== # of bytes to store one complete vertex).
	                              // From any attrib in a given vertex in the VBO, 
	                              // move forward by 'vboStride' bytes to arrive 
	                              // at the same attrib for the next vertex. 

	            //----------------------Attribute sizes
  this.vboFcount_a_Pos0 =  4;    // # of floats in the VBO needed to store the
                                // attribute named a_Pos0. (4: x,y,z,w values)
  this.vboFcount_a_Colr0 = 3;   // # of floats for this attrib (r,g,b values) 
  console.assert((this.vboFcount_a_Pos0 +     // check the size of each and
                  this.vboFcount_a_Colr0) *   // every attribute in our VBO
                  this.FSIZE == this.vboStride, // for agreeement with'stride'
                  "Uh oh! VBObox0.vboStride disagrees with attribute-size values!");

              //----------------------Attribute offsets  
	this.vboOffset_a_Pos0 = 0;    // # of bytes from START of vbo to the START
	                              // of 1st a_Pos0 attrib value in vboContents[]
  this.vboOffset_a_Colr0 = this.vboFcount_a_Pos0 * this.FSIZE;    
                                // (4 floats * bytes/float) 
                                // # of bytes from START of vbo to the START
                                // of 1st a_Colr0 attrib value in vboContents[]
	            //-----------------------GPU memory locations:
	this.vboLoc;									// GPU Location for Vertex Buffer Object, 
	                              // returned by gl.createBuffer() function call
	this.shaderLoc;								// GPU Location for compiled Shader-program  
	                            	// set by compile/link of VERT_SRC and FRAG_SRC.
								          //------Attribute locations in our shaders:
	this.a_PosLoc;								// GPU location for 'a_Pos0' attribute
	this.a_ColrLoc;								// GPU location for 'a_Colr0' attribute

	            //---------------------- Uniform locations &values in our shaders
	this.ModelMat = new Matrix4();	// Transforms CVV axes to model axes.
	this.u_ModelMatLoc;							// GPU location for u_ModelMat uniform
}

VBObox0.prototype.init = function() {
//=============================================================================
// Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
// kept in this VBObox. (This function usually called only once, within main()).
// Specifically:
// a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
//  executable 'program' stored and ready to use inside the GPU.  
// b) create a new VBO object in GPU memory and fill it by transferring in all
//  the vertex data held in our Float32array member 'VBOcontents'. 
// c) Find & save the GPU location of all our shaders' attribute-variables and 
//  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
// -------------------
// CAREFUL!  before you can draw pictures using this VBObox contents, 
//  you must call this VBObox object's switchToMe() function too!
//--------------------
// a) Compile,link,upload shaders-----------------------------------------------
	this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
	if (!this.shaderLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create executable Shaders on the GPU. Bye!');
    return;
  }
// CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
//  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}

	gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())

// b) Create VBO on GPU, fill it------------------------------------------------
	this.vboLoc = gl.createBuffer();	
  if (!this.vboLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create VBO in GPU. Bye!'); 
    return;
  }
  // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
  //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
  // (positions, colors, normals, etc), or 
  //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
  // that each select one vertex from a vertex array stored in another VBO.
  gl.bindBuffer(gl.ARRAY_BUFFER,	      // GLenum 'target' for this GPU buffer 
  								this.vboLoc);				  // the ID# the GPU uses for this buffer.

  // Fill the GPU's newly-created VBO object with the vertex data we stored in
  //  our 'vboContents' member (JavaScript Float32Array object).
  //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
  //    use gl.bufferSubData() to modify VBO contents without changing VBO size)
  gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
 					 				this.vboContents, 		// JavaScript Float32Array
  							 	gl.STATIC_DRAW);			// Usage hint.
  //	The 'hint' helps GPU allocate its shared memory for best speed & efficiency
  //	(see OpenGL ES specification for more info).  Your choices are:
  //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents rarely or never change.
  //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents may change often as our program runs.
  //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
  // 			times and then discarded; for rapidly supplied & consumed VBOs.

  // c1) Find All Attributes:---------------------------------------------------
  //  Find & save the GPU location of all our shaders' attribute-variables and 
  //  uniform-variables (for switchToMe(), adjust(), draw(), reload(),etc.)
  this.a_PosLoc = gl.getAttribLocation(this.shaderLoc, 'a_Pos0');
  if(this.a_PosLoc < 0) {
    console.log(this.constructor.name + 
    						'.init() Failed to get GPU location of attribute a_Pos0');
    return -1;	// error exit.
  }
 	this.a_ColrLoc = gl.getAttribLocation(this.shaderLoc, 'a_Colr0');
  if(this.a_ColrLoc < 0) {
    console.log(this.constructor.name + 
    						'.init() failed to get the GPU location of attribute a_Colr0');
    return -1;	// error exit.
  }
  // c2) Find All Uniforms:-----------------------------------------------------
  //Get GPU storage location for each uniform var used in our shader programs: 
	this.u_ModelMatLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMat0');
  if (!this.u_ModelMatLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_ModelMat1 uniform');
    return;
  }  
}

VBObox0.prototype.switchToMe = function() {
//==============================================================================
// Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
//
// We only do this AFTER we called the init() function, which does the one-time-
// only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
// even then, you are STILL not ready to draw our VBObox's contents onscreen!
// We must also first complete these steps:
//  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
//  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
//  c) tell the GPU to connect the shader program's attributes to that VBO.

// a) select our shader program:
  gl.useProgram(this.shaderLoc);	
//		Each call to useProgram() selects a shader program from the GPU memory,
// but that's all -- it does nothing else!  Any previously used shader program's 
// connections to attributes and uniforms are now invalid, and thus we must now
// establish new connections between our shader program's attributes and the VBO
// we wish to use.  
  
// b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
//  instead connect to our own already-created-&-filled VBO.  This new VBO can 
//    supply values to use as attributes in our newly-selected shader program:
	gl.bindBuffer(gl.ARRAY_BUFFER,	        // GLenum 'target' for this GPU buffer 
										this.vboLoc);			    // the ID# the GPU uses for our VBO.

// c) connect our newly-bound VBO to supply attribute variable values for each
// vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
// this sets up data paths from VBO to our shader units:
  // 	Here's how to use the almost-identical OpenGL version of this function:
	//		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
  gl.vertexAttribPointer(
		this.a_PosLoc,//index == ID# for the attribute var in your GLSL shader pgm;
		this.vboFcount_a_Pos0,// # of floats used by this attribute: 1,2,3 or 4?
		gl.FLOAT,			// type == what data type did we use for those numbers?
		false,				// isNormalized == are these fixed-point values that we need
									//									normalize before use? true or false
		this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
		              // stored attrib for this vertex to the same stored attrib
		              //  for the next vertex in our VBO.  This is usually the 
									// number of bytes used to store one complete vertex.  If set 
									// to zero, the GPU gets attribute values sequentially from 
									// VBO, starting at 'Offset'.	
									// (Our vertex size in bytes: 4 floats for pos + 3 for color)
		this.vboOffset_a_Pos0);						
		              // Offset == how many bytes from START of buffer to the first
  								// value we will actually use?  (We start with position).
  gl.vertexAttribPointer(this.a_ColrLoc, this.vboFcount_a_Colr0, 
                        gl.FLOAT, false, 
                        this.vboStride, this.vboOffset_a_Colr0);
  							
// --Enable this assignment of each of these attributes to its' VBO source:
  gl.enableVertexAttribArray(this.a_PosLoc);
  gl.enableVertexAttribArray(this.a_ColrLoc);
}

VBObox0.prototype.isReady = function() {
//==============================================================================
// Returns 'true' if our WebGL rendering context ('gl') is ready to render using
// this objects VBO and shader program; else return false.
// see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter

var isOK = true;

  if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
    console.log(this.constructor.name + 
    						'.isReady() false: shader program at this.shaderLoc not in use!');
    isOK = false;
  }
  if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
      console.log(this.constructor.name + 
  						'.isReady() false: vbo at this.vboLoc not in use!');
    isOK = false;
  }
  return isOK;
}

VBObox0.prototype.adjust = function() {
//==============================================================================
// Update the GPU to newer, current values we now store for 'uniform' vars on 
// the GPU; and (if needed) update each attribute's stride and offset in VBO.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.adjust() call you needed to call this.switchToMe()!!');
  }  
	// Adjust values for our uniforms,
  //this.ModelMat.setRotate(g_angleNow0, 0, 0, 1);	  // rotate drawing axes,
  //this.ModelMat.translate(0.35, 0, 0);							// then translate them.
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  var canvas = document.getElementById('webgl');
  this.ModelMat.setIdentity();
  this.ModelMat.perspective(35.0, vpAspect, 1.0, 100.0);
  this.ModelMat.lookAt(cop_x, cop_y, cop_z,
                       cop_x + Math.cos(theta), cop_y + Math.sin(theta), dtilt,
                       0, 0, 1);                     
  
  
  gl.uniformMatrix4fv(this.u_ModelMatLoc,	// GPU location of the uniform
  										false, 				// use matrix transpose instead?
  										this.ModelMat.elements);	// send data from Javascript.
  // Adjust the attributes' stride and offset (if necessary)
  // (use gl.vertexAttribPointer() calls and gl.enableVertexAttribArray() calls)
}

VBObox0.prototype.draw = function() {
//=============================================================================
// Render current VBObox contents.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.draw() call you needed to call this.switchToMe()!!');
  }  
  // ----------------------------Draw the contents of the currently-bound VBO:
  pushMatrix(this.ModelMat);
    gl.drawArrays(gl.LINES, 	    // select the drawing primitive to draw,
  						    axesStart/floatsPerVertex0, 								// location of 1st vertex to draw;
  								worldVerts.length/floatsPerVertex0);		// number of vertices to draw on-screen.
  this.ModelMat = popMatrix();
  pushMatrix(this.ModelMat);
      this.ModelMat.translate(0.4, -0.4, 0.0);
      this.ModelMat.scale(0.1, 0.1, 0.1);
      gl.uniformMatrix4fv(this.u_ModelMatLoc,	// GPU location of the uniform
                          false, 				// use matrix transpose instead?
                          this.ModelMat.elements);
      gl.drawArrays(gl.LINES,
                      gndStart/floatsPerVertex0,
                      gndVerts.length/floatsPerVertex0);
  this.ModelMat = popMatrix();


}

VBObox0.prototype.reload = function() {
//=============================================================================
// Over-write current values in the GPU inside our already-created VBO: use 
// gl.bufferSubData() call to re-transfer some or all of our Float32Array 
// contents to our VBO without changing any GPU memory allocations.

 gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                  0,                  // byte offset to where data replacement
                                      // begins in the VBO.
 					 				this.vboContents);   // the JS source-data array used to fill VBO

}
/*
VBObox0.prototype.empty = function() {
//=============================================================================
// Remove/release all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  However, make sure this step is reversible by a call to 
// 'restoreMe()': be sure to retain all our Float32Array data, all values for 
// uniforms, all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}

VBObox0.prototype.restore = function() {
//=============================================================================
// Replace/restore all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
// all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}
*/

//=============================================================================
//=============================================================================
function VBObox1() {
//=============================================================================
//=============================================================================
// CONSTRUCTOR for one re-usable 'VBObox1' object that holds all data and fcns
// needed to render vertices from one Vertex Buffer Object (VBO) using one 
// separate shader program (a vertex-shader & fragment-shader pair) and one
// set of 'uniform' variables.

// Constructor goal: 
// Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
// written into code) in all other VBObox functions. Keeping all these (initial)
// values here, in this one coonstrutor function, ensures we can change them 
// easily WITHOUT disrupting any other code, ever!
  
	this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
  'precision highp float;\n' +
  'uniform float phong; \n' +
  'uniform vec3 cameraPosition; \n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjectionMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'attribute vec4 a_Position;\n' +
  'attribute vec3 a_Color;\n' +
  'attribute vec3 a_Normal;\n' +
  'varying vec3 normalInterp;\n' +
  'varying vec3 vertPos;\n'+
  'uniform vec3 Ka;\n'+
  'uniform vec3 Kd;\n'+
  'uniform vec3 Ks;\n'+
  'uniform float shininessVal;\n'+
  'uniform vec3 Ia;\n' + 
  'uniform vec3 Id;\n' + 
  'uniform vec3 Is;\n' + 
  'uniform vec3 lightPos;\n' + 
  'varying vec4 v_Color;\n' +
  'uniform float lightOn;\n'+
  'uniform float lightSpecified;\n'+
  'uniform vec3 specifiedIa;\n'+
  'uniform vec3 specifiedId;\n'+
  'uniform vec3 specifiedIs;\n'+
  'void main() {\n' +
  ' gl_Position = u_ProjectionMatrix*u_ViewMatrix*u_ModelMatrix*a_Position;\n' +
  ' vec4 ntemp = u_NormalMatrix * vec4(a_Normal, 0.0);\n'+
  ' vec3 N_vec = vec3(ntemp[0], ntemp[1], ntemp[2]);\n'+
  ' N_vec = normalize(N_vec);\n'+
  ' vec3 L_vec = normalize(lightPos - vec3(u_ModelMatrix*a_Position));\n' +
  ' float NdotL = max(dot(N_vec, L_vec), 0.0);\n'+
  ' float dummy = Kd[0] + Ka[0] + Ks[0] + shininessVal + Ia[0] + Id[0] + Is[0] + phong + lightPos[0]+a_Color[0]+cameraPosition[0];\n'+
  ' dummy = dummy-dummy;\n' +
  ' vec3 V = normalize(cameraPosition - vec3(u_ModelMatrix*a_Position));\n'+
  ' vec3 R = reflect(-L_vec, N_vec);\n'+
  'float specAngle = max(dot(R,V), 0.0);\n'+
  'float specularTerm = pow(specAngle, shininessVal);\n' +
  ' vec3 diffuse = vec3(NdotL*Kd[0]*Id[0], NdotL*Kd[1]*Id[1], NdotL*Kd[2]*Id[2]);\n'+
  ' vec3 ambient = vec3(Ka[0]*Ia[0], Ka[1]*Ia[1], Ka[2]*Ia[2]);\n'+
  
  ' if (phong!=0.0) {\n'+
  '   vec3 H = normalize(L_vec + V);\n'+
  '   specAngle = max(dot(N_vec, H), 0.0);\n'+
  '   specularTerm = pow(specAngle, shininessVal);\n'+
  ' }\n'+
  ' vec3 specular = vec3(Ks[0]*Is[0]*specularTerm, Ks[1]*Is[1]*specularTerm, Ks[2]*Is[2]*specularTerm);\n'+
  ' if (lightSpecified == 1.0){\n'+
  '   diffuse = vec3(NdotL*Kd[0]*specifiedId[0], NdotL*Kd[1]*specifiedId[1], NdotL*Kd[2]*specifiedId[2]);\n'+
  '   ambient = vec3(Ka[0]*specifiedIa[0], Ka[1]*specifiedIa[1], Ka[2]*specifiedIa[2]);\n'+
  '   specular = vec3(Ks[0]*specifiedIs[0]*specularTerm, Ks[1]*specifiedIs[1]*specularTerm, Ks[2]*specifiedIs[2]*specularTerm);\n'+
  '}\n'+
  ' v_Color = vec4(diffuse+ambient+specular, 1.0);\n'+
  '  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' +
  '}\n';
/*
 // SQUARE dots:
	this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
  'precision mediump float;\n' +
  'varying vec3 v_Colr1;\n' +
  'void main() {\n' +
  '  gl_FragColor = vec4(v_Colr1, 1.0);\n' +  
  '}\n';
*/
/*
 // ROUND FLAT dots:
	this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
  'precision mediump float;\n' +
  'varying vec3 v_Colr1;\n' +
  'void main() {\n' +
  '  float dist = distance(gl_PointCoord, vec2(0.5, 0.5)); \n' + 
  '  if(dist < 0.5) {\n' +
  '    gl_FragColor = vec4(v_Colr1, 1.0);\n' +  
  '    } else {discard;};' +
  '}\n';
*/
 // SHADED, sphere-like dots:
	this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
  'precision mediump float;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';


  makeSphere();
  makeCube();
	var mySiz = (sphVerts.length+cubeVerts.length);
  floatsPerVertex1 = 10;
  this.vboVerts = mySiz / floatsPerVertex1;
  				
  this.vboContents = new Float32Array(mySiz);
  var i = 0;
  sphStart = i;
	for(j=0; j<sphVerts.length; i++, j++){
		this.vboContents[i] = sphVerts[j];
  }
  cubeStart = i;
  for(j=0; j<cubeVerts.length; i++, j++){
		this.vboContents[i] = cubeVerts[j];
  }

  
	
	this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;  
	                              // bytes req'd by 1 vboContents array element;
																// (why? used to compute stride and offset 
																// in bytes for vertexAttribPointer() calls)
  this.vboBytes = this.vboContents.length * this.FSIZE;               
                                // (#  of floats in vboContents array) * 
                                // (# of bytes/float).
	this.vboStride = this.vboBytes / this.vboVerts;     
	                              // (== # of bytes to store one complete vertex).
	                              // From any attrib in a given vertex in the VBO, 
	                              // move forward by 'vboStride' bytes to arrive 
	                              // at the same attrib for the next vertex.
	                               
	            //----------------------Attribute sizes
  this.vboFcount_a_Pos1 =  4;    // # of floats in the VBO needed to store the
                                // attribute named a_Pos1. (4: x,y,z,w values)
  this.vboFcount_a_Colr1 = 3;   // # of floats for this attrib (r,g,b values)
  this.vboFcount_a_Normal1 = 3;  // # of floats for this attrib (just one!)   
  console.assert((this.vboFcount_a_Pos1 +     // check the size of each and
                  this.vboFcount_a_Colr1 +
                  this.vboFcount_a_Normal1) *   // every attribute in our VBO
                  this.FSIZE == this.vboStride, // for agreeement with'stride'
                  "Uh oh! VBObox1.vboStride disagrees with attribute-size values!");
                  
              //----------------------Attribute offsets
	this.vboOffset_a_Pos1 = 0;    //# of bytes from START of vbo to the START
	                              // of 1st a_Pos1 attrib value in vboContents[]
  this.vboOffset_a_Colr1 = (this.vboFcount_a_Pos1) * this.FSIZE;  
                                // == 4 floats * bytes/float
                                //# of bytes from START of vbo to the START
                                // of 1st a_Colr1 attrib value in vboContents[]
  this.vboOffset_a_Normal1 =(this.vboFcount_a_Pos1 +
                            this.vboFcount_a_Colr1) * this.FSIZE; 
                                // == 7 floats * bytes/float
                                // # of bytes from START of vbo to the START
                                // of 1st a_PtSize attrib value in vboContents[]

	            //-----------------------GPU memory locations:                                
	this.vboLoc;									// GPU Location for Vertex Buffer Object, 
	                              // returned by gl.createBuffer() function call
	this.shaderLoc;								// GPU Location for compiled Shader-program  
	                            	// set by compile/link of VERT_SRC and FRAG_SRC.
								          //------Attribute locations in our shaders:
	this.a_Pos1Loc;							  // GPU location: shader 'a_Pos1' attribute
	this.a_Colr1Loc;							// GPU location: shader 'a_Colr1' attribute
	this.a_Normal1Loc;							// GPU location: shader 'a_PtSiz1' attribute
	
	            //---------------------- Uniform locations &values in our shaders
	this.ModelMatrix = new Matrix4();	// Transforms CVV axes to model axes.
	this.u_ModelMatrixLoc;						// GPU location for u_ModelMat uniform

  this.ViewMatrix = new Matrix4();
  this.u_ViewMatrixLoc;

  this.ProjectionMatrix = new Matrix4();
  this.u_ProjectionMatrixLoc;

  this.NormalMatrix = new Matrix4();
  this.u_NormalMatrixLoc;

  this.cameraPosition = new Vector3();
  this.cameraPositionLoc;

  this.lightPosition = new Vector3();
  this.lightPositionLoc;
  
  this.phong;
  this.phongLoc;

  this.Ka = new Vector3();
  this.KaLoc;
  this.Kd = new Vector3();
  this.KdLoc;
  this.Ks = new Vector3();
  this.KsLoc;
  this.shininessVal;
  this.shininessValLoc;
  this.Ia = new Vector3();
  this.IaLoc;
  this.Id = new Vector3();
  this.IdLoc;
  this.Is = new Vector3();
  this.IsLoc;

  this.specifiedIaLoc;
  this.specifiedIsLoc;
  this.specifiedIdLoc;
  this.lightSpecifiedLoc;
};
VBObox1.prototype.sendDifferentMaterial = function(newKa, newKd, newKs, newIa, newId, newIs, newShiny){
  gl.uniform3fv(this.KaLoc, newKa);
  gl.uniform3fv(this.KdLoc, newKd);
  gl.uniform3fv(this.IaLoc, newIa);
  gl.uniform3fv(this.IdLoc, newId);
  gl.uniform3fv(this.IsLoc, newIs);
  gl.uniform3fv(this.KsLoc, newKs);
  gl.uniform1f(this.shininessValLoc, newShiny);
}

VBObox1.prototype.init = function() {
//==============================================================================
// Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
// kept in this VBObox. (This function usually called only once, within main()).
// Specifically:
// a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
//  executable 'program' stored and ready to use inside the GPU.  
// b) create a new VBO object in GPU memory and fill it by transferring in all
//  the vertex data held in our Float32array member 'VBOcontents'. 
// c) Find & save the GPU location of all our shaders' attribute-variables and 
//  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
// -------------------
// CAREFUL!  before you can draw pictures using this VBObox contents, 
//  you must call this VBObox object's switchToMe() function too!
//--------------------
// a) Compile,link,upload shaders-----------------------------------------------
	this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
	if (!this.shaderLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create executable Shaders on the GPU. Bye!');
    return;
  }
// CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
//  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}

	gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())

// b) Create VBO on GPU, fill it------------------------------------------------
	this.vboLoc = gl.createBuffer();	
  if (!this.vboLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create VBO in GPU. Bye!'); 
    return;
  }
  
  // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
  //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
  // (positions, colors, normals, etc), or 
  //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
  // that each select one vertex from a vertex array stored in another VBO.
  gl.bindBuffer(gl.ARRAY_BUFFER,	      // GLenum 'target' for this GPU buffer 
  								this.vboLoc);				  // the ID# the GPU uses for this buffer.
  											
  // Fill the GPU's newly-created VBO object with the vertex data we stored in
  //  our 'vboContents' member (JavaScript Float32Array object).
  //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
  //	 use gl.bufferSubData() to modify VBO contents without changing VBO size)
  gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
 					 				this.vboContents, 		// JavaScript Float32Array
  							 	gl.STATIC_DRAW);			// Usage hint.  
  //	The 'hint' helps GPU allocate its shared memory for best speed & efficiency
  //	(see OpenGL ES specification for more info).  Your choices are:
  //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents rarely or never change.
  //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents may change often as our program runs.
  //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
  // 			times and then discarded; for rapidly supplied & consumed VBOs.

// c1) Find All Attributes:-----------------------------------------------------
//  Find & save the GPU location of all our shaders' attribute-variables and 
//  uniform-variables (for switchToMe(), adjust(), draw(), reload(), etc.)
  this.a_Pos1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Position');
  if(this.a_Pos1Loc < 0) {
    console.log(this.constructor.name + 
    						'.init() Failed to get GPU location of attribute a_Position');
    return -1;	// error exit.
  }
 	this.a_Colr1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Color');
  if(this.a_Colr1Loc < 0) {
    console.log(this.a_Colr1Loc)
    console.log(this.constructor.name + 
    						'.init() failed to get the GPU location of attribute a_Color');
    return -1;	// error exit.
  }
  this.a_Normal1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Normal');
  if(this.a_Normal1Loc < 0) {
    console.log(this.constructor.name + 
	    					'.init() failed to get the GPU location of attribute a_Normal');
	  return -1;	// error exit.
  }
  // c2) Find All Uniforms:-----------------------------------------------------
  //Get GPU storage location for each uniform var used in our shader programs: 
 this.u_ModelMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');
  if (!this.u_ModelMatrixLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_ModelMatrix uniform');
    return;
  }
  this.u_NormalMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_NormalMatrix');
  if (!this.u_NormalMatrixLoc){
    console.log('Failed to get GPU storage location for u_NormalMatrix');
		return;
  }

  this.u_ViewMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_ViewMatrix');
  if  (!this.u_ViewMatrixLoc){
    console.log('Failed to get GPU storage location for u_NormalMatrix');
		return;
  }

  this.u_ProjectionMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_ProjectionMatrix');
  if  (!this.u_ProjectionMatrixLoc){
    console.log('Failed to get GPU storage location for u_NormalMatrix');
		return;
  }

  this.KaLoc = gl.getUniformLocation(this.shaderLoc, 'Ka');
  if (!this.KaLoc){
    console.log('Failed to get GPU storage location for u_NormalMatrix');
		return;
  }

  this.KdLoc = gl.getUniformLocation(this.shaderLoc, 'Kd');
  if (!this.KdLoc){
    console.log('Failed to get GPU storage location for u_NormalMatrix');
		return;
  }

  this.KsLoc = gl.getUniformLocation(this.shaderLoc, 'Ks');
  if (!this.KsLoc){
    console.log('Failed to get GPU storage location for u_NormalMatrix');
		return;
  }

  this.IaLoc = gl.getUniformLocation(this.shaderLoc, 'Ia');
  if (!this.IaLoc){
    console.log('Failed to get GPU storage location for u_NormalMatrix');
		return;
  }

  this.IdLoc = gl.getUniformLocation(this.shaderLoc, 'Id');
  if (!this.IdLoc){
    console.log('Failed to get GPU storage location for u_NormalMatrix');
		return;
  }

  this.cameraPositionLoc = gl.getUniformLocation(this.shaderLoc, 'cameraPosition');
  if (!this.cameraPositionLoc){
    console.log('Failed to get GPU storage location for cameraPosition');
		return;
  }

  this.shininessValLoc = gl.getUniformLocation(this.shaderLoc, 'shininessVal');
  if (!this.shininessValLoc){
    console.log('Failed to get Shininess');
  }

  this.IsLoc = gl.getUniformLocation(this.shaderLoc, 'Is');
  if (!this.IsLoc){
    console.log('Failed to get GPU storage location for u_NormalMatrix');
		return;
  }

  

  this.lightPositionLoc = gl.getUniformLocation(this.shaderLoc, 'lightPos');
  if (!this.lightPositionLoc){
    console.log('Failed to get GPU storage location for u_NormalMatrix');
		return;
  }

  this.phongLoc = gl.getUniformLocation(this.shaderLoc, 'phong');
  if (!this.phongLoc){
    console.log('Failed to get phong loc')
  }
  this.specifiedIaLoc = gl.getUniformLocation(this.shaderLoc, 'specifiedIa');
  if (!this.specifiedIaLoc){
    console.log('Freak')
  }
  this.specifiedIdLoc = gl.getUniformLocation(this.shaderLoc, 'specifiedId');
  if (!this.specifiedIdLoc){
    console.log('Freak')
  }
  this.specifiedIsLoc = gl.getUniformLocation(this.shaderLoc, 'specifiedIs');
  if (!this.specifiedIsLoc){
    console.log('Freak')
  }
  this.lightSpecifiedLoc = gl.getUniformLocation(this.shaderLoc, 'lightSpecified');
  if (!this.lightSpecifiedLoc){
    console.log('Freak')
  }
  
  
  
}

VBObox1.prototype.switchToMe = function () {
//==============================================================================
// Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
//
// We only do this AFTER we called the init() function, which does the one-time-
// only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
// even then, you are STILL not ready to draw our VBObox's contents onscreen!
// We must also first complete these steps:
//  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
//  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
//  c) tell the GPU to connect the shader program's attributes to that VBO.

// a) select our shader program:
  gl.useProgram(this.shaderLoc);	
//		Each call to useProgram() selects a shader program from the GPU memory,
// but that's all -- it does nothing else!  Any previously used shader program's 
// connections to attributes and uniforms are now invalid, and thus we must now
// establish new connections between our shader program's attributes and the VBO
// we wish to use.  
  
// b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
//  instead connect to our own already-created-&-filled VBO.  This new VBO can 
//    supply values to use as attributes in our newly-selected shader program:
	gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
										this.vboLoc);			// the ID# the GPU uses for our VBO.

// c) connect our newly-bound VBO to supply attribute variable values for each
// vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
// this sets up data paths from VBO to our shader units:
  // 	Here's how to use the almost-identical OpenGL version of this function:
	//		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
  gl.vertexAttribPointer(
		this.a_Pos1Loc,//index == ID# for the attribute var in GLSL shader pgm;
		this.vboFcount_a_Pos1, // # of floats used by this attribute: 1,2,3 or 4?
		gl.FLOAT,		  // type == what data type did we use for those numbers?
		false,				// isNormalized == are these fixed-point values that we need
									//									normalize before use? true or false
		this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
		              // stored attrib for this vertex to the same stored attrib
		              //  for the next vertex in our VBO.  This is usually the 
									// number of bytes used to store one complete vertex.  If set 
									// to zero, the GPU gets attribute values sequentially from 
									// VBO, starting at 'Offset'.	
									// (Our vertex size in bytes: 4 floats for pos + 3 for color)
		this.vboOffset_a_Pos1);						
		              // Offset == how many bytes from START of buffer to the first
  								// value we will actually use?  (we start with position).
  gl.vertexAttribPointer(this.a_Colr1Loc, this.vboFcount_a_Colr1,
                         gl.FLOAT, false, 
  						           this.vboStride,  this.vboOffset_a_Colr1);
  gl.vertexAttribPointer(this.a_Normal1Loc,this.vboFcount_a_Normal1, 
                         gl.FLOAT, false, 
							           this.vboStride,	this.vboOffset_a_Normal1);	
  //-- Enable this assignment of the attribute to its' VBO source:
  gl.enableVertexAttribArray(this.a_Pos1Loc);
  gl.enableVertexAttribArray(this.a_Colr1Loc);
  gl.enableVertexAttribArray(this.a_Normal1Loc);
}

VBObox1.prototype.isReady = function() {
//==============================================================================
// Returns 'true' if our WebGL rendering context ('gl') is ready to render using
// this objects VBO and shader program; else return false.
// see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter

var isOK = true;

  if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
    console.log(this.constructor.name + 
    						'.isReady() false: shader program at this.shaderLoc not in use!');
    isOK = false;
  }
  if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
      console.log(this.constructor.name + 
  						'.isReady() false: vbo at this.vboLoc not in use!');
    isOK = false;
  }
  return isOK;
}

VBObox1.prototype.adjust = function() {
//==============================================================================
// Update the GPU to newer, current values we now store for 'uniform' vars on 
// the GPU; and (if needed) update each attribute's stride and offset in VBO.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.adjust() call you needed to call this.switchToMe()!!');
  }
	// Adjust values for our uniforms,
  //this.ModelMatrix.setRotate(g_angleNow1, 0, 0, 1);	// -spin drawing axes,
  //this.ModelMatrix.translate(0.35, -0.15, 0);						// then translate them.
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  var canvas = document.getElementById('webgl');
// set all the colors

  this.lightPosition = globalLightPosition;
 
  this.Ka = new Vector3([0.2, 0.2, 0.2]);
  this.Kd = new Vector3([1.0, 0.5, 0.5]);
  this.Ks = new Vector3([0.9, 0.9, 0.9]);
  this.Ia = new Vector3([0.4, 0.2, 0.2]);
  this.Id = new Vector3([0.4, 0.1, 0.5]);
  this.Is = new Vector3([0.4, 0.3, 0.3]);
  this.cameraPosition = new Vector3([cop_x, cop_y, cop_z]);
  this.shininessVal = 50.0;
  this.phong = globalPhong; //1 for blinn-phong
  gl.uniform1f(this.phongLoc, this.phong);
  gl.uniform3fv(this.KaLoc, this.Ka.elements);
  gl.uniform3fv(this.KdLoc, this.Kd.elements);
  gl.uniform3fv(this.IaLoc, this.Ia.elements);
  gl.uniform3fv(this.IdLoc, this.Id.elements);
  gl.uniform3fv(this.IsLoc,this.Is.elements);
  gl.uniform3fv(this.KsLoc, this.Ks.elements);
  gl.uniform1f(this.shininessValLoc, this.shininessVal);
  gl.uniform3fv(this.lightPositionLoc, this.lightPosition.elements);
  gl.uniform3fv(this.cameraPositionLoc, this.cameraPosition.elements);
  gl.uniform3fv(this.specifiedIaLoc, globalSpecifiedIa);
  gl.uniform3fv(this.specifiedIdLoc, globalSpecifiedId);
  gl.uniform3fv(this.specifiedIsLoc, globalSpecifiedIs);
  gl.uniform1f(this.lightSpecifiedLoc, globalLightSpecified);

  this.ModelMatrix.setIdentity();
  this.ViewMatrix.setIdentity();
  this.ProjectionMatrix.setIdentity();
  this.ProjectionMatrix.perspective(35.0, vpAspect, 1.0, 100.0);
  //this.ViewMatrix.lookAt(10.0, 0.0, 0.0,
  //                        0.0, 0.0, 0.0,
  //                        0, 0, 1);
  this.ViewMatrix.lookAt(cop_x, cop_y, cop_z,
                       cop_x + Math.cos(theta), cop_y + Math.sin(theta), dtilt,
                       0, 0, 1);
  this.NormalMatrix.setInverseOf(this.ModelMatrix);
  this.NormalMatrix.transpose();
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
  gl.uniformMatrix4fv(this.u_ViewMatrixLoc,	// GPU location of the uniform
    false, 										// use matrix transpose instead?
    this.ViewMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_ProjectionMatrixLoc,	// GPU location of the uniform
    false, 										// use matrix transpose instead?
    this.ProjectionMatrix.elements);	// send data from Javascript.
gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);


}
VBObox1.prototype.getMaterial = function(){
  switch(materialNumber){
    
    case 0:
      this.sendDifferentMaterial([0.2, 0.2, 0.2], [1.0, 0.5, 0.5], [0.9, 0.9, 0.9], [0.4, 0.2, 0.2], [0.4, 0.1, 0.5], [0.4, 0.3, 0.3], 55);
      break;
    case 1:
      this.sendDifferentMaterial([0.73, 0.5, 0.47], [0.4, 0.24, 0.4], [0.3, 0.3, 0.23], [0.54, 0.1, 0.3], [0.24, 1.0, 0.1], [0.5, 0.2, 0.5], 20);
      break;
    case 2:
      this.sendDifferentMaterial([0.3, 0.35, 0.57], [0.314, 0.234, 0.734], [0.31, 0.43, 0.13], [0.74, 0.1, 0.3], [0.4, 0.45, 0.1], [0.36, 0.6, 0.2], 2);
      break;
    case 3:
      this.sendDifferentMaterial([0.23, 0.25, 0.57], [0.24, 0.24, 0.24], [0.13, 0.43, 0.13], [0.54, 0.31, 0.32], [0.4, 0.9, 0.1], [0.0, 0.12, 0.46], 65);
      break;
    case 4:
      this.sendDifferentMaterial([0.5, 0.0, 0.4], [0.2, 0.4, 0.4], [0.3, 0.3, 0.3], [0.0, 0.0, 0.0], [0.44, 0.32, 0.15], [1.0, 0.0, 0.0], 31);
      break;
    case 5:
      this.sendDifferentMaterial([0.73, 0.75, 0.77], [0.14, 0.4, 0.64], [0.33, 0.34, 0.13], [0.46, 0.14, 0.33], [0.464, .210, 0.14], [.68, 0.5, 0.0], 24);
      break;
    case 6:
      this.sendDifferentMaterial([0.23, 0.65, 0.17], [0.74, 0.34, 0.44], [0.83, 0.03, 0.93], [0.54, 0.1, 0.13], [0.64, 1.0, 0.51], [0.61, 0.40, 0.60], 7);
      break;
    case 7:
      this.sendDifferentMaterial([0.31, 0.15, 0.71], [0.14, 0.41, 0.14], [0.31, 0.13, 0.31], [0.14, 0.11, 0.13], [0.41, 0.4, 0.5], [0.3, 0.5, 0.1], 15);
      break;
    case 8:
      this.sendDifferentMaterial([0.4, 0.1, 0.5], [0.1, 0.5, 0.14], [0.3, 0.8, 0.3], [0.4, 0.8, 0.3], [0.8, 1.0, 0.1], [1.0, 0.8, 0.0], 5);
      break;
    case 9:
      this.sendDifferentMaterial([0.323, 0.552, 0.732], [0.461, 0.134, 0.46], [0.357, 0.32, 0.398], [0.74, 0.51, 0.3], [0.44, 1.0, 0.1], [1.0, 0.0, 0.0], 51);
      break;
    case 10:
      this.sendDifferentMaterial([0.33, 0.54, 0.17], [0.94, 0.14, 0.4], [0.13, 0.33, 0.43], [0.4, 0.71, 0.3], [0.4, 0.75, 0.1], [0.5, 0.30, 0.60], 12);
      
  }
}
VBObox1.prototype.draw = function() {
//=============================================================================
// Send commands to GPU to select and render current VBObox contents.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.draw() call you needed to call this.switchToMe()!!');
  }
  
  // ----------------------------Draw the contents of the currently-bound VBO:


pushMatrix(this.ModelMatrix);  // SAVE world drawing coords.
    //--------Draw Spinning Sphere
    this.ModelMatrix.translate( 0.0, 0.0, 0.0); // 'set' means DISCARD old matrix,
    						// (drawing axes centered in CVV), and then make new
    						// drawing axes moved to the lower-left corner of CVV.
                          // to match WebGL display canvas.
    this.ModelMatrix.scale(0.3, 0.3, 0.3);
    						// Make it smaller:
    this.ModelMatrix.rotate(g_angleNow0, 1, 1, 0);  // Spin on XY diagonal axis
  	// Drawing:		
  	// Pass our current matrix to the vertex shaders:
    this.NormalMatrix.setInverseOf(this.ModelMatrix);
    this.NormalMatrix.transpose();
    this.getMaterial();
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
    		// Draw just the sphere's vertices
    gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
    							sphStart/10,	// start at this vertex number, and 
    							sphVerts.length/10);	// draw this many vertices.
this.ModelMatrix = popMatrix();  // RESTORE 'world' drawing coords.
var floatsPerVertex = 10;
pushMatrix(this.ModelMatrix);
			this.ModelMatrix.translate(2.5,-2.0,1);
			this.ModelMatrix.rotate(90, 1, 0, 0);
			this.ModelMatrix.rotate(115, 0, 1, 0);
			this.ModelMatrix.scale(0.4, 0.4, .8);
      this.ModelMatrix.rotate(g_angleNow0, 0, 0, 1);
      this.NormalMatrix.setInverseOf(this.ModelMatrix);
      this.NormalMatrix.transpose();
      this.sendDifferentMaterial([0.2, 0.2, 0.2], [1.0, 0.5, 0.5], [0.9, 0.9, 0.9], [0.4, 0.2, 0.2], [0.4, 0.1, 0.5], [0.4, 0.3, 0.3], 55);
      gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
			gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
			gl.drawArrays(gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
			pushMatrix(this.ModelMatrix);
          this.ModelMatrix.translate(0.5,0,-.5)
				  this.ModelMatrix.scale(0.5, 0.5, 0.5);
				  this.ModelMatrix.rotate(-g_angleNow1, 0, 1, 0);
				  this.ModelMatrix.translate(-0.5,0,-0.5);
          this.NormalMatrix.setInverseOf(this.ModelMatrix);
          this.NormalMatrix.transpose();
          this.sendDifferentMaterial([0.5, 0.5, 0.5], [0.6, 0.6, 0.6], [0.5, 0.5, 0.5], [0.9, 0.1, 0.1], [0.4, 0.7, 0.4], [1.0, 1.0, 1.0], 2.0);
          gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
          gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
          gl.drawArrays(gl.TRIANGLES, cubeStart/10, cubeVerts.length/10); 
        this.ModelMatrix = popMatrix();
      pushMatrix(this.ModelMatrix);
        this.ModelMatrix.translate(-0.5,0,-.5)
        this.ModelMatrix.scale(0.5, 0.5, 0.5);
        this.ModelMatrix.rotate(-g_angleNow1, 0, 1, 0);
        this.ModelMatrix.translate(-0.5,0,-0.5);
        this.NormalMatrix.setInverseOf(this.ModelMatrix);
        this.NormalMatrix.transpose();
        this.sendDifferentMaterial([0.5, 0.5, 0.5], [0.6, 0.6, 0.6], [0.5, 0.5, 0.5], [0.9, 0.1, 0.1], [0.4, 0.7, 0.4], [1.0, 1.0, 1.0], 2.0);
        gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
        gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
        gl.drawArrays(gl.TRIANGLES, cubeStart/10, cubeVerts.length/10); 
      this.ModelMatrix = popMatrix();
      pushMatrix(this.ModelMatrix);
				this.ModelMatrix.translate(0, 0, 0.60);
				this.ModelMatrix.scale(0.5, 0.5, 0.25);
        this.NormalMatrix.setInverseOf(this.ModelMatrix);
        this.NormalMatrix.transpose();
        gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
				gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
				gl.drawArrays(gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
			  this.ModelMatrix = popMatrix();
			pushMatrix(this.ModelMatrix);
				this.ModelMatrix.translate(0.4, 0, 0.3);
				this.ModelMatrix.scale(1.5, 0.5, 0.25);
				this.ModelMatrix.rotate(-20, 0, 1, 0);
				this.ModelMatrix.rotate(wingAngle, 0, 1, 0);
				this.ModelMatrix.translate(0.6, 0, -0.4);
        this.NormalMatrix.setInverseOf(this.ModelMatrix);
        this.NormalMatrix.transpose();
        gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
				gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
				gl.drawArrays(gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
			this.ModelMatrix = popMatrix();
			pushMatrix(this.ModelMatrix);
				this.ModelMatrix.translate(-0.4, 0, 0.3);
				this.ModelMatrix.scale(1.5, 0.5, 0.25);
				this.ModelMatrix.rotate(20, 0, 1, 0);
				this.ModelMatrix.rotate(-wingAngle, 0, 1, 0);
				this.ModelMatrix.translate(-0.6, 0, -0.4);
        this.NormalMatrix.setInverseOf(this.ModelMatrix);
        this.NormalMatrix.transpose();
        gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
				gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
				gl.drawArrays(gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
			this.ModelMatrix = popMatrix();
	this.ModelMatrix = popMatrix();

//tiles  
pushMatrix(this.ModelMatrix);
      this.ModelMatrix.translate (1.0, 1.0, 0.0);
      this.ModelMatrix.scale(0.3, 0.3, 0.3);
      this.ModelMatrix.rotate(g_angleNow0, 0, 1, 0);
      this.NormalMatrix.setInverseOf(this.ModelMatrix);
      this.NormalMatrix.transpose();
      gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
      gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
      gl.drawArrays(gl.TRIANGLES, cubeStart/10, cubeVerts.length/10);
      pushMatrix(this.ModelMatrix);
        this.ModelMatrix.translate(0, 1, 0);
        this.ModelMatrix.rotate(g_angleNow0, 0, 1, 0);
        this.NormalMatrix.setInverseOf(this.ModelMatrix);
        this.NormalMatrix.transpose();
        this.sendDifferentMaterial([0.5, 0.5, 0.5], [0.6, 0.6, 0.6], [0.7, 0.7, 0.7], [0.0, 0.3, 0.7], [0.4, 0.7, 0.4], [1.0, 1.0, 1.0], 12.0);
        gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
        gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
        gl.drawArrays(gl.TRIANGLES, cubeStart/10, cubeVerts.length/10);
      this.ModelMatrix = popMatrix();
      pushMatrix(this.ModelMatrix);
        this.ModelMatrix.translate(1, 0, 0);
        this.ModelMatrix.rotate(g_angleNow0, 1, 0, 0);
        this.NormalMatrix.setInverseOf(this.ModelMatrix);
        this.NormalMatrix.transpose();
        this.sendDifferentMaterial([0.5, 0.5, 0.5], [0.6, 0.6, 0.6], [0.05, 0.05, 0.05], [0.6, 0.3, 0.1], [0.4, 0.7, 0.4], [1.0, 1.0, 1.0], 2.0);
        gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
        gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
        gl.drawArrays(gl.TRIANGLES, cubeStart/10, cubeVerts.length/10);
        pushMatrix(this.ModelMatrix);
          this.ModelMatrix.translate(0.5,0,.5)
				  this.ModelMatrix.scale(0.5, 0.5, 0.5);
				  this.ModelMatrix.rotate(g_angleNow1, 0, 1, 0);
				  this.ModelMatrix.translate(-0.5,0,-0.5);
          this.NormalMatrix.setInverseOf(this.ModelMatrix);
          this.NormalMatrix.transpose();
          this.sendDifferentMaterial([0.5, 0.5, 0.5], [0.6, 0.6, 0.6], [0.5, 0.5, 0.5], [0.9, 0.1, 0.1], [0.4, 0.7, 0.4], [1.0, 1.0, 1.0], 2.0);
          gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
          gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
          gl.drawArrays(gl.TRIANGLES, cubeStart/10, cubeVerts.length/10); 
          
        this.ModelMatrix = popMatrix();
      this.ModelMatrix = popMatrix();
      pushMatrix(this.ModelMatrix);
        this.ModelMatrix.translate(0, -1, 0);
        this.ModelMatrix.rotate(g_angleNow0, 0, 1, 0);
        this.NormalMatrix.setInverseOf(this.ModelMatrix);
        this.NormalMatrix.transpose();
        this.sendDifferentMaterial([0.5, 0.5, 0.5], [0.3, 0.6, 0.7], [0.35, 0.35, 0.35], [0.2, 0.5, 0.1], [0.2, 0.7, 0.4], [1.0, 1.0, 1.0], 50.0);
        gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
        gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
        gl.drawArrays(gl.TRIANGLES, cubeStart/10, cubeVerts.length/10);
      this.ModelMatrix = popMatrix();
      pushMatrix(this.ModelMatrix);
        this.ModelMatrix.translate(-1, 0, 0);
        this.ModelMatrix.rotate(g_angleNow0, -1, 0, 0);
        this.NormalMatrix.setInverseOf(this.ModelMatrix);
        this.NormalMatrix.transpose();
        this.sendDifferentMaterial([0.5, 0.5, 0.5], [0.4, 0.3, 0.8], [0.1, 0.05, 0.05], [0.6, 0.3, 0.1], [0.4, 0.7, 0.4], [1.0, 1.0, 1.0], 12.0);
        gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
        gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
        gl.drawArrays(gl.TRIANGLES, cubeStart/10, cubeVerts.length/10);
      this.ModelMatrix = popMatrix();
      

this.ModelMatrix = popMatrix();

pushMatrix(this.ModelMatrix);
    this.ModelMatrix.translate(-0.7, -0.6, 0.4); 
    this.ModelMatrix.scale(0.25, 0.25, 0.25);
    this.ModelMatrix.rotate(g_angleNow0, 1, 1, 0);  
    this.NormalMatrix.setInverseOf(this.ModelMatrix);
    this.NormalMatrix.transpose();
    this.sendDifferentMaterial([0.5, 0.5, 0.5], [0.4, 0.3, 0.8], [0.1, 0.39, 0.35], [0.6, 0.3, 0.1], [0.4, 0.2, 0.4], [0.3, 0.1, 0.3], 12.0);
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
    gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP,
                  sphStart/10,	
                  sphVerts.length/10);
    pushMatrix(this.ModelMatrix);
      this.ModelMatrix.translate(0.0, 0.0, 1.25);
      this.ModelMatrix.scale(0.75, 0.75, 0.75);
      this.ModelMatrix.rotate(g_angleNow0, 1, 1, 0);
      //this.ModelMatrix.translate(0.0, 0.0, -1.0);
      this.NormalMatrix.setInverseOf(this.ModelMatrix);
      this.NormalMatrix.transpose();
      this.sendDifferentMaterial([0.5, 0.5, 0.5], [0.4, 0.3, 0.8], [0.31, 0.39, 0.35], [0.2, 0.3, 0.1], [0.5, 0.2, 0.4], [0.3, 0.6, 0.3], 12.0);
      gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
      gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
      gl.drawArrays(gl.TRIANGLES,
        cubeStart/10,	
        cubeVerts.length/10);
      pushMatrix(this.ModelMatrix);
        this.ModelMatrix.translate(0.0, 0.0, 0.9);
        this.ModelMatrix.scale(0.75, 0.75, 0.75);
        this.ModelMatrix.rotate(-g_angleNow0, 0, 0, 1);
        this.NormalMatrix.setInverseOf(this.ModelMatrix);
        this.NormalMatrix.transpose();
        this.sendDifferentMaterial([0.5, 0.5, 0.5], [0.4, 0.1, 0.8], [0.1, 0.39, 0.35], [0.2, 0.3, 0.7], [0.4, 0.2, 0.4], [0.3, 0.1, 0.3], 12.0);
        gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
        gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
        gl.drawArrays(gl.TRIANGLES,
          cubeStart/10,	
          cubeVerts.length/10);
          pushMatrix(this.ModelMatrix);
          this.ModelMatrix.translate(0.5,0,.5)
				  this.ModelMatrix.scale(0.5, 0.5, 0.5);
				  this.ModelMatrix.rotate(g_angleNow1, 0, 1, 0);
				  this.ModelMatrix.translate(-0.5,0,-0.5);
          this.NormalMatrix.setInverseOf(this.ModelMatrix);
          this.NormalMatrix.transpose();
          this.sendDifferentMaterial([0.5, 0.5, 0.5], [0.6, 0.6, 0.6], [0.5, 0.5, 0.5], [0.9, 0.1, 0.1], [0.4, 0.7, 0.4], [1.0, 1.0, 1.0], 2.0);
          gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
          gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
          gl.drawArrays(gl.TRIANGLES, cubeStart/10, cubeVerts.length/10); 
        this.ModelMatrix = popMatrix();
      this.ModelMatrix = popMatrix();
    this.ModelMatrix = popMatrix();

    pushMatrix(this.ModelMatrix);
      this.ModelMatrix.translate(1.25, 0.0, 0.0);
      this.ModelMatrix.scale(0.75, 0.75, 0.75);
      this.ModelMatrix.rotate(g_angleNow0, 1, 1, 0);
      //this.ModelMatrix.translate(0.0, 0.0, -1.0);
      this.NormalMatrix.setInverseOf(this.ModelMatrix);
      this.NormalMatrix.transpose();
      gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
      gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
      gl.drawArrays(gl.TRIANGLES,
        cubeStart/10,	
        cubeVerts.length/10);
      pushMatrix(this.ModelMatrix);
        this.ModelMatrix.translate(0.9, 0.0, 0.00);
        this.ModelMatrix.scale(0.75, 0.75, 0.75);
        this.ModelMatrix.rotate(-g_angleNow0, 1, 0, 0);
        this.NormalMatrix.setInverseOf(this.ModelMatrix);
        this.NormalMatrix.transpose();
        gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
        gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
        gl.drawArrays(gl.TRIANGLES,
          cubeStart/10,	
          cubeVerts.length/10);

      this.ModelMatrix = popMatrix();
    this.ModelMatrix = popMatrix();

this.ModelMatrix = popMatrix();
}


VBObox1.prototype.reload = function() {
//=============================================================================
// Over-write current values in the GPU for our already-created VBO: use 
// gl.bufferSubData() call to re-transfer some or all of our Float32Array 
// contents to our VBO without changing any GPU memory allocations.

 gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                  0,                  // byte offset to where data replacement
                                      // begins in the VBO.
 					 				this.vboContents);   // the JS source-data array used to fill VBO
}

/*
VBObox1.prototype.empty = function() {
//=============================================================================
// Remove/release all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  However, make sure this step is reversible by a call to 
// 'restoreMe()': be sure to retain all our Float32Array data, all values for 
// uniforms, all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}

VBObox1.prototype.restore = function() {
//=============================================================================
// Replace/restore all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
// all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}
*/

//=============================================================================
//=============================================================================
function VBObox2() {
//=============================================================================
//=============================================================================
// CONSTRUCTOR for one re-usable 'VBObox2' object that holds all data and fcns
// needed to render vertices from one Vertex Buffer Object (VBO) using one 
// separate shader program (a vertex-shader & fragment-shader pair) and one
// set of 'uniform' variables.

// Constructor goal: 
// Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
// written into code) in all other VBObox functions. Keeping all these (initial)
// values here, in this one coonstrutor function, ensures we can change them 
// easily WITHOUT disrupting any other code, ever!
  
	this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
  'precision highp float;\n' +				// req'd in OpenGL ES if we use 'float'
  //
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n'+
  'uniform mat4 u_ProjectionMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'attribute vec4 a_Position;\n' +
  'attribute vec3 a_Color;\n'+
  'attribute vec3 a_Normal; \n' +
  'varying vec3 transformedPosition;\n'+
  'varying vec3 transformedNormal;\n'+
  /*'varying vec3 v_norm;\n' +
  'varying vec3 v_toLight;\n' +
  'varying vec3 FragPos;\n'+
  'void main() {\n' +
  '  gl_Position = u_ProjectionMatrix * u_ViewMatrix* u_ModelMatrix * a_Position;\n' +
  '  v_norm = normalize(vec3(u_NormalMatrix * vec4(a_Normal,1.0+0.0*a_Color[0])));\n' +
  '  v_toLight = normalize(vec3(lightPos - vec3(u_ModelMatrix*(a_Position))));\n' +
  '  FragPos = vec3(u_ModelMatrix*a_Position);\n'+*/
  'void main() {\n' +
  ' float dummy = a_Color[0];\n'+
  ' dummy = dummy-dummy;\n'+
  ' gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n'+
  ' transformedPosition = vec3(u_ModelMatrix * a_Position);\n'+
  ' transformedNormal = vec3(u_NormalMatrix * vec4(a_Normal, 0.0));\n'+
  ' }\n';

	this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
  'precision mediump float;\n' +
  'uniform vec3 Kd;\n'+
  'uniform vec3 Ka;\n' +
  'uniform vec3 Ks;\n' +
  'uniform float shininessVal; \n'+
  'uniform vec3 Ia;\n' +
  'uniform vec3 Id;\n' +
  'uniform vec3 Is;\n' +
  'varying vec3 transformedPosition;\n'+
  'varying vec3 transformedNormal;\n' +
  'uniform vec3 cameraPos;\n'+
  'uniform vec3 lightPos;\n'+
  'uniform float phong;\n'+
  'uniform float lightOn;\n'+
  'uniform float lightSpecified;\n'+
  'uniform vec3 specifiedIa;\n'+
  'uniform vec3 specifiedId;\n'+
  'uniform vec3 specifiedIs;\n'+
  'void main() {\n' +
  ' float dummy = Kd[0] + Ka[0] + Ks[0] + shininessVal + Ia[0] + Id[0] + Is[0] + lightPos[0]+cameraPos[0];\n'+
  ' dummy = dummy-dummy;\n'+
  ' vec3 N_vec = normalize(transformedNormal);\n'+
  ' vec3 L_vec = normalize(lightPos - transformedPosition);\n' +
  ' float NdotL = max(dot(N_vec, L_vec), 0.0);\n'+
  ' vec3 V = normalize(cameraPos - transformedPosition);\n'+
  ' vec3 R = reflect(-L_vec, N_vec);\n'+
  ' float specAngle = max(dot(R,V), 0.0);\n'+
  ' float specularTerm = pow(specAngle,shininessVal);\n'+
  ' vec3 diffuse = vec3(NdotL*Kd[0]*Id[0], NdotL*Kd[1]*Id[1], NdotL*Kd[2]*Id[2]);\n'+
  ' vec3 ambient = vec3(Ka[0]*Ia[0], Ka[1]*Ia[1], Ka[2]*Ia[2]);\n'+
  ' if (phong!=0.0) {\n'+
  '   vec3 H = normalize(L_vec + V);\n'+
  '   specAngle = max(dot(N_vec, H), 0.0);\n'+
  '   specularTerm = pow(specAngle, shininessVal);\n'+
  ' }\n'+
  ' vec3 specular = vec3(Ks[0]*Is[0]*specularTerm, Ks[1]*Is[1]*specularTerm, Ks[2]*Is[2]*specularTerm);\n'+
  ' if (lightSpecified == 1.0){\n'+
  '   diffuse = vec3(NdotL*Kd[0]*specifiedId[0], NdotL*Kd[1]*specifiedId[1], NdotL*Kd[2]*specifiedId[2]);\n'+
  '   ambient = vec3(Ka[0]*specifiedIa[0], Ka[1]*specifiedIa[1], Ka[2]*specifiedIa[2]);\n'+
  '   specular = vec3(Ks[0]*specifiedIs[0]*specularTerm, Ks[1]*specifiedIs[1]*specularTerm, Ks[2]*specifiedIs[2]*specularTerm);\n'+
  '}\n'+
  ' gl_FragColor = vec4(diffuse+ambient+specular, 1.0);\n'+
  '}\n';
  /*'void main() {\n' +
  ' float dummy = Kd[0] + Ka[0] + Ks[0] + shininessVal + Ia[0] + Id[0] + Is[0];\n'+
  ' dummy = dummy-dummy;\n'+
  ' vec3 V = normalize(cameraPos - FragPos);\n'+
  ' vec3 R = reflect(-v_toLight, v_norm);\n' +
  ' float spec = pow(max(dot(V, R), 0.0), shininessVal);\n'+
  '  float diff = min(max(dummy+dot(normalize(v_norm), (normalize (v_toLight))), 0.0), 1.0);\n'+
  '  gl_FragColor = vec4(Kd[0]*diff*Id[0]+Ka[0]*Ia[0]+Is[0]*Ks[0]*spec, Kd[1]*diff*Id[1]+Ka[1]*Ia[1]+ Is[1]*Ks[1]*spec, Kd[2]*diff*Id[2]+Ka[2]*Ia[2]+ Is[2]*Ks[2]*spec, 1.0);\n' +  
  // 'gl_FragColor = vec4(spec, spec, spec, 1.0);\n' +
  '}\n';*/

	makeSphere();
  makeCube();
	var mySiz = (sphVerts.length+cubeVerts.length);
  floatsPerVertex1 = 10;
  this.vboVerts = mySiz / floatsPerVertex1;
  				
  this.vboContents = new Float32Array(mySiz);
  var i = 0;
  sphStart = i;
	for(j=0; j<sphVerts.length; i++, j++){
		this.vboContents[i] = sphVerts[j];
  }
  cubeStart = i;
  for(j=0; j<cubeVerts.length; i++, j++){
		this.vboContents[i] = cubeVerts[j];
  }
  
  console.log(this.vboContents);
  
	
	this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;  
	                              // bytes req'd by 1 vboContents array element;
																// (why? used to compute stride and offset 
																// in bytes for vertexAttribPointer() calls)
  this.vboBytes = this.vboContents.length * this.FSIZE;               
                                // (#  of floats in vboContents array) * 
                                // (# of bytes/float).
	this.vboStride = this.vboBytes / this.vboVerts;     
	                              // (== # of bytes to store one complete vertex).
	                              // From any attrib in a given vertex in the VBO, 
	                              // move forward by 'vboStride' bytes to arrive 
	                              // at the same attrib for the next vertex.
	                               
	            //----------------------Attribute sizes
  this.vboFcount_a_Pos1 =  4;    // # of floats in the VBO needed to store the
                                // attribute named a_Pos1. (4: x,y,z,w values)
  this.vboFcount_a_Colr1 = 3;   // # of floats for this attrib (r,g,b values)
  this.vboFcount_a_Normal1 = 3;  // # of floats for this attrib (just one!)   
  console.assert((this.vboFcount_a_Pos1 +     // check the size of each and
                  this.vboFcount_a_Colr1 +
                  this.vboFcount_a_Normal1) *   // every attribute in our VBO
                  this.FSIZE == this.vboStride, // for agreeement with'stride'
                  "Uh oh! VBObox1.vboStride disagrees with attribute-size values!");
                  
              //----------------------Attribute offsets
	this.vboOffset_a_Pos1 = 0;    //# of bytes from START of vbo to the START
	                              // of 1st a_Pos1 attrib value in vboContents[]
  this.vboOffset_a_Colr1 = (this.vboFcount_a_Pos1) * this.FSIZE;  
                                // == 4 floats * bytes/float
                                //# of bytes from START of vbo to the START
                                // of 1st a_Colr1 attrib value in vboContents[]
  this.vboOffset_a_Normal1 =(this.vboFcount_a_Pos1 +
                            this.vboFcount_a_Colr1) * this.FSIZE; 
                                // == 7 floats * bytes/float
                                // # of bytes from START of vbo to the START
                                // of 1st a_PtSize attrib value in vboContents[]

	            //-----------------------GPU memory locations:                                
	this.vboLoc;									// GPU Location for Vertex Buffer Object, 
	                              // returned by gl.createBuffer() function call
	this.shaderLoc;								// GPU Location for compiled Shader-program  
	                            	// set by compile/link of VERT_SRC and FRAG_SRC.
								          //------Attribute locations in our shaders:
	this.a_Pos1Loc;							  // GPU location: shader 'a_Pos1' attribute
	this.a_Colr1Loc;							// GPU location: shader 'a_Colr1' attribute
	this.a_Normal1Loc;							// GPU location: shader 'a_PtSiz1' attribute
	
	            //---------------------- Uniform locations &values in our shaders
	this.ModelMatrix = new Matrix4();	// Transforms CVV axes to model axes.
	this.u_ModelMatrixLoc;						// GPU location for u_ModelMat uniform

  this.ViewMatrix = new Matrix4();
  this.u_ViewMatrixLoc;

  this.ProjectionMatrix = new Matrix4();
  this.u_ProjectionMatrixLoc;

  this.NormalMatrix = new Matrix4();
  this.u_NormalMatrixLoc;

  this.lightPosition;
  this.lightPositionLoc;

  this.Kd = new Vector3();
  this.KdLoc;

  this.Ka = new Vector3();
  this.KaLoc;

  this.Ks = new Vector3();
  this.KsLoc;

  this.shininessVal;
  this.shininessValLoc;

  this.Ia = new Vector3();
  this.IaLoc;

  this.Id = new Vector3();
  this.IdLoc;

  this.Is = new Vector3();
  this.IsLoc;

  this.phong;
  this.phongLoc;

  this.cameraPosition = new Vector3();
  this.cameraPositionLoc;

  this.specifiedIaLoc;
  this.specifiedIsLoc;
  this.specifiedIdLoc;
  this.lightSpecifiedLoc;

};

VBObox2.prototype.getMaterial = function(){
  switch(materialNumber){
    
    case 0:
      this.sendDifferentMaterial([0.2, 0.2, 0.2], [1.0, 0.5, 0.5], [0.9, 0.9, 0.9], [0.4, 0.2, 0.2], [0.4, 0.1, 0.5], [0.4, 0.3, 0.3], 55);
      break;
    case 1:
      this.sendDifferentMaterial([0.73, 0.5, 0.47], [0.4, 0.24, 0.4], [0.3, 0.3, 0.23], [0.54, 0.1, 0.3], [0.24, 1.0, 0.1], [0.5, 0.2, 0.5], 20);
      break;
    case 2:
      this.sendDifferentMaterial([0.3, 0.35, 0.57], [0.314, 0.234, 0.734], [0.31, 0.43, 0.13], [0.74, 0.1, 0.3], [0.4, 0.45, 0.1], [0.36, 0.6, 0.2], 2);
      break;
    case 3:
      this.sendDifferentMaterial([0.23, 0.25, 0.57], [0.24, 0.24, 0.24], [0.13, 0.43, 0.13], [0.54, 0.31, 0.32], [0.4, 0.9, 0.1], [0.0, 0.12, 0.46], 65);
      break;
    case 4:
      this.sendDifferentMaterial([0.5, 0.0, 0.4], [0.2, 0.4, 0.4], [0.3, 0.3, 0.3], [0.0, 0.0, 0.0], [0.44, 0.32, 0.15], [1.0, 0.0, 0.0], 31);
      break;
    case 5:
      this.sendDifferentMaterial([0.73, 0.75, 0.77], [0.14, 0.4, 0.64], [0.33, 0.34, 0.13], [0.46, 0.14, 0.33], [0.464, .210, 0.14], [.68, 0.5, 0.0], 24);
      break;
    case 6:
      this.sendDifferentMaterial([0.23, 0.65, 0.17], [0.74, 0.34, 0.44], [0.83, 0.03, 0.93], [0.54, 0.1, 0.13], [0.64, 1.0, 0.51], [0.61, 0.40, 0.60], 7);
      break;
    case 7:
      this.sendDifferentMaterial([0.31, 0.15, 0.71], [0.14, 0.41, 0.14], [0.31, 0.13, 0.31], [0.14, 0.11, 0.13], [0.41, 0.4, 0.5], [0.3, 0.5, 0.1], 15);
      break;
    case 8:
      this.sendDifferentMaterial([0.4, 0.1, 0.5], [0.1, 0.5, 0.14], [0.3, 0.8, 0.3], [0.4, 0.8, 0.3], [0.8, 1.0, 0.1], [1.0, 0.8, 0.0], 5);
      break;
    case 9:
      this.sendDifferentMaterial([0.323, 0.552, 0.732], [0.461, 0.134, 0.46], [0.357, 0.32, 0.398], [0.74, 0.51, 0.3], [0.44, 1.0, 0.1], [1.0, 0.0, 0.0], 51);
      break;
    case 10:
      this.sendDifferentMaterial([0.33, 0.54, 0.17], [0.94, 0.14, 0.4], [0.13, 0.33, 0.43], [0.4, 0.71, 0.3], [0.4, 0.75, 0.1], [0.5, 0.30, 0.60], 12);
  }  
  }
VBObox2.prototype.init = function() {
//=============================================================================
// Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
// kept in this VBObox. (This function usually called only once, within main()).
// Specifically:
// a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
//  executable 'program' stored and ready to use inside the GPU.  
// b) create a new VBO object in GPU memory and fill it by transferring in all
//  the vertex data held in our Float32array member 'VBOcontents'. 
// c) Find & save the GPU location of all our shaders' attribute-variables and 
//  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
// 
// CAREFUL!  before you can draw pictures using this VBObox contents, 
//  you must call this VBObox object's switchToMe() function too!

  // a) Compile,link,upload shaders---------------------------------------------
	this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
	if (!this.shaderLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create executable Shaders on the GPU. Bye!');
    return;
  }
  // CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
  //  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}

	gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())

  // b) Create VBO on GPU, fill it----------------------------------------------
	this.vboLoc = gl.createBuffer();	
  if (!this.vboLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create VBO in GPU. Bye!'); 
    return;
  }
  // Specify the purpose of our newly-created VBO.  Your choices are:
  //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
  // (positions, colors, normals, etc), or 
  //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
  // that each select one vertex from a vertex array stored in another VBO.
  gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
  								this.vboLoc);				// the ID# the GPU uses for this buffer.

  // Fill the GPU's newly-created VBO object with the vertex data we stored in
  //  our 'vboContents' member (JavaScript Float32Array object).
  //  (Recall gl.bufferData() will evoke GPU's memory allocation & managemt: use 
  //		gl.bufferSubData() to modify VBO contents without changing VBO size)
  gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
 					 				this.vboContents, 		// JavaScript Float32Array
  							 	gl.STATIC_DRAW);			// Usage hint.
  //	The 'hint' helps GPU allocate its shared memory for best speed & efficiency
  //	(see OpenGL ES specification for more info).  Your choices are:
  //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents rarely or never change.
  //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents may change often as our program runs.
  //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
  // 			times and then discarded; for rapidly supplied & consumed VBOs.

  // c1) Find All Attributes:---------------------------------------------------
  //  Find & save the GPU location of all our shaders' attribute-variables and 
  //  uniform-variables (for switchToMe(), adjust(), draw(), reload(),etc.)
  this.a_Pos1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Position');
  if(this.a_Pos1Loc < 0) {
    console.log(this.constructor.name + 
    						'.init() Failed to get GPU location of attribute a_Position');
    return -1;	// error exit.
  }
 	this.a_Colr1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Color');
  if(this.a_Colr1Loc < 0) {
    console.log(this.a_Colr1Loc)
    console.log(this.constructor.name + 
    						'.init() failed to get the GPU location of attribute a_Color');
    return -1;	// error exit.
  }
  this.a_Normal1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Normal');
  if(this.a_Normal1Loc < 0) {
    console.log(this.constructor.name + 
	    					'.init() failed to get the GPU location of attribute a_Normal');
	  return -1;	// error exit.
  }
  // c2) Find All Uniforms:-----------------------------------------------------
  //Get GPU storage location for each uniform var used in our shader programs: 
 this.u_ModelMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');
  if (!this.u_ModelMatrixLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_ModelMatrix uniform');
    return;
  }
  this.u_NormalMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_NormalMatrix');
  if (!this.u_NormalMatrixLoc){
    console.log('Failed to get GPU storage location for u_NormalMatrix');
		return;
  }

  this.u_ViewMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_ViewMatrix');
  if  (!this.u_ViewMatrixLoc){
    console.log('Failed to get GPU storage location for u_NormalMatrix');
		return;
  }

  this.u_ProjectionMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_ProjectionMatrix');
  if  (!this.u_ProjectionMatrixLoc){
    console.log('Failed to get GPU storage location for u_NormalMatrix');
		return;
  }
  this.lightPositionLoc = gl.getUniformLocation(this.shaderLoc, 'lightPos');
  if  (!this.lightPositionLoc){
    console.log('Failed to get GPU storage location for lightpos');
		return;
  }

  this.KdLoc = gl.getUniformLocation(this.shaderLoc, 'Kd');
  if  (!this.KdLoc){
    console.log('Failed to get GPU storage location for durant');
		return;
  }

  this.KaLoc = gl.getUniformLocation(this.shaderLoc, 'Ka');
  if (!this.KaLoc){
    console.log('couldnt find acid');
    return;
  }

  this.KsLoc = gl.getUniformLocation(this.shaderLoc, 'Ks');
  if (!this.KaLoc){
    console.log('couldnt find ks');
    return;
  }

  this.shininessValLoc = gl.getUniformLocation(this.shaderLoc, 'shininessVal');
  if (!this.shininessValLoc){
    console.log('couldnt find shinyval');
    return;
  }

  this.IaLoc = gl.getUniformLocation(this.shaderLoc, 'Ia');
  if (!this.IaLoc){
    console.log('couldnt find Ia');
    return;
  }

  this.IdLoc = gl.getUniformLocation(this.shaderLoc, 'Id');
  if (!this.IdLoc){
    console.log('couldnt find Id');
    return;
  }

  this.IsLoc = gl.getUniformLocation(this.shaderLoc, 'Is');
  if (!this.IsLoc){
    console.log('couldnt find is');
    return;
  }

  this.phongLoc = gl.getUniformLocation(this.shaderLoc, 'phong');
  if (!this.phongLoc){
    console.log('missing phoc');
    return;
  }
  this.cameraPositionLoc = gl.getUniformLocation(this.shaderLoc, 'cameraPos');
  if (!this.cameraPositionLoc){
    console.log('cou;dnt find cam');
    return;
  }
  this.specifiedIaLoc = gl.getUniformLocation(this.shaderLoc, 'specifiedIa');
  if (!this.specifiedIaLoc){
    console.log('Freak')
  }
  this.specifiedIdLoc = gl.getUniformLocation(this.shaderLoc, 'specifiedId');
  if (!this.specifiedIdLoc){
    console.log('Freak')
  }
  this.specifiedIsLoc = gl.getUniformLocation(this.shaderLoc, 'specifiedIs');
  if (!this.specifiedIsLoc){
    console.log('Freak')
  }
  this.lightSpecifiedLoc = gl.getUniformLocation(this.shaderLoc, 'lightSpecified');
  if (!this.lightSpecifiedLoc){
    console.log('Freak')
  }
}

VBObox2.prototype.switchToMe = function() {
//==============================================================================
// Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
//
// We only do this AFTER we called the init() function, which does the one-time-
// only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
// even then, you are STILL not ready to draw our VBObox's contents onscreen!
// We must also first complete these steps:
//  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
//  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
//  c) tell the GPU to connect the shader program's attributes to that VBO.

// a) select our shader program:
  gl.useProgram(this.shaderLoc);
//		Each call to useProgram() selects a shader program from the GPU memory,
// but that's all -- it does nothing else!  Any previously used shader program's 
// connections to attributes and uniforms are now invalid, and thus we must now
// establish new connections between our shader program's attributes and the VBO
// we wish to use.  
  
// b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
//  instead connect to our own already-created-&-filled VBO.  This new VBO can 
//    supply values to use as attributes in our newly-selected shader program:
	gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
										this.vboLoc);			// the ID# the GPU uses for our VBO.

// c) connect our newly-bound VBO to supply attribute variable values for each
// vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
// this sets up data paths from VBO to our shader units:
  // 	Here's how to use the almost-identical OpenGL version of this function:
	//		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
  gl.vertexAttribPointer(
		this.a_Pos1Loc,//index == ID# for the attribute var in GLSL shader pgm;
		this.vboFcount_a_Pos1, // # of floats used by this attribute: 1,2,3 or 4?
		gl.FLOAT,		  // type == what data type did we use for those numbers?
		false,				// isNormalized == are these fixed-point values that we need
									//									normalize before use? true or false
		this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
		              // stored attrib for this vertex to the same stored attrib
		              //  for the next vertex in our VBO.  This is usually the 
									// number of bytes used to store one complete vertex.  If set 
									// to zero, the GPU gets attribute values sequentially from 
									// VBO, starting at 'Offset'.	
									// (Our vertex size in bytes: 4 floats for pos + 3 for color)
		this.vboOffset_a_Pos1);						
		              // Offset == how many bytes from START of buffer to the first
  								// value we will actually use?  (we start with position).
  gl.vertexAttribPointer(this.a_Colr1Loc, this.vboFcount_a_Colr1,
                         gl.FLOAT, false, 
  						           this.vboStride,  this.vboOffset_a_Colr1);
  gl.vertexAttribPointer(this.a_Normal1Loc,this.vboFcount_a_Normal1, 
                         gl.FLOAT, false, 
							           this.vboStride,	this.vboOffset_a_Normal1);	
  //-- Enable this assignment of the attribute to its' VBO source:
  gl.enableVertexAttribArray(this.a_Pos1Loc);
  gl.enableVertexAttribArray(this.a_Colr1Loc);
  gl.enableVertexAttribArray(this.a_Normal1Loc);
}

VBObox2.prototype.isReady = function() {
//==============================================================================
// Returns 'true' if our WebGL rendering context ('gl') is ready to render using
// this objects VBO and shader program; else return false.
// see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter

var isOK = true;
  if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
    console.log(this.constructor.name + 
    						'.isReady() false: shader program at this.shaderLoc not in use!');
    isOK = false;
  }
  if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
      console.log(this.constructor.name + 
  						'.isReady() false: vbo at this.vboLoc not in use!');
    isOK = false;
  }
  return isOK;
}

VBObox2.prototype.adjust = function() {
//=============================================================================
// Update the GPU to newer, current values we now store for 'uniform' vars on 
// the GPU; and (if needed) update the VBO's contents, and (if needed) each 
// attribute's stride and offset in VBO.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.adjust() call you needed to call this.switchToMe()!!');
  }
  
  this.Ka = new Vector3([0.2, 0.2, 0.2]);
  this.Kd = new Vector3([1.0, 0.5, 0.5]);
  this.Ks = new Vector3([0.9, 0.9, 0.9]);
  this.Ia = new Vector3([0.4, 0.2, 0.2]);
  this.Id = new Vector3([0.4, 0.1, 0.5]);
  this.Is = new Vector3([0.4, 0.3, 0.3]);
  this.cameraPosition = new Vector3([cop_x, cop_y, cop_z]);
  this.shininessVal = 55.0;
  this.phong = globalPhong; //1 for blinn-phong
  
  this.lightPosition = globalLightPosition;
  gl.uniform3fv(this.lightPositionLoc, this.lightPosition.elements);
  gl.uniform3fv(this.KdLoc, this.Kd.elements);
  gl.uniform3fv(this.IdLoc, this.Id.elements);
  gl.uniform3fv(this.KaLoc, this.Ka.elements);
  gl.uniform3fv(this.KsLoc, this.Ks.elements);
  gl.uniform1f(this.shininessValLoc, this.shininessVal);
  gl.uniform3fv(this.IaLoc, this.Ia.elements);
  gl.uniform3fv(this.IsLoc, this.Is.elements);
  gl.uniform1f(this.phongLoc, this.phong);
  gl.uniform3fv(this.specifiedIaLoc, globalSpecifiedIa);
  gl.uniform3fv(this.specifiedIdLoc, globalSpecifiedId);
  gl.uniform3fv(this.specifiedIsLoc, globalSpecifiedIs);
  gl.uniform1f(this.lightSpecifiedLoc, globalLightSpecified);

	// Adjust values for our uniforms;-------------------------------------------
  this.ModelMatrix.setIdentity();
  this.ViewMatrix.setIdentity();
  this.ProjectionMatrix.setIdentity();
  this.ProjectionMatrix.perspective(35.0, vpAspect, 1.0, 100.0);
  this.ViewMatrix.lookAt(cop_x, cop_y, cop_z,
                       cop_x + Math.cos(theta), cop_y + Math.sin(theta), dtilt,
                       0, 0, 1);
  
  this.cameraPosition = new Vector3([cop_x, cop_y, cop_z]);
  gl.uniform3fv(this.cameraPositionLoc, this.cameraPosition.elements);

  this.NormalMatrix.setInverseOf(this.ModelMatrix);
  this.NormalMatrix.transpose();
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
  gl.uniformMatrix4fv(this.u_ViewMatrixLoc,	// GPU location of the uniform
    false, 										// use matrix transpose instead?
    this.ViewMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_ProjectionMatrixLoc,	// GPU location of the uniform
    false, 										// use matrix transpose instead?
    this.ProjectionMatrix.elements);	// send data from Javascript.
gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
}

VBObox2.prototype.draw = function() {
//=============================================================================
// Render current VBObox contents.
  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.draw() call you needed to call this.switchToMe()!!');
  }
	
pushMatrix(this.ModelMatrix);  // SAVE world drawing coords.
  //--------Draw Spinning Sphere
  this.ModelMatrix.translate( 0.0, 0.0, 0.0); // 'set' means DISCARD old matrix,
              // (drawing axes centered in CVV), and then make new
              // drawing axes moved to the lower-left corner of CVV.
                        // to match WebGL display canvas.
  this.ModelMatrix.scale(0.3, 0.3, 0.3);
              // Make it smaller:
  this.ModelMatrix.rotate(g_angleNow0, 1, 1, 0);  // Spin on XY diagonal axis
  // Drawing:		
  // Pass our current matrix to the vertex shaders:
  this.NormalMatrix.setInverseOf(this.ModelMatrix);
  this.NormalMatrix.transpose();
  this.getMaterial();
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
      // Draw just the sphere's vertices
  gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
                sphStart/10,	// start at this vertex number, and 
                sphVerts.length/10);	// draw this many vertices.
this.ModelMatrix = popMatrix();  // RESTORE 'world' drawing coords.
//bird
var floatsPerVertex = 10;
pushMatrix(this.ModelMatrix);
			this.ModelMatrix.translate(2.5,-2.0,1);
			this.ModelMatrix.rotate(90, 1, 0, 0);
			this.ModelMatrix.rotate(115, 0, 1, 0);
			this.ModelMatrix.scale(0.4, 0.4, .8);
      this.ModelMatrix.rotate(g_angleNow0, 0, 0, 1);
      this.NormalMatrix.setInverseOf(this.ModelMatrix);
      this.NormalMatrix.transpose();
      this.sendDifferentMaterial([0.2, 0.2, 0.2], [1.0, 0.5, 0.5], [0.9, 0.9, 0.9], [0.4, 0.2, 0.2], [0.4, 0.1, 0.5], [0.4, 0.3, 0.3], 55);
      gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
			gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
			gl.drawArrays(gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
      pushMatrix(this.ModelMatrix);
          this.ModelMatrix.translate(0.5,0,-.5)
				  this.ModelMatrix.scale(0.5, 0.5, 0.5);
				  this.ModelMatrix.rotate(-g_angleNow1, 0, 1, 0);
				  this.ModelMatrix.translate(-0.5,0,-0.5);
          this.NormalMatrix.setInverseOf(this.ModelMatrix);
          this.NormalMatrix.transpose();
          this.sendDifferentMaterial([0.5, 0.5, 0.5], [0.6, 0.6, 0.6], [0.5, 0.5, 0.5], [0.9, 0.1, 0.1], [0.4, 0.7, 0.4], [1.0, 1.0, 1.0], 2.0);
          gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
          gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
          gl.drawArrays(gl.TRIANGLES, cubeStart/10, cubeVerts.length/10); 
        this.ModelMatrix = popMatrix();
      pushMatrix(this.ModelMatrix);
        this.ModelMatrix.translate(-0.5,0,-.5)
        this.ModelMatrix.scale(0.5, 0.5, 0.5);
        this.ModelMatrix.rotate(-g_angleNow1, 0, 1, 0);
        this.ModelMatrix.translate(-0.5,0,-0.5);
        this.NormalMatrix.setInverseOf(this.ModelMatrix);
        this.NormalMatrix.transpose();
        this.sendDifferentMaterial([0.5, 0.5, 0.5], [0.6, 0.6, 0.6], [0.5, 0.5, 0.5], [0.9, 0.1, 0.1], [0.4, 0.7, 0.4], [1.0, 1.0, 1.0], 2.0);
        gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
        gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
        gl.drawArrays(gl.TRIANGLES, cubeStart/10, cubeVerts.length/10); 
      this.ModelMatrix = popMatrix();
			pushMatrix(this.ModelMatrix);
				this.ModelMatrix.translate(0, 0, 0.60);
				this.ModelMatrix.scale(0.5, 0.5, 0.25);
        this.NormalMatrix.setInverseOf(this.ModelMatrix);
        this.NormalMatrix.transpose();
        gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
				gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
				gl.drawArrays(gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
			  this.ModelMatrix = popMatrix();
			pushMatrix(this.ModelMatrix);
				this.ModelMatrix.translate(0.4, 0, 0.3);
				this.ModelMatrix.scale(1.5, 0.5, 0.25);
				this.ModelMatrix.rotate(-20, 0, 1, 0);
				this.ModelMatrix.rotate(wingAngle, 0, 1, 0);
				this.ModelMatrix.translate(0.6, 0, -0.4);
        this.NormalMatrix.setInverseOf(this.ModelMatrix);
        this.NormalMatrix.transpose();
        gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
				gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
				gl.drawArrays(gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
			this.ModelMatrix = popMatrix();
			pushMatrix(this.ModelMatrix);
				this.ModelMatrix.translate(-0.4, 0, 0.3);
				this.ModelMatrix.scale(1.5, 0.5, 0.25);
				this.ModelMatrix.rotate(20, 0, 1, 0);
				this.ModelMatrix.rotate(-wingAngle, 0, 1, 0);
				this.ModelMatrix.translate(-0.6, 0, -0.4);
        this.NormalMatrix.setInverseOf(this.ModelMatrix);
        this.NormalMatrix.transpose();
        gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
				gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
				gl.drawArrays(gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
			this.ModelMatrix = popMatrix();
	this.ModelMatrix = popMatrix();


pushMatrix(this.ModelMatrix);
      this.ModelMatrix.translate (1.0, 1.0, 0.0);
      this.ModelMatrix.scale(0.3, 0.3, 0.3);
      this.ModelMatrix.rotate(g_angleNow0, 0, 1, 0);
      this.NormalMatrix.setInverseOf(this.ModelMatrix);
      this.NormalMatrix.transpose();
      gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
      gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
      gl.drawArrays(gl.TRIANGLES, cubeStart/10, cubeVerts.length/10);
      pushMatrix(this.ModelMatrix);
        this.ModelMatrix.translate(0, 1, 0);
        this.ModelMatrix.rotate(g_angleNow0, 0, 1, 0);
        this.NormalMatrix.setInverseOf(this.ModelMatrix);
        this.NormalMatrix.transpose();
        this.sendDifferentMaterial([0.5, 0.5, 0.5], [0.6, 0.6, 0.6], [0.7, 0.7, 0.7], [0.0, 0.3, 0.7], [0.4, 0.7, 0.4], [1.0, 1.0, 1.0], 12.0);
        gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
        gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
        gl.drawArrays(gl.TRIANGLES, cubeStart/10, cubeVerts.length/10);
      this.ModelMatrix = popMatrix();
      pushMatrix(this.ModelMatrix);
        this.ModelMatrix.translate(1, 0, 0);
        this.ModelMatrix.rotate(g_angleNow0, 1, 0, 0);
        this.NormalMatrix.setInverseOf(this.ModelMatrix);
        this.NormalMatrix.transpose();
        this.sendDifferentMaterial([0.5, 0.5, 0.5], [0.6, 0.6, 0.6], [0.05, 0.05, 0.05], [0.6, 0.3, 0.1], [0.4, 0.7, 0.4], [1.0, 1.0, 1.0], 2.0);
        gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
        gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
        gl.drawArrays(gl.TRIANGLES, cubeStart/10, cubeVerts.length/10);
        pushMatrix(this.ModelMatrix);
          this.ModelMatrix.translate(0.5,0,.5)
				  this.ModelMatrix.scale(0.5, 0.5, 0.5);
				  this.ModelMatrix.rotate(g_angleNow1, 0, 1, 0);
				  this.ModelMatrix.translate(-0.5,0,-0.5);
          this.NormalMatrix.setInverseOf(this.ModelMatrix);
          this.NormalMatrix.transpose();
          this.sendDifferentMaterial([0.5, 0.5, 0.5], [0.6, 0.6, 0.6], [0.5, 0.5, 0.5], [0.9, 0.1, 0.1], [0.4, 0.7, 0.4], [1.0, 1.0, 1.0], 2.0);
          gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
          gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
          gl.drawArrays(gl.TRIANGLES, cubeStart/10, cubeVerts.length/10); 
        this.ModelMatrix = popMatrix();
      this.ModelMatrix = popMatrix();
      pushMatrix(this.ModelMatrix);
        this.ModelMatrix.translate(0, -1, 0);
        this.ModelMatrix.rotate(g_angleNow0, 0, 1, 0);
        this.NormalMatrix.setInverseOf(this.ModelMatrix);
        this.NormalMatrix.transpose();
        this.sendDifferentMaterial([0.5, 0.5, 0.5], [0.3, 0.6, 0.7], [0.35, 0.35, 0.35], [0.2, 0.5, 0.1], [0.2, 0.7, 0.4], [1.0, 1.0, 1.0], 50.0);
        gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
        gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
        gl.drawArrays(gl.TRIANGLES, cubeStart/10, cubeVerts.length/10);
      this.ModelMatrix = popMatrix();
      pushMatrix(this.ModelMatrix);
        this.ModelMatrix.translate(-1, 0, 0);
        this.ModelMatrix.rotate(g_angleNow0, -1, 0, 0);
        this.NormalMatrix.setInverseOf(this.ModelMatrix);
        this.NormalMatrix.transpose();
        this.sendDifferentMaterial([0.5, 0.5, 0.5], [0.4, 0.3, 0.8], [0.1, 0.05, 0.05], [0.6, 0.3, 0.1], [0.4, 0.7, 0.4], [1.0, 1.0, 1.0], 12.0);
        gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
        gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
        gl.drawArrays(gl.TRIANGLES, cubeStart/10, cubeVerts.length/10);
      this.ModelMatrix = popMatrix();
this.ModelMatrix = popMatrix();
//sphere tower
pushMatrix(this.ModelMatrix);
    this.ModelMatrix.translate(-0.7, -0.6, 0.4); 
    this.ModelMatrix.scale(0.25, 0.25, 0.25);
    this.ModelMatrix.rotate(g_angleNow0, 1, 1, 0);  
    this.NormalMatrix.setInverseOf(this.ModelMatrix);
    this.NormalMatrix.transpose();
    this.sendDifferentMaterial([0.5, 0.5, 0.5], [0.4, 0.3, 0.8], [0.1, 0.39, 0.35], [0.6, 0.3, 0.1], [0.4, 0.2, 0.4], [0.3, 0.1, 0.3], 12.0);
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
    gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP,
                  sphStart/10,	
                  sphVerts.length/10);
    pushMatrix(this.ModelMatrix);
      this.ModelMatrix.translate(0.0, 0.0, 1.25);
      this.ModelMatrix.scale(0.75, 0.75, 0.75);
      this.ModelMatrix.rotate(g_angleNow0, 1, 1, 0);
      //this.ModelMatrix.translate(0.0, 0.0, -1.0);
      this.NormalMatrix.setInverseOf(this.ModelMatrix);
      this.NormalMatrix.transpose();
      this.sendDifferentMaterial([0.5, 0.5, 0.5], [0.4, 0.3, 0.8], [0.31, 0.39, 0.35], [0.2, 0.3, 0.1], [0.5, 0.2, 0.4], [0.3, 0.6, 0.3], 12.0);
      gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
      gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
      gl.drawArrays(gl.TRIANGLES,
        cubeStart/10,	
        cubeVerts.length/10);
      pushMatrix(this.ModelMatrix);
        this.ModelMatrix.translate(0.0, 0.0, 0.9);
        this.ModelMatrix.scale(0.75, 0.75, 0.75);
        this.ModelMatrix.rotate(-g_angleNow0, 0, 0, 1);
        this.NormalMatrix.setInverseOf(this.ModelMatrix);
        this.NormalMatrix.transpose();
        this.sendDifferentMaterial([0.5, 0.5, 0.5], [0.4, 0.1, 0.8], [0.1, 0.39, 0.35], [0.2, 0.3, 0.7], [0.4, 0.2, 0.4], [0.3, 0.1, 0.3], 12.0);
        gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
        gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
        gl.drawArrays(gl.TRIANGLES,
          cubeStart/10,	
          cubeVerts.length/10);
          pushMatrix(this.ModelMatrix);
          this.ModelMatrix.translate(0.5,0,.5)
				  this.ModelMatrix.scale(0.5, 0.5, 0.5);
				  this.ModelMatrix.rotate(g_angleNow1, 0, 1, 0);
				  this.ModelMatrix.translate(-0.5,0,-0.5);
          this.NormalMatrix.setInverseOf(this.ModelMatrix);
          this.NormalMatrix.transpose();
          this.sendDifferentMaterial([0.5, 0.5, 0.5], [0.6, 0.6, 0.6], [0.5, 0.5, 0.5], [0.9, 0.1, 0.1], [0.4, 0.7, 0.4], [1.0, 1.0, 1.0], 2.0);
          gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
          gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
          gl.drawArrays(gl.TRIANGLES, cubeStart/10, cubeVerts.length/10); 
        this.ModelMatrix = popMatrix();
      this.ModelMatrix = popMatrix();
    this.ModelMatrix = popMatrix();

    pushMatrix(this.ModelMatrix);
      this.ModelMatrix.translate(1.25, 0.0, 0.0);
      this.ModelMatrix.scale(0.75, 0.75, 0.75);
      this.ModelMatrix.rotate(g_angleNow0, 1, 1, 0);
      //this.ModelMatrix.translate(0.0, 0.0, -1.0);
      this.NormalMatrix.setInverseOf(this.ModelMatrix);
      this.NormalMatrix.transpose();
      gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
      gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
      gl.drawArrays(gl.TRIANGLES,
        cubeStart/10,	
        cubeVerts.length/10);
      pushMatrix(this.ModelMatrix);
        this.ModelMatrix.translate(0.9, 0.0, 0.00);
        this.ModelMatrix.scale(0.75, 0.75, 0.75);
        this.ModelMatrix.rotate(-g_angleNow0, 1, 0, 0);
        this.NormalMatrix.setInverseOf(this.ModelMatrix);
        this.NormalMatrix.transpose();
        gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
        gl.uniformMatrix4fv(this.u_NormalMatrixLoc, false, this.NormalMatrix.elements);
        gl.drawArrays(gl.TRIANGLES,
          cubeStart/10,	
          cubeVerts.length/10);

      this.ModelMatrix = popMatrix();
    this.ModelMatrix = popMatrix();

this.ModelMatrix = popMatrix();
}
VBObox2.prototype.sendDifferentMaterial = function(newKa, newKd, newKs, newIa, newId, newIs, newShiny){
  gl.uniform3fv(this.KaLoc, newKa);
  gl.uniform3fv(this.KdLoc, newKd);
  gl.uniform3fv(this.IaLoc, newIa);
  gl.uniform3fv(this.IdLoc, newId);
  gl.uniform3fv(this.IsLoc, newIs);
  gl.uniform3fv(this.KsLoc, newKs);
  gl.uniform1f(this.shininessValLoc, newShiny);
}

VBObox2.prototype.reload = function() {
//=============================================================================
// Over-write current values in the GPU for our already-created VBO: use 
// gl.bufferSubData() call to re-transfer some or all of our Float32Array 
// 'vboContents' to our VBO, but without changing any GPU memory allocations.
  											
 gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                  0,                  // byte offset to where data replacement
                                      // begins in the VBO.
 					 				this.vboContents);   // the JS source-data array used to fill VBO
}
/*
VBObox2.prototype.empty = function() {
//=============================================================================
// Remove/release all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  However, make sure this step is reversible by a call to 
// 'restoreMe()': be sure to retain all our Float32Array data, all values for 
// uniforms, all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}

VBObox2.prototype.restore = function() {
//=============================================================================
// Replace/restore all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
// all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}
*/

//=============================================================================
//=============================================================================
//=============================================================================

function makeWorldAxes(){
	worldVerts = new Float32Array([	 0.0,  0.0,  0.0, 1.0,		0.3,  0.3,  0.3,	// X axis line (origin: gray)
		 1.3,  0.0,  0.0, 1.0,		1.0,  0.3,  0.3,	// 						 (endpoint: red)
		 
		 0.0,  0.0,  0.0, 1.0,    0.3,  0.3,  0.3,	// Y axis line (origin: white)
		 0.0,  1.3,  0.0, 1.0,		0.3,  1.0,  0.3,	//						 (endpoint: green)

		 0.0,  0.0,  0.0, 1.0,		0.3,  0.3,  0.3,	// Z axis line (origin:white)
		 0.0,  0.0,  1.3, 1.0,		0.3,  0.3,  1.0,]) 	//						 (endpoint: blue)
 
}
function makeGroundGrid() {
  //==============================================================================
  // Create a list of vertices that create a large grid of lines in the x,y plane
  // centered at x=y=z=0.  Draw this shape using the GL_LINES primitive.
    var floatsPerVertex0 = 7;
    var xcount = 1000;			// # of lines to draw in x,y to make the grid.
    var ycount = 1000;		
    var xymax	= 500.0;			// grid size; extends to cover +/-xymax in x and y.
    var xColr = new Float32Array([0.0, 0.5, 0.3]);	// bright yellow
    var yColr = new Float32Array([0.5, 0.3, 0.3]);	// bright green.
     
    // Create an (global) array to hold this ground-plane's vertices:
    gndVerts = new Float32Array(floatsPerVertex0*2*(xcount+ycount));
    
              // draw a grid made of xcount+ycount lines; 2 vertices per line.
              
    var xgap = xymax/(xcount-1);		// HALF-spacing between lines in x,y;
    var ygap = xymax/(ycount-1);		// (why half? because v==(0line number/2))
    
    // First, step thru x values as we make vertical lines of constant-x:
    for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex0) {
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
    for(v=0; v<2*ycount; v++, j+= floatsPerVertex0) {
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
      sphVerts = new Float32Array(  ((slices * 2* sliceVerts) -2) * 10);
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
        for(v=isFirst; v< 2*sliceVerts-isLast; v++, j+=10) {	
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
          sphVerts[j+4] = 1.0;
          sphVerts[j+5] = 0.0;
          sphVerts[j+6] = 0.0;
          var normalVec = new Vector3([sphVerts[j], sphVerts[j+1], sphVerts[j+2]]);
          //console.log(normalVec.dot(normalVec));
          sphVerts[j+7] = normalVec.elements[0];
          sphVerts[j+8] = normalVec.elements[1];
          sphVerts[j+9] = normalVec.elements[2];

        }
      }
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
        left, bottom, near, 1.0, 		1.0, 0.0, 0.0,    0.0, 0.0, -1.0,
        left, top, near, 1.0, 			0.0, 1.0, 1.0,    0.0, 0.0, -1.0,
        right, bottom, near, 1.0, 		0.0, 0.0, 1.0,  0.0, 0.0, -1.0,
    
        right, bottom, near, 1.0, 		0.0, 0.0, 1.0,   0.0, 0.0, -1.0,
        right, top, near, 1.0, 			0.0, 1.0, 1.0,     0.0, 0.0, -1.0,
        left, top, near, 1.0, 			0.0, 1.0, 1.0,     0.0, 0.0, -1.0,
    
        //Face2
        right, bottom, near, 1.0, 		0.0, 0.0, 1.0,  1.0, 0.0, 0.0,
        right, top, near, 1.0, 			0.0, 1.0, 1.0,    1.0, 0.0, 0.0,
        right, bottom, far, 1.0,		0.0, 1.0, 0.0,    1.0, 0.0, 0.0,
    
        right, bottom, far, 1.0,		0.0, 1.0, 0.0,    1.0, 0.0, 0.0,
        right, top, far, 1.0, 			1.0, 0.0, 1.0,    1.0, 0.0, 0.0,
        right, top, near, 1.0, 			0.0, 1.0, 1.0,    1.0, 0.0, 0.0,
    
        //Face3
        left, bottom, far, 1.0, 		1.0, 0.0, 0.0,    0.0, 0.0, 1.0,
        left, top, far, 1.0, 			0.0, 1.0, 1.0,      0.0, 0.0, 1.0,
        right, bottom, far, 1.0, 		0.0, 0.0, 1.0,    0.0, 0.0, 1.0,
    
        right, bottom, far, 1.0, 		0.0, 0.0, 1.0,    0.0, 0.0, 1.0,
        right, top, far, 1.0, 			0.0, 1.0, 1.0,    0.0, 0.0, 1.0,
        left, top, far, 1.0, 			0.0, 1.0, 1.0,      0.0, 0.0, 1.0,
    
        //Face4
        left, bottom, near, 1.0, 		0.0, 0.0, 1.0,    -1.0, 0.0, 0.0,
        left, top, near, 1.0, 			0.0, 1.0, 1.0,    -1.0, 0.0, 0.0,
        left, bottom, far, 1.0,			0.0, 1.0, 0.0,    -1.0, 0.0, 0.0,
    
        left, bottom, far, 1.0,			0.0, 1.0, 0.0,    -1.0, 0.0, 0.0,
        left, top, far, 1.0, 			1.0, 0.0, 1.0,      -1.0, 0.0, 0.0,
        left, top, near, 1.0, 			0.0, 1.0, 1.0,    -1.0, 0.0, 0.0,
    
        //Face5
        right, bottom, near, 1.0, 		0.0, 0.0, 1.0,   0.0, -1.0, 0.0,
        left, bottom, near, 1.0, 		1.0, 0.0, 0.0,     0.0, -1.0, 0.0, 
        left, bottom, far, 1.0, 		1.0, 0.0, 0.0,     0.0, -1.0, 0.0,
    
        right, bottom, near, 1.0, 		0.0, 0.0, 1.0,  0.0, -1.0, 0.0,
        right, bottom, far, 1.0, 		0.0, 0.0, 1.0,    0.0, -1.0, 0.0,   
        left, bottom, far, 1.0, 		1.0, 0.0, 0.0,    0.0, -1.0, 0.0,
    
        //Face6
        right, top, near, 1.0, 		0.0, 0.0, 1.0,    0.0, 1.0, 0.0,
        left, top, near, 1.0, 		1.0, 0.0, 0.0,    0.0, 1.0, 0.0,
        left, top, far, 1.0, 		1.0, 0.0, 0.0,      0.0, 1.0, 0.0,
    
        right, top, near, 1.0, 		0.0, 0.0, 1.0,    0.0, 1.0, 0.0,
        right, top, far, 1.0, 		0.0, 0.0, 1.0,    0.0, 1.0, 0.0,
        left, top, far, 1.0, 		1.0, 0.0, 0.0,      0.0, 1.0, 0.0,
      ]);
    
    }
    