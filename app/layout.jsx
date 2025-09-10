// app/layout.jsx
export const metadata = {
  title: 'EduAnalytics',
  description: 'Student analytics dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
