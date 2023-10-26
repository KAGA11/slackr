import { changeVisbility,showErrorPopup, getChannelIdFromHash} from './helpers.js';
import { formatDate,getUserName,fileToDataUrl } from './helpers.js';
import { emojiReactMap } from './config.js';
import { showProfile} from './profile.js'

// default messgae
export const UpdateDay = ()=>{
    const today = new Date();

    const yearStart = new Date(today.getFullYear(), 0, 0);
    const dayCount = Math.floor((today - yearStart) / (24 * 60 * 60 * 1000));
    document.getElementById("dayCount").textContent = dayCount;
    document.getElementById("percentage").textContent = ((dayCount / 365) * 100).toFixed(2) + "%";
    const Daystart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dayPassed = Math.floor((today - Daystart) / 1000);
    const dayPercentage = (dayPassed / (24 * 60 * 60)) * 100;
    document.getElementById("dayPercentageValue").textContent = dayPercentage.toFixed(2) + "%";
}

export const IntervalObject = {
    intervalId: setInterval(UpdateDay, 1000)
};

UpdateDay();



// show message
export function displayChannelTitle(channelId) {
    clearInterval(IntervalObject.intervalId);
    const home = document.querySelector('.home')
    home.innerHTML = '';
    const defaultHome = document.querySelector('.defaultHome');
    if(defaultHome) {defaultHome.innerHTML = '';} 

    const token = localStorage.getItem('token');
    const url = `http://localhost:5005/channel/${channelId}`;
    const requestStructure = {
        method: 'GET', 
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
    }
    return fetch(url,requestStructure).then(response =>{
        if (!response.ok) {
           
            return response.json().then(err =>{
                alert(err.error);
                return Promise.reject(err)
            });
        }
        return response.json();
    })
    .then(channel =>{
        if (channel.private) {
            showErrorPopup("Sorry, you cannot access a private channel.");
            return;  
        }

        const creator = channel.creator
        return fetch(`http://localhost:5005/user/${creator}`,requestStructure)
        .then(response => response.json())
        .then(creator =>{
            const divHeader = document.createElement('h4');
            const divDesc = document.createElement('div');
            const divCreate = document.createElement('div');
            const titleContainer = document.createElement('div');
            const btn = document.createElement('button');
            
            titleContainer.innerHTML = "";
            titleContainer.className = 'titleContainer';

            const channelType = channel.private ? "private" : "public"
            const createDate = formatDate(channel.createdAt);

            divHeader.innerHTML = `Header: This channel's ID: ${channelId}`;
            divDesc.innerHTML = `Type: ${channelType},Description: ${channel.description}`;
            divCreate.innerHTML = `Created by ${creator.name}, on ${createDate}`
            btn.innerHTML = "show pinned message"; 
            btn.className = "titleButton";  


            titleContainer.appendChild(divHeader);
            titleContainer.appendChild(divDesc);
            titleContainer.appendChild(divCreate);
            titleContainer.appendChild(btn);

            home.appendChild(titleContainer);
        })
    })
    .catch(error =>{
        showErrorPopup("Error fetching data:", error)
    })
}


export function displayChannelMessage(channelId) {
    const home = document.querySelector('.home');
    const messageContainer = home.querySelector('.messageContainer') || document.createElement('div');
    messageContainer.innerHTML = '';
    messageContainer.className = 'messageContainer';

    // If the messageContainer doesn't already exist, append it to the home
    if (!home.querySelector('.messageContainer')) {
        home.appendChild(messageContainer);
    }

    fetchMessages(channelId, messageContainer)

    let sendMessageElement = home.querySelector('.sendMessage');
    if(sendMessageElement){
        home.removeChild(sendMessageElement);
    }

    const sendMessageComponent = createSendMessageComponent();
    home.appendChild(sendMessageComponent);

}

