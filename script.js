// =========================================
// 1. 全局配置与状态 (Global Config & State)
// =========================================
let currentLang = 'zh'; 
let currentMonth = 1;
const TILE_BASE_URL = './tiles/2024-'; 

const birdMarkers = {}; 
let routeDrawTimeouts = [];
const activeRoutes = { east: true, mid: true, west: true, heatmap: false }; 

// 分析图表变量
const charts = { distance: null, latitude: null, elevation: null };
let isChartVisible = false;
let currentTab = 'distance';

// 生态挑战变量
let isSurvivalMode = false;
const stopoverMarkers = []; 
const destroyedSites = {}; 

// =========================================
// 2. 数据源 (Data Sources)
// =========================================
// 热力图数据 (V1)
const heatMapPoints = [
    [29.11, 116.63, 1.0], [28.90, 112.90, 0.9], [47.20, 124.25, 1.0], 
    [36.80, 100.20, 1.0], [37.75, 118.95, 0.8], [33.38, 120.13, 0.9], 
    [31.50, 121.90, 0.7], [26.85, 104.28, 0.8], [41.12, 121.12, 0.6], 
    [53.00, 108.00, 0.6], [34.80, 113.50, 0.5], [30.20, 117.40, 0.7], 
    [19.00, 109.50, 0.5], [24.00, 120.50, 0.4], [27.20, 88.00, 1.0], 
    [29.65, 91.13, 0.8], [27.20, 88.00, 1.0], [45.00, 132.50, 0.5], 
    [49.50, 136.00, 0.3], [43.10, 144.50, 0.4], [32.10, 130.30, 0.4], 
    [38.20, 127.20, 0.4], [36.00, 126.70, 0.3], [27.80, 99.60, 0.4], 
    [24.90, 102.70, 0.3], [30.70, 106.10, 0.2], [35.50, 97.00, 0.3], 
    [27.17, 77.52, 0.5], [19.80, 85.30, 0.4], [24.50, 93.90, 0.2], 
    [22.00, 89.00, 0.3], [32.00, 76.00, 0.3], [25.00, 67.00, 0.2], 
    [20.50, 96.90, 0.3], [12.50, 104.20, 0.4], [10.00, 106.00, 0.3], 
    [17.00, 100.00, 0.2], [50.30, 92.70, 0.4], [51.10, 100.80, 0.4], 
    [47.80, 117.70, 0.3], [47.70, 102.70, 0.3], [49.95, 115.70, 0.4], 
    [73.00, 126.50, 0.5], [71.40, 148.00, 0.4], [64.50, 155.00, 0.3], 
    [62.00, 129.70, 0.3], [55.00, 83.00, 0.3]
];
let heatLayer = null;
let pulseMarkers = [];
const keyLocations = [
    { pos: [33.38, 120.13], type: 'winter' }, { pos: [47.20, 124.25], type: 'breeding' },
    { pos: [29.10, 116.68], type: 'winter' }, { pos: [53.00, 108.00], type: 'breeding' },
    { pos: [27.20, 88.00], type: 'winter' }, { pos: [36.80, 100.20], type: 'breeding' }
];

