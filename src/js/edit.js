let counters = {
    imgCounter: 1,
    muteCounter: 1,
    soundCounter: 1,
    textCounter: 1,
    brushCounter: 1,
    switchCounter: 1,
    videoCounter: 1,
    deleteCounter: 1,
    linkCounter: 1,
    cutCounter: 1
};
let toolChoosed = false;
let watching = false;
let playBox;
let editedVideo = [
    {
        id: getVideoCounter(),
        url: sessionStorage.getItem('url'),
        title: "",
        img: `https://img.youtube.com/vi/${sessionStorage.getItem('url')}/0.jpg`
    }
];
let videos = [];
let changeSize = null;
let imgRotate = 0;
let vidRotate = 0;
let rotateInt = null;
let actuallyEdited = {};
let videoOverlayer = {
    rotate: 0
};

//https://tadmag.blob.core.windows.net/tad-mag/storage/image/royalties/MAGICAL.png-2018-11-23%2010:01:31.png

(function init(){
    if(document.querySelector("#toolsBox") !== null){
        loadScript();
        unpackVideos();
        createMarkerContainer();
    
        if(window.screen.width < 768){
            document.querySelector("#link").style.opacity = "0.1";
        }
    
        document.querySelector("#howTo").addEventListener("click", howTo)
    }
})();

function getVideoCounter(){
    if(localStorage.getItem('videoCounter') === null){
        let counter = 0;

        localStorage.setItem('videoCounter', counter);

        return counter;
    }
    else{
        localStorage.setItem("videoCounter", parseInt(localStorage.getItem('videoCounter')) + 1);

        return localStorage.getItem('videoCounter'); 
    }
}

function createMarkerContainer(){
    if(!mobilecheck()){
        const markerContainer = document.createElement("div");

        markerContainer.id = "markerContainer";
        
        document.querySelector("#container").appendChild(markerContainer)

        if(window.screen.width >= 1600){
            document.querySelector("#markerContainer").style.width = "81%";
        }
        else if(window.screen.width >= 768){
            document.querySelector("#markerContainer").style.width = "71%";
        }
    }
}

function unpackVideos(){
    if(localStorage.getItem('videos') === null){
        videos = [];
    }
    else{
        videos = JSON.parse(localStorage.getItem('videos'));
    }
}

function createYoutubeVideo(){
    playBox = new YT.Player('player', {
        videoId: sessionStorage.getItem('url'),
        events: {
            onReady: createTools
        },
        playerVars: {
            rel: 0,
            showinfo: 0, 
            ecver: 2
        } 
    });
}

function createTools(){
    let image =  document.querySelector('#image');
    let sound = document.querySelector('#sound');
    let video = document.querySelector('#video');
    let draw = document.querySelector('#brush');
    let link = document.querySelector('#link');
    let mute = document.querySelector('#mute');
    let text = document.querySelector('#text');
    let del = document.querySelector('#delete');
    let watch = document.querySelector('#watchVideo');
    let save = document.querySelector('#saveVideo');

    image !== null ? image.addEventListener('click', () => createPopup('img')) : null;
    sound !== null ? sound.addEventListener('click', () => createPopup('sound')) : null;
    video !== null ? video.addEventListener('click', () => createPopup('video')) : null;
    draw !== null ? draw.addEventListener('click', beginDraw) : null;
    link !== null ? link.addEventListener('click', createLink) : null;
    mute !== null ? mute.addEventListener('click', muteVideo) : null;
    text !== null ? text.addEventListener('click', createText) : null;
    del !== null ? del.addEventListener('click', deletePart) : null;
    watch !== null ? watch.addEventListener('click', () => {
        watching = true;
        setTimeout(() => watchVideo(playBox, editedVideo), 500);
    }) : null;
    save !== null ? save.addEventListener('click', saveVideo) : null;

    toolChoosed ? playerReady() : null
}

function calculatePosition(){
    return (document.querySelector('#markerContainer').offsetWidth) * playBox.getCurrentTime() / playBox.getDuration()
}

function markArea(icon, id){
    if(!mobilecheck()){
        let point = calculatePosition();
        const marker = document.createElement('div');
        const img = new Image();
        let check = true;
    
        marker.className = 'marker'
        marker.dataset.id = id;
        marker.style.left = calculatePercentage(point, document.querySelector('#markerContainer').offsetWidth);
        marker.appendChild(img);
        
        img.src = `../img/${icon}.png`
    
        document.querySelectorAll(".marker").forEach(mark => {
            if(parseInt(mark.dataset.id) === id && mark.children[0].src.includes(icon)){
                //Second marker
                if(parseInt(mark.style.left) > parseInt(marker.style.left)){
                    check = false;
                }
            }
        });
    
        check ? document.querySelector("#markerContainer").appendChild(marker) : null;
    }
}

function calculatePercentage(point, elem){
    let percentage = (100 * point) / parseInt(elem);

    return `${percentage}%`;
}

function randomColor(){
    let color = "#";
    let avaiableSigns = "0123456789abcdef";

    for(let i = 0; i < 6; i++){
        color += avaiableSigns[Math.floor(Math.random() * 16)];
    }

    return color
}

function saveToStorageVideos(){
    localStorage.setItem('videos', JSON.stringify(videos));
}

function saveVideo(){
    const savePopup = document.createElement('div');
    const overlayer = document.createElement('div');

    overlayer.id = 'overlayer';
    savePopup.id = 'savePopup';


    videos.push(editedVideo);
    saveToStorageVideos();

    savePopup.innerHTML = 
        `<h1>Your video was saved</h1>
         <input type="text" placeholder="Type video title"/>
         <a href="../html/watch.html">
            <div class="tubeEditBtn">Watch video</div>
         </a>`

    document.body.append(savePopup, overlayer);
    giveVideoTitile();
}

function giveVideoTitile(){
    document.querySelector("#savePopup input").addEventListener("change", e => {
        videos[videos.length - 1][0].title += e.target.value;
        localStorage.setItem("videos", JSON.stringify(videos));
    });
}

function simpleToolsPrep(obj, arr){
    markArea(arr[arr.length - 1], arr[0]);
    const tool = document.createElement('div');

    tool.id = arr[1];
    tool.className = 'simpleTool';
    tool.innerHTML = arr[2];

    document.querySelector('#container').appendChild(tool);
    document.querySelector('#saveEdits').addEventListener('click', () => saveSimpleToolEdits(arr[0], arr[3], tool, obj));
}

function saveSimpleToolEdits(id, img, tool, obj){
    document.querySelector('#player').style.position = 'static';
    document.querySelector('#player').style.width = "100%";
    document.querySelector('#player').style.height = "100%";

    if(window.screen.width >= 1600){
        document.querySelector("#markerContainer") !== null ? document.querySelector("#markerContainer").style.width = "81%" : null;
    }
    else{
        document.querySelector("#markerContainer") !== null ? document.querySelector("#markerContainer").style.width = "71%" : null;
    }

    obj.endPoint = playBox.getCurrentTime();
    
    markArea(img, id);
    connectMarks(img, id);

    editedVideo.push(obj);
    tool.remove();
    playBox.pauseVideo();
    document.querySelector("#goBack").remove();
}

function connectMarks(img, id){
    let markers = document.querySelectorAll('.marker');
    let markersToConnect = [];
    let markColor = randomColor();

    markers.forEach( marker => {
        if(marker.children[0].src.includes(img) && parseInt(marker.dataset.id) === id){
            markersToConnect.push(marker);
        }
    });

    markersToConnect.forEach(mark => mark.style.border = `2px solid ${markColor}`);
    
   return createConnector(markersToConnect)
}

function createConnector(markers){
    if(markers.length === 2){
        const connector = document.createElement('div');
        let startPoint = parseInt(markers[0].style.left);
        let endPoint = parseInt(markers[1].style.left) - startPoint;


        for (let key in counters) {
            if (key.toLowerCase().includes(markers[0].children[0].src.split("/")[2].slice(4).toLowerCase())) {
                counters[key]++;
            }
        }

        connector.className = 'connector';
        connector.style.backgroundColor = markers[0].style.border.slice(9);
        connector.style.width = `${parseInt(markers[1].style.left) - parseInt(markers[0].style.left)}%`;
        connector.style.left = `${startPoint + 1}%`;
        document.querySelector("#markerContainer") !== null ? document.querySelector("#markerContainer").appendChild(connector) : null;
    }
    else{
        document.querySelector(".marker") !== null ?  document.querySelectorAll(".marker")[ document.querySelectorAll(".marker").length - 1].remove() : null;
    } 
}

