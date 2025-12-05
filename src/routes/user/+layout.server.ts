import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	// 未ログインの場合はトップページへリダイレクト
	if (!locals.user) {
		// 無効なセッションCookieがあれば削除
		const sessionId = cookies.get('session');
		if (sessionId) {
			cookies.delete('session', { path: '/' });
		}
		throw redirect(302, '/');
	}

	return {
		user: locals.user
	};
};
