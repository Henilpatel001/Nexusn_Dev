// /////////////////////////Main Search bar option//////////////////////////////
let availableKeywords=[
    'HTML',
    'CSS',
    'Easy tutorual',
    'Web design Tutorial',
    'JavaScript',
    'Where to learn coding',
    'I learn coding from differt sources I learn coding from differt sources'
];

const resultBox=document.querySelector(".resultBox");
const searchInput=document.querySelector(".searchInput");

searchInput.addEventListener("click",function(){
    let result=[];
    result=availableKeywords;
    display(result);
});

searchInput.addEventListener("keyup",function(){
    let result=[];
    let input=searchInput.value;
    if (input.length) {
        result=availableKeywords.filter((keyword)=>{
            return keyword.toLowerCase().includes(input.toLowerCase());
        });   
    }
    display(result);
    if (!result.length) {
        resultBox.innerHTML='';
    }
});
    
function display(result){
    const content=result.map((list)=>{
        return "<li onclick=selectInput(this)>" + list +" </li>";
    });
    resultBox.innerHTML="<ul>" + content.join('') +" </ul>";
}

function selectInput(list){
    searchInput.value=list.innerHTML;
    resultBox.innerHTML='';
}

/////////////////////////////////////////////////////////////////////////////////
// /////////////////////////Upcoming Events List//////////////////////////////
// let Events=[
//     'Grand Theft Auto V in L.J',
//     'Red Dead Redemption 2 in IIT Mumbai',
//     'God of War in IIT Delhi'
// ];
// let eventlist=document.querySelector(".eventlist ul");
// let showMore=document.querySelector("#showMore");
// if (showMore) {
//     showMore.addEventListener("click", () => {
//         let result = [];
//         result = Events;
//         displayEvents(result);
//         showMore.style.display = "none";
//     });
// }
// function displayEvents(result){
//     const content=result.map((list)=>{
//         return "<li>" + list +" </li>";
//     });
//     eventlist.innerHTML += content.join('');
// }

/////////////////////////////////////////////////////////////////////////////////
// /////////////////////////Create Post form ////////////////////////////////////
function togglePopup() { 
    const overlay = document.getElementById('popupOverlay'); 
    overlay.classList.toggle('show'); 
}


/////////////////////////////////////////////////////////////////////////////////
// /////////////////////////Create Post form/////////////////////////////////////
function togglePopup() { 
    const overlay = document.getElementById('popupOverlay'); 
    overlay.classList.toggle('show'); 
}
/////////////////////////////////////////////////////////////////////////////////
// /////////////////////////Close Alert box//////////////////////////////////////
let alertBtnClose = document.querySelector(".alertBtnClose");

if (alertBtnClose) {
    // Loop through the elements, and hide the parent, when clicked on
    alertBtnClose.addEventListener("click", function() {
        this.parentElement.style.display = 'none';
    });
}

/////////////////////////////////////////////////////////////////////////////////
// /////////////////////////Cancel Post option///////////////////////////////////
let userEllipsis = document.querySelectorAll(".userEllipsis i");  
let userOptionId = document.querySelectorAll("#userOptionId");  

// show post
for (let i = 0; i < userEllipsis.length; i++) {
    userEllipsis[i].addEventListener("click", () => {
        userOptionId[i].classList.toggle("showPost");
    });
}

// cancel post
for (let i = 0; i < userOptionId.length; i++) {
    userOptionId[i].addEventListener("click", () => {
        userOptionId[i].classList.toggle("showPost");
    });
}

window.onclick = function (event) {
    if (!event.target.matches('.userEllipsis i')) {
        for (i = 0; i < userOptionId.length; i++) {
            if (userOptionId[i].classList.contains('showPost')) {
                userOptionId[i].classList.remove('showPost');
            }
        }
    }
}

/////////////////////////////////////////////////////////////////////////////////
// /////////////////////////users likes//////////// /////////////////////////////

let userLikes = document.querySelectorAll("#likeClassAdd");
let listId = document.querySelectorAll("#listId");
let countLike = document.querySelectorAll("#countLike");

