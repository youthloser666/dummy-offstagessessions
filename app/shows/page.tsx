import { getShows } from '@/lib/services/shows';
import ShowsContent from '@/components/ShowsContent';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ShowsPage() {
    const initialShows = await getShows();
    return <ShowsContent initialShows={initialShows} />;
}
