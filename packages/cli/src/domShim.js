export function installDomShims() {
    if (typeof globalThis.FileReader === 'undefined') {
        globalThis.FileReader = class FileReaderShim {
            constructor() {
                this.result = null;
                this.onloadend = null;
                this.onerror = null;
            }

            readAsDataURL(blob) {
                blob
                    .arrayBuffer()
                    .then((buffer) => {
                        this.result = `data:${blob.type};base64,${Buffer.from(buffer).toString('base64')}`;
                        this.onloadend?.();
                    })
                    .catch((error) => this.onerror?.(error));
            }

            readAsArrayBuffer(blob) {
                blob
                    .arrayBuffer()
                    .then((buffer) => {
                        this.result = buffer;
                        this.onloadend?.();
                    })
                    .catch((error) => this.onerror?.(error));
            }
        };
    }

    if (typeof globalThis.createImageBitmap !== 'undefined') return;

    globalThis.createImageBitmap = async () => {
        throw new Error('Node ortaminda createImageBitmap desteklenmiyor; doku gomulu donusturme kullanilamaz.');
    };
}