// 核心鸟类数据 (V2)
const birdData = {
    east: {
        id: 'crane', name_zh: "东线：丹顶鹤", name_en: "East: Red-crowned Crane", color: "#FF7F50",
        elevation_data: [50, 50, 100, 200, 250, 250, 250, 250, 200, 150, 100, 50],
        sidebar_info_zh: `<strong>习性：</strong> 沿海“逐水而居”，依赖芦苇湿地。<br><strong>路线：</strong> 盐城(冬) <i class="fas fa-arrows-alt-v"></i> 扎龙(夏)`,
        sidebar_info_en: `<strong>Habit:</strong> Coastal dweller, wetland dependent.<br><strong>Route:</strong> Yancheng <i class="fas fa-arrows-alt-v"></i> Zhalong`,
        monthlyData: [
            { pos: [33.38, 120.13], energy_change: 5,  is_stopover: false, desc_zh: "<b>[越冬·盐城]</b> 在芦苇丛中通过吞食鱼虾积累脂肪。", desc_en: "<b>[Wintering]</b> Building fat reserves." },
            { pos: [33.50, 120.20], energy_change: 5,  is_stopover: false, desc_zh: "<b>[越冬末期]</b> 鹤群开始活跃，进行北迁前集结。", desc_en: "<b>[Rallying]</b> Preparing for migration." },
            { pos: [37.75, 118.95], energy_change: 30, is_stopover: true,  site_name_zh: "黄河三角洲", site_name_en: "Yellow River Delta", desc_zh: "<b>[北迁·黄河口]</b> 飞抵黄河三角洲停歇补给。", desc_en: "<b>[Refueling]</b> Stopover at Yellow River Delta." },
            { pos: [41.12, 121.12], energy_change: -20, is_stopover: false, desc_zh: "<b>[北迁·辽宁]</b> 随着5°C等温线北移穿越环渤海。", desc_en: "<b>[Migration]</b> Crossing the Bohai Rim." },
            { pos: [47.20, 124.25], energy_change: -10, is_stopover: false, desc_zh: "<b>[抵达·扎龙]</b> 终于到达繁殖地，开始筑巢。", desc_en: "<b>[Arrival]</b> Reaching Zhalong." },
            { pos: [47.30, 124.30], energy_change: 10, is_stopover: false, desc_zh: "<b>[繁殖期]</b> 正在孵化卵，利用芦苇作屏障。", desc_en: "<b>[Breeding]</b> Incubation phase." },
            { pos: [47.25, 124.20], energy_change: 5,  is_stopover: false, desc_zh: "<b>[育雏期]</b> 雏鸟破壳，在浅水中学习觅食。", desc_en: "<b>[Nurturing]</b> Chicks foraging." },
            { pos: [47.00, 124.00], energy_change: 10, is_stopover: false, desc_zh: "<b>[练飞期]</b> 幼鸟羽翼渐丰，家族群开始集结。", desc_en: "<b>[Fledging]</b> Young birds flight practice." },
            { pos: [44.50, 122.00], energy_change: -15, is_stopover: false, desc_zh: "<b>[南迁·吉林]</b> 气温骤降，避开寒冷沿海风口。", desc_en: "<b>[Southbound]</b> Avoiding coastal winds." },
            { pos: [38.00, 117.50], energy_change: -15, is_stopover: false, desc_zh: "<b>[南迁·河北]</b> 借助秋季强劲北风滑翔。", desc_en: "<b>[Gliding]</b> Riding autumn thermals." },
            { pos: [34.50, 118.50], energy_change: 30, is_stopover: true,  site_name_zh: "连云港湿地", site_name_en: "Lianyungang Wetlands", desc_zh: "<b>[南迁·江苏]</b> 抵达连云港，回到越冬地前最后一站。", desc_en: "<b>[Rest]</b> Stopover at Lianyungang." },
            { pos: [33.38, 120.13], energy_change: 10, is_stopover: false, desc_zh: "<b>[回归·盐城]</b> 回到温暖的南方湿地，安度寒冬。", desc_en: "<b>[Return]</b> Back to winter sanctuary." }
        ]
    },
    mid: {
        id: 'swan', name_zh: "中线：小天鹅", name_en: "Mid: Tundra Swan", color: "#20c997",
        elevation_data: [100, 100, 500, 1200, 1500, 1500, 1500, 1500, 1200, 800, 300, 100],
        sidebar_info_zh: `<strong>习性：</strong> 耐力惊人，能跨越内陆干旱区。<br><strong>路线：</strong> 鄱阳湖(冬) <i class="fas fa-arrows-alt-v"></i> 西伯利亚(夏)`,
        sidebar_info_en: `<strong>Habit:</strong> High endurance, crosses arid lands.<br><strong>Route:</strong> Poyang <i class="fas fa-arrows-alt-v"></i> Siberia`,
        monthlyData: [
            { pos: [29.10, 116.68], energy_change: 5, is_stopover: false, desc_zh: "<b>[越冬·鄱阳湖]</b> 利用长颈挖掘浅滩下的块茎。", desc_en: "<b>[Wintering]</b> Digging for tubers." },
            { pos: [30.00, 115.50], energy_change: 5, is_stopover: false, desc_zh: "<b>[越冬·龙感湖]</b> 在长江中下游湖泊群间迁移。", desc_en: "<b>[Foraging]</b> Moving to find food." },
            { pos: [34.80, 113.50], energy_change: -15, is_stopover: false, desc_zh: "<b>[北迁·黄河]</b> 飞越黄河，在三门峡库区停歇。", desc_en: "<b>[Crossing]</b> Flying over Yellow River." },
            { pos: [41.00, 113.00], energy_change: 30, is_stopover: true, site_name_zh: "岱海/内蒙湖泊", site_name_en: "Inner Mongolia Lakes", desc_zh: "<b>[北迁·内蒙]</b> 飞越干旱草原，在岱海停歇补水。", desc_en: "<b>[Hydration]</b> Stopover at lakes." },
            { pos: [50.00, 105.00], energy_change: -20, is_stopover: false, desc_zh: "<b>[北迁·出境]</b> 抵达贝加尔湖南岸，冰雪初融。", desc_en: "<b>[Border]</b> Reaching Lake Baikal." },
            { pos: [53.00, 108.00], energy_change: -10, is_stopover: false, desc_zh: "<b>[抵达·苔原]</b> 到达西伯利亚繁殖地，快速筑巢。", desc_en: "<b>[Arrival]</b> Reaching Siberian Tundra." },
            { pos: [54.00, 109.00], energy_change: 10, is_stopover: false, desc_zh: "<b>[育雏高峰]</b> 昆虫爆发提供丰富蛋白质。", desc_en: "<b>[Peak Season]</b> Abundant food supply." },
            { pos: [53.50, 108.50], energy_change: 5, is_stopover: false, desc_zh: "<b>[换羽期]</b> 成鸟暂时失去飞行能力。", desc_en: "<b>[Molting]</b> Flightless period." },
            { pos: [45.00, 116.00], energy_change: -20, is_stopover: false, desc_zh: "<b>[南迁·草原]</b> 寒流来袭，经由锡林郭勒南下。", desc_en: "<b>[Southbound]</b> Taking grassland route." },
            { pos: [37.00, 116.50], energy_change: 30, is_stopover: true, site_name_zh: "黄河故道湿地", site_name_en: "Old Yellow River Wetlands", desc_zh: "<b>[南迁·山东]</b> 在黄河故道湿地停歇等待气流。", desc_en: "<b>[Rest]</b> Old Yellow River course." },
            { pos: [31.00, 117.50], energy_change: -10, is_stopover: false, desc_zh: "<b>[南迁·安徽]</b> 抵达升金湖，利用枯水期滩涂。", desc_en: "<b>[Arrival]</b> Reaching Shengjin Lake." },
            { pos: [29.10, 116.68], energy_change: 10, is_stopover: false, desc_zh: "<b>[回归·鄱阳湖]</b> 家族群团聚，万鸟齐鸣。", desc_en: "<b>[Reunion]</b> Wintering at Poyang." }
        ]
    },
    west: {
        id: 'goose', name_zh: "西线：斑头雁", name_en: "West: Bar-headed Goose", color: "#56ccf2",
        elevation_data: [300, 300, 4500, 8000, 3200, 3200, 3200, 3200, 6000, 8200, 1500, 300],
        terrain_data:   [200, 200, 2000, 6500, 3000, 3000, 3000, 3000, 4000, 6000, 1000, 200],
        sidebar_info_zh: `<strong>习性：</strong> 极强心肺功能，飞越世界屋脊。<br><strong>路线：</strong> 印度(冬) <i class="fas fa-arrows-alt-v"></i> 青海湖(夏)`,
        sidebar_info_en: `<strong>Habit:</strong> Extreme cardio, over Himalayas.<br><strong>Route:</strong> India <i class="fas fa-arrows-alt-v"></i> Qinghai Lake`,
        monthlyData: [
            { pos: [27.20, 88.00], energy_change: 10, is_stopover: false, desc_zh: "<b>[越冬·南亚]</b> 在印度与尼泊尔交界低地越冬。", desc_en: "<b>[Wintering]</b> South Asian lowlands." },
            { pos: [27.20, 88.00], energy_change: 5, is_stopover: false, desc_zh: "<b>[集结]</b> 在喜马拉雅南麓盘旋，等待上升气流。", desc_en: "<b>[Waiting]</b> Circling for monsoon." },
            { pos: [30.00, 91.00], energy_change: -30, is_stopover: false, desc_zh: "<b>[翻越巅峰]</b> 奇迹时刻！8小时内升至海拔8000米。", desc_en: "<b>[Summit]</b> Crossing Himalayas." },
            { pos: [34.00, 95.00], energy_change: 25, is_stopover: true, site_name_zh: "长江源湿地", site_name_en: "Yangtze Source Wetlands", desc_zh: "<b>[北迁·高原]</b> 穿越无人区，凭借厚绒抵御严寒。", desc_en: "<b>[Crossing]</b> Flying over no-man's land." },
            { pos: [36.80, 100.20], energy_change: -10, is_stopover: false, desc_zh: "<b>[抵达·青海湖]</b> 利用湖心岛隔绝捕食者开始筑巢。", desc_en: "<b>[Arrival]</b> Qinghai Lake." },
            { pos: [37.00, 100.00], energy_change: 10, is_stopover: false, desc_zh: "<b>[孵化期]</b> 湖中湟鱼回游提供丰富营养。", desc_en: "<b>[Nesting]</b> Building nests." },
            { pos: [36.90, 100.40], energy_change: 5, is_stopover: false, desc_zh: "<b>[育雏期]</b> 雏鸟只能游泳躲避天敌。", desc_en: "<b>[Rearing]</b> Avoiding predators." },
            { pos: [36.80, 100.20], energy_change: 10, is_stopover: false, desc_zh: "<b>[练飞期]</b> 幼鸟羽翼丰满，开始编队飞行。", desc_en: "<b>[Training]</b> Formation flight." },
            { pos: [34.00, 92.00], energy_change: 20, is_stopover: true, site_name_zh: "雅鲁藏布河谷", site_name_en: "Yarlung Tsangpo Valley", desc_zh: "<b>[南迁·唐古拉]</b> 经由唐古拉山口向南撤离。", desc_en: "<b>[Departure]</b> Crossing Tanggula Pass." },
            { pos: [30.00, 85.00], energy_change: -10, is_stopover: false, desc_zh: "<b>[南迁·河谷]</b> 在雅鲁藏布江上游休整。", desc_en: "<b>[Rest]</b> Valley rest." },
            { pos: [28.00, 84.00], energy_change: -20, is_stopover: false, desc_zh: "<b>[飞越·干城章嘉]</b> 借助秋季北风高速俯冲越过雪山。", desc_en: "<b>[Descent]</b> Over Kangchenjunga." },
            { pos: [27.20, 88.00], energy_change: 10, is_stopover: false, desc_zh: "<b>[回归·南亚]</b> 在温暖的河谷平原降落。", desc_en: "<b>[Landing]</b> Return to warmth." }
        ]
    }
};

