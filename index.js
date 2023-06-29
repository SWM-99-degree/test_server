//express server skeleton only require express and body-parser and no config and etc files.
//require express and body-parser
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();
//create express app
const app = express();
//parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
//parse requests of content-type - application/json
app.use(bodyParser.json());
//enable cors for all origins
app.get('/', (req, res) => {
        res.send('<a href="https://kauth.kakao.com/oauth/authorize?client_id=1dc8739f9827f96eccc7cd66a524c434&redirect_uri=http://localhost:3000/oauth&response_type=code">Login with Kakao</a>');
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
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
}
);
