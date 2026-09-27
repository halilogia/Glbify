import { MB } from '../config.js';

export class FileLimitError extends Error {
    constructor(file, limitBytes) {
        super(
            `"${file.name}" dosyası ${format(limitBytes)} limitini aşıyor. ` +
                'Daha büyük dosyalar için tarayıcı belleğini boşaltın veya dosya limitini yükseltin.',
        );
        this.name = 'FileLimitError';
        this.limit = limitBytes;
        this.size = file.size;
    }
}

function format(bytes) {
    return bytes >= MB ? `${Math.round(bytes / MB)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export class EmptyFileError extends Error {
    constructor(file) {
        super(`"${file.name}" dosyası boş görünüyor (0 bayt). Dosyayı yeniden dışa aktarmayı deneyin.`);
        this.name = 'EmptyFileError';
    }
}

export async function readFile(file, { limitBytes, onProgress } = {}) {
    if (file.size === 0) throw new EmptyFileError(file);
    if (limitBytes && file.size > limitBytes) throw new FileLimitError(file, limitBytes);

    if (typeof file.stream !== 'function') return readWithFileReader(file, onProgress);

    const reader = file.stream().getReader();
    const chunks = [];
    let loaded = 0;

    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.byteLength;
        if (limitBytes && loaded > limitBytes) {
            await reader.cancel();
            throw new FileLimitError(file, limitBytes);
        }
        onProgress?.({ loaded, total: file.size, ratio: file.size ? loaded / file.size : 0 });
    }

    const buffer = new Uint8Array(loaded);
    let offset = 0;
    for (const chunk of chunks) {
        buffer.set(chunk, offset);
        offset += chunk.byteLength;
    }
    chunks.length = 0;
    onProgress?.({ loaded, total: loaded, ratio: 1 });
    return buffer.buffer;
}

function readWithFileReader(file, onProgress) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error ?? new Error('Dosya okunamadı.'));
        reader.onprogress = (event) => {
            if (!event.lengthComputable) return;
            onProgress?.({ loaded: event.loaded, total: event.total, ratio: event.loaded / event.total });
        };
        reader.onload = () => {
            onProgress?.({ loaded: file.size, total: file.size, ratio: 1 });
            resolve(reader.result);
        };
        reader.readAsArrayBuffer(file);
    });
}

export function decodeText(buffer) {
    return new TextDecoder('utf-8').decode(buffer);
}