// =========================================
// 3. 地图初始化 (Map Initialization)
// =========================================
var map = L.map('map', { scrollWheelZoom: false }).setView([36.0, 104.0], 4);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap, &copy; CARTO' }).addTo(map);

// 台湾 GeoJSON
var taiwanGeoJson = { "type": "Feature", "properties": { "name": "Taiwan" }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[121.941406,24.753232],[121.931641,24.612845],[121.819824,24.359554],[121.554199,24.114166],[121.583496,23.634487],[121.439453,23.153114],[120.878906,21.930295],[120.839355,21.945431],[120.727539,22.385658],[120.588867,22.583643],[120.169922,23.17303],[120.070312,23.561461],[120.18457,23.893395],[120.406738,24.211687],[120.588867,24.487149],[120.816895,24.843937],[121.039062,25.058106],[121.510254,25.292033],[121.858887,25.162677],[122.004883,25.120819],[121.941406,24.753232]]]] } };
L.geoJSON(taiwanGeoJson, { style: { fillColor: '#808080', fillOpacity: 0.7, color: '#666666', weight: 1 } }).addTo(map);

var historyLayerGroup = L.layerGroup().addTo(map);
let currentTemperatureLayer = null;

// 地图比例尺
L.control.scale({ position: 'bottomleft', metric: true, imperial: false }).addTo(map);

