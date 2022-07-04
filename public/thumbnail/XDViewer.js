/** ViewerMatrix ****************************************************************************************/
/**
 * @class
 * @ignore
 */
function ViewerMatrix(_mat) {
	
	if(typeof Float32Array != 'undefined') {
		glMatrixArrayType = Float32Array;
	} else if(typeof WebGLFloatArray != 'undefined') {
		glMatrixArrayType = WebGLFloatArray;
	} else {
		glMatrixArrayType = Array;
	}
	
	this._values = new glMatrixArrayType(16);
	
	if(_mat) {
		this._values = [ mat[0],  mat[1],  mat[2],  mat[3],
						mat[4],  mat[5],  mat[6],  mat[7],
						mat[8],  mat[9],  mat[10], mat[11],
						mat[12], mat[13], mat[14], mat[15] ];
	} else {
		this.identity();
	}
}

ViewerMatrix.prototype = {
	
	identity : function() {
	
		this._values = [1, 0, 0, 0,
						0, 1, 0, 0,
						0, 0, 1, 0,
						0, 0, 0, 1];
	},

	multiply : function(_others) {
		
		var result = new ViewerMatrix();
		result.identity();
		
		var matA = this._values;
		var matB = _others._values;
		
		result._values = [
		
			matB[0]*matA[0] + matB[1]*matA[4] + matB[2]*matA[8] + matB[3]*matA[12],
			matB[0]*matA[1] + matB[1]*matA[5] + matB[2]*matA[9] + matB[3]*matA[13],
			matB[0]*matA[2] + matB[1]*matA[6] + matB[2]*matA[10] + matB[3]*matA[14],
			matB[0]*matA[3] + matB[1]*matA[7] + matB[2]*matA[11] + matB[3]*matA[15],
			matB[4]*matA[0] + matB[5]*matA[4] + matB[6]*matA[8] + matB[7]*matA[12],
			matB[4]*matA[1] + matB[5]*matA[5] + matB[6]*matA[9] + matB[7]*matA[13],
			matB[4]*matA[2] + matB[5]*matA[6] + matB[6]*matA[10] + matB[7]*matA[14],
			matB[4]*matA[3] + matB[5]*matA[7] + matB[6]*matA[11] + matB[7]*matA[15],
			matB[8]*matA[0] + matB[9]*matA[4] + matB[10]*matA[8] + matB[11]*matA[12],
			matB[8]*matA[1] + matB[9]*matA[5] + matB[10]*matA[9] + matB[11]*matA[13],
			matB[8]*matA[2] + matB[9]*matA[6] + matB[10]*matA[10] + matB[11]*matA[14],
			matB[8]*matA[3] + matB[9]*matA[7] + matB[10]*matA[11] + matB[11]*matA[15],
			matB[12]*matA[0] + matB[13]*matA[4] + matB[14]*matA[8] + matB[15]*matA[12],
			matB[12]*matA[1] + matB[13]*matA[5] + matB[14]*matA[9] + matB[15]*matA[13],
			matB[12]*matA[2] + matB[13]*matA[6] + matB[14]*matA[10] + matB[15]*matA[14],
			matB[12]*matA[3] + matB[13]*matA[7] + matB[14]*matA[11] + matB[15]*matA[15]
		];
		
		return result;
	},

	translate : function(_vec) {
		
		var x = _vec[0],
			y = _vec[1],
			z = _vec[2]
			;
		
		this._values[12] = this._values[0]*x + this._values[4]*y + this._values[8]*z + this._values[12];
		this._values[13] = this._values[1]*x + this._values[5]*y + this._values[9]*z + this._values[13];
		this._values[14] = this._values[2]*x + this._values[6]*y + this._values[10]*z + this._values[14];
		this._values[15] = this._values[3]*x + this._values[7]*y + this._values[11]*z + this._values[15];	
	},

	frustum : function(_left, _right, _bottom, _top, _near, _far) {
		
		var rl = (_right - _left);
		var tb = (_top - _bottom);
		var fn = (_far - _near);
		
		this._values = [(_near*2)/rl, 0, 0, 0,
						0, (_near*2)/tb, 0, 0,
						(_right+_left)/rl, (_top+_bottom)/tb, -(_far+_near)/fn, -1,
						0, 0, -(_far*_near*2)/fn, 0];
	},

	perspective : function (_fovy, _aspect, _near, _far) {
		
		var top = _near*Math.tan(_fovy*Math.PI / 360.0);
		var right = top*_aspect;
		
		return this.frustum (-right, right, -top, top, _near, _far);
	},
	
	_setRotationRadian : function (_axis, _angle){
		
		var	cr = Math.cos( _angle );
		var	sr = Math.sin( _angle );
		var	v  = _axis.copy();
		v.normalize();

		// X 좌표 변환값
		this._values[0] = ( v._values[0] * v._values[0] ) * ( 1.0 - cr ) + cr;
		this._values[4] = ( v._values[0] * v._values[1] ) * ( 1.0 - cr ) - (v._values[2] * sr);
		this._values[8] = ( v._values[0] * v._values[2] ) * ( 1.0 - cr ) + (v._values[1] * sr);
		
		// Y 좌표 변환값
		this._values[1] = ( v._values[1] * v._values[0] ) * ( 1.0 - cr ) + (v._values[2] * sr);
		this._values[5] = ( v._values[1] * v._values[1] ) * ( 1.0 - cr ) + cr ;
		this._values[9] = ( v._values[1] * v._values[2] ) * ( 1.0 - cr ) - (v._values[0] * sr);
		
		// Z 좌표 변환값
		this._values[2] = ( v._values[2] * v._values[0] ) * ( 1.0 - cr ) - (v._values[1] * sr);
		this._values[6] = ( v._values[2] * v._values[1] ) * ( 1.0 - cr ) + (v._values[0] * sr);
		this._values[10]= ( v._values[2] * v._values[2] ) * ( 1.0 - cr ) + cr;
		this._values[15] = 1.0;
	}
}


/** ViewerVector ****************************************************************************************/
/**
 * @class
 * @ignore
 */
function ViewerVector(type)
{
	if (type == "double") {
		this._values = new Array([0.0, 0.0, 0.0]);  
	} else if(type == "int") {
		this._values = new Int32Array([0, 0, 0]);
	} else {
		this._values = new Float32Array([0.0, 0.0, 0.0]);
	}
}

ViewerVector.prototype = {
		
	set : function (_x, _y, _z)
	{
		this._values[0]= _x;
		this._values[1]= _y;
		this._values[2]= _z;
	},

	setArray : function (_array)
	{
		if (typeof _array == "undefined" || _array == null) {
			return false;
		}
		
		if (_array.length != 3) {
			return false;
		}
		
		this._values[0]= _array[0];
		this._values[1]= _array[1];
		this._values[2]= _array[2];

		return true;
	},

	copy : function ()
	{
		var cpy;
		
		if (this._values instanceof Int32Array) {
			cpy = new ViewerVector("int");
		} else if (this._values instanceof Array) {
			cpy = new ViewerVector("double");
		} else {
			cpy = new ViewerVector();
		}
		
		cpy.set(this._values[0],this._values[1],this._values[2]);
		
		return cpy;  
	},

	add : function (_vec)
	{   
		if (_vec instanceof ViewerVector) {
			
			this._values[0] = this._values[0] + _vec._values[0];
			this._values[1] = this._values[1] + _vec._values[1];
			this._values[2] = this._values[2] + _vec._values[2];
		}
	},

	subtract : function (vec1, vec2)
	{
		this._values[0] = vec1._values[0]-vec2._values[0];
		this._values[1] = vec1._values[1]-vec2._values[1];
		this._values[2] = vec1._values[2]-vec2._values[2];
	},

	crossProduct : function (_other)
	{
		var result = null;
		
		if (this._values instanceof Int32Array) {
			result = new ViewerVector("int");
		} else if (this._values instanceof Array) {
			result = new ViewerVector("double");
		} else {
			result = new ViewerVector();
		}
		
		result._values[0] = this._values[1]*_other._values[2]-_other._values[1]*this._values[2];
		result._values[1] = this._values[2]*_other._values[0]-_other._values[2]*this._values[0];
		result._values[2] = this._values[0]*_other._values[1]-_other._values[0]*this._values[1];
		
		return result;
	},

	dotProduct : function (_vec)
	{
		if(_vec instanceof ViewerVector) {
			return this._values[0]*_vec._values[0]+this._values[1]*_vec._values[1]+this._values[2]*_vec._values[2];
		}
	},

	getLength : function ()
	{
		var x2 = this._values[0]; x2 *= x2;
		var y2 = this._values[1]; y2 *= y2;
		var z2 = this._values[2]; z2 *= z2;
		return Math.sqrt(x2+y2+z2);
	},

	normalize : function ()
	{
		var l=this.getLength();
		if (l!=0) {
			this._values[0] = this._values[0]/l;
			this._values[1] = this._values[1]/l;
			this._values[2] = this._values[2]/l;   
		}
		return this;
	},

	multiply : function (_d)
	{
	 	this._values[0] *= _d;
		this._values[1] *= _d;
		this._values[2] *= _d;
		return this;
	},

	getAngleWith : function (_vec)
	{							
		var dot = this.dotProduct(_vec);		
		var vectorsMagnitude = this.getLength() * _vec.getLength();
		var angle = Math.acos(dot / vectorsMagnitude);
		if (isNaN(angle)) {
			return 0;
		}
		angle = (angle* 180.0 / Math.PI);
		return angle;
	},
	
	transformNormalWithMatrix : function (_mat) {
		
		var x = this._values[0];
		var y = this._values[1];
		var z = this._values[2];
		
		this._values[0] = x*_mat._values[0] + y*_mat._values[1] + z*_mat._values[2];
		this._values[1] = x*_mat._values[4] + y*_mat._values[5] + z*_mat._values[6];
		this._values[2] = x*_mat._values[8] + y*_mat._values[9] + z*_mat._values[10];
	},

	getTriangleNormal : function (_other_first, _other_secont) {

		var edge_first = new ViewerVector("float");
		edge_first.subtract(_other_first, this);

		var edge_secont = new ViewerVector("float");
		edge_secont.subtract(_other_secont, this);

		var result = edge_first.crossProduct(edge_secont);
		result.normalize();
		
		return result;
	}
}

/** BinaryReader ****************************************************************************************/
/**
 * @class
 * @ignore
 */
function BinaryReader(_data) {
	
	this._buffer = _data;
	this._pos = 0;

};

