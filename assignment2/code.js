//import { listenerCount } from "cluster";

//----------- SERVER PART -------------

//get the nickname of the user and connect to the server
function connect()
{
    var name = document.getElementById("connect").value;
    var connection = new WebSocket('ws://127.0.0.1:9022');

    connection.onopen = function()
    {
        //main app loop
        init( name );
    
        var msg = {
            user_name: objects[0].name,
            position: objects[0].posX,
            type: 'init',
            index: objects[0].index
        };
    
        connection.send(JSON.stringify(msg));
        loop();
    }
};

function sendInitMessage()
{
    var msg = {
        user_name: objects[0].name,
        type: 'init',
        position: objects[0].posX,
        index: objects[0].index
    }
};

connection.onmessage = function( message )
{
    var msgParsed = JSON.parse( message.data );

    if( msgParsed.type === 'init')
    {
        var img = new Image();
        img.src = "spritesheets/man" + msgParsed.index + "-spritesheet.png";

        var user = {
            posX: msgParsed.position,
            posY: canvas.height * 0.5,
            goalPosX: msgParsed.position,
            goalPosY: canvas.height * 0.5,
            index: msgParsed.index,
            flip: false,
            frame: idle,
            vel: 50,
            img: img
        }
        objects.push(user);
    }
    else if ( msgParsed.type === 'msg')
    {
        var message = document.createTextNode( msgParsed.name + ": " + msgParsed.data );
        var li = document.createElement( "LI" );
        li.setAttribute("id", "otherMessage")
        li.appendChild( message );
        document.getElementById( "message-list" ).appendChild( li );
    }
    else if( msgParsed.type === 'id')
    {
        objects[0].id = msgParsed.data;
    }
};

//---------- LOGIC APP -----------

var canvas = document.getElementById("myCanvas");
var rect;

var messageHistory = [];

var last = performance.now();
var objects = [];
var idle = [0];
var walking = [2, 3, 4, 5, 6, 7, 8];
var sprite_list = ["man1-spritesheet.png", "man2-spritesheet.png", "man3-spritesheet.png", "man4-spritesheet.png",
        "woman1-spritesheet.png", "woman2-spritesheet.png", "woman3-spritesheet.png", "woman4-spritesheet.png"]

function draw()
{
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var t = Math.floor(performance.now() * 0.001 * 10);

    for(var i = 0; i < objects.length; i++)
    {
        animation(ctx, objects[i].img, 32, 64, objects[i].posX, objects[i].posY, objects[i].frame[t % objects[i].frame.length], objects[i].flip);
    }
}
function animation(ctx, image, w, h, x, y, frame, flip)
{
    if(flip)
    {
        ctx.drawImage( image, frame * w, 2*h, w, h, x, y, 128, 256 );
    }
    else
    {
        ctx.drawImage( image, frame * w, 0, w, h, x, y, 128, 256 );
    }
}

function update( dt )
{
    var o = objects[0];
    var aux;
    if( o.posX != o.goalPosX)
    {
        o.frame = walking;
        if( o.posX > o.goalPosX)
        {
            o.flip = true;
            aux = o.posX - o.vel * dt;
            (aux < o.goalPosX) ? o.posX = o.goalPosX : o.posX = aux; 
        }
        else
        {
            o.flip = false;
            aux = o.posX + o.vel * dt;
            (aux > o.goalPosX) ? o.posX = o.goalPosX : o.posX = aux;
        }
    }
    else
    {
        o.frame = idle;
    }
};

//init the app with the creation of the user
function init(name)
{
    //init canvas size
    var parent = canvas.parentNode;
    var rect = parent.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    var img = new Image();
    var index = Math.floor(Math.random * 8)
    img.src = sprite_list[index]; //generate random sprite for the character

    user = {
        user_name: name,
        posX: canvas.width * 0.5,
        posY: canvas.height * 0.5,
        goalPosX: canvas.width * 0.5,
        goalPosY: canvas.height * 0.5,
        index: index,
        flip: false,
        frame: idle,
        vel: 50,
        img: img,
        id: null
    };

    objects.push(user);
};

//main app loop
function loop()
{
    draw();

    //calculate time elapsed
    var now = performance.now();
    var dt = (now - last)/1000;
    last = now;

    update( dt );

    requestAnimationFrame( loop );  //call loop again
};

function onMouse ( e )
{
    rect = canvas.parentNode.getBoundingClientRect();
    var canvasx = e.clientX - rect.left;
    var o = objects[0]; //tenir en compte id del user

    if(e.type == 'click')
    {
        o.goalPosX = canvasx;
    }
};

document.body.addEventListener('click', onMouse);

//send message on the chat
function sendMsg()
{
    var text = document.getElementById("message-input").value;
    var message = {
        name: objects[0].name,
        type: 'msg',
        id: objects[0].id,
        data: text
    }

    messageHistory.push( message ); //add message to historic

    var li = document.createElement( "li" );
    li.textContent = "You: " + text;
    li.setAttribute("id", "ownMessage");
    document.getElementById( "message-list" ).appendChild( li );

    connection.send(JSON.stringify(message));

    document.getElementById("message-input").value = "";
};

//code to send messages with the enter button
var input = document.getElementById("message-input");
input.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById("add").click();
    }
});


