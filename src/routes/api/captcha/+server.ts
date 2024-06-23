import config from '$config';
import { generateCaptchaToken, setCaptchaCookie } from '$lib/server';
import type { RequestHandler } from '@sveltejs/kit';
import generate from 'vanilla-captcha';

export const GET: RequestHandler = async ({ cookies }) => {
	const { length, ...captchaOptions } = config.app.captcha;
	const { answer, captcha } = await generate(length, captchaOptions);
	const captchaToken = generateCaptchaToken(answer);
	setCaptchaCookie(cookies, captchaToken);
	return new Response(captcha, { status: 200 });
};
