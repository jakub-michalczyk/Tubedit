const BOX = document.querySelector('#container');

(function init(){
    if(document.querySelector(".typeInfo") !== null){
    document.querySelector('#edit') !== null ? document.querySelector('#edit').addEventListener('click', editVideo) : null;
    document.querySelector('#whatIsIt') !== null ? document.querySelector('#whatIsIt').addEventListener('click', tubeditInfo) : null;
    }
})();

function unpackEditedVideo(){
    let editedVideo = document.querySelector('#pasteArea').value;
    sessionStorage.setItem('editedVideo', JSON.stringify(editedVideo));
    window.location.href = '../html/watch.html';
}

function tubeditInfo(){
    BOX.innerHTML = 
        `
        <div id="tubeditInfo">
            <span>Tubedit</span>
            <h2>
                is an online application that can be used to make simple edits to your video. It has many easy to use tools, that will make your video
                even cooler!
            </h2>
            <div id="tubeditInfoBtn">Ok</div>
         </div>`

         
    document.querySelector('#tubeditInfoBtn').addEventListener('click', goBack);
}

function editVideo(){
    BOX.innerHTML = 
        `<div id="stepBox">
            <div id="goBack" style="top:15%">
                <img src='../img/goBack.png'>
            </div>
            <h2 class="containerText">Please paste link to YouTube video below.</h2>
            <input type="text" id="pasteArea">
            <input type="button" id="saveInfo" value="Done">
         </div>`

     document.querySelector('#goBack').addEventListener('click', goBack);
     document.querySelector('#saveInfo').addEventListener('click', getVideoID);
}

function goBack(){
    window.location.reload();
}

function getVideoID(){
    let url = document.querySelector('#pasteArea').value;
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    let match = url.match(regExp);
    let id;
    

    if (match && match[2].length == 11) {
        id = match[2];
    }
    
    sessionStorage.setItem('url', id);
    window.location.href = '../html/edit.html';
}