function createLink(){
    if(window.screen.width < 768){
        return
    }
    const linkPopup = document.createElement('div');
    let link = {
        type: 'link',
        id: counters.linkCounter,
        startPoint: null,
        endPoint: null
    };
    let available = false;

    linkPopup.id = 'linkPopup';
    actuallyEdited = link;
    editedVideo.forEach( edit => {
        if(edit.type === 'img' || edit.type === 'video' || edit.type === 'text'){
            available = true;
        }
    });

    if(available){
        linkPopup.innerHTML = 
            `<h1>Adding link</h1>
             <p>Click on one of your previously created icons of drawing, image, text or video to add href to it</p>`;

        document.querySelectorAll('.marker').forEach(marker => marker.addEventListener('click', e => addLinkToElement(link, e)))
    }
    else{
        linkPopup.innerHTML = 
            `<h1>Adding link</h1>
             <p>You don't have any created videoes, images or text to make a link of it</p>`;
    }

    document.querySelector('#container').append(linkPopup);
    document.querySelector('#player').style.width = '81.5vw';

    stylingPlayer();
    addGoBackButton(removeLink);
}

function addLinkToElement(link, e){
    let target;
    let firstMarker;
    let lastMarker;

    if(e.target.nodeName === 'IMG'){
        target = e.target.parentNode;
    }
    else{
        target = e.target;
    }

    firstMarker = document.querySelectorAll(`.marker[data-id="${target.dataset.id}"]`)[0];
    lastMarker = document.querySelectorAll(`.marker[data-id="${target.dataset.id}"]`)[1];

    markArea('colorLink', counters.linkCounter);

    document.querySelectorAll(".marker")[document.querySelectorAll(".marker").length - 1].style.top = "-60%";
    document.querySelectorAll(".marker")[document.querySelectorAll(".marker").length - 1].style.border = `2px solid rgb${target.style.border.split("rgb")[1]}`;

    editedVideo.forEach(edit => {
        if(edit.id === parseInt(target.dataset.id)){
            link.startPoint = edit.startPoint;
            link.endPoint = edit.endPoint;
            addLinkPoint(link)
        }
    });
}

function addLinkPoint(edit){
    document.querySelector('#linkPopup').innerHTML = 
        `<h1>Adding link</h1>
         Move video to the point where the marker should be linked
         <div id="saveEdits">Save edits</div>`;

    document.querySelector('#saveEdits').addEventListener('click', () => {
        edit.linkTo = playBox.getCurrentTime();
        removeLink();

        if(window.screen.width >= 1600){
            document.querySelector("#markerContainer") !== null ? document.querySelector("#markerContainer").style.width = "83%" : null;
        }
        else{
            document.querySelector("#markerContainer") !== null ? document.querySelector("#markerContainer").style.width = "75%" : null;
        }
        document.querySelector('#player').style.position = 'static';
        editedVideo.push(edit)
        goBackFnc()
    });
}

function removeLink(){
    document.querySelector('#player').style.position = "static";
    document.querySelector('#player').style.width = '100%';
    document.querySelector('#player').style.height = '100%';
    document.querySelector('#linkPopup').remove();
}


function deletePart(){
    let deletePart = {
        type: 'delete',
        id: counters.deleteCounter,
        startPoint: playBox.getCurrentTime(),
        endPoint: null
    };
    const deleteBox = document.createElement('div');

    stylingPlayer();
    addGoBackButton(removeDeleteBox);
    simpleToolsPrep(deletePart, [counters.deleteCounter, 'deleteBox', '<p>Move progress bar to place where the deleted part should end and click button below</p><div id="saveEdits">Save edits</div>', 'colorCut']);
}

function removeDeleteBox(){
    document.querySelector('#deleteBox').remove();
}

function muteVideo(){
    let mute = {
        type: 'mute',
        id: counters.muteCounter,
        startPoint: playBox.getCurrentTime(),
        endPoint: null
    };
    const muteBox = document.createElement('div');

    simpleToolsPrep(mute, [counters.muteCounter, 'muteBox', '<p>Move progress bar to place where the muted part should end and click button below</p><div id="saveEdits">Save edits</div>', 'colorMute'])
    addGoBackButton(removeMuteBox);
    stylingPlayer();
}

function removeMuteBox(){
    document.querySelector('#player').style.width = '100%';
    document.querySelector('#muteBox') !== null ? document.querySelector('#muteBox').remove() : null;
}

function beginDraw(){
    let drawing = {
        type: 'drawing',
        id: counters.brushCounter,
        src: null,
        startPoint: playBox.getCurrentTime(),
        endPoint: null
    };
    const brushBox = document.createElement('div');

    brushBox.id = 'brushBox';

    actuallyEdited = drawing;
    editedVideo.push(drawing);
    counters.brushCounter++;

    markArea('brushColor', drawing.id);
    addGoBackButton(removeBrushBox);

    document.body.append(brushBox, document.createElement('canvas'));
    document.querySelector('canvas').id = 'canvas';
    
    playBox.pauseVideo();

    stylingPlayer();
    createBrushBox(drawing.id);
}

function removeBrushBox(){
    document.querySelector('#brushBox').remove();
    document.querySelector('canvas').remove();
}

function createBrushBox(idx){
    brushBox.innerHTML = 
        `<div id="toolBox">
            <div id="brushTool" class="drawingTool">
                <img src='../img/brush.png'>
            </div>
            <div id="eraserTool" class="drawingTool">
                <img src='../img/eraser.png'>
            </div>
        </div>
        <div id="brushSizes">
            <div id="small" class="size"></div>
            <div id="medium" class="size"></div>
            <div id="big" class="size"></div>
        </div>
        <input type="text" placeholder="Custom brush size">
        <div id="colorPicker">
            <input type="color" value="#000002">
        </div>
        <div id="saveEdits">
            Save
        </div>`

    startDrawing();
    drawingTools(idx);
}

