const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;

// --- STATE MANAGEMENT ---
// We use "phases" to tell the story
let phase = 'walk_in'; // Options: walk_in, reading, walk_out, crane_enter, building, reset
let frameCount = 0; // Internal clock

// --- ACTORS ---
const architect = {
    x: -50, // Starts off-screen left
    y: 0,   // Will be set relative to ground
    w: 20,
    h: 50,
    legAngle: 0,
    speed: 2
};

const crane = {
    x: 2000, // Starts off-screen right
    y: 0,
    targetX: 0,
    extension: 0,
    hookHeight: 0
};

const modules = []; // Array to hold the building blocks
let currentFloor = 0;
const maxFloors = 6;
const floorHeight = 40;
const moduleWidth = 60;

// --- SETUP ---
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    
    // Set Ground Level (lower 3rd of screen)
    const groundLevel = height - 100;
    architect.y = groundLevel;
    crane.y = groundLevel;
    crane.targetX = width - 250; // Crane stops on the right side
    crane.x = width + 200; // Reset crane position
}

window.addEventListener('resize', resize);
resize();

// --- DRAWING FUNCTIONS ---

function drawGround() {
    ctx.beginPath();
    ctx.moveTo(0, architect.y);
    ctx.lineTo(width, architect.y);
    ctx.strokeStyle = '#444'; // Dark grey ground line
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawStickman(x, y, isWalking, holdingPaper) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    // Head
    ctx.beginPath();
    ctx.arc(x, y - 50, 8, 0, Math.PI * 2);
    ctx.stroke();
    
    // Body
    ctx.beginPath();
    ctx.moveTo(x, y - 42);
    ctx.lineTo(x, y - 20);
    ctx.stroke();
    
    // Legs (Simple walking animation)
    const legOffset = isWalking ? Math.sin(frameCount * 0.2) * 10 : 0;
    
    // Left Leg
    ctx.beginPath();
    ctx.moveTo(x, y - 20);
    ctx.lineTo(x - legOffset, y);
    ctx.stroke();

    // Right Leg
    ctx.beginPath();
    ctx.moveTo(x, y - 20);
    ctx.lineTo(x + legOffset, y);
    ctx.stroke();
    
    // Arms
    ctx.beginPath();
    ctx.moveTo(x, y - 35);
    if (holdingPaper) {
        // Holding blueprint up
        ctx.lineTo(x + 15, y - 45); 
        ctx.stroke();
        
        // The Blueprint Paper
        ctx.fillStyle = '#009B77'; // n20k Green
        ctx.fillRect(x + 15, y - 55, 20, 15);
    } else {
        // Arms down
        ctx.lineTo(x, y - 10);
        ctx.stroke();
    }
}

function drawCrane(x, y) {
    ctx.strokeStyle = '#009B77'; // n20k Green Crane
    ctx.lineWidth = 4;
    
    // Wheels
    ctx.beginPath();
    ctx.arc(x - 20, y - 10, 10, 0, Math.PI * 2);
    ctx.arc(x + 20, y - 10, 10, 0, Math.PI * 2);
    ctx.stroke();
    
    // Base
    ctx.fillStyle = '#009B77';
    ctx.fillRect(x - 40, y - 25, 80, 15);
    
    // Tower (Vertical)
    ctx.beginPath();
    ctx.moveTo(x, y - 25);
    ctx.lineTo(x, y - 300); // Tall tower
    ctx.stroke();
    
    // Jib (Horizontal Arm)
    ctx.beginPath();
    ctx.moveTo(x, y - 300);
    ctx.lineTo(x - 150, y - 300); // Pointing left towards building site
    ctx.stroke();
    
    // Cable
    const cableX = x - 150;
    // Animate cable going up and down
    const cableY = y - 300 + (Math.sin(frameCount * 0.05) * 20) + 50; 
    
    ctx.beginPath();
    ctx.moveTo(cableX, y - 300);
    ctx.lineTo(cableX, cableY);
    ctx.strokeStyle = '#fff'; // White cable
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Hook
    ctx.strokeRect(cableX - 5, cableY, 10, 10);
}

function drawBuilding(x, y) {
    // Draw completed modules
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(0, 155, 119, 0.3)'; // Semi-transparent green fill

    modules.forEach((mod, index) => {
        // Blueprint style box
        ctx.strokeRect(mod.x, mod.y, moduleWidth, floorHeight);
        ctx.fillRect(mod.x, mod.y, moduleWidth, floorHeight);
        
        // "X" cross-bracing pattern inside (blueprint look)
        ctx.beginPath();
        ctx.moveTo(mod.x, mod.y);
        ctx.lineTo(mod.x + moduleWidth, mod.y + floorHeight);
        ctx.moveTo(mod.x + moduleWidth, mod.y);
        ctx.lineTo(mod.x, mod.y + floorHeight);
        ctx.lineWidth = 0.5;
        ctx.stroke();
    });
}

// --- MAIN LOOP ---

function animate() {
    ctx.clearRect(0, 0, width, height); // Clear screen
    drawGround();
    
    // Center point for the building
    const buildSiteX = width / 2 - 30; // Slightly left of center

    // --- PHASE LOGIC ---
    
    if (phase === 'walk_in') {
        // Architect walks to center
        architect.x += architect.speed;
        drawStickman(architect.x, architect.y, true, false);
        
        if (architect.x > buildSiteX - 100) {
            phase = 'reading';
            frameCount = 0; // Reset timer for reading
        }
    } 
    
    else if (phase === 'reading') {
        // Architect looks at plans
        drawStickman(architect.x, architect.y, false, true);
        frameCount++;
        
        // Read for 120 frames (approx 2 seconds)
        if (frameCount > 120) {
            phase = 'walk_out';
        }
    } 
    
    else if (phase === 'walk_out') {
        // Architect leaves to the left
        architect.x -= architect.speed;
        drawStickman(architect.x, architect.y, true, true); // Walks away with plan
        
        if (architect.x < -100) {
            phase = 'crane_enter';
        }
    } 
    
    else if (phase === 'crane_enter') {
        // Crane drives in from right
        if (crane.x > crane.targetX) {
            crane.x -= 4; // Drive speed
        } else {
            phase = 'building';
            frameCount = 0;
        }
        drawCrane(crane.x, crane.y);
        drawBuilding(buildSiteX, architect.y);
    } 
    
    else if (phase === 'building') {
        drawCrane(crane.x, crane.y);
        drawBuilding(buildSiteX, architect.y);
        
        frameCount++;
        
        // Add a new floor every 60 frames (1 second)
        if (frameCount % 60 === 0 && currentFloor < maxFloors) {
            modules.push({
                x: buildSiteX,
                y: architect.y - ((currentFloor + 1) * floorHeight) // Stack upwards
            });
            currentFloor++;
        }
        
        if (currentFloor === maxFloors) {
            // Wait a moment then reset
            if (frameCount > (maxFloors * 60) + 100) {
                phase = 'reset';
            }
        }
    } 
    
    else if (phase === 'reset') {
        // Fade out or wipe effect could go here
        // For now, hard reset
        modules.length = 0;
        currentFloor = 0;
        architect.x = -50;
        phase = 'walk_in';
        frameCount = 0;
        
        // Move crane away instantly for next loop
        crane.x = width + 200; 
    }

    // Always increment global frame count for animations
    frameCount++;
    requestAnimationFrame(animate);
}

// Start
animate();