export default function Home() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Welcome to AISES Knowledge Bowl</h2>
      <p>If you can read this, Next.js is running at <code>http://localhost:3000</code>.</p>
      <ul className="list-disc pl-6">
        <li>Try <a href="/host">/host</a> to create a game.</li>
        <li>Try <a href="/play">/play</a> to join a game.</li>
      </ul>
    </div>
  );
}
