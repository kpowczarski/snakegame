/* GLOBAL CONSTANTS AND VARIABLES */

/* assignment specific globals */
var defaultEye = vec3.fromValues(1,1,-.8); // default eye position in world space
var defaultCenter = vec3.fromValues(1,1,.9); // default view direction in world space
var defaultUp = vec3.fromValues(0,1,0); // default view up vector
var lightAmbient = vec3.fromValues(1,1,1); // default light ambient emission
var lightDiffuse = vec3.fromValues(1,1,1); // default light diffuse emission
var lightSpecular = vec3.fromValues(1,1,1); // default light specular emission
var lightPosition = vec3.fromValues(1,0,-0.5); // default light position
var rotateTheta = Math.PI/50; // how much to rotate models by with each key press
var Blinn_Phong = true;
var ambient = vec3.fromValues(0.5,0.5,0.5);
var diffuse = vec3.fromValues(0.4,0.4,0.4);
var specular = vec3.fromValues(.3,.3,.3);
var ambientS = vec3.fromValues(0,0,0);
var diffuseS = vec3.fromValues(0.6,0.8,0.4);
var specularS = vec3.fromValues(.1,.1,.1);
var ambientF = vec3.fromValues(0.1,0.1,0.1);
var diffuseF = vec3.fromValues(0.4,0.4,0.9);
var specularF = vec3.fromValues(.1,.1,.1);
var ambientSn = vec3.fromValues(0,0,0);
var diffuseSn = vec3.fromValues(0.8,0.5,0.1);
var specularSn = vec3.fromValues(.1,.1,.1);
var n = 11;
/* webgl and geometry data */
var gl = null; // the all powerful gl object. It's all here folks!
var walls = []; // the triangle data as loaded from input files
var numTriangleSets = 0; // how many triangle sets in input scene
var snakeArray = [];
var foodArray = [];
var npsnakeArray = [];
var viewDelta = 0; // how much to displace view with each key press

/* shader parameter locations */
var vPosAttribLoc; // where to put position for vertex shader
var mMatrixULoc; // where to put model matrix for vertex shader
var pvmMatrixULoc; // where to put project model view matrix for vertex shader
var ambientULoc; // where to put ambient reflecivity for fragment shader
var diffuseULoc; // where to put diffuse reflecivity for fragment shader
var specularULoc; // where to put specular reflecivity for fragment shader
var shininessULoc; // where to put specular exponent for fragment shader
var Blinn_PhongULoc;
/* interaction variables */
var Eye = vec3.clone(defaultEye); // eye position in world space
var Center = vec3.clone(defaultCenter); // view direction in world space
var Up = vec3.clone(defaultUp); // view up vector in world space
var zC = .3;
var zF = .29;
var dir = 0;
var dirnp = 3;
var tic = 0;
var ticfood = 0;
var dirTic = 0;
var randomDirTic = 0;



// does stuff when keys are pressed
function handleKeyDown(event) {
    
    switch (event.code) {
        
        case "ArrowRight": // select next triangle set
        	if (dir != 1) {
        		dir = 3;
        	}
            break;
        case "ArrowLeft": // select previous triangle set
        	if (dir != 3) {
        		dir = 1;
        	};
            break;
        case "ArrowUp": // select next triangle set
        	if (dir != 0) {
        		dir = 2;
        	}
            break;
        case "ArrowDown": // select previous triangle set
        	if (dir != 2) {
        		dir = 0;
        	}
            break;
            
        
    } // end switch
} // end handleKeyDown

// set up the webGL environment
function setupWebGL() {
    
    // Set up keys
    document.onkeydown = handleKeyDown; // call this when key pressed
	 // Get the image canvas, render an image in it
     var imageCanvas = document.getElementById("myImageCanvas"); // create a 2d canvas
      var cw = imageCanvas.width, ch = imageCanvas.height; 
      imageContext = imageCanvas.getContext("2d"); 
      //var bkgdImage = new Image(); 
      //bkgdImage.crossOrigin = "Anonymous";
      //bkgdImage.src = "https://ncsucgclass.github.io/prog4/sky.jpg";
      //bkgdImage.onload = function(){
          //var iw = bkgdImage.width, ih = bkgdImage.height;
          //imageContext.drawImage(bkgdImage,0,0,iw,ih,0,0,cw,ch);   
     //} // end onload callback
    
     // create a webgl canvas and set it up
     var webGLCanvas = document.getElementById("myWebGLCanvas"); // create a webgl canvas
     gl = webGLCanvas.getContext("webgl"); // get a webgl object from it
     try {
       if (gl == null) {
         throw "unable to create gl context -- is your browser gl ready?";
       } else {
         //gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
         gl.clearDepth(1.0); // use max when we clear the depth buffer
         gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
       }
     } // end try
     
    
    catch(e) {
      console.log(e);
    } // end catch
 
} // end setupWebGL