BinaryReader.prototype = {

	readInt8:	function (){ return this._decodeInt(8, true); },
	readUInt8:	function (){ return this._decodeInt(8, false); },
	readInt16:	function (){ return this._decodeInt(16, true); },
	readUInt16:	function (){ return this._decodeInt(16, false); },
	readInt32:	function (){ return this._decodeInt(32, true); },
	readUInt32:	function (){ return this._decodeInt(32, false); },

	readFloat:	function (){ return this._decodeFloat(23, 8); },
	readDouble:	function (){ return this._decodeFloat(52, 11); },
	
	readChar:	function () { return this.readString(1); },
	readString: function (length) {
		var result = this._buffer.substr(this._pos, length);
		this._pos += length;
		return result;
	},
	
	_decodeFloat: function(precisionBits, exponentBits){

		var length = precisionBits + exponentBits + 1;
		var size = length >> 3;

		var bias = Math.pow(2, exponentBits - 1) - 1;
		var signal = this._readBits(precisionBits + exponentBits, 1, size);
		var exponent = this._readBits(precisionBits, exponentBits, size);
		var significand = 0;
		var divisor = 2;
		var curByte = 0;
		do {
			var byteValue = this._readByte(++curByte, size);
			var startBit = precisionBits % 8 || 8;
			var mask = 1 << startBit;
			while (mask >>= 1) {
				if (byteValue & mask) {
					significand += 1 / divisor;
				}
				divisor *= 2;
			}
		} while (precisionBits -= startBit);

		this._pos += size;

		return exponent == (bias << 1) + 1 ? significand ? NaN : signal ? -Infinity : +Infinity
			: (1 + signal * -2) * (exponent || significand ? !exponent ? Math.pow(2, -bias + 1) * significand
			: Math.pow(2, exponent - bias) * (1 + significand) : 0);
	},

	_decodeInt: function(bits, signed){
		var x = this._readBits(0, bits, bits / 8), max = Math.pow(2, bits);
		var result = signed && x >= max / 2 ? x - max : x;

		this._pos += bits / 8;
		return result;
	},

	_shl: function (a, b){
		for (++b; --b; a = ((a %= 0x7fffffff + 1) & 0x40000000) == 0x40000000 ? a * 2 : (a - 0x40000000) * 2 + 0x7fffffff + 1);
		return a;
	},
	
	_readByte: function (i, size) {
		return this._buffer.charCodeAt(this._pos + size - i - 1) & 0xff;
	},

	_readBits: function (start, length, size) {
		var offsetLeft = (start + length) % 8;
		var offsetRight = start % 8;
		var curByte = size - (start >> 3) - 1;
		var lastByte = size + (-(start + length) >> 3);
		var diff = curByte - lastByte;

		var sum = (this._readByte(curByte, size) >> offsetRight) & ((1 << (diff ? 8 - offsetRight : length)) - 1);

		if (diff && offsetLeft) {
			sum += (this._readByte(lastByte++, size) & ((1 << offsetLeft) - 1)) << (diff-- << 3) - offsetRight; 
		}

		while (diff) {
			sum += this._shl(this._readByte(lastByte++, size), (diff-- << 3) - offsetRight);
		}

		return sum;
	},

	_checkSize: function (neededBits) {
		if (!(this._pos + Math.ceil(neededBits / 8) < this._buffer.length)) {
			throw new Error("Index out of bound");
		}
	}
};

/** Texture ****************************************************************************************/
/**
 * @class
 * @ignore
 */
function ViewerTexture(_gl) {

	this.gl = _gl;
	this.textureData = null;
	this.isLoaded = false;
}

ViewerTexture.prototype = {
	
	loadTexture : function (_gl, _faceIndex, _url, _callback) {
		
		this.textureData = _gl.createTexture();
		
		var textureWrapper = this;
		
		var image = new Image();
		image.gl = _gl;
		image.crossOrigin = "anonymous";
		image.textureWrapper = this;
		
		image.onload = function() {
			
			var gl = this.gl;
			
			gl.bindTexture(gl.TEXTURE_2D, textureWrapper.textureData);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureWrapper.textureData.image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.bindTexture(gl.TEXTURE_2D, null);
		
			textureWrapper.isLoaded = true;
			
			if (_callback) {
				_callback();
			}
		};
		
		image.src = _url;
		this.textureData.image = image;
		
		return this.textureData;
	}
};

/** ViewerCamera ****************************************************************************************/
/**
 * @class
 * @ignore
 */
function ViewerCamera(_gl) {
	
	this.gl = _gl;
	this.fNear = 1.0;
	this.fFar = 100000.0;
	
	this.matProj = new ViewerMatrix();
	this.matView = new ViewerMatrix();
	
	this.vEyePt = new ViewerVector(); 
	this.vLookatPt = new ViewerVector();
	this.vView = new ViewerVector();
	this.vUpVec = new ViewerVector();
	
	this.vBasicEyePt = new ViewerVector("double");
	this.vBasicEyePt = this.vEyePt.copy();
	
	this.limitDistanceMin = 5.0;
	this.limitDistanceMax = 1000.0;

	this.isAutoRotationMove = false;
	this.autoRotationAngle = 0.1;
		
	this.matProj.identity();
	this.matView.identity();
	
	this.vUpVec.set(0.0, 1.0, 0.0);
	this.vLookatPt.set(0.0, 0.0, 0.0);
	this.vEyePt.set(0.0, 150.0, 200.0);

	this.initCamera(_gl);
}

ViewerCamera.prototype = {
	
	initCamera : function() {
		
		this.lookAtLH(this.vEyePt, this.vLookatPt, this.vUpVec, this.matView);
		this.matProj.perspective(45, this.gl.viewportWidth / this.gl.viewportHeight, this.fNear, this.fFar);
	},
	
	lookAtLH : function(_eye, _center, _up, _dest) {
		
		if(!_dest) {
			_dest = new ViewerMatrix();
			_dest.identity();
		}
	
		var xAxis = new ViewerVector("double");
		var yAxis = new ViewerVector("double");
		var zAxis = new ViewerVector("double");
		
		zAxis.subtract(_eye, _center);
		zAxis.normalize();
		
		xAxis = _up.crossProduct(zAxis);
		xAxis.normalize();
		
		yAxis = zAxis.crossProduct(xAxis);
		yAxis.normalize();
		
		_dest._values[0] = xAxis._values[0];	_dest._values[1] = yAxis._values[0];  _dest._values[2] = zAxis._values[0];  _dest._values[3] = 0;
		_dest._values[4] = xAxis._values[1];	_dest._values[5] = yAxis._values[1];  _dest._values[6] = zAxis._values[1];  _dest._values[7] = 0;
		_dest._values[8] = xAxis._values[2];	_dest._values[9] = yAxis._values[2];  _dest._values[10] = zAxis._values[2];  _dest._values[11] = 0;
		_dest._values[12] = -xAxis.dotProduct(_eye);
		_dest._values[13] = -yAxis.dotProduct(_eye);
		_dest._values[14] = -zAxis.dotProduct(_eye);
		_dest._values[15] = 1;
	},
	
	rotation : function (_subx, _suby) {
	
		// view dir
		var vView = new ViewerVector("double"),
			rotMatX = new ViewerMatrix(),
			rotMatY = new ViewerMatrix();
		
		rotMatX.identity();
		rotMatY.identity();
				
		vView.subtract(this.vLookatPt, this.vEyePt);
		
		// up을 회전 축으로 하는 행렬 생성(rotX), vView에 적용 
		rotMatX._setRotationRadian(this.vUpVec, _subx*(Math.PI/180.0));
		vView.transformNormalWithMatrix(rotMatX);
		
		// side를 회전 축으로 하는 행렬 생성(rotY), vView에 적용
		var vSide = new ViewerVector("double");
		vSide = vView.crossProduct(this.vUpVec);
		vSide.normalize();
		rotMatY._setRotationRadian(vSide, _suby*(Math.PI/180.0));
		vView.transformNormalWithMatrix(rotMatY);
		
		// eye 재계산
		this.vEyePt.subtract(this.vLookatPt, vView);

		// 뷰 행렬, 투영 행렬 다시 계산
		this.lookAtLH(this.vEyePt, this.vLookatPt, this.vUpVec, this.matView);
		this.matProj.perspective(45, this.gl.viewportWidth / this.gl.viewportHeight, this.fNear, this.fFar);
	},

	zoom : function(_delta){
		
		var vView = new ViewerVector("double");
		vView.subtract(this.vLookatPt, this.vEyePt);
		vView.normalize();
		vView.multiply(_delta*0.05);
		
		var tempEyePt = this.vEyePt.copy();
		tempEyePt.add(vView);
		var distance = tempEyePt.getLength();
		
		if(distance > this.limitDistanceMin && distance < this.limitDistanceMax) {
			this.vEyePt.add(vView);
			this.initCamera();
		}
	},

	getDistance : function(){
		
		var vView = new ViewerVector("double");
		vView.subtract(this.vLookatPt, this.vEyePt);
		
		return vView.getLength();
	},
	
	setDistance : function(_distance) {
		
		if (isNaN(_distance)) {
			return;
		}

		if (_distance < this.limitDistanceMin) {
			_distance = this.limitDistanceMin;
		}
		
		var vView = new ViewerVector("double");
		vView.subtract( this.vEyePt, this.vLookatPt);
		vView.normalize();
		vView.multiply(_distance);
		
		this.vEyePt.set(0.0, 0.0, 0.0);
		this.vEyePt.add(vView);
		this.initCamera();
	},
	
	resetCameraPosition : function() {
		
		this.vUpVec.set(0.0, 1.0, 0.0);
		this.vLookatPt.set(0.0, 0.0, 0.0);
		this.vEyePt = this.vBasicEyePt.copy();	
		
		this.lookAtLH(this.vEyePt, this.vLookatPt, this.vUpVec, this.matView);
		this.matProj.perspective(45, this.gl.viewportWidth / this.gl.viewportHeight, this.fNear, this.fFar);
	}
};

/** ViewerGround ****************************************************************************************/
/**
 * @class
 * @ignore
 */
function ViewerGround(_gl, _altitude, _radius, _oneTileSize, _sliceNum) {

	this.isReady = false;
	this.isVisible = true;
	this.altitude = 0.0;
	
	this.vertex = [];
	this.color = [];
	
	this.renderBuffer = {
		
		vertex : null,
		color : null,
		normal : null,
		
		isReady : false
	};
	
	this.init(_altitude, _radius, _oneTileSize, _sliceNum);
}

ViewerGround.prototype = {
	
	init : function (_altitude, _radius, _oneTileSize, _sliceNum) {
		
		_radius += (_oneTileSize - _radius%_oneTileSize);
		
		var angle = (360.0/_sliceNum) * (Math.PI/180.0);
		
		this.vertex[0] = 0.0;
		this.vertex[1] = _altitude;
		this.vertex[2] = 0.0;
		
		for (var i=1; i<_sliceNum+2; i++) {
			this.vertex[i*3] = _radius * Math.cos(angle*i);
			this.vertex[i*3+1] = _altitude;
			this.vertex[i*3+2] = _radius * Math.sin(angle*i);
		}
		
		this.color[0] = 0.0;
		this.color[1] = 0.0;
		this.color[2] = 0.0;
		this.color[3] = 1.0;
		
		for (var i=1; i<_sliceNum+2; i++) {
			this.color[i*4] = 0.2;
			this.color[i*4+1] = 0.2;
			this.color[i*4+2] = 0.2;
			this.color[i*4+3] = 0.0;
		}
		
		this.altitude = _altitude;
		this.isReady = true;
	},
	
	render : function (_gl, _shader, _camera) {
		
		if (!_shader.isReady || !this.isReady || !this.isVisible) {
			return;
		}
		
		if (!this.renderBuffer.isReady) {
			this._initBuffer(_gl);
		}
		
		var program = _shader.program;
		
		_gl.useProgram(program);
		
		// 뷰포트 설정
		_gl.viewport(0, 0, _gl.viewportWidth, _gl.viewportHeight);
		
		// 매트릭스 초기화
		var wMatrix = new ViewerMatrix();
		wMatrix.identity();
		
		_gl.bindBuffer(_gl.ARRAY_BUFFER, this.renderBuffer.vertex);
		_gl.vertexAttribPointer(program.aPosition, this.renderBuffer.vertex.itemSize, _gl.FLOAT, false, 0, 0);

		_gl.bindBuffer(_gl.ARRAY_BUFFER, this.renderBuffer.color);
		_gl.vertexAttribPointer(program.aColor, this.renderBuffer.color.itemSize, _gl.FLOAT, false, 0, 0);
		
		_gl.uniformMatrix4fv(program.uMoveMatrix, false, wMatrix._values);
		_gl.uniformMatrix4fv(program.uProjMatrix, false, _camera.matProj._values);
		_gl.uniformMatrix4fv(program.uViewMatrix, false, _camera.matView._values);
		
		_gl.enable(_gl.BLEND);
		
		_gl.blendFunc(_gl.SRC_COLOR, _gl.ONE);
		_gl.frontFace(_gl.CW);
		_gl.enable(_gl.CULL_FACE);
		_gl.cullFace(_gl.BACK);
		
		_gl.drawArrays(_gl.TRIANGLE_FAN, 0, this.renderBuffer.vertex.numItems);

		_gl.disable(_gl.BLEND);
		_gl.disable(_gl.CULL_FACE);
	},
	
	/* private */
	_initBuffer : function (_gl) {
		
		this.renderBuffer.vertex = _gl.createBuffer();
		_gl.bindBuffer(_gl.ARRAY_BUFFER, this.renderBuffer.vertex);
		_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(this.vertex), _gl.STATIC_DRAW);
		this.renderBuffer.vertex.itemSize = 3;
		this.renderBuffer.vertex.numItems = this.vertex.length;
		
		this.renderBuffer.color = _gl.createBuffer();
		_gl.bindBuffer(_gl.ARRAY_BUFFER, this.renderBuffer.color);
		_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(this.color), _gl.STATIC_DRAW);
		this.renderBuffer.color.itemSize = 4;
		this.renderBuffer.color.numItems = this.color.length;
	},
	
	setVisible : function(_visible) {
		this.isVisible = _visible;
	},
};

