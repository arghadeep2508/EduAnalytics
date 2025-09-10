// Redirect the site root `/` to your app home under /web/app
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/web/app');
}