// 导航栏滚动自适应
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('mainNav');
    if (window.scrollY > 100) { navbar.classList.add('navbar-scrolled'); }
    else { navbar.classList.remove('navbar-scrolled'); }
});

// =========================================
// 4. 过滤器控件 (Filter UI)
// =========================================
var filterControl = L.control({position: 'topright'});
filterControl.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'map-filter-control');
    L.DomEvent.disableClickPropagation(div); div.id = 'map-filter-ui'; return div;
};
filterControl.addTo(map);

function updateFilterUI() {
    const container = document.getElementById('map-filter-ui');
    if (!container) return;
    const title = currentLang === 'zh' ? '线路筛选' : 'Route Filter';
    let html = `<div class="filter-title">${title}</div>`;
    
    // 线路开关
    Object.entries(birdData).forEach(([key, bird]) => {
        const nameFull = currentLang === 'zh' ? bird.name_zh : bird.name_en;
        const name = nameFull.split(/[:：]/)[0]; 
        const isActive = activeRoutes[key] ? 'active' : '';
        const bgStyle = activeRoutes[key] ? `background: ${bird.color}; border-color:${bird.color}` : `background: transparent; border-color: #ddd`;
        html += `<div class="filter-item ${isActive}" onclick="toggleRoute('${key}', this)"><div class="filter-checkbox" style="${bgStyle}"></div><div class="filter-label">${name}</div></div>`;
    });

    // 热力图开关
    const hmActive = activeRoutes.heatmap ? 'active' : '';
    const hmColor = '#FF8C00'; 
    const hmBgStyle = activeRoutes.heatmap ? `background: ${hmColor}; border-color:${hmColor}` : `background: transparent; border-color: #ddd`;
    const hmLabel = currentLang === 'zh' ? '栖息地' : 'Habitat Heat';
    html += `<div class="filter-item ${hmActive}" onclick="toggleHeatmap(this)"><div class="filter-checkbox" style="${hmBgStyle}" data-color="${hmColor}"></div><div class="filter-label" style="color:#d35400;">${hmLabel}</div></div>`;

    container.innerHTML = html;
}

// 暴露 toggleRoute 到全局
window.toggleRoute = function(routeKey, element) {
    activeRoutes[routeKey] = !activeRoutes[routeKey];
    updateFilterUI(); 
    const imgEl = document.getElementById(`bg-img-${routeKey}`);
    if (imgEl) activeRoutes[routeKey] ? imgEl.classList.add('active') : imgEl.classList.remove('active');
    updateBirdMigration(currentMonth);
    refreshAllCharts();
    renderStopoverMarkers();
}

// 暴露 toggleHeatmap 到全局
window.toggleHeatmap = function(element) {
    activeRoutes.heatmap = !activeRoutes.heatmap;
    updateFilterUI();
    const mapContainer = document.getElementById('map');
    
    if (activeRoutes.heatmap) {
        mapContainer.classList.add('night-mode');
        if (!heatLayer) {
            heatLayer = L.heatLayer(heatMapPoints, { max: 0.3, radius: 40, blur: 20, maxZoom: 9, minOpacity: 0.08, gradient: { 0.1: 'rgba(139, 0, 0, 0.8)', 0.6: 'rgba(255, 165, 0, 0.95)', 1.0: '#FFFFFF' } });
        }
        heatLayer.addTo(map);
        
        keyLocations.forEach(loc => {
            const typeClass = loc.type === 'breeding' ? 'pulse-breeding' : 'pulse-winter';
            const pulseIcon = L.divIcon({ className: '', html: `<div class="pulse-icon ${typeClass}"><div class="pulse-ring"></div><div class="pulse-ring"></div></div>`, iconSize: [40, 40], iconAnchor: [20, 20] });
            const marker = L.marker(loc.pos, { icon: pulseIcon, interactive: false, zIndexOffset: -100 }).addTo(map);
            pulseMarkers.push(marker);
        });
    } else {
        mapContainer.classList.remove('night-mode');
        if (heatLayer) map.removeLayer(heatLayer);
        pulseMarkers.forEach(m => map.removeLayer(m));
        pulseMarkers = [];
    }
}

