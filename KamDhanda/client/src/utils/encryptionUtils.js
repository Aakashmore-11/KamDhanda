/**
 * Utility for End-to-End Encryption using Web Crypto API
 * Uses RSA-OAEP for key exchange and AES-GCM for message encryption
 */

// Generate RSA Key Pair
export const generateKeyPair = async () => {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );
    return keyPair;
};

// Export Public Key to JWK (JSON Web Key) format for storage on server
export const exportPublicKey = async (publicKey) => {
    const exported = await window.crypto.subtle.exportKey("jwk", publicKey);
    return JSON.stringify(exported);
};

// Export Private Key to JWK format for localStorage
export const exportPrivateKey = async (privateKey) => {
    const exported = await window.crypto.subtle.exportKey("jwk", privateKey);
    return JSON.stringify(exported);
};

// Import Public Key from JWK
export const importPublicKey = async (jwkString) => {
    const jwk = JSON.parse(jwkString);
    return await window.crypto.subtle.importKey(
        "jwk",
        jwk,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["encrypt"]
    );
};

// Import Private Key from JWK
export const importPrivateKey = async (jwkString) => {
    const jwk = JSON.parse(jwkString);
    return await window.crypto.subtle.importKey(
        "jwk",
        jwk,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["decrypt"]
    );
};

// Encrypt message using AES-GCM
export const encryptMessage = async (text, publicKeyJWK, myPublicKeyJWK) => {
    // 1. Generate random AES key
    const aesKey = await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );

    // 2. Encrypt text with AES key
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedContent = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        aesKey,
        data
    );

    // 3. Export AES key to encrypt it with RSA
    const exportedAesKey = await window.crypto.subtle.exportKey("raw", aesKey);

    // 4. Encrypt AES key with recipient's public key
    const recipientPubKey = await importPublicKey(publicKeyJWK);
    const encryptedKeyForRecipient = await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        recipientPubKey,
        exportedAesKey
    );

    // 5. Encrypt AES key with sender's public key (to allow sender to read)
    const senderPubKey = await importPublicKey(myPublicKeyJWK);
    const encryptedKeyForSender = await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        senderPubKey,
        exportedAesKey
    );

    // 6. Return payload
    return {
        encryptedMessage: b64Encode(new Uint8Array(encryptedContent)),
        iv: b64Encode(iv),
        encryptedKey: b64Encode(new Uint8Array(encryptedKeyForRecipient)),
        senderEncryptedKey: b64Encode(new Uint8Array(encryptedKeyForSender))
    };
};

// Decrypt message
export const decryptMessage = async (encryptedData, encryptedKeyB64, ivB64, privateKeyJWK) => {
    try {
        const privateKey = await importPrivateKey(privateKeyJWK);

        // 1. Decrypt AES key with RSA private key
        const encryptedKey = b64Decode(encryptedKeyB64);
        const aesKeyBuffer = await window.crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            privateKey,
            encryptedKey
        );

        // 2. Import DEC AES key
        const aesKey = await window.crypto.subtle.importKey(
            "raw",
            aesKeyBuffer,
            "AES-GCM",
            true,
            ["decrypt"]
        );

        // 3. Decrypt message content
        const iv = b64Decode(ivB64);
        const data = b64Decode(encryptedData);
        const decryptedContent = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            aesKey,
            data
        );

        const decoder = new TextDecoder();
        return decoder.decode(decryptedContent);
    } catch (error) {
        console.error("Decryption failed:", error);
        return "[Decryption Error: Private key mismatch or corrupted data]";
    }
};

// Helper: Base64 encode
const b64Encode = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

// Helper: Base64 decode
const b64Decode = (str) => {
    if (!str || typeof str !== 'string') return new Uint8Array(0);
    try {
        // Strip any potential whitespace or newlines from the base64 string
        const cleanStr = str.trim().replace(/[\r\n]/g, "");
        const binary = atob(cleanStr);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    } catch (e) {
        console.error("Base64 decode failed:", e);
        return new Uint8Array(0);
    }
};
