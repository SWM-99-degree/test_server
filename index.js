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
        //get code from queryparams
        const { code } = req.query;
        res.redirect(`${callbackUrlScheme}://code?code=${code}`);
    }
    catch(error){
        console.log(error);
    }
});

app.post('/user/login/kakao', async (req, res) => {
    try{
        const { code } = req.body;
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
        userId = kakaoUser.id;
        userName = kakaoUser.properties.nickname;

        const accessToken = jwt.sign({userId, userName}, process.env.JWT_SECRET);
        const refreshToken = jwt.sign({userId, userName}, process.env.JWT_SECRET);
        res.header('Content-Type', 'application/json');
        res.send(JSON.stringify({ accessToken, refreshToken }));
    }
    catch(error){
        res.status(502).send('error');
    }  
});

app.post('/user/login', (req, res) => {
    try{
        const { userId, userName } = req.body;
        const accessToken = jwt.sign({ userId, userName }, process.env.JWT_SECRET);
        const refreshToken = jwt.sign({ userId, userName }, process.env.JWT_SECRET);
        res.header('Content-Type', 'application/json');
        res.send(JSON.stringify({ accessToken, refreshToken }));
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

