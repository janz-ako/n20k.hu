const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// Configuration
const spacing = 45; // Space between dots (Increase this number for fewer dots)
const mouse = { x: -1000, y: -1000 }; // Start mouse off-screen so it doesn't trigger initially

// Resize Canvas to Full Screen
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initParticles();
}

// Create the grid of dots
function initParticles() {
    particles = [];
    // Loop through the screen width/height to place dots
    for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
            particles.push({
                x: x + spacing / 2, // Center the dot in its cell
                y: y + spacing / 2,
                baseRadius: 1.5,    // Default tiny size
                color: 'rgba(255, 255, 255, 0.1)' // Faint grey (un-active state)
            });
        }
    }
}

// Animation Loop (Runs 60 times per second)
function animate() {
    ctx.clearRect(0, 0, width, height); // Clear screen for next frame

    particles.forEach(p => {
        // Calculate distance from this dot to the mouse
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Interaction Zone (300px radius around mouse)
        const maxDist = 300;
        
        if (dist < maxDist) {
            // Calculate intensity (0 to 1) based on closeness
            const force = (maxDist - dist) / maxDist;
            
            // Draw Active Dot (Green & Larger)
            const radius = p.baseRadius + (force * 3); // Grows up to 4.5px
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            
            // Dynamic Green color: Fades out as you get further away
            ctx.fillStyle = `rgba(0, 155, 119, ${force})`; 
            ctx.fill();
        } else {
            // Draw Idle Dot (Grey & Small)
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.baseRadius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        }
    });

    requestAnimationFrame(animate);
}

// Event Listeners
window.addEventListener('resize', resize);

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

// Touch support for Mobile
window.addEventListener('touchmove', (e) => {
    if(e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    }
});

// Start the engine
resize();
animate();