/* @authors K.F.Hwang kfhwang@nutc.edu.tw & 王鴻逸 @karta1172128
 * @animator: 邱傳恩
 * @version v1.0.0
 * @link http://ilab.nutc.edu.tw
 * Dept. Multimedia, National Taichung University of Science and Technology
 */
function Init() {
    dialogOption = {
        show: 'fade', hide: 'fade', dialogClass: "no-close", width:"70%",
        buttons: [{ text: "知道了", click: function () { $(this).dialog("close"); } }]
    };
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) == false) {
        $("#dialog>p").html("為了獲得更好的使用經驗，您目前的設備不適合使用本系統!");
        $("#dialog").dialog(dialogOption);
    }
    const video = document.getElementById('camera');
    window.can = {
        hevc: video.canPlayType('video/mp4; codecs="hvc1"'),
        webm: video.canPlayType('video/webm')
    };
    if (can.hevc == "" && can.webm == "") {
        $("#dialog>p").html("為了獲得更好的使用經驗，您目前的設備不適合使用本系統!");
        $("#dialog").dialog(dialogOption);
    }
    window.addEventListener('resize', doResize);

    orien = "portrait";
    if (window.matchMedia("(orientation: portrait)").matches ||
        window.matchMedia("(orientation: 0)").matches) {
        orien = "portrait";
    } else {
        orien = "landscape";
    }

    videoCap = document.getElementById('camera'); //video tag顯示webcam
    videoCap.addEventListener("play", drawbox);
    //fixed the capture size to 512x512
    captureSize = 320;
    //for capture image
    captureCanvas = document.createElement('canvas');
    context = captureCanvas.getContext('2d');
    captureCanvas.width = captureSize;
    captureCanvas.height = captureSize;
    //try to use camera
    const videoConstraints = {
        video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: 'environment'
        }, audio: false
    };
    navigator.mediaDevices.getUserMedia(videoConstraints)
        .then(function (stream) {
            videoCap.srcObject = stream;
            videoCap.play();
        })
        .catch(function (err) {
            $("#dialog>p").html("設備發生問題: 無法取得相機!");
            $("#dialog").dialog(dialogOption);
        });
}
//orientation or window size changed
function doResize() {
    $("#canvasBox").remove(); 
    drawbox();
}
function drawbox() {
    var vid_w = $("#camera").width();
    var vid_h = $("#camera").height();
    // $("#msg").show().html("camera w:" + vid_w + ", h:" + vid_h + " window:" + window.screen.width + "x" + window.screen.height);

    if ($("#cbox  > canvas").length == 0) {
        var addcanvas = document.createElement("canvas");
        addcanvas.width = vid_w; addcanvas.height = vid_h;
        addcanvas.style.zIndex = 20;
        addcanvas.setAttribute("id", "canvasBox");
        $("#cbox").append(addcanvas);
    }

    var canvas = document.getElementById("canvasBox");
    uiContext = canvas.getContext("2d");
    uiContext.canvas.width = vid_w;
    uiContext.canvas.height = vid_h;
    //ctx.fillStyle = "rgba(200, 200, 200, 0.2)";
    uiContext.strokeStyle = "rgba(200, 15, 30,.9)";
    uiContext.lineWidth = 15;
    uiContext.globalAlpha = 0.8;
    
    boxsize = vid_w * .65;
    if (vid_w > vid_h) {
        boxsize = vid_h * .65;
        uiContext.lineWidth = 10;
    }
    //draw round corner box
    cap_L = (vid_w - boxsize) / 2;
    cap_T = (vid_h - boxsize) / 2;
    roundRect(uiContext, cap_L, cap_T, boxsize, boxsize, 50, false);
    //show logo
    var logo = new Image();
    logo.onload = function () {
        if (vid_w > vid_h) {
            uiContext.drawImage(logo, 0, 0, logo.width, logo.height, 100, 10, 150, 116);
        } else {
            uiContext.drawImage(logo, 0, 0, logo.width, logo.height, 50, 20, 300, 233);
        }
    };
    logo.src = "images/logo.png";
    window.recogPercent=0;
    correctBar=null;
    if (correctBar == null) correctBar = new RadialBar(uiContext, {
        x: cap_L+boxsize/2,
        y: cap_T+boxsize/2,
        angle: 360,
        title:"",
        radius: boxsize/6,
        lineWidth: 40,
        lineFill:"rgba(198, 245, 200, 1)",
        progress:0,backLineFill:"rgba(250, 160, 60,1)",
        bgFill:"rgba(248, 255, 142, 0.9)",
        isShowInfoText: true,
        infoStyle: '40px Microsoft JhengHei',
        infoColor: 'rgba(166, 7, 28,1)'
    });

}

