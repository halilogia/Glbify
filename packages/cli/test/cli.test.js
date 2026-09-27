import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { Document, NodeIO } from '@gltf-transform/core';
import { inspect, optimize } from '../src/index.js';
import { convert } from '../src/convert.js';

const cubes = [
    [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
    [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1],
];
const triangles = [
    [1, 2, 3], [1, 3, 4], [5, 7, 6], [5, 8, 7],
    [1, 5, 6], [1, 6, 2], [2, 6, 7], [2, 7, 3],
    [3, 7, 8], [3, 8, 4], [4, 8, 5], [4, 5, 1],
];

async function sampleGlb() {
    const document = new Document();
    const buffer = document.createBuffer();
    const positions = document
        .createAccessor()
        .setType('VEC3')
        .setArray(new Float32Array(cubes.flat()))
        .setBuffer(buffer);
    const indices = document
        .createAccessor()
        .setType('SCALAR')
        .setArray(new Uint32Array(triangles.flat()))
        .setBuffer(buffer);

    const primitive = document
        .createPrimitive()
        .setAttribute('POSITION', positions)
        .setIndices(indices)
        .setMaterial(document.createMaterial('Test').setBaseColorFactor([1, 0, 0, 1]));
    const mesh = document.createMesh('Cube').addPrimitive(primitive);
    document.createScene('Scene').addChild(document.createNode('Cube').setMesh(mesh));

    return new Uint8Array(await new NodeIO().writeBinary(document));
}

async function workspace() {
    return mkdtemp(join(tmpdir(), 'glbify-cli-'));
}

test('inspect: geometri ve materyal sayilarini raporlar', async () => {
    const directory = await workspace();
    const file = join(directory, 'cube.glb');
    await writeFile(file, await sampleGlb());

    const report = await inspect(file);

    assert.equal(report.meshes, 1);
    assert.equal(report.primitives, 1);
    assert.equal(report.materials, 1);
    assert.equal(report.vertices, 8);
    assert.equal(report.triangles, 12);
    assert.ok(report.bytes > 0);
});

test('optimize: DRACO ile dosya boyutunu kucultur', async () => {
    const directory = await workspace();
    const input = join(directory, 'cube.glb');
    const output = join(directory, 'cube-draco.glb');
    await writeFile(input, await sampleGlb());

    const result = await optimize(input, output, { draco: true, weld: false });

    const written = new Uint8Array(await readFile(output));
    const jsonLength = new DataView(written.buffer).getUint32(12, true);
    const json = JSON.parse(new TextDecoder().decode(written.subarray(20, 20 + jsonLength)));

    assert.ok(json.extensionsUsed.includes('KHR_draco_mesh_compression'));
    assert.ok(result.after > 0);
    assert.ok(result.after < result.before);
});

test('optimize: meshopt uzantisi yazilir', async () => {
    const directory = await workspace();
    const input = join(directory, 'cube.glb');
    const output = join(directory, 'cube-meshopt.glb');
    await writeFile(input, await sampleGlb());

    await optimize(input, output, { meshopt: true });

    const written = new Uint8Array(await readFile(output));
    const jsonLength = new DataView(written.buffer).getUint32(12, true);
    const json = JSON.parse(new TextDecoder().decode(written.subarray(20, 20 + jsonLength)));

    assert.ok(json.extensionsUsed.includes('EXT_meshopt_compression'));
});

test('convert: STL girdisini GLB yazabilir', async () => {
    const directory = await workspace();
    const input = join(directory, 'cube.stl');
    const output = join(directory, 'cube.glb');

    const body = triangles
        .map(([a, b, c]) =>
            [
                'facet normal 0 0 0',
                'outer loop',
                `vertex ${cubes[a - 1].join(' ')}`,
                `vertex ${cubes[b - 1].join(' ')}`,
                `vertex ${cubes[c - 1].join(' ')}`,
                'endloop',
                'endfacet',
            ].join('\n'),
        )
        .join('\n');
    await writeFile(input, `solid cube\n${body}\nendsolid cube\n`);

    const result = await convert(input, output);
    const written = new Uint8Array(await readFile(output));

    assert.equal(result.output, output);
    assert.equal(new TextDecoder().decode(written.subarray(0, 4)), 'glTF');
});

test('convert: GLB girdisini OBJ yazabilir', async () => {
    const directory = await workspace();
    const input = join(directory, 'cube.glb');
    const output = join(directory, 'cube.obj');
    await writeFile(input, await sampleGlb());

    await convert(input, output);
    const text = await readFile(output, 'utf8');

    assert.ok(text.includes('v '));
    assert.ok(text.includes('f '));
});
