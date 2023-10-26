import {getChannelIdFromHash,showErrorPopup} from './helpers.js';
import {displayChannelTitle,displayChannelMessage} from './message.js';

function fetchChannels() {
    const url = "http://localhost:5005/channel";
    const token = localStorage.getItem('token');
    const channelBox = document.querySelector('.channelBox');

    fetch(url, {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
    })
    .then(response => response.json())
    .then(data => {
        channelBox.innerHTML = '';  
        // may have bug? 
        // console.log(data.channels);
        data.channels.forEach(channel => {
            const channelId = channel["id"];

            const channelDiv = document.createElement('div');
            channelDiv.className = 'channel';

            const minusImg = document.createElement('img');
            minusImg.className = 'rename minusIcon';
            minusImg.src = './assert/minus.svg';
            minusImg.alt = 'minus';

            const channelNameSpan = document.createElement('span');
            channelNameSpan.className = 'channelName';
            channelNameSpan.textContent = channel["name"];
            channelNameSpan.setAttribute("id", "channelName_" + channelId);  
            channelNameSpan.addEventListener('click', () => {
                window.location.hash = `channel={${channelId}}`;
            });

            const renameImg = document.createElement('img');
            renameImg.className = 'rename renameIcon';
            renameImg.src = './assert/pen-to-square-solid.svg';
            renameImg.alt = 'rename';

            channelDiv.appendChild(minusImg);
            channelDiv.appendChild(channelNameSpan);
            channelDiv.appendChild(renameImg);
            channelDiv.addEventListener('click', () => {
                window.location.hash = `channel={${channelId}}`;
                displayChannelTitle(channelId).then(()=>{
                    displayChannelMessage(channelId)
                });
            });

            channelBox.appendChild(channelDiv);
        });

    })
    .catch(error => {
        console.error("Error fetching channels:", error);
    });
}


// add channel
function addChannel(){
    const url = "http://localhost:5005/channel";
    const token = localStorage.getItem('token');
    const channelName = document.getElementById('channelInput').value;
    const channelDescription = document.getElementById('channelDescription').value || "Default description";
    const channelValue = document.getElementById('channelType').value;
    const channelType = channelValue === "public" ? false : true;  

    const jsonString = JSON.stringify({
        name: channelName,
        description: channelDescription,
        private: channelType,
    });
    const requestStructure = {
        method:'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
        body:jsonString
    }

    fetch(url,requestStructure).then(response =>{
        if (response.ok) {
            getChannel();
        } else {
            response.json().then((data) => {
                showErrorPopup(data["error"]);
            });
        }
    })
}


function getChannel() {
    const channelName = document.getElementById('channelInput').value;
    const channelValue = document.getElementById('channelType').value;
    const channelType = channelValue === "public" ? false : true;

    const newChannel = document.createElement('div');
    newChannel.className = 'channel';

    const minusImg = document.createElement('img');
    minusImg.className = 'rename minusIcon';
    minusImg.src ='./assert/minus.svg';
    minusImg.alt = 'minus';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'channelName'; 
    nameSpan.textContent = `${channelName}`;

    const typeSpan = document.createElement('span');
    typeSpan.textContent = channelType ? "private" : "public";  

    const renameImg = document.createElement('img');
    renameImg.className = 'rename renameIcon';
    renameImg.src = './assert/pen-to-square-solid.svg';
    renameImg.alt = 'rename';

    newChannel.appendChild(minusImg);
    newChannel.appendChild(nameSpan);
    newChannel.appendChild(typeSpan);
    newChannel.appendChild(renameImg);

    document.querySelector('.channelBox').appendChild(newChannel);
    document.getElementById('channelInput').value = '';
    document.getElementById('channelDescription').value = ''; 
    document.getElementById('channelModal').style.display = 'none';
}


// rename channel
function renameChannel(target) {
    const newName = prompt("Enter new channel name:");
    const channelId = getChannelIdFromHash();

    if (newName && newName.trim() !== '' && channelId) {
        const channelBtn = target.closest('.channel'); 
        const url = `http://localhost:5005/channel/${channelId}`; 
        const token = localStorage.getItem('token');

        const jsonString = JSON.stringify({
            name: newName, 
        });

        const requestStructure = {
            method: 'PUT', 
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: jsonString
        };

        fetch(url, requestStructure).then(response => {
            if (response.ok) {
                channelBtn.querySelector('.channelName').textContent = newName; 
            } else {
                response.json().then((data) => {
                    showErrorPopup(data["error"]);
                });
            }
        });
    } else {
        showErrorPopup("Invalid channel name!"); 
    }
}


// delete channel
function deleteChannel(targetIcon) {
    const channelId = getChannelIdFromHash();
    const channelBtn = targetIcon.closest('.channel');

    if (channelId) {
        const isConfirmed = window.confirm("Are you sure to delete this channel?");
        if (!isConfirmed) {
            return;  
        }

        const url = `http://localhost:5005/channel/${channelId}`;
        const token = localStorage.getItem('token');

        const requestStructure = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
        };

        fetch(url, requestStructure)
            .then(response => {
                if (!response.ok) {
                    const contentType = response.headers.get('Content-Type');
                    if (contentType && contentType.includes('application/json')) {
                        return response.json();
                    }
                    showErrorPopup('Server error');
                }
                return response;
            })
            .then(data => {
                if (data instanceof Error) {
                    showErrorPopup(data.message);
                } else {
                    channelBtn.remove();
                }
            })
            .catch(error => {
                showErrorPopup(`An error: ${error} occurred while deleting the channel.`);
            });
    }
}



document.addEventListener("DOMContentLoaded", function() {
    fetchChannels();
});

document.querySelector('.nav').addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('renameIcon')) {
        renameChannel(event.target);
    } else if (event.target && event.target.classList.contains('minusIcon')) {
        deleteChannel(event.target);
    }
});

document.querySelector('.createBox button').addEventListener('click', function() {
    document.getElementById('channelModal').style.display = 'flex';
});

document.querySelector('.closeBtn').addEventListener('click', function() {
    document.getElementById('channelModal').style.display = 'none';
});

document.getElementById('createChannelBtn').addEventListener('click', addChannel);




