var rotationSpeed_inc = 1.6;
var currentRotationSpeed = 0;
var DECELERATION = 2;
function setupEventHandler() {
    document.addEventListener('keydown', function(event) {
    //rotationSpeed_inc = 1.6;
    console.log(event.keyCode);
    if(event.keyCode == 32)
        rotationSpeed_inc = 5;    
    if(event.keyCode == 37) {
        console.log(rotationSpeed_inc);
    ball.rotationSpeed = rotationofballspeed(currentRotationSpeed + rotationSpeed_inc,-ball.maxRotationSpeed, ball.maxRotationSpeed);
   event.preventDefault();
    }
    else if(event.keyCode == 39) {
    ball.rotationSpeed = rotationofballspeed(currentRotationSpeed - rotationSpeed_inc,-ball.maxRotationSpeed, ball.maxRotationSpeed);
    event.preventDefault();
    }
});
}

function rotationofballspeed(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function handleInput(elapsedTime) {
    if(rotationSpeed_inc > 1.6)
        rotationSpeed_inc -= .05;
    if (ball.rotationSpeed > 0)
        ball.rotationSpeed = Math.max(0, ball.rotationSpeed - DECELERATION * elapsedTime);
    else if (ball.rotationSpeed < 0)
        ball.rotationSpeed = Math.min(0, ball.rotationSpeed + DECELERATION * elapsedTime);
    cylinder.angle += ball.rotationSpeed * elapsedTime;
}

