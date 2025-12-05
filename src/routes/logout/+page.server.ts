import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { deleteSession } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ cookies, platform }) => {
		const sessionId = cookies.get('session');

		if (sessionId && platform?.env?.DB) {
			await deleteSession(platform.env.DB, sessionId);
		}

		cookies.delete('session', { path: '/' });

		throw redirect(302, '/');
	}
};
