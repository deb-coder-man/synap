export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-8" style={{ color: "#1f1a17" }}>
      <div>
        <h1 className="font-[family-name:var(--font-delius)] text-4xl font-bold">Privacy Policy</h1>
        <p className="mt-2 font-[family-name:var(--font-delius)] text-sm" style={{ color: "#1f1a1766" }}>
          Last updated: March 2026
        </p>
      </div>

      {[
        {
          title: "Information We Collect",
          body: "We collect information you provide when creating an account, such as your name, email address, and password. We also collect usage data to improve the service.",
        },
        {
          title: "How We Use Your Information",
          body: "Your information is used to provide and improve Synaptex, send you service-related emails, and personalise your experience. We do not sell your data to third parties.",
        },
        {
          title: "Data Storage",
          body: "Your data is stored securely on our servers. We use industry-standard encryption to protect your information in transit and at rest.",
        },
        {
          title: "Cookies",
          body: "We use cookies to maintain your session and remember your preferences. You can disable cookies in your browser settings, though some features may not function correctly.",
        },
        {
          title: "Third-Party Services",
          body: "We use Google and GitHub for OAuth authentication. Please review their respective privacy policies for information on how they handle your data.",
        },
        {
          title: "Contact",
          body: "If you have any questions about this Privacy Policy, please contact us via our Support page.",
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
