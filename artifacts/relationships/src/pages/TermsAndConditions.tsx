import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const LAST_UPDATED = "20 June 2026";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-28 pb-10 px-4 text-center bg-gradient-soft">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary-deep text-sm mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-4">
          <FileText className="h-3.5 w-3.5" /> Legal
        </div>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3">
          Terms & <span className="text-primary">Conditions</span>
        </h1>
        <p className="text-muted-foreground text-sm">Last updated {LAST_UPDATED}</p>
      </div>

      <article className="container-custom max-w-3xl py-12 sm:py-16 text-foreground">
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-10">
          These Terms & Conditions ("Terms") govern your use of the Kuria West Students Association website
          at kuwesa.app (the "Site") and your membership in or donations to Kuria West Students Association
          ("KUWESA", "we", "us"). By registering as a member, making a donation, or otherwise using the Site,
          you agree to these Terms.
        </p>

        <Section title="1. About KUWESA">
          <p>
            KUWESA is a students' association uniting students from the seven wards of Kuria West — Isebania,
            Nyamosense/Komosoko, Tagare, Bukira Central, Makerero, Bukira East, and Masaba — through
            mentorship, leadership development, welfare support, and community service.
          </p>
        </Section>

        <Section title="2. Eligibility">
          <p>
            Membership is open to students, graduates, professionals, and community members connected to
            Kuria West who are generally aged 16 or above. By registering, you confirm that the information
            you provide is accurate and that you have the authority to agree to these Terms. If you are under
            18, we encourage you to review this membership with a parent or guardian.
          </p>
        </Section>

        <Section title="3. Membership tiers and fees">
          <p className="mb-3">KUWESA offers three one-time membership tiers, payable via M-Pesa:</p>
          <List items={[
            "Member (KES 200) — for students or community members",
            "Leader (KES 500) — for active campus leaders",
            "Patron (KES 2,000) — for supporters and mentors",
          ]} />
          <p className="mt-3">
            Membership fees are one-time registration fees, not recurring subscriptions, unless KUWESA
            communicates a renewal requirement to members directly. Fees may change over time; any change will
            apply to new registrations from the date it takes effect.
          </p>
        </Section>

        <Section title="4. Payments and confirmation">
          <List items={[
            "Payments are processed via M-Pesa STK push through our payment partner, Pesapal",
            "Your registration is recorded once you submit the form; membership is only activated once payment is confirmed",
            "If an M-Pesa prompt is not completed, cancelled, or times out, your registration record is kept and you can complete payment later by logging in to your member dashboard",
            "If payment is deducted but KUWESA does not receive confirmation, contact us with your phone number and transaction details so we can verify and update your status",
          ]} />
        </Section>

        <Section title="5. Refund policy">
          <p>
            Membership fees support KUWESA's ongoing administrative, leadership, and welfare programs and are
            generally non-refundable once payment is confirmed. If you were charged in error, charged twice
            for the same registration, or did not receive the membership benefits you paid for, contact us
            within 30 days of payment at{" "}
            <a href="mailto:kuwesa12@gmail.com" className="text-primary font-medium hover:underline">kuwesa12@gmail.com</a>{" "}
            and we will review your case in good faith.
          </p>
        </Section>

        <Section title="6. Welfare campaigns and donations">
          <List items={[
            "Welfare campaigns are organized to support specific members or community needs identified by KUWESA leadership",
            "Donations are voluntary and, like membership fees, are generally non-refundable once confirmed",
            "KUWESA is responsible for directing raised funds toward the stated purpose of each campaign in good faith, but does not guarantee a campaign will reach its goal amount",
            "Progress shown for a campaign (amount raised toward its goal) reflects confirmed payments recorded in our system at the time of viewing",
          ]} />
        </Section>

        <Section title="7. Member accounts">
          <List items={[
            "You log in to your member dashboard using your registered full name and phone number",
            "You are responsible for keeping your registered phone number accurate and secure, since it is used to verify your identity",
            "KUWESA may suspend or restrict an account where information is found to be false, fraudulent, or used to misrepresent membership status",
          ]} />
        </Section>

        <Section title="8. Code of conduct">
          <p className="mb-3">As a member or user of the Site, you agree not to:</p>
          <List items={[
            "Provide false information during registration or donation",
            "Use the Site to harass, defame, or harm another member or third party",
            "Attempt to gain unauthorized access to the admin dashboard, member accounts, or underlying systems",
            "Use the Site for any unlawful purpose or in violation of Kenyan law",
          ]} />
        </Section>

        <Section title="9. Intellectual property">
          <p>
            The KUWESA name, logo, and content published on this Site — including text, photographs, and
            graphics — belong to KUWESA or are used with permission. You may share content for non-commercial
            purposes with appropriate credit, but may not reproduce or repurpose it commercially without our
            written consent.
          </p>
        </Section>

        <Section title="10. Limitation of liability">
          <p>
            The Site and its services are provided on an "as is" basis. While we take reasonable care to keep
            the Site accurate and available, KUWESA does not guarantee uninterrupted access and is not liable
            for delays, errors, or losses arising from circumstances beyond our reasonable control, including
            issues with M-Pesa, Pesapal, our hosting providers, or your internet connection.
          </p>
        </Section>

        <Section title="11. Changes to these Terms">
          <p>
            We may update these Terms from time to time to reflect changes in how KUWESA or the Site operates.
            The "Last updated" date at the top of this page reflects the most recent version. Continuing to
            use the Site or remain a member after changes take effect means you accept the updated Terms.
          </p>
        </Section>

        <Section title="12. Governing law">
          <p>
            These Terms are governed by the laws of the Republic of Kenya. Any disputes arising from these
            Terms or your use of the Site will first be addressed informally between you and KUWESA leadership
            before any other resolution process.
          </p>
        </Section>

        <Section title="13. Contact us">
          <p>For any questions about these Terms, reach out to:</p>
          <div className="mt-3 rounded-2xl bg-muted p-5 text-sm">
            <p className="font-semibold text-foreground">Kuria West Students Association (KUWESA)</p>
            <p className="text-muted-foreground mt-1">Kuria West, Migori County, Kenya</p>
            <p className="text-muted-foreground mt-1">
              Email: <a href="mailto:kuwesa12@gmail.com" className="text-primary hover:underline">kuwesa12@gmail.com</a>
            </p>
            <p className="text-muted-foreground mt-1">
              Phone: <a href="tel:+254745523865" className="text-primary hover:underline">+254 745 523 865</a>
            </p>
          </div>
        </Section>
      </article>

      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-3">{title}</h2>
      <div className="text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 list-disc pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
