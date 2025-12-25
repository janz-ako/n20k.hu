document.addEventListener('DOMContentLoaded', () => {
    
    const grid = document.getElementById('grid');
    const modules = [];
    
    // 1. Calculate how many dots fit on the screen
    // We want a dense grid for the "scanner" look
    const dotSize = 25; // Size + gap
    const cols = Math.floor(window.innerWidth / dotSize);
    const rows = Math.floor(window.innerHeight / dotSize);
    const totalDots = cols * rows;

    // 2. Create the Grid
    for (let i = 0; i < totalDots; i++) {
        const div = document.createElement('div');
        div.classList.add('module');
        grid.appendChild(div);
        modules.push(div);
    }

    // 3. The "Ripple" Function
    function animateGrid(x, y) {
        modules.forEach((mod) => {
            const rect = mod.getBoundingClientRect();
            
            // Calculate center of the dot
            const modX = rect.left + rect.width / 2;
            const modY = rect.top + rect.height / 2;
            
            // Calculate distance from mouse to dot
            const distX = x - modX;
            const distY = y - modY;
            const distance = Math.sqrt(distX * distX + distY * distY);
            
            // The magic zone: effects happen within 300px of the mouse
            const maxDist = 300; 

            if (distance < maxDist) {
                // Calculate intensity (0 to 1)
                const intensity = 1 - (distance / maxDist);
                
                // Scale up and turn green based on proximity
                const scale = 1 + (intensity * 1.5); // Grow up to 2.5x
                const greenValue = Math.floor(intensity * 155); // 0 to 155
                
                mod.style.transform = `scale(${scale})`;
                mod.style.backgroundColor = `rgba(0, 155, 119, ${intensity})`; // n20k Green glow
                mod.style.boxShadow = `0 0 ${intensity * 10}px var(--n20k-green)`;
            } else {
                // Reset if far away
                mod.style.transform = 'scale(1)';
                mod.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                mod.style.boxShadow = 'none';
            }
        });
    }

    // 4. Listeners
    document.addEventListener('mousemove', (e) => {
        // Use RequestAnimationFrame for smooth performance
        requestAnimationFrame(() => {
            animateGrid(e.clientX, e.clientY);
        });
    });

    // Mobile touch
    document.addEventListener('touchmove', (e) => {
        if(e.touches.length > 0) {
            animateGrid(e.touches[0].clientX, e.touches[0].clientY);
        }
    });

    // Auto-wave (optional: gives life even without mouse movement)
    let time = 0;
    /* Uncomment below if you want an automatic idle animation
    setInterval(() => {
        time += 0.05;
        // Simple circular motion for idle state if needed
    }, 50);
    */
});