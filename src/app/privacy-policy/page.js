import Link from "next/link";
import Header from "@/components/Header";
import {
  FaArrowLeft,
  FaEnvelope,
  FaLock,
  FaPhoneAlt,
  FaShieldAlt,
} from "react-icons/fa";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy of The Aspire Nation, including how personal information is collected, used, stored and protected.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

const lastUpdated = "14 July 2026";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Header />

      {/* Page heading */}

      <section className="border-b border-red-100 bg-gradient-to-br from-white via-red-50 to-gray-100">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:py-18">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-red-700 transition hover:text-red-800"
          >
            <FaArrowLeft />
            Return to Homepage
          </Link>

          <div className="mt-8 flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-red-700 text-2xl text-white shadow-lg">
              <FaShieldAlt />
            </div>

            <div>
              <p className="font-black uppercase tracking-[0.18em] text-red-700">
                Legal Information
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
                Privacy Policy
              </h1>

              <p className="mt-3 text-gray-600">
                Last updated: {lastUpdated}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Policy content */}

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
        <article className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10 lg:p-12">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="leading-7 text-gray-700">
              This Privacy Policy explains how The Aspire Nation, operated by
              Ajeet Pratap Singh, collects, uses, stores and protects personal
              information when you visit our website, create an account,
              purchase a subscription or use our digital services.
            </p>
          </div>

          <div className="mt-10 space-y-12">
            {/* 1 */}

            <PolicySection title="1. About The Aspire Nation">
              <p>
                The Aspire Nation is a digital newspaper and educational
                preparation platform for competitive examination aspirants. We
                provide daily e-paper editions, current affairs, editorial
                analysis, quizzes, revision material and other exam-focused
                digital content.
              </p>

              <div className="mt-5 rounded-2xl bg-gray-50 p-5">
                <p>
                  <strong>Owner:</strong> Ajeet Pratap Singh
                </p>

                <p className="mt-2">
                  <strong>Business Address:</strong> Allahganj, Shahjahanpur,
                  Uttar Pradesh, India
                </p>

                <p className="mt-2">
                  <strong>Website:</strong>{" "}
                  <a
                    href="https://theaspirenation.com"
                    className="font-bold text-red-700 hover:underline"
                  >
                    theaspirenation.com
                  </a>
                </p>

                <p className="mt-2">
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:ajeetpratapsingh0786@gmail.com"
                    className="font-bold text-red-700 hover:underline"
                  >
                    ajeetpratapsingh0786@gmail.com
                  </a>
                </p>

                <p className="mt-2">
                  <strong>Phone:</strong>{" "}
                  <a
                    href="tel:+918756610386"
                    className="font-bold text-red-700 hover:underline"
                  >
                    +91 87566 10386
                  </a>
                </p>
              </div>
            </PolicySection>

            {/* 2 */}

            <PolicySection title="2. Information We May Collect">
              <p>
                We may collect information that you provide directly, along
                with limited technical information generated when you use our
                website.
              </p>

              <PolicyList
                items={[
                  "Your full name.",
                  "Your email address.",
                  "Your phone number, where provided.",
                  "Account login and authentication information.",
                  "Subscription plan, payment status and transaction reference details.",
                  "Messages, questions or support requests sent to us.",
                  "Information submitted through contact forms, registration forms or feedback forms.",
                  "Technical information such as device type, browser, IP address, operating system and approximate location.",
                  "Website usage information, including pages visited and actions performed.",
                ]}
              />

              <p className="mt-5">
                We do not intentionally store your complete debit-card,
                credit-card, UPI PIN or banking credentials. Payment information
                is processed through authorised third-party payment providers
                such as Razorpay.
              </p>
            </PolicySection>

            {/* 3 */}

            <PolicySection title="3. How We Collect Information">
              <p>Information may be collected when you:</p>

              <PolicyList
                items={[
                  "Create or update an account.",
                  "Log in to the website.",
                  "Purchase or renew a premium subscription.",
                  "Read an e-paper or access premium content.",
                  "Contact customer support.",
                  "Subscribe to communications or notifications.",
                  "Participate in a quiz, survey or feedback activity.",
                  "Browse or interact with our website.",
                ]}
              />
            </PolicySection>

            {/* 4 */}

            <PolicySection title="4. How We Use Your Information">
              <p>We may use personal information to:</p>

              <PolicyList
                items={[
                  "Create, maintain and secure your account.",
                  "Authenticate users and prevent unauthorised access.",
                  "Process subscriptions and confirm payments.",
                  "Provide access to purchased digital content.",
                  "Maintain subscription records and expiry dates.",
                  "Respond to customer-support requests.",
                  "Send important account, payment or service-related communications.",
                  "Improve website performance, usability and content.",
                  "Detect fraud, misuse, security threats and prohibited activity.",
                  "Comply with legal, regulatory, accounting and tax obligations.",
                  "Enforce our Terms and Conditions and other policies.",
                ]}
              />
            </PolicySection>

            {/* 5 */}

            <PolicySection title="5. Legal Basis and Consent">
              <p>
                We process information for legitimate and lawful purposes
                connected with providing our services, performing subscription
                transactions, protecting the platform and complying with
                applicable law.
              </p>

              <p className="mt-4">
                Where consent is required, you may withdraw it by contacting
                us. Withdrawal will not affect processing already carried out
                lawfully. Some information may still be required to maintain
                your account, fulfil a transaction or comply with legal
                obligations.
              </p>
            </PolicySection>

            {/* 6 */}

            <PolicySection title="6. Payments and Razorpay">
              <p>
                Subscription payments may be processed through Razorpay or
                another authorised payment-service provider. When you make a
                payment, the payment provider may collect and process
                information according to its own privacy policy and legal
                obligations.
              </p>

              <p className="mt-4">
                We may receive limited transaction information, including:
              </p>

              <PolicyList
                items={[
                  "Payment identification number.",
                  "Order identification number.",
                  "Payment amount and currency.",
                  "Payment status.",
                  "Payment method category.",
                  "Transaction date and time.",
                ]}
              />

              <p className="mt-5">
                We use this information to verify payment, activate premium
                access, respond to payment disputes and maintain transaction
                records.
              </p>
            </PolicySection>

            {/* 7 */}

            <PolicySection title="7. Authentication and Database Services">
              <p>
                We may use third-party technology providers, including Supabase,
                to support user authentication, database storage and account
                management.
              </p>

              <p className="mt-4">
                These providers may process limited information on our behalf
                to deliver their services, maintain security and comply with
                applicable legal requirements.
              </p>
            </PolicySection>

            {/* 8 */}

            <PolicySection title="8. Website Hosting and Technical Services">
              <p>
                Our website may be hosted and delivered using service providers
                such as Vercel. Hosting providers may process technical
                information such as IP addresses, request logs, browser details
                and device information to deliver, protect and maintain the
                website.
              </p>
            </PolicySection>

            {/* 9 */}

            <PolicySection title="9. Cookies and Similar Technologies">
              <p>
                We may use cookies, local storage and similar technologies that
                are necessary for:
              </p>

              <PolicyList
                items={[
                  "Keeping users signed in.",
                  "Maintaining secure sessions.",
                  "Remembering preferences.",
                  "Processing subscription access.",
                  "Preventing fraud and unauthorised use.",
                  "Understanding and improving website performance.",
                ]}
              />

              <p className="mt-5">
                You may control cookies through your browser settings.
                Disabling essential cookies may prevent login, payment or other
                website features from working correctly.
              </p>
            </PolicySection>

            {/* 10 */}

            <PolicySection title="10. Sharing of Information">
              <p>
                We do not sell or rent personal information. We may share
                information only where reasonably necessary with:
              </p>

              <PolicyList
                items={[
                  "Payment processors and banking partners.",
                  "Authentication, database and cloud-service providers.",
                  "Website hosting, security and technical-service providers.",
                  "Professional advisers such as accountants, auditors or legal advisers.",
                  "Government authorities, courts or regulators where legally required.",
                  "A successor entity in connection with a lawful merger, acquisition, restructuring or transfer of the business.",
                ]}
              />

              <p className="mt-5">
                Service providers are expected to use information only for the
                purpose of delivering their services or meeting legal
                obligations.
              </p>
            </PolicySection>

            {/* 11 */}

            <PolicySection title="11. Data Retention">
              <p>
                We retain personal information only for as long as reasonably
                necessary to:
              </p>

              <PolicyList
                items={[
                  "Provide accounts and subscriptions.",
                  "Maintain payment, accounting and tax records.",
                  "Resolve complaints and disputes.",
                  "Prevent fraud and enforce platform policies.",
                  "Comply with legal and regulatory requirements.",
                ]}
              />

              <p className="mt-5">
                Retention periods may vary according to the type of information
                and the reason it is held. Information may be deleted,
                anonymised or securely archived when no longer required.
              </p>
            </PolicySection>

            {/* 12 */}

            <PolicySection title="12. Data Security">
              <div className="flex items-start gap-4 rounded-2xl border border-green-100 bg-green-50 p-5">
                <FaLock className="mt-1 shrink-0 text-xl text-green-700" />

                <p>
                  We use reasonable administrative, technical and organisational
                  measures designed to protect information against unauthorised
                  access, misuse, alteration, loss or disclosure.
                </p>
              </div>

              <p className="mt-5">
                However, no internet transmission or electronic storage system
                can be guaranteed to be completely secure. Users should protect
                their passwords, avoid sharing login credentials and inform us
                promptly about suspected unauthorised account access.
              </p>
            </PolicySection>

            {/* 13 */}

            <PolicySection title="13. Your Privacy Rights">
              <p>
                Subject to applicable law and verification of your identity,
                you may request:
              </p>

              <PolicyList
                items={[
                  "Information about the personal data we hold about you.",
                  "Correction of inaccurate or incomplete information.",
                  "Deletion of information that is no longer required, where legally permissible.",
                  "Withdrawal of consent where processing is based on consent.",
                  "Closure of your account.",
                  "Information about how to raise a privacy-related complaint.",
                ]}
              />

              <p className="mt-5">
                To submit a request, email us at{" "}
                <a
                  href="mailto:ajeetpratapsingh0786@gmail.com"
                  className="font-bold text-red-700 hover:underline"
                >
                  ajeetpratapsingh0786@gmail.com
                </a>
                . We may request reasonable information to verify your identity
                before processing the request.
              </p>
            </PolicySection>

            {/* 14 */}

            <PolicySection title="14. Children’s Privacy">
              <p>
                Our content may be useful to students, including users below 18
                years of age. Where legally required, a parent or lawful
                guardian should supervise account creation and payment.
              </p>

              <p className="mt-4">
                We do not knowingly seek unnecessary personal information from
                children. A parent or guardian who believes that a child has
                provided information improperly may contact us to request
                review or deletion.
              </p>
            </PolicySection>

            {/* 15 */}

            <PolicySection title="15. Third-Party Links">
              <p>
                Our website may contain links to government websites, official
                notifications, examination portals, educational resources or
                other third-party services.
              </p>

              <p className="mt-4">
                We do not control the privacy practices, security or content of
                third-party websites. Users should review the privacy policies
                of those websites before providing personal information.
              </p>
            </PolicySection>

            {/* 16 */}

            <PolicySection title="16. Communications">
              <p>
                We may send service-related communications concerning your
                account, subscription, payment, security or material changes to
                our policies.
              </p>

              <p className="mt-4">
                Promotional messages, newsletters or marketing communications
                may be sent where permitted. You may request to unsubscribe
                from non-essential promotional communications.
              </p>
            </PolicySection>

            {/* 17 */}

            <PolicySection title="17. International Processing">
              <p>
                Some technology providers may process or store information on
                servers located outside your state or outside India, subject to
                their security practices, contractual commitments and
                applicable legal requirements.
              </p>
            </PolicySection>

            {/* 18 */}

            <PolicySection title="18. Changes to This Privacy Policy">
              <p>
                We may update this Privacy Policy when our services, technology,
                legal obligations or business practices change.
              </p>

              <p className="mt-4">
                The updated version will be posted on this page with a revised
                “Last updated” date. Material changes may also be communicated
                through the website, email or account notification where
                appropriate.
              </p>
            </PolicySection>

            {/* 19 */}

            <PolicySection title="19. Governing Law">
              <p>
                This Privacy Policy is governed by the applicable laws of India.
                Subject to applicable consumer-protection and other mandatory
                laws, disputes shall be subject to the jurisdiction of the
                competent courts in Uttar Pradesh, India.
              </p>
            </PolicySection>

            {/* 20 */}

            <PolicySection title="20. Contact Us">
              <p>
                For questions, privacy requests, corrections or complaints,
                contact:
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <a
                  href="mailto:ajeetpratapsingh0786@gmail.com"
                  className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-red-200 hover:bg-red-50"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-700 text-white">
                    <FaEnvelope />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-500">Email</p>
                    <p className="mt-1 break-all font-black text-gray-900">
                      ajeetpratapsingh0786@gmail.com
                    </p>
                  </div>
                </a>

                <a
                  href="tel:+918756610386"
                  className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-red-200 hover:bg-red-50"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-700 text-white">
                    <FaPhoneAlt />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-500">Phone</p>
                    <p className="mt-1 font-black text-gray-900">
                      +91 87566 10386
                    </p>
                  </div>
                </a>
              </div>

              <div className="mt-5 rounded-2xl border border-gray-200 p-5">
                <p className="font-black">Postal Address</p>

                <p className="mt-2 leading-7 text-gray-600">
                  Ajeet Pratap Singh
                  <br />
                  The Aspire Nation
                  <br />
                  Allahganj, Shahjahanpur
                  <br />
                  Uttar Pradesh, India
                </p>
              </div>
            </PolicySection>
          </div>
        </article>

        {/* Bottom navigation */}

        <div className="mt-8 flex flex-col justify-between gap-4 rounded-2xl bg-gray-950 px-6 py-6 text-white sm:flex-row sm:items-center">
          <div>
            <p className="font-black">The Aspire Nation</p>
            <p className="mt-1 text-sm text-gray-400">
              Every Aspirant&apos;s Morning Starts Here.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm font-bold">
            <Link href="/about" className="hover:text-red-400">
              About
            </Link>

            <Link href="/contact" className="hover:text-red-400">
              Contact
            </Link>

            <Link href="/" className="hover:text-red-400">
              Homepage
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function PolicySection({ title, children }) {
  return (
    <section>
      <h2 className="text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
        {title}
      </h2>

      <div className="mt-4 leading-8 text-gray-700">{children}</div>
    </section>
  );
}

function PolicyList({ items }) {
  return (
    <ul className="mt-5 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-red-700" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}