function startDrawing(){
    const C = document.querySelector('canvas');
    const CTX = C.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    C.width = window.innerWidth;
    C.height = window.innerHeight;
    CTX.lineJoin = "round";
    CTX.lineCap = "round"
    CTX.lineWidth = '5';

    function drawing(e){
        if(!isDrawing) return;
        CTX.beginPath();
        CTX.moveTo(lastX, lastY);
        CTX.lineTo(e.offsetX, e.offsetY);
        CTX.stroke();
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    C.addEventListener('mousedown', (e) => {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    });

    C.addEventListener('mousemove', drawing);
    C.addEventListener('mouseup', () => isDrawing = false);
    C.addEventListener('mouseout', () => isDrawing = false);
}

function brush(target, CTX){
    document.querySelectorAll('.drawingTool').forEach(tool => tool.style.backgroundColor = 'transparent');
    target.nodeName === 'IMG' ? target.parentNode.style.backgroundColor = '#1d1d1d' : target.style.backgroundColor = '#1d1d1d';
    CTX.globalCompositeOperation="source-over";
}

function eraser(target, CTX){
    document.querySelectorAll('.drawingTool').forEach(tool => tool.style.backgroundColor = 'transparent');
    target.nodeName === 'IMG' ? target.parentNode.style.backgroundColor = '#1d1d1d' : target.style.backgroundColor = '#1d1d1d';
    CTX.globalCompositeOperation="destination-out";
}

function changeBrushSize(target, size, CTX){
    clearSizeDots();
    target.style.border = '5px solid #1d1d1d';
    document.querySelector('#brushBox input').value = '';
    CTX.lineWidth = size;
}

function customBrushSize(CTX){
    CTX.lineWidth = document.querySelector('#brushBox input').value;
    clearSizeDots();
}

function clearSizeDots(){
    document.querySelectorAll('.size').forEach(size => size.style.border = '5px solid #fff');
}

function saveDrawingEdits(idx){
    let drawing;
    editedVideo.forEach(edit => {
        if(edit.type === 'drawing' && edit.id === idx){
            edit.src = document.querySelector('canvas').toDataURL();
        }
    });

    document.querySelector('canvas').remove();


    document.querySelector('#brushBox').className = 'simpleTool';
    document.querySelector('#brushBox').style.justifyContent = 'center';

    document.querySelector('#brushBox').innerHTML = 
        `<p>Now move video to the point where your drawing should disapear</p>
         <div id="saveEdits">Save</div>`;

    document.querySelector('#saveEdits').addEventListener('click', saveDrawing);
}

function drawingTools(idx){
    const C = document.querySelector('canvas');
    const CTX = C.getContext('2d');
    
    document.querySelector('#colorPicker input').addEventListener('change', () => CTX.strokeStyle = document.querySelector('#colorPicker input').value);

    document.querySelector('#brushTool').addEventListener('click', e => brush(e.target, CTX));

    document.querySelector('#eraserTool').addEventListener('click', e => eraser(e.target, CTX));

    document.querySelector('#small').addEventListener('click', e => changeBrushSize(e.target, '5', CTX));

    document.querySelector('#medium').addEventListener('click', e => changeBrushSize(e.target, '10', CTX));

    document.querySelector('#big').addEventListener('click', e => changeBrushSize(e.target, '20', CTX));

    document.querySelector('#brushBox input').addEventListener('change', () => customBrushSize(CTX));

    document.querySelector('#saveEdits').addEventListener('click', () => saveDrawingEdits(idx));
}

function saveDrawing(){
    editedVideo.forEach(edit => {
        if(edit.type === actuallyEdited.type && edit.id === actuallyEdited.id){
            markArea('brushColor', edit.id);
            connectMarks('brushColor', edit.id);

            edit.endPoint = playBox.getCurrentTime();

            if(window.screen.width >= 1600){
                document.querySelector("#markerContainer") !== null ? document.querySelector("#markerContainer").style.width = "83%" : null;
            }
            else{
                document.querySelector("#markerContainer") !== null ? document.querySelector("#markerContainer").style.width = "75%" : null;
            }
           
            document.querySelector('#player').style.position = 'static';
            document.querySelector('#player').style.width = '100%';
            document.querySelector('#brushBox').remove();
            document.querySelector('#goBack').remove();
        }
    });
}

function createImagePopup(){
    let img = {
        type: 'img',
        id: counters.imgCounter,
        src: null,
        draggable: false,
        styling:{
            width: 0,
            height: 0,
            opacity: 0,
            rotate: 0,
            top:0,
            left:0
        },
        startPoint: playBox.getCurrentTime(),
        endPoint: null,
        header: 'Adding image',
        instructions: "Paste URL to your image",
        addidions: ""
    };

    return img;
}

function createSoundPopup(){
    let sound = {
        type: 'sound',
        id: counters.soundCounter,
        src: null,
        startPoint: playBox.getCurrentTime(),
        endPoint: null,
        header: 'Adding sound',
        instructions: "Paste URL to your sound",
        addidions: ""
    };

    return sound;
}

function createVideoPopup(){
    let vid = {
        type: 'video',
        id: counters.videoCounter,
        src: null,
        styling:{
            width: 0,
            height: 0,
            rotate: 0,
            top:500,
            left:500
        },
        startPoint: playBox.getCurrentTime(),
        endPoint: null,
        header: 'Adding video',
        instructions: "Paste URL to your video",
        addidions: ""
    };

    return vid;
}

function addMedia(type, media){
    if(document.querySelector('#addUrl input').value !== undefined){
        media.src = document.querySelector('#addUrl input').value;
        editedVideo.push(media);

        if(type === 'img'){
            counters.imgCounter++;
            stylingImg(media.id);
            
        }
        else if(type === 'sound'){
            counters.soundCounter++;
            addingSound(media.id);
        }
        else if(type === 'video'){
            counters.videoCounter++;
            addingVideo(media.id);
        }

        closePopup();
    }
}

function createPopup(type){
    const popup = document.createElement('div');
    const overlayer = document.createElement('div');
    let media;

    overlayer.id = 'overlayer';
    popup.id = 'popup';
    if(document.querySelector("#overlayer") === null && document.querySelector("#popup") === null){
        document.body.append(overlayer, popup);
    }
    document.body.style.overflowY = 'hidden';

    if(type === 'img'){
        media = createImagePopup();
    }
    else if(type === 'sound'){
        media = createSoundPopup();
    }
    else if(type === 'video'){
        media = createVideoPopup();
    }

    popup.innerHTML = 
        `<div id="closePopup">
            <img src='../img/close.png'>
         </div>
         <h1>${media.header}</h1>
         <div id="flexPositioner">
            <div>
                <p>${media.instructions}</p>
            </div>
            <div id="addData">
                ${media.addidions}
                <div id="addUrl">
                    <input type="text">
                </div>
            </div>
            <div id="addMediaBtn">
                Add ${media.type === 'img' ? 'image' : media.type}
            </div>
         </div>
        `;

    document.querySelector('#closePopup').addEventListener('click', closePopup);
    document.querySelector('#addMediaBtn').addEventListener('click', () => addMedia(type, media));
}

function createText(idx){
    const textBox = document.createElement('div');
    let text = {
        type: 'text',
        id: counters.textCounter,
        startPoint: playBox.getCurrentTime(),
        endPoint: null,
        text: '',
        draggable: false,
        styling:{
            color: '',
            background: '',
            top: '',
            left: '',
            fontSize: ''
        }
    }

    editedVideo.push(text);
    actuallyEdited = text;
    textBox.id = 'textBox';
    document.body.appendChild(textBox);

    stylingPlayer();
    markArea('colorText', text.id);
    createAddedText(counters.textCounter);
    counters.textCounter++;
}

function createTextToolBox(){
    document.querySelector('#textBox').innerHTML =
        `<div id='ownTextBox'>Your's text:<input type='text' id='textInput' value='Lorem Ispum'></div>
     <div id="textSize">
        Text size:
        <input type="number" id="textSizeInput" min="1" max="100" value="20">
     </div>
     <div id="textBackground">
        Text background:
        <input type="color" value="#000002">
     </div>
     <div id="textColor">
        Text color:
        <input type="color" value="#fdffff">
     </div>
     <div id="textEndPoint">
        <div id="saveEdits">
            Save
        </div>
     </div>`
}

function changeTextBackground(rgbStr){
    let rgbColor = hexToRgb(document.querySelector('#textBackground input').value);
    rgbStr = `rgba(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]}, 0.8)`;
    document.querySelector('#videoText').style.background = rgbStr;
}

function changeTextColor(){
    document.querySelector('#videoText').style.color = document.querySelector('#textColor input').value;
}

function changeTextSize(key){
    if(key === 13){
        document.querySelector('#videoText').style.fontSize = `${document.querySelector('#textSizeInput').value}px`;
    }
}

function typeText(key){
    if(key === 13){
        document.querySelector('#videoText').textContent = document.querySelector('#textInput').value
    }
}

function saveTextEdits(rgbStr){
    editedVideo.forEach(edit => {
        if (edit.id === actuallyEdited.id && edit.type === actuallyEdited.type) {
            edit.text = document.querySelector('#textInput').value;
            edit.styling.color = document.querySelector('#textColor input').value;
            edit.styling.background = rgbStr;
            edit.styling.top = document.querySelector('#videoText').style.top;
            edit.styling.left = document.querySelector('#videoText').style.left;
            edit.styling.fontSize = `${document.querySelector('#textSizeInput').value}px`;
            pickEndOfText(edit);
        }
    });
}

function textStyling(own){
    let rgbStr;

    addGoBackButton(removeVideoBox);
    createTextToolBox();
    
    document.querySelector('#textInput').addEventListener('keydown', e => typeText(e.keyCode));
    document.querySelector('#textSize').addEventListener('keydown', e => changeTextSize(e.keyCode));
    document.querySelector('#textBackground input').addEventListener('change', () => changeTextBackground(rgbStr));
    document.querySelector('#textColor input').addEventListener('change', changeTextColor);
    document.querySelector('#saveEdits').addEventListener('click', () => saveTextEdits(rgbStr));
}

function removeVideoBox(){
    document.querySelector('#videoText') !== null ? document.querySelector('#videoText').remove() : null;
    document.querySelector('#textBox') !== null ? document.querySelector('#textBox').remove() : null;
}

function saveTextEndPoint(edit){
    markArea('colorText', edit.id);
    connectMarks('colorText', edit.id);

    document.querySelector('#goBack').remove();
    edit.endPoint = playBox.getCurrentTime();
    document.querySelector('#textBox').remove();

    if(window.screen.width >= 1600){
        document.querySelector("#markerContainer") !== null ? document.querySelector("#markerContainer").style.width = "81%" : null;
    }
    else{
        document.querySelector("#markerContainer") !== null ? document.querySelector("#markerContainer").style.width = "75%" : null;
    }
    
    document.querySelector('#player').style.width = "100%";
    document.querySelector('#player').style.position = 'static';
}

function pickEndOfText(edit){
    document.querySelector('#textBox').style.justifyContent = 'center';
    document.querySelector('#textBox').style.width = '15%'
    document.querySelector('#textBox').innerHTML = '<p>Move video to the point where your text should disapear</p><div id="saveEdits">Save</div>';

    document.querySelector('#videoText').remove();
    document.querySelector('#saveEdits').addEventListener('click', () => saveTextEndPoint(edit));
}

function hexToRgb (hex) {
    "use strict";
    if (hex.charAt(0) === '#') {
        hex = hex.substr(1);
    }
    if ((hex.length < 2) || (hex.length > 6)) {
        return false;
    }
    let values = hex.split(''),
        r,
        g,
        b;

    if (hex.length === 2) {
        r = parseInt(values[0].toString() + values[1].toString(), 16);
        g = r;
        b = r;
    } else if (hex.length === 3) {
        r = parseInt(values[0].toString() + values[0].toString(), 16);
        g = parseInt(values[1].toString() + values[1].toString(), 16);
        b = parseInt(values[2].toString() + values[2].toString(), 16);
    } else if (hex.length === 6) {
        r = parseInt(values[0].toString() + values[1].toString(), 16);
        g = parseInt(values[2].toString() + values[3].toString(), 16);
        b = parseInt(values[4].toString() + values[5].toString(), 16);
    } else {
        return false;
    }
    return [r, g, b];
}

function makeTextDraggable(e, text){
    if(document.querySelector('#videoText') !== null){
        e.preventDefault();
        document.querySelector('#videoText').style.border = '1px dashed #fff';
        text.draggable = true
    }
}

function stopTextBeingDraggable(text){
    document.querySelector('#videoText').style.border = 'none';
    text.draggable = false
}

function movingText(e, text){
    if(text.draggable === true && document.querySelector('#videoText') !== null){
        e.preventDefault();
        document.querySelector('#videoText').style.top = `${calculatePercentage(e.clientY, window.innerHeight)}`;
        document.querySelector('#videoText').style.left = `${calculatePercentage(e.clientX, window.innerWidth)}`;
    }
}

function createAddedText(textID){
    let text;

    textStyling();
    createVideoText();

    editedVideo.forEach(edit => {
        if(edit.type === 'text' && edit.id === textID){
            text = edit;
        }
    });

    document.querySelector('#videoText').className = 'noSelect';
    document.querySelector('#videoText').addEventListener('mousedown', e => makeTextDraggable(e, text));
    document.querySelector('#videoText').addEventListener('mouseup', () => stopTextBeingDraggable(text));
    document.querySelector('#videoText').addEventListener('mouseleave', () => stopTextBeingDraggable(text));
    document.addEventListener('mousemove', e => movingText(e, text));
}

function createVideoText(){
    const videoText = document.createElement('div');
    videoText.id = 'videoText';
    videoText.textContent = document.querySelector('#textInput').value;
    videoText.style.fontSize = document.querySelector('#textSizeInput').value;

    document.body.appendChild(videoText);
}

function saveSoundEdits(idx){
    document.querySelector('#goBack').remove();
    editedVideo.forEach( edit => {
        if(edit.id === idx && edit.type === 'sound'){
            edit.endPoint = playBox.getCurrentTime();

            document.querySelector('#player').style.position = 'static';
            document.querySelector('#player').style.width = "100%";
            document.querySelector('#player').style.height = "100%";
            
            if(window.screen.width >= 1600){
                document.querySelector("#markerContainer") !== null ? document.querySelector("#markerContainer").style.width = "83%" : null;
            }
            else{
                document.querySelector("#markerContainer") !== null ? document.querySelector("#markerContainer").style.width = "75%" : null;
            }

            document.querySelector('#audioBox').remove();

            markArea('soundColor', edit.id);
            connectMarks('soundColor', edit.id);
        }
    });
}

function addingSound(idx){
    let audio = new Audio();
    let audioBox = document.createElement('div');

    audioBox.className = 'simpleTool'
    audioBox.id = 'audioBox';
    audioBox.innerHTML = '<p>Move video to the point where sound should stop playing</p><div id="saveEdits">Save</div>'
    
    document.body.appendChild(audioBox)

    addGoBackButton(removeAudioBox);

    editedVideo.forEach( edit => {
        if(edit.id === idx && edit.type === 'sound'){
            audio.src = edit.src;
            markArea('soundColor', edit.id);
        }
    });
    
    document.querySelector('#saveEdits').addEventListener('click', () => saveSoundEdits(idx));

    stylingPlayer();
}

function removeAudioBox(){
    document.querySelector('#audioBox').remove();
}

function addGoBackButton(fnc){
    const goBack = document.createElement('div');
    goBack.id = 'goBack';
    goBack.innerHTML = `<img src='../img/goBack.png'>`;

    document.querySelector("#goBack") === null ? document.body.appendChild(goBack) : null;
    goBackEventListner(fnc);
}

function goBackEventListner(fnc){
    document.querySelector('#goBack').addEventListener('click', () => {
        fnc();
        goBackFnc();
    });
}

function goBackFnc(){
    document.querySelector('#player').style.position = 'static';
    document.querySelector('#player').style.width = "100%";
    document.querySelector('#player').style.height = "100%";

    document.querySelector('#goBack') !== null ? document.querySelector('#goBack').remove() : null;

    if(document.querySelector(".marker") !== null){
        if(document.querySelectorAll('.marker')[document.querySelectorAll('.marker').length - 1] !== null && actuallyEdited.type !== "link" && !watching){
            document.querySelectorAll('.marker')[document.querySelectorAll('.marker').length - 1].remove();  
        }
    }
  
    watching = false;
}

function createVideoManipulation(){
    document.querySelector('#videoBox').innerHTML =
        `<div id="sizeUp" class="tool">
            <img src='../img/changeSize.png'>
        </div>
        <div id="sizeDown" class="tool">
            <img src='../img/changeSizeBottom.png'>
        </div>
        <div id="heightUp" class="tool">
            <img src='../img/arrowUp.png'>
        </div>
        <div id="heightBottom" class="tool">
            <img src='../img/arrowDown.png'>
        </div>
        <div id="widthUp" class="tool">
            <img src='../img/arrowRight.png'>
        </div>
        <div id="widthBottom" class="tool">
            <img src='../img/arrowLeft.png'>
        </div>`;
}

function addingVideo(idx){
    let video = document.createElement('iframe');
    let videoRepresentation;

    editedVideo.forEach( edit => {
        if(edit.id === idx && edit.type === 'video'){
            actuallyEdited = edit;
            videoRepresentation = edit;
            edit.src = edit.src.replace('watch?v=', 'embed/');
            edit.styling.width = '250';
            edit.styling.height = '150';
            edit.styling.top = `${window.innerHeight / 2}px`
            edit.styling.left = `${window.innerWidth / 2}px`
            video.style.top = `${window.innerHeight / 2}px`;
            video.style.left = `${window.innerWidth / 2}px`;
            video.src = edit.src;
            markArea('videoColor', edit.id)
        }
    });
    
    video.id = 'addedVideo';
    video.width = videoRepresentation.styling.width;
    video.height = videoRepresentation.styling.height;

    document.body.appendChild(video);

    stylingPlayerForMedia();
    createVideoBox();
    createVideoManipulation();
    videoTools(videoRepresentation.id);
}

function createVideoBox() {
    const firstDiv = document.createElement('div');
    firstDiv.id = 'videoStyleBox';
    firstDiv.dataset.direction = 'left';

    for (let i = 0; i < 6; i++) {
        const newDiv = document.createElement('div');
        const img = new Image();
        switch (i) {
            case 0:
                img.src = '../img/changeSide.png';
                newDiv.id = 'switchSides';
                newDiv.appendChild(img);
                break;
            case 1:
                img.src = '../img/hide.png';
                newDiv.id = 'hideToolBox';
                newDiv.dataset.visible = 'visible';
                newDiv.appendChild(img);
                break;
            case 2:
                newDiv.id = 'videoBox';
                break;
            case 3:
                newDiv.classList.add('videoSize', 'videoTool');
                newDiv.innerHTML =
                    `Width:
                         <input id="videoWidth" type="text" placeholder="Width (values in px)" value="${document.querySelector('#addedVideo').width}">`
                break;
            case 4:
                newDiv.classList.add('videoSize', 'videoTool');
                newDiv.innerHTML =
                    `Height:
                         <input id="videoHeight" type="text" placeholder="Height (values in px)" value="${document.querySelector('#addedVideo').height}">`
                break;
            case 5:
                newDiv.id = 'saveEdits';
                newDiv.textContent = 'Save edits';
                break;
        }

        firstDiv.appendChild(newDiv);
    }

    document.body.appendChild(firstDiv);
    createVideoTools();
    addGoBackButton(removeVideo);
}

function createVideoTools(){
    createVideoManipulation();
    addGoBackButton(removeVideo);
        
    document.querySelector('#switchSides').addEventListener('click', () => switchToolBoxSide('videoStyleBox'));
    
    document.querySelector('#hideToolBox').addEventListener('click', () => hideToolBox('videoStyleBox'));

    document.querySelector('#videoWidth').addEventListener('keydown', (e) => typedWidthVideo(e.keyCode));

    document.querySelector('#videoHeight').addEventListener('keydown', (e) => typedHeightVideo(e.keyCode));

    document.querySelector('#saveEdits').addEventListener('click', saveEditedVideo);

    document.addEventListener('mouseup', stopVideoAnimation);
}

function removeVideo(){
    document.querySelector('#videoStyleBox') !== null ? document.querySelector('#videoStyleBox').remove() : null;
    document.querySelector('#addedVideo') !== null ? document.querySelector('#addedVideo').remove() : null;
}

function saveEditedVideo(edit){
        editedVideo.forEach( edit => {
            if(edit.type === actuallyEdited.type && edit.id === actuallyEdited.id){
                edit.styling.width = Number(document.querySelector('#videoWidth').value);
                edit.styling.height = Number(document.querySelector('#videoHeight').value);
                edit.styling.top = document.querySelector('#addedVideo').style.top;
                edit.styling.left = document.querySelector('#addedVideo').style.left;
                
                document.querySelector('#videoStyleBox').innerHTML =
                    `<p>
                        Now move video to the point where your video should disapear 
                     </p>
                     <div id="saveEdits">Save</div>`;
                
                document.querySelector('#videoStyleBox').style.width = '20%';
    
                document.querySelector('#saveEdits').addEventListener('click', () => saveVideoEndPoint(edit));
            }
        });
}

function saveVideoEndPoint(edit){
    edit.endPoint = playBox.getCurrentTime();

    markArea('videoColor', edit.id);
    connectMarks('videoColor', edit.id);

    if(window.screen.width >= 1600){
        document.querySelector("#markerContainer") !== null ? document.querySelector("#markerContainer").style.width = "83%" : null;
    }
    else{
        document.querySelector("#markerContainer") !== null ? document.querySelector("#markerContainer").style.width = "75%" : null;
    }

    document.querySelector('#addedVideo').remove();
    document.querySelector('#goBack').remove();
    document.querySelector('#player').style.position = 'static';
    document.querySelector('#videoStyleBox').remove();
} 

function stopVideoAnimation(){
    changeSize !== null ? clearInterval(changeSize) : null;
    rotateInt !== null ? clearInterval(rotateInt) : null;
}

function typedRotateVideo(key){
    if(key === 13){
        document.querySelector('#addedVideo').style.transform = `translate(-50%, -50%) rotate(${document.querySelector('#videoRotate input').value}deg)`;
    }
}

function typedWidthVideo(key){
    if(key === 13){
        document.querySelector('#addedVideo').width = document.querySelector('#videoWidth').value;
    }
}

function typedHeightVideo(key){
    if(key === 13){
        document.querySelector('#addedVideo').height = document.querySelector('#videoHeight').value;
    }
}

function createVideoOverlayer(vid){
    const overlayer = document.createElement('div');

    overlayer.id = 'videoOverlayer';
    document.querySelector('#videoOverlayer') === null ? document.body.appendChild(overlayer) : null;

    overlayer.style.width = `${document.querySelector('#addedVideo').width}px`;
    overlayer.style.height = `${document.querySelector('#addedVideo').height}px`;
    overlayer.style.top = document.querySelector('#addedVideo').style.top;
    overlayer.style.left = document.querySelector('#addedVideo').style.left;
    videoOverlayer.rotate > 0 ? overlayer.style.transform = `rotate(${videoOverlayer.rotate}deg)` : null;

    document.querySelector('#videoOverlayer').addEventListener('mouseout', () => removeVideoOverlayer(vid));
    document.querySelector('#videoOverlayer').addEventListener('mousedown', () => vid.draggable = true);

    document.addEventListener('mouseup', () => vid.draggable = false);
}

function removeVideoOverlayer(vid){
    if(document.querySelector('#videoOverlayer') !== null){
        document.querySelector('#videoOverlayer').remove();
    }

    vid.draggable = false;
}

function videoTools(videoID){
    let vid;

    editedVideo.forEach(edit => {
        if(edit.type === 'video' && edit.id === videoID){
            vid = edit;
        }
    });

    document.querySelector('#addedVideo').addEventListener('mouseover', () => createVideoOverlayer(vid));
    document.addEventListener('mousemove', e => moveVideo(e, vid));

    document.querySelector('#sizeUp').addEventListener('mousedown', () => changeSize = setInterval(() => changeBothVidSize('up'), 1000 / 60));
    document.querySelector('#sizeDown').addEventListener('mousedown', () => changeSize = setInterval(() => changeBothVidSize('down'), 1000 / 60));
    document.querySelector('#sizeUp').addEventListener('mouseup', () => clearInterval(changeSize));
    document.querySelector('#sizeUp').addEventListener('mouseleave', () => clearInterval(changeSize));
    document.querySelector('#sizeDown').addEventListener('mouseup', () => clearInterval(changeSize));

    document.querySelector('#heightUp').addEventListener('mousedown', () => changeSize = setInterval(() => changeVidSize('height', 'up'), 1000 / 60));
    document.querySelector('#heightBottom').addEventListener('mousedown', () => changeSize = setInterval(() => changeVidSize('height', 'bottom'), 1000 / 60));
    document.querySelector('#widthUp').addEventListener('mousedown', () => changeSize = setInterval(() => changeVidSize('width', 'up'), 1000 / 60));
    document.querySelector('#widthBottom').addEventListener('mousedown', () => changeSize = setInterval(() => changeVidSize('width', 'bottom'), 1000 / 60));

    document.querySelector('#heightUp').addEventListener('mouseup', () => clearInterval(changeSize));
    document.querySelector('#heightBottom').addEventListener('mouseup', () =>  clearInterval(changeSize));
    document.querySelector('#widthUp').addEventListener('mouseup', () =>  clearInterval(changeSize));
    document.querySelector('#widthUp').addEventListener('mouseleave', () =>  clearInterval(changeSize));
    document.querySelector('#widthBottom').addEventListener('mouseup', () =>  clearInterval(changeSize));
}

function changeVidSize(size, type){
    let vid = document.querySelector('#addedVideo');
    let ov;
    
    if( Number(vid[size]) <= 20 && type !== 'up'){
        return;
    }

    if(document.querySelector('#videoOverlayer') === null){
        ov = document.createElement('div');
        ov.id = 'videoOverlayer'
    }
    else{
        ov = document.querySelector('#videoOverlayer');
    }

    if(type === 'up'){
        ov[size] = Number(ov[size]) + 10;
        vid[size] = Number(vid[size]) + 10;
    }
    else{
        vid[size] = Number(vid[size]) - 10;
        ov[size] = Number(ov[size]) - 10;
    }

    document.querySelector(`#video${size[0].toUpperCase() + size.slice(1, )}`).value = Math.round(Number(vid[size]));
}

function changeBothVidSize(type){
    let vid = document.querySelector('#addedVideo');
    let ov;

    if( (Number(vid.width) <= 20 || Number(vid.height) <= 20) && type !== 'up'){
        return;
    }

    if(document.querySelector('#videoOverlayer') === null){
        ov = document.createElement('div');
        ov.id = 'videoOverlayer'
    }
    else{
        ov = document.querySelector('#videoOverlayer');
    }

    if(type === 'up'){
        vid.width = Number(vid.width) + Number(vid.width) / 10;
        vid.height = Number(vid.height) + Number(vid.height) / 10;

        ov.width = Number(vid.width) + Number(vid.width) / 10;
        ov.height = Number(ov.height) + Number(ov.height) / 10;
    }
    else{
        vid.width = Number(vid.width) - Number(vid.width) / 10;
        vid.height = Number(vid.height) - Number(vid.height) / 10;
        
        ov.width = Number(vid.width) - Number(vid.width) / 10;
        ov.height = Number(ov.height) - Number(ov.height) / 10;
    }

    document.querySelector(`#videoWidth`).value = Math.round(Number(vid.width));
    document.querySelector(`#videoHeight`).value = Math.round(Number(vid.height));
}

function moveVideo(e, vid){
    if(vid.draggable === true){
        e.preventDefault();

        document.querySelector('#addedVideo').style.top = `${calculatePercentage(e.clientY, window.innerHeight)}`;
        document.querySelector('#addedVideo').style.left = `${calculatePercentage(e.clientX, window.innerWidth)}`;

        document.querySelector('#videoOverlayer').style.top = document.querySelector('#addedVideo').style.top
        document.querySelector('#videoOverlayer').style.left = document.querySelector('#addedVideo').style.left;
    }
}

function makeImgDraggable(id, e, imgRepresentation){
    e.preventDefault();
    imgRepresentation.draggable = true;
    moveImg(id);
}

function stylingImg(id){
    const img = document.createElement('img');
    let imgRepresentation;
    let startPoint;
    let idx;

    editedVideo.forEach(edit => {
        if(edit.type === 'img'){
            if(edit.id === id){
                imgRepresentation = edit;
            }
        }
    });

    startPoint = imgRepresentation.startPoint;
    idx = imgRepresentation.id;
    img.src = imgRepresentation.src;

    stylingPlayerForMedia();
    markArea('imgColor', imgRepresentation.id);

    img.id = 'editedImg';
    document.body.appendChild(img);
    playBox.pauseVideo();
    img.onload = () => {
        img.width = img.width;
        img.height = img.height;
        actuallyEdited = {
            type: 'img',
            id: idx
        };

        createImgStyleBox();

        document.querySelector('#editedImg').addEventListener('mousedown', (e) => makeImgDraggable(id, e, imgRepresentation));
        document.querySelector('#editedImg').addEventListener('mouseup', () => imgRepresentation.draggable = false);
        
        document.querySelector('#editedImg').style.left = `50%`;
        document.querySelector('#editedImg').style.top = `50%`;
    }  
}

function imageManipulation(){
    document.querySelector('#rotateImage').addEventListener('mousedown', () => rotateInt = setInterval(() => imageRotating('right'), 1000 / 60));
    
    document.querySelector('#rotateReverseImage').addEventListener('mousedown', () => rotateInt = setInterval(() => imageRotating('left'), 1000 / 60));

    document.querySelector('#changeSize').addEventListener('mousedown', () => changeImageSize('up'));

    document.querySelector('#changeSize').addEventListener('mouseleave', () => clearInterval(changeSize));

    document.querySelector('#changeSizeBottom').addEventListener('mousedown', () => changeImageSize('bottom'));

    document.querySelector('#changeHeightUp').addEventListener('mousedown', () => startChangingSize('height', 'up'));

    document.querySelector('#changeHeightDown').addEventListener('mousedown', () => startChangingSize('height', 'down'));

    document.querySelector('#changeWidthUp').addEventListener('mousedown', () => startChangingSize('width', 'up'));

    document.querySelector('#changeWidthUp').addEventListener('mouseleave', () => clearInterval(changeSize));

    document.querySelector('#changeWidthDown').addEventListener('mousedown', () => startChangingSize('width', 'down'));
}

function createImgStyleBox(){
    const firstDiv = document.createElement('div');
    firstDiv.id = 'imgStyleBox';
    firstDiv.dataset.direction = 'left';

    for(let i = 0; i < 8; i++){
        const newDiv = document.createElement('div');
        const img = new Image();
        switch(i){
            case 0:
                img.src = '../img/changeSide.png';
                newDiv.id = 'switchSides';
                newDiv.appendChild(img);
                break;
            case 1:
                img.src = '../img/hide.png';
                newDiv.id = 'hideToolBox';
                newDiv.dataset.visible = 'visible';
                newDiv.appendChild(img);
                break;
            case 2:
                newDiv.id = 'imgManipulation';
                break;
            case 3:
                newDiv.classList.add('imgSize', 'imgTool');
                newDiv.innerHTML = 
                    `Width:
                     <input id="imgWidth" type="text" placeholder="Width (values in px)" value="${document.querySelector('#editedImg').width}">`
                break;
            case 4:
                newDiv.classList.add('imgSize', 'imgTool');
                newDiv.innerHTML = 
                    `Height:
                     <input id="imgHeight" type="text" placeholder="Height (values in px)" value="${document.querySelector('#editedImg').height}">`
                break;
            case 5:
                newDiv.id = 'imgOpacity';
                newDiv.className = 'imgTool';
                newDiv.innerHTML = 
                    `Opacity:
                     <input type="text" placeholder="Value between 0 and 100" value="100">`
                break;
            case 6:
                newDiv.id = 'imgRotate';
                newDiv.className = 'imgTool';
                newDiv.innerHTML = 
                    `Rotate:
                     <input type="text" placeholder="Value between 0-360" value="0">`;
                break;
            case 7:
                newDiv.id = 'saveEdits';
                newDiv.textContent = 'Save edits';
                break;
        }

        firstDiv.appendChild(newDiv);
    }

    document.body.appendChild(firstDiv);
    createImageManipulation();
    createImgTools();
}

function createImageManipulation(){
    document.querySelector('#imgManipulation').innerHTML = 
        `<div id="changeSize">
            <img src='../img/changeSize.png'>
        </div>
        <div id="changeSizeBottom">
            <img src='../img/changeSizeBottom.png'>
        </div>
        <div id="changeHeightUp">
            <img src='../img/arrowUp.png'>
        </div>
        <div id="changeHeightDown">
            <img src='../img/arrowDown.png'>
        </div>
        <div id="changeWidthUp">
            <img src='../img/arrowRight.png'>
        </div>
        <div id="changeWidthDown">
            <img src='../img/arrowLeft.png'>
        </div>
        <div id="rotateImage">
            <img src='../img/rotate.png'>
        </div>
        <div id="rotateReverseImage">
            <img src='../img/rotateReverse.png'>
        </div>`
}

function switchToolBoxSide(boxID){
    let box = document.querySelector(`#${boxID}`);
    if(box.dataset.direction === 'right'){
        box.dataset.direction = 'left';
        box.style.left = '0%';
        box.style.right = 'auto';
    }
    else{
        box.dataset.direction = 'right';
        box.style.right = '0%';
        box.style.left = 'auto';
    }
}

function hideToolBox(boxID){
    const box = document.createElement('div');
    const img = new Image();

    box.id = 'hideTool';
    box.appendChild(img);

    img.src = '../img/hide.png';

    document.body.appendChild(box);

    document.querySelector(`#${boxID}`).dataset.direction === 'right' ? document.querySelector('#hideTool').style.left = '90%' : document.querySelector('#hideTool').style.left = '7%';
    document.querySelector(`#${boxID}`).remove();

    document.querySelector('#hideTool').addEventListener('click', () => removeHideTool(boxID));
    addGoBackButton(removeVideo);
}

function removeHideTool(boxID){
    document.querySelector('#hideTool').remove();
    boxID.includes('video') ? createVideoBox() : createImgStyleBox();
}

function typedRotateImage(key){
    if(key === 13){
        document.querySelector('#editedImg').style.transform = `translate(-50%, -50%) rotate(${document.querySelector('#imgRotate input').value}deg)`;
    }
}

function typedOpacityImage(key){
    if(key === 13){
        document.querySelector('#editedImg').style.opacity = Number(document.querySelector('#imgOpacity input').value) / 100;
    }
}

function typedWidthImage(key){
    if(key === 13){
        document.querySelector('#editedImg').width = document.querySelector('#imgWidth').value;
    }
}

function typedHeightImage(key){
    if(key === 13){
        document.querySelector('#editedImg').height = document.querySelector('#imgHeight').value;
    }
}

function stopImageAnimations(){
    changeSize !== null ? clearInterval(changeSize) : null;
    rotateInt !== null ? clearInterval(rotateInt) : null;
}

function createImgTools(){
    imageManipulation();
    addGoBackButton(removeImage);
        
    document.querySelector('#switchSides').addEventListener('click', () => switchToolBoxSide('imgStyleBox'));
    
    document.querySelector('#hideToolBox').addEventListener('click', () => hideToolBox('imgStyleBox'));

    document.querySelector('#imgRotate input').addEventListener('keydown', (e) => typedRotateImage(e.keyCode));

    document.querySelector('#imgOpacity input').addEventListener('keydown', (e) => typedOpacityImage(e.keyCode));

    document.querySelector('#imgWidth').addEventListener('keydown', (e) => typedWidthImage(e.keyCode));

    document.querySelector('#imgHeight').addEventListener('keydown', (e) => typedHeightImage(e.keyCode));

    document.querySelector('#saveEdits').addEventListener('click', saveEditedImage);

    document.addEventListener('mouseup', stopImageAnimations);
}

function removeImage(){
    document.querySelector('#editedImg') !== null ? document.querySelector('#editedImg').remove() : null;
    document.querySelector('#imgManipulation') !== null ? document.querySelector('#imgManipulation').remove() : null;
    document.querySelector('#imgStyleBox') !== null ? document.querySelector('#imgStyleBox').remove() : null;
}

function saveEditedImage(){
    editedVideo.forEach( edit => {
        if(edit.type === actuallyEdited.type && edit.id === actuallyEdited.id){
            edit.styling.width = Number(document.querySelector('#imgWidth').value);
            edit.styling.height = Number(document.querySelector('#imgHeight').value);
            edit.styling.opacity = Number(document.querySelector('#imgOpacity input').value);
            edit.styling.rotate = Number(document.querySelector('#imgRotate input').value);
            edit.styling.top = document.querySelector('#editedImg').style.top;
            edit.styling.left = document.querySelector('#editedImg').style.left;
            
            document.querySelector('#imgStyleBox').innerHTML =
                `<p>
                    Now move video to the point where your image should disapear 
                 </p>
                 <div id="saveEdits">Save</div>`;
            
            document.querySelector('#imgStyleBox').style.width = '20%';
            document.querySelector("#goBack").remove();
            document.querySelector('#saveEdits').addEventListener('click', () => saveImageEndPoint(edit));
        }
    });
}

function saveImageEndPoint(edit){
    edit.endPoint = playBox.getCurrentTime();

    markArea('imgColor', edit.id);
    connectMarks('imgColor', edit.id);
    
    if(window.screen.width >= 1600){
        document.querySelector("#markerContainer") !== null ? document.querySelector("#markerContainer").style.width = "83%" : null;
    }
    else{
        document.querySelector("#markerContainer") !== null ? document.querySelector("#markerContainer").style.width = "75%" : null;
    }

    document.querySelector('#player').style.position = 'static';
    document.querySelector('#imgStyleBox').remove();
    document.querySelector('#editedImg').remove();
}

function imgToDataURL(source){
    let C = document.createElement('canvas')
    let CTX = C.getContext('2d');
    let img = new Image();

    img.src = source;
    img.onload = () => CTX.drawImage(img, 0, 0);

    return C.toDataURL();
}

function imageRotating(type){
    type === 'right' ? document.querySelector('#editedImg').style.transform = `translate(-50%, -50%) rotate(${imgRotate += 1}deg)` : document.querySelector('#editedImg').style.transform = `translate(-50%, -50%) rotate(${imgRotate -= 1}deg)`;
    document.querySelector('#imgRotate input').value = imgRotate + 'deg';
}

function changeImageSize(type){
    changeSize = setInterval(() => {
        if(type === 'up'){
            document.querySelector('#editedImg').width += document.querySelector('#editedImg').width / 10;
            document.querySelector('#editedImg').height += document.querySelector('#editedImg').height / 10;
        }
        else if(type === 'bottom'){
            if(document.querySelector('#editedImg').width < 2 || document.querySelector('#editedImg').height < 2){
                return;
            }

            document.querySelector('#editedImg').width -= document.querySelector('#editedImg').width / 10;
            document.querySelector('#editedImg').height -= document.querySelector('#editedImg').height / 10;
        }

        document.querySelector('#imgHeight').value = document.querySelector('#editedImg').height;
        document.querySelector('#imgWidth').value = document.querySelector('#editedImg').width;

    }, 1000 / 60);
}

function startChangingSize(size, type) {
    changeSize = setInterval(() => {
        if (type === 'up') {
            document.querySelector('#editedImg')[size] = document.querySelector('#editedImg')[size] + 5;
        }
        else if (type === 'down') {
            if(document.querySelector('#editedImg').width < 2 || document.querySelector('#editedImg').height < 2){
                return;
            }
            document.querySelector('#editedImg')[size] = document.querySelector('#editedImg')[size] - 5;
        }
        
        actualSize(`#img${size[0].toUpperCase() + size.slice(1)}`, document.querySelector('#editedImg')[size]);

    }, 1000 / 60);
}

function actualSize(box, size){
    document.querySelector(box).value = size;
}

function moveImg(imgID){
    let img;

    editedVideo.forEach(edit => {
        if(edit.type === 'img' && edit.id === imgID){
            img = edit;
        }
    });

    document.addEventListener('mousemove', (e) => {
        if(img.draggable === true){
            e.preventDefault();
            document.querySelector('#editedImg').style.top = `${calculatePercentage(e.clientY, window.innerHeight)}`;
            document.querySelector('#editedImg').style.left = `${calculatePercentage(e.clientX, window.innerWidth)}`;
        }
    });
}

function closePopup(){
    document.querySelector('#popup').remove();
    document.querySelector('#overlayer').remove();
}


function addImg(e){
    const img = new Image();

    document.querySelector('#progressBar').appendChild(img);
    img.className = 'addedImg';
    img.src = '../img/imgColor.png';
    img.style.left = `${e.screenX - 20}px`;
}

// Player
let player;
let vid;
let sound = null;

function watchVideo(boxPlayer, video){
    vid = video;
    player = boxPlayer;

    let videoTime = setInterval(checkEdits, 1);

    if(document.querySelector('#player') !== null){
        stylingPlayerForMedia();
        addGoBackButton(stopWatchingVideo);
    }

    player.seekTo(0, true);
    player.playVideo();
}

function stopWatchingVideo(){
    playBox.pauseVideo();
    if(window.screen.width >= 1600){
        document.querySelector("#markerContainer") !== null ? document.querySelector("#markerContainer").style.width = "83%" : null;
    }
    else{
        document.querySelector("#markerContainer") !== null ? document.querySelector("#markerContainer").style.width = "75%" : null;
    }
    document.querySelector('#player').style.position = 'static';
    removeAllEdits();
}

function removeAllEdits(){
    document.querySelector("#editedImg") !== null ? document.querySelector("#editedImg").remove() : null;
    document.querySelector("#playingVideo") !== null ? document.querySelector("#playingVideo").remove() : null;
    document.querySelector("#videoText") !== null ? document.querySelector("#videoText").remove() : null;
    document.querySelector("#addedDrawing") !== null ? document.querySelector("#addedDrawing").remove() : null;
}

function checkEdits(){
    vid.forEach(edit => {
        if(!edit.hasOwnProperty('url')){
            if(Math.round(edit.startPoint) === Math.round(player.getCurrentTime())){
                playEdit(edit);
            }
            if(Math.round(edit.endPoint) === Math.round(player.getCurrentTime())){
                endEdit(edit);
            }
        }
    });
}

function keepVideoMute(){
    if(!player.isMuted()){
        player.mute();
    }
}

function endEdit(edit){
    if(edit.type === 'mute'){
        if(player.isMuted()){
            player.unMute();
        }
    }
    else if(edit.type === 'img'){
        document.querySelector('#editedImg') !== null ? document.querySelector('#editedImg').remove() : null;
    }
    else if(edit.type === 'drawing'){
        document.querySelector('#addedDrawing') !== null ? document.querySelector('#addedDrawing').remove() : null;
    }
    else if(edit.type === 'sound'){
        sound.pause();  
    }
    else if(edit.type === 'video'){
        document.querySelector('#playingVideo') !== null ? document.querySelector('#playingVideo').remove() : null; 
    }
    else if(edit.type === 'text'){
        document.querySelector('#videoText') !== null ? document.querySelector('#videoText').remove() : null; 
    }
}

function playEdit(edit){
    if(edit.type === 'mute'){
        keepVideoMute();
    }
    else if(edit.type === 'img'){
        playEditedImg(edit);
    }
    else if(edit.type === 'text'){
        playEditedText(edit);
    }
    else if(edit.type === 'drawing'){
        playEditedDrawing(edit);
    }
    else if(edit.type === 'sound'){
        playEditedSound(edit);  
    }
    else if(edit.type === 'delete'){
        playEditedDelete(edit);
    }
    else if(edit.type === 'video'){
        playEditedVideo(edit);
    }
    else if(edit.type === 'link'){
        playEditedLink(edit);
    }
}

function playEditedLink(edit){
    if(document.querySelector('#editedImg') !== null){
        document.querySelector('#editedImg').addEventListener('click', () => {
            document.querySelector('#editedImg').remove();
            player.seekTo(edit.linkTo);
        });
    }
}

function playEditedImg(edit){
    if(document.querySelector("#editedImg") === null){
        const img = document.createElement('img');

        img.src = edit.src;
        img.id = 'editedImg';
        img.style.zIndex = '99999';
        document.body.appendChild(img);

        for (let key in edit.styling) {
            key === 'width' ? img.style[key] = `${edit.styling[key]}px` : null;
            key === 'height' ? img.style[key] = `${edit.styling[key]}px` : null;
            img.style[key] = edit.styling[key];
        }

    } 
}

function playEditedVideo(edit){
   const video = document.createElement('iframe');
   video.id = 'playingVideo';
   video.src = edit.src;

   document.querySelector('#playingVideo') === null ? document.body.appendChild(video) : null;

   for(let key in edit.styling){
       key === 'width' ? video.style[key] = `${edit.styling[key]}px` : null;
       key === 'height' ? video.style[key] = `${edit.styling[key]}px` : null;
       video.style[key] = edit.styling[key];
   }
}

function playEditedText(edit){
    const textBox = document.createElement('div');
    textBox.id = 'videoText';

    document.querySelector('#videoText') === null ? document.body.appendChild(textBox) : null;
    textBox.textContent = edit.text;

    for(key in edit.styling){
        document.querySelector('#videoText').style[key] = edit.styling[key];
    }
}

function playEditedDrawing(edit){
    const drawing = document.createElement('img');
    drawing.src = edit.src;
    drawing.id = 'addedDrawing';

    if(document.querySelector('#addedDrawing') === null){
        document.body.appendChild(drawing); 
    }
}

function playEditedSound(edit){
    if(sound === null){
        sound = new Audio();
        sound.src = edit.src;
        sound.play();
    }
}

function playEditedDelete(edit){
    player.seekTo(edit.endPoint); 
}

function loadScript(){
    if (typeof(YT) == 'undefined' || typeof(YT.Player) == 'undefined') {
        const TAG = document.createElement('script');
        const FIRST_SCRIPT_TAG = document.getElementsByTagName('script')[0];
    
        TAG.src = "https://www.youtube.com/iframe_api"; 
        FIRST_SCRIPT_TAG.parentNode.insertBefore(TAG, FIRST_SCRIPT_TAG);
        window.onYouTubePlayerAPIReady = function() {
            createVideo();
          };
    }
    else{
        createVideo();
    }
}

function createVideo(){
    playBox = new YT.Player('player', {
        videoId: sessionStorage.getItem('url'),
        events: {
            onReady: createTools
        },
        playerVars: {
            rel: 0,
            showinfo: 0, 
            ecver: 2
        } 
    });
}

function stylingPlayer(){
    document.querySelector('#player').style.position = 'absolute';
    document.querySelector('#player').style.top = '0';
    document.querySelector('#player').style.left = '0';

    if(!mobilecheck()){
        if(window.screen.width >= 1600){
            document.querySelector("#markerContainer").style.width = "83%";
            document.querySelector('#player').style.width = '85%';
            document.querySelector('#player').style.height = '100%';
        }
        else{
            document.querySelector("#markerContainer").style.width = "67%";
            document.querySelector('#player').style.width = '70%';
            document.querySelector('#player').style.height = '100%';
        }
    }
    else{
        document.querySelector('#player').style.width = '100%';
        document.querySelector('#player').style.height = '75%';
    }
}

function mobilecheck() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    
    return check;
}

