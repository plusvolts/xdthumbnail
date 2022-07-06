var GLOBAL = {	
	layer : null,	// 고스트 심볼 오브젝트 저장 레이어
	object : null	// 고스트 심볼 오브젝트
};

/* 엔진 로드 후 실행할 초기화 함수(Module.postRun) */
function init() {
	
    // 엔진 초기화 API 호출(필수)
	Module.Start(window.innerWidth, window.innerHeight);
	
	// 카메라 설정
	Module.getViewCamera().setLocation(new Module.JSVector3D(128.64259157603368, 35.8885570147165, 1500.0));
}

/* 고스트 심볼 XDO import */
function importXDO() {

	// 고스트 심볼 저장 레이어 생성
	var layerList = new Module.JSLayerList(true);
	GLOBAL.layer = layerList.createLayer("GHOSTSYMBOL_XDO", Module.ELT_GHOST_3DSYMBOL);
	
	// 원점 (0, 0, 0), 평면 기반의 xdo 포맷 데이터 로드
	Module.getGhostSymbolMap().insert({
		
		id : "building",
		url : "./2b6_1048.xdo",	
		format : "xdo",         // url 정보에 확장자가 없는 경우 format을 xdo로 명시해 주시면 xdo 파일로 인식됩니다
		version : "3.0.0.2",	// XDO 버전 설정(3.0.0.2 혹은 3.0.0.1)

		callback : function(e) {

			// 모델 크기 반환
			var objectSize = Module.getGhostSymbolMap().getGhostSymbolSize(e.id);

			// 고스트심볼 오브젝트 생성
			GLOBAL.object = createGhostSymbol(
				"import_object", 
				e.id, 
				objectSize, 
				[128.64259157603368, 35.8885570147165, 28.27228598576039]
			);

			GLOBAL.layer.addObject(GLOBAL.object, 0);
		}
	});
}

/* 고스트 심볼 XDO export */
function exportXDO() {

	if (GLOBAL.object == null) {
		return;
	}

	// real3d 타일 레이어 포맷의 XDO 파일 export
	var bytes = GLOBAL.object.exportFileFormat({
		format : "xdo",
		version : "3.0.0.2",
		worldPosition : true
	});

	if (bytes == null) {
		return;
	}

	// 반환 된 바이트를 파일로 저장
	var len = bytes.length;
	var buf = new ArrayBuffer(len);
	var view = new Uint8Array(buf);
	
	var i;
	for (i = 0; i < len; i++) {
		view[i] = bytes[i];
	}
	const toBinString = (bytes) =>
	bytes.reduce((str, byte) => str + byte.toString(2).padStart(8, '0'), '');

	console.log(toBinString(view));
	var blob = new Blob([view], {
		type: "application/octet-stream"
	});

	if (window.navigator.msSaveOrOpenBlob) {
		window.navigator.msSaveOrOpenBlob(blob, fileName)
	} else {
		var a = document.createElement("a");
		a.style = "display:none";
		a.href = URL.createObjectURL(blob);
		a.download = "building_export.xdo";	// 저장 파일 명칭
		document.body.appendChild(a);
		a.click();
		setTimeout(function() {
			document.body.removeChild(a)
		}, 100)
	}
}

/* 고스트 심볼 모델 오브젝트 생성 */
function createGhostSymbol(_objectKey, _modelKey, _size, _position) {
	
	var newModel = Module.createGhostSymbol(_objectKey);
	
	newModel.setRotation(0.0, 0.0, 0.0);
	newModel.setScale(new Module.JSSize3D(1.0, 1.0, 1.0));
	newModel.setGhostSymbol(_modelKey);
	newModel.setBasePoint(0.0, -_size.height*0.5, 0.0);
	newModel.setPosition(new Module.JSVector3D(_position[0], _position[1], _position[2]));			

	return newModel;
}

/*********************************************************
 * 엔진 파일을 로드합니다.
 * 파일은 asm.js파일, html.mem파일, js 파일 순으로 로드하며,
 * 로드 시 버전 명(engineVersion)을 적용합니다.
 *********************************************************/