/** ViewerGrid ****************************************************************************************/
/**
 * @class
 * @ignore
 */
function ViewerGrid(_gl, _altitude, _radius, _oneTileSize){
	
	this.isReady = false;
	this.isVisible = true;
	this.altitude = _altitude;
	
	this.vertex = [];
	this.color = [];
	
	this.renderBuffer = {
		
		vertex : null,
		color : null,
		normal : null,
		
		isReady : false
	};
	
	this.init(_altitude, _radius, _oneTileSize);
}

ViewerGrid.prototype = {
	
	init : function (_altitude, _radius, _oneTileSize) {

		_radius += (_oneTileSize - _radius%_oneTileSize);
		
		var gridWidthCount = (_radius / _oneTileSize)*2;
		var gridWidth = gridWidthCount * _oneTileSize;

		var startPosition = - gridWidth * 0.5;

		var vertexCount = 0;
		for (var i=0; i<gridWidthCount+1; i++){
			
			this.vertex[vertexCount++] = startPosition;
			this.vertex[vertexCount++] = _altitude;
			this.vertex[vertexCount++] = startPosition + (_oneTileSize * i);

			this.vertex[vertexCount++] = startPosition + gridWidth;
			this.vertex[vertexCount++] = _altitude;
			this.vertex[vertexCount++] = startPosition + (_oneTileSize * i);
		}

		for (var i=0; i<gridWidthCount+1; i++){

			this.vertex[vertexCount++] = startPosition + (_oneTileSize * i);
			this.vertex[vertexCount++] = _altitude;
			this.vertex[vertexCount++] = startPosition;

			this.vertex[vertexCount++] = startPosition + (_oneTileSize * i);
			this.vertex[vertexCount++] = _altitude;
			this.vertex[vertexCount++] = startPosition + gridWidth;
		}
		
		for (var i=0; i<(gridWidthCount+1)*(gridWidthCount+1); i++){
			this.color[i*4] = 1.0;
			this.color[i*4+1] = 1.0;
			this.color[i*4+2] = 1.0;
			this.color[i*4+3] = 0.5;
		}
		
		this.altitude = _altitude;
		this.isReady = true;
	},
	
	render : function(_gl, _shader, _camera) {
		
		if (!_shader.isReady || !this.isReady || !this.isVisible) {
			return;
		}
		
		if (!this.renderBuffer.isReady) {
			this._initBuffer(_gl);
		}
		
		var program = _shader.program;
		
		_gl.useProgram(program);
		
		// 뷰포트 설정
		_gl.viewport(0, 0, _gl.viewportWidth, _gl.viewportHeight);
		
		// 매트릭스 초기화
		var wMatrix = new ViewerMatrix();
		wMatrix.identity();

		_gl.bindBuffer(_gl.ARRAY_BUFFER, this.renderBuffer.vertex);
		_gl.vertexAttribPointer(program.aPosition, this.renderBuffer.vertex.itemSize, _gl.FLOAT, false, 0, 0);

		_gl.bindBuffer(_gl.ARRAY_BUFFER, this.renderBuffer.color);
		_gl.vertexAttribPointer(program.aColor, this.renderBuffer.color.itemSize, _gl.FLOAT, false, 0, 0);

		_gl.uniformMatrix4fv(program.uMoveMatrix, false, wMatrix._values);
		_gl.uniformMatrix4fv(program.uProjMatrix, false, _camera.matProj._values);
		_gl.uniformMatrix4fv(program.uViewMatrix, false, _camera.matView._values);
		
		_gl.enable(_gl.BLEND);
		_gl.blendFunc(_gl.SRC_ALPHA, _gl.ONE);
		_gl.frontFace(_gl.CW);
		_gl.enable(_gl.CULL_FACE);
		_gl.cullFace(_gl.BACK);
		
		_gl.drawArrays(_gl.LINES, 0, this.renderBuffer.vertex.numItems);

		_gl.disable(_gl.BLEND);
		_gl.disable(_gl.CULL_FACE);
	},
	
	setVisible : function(_visible) {
		this.isVisible = _visible;
	},
		
	/* private */
	_initBuffer : function (_gl) {

		this.renderBuffer.vertex = _gl.createBuffer();
		_gl.bindBuffer(_gl.ARRAY_BUFFER, this.renderBuffer.vertex);
		_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(this.vertex), _gl.STATIC_DRAW);

		this.renderBuffer.vertex.itemSize = 3;
		this.renderBuffer.vertex.numItems = this.vertex.length/3;

		this.renderBuffer.color = _gl.createBuffer();
		_gl.bindBuffer(_gl.ARRAY_BUFFER, this.renderBuffer.color);
		_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(this.color), _gl.STATIC_DRAW);

		this.renderBuffer.color.itemSize = 4;
		this.renderBuffer.color.numItems = this.color.length/4;
		
		this.renderBuffer.isReady = true;
	}
};

/** ViewerModel ****************************************************************************************/
/**
 * @classdesc 모델 렌더링 설정 API 인스턴스
 * @class
 * @hideconstructor
 */
function ViewerModel()
{	
	this.isLoaded = false;
	this.isVisible = false;
	this.isSelectable = false;
	this.isSelect = false;

	this.key = "";
	
	this.attribute = {
		
		box : {
			minX : 0.0, minY : 0.0, minZ : 0.0,
			maxX : 0.0, maxY : 0.0, maxZ : 0.0,
		},
		
		position : {
			x : 0.0, y : 0.0, z : 0.0,
			rho : 0.0,
			longitude : 0.0,
			latitude : 0.0,
			altitude : 0.0
		},
		
		size : {
			bottomFaceRadius : 0.0,
			height : 0.0
		}
	};
	
	this.color = {
		alpha : 1.0,
		red : 1.0,
		green : 1.0,
		blue : 1.0
	};
	
	this.meshses = [];
	this.renderBuffer = [];
		
	this.pickBuffer = {
		
		vertex : null,
		index : null,
		
		isReady : false
	};
}