// =========================================
// 5. 生存挑战模式 (Survival Mode)
// =========================================
window.toggleSurvivalMode = function() {
    const checkbox = document.getElementById('survivalModeToggle');
    isSurvivalMode = checkbox.checked;
    const dashboard = document.getElementById('energy-dashboard');
    const placeholder = document.getElementById('energy-placeholder'); // 获取占位符
    
    if (isSurvivalMode) {
        dashboard.style.display = 'block';
        if(placeholder) placeholder.style.display = 'none'; // 隐藏占位符
        renderStopoverMarkers(); 
    } else {
        dashboard.style.display = 'none';
        if(placeholder) placeholder.style.display = 'block'; // 显示占位符
        clearStopoverMarkers();
    }
    updateBirdMigration(currentMonth); 
}

function renderStopoverMarkers() {
    clearStopoverMarkers();
    if (!isSurvivalMode) return;
    Object.entries(birdData).forEach(([birdKey, bird]) => {
        if (!activeRoutes[birdKey]) return;
        bird.monthlyData.forEach((data, index) => {
            if (data.is_stopover) {
                const siteId = `${birdKey}_${index}`;
                const isDestroyed = destroyedSites[siteId];
                const iconHtml = isDestroyed ? `<i class="fas fa-skull-crossbones"></i>` : `<i class="fas fa-tint"></i>`;
                const className = isDestroyed ? 'stopover-icon destroyed' : 'stopover-icon';
                const marker = L.marker(data.pos, { 
                    icon: L.divIcon({ className: className, html: iconHtml, iconSize: [30, 30], iconAnchor: [15, 15] }), 
                    zIndexOffset: 2000 
                }).addTo(map);
                const siteName = currentLang === 'zh' ? data.site_name_zh : data.site_name_en;
                const statusText = isDestroyed ? (currentLang === 'zh' ? '已枯竭' : 'Destroyed') : (currentLang === 'zh' ? '生态良好' : 'Healthy');
                const btnHtml = isDestroyed ? `<button class="restore-btn" onclick="restoreSite('${siteId}')">${currentLang==='zh'?'生态修复':'Restore'}</button>` : `<button class="destroy-btn" onclick="destroySite('${siteId}')">${currentLang==='zh'?'开发破坏':'Destroy'}</button>`;
                marker.bindPopup(`<b>${siteName}</b><br><small>${statusText}</small><br>${btnHtml}`);
                stopoverMarkers.push(marker);
            }
        });
    });
}

function clearStopoverMarkers() { stopoverMarkers.forEach(m => map.removeLayer(m)); stopoverMarkers.length = 0; }
window.destroySite = function(siteId) { destroyedSites[siteId] = true; map.closePopup(); renderStopoverMarkers(); updateBirdMigration(currentMonth); };
window.restoreSite = function(siteId) { delete destroyedSites[siteId]; map.closePopup(); renderStopoverMarkers(); updateBirdMigration(currentMonth); };

function calculateEnergy(birdKey, monthIndex) {
    let energy = 50; 
    for (let i = 0; i <= monthIndex; i++) {
        const data = birdData[birdKey].monthlyData[i];
        let change = data.energy_change;
        if (data.is_stopover && destroyedSites[`${birdKey}_${i}`]) change = -10;
        energy += change;
        if (energy > 100) energy = 100; if (energy < 0) energy = 0;
    }
    return energy;
}

// =========================================
// 6. 图表分析 (Charts)
// =========================================
window.toggleChartDashboard = function() {
    const dashboard = document.getElementById('chart-dashboard');
    const btn = document.getElementById('chart-trigger');
    isChartVisible = !isChartVisible;
    if(isChartVisible) {
        dashboard.classList.add('show'); btn.classList.add('active');
        if (currentTab === 'distance') initChartDistance();
        else if (currentTab === 'latitude') initChartLatitude();
        else if (currentTab === 'elevation') initChartElevation();
    } else {
        dashboard.classList.remove('show'); btn.classList.remove('active');
    }
}

window.switchChartTab = function(tabName, element) {
    currentTab = tabName;
    document.querySelectorAll('.chart-tab-item').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
    document.querySelectorAll('.chart-container').forEach(c => c.classList.remove('active'));
    document.getElementById(`chart-${tabName}`).classList.add('active');
    setTimeout(() => {
        if (tabName === 'distance') initChartDistance();
        if (tabName === 'latitude') initChartLatitude();
        if (tabName === 'elevation') initChartElevation();
    }, 50);
}

