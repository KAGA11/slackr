
import {showErrorPopup,fileToDataUrl} from './helpers.js';



// 我要的是userid
export function showProfile(userId){
    const token = localStorage.getItem('token');
    const url = `http://localhost:5005/user/${userId}`;
    const requestStructure = {
        method:'GET',
        headers:{ 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
    }
    fetch(url,requestStructure).then(response =>response.json())
    .then(data =>{
        const profilePic = document.querySelector('.profile-pic');
            const profileName = document.querySelector('.profileModal h2');
            const profileBio = document.querySelector('.profileModal p:nth-child(3)'); 
            const profileEmail = document.querySelector('.profileModal p:nth-child(4)');

            profilePic.src = data.image ? data.image : "./assert/defaultAvatar.svg";
            profileName.textContent = data.name;

            data.bio ? profileBio.textContent = `BIO: ${data.bio}` :  profileBio.textContent = "BIO: User has no biography";;
        
            profileEmail.textContent = `EMAIL: ${data.email}`;
    })
    .catch(error =>{
        showErrorPopup(error);
    })
}




function sendRequestToServer(profileData) {
    const token = localStorage.getItem('token');
    const url = `http://localhost:5005/user`;

    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(profileData)
    })
    .then(response => {
        if (response.ok) {
            alert('change successfully!');
        } else {
            throw new Error('Failed to update profile');
        }
    })
    .catch(error => {
        showErrorPopup(error);
    });
}



export function updateProfile(){
    let nameInput = document.querySelector('input[placeholder="name"]').value;
    let emailInput = document.querySelector('input[placeholder="email"]').value;
    let passwordInput = document.querySelector('input[placeholder="Change Password"]').value;
    let bioInput = document.querySelector('input[placeholder="bio"]').value;
    let imgInput = document.querySelector('input[type="file"]').files[0];

    if (imgInput) {
        fileToDataUrl(imgInput).then(dataUrl => {
            sendRequestToServer({
                name: nameInput || null,
                email: emailInput || null,
                password: passwordInput || null,
                bio: bioInput || null,
                image: dataUrl 
            });
        }).catch(error => {
            console.error("Error converting image to DataURL:", error);
        });
    } else {
        sendRequestToServer({
            name: nameInput || null,
            email: emailInput || null,
            password: passwordInput || null,
            bio: bioInput || null
        });
    }
}



// update new profile info
document.querySelector('#newProfileBtn').addEventListener('click',()=>{
    updateProfile();
})

// show profile modal
document.querySelector("#profileTitle").addEventListener('click',()=>{
    const userId = localStorage.getItem('userId')
    window.location.hash = `userId={${userId}}`
    document.querySelector('.profileTitleModal').style.display = 'block';
})
// close modal
document.querySelector('.proTiCloseBtn').addEventListener('click',()=>{
    window.location.hash = ``;
    document.querySelector('.profileTitleModal').style.display = 'none';
    
})

document.querySelector('.procloseBtn').addEventListener('click',()=>{
    document.querySelector('.profileModal').style.display = 'none';
})