ViewerModel.prototype = {
	
	readXDO : function(_data, _options) {
		
		var xdoType = _options.xdoType;
		if (typeof xdoType != 'string') {
			return;
		}
		
		switch (xdoType) {
		case "real3d":
			this._readXdoReal3D(_data, _options);
			break;
		case "multiface":
			this._readXdoMultiface(_data, _options);
			break;
		default:
			return;
		}
		
		this.isLoaded = true;
		this.isVisible = true;
		this.isReady = true;
	},
	
	transformMeshToFace : function (_mesh, _materials) {

		var faces = [];

		var materialGroups = _mesh.materialGroups;
		if (materialGroups.length == 0) {
			var faceIndex = [];
			for (var i=0; i<_mesh.triangleList.length; i++) {
				faceIndex.push(i);
			}
			materialGroups.push({
				faceIndex : faceIndex
			});
		}

		for (var i=0; i<materialGroups.length; i++) {

			var materialGroup = materialGroups[i];
			var faceIndex = materialGroup.faceIndex;
			var faceIndexCount = faceIndex.length;

			var vertex = [];
			var index = [];
			var normal = [];
			var uv = [];
			var color = {r : 1.0, g : 1.0, b : 1.0};

			for (var j=0; j<faceIndexCount; j++) {

				var triangle = _mesh.triangleList[faceIndex[j]];
				if (typeof triangle == "undefined") {
					continue;
				}

				var triangle_v0 = new ViewerVector("float");
				triangle_v0.setArray(_mesh.vertexList[triangle.index[0]]);
				
				var triangle_v1 = new ViewerVector("float");
				triangle_v1.setArray(_mesh.vertexList[triangle.index[1]]);

				var triangle_v2 = new ViewerVector("float");
				triangle_v2.setArray(_mesh.vertexList[triangle.index[2]]);

				// vertex
				vertex = vertex.concat(Array.from(triangle_v0._values));
				vertex = vertex.concat(Array.from(triangle_v1._values));
				vertex = vertex.concat(Array.from(triangle_v2._values));

				// normal
				var triangle_normal = triangle_v0.getTriangleNormal(triangle_v1, triangle_v2);
				triangle_normal = Array.from(triangle_normal._values);
				normal = normal.concat(triangle_normal);
				normal = normal.concat(triangle_normal);
				normal = normal.concat(triangle_normal);

				// uv
				uv = uv.concat(_mesh.uvList[triangle.index[0]]);
				uv = uv.concat(_mesh.uvList[triangle.index[1]]);
				uv = uv.concat(_mesh.uvList[triangle.index[2]]);
			}

			// index
			for (var j=0; j<vertex.length; j++) {
				index.push(j);
			}

			// color
			for (var name in _materials) {
				if (materialGroup.name == name) {
					if (_materials[name].diffuseColor) {
						color = _materials[name].diffuseColor;
					}
				}
			}

			faces.push({
				vertex : new Float32Array(vertex),
				index : new Uint16Array(index),
				uv : new Float32Array(uv),
				normal : new Float32Array(normal),
				color : color
			})
		}
		
		return faces;
	},

	getVertexCenter : function() {

		// 모델 버텍스 원점 정규화
		var center = {
			x : 0, 
			y : 0, 
			z : 0
		};
		var vertexCount = 0;

		for (var i=0; i<this.meshes.length; i++) {
			var mesh = this.meshes[i];
			for (var j=0; j<mesh.vertex.length; j+=3) {
				center.x += mesh.vertex[j];
				center.y += mesh.vertex[j+1];
				center.z += mesh.vertex[j+2];
				vertexCount++;
			}
		}

		center.x /= vertexCount;
		center.y /= vertexCount;
		center.z /= vertexCount;

		return center;
	},

	isExistFace : function(_faceIndex) {
		return (typeof this.meshes[_faceIndex] != "undefined");
	},

	renewVertexBox : function() {

		// 모델 버텍스 원점 정규화
		var isBoxReset = false;
		var box = {
			min : {
				x : 0,
				y : 0,
				z : 0
			},
			max :  {
				x : 0,
				y : 0,
				z : 0
			}
		};
		
		for (var i=0; i<this.meshes.length; i++) {

			var mesh = this.meshes[i];
			
			for (var j=0; j<mesh.vertex.length; j+=3) {

				if (!isBoxReset) {
					box.min.x = box.max.x = mesh.vertex[j];
					box.min.y = box.max.y = mesh.vertex[j+1];
					box.min.z = box.max.z = mesh.vertex[j+2];
					isBoxReset = true;
				} else {

					if (mesh.vertex[j] < box.min.x ) {
						box.min.x = mesh.vertex[j];
					} else if (mesh.vertex[j] > box.max.x) {
						box.min.x = mesh.vertex[j];
					}

					if (mesh.vertex[j+1] < box.min.y ) {
						box.min.y = mesh.vertex[j+1];
					} else if (mesh.vertex[j+1] > box.max.y) {
						box.min.y = mesh.vertex[j+1];
					}

					if (mesh.vertex[j+2] < box.min.z ) {
						box.min.z = mesh.vertex[j+2];
					} else if (mesh.vertex[j+2] > box.max.z) {
						box.min.z = mesh.vertex[j+2];
					}
				}
			}
		}

		this.box = box;
	},

	read3DS : function(_data, _options) {
	
		var parser = new ViewerParser3DS();
		parser.readFile(_data);

		this.meshes = [];

		for (i = 0; i < parser.meshes.length; i++) {
			
			var faces = this.transformMeshToFace(parser.meshes[i], parser.materials);
			
			for (var j=0; j<faces.length; j++) {
				this.meshes.push(faces[j]);
			}
		}

		// 버텍스 정규화
		var center = this.getVertexCenter();
		
		for (var i=0; i<this.meshes.length; i++) {
			var mesh = this.meshes[i];
			for (var j=0; j<mesh.vertex.length; j+=3) {
				mesh.vertex[j] -= center.x;
				mesh.vertex[j+1] -= center.y;
				mesh.vertex[j+2] -= center.z;
			}
		}

		this.renewVertexBox();

		this.attribute.size.height = 0;

		this.attribute.position.x = 0;
		this.attribute.position.y = 0;
		this.attribute.position.z = 0;
		this.attribute.position.altitude = 0.0;
		
		this.attribute.size.height = this.box.max.y - this.box.min.y;

		var boxWidth = Math.abs(this.box.max.y - this.box.min.y);
		var boxDepth = Math.abs(this.box.max.z - this.box.min.z);
		this.attribute.size.bottomFaceRadius = Math.sqrt( (boxWidth*boxWidth)+(boxDepth*boxDepth) ) * 0.5;

		this.isLoaded = true;
		this.isVisible = true;
		this.isReady = true;
	},
	
	getExtent : function() {
		
		var boxExtent = new ViewerVector("float");
		boxExtent.set(
			Math.abs(this.box.max.x - this.box.min.x),
			Math.abs(this.box.max.y - this.box.min.y),
			Math.abs(this.box.max.z - this.box.min.z)
		);
		
		return boxExtent.getLength();
	},
	
	setSelect : function (_select) {
	
		if (this.isSelect == _select) {
			return;
		}
	
		if (_select) {
			
			this.color.alpha = 1.0;
			this.color.red = 1.0;
			this.color.green = 0.0;
			this.color.blue = 0.0;
			
		} else {
			
			this.color.alpha = 1.0;
			this.color.red = 1.0;
			this.color.green = 1.0;
			this.color.blue = 1.0;
		}
				
		this.isSelect = _select;
	},
	
	/**
	 * @method      ViewerModel.setColor
	 * @description 모델 색상을 설정합니다.
	 * @param 		_r {number} 모델 red 색상 (0.0 ~ 1.0 사이 값)
	 * @param 		_g {number} 모델 green 색상 (0.0 ~ 1.0 사이 값)
	 * @param 		_b {number} 모델 blue 색상 (0.0 ~ 1.0 사이 값)
	 * @return 		{Boolearn} 초기화 성공 여부
	 * @example
	 * XDViewer.getModel('TEST_MODEL').setColor(1.0, 1.0, 0.1);
	 */
	setColor : function(_r, _g, _b) {
		
		this.color.red = _r;
		this.color.green = _g;
		this.color.blue = _b;
	},
	
	/**
	 * @method      ViewerModel.setAlpha
	 * @description 모델 알파 값(투명도)를 설정합니다.
	 * @param 		_a {number} 모델 투명도 값 (0.0 ~ 1.0 사이 값)
	 * @example
	 * XDViewer.getModel('TEST_MODEL').setAlpha(0.5);
	 */
	setAlpha : function(_a) {
		
		this.color.alpha = _a;
	},
	
	/**
	 * @method      ViewerModel.setVisible
	 * @description 모델 가시 상태를 설정합니다.
	 * @param 		_visible {Boolearn} 모델 가시 상태
	 * @example
	 * XDViewer.getModel('TEST_MODEL').setVisible(true);
	 */
	setVisible : function(_visible) {
		
		this.isVisible = _visible;
	},
	
	/**
	 * @method      ViewerModel.getVisible
	 * @description 모델 가시 상태를 반환합니다.
	 * @return 		{Boolearn} 모델 보임(true)/숨김(false) 상태
	 * @example
	 * var isVisible = XDViewer.getModel('TEST_MODEL').getVisible();
	 */
	getVisible : function() {
		return this.isVisible;
	},

	isAllTextureLoaded : function() {

		for (var i=0; i<this.meshes.length; i++) {

			var meshTexture = this.meshes[i].texture;
			if (meshTexture) {
				if (!meshTexture.isLoaded) {
					return false;
				}
			}
		}

		return true;
	},

	render : function (_gl, _shader, _camera) {
		
		if (!_shader.isReady || !this.isReady || !this.isVisible) {
			return;
		}

		var program = _shader.program;
		_gl.useProgram(program);

		// 매트릭스 초기화
		var mvMatrix = new ViewerMatrix();
		mvMatrix.identity();
		mvMatrix.translate([0.0, 0.0, 0.0]);
	
		_gl.uniformMatrix4fv(program.uMoveMatrix, false, mvMatrix._values);
		_gl.uniformMatrix4fv(program.uProjMatrix, false, _camera.matProj._values);
		_gl.uniformMatrix4fv(program.uViewMatrix, false, _camera.matView._values);
		
		for (var i=0; i<this.meshes.length; i++) {
				
			var mesh = this.meshes[i];

			if (typeof mesh.renderBuffer == "undefined") {

				var renderBuffer_vertex = _gl.createBuffer();
				_gl.bindBuffer(_gl.ARRAY_BUFFER, renderBuffer_vertex);
				_gl.bufferData(_gl.ARRAY_BUFFER, mesh.vertex, _gl.STATIC_DRAW);
				
				var renderBuffer_index = _gl.createBuffer();
				_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, renderBuffer_index);
				_gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, mesh.index, _gl.STATIC_DRAW);
				
				var renderBuffer_uv = _gl.createBuffer();
				_gl.bindBuffer(_gl.ARRAY_BUFFER, renderBuffer_uv);
				_gl.bufferData(_gl.ARRAY_BUFFER, mesh.uv, _gl.STATIC_DRAW);
				
				var renderBuffer_normal = _gl.createBuffer();
				_gl.bindBuffer(_gl.ARRAY_BUFFER, renderBuffer_normal);
				_gl.bufferData(_gl.ARRAY_BUFFER, mesh.normal, _gl.STATIC_DRAW);

				mesh.renderBuffer = {
					vertex : renderBuffer_vertex,
					index : renderBuffer_index,
					uv : renderBuffer_uv,
					normal : renderBuffer_normal
				};
			}
			
			// 버퍼 설정
			_gl.bindBuffer(_gl.ARRAY_BUFFER, mesh.renderBuffer.vertex);
			_gl.vertexAttribPointer(program.aPosition, 3, _gl.FLOAT, false, 0, 0);

			_gl.bindBuffer(_gl.ARRAY_BUFFER, mesh.renderBuffer.uv);
			_gl.vertexAttribPointer(program.aUV, 2, _gl.FLOAT, false, 0, 0);
			
			_gl.bindBuffer(_gl.ARRAY_BUFFER, mesh.renderBuffer.normal);
			_gl.vertexAttribPointer(program.aNormal, 3, _gl.FLOAT, false, 0, 0);
			
			if (mesh.texture != null && mesh.texture.isLoaded) {

				_gl.activeTexture(_gl.TEXTURE0);
				_gl.bindTexture(_gl.TEXTURE_2D, mesh.texture.textureData);
				
				_gl.uniform1i(program.uUseTexture, 1);
			
			} else {
				_gl.uniform1i(program.uUseTexture, 0);
			}
			
			_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, mesh.renderBuffer.index);
			
			_gl.uniform1i(program.uSampler, 0);
			_gl.uniform1f(program.uAlpha, this.color.alpha);
			_gl.uniform3f(program.uColor, mesh.color.r, mesh.color.g, mesh.color.b);

			_gl.drawElements(_gl.TRIANGLES, mesh.index.length, _gl.UNSIGNED_SHORT, 0);
		}
	},

	renderPickFrame : function (_gl, _shader, _camera, _colorID) {
		
		if (!this.isReady || !this.isSelectable || !this.isVisible) {
			return;
		}
		
		if (!_shader.isReady) {
			return;
		}
		
		if (!this.pickBuffer.isReady) {
			this._initPickBuffer(_gl);
		}
		
		var program = _shader.program;
		
		_gl.useProgram(program);
			
		// 매트릭스 초기화
		var mvMatrix = new ViewerMatrix();		// 이동 행렬
		mvMatrix.identity();

		// 뷰포트 설정
		_gl.viewport(0, 0, _gl.viewportWidth, _gl.viewportHeight);
		
		// 각 매트릭스 설정
		mvMatrix.translate([0.0, this.attribute.size.height/2.0, 0.0]);
		
		_gl.vertexAttribPointer(program.aPosition, 3, _gl.FLOAT, false, 0, 0);

		_gl.uniformMatrix4fv(program.uProjMatrix, false, _camera.matProj._values);
		_gl.uniformMatrix4fv(program.uMoveMatrix, false, mvMatrix._values);
		_gl.uniformMatrix4fv(program.uViewMatrix, false, _camera.matView._values);
		_gl.uniform4fv(program.uPickColorID, _colorID);
		
		_gl.drawElements(_gl.TRIANGLES, this.pickBuffer.index.numItems, _gl.UNSIGNED_SHORT, 0);
	},
	
	/* private */
	_readXdoReal3D : function(_data, _options) {
		
		var reader = new BinaryReader(_data),
			
			attr = this.attribute,
			objBox = attr.box,
			position = attr.position,
			size = attr.size;
			
		reader.readUInt8();		// type
		reader.readUInt32();	// id
		
		var keyLength = reader.readUInt8();	
		reader.readString(keyLength); 	

		objBox.minX = reader.readDouble();
		objBox.minY = reader.readDouble();
		objBox.minZ = reader.readDouble();
		objBox.maxX = reader.readDouble();
		objBox.maxY = reader.readDouble();
		objBox.maxZ = reader.readDouble();

		position.x = (objBox.minX + objBox.maxX) / 2.0;
		position.y = (objBox.minY + objBox.maxY) / 2.0;
		position.z = (objBox.minZ + objBox.maxZ) / 2.0;
		position.altitude = reader.readFloat();
		
		size.height = objBox.maxZ - objBox.minZ;
		size.bottomFaceRadius = Math.sqrt((objBox.maxX-objBox.minX)*(objBox.maxX-objBox.minX)
										 +(objBox.maxY-objBox.minY)*(objBox.maxY-objBox.minY)) / 2.0;
		
		var xdoReal3dType = (typeof _options.xdoReal3dType == 'undefined') ? '3001' : _options.xdoReal3dType;  
		
		if (xdoReal3dType == "3002") {
			reader.readUInt8();
		}
		
		var temp_lonlat = this._cartesianToSpherical(position.x, position.y, position.z);
		position.rho = temp_lonlat._values[0];
		position.longitude = temp_lonlat._values[1];
		position.latitude = temp_lonlat._values[2];
		
		// 버텍스 정보 입력
		var temp_vertexcount = reader.readUInt32();
		this.vertex = new Float32Array(temp_vertexcount*3);
		this.uv = new Float32Array(temp_vertexcount*2);

		var temp_x, temp_y, temp_z, temp_result;
		for (var i=0, len = temp_vertexcount; i<len; i+=1) {
			
			temp_x = reader.readFloat(); 
			temp_y = reader.readFloat();
			temp_z = reader.readFloat();
			
			temp_result = this._rotateVertex(temp_x, temp_y, temp_z);
			this.vertex[i*3+0] = temp_result[0];
			this.vertex[i*3+1] = temp_result[1];
			this.vertex[i*3+2] = temp_result[2];
			
			// reader._pos += 12;
			this.normal[i*3+0] = reader.readFloat(); 
			this.normal[i*3+1] = reader.readFloat(); 
			this.normal[i*3+2] = reader.readFloat(); 
						
			this.uv[i*2+0] = reader.readFloat();
			this.uv[i*2+1] = reader.readFloat();
		}

		var temp_indexCount = reader.readUInt32();
		this.index = new Uint16Array(temp_indexCount);
		for(var i = 0, len = temp_indexCount; i<len; i+=1){
			this.index[i] = reader.readUInt16();
		}
		
		reader.readUInt32();
		
		var imageLevel = reader.readUInt8(),
			temp_imageNameLen = reader.readUInt8();
			
		reader.readString(temp_imageNameLen);
		
		if (imageLevel > 0) {
			
			var imageSize = reader.readUInt32();
			var imageArrayBuffer = new Uint8Array(imageSize);
			
			for (var i=0; i<imageSize; i++){
				imageArrayBuffer[i] = reader.readUInt8();
			}
			
			var temp_blob = new Blob( [imageArrayBuffer], {type: 'image\jpeg'} );
			var temp_url = window.URL.createObjectURL(temp_blob);
			
			this.texture = new ViewerTexture(this.gl);
			this.texture.loadTexture(temp_url, false);
		}
	},
	
	_readXdoMultiface : function(_data, _options) {
		
		var reader = new BinaryReader(_data);
			
		var type = reader.readUInt8();	// type
		var id = reader.readUInt32();	// id
		
		var keyLength = reader.readUInt8();	
		var key = reader.readString(keyLength); 	

		var objBox = this.attribute.box;
		objBox.minX = reader.readDouble();
		objBox.minY = reader.readDouble();
		objBox.minZ = reader.readDouble();
		objBox.maxX = reader.readDouble();
		objBox.maxY = reader.readDouble();
		objBox.maxZ = reader.readDouble();

		var position = this.attribute.position;
		position.x = (objBox.minX + objBox.maxX) / 2.0;
		position.y = (objBox.minY + objBox.maxY) / 2.0;
		position.z = (objBox.minZ + objBox.maxZ) / 2.0;
		
		var size = this.attribute.size;
		size.height = objBox.maxY - objBox.minY;
		size.bottomFaceRadius = Math.sqrt((objBox.maxX-objBox.minX)*(objBox.maxX-objBox.minX)
										 +(objBox.maxY-objBox.minY)*(objBox.maxY-objBox.minY)) / 2.0;
		
		var faceNum = reader.readUInt32();
		
		var vertex = [],
			uv = [],
			normal = [],
			index = []
			;
		
		var indexStart = 0;
		var minAltitude = 0;
	
		for (var i=0; i<faceNum; i++) {
			
			var faceType = reader.readUInt8();
			var faceID = reader.readUInt16();
			var faceColor = reader.readUInt32();
			
			var textureNameLength = reader.readUInt8();
			var textureName = reader.readString(textureNameLength);
			
			var vertexNum = reader.readUInt32();
			
			for (var j=0; j<vertexNum; j++) {
				
				vertex.push(-reader.readFloat());
				var y = reader.readFloat();
				var z = reader.readFloat();
				vertex.push(z);
				vertex.push(y);
				
				/* 다시 고정 높이로 복구 sumin 200825
				if (j==0 && i==0) {
					minAltitude = z;
				} else {
					if (z < minAltitude) {
						minAltitude = z;
					}
				}*/
				
				normal.push(reader.readFloat());
				normal.push(reader.readFloat());
				normal.push(reader.readFloat());
				
				uv.push(reader.readFloat());
				uv.push(reader.readFloat());
			}
			
			var indexNum = reader.readUInt32();
			
			for (var j=0; j<indexNum; j++) {
				index.push(indexStart + reader.readUInt16());
			}
			
			indexStart += indexNum;
		}
		
		this.vertex = new Float32Array(vertex.length);
		for (var i=0; i<vertex.length; i+=3) {
			this.vertex[i] = vertex[i];
			this.vertex[i+1] = vertex[i+1]/*-minAltitude*/;	// 다시 고정 높이로 복구 sumin 200825
			this.vertex[i+2] = vertex[i+2];
		}
		
		this.uv = new Float32Array(uv.length);
		for (var i=0; i<uv.length; i++) {
			this.uv[i] = uv[i];
		}
		
		this.normal = new Float32Array(normal.length);
		for (var i=0; i<normal.length; i++) {
			this.normal[i] = normal[i];
		}
		
		this.index = new Uint16Array(index.length);
		for (var i=0; i<index.length; i++) {
			this.index[i] = index[i];
		}
	},
	
	_rotateVertex : function (_x, _y, _z) {
		
		// 행렬 초기화
		var ResultMatrix = new ViewerMatrix(),			// 결과 행렬
			HorizontalRotMatrix = new ViewerMatrix(),	// 좌우 회전 행렬
			VerticalRotMatrix = new ViewerMatrix(),		// 상하 회전 
			centerPos = new ViewerVector("double"),
			yAxisVec = new ViewerVector("double"),			// y축 벡터(정면 벡터)
			zAxisVec = new ViewerVector("double"),			// z축 벡터(위쪽 벡터)
			vCross = new ViewerVector("double"),
			angle;										// 축-모델 간 각도

		centerPos.set(this.attribute.position.x, this.attribute.position.y, this.attribute.position.z);
		var normalCenter = centerPos.normalize();																														
		yAxisVec.set(0.0, -1.0, 0.0);
		zAxisVec.set(0.0, 0.0, 1.0);
		
		// 회전축 구하기
		vCross = normalCenter.crossProduct(zAxisVec);

		angle = normalCenter.getAngleWith(zAxisVec);	// 위쪽벡터와 이루는 각도
		VerticalRotMatrix = this._setRotationRadian(vCross, (angle)*(Math.PI/180.0));	// 북극 뱡항 정위치 행렬
	
		var xzCenter = new ViewerVector("double");			// xz평면에 투영한 normalCenter 벡터
		xzCenter.set(-normalCenter._values[0], normalCenter._values[1], 0.0);

		angle = xzCenter.getAngleWith(yAxisVec);		// 전방벡터와 이루는 각도
		HorizontalRotMatrix = this._setRotationRadian(zAxisVec, (angle)*(Math.PI/180.0));

		ResultMatrix = HorizontalRotMatrix.multiply(VerticalRotMatrix);	// 결과행렬로 합침

		var vector = [0.0, 0.0, 0.0, 0.0];
		var ResultPos = [0.0, 0.0, 0.0];
		
		// 회전 적용
		vector[0] = _x*ResultMatrix._values[0] + _y*ResultMatrix._values[4] + _z*ResultMatrix._values[8] + ResultMatrix._values[12];
		vector[1] = _x*ResultMatrix._values[1] + _y*ResultMatrix._values[5] + _z*ResultMatrix._values[9] + ResultMatrix._values[13];
		vector[2] = _x*ResultMatrix._values[2] + _y*ResultMatrix._values[6] + _z*ResultMatrix._values[10] + ResultMatrix._values[14];
		vector[3] = _x*ResultMatrix._values[3] + _y*ResultMatrix._values[7] + _z*ResultMatrix._values[11] + ResultMatrix._values[15];

		if(vector[3] < 0.001 && vector[3] > -0.001)
		{
			ResultPos[0] = vector[0];
			ResultPos[2] = vector[1];
			ResultPos[1] = vector[2];
			return ResultPos;
		}
		ResultPos[0] = -vector[0]/vector[3];
		ResultPos[2] = -vector[1]/vector[3];
		ResultPos[1] = vector[2]/vector[3];
		
		return ResultPos;
	},

	_setRotationRadian : function(axis, angle) {
		
		var rotMatrix = new ViewerMatrix();
		var	cr = Math.cos( angle );
		var	sr = Math.sin( angle );
		var	v  = axis.copy();
		
		v.normalize();

		// X 좌표 변환값
		rotMatrix._values[0] = ( v._values[0] * v._values[0] ) * ( 1.0 - cr ) + cr;
		rotMatrix._values[4] = ( v._values[0] * v._values[1] ) * ( 1.0 - cr ) - (v._values[2] * sr);
		rotMatrix._values[8] = ( v._values[0] * v._values[2] ) * ( 1.0 - cr ) + (v._values[1] * sr);
		
		// Y 좌표 변환값
		rotMatrix._values[1] = ( v._values[1] * v._values[0] ) * ( 1.0 - cr ) + (v._values[2] * sr);
		rotMatrix._values[5] = ( v._values[1] * v._values[1] ) * ( 1.0 - cr ) + cr ;
		rotMatrix._values[9] = ( v._values[1] * v._values[2] ) * ( 1.0 - cr ) - (v._values[0] * sr);
		
		// Z 좌표 변환값
		rotMatrix._values[2] = ( v._values[2] * v._values[0] ) * ( 1.0 - cr ) - (v._values[1] * sr);
		rotMatrix._values[6] = ( v._values[2] * v._values[1] ) * ( 1.0 - cr ) + (v._values[0] * sr);
		rotMatrix._values[10]= ( v._values[2] * v._values[2] ) * ( 1.0 - cr ) + cr;
		rotMatrix._values[15] = 1.0;
		
		return rotMatrix;
	},

	_cartesianToSpherical : function (_x, _y, _z) {
		
		var rho = Math.sqrt(_x * _x + _y * _y + _z * _z);

		var longitude = Math.atan2(_y * (-1), _x); // LH 왼손 좌표계
		var latitude = Math.asin(_z / rho);
		
		var ret = new ViewerVector("double");
		ret.set( rho, latitude, longitude );
		return ret;
	},
	
	_setTexture : function (_gl, _faceIndex, _imageURL, _callback) {
		
		var texture = new ViewerTexture(_gl);
		texture.loadTexture(_gl, _faceIndex, _imageURL, _callback);

		this.meshes[_faceIndex].texture = texture;
	},
	
	_getModelMinZ : function() {
		
		var minZ = 0.0;

		for (var i=0; i<this.meshes.length; i++) {

			var mesh = this.meshes[i];

			var numVertices = mesh.vertex.length;
			if (numVertices < 3) {
				continue;
			}

			var vertices = mesh.vertex;
			var minZ = mesh.vertex[1];
			
			for (var i=4; i<numVertices; i+=3) {
				if (vertices[i] < minZ) {
					minZ = vertices[i];
				}
			}
		}
		
		return minZ;
	},
	
	_initPickBuffer : function(_gl) {
		
		// 버퍼 설정
		this.pickBuffer.vertex = _gl.createBuffer();
		_gl.bindBuffer(_gl.ARRAY_BUFFER, this.pickBuffer.vertex);
		_gl.bufferData(_gl.ARRAY_BUFFER, this.vertex, _gl.STATIC_DRAW);
		this.vertex.itemSize = 3;
		this.vertex.numItems = this.vertex.length/3;
		
		this.pickBuffer.index = _gl.createBuffer();
		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, this.pickBuffer.index);
		_gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, this.index, _gl.STATIC_DRAW);
		this.pickBuffer.index.itemSize = 1;
		this.pickBuffer.index.numItems = this.index.length;
		
		this.pickBuffer.isReady = true;
	}
}