function fetchMessages(channelId, container) {
    const token = localStorage.getItem('token');
    const url = `http://localhost:5005/message/${channelId}?start=${0}`; 
    const requestStructure = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        }
    };

    return fetch(url, requestStructure)
    .then(response => response.json())
    .then(data => {
        const messages = data.messages;
        if (!messages || messages.length === 0) {
            
            const hr = document.createElement('hr');
            const done = document.createElement('div');
            done.innerHTML = "done"
            done.style.textAlign = 'center';
            container.appendChild(hr);
            container.appendChild(done)
            return;
        }

        messages.sort((a, b) => b.id - a.id);

        // console.log(messages);
        const promises = messages.map(message => {
            return getUserName(message.sender).then(sender => {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'messageDiv';
                messageDiv.setAttribute('data-message-id', message.id);  
                messageDiv.setAttribute('data-channel-id', channelId);
                messageDiv.setAttribute('data-user-id',message.sender)
                const displayTime = message.edited ? formatDate(message.editedAt) : formatDate(message.sentAt);
                const editedTag = message.edited ? ' (edited)' : '';
                const pinImageSrc = message.pinned ? './assert/pinned.svg' : './assert/pin.svg';
                
                let contentHtml = '';
                if(message.message){
                    contentHtml = message.message
                }else{
                    // console.log(message.image);
                    contentHtml =  `<img src="${message.image}" alt="Uploaded Image" class="uploadedImage">`;
                    console.log(contentHtml);
                }
                
                messageDiv.innerHTML = `
                    <img class = "avatar" src="./assert/defaultAvatar.svg" alt="avatar">
                    <h4 class='messHeader'>${sender}${editedTag}</h4>
                    <time>${displayTime}</time> 
                    <div class="messageContent">
                        ${contentHtml}
                    </div>
                    <div class="messageIcons">
                        <img src="${pinImageSrc}" alt="Pin" class="pinMessageIcon">
                        <img src="./assert/edit.svg" alt="Edit" class="editMessageIcon">
                        <span class="dropdown">
                            <img src="./assert/react.svg" alt="React" class="reactMessageIcon">
                            <div class="dropdown-content">
                            <span class= "emoji">😆</span>
                            <span class= "emoji">🙏</span>
                            <span class= "emoji">🥺</span>
                            <span class= "emoji">Default</span>
                            </div>
                        </span>
                        <img src="./assert/deleteMessage.svg" alt="Delete" class="deleteMessageIcon">
                    </div>
                `;
                return messageDiv;
            });
        });
    
        Promise.all(promises).then(messageDivs => {
            messageDivs.forEach(div => {
                const messageId = div.getAttribute('data-message-id');
                const channelID = div.getAttribute('data-channel-id');
                const userId = div.getAttribute('data-user-id')
                // profile
                const messHeader = div.querySelector('.messHeader');
                messHeader.addEventListener('click',()=>{
                    document.querySelector('.profileModal').style.display = 'block';
                    window.location.hash = `userId={${userId}}`
                    showProfile(userId)
                })


                // delete
                const deleteIcon = div.querySelector('.deleteMessageIcon');
                deleteIcon.addEventListener('click', function() {
                    deleteMessage(channelID, messageId, container);
                });

                // edit
                const editIcon = div.querySelector('.editMessageIcon');
                editIcon.addEventListener('click',()=>{
                    const oldMessageContent = div.querySelector('.messageContent').textContent;
                    const newMessageContent = prompt("Edit your message:", oldMessageContent.trim());
                    if (newMessageContent && newMessageContent !== oldMessageContent) {
                        editMessage(channelID, messageId, newMessageContent, div);
                    }
                })

                // react
                const emojis = div.querySelectorAll('.emoji');
                emojis.forEach(emoji => {
                    emoji.addEventListener('click', e => {
                        reactMessage(e.target,channelID,messageId);
                    });
                });
                
                // pin
                const pinIcon = div.querySelector('.pinMessageIcon') 
                pinIcon.addEventListener('click',()=>{
                    pinMessage(pinIcon,channelID,messageId)    
                })
                // show pin 
                const pinBtn = document.querySelector('.titleButton');

                pinBtn.addEventListener('click',()=>{
                    showPinMessage(channelID)
                })


                container.appendChild(div);
            });
        });
    })
    .catch(error => {
        showErrorPopup("Error fetching messages:", error);
    });
}





// send message
function sendMessage(channelId) {
    const inputElement = document.querySelector('.sendMessage input[type="text"]');
    const messageText = inputElement.value.trim();

    const fileInput = document.querySelector('#fileInput');
    let img = fileInput.files[0];

    if (img) {
        fileToDataUrl(img).then(dataUrl => {
            const jsonString = JSON.stringify({
                image: dataUrl
            });

            sendContent(channelId, jsonString);
        }).catch(error => {
            console.error("Error converting file to Data URL:", error);
        });
    } else {
        const jsonString = JSON.stringify({
            message: messageText
        });
        sendContent(channelId, jsonString);
    }

    if (!messageText && !img) {
        showErrorPopup("Message cannot be empty!");
        return;
    }    
}

function createSendMessageComponent() {
    const sendMessageDiv = document.createElement('div');
    sendMessageDiv.className = 'sendMessage';


    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'fileInput';
    fileInput.style.display = 'none';  
    fileInput.accept = "image/*";  
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            console.log(file);
        }
    });

    const imgElement = document.createElement('img');
    imgElement.src = './assert/localimg.svg';
    imgElement.addEventListener('click', function() {
        fileInput.click();
    });

    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.placeholder = "let's chat!";

    const buttonElement = document.createElement('button');
    buttonElement.textContent = 'send';

    // Attach the function to the 'send' button
    buttonElement.addEventListener('click', function() {
        const channelId = getChannelIdFromHash();
        sendMessage(channelId);
    });

    sendMessageDiv.appendChild(fileInput);
    sendMessageDiv.appendChild(imgElement);
    sendMessageDiv.appendChild(inputElement);
    sendMessageDiv.appendChild(buttonElement);

    return sendMessageDiv;
}


// send img
function sendContent(channelId, jsonString) {
    const url = `http://localhost:5005/message/${channelId}`;
    const token = localStorage.getItem('token');
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
        body: jsonString
    })
    .then(response => {
        if (response.ok) {
            const inputElement = document.querySelector('.sendMessage input[type="text"]');
            inputElement.value = '';
            displayChannelMessage(channelId);
        } else {
            throw new Error("Server responded with status: " + response.statusText);
        }
    })
    .catch(error => {
        console.error("Error sending message:", error);
    });
}