// setup the webGL shaders
function setupShaders() {
    
    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
        attribute vec3 aVertexPosition; // vertex position
        attribute vec3 aVertexNormal; // vertex normal
        
        uniform mat4 umMatrix; // the model matrix
        uniform mat4 upvmMatrix; // the project view model matrix
        
        varying vec3 vWorldPos; // interpolated world position of vertex
        varying vec3 vVertexNormal; // interpolated normal for frag shader

        void main(void) {
            
            // vertex position
            vec4 vWorldPos4 = umMatrix * vec4(aVertexPosition, 1.0);
            vWorldPos = vec3(vWorldPos4.x,vWorldPos4.y,vWorldPos4.z);
            gl_Position = upvmMatrix * vec4(aVertexPosition, 1.0);

            // vertex normal (assume no non-uniform scale)
            vec4 vWorldNormal4 = umMatrix * vec4(aVertexNormal, 0.0);
            vVertexNormal = normalize(vec3(vWorldNormal4.x,vWorldNormal4.y,vWorldNormal4.z)); 
        }
    `;
    
    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
        precision mediump float; // set float to medium precision

        // eye location
        uniform vec3 uEyePosition; // the eye's position in world
        
        // light properties
        uniform vec3 uLightAmbient; // the light's ambient color
        uniform vec3 uLightDiffuse; // the light's diffuse color
        uniform vec3 uLightSpecular; // the light's specular color
        uniform vec3 uLightPosition; // the light's position
        
        // material properties
        uniform vec3 uAmbient; // the ambient reflectivity
        uniform vec3 uDiffuse; // the diffuse reflectivity
        uniform vec3 uSpecular; // the specular reflectivity
        uniform float uShininess; // the specular exponent
        uniform bool Blinn_Phong;  // Blinn_Phong x Phong toggle
        // geometry properties
        varying vec3 vWorldPos; // world xyz of fragment
        varying vec3 vVertexNormal; // normal of fragment
            
        void main(void) {
        
            // ambient term
            vec3 ambient = uAmbient*uLightAmbient; 
            
            // diffuse term
            vec3 normal = normalize(vVertexNormal); 
            vec3 light = normalize(uLightPosition - vWorldPos);
            float lambert = max(0.0,dot(normal,light));
            vec3 diffuse = uDiffuse*uLightDiffuse*lambert; // diffuse term
            
            // specular term
            vec3 eye = normalize(uEyePosition - vWorldPos);
            vec3 halfVec = normalize(light+eye);
            float ndotLight = 2.0*dot(normal, light);
            vec3 reflectVec = normalize(ndotLight*normal - light);
            float highlight = 0.0;
            if(Blinn_Phong)
           	 	highlight = pow(max(0.0,dot(normal,halfVec)),uShininess);
           	else 
           		highlight = pow(max(0.0,dot(normal,reflectVec)),uShininess);

            vec3 specular = uSpecular*uLightSpecular*highlight; // specular term
            
            // combine to output color
            vec3 colorOut = ambient + diffuse + specular; // no specular yet
            gl_FragColor = vec4(colorOut, 1.0); 
        }
    `;
    
    try {
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader,fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution

        var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader,vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution
            
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);  
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);  
            gl.deleteShader(vShader);
        } else { // no compile errors
            var shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)
                
                // locate and enable vertex attributes
                vPosAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexPosition"); // ptr to vertex pos attrib
                gl.enableVertexAttribArray(vPosAttribLoc); // connect attrib to array
                vNormAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexNormal"); // ptr to vertex normal attrib
                gl.enableVertexAttribArray(vNormAttribLoc); // connect attrib to array
                
                // locate vertex uniforms
                mMatrixULoc = gl.getUniformLocation(shaderProgram, "umMatrix"); // ptr to mmat
                pvmMatrixULoc = gl.getUniformLocation(shaderProgram, "upvmMatrix"); // ptr to pvmmat
                
                // locate fragment uniforms
                var eyePositionULoc = gl.getUniformLocation(shaderProgram, "uEyePosition"); // ptr to eye position
                var lightAmbientULoc = gl.getUniformLocation(shaderProgram, "uLightAmbient"); // ptr to light ambient
                var lightDiffuseULoc = gl.getUniformLocation(shaderProgram, "uLightDiffuse"); // ptr to light diffuse
                var lightSpecularULoc = gl.getUniformLocation(shaderProgram, "uLightSpecular"); // ptr to light specular
                var lightPositionULoc = gl.getUniformLocation(shaderProgram, "uLightPosition"); // ptr to light position
                ambientULoc = gl.getUniformLocation(shaderProgram, "uAmbient"); // ptr to ambient
                diffuseULoc = gl.getUniformLocation(shaderProgram, "uDiffuse"); // ptr to diffuse
                specularULoc = gl.getUniformLocation(shaderProgram, "uSpecular"); // ptr to specular
                shininessULoc = gl.getUniformLocation(shaderProgram, "uShininess"); // ptr to shininess
                Blinn_PhongULoc = gl.getUniformLocation(shaderProgram, "Blinn_Phong");
                // pass global constants into fragment uniforms
                gl.uniform3fv(eyePositionULoc,Eye); // pass in the eye's position
                gl.uniform3fv(lightAmbientULoc,lightAmbient); // pass in the light's ambient emission
                gl.uniform3fv(lightDiffuseULoc,lightDiffuse); // pass in the light's diffuse emission
                gl.uniform3fv(lightSpecularULoc,lightSpecular); // pass in the light's specular emission
                gl.uniform3fv(lightPositionULoc,lightPosition); // pass in the light's position
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end setup shaders

