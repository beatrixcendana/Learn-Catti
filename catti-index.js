const Jimp = require('jimp');

exports.handler = async (event) => { //going to return something
    
    const requestObj = getRequestObj(event);
    if (requestObj.random === "true") {
        requestObj.category = "";
        requestObj.text = randomText();
        requestObj.rotate = randomNumber(0,360);
        requestObj.flip = Math.random() > 0.5 ? "v" : "h";
    }
    const catUrl = getCat(requestObj);
    const base64Str = await manipulateImg("https://cataas.com/cat", requestObj);
    
    return {
        headers: {
            "Access-Control-Allow-Headers": "Content-Type", // what headers gonna take from request, only allow content type header
            "Access-Control-Allow-Origin": "*", // what domain encounter, www or dave.com. Star allows everything.
            "Access-Control-Allow-Methods": "OPTIONS, POST, GET"
        },
        body: JSON.stringify({ base64Str })
    };
};

function randomText() {
    const rtext = [
        "Perfect",
        "Pawfect",
        "Sweet",
        "Lovely"
        ];
        
        return rtext[Math.floor(Math.random() * rtext.length)];
}


function randomNumber(min, max) {
    return Math.floor(Math.random() * max) + min
}
function getRequestObj (event) {
    const text = event["queryStringParameters"]["text"];
    const rotate = event["queryStringParameters"]["rotate"];
    const category = event["queryStringParameters"]["category"];
    const flip = event["queryStringParameters"]["flip"]; // v, h, b
    const random = event["queryStringParameters"]["random"];
    return {
        text, rotate, flip, category, random
    }
}

function getCat(requestObj) {
    if (requestObj.category) {
        return `https://cataas.com/cat/${requestObj.category}`
    }
    
    return `https://cataas.com/cat`
}

async function manipulateImg(catUrl, requestObj) {
    const image = await Jimp.read(catUrl);
    let response;
    
    // rotate image
    if (requestObj.rotate) {
        const rotateDeg = parseInt(requestObj.rotate);
        await image.rotate(rotateDeg);
    
    }
    
    // rotate the image. rotate is jimp method
    
    // flip image
    if (requestObj.flip === "v") {
        await image.flip(false, true);
    }
    else if (requestObj.flip === "h") {
        await image.flip(true, false);
    }
    else if (requestObj.flip === "b") {
        await image.flip(true, true); 
    }
 
    
    // same if with the text
    if (requestObj.text) {
        const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
        await image.print(font, 50, 50, requestObj.text);
    
    }
    
    
    // image as base64 string
    image.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
        if(err) {
            return;
        }
        response = Buffer.from(buffer).toString('base64');
    });
    
    return response;
}