// delete message
function deleteMessage(channelId, messageId, container) {
    const token = localStorage.getItem('token');
    const url = `http://localhost:5005/message/${channelId}/${messageId}`;

    const confirmDelete = confirm("Are you sure you want to delete this message?");
    if(!confirmDelete) return;

    fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token,
        }
    })
    .then(response => {
        if (response.ok) {
            container.removeChild(document.querySelector(`div[data-message-id="${messageId}"]`));
        } else {
            showErrorPopup("This is not your message");
        }
    })
    .catch(error => {
        showErrorPopup("Error deleting message:", error);
    });
}


// edit message
function editMessage(channelId, messageId,newMessageContent,div) {
    const token = localStorage.getItem('token');
    const url = `http://localhost:5005/message/${channelId}/${messageId}`;

    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ 
            message: newMessageContent, 
            edited: true,
            sentAt: new Date().toISOString() 
        })
    })
    .then(response => {
        if (response.ok) {
            const messageContentDiv = div.querySelector('.messageContent');
            messageContentDiv.textContent = newMessageContent;

            const messageUserDiv = div.querySelector('.messageDiv h4');
            if (messageUserDiv && !messageUserDiv.textContent.includes('(edited)')) {
                messageUserDiv.textContent += ' (edited)';                
            }

            const messageTime = div.querySelector('.messageDiv time');
            messageTime.textContent = formatDate(new Date()); 
        } else {
            showErrorPopup("This is not your message");
        }
    })
    .catch(error => {
        showErrorPopup("Error deleting message:", error);
    });
}


// react message
function reactMessage(emojiIcon,channelId,messageId){
    const emojiContent = emojiIcon.textContent;
    const reactType = emojiReactMap[emojiContent];
    const dropdown = emojiIcon.closest('.dropdown');
    const existingReactIcon = dropdown.querySelector('.reactMessageIcon');
    const existingEmoji = dropdown.querySelector('.displayedEmoji');

    if (existingReactIcon) {
        dropdown.removeChild(existingReactIcon);
    }
    if (existingEmoji) {
        dropdown.removeChild(existingEmoji);
    }

    if (emojiContent === "Default") {
        const imgElement = document.createElement('img');
        imgElement.src = "./assert/react.svg";
        imgElement.alt = "React";
        imgElement.className = "reactMessageIcon";
        dropdown.insertBefore(imgElement, dropdown.querySelector('.dropdown-content'));
        sendUnreact(channelId,messageId,reactType);
    } else {
        const emojiSpan = document.createElement('span');
        emojiSpan.innerText = emojiContent;
        emojiSpan.classList.add('displayedEmoji');
        dropdown.insertBefore(emojiSpan, dropdown.querySelector('.dropdown-content'));
        sendReact(channelId,messageId,reactType);
    }
}

function sendReact(channelId, messageId, reactType) {
    const url = `http://localhost:5005/message/react/${channelId}/${messageId}`;
    const token = localStorage.getItem('token'); 
    const requestStructure = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ react: reactType })
    }
    
    fetch(url, requestStructure)
    .then(response => {
        if (response.ok) {
            console.log("React sent successfully");    
        }
    })
    .catch(error => {
        showErrorPopup("Error sending react:", error);
    });
}

function sendUnreact(channelId, messageId, reactType) {
    const token = localStorage.getItem('token');

    if (reactType === 'all') {
        const allReacts = ['happy', 'thank', 'plz'];
        allReacts.forEach(react => {
            const url = `http://localhost:5005/message/unreact/${channelId}/${messageId}`;
            const requestStructure = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ react: react })
            };
            fetch(url, requestStructure)
            .then(response => {
                if (response.ok) {
                    console.log(`React ${react} removed successfully`);
                }else{
                    throw Error('React ${react} has already removed!')
                }
            })
            .catch(error => {
                throw Error(`React ${error} has already removed!`)
            });
        });
    } else {
        const url = `http://localhost:5005/message/unreact/${channelId}/${messageId}`;
        const requestStructure = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ react: reactType })
        };
        fetch(url, requestStructure)
        .then(response => {
            if (response.ok) {
                console.log("React removed successfully");
            }
        })
        .catch(error => {
            showErrorPopup("Error sending react:", error);
        });
    }
}





// pin message
function pinMessage(pinIcon,channelId,messageId){
    const token = localStorage.getItem('token');
    const toPin = pinIcon.src.includes('assert/pin.svg');
    pinIcon.src = toPin ? './assert/pinned.svg' : './assert/pin.svg'   
    const endpoint = toPin ? 'pin' : 'unpin';

    fetch(`http://localhost:5005/message/${endpoint}/${channelId}/${messageId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        }
    })
    .then(response => {
        if (!response.ok) {
            console.error("Error toggling pin status of the message.");
        }
    });

}


function showPinMessage(channelId) {
    console.log('to be continue: ',channelId);
}





