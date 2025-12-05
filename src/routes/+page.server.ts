import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, platform }) => {
	const sessionId = cookies.get('session');

	if (sessionId && platform?.env?.DB) {
		// セッションの有効性をDBで確認
		const session = await platform.env.DB.prepare(
			`SELECT sessions.id FROM sessions
			 JOIN users ON sessions.user_id = users.id
			 WHERE sessions.id = ? AND sessions.expires_at > datetime('now')`
		).bind(sessionId).first();

		if (session) {
			// ログイン済みなら月次収入ページにリダイレクト
			throw redirect(302, '/monthly-income');
		} else {
			// 無効なセッションCookieを削除
			cookies.delete('session', { path: '/' });
		}
	}
};
