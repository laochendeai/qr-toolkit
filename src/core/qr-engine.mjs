let qrFactoryPromise = null;

const CANDIDATES = [
  "./vendor/qrcode-generator.mjs",
  "https://unpkg.com/qrcode-generator@2.0.4/dist/qrcode.mjs",
];

async function loadFrom(url) {
  const module = await import(url);
  if (!module?.qrcode) throw new Error(`Invalid QR module from ${url}`);
  return module.qrcode;
}

function applyUtf8Support(qrcodeFactory) {
  if (!qrcodeFactory) return;
  try {
    qrcodeFactory.stringToBytes = (text) => Array.from(new TextEncoder().encode(String(text ?? "")));
  } catch {
    // ignore
  }
}

export async function loadQrFactory() {
  if (qrFactoryPromise) return qrFactoryPromise;

  qrFactoryPromise = (async () => {
    let lastError = null;
    for (const url of CANDIDATES) {
      try {
        const factory = await loadFrom(url);
        applyUtf8Support(factory);
        return factory;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("Failed to load QR engine");
  })();

  return qrFactoryPromise;
}

