
// Configuration for the poster elements
const posterConfig = [
    {
        id: 'background',
        url: 'assets/background.svg',
        initialPosition: { x: 0, y: 0 },
        width: 1984.2,
        height: 2834.6001
    },
    {
        id: 'char1',
        url: 'assets/char1.svg',
        initialPosition: { x: 64.7, y: 133 },
        width: 195.4,
        height: 193.6
    },
    {
        id: 'char2',
        url: 'assets/char2.svg',
        initialPosition: { x: 61.7, y: 335.5 },
        width: 200.1,
        height: 185.9
    },
    {
        id: 'char3',
        url: 'assets/char3.svg',
        initialPosition: { x: 86.3, y: 545.9 },
        width: 149.5,
        height: 178.8
    },
    {
        id: 'char4',
        url: 'assets/char4.svg',
        initialPosition: { x: 69.9, y: 755.3 },
        width: 178.8,
        height: 131
    },
    {
        id: 'char5',
        url: 'assets/char5.svg',
        initialPosition: { x: 104.8, y: 905.5 },
        width: 113.7,
        height: 181.1
    },
    {
        id: 'text1',
        url: 'assets/text1.svg',
        initialPosition: { x: 139.4, y: 1770.5 },
        width: 36.2,
        height: 146
    },
    {
        id: 'text2',
        url: 'assets/text2.svg',
        initialPosition: { x: 139.4, y: 1516.7 },
        width: 36.1,
        height: 217.8
    },
    {
        id: 'text3',
        url: 'assets/text3.svg',
        initialPosition: { x: 139.4, y: 1247.3 },
        width: 36.3,
        height: 233.3
    },
    {
        id: 'obj1',
        url: 'assets/obj1.svg',
        initialPosition: { x: 319.3, y: 190.4 },
        width: 1417.3,
        height: 876.1
    },
    {
        id: 'obj2',
        url: 'assets/obj2.svg',
        initialPosition: { x: 484, y: 984.5 },
        width: 1087.6,
        height: 672.3
    },
    {
        id: 'obj3',
        url: 'assets/obj3.svg',
        initialPosition: { x: 588.7, y: 1594.8 },
        width: 878.5,
        height: 543
    },
    {
        id: 'obj4',
        url: 'assets/obj4.svg',
        initialPosition: { x: 687.1, y: 2086.2 },
        width: 681.6,
        height: 421.3
    },
    {
        id: 'credits',
        url: 'assets/credits.svg',
        initialPosition: { x: 1919.7, y: 2338.2 },
        width: 17.5,
        height: 240.7
    },
];
let globalScale = 1;
let globalMargin = 0.9;
let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;
let centerOffsetX = 0;
let centerOffsetY = 0;

// Store loaded SVGs
const loadedSVGs = {};
let assetsLoaded = 0;
const totalAssets = posterConfig.length;

function calculateGlobalScale() {
    return (canvasWidth * globalMargin / posterConfig[0].width) < (canvasHeight * globalMargin / posterConfig[0].height) ?
        (canvasWidth * globalMargin / posterConfig[0].width) :
        (canvasHeight * globalMargin / posterConfig[0].height);
}

// Calculate center offset based on initial positions
function calculateCenterOffset() {
    return {
        x: (canvasWidth / 2 / globalScale) - (posterConfig[0].width / 2),
        y: (canvasHeight / 2 / globalScale) - (posterConfig[0].height / 2)
    };
}

// Preload all SVG assets
function preloadAssets() {
    // Calculate center offset once
    globalScale = calculateGlobalScale();

    const offset = calculateCenterOffset();
    centerOffsetX = offset.x;
    centerOffsetY = offset.y;

    posterConfig.forEach(item => {
        fetch(item.url)
            .then(response => response.text())
            .then(svgText => {
                // Create a container for the SVG
                const container = document.createElement('div');
                container.className = 'draggable';
                container.id = item.id;
                container.style.width = `${item.width * globalScale}px`;
                container.style.height = `${item.height * globalScale}px`;

                // Apply initial position with center offset
                container.style.left = `${(item.initialPosition.x + centerOffsetX) * globalScale}px`;
                container.style.top = `${(item.initialPosition.y + centerOffsetY) * globalScale}px`;

                // Insert the SVG content
                container.innerHTML = svgText;

                // Store reference with transform data
                loadedSVGs[item.id] = {
                    element: container,
                    config: item,
                    baseX: (item.initialPosition.x + centerOffsetX) * globalScale,
                    baseY: (item.initialPosition.y + centerOffsetY) * globalScale,
                    offsetX: 0,
                    offsetY: 0
                };

                assetsLoaded++;

                // Check if all assets are loaded
                if (assetsLoaded === totalAssets) {
                    initializePoster();
                }
            })
            .catch(error => {
                console.error('Error loading SVG:', item.url, error);
                assetsLoaded++;
                if (assetsLoaded === totalAssets) {
                    initializePoster();
                }
            });
    });
}

// Initialize the poster when all assets are loaded
function initializePoster() {
    const poster = document.getElementById('poster');
    poster.style.width = `${canvasWidth}px`;
    poster.style.height = `${canvasHeight}px`;
    poster.style.position = 'relative';
    poster.style.overflow = 'hidden';

    // Add all loaded SVGs to the poster
    Object.values(loadedSVGs).forEach(svgData => {
        poster.appendChild(svgData.element);
    });

    // Set up drag and drop for all elements
    setupDragAndDrop();

    // Handle window resize
    window.addEventListener('resize', handleResize);
}

function handleResize() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    const poster = document.getElementById('poster');
    poster.style.width = `${canvasWidth}px`;
    poster.style.height = `${canvasHeight}px`;

    // Recalculate positions with new dimensions
    const offset = calculateCenterOffset();
    centerOffsetX = offset.x;
    centerOffsetY = offset.y;

    // Update all elements
    Object.values(loadedSVGs).forEach(svgData => {
        svgData.baseX = (svgData.config.initialPosition.x + centerOffsetX) * globalScale;
        svgData.baseY = (svgData.config.initialPosition.y + centerOffsetY) * globalScale;

        svgData.element.style.left = `${svgData.baseX + svgData.offsetX}px`;
        svgData.element.style.top = `${svgData.baseY + svgData.offsetY}px`;
    });
}

// Set up interact.js drag and drop
function setupDragAndDrop() {
    interact('.draggable').draggable({
        inertia: false,
        autoScroll: false,
        allowFrom: 'path, circle, rect, polygon, g',
        listeners: {
            start(event) {
                event.target.style.zIndex = '10';
            },
            move(event) {
                const target = event.target;
                const svgData = loadedSVGs[target.id];

                svgData.offsetX += event.dx;
                svgData.offsetY += event.dy;

                target.style.left = `${svgData.baseX + svgData.offsetX}px`;
                target.style.top = `${svgData.baseY + svgData.offsetY}px`;
            },
            end(event) {
                event.target.style.zIndex = '';
            }
        }
    });

    // Add CSS for precise hit detection
    const style = document.createElement('style');
    style.textContent = `
        #poster {
            position: relative;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
            background-color: #f0f0f0;
        }
        .draggable { 
            pointer-events: none; 
            position: absolute;
            transform-origin: center;
        }
        .draggable svg { 
            pointer-events: visiblePainted; 
            width: 100%; 
            height: 100%;
        }
        .draggable svg * { 
            pointer-events: visiblePainted; 
        }
    `;
    document.head.appendChild(style);
}

// Start the preloading process when the page loads
window.addEventListener('DOMContentLoaded', preloadAssets);