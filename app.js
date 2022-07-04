const express = require('express');
const app = express();
const path = require('path');
const request = require('request');
const qs = require('querystring');
const fs = require('fs');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/getModelList', function(req, res) {    
    let FileArr = new Array();
    fs.readdir("./public/3ds", (err, files) => {        
        files.forEach(
            (val, idx) =>{
                if(val.indexOf(".3ds") > -1){
                    FileArr.push(val);
                }
            }
        )
        //FileArr = JSON.stringify(FileArr);
        console.log("파일목록");
        console.log(files);
        console.log(FileArr); 
        console.log(err); 
        res.json({"result" : FileArr});
    });        
});

app.get('/', function(req,res){
    var filePath = qs.stringify(req.url);
    console.log("/" + filePath); 
    res.sendFile(path.join(__dirname, 'public', filePath))
});

//프록시 필요시
const wmsUrl = "http://api.vworld.kr/req/wms";
const wfsUrl = "http://api.vworld.kr/req/wfs";
app.get('/proxywms', function(req, res) {    
    var url = wmsUrl +"?" + qs.stringify(req.query);
    //console.log('/fileThumbnail going to url' + url); 
    request.get(url).pipe(res);
});

app.get('/proxywfs', function(req, res) {    
    var url = wfsUrl +"?" + qs.stringify(req.query);
    //console.log('/fileThumbnail going to url' + url); 
    request.get(url).pipe(res);
});

app.listen(8000, function(){
    console.log("Hello Cesium");
});



