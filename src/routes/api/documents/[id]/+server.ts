import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals, platform }) => {
	const db = platform?.env?.DB;
	if (!db || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const document = await db.prepare(`
		SELECT id, title, content, emoji, parent_id, is_folder, sort_order, created_at, updated_at
		FROM documents
		WHERE id = ? AND user_id = ?
	`).bind(params.id, locals.user.id).first<{
		id: number;
		title: string;
		content: string;
		emoji: string;
		parent_id: number | null;
		is_folder: number;
		sort_order: number;
		created_at: string;
		updated_at: string;
	}>();

	if (!document) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	return json({ document });
};

export const PUT: RequestHandler = async ({ params, request, locals, platform }) => {
	const db = platform?.env?.DB;
	if (!db || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { title, content, emoji } = await request.json();

	await db.prepare(`
		UPDATE documents
		SET title = ?, content = ?, emoji = ?, updated_at = datetime('now')
		WHERE id = ? AND user_id = ?
	`).bind(title, content, emoji, params.id, locals.user.id).run();

	const document = await db.prepare(`
		SELECT id, title, content, emoji, parent_id, is_folder, sort_order, created_at, updated_at
		FROM documents
		WHERE id = ? AND user_id = ?
	`).bind(params.id, locals.user.id).first();

	return json({ document });
};

export const DELETE: RequestHandler = async ({ params, locals, platform }) => {
	const db = platform?.env?.DB;
	if (!db || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	await db.prepare(`
		DELETE FROM documents
		WHERE id = ? AND user_id = ?
	`).bind(params.id, locals.user.id).run();

	return json({ success: true });
};