function getChartCommonData() {
    return { months: currentLang === 'zh' ? ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'] : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] };
}

function calculateDistanceData() {
    const series = [];
    Object.entries(birdData).forEach(([key, bird]) => {
        if(!activeRoutes[key]) return;
        let totalDist = 0; const data = [];
        for (let i = 0; i < 12; i++) {
            if (i > 0) totalDist += turf.distance(turf.point([bird.monthlyData[i-1].pos[1], bird.monthlyData[i-1].pos[0]]), turf.point([bird.monthlyData[i].pos[1], bird.monthlyData[i].pos[0]]), {units: 'kilometers'});
            data.push(Math.round(totalDist));
        }
        series.push({ name: currentLang === 'zh' ? bird.name_zh.split('：')[1] : bird.name_en.split(': ')[1], color: bird.color, data: data });
    });
    return series;
}

function calculateLatitudeData() {
    const series = [];
    Object.entries(birdData).forEach(([key, bird]) => {
        if(!activeRoutes[key]) return;
        series.push({ name: currentLang === 'zh' ? bird.name_zh.split('：')[1] : bird.name_en.split(': ')[1], color: bird.color, data: bird.monthlyData.map(d => d.pos[0]) });
    });
    return series;
}

function calculateElevationData() {
    const series = [];
    if(activeRoutes.west) {
        series.push({ name: currentLang === 'zh' ? '西线地形' : 'Terrain (West)', type: 'line', smooth: true, areaStyle: { opacity: 0.3, color: '#777' }, lineStyle: { width: 0 }, showSymbol: false, data: birdData.west.terrain_data, tooltip: { show: false } });
    }
    Object.entries(birdData).forEach(([key, bird]) => {
        if(!activeRoutes[key]) return;
        series.push({ name: currentLang === 'zh' ? bird.name_zh.split('：')[1] : bird.name_en.split(': ')[1], type: 'line', smooth: true, data: bird.elevation_data, itemStyle: { color: bird.color }, lineStyle: { width: 3 }, markPoint: { data: [{ xAxis: currentMonth - 1, yAxis: bird.elevation_data[currentMonth - 1], itemStyle: {color: bird.color} }], animation: false, symbol: 'circle', symbolSize: 8 } });
    });
    return series;
}

function initChartDistance() {
    const dom = document.getElementById('chart-distance'); if(charts.distance) charts.distance.dispose();
    charts.distance = echarts.init(dom, null, { renderer: 'svg' });
    const series = calculateDistanceData().map(s => ({ ...s, type: 'line', smooth: true, lineStyle: {width:3}, symbol: 'none', markPoint: { data: [{ xAxis: currentMonth - 1, yAxis: s.data[currentMonth - 1], itemStyle: {color: s.color} }], symbol:'circle', symbolSize:8 } }));
    charts.distance.setOption(getOptionBase(getChartCommonData().months, series, currentLang==='zh'?'里程 (km)':'Dist (km)'));
    bindChartEvents(charts.distance);
}

function initChartLatitude() {
    const dom = document.getElementById('chart-latitude'); if(charts.latitude) charts.latitude.dispose();
    charts.latitude = echarts.init(dom, null, { renderer: 'svg' });
    const series = calculateLatitudeData().map(s => ({ ...s, type: 'line', smooth: true, lineStyle: {width:3}, symbol: 'none', markPoint: { data: [{ xAxis: currentMonth - 1, yAxis: s.data[currentMonth - 1], itemStyle: {color: s.color} }], symbol:'circle', symbolSize:8 } }));
    let opt = getOptionBase(getChartCommonData().months, series, currentLang==='zh'?'纬度 (°N)':'Lat (°N)'); opt.yAxis.min = 20; opt.yAxis.max = 60;
    charts.latitude.setOption(opt);
    bindChartEvents(charts.latitude);
}

function initChartElevation() {
    const dom = document.getElementById('chart-elevation'); if(charts.elevation) charts.elevation.dispose();
    charts.elevation = echarts.init(dom, null, { renderer: 'svg' });
    charts.elevation.setOption(getOptionBase(getChartCommonData().months, calculateElevationData(), currentLang==='zh'?'海拔 (m)':'Alt (m)'));
    bindChartEvents(charts.elevation);
}

function getOptionBase(categories, series, yName) {
    return {
        tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.9)', textStyle: {color:'#333', fontSize:11}, padding: 10, borderRadius: 8 },
        grid: { top: '15%', left: '8%', right: '8%', bottom: '5%', containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: categories, axisLabel: {color:'#333', fontSize:9} },
        yAxis: { type: 'value', name: yName, axisLabel: {color:'#555', fontSize:9}, splitLine: {lineStyle:{type:'dashed', color:'rgba(0,0,0,0.1)'}} },
        series: series
    };
}

function bindChartEvents(chart) {
    chart.getZr().off('click');
    chart.getZr().on('click', function (params) {
        const point = [params.offsetX, params.offsetY];
        if (chart.containPixel('grid', point)) {
            const targetMonth = chart.convertFromPixel({ seriesIndex: 0 }, point)[0] + 1;
            if (targetMonth >= 1 && targetMonth <= 12) { document.getElementById('month-slider').value = targetMonth; document.getElementById('month-slider').dispatchEvent(new Event('input')); }
        }
    });
}

function refreshAllCharts() {
    if(!isChartVisible) return;
    const mIdx = currentMonth - 1;
    if (currentTab === 'distance' && charts.distance) charts.distance.setOption({ series: calculateDistanceData().map(s => ({ markPoint: { data: [{ xAxis: mIdx, yAxis: s.data[mIdx], itemStyle: {color: s.color} }] } })) });
    if (currentTab === 'latitude' && charts.latitude) charts.latitude.setOption({ series: calculateLatitudeData().map(s => ({ markPoint: { data: [{ xAxis: mIdx, yAxis: s.data[mIdx], itemStyle: {color: s.color} }] } })) });
    if (currentTab === 'elevation' && charts.elevation) charts.elevation.setOption({ series: calculateElevationData() }); 
}

window.addEventListener('resize', () => { if(charts.distance) charts.distance.resize(); if(charts.latitude) charts.latitude.resize(); if(charts.elevation) charts.elevation.resize(); });

