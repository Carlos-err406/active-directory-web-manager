import config from '$config';
import { generateCaptchaToken, setCaptchaCookie } from '$lib/server';
import type { RequestHandler } from '@sveltejs/kit';
import svgCaptcha from 'svg-captcha';
export const GET: RequestHandler = async ({ cookies }) => {
	const options = config.app.captcha;
	const { text, data } = svgCaptcha.create(options);
	const captchaToken = generateCaptchaToken(text);
	setCaptchaCookie(cookies, captchaToken);

	return new Response(data, {
		status: 200,
		headers: {
			'Content-Type': 'image/svg+xml'
		}
	});
};
