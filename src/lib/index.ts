import { toast } from 'svelte-sonner';

export const toastError = (error: Error | App.Error, toastId?: string | number) => {
	if ('errorId' in error)
		toast.error(error.message, {
			description: `error id: ${error.errorId}`,
			id: toastId,
			duration: undefined
		});
	else toast.error(error.message, { id: toastId, duration: undefined });
};
