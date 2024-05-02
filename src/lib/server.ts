import fs from 'node:fs';
/**
 * You can generate a public-private keypair with the genrsa context (the last number is the keylength in bits):
 *
 * `openssl genrsa -out keypair.pem 2048`
 */
export const getPublicKey = () => fs.readFileSync('keypair.pem'); // get public key
