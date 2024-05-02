// See https://kit.svelte.dev/docs/types#app

import type { Session } from '$lib/types/session';
import type { Client } from 'ldapts';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth: () => Promise<{ ldap: Client; session: Session } | null>;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
