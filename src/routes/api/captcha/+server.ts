import config from '$config';
import { generateCaptchaToken, setCaptchaCookie } from '$lib/server';
import type { RequestHandler } from '@sveltejs/kit';
import generate from 'vanilla-captcha';

export const GET: RequestHandler = async ({ cookies }) => {
	const { answer, captcha } = await generate(config.app.captchaLength);
	const captchaToken = generateCaptchaToken(answer);
	setCaptchaCookie(cookies, captchaToken);
	return new Response(captcha, { status: 200 });
};
