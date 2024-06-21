import config from '$config';
import { generateCaptchaToken, setCaptchaCookie } from '$lib/server';
import type { RequestHandler } from '@sveltejs/kit';
import generate from 'vanilla-captcha';

export const GET: RequestHandler = async ({ cookies }) => {
	const { captcha_length } = config.app;
	const { answer, captcha } = await generate(captcha_length || 5);
	const captchaToken = generateCaptchaToken(answer);
	setCaptchaCookie(cookies, captchaToken);
	return new Response(captcha, { status: 200 });
};
