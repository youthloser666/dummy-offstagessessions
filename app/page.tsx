import { getShows } from '@/lib/services/shows';
import HomeContent from '@/components/HomeContent';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const initialShows = await getShows();
  return <HomeContent initialShows={initialShows} />;
}
