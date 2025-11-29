import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, platform }) => {
	const db = platform?.env?.DB;
	if (!db || !locals.user) {
		return json({ documents: [] });
	}

	const documents = await db.prepare(`
		SELECT id, title, emoji, parent_id, is_folder, sort_order, created_at, updated_at
		FROM documents
		WHERE user_id = ?
		ORDER BY sort_order ASC, created_at DESC
	`).bind(locals.user.id).all<{
		id: number;
		title: string;
		emoji: string;
		parent_id: number | null;
		is_folder: number;
		sort_order: number;
		created_at: string;
		updated_at: string;
	}>();

	return json({ documents: documents.results });
};

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	const db = platform?.env?.DB;
	if (!db || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { title, emoji, parent_id, is_folder } = await request.json();

	const result = await db.prepare(`
		INSERT INTO documents (user_id, title, emoji, parent_id, is_folder, content)
		VALUES (?, ?, ?, ?, ?, '')
	`).bind(
		locals.user.id,
		title || '無題',
		emoji || '📄',
		parent_id || null,
		is_folder ? 1 : 0
	).run();

	const newDoc = await db.prepare(`
		SELECT id, title, emoji, parent_id, is_folder, sort_order, created_at, updated_at
		FROM documents
		WHERE id = ?
	`).bind(result.meta.last_row_id).first();

	return json({ document: newDoc });
};
