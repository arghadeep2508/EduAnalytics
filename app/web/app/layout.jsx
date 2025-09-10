// app/web/app/layout.jsx  (Server Component)
import ReactQueryProvider from './ReactQueryProvider';

export const metadata = {
  title: 'EduAnalytics',
  description: 'Student analytics dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
