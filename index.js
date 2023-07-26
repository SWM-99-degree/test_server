//express server skeleton only require express and body-parser and no config and etc files.
//require express and body-parser
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const logger = require('morgan')
const jwt = require('jsonwebtoken');
dotenv.config();
//create express app
const app = express();
app.use(logger());
//parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
//parse requests of content-type - application/json
app.use(bodyParser.json());
//user js folder
app.use(express.static('js'));
const callbackUrlScheme = 'jaribean';



//enable cors for all origins
app.get('/', (req, res) => {
        res.send(`<a href="https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_REST_API_KEY}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code">Login with Kakao</a>`);
    }
);

app.get('/oauth/kakao', async (req, res) => {
    try{
        const{
            data: {access_token : kakaoAccessToken}
        } = await axios('https://kauth.kakao.com/oauth/token', {
            params: {
                grant_type: 'authorization_code',
                client_id: process.env.KAKAO_REST_API_KEY,
                redirect_uri: process.env.KAKAO_REDIRECT_URI,
                code: req.query.code,
            },
        });

        const { data : kakaoUser } = await axios('https://kapi.kakao.com/v2/user/me', {
            headers: {
                Authorization: `Bearer ${kakaoAccessToken}`,
            },
        });
        res.redirect(`${callbackUrlScheme}://login?userId=${kakaoUser.id}&userName=${kakaoUser.properties.nickname}`);
        // const token = jwt.sign(kakaoUser, process.env.JWT_SECRET);
        console.log(kakaoUser);
    }
    catch(error){
        console.log(error);
    }
});

app.post('/user/login', (req, res) => {
    try{
        const { userId, userName } = req.body;
        const accessToken = jwt.sign({ userId, userName }, process.env.JWT_SECRET);
        res.header('authorization', accessToken);
        const refreshToken = jwt.sign({ userId, userName }, process.env.JWT_SECRET);
        res.header('refreshToken', refreshToken);
        res.send('login success');
    }
    catch(error){
        res.status(502).send('error');
    }
    
});

//open port 3000 for listening
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is listening on port ${process.env.PORT}`);
}
);


app.get('/fcm', async (req, res) =>{
    res.send(`
    <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<div class="container">
    <div>Notification data will receive here if the app is open, and focused</div>
    <div class="message" style="min-height: 80px;"></div>
    <div>Device Token:</div>
</div>

<body>
    <script src="https://www.gstatic.com/firebasejs/9.14.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.14.0/firebase-messaging-compat.js"></script>
    <script>
        const firebaseConfig = {
                    apiKey: "AIzaSyCRGiwGkiatM1kHnKWfd0tXceWHWJxiWRA",
                    authDomain: "jaribean-3af6f.firebaseapp.com",
                    projectId: "jaribean-3af6f",
                    storageBucket: "jaribean-3af6f.appspot.com",
                    messagingSenderId: "508384819940",
                    appId: "1:508384819940:web:f14eda8ab95a047e19caf1",
                    measurementId: "G-CQJ8KGXR9L"
                };
                const app = firebase.initializeApp(firebaseConfig)
                const messaging = firebase.messaging();

        messaging.getToken({ vapidKey: 'BMfsY5QIeibkEKjH0O_oQxIQMaKLWX5gmYk3K_Lr9WnkT9059twffrB6lFkZRfDxJT6t80DEaawUJIc4RIiqnio' }).then((currentToken) => {
            // app token used for sending notifications
            if (currentToken) {
                console.log(currentToken);
                document.querySelector('body').append(currentToken)
                sendTokenToServer(currentToken)
            }else{
                setTokenSentToServer(false);
            }
        }).catch((err) => {
            // notifications are manually blocked, you can ask for unblock here
            console.log('An error occurred while retrieving token. ', err);
            setTokenSentToServer(false);
        });

        messaging.onMessage((payload) => {
            // notification data receive here, use it however you want
            // keep in mind if message receive here, it will not notify in background
            console.log('Message received. ', payload);
            const messagesElement = document.querySelector('.message');
            const dataHeaderElement = document.createElement('h5');
            const dataElement = document.createElement('pre');
            dataElement.style = 'overflow-x:hidden;';
            dataHeaderElement.textContent = 'Message Received:';
            dataElement.textContent = JSON.stringify(payload, null, 2);
            messagesElement.appendChild(dataHeaderElement);
            messagesElement.appendChild(dataElement);
        });

        function sendTokenToServer(currentToken) {
            if (!isTokenSentToServer()) {
                console.log('Sending token to server...');
                // TODO(developer): Send the current token to your server.
                setTokenSentToServer(true);
            } else {
                console.log('Token already available in the server');
            }
        }

        function isTokenSentToServer() {
            return window.localStorage.getItem('sentToServer') === '1';
        }

        function setTokenSentToServer(sent) {
            window.localStorage.setItem('sentToServer', sent ? '1' : '0');
        }
    </script>
</body>

</html>`)
})
