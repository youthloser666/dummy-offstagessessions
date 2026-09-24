import { getMediaArchives } from '@/lib/services/media';
import MediaContent from '@/components/MediaContent';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MediaPage() {
    const initialMedia = await getMediaArchives();
    return <MediaContent initialMedia={initialMedia} />;
}
