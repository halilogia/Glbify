export const LANGUAGES = {
    tr: {
        'app.subtitle': 'FBX · GLB · OBJ · STL · USDZ',
        'app.hint': 'çift tıklayarak kamerayı sıfırla',
        'app.install': 'Uygulamayı kur',
        'app.share': 'Ayar linkini kopyala',
        'app.cache': 'Önbellek: hesaplanıyor...',
        'app.cache.clear': 'Önbellek: tıkla ve temizle',
        'app.cache.unknown': 'Önbellek: desteklenmiyor',
        'app.reset': 'Sıfırla',
        'app.language': 'Dil',

        'model.title': 'Yüklü Model',
        'model.meshes': 'Mesh',
        'model.vertices': 'Vertex',
        'model.triangles': 'Üçgen',
        'model.animation': 'Animasyon',
        'model.animations': '{count} animasyon',
        'model.audit': 'Doku denetimi: {count} uyarı',
        'model.clipCount': '{count} klip',

        'drop.title': 'Modelini Bırak',
        'drop.subtitle': 'Glbify senin için dönüştürsün ve göstersin.',
        'drop.browse': 'Dosya Seç',
        'drop.limit': 'Dosya limiti',
        'drop.multi': 'OBJ + MTL + doku dosyalarını birlikte bırakabilirsin.',
        'drop.working': 'Glbify İşliyor...',
        'drop.reading': 'Dosya okunuyor',
        'drop.parse': 'Model ayrıştırılıyor',
        'drop.parseHint': '{label} · bu birkaç saniye sürebilir',
        'drop.preparing': 'Sahne hazırlanıyor',
        'drop.preparingHint': 'Materyaller ve ölçek hesaplanıyor',
        'drop.cancel': 'İptal',
        'drop.unsupported': 'Bu dosya türü desteklenmiyor',
        'drop.materialEmpty': 'Model yüklenince materyaller burada listelenir.',

        'tool.materials': 'Materyal',
        'tool.scene': 'Sahne',
        'tool.system': 'Sistem',
        'tool.frame': 'Çerçevele',
        'tool.transformReset': 'Sıfırla',
        'tool.translate': 'Hareket',
        'tool.rotate': 'Döndür',
        'tool.scale': 'Ölçek',
        'tool.undo': 'Geri al (Ctrl+Z)',
        'tool.redo': 'Yinele (Ctrl+Shift+Z)',
        'tool.prevFrame': 'Önceki kare (,)',
        'tool.nextFrame': 'Sonraki kare (.)',
        'tool.tools': 'Araçlar',
        'tool.readout': '{mode} · {position}',

        'scene.environment': 'Environment yoğunluğu',
        'scene.key': 'Ana ışık',
        'scene.fill': 'Dolgu ışığı',
        'scene.exposure': 'Pozlama',
        'scene.background': 'Arka plan',
        'scene.grid': 'Izgara görünür',
        'scene.roughness': 'Roughness',
        'scene.metalness': 'Metalness',
        'scene.profile': 'Sıkıştırma profili',
        'scene.profileCopy': 'Profil kodunu kopyala',
        'scene.profileImport': 'Profil kodunu uygula',
        'scene.profilePlaceholder': 'Profil kodunu yapıştır',
        'scene.profileApplied': 'Profil uygulandı: {summary}',
        'scene.profileCopied': 'Profil kodu panoya kopyalandı.',
        'scene.profileInvalid': 'Profil kodu okunamadı.',
        'scene.shareLink': 'Ayar linki panoya kopyalandı.',

        'system.renderer': 'Renderer',
        'system.webgpu': 'WebGPU',
        'system.xr': 'WebXR / AR',
        'system.memory': 'Cihaz belleği',
        'system.backend': 'Render backend',
        'system.backendWebgl': 'WebGL2 (önerilen)',
        'system.backendWebgpu': 'WebGPU (deneysel)',
        'system.xrStart': 'AR önizleme',
        'system.xrUnavailable': 'Bu cihazda WebXR oturumu yok.',
        'system.capabilities': 'Yetenekler',

        'export.advanced': 'Gelişmiş ayarlar (birim, doku, DRACO)',
        'export.software': 'Hedef Yazılım / Birim',
        'export.resolution': 'Doku Çözünürlüğü',
        'export.resolutionNone': 'Dokuları gömme (en küçük)',
        'export.format': 'Doku Formatı',
        'export.formatOriginal': 'Orijinal (PNG)',
        'export.formatPng': 'PNG (kayıpsız)',
        'export.formatJpeg': 'JPEG (küçük)',
        'export.formatWebp': 'WebP (dengeli)',
        'export.quality': 'Kalite',
        'export.invertNormals': 'Normal map yönünü ters çevir',
        'export.generateNormals': "Diffuse'dan normal haritası üret",
        'export.quickLook': 'USDZ: Quick Look uyumlu (kare kare)',
        'export.draco': 'DRACO sıkıştırma',
        'export.qualityLevel': 'Kalite',
        'export.levelHigh': 'Yüksek',
        'export.levelBalanced': 'Dengeli',
        'export.levelMax': 'Maksimum sıkıştırma',
        'export.weld': 'Vertex birleştir',
        'export.ktx2': 'KTX2 doku',
        'export.dracoHint':
            "DRACO yalnızca GLB çıktısında KHR_draco_mesh_compression uzantısı ile çalışır.",
        'export.estimate': 'Tahmini çıktı: ~{size}{textures}',
        'export.estimateTextures': ' ({count} doku)',
        'export.glb': 'GLB İndir',
        'export.usdz': 'USDZ İndir',
        'export.stl': 'STL İndir',
        'export.obj': 'OBJ İndir',
        'export.usdzHint': 'Apple AR Quick Look ve Quick Look görüntüleyicileri için.',
        'export.stlHint': '3B baskı ve STL kullanan araçlar için (doku/materyal yok).',
        'export.objHint': 'OBJ formatı dokuları tek dosyada saklayamaz. Sadece şekli indirir.',
        'export.preparing': 'Hazırlanıyor...',
        'export.simplifyOff': 'Kapalı',
        'export.simplifyKeep': "vertex %'ini koru",

        'anim.play': 'Oynat / Duraklat',
        'anim.stop': 'Durdur',
        'anim.speed': 'Hız',
        'anim.loop': 'Döngü',
        'anim.time': '{time}s / {duration}s',

        'toast.limit': 'Dosya limiti aşıldı: {message}',
        'toast.empty': 'Dosya boş: {message}',
        'toast.failed': 'Yükleme başarısız: {message}',
        'toast.cancelled': 'Yükleme iptal edildi.',
        'toast.memory': '{message}',
        'toast.exportFailed': '{label} dışa aktarılamadı: {message}',
        'toast.exported': '{file} indirildi ({size})',
        'toast.saved': 'DRACO ile %{percent} küçüldü',
        'toast.contextLost': 'Grafik bağlamı kayboldu. Sayfayı yenileyin.',
        'toast.offlineReady': 'Çevrimdışı kullanıma hazır.',
        'toast.cachesCleared': '{count} önbellek silindi. Sayfa yenilenince yeniden indirilir.',
        'toast.mtlApplied': 'MTL uygulandı: {count} mesh · {detail}',
        'toast.mtlNoMatch': 'MTL eşleşen materyal bulunamadı. OBJ dosyasında "usemtl" adları eşleşmiyor.',
        'toast.mtlAppliedFile': 'MTL uygulandı: {detail}',
        'toast.worker': '{label} ayrıştırması arka plan işçisinde yapıldı.',
        'toast.auditClean': 'Doku denetimi temiz: {count} doku, uyarı yok.',
        'toast.auditIssues': 'Doku denetimi: {count} uyarı\n{issues}',
        'toast.unindexed': 'Modelde indekslenmemiş geometri var. GLB/DRACO çıktısı daha büyük olabilir.',
        'toast.highTriangles': '{count} üçgen: düşük cihazlarda FPS düşebilir.',
        'toast.gltfWarning': '.gltf dış kaynakları (bin/doku) tarayıcıdan okunamaz. GLB olarak dışa aktarın.',
        'toast.installed': 'Glbify masaüstüne kuruldu.',
        'toast.installing': 'Kurulum başlatıldı.',
        'toast.xrStarting': 'AR oturumu başlatılıyor...',
        'toast.multiModel': 'Aynı anda yalnızca bir model işlenebilir. İlk dosya yükleniyor.',
        'toast.noModel': 'Model dosyası bulunamadı.',
    },

    en: {
        'app.subtitle': 'FBX · GLB · OBJ · STL · USDZ',
        'app.hint': 'double-click to frame the model',
        'app.install': 'Install app',
        'app.share': 'Copy settings link',
        'app.cache': 'Cache: calculating...',
        'app.cache.clear': 'Cache: {size} · click to clear',
        'app.cache.unknown': 'Cache: unsupported',
        'app.reset': 'Reset',
        'app.language': 'Language',

        'model.title': 'Loaded model',
        'model.meshes': 'Meshes',
        'model.vertices': 'Vertices',
        'model.triangles': 'Triangles',
        'model.animation': 'Animation',
        'model.animations': '{count} animations',
        'model.audit': 'Texture audit: {count} issues',
        'model.clipCount': '{count} clips',

        'drop.title': 'Drop your model',
        'drop.subtitle': 'Glbify converts and shows it for you.',
        'drop.browse': 'Choose file',
        'drop.limit': 'File limit',
        'drop.multi': 'Drop OBJ + MTL + textures together.',
        'drop.working': 'Glbify is working...',
        'drop.reading': 'Reading file',
        'drop.parse': 'Parsing model',
        'drop.parseHint': '{label} · this may take a few seconds',
        'drop.preparing': 'Preparing scene',
        'drop.preparingHint': 'Converting materials and measuring scale',
        'drop.cancel': 'Cancel',
        'drop.unsupported': 'This file type is not supported',
        'drop.materialEmpty': 'Materials are listed here once a model is loaded.',

        'tool.materials': 'Material',
        'tool.scene': 'Scene',
        'tool.system': 'System',
        'tool.frame': 'Frame',
        'tool.transformReset': 'Reset',
        'tool.translate': 'Move',
        'tool.rotate': 'Rotate',
        'tool.scale': 'Scale',
        'tool.undo': 'Undo (Ctrl+Z)',
        'tool.redo': 'Redo (Ctrl+Shift+Z)',
        'tool.prevFrame': 'Previous frame (,)',
        'tool.nextFrame': 'Next frame (.)',
        'tool.tools': 'Tools',
        'tool.readout': '{mode} · {position}',

        'scene.environment': 'Environment intensity',
        'scene.key': 'Key light',
        'scene.fill': 'Fill light',
        'scene.exposure': 'Exposure',
        'scene.background': 'Background',
        'scene.grid': 'Show grid',
        'scene.roughness': 'Roughness',
        'scene.metalness': 'Metalness',
        'scene.profile': 'Compression profile',
        'scene.profileCopy': 'Copy profile code',
        'scene.profileImport': 'Apply profile code',
        'scene.profilePlaceholder': 'Paste profile code',
        'scene.profileApplied': 'Profile applied: {summary}',
        'scene.profileCopied': 'Profile code copied to clipboard.',
        'scene.profileInvalid': 'Profile code could not be read.',
        'scene.shareLink': 'Settings link copied to clipboard.',

        'system.renderer': 'Renderer',
        'system.webgpu': 'WebGPU',
        'system.xr': 'WebXR / AR',
        'system.memory': 'Device memory',
        'system.backend': 'Render backend',
        'system.backendWebgl': 'WebGL2 (recommended)',
        'system.backendWebgpu': 'WebGPU (experimental)',
        'system.xrStart': 'AR preview',
        'system.xrUnavailable': 'WebXR sessions are not available on this device.',
        'system.capabilities': 'Capabilities',

        'export.advanced': 'Advanced settings (units, textures, DRACO)',
        'export.software': 'Target software / unit',
        'export.resolution': 'Texture resolution',
        'export.resolutionNone': 'Skip textures (smallest)',
        'export.format': 'Texture format',
        'export.formatOriginal': 'Original (PNG)',
        'export.formatPng': 'PNG (lossless)',
        'export.formatJpeg': 'JPEG (small)',
        'export.formatWebp': 'WebP (balanced)',
        'export.quality': 'Quality',
        'export.invertNormals': 'Flip normal maps',
        'export.generateNormals': "Generate normal map from diffuse",
        'export.quickLook': 'USDZ: Quick Look compatible (baked frames)',
        'export.draco': 'DRACO compression',
        'export.qualityLevel': 'Quality',
        'export.levelHigh': 'High',
        'export.levelBalanced': 'Balanced',
        'export.levelMax': 'Maximum compression',
        'export.weld': 'Weld vertices',
        'export.ktx2': 'KTX2 textures',
        'export.dracoHint': 'DRACO only applies to GLB output via KHR_draco_mesh_compression.',
        'export.estimate': 'Estimated output: ~{size}{textures}',
        'export.estimateTextures': ' ({count} textures)',
        'export.glb': 'Download GLB',
        'export.usdz': 'Download USDZ',
        'export.stl': 'Download STL',
        'export.obj': 'Download OBJ',
        'export.usdzHint': 'For Apple AR Quick Look and Quick Look viewers.',
        'export.stlHint': 'For 3D printing and STL tools (no textures/materials).',
        'export.objHint': 'OBJ cannot embed textures in a single file. Geometry only.',
        'export.preparing': 'Preparing...',
        'export.simplifyOff': 'Off',
        'export.simplifyKeep': 'keep {percent}% of vertices',

        'anim.play': 'Play / Pause',
        'anim.stop': 'Stop',
        'anim.speed': 'Speed',
        'anim.loop': 'Loop',
        'anim.time': '{time}s / {duration}s',

        'toast.limit': 'File limit exceeded: {message}',
        'toast.empty': 'Empty file: {message}',
        'toast.failed': 'Loading failed: {message}',
        'toast.cancelled': 'Loading cancelled.',
        'toast.memory': '{message}',
        'toast.exportFailed': '{label} export failed: {message}',
        'toast.exported': '{file} downloaded ({size})',
        'toast.saved': 'DRACO saved {percent}%',
        'toast.contextLost': 'Graphics context lost. Please reload the page.',
        'toast.offlineReady': 'Ready for offline use.',
        'toast.cachesCleared': '{count} caches cleared. Reload to download again.',
        'toast.mtlApplied': 'MTL applied: {count} meshes · {detail}',
        'toast.mtlNoMatch': 'No matching materials in the MTL; OBJ "usemtl" names do not match.',
        'toast.mtlAppliedFile': 'MTL applied: {detail}',
        'toast.worker': '{label} parsed in a background worker.',
        'toast.auditClean': 'Texture audit clean: {count} textures, no issues.',
        'toast.auditIssues': 'Texture audit: {count} issues\n{issues}',
        'toast.unindexed': 'Model contains unindexed geometry; GLB/DRACO output will be larger.',
        'toast.highTriangles': '{count} triangles: frame rate may drop on low-end devices.',
        'toast.gltfWarning': 'External .gltf resources cannot be read in the browser. Export GLB instead.',
        'toast.installed': 'Glbify was installed.',
        'toast.installing': 'Installation started.',
        'toast.xrStarting': 'Starting AR session...',
        'toast.multiModel': 'Only one model can be processed at a time. Loading the first file.',
        'toast.noModel': 'No model file found.',
    },
};

