import type { Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('session');

	if (sessionId && event.platform?.env?.DB) {
		const user = await validateSession(event.platform.env.DB, sessionId);
		if (user) {
			event.locals.user = user;
		}
	}

	return resolve(event);
};
