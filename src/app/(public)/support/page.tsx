export default function SupportPage() {
  return (
    <div className="flex flex-col gap-8" style={{ color: "#1f1a17" }}>
      <div>
        <h1 className="font-[family-name:var(--font-delius)] text-4xl font-bold">Support</h1>
        <p className="mt-2 font-[family-name:var(--font-delius)] text-sm" style={{ color: "#1f1a1766" }}>
          We&apos;re here to help.
        </p>
      </div>

      {[
        {
          title: "Getting Started",
          body: "Create an account or sign in using Google, GitHub, or a magic link. Once logged in, head to the Tasks page to create your first board and start adding tasks.",
        },
        {
          title: "Prioritisation Matrix",
          body: "Tasks are automatically placed in the Eisenhower matrix based on their due date and priority. Tasks due within 3 days are marked urgent; HIGH priority tasks are marked important.",
        },
        {
          title: "Action List",
          body: "Enter your available hours and toggle deep work mode, then click 'Generate plan' to get an AI-prioritised task order with a built-in Pomodoro timer.",
        },
        {
          title: "Archive",
          body: "Completed or archived tasks appear in the Archive tab. You can unarchive them back to a board or permanently delete them.",
        },
        {
          title: "Account & Settings",
          body: "Access your profile, Pomodoro durations, and appearance settings from the Settings panel. You can also change the app theme from the Theme panel.",
        },
        {
          title: "Contact Us",
          body: "For issues not covered here, please use the Request a Change page to send us a message and we'll get back to you as soon as possible.",
        },
      ].map(({ title, body }) => (
        <section key={title}>
          <h2 className="font-[family-name:var(--font-delius)] text-xl font-semibold">{title}</h2>
          <p className="mt-2 font-[family-name:var(--font-delius)] text-sm leading-relaxed" style={{ color: "#1f1a17cc" }}>
            {body}
          </p>
        </section>
      ))}
    </div>
  );
}
