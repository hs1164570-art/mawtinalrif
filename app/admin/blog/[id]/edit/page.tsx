import { PostEditorPage } from "../../component/create/PostEditorPage";

export const metadata = { title: "تعديل المقال — موطن الريف" };

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PostEditorPage postId={id} />;
}
