import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

// SHA256ハッシュ関数（Web Crypto API使用）
async function hashPassword(password: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(password);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// セッションID生成
function generateSessionId(): string {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const load: PageServerLoad = async ({ cookies, platform }) => {
	// すでにログインしている場合はリダイレクト
	const sessionId = cookies.get('session');
	if (sessionId && platform?.env?.DB) {
		// セッションの有効性をDBで確認
		const session = await platform.env.DB.prepare(
			`SELECT sessions.id FROM sessions
			 JOIN users ON sessions.user_id = users.id
			 WHERE sessions.id = ? AND sessions.expires_at > datetime('now')`
		).bind(sessionId).first();

		if (session) {
			throw redirect(302, '/monthly-income');
		} else {
			// 無効なセッションCookieを削除
			cookies.delete('session', { path: '/' });
		}
	}
};

export const actions: Actions = {
	login: async ({ request, platform, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return fail(400, { error: 'メールアドレスとパスワードを入力してください' });
		}

		const db = platform?.env?.DB;
		if (!db) {
			return fail(500, { error: 'データベース接続エラー' });
		}

		// パスワードをハッシュ化
		const passwordHash = await hashPassword(password);

		// ユーザーを検索
		const user = await db.prepare(
			'SELECT id, email FROM users WHERE email = ? AND password_hash = ?'
		).bind(email, passwordHash).first<{ id: number; email: string }>();

		if (!user) {
			return fail(401, { error: 'メールアドレスまたはパスワードが正しくありません' });
		}

		// セッションを作成
		const sessionId = generateSessionId();
		const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30日後

		await db.prepare(
			'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
		).bind(sessionId, user.id, expiresAt).run();

		// セッションCookieを設定
		cookies.set('session', sessionId, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 30 * 24 * 60 * 60 // 30日
		});

		throw redirect(302, '/monthly-income');
	}
};
