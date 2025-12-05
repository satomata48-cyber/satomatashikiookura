import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, platform }) => {
	const sessionId = cookies.get('session');

	// 無効なセッションCookieがあれば削除（自動リダイレクトはしない）
	if (sessionId && platform?.env?.DB) {
		const session = await platform.env.DB.prepare(
			`SELECT sessions.id FROM sessions
			 JOIN users ON sessions.user_id = users.id
			 WHERE sessions.id = ? AND sessions.expires_at > datetime('now')`
		).bind(sessionId).first();

		if (!session) {
			// 無効なセッションCookieを削除
			cookies.delete('session', { path: '/' });
		}
	}
};
