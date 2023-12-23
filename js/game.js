function onWindowResize(camera, renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function aiMovement(paddle2, ball, isPlayingAgainstAI, aiReactionDelay, aiErrorMargin, paddleSpeed) {
    let paddle2Speed = 0;
    let aiTargetY = ball.position.y + (Math.random() - 0.5) * 2 * aiErrorMargin;

    if (Math.abs(aiTargetY - paddle2.position.y) > 0.5) {
        paddle2Speed = aiTargetY > paddle2.position.y ? paddleSpeed : -paddleSpeed;
    }
    return {paddle2Speed};
}


function bounceBall(paddle1, paddle2, ball, ballSpeedX, ballSpeedY, ballAcceleration, paddle1Speed, paddle2Speed) {
    let paddle1Bounds = new THREE.Box3().setFromObject(paddle1);
    let paddle2Bounds = new THREE.Box3().setFromObject(paddle2);
    let ballBounds = new THREE.Box3().setFromObject(ball);


    if (paddle1Bounds.intersectsBox(ballBounds)) {
        document.getElementById('hitSound').play();
        ballSpeedX *= -1 * ballAcceleration;
        ballSpeedY += paddle1Speed * 0.1;
    }
    if (paddle2Bounds.intersectsBox(ballBounds)) {
        document.getElementById('hitSound').play();
        ballSpeedX *= -1 * ballAcceleration;
        ballSpeedY += paddle2Speed * 0.1;
    }

    return {ballSpeedX, ballSpeedY};
}

export {onWindowResize, aiMovement, bounceBall};