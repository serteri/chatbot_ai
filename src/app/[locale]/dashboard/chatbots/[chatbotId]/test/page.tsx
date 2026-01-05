import { redirect } from 'next/navigation';

export default async function ChatbotTestPage({
  params,
}: {
  params: Promise<{ locale: string; chatbotId: string }>;
}) {
  const { locale, chatbotId } = await params;

  // Redirect to main chatbot page
  redirect(`/${locale}/dashboard/chatbots/${chatbotId}`);
}
