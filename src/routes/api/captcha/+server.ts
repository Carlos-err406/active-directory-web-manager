import { CAPTCHA_LENGTH } from '$env/static/private';
import { generateCaptchaToken, setCaptchaCookie } from '$lib/server';
import type { RequestHandler } from '@sveltejs/kit';
import generate from 'vanilla-captcha';

export const GET: RequestHandler = async ({ cookies }) => {
	const { answer, captcha } = await generate(Number(CAPTCHA_LENGTH) || 5);
	const captchaToken = generateCaptchaToken(answer);
	setCaptchaCookie(cookies, captchaToken);
	return new Response(captcha, { status: 200 });
};
