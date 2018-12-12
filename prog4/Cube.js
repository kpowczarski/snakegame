class Cube {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		var zC = .3;
		var zF = .29;
		var tN = [0, 1, 0];
		var bN = [0, -1, 0];
		var cN = [0, 0, 1];
		var fN = [0, 0, -1];
		var lN = [-1, 0, 0];
		var rN = [1, 0, 0];
		var l = this.x * .02;
        var r = (this.x+1) * .02;
        var t = this.y * .02;
        var b = (this.y+1) * .02;
        this.positions = [
            l, t, zC, 
            r, t, zC,  
            l, b, zC,  
            r, b, zC, 

            r, t, zC, 
            r, b, zC, 
            r, t, zF, 
            r, b, zF, 

            l, t, zF, 
            r, t, zF, 
            l, b, zF, 
            r, b, zF, 

            l, t, zC, 
            l, b, zC, 
            l, t, zF, 
            l, b, zF,

            l, b, zC, 
            r, b, zC,
            l, b, zF, 
            r, b, zF, 

            l, t, zC,
            r, t, zC, 
            l, t, zF, 
            r, t, zF, 
        ];
        this.indices = [
            0, 1, 2, 
            2, 3, 1,
            4, 5, 6,
            6, 7, 5,
            8, 9, 10, 
            10, 11, 9,
            12, 13, 14, 
            14, 15, 13,
            16, 17, 18, 
            18, 19, 17,
            20, 21, 22,
            22, 23, 21,
        ];
		const faceColors = [
		    [1.0,  1.0,  1.0,  1.0],    // Front face: white
		    [1.0,  0.0,  0.0,  1.0],    // Back face: red
		    [0.0,  1.0,  0.0,  1.0],    // Top face: green
		    [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
		    [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
		    [1.0,  0.0,  1.0,  1.0],    // Left face: purple
		  ];
		var colors = [];

		for (var j = 0; j < faceColors.length; ++j) {
			const c = faceColors[j];

		    // Repeat each color four times for the four vertices of the face
			colors = colors.concat(c, c, c, c);
		}
		this.normals = [
            cN[0], cN[1], cN[2], 
            cN[0], cN[1], cN[2], 
            cN[0], cN[1], cN[2],
            cN[0], cN[1], cN[2],
            rN[0], rN[1], rN[2],
            rN[0], rN[1], rN[2],
            rN[0], rN[1], rN[2],
            rN[0], rN[1], rN[2],
            fN[0], fN[1], fN[2], 
            fN[0], fN[1], fN[2], 
            fN[0], fN[1], fN[2], 
            fN[0], fN[1], fN[2], 
            lN[0], lN[1], lN[2], 
            lN[0], lN[1], lN[2], 
            lN[0], lN[1], lN[2], 
            lN[0], lN[1], lN[2], 
            bN[0], bN[1], bN[2], 
            bN[0], bN[1], bN[2], 
            bN[0], bN[1], bN[2], 
            bN[0], bN[1], bN[2], 
            tN[0], tN[1], tN[2], 
            tN[0], tN[1], tN[2], 
            tN[0], tN[1], tN[2], 
            tN[0], tN[1], tN[2], 
        ];
		this.colorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
		this.positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);
		this.normalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
		this.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

	}
	
	move(x, y) {
		this.x = x;
		this.y = y;
		var l = this.x * .02;
        var r = (this.x+1) * .02;
        var t = this.y * .02;
        var b = (this.y+1) * .02;
        this.positions = [
            l, t, zC, 
            r, t, zC,  
            l, b, zC,  
            r, b, zC, 

            r, t, zC, 
            r, b, zC, 
            r, t, zF, 
            r, b, zF, 

            l, t, zF, 
            r, t, zF, 
            l, b, zF, 
            r, b, zF, 

            l, t, zC, 
            l, b, zC, 
            l, t, zF, 
            l, b, zF,

            l, b, zC, 
            r, b, zC,
            l, b, zF, 
            r, b, zF, 

            l, t, zC,
            r, t, zC, 
            l, t, zF, 
            r, t, zF, 
        ];
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);
	}
	
}