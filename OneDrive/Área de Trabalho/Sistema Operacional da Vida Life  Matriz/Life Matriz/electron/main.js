const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
        frame: true,
        titleBarStyle: 'hiddenInset',
        icon: path.join(__dirname, 'public', 'icon.png'),
        backgroundColor: '#0a0a0a',
    });

    // In development, load from Next.js dev server
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        // In production, load the built files
        mainWindow.loadFile(path.join(__dirname, 'out', 'index.html'));
    }

    // Inject activityAPI into renderer window
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.executeJavaScript(`
            window.activityAPI = {
                _isElectron: true,
                getSummary: () => window.__activitySummary || null,
                start: () => {},
                stop: () => {},
                isTracking: () => window.__isTracking || false,
            };
            window.electronAPI = { isElectron: true };
            console.log('Electron API injected');
        `);
        // Update activity data in renderer
        updateRendererActivity();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        // Handle Windows protocol links
        if (url.startsWith('windowsdefender://') || url.startsWith('ms-settings:')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }

        if (url.startsWith('http://') || url.startsWith('https://')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }

        return { action: 'allow' };
    });
}

// Update renderer with activity data
function updateRendererActivity() {
    if (mainWindow && mainWindow.webContents) {
        const summary = getActivitySummary();
        mainWindow.webContents.executeJavaScript(`
            window.__activitySummary = ${JSON.stringify(summary)};
            window.__isTracking = ${!!activityInterval};
        `);
    }
}