/** ViewerPicker ****************************************************************************************/
/**
 * @class
 * @ignore
 */
function ViewerPicker(_mapCanvas) {
	
	this.canvas = null;
	this.gl = null;
	this.shader = null;
	
	this.isReady = false;
	
	this.init(_mapCanvas);
}

ViewerPicker.prototype = {
	
	init : function(_mapCanvas) {
		
		var canvas = document.createElement("canvas");
		var gl = canvas.getContext("webgl");
		if (!gl) {
			return;
		}
		
		canvas.width = _mapCanvas.width;
		canvas.height = _mapCanvas.height;
		canvas.style.display = "none";
		
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
		gl.enable(gl.DEPTH_TEST);	
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		
		this.shader = new ViewerShader(gl, "PICKING");
		this.canvas = canvas;
		this.gl = gl;
		
		this.isReady = true;
	},
	
	pick : function(_camera, _x, _y, _models) {
		
		var pickColorMap = [];
		
		var modelKeys = Object.keys(_models);
		
		for (var i=0; i<modelKeys.length; i++) {
			
			var id = i+1;
			
			pickColorMap.push({
				model : _models[modelKeys[i]], 
				colorID : [
					((id >>  0) & 0xFF) / 0xFF,
					((id >>  8) & 0xFF) / 0xFF,
					((id >> 16) & 0xFF) / 0xFF,
					((id >> 24) & 0xFF) / 0xFF
				]
			});
		}
		
		for (var i=0; i<pickColorMap.length; i++) {
			pickColorMap[i].model.renderPickFrame(this.gl, this.shader, _camera, pickColorMap[i].colorID);
		}
		
		var pixel = new Uint8Array(4);
		this.gl.readPixels(_x, this.canvas.height-_y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixel);
		
		var id = pixel[0] + (pixel[1] << 8) + (pixel[2] << 16) + (pixel[3] << 24);
		
		if (id == 0 || id > pickColorMap.length) {
			return null;
		}
		
		return pickColorMap[id-1].model;
	}
};

