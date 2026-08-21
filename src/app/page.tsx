export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Swaraj Singh
        </h1>
        <p className="text-lg text-muted">
          Software Engineer & Curator. Building digital experiences and
          exploring the signal.
        </p>
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-medium">Recent Activity</h2>
        <p className="text-muted">Content will go here.</p>
      </section>
    </div>
  );
}
