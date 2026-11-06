import { getLang } from '@/i18n/server';
import { WelcomeForm } from './WelcomeForm';

// Screen 1: Welcome & language. proxy.ts sends first-time visitors here.
export default async function WelcomePage({ searchParams }: PageProps<'/welcome'>) {
  const { next } = await searchParams;
  return <WelcomeForm initialLang={await getLang()} next={typeof next === 'string' ? next : '/'} />;
}
