
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

// Store loaded SVGs with transform state
const loadedSVGs = {};
let assetsLoaded = 0;
const totalAssets = posterConfig.length;

async function calculateGlobalScale() {
    return (canvasWidth * globalMargin / posterConfig[0].width) < (canvasHeight * globalMargin / posterConfig[0].height) ?
        (canvasWidth * globalMargin / posterConfig[0].width) :
        (canvasHeight * globalMargin / posterConfig[0].height);
}

async function calculateCenterOffset() {
    return {
        x: (canvasWidth / 2 / globalScale) - (posterConfig[0].width / 2),
        y: (canvasHeight / 2 / globalScale) - (posterConfig[0].height / 2)
    };
}

// Preload all SVG assets
async function preloadAssets() {
    globalScale = await calculateGlobalScale();
    const offset = await calculateCenterOffset();
    centerOffsetX = offset.x;
    centerOffsetY = offset.y;

    posterConfig.forEach(item => {
        fetch(item.url)
            .then(response => response.text())
            .then(svgText => {
                const container = document.createElement('div');
                container.className = 'draggable';
                container.id = item.id;
                container.style.width = `${item.width * globalScale}px`;
                container.style.height = `${item.height * globalScale}px`;
                container.style.left = `${(item.initialPosition.x + centerOffsetX) * globalScale}px`;
                container.style.top = `${(item.initialPosition.y + centerOffsetY) * globalScale}px`;

                container.innerHTML = svgText;

                // Store transform state for each element
                loadedSVGs[item.id] = {
                    element: container,
                    config: item,
                    baseX: (item.initialPosition.x + centerOffsetX) * globalScale,
                    baseY: (item.initialPosition.y + centerOffsetY) * globalScale,
                    offsetX: 0,
                    offsetY: 0,
                    rotation: 0,
                    scale: 1,
                    currentScale: 1
                };

                assetsLoaded++;

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

function initializePoster() {
    const poster = document.getElementById('poster');
    poster.style.width = `${canvasWidth}px`;
    poster.style.height = `${canvasHeight}px`;
    poster.style.position = 'relative';
    poster.style.overflow = 'hidden';

    Object.values(loadedSVGs).forEach(svgData => {
        poster.appendChild(svgData.element);
    });

    setupInteractions();
}

function setupInteractions() {
    // Common transform update function
    function updateElementTransform(element, svgData) {
        element.style.transform = `
            translate(${svgData.offsetX}px, ${svgData.offsetY}px)
            rotate(${svgData.rotation}deg)
            scale(${svgData.scale})
        `;
        element.style.left = `${svgData.baseX}px`;
        element.style.top = `${svgData.baseY}px`;
    }

    // Setup interactions for each draggable element
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
                
                updateElementTransform(target, svgData);
            },
            end(event) {
                event.target.style.zIndex = '';
            }
        }
    }).gesturable({
        listeners: {
            start(event) {
                event.target.style.zIndex = '10';
            },
            move(event) {
                const target = event.target;
                const svgData = loadedSVGs[target.id];
                
                // Update rotation (event.da = delta angle)
                svgData.rotation += event.da;
                
                // Update scale (event.scale = pinch scale factor)
                if (event.scale !== 1) {
                    const newScale = svgData.scale * event.scale;
                    svgData.scale = Math.max(0.1, Math.min(5, newScale));
                }
                
                updateElementTransform(target, svgData);
            }
        }
    });

    // Add CSS for interactions
    const style = document.createElement('style');
    style.textContent = `
        #poster {
            position: relative;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
            background-color: #f0f0f0;
            touch-action: none;
        }
        .draggable { 
            pointer-events: none; 
            position: absolute;
            transform-origin: center;
            will-change: transform;
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

// Handle window resize
window.addEventListener('resize', () => {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    globalScale = calculateGlobalScale();
    const offset = calculateCenterOffset();
    centerOffsetX = offset.x;
    centerOffsetY = offset.y;

    const poster = document.getElementById('poster');
    poster.style.width = `${canvasWidth}px`;
    poster.style.height = `${canvasHeight}px`;

    // Update all elements
    Object.values(loadedSVGs).forEach(svgData => {
        svgData.baseX = (svgData.config.initialPosition.x + centerOffsetX) * globalScale;
        svgData.baseY = (svgData.config.initialPosition.y + centerOffsetY) * globalScale;
        svgData.element.style.left = `${svgData.baseX}px`;
        svgData.element.style.top = `${svgData.baseY}px`;
    });
});

// Start the preloading process
window.addEventListener('DOMContentLoaded', preloadAssets);