/** ViewerShader ****************************************************************************************/
/**
 * @class
 * @ignore
 */
function ViewerShader(_gl, _attributeType) {
	
	this.program = null;
	this.isReady = false;
	
	this.init(_gl, _attributeType);
}

ViewerShader.prototype = {
	
	init : function(_gl, _attributeType) {
		
		var vertexShader = this._getVertexShader(_gl, _attributeType),
			fragmentShader = this._getFragmentShader(_gl, _attributeType);
		
		var program = _gl.createProgram();
		_gl.attachShader(program, vertexShader);
		_gl.attachShader(program, fragmentShader);
		_gl.linkProgram(program);
		
		if (!_gl.getProgramParameter(program, _gl.LINK_STATUS)){
			return false;
		}
		
		this._setProgramVariables(_gl, program, _attributeType);
		
		this.program = program;
		this.isReady = true;
		
		return true;
	},
	
	/* private */
	_getVertexShader : function(_gl, _attributeType) {
		
		var source = "";
		
		switch (_attributeType) {
			
		case "POSITION_NORMAL_TEXTURE" :
			
			source += "attribute vec3 aPosition;";
			source += "attribute vec2 aUV;";
			source += "attribute vec3 aNormal;";
			source += "uniform mat4 uMoveMatrix;";
			source += "uniform mat4 uProjMatrix;";
			source += "uniform mat4 uViewMatrix;";
			source += "uniform vec3 uColor;";
			source += "uniform float uAlpha;";
			source += "varying vec2 vUV;";
			source += "varying vec3 vColor;";
			source += "varying float vAlpha;";
			source += "varying vec3 vLight;";
			source += "void main(void){";
			source += 	"gl_Position = (uProjMatrix * uViewMatrix * uMoveMatrix) * vec4(aPosition, 1.0);";
			source += 	"vec3 ambientLight = vec3(0.6, 0.6, 0.6);";
			source += 	"vec3 lightColor = vec3(0.5, 0.5, 0.75);";
			source += 	"vec3 directLight = vec3(0.85, 0.8, 0.75);";
			source += 	"float lightAmount = dot(aNormal, directLight);";
			source += 	"if( lightAmount < 0.0 ) {";
			source += 		"lightAmount *= (-1.0);";
			source += 	"}";
			source += 	"vLight = ambientLight + (lightColor * lightAmount);";
			source += 	"vUV = aUV;";
			source += 	"vAlpha = uAlpha;";
			source += 	"vColor = uColor;";
			source += "}";
			
			break;
			
		case "POSITION_COLOR" :
			
			source += "attribute vec3 aPosition;";
			source += "attribute vec4 aColor;";
			source += "uniform mat4 uMoveMatrix;";
			source += "uniform mat4 uProjMatrix;";
			source += "uniform mat4 uViewMatrix;";
			source += "varying vec4 vColor;";
			source += "void main(void){";
			source += 	"gl_Position = (uProjMatrix * uViewMatrix * uMoveMatrix) * vec4(aPosition, 1.0);";
			source += 	"vColor = aColor;";
			source += "}";
			
			break;
			
		case "PICKING" :
			
			source += "attribute vec3 aPosition;"
			source += "uniform mat4 uMoveMatrix;";
			source += "uniform mat4 uProjMatrix;";
			source += "uniform mat4 uViewMatrix;";
			source += "uniform vec4 uPickColorID;"
			source += "varying vec4 vPickColorID;"
			source += "void main(void){"
			source += 	"gl_Position = (uProjMatrix * uViewMatrix * uMoveMatrix) * vec4(aPosition, 1.0);"
			source += 	"vPickColorID = uPickColorID;"
			source += "}"
			
			break;
		
		default :
			return null;	
		}
		
		var shader = _gl.createShader(_gl.VERTEX_SHADER);
		_gl.shaderSource(shader, source);
		_gl.compileShader(shader);
		
		if (!_gl.getShaderParameter(shader, _gl.COMPILE_STATUS)) {
			return null;
		}
		return shader;
	},
	
	_getFragmentShader : function(_gl, _attributeType) {
		
		var source = "";
		
		switch (_attributeType) {
			
		case "POSITION_NORMAL_TEXTURE" :
			
			source += "precision mediump float;";
			source += "varying vec2 vUV;";
			source += "varying vec3 vColor;";
			source += "varying float vAlpha;";
			source += "varying vec3 vLight;";
			source += "uniform int uUseTexture;"
			source += "uniform sampler2D uSampler;";
			source += "void main(void){";
			source += 	"if (uUseTexture == 0) {";
			source += 		"gl_FragColor = vec4(vColor*vLight, vAlpha);";
			source +=	"} else {"
			source += 		"lowp vec4 tex = texture2D(uSampler, vUV);";
			source += 		"gl_FragColor = tex * vec4(vColor*vLight, vAlpha);";
			source +=	"}";
			source += "}";
			
			break;
			
		case "POSITION_COLOR" :
			
			source += "precision mediump float;";
			source += "varying vec4 vColor;";
			source += "void main(void){";
			source += 	"gl_FragColor = vColor;";
			source += "}";
			
			break;
			
		case "PICKING" :
		
			source += "precision highp float;"
			source += "varying vec4 vPickColorID;"
			source += "void main(void){"
			source += 	"gl_FragColor = vPickColorID;"
			source += "}"
		
			break;
		
		default :
			return null;	
		}
		
		var shader = _gl.createShader(_gl.FRAGMENT_SHADER);
		_gl.shaderSource(shader, source);
		_gl.compileShader(shader);
		
		if (!_gl.getShaderParameter(shader, _gl.COMPILE_STATUS)) {
			return null;
		}
		return shader;
	},
	
	_setProgramVariables : function(_gl, _program, _attributeType) {
		
		switch (_attributeType) {
			
		case "POSITION_NORMAL_TEXTURE" :
			
			_program.aPosition = _gl.getAttribLocation(_program, "aPosition");
			_gl.enableVertexAttribArray(_program.aPosition);	
			_program.aUV = _gl.getAttribLocation(_program, "aUV");
			_gl.enableVertexAttribArray(_program.aUV);
			_program.aNormal = _gl.getAttribLocation(_program, "aNormal");
			_gl.enableVertexAttribArray(_program.aNormal);
			
			_program.uMoveMatrix = _gl.getUniformLocation(_program, "uMoveMatrix");
			_program.uProjMatrix = _gl.getUniformLocation(_program, "uProjMatrix");
			_program.uViewMatrix = _gl.getUniformLocation(_program, "uViewMatrix");
			_program.uUseTexture = _gl.getUniformLocation(_program, "uUseTexture");
			_program.uSampler = _gl.getUniformLocation(_program, "uSampler");
			_program.uColor = _gl.getUniformLocation(_program, "uColor");
			_program.uAlpha = _gl.getUniformLocation(_program, "uAlpha");			
			
			break;
			
		case "POSITION_COLOR" :
						
			_program.aPosition = _gl.getAttribLocation(_program, "aPosition");
			_gl.enableVertexAttribArray(_program.aPosition);	
			_program.aColor = _gl.getAttribLocation(_program, "aColor");
			_gl.enableVertexAttribArray(_program.aColor);
		
			_program.uMoveMatrix = _gl.getUniformLocation(_program, "uMoveMatrix");
			_program.uProjMatrix = _gl.getUniformLocation(_program, "uProjMatrix");
			_program.uViewMatrix = _gl.getUniformLocation(_program, "uViewMatrix");
			
			break;
			
		case "PICKING" :
		
			_program.aPosition = _gl.getAttribLocation(_program, "aPosition");
			_gl.enableVertexAttribArray(_program.aPosition);
			
			_program.uMoveMatrix = _gl.getUniformLocation(_program, "uMoveMatrix");
			_program.uProjMatrix = _gl.getUniformLocation(_program, "uProjMatrix");
			_program.uViewMatrix = _gl.getUniformLocation(_program, "uViewMatrix");
			_program.uPickColorID = _gl.getUniformLocation(_program, "uPickColorID");
		
			break;
			
		default :
			return null;	
		}
	}
};

