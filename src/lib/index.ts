import { toast } from 'svelte-sonner';

export const toastError = (error: Error | App.Error) => {
	if ('errorId' in error)
		toast.error(error.message, {
			description: `error id: ${error.errorId}`
		});
	else toast.error(error.message);
};
