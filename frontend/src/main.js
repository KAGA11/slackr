import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl,showErrorPopup,closeErrorPopup,getUserAvatar } from './helpers.js';

// console.log('Let\'s go!');
window.location.hash = ``;





document.getElementById('profileAvatar').addEventListener('click',()=>{
    const userId = localStorage.getItem('userId');
    getUserAvatar(userId).then(img =>{
        document.getElementById('profileAvatar').src = img
    });
})


document.getElementById('close-error-popup').addEventListener('click', closeErrorPopup);


