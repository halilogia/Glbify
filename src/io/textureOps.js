export const IMAGE_MIME = {
    png: 'image/png',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
};

const DEFAULT_MIME = 'image/png';

export function toBytes(blob) {
    return blob.arrayBuffer().then((buffer) => new Uint8Array(buffer));
}

export function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error ?? new Error('Dosya okunamadı.'));
        reader.readAsDataURL(blob);
    });
}

export function imageDataToBytes(imageData, mimeType = DEFAULT_MIME, quality = 0.92) {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    canvas.getContext('2d').putImageData(imageData, 0, 0);
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(toBytes(blob)) : reject(new Error('Doku kodlanamadı.'))),
            mimeType,
            mimeType === IMAGE_MIME.png ? undefined : quality,
        );
    });
}

export async function bytesToImageData(bytes, mimeType = DEFAULT_MIME) {
    const bitmap = await createImageBitmap(new Blob([bytes], { type: mimeType }));
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(bitmap, 0, 0);
    bitmap.close?.();
    return context.getImageData(0, 0, canvas.width, canvas.height);
}

export function invertNormalGreen(imageData) {
    const { data } = imageData;
    for (let index = 0; index < data.length; index += 4) {
        data[index + 1] = 255 - data[index + 1];
    }
    return imageData;
}

export function deriveNormalMap(imageData, strength = 2) {
    const { width, height, data } = imageData;
    const source = new Float32Array(width * height);

    for (let pixel = 0; pixel < width * height; pixel += 1) {
        const offset = pixel * 4;
        source[pixel] = (data[offset] * 0.299 + data[offset + 1] * 0.587 + data[offset + 2] * 0.114) / 255;
    }

    const sample = (x, y) => source[Math.min(height - 1, Math.max(0, y)) * width + Math.min(width - 1, Math.max(0, x))];

    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const dx =
                sample(x - 1, y - 1) + 2 * sample(x - 1, y) + sample(x - 1, y + 1) -
                (sample(x + 1, y - 1) + 2 * sample(x + 1, y) + sample(x + 1, y + 1));
            const dy =
                sample(x - 1, y - 1) + 2 * sample(x, y - 1) + sample(x + 1, y - 1) -
                (sample(x - 1, y + 1) + 2 * sample(x, y + 1) + sample(x + 1, y + 1));

            const nx = dx * strength;
            const ny = dy * strength;
            const length = Math.hypot(nx, ny, 1);
            const offset = (y * width + x) * 4;

            data[offset] = Math.round(((nx / length) * 0.5 + 0.5) * 255);
            data[offset + 1] = Math.round(((ny / length) * 0.5 + 0.5) * 255);
            data[offset + 2] = Math.round((1 / length * 0.5 + 0.5) * 255);
            data[offset + 3] = 255;
        }
    }

    return imageData;
}
