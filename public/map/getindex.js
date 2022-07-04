function getIndex(x1,y1,x2,y2, level){
    var locationX1 = Double.valueOf(x1);
    var locationY1 = Double.valueOf(y1);
    var locationX2 = Double.valueOf(x2);
    var locationY2 = Double.valueOf(y2);
            
    var tileSize = 36 / (Math.pow(2, level));
    var tileIDX = Integer.parseInt((Math.floor((locationX1 + 180) / tileSize)));
    var tileIDY = Integer.parseInt((Math.floor((locationY1 + 90) / tileSize)));
    
    console.log(tileIDX + " ,"+tileIDY);          
}

function initClickEvent(){
    Module.XDSetMouseState(6);
    Module.canvas.addEventListener('Fire_EventSelectedObject',showBuildInfo);

    	// 마우스 클릭
	Module.canvas.addEventListener("mousedown", function(e) {
		getCameraProperties();
	});
}

function showBuildInfo(eObj){
    console.log(eObj);
    $('#ilevel').val(eObj.iLevel);        
    $('#idx').val(eObj.idx);        
    $('#idy').val(eObj.idy);        
    $('#datafile').val(eObj.dataFile);        
}

function getCameraProperties(){
    // 카메라 위치 반환 Module.getViewCamera().getLocation(); return {Longitude: ,Latitude: ,Altitude: }
	var cameraLocation = Module.getViewCamera().getLocation();
	$('#cLon').val(cameraLocation.Longitude.toFixed(5));
    $('#cLat').val(cameraLocation.Latitude.toFixed(5));
    $('#cLat').val(cameraLocation.Altitude.toFixed(5));
    $('#cLevel').val(Module.getViewCamera().getMapZoomLevel());
    
}