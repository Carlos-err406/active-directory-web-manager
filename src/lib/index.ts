import { toast } from 'svelte-sonner';

export const APP_LOGS_DIR = './logs/app/';
export const SYSTEM_LOGS_DIR = './logs/system/';

export const toastError = (error: Error | App.Error) => {
	if ('errorId' in error)
		toast.error(error.message, {
			description: `error id: ${error.errorId}`
		});
	else toast.error(error.message);
};
