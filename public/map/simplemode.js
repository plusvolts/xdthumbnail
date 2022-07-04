/*********************************************************
 * 엔진 파일을 로드합니다.
 * 파일은 asm.js파일, html.mem파일, js 파일 순으로 로드하며,
 * 로드 시 버전 명(engineVersion)을 적용합니다.
 *********************************************************/
var ENGINE_PATH = "./"
var engineVersion = "v0.0.0.1";
;(function(){   	
	// 1. XDWorldEM.asm.js 파일 로드
	var file = ENGINE_PATH+"XDWorldEM.asm.js?p="+engineVersion;
	var xhr = new XMLHttpRequest();
	xhr.open('GET', file, true);
	xhr.onload = function() {
	  	
		var script = document.createElement('script');
		script.innerHTML = xhr.responseText;
		document.body.appendChild(script);
	
		// 2. XDWorldEM.html.mem 파일 로드
		setTimeout(function() {
			(function() {
				
			    var memoryInitializer = ENGINE_PATH+'XDWorldEM.html.mem?p='+engineVersion;
				var xhr = Module['memoryInitializerRequest'] = new XMLHttpRequest();
			    xhr.open('GET', memoryInitializer, true);
			    xhr.responseType = 'arraybuffer';
			    xhr.onload =  function(){
					
					// 3. XDWorldEM.js 파일 로드
			        var url = ENGINE_PATH+"XDWorldEM.js?p="+engineVersion;
					var xhr = new XMLHttpRequest();
					xhr.open('GET',url , true);
					xhr.onload = function(){
					   	var script = document.createElement('script');
					   	script.innerHTML = xhr.responseText;
					   	document.body.appendChild(script);
					};
					xhr.send(null);
				}  
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
		
		// Canvas 엘리먼트 생성
		var canvas = document.createElement('canvas');
		
		// Canvas id, Width, height 설정
		canvas.id = "canvas";
		canvas.width="calc(100%)";
		canvas.height="100%";
		
		// Canvas 스타일 설정
		canvas.style.position = "fixed";
		canvas.style.top = "0px";
		canvas.style.left = "0px";

		// canvas 이벤트 설정
		canvas.addEventListener("contextmenu", function(e){
			e.preventDefault();
		});
		
		// 생성한 Canvas 엘리먼트를 body에 추가합니다.
		
		document.getElementById("mapArea").appendChild(canvas);		
		
		return canvas;
		
	})()
};
var trueLayerList, falseLayerList, XD_Map;
/* 전역 변수 리스트 */
var GLOBAL = {
	Map : null,		// JSMap API 호출 객체
	Layer1 : null,		// 
	Layer2 : null,		// 
	Layer3 : null,		// 
	ObjectIndex : 0
};
/* 엔진 로드 후 실행할 초기화 함수(Module.postRun) */
function init() {
		
	//Module.XDESetSatUrlLayerName("http://121.78.158.27:8080", "tile"); //지도 설정
	 Module.XDESetSatUrlLayerName("http://xdworld.vworld.kr:8080", "tile"); //지도 설정
	 Module.XDESetDemUrlLayerName("http://xdworld.vworld.kr:8080", "dem"); //지도 설정	
	//Module.XDESetSatUrlLayerName("http://xdworld.vworld.kr:8080", "tile_mo_2015"); //지도 설정
	//Module.XDESetDemUrlLayerName("http://localhost:8090", "dem_naju0801");
	//Module.XDESetDemUrlLayerName(SEVER_PATH, "dem"); //dem 설정
	
	//Module.XDECreateTimeSeriesLayer("time", "http://xdworld.vworld.kr:8080",2018, 0, 16); //신규 영상 호출	
	//Module.XDEPlanetRefresh();	 // 신규영상 적용
	Module.SetAPIKey("42F6D36E-1A78-34B7-959F-37611794397B");//전력연구원키
	//Module.SetResourceServerAddr("./img/");
    //엔진 초기화 API 호출(필수)
	Module.Start(window.innerWidth, window.innerHeight);
	
	//Module.XDECreateTimeSeriesLayer("time", "http://xdworld.vworld.kr:8080",2018, 0, 16); //신규 영상 호출	
	//Module.XDEPlanetRefresh();	 // 신규영상 적용
	
	//껀물추까
	/**
	Module.XDEMapCreateLayer("facility_bridge","http://localhost:8090",8080,true,true,false,9,0,15); //빛가람동 건물
	**/
	Module.XDEMapCreateLayer("facility_build","http://xdworld.vworld.kr:8080",8080,true,true,false,9,0,15); //빛가람동 건물
		
	// Module.XDEMapCreateLayer("poi_base","http://xdworld.vworld.kr:8080",8090,true,true,false,5,0,15); 
	// Module.XDEMapCreateLayer("poi_bound","http://xdworld.vworld.kr:8080",8090,true,true,false,5,0,15); 
	
	//Module.getMap().setTileObjectRenewLevel(10);

	// 레이어 리스트 초기화
	trueLayerList = new Module.JSLayerList(true);
	falseLayerList = new Module.JSLayerList(false);
	
	Module.getViewCamera().moveLonLatAlt(127.01846758071599, 37.527726003520414, 30751.51441830769, true);

	Module.getViewCamera().setLimitTilt(-88.0);

	Module.setVisibleRange("facility_build", 1.5, 100000.0);
	
	// 건물 객체 반환
	var layerList = new Module.JSLayerList(false);
	GLOBAL.LAYER = layerList.nameAtLayer("facility_build");
	setTileTextureLOD(0.5);
	
	// 텍스쳐 용량 제한 해제
	Module.getOption().setTextureCapacityLimit(false);
}

function setSimpleMode(flag){
	Module.SetSimpleModeLineRender(!flag);
	Module.SetSimpleMode(flag);
//	Module.SetSimpleModeLineRender(flag);
}

function renderingMode(flag){
	Module.SetSimpleModeLineRender(!flag);
	// var layerList = new Module.JSLayerList(false);
	// var abc = layerList.nameAtLayer("facility_build");
	// abc.SetRenderReal3dEdgeLine(!flag);
	//abc.SetRenderReal3dWireFrame(flag);
}



// 해당 기능은 브이월드 API Key를 발급받으셔야합니다.
// VWorld 오픈API ( https://www.vworld.kr/dev/v4dv_opnws3dmap2guide_s001.do )에서 API Key 발급 후 사용해주세요.

var apikey = "42F6D36E-1A78-34B7-959F-37611794397B";
// 브이월드 WMTS 레이어 생성
function createLayerWMTS() {
	
	/* 구성 정보(서버 설정 값으로 새로 타일링하지 않는 이상 변하지 않는 값)
	 * url : 요청 URL
	 * vworldTileSet : 브이월드 타일구조일 경우 true
	 * serviceLevel : 타일링된 최소 최대 레벨
	 */
	
	// 브이월드 WMTS 사용법
	let option = {	
		// 타일구조에 대한 정보.
    	// Base: 기본지도
    	url: "http://api.vworld.kr/req/wmts/1.0.0/" + apikey + "/Base/{z}/{y}/{x}.png",
    	
    	// 2D 야간지도
    	// url: "http://api.vworld.kr/req/wmts/1.0.0/" + apikey + "/midnight/{z}/{y}/{x}.png",
    	
    	// 2D 회색지도
        // url: "http://api.vworld.kr/req/wmts/1.0.0/" + apikey + "/gray/{z}/{y}/{x}.png",
    	
    	// 2D 영상지도
        // url: "http://api.vworld.kr/req/wmts/1.0.0/" + apikey + "/Satellite/{z}/{y}/{x}.jpeg",
        serviceLevel: {
            min: 3,
            max: 18
        },
        vworldTileSet: true	// 브이월드 타일구조일 경우 true   
	};					
	
	var wmts = Module.WMTS();	// WMTS 클래스
	wmts.provider = option;		// wmts provider property
	wmts.quality = "middle";	// wmts 이미지 품질
}

// 배경지도 초기화
function clearMap() {
	
	Module.WMTS().clear();
}