// render the loaded model
function renderModels() {
    
    // construct the model transform matrix, based on model state
    function makeModelTransform(currModel) {
        var zAxis = vec3.create(), sumRotation = mat4.create(), temp = mat4.create(), negCtr = vec3.create();

        // move the model to the origin
        mat4.fromTranslation(mMatrix,vec3.negate(negCtr,currModel.center)); 
        
        // scale for highlighting if needed
        if (currModel.on)
            mat4.multiply(mMatrix,mat4.fromScaling(temp,vec3.fromValues(1.2,1.2,1.2)),mMatrix); // S(1.2) * T(-ctr)
        
        // rotate the model to current interactive orientation
        vec3.normalize(zAxis,vec3.cross(zAxis,currModel.xAxis,currModel.yAxis)); // get the new model z axis
        mat4.set(sumRotation, // get the composite rotation
            currModel.xAxis[0], currModel.yAxis[0], zAxis[0], 0,
            currModel.xAxis[1], currModel.yAxis[1], zAxis[1], 0,
            currModel.xAxis[2], currModel.yAxis[2], zAxis[2], 0,
            0, 0,  0, 1);
        mat4.multiply(mMatrix,sumRotation,mMatrix); // R(ax) * S(1.2) * T(-ctr)
        
        // translate back to model center
        mat4.multiply(mMatrix,mat4.fromTranslation(temp,currModel.center),mMatrix); // T(ctr) * R(ax) * S(1.2) * T(-ctr)

        // translate model to current interactive orientation
        mat4.multiply(mMatrix,mat4.fromTranslation(temp,currModel.translation),mMatrix); // T(pos)*T(ctr)*R(ax)*S(1.2)*T(-ctr)
        
    } // end make model transform
    
    // var hMatrix = mat4.create(); // handedness matrix
    var pMatrix = mat4.create(); // projection matrix
    var vMatrix = mat4.create(); // view matrix
    var mMatrix = mat4.create(); // model matrix
    var pvMatrix = mat4.create(); // hand * proj * view matrices
    var pvmMatrix = mat4.create(); // hand * proj * view * model matrices
    
    window.requestAnimationFrame(renderModels); // set up frame render callback
    tic = tic + 1;
    ticfood = ticfood + 1;
    dirTic = dirTic + 1;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
    
    // set up projection and view
    // mat4.fromScaling(hMatrix,vec3.fromValues(-1,1,1)); // create handedness matrix
    mat4.perspective(pMatrix,0.5*Math.PI,1,0.1,10); // create projection matrix
    mat4.lookAt(vMatrix,Eye,Center,Up); // create view matrix
    mat4.multiply(pvMatrix,pvMatrix,pMatrix); // projection
    mat4.multiply(pvMatrix,pvMatrix,vMatrix); // projection * view

    // render each triangle set
    var currSet; // the tri set and its material properties
    for (var whichTriSet=0; whichTriSet<walls.length; whichTriSet++) {
        currSet = walls[whichTriSet];
        //debugger;
        
        // make model transform, add to view project
        //makeModelTransform(currSet);
        mat4.multiply(pvmMatrix,pvMatrix,mMatrix); // project * view * model
        gl.uniformMatrix4fv(mMatrixULoc, false, mMatrix); // pass in the m matrix
        gl.uniformMatrix4fv(pvmMatrixULoc, false, pvmMatrix); // pass in the hpvm matrix
        
        // reflectivity: feed to the fragment shader
        gl.uniform3fv(ambientULoc,ambient); // pass in the ambient reflectivity
        gl.uniform3fv(diffuseULoc,diffuse); // pass in the diffuse reflectivity
        gl.uniform3fv(specularULoc, specular); // pass in the specular reflectivity
        gl.uniform1f(shininessULoc,n); // pass in the specular exponent
        gl.uniform1i(Blinn_PhongULoc, Blinn_Phong);
        // vertex buffer: activate and feed into vertex shader
        gl.bindBuffer(gl.ARRAY_BUFFER,currSet.positionBuffer); // activate
        gl.vertexAttribPointer(vPosAttribLoc,3,gl.FLOAT,false,0,0); // feed
        gl.bindBuffer(gl.ARRAY_BUFFER,currSet.normalBuffer); // activate
        gl.vertexAttribPointer(vNormAttribLoc,3,gl.FLOAT,false,0,0); // feed

        // triangle buffer: activate and render
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,currSet.indexBuffer); // activate
        gl.drawElements(gl.TRIANGLES,3*12,gl.UNSIGNED_SHORT,0); // render
        
    } // end for each triangle set
    for (var whichTriSet=0; whichTriSet<snakeArray.length; whichTriSet++) {
        currSet = snakeArray[whichTriSet];
        
        // make model transform, add to view project
        //makeModelTransform(currSet);
        mat4.multiply(pvmMatrix,pvMatrix,mMatrix); // project * view * model
        gl.uniformMatrix4fv(mMatrixULoc, false, mMatrix); // pass in the m matrix
        gl.uniformMatrix4fv(pvmMatrixULoc, false, pvmMatrix); // pass in the hpvm matrix
        
        // reflectivity: feed to the fragment shader
        gl.uniform3fv(ambientULoc,ambientS); // pass in the ambient reflectivity
        gl.uniform3fv(diffuseULoc,diffuseS); // pass in the diffuse reflectivity
        gl.uniform3fv(specularULoc, specularS); // pass in the specular reflectivity
        gl.uniform1f(shininessULoc,n); // pass in the specular exponent
        gl.uniform1i(Blinn_PhongULoc, Blinn_Phong);
        // vertex buffer: activate and feed into vertex shader
        gl.bindBuffer(gl.ARRAY_BUFFER,currSet.positionBuffer); // activate
        gl.vertexAttribPointer(vPosAttribLoc,3,gl.FLOAT,false,0,0); // feed
        gl.bindBuffer(gl.ARRAY_BUFFER,currSet.normalBuffer); // activate
        gl.vertexAttribPointer(vNormAttribLoc,3,gl.FLOAT,false,0,0); // feed

        // triangle buffer: activate and render
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,currSet.indexBuffer); // activate
        gl.drawElements(gl.TRIANGLES,3*12,gl.UNSIGNED_SHORT,0); // render
        
    }
    for (var whichTriSet=0; whichTriSet<foodArray.length; whichTriSet++) {
        currSet = foodArray[whichTriSet];
        
        // make model transform, add to view project
        //makeModelTransform(currSet);
        mat4.multiply(pvmMatrix,pvMatrix,mMatrix); // project * view * model
        gl.uniformMatrix4fv(mMatrixULoc, false, mMatrix); // pass in the m matrix
        gl.uniformMatrix4fv(pvmMatrixULoc, false, pvmMatrix); // pass in the hpvm matrix
        
        // reflectivity: feed to the fragment shader
        gl.uniform3fv(ambientULoc,ambientF); // pass in the ambient reflectivity
        gl.uniform3fv(diffuseULoc,diffuseF); // pass in the diffuse reflectivity
        gl.uniform3fv(specularULoc, specularF); // pass in the specular reflectivity
        gl.uniform1f(shininessULoc,n); // pass in the specular exponent
        gl.uniform1i(Blinn_PhongULoc, Blinn_Phong);
        // vertex buffer: activate and feed into vertex shader
        gl.bindBuffer(gl.ARRAY_BUFFER,currSet.positionBuffer); // activate
        gl.vertexAttribPointer(vPosAttribLoc,3,gl.FLOAT,false,0,0); // feed
        gl.bindBuffer(gl.ARRAY_BUFFER,currSet.normalBuffer); // activate
        gl.vertexAttribPointer(vNormAttribLoc,3,gl.FLOAT,false,0,0); // feed

        // triangle buffer: activate and render
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,currSet.indexBuffer); // activate
        gl.drawElements(gl.TRIANGLES,3*12,gl.UNSIGNED_SHORT,0); // render
        
    }
    for (var whichTriSet=0; whichTriSet<npsnakeArray.length; whichTriSet++) {
        currSet = npsnakeArray[whichTriSet];
        
        // make model transform, add to view project
        //makeModelTransform(currSet);
        mat4.multiply(pvmMatrix,pvMatrix,mMatrix); // project * view * model
        gl.uniformMatrix4fv(mMatrixULoc, false, mMatrix); // pass in the m matrix
        gl.uniformMatrix4fv(pvmMatrixULoc, false, pvmMatrix); // pass in the hpvm matrix
        
        // reflectivity: feed to the fragment shader
        gl.uniform3fv(ambientULoc,ambientSn); // pass in the ambient reflectivity
        gl.uniform3fv(diffuseULoc,diffuseSn); // pass in the diffuse reflectivity
        gl.uniform3fv(specularULoc, specularSn); // pass in the specular reflectivity
        gl.uniform1f(shininessULoc,n); // pass in the specular exponent
        gl.uniform1i(Blinn_PhongULoc, Blinn_Phong);
        // vertex buffer: activate and feed into vertex shader
        gl.bindBuffer(gl.ARRAY_BUFFER,currSet.positionBuffer); // activate
        gl.vertexAttribPointer(vPosAttribLoc,3,gl.FLOAT,false,0,0); // feed
        gl.bindBuffer(gl.ARRAY_BUFFER,currSet.normalBuffer); // activate
        gl.vertexAttribPointer(vNormAttribLoc,3,gl.FLOAT,false,0,0); // feed

        // triangle buffer: activate and render
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,currSet.indexBuffer); // activate
        gl.drawElements(gl.TRIANGLES,3*12,gl.UNSIGNED_SHORT,0); // render
        
    }
	if (dirTic == randomDirTic) {
		dirTic = 0;
		var maxT = 90;
		var minT = 10;
		randomDirTic = Math.floor(Math.random() * (maxT - minT)) + minT;
		var maxD = 3;
		var minD = 0;
		var temp = Math.floor(Math.random() * (maxD - minD)) + minD;
		var minus = dirnp - 2;
		var plus = dirnp + 2;
		if (temp != minus && temp != plus) {
			dirnp = temp;
		}
		
	}
    //debugger;
    if (tic == 7) {
    	//tic = 0;
	    var oldX = snakeArray[0].x;
	    var oldY = snakeArray[0].y;
	    var newX = snakeArray[0].x;
	    var newY = snakeArray[0].y;
	    if (dir == 0) {
	    	newY = newY - 1;
	    }
	    else if (dir == 2) {
	    	newY = newY + 1;
	    }
	    else if (dir == 1) {
	    	newX = newX + 1;
	    }
	    else if (dir == 3) {
	    	newX = newX - 1;
	    }
	    snakeArray[0].move(newX, newY);
	    for(var i = 1; i < snakeArray.length; i++) {
	    	var curX = snakeArray[i].x;
	    	var curY = snakeArray[i].y;
	    	snakeArray[i].move(oldX, oldY);
	    	oldX = curX;
	    	oldY = curY;
	    }

	    for(var i = 0; i < foodArray.length; i++) {
	    	var foX = foodArray[i].x;
	    	var foY = foodArray[i].y;
	    	if (snakeArray[0].x == foX && snakeArray[0].y == foY) {
	    		snakeArray.push(new Cube(oldX, oldY));
	    		foodArray.splice(i, 1);
	    	}
	    	
	    }
	    for(var i = 1; i < snakeArray.length; i++) {
	    	var soX = snakeArray[i].x;
	    	var soY = snakeArray[i].y;
	    	if (snakeArray[0].x == soX && snakeArray[0].y == soY) {
	    		loadSnake();
	    	}
	    }
	    for(var i = 1; i < npsnakeArray.length; i++) {
	    	var soX = npsnakeArray[i].x;
	    	var soY = npsnakeArray[i].y;
	    	if (snakeArray[0].x == soX && snakeArray[0].y == soY) {
	    		loadSnake();
	    	}
	    }
	    
	    
    }
    if (tic == 7) {
    	tic = 0;
	    var oldX = npsnakeArray[0].x;
	    var oldY = npsnakeArray[0].y;
	    var newX = npsnakeArray[0].x;
	    var newY = npsnakeArray[0].y;
	    if (dirnp == 0) {
	    	newY = newY - 1;
	    }
	    else if (dirnp == 2) {
	    	newY = newY + 1;
	    }
	    else if (dirnp == 1) {
	    	newX = newX + 1;
	    }
	    else if (dirnp == 3) {
	    	newX = newX - 1;
	    }
	    npsnakeArray[0].move(newX, newY);
	    for(var i = 1; i < npsnakeArray.length; i++) {
	    	var curX = npsnakeArray[i].x;
	    	var curY = npsnakeArray[i].y;
	    	npsnakeArray[i].move(oldX, oldY);
	    	oldX = curX;
	    	oldY = curY;
	    }

	    for(var i = 0; i < foodArray.length; i++) {
	    	var foX = foodArray[i].x;
	    	var foY = foodArray[i].y;
	    	if (npsnakeArray[0].x == foX && npsnakeArray[0].y == foY) {
	    		npsnakeArray.push(new Cube(oldX, oldY));
	    		foodArray.splice(i, 1);
	    	}
	    	
	    }
	    for(var i = 1; i < npsnakeArray.length; i++) {
	    	var soX = npsnakeArray[i].x;
	    	var soY = npsnakeArray[i].y;
	    	if (npsnakeArray[0].x == soX && npsnakeArray[0].y == soY) {
	    		loadNpSnake();
	    	}
	    }
	    for(var i = 1; i < snakeArray.length; i++) {
	    	var soX = snakeArray[i].x;
	    	var soY = snakeArray[i].y;
	    	if (npsnakeArray[0].x == soX && npsnakeArray[0].y == soY) {
	    		loadNpSnake();
	    	}
	    }
	    
	    
    }
    if (ticfood == 240) {
    	ticfood = 0;
    	loadFood();
    }
    if(snakeArray[0].x >= 99 || snakeArray[0].x <= 0 ) {
    	loadSnake();
    }
    if(snakeArray[0].y >= 99 || snakeArray[0].y <= 0 ) {
    	loadSnake();
    }
    if(npsnakeArray[0].x >= 100 || npsnakeArray[0].x <= 0 ) {
    	loadNpSnake();
    }
    if(npsnakeArray[0].y >= 100 || npsnakeArray[0].y <= 0 ) {
    	loadNpSnake();
    }
} // end render model

