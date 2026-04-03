img.onload = () => drawWheel(0); // Redraw the wheel after the image loads
img.onerror = () => {
    console.warn('Failed to load image for ${p.username}: ${p.photo}');
    // Use a placeholder if the image fails to load
    images[p.photo] = new Image();
    images[p.photo].src = "https://via.placeholder.com/100"; 
    drawWheel(0);
};
images[p.photo] = img;

drawWheel(0); // Draw the wheel statically

// Function to draw the wheel
function drawWheel(rotation) {
    const total = players.reduce((s, p) => s + p.amount, 0);
    const centerX = 250, centerY = 250, radius = 240; // Center and radius of the wheel
    ctx.clearRect(0, 0, 500, 500); // Clear canvas before each redraw
    
    // If there are no players, draw an empty circle
    if (players.length === 0) {
        ctx.beginPath();
        ctx.fillStyle = '#1c1c1e';
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        return;
    }

    let startAngle = rotation - Math.PI / 2; // Starting angle for the first segment
    players.forEach(p => {
        const slice = (p.amount / total) * Math.PI * 2; // Size of the segment
        ctx.beginPath(); 
        ctx.fillStyle = p.color || '#cccccc'; // Segment color, default gray
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + slice);
        ctx.fill();
        
        // Draw border around the segment
        ctx.strokeStyle = '#2c2c2e'; 
        ctx.lineWidth = 2; 
        ctx.stroke();

        // Draw player avatar in the center of the segment
        if (images[p.photo] && images[p.photo].complete && images[p.photo].naturalHeight !== 0) {
            ctx.save(); 
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + slice / 2);
            ctx.beginPath(); 
            ctx.arc(radius * 0.75, 0, 25, 0, Math.PI * 2); 
            ctx.closePath();
            ctx.clip(); // Clip the image to a circle
            ctx.drawImage(images[p.photo], radius * 0.75 - 25, -25, 50, 50);
            ctx.restore();
        }
        startAngle += slice; // Move to the next segment
    });
}

// Function to animate the wheel
function animateWheel(seed, winner, bank) {
    console.log('Starting wheel animation with seed:', seed, 'winner:', winner.username);
    let start = null;
    const duration = 6000; // Duration of animation (6 seconds)
    const totalRotation = (20 + (seed % 10)) * Math.PI * 2; // Total rotations using seed
    let currentRotation = 0;

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // Easing function
        currentRotation = ease * totalRotation; // Calculate current rotation angle
        drawWheel(currentRotation); // Redraw the wheel

        if (progress < 1) {
            requestAnimationFrame(step); // Continue animation
        } else {
            console.log('Animation finished. Final rotation:', currentRotation);
            // Show winner UI
            showWinnerUI(winner, bank);
        }
    }
    requestAnimationFrame(step); // Start animation
}

// Function to display winner UI
function showWinnerUI(winner, bank) {
    const total = players.reduce((s, p) => s + p.amount, 0);
    document.getElementById('win-game-id').innerText = currentGameId;
    document.getElementById('win-u-img').src = winner.photo;
    document.getElementById('win-u-nick').innerText = '${winner.username}';
    document.getElementById('win-u-sum').innerText = bank.toFixed(2);
    document.getElementById('win-card-sum').innerText = bank.toFixed(2);
}
