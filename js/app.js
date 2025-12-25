document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Generate the Volumetric Modules (The Grid)
    const grid = document.getElementById('grid');
    const numModules = 36; // Creates a 6x6 grid
    
    for (let i = 0; i < numModules; i++) {
        const div = document.createElement('div');
        div.classList.add('module');
        
        // Randomize opacity to make it look like a cityscape/texture
        // Some blocks are solid, some are faint
        div.style.opacity = Math.random() * 0.25; 
        
        grid.appendChild(div);
    }

    // 2. Add Mouse Move Parallax Effect (The "Playful" part)
    document.addEventListener('mousemove', (e) => {
        const modules = document.querySelectorAll('.module');
        
        // Calculate mouse position relative to center of screen
        const x = (window.innerWidth - e.pageX * 2) / 100;
        const y = (window.innerHeight - e.pageY * 2) / 100;

        modules.forEach((mod, index) => {
            // "Speed" creates depth. 
            // Blocks with different indices move at different rates.
            const speed = index % 5; 
            
            mod.style.transform = `translateX(${x * speed}px) translateY(${y * speed}px)`;
        });
    });

    // 3. Touch support for Mobile
    document.addEventListener('touchmove', (e) => {
        if(e.touches.length > 0) {
            const touch = e.touches[0];
            const x = (window.innerWidth - touch.pageX * 2) / 100;
            const y = (window.innerHeight - touch.pageY * 2) / 100;
            
            const modules = document.querySelectorAll('.module');
            modules.forEach((mod, index) => {
                const speed = index % 5;
                mod.style.transform = `translateX(${x * speed}px) translateY(${y * speed}px)`;
            });
        }
    });
});