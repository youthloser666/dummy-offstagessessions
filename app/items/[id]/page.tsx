import { redirect } from 'next/navigation';

export default async function RootItemsRedirect({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    redirect(`/shop/${id}`);
}
