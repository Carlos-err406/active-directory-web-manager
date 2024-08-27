import config from '$config';
import { TESTING } from '$env/static/private';
import type { Session } from '$lib/types/session';
import { error, redirect } from '@sveltejs/kit';
import { appLog } from './logs';

type AccessControlOpts = {
	locals: App.Locals;
	url: URL;
	beforeError?: (session: Session) => void;
	beforeLog?: (session: Session) => void;
};
const getNonAdminConfig = () => config.app.nonAdmin;

export const protectedAccessControl = async (accessControlOpts: AccessControlOpts) => {
	const { locals, url, beforeError, beforeLog } = accessControlOpts;
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/auth');
	const { session } = auth;
	const {
		allowAccessToGroupsPage,
		allowAccessToLogsPage,
		allowAccessToOUsPage,
		allowAccessToTreePage,
		allowAccessToUsersPage
	} = getNonAdminConfig();
	const canAccessOuRoutes = () => session.isAdmin || allowAccessToOUsPage;
	const canAccessUserRoutes = () => session.isAdmin || allowAccessToUsersPage;
	const canAccessGroupRoutes = () => session.isAdmin || allowAccessToGroupsPage;
	const canAccessLogRoutes = () => session.isAdmin || allowAccessToLogsPage;
	const canAccessTreeRoutes = () => session.isAdmin || allowAccessToTreePage;

	if (
		(isUserRoutes(url) && !canAccessUserRoutes()) ||
		(isGroupRoutes(url) && !canAccessGroupRoutes()) ||
		(isLogRoutes(url) && !canAccessLogRoutes()) ||
		(isTreeRoutes(url) && !canAccessTreeRoutes()) ||
		(isOuRoutes(url) && !canAccessOuRoutes())
	) {
		beforeLog?.(session);
		appLog(
			`User ${session.sAMAccountName} tried accessing ${url.pathname} page but Non-Admin access is disabled by configuration.`,
			'Error'
		);
		beforeError?.(session);
		throw error(403, 'Non-Admin access to this resource is disabled by configuration');
	}
	return auth;
};

type HiddenResourceAccessControlOpts = AccessControlOpts & {
	dn: string;
};

export const specificResourceAccessControl = async (opts: HiddenResourceAccessControlOpts) => {
	const { locals, url, beforeError, beforeLog, dn } = opts;
	const auth = await protectedAccessControl({ locals, url, beforeError });
	const { session } = auth;
	const { groups, users, ous } = config.directory;
	if (
		(isGroupRoutes(url) && groups.hide.includes(dn)) ||
		(isUserRoutes(url) && users.hide.includes(dn)) ||
		(isOuRoutes(url) && ous.hide.includes(dn))
	) {
		beforeLog?.(session);
		appLog(
			`User ${session.sAMAccountName} tried accessing ${url.pathname} page but resource is hidden by configuration.`,
			'Error'
		);
		beforeError?.(session);
		throw error(403, 'This resource is hidden by configuration');
	}
	return auth;
};

const isTreeRoutes = (url: URL) => url.pathname.startsWith('/tree');
const isLogRoutes = (url: URL) => url.pathname.startsWith('/logs');
const isGroupRoutes = (url: URL) => url.pathname.startsWith('/groups');
const isUserRoutes = (url: URL) =>
	url.pathname.startsWith('/users') && !url.pathname.endsWith('/me');
const isOuRoutes = (url: URL) => url.pathname.startsWith('/ous');

export const isTestEnvironment = () => {
	return [process.env.TESTING, TESTING].includes('1');
};
