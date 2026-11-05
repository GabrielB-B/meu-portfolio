import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { get } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const baseUrl = 'http://127.0.0.1:4173';
const debugPort = 9333;
const userDataDir = await mkdtemp(join(tmpdir(), 'portfolio-chrome-'));
const viewports = [
    { width: 1920, height: 1080 },
    { width: 1440, height: 900, screenshot: 'portfolio-desktop.png' },
    { width: 1366, height: 768 },
    { width: 768, height: 1024 },
    { width: 390, height: 844, screenshot: 'portfolio-mobile.png' },
    { width: 360, height: 800 },
];

const server = spawn('python', ['-m', 'http.server', '4173', '--bind', '127.0.0.1'], {
    cwd: root,
    stdio: 'ignore',
    windowsHide: true,
});

const browser = spawn(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${userDataDir}`,
    'about:blank',
], {
    stdio: 'ignore',
    windowsHide: true,
});

const waitFor = async (check, timeout = 15000) => {
    const started = Date.now();
    while (Date.now() - started < timeout) {
        try {
            const value = await check();
            if (value) return value;
        } catch {
            // The process may still be starting.
        }
        await new Promise((resolveWait) => setTimeout(resolveWait, 100));
    }
    throw new Error('Tempo excedido ao aguardar o navegador ou servidor.');
};

const requestText = (url) => new Promise((resolveRequest, rejectRequest) => {
    const request = get(url, (response) => {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => { body += chunk; });
        response.on('end', () => {
            if (response.statusCode && response.statusCode >= 200 && response.statusCode < 400) {
                resolveRequest(body);
            } else {
                rejectRequest(new Error(`HTTP ${response.statusCode}: ${url}`));
            }
        });
    });
    request.on('error', rejectRequest);
    request.setTimeout(3000, () => request.destroy(new Error(`Timeout: ${url}`)));
});

const stopProcesses = async () => {
    const stop = (process) => new Promise((resolveStop) => {
        if (process.exitCode !== null || process.killed) {
            resolveStop();
            return;
        }
        const timer = setTimeout(resolveStop, 1500);
        process.once('exit', () => {
            clearTimeout(timer);
            resolveStop();
        });
        process.kill();
    });

    await Promise.all([stop(server), stop(browser)]);

    for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
            await rm(userDataDir, { recursive: true, force: true });
            break;
        } catch (error) {
            if (attempt === 4) throw error;
            await new Promise((resolveWait) => setTimeout(resolveWait, 250));
        }
    }
};

try {
    await waitFor(async () => Boolean(await requestText(baseUrl)));
    const target = await waitFor(async () => {
        const targets = JSON.parse(await requestText(`http://127.0.0.1:${debugPort}/json/list`));
        return targets.find((item) => item.type === 'page' && item.webSocketDebuggerUrl);
    });

    const socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolveOpen, rejectOpen) => {
        socket.addEventListener('open', resolveOpen, { once: true });
        socket.addEventListener('error', rejectOpen, { once: true });
    });

    let commandId = 0;
    const pending = new Map();
    const eventWaiters = new Map();
    const consoleProblems = [];

    socket.addEventListener('message', ({ data }) => {
        const message = JSON.parse(data);
        if (message.id && pending.has(message.id)) {
            const { resolve: resolveCommand, reject } = pending.get(message.id);
            pending.delete(message.id);
            if (message.error) reject(new Error(message.error.message));
            else resolveCommand(message.result);
            return;
        }

        if (message.method === 'Runtime.exceptionThrown') {
            consoleProblems.push(message.params.exceptionDetails.text);
        }
        if (message.method === 'Log.entryAdded' && ['error', 'warning'].includes(message.params.entry.level)) {
            consoleProblems.push(`${message.params.entry.level}: ${message.params.entry.text}`);
        }

        const waiters = eventWaiters.get(message.method) ?? [];
        waiters.splice(0).forEach((resolveEvent) => resolveEvent(message.params));
    });

    const send = (method, params = {}) => new Promise((resolveCommand, reject) => {
        const id = ++commandId;
        pending.set(id, { resolve: resolveCommand, reject });
        socket.send(JSON.stringify({ id, method, params }));
    });

    const once = (method, timeout = 15000) => new Promise((resolveEvent, rejectEvent) => {
        const waiters = eventWaiters.get(method) ?? [];
        const timer = setTimeout(() => rejectEvent(new Error(`Evento não recebido: ${method}`)), timeout);
        waiters.push((params) => {
            clearTimeout(timer);
            resolveEvent(params);
        });
        eventWaiters.set(method, waiters);
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Log.enable');
    await mkdir(join(root, 'docs', 'screenshots'), { recursive: true });

    const report = [];

    for (const viewport of viewports) {
        consoleProblems.length = 0;
        await send('Emulation.setDeviceMetricsOverride', {
            width: viewport.width,
            height: viewport.height,
            deviceScaleFactor: 1,
            mobile: viewport.width <= 768,
        });

        const loaded = once('Page.loadEventFired');
        await send('Page.navigate', { url: baseUrl });
        await loaded;

        await send('Runtime.evaluate', {
            awaitPromise: true,
            expression: `(async () => {
                await document.fonts.ready;
                const step = Math.max(320, Math.floor(innerHeight * 0.75));
                for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
                    scrollTo(0, y);
                    await new Promise((done) => setTimeout(done, 35));
                }
                await Promise.all([...document.images].map((image) => {
                    if (image.complete) return Promise.resolve();
                    return new Promise((done) => {
                        image.addEventListener('load', done, { once: true });
                        image.addEventListener('error', done, { once: true });
                        setTimeout(done, 5000);
                    });
                }));
                document.querySelectorAll('[data-reveal]').forEach((item) => item.classList.add('is-visible'));
                scrollTo(0, 0);
                dispatchEvent(new Event('scroll'));
                document.activeElement?.blur();
                await new Promise((done) => setTimeout(done, 900));
            })()`,
        });

        const { result } = await send('Runtime.evaluate', {
            returnByValue: true,
            expression: `(() => {
                const all = [...document.querySelectorAll('body *')];
                const overflowing = all.filter((element) => {
                    const style = getComputedStyle(element);
                    if (style.position === 'fixed' || style.visibility === 'hidden') return false;
                    const rect = element.getBoundingClientRect();
                    return rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
                }).slice(0, 12).map((element) => ({
                    tag: element.tagName.toLowerCase(),
                    className: element.className?.toString().slice(0, 90) || '',
                    left: Math.round(element.getBoundingClientRect().left),
                    right: Math.round(element.getBoundingClientRect().right),
                }));
                const internalLinks = [...document.querySelectorAll('a[href^="#"]')];
                const missingAnchors = internalLinks
                    .map((link) => link.getAttribute('href'))
                    .filter((href) => href !== '#' && !document.querySelector(href));
                const projectMedia = [1440, 390].includes(innerWidth)
                    ? [...document.querySelectorAll('.project-media-image')].map((element) => {
                        const rect = element.getBoundingClientRect();
                        const style = getComputedStyle(element);
                        const layer = element.querySelector('.project-image-layer');
                        const image = element.querySelector('.project-image-layer img');
                        const contentWidth = rect.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
                        const contentHeight = rect.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
                        const sourceWidth = Number(element.dataset.mediaWidth);
                        const sourceHeight = Number(element.dataset.mediaHeight);
                        const scale = Math.min(contentWidth / sourceWidth, contentHeight / sourceHeight);
                        const renderedWidth = sourceWidth * scale;
                        const renderedHeight = sourceHeight * scale;

                        return {
                            label: element.dataset.imageAlt,
                            container: [Math.round(rect.width), Math.round(rect.height)],
                            rendered: [Math.round(renderedWidth), Math.round(renderedHeight)],
                            widthUse: Math.round((renderedWidth / rect.width) * 100) + '%',
                            fullyVisible: layer && getComputedStyle(layer).backgroundSize === 'contain',
                            sourceLoaded: Boolean(image?.complete && image.naturalWidth === sourceWidth),
                        };
                    })
                    : undefined;
                return {
                    viewport: [innerWidth, innerHeight],
                    page: [document.documentElement.scrollWidth, document.documentElement.scrollHeight],
                    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
                    overflowing,
                    missingAnchors,
                    title: document.title,
                    h1Count: document.querySelectorAll('h1').length,
                    projectCount: document.querySelectorAll('.project-card').length,
                    projectImageCount: document.querySelectorAll('.project-media-image').length,
                    projectMedia,
                    fontsReady: document.fonts.status,
                };
            })()`,
        });

        const diagnostics = result.value;
        diagnostics.consoleProblems = [...consoleProblems];

        if (viewport.width === 390) {
            const { result: menuResult } = await send('Runtime.evaluate', {
                returnByValue: true,
                awaitPromise: true,
                expression: `(async () => {
                    const button = document.querySelector('[data-menu-toggle]');
                    button.click();
                    await new Promise((done) => setTimeout(done, 100));
                    const opened = button.getAttribute('aria-expanded') === 'true'
                        && document.querySelector('[data-nav]').classList.contains('is-open')
                        && document.querySelector('main').inert;
                    const lastLink = [...document.querySelectorAll('[data-nav] a')].at(-1);
                    lastLink.focus();
                    const focusedLast = document.activeElement === lastLink;
                    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
                    const focusLoop = document.activeElement === document.querySelector('.brand');
                    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
                    await new Promise((done) => setTimeout(done, 350));
                    const closed = button.getAttribute('aria-expanded') === 'false'
                        && !document.querySelector('main').inert;
                    return { opened, focusedLast, focusLoop, closed };
                })()`,
            });
            diagnostics.mobileMenu = menuResult.value;
        }

        if (viewport.width === 1440) {
            const { result: hoverTargetResult } = await send('Runtime.evaluate', {
                returnByValue: true,
                awaitPromise: true,
                expression: `(async () => {
                    const trigger = document.querySelector('[data-project-media]');
                    trigger.scrollIntoView({ block: 'center', behavior: 'instant' });
                    await new Promise((done) => setTimeout(done, 120));
                    const rect = trigger.getBoundingClientRect();
                    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
                })()`,
            });
            await send('Input.dispatchMouseEvent', {
                type: 'mouseMoved',
                x: hoverTargetResult.value.x,
                y: hoverTargetResult.value.y,
            });
            await send('Runtime.evaluate', {
                awaitPromise: true,
                expression: `new Promise((done) => setTimeout(done, 480))`,
            });
            const { result: hoverResult } = await send('Runtime.evaluate', {
                returnByValue: true,
                expression: `(() => {
                    const trigger = document.querySelector('[data-project-media]');
                    const layer = trigger.querySelector('.project-image-layer');
                    const hint = trigger.querySelector('.media-zoom-hint');
                    return {
                        zoomed: getComputedStyle(layer).transform !== 'none',
                        hintVisible: Number(getComputedStyle(hint).opacity) > 0.9,
                    };
                })()`,
            });
            diagnostics.mediaHover = hoverResult.value;
            await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1, y: 1 });

            await send('Emulation.setEmulatedMedia', {
                features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
            });
            const { result: motionResult } = await send('Runtime.evaluate', {
                returnByValue: true,
                expression: `(() => ({
                    portraitAnimation: getComputedStyle(document.querySelector('.portrait-frame')).animationDuration,
                    revealOpacity: getComputedStyle(document.querySelector('[data-reveal]')).opacity,
                }))()`,
            });
            diagnostics.reducedMotion = motionResult.value;
            await send('Emulation.setEmulatedMedia', { features: [] });

            const { result: viewerResult } = await send('Runtime.evaluate', {
                returnByValue: true,
                awaitPromise: true,
                expression: `(async () => {
                    const trigger = document.querySelector('[data-project-media]');
                    const viewer = document.querySelector('[data-image-viewer]');
                    const image = document.querySelector('[data-image-viewer-image]');
                    trigger.click();
                    await image.decode();
                    const opened = viewer.open;
                    const sourceLoaded = image.naturalWidth === Number(trigger.dataset.mediaWidth);
                    const descriptionMatches = image.alt === trigger.dataset.imageAlt;
                    return { opened, sourceLoaded, descriptionMatches };
                })()`,
            });
            const viewerImage = await send('Page.captureScreenshot', { format: 'png' });
            await writeFile(join(root, 'docs', 'screenshots', 'project-image-viewer.png'), Buffer.from(viewerImage.data, 'base64'));
            const { result: viewerCloseResult } = await send('Runtime.evaluate', {
                returnByValue: true,
                expression: `(() => {
                    const viewer = document.querySelector('[data-image-viewer]');
                    document.querySelector('[data-image-viewer-close]').click();
                    return !viewer.open;
                })()`,
            });
            diagnostics.imageViewer = { ...viewerResult.value, closed: viewerCloseResult.value };
        }

        if (viewport.screenshot) {
            await send('Runtime.evaluate', {
                expression: `document.activeElement?.blur()`,
            });
            const { contentSize } = await send('Page.getLayoutMetrics');
            const image = await send('Page.captureScreenshot', {
                format: 'png',
                captureBeyondViewport: true,
                clip: {
                    x: 0,
                    y: 0,
                    width: contentSize.width,
                    height: contentSize.height,
                    scale: 1,
                },
            });
            await writeFile(join(root, 'docs', 'screenshots', viewport.screenshot), Buffer.from(image.data, 'base64'));
        }

        report.push(diagnostics);
    }

    const casePages = [
        { path: '/projetos/emissor-pge.html', width: 1440, height: 900, screenshot: 'case-emissor-desktop.png' },
        { path: '/projetos/rag-juridico-local.html', width: 390, height: 844, screenshot: 'case-rag-mobile.png' },
    ];

    for (const page of casePages) {
        await send('Emulation.setDeviceMetricsOverride', {
            width: page.width,
            height: page.height,
            deviceScaleFactor: 1,
            mobile: page.width <= 768,
        });

        const loaded = once('Page.loadEventFired');
        await send('Page.navigate', { url: `${baseUrl}${page.path}` });
        await loaded;
        await send('Runtime.evaluate', {
            awaitPromise: true,
            expression: `(async () => { await document.fonts.ready; await new Promise((done) => setTimeout(done, 350)); })()`,
        });

        const image = await send('Page.captureScreenshot', { format: 'png' });
        await writeFile(join(root, 'docs', 'screenshots', page.screenshot), Buffer.from(image.data, 'base64'));
    }

    await writeFile(join(root, 'docs', 'screenshots', 'visual-review.json'), `${JSON.stringify(report, null, 2)}\n`);
    socket.close();
    console.log(JSON.stringify(report, null, 2));
} finally {
    await stopProcesses();
}
