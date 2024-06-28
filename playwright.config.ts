import { type PlaywrightTestConfig } from '@playwright/test';

import dotenv from 'dotenv';
import path from 'path';

// Read from ".env" file.
dotenv.config({ path: path.resolve('.env') });

const config: PlaywrightTestConfig = {
	testDir: 'tests/integration',
	outputDir: 'tests/integration/test-results/',
	snapshotDir: 'tests/integration/snapshots/',

	webServer: {
		env: {
			NODE_ENV: 'test'
		},

		command: 'npm run dev',
		port: 5173,
		reuseExistingServer: true,
		stdout: 'pipe'
	},
	testMatch: /(.+\.)?(test|spec)\.[jt]s/
};

export default config;
