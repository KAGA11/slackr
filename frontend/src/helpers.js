/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * 
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 */
export function fileToDataUrl(file) {
    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);
    // Bad data, let's walk away.
    if (!valid) {
        throw Error('provided file is not a png, jpg or jpeg image.');
    }
    
    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve,reject) => {
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
}

export const changeVisbility = (hideId, showId) => {
    document.getElementById(hideId).classList.add('hide');
    document.getElementById(showId).classList.remove('hide');
};




// Show error popup with a given message
export const showErrorPopup = (message) => {
    document.getElementById('error-message').innerText = message;
    document.getElementById('error-popup').classList.remove('hide');
};
  
export const closeErrorPopup = () => {
    document.getElementById('error-popup').classList.add('hide');
};
  

  
  // Example usage
  // This is how you can use the showErrorPopup function whenever an error occurs
  // showErrorPopup('An unexpected error occurred.');
  

export function getChannelIdFromHash() {
    const match = window.location.hash.match(/#channel=\{(\d+)\}/);
    return match ? match[1] : null;
}

export function formatDate(isoString) {
    const date = new Date(isoString);
    const formattedDate = `${date.toLocaleString('default', { month: 'long' })} ${date.getDate()}, ${date.getFullYear()} at ${date.getUTCHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()} ${date.getHours() < 12 ? 'AM' : 'PM'}`;
    return formattedDate;
}


export function getUserName(userId){
    const token = localStorage.getItem('token');
    const url = `http://localhost:5005/user/${userId}`;
    const requestStructure = {
        method: 'GET', 
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
    }
    return fetch(url,requestStructure).then(response => response.json())
    .then(data =>{
        return data.name;
    })
}

export function getUserAvatar(userId){
    const token = localStorage.getItem('token');
    const url = `http://localhost:5005/user/${userId}`;
    const requestStructure = {
        method: 'GET', 
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
    }
    return fetch(url,requestStructure).then(response => response.json())
    .then(data =>{
        console.log(data);
        return data.img;
    })
}