// Windows Defender Integration
function getWindowsDefenderStatus() {
    return new Promise((resolve, reject) => {
        // PowerShell command to get Windows Defender status
        const command = `powershell -Command "Get-MpComputerStatus | Select-Object -Property AntivirusEnabled, RealTimeProtectionEnabled, AntivirusSignatureLastUpdated | ConvertTo-Json"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Error getting Defender status:', error);
                resolve({
                    available: false,
                    error: error.message,
                });
                return;
            }

            try {
                const status = JSON.parse(stdout);
                resolve({
                    available: true,
                    antivirusEnabled: status.AntivirusEnabled,
                    realTimeProtection: status.RealTimeProtectionEnabled,
                    lastUpdate: status.AntivirusSignatureLastUpdated,
                });
            } catch (parseError) {
                resolve({
                    available: false,
                    error: 'Failed to parse status',
                });
            }
        });
    });
}

function runVirusScan(scanType = 'QuickScan') {
    return new Promise((resolve, reject) => {
        // Start Windows Defender scan
        const command = `powershell -Command "Start-MpScan -ScanType ${scanType}"`;

        exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve({ success: true, message: 'Scan started' });
        });
    });
}

// =====================================================
// Activity Tracking System - Rastreamento de Atividades
// =====================================================

let activityData = {
    today: new Date().toISOString().split('T')[0],
    apps: {}, // { appName: { totalSeconds: number, lastSeen: timestamp } }
    timeline: [], // [{ app: string, start: timestamp, end: timestamp }]
    webHistory: [], // [{ url: string, title: string, timestamp: Date, duration: number }]
    websites: {}, // { domain: { totalSeconds: number, visits: number } }
    categories: {
        productive: 0,
        entertainment: 0,
        social: 0,
        other: 0,
    },
    // NEW: Detailed content tracking for AI learning
    contentHistory: [], // [{ platform, contentTitle, contentType, timestamp, duration }]
    youtubeVideos: [], // [{ title, channel, timestamp, duration }]
    searchQueries: [], // [{ query, platform, timestamp }]
    interests: {}, // { topic: { count: number, totalTime: number } }
};

// Browsers to detect for URL extraction
const BROWSERS = ['chrome', 'firefox', 'msedge', 'edge', 'opera', 'brave', 'vivaldi'];

// Categories for apps and websites
const APP_CATEGORIES = {
    productive: ['code', 'vscode', 'visual studio', 'android studio', 'intellij', 'word', 'excel', 'powerpoint', 'notion', 'slack', 'teams', 'outlook', 'figma', 'photoshop', 'illustrator', 'terminal', 'powershell', 'cmd'],
    entertainment: ['netflix', 'spotify', 'youtube', 'twitch', 'vlc', 'media player', 'steam', 'epic games', 'xbox', 'playstation'],
    social: ['whatsapp', 'telegram', 'discord', 'messenger', 'instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'],
};

const WEBSITE_CATEGORIES = {
    productive: ['github.com', 'stackoverflow.com', 'notion.so', 'figma.com', 'trello.com', 'asana.com', 'docs.google.com', 'drive.google.com', 'office.com'],
    entertainment: ['youtube.com', 'netflix.com', 'twitch.tv', 'spotify.com', 'primevideo.com', 'hbomax.com', 'disneyplus.com'],
    social: ['facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com', 'whatsapp.com', 'tiktok.com', 'reddit.com', 'discord.com'],
};

// Content extractors for different platforms
function extractContentDetails(title, domain) {
    const details = {
        platform: domain,
        contentTitle: title,
        contentType: 'page',
        channel: null,
        searchQuery: null,
    };

    // YouTube - extract video title and channel
    if (domain && domain.includes('youtube')) {
        details.platform = 'YouTube';
        details.contentType = 'video';
        // Pattern: "Video Title - YouTube" or "Video Title - Channel - YouTube"
        const ytMatch = title.match(/^(.+?)(?:\s*-\s*(.+?))?\s*-\s*YouTube$/i);
        if (ytMatch) {
            details.contentTitle = ytMatch[1].trim();
            details.channel = ytMatch[2]?.trim() || null;
        }
    }
    // Google Search
    else if (domain && domain.includes('google') && title.includes(' - Pesquisa Google')) {
        details.platform = 'Google';
        details.contentType = 'search';
        details.searchQuery = title.replace(' - Pesquisa Google', '').replace(' - Google Search', '').trim();
        details.contentTitle = details.searchQuery;
    }
    // Netflix
    else if (domain && domain.includes('netflix')) {
        details.platform = 'Netflix';
        details.contentType = 'video';
        const nfMatch = title.replace(' | Netflix', '').replace(' - Netflix', '');
        details.contentTitle = nfMatch.trim();
    }
    // Spotify
    else if (domain && domain.includes('spotify')) {
        details.platform = 'Spotify';
        details.contentType = 'music';
    }
    // Twitch
    else if (domain && domain.includes('twitch')) {
        details.platform = 'Twitch';
        details.contentType = 'stream';
        const twMatch = title.replace(' - Twitch', '');
        details.contentTitle = twMatch.trim();
    }
    // Instagram
    else if (domain && domain.includes('instagram')) {
        details.platform = 'Instagram';
        const igMatch = title.match(/@(\w+)/);
        if (igMatch) {
            details.channel = igMatch[1];
        }
    }
    // TikTok
    else if (domain && domain.includes('tiktok')) {
        details.platform = 'TikTok';
        details.contentType = 'video';
    }
    // GitHub
    else if (domain && domain.includes('github')) {
        details.platform = 'GitHub';
        details.contentType = 'code';
    }

    return details;
}

// Extract interests/topics from content
function extractInterests(contentTitle) {
    const topics = [];
    const lowerTitle = contentTitle.toLowerCase();

    const TOPIC_KEYWORDS = {
        'programação': ['code', 'coding', 'programming', 'developer', 'javascript', 'python', 'react', 'node', 'tutorial de programação'],
        'música': ['music', 'song', 'album', 'playlist', 'música', 'canção'],
        'jogos': ['game', 'gaming', 'gameplay', 'let\'s play', 'jogo', 'gamer'],
        'educação': ['learn', 'course', 'tutorial', 'how to', 'como fazer', 'aprenda', 'aula'],
        'notícias': ['news', 'breaking', 'notícias', 'jornal'],
        'fitness': ['workout', 'exercise', 'fitness', 'gym', 'treino', 'exercício'],
        'culinária': ['recipe', 'cooking', 'food', 'receita', 'cozinha'],
        'negócios': ['business', 'entrepreneur', 'startup', 'marketing', 'negócio', 'empreendedor'],
        'entretenimento': ['funny', 'comedy', 'entertainment', 'meme', 'humor'],
    };

    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
        if (keywords.some(kw => lowerTitle.includes(kw))) {
            topics.push(topic);
        }
    }

    return topics.length > 0 ? topics : ['geral'];
}

let currentApp = null;
let currentAppStart = null;
let currentUrl = null;
let currentUrlStart = null;
let currentContentTitle = null;
let activityInterval = null;

// Get active window using PowerShell
function getActiveWindow() {
    return new Promise((resolve) => {
        // Simpler approach: get the process with the main window
        const command = `powershell -NoProfile -Command "$p = Get-Process | Where-Object {$_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -ne ''} | Sort-Object -Property CPU -Descending | Select-Object -First 1; if($p) { @{Title=$p.MainWindowTitle; ProcessName=$p.ProcessName; ProcessId=$p.Id} | ConvertTo-Json } else { @{Title='Desktop'; ProcessName='explorer'; ProcessId=0} | ConvertTo-Json }"`;

        exec(command, { timeout: 3000 }, (error, stdout) => {
            if (error) {
                // Fallback: just get the active process name
                exec('powershell -NoProfile -Command "(Get-Process | Where-Object {$_.MainWindowTitle} | Select-Object -First 1).ProcessName"',
                    { timeout: 2000 },
                    (err2, stdout2) => {
                        const name = stdout2?.trim() || 'Unknown';
                        resolve({ title: name, processName: name, processId: 0 });
                    }
                );
                return;
            }
            try {
                const result = JSON.parse(stdout.trim());
                resolve({
                    title: result.Title || 'Unknown',
                    processName: result.ProcessName || 'Unknown',
                    processId: result.ProcessId || 0,
                });
            } catch {
                resolve({ title: 'Unknown', processName: 'Unknown', processId: 0 });
            }
        });
    });
}

// Get category for an app
function getAppCategory(appName) {
    const app = appName.toLowerCase();

    for (const [category, apps] of Object.entries(APP_CATEGORIES)) {
        if (apps.some(a => app.includes(a))) {
            return category;
        }
    }
    return 'other';
}

// Get category for a website
function getWebsiteCategory(domain) {
    const d = domain.toLowerCase();

    for (const [category, domains] of Object.entries(WEBSITE_CATEGORIES)) {
        if (domains.some(dom => d.includes(dom))) {
            return category;
        }
    }
    return 'other';
}

// Track activity every 5 seconds
async function trackActivity() {
    const window = await getActiveWindow();
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];

    // Reset data if new day
    if (activityData.today !== today) {
        saveActivityData();
        activityData = {
            today,
            apps: {},
            timeline: [],
            webHistory: [],
            websites: {},
            categories: { productive: 0, entertainment: 0, social: 0, other: 0 },
        };
        currentApp = null;
        currentAppStart = null;
        currentUrl = null;
        currentUrlStart = null;
    }

    const appName = window.processName || 'Unknown';
    const windowTitle = window.title || '';
    const isBrowser = BROWSERS.some(b => appName.toLowerCase().includes(b));

    // Extract URL/domain from browser window title
    let detectedUrl = null;
    let detectedDomain = null;

    if (isBrowser && windowTitle) {
        // Most browsers show: "Page Title - Browser Name" or "Page Title — Domain"
        // Try to extract domain from title
        const urlMatch = windowTitle.match(/(?:https?:\/\/)?([a-zA-Z0-9][-a-zA-Z0-9]*(?:\.[a-zA-Z0-9][-a-zA-Z0-9]*)+)/);
        if (urlMatch) {
            detectedDomain = urlMatch[1].toLowerCase();
            detectedUrl = windowTitle;
        } else {
            // Try to get domain from common patterns
            const patterns = [
                /- ([a-z0-9]+\.(?:com|org|net|io|dev|br|pt|gov)[^\s]*)/i,
                /([a-z0-9]+\.(?:com|org|net|io|dev|br|pt|gov)[^\s]*) -/i,
            ];
            for (const pattern of patterns) {
                const match = windowTitle.match(pattern);
                if (match) {
                    detectedDomain = match[1].toLowerCase();
                    break;
                }
            }
        }
    }

    // If app changed, save previous session
    if (currentApp && currentApp !== appName && currentAppStart) {
        const duration = Math.floor((now - currentAppStart) / 1000);
        if (!activityData.apps[currentApp]) {
            activityData.apps[currentApp] = { totalSeconds: 0, lastSeen: now };
        }
        activityData.apps[currentApp].totalSeconds += duration;
        activityData.apps[currentApp].lastSeen = now;

        // Categorize the time
        const category = getAppCategory(currentApp);
        activityData.categories[category] += duration;

        activityData.timeline.push({
            app: currentApp,
            title: windowTitle,
            start: currentAppStart,
            end: now,
            duration,
            category,
        });

        currentAppStart = now;
    }

    // Track website if in browser
    if (isBrowser && detectedDomain) {
        // Extract detailed content from window title
        const contentDetails = extractContentDetails(windowTitle, detectedDomain);

        if (currentUrl !== detectedDomain && currentUrlStart) {
            const urlDuration = Math.floor((now - currentUrlStart) / 1000);

            // Save previous URL session
            if (currentUrl) {
                if (!activityData.websites[currentUrl]) {
                    activityData.websites[currentUrl] = { totalSeconds: 0, visits: 0 };
                }
                activityData.websites[currentUrl].totalSeconds += urlDuration;
                activityData.websites[currentUrl].visits++;

                // Add to web history
                activityData.webHistory.push({
                    domain: currentUrl,
                    title: currentContentTitle || windowTitle,
                    timestamp: new Date(currentUrlStart).toISOString(),
                    duration: urlDuration,
                    category: getWebsiteCategory(currentUrl),
                });
            }
        }

        // Track content changes (even on same domain)
        if (currentContentTitle !== contentDetails.contentTitle) {
            // Save previous content session
            if (currentContentTitle && currentUrlStart) {
                const contentDuration = Math.floor((now - currentUrlStart) / 1000);

                // Add to content history
                activityData.contentHistory.push({
                    platform: contentDetails.platform,
                    contentTitle: currentContentTitle,
                    contentType: contentDetails.contentType,
                    channel: contentDetails.channel,
                    timestamp: new Date(currentUrlStart).toISOString(),
                    duration: contentDuration,
                });

                // Track YouTube videos specifically
                if (contentDetails.platform === 'YouTube' && currentContentTitle) {
                    activityData.youtubeVideos.push({
                        title: currentContentTitle,
                        channel: contentDetails.channel,
                        timestamp: new Date(currentUrlStart).toISOString(),
                        duration: contentDuration,
                    });
                }

                // Track search queries
                if (contentDetails.contentType === 'search' && contentDetails.searchQuery) {
                    activityData.searchQueries.push({
                        query: contentDetails.searchQuery,
                        platform: contentDetails.platform,
                        timestamp: new Date().toISOString(),
                    });
                }

                // Update interests
                const topics = extractInterests(currentContentTitle);
                for (const topic of topics) {
                    if (!activityData.interests[topic]) {
                        activityData.interests[topic] = { count: 0, totalTime: 0 };
                    }
                    activityData.interests[topic].count++;
                    activityData.interests[topic].totalTime += contentDuration;
                }
            }

            currentContentTitle = contentDetails.contentTitle;
        }

        if (currentUrl !== detectedDomain) {
            currentUrl = detectedDomain;
            currentUrlStart = now;
        }
    }

    // Start tracking new app
    if (currentApp !== appName) {
        currentApp = appName;
        currentAppStart = now;
    }

    // Update last seen
    if (!activityData.apps[appName]) {
        activityData.apps[appName] = { totalSeconds: 0, lastSeen: now };
    }
    activityData.apps[appName].lastSeen = now;
}

// Save activity data to file
function saveActivityData() {
    const fs = require('fs');
    const dataPath = path.join(app.getPath('userData'), 'activity');

    if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath, { recursive: true });
    }

    const filePath = path.join(dataPath, `${activityData.today}.json`);
    fs.writeFileSync(filePath, JSON.stringify(activityData, null, 2));
}

// Get activity data
function getActivityData(date) {
    const fs = require('fs');
    const targetDate = date || new Date().toISOString().split('T')[0];

    if (targetDate === activityData.today) {
        return activityData;
    }

    const filePath = path.join(app.getPath('userData'), 'activity', `${targetDate}.json`);

    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
    } catch (e) {
        console.error('Error reading activity data:', e);
    }

    return { today: targetDate, apps: {}, timeline: [] };
}

// Get activity summary
function getActivitySummary() {
    const apps = Object.entries(activityData.apps)
        .map(([name, data]) => ({
            name,
            totalSeconds: data.totalSeconds,
            totalMinutes: Math.round(data.totalSeconds / 60),
            formattedTime: formatDuration(data.totalSeconds),
            category: getAppCategory(name),
        }))
        .sort((a, b) => b.totalSeconds - a.totalSeconds);

    const websites = Object.entries(activityData.websites || {})
        .map(([domain, data]) => ({
            domain,
            totalSeconds: data.totalSeconds,
            totalMinutes: Math.round(data.totalSeconds / 60),
            formattedTime: formatDuration(data.totalSeconds),
            visits: data.visits,
            category: getWebsiteCategory(domain),
        }))
        .sort((a, b) => b.totalSeconds - a.totalSeconds);

    const totalSeconds = apps.reduce((sum, app) => sum + app.totalSeconds, 0);
    const categories = activityData.categories || { productive: 0, entertainment: 0, social: 0, other: 0 };

    // Calculate percentages
    const totalCatSeconds = Object.values(categories).reduce((a, b) => a + b, 0) || 1;
    const categoryPercentages = {
        productive: Math.round((categories.productive / totalCatSeconds) * 100),
        entertainment: Math.round((categories.entertainment / totalCatSeconds) * 100),
        social: Math.round((categories.social / totalCatSeconds) * 100),
        other: Math.round((categories.other / totalCatSeconds) * 100),
    };

    return {
        date: activityData.today,
        totalTime: formatDuration(totalSeconds),
        totalMinutes: Math.round(totalSeconds / 60),
        apps,
        websites,
        webHistory: (activityData.webHistory || []).slice(-20), // Last 20 sites
        categories,
        categoryPercentages,
        currentApp,
        currentUrl,
        currentContent: currentContentTitle,
        isTracking: !!activityInterval,
        // AI Learning Data
        contentHistory: (activityData.contentHistory || []).slice(-50),
        youtubeVideos: (activityData.youtubeVideos || []).slice(-20),
        searchQueries: (activityData.searchQueries || []).slice(-20),
        interests: activityData.interests || {},
        // Top interests
        topInterests: Object.entries(activityData.interests || {})
            .map(([topic, data]) => ({ topic, ...data }))
            .sort((a, b) => b.totalTime - a.totalTime)
            .slice(0, 5),
    };
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

// Start/Stop tracking
function startActivityTracking() {
    if (activityInterval) return;
    activityInterval = setInterval(() => {
        trackActivity();
        updateRendererActivity(); // Keep renderer in sync
    }, 5000); // Every 5 seconds
    trackActivity(); // Immediate first track
    updateRendererActivity();
    console.log('Activity tracking started');
}

function stopActivityTracking() {
    if (activityInterval) {
        clearInterval(activityInterval);
        activityInterval = null;
        saveActivityData();
        console.log('Activity tracking stopped');
    }
}

// App lifecycle
app.whenReady().then(() => {
    createWindow();
    startActivityTracking(); // Auto-start tracking

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    stopActivityTracking();
    saveActivityData();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    stopActivityTracking();
    saveActivityData();
});

// Expose APIs for renderer
global.defenderAPI = {
    getStatus: getWindowsDefenderStatus,
    runScan: runVirusScan,
};

global.activityAPI = {
    getSummary: getActivitySummary,
    getData: getActivityData,
    start: startActivityTracking,
    stop: stopActivityTracking,
    isTracking: () => !!activityInterval,
};