function loadModels() {
	for (var i = 0; i < 100; i++) {
        for (var j = 0; j < 100; j++) {
            if (i == 0 || i == 99 || j == 0 || j == 99) {
                walls.push(new Cube(i, j));
            }
        }
    }
	for (var i = 83; i <= 85; i++) {
        snakeArray.push(new Cube(80, i));
    }
	for (var i = 51; i <= 55; i++) {
        npsnakeArray.push(new Cube(i, 50));
    }
	dir = 0;
	dirnp = 3;
	var maxT = 90;
	var minT = 10;
	randomDirTic = Math.floor(Math.random() * (maxT - minT)) + minT;
    
} // end load models

function loadSnake() {
	snakeArray = [];
	for (var i = 83; i <= 85; i++) {
        snakeArray.push(new Cube(80, i));
    }
	dir = 0;
}

function loadNpSnake() {
	npsnakeArray = [];
	for (var i = 51; i <= 55; i++) {
        npsnakeArray.push(new Cube(i, 50));
    }
	dirnp = 3;
	dirTic = 0;
	var maxT = 90;
	var minT = 10;
	randomDirTic = Math.floor(Math.random() * (maxT - minT)) + minT;
}

function loadFood() {
	var max = 99;
	var min = 1;
	var randomX = Math.floor(Math.random() * (max - min)) + min;
	var randomY = Math.floor(Math.random() * (max - min)) + min;
	foodArray.push(new Cube(randomX, randomY));
	
}

/* MAIN -- HERE is where execution begins after window load */

function main() {
  
  setupWebGL(); // set up the webGL environment
  loadModels(); // load in the models from tri file
  setupShaders(); // setup the webGL shaders
  renderModels(); // draw the triangles using webGL
  
} // end main