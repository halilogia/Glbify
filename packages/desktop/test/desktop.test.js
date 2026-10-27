import assert from 'node:assert/strict';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { APP_ROOT, resolveDistIndex, resolveIndexUrl } from '../resolveDist.js';

test('resolveDistIndex: var olan dist/index.html dosyasini bulur', (t) => {
    const distFile = join(APP_ROOT, 'dist', 'index.html');
    let created = false;
    if (!existsSync(distFile)) {
        mkdirSync(join(APP_ROOT, 'dist'), { recursive: true });
        writeFileSync(distFile, '<!doctype html>');
        created = true;
    }
    t.after(() => {
        if (created) {
            rmSync(distFile, { force: true });
        }
    });

    const indexPath = resolveDistIndex([distFile]);
    assert.match(indexPath, /dist[\\/]index\.html$/);
});

test('resolveDistIndex: yoksa anlamli hata verir', () => {
    assert.throws(() => resolveDistIndex([join(APP_ROOT, 'yok', 'index.html')]), /dist\/index\.html/);
});

test('resolveIndexUrl: Windows yollarini dosya URL cevirir', () => {
    assert.equal(resolveIndexUrl('C:\\app\\dist\\index.html'), 'file:///C:/app/dist/index.html');
    assert.equal(resolveIndexUrl('/home/app/dist/index.html'), 'file:///home/app/dist/index.html');
});
