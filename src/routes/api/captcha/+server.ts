import { generateCaptchaToken, setCaptchaCookie } from '$lib/server';
import type { RequestHandler } from '@sveltejs/kit';
import generate from 'vanilla-captcha';

export const GET: RequestHandler = async ({ cookies, locals }) => {
	const { app } = locals.config;
	const { answer, captcha } = await generate(app.captcha_length || 5);
	const captchaToken = generateCaptchaToken(answer);
	setCaptchaCookie(cookies, captchaToken);
	return new Response(captcha, { status: 200 });
};