for (let i = 0; i < userLikes.length; i++) {
    userLikes[i].addEventListener("click", async() => {
        let self=document.getElementById("self");
        const id=listId[i].innerText;


        const response = await fetch(`http://localhost:3000/${id}/likes`);
        const data = await response.json();
        const isLikes = data.img.likes.includes(self.innerText);
       
        if (!isLikes) {
            userLikes[i].style.color="red";
            userLikes[i].style.fontWeight="600";
            countLike[i].innerText++;
            await fetch(`/likes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id })
            });
        }else{
            userLikes[i].style.color="";
            userLikes[i].style.fontWeight="";
            countLike[i].innerText--;
            await fetch(`/unlikes`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });
        }
    });
}

window.addEventListener('load', async function() {
    let userLikes = document.querySelectorAll("#likeClassAdd");
    let listId = document.querySelectorAll("#listId");
    let self=document.getElementById("self");
    for (let i = 0; i < userLikes.length; i++) {  
        const id=listId[i].innerText;
        const response = await fetch(`http://localhost:3000/${id}/likes`);
        const data = await response.json();
        const isLikes = data.img.likes.includes(self.innerText);

        // let isLiked = localStorage.getItem('isLiked') === 'true';
        userLikes[i].style.color=isLikes?"red":"";
        userLikes[i].style.fontWeight=isLikes?"600":"";
    }
});


/////////////////////////////////////////////////////////////////////////////////
// /////////////////////////Add a comments///////////////////////////////////////


async function postComment() {
    let textarea = document.getElementById("new-comment-text");
    let commentText = textarea.value.trim();
    let self=document.getElementById("self");
    let listId=document.getElementById("listId");
    if (commentText !== "") {
        let comment = document.createElement("div");
        comment.className = "comment";
        comment.innerHTML = `
        <div class="comment-content">
        <p><strong>${self.innerText}</strong> ${commentText}</p>
        <span>${Date.now()}</span>
        </div>
        `;
        let commentsContainer = document.querySelector(".comments-container");
        commentsContainer.insertBefore(comment, commentsContainer.lastChild);
        
        // Clear textarea after posting
        textarea.value = "";
        listId=listId.innerText;
        await fetch(`/${self}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({commentText,listId})
        });
    }
}

window.addEventListener('load',async function(){
    let listId=document.getElementById("listId");
    listId=listId.innerText;
    let self=document.getElementById("self");
    const response = await fetch(`http://localhost:3000/${self}/comment/${listId}`);
    const data = await response.json();
    for (detail of data.img.comments) {
        
        let comment = document.createElement("div");
        comment.className = "comment";
        comment.innerHTML = `
        <div class="comment-content">
        <p><strong>${detail.username}</strong> ${detail.text}</p>
        <span>${Date.now()}</span>
        </div>
        `;
        let commentsContainer = document.querySelector(".comments-container");
        commentsContainer.insertBefore(comment, commentsContainer.lastChild);
    }
}) 

/////////////////////////////////////////////////////////////////////////////////
// /////////////////////////Edit profile btn/////////////////////////////////////
let editProfileBtn = document.querySelector(".edit-profile button");
let profileBio = document.getElementById("profileBio");
let profileBioImg = document.getElementById("profileBioImg");

let preview = document.querySelector("img");

function editProfile(){
    if (this.value.trim() != '') {
        editProfileBtn.style.display = 'inline';
    }else{
        editProfileBtn.style.display = 'none';
    }
}
if (profileBio) {
    profileBio.addEventListener('input',editProfile);
    profileBioImg.addEventListener('input',editProfile);
    profileBioImg.addEventListener('change',()=>{
        const file = profileBioImg.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (event) {
                preview.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////
// /////////////////////////story upload/////////////////////////////////////////
let storyImgUpload = document.querySelector("#storyImg");
let storyPreview = document.querySelector(".storyPreview");
let storyBox = document.querySelectorAll(".story-Box");
if (storyImgUpload) {   
    storyImgUpload.addEventListener('input',()=>{
        const reader = new FileReader();
        reader.onload = function (e) {
        storyPreview.style.display = 'flex';
        storyPreview.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image"  height="500" style="width:60%"><button form="storyForm">Upload Story</button>`;
        storyPreview.style.padding="10px";
        storyPreview.style.backgroundColor="gray";
        storyPreview.style.inlineSize="auto";
    }
    reader.readAsDataURL(storyImgUpload.files[0]);
    
})
}

for (let i = 0; i < storyBox.length; i++) {
    storyBox[i].style.border="3px solid gray"; 
}

if (storyPreview) {
    
    document.addEventListener('click', function (event) {
        const isClickInside = storyPreview.contains(event.target);
        // const isButton = event.target.tagName === 'BUTTON';
        
        if (!isClickInside) {
            storyImgUpload.value = '';
            storyPreview.style.display = 'none';
        }
    });
}
    
/////////////////////////////////////////////////////////////////////////////////
// /////////////////////////page change in followers page////////////////////////
let folltit1 = document.getElementById("folltit1");
let folltit2 = document.getElementById("folltit2");
const relatedPage1 = document.getElementById('relatedPage1');
const relatedPage2 = document.getElementById('relatedPage2');



function showRelatedPage(option) {
    folltit1.classList.remove('active');
    folltit2.classList.remove('active');
    
    // Add active class to the clicked option
    if (option === 'option1') {
        folltit1.classList.add('active');
        relatedPage1.classList.add('active');
        relatedPage2.classList.remove('active');

    } else if (option === 'option2') {
        folltit2.classList.add('active');
        relatedPage1.classList.remove('active');
        relatedPage2.classList.add('active');

        // Change URL without reloading page
    }
}

if (folltit1) {
    folltit1.classList.add('active');
    relatedPage1.classList.add('active');
    folltit1.addEventListener('click', function() {
        showRelatedPage('option1');
    });
    
    folltit2.addEventListener('click', function() {
        showRelatedPage('option2');
    });
}

window.onload = async () => {

        let Accept=document.querySelectorAll("#folbtn1");
        let Ignore=document.querySelectorAll("#folbtn2");
        let user = document.getElementsByClassName("followname");
        let self=document.getElementById("self");
        for (let i = 0; i < Accept.length; i++) {
            let username=user[i].innerText;
            const response = await fetch(`http://localhost:3000/${username}/followsCheck`);
            const data = await response.json();
            const isFollowing = data.followers.includes(self.innerText);
            if (isFollowing) {
                Accept[i].innerText = isFollowing ? 'Following' : '';
                Accept[i].style.color = isFollowing ? 'green' : '';
                Ignore[i].style.display = isFollowing ? 'none' : '';
            }
        }
};


// users Accept and Ignore 
let Accept=document.querySelectorAll("#folbtn1");
let Ignore=document.querySelectorAll("#folbtn2");
let folluser=document.querySelectorAll(".folluser");

let user = document.getElementsByClassName("followname");

for (let i = 0; i < Accept.length; i++) {
    Ignore[i].addEventListener("click", async() => {
        folluser[i].style.display = "none";
        let username=user[i].innerText;

        requestedDelete(username);
    });
}
    
// to accept in backend

for (let i = 0; i < Accept.length; i++) {
    Accept[i].addEventListener("click", async() => {
        Accept[i].innerHTML = 'Following';
        Accept[i].style.color = "green";
        Ignore[i].style.display = "none";
        let username=user[i].innerText;

        follow(username);
    });
}




/////////////////////////////////////////////////////////////////////////////////
// /////////////////////////Follow btn in profile page///////////////////////////
let followBtn=document.getElementById('followBtn');
if (followBtn) {
    
    followBtn.addEventListener('click',  ()=> {
        if (followBtn.innerHTML === 'Follow') {
            followBtn.innerHTML = 'Requested';
            followBtn.style.backgroundColor='gray';
        } else {
            followBtn.innerHTML = 'Follow';
            followBtn.style.backgroundColor='';
        }
    });
}
    
//  if click follow btn not change page
let btns1=document.querySelectorAll("#followRemove");
let self=document.getElementById("self");
for (const btn of btns1) {
    btn.addEventListener('click',async()=>{
        let username=btn.parentElement.childNodes[3].innerText;
        
        await fetch(`${self}/unfollow/myself`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });
    })
}

let btns2=document.querySelectorAll("#followingRemove");
for (const btn of btns2) {
    btn.addEventListener('click',async()=>{
        let username=btn.parentElement.childNodes[3].innerText;        
        
        unfollow(username);        
    })
}


// if click follow btn not change page
async function toggleFollow() {
    let user = document.getElementsByClassName("profuser");
    let username=user[0].innerText.split(' ')[0];
    let self=document.getElementById("self");

    const response = await fetch(`http://localhost:3000/${username}/followsCheck`);
    const data = await response.json();
    const isFollowing = data.followers.includes(self.innerText);
    if (!isFollowing) {
        follow(username);
    } else {
       unfollow(username);
    }
    
}

async function toggleRequested() {
    // let self=document.getElementById("self");
    let user = document.getElementsByClassName("profUser");
    let username=user[0].innerText.split(' ')[0];

    const responseRequest = await fetch(`http://localhost:3000/${username}/requestCheck`);
    const dataRequest = await responseRequest.json();
    const isRequested = dataRequest.requested.includes(username);

    const response = await fetch(`http://localhost:3000/${username}/followsCheck`);
    const data = await response.json();
    const isFollowing = data.followers.includes(self.innerText);

    if (isFollowing && !isRequested) {
        unfollow(username);
     }

    else if (!isRequested) {   
        requested(username);
    }else{
        requestedDelete(username);
    }
}

if (document.getElementsByClassName("profUser").length) {
    window.onload = async () => {
        let user = document.getElementsByClassName("profUser");
        let username = user[0].innerText.split(' ')[0];
        let self = document.getElementById("self");
        const responseRequest = await fetch(`http://localhost:3000/${username}/requestCheck`);
        const dataRequest = await responseRequest.json();
        const isRequested = dataRequest.requested.includes(username);

        const response = await fetch(`http://localhost:3000/${username}/followsCheck`);
        const data = await response.json();
        const isFollowing = data.followers.includes(self.innerText);

        document.getElementById('followBtn').innerText = isRequested ? 'Requested' : isFollowing ? 'UnFollow' : 'Follow';
        document.getElementById('followBtn').style.backgroundColor = isRequested ? 'gray' : isFollowing ? 'gray' : '';
    };
}

// make it All Function
async function follow (username) {
    await fetch(`/${username}/follow`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
    });
};
async function unfollow (username) {
    await fetch(`${username}/unfollow`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
    });
};
async function requested (username) {
    await fetch(`/${username}/requested`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
    });
};
async function requestedDelete (username) {
    await fetch(`/${username}/requestedDelete`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
    });
};


/////////////////////////////////////////////////////////////////////////////////
// /////////////////////////Follow cancel btn////////////////////////////////////
let showFollowers = document.getElementsByClassName("showFollowers");
let showFollowing = document.getElementsByClassName("showFollowing");
let followCancel = document.querySelectorAll(".followName i");
let followers = document.getElementsByClassName("stat-title");
if (showFollowing.length) {
    followers[1].addEventListener('click',()=>{
        showFollowers[0].style.display="block";
    });
    followers[2].addEventListener('click',()=>{
        showFollowing[0].style.display="block";
    });
    
    followCancel[0].addEventListener('click',()=>{
        showFollowers[0].style.display="none";
    });
    followCancel[1].addEventListener('click',()=>{
        showFollowing[0].style.display="none";
    });
    
    document.addEventListener('click', (event) => {
        if (!followers[1].contains(event.target) && !showFollowers[0].contains(event.target)) {
            showFollowers[0].style.display="none";
        }
        if (!followers[2].contains(event.target) && !showFollowing[0].contains(event.target)) {
            showFollowing[0].style.display="none";
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////
// /////////////////////////Message app for ////////////////////////////////////
let messuser=document.querySelectorAll(".messuser");
let userId=document.querySelectorAll("#userId");
let messname=document.querySelectorAll(".messname");
let chatContainer=document.getElementsByClassName("chat-container");



// const socket=io();
let chatId='';
for (let i = 0; i < messuser.length; i++) {
    messuser[i].addEventListener('click',async()=>{
        const Id=userId[i].innerText;
        let res=await fetch(`/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ Id })
        });
        const data = await res.json();
        chatId=data._id;
        document.getElementById("displayName").innerText=messname[i].innerText;
        document.getElementsByClassName("displayMessage")[0].style.display='block';

        const response = await fetch(`http://localhost:3000/message/chat/${chatId}`);
        const data1 = await response.json();
        chatContainer[0].innerHTML='';
        if (data1.length) {   
            for (const data of data1) {
                const text = document.createElement("div");
                text.className='text';
                // senderId
                if (data.senderId==Id) {
                    text.style.marginRight='Auto';   
                    text.style.textAlignLast= 'left';   
                }
                text.innerHTML=data.text+'\n'+'<span>'+moment(data.createdAt).calendar()+'</span>';
                chatContainer[0].appendChild(text);
            }
        }
        // // Listen for chat messages
        // socket.on('chat message', (data) => {
        //     const { from, message } = data;
        //     const text = document.createElement("div");
        //     text.className='text';
        //     text.innerText=`From ${from}: ${message}`;
        //     chatContainer[0].appendChild(text);
        //     // window.scrollTo(0, document.body.scrollHeight);
        // });
    })
}
    
let sendButton = document.getElementById("send-button");
let chatInput=document.getElementById("chat-input");
async function saveChat () {
    await fetch(`/message/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chatId, text })
    });
};
chatInput.addEventListener('input', () => {
    if (chatInput.value.length) {
        sendButton.style.display = 'block';
    }else{
        sendButton.style.display = 'none';
    }
})
chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        text = chatInput.value;
        chatInput.value = '';
        sendButton.style.display = 'none';
        saveChat();
    }
});
sendButton.addEventListener('click', () => {
    text = chatInput.value;
    chatInput.value='';
    sendButton.style.display = 'none';
    saveChat();
    // const userId = 'abc';
    // if (userId) {
    //     socket.emit('register', userId);
    // }

    // const toUserId = '123';
    // // const toUserId = toUserIdInput.value;
    // if (input.value && toUserId) {
    //     socket.emit('chat message', { to: toUserId, message: text});
    //     text.value = '';
    // }
})

// make socket



// const form = document.getElementById('form');
// form.addEventListener('submit', (e) => {
//     e.preventDefault();
//     const toUserId = toUserIdInput.value;
//     if (input.value && toUserId) {
//         socket.emit('chat message', { to: toUserId, message: input.value });
//         input.value = '';
//     }
// });

