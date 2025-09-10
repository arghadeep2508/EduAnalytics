// app/web/app/layout.jsx
import ReactQueryProvider from './ReactQueryProvider';

export const metadata = {
  title: 'EduAnalytics',
  description: 'Student analytics dashboard',
};

export default function WebAppLayout({ children }) {
  return <ReactQueryProvider>{children}</ReactQueryProvider>;
}
