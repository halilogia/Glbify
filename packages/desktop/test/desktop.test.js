import assert from 'node:assert/strict';
import { test } from 'node:test';
import { join } from 'node:path';
import { APP_ROOT, resolveDistIndex, resolveIndexUrl } from '../resolveDist.js';

test('resolveDistIndex: var olan dist/index.html dosyasini bulur', () => {
    const indexPath = resolveDistIndex([join(APP_ROOT, 'dist', 'index.html')]);
    assert.match(indexPath, /dist[\\/]index\.html$/);
});

test('resolveDistIndex: yoksa anlamli hata verir', () => {
    assert.throws(() => resolveDistIndex([join(APP_ROOT, 'yok', 'index.html')]), /dist\/index\.html/);
});

test('resolveIndexUrl: Windows yollarini dosya URL cevirir', () => {
    assert.equal(resolveIndexUrl('C:\\app\\dist\\index.html'), 'file:///C:/app/dist/index.html');
    assert.equal(resolveIndexUrl('/home/app/dist/index.html'), 'file:///home/app/dist/index.html');
});
