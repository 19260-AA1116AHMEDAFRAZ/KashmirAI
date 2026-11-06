import { SignInForm } from './SignInForm';

// Sign in / create an account, with email + password or Google.
// proxy.ts sends signed-out visitors here and signed-in visitors away from here.
export default async function SignInPage({ searchParams }: PageProps<'/sign-in'>) {
  const { next, error } = await searchParams;
  return <SignInForm next={typeof next === 'string' ? next : '/discover'} callbackFailed={error === 'callback'} />;
}
