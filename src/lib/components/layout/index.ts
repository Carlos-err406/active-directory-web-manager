import Building2 from '$lucide/building-2.svelte';
import FileTextIcon from '$lucide/file-text.svelte';
import FolderTree from '$lucide/folder-tree.svelte';
import User from '$lucide/user.svelte';
import Users from '$lucide/users.svelte';
import type { RecursiveRequired } from '@sveltejs/kit';
import dayjs from 'dayjs';
import type { Icon } from 'lucide-svelte';
import type { ComponentType } from 'svelte';
export interface NavigationItemType {
	name: string;
	href: string;
	icon: ComponentType<Icon>;
}

export const getNavigationItems = (
	config: RecursiveRequired<App.Config>,
	isAdmin = false
): NavigationItemType[] => {
	const filterLogsPageIfDisabled = (item: NavigationItemType) => {
		const canAccess = config.app.nonAdmin.allowAccessToLogsPage || isAdmin;
		if (!item.href.startsWith('/logs')) return true;
		else return config.app.views.logsPage.show && canAccess;
	};
	const filterTreePageIfDisabled = (item: NavigationItemType) => {
		const canAccess = config.app.nonAdmin.allowAccessToGroupsPage || isAdmin;
		if (!item.href.startsWith('/tree')) return true;
		else return config.app.views.treePage.show && canAccess;
	};
	const filterOusPageIfDisabled = (item: NavigationItemType) => {
		const canAccess = config.app.nonAdmin.allowAccessToOUsPage || isAdmin;
		if (!item.href.startsWith('/ous')) return true;
		else return config.app.views.ousPage.show && canAccess;
	};
	const filterGroupsPageIfDisabled = (item: NavigationItemType) => {
		const canAccess = config.app.nonAdmin.allowAccessToGroupsPage || isAdmin;
		if (!item.href.startsWith('/groups')) return true;
		else return config.app.views.groupsPage.show && canAccess;
	};
	return [
		{ href: '/users', name: 'Users', icon: User },
		{ href: '/groups', name: 'Groups', icon: Users },
		{
			href: '/ous',
			name: 'Organizational Units',
			icon: Building2
		},
		{ href: '/tree', name: 'Tree view', icon: FolderTree },
		{
			href: `/logs?fromDate=${dayjs().subtract(2, 'days').format('YYYY-MM-DD')}&toDate=${dayjs().format('YYYY-MM-DD')}`,
			name: 'Logs',
			icon: FileTextIcon
		}
	]
		.filter(filterLogsPageIfDisabled)
		.filter(filterTreePageIfDisabled)
		.filter(filterOusPageIfDisabled)
		.filter(filterGroupsPageIfDisabled);
};
