import Building2 from '$lucide/building-2.svelte';
import Computer from '$lucide/computer.svelte';
import Container from '$lucide/container.svelte';
import FileQuestion from '$lucide/file-question.svelte';
import User from '$lucide/user.svelte';
import Users from '$lucide/users.svelte';
import { type ClassValue, clsx } from 'clsx';
import type { Action } from 'svelte/action';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;

	const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (style: Record<string, number | string | undefined>): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, '');
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};

export const arrowNavigation: Action = (
	node: HTMLElement,
	selectors: keyof HTMLElementTagNameMap = 'button'
) => {
	const handleNavigation = (e: KeyboardEvent) => {
		const navigableElements = Array.from(node.querySelectorAll(selectors));
		const currentlyFocused = document.activeElement;
		const indexOfFocused = navigableElements.findIndex((element) =>
			element.isSameNode(currentlyFocused)
		);

		const next = navigableElements[indexOfFocused + 1];
		const prev = navigableElements[indexOfFocused - 1];
		if (e.key === 'ArrowDown') next?.focus();
		else if (e.key === 'ArrowUp') prev?.focus();
	};

	node.addEventListener('keydown', handleNavigation);
	return { destroy: () => node.removeEventListener('keydown', handleNavigation) };
};

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type EntryWithObjectClass = {
	[key: string]: unknown;
	objectClass: string[];
};
export const isUser = <T extends EntryWithObjectClass>(entry: T) =>
	entry.objectClass.includes('organizationalPerson');
export const isOu = <T extends EntryWithObjectClass>(entry: T) =>
	entry.objectClass.includes('organizationalUnit');
export const isContainer = <T extends EntryWithObjectClass>(entry: T) =>
	entry.objectClass.includes('container');
export const isGroup = <T extends EntryWithObjectClass>(entry: T) =>
	entry.objectClass.includes('group');
export const isComputer = <T extends EntryWithObjectClass>(entry: T) =>
	entry.objectClass.includes('computer');

export const getEntryIcon = <T extends EntryWithObjectClass>(entry: T) => {
	if (isComputer(entry)) return Computer;
	else if (isUser(entry)) return User;
	else if (isOu(entry)) return Building2;
	else if (isGroup(entry)) return Users;
	else if (isContainer(entry)) return Container;
	else return FileQuestion;
};