/** ViewerParser3DS ****************************************************************************************/
/**
 * @class
 * @ignore
 */
function ViewerParser3DS(_data) {

	this.meshes = [];
	this.materials = {};

	this.position = 0;	
	this.reader = new BinaryReader(_data);
};

ViewerParser3DS.prototype = {
	
	readFile : function(data) {
		
		this.position = 0;
		this.meshes = [];
		this.materials = {};
		
		var data = new BinaryReader(data);
		var chunk = this.readChunk(data);
		var c = 0;

		switch (chunk.id) {
			case 0x4D4D:
				c = this.nextChunk(data, chunk);
				while (c != 0) {
					switch (c) {
						case 0x3D3D: // Model data
							this.resetPosition(data);
							this.readMDATA(data);
							break;
						default:
							break;
					}
					c = this.nextChunk(data, chunk);
				}
				break;
			default:
				break;
		}
	},

	readMDATA : function(data) {
		
		var chunk = this.readChunk(data);
		var c = this.nextChunk(data, chunk);

		while (c != 0) {
			
			switch (c) {
				case 0x4000 : {	// C3DS_EDIT_OBJECT
					this.resetPosition(data);
					this.readNamedObject(data);
				}
				case 0xAFFF : {	// C3DS_EDIT_MATERIAL
					this.resetPosition(data);
					this.readMaterialEntry(data);
				}
			}
			c = this.nextChunk(data, chunk);
		}
	},

	readMaterialEntry : function(data) {
		
		var chunk = this.readChunk(data);
		var c = this.nextChunk(data, chunk);

		var material = {
			name : "",
			ambientColor : null,
			diffuseColor : null,
			specularColor : null,
		};

		while (c != 0) {
			switch (c) {
				case 0xA000:
					material.name = this.readString(data, 64);
					break;
				case 0xA010:
					material.ambientColor = this.readColor(data);
					break;
				case 0xA020:
					material.diffuseColor = this.readColor(data);
					break;
				case 0xA030:
					material.specularColor = this.readColor(data);
					break;
				default:
					break;
			}
			c = this.nextChunk(data, chunk);
		}

		this.endChunk(chunk);
		this.materials[material.name] = material;
	},
	
	readMesh : function(data) {
		
		var chunk = this.readChunk(data);
		var c = this.nextChunk(data, chunk);
		var mesh = {
			matrix : [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1],
			color : 0,
			vertexCount : 0,
			vertexList : [],
			uvCount : 0,
			uvList : [],
			triangleCount : 0,
			triangleList : [],
			materialGroups : []
		};
		var i;

		while (c != 0) {
			switch (c) {
				case 0x4165:	// MESH_COLOR
					mesh.color = this.readByte(data);
					break;
				case 0x4110:	// C3DS_TRIVERT
					mesh.vertexCount = this.readWord(data);
					mesh.vertexList = [];
					for (i = 0; i < mesh.vertexCount; i++) {
						var x = this.readFloat(data);
						var y = this.readFloat(data);
						var z = this.readFloat(data);
						mesh.vertexList.push([x, z, -y]);
					}
					break;
				case 0x4120:	// C3DS_TRIFACE
					this.resetPosition(data);
					this.readFaceArray(data, mesh);
					this.readMesh(data);
					break;
				case 0x4140:	// C3DS_TRIUV
					mesh.uvCount = this.readWord(data);
					mesh.uvList = [];
					for (i = 0; i < mesh.uvCount; i++) {
						mesh.uvList.push([this.readFloat(data), 1.0-this.readFloat(data)]);
					}
					break;
				default:
					break;
			}
			c = this.nextChunk(data, chunk);
		}

		this.endChunk(chunk);

		return mesh;
	},

	readFaceArray : function(data, mesh) {
		
		var chunk = this.readChunk(data);
		
		// Read Indices
		mesh.triangleCount = this.readWord(data);
		mesh.triangleList = [];

		for(var i = 0; i < mesh.triangleCount; ++i) {
			
			var face = {
				flags : 0,
				index : [],
				material : ""
			};;

			face.index = [];
			face.index.push(this.readWord(data));
			face.index.push(this.readWord(data));
			face.index.push(this.readWord(data));

			face.flags = this.readWord(data);

			mesh.triangleList.push(face);
		}

		while (this.position < chunk.end) {
			
			var sub_chunk = this.readChunk(data);

			switch (sub_chunk.id) {

				case 0x4130:	// C3DS_TRIFACEMAT
					var materialGroup = this.readMaterialGroup(data);
					for(var i = 0; i < materialGroup.faceIndex.length; ++i) {
						var faceIndex = materialGroup.faceIndex[i];
						mesh.triangleList[faceIndex].material = materialGroup.name;
					}
					mesh.materialGroups.push(materialGroup);
					break;
				default:
					break;
			}

			this.endChunk(sub_chunk);
		}

		this.endChunk(chunk);
	},

	readMaterialGroup : function(data) {
		
		var materialName = this.readString(data, 64);
		var numtriangleCount = this.readWord(data);

		var faceIndex = [];
		for(var i = 0; i < numtriangleCount; ++i) {
			faceIndex.push(this.readWord(data));
		}

		return {
			name: materialName,
			faceIndex: faceIndex
		};
	},

	readNamedObject : function(data) {
		
		var chunk = this.readChunk(data);

		var name = this.readString(data, 64);

		chunk.cur = this.position;

		var c = this.nextChunk(data, chunk);
		
		if (c == 0x4100) {	// C3DS_OBJTRIMESH
			this.resetPosition(data);
			var mesh = this.readMesh(data);
			this.meshes.push(mesh);
		}
	},

	readChunk : function(data) {
		
		var chunk = {
			cur : 0,
			id : 0,
			size : 0,
			end : 0
		};
		
		chunk.cur = this.position;
		chunk.id = this.readWord(data);
		chunk.size = this.readDWord(data);
		chunk.end = chunk.cur + chunk.size;
		chunk.cur += 6;
		
		return chunk;
	},

	endChunk : function(chunk) {
		this.position = chunk.end;
	},

	nextChunk : function(data, chunk) {
		
		if (chunk.cur >= chunk.end) {
			return 0;
		}
		this.position = chunk.cur;
		try {
			var next = this.readChunk(data);
			chunk.cur += next.size;
			return next.id;
		} catch(e) {
			return 0;
		}
	},

	resetPosition : function(data, chunk) {
		this.position -= 6;
	},

	readByte : function(data) {
		
		data._pos = this.position;
		
		var v = data.readUInt8();
		this.position += 1;
		return v;
	},

	readFloat : function(data) {
		
		data._pos = this.position;
		
		var v = data.readFloat();
		this.position += 4;
		
		return v;
	},

	readInt : function(data) {
		
		data._pos = this.position;
		
		var v = data.readInt32();
		this.position += 4;
		
		return v;
	},

	readShort : function(data) {
		
		data._pos = this.position;
		
		var v = data.readInt16();
		this.position += 2;
		
		return v;
	},

	readDWord : function(data) {
		
		data._pos = this.position;
		var v = data.readUInt32();
		this.position += 4;
		
		return v;
	},

	readWord : function(data) {
		
		data._pos = this.position;
		var v = data.readUInt16();
		this.position += 2;
		
		return v;
	},

	readString : function(data, maxLength) {
		var s = "";
		for(var i = 0; i < maxLength; i++) {
			var c = this.readByte(data);
			if( !c ) break;
			s += String.fromCharCode(c);
		}
		return s;
	},

	readColor : function(data) {
		var chunk = this.readChunk(data);
		var color = {
			r : 0,
			g : 0,
			b : 0
		};
		switch (chunk.id) {
			case 0x0011:
			case 0x0012:
				color.r = this.readByte(data) / 255.0;
				color.g = this.readByte(data) / 255.0;
				color.b = this.readByte(data) / 255.0;
				//color = r << 16 | g << 8 | b;
				break;
			case 0x0010:
			case 0x0013:
				color.r = this.readFloat(data);
				color.g = this.readFloat(data);
				color.b = this.readFloat(data);
				//color = Math.floor(r * 255) << 16 | Math.floor(g * 255) << 8 | Math.floor(b * 255);
				break;
			default:
				break;
		}

		this.endChunk(chunk);
		return color;
	}
};

/**
 * @classdesc   모델 뷰어 메인 인스턴스
 * @class
 * @hideconstructor
 */
