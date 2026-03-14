export default function TermsPage() {
  return (
    <div className="flex flex-col gap-8" style={{ color: "#1f1a17" }}>
      <div>
        <h1 className="font-[family-name:var(--font-delius)] text-4xl font-bold">Terms & Conditions</h1>
        <p className="mt-2 font-[family-name:var(--font-delius)] text-sm" style={{ color: "#1f1a1766" }}>
          Last updated: March 2026
        </p>
      </div>

      {[
        {
          title: "Acceptance of Terms",
          body: "By accessing or using Synaptex, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the service.",
        },
        {
          title: "Use of Service",
          body: "Synaptex is provided for personal productivity purposes. You agree not to misuse the service, attempt to gain unauthorised access, or use it for any unlawful purpose.",
        },
        {
          title: "Account Responsibility",
          body: "You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.",
        },
        {
          title: "Intellectual Property",
          body: "All content, branding, and technology within Synaptex is the property of Synaptex and may not be reproduced without permission.",
        },
        {
          title: "Limitation of Liability",
          body: "Synaptex is provided 'as is' without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.",
        },
        {
          title: "Changes to Terms",
          body: "We reserve the right to update these terms at any time. Continued use of the service after changes constitutes acceptance of the updated terms.",
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