function stylingPlayerForMedia(){
    stylingPlayer();

    if(!mobilecheck()){
        document.querySelector("#markerContainer").style.width = "98%";   
        document.querySelector('#player').style.width = '100%';
    }
}

function howTo(){
    const info = document.createElement("div");
    const overlayer = document.createElement("div");

    overlayer.id = "overlayer";
    info.className = "infoBox";
    info.innerHTML = 
        `<div id="tubeditInfo">
            <span>Tubedit</span>
            <h2>
                Choose one of many tools avaiable in right panel. Each tool has same action plan. Do the job that tool is supposed to do and move the video progress bar to the point when the job done by the tool should be end.
            </h2>
            <div id="tubeditInfoBtn">Ok</div>
        </div>`;

    document.body.append(overlayer, info);
    document.querySelector("#tubeditInfoBtn").addEventListener("click", () => {
        document.querySelector("#overlayer").remove();
        document.querySelector(".infoBox").remove();
    });
}

//Watch
let videosRepresentation = [];
let alreadyEditedVideo;
let playContainer;

(function init(){
    if(document.querySelector(".watchContainer") !== null){
        loadVideos();
    }
})();

function loadVideos(){
    if(localStorage.getItem('videos') === null || JSON.parse(localStorage.getItem('videos')).length === 0){
        noVideosSaved();
    }
    else{
        showSavedVideos();
    }
}

