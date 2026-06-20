import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const LAST_UPDATED = "20 June 2026";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-28 pb-10 px-4 text-center bg-gradient-soft">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary-deep text-sm mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-4">
          <ShieldCheck className="h-3.5 w-3.5" /> Privacy
        </div>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3">
          Privacy <span className="text-primary">Policy</span>
        </h1>
        <p className="text-muted-foreground text-sm">Last updated {LAST_UPDATED}</p>
      </div>

      <article className="container-custom max-w-3xl py-12 sm:py-16 text-foreground">
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-10">
          Kuria West Students Association ("KUWESA", "we", "us") respects the privacy of every member, donor,
          and visitor to this website. This policy explains what information we collect through kuwesa.app
          (the "Site"), why we collect it, how it is used and protected, and the choices you have.
        </p>

        <Section title="1. Who we are">
          <p>
            KUWESA is a members' association uniting students from the seven wards of Kuria West — Isebania,
            Nyamosense/Komosoko, Tagare, Bukira Central, Makerero, Bukira East, and Masaba. We run this Site to
            manage membership registration, welfare campaigns, leadership information, and community
            announcements. For any privacy questions, contact us at{" "}
            <a href="mailto:kuwesa12@gmail.com" className="text-primary font-medium hover:underline">kuwesa12@gmail.com</a>.
          </p>
        </Section>

        <Section title="2. Information we collect">
          <p className="mb-3">We collect information directly from you when you use the Site:</p>
          <SubHeading>Membership registration</SubHeading>
          <List items={[
            "Full name, phone number, and email address",
            "Membership category (student, graduate, professional, or other) and membership tier (Member, Leader, or Patron)",
            "Institution, course, and year of study",
            "Ward of residence within Kuria West",
            "Gender (optional) and date of birth, where provided",
            "Next of kin name and phone number",
            "Skills and talents you choose to share",
          ]} />
          <SubHeading>Welfare donations</SubHeading>
          <List items={[
            "Donor name, phone number, and email address",
            "Donation amount and the campaign it was made to",
          ]} />
          <SubHeading>Payments</SubHeading>
          <List items={[
            "Payment amount, currency, and status",
            "M-Pesa transaction reference and receipt number, processed through our payment partner Pesapal",
            "We do not collect or store your M-Pesa PIN, full card number, or banking credentials. These are entered directly with Pesapal and your mobile network operator.",
          ]} />
          <SubHeading>Account access</SubHeading>
          <List items={[
            "Member login uses your registered full name and phone number",
            "Admin accounts use an email address and password, stored as a securely hashed value we cannot reverse",
            "A session cookie keeps you signed in to your member or admin dashboard while you use the Site",
          ]} />
          <SubHeading>Contact form</SubHeading>
          <List items={[
            "Name, email address, and the message you send us",
          ]} />
        </Section>

        <Section title="3. How we use your information">
          <List items={[
            "To create and manage your membership record and member dashboard",
            "To process membership fees and welfare donations through Pesapal/M-Pesa and confirm payment status",
            "To verify your identity when you log in to the member or admin dashboard",
            "To contact you about your membership, a donation, or a message you sent through the Site",
            "To list aggregated, non-identifying statistics such as total members or wards represented",
            "To maintain the security, integrity, and proper functioning of the Site",
          ]} />
        </Section>

        <Section title="4. Payment processing">
          <p>
            Membership fees and welfare donations are collected via M-Pesa STK push, processed by{" "}
            <strong>Pesapal</strong>, a licensed third-party payment gateway. When you make a payment, your
            payer details and payment amount are shared with Pesapal solely to process the transaction. Pesapal
            confirms payment status back to KUWESA through a secure server-to-server notification. KUWESA does
            not handle or store your M-Pesa PIN or full payment card details at any point.
          </p>
        </Section>

        <Section title="5. Cookies and similar technologies">
          <p>
            The Site uses a single essential session cookie to keep you logged in to your member or admin
            dashboard. This cookie is required for the Site to function and is not used for advertising or
            cross-site tracking. We do not currently use third-party analytics or advertising cookies on this
            Site.
          </p>
        </Section>

        <Section title="6. How we store and protect your information">
          <List items={[
            "Data is stored in a Postgres database hosted by Supabase, with access restricted to authorized KUWESA administrators",
            "Passwords are stored as irreversible cryptographic hashes, never in plain text",
            "Photographs uploaded for leadership profiles are stored in secured cloud storage",
            "We apply reasonable technical and organizational measures to protect your information, but no method of transmission or storage online is completely secure",
          ]} />
        </Section>

        <Section title="7. Who we share information with">
          <p className="mb-3">We do not sell your personal information. We share information only as needed to operate the Site:</p>
          <List items={[
            "Pesapal, to process membership fees and welfare donations",
            "Our hosting and database providers (Vercel and Supabase), who store data on our behalf under their own security commitments",
            "KUWESA leadership and authorized administrators, for membership and welfare management",
            "Where required by Kenyan law, regulation, or a valid legal process",
          ]} />
        </Section>

        <Section title="8. Your rights">
          <p className="mb-3">
            Under the Kenya Data Protection Act, 2019, you have the right to:
          </p>
          <List items={[
            "Know what personal data we hold about you",
            "Request access to, correction of, or deletion of your personal data",
            "Object to or restrict certain uses of your data",
            "Withdraw consent for optional information (such as gender or skills) at any time",
          ]} />
          <p className="mt-3">
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:kuwesa12@gmail.com" className="text-primary font-medium hover:underline">kuwesa12@gmail.com</a>{" "}
            or call <a href="tel:+254745523865" className="text-primary font-medium hover:underline">+254 745 523 865</a>.
            We will respond within a reasonable time.
          </p>
        </Section>

        <Section title="9. Data retention">
          <p>
            We retain membership and payment records for as long as your membership is active and for a
            reasonable period afterward to meet our financial record-keeping obligations and resolve any
            disputes. You may request deletion of your account at any time, subject to records we are legally
            required to keep.
          </p>
        </Section>

        <Section title="10. Children's privacy">
          <p>
            KUWESA membership is intended for students and community members generally aged 16 and above. We
            do not knowingly collect personal information from children under 16 without the consent of a
            parent or guardian. If you believe a child has provided us with personal information, please
            contact us so we can remove it.
          </p>
        </Section>

        <Section title="11. Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time to reflect changes in how the Site works or in
            applicable law. The "Last updated" date at the top of this page will always reflect the most
            recent version. Continued use of the Site after changes take effect means you accept the updated
            policy.
          </p>
        </Section>

        <Section title="12. Contact us">
          <p>
            If you have questions about this Privacy Policy or how your information is handled, reach out to:
          </p>
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

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="font-semibold text-foreground text-sm mt-4 mb-2">{children}</h3>;
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
