import { PostsListSkeleton } from '@/components/skeletons/admin-skeletons';

// Content-only skeleton - layout (sidebar/header) remains visible
export default function AdminPostsLoading() {
	return <PostsListSkeleton />;
}