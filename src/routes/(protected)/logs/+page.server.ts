import config, { LOGGING_APP_BASE } from '$config';
import { getLogDate, isErrorLog, isInfoLog } from '$lib/components/logs/utils';
import { appLog } from '$lib/server/logs';
import { error, redirect } from '@sveltejs/kit';
import dayjs from 'dayjs';
import fs from 'fs';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, depends, locals }) => {
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/auth');
	if (!config.app.views.logsPage.show) {
		appLog(
			`User ${auth.session.sAMAccountName} tried accessing /logs page but is disabled by configuration`,
			'Error'
		);
		throw error(403, 'This page is disabled in the app configuration');
	}

	depends('protected:logs');
	const q = url.searchParams.get('q');
	const filterType = url.searchParams.get('type') || 'all';

	const fromDate = url.searchParams.get('fromDate')
		? dayjs(url.searchParams.get('fromDate'))
		: undefined;
	const toDate = url.searchParams.get('toDate') ? dayjs(url.searchParams.get('toDate')) : undefined;
	const haveLogs = fs.existsSync(LOGGING_APP_BASE);
	return {
		defaults: {
			fromDate: fromDate?.format('YYYY-MM-DD'),
			toDate: toDate?.format('YYYY-MM-DD')
		},
		minDate: !haveLogs
			? dayjs().format('YYYY-MM-DD')
			: await new Promise<string>((resolve, reject) => {
					fs.readdir(LOGGING_APP_BASE, (err, files) => {
						if (err) return reject(err);
						const logFiles = files.filter((file) => file.endsWith('.log'));
						const [dateString] = logFiles[0].split('.');
						return resolve(dayjs(dateString).format('YYYY-MM-DD'));
					});
				}),
		promise: {
			logs: !haveLogs
				? []
				: readLogFiles()
						//filter by query string
						.then((logs) =>
							!q ? logs : logs.filter((log) => log.toLowerCase().includes(q.toLowerCase()))
						)
						//filter by log type
						.then((logs) => {
							if (filterType === 'all') return logs;
							else if (filterType === 'error') return logs.filter(isErrorLog);
							else if (filterType === 'info') return logs.filter(isInfoLog);
							else return logs;
						})
						//filter by date
						.then((logs) =>
							fromDate && toDate
								? logs.filter((log) => {
										const logDate = getLogDate(log);
										return (
											(logDate.isAfter(fromDate, 'day') || logDate.isSame(fromDate, 'day')) &&
											(logDate.isBefore(toDate) || logDate.isSame(toDate, 'day'))
										);
									})
								: logs
						)
						//reverse so recent logs are on top
						.then((logs) => logs.reverse())
		},
		searchForm: true
	};
};
const readLogFiles = (): Promise<string[]> => {
	return new Promise((resolve, reject) => {
		fs.readdir(LOGGING_APP_BASE, (err, files) => {
			if (err) return reject(err);
			const logFiles = files.filter((file) => file.endsWith('.log'));
			let logLines: string[] = [];
			logFiles.forEach((file) => {
				const content = fs.readFileSync(LOGGING_APP_BASE + file, 'utf-8');
				logLines = logLines.concat(content.split('\n').filter((line) => line.trim() !== ''));
			});
			resolve(logLines);
		});
	});
};
