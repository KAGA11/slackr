import { changeVisbility,showErrorPopup} from './helpers.js';
import { IntervalObject,UpdateDay } from './message.js'; 
// Login Function
const login = () => {
    window.location.hash = ``;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const url =  'http://localhost:5005/auth/login';
    const jsonString = JSON.stringify({email,password})
    const requestStructure = {
        method:'POST',
        headers: { 'Content-Type': 'application/json' },
        body:jsonString
    }

    fetch(url, requestStructure).then((response) => {
        if (response.ok) {
            response.json().then((data) => {
                localStorage.setItem('token', data['token']);
                localStorage.setItem('userId',data['userId']);
                changeVisbility('login','main');
            })
        } else {
            response.json().then((data) => {
                showErrorPopup(data["error"]);
            });
        }
    }); 
};

document.getElementById('loginForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    login();
});


// change to signup page
const btnSignup = document.querySelector('#btn-signup');
btnSignup.addEventListener('click', (e) => {
    e.preventDefault();  
    changeVisbility('login','signup');
});


const signup = () =>{
    const email = document.getElementById('signupEmail').value;
    const name = document.getElementById('name').value;
    const password = document.getElementById('passwordSIGN').value;
    const confirm = document.getElementById('passwordCHECK').value;

    if(!password || !confirm){
        showErrorPopup('Password fields cannot be empty!'); 
        console.error("Password fields cannot be empty!");
        return;
    }

    if (password.toString() !== confirm.toString()) {
        showErrorPopup("Please make sure your passwords match.");
        return;
    }

    const jsonString = JSON.stringify({
        email: email,
        password: password,
        name: name,
    });

    const requestStructure = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonString,
    };

    fetch('http://localhost:5005/auth/register', requestStructure).then((response) => {
        if (response.ok) {
            response.json().then((data) => {
                localStorage.setItem('token', data['token']);
                changeVisbility('signup', 'main');
            })           
        } else {
            response.json().then((data) => {
                showErrorPopup(data["error"]);
            });
        }
    });
}

// sign up
document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    signup();
});



// logout
const logout = () => {
    const token = localStorage.getItem('token');
    const url = 'http://localhost:5005/auth/logout';
    const requestStructure = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
    };

    fetch(url, requestStructure).then(response => {
        if (response.ok) {
            localStorage.removeItem('token');
            changeVisbility('main','login');
        } else {
            response.json().then((data) => {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                changeVisbility('main','login');
                showErrorPopup(data["error"]);
            });
        }
    });
};

document.getElementById('btn-logout').addEventListener('click',()=>{
    logout();
    document.getElementById('email').value = "";
    document.getElementById('password').value = "";
})



// back to home page
const backHome = ()=>{
    clearInterval(IntervalObject.intervalId);
    const home = document.querySelector('.home');
    home.innerHTML = ''; 

    const defaultHome = document.createElement('div');
    defaultHome.className = 'defaultHome';

    const dateDiv = document.createElement('div');
    dateDiv.id = 'dateDiv';
    dateDiv.innerHTML = `今天是 2023 年的第 <span id="dayCount">0</span> 天`;

    const yearPercentage = document.createElement('div');
    yearPercentage.id = 'yearPercentage';
    yearPercentage.innerHTML = `今年已过 <span id="percentage">0.00%</span>`;

    const dayPercentage = document.createElement('div');
    dayPercentage.id = 'dayPercentage';
    dayPercentage.innerHTML = `今天已过 <span id="dayPercentageValue">0.00%</span>`;

    const messageDiv = document.createElement('div');
    messageDiv.id = 'messageDiv';
    messageDiv.textContent = '活在当下，珍惜眼下';

    defaultHome.appendChild(dateDiv);
    defaultHome.appendChild(yearPercentage);
    defaultHome.appendChild(dayPercentage);
    defaultHome.appendChild(messageDiv);

    home.appendChild(defaultHome);

    IntervalObject.intervalId = setInterval(UpdateDay, 1000);
    UpdateDay();
}

document.getElementById('btn-home').addEventListener('click',()=>{
    window.location.hash = '';
    backHome();
})