;(function(){   
	
	// 1. XDWorldEM.asm.js 파일 로드
	var file = "./XDWorldEM.asm.js";
	var xhr = new XMLHttpRequest();
	xhr.open('GET', file, true);
	xhr.onload = function() {
		
		var script = document.createElement('script');
		script.innerHTML = xhr.responseText;
		document.body.appendChild(script);
	
		// 2. XDWorldEM.html.mem 파일 로드
		setTimeout(function() {
			(function() {
				
				var memoryInitializer = "./XDWorldEM.html.mem";
				var xhr = Module['memoryInitializerRequest'] = new XMLHttpRequest();
				xhr.open('GET', memoryInitializer, true);
				xhr.responseType = 'arraybuffer';
				xhr.onload =  function(e){
							
					// 3. XDWorldEM.js 파일 로드
					var url = "./XDWorldEM.js";
					var xhr = new XMLHttpRequest();
					xhr.open('GET',url , true);
					xhr.onload = function(){
						var script = document.createElement('script');
						script.innerHTML = xhr.responseText;
						document.body.appendChild(script);
					};
					xhr.send(null);
				};
				xhr.send(null);

			})();	

		}, 1);
	};

	xhr.send(null);

})();


/*********************************************************
 *	엔진파일 로드 후 Module 객체가 생성되며,
 *  Module 객체를 통해 API 클래스에 접근 할 수 있습니다. 
 *	 - Module.postRun : 엔진파일 로드 후 실행할 함수를 연결합니다.
 *	 - Module.canvas : 지도를 표시할 canvas 엘리먼트를 연결합니다.
 *********************************************************/
 
var Module = {
	TOTAL_MEMORY: 256*1024*1024,
	postRun: [init],
	canvas: (function() {
		
		var canvas = document.createElement('canvas');
		
		canvas.id = "canvas";
		canvas.width="calc(100%)";
		canvas.height="100%";
		
		canvas.style.position = "fixed";
		canvas.style.top = "0px";
		canvas.style.left = "0px";

		// contextmenu disabled
		canvas.addEventListener("contextmenu", function(e){
			e.preventDefault();
		});

		document.body.appendChild(canvas);
		
		return canvas;
		
	})()
};

window.onresize = function() {

	if (typeof Module == "object") {
		Module.Resize(window.innerWidth, window.innerHeight);
		Module.XDRenderData();
	}
};


function ArrayBufferToString(buffer) {
    return BinaryToString(String.fromCharCode.apply(null, Array.prototype.slice.apply(new Uint8Array(buffer))));
}

function StringToArrayBuffer(string) {
    return StringToUint8Array(string).buffer;
}

function BinaryToString(binary) {
    var error;

    try {
        return decodeURIComponent(escape(binary));
    } catch (_error) {
        error = _error;
        if (error instanceof URIError) {
            return binary;
        } else {
            throw error;
        }
    }
}

function StringToBinary(string) {
    var chars, code, i, isUCS2, len, _i;

    len = string.length;
    chars = [];
    isUCS2 = false;
    for (i = _i = 0; 0 <= len ? _i < len : _i > len; i = 0 <= len ? ++_i : --_i) {
        code = String.prototype.charCodeAt.call(string, i);
        if (code > 255) {
            isUCS2 = true;
            chars = null;
            break;
        } else {
            chars.push(code);
        }
    }
    if (isUCS2 === true) {
        return unescape(encodeURIComponent(string));
    } else {
        return String.fromCharCode.apply(null, Array.prototype.slice.apply(chars));
    }
}

function StringToUint8Array(string) {
    var binary, binLen, buffer, chars, i, _i;
    binary = StringToBinary(string);
    binLen = binary.length;
    buffer = new ArrayBuffer(binLen);
    chars  = new Uint8Array(buffer);
    for (i = _i = 0; 0 <= binLen ? _i < binLen : _i > binLen; i = 0 <= binLen ? ++_i : --_i) {
        chars[i] = String.prototype.charCodeAt.call(binary, i);
    }
    return chars;
}