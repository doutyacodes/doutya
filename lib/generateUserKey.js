import crypto from 'crypto';

import base32Encode from 'base32-encode'; // You may need to install a base32 encoding library

export const generateUserKey = (userId, username) => {
    const secret = process.env.SECRET_KEY; // Store your secret key in the .env file

    // 1. Concatenate the secret, userId, and username
    const rawData = `${secret}-${userId}-${username}`;

    // 2. Create a SHA-256 hash of the concatenated string
    const hash = crypto.createHash('sha256').update(rawData).digest();

    // 3. Encode in Base32 to avoid symbols like underscores
    const base32Encoded = base32Encode(hash, 'RFC4648', { padding: false });

    // 4. Format the encoded result with dashes every 4 characters for readability
    const formattedKey = base32Encoded.slice(0, 24).match(/.{1,4}/g).join('-');

    return formattedKey;
}