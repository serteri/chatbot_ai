import { redirect } from 'next/navigation';

export default async function ScholarshipApplyPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  // Redirect to scholarship detail page
  redirect(`/${locale}/dashboard/student/scholarships/${id}`);
}
