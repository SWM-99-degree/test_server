//express server skeleton only require express and body-parser and no config and etc files.
//require express and body-parser
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const logger = require('morgan')
dotenv.config();
//create express app
const app = express();
app.use(logger());
//parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
//parse requests of content-type - application/json
app.use(bodyParser.json());



//enable cors for all origins
app.get('/', (req, res) => {
        res.send(`<a href="https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_REST_API_KEY}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code">Login with Kakao</a>`);
    }
);

app.get('/oauth', async (req, res) => {
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

        res.send(kakaoUser);
        console.log(kakaoUser);
    }
    catch(error){
        console.log(error);
    }
});
//open port 3000 for listening
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is listening on port ${process.env.PORT}`);
}
);


app.get('/fcm', async (req, res) =>{
    res.send(`<html>
    <head>
    <script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCRGiwGkiatM1kHnKWfd0tXceWHWJxiWRA",
    authDomain: "jaribean-3af6f.firebaseapp.com",
    projectId: "jaribean-3af6f",
    storageBucket: "jaribean-3af6f.appspot.com",
    messagingSenderId: "508384819940",
    appId: "1:508384819940:web:f14eda8ab95a047e19caf1",
    measurementId: "G-CQJ8KGXR9L"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const messaging = firebase.messaging();
  messaging.getToken({vapidKey: "BMfsY5QIeibkEKjH0O_oQxIQMaKLWX5gmYk3K_Lr9WnkT9059twffrB6lFkZRfDxJT6t80DEaawUJIc4RIiqnio"});
  messaging.onMessage((payload) => {
    console.log('Message received. ', payload);
    });

</script>
</head>
<body>
`)
})