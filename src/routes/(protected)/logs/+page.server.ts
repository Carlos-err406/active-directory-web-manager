import { APP_LOGS_DIR } from '$lib';
import { getLogDate, isErrorLog, isInfoLog } from '$lib/components/logs/utils';
import dayjs from 'dayjs';
import fs from 'fs';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ url, depends }) => {
	depends('protected:logs');
	const q = url.searchParams.get('q');
	const filterType = url.searchParams.get('type') || 'all';

	const fromDate = url.searchParams.get('fromDate')
		? dayjs(url.searchParams.get('fromDate'))
		: dayjs().subtract(2, 'days');
	const toDate = url.searchParams.get('toDate') ? dayjs(url.searchParams.get('toDate')) : dayjs();

	return {
		defaults: {
			fromDate: fromDate.format('YYYY-MM-DD'),
			toDate: toDate.format('YYYY-MM-DD')
		},
		minDate: await new Promise<string>((resolve, reject) => {
			fs.readdir(APP_LOGS_DIR, (err, files) => {
				if (err) return reject(err);
				const logFiles = files.filter((file) => file.endsWith('.log'));
				const [dateString] = logFiles[0].split('.');
				return resolve(dayjs(dateString).format('YYYY-MM-DD'));
			});
		}),
		promise: {
			logs: readLogFiles()
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
					logs.filter((log) => {
						const logDate = getLogDate(log);
						return (
							(logDate.isAfter(fromDate, 'day') || logDate.isSame(fromDate, 'day')) &&
							(logDate.isBefore(toDate) || logDate.isSame(toDate, 'day'))
						);
					})
				)
				//reverse so recent logs are on top
				.then((logs) => logs.reverse())
		},
		searchForm: true
	};
};
const readLogFiles = (): Promise<string[]> => {
	return new Promise((resolve, reject) => {
		fs.readdir(APP_LOGS_DIR, (err, files) => {
			if (err) return reject(err);
			const logFiles = files.filter((file) => file.endsWith('.log'));
			let logLines: string[] = [];
			logFiles.forEach((file) => {
				const content = fs.readFileSync(APP_LOGS_DIR + file, 'utf-8');
				logLines = logLines.concat(content.split('\n').filter((line) => line.trim() !== ''));
			});
			resolve(logLines);
		});
	});
};
