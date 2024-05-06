// See https://kit.svelte.dev/docs/types#app

import type { Session } from '$lib/types/session';
import type { Client, FilterParser } from 'ldapts';

// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message?: string;
			errorId?: string;
		}
		interface Locals {
			auth: () => Promise<{ ldap: Client; session: Session } | null>;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module 'ldapts' {
	export type Filter = ReturnType<typeof FilterParser.parse>;
}

export {};
