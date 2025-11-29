import type { D1Database } from '@cloudflare/workers-types';

export async function hashPassword(password: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(password);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	const passwordHash = await hashPassword(password);
	return passwordHash === hash;
}

export function generateSessionId(): string {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return Array.from(array)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

export async function createSession(
	db: D1Database,
	userId: number
): Promise<string> {
	const sessionId = generateSessionId();
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

	await db
		.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
		.bind(sessionId, userId, expiresAt)
		.run();

	return sessionId;
}

export async function validateSession(
	db: D1Database,
	sessionId: string
): Promise<{ id: number; email: string } | null> {
	const result = await db
		.prepare(
			`SELECT users.id, users.email
       FROM sessions
       JOIN users ON sessions.user_id = users.id
       WHERE sessions.id = ? AND sessions.expires_at > datetime('now')`
		)
		.bind(sessionId)
		.first<{ id: number; email: string }>();

	return result || null;
}

export async function deleteSession(db: D1Database, sessionId: string): Promise<void> {
	await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
}
