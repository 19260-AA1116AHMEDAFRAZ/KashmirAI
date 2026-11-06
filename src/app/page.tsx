import { redirect } from 'next/navigation';

// "/" has no page of its own: proxy.ts sends first-time visitors to the language screen and
// signed-out visitors to sign-in; everyone else lands on Discover.
export default function Home() {
  redirect('/discover');
}
