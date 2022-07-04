var GLOBAL = {
    viewerReady : false,
    loadModelKey : ""
};
function get3DSList(){
    //@params,success,url,type
    getListAjax("",function(res){
        console.log(res.result);
        makeModelList(res.result);
    }, "/getModelList", "get");
};
//콜백 함수 내용에 따른 분기
var MODEL_LIST = []; //반복 문용 객체
var INDI_MODEL_LIST = []; //개별 호출 객체
function makeModelList(modelArr){
    var modelStr = "";
    modelArr.forEach((val, idx) => {
        var fileName = val.replace(".3ds","");
        var textureName = fileName+".jpg";
        modelStr +="<li style='cursor:pointer;' onclick='makeIndiThumbnails("+idx+")'>["+(idx+1)+"] "+val+"<span id='"+fileName+"' class='makecheck'>미완료</span></li>";
        
        MODEL_LIST.push(
            {
                key : fileName,
                url : '/3ds/'+val,
                texture : {
                    0 : {
                        url : '/3ds/'+textureName
                    }
                },
                format : "3ds",
                callback : function(e){
                    //checkModelList(idx);
                    // setTimeout(function(_fileName, _idx){      //이미지 다운로드 완료시간 텀 
                    //     console.log(new Date());
                    //     captureCanvas(_fileName, _idx); //썸네일 png저장                        
                    // }(fileName, idx), 3000);                
                    //console.log("callback " + new Date());
                    captureCanvas(fileName, idx); //썸네일 png저장                        
                    XDViewer.canvas.style.display = "block";
                }
            }
        );
        INDI_MODEL_LIST.push(
            {
                key : fileName,
                url : '/3ds/'+val,
                texture : {
                    0 : {
                        url : '/3ds/'+textureName
                    }
                },
                format : "3ds",
                callback : function(e){
                    //checkModelList(idx);
                    //captureCanvas(fileName, idx); //썸네일 png저장
                    XDViewer.canvas.style.display = "block";
                }
            }
        );
    });
    $('#modelList').append(modelStr);
    
    console.log(MODEL_LIST);    
} 
//모델링 데이터 호출여부
function checkModelList(idx){
    $('#'+MODEL_LIST[idx].key).addClass('complete');
    $('#'+MODEL_LIST[idx].key).text("완료");    
    
    if(idx < MODEL_LIST.length - 1){        
        var nextIdx = idx + 1;
        //console.log("checkModelList " + new Date());
        makeThumbnails(nextIdx);
    }else{
        alert("생성완료!");
    }    
    
}
//xdviewer 초기화 호출  
var initCanvasID = "XDViewerCanvas";
var initContainerID = "thumbnailArea";
function initXDViewerCall(_idx){
    initXDViewer(initContainerID, initCanvasID+_idx, viewerInitCallback);
} 
//초기화 콜백
function viewerInitCallback() {
    console.log("초기화 완료");
    GLOBAL.viewerReady = true;
    console.log(GLOBAL.viewerReady);
    
    // setTimeout(function() {    
    //     XDViewer.loadModel({
    //         key : 'test',
    //         url : '/3ds/sample_5.3ds',
    //         texture : {
    //             0 : {
    //                 url : '/3ds/sample_5.jpg'
    //             }
    //         },
    //         format : "3ds",
    //         callback : function(e){
    //             XDViewer.canvas.style.display = "block";
    //         }
    //     });
    // }, 500);
}

//개별 항목 클릭 호출
function makeIndiThumbnails(idx){
    //XDViewer.loadModels(MODEL_LIST);     
    initXDViewerCall(idx); //xdviewer 초기화fy
    XDViewer.loadModel(INDI_MODEL_LIST[idx]);        
    
}
//반복문용 썸네일 호출
function makeThumbnails(idx){
    //XDViewer.loadModels(MODEL_LIST);        
    
    //console.log("makeThumbnails" + new Date());
    initXDViewerCall(idx); //xdviewer 초기화
    setTimeout(function(_idx){      //이미지 다운로드 완료시간 텀 
        //console.log("makeThumbnails" + new Date());
        XDViewer.loadModel(MODEL_LIST[_idx]);        
    }(idx), 3000,3000);                   

    //setTimeout((_idx)=>{XDViewer.loadModel(MODEL_LIST[_idx])}(idx), 3000);                   
    //setTimeout(XDViewer.loadModel(MODEL_LIST[idx]), 10000);                   
}
getListAjax = function (params,success,url,type){
    $.ajax ({
        url: url,
        type: type,
        dataType: "json",
        contentType : "application/json; charset=UTF-8",
        data: params,
        async: false,
        success: success,
        error: function(xhr, status, error) {
            //console.log("err : " + error);
        }
    });
}
//생성된 캔버스 이미지 파일 저장
function captureCanvas(_fileName, _idx){
    //지정할 태그 영역 아이디 명으로 조회
	var mapCanvas = document.getElementById(initCanvasID+_idx);
	
    // 스크린 샷 만들 canvas 가상의 캔버스
	var captureCanvas = document.createElement('canvas');
	var ctx = captureCanvas.getContext('2d');
	
	// 지정한 태그 = 스크린샷 크기 맞추기
	captureCanvas.width = mapCanvas.width;
	captureCanvas.height = mapCanvas.height;


	// 지도 canvas 이미지 로드
	var img = new Image();
	img.onload = function() {
		// 지도 캔버스 화면을 복사 (이 부분이 지도화면 -> 스크린샷 캔버스로 그리는 부분)
		ctx.drawImage(mapCanvas, 0, 0, mapCanvas.width, mapCanvas.height);
				// FireFox, Chrome 이미지 처리 및 다운로드
				captureCanvas.toBlob(function(e) {                   
					var data = URL.createObjectURL(e);
                    //a태그를 만들어서 클릭하고 삭제하는 방법 
					var	eLink = document.createElement("a");
					eLink.setAttribute("href", data);
                    //파일명 위치 설정가능 
					eLink.setAttribute("download", _fileName+".png");
					document.body.appendChild(eLink);
					eLink.click();
					document.body.removeChild(eLink);                                        
					return true;
				}, "image/png", 1);                
                checkModelList(_idx);   //다음 모델 호출                
	};		
	img.src = mapCanvas.toDataURL("image/jpeg");
}