var XDViewer = {
	
	isReady : false,
	
	/* render context */
	canvas : null,
	
	gl : null,
	
	shaders : {
		position_color : null,
		position_normal_texture : null
	},
	
	camera : null,
	
	/* render objects */
	models : {},
	ground : null,
	grid : null,
	
	/* mouse */
	lMouseDown : false,
	rMouseDown : false,
	mMouseDown : false,
	
	MDownPX : 0,
	MDownPY : 0,
	MMovePX : 0, 
	MMovePY : 0,
	
	picker : null,
	
	selectedModel : null,
		
	initDevice : function (_parentElement, _canvasID, _canvasWidth, _canvasHeight) {

		var canvas = document.createElement("canvas");
				
		canvas.id = _canvasID;
		_parentElement.appendChild(canvas);
				
		// canvas size 설정
		canvas.width = _canvasWidth;
		canvas.height = _canvasHeight;
			
		canvas.style.display = "block";

		// canvas mouse event
		canvas.onmousedown = function(event) {
			XDViewer._mouseDown(event.button, event.clientX, event.clientY);
		};
		canvas.onmousemove = function(event) {
			XDViewer._mouseMove(event.clientX, event.clientY);
		};
		canvas.onmouseup = function(event) {
			XDViewer._mouseUp(event.clientX, event.clientY);
		};
		canvas.onmousewheel = function(event) {
			XDViewer._mouseWheel(event.wheelDelta);
		};
		
		if (canvas.addEventListener) {
			canvas.addEventListener('contextmenu', function (e) {
				if (e.button === 2) {
					e.preventDefault();
					return false;
				}
			}, false);
		}
		else {
			canvas.attachEvent("contextmenu", function (e) {
				if (e.button === 2) {
					e.preventDefault();
					return false;
				}
			});
		}
			
		// init WebGL
		var gl = canvas.getContext("experimental-webgl", {
			preserveDrawingBuffer: true
		});
		
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
		gl.enable(gl.DEPTH_TEST);	
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		
		// init shader programs
		this.shaders.position_color = new ViewerShader(gl, "POSITION_COLOR");
		this.shaders.position_normal_texture = new ViewerShader(gl, "POSITION_NORMAL_TEXTURE");
				
		this.picker = new ViewerPicker(canvas);
		
		this.camera = new ViewerCamera(gl);	
		this.gl = gl;		
		this.canvas = canvas;
		
		this.isReady = true;
	},
	
	/**
	 * @method      XDViewer.loadModel
	 * @description TEST
	 * @param 		_properties {Object} 모델 로드 정보
	 * @example
	 *
	 // XDO Model (Floor)
XDViewer.loadModel({
	key : 'TEST_MODEL',
	url : '/DATA/LOAD/URL/TEST_MODEL.xdo',
	texture : '/DATA/LOAD/URL/TEST_MODEL.jpg',
	format : "xdo",
	options : {
		xdoType : "multiface"
	}
});
	
// XDO Model(Structure)
XDViewer.loadModel({
	key : 'TEST_MODEL',
	url : '/DATA/LOAD/URL/TEST_MODEL.xdo',
	texture : '/DATA/LOAD/URL/TEST_MODEL.jpg',
	format : "xdo",
	options : {
		xdoType : "real3d"
	}
});
	
// 3DS Model
XDViewer.loadModel({
	key : 'TEST_MODEL',
	url : '/DATA/LOAD/URL/TEST_MODEL.xdo',
	texture : '/DATA/LOAD/URL/TEST_MODEL.jpg',
	format : "3ds"
});
	 */
	loadModel : function (_properties) {
		
		if (typeof this.models[_properties.key] != 'undefined' || typeof _properties.key == 'undefined') {
			return;
		}
						
		if (typeof _properties.url == 'string') {
			this._requestModel(_properties);
		} else if (typeof _properties.binary) {
			this._insertModel(_properties);
		}
		
		delete this.ground;
		delete this.grid;
	},
	
	/**
	 * @method      XDViewer.loadModels
	 * @description TEST
	 * @param 		_properties {Object}
	 * @example
	 *XDViewer.loadModel([{
	key : 'TEST_MODEL',
	url : '/DATA/LOAD/URL/TEST_MODEL_0.xdo',
	texture : '/DATA/LOAD/URL/TEST_MODEL_0.jpg',
	format : "xdo",
	options : {
		xdoType : "multiface"
	}
},{
	key : 'TEST_MODEL',
	url : '/DATA/LOAD/URL/TEST_MODEL_1.xdo',
	texture : '/DATA/LOAD/URL/TEST_MODEL_1.jpg',
	format : "xdo",
	options : {
		xdoType : "multiface"
	}
}]);
	 */
	loadModels : function (_propertyArray) {
		
		for (var i=0; i<_propertyArray.length; i++) {
			this.loadModel(_propertyArray[i]);
		}
	},
	
	renewFrame : function()	{
		
		if (this.camera == undefined)
			return;
			
		if (this.camera.isAutoRotationMove) {
			var mouseState = this.mouseState;
			if(mouseState.lMouseDown==false && mouseState.rMouseDown==false && mouseState.mMouseDown==false){
				this.camera.moveAutoRotation();
			}
		}
		
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);

		var modelKeys = Object.keys(this.models);
		for (var i=0; i<modelKeys.length; i++) {
			this.models[modelKeys[i]].render(this.gl, this.shaders.position_normal_texture, this.camera);
		}
				
		if (this.ground == null || this.grid == null) {
			this._initGroundGrid();
		}
		
		this.ground.render(this.gl, this.shaders.position_color, this.camera);
		this.grid.render(this.gl, this.shaders.position_color, this.camera);
	},
	
	resize : function (_width, _height){
			
		this.gl.viewportWidth = this.canvas.width = _width;
		this.gl.viewportHeight = this.canvas.height = _height;
			
		this.camera.initCamera();
	},
		
	/**
	 * @method      XDViewer.getModel
	 * @description 모델 이름으로 모델 객체를 반환합니다.
	 * @param 		_name {String} 모델 이름
	 * @example
	 *var model = XDViewer.getModel('TEST_MODEL');
	 */
	getModel : function(_name) {
		
		if (typeof this.models[_name] == 'object') {
			return this.models[_name];
		}
		
		return null;
	},
	
	/**
	 * @method      XDViewer.getAllModels
	 * @description 로드 된 모든 모델을 반환합니다.
	 * @example
	 *var model = XDViewer.getAllModels();
	 */
	getAllModels : function() {
		
		var models = [];
		
		for (var id in this.models) {
			if (this.models.hasOwnProperty(id)) {
				models.push(this.models[id]);
			}
		}
		
		return models;
	},
	
	/**
	 * @method      XDViewer.clearModels
	 * @description 로드 된 모델을 삭제합니다.
	 * @example
	 *XDViewer.clearModels();
	 */
	clearModels : function() {
		
		for (var id in this.models) {
			if (this.models.hasOwnProperty(id)) {
				delete this.models[id];
			}
		}
	},
	
	/* private */
	_initGroundGrid : function() {
		
		var minimumAltitude = 0.0;
		var maximumRadius = 0.0;
			
		var checkModelCount = 0;
			
		for (var id in this.models) {
				
			if (this.models.hasOwnProperty(id)) {
					
				var compareAltitude = this.models[id]._getModelMinZ();
				var compareRadius = this.models[id].attribute.size.bottomFaceRadius;
					
				if (checkModelCount == 0) {
						
					minimumAltitude = compareAltitude;
					maximumRadius = compareRadius;
						
				} else {
						
					if (compareAltitude < minimumAltitude) {
						minimumAltitude = compareAltitude;
					}
						
					if (compareRadius > maximumRadius) {
						maximumRadius = compareRadius;
					}
				}
			}
		}
		
		this.ground = new ViewerGround(this.gl, minimumAltitude, maximumRadius*5.0, 10, 40);
		this.grid = new ViewerGrid(this.gl, minimumAltitude, maximumRadius*5.0, 10, 40);
	},
	
	_requestModel : function(_property) {
		
		if (_property == null) {
			return;
		}
				
		var req = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
					
		req.open('GET', _property.url, true);
		req.overrideMimeType('text/plain; charset=x-user-defined');
		req.viewer = this;
			
		req.onreadystatechange = function() {
			
			if (this.status == 200 && this.readyState == 4)	{
				
				var data = req.responseText;
				if(data == '') {
					return;
				}
				
				_property.binary = data;
				var model = this.viewer._insertModel(_property);
				
				if (model != null) {
					
					var textureLoaded = false;

					if (typeof _property.texture == 'string') {
					
						model._setTexture(this.viewer.gl, 0, _property.texture, function() {
								
							if (model.isAllTextureLoaded()) {

								XDViewer.renewFrame();
								
								if (_property.callback) {
									_property.callback(_property);
								}
							}
						});

						textureLoaded = true;

					} else if (typeof _property.texture == 'object') {

						for (faceIndex in _property.texture) {

							if (!model.isExistFace(faceIndex)) {
								continue;
							}

							model._setTexture(this.viewer.gl, faceIndex, _property.texture[faceIndex].url, function() {
								
								if (model.isAllTextureLoaded()) {

									XDViewer.renewFrame();
									
									if (_property.callback) {
										_property.callback(_property);
									}
								}
							});

							textureLoaded = true;
						}

					}
					
					if (!textureLoaded) {
						
						XDViewer.renewFrame();

						if (_property.callback) {
							_property.callback(_property);
						}
					}
				}
				
				this.viewer.renewFrame();
			}
		};
		req.send(null);
	},
	
	_insertModel : function(_property) {
		
		var data = _property.binary;
		if (!data) {
			return;
		}
		
		var model = new ViewerModel();
				
		switch (_property.format) {
		case 'XDO':
		case 'xdo':
			model.readXDO(data, _property.options);
			break;
		case '3DS':
		case '3ds':
			model.read3DS(data, _property.options);
			break;
		default :
			return;
		}
		
		if (typeof this.models[_property.key] != 'undefined') {
			return null;
		}
		
		this.models[_property.key] = model;
		var addVal = ((model.attribute.size.bottomFaceRadius%3)+1)*8
		this.camera.setDistance(model.attribute.size.bottomFaceRadius*addVal);
		console.log("카메라 거리 : " + addVal + " || " + model.attribute.size.bottomFaceRadius*addVal + " || "+ model.attribute.size.bottomFaceRadius*20);
		return model;	
	},
	
	_mouseDown : function(_button, _x, _y ) {
				
		this.MDownPX = _x; 
		this.MDownPY = _y;
		this.MMovePX = _x; 
		this.MMovePY = _y;
				
		if (_button == 0) {
			this.lMouseDown = true;
		} else if (_button == 1) {
			this.mMouseDown = true;
		} else if(_button == 2) {
			this.rMouseDown = true;
		}
	},
			
	_mouseUp : function (_x, _y) {
	
		this.lMouseDown = false;
		this.rMouseDown = false;
		this.mMouseDown = false;
		
		if ( Math.abs(_x-this.MDownPX) < 3 && Math.abs(_y-this.MDownPY) < 3 ) {
			
			if (this.picker.isReady) {
				
				if (this.selectedModel) {
					this.selectedModel.setSelect(false);
					this.selectedModel = null;
				}
				
				var pickedModel = this.picker.pick(this.camera, _x, _y, this.models);
				
				if (pickedModel != null) {
					pickedModel.setSelect(true);
					this.selectedModel = pickedModel;
				}
			}
		}
	},
			
	_mouseMove : function (_x, _y) {	
		
		if (this.rMouseDown || this.lMouseDown) {
			
			if (this.MMovePX != _x && this.MMovePY != _y) {
				
				var subx = (_x - this.MMovePX) / 5;
				var suby = (_y - this.MMovePY) / 5;
				
				this.camera.rotation(subx, suby);
				
				this.MMovePX = _x;
				this.mMovePY = _y;
			}
		}
		
		this.MMovePX = _x;
		this.MMovePY = _y;
	},
	
	_mouseWheel : function (delta) {
		this.camera.zoom(delta);
	}
};

XDViewer.renderTimer = function ()
{
	XDViewer.renewFrame();
	window.requestAnimFrame(XDViewer.renderTimer);
};

window.requestAnimFrame = (function(callback) {
	return window.requestAnimationFrame || 
	window.webkitRequestAnimationFrame || 
	window.mozRequestAnimationFrame || 
	window.oRequestAnimationFrame || 
	window.msRequestAnimationFrame ||
	function(callback) { window.setTimeout(callback, 1000 / 60); };
})();

//var VIEWER_CONTAINER = null;

initXDViewer = function(containerID, canvasID , callbackFn) {	
	var VIEWER_CONTAINER = document.getElementById(containerID);
	var width = $('#'+containerID).width();
	var height = $('#'+containerID).height();
		
	//XDViewer.initDevice(VIEWER_CONTAINER, "XDViewerCanvas", width, height);
	XDViewer.initDevice(VIEWER_CONTAINER, canvasID, width, height);
	
	XDViewer.canvas.style.display = "none";
	XDViewer.resize(width, height);
	XDViewer.camera.zoom(3000);
	
	if (typeof window[callbackFn] == 'function') {
		window[callbackFn]();
	}	
};

// (function() {
	
// 	var currentScript = document.currentScript;
	
// 	if (currentScript.attributes.container) {
// 		var containerID = currentScript.attributes.container.value;
// 		VIEWER_CONTAINER = document.getElementById(containerID);
// 	}
	
// 	if (VIEWER_CONTAINER == null) {
// 		VIEWER_CONTAINER = document.body;
// 	}
	
// 	var width = window.innerWidth;
// 	var height = window.innerHeight;
	
// 	if (currentScript.attributes.width) {
// 		width = parseInt(currentScript.attributes.width.value);
// 	}
	
// 	if (currentScript.attributes.height) {
// 		height = parseInt(currentScript.attributes.height.value);
// 	}
		
// 	XDViewer.initDevice(VIEWER_CONTAINER, "XDViewerCanvas", width, height);
	
// 	XDViewer.canvas.style.display = "none";
// 	XDViewer.resize(width, height);
// 	XDViewer.camera.zoom(3000);
	
// 	if (currentScript.attributes.loadcallback) {
// 		var callbackFuncName = currentScript.attributes.loadcallback.value;
// 		if (typeof window[callbackFuncName] == 'function') {
// 			window[callbackFuncName]();
// 		}
// 	}
	
// })();

