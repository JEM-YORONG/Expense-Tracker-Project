export default function WelcomeBanner({ user }) {
  const isAdmin = user?.role === 'admin';
  const subtitle = isAdmin ? 'Manage users and oversee the system.' : 'Track your spending and stay on budget.';
  return (
    <div className="card span-4 welcome">
      <h2>Welcome{user?.email ? `, ${user.email.split('@')[0]}` : ''} 👋</h2>
      <p>{subtitle}</p>
    </div>
  );
}
