import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, platform }) => {
	const db = platform?.env?.DB;
	if (!db || !locals.user) {
		throw error(401, 'Unauthorized');
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
		throw error(404, 'Document not found');
	}

	return { document };
};
