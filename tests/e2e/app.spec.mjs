import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(fileURLToPath(new URL('.', import.meta.url)), 'out');
const BASE = process.env.GLBY_BASE_URL ?? 'http://localhost:4173/';

const fixtures = resolve(fileURLToPath(new URL('..', import.meta.url)), 'fixtures');

const cubeVertices = [
    [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
    [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1],
];
const cubeTriangles = [
    [1, 2, 3], [1, 3, 4], [5, 7, 6], [5, 8, 7],
    [1, 5, 6], [1, 6, 2], [2, 6, 7], [2, 7, 3],
    [3, 7, 8], [3, 8, 4], [4, 8, 5], [4, 5, 1],
];

function asciiCube() {
    const body = cubeTriangles
        .map(([a, b, c]) =>
            [
                'facet normal 0 0 0',
                'outer loop',
                `vertex ${cubeVertices[a - 1].join(' ')}`,
                `vertex ${cubeVertices[b - 1].join(' ')}`,
                `vertex ${cubeVertices[c - 1].join(' ')}`,
                'endloop',
                'endfacet',
                '',
            ].join('\n'),
        )
        .join('\n');
    return `solid cube\n${body}endsolid cube\n`;
}

const results = [];
const check = (name, ok, detail = '') => {
    results.push({ name, ok });
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` :: ${detail}` : ''}`);
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
    const { mkdirSync, readdirSync, statSync, rmSync } = await import('node:fs');
    mkdirSync(OUT, { recursive: true });
    for (const entry of readdirSync(OUT)) rmSync(join(OUT, entry), { force: true, recursive: true });

    writeFileSync(join(OUT, 'cube.stl'), asciiCube());
    writeFileSync(join(OUT, 'cube.obj'), asciiCube().replace(/^solid.*$/im, '# cube').replace(/endsolid.*$/im, ''));

    const puppeteer = (await import('puppeteer')).default;
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    const consoleErrors = [];
    page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`));

    const client = await page.createCDPSession();
    await client.send('Browser.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: OUT,
        eventsEnabled: true,
    });

    await page.goto(BASE, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => Boolean(globalThis.__glbify?.viewer), { timeout: 30000 });

    check('sayfa yuklendi', (await page.$('#drop-zone')) !== null);
    check('manifest yuklendi', Boolean(await page.evaluate(async () => {
        const response = await fetch(new URL('manifest.webmanifest', document.baseURI));
        return response.ok ? response.json() : null;
    })));
    const isDev = await page.evaluate(() =>
        Boolean(document.querySelector('script[src*="@vite/"], script[src*="/@react-refresh"]')),
    );

    check('service worker kayitli', isDev || (await page.evaluate(async () => {
        const registration = await navigator.serviceWorker.getRegistration();
        return Boolean(registration);
    })));

    const upload = async (file, ...extra) => {
        const input = await page.$('#file-input');
        await input.uploadFile(file, ...extra);
        await page.waitForFunction(
            () => document.querySelector('#controls').classList.contains('is-visible'),
            { timeout: 30000 },
        );
    };

    const uploadMany = async (paths) => {
        const payload = paths.map((file) => ({
            name: file.split(/[\\/]/).pop(),
            data: readFileSync(file).toString('base64'),
        }));
        await page.evaluate((items) => {
            const transfer = new DataTransfer();
            for (const item of items) {
                const bytes = Uint8Array.from(atob(item.data), (char) => char.charCodeAt(0));
                transfer.items.add(new File([bytes], item.name, item.name.endsWith('.png') ? { type: 'image/png' } : {}));
            }
            window.dispatchEvent(new DragEvent('drop', { dataTransfer: transfer, bubbles: true, cancelable: true }));
        }, payload);
        await page.waitForFunction(
            () => document.querySelector('#controls').classList.contains('is-visible'),
            { timeout: 30000 },
        );
    };

    const resetModel = async () => {
        await page.click('#btn-reset');
        await page.waitForFunction(
            () => !document.querySelector('#controls').classList.contains('is-visible'),
            { timeout: 8000 },
        );
    };

    const listOut = () => readdirSync(OUT);
    const exportExtensions = ['.glb', '.usdz', '.stl', '.obj'];

    const exportFile = async (selector) => {
        await page.evaluate(() => {
            document.querySelectorAll('.toast').forEach((node) => node.remove());
            document.querySelector('#export-bar').style.width = '0%';
        });
        const before = new Map(
            listOut()
                .filter((name) => exportExtensions.some((extension) => name.endsWith(extension)))
                .map((name) => [name, statSync(join(OUT, name)).mtimeMs]),
        );

        await page.click(selector);
        await page.waitForFunction(
            () =>
                document.querySelectorAll('.toast').length > 0 &&
                document.querySelector('#export-bar').style.width === '100%',
            { timeout: 120000 },
        );

        const toasts = await page.evaluate(() =>
            [...document.querySelectorAll('.toast')].map((node) => node.textContent.trim()),
        );

        let created = null;
        for (let attempt = 0; attempt < 40 && !created; attempt += 1) {
            let newest = null;
            let newestTime = 0;
            for (const name of listOut()) {
                if (!exportExtensions.some((extension) => name.endsWith(extension))) continue;
                const previous = before.get(name);
                const time = statSync(join(OUT, name)).mtimeMs;
                if (previous !== undefined && time <= previous + 1) continue;
                if (time > newestTime) {
                    newest = name;
                    newestTime = time;
                }
            }
            created = newest;
            if (!created) await wait(250);
        }

        return { created, toasts };
    };

    const readGlbJson = (name) => {
        const buffer = readFileSync(join(OUT, name));
        return {
            buffer,
            json: JSON.parse(buffer.toString('utf8', 20, 20 + buffer.readUInt32LE(12))),
        };
    };

    // 1) STL yukleme + worker ayristirma
    await upload(join(OUT, 'cube.stl'));
    const stlStats = await page.evaluate(() => ({
        meshes: document.querySelector('#stat-meshes').textContent,
        vertices: document.querySelector('#stat-vertices').textContent,
        triangles: document.querySelector('#stat-triangles').textContent,
        toasts: [...document.querySelectorAll('.toast')].map((node) => node.textContent).join(' | '),
    }));
    check('STL yuklendi', stlStats.vertices === '36' && stlStats.triangles === '12', JSON.stringify(stlStats));
    check('worker ayristirma kullanildi', stlStats.toasts.includes('arka plan işçisi'), stlStats.toasts.slice(0, 90));
    check(
        'boyut tahmini gosteriliyor',
        (await page.$eval('#size-estimate', (el) => el.textContent)).includes('Tahmini çıktı'),
    );

    // 2) GLB + DRACO
    const glb = await exportFile('#btn-export-glb');
    check('GLB indirildi', glb.created?.endsWith('.glb'), `${glb.created} | ${glb.toasts.join(' ')}`);
    if (glb.created) {
        const { json } = readGlbJson(glb.created);
        check('GLB DRACO uzantisi', json.extensionsUsed?.includes('KHR_draco_mesh_compression') === true, JSON.stringify(json.extensionsUsed));
    }

    // 3) USDZ
    const usdz = await exportFile('#btn-export-usdz');
    check(
        'USDZ ZIP olarak indi',
        Boolean(usdz.created) && readFileSync(join(OUT, usdz.created)).subarray(0, 2).toString('latin1') === 'PK',
        `${usdz.created} | ${usdz.toasts.join(' ')}`,
    );

    // 4) STL / OBJ cikti
    const stlOut = await exportFile('#btn-export-stl');
    check('STL cikti dogru', stlOut.created && readFileSync(join(OUT, stlOut.created)).readUInt32LE(80) > 0, stlOut.created);
    const objOut = await exportFile('#btn-export-obj');
    check('OBJ cikti indi', objOut.created?.endsWith('.obj'), objOut.created);

    // 5) PLY / 3MF
    await resetModel();
    await upload(join(fixtures, 'cube.ply'));
    check('PLY yuklendi', (await page.$eval('#stat-triangles', (el) => el.textContent)) === '12');

    await resetModel();
    await upload(join(fixtures, 'tetra.3mf'));
    check('3MF yuklendi', (await page.$eval('#stat-triangles', (el) => el.textContent)) === '4');

    // 6) OBJ + MTL + doku
    await resetModel();
    await uploadMany([join(fixtures, 'textured.obj'), join(fixtures, 'textured.mtl'), join(fixtures, 'albedo.png')]);
    const materials = await page.evaluate(() => {
        const meshes = [];
        globalThis.__glbify.model.traverse((child) => {
            if (child.isMesh) {
                meshes.push({ map: Boolean(child.material?.map), color: child.material?.color?.getHexString?.() });
            }
        });
        return meshes;
    });
    check(
        'OBJ + MTL materyal uygulandi',
        materials.length > 0 && materials.every((entry) => entry.map) && materials[0].color === 'dc2828',
        JSON.stringify(materials),
    );

    // 7) Doku format donusumu (JPEG)
    await page.evaluate(() => {
        const select = document.querySelector('#texture-format');
        select.value = 'jpeg';
        select.dispatchEvent(new Event('change'));
    });
    const jpeg = await exportFile('#btn-export-glb');
    if (jpeg.created) {
        const { json } = readGlbJson(jpeg.created);
        check('GLB dokusu JPEG', json.images?.[0]?.mimeType === 'image/jpeg', JSON.stringify(json.images ?? []));
    } else {
        check('GLB dokusu JPEG', false, 'cikti alinamadi');
    }

    // 8) Normal haritasi uretimi
    await page.evaluate(() => {
        const toggle = document.querySelector('#generate-normals');
        toggle.checked = true;
        toggle.dispatchEvent(new Event('change'));
    });
    const normals = await exportFile('#btn-export-glb');
    if (normals.created) {
        const { json } = readGlbJson(normals.created);
        check(
            'GLB normal haritasi iceriyor',
            (json.materials ?? []).some((material) => material.normalTexture !== undefined),
            JSON.stringify(json.materials ?? []),
        );
    } else {
        check('GLB normal haritasi iceriyor', false, 'cikti alinamadi');
    }

    // 9) Meshopt
    await page.evaluate(() => {
        const draco = document.querySelector('#draco-toggle');
        draco.checked = false;
        draco.dispatchEvent(new Event('change'));
        const meshopt = document.querySelector('#meshopt-toggle');
        meshopt.checked = true;
        meshopt.dispatchEvent(new Event('change'));
    });
    const meshopt = await exportFile('#btn-export-glb');
    if (meshopt.created) {
        const { json } = readGlbJson(meshopt.created);
        check(
            'EXT_meshopt_compression yazildi',
            json.extensionsUsed?.includes('EXT_meshopt_compression') === true,
            JSON.stringify(json.extensionsUsed ?? []),
        );
    } else {
        check('EXT_meshopt_compression yazildi', false, 'cikti alinamadi');
    }

    // 10) KTX2
    await resetModel();
    await uploadMany([join(fixtures, 'textured.obj'), join(fixtures, 'textured.mtl'), join(fixtures, 'albedo.png')]);
    await page.evaluate(() => {
        const ktx2 = document.querySelector('#ktx2-toggle');
        ktx2.checked = true;
        ktx2.dispatchEvent(new Event('change'));
        const draco = document.querySelector('#draco-toggle');
        draco.checked = false;
        draco.dispatchEvent(new Event('change'));
    });
    const ktx2 = await exportFile('#btn-export-glb');
    if (ktx2.created) {
        const { json } = readGlbJson(ktx2.created);
        check(
            'KHR_texture_basisu yazildi',
            json.extensionsUsed?.includes('KHR_texture_basisu') === true &&
                json.images?.[0]?.mimeType === 'image/ktx2',
            JSON.stringify({ extensionsUsed: json.extensionsUsed, images: json.images }),
        );
    } else {
        check('KHR_texture_basisu yazildi', false, 'cikti alinamadi');
    }

    // 11) Animasyon
    await resetModel();
    await upload(join(fixtures, 'animated.glb'));
    const animation = await page.evaluate(() => ({
        panel: !document.querySelector('#animation-panel').classList.contains('hidden'),
        clips: document.querySelector('#clip-selector').options.length,
        duration: globalThis.__glbify.animator?.duration ?? 0,
    }));
    check('animasyon paneli acildi', animation.panel && animation.clips === 1 && animation.duration === 1, JSON.stringify(animation));

    await page.click('#btn-anim-stop');
    await wait(200);
    await page.click('#btn-anim-play');
    await wait(600);
    const playing = await page.evaluate(() => ({
        playing: globalThis.__glbify.animator.playing,
        time: globalThis.__glbify.animator.time,
    }));
    check('animasyon oynadi', playing.playing && playing.time > 0, JSON.stringify(playing));

    // 12) Gizmo + birim onizlemesi
    const scale = await page.evaluate(() => {
        const select = document.querySelector('#scale-selector');
        select.value = '100';
        select.dispatchEvent(new Event('change'));
        document.querySelector('[data-transform="scale"]').click();
        return {
            modelScale: globalThis.__glbify.model.scale.x,
            mode: globalThis.__glbify.transform.mode,
        };
    });
    check('birim onizlemesi + gizmo', Math.abs(scale.modelScale - 100) < 0.001 && scale.mode === 'scale', JSON.stringify(scale));

    // 13) Ayar linki
    const share = await page.evaluate(async () => {
        document.querySelector('#btn-share').click();
        await new Promise((resolve) => setTimeout(resolve, 400));
        return [...document.querySelectorAll('.toast')].map((node) => node.textContent).join(' | ');
    });
    check('ayar linki kopyalandi', share.toLowerCase().includes('link'), share.slice(0, 90));

    // 14) Bellek / limit korumasi
    const guard = await page.evaluate(async () => {
        const file = new File([new Uint8Array(64)], 'devasa.stl', { type: 'model/stl' });
        Object.defineProperty(file, 'size', { value: 900 * 1024 * 1024 });
        const transfer = new DataTransfer();
        transfer.items.add(file);
        window.dispatchEvent(new DragEvent('drop', { dataTransfer: transfer, bubbles: true, cancelable: true }));
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return [...document.querySelectorAll('.toast')].map((node) => node.textContent).join(' | ');
    });
    check(
        'dosya limiti / bellek korumasi',
        guard.toLowerCase().includes('limit') || guard.includes('belleğine sığmayabilir'),
        guard.slice(0, 120),
    );

    // 15) v3: materyal editoru, undo/redo, sahne ayarlari, sistem paneli
    await resetModel();
    await uploadMany([join(fixtures, 'textured.obj'), join(fixtures, 'textured.mtl'), join(fixtures, 'albedo.png')]);

    const materialPanel = await page.evaluate(() => {
        document.querySelector('#btn-side').click();
        document.querySelector('[data-panel="materials"]').click();
        return {
            cards: document.querySelectorAll('.material-card').length,
            visible: !document.querySelector('#side-panel').classList.contains('hidden'),
        };
    });
    check('materyal editoru listelendi', materialPanel.visible && materialPanel.cards >= 1, JSON.stringify(materialPanel));

    const materialEdit = await page.evaluate(async () => {
        const color = document.querySelector('.material-card input[type="color"]');
        color.value = '#3366ff';
        color.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 200));
        const app = globalThis.__glbify;
        let applied = null;
        app.model.traverse((child) => {
            if (child.isMesh) applied = `#${child.material.color.getHexString()}`;
        });
        return {
            applied,
            canUndo: !document.querySelector('#btn-undo').disabled,
        };
    });
    check('materyal rengi degisti', materialEdit.applied === '#3366ff', JSON.stringify(materialEdit));
    check('undo etkin', materialEdit.canUndo, JSON.stringify(materialEdit));

    const undoRedo = await page.evaluate(async () => {
        document.querySelector('#btn-undo').click();
        await new Promise((resolve) => setTimeout(resolve, 200));
        let afterUndo = null;
        globalThis.__glbify.model.traverse((child) => {
            if (child.isMesh) afterUndo = `#${child.material.color.getHexString()}`;
        });
        document.querySelector('#btn-redo').click();
        await new Promise((resolve) => setTimeout(resolve, 200));
        let afterRedo = null;
        globalThis.__glbify.model.traverse((child) => {
            if (child.isMesh) afterRedo = `#${child.material.color.getHexString()}`;
        });
        return { afterUndo, afterRedo };
    });
    check('undo/redo calisti', undoRedo.afterUndo === '#dc2828' && undoRedo.afterRedo === '#3366ff', JSON.stringify(undoRedo));

    const sceneSettings = await page.evaluate(async () => {
        document.querySelector('[data-panel="scene"]').click();
        const slider = document.querySelector('#key-intensity');
        slider.value = '4.5';
        slider.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 200));
        return {
            key: globalThis.__glbify.viewer.lights.key.intensity,
            background: `#${globalThis.__glbify.viewer.scene.background.getHexString()}`,
            label: document.querySelector('#key-value').textContent,
        };
    });
    check('sahne ayarlari uygulandi', Math.abs(sceneSettings.key - 4.5) < 0.01, JSON.stringify(sceneSettings));

    const systemPanel = await page.evaluate(() => {
        document.querySelector('[data-panel="system"]').click();
        return {
            backend: document.querySelector('#renderer-backend').textContent,
            webgpu: document.querySelector('#cap-webgpu').textContent,
            xr: document.querySelector('#cap-xr').textContent,
            xrDisabled: document.querySelector('#btn-xr').disabled,
        };
    });
    check('sistem paneli dolu', systemPanel.backend.length > 0 && systemPanel.webgpu.length > 0, JSON.stringify(systemPanel));

    // 16) Animasyonda kare atlama
    await resetModel();
    await upload(join(fixtures, 'animated.glb'));
    const animatedStep = await page.evaluate(async () => {
        globalThis.__glbify.animator.setTime(0);
        document.querySelector('#btn-next-frame').click();
        await new Promise((resolve) => setTimeout(resolve, 150));
        return globalThis.__glbify.animator.time;
    });
    check('kare atlama calisti', Math.abs(animatedStep - 1 / 30) < 0.01, String(animatedStep));

    // 16) Salt goruntuleme modu
    if (!isDev) {
        const viewPage = await browser.newPage();
        await viewPage.goto(`${BASE}?view=1`, { waitUntil: 'networkidle0' });
        await viewPage.waitForFunction(() => Boolean(globalThis.__glbify?.viewer), { timeout: 30000 });
        const viewState = await viewPage.evaluate(() => ({
            controlsHidden: document.querySelector('#controls').classList.contains('hidden'),
            toolbarHidden: document.querySelector('#edit-toolbar').classList.contains('hidden'),
            mode: document.documentElement.dataset.mode,
        }));
        check('salt goruntuleme modu', viewState.controlsHidden && viewState.toolbarHidden && viewState.mode === 'view', JSON.stringify(viewState));
        await viewPage.close();
    } else {
        check('salt goruntuleme modu (atlandi: dev)', true, '');
    }

    // 17) Dil degisimi ve sikistirma profili
    const language = await page.evaluate(async () => {
        const select = document.querySelector('#language-select');
        select.value = 'en';
        select.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 300));
        const english = {
            title: document.querySelector('[data-i18n="drop.title"]').textContent,
            glb: document.querySelector('[data-i18n="export.glb"]').textContent,
            lang: document.documentElement.lang,
        };
        select.value = 'tr';
        select.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { english, turkish: document.querySelector('[data-i18n="drop.title"]').textContent };
    });
    check(
        'i18n TR/EN gecisi',
        language.english.title === 'Drop your model' && language.turkish === 'Modelini Bırak' && language.english.lang === 'en',
        JSON.stringify(language),
    );

    const profile = await page.evaluate(async () => {
        document.querySelector('#btn-profile-copy').click();
        await new Promise((resolve) => setTimeout(resolve, 300));
        const code = document.querySelector('#profile-input').value;
        const select = document.querySelector('#scale-selector');
        select.value = '1';
        select.dispatchEvent(new Event('change', { bubbles: true }));
        document.querySelector('#profile-input').value = code;
        document.querySelector('#btn-profile-apply').click();
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { codeLength: code.length, scale: select.value };
    });
    check('sikistirma profili yazildi/uygulandi', profile.codeLength > 4 && profile.scale !== '1', JSON.stringify(profile));

    // 18) Cevrimdisi yukleme (yalnizca uretim modunda)
    if (isDev) {
        check('cevrimdisi sayfa yuklendi (atlandi: dev modu)', true, 'dev modunda SW kaydedilmiyor');
    } else {
        await page.evaluate(async () => navigator.serviceWorker.ready);
        await page.setOfflineMode(true);
        const offlinePage = await browser.newPage();
        const offlineErrors = [];
        offlinePage.on('pageerror', (error) => offlineErrors.push(error.message));
        await offlinePage.goto(BASE, { waitUntil: 'domcontentloaded' });
        await wait(2500);
        const offlineState = await offlinePage.evaluate(() => ({
            canvas: document.querySelector('#canvas-container canvas') !== null,
            dropHidden: document.querySelector('#drop-zone').classList.contains('hidden'),
        }));
        check('cevrimdisi sayfa yuklendi', offlineState.canvas && !offlineState.dropHidden, JSON.stringify(offlineState));
        check('cevrimdisi konsol hatasi yok', offlineErrors.length === 0, offlineErrors.slice(0, 3).join(' | '));
        await offlinePage.close();
        await page.setOfflineMode(false);
    }

    await page.screenshot({ path: join(OUT, 'app.png') });
    check('konsol hatasi yok', consoleErrors.length === 0, consoleErrors.slice(0, 4).join(' | '));
    await browser.close();

    const failed = results.filter((entry) => !entry.ok).length;
    console.log(`\n${results.length - failed}/${results.length} test gecti`);
    process.exit(failed ? 1 : 0);
}

main();
