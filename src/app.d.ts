// See https://kit.svelte.dev/docs/types#app

import type { Context } from '$lib/types/context';
import type { Session } from '$lib/types/session';
import type { Client, FilterParser } from 'ldapts';
import type { ExternalToast } from 'svelte-sonner';
import type { Config as AppConfigType } from './config/app.config';
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message?: string;
			errorId?: string;
		}
		interface Locals {
			/**
			 * authorization function setted by the authenticationSetterHandler hook
			 *
			 * @returns a Promise with the session object and the binded ldap client, or null if session is invalid
			 */
			auth: () => Promise<{ ldap: Client; session: Session } | null>;
		}
		// interface PageData {}
		interface PageState {
			toast?: {
				type: 'success' | 'error' | 'info' | 'message' | 'warning';
				message: string;
				data?: ExternalToast;
			};
		}
		// interface Platform {}
		type Config = AppConfigType;
	}
}

declare module 'svelte' {
	export function getContext<T extends keyof Context, K extends Context[T]>(key: T): K;
	export function setContext<T extends keyof Context, K extends Context[T]>(
		key: T,
		context: K
	): void;
}

declare module 'ldapts' {
	export type Filter = ReturnType<typeof FilterParser.parse>;
}

export {};