function noVideosSaved(){
    document.querySelector('#container').innerHTML = 
        `<div id="noVideos">
            <div class="noVideosElements">
                <img src='../img/sleepingVideo.png'>
            </div>
            <div class="noVideosElements">You haven't got any videos saved</div>
         </div> `
}

function showSavedVideos(){
    let videos = JSON.parse(localStorage.getItem('videos'));
    
    videos.forEach(video => {
            document.querySelector('#container').innerHTML +=
                `<div data-id="${video[0].id}" class="videoBox">
                    <div class="removeVideo"><img src="../img/close.png"></div>
                    <div class="videoTitle">${video[0].title === "" ? "Untitled video" : video[0].title}</div>
                    <img src='${video[0].img}' alt="Video miniature">
                </div>`
    });

    document.querySelectorAll('.videoBox').forEach(video => video.addEventListener('click', playVideo))
    document.querySelectorAll('.removeVideo img').forEach(remove => remove.addEventListener('click', removeSavedVideo))
}

function removeSavedVideo(e){
    let videoID = e.target.parentNode.parentNode.dataset.id;
    let allVideos = JSON.parse(localStorage.getItem('videos'));
    let videosAfterChange = [];

    allVideos.forEach(video => {
        if(JSON.parse(video[0].id) !== parseInt(videoID)){
            videosAfterChange.push(video)
        }
    });

    localStorage.setItem("videos", JSON.stringify(videosAfterChange));
    e.target.parentNode.parentNode.remove();

    if(JSON.parse(localStorage.getItem('videos')).length === 0){
        localStorage.setItem("videoCounter", 0);
    }

    document.querySelector('#container').innerHTML = "";
    loadVideos();
}

