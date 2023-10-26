import {getChannelIdFromHash,showErrorPopup,getUserName} from './helpers.js';


function fetchAllUsers() {
    const token = localStorage.getItem('token');
    const url = 'http://localhost:5005/user';
    const requestStructure = {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
    }

    return fetch(url,requestStructure).then(response => response.json());
}

// fetch users that in the channel
function fetchChannelDetails(channelId) {
    const token = localStorage.getItem('token');
    const url = `http://localhost:5005/channel/${channelId}`;
    const requestStructure = {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
    };

    return fetch(url, requestStructure).then(response => response.json());
}



const selectedUserIds = [];

// show not in channel user list
async function showNonMemberUsersInModal(channelId) {
    Promise.all([fetchAllUsers(), fetchChannelDetails(channelId)]).then(async results => {
        const allUsersData = results[0];
        const allUsers = Array.isArray(allUsersData.users) ? allUsersData.users : [];
        const channelDetails = results[1];
        const memberIds = new Set(channelDetails.members);

        const userList = document.getElementById("userList");
        userList.innerHTML = '';  

        for (const user of allUsers) {
            if (!memberIds.has(user.id)) {
                const li = document.createElement("li");
                const name = await getUserName(user.id); 
                li.textContent = name;
                
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.value = user.id;

                checkbox.addEventListener('change', function () {
                    const userId = this.value;
                    if (this.checked) {
                        selectedUserIds.push(userId); 
                        console.log(selectedUserIds);
                    } else {
                        const index = selectedUserIds.indexOf(userId);
                        if (index !== -1) {
                            selectedUserIds.splice(index, 1); 
                        }
                    }
                });


                li.appendChild(checkbox);

                userList.appendChild(li);
            }
        }
    });
}



function inviteUserToChannel(userId, channelId) {
    const token = localStorage.getItem('token');
    const url = `http://localhost:5005/channel/${channelId}/invite`;

    const jsonString = JSON.stringify({userId: parseInt(userId) });

    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
        body:  jsonString,
    };
    

    fetch(url, requestOptions).then(response => {
        console.log(response.status);
        if (response.ok) {
                console.log("successful!");
        } else {
            response.json().then(data => {
                console.error(data["error"]);
            });
        }
    }).catch(error => {
        console.error("Error inviting user:", error);
    });

}


document.querySelector('#inviteBtn').addEventListener('click', function(){
    const channelId = getChannelIdFromHash();
    selectedUserIds.forEach(userId => {
        inviteUserToChannel(userId, channelId);
    });

    selectedUserIds.length = 0;

    document.getElementById('inviteModal').style.display = 'none';
})


// home page invite button to show inviters modal
function showInviteModal() {
    const channelId = getChannelIdFromHash();
    showNonMemberUsersInModal(channelId);
    document.getElementById('inviteModal').style.display = 'block';
}

document.querySelector('.invite').addEventListener('click', function() {
    showInviteModal();
});




// close invite modal
document.querySelector('.inviteCloseBtn').addEventListener('click', function() {
    document.getElementById('inviteModal').style.display = 'none';
});



// leave channel
function leaveChannel(){
    const channelId = getChannelIdFromHash();
    const token = localStorage.getItem('token');
    const url = `http://localhost:5005/channel/${channelId}/leave`;
    const requestStructure = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
    };
    fetch(url,requestStructure).then(response =>{
        if (response.ok) {
            if (!confirm("Are you sure you want to leave?")) {
                return;  
            }
            alert('Successfully left the channel!');
            // location.reload(); 刷新 可以不需要
        }else{
            response.json().then(data => {
                showErrorPopup(data["error"]);
            })
        }
    })
    .catch(error => {
        showErrorPopup(error.message);
    });
}

document.querySelector('.leave').addEventListener('click', function() {
   leaveChannel();
});