// =========================================
// 7. 地图渲染与动画 (Map Render & Animation)
// =========================================
function getBirdSVG(type, color, isDead) {
    let fill = isDead ? '#555' : color;
    let transform = isDead ? 'rotate(180deg) grayscale(100%)' : '';
    const shapes = { 
        'crane': `<path d="M20 5 L25 15 L38 12 L22 25 L20 38 L18 25 L2 12 L15 15 Z" fill="${fill}" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>`, 
        'swan': `<path d="M20 2 L28 15 L38 8 L25 22 L20 35 L15 22 L2 8 L12 15 Z" fill="${fill}" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>`, 
        'goose': `<path d="M20 0 L26 18 L36 24 L20 28 L4 24 L14 18 Z" fill="${fill}" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>` 
    };
    return `<svg width="40" height="40" viewBox="0 0 40 40" style="overflow:visible; transform:${transform}"><filter id="ds-${type}"><feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/></filter><g filter="url(#ds-${type})">${shapes[type]}</g></svg>`;
}

function renderSidebar() {
    const container = document.getElementById('sidebar-content');
    const title = currentLang === 'zh' ? '代表种群档案' : 'Species Archive';
    let html = `<div class="sidebar-title">${title}</div>`;
    Object.values(birdData).forEach(bird => {
        const name = currentLang === 'zh' ? bird.name_zh : bird.name_en;
        const info = currentLang === 'zh' ? bird.sidebar_info_zh : bird.sidebar_info_en;
        html += `<div class="bird-mini-card" style="border-left-color: ${bird.color};"><div class="bird-mini-title" style="color:${bird.color};">${name}</div><div class="bird-mini-text">${info}</div></div>`;
    });
    container.innerHTML = html + `<div class="sidebar-title mt-3" style="padding-top:5px;">${currentLang==='zh'?'图例':'Legend'}</div><div class="legend-grid">` + (currentLang==='zh' ? `<div class="legend-item"><span class="legend-dot" style="background:#3388ff;"></span>越冬地</div><div class="legend-item"><span class="legend-dot" style="background:#ff3333;"></span>繁殖地</div>` : `<div class="legend-item"><span class="legend-dot" style="background:#3388ff;"></span>Winter</div><div class="legend-item"><span class="legend-dot" style="background:#ff3333;"></span>Breeding</div>`) + `</div>`;
}

function updateBirdMigration(month) {
    routeDrawTimeouts.forEach(t => clearTimeout(t)); routeDrawTimeouts = [];
    historyLayerGroup.clearLayers();
    const monthNamesEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    Object.entries(birdData).forEach(([key, bird]) => {
        if (!activeRoutes[key]) {
            if (birdMarkers[bird.id]) { map.removeLayer(birdMarkers[bird.id]); delete birdMarkers[bird.id]; }
            if (isSurvivalMode) document.getElementById(`energy-row-${key}`).style.display = 'none';
            return;
        }
        
        if (isSurvivalMode) document.getElementById(`energy-row-${key}`).style.display = 'flex';
        const currentEnergy = calculateEnergy(key, month - 1);
        const isDead = currentEnergy <= 0;

        if (isSurvivalMode) {
            const row = document.getElementById(`energy-row-${key}`);
            const bar = row.querySelector('.progress-bar-fill');
            bar.style.width = `${currentEnergy}%`;
            row.querySelector('.energy-value').innerText = `${currentEnergy}%`;
            bar.style.background = currentEnergy > 50 ? 'linear-gradient(90deg, #20c997, #28a745)' : (currentEnergy > 20 ? 'linear-gradient(90deg, #f9d423, #ff9100)' : '#ff4e50');
            if (isDead) row.classList.add('bird-dead'); else row.classList.remove('bird-dead');
        }

        const turfPoints = bird.monthlyData.map(d => [d.pos[1], d.pos[0]]);
        for (let i = 0; i < month - 1; i++) {
            L.marker(bird.monthlyData[i].pos, { icon: L.divIcon({className:'', html:`<div class="history-dot" style="--bird-color:${bird.color};"></div>`, iconSize:[8,8], iconAnchor:[4,4]}), interactive:false, zIndexOffset:500 }).addTo(historyLayerGroup);
        }
        if (month > 2) { 
            let cleanStablePath = turfPoints.slice(0, month - 1).filter((pt, i, arr) => i===0 || !(pt[0]===arr[i-1][0] && pt[1]===arr[i-1][1]));
            if (cleanStablePath.length >= 2) L.geoJSON(turf.bezierSpline(turf.lineString(cleanStablePath), {resolution:10000, sharpness:0.5}), { style: { color: bird.color, weight: 2, opacity: 0.6, dashArray: month>8?'5,5':null } }).addTo(historyLayerGroup);
        }

        const monthData = bird.monthlyData[month - 1];
        const birdName = currentLang === 'zh' ? bird.name_zh : bird.name_en;
        const monthLabel = currentLang === 'zh' ? `${month}月` : monthNamesEn[month-1];
        let statusDesc = currentLang === 'zh' ? monthData.desc_zh : monthData.desc_en;
        if (isDead) statusDesc = `<strong style="color:red;">${currentLang==='zh'?'能量耗尽！迁徙失败':'Energy Depleted! Migration Failed'}</strong>`;

        let bearing = 0;
        if (month > 1 && !isDead) bearing = turf.bearing(turf.point([bird.monthlyData[month-2].pos[1], bird.monthlyData[month-2].pos[0]]), turf.point([monthData.pos[1], monthData.pos[0]]));

        if (birdMarkers[bird.id]) {
            const marker = birdMarkers[bird.id];
            marker.setLatLng(monthData.pos);
            marker.setTooltipContent(`<div style="border-bottom: 2px solid ${bird.color}; padding-bottom:5px; margin-bottom:5px; font-weight:bold; color:${bird.color}">${birdName} <span style="font-size:0.7em; color:#888; background:#eee; padding:2px 6px; border-radius:10px;">${monthLabel}</span></div><div style="font-size:0.85rem;">${statusDesc}</div>`);
            const iconDiv = marker.getElement().querySelector('.geo-bird-icon');
            if (iconDiv) {
                iconDiv.innerHTML = getBirdSVG(bird.id, bird.color, isDead); 
                iconDiv.style.transform = `rotate(${bearing}deg)`;
            }
        } else {
            const newMarker = L.marker(monthData.pos, { 
                icon: L.divIcon({ className: 'bird-icon-wrapper', html: `<div class="geo-bird-icon" style="transform: rotate(${bearing}deg);">${getBirdSVG(bird.id, bird.color, isDead)}</div>`, iconSize: [40, 40], iconAnchor: [20, 20], popupAnchor: [0, -25] }), 
                zIndexOffset: 1000 
            }).bindTooltip(`<div style="border-bottom: 2px solid ${bird.color}; padding-bottom:5px; margin-bottom:5px; font-weight:bold; color:${bird.color}">${birdName} <span style="font-size:0.7em; color:#888; background:#eee; padding:2px 6px; border-radius:10px;">${monthLabel}</span></div><div style="font-size:0.85rem;">${statusDesc}</div>`, { direction: 'top', sticky: true, className: 'bird-status-tooltip', offset: [0, -20] }).addTo(map); 
            birdMarkers[bird.id] = newMarker;
        }
        if (month > 1 && !isDead) {
            routeDrawTimeouts.push(setTimeout(() => {
                if (!activeRoutes[key]) return; 
                let cleanFullPath = turfPoints.slice(0, month).filter((pt, i, arr) => i===0 || !(pt[0]===arr[i-1][0] && pt[1]===arr[i-1][1]));
                if (cleanFullPath.length >= 2) L.geoJSON(turf.bezierSpline(turf.lineString(cleanFullPath), {resolution:10000, sharpness:0.5}), { style: { color: bird.color, weight: 2, opacity: 0.6, dashArray: month>8?'5,5':null } }).addTo(historyLayerGroup);
            }, 1500));
        }
    });
    refreshAllCharts();
}

