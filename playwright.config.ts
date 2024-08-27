import { type PlaywrightTestConfig } from '@playwright/test';

import dotenv from 'dotenv';
import path from 'path';

// Read from ".env" file.
dotenv.config({ path: path.resolve('.env') });

const config: PlaywrightTestConfig = {
	testDir: 'tests/integration',
	outputDir: 'tests/integration/test-results/',
	snapshotDir: 'tests/integration/snapshots/',
	retries: 4,
	reportSlowTests: {
		threshold: Infinity,
		max: 10
	},
	globalSetup: 'tests/integration/global-setup.ts',
	webServer: {
		command: 'npm run dev',
		port: 5173,
		reuseExistingServer: true,
		stderr: 'pipe',
		stdout: 'pipe'
	},
	use: {
		browserName: 'chromium',
		storageState: 'tests/integration/.auth-state/admin-auth.json'
	},
	testMatch: /(.+\.)?(test|spec)\.[jt]s/
};

export default config;
