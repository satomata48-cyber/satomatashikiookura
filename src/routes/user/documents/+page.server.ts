import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	const db = platform?.env?.DB;
	if (!db || !locals.user) {
		return { documents: [] };
	}

	const documents = await db.prepare(`
		SELECT id, title, emoji, parent_id, is_folder, sort_order, created_at, updated_at
		FROM documents
		WHERE user_id = ?
		ORDER BY sort_order ASC, updated_at DESC
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

	return { documents: documents.results };
};
