#!/usr/bin/env node
import { inspect, optimize } from '../src/index.js';
import { convert } from '../src/convert.js';

const HELP = `glbify — model inceleme, optimizasyon ve donusturme araci

Kullanim:
  glbify inspect <dosya.glb>                       Model istatistiklerini yazar
  glbify optimize <girdi.glb> <cikti.glb> [secenek]  Optimize edilmis GLB yazar
  glbify convert <girdi> <cikti>                  Format donusturur

Optimize secenekleri:
  --simplify <0-1>     Mesh sadelestirme orani (varsayilan 0 = kapali)
  --draco <level>       DRACO: max | balanced | high
  --meshopt             EXT_meshopt_compression
  --ktx2                Basis (KTX2) doku sikistirma
  --uastc               KTX2 UASTC (kaliteli, buyuk)
  --no-weld             Vertex birlestirmeyi kapatir

Ornekler:
  glbify inspect model.glb
  glbify optimize model.glb model_opt.glb --simplify 0.5 --draco balanced
  glbify optimize model.glb model_ktx2.glb --ktx2
  glbify convert model.stl model.glb
  glbify convert model.glb model.obj
`;

function parseArgs(argv) {
    const [command, ...rest] = argv;
    const positional = [];
    const flags = {};

    for (let index = 0; index < rest.length; index += 1) {
        const token = rest[index];
        if (!token.startsWith('--')) {
            positional.push(token);
            continue;
        }
        const key = token.slice(2);
        const next = rest[index + 1];
        if (next && !next.startsWith('--')) {
            flags[key] = next;
            index += 1;
        } else {
            flags[key] = true;
        }
    }

    return { command, positional, flags };
}

function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}

async function main() {
    const { command, positional, flags } = parseArgs(process.argv.slice(2));

    if (!command || flags.help || command === 'help') {
        console.log(HELP);
        return;
    }

    if (command === 'inspect') {
        const [file] = positional;
        if (!file) throw new Error('Dosya yolu eksik. Kullanim: glbify inspect <dosya.glb>');
        const report = await inspect(file);
        console.log(JSON.stringify(report, null, 2));
        return;
    }

    if (command === 'optimize') {
        const [input, output] = positional;
        if (!input || !output) throw new Error('Kullanim: glbify optimize <girdi.glb> <cikti.glb>');
        const result = await optimize(input, output, {
            ratio: Number(flags.simplify ?? 0) || 0,
            weld: flags['no-weld'] !== true,
            draco: Boolean(flags.draco),
            dracoLevel: typeof flags.draco === 'string' ? flags.draco : 'balanced',
            meshopt: Boolean(flags.meshopt),
            ktx2: Boolean(flags.ktx2),
            uastc: Boolean(flags.uastc),
        });
        const percent = result.before ? Math.round((result.saved / result.before) * 100) : 0;
        console.log(
            `${result.output}: ${formatBytes(result.before)} -> ${formatBytes(result.after)} (%${percent} kucuk)`,
        );
        return;
    }

    if (command === 'convert') {
        const [input, output] = positional;
        if (!input || !output) throw new Error('Kullanim: glbify convert <girdi> <cikti>');
        const result = await convert(input, output);
        console.log(`${result.output} yazildi.${result.warning ? ` Not: ${result.warning}` : ''}`);
        return;
    }

    throw new Error(`Bilinmeyen komut: ${command}\n\n${HELP}`);
}

main().catch((error) => {
    console.error(`Hata: ${error.message}`);
    process.exit(1);
});
