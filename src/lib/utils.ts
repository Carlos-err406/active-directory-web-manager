import { APP_LOGS_DIR, SYSTEM_LOGS_DIR } from '$lib';
import { type ClassValue, clsx } from 'clsx';
import dayjs from 'dayjs';
import type { Action } from 'svelte/action';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { log } from 'sveltekit-logger-hook';
import { twMerge } from 'tailwind-merge';
import { v4 } from 'uuid';

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

export const errorLog = (e: unknown, extra?: object) => {
	const errorId = v4();
	log({ errorId, error: `${e}`, ...extra }, { basePath: SYSTEM_LOGS_DIR });
	log(
		`${dayjs().format('YYYY-MM-DD HH:mm:ss A')} -- [Error (${errorId})]: ${extra && 'message' in extra ? extra.message : 'No error description'}`,
		{ basePath: APP_LOGS_DIR }
	);

	return errorId;
};
export const appLog = (line: string, type: 'Info' | 'Warning' = 'Info') =>
	log(`${dayjs().format('YYYY-MM-DD HH:mm:ss A')} -- [${type}]: ${line}`, {
		basePath: APP_LOGS_DIR
	});