function loopBar() {
    uiContext.clearRect(cap_L+18, cap_T+18, boxsize-36, boxsize-36);
    correctBar.add(2);
    correctBar.update();
    if (correctBar.progress < recogPercent) {
        requestAnimationFrame(loopBar);
    }
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke === 'undefined') {
        stroke = true;
    }
    if (typeof radius === 'undefined') {
        radius = 5;
    }
    if (typeof radius === 'number') {
        radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
        var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
        for (var side in defaultRadius) {
            radius[side] = radius[side] || defaultRadius[side];
        }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.moveTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.moveTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.moveTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.moveTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    //ctx.closePath();
    if (fill) {
        ctx.fill();
    }
    if (stroke) {
        ctx.stroke();
    }
}

//tracking Part
VideoSelet = function (event) {
    event.stopPropagation();
    window.removeEventListener("endProgress", VideoSelet);
    uiContext.beginPath();
    uiContext.closePath();
    uiContext.clearRect(cap_L + 18, cap_T + 18, boxsize - 36, boxsize - 36);
    recogPercent = 0;
    correctBar.title = "";
    correctBar.set(0);
    $("#canvasBox").fadeOut();
    if(can.hevc)
        $("#IOSVid").attr("src", "videos/" + videos[matchedIndex] + ".mov");
    else if(can.webm)
        $("#AndroidVid").attr("src", "videos/" + videos[matchedIndex] + ".webm");
    if(can.webm || can.hevc){
        $("#vidplayer")[0].load();
        $("#vidplayer").fadeIn();
        //canDetection = false;
    }
};

function VideoClear() {
    $("#vidplayer").fadeOut();
    timer = 0;
    uiContext.beginPath(), uiContext.closePath(), uiContext.clearRect(cap_L + 18, cap_T + 18, boxsize - 36, boxsize - 36);
    $("#AndroidVid").attr("src", "");
    $("#IOSVid").attr("src", "");
}
 
var matchedIndex,
    canDetection = true,
    timer = 0,
    notimer=false,
    videos = ["Birthday", "Story", "Volleyball", "Exercise", "Victory", "SchoolCelebration", "Announcement", "Speech", "Translation", "ListenTo"],
    Titles = ["生日", "故事", "坐地排球", "運動", "勝利", "校慶", "公告", "演講", "手語翻譯", "聽打"];
window.onload = function () {
    Init();
    var searchParams = new URLSearchParams(window.location.href.split("?")[1]);
    console.log(searchParams.get("timer"));
    notimer = (searchParams.get("timer")=="F");
    window.descriptorLength = 128;
    window.blurRadius = 3; //模糊參數可調
    window.matchLength = 50;
    window.Threshold = 300000; //distance matching threshold
    window.fps = 60; //captrue image, frequence per second

    $("#vidplayer").on("ended", function () {
        if (!canDetection) {
            canDetection = true;
            $("#canvasBox").fadeIn();
            VideoClear();
        }
    });
 
    targetGray = {};
    targetCanvas = document.createElement("canvas");
    targetCanvas.width = targetCanvas.height = captureSize;
    targetCtx = targetCanvas.getContext("2d");
    for (var i = 0; i < videos.length; i++) {
        targetCtx.drawImage(Target[i], 0, 0, captureSize, captureSize);
        var imageData = targetCtx.getImageData(0, 0, captureSize, captureSize),
            gray = tracking.Image.grayscale(tracking.Image.blur(imageData.data, captureSize, captureSize, blurRadius), captureSize, captureSize);
        targetGray[videos[i]] = {}; 
        targetGray[videos[i]] = JSON.parse(JSON.stringify(gray));
    }
    Target=null;
    candidate = [];
    // for (let i = 0; i < videos.length; i++) 
    //     candidate.push(0);
    doMatch();
};
 
