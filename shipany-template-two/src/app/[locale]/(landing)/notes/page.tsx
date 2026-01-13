import { redirect } from '@/core/i18n/navigation';
import { NotesWorkspace } from '@/components/notes/NotesWorkspace';
import { getUserInfo } from '@/shared/models/user';
import { Empty } from '@/shared/blocks/common';

export default async function NotesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const user = await getUserInfo();
  const { locale } = await params;

  if (!user) {
    redirect({ href: '/sign-in', locale });
  }

  return <NotesWorkspace />;
}