function playVideo(e){
    let target;

    if(e.target.src.includes("close")){
        return;
    }

    if(e.target.nodeName === 'IMG'){
        target = e.target.parentNode;
    }
    else{
        target = e.target;
    }

    JSON.parse(localStorage.getItem('videos')).forEach(video => {
        parseInt(video[0].id) === parseInt(target.dataset.id) ? alreadyEditedVideo = video : null
    });

    watchVideoPrep();
    loadWatchScript();
}

function loadWatchScript() {
    if (typeof(YT) == 'undefined' || typeof(YT.Player) == 'undefined') {
        const TAG = document.createElement('script');
        const FIRST_SCRIPT_TAG = document.getElementsByTagName('script')[0];
    
        TAG.src = "https://www.youtube.com/iframe_api"; 
        FIRST_SCRIPT_TAG.parentNode.insertBefore(TAG, FIRST_SCRIPT_TAG);
        window.onYouTubePlayerAPIReady = function() {
            createVideoToWatch();
          };
    }
    else{
        createVideoToWatch();
    }
}

function watchVideoPrep(){
    let watcher = document.createElement('div');
    let watchingVideoOverlayer = document.createElement('div');

    watchingVideoOverlayer.id = "watchingVideoOverlayer";
    watcher.id = 'watcher'
    document.body.append(watchingVideoOverlayer, watcher);
}

function createVideoToWatch(){
    playContainer = new YT.Player('watcher', {
        videoId: sessionStorage.getItem('url'),
        events: {
            onReady: startWatching
        },
        playerVars: {
            controls: 0,
            rel: 0,
            showinfo: 0, 
            ecver: 2
        } 
    });
}

function startWatching(){
    return watchVideo(playContainer, alreadyEditedVideo)
}

