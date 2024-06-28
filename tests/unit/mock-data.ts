import { PUBLIC_BASE_DN } from '$env/static/public';

export const sAMAccountName = 'tony.stark';
export const password = 'myRedSuitKeepsMeWarm123*';
export const dn = `CN=${sAMAccountName},${PUBLIC_BASE_DN}`;
