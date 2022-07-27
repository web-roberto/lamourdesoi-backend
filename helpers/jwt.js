const expressJwt = require('express-jwt');

function authJwt() {
    console.log('R:----DENTRO DE--jwt.js authJwt)');
    const secret = process.env.secret;
    const api = process.env.API_URL;
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked,
    }).unless({
        path: [
            { url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
            {
                url: /\/api\/v1\/orders(.*)/,
                methods: ['GET', 'OPTIONS', 'POST'],
            },
            `${api}/users/login`,
            `${api}/users/register`,
        ],
    });
}

async function isRevoked(req, payload, done) {
    console.log('R:----DENTRO DE-- jwt.js isRevoked)');
    if (!payload.isAdmin) {
        done(null, true); //jwt rejected
    }
    done(); //jwt accepted
}

module.exports = authJwt;