const STORAGE_KEY = 'glbify:language';
const DEFAULT_LANGUAGE = 'tr';

let current = DEFAULT_LANGUAGE;
let listeners = new Set();

export function getLanguage() {
    return current;
}

export function availableLanguages() {
    return Object.keys(LANGUAGES);
}

export function initLanguage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && LANGUAGES[stored]) current = stored;
    } catch {
        current = DEFAULT_LANGUAGE;
    }
    return current;
}

export function setLanguage(language) {
    if (!LANGUAGES[language] || language === current) return current;
    current = language;
    try {
        localStorage.setItem(STORAGE_KEY, language);
    } catch {
        // Gizli mod: dil yalnizca bu oturum icin gecerli.
    }
    applyTranslations();
    listeners.forEach((listener) => listener(language));
    return current;
}

export function onLanguageChange(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function t(key, vars) {
    const dictionary = LANGUAGES[current] ?? LANGUAGES[DEFAULT_LANGUAGE];
    const fallback = LANGUAGES[DEFAULT_LANGUAGE];
    const template = dictionary[key] ?? fallback[key] ?? key;
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (match, name) => (vars[name] ?? match));
}

export function applyTranslations(root = document) {
    for (const element of root.querySelectorAll('[data-i18n]')) {
        element.textContent = t(element.dataset.i18n);
    }
    for (const element of root.querySelectorAll('[data-i18n-title]')) {
        element.title = t(element.dataset.i18nTitle);
    }
    for (const element of root.querySelectorAll('[data-i18n-aria]')) {
        element.setAttribute('aria-label', t(element.dataset.i18nAria));
    }
    for (const element of root.querySelectorAll('[data-i18n-placeholder]')) {
        element.placeholder = t(element.dataset.i18nPlaceholder);
    }
    document.documentElement.lang = current;
}