async  function doMatch () {
    if (canDetection) {
        tracking.Brief.N = window.descriptorLength; 
        timer++;
        var vidWidth = videoCap.videoWidth,
            vidHeight = videoCap.videoHeight,
            boxSize = 0;
        if(vidWidth > vidHeight ){
         boxSize = 0.65 * vidHeight;
         context.drawImage(videoCap, (vidWidth - boxSize) / 2, (vidHeight - boxSize) / 2, boxSize, boxSize, 0, 0, captureSize, captureSize);
        }else{
         boxSize = 0.65 * vidWidth; 
         context.drawImage(videoCap, (vidWidth - boxSize) / 2, (vidHeight - boxSize) / 2, boxSize, boxSize, 0, 0, captureSize, captureSize);
        }
        var capImg = context.getImageData(0, 0, captureSize, captureSize),
            gray = await tracking.Image.grayscale(tracking.Image.blur(capImg.data, captureSize, captureSize, blurRadius), captureSize, captureSize),
            corners = await tracking.Fast.findCorners(gray, captureSize, captureSize),
            descriptors = await tracking.Brief.getDescriptors(gray, captureSize, corners);
        for (let label = 0; label < videos.length; label++) {
            var targetCorners = await tracking.Fast.findCorners(targetGray[videos[label]], captureSize, captureSize),
                targetDescriptors = await tracking.Brief.getDescriptors(targetGray[videos[label]], captureSize, targetCorners);
            matches = tracking.Brief.reciprocalMatch(targetCorners, targetDescriptors, corners, descriptors); 
            matches.sort((a,b)=>{return b.confidence-a.confidence});
            for (var distSum = 0, i = 0; i < Math.min(matchLength, matches.length); i++) {
                var dx = matches[i].keypoint1[0] - matches[i].keypoint2[0],
                    dy = matches[i].keypoint1[1] - matches[i].keypoint2[1];
                distSum += dx * dx + dy * dy;
            }
            //judgement
            if (matches.length > matchLength && distSum < Threshold){
                var idx=candidate.findIndex((item)=>{return item.index==label});
                if(idx<0)
                    candidate.push({index:label,distance:distSum,count:1});
                else{
                    candidate[idx].count++;
                    if(candidate[idx].distance > distSum)
                        candidate[idx].distance = distSum;
                }
               
            }
        }
        if(candidate.length>0){//matched  
            // if(candidate.length>1){
            //     consol.log(JSON.stringify(candidate));
            // }
            candidate.sort((a,b)=>{a.distance-b.distance});
            correctBar.isStop=false;
            recogPercent+=50;
            correctBar.title=Titles[candidate[0].index];
            if(candidate[0].count>1){//confirmed
                canDetection = false;
                matchedIndex=candidate[0].index;
                candidate=[];
                window.addEventListener("endProgress", VideoSelet);
            }
            loopBar();
        }
        if(!notimer && timer>120){
            VideoClear();
            dialogOption2 = {
                show: "fade",
                hide: "fade",
                dialogClass: "no-close",
                width: "70%",
                buttons: [
                    {
                        text: "不再通知",
                        click: function () {
                            notimer = true;
                            $(this).dialog("close");
                        },
                    },
                    {
                        text: "知道了",
                        click: function () {
                            //alert(videoCap.srcObject.getVideoTracks()[0].enabled)
                            $(this).dialog("close");
                        },
                    }
                ]
            }

            $("#dialog>p").html("請將繪本上的手語圖對準在畫面中的框框內，若仍無法成功辨識，請按此=> <a href='#'>參考使用說明<//a>");
            $("#dialog").dialog(dialogOption2);
            $("#dialog").on("dialogclose",function(){
                if(navigator.userAgent.includes("iPhone")){
                    dialogOption3 = {show: "fade",hide: "fade",
                        dialogClass: "no-close",
                        width: "70%",
                        buttons: [{
                                text: "重新載入網頁",
                                click: function () {
                                    window.location.replace(location.href+"?timer=F");}
                                },{
                                text: "知道了",
                                click: function () {
                                    $("#dialog").off("dialogclose");
                                    $(this).dialog("close");}
                                }
                                ]
                    }
                    $("#dialog>p").html("手機閒置過久後可能會開啟內容阻擋器，導致攝影機無法使用，需要重新載入網頁!");
                    $("#dialog").dialog(dialogOption3);
                }    
            })
            timer=0;
        }
    }
    setTimeout(doMatch, 1000 / fps);
};
