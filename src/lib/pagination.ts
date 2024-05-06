export type PaginationWithUrls<T> = Pagination<T> & {
	previousPage: string | null;
	nextPage: string | null;
};
export type Pagination<T> = {
	page: number;
	pageSize: number;
	data: T[];
	totalPages: number;
	totalEntries: number;
};
export const extractPagination = <T>(
	entries: T[],
	page: number,
	pageSize: number
): Pagination<T> => {
	const startIndex = (page - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	const totalPages = Math.ceil(entries.length / pageSize);

	if (startIndex >= entries.length) {
		return {
			page: page,
			pageSize: pageSize,
			data: [] as T[],
			totalPages: totalPages,
			totalEntries: entries.length
		};
	} else {
		return {
			page: page,
			pageSize: pageSize,
			data: entries.slice(startIndex, endIndex),
			totalPages: totalPages,
			totalEntries: entries.length
		};
	}
};