function updateTemperatureLayer(m) {
    currentMonth = m; updateMonthLabel();
    const nextLayer = L.tileLayer(`${TILE_BASE_URL}${m.toString().padStart(2,'0')}/{z}/{x}/{y}.png`, { minZoom: 3, maxZoom: 10, opacity: 0, tms: false, zIndex: 50 }).addTo(map);
    setTimeout(() => { if(nextLayer.getContainer()) nextLayer.setOpacity(1); }, 50);
    if (currentTemperatureLayer) { const old = currentTemperatureLayer; setTimeout(() => map.removeLayer(old), 600); }
    currentTemperatureLayer = nextLayer;
    updateBirdMigration(m);
}

function updateMonthLabel() {
    const en = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    document.getElementById('current-month-label').textContent = currentLang === 'zh' ? `${currentMonth}月` : en[currentMonth - 1];
}

// 播放控制
let isPlaying = false, playInterval = null;
const slider = document.getElementById('month-slider');
window.togglePlay = function() {
    if (isPlaying) { clearInterval(playInterval); document.getElementById('play-btn').innerHTML = '<i class="fas fa-play"></i>'; isPlaying = false; }
    else {
        document.getElementById('play-btn').innerHTML = '<i class="fas fa-pause"></i>'; isPlaying = true;
        playInterval = setInterval(() => { let next = parseInt(slider.value) + 1; if (next > 12) next = 1; slider.value = next; updateTemperatureLayer(next); }, 1500);
    }
}
slider.addEventListener('input', function() { if (isPlaying) togglePlay(); updateTemperatureLayer(parseInt(this.value)); });

// =========================================
// 8. 双语切换 (Language Switch)
// =========================================
window.toggleLanguage = function() {
    const body = document.body;
    const btnText = document.getElementById('lang-btn-text');
    
    // 1. 切换 body class
    if (currentLang === 'zh') {
        currentLang = 'en';
        body.classList.add('en-mode');
        btnText.textContent = 'CN'; 
    } else {
        currentLang = 'zh';
        body.classList.remove('en-mode');
        btnText.textContent = 'EN'; 
    }
    
    // 2. 强制刷新所有动态生成的组件
    updateFilterUI();       // 刷新右上角过滤器文字
    renderSidebar();        // 刷新左侧边栏文字
    updateMonthLabel();     // 刷新时间轴月份
    updateBirdMigration(currentMonth); // 刷新地图上的 Popup 和 Tooltip
    refreshAllCharts();     // 刷新 ECharts 标题和坐标轴
    renderStopoverMarkers(); // 刷新生存模式的破坏点 Popup
}

// =========================================
// 9. 启动 (Bootstrap)
// =========================================
updateTemperatureLayer(1); 
renderSidebar(); 
updateFilterUI(); 
initChartDistance(); 
updateBirdMigration(1);