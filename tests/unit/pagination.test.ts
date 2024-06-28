import { extractPagination } from '$lib/pagination';
import { describe, it, expect } from 'vitest';

describe('pagination test', () => {
	it('Extract pagination data when page is within array length', () => {
		const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const page = 2;
		const pageSize = 3;

		const paginationData = extractPagination(values, page, pageSize);
		expect(paginationData).toEqual({
			page: 2,
			pageSize: 3,
			data: [4, 5, 6],
			totalEntries: 10,
			totalPages: 4
		});
	});

	it('Extract pagination data when page is outside array length', () => {
		const values = [1, 2, 3, 4, 5];
		const page = 3;
		const pageSize = 3;

		const paginationData = extractPagination(values, page, pageSize);
		expect(paginationData).toEqual({
			page: 3,
			pageSize: 3,
			data: [],
			totalEntries: 5,
			totalPages: 2
		});
	});
});
