import { NODE_ENV, SECRET_KEY } from '$env/static/private';
import type { Cookies } from '@sveltejs/kit';
import type { CookieSerializeOptions } from 'cookie';
import jwt from 'jsonwebtoken';
import type { Client } from 'ldapts';
import { isAdmin } from '../ldap';
import type { Session } from '../types/session';
import type { User } from '../types/user';

const HOURS = 7200 as const; //2h for token and cookie expiration(max age)
const CAPTCHA_EXPIRATION = 300 as const; //5m for captcha expiration
const JWT_ALGORITHM: jwt.Algorithm = 'HS512' as const;
const TOKEN_EXPIRATION = HOURS;
const SESSION_COOKIE_NAME = 'ad-session' as const;
const ACCESS_COOKIE_NAME = 'ad-access' as const;
const CAPTCHA_COOKIE_NAME = 'ad-captcha' as const;

const COOKIE_CONFIG = (
	opts?: Partial<CookieSerializeOptions>
): CookieSerializeOptions & { path: string } => ({
	path: '/',
	maxAge: HOURS,
	httpOnly: true,
	sameSite: 'strict',
	secure: NODE_ENV === 'production',
	...opts
});

// SESSION
export const generateSessionToken = async (ldap: Client, user: User) =>
	jwt.sign({ ...user, isAdmin: await isAdmin(ldap, user.dn) }, SECRET_KEY, {
		algorithm: JWT_ALGORITHM,
		expiresIn: TOKEN_EXPIRATION
	});

export const setSessionCookie = (cookies: Cookies, session: string) => {
	cookies.set(SESSION_COOKIE_NAME, session, COOKIE_CONFIG());
};
export const verifySessionToken = (session: string) =>
	jwt.verify(session, SECRET_KEY, { algorithms: [JWT_ALGORITHM] }) as Session;

export const getSessionToken = (cookies: Cookies) => cookies.get(SESSION_COOKIE_NAME);

// ACCESS
export const generateAccessToken = (access: { email: string; password: string }) =>
	jwt.sign(access, SECRET_KEY, {
		algorithm: JWT_ALGORITHM,
		expiresIn: TOKEN_EXPIRATION
	});
export const setAccessCookie = (cookies: Cookies, access: string) => {
	cookies.set(ACCESS_COOKIE_NAME, access, COOKIE_CONFIG());
};
export const verifyAccessToken = (access: string) =>
	jwt.verify(access, SECRET_KEY, {
		algorithms: [JWT_ALGORITHM]
	}) as { email: string; password: string };

export const getAccessToken = (cookies: Cookies) => cookies.get(ACCESS_COOKIE_NAME);

// CAPTCHA
export const generateCaptchaToken = (answer: string) =>
	jwt.sign({ answer }, SECRET_KEY, {
		algorithm: JWT_ALGORITHM,
		expiresIn: CAPTCHA_EXPIRATION
	});

export const setCaptchaCookie = (cookies: Cookies, captchaToken: string) => {
	cookies.set(CAPTCHA_COOKIE_NAME, captchaToken, COOKIE_CONFIG({ maxAge: CAPTCHA_EXPIRATION }));
};

export const verifyCaptchaToken = (captchaToken: string): { answer: string } =>
	jwt.verify(captchaToken, SECRET_KEY, {
		algorithms: [JWT_ALGORITHM]
	}) as { answer: string };

export const getCaptchaToken = (cookies: Cookies) => cookies.get(CAPTCHA_COOKIE_NAME);
