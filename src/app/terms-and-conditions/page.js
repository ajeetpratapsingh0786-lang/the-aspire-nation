import Link from "next/link";
import Header from "@/components/Header";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaEnvelope,
  FaFileContract,
  FaPhoneAlt,
} from "react-icons/fa";

export const metadata = {
  title: "Terms and Conditions",
  description:
    "Terms and Conditions governing the use of The Aspire Nation website, digital newspaper, premium subscription and educational content.",
  alternates: {
    canonical: "/terms-and-conditions",
  },
};

const lastUpdated = "14 July 2026";

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Header />

      {/* Page heading */}

      <section className="border-b border-red-100 bg-gradient-to-br from-white via-red-50 to-gray-100">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-red-700 transition hover:text-red-800"
          >
            <FaArrowLeft />
            Return to Homepage
          </Link>

          <div className="mt-8 flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-red-700 text-2xl text-white shadow-lg">
              <FaFileContract />
            </div>

            <div>
              <p className="font-black uppercase tracking-[0.18em] text-red-700">
                Legal Information
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
                Terms and Conditions
              </h1>

              <p className="mt-3 text-gray-600">
                Last updated: {lastUpdated}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
        <article className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10 lg:p-12">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="leading-7 text-gray-700">
              These Terms and Conditions govern your access to and use of The
              Aspire Nation website, digital newspaper, premium subscription,
              current affairs, editorial analysis, quizzes and other
              educational services. By using our website or purchasing a
              subscription, you agree to these Terms and Conditions.
            </p>
          </div>

          <div className="mt-10 space-y-12">
            <PolicySection title="1. About The Aspire Nation">
              <p>
                The Aspire Nation is a digital newspaper and preparation
                platform operated by Ajeet Pratap Singh. It provides
                exam-focused current affairs, digital e-paper editions,
                editorial analysis, quizzes, educational resources and related
                content for competitive examination aspirants.
              </p>

              <div className="mt-5 rounded-2xl bg-gray-50 p-5">
                <p>
                  <strong>Owner:</strong> Ajeet Pratap Singh
                </p>

                <p className="mt-2">
                  <strong>Address:</strong> Allahganj, Shahjahanpur, Uttar
                  Pradesh, India
                </p>

                <p className="mt-2">
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:contact@theaspirenation.com"
                    className="font-bold text-red-700 hover:underline"
                  >
                    contact@theaspirenation.com
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

                <p className="mt-2">
                  <strong>Website:</strong>{" "}
                  <a
                    href="https://theaspirenation.com"
                    className="font-bold text-red-700 hover:underline"
                  >
                    https://theaspirenation.com
                  </a>
                </p>
              </div>
            </PolicySection>

            <PolicySection title="2. Acceptance of These Terms">
              <p>
                By accessing, browsing, registering, subscribing, making a
                payment or otherwise using The Aspire Nation, you confirm that
                you have read, understood and agreed to these Terms and
                Conditions.
              </p>

              <p className="mt-4">
                If you do not agree with these terms, you should not create an
                account, purchase a subscription or use our premium services.
              </p>
            </PolicySection>

            <PolicySection title="3. Eligibility">
              <p>
                You must be legally capable of entering into a binding agreement
                under applicable Indian law.
              </p>

              <p className="mt-4">
                Users below 18 years of age should use the service only with the
                knowledge and supervision of a parent or lawful guardian. A
                parent or guardian should make or authorise any subscription
                payment made on behalf of a minor.
              </p>
            </PolicySection>

            <PolicySection title="4. Account Registration">
              <p>
                Certain services require you to create an account. When
                registering, you agree to provide accurate, current and complete
                information.
              </p>

              <PolicyList
                items={[
                  "You are responsible for maintaining the confidentiality of your password.",
                  "You must not share, sell, transfer or allow another person to misuse your account.",
                  "You are responsible for activity performed through your account unless you promptly report unauthorised use.",
                  "You must keep your email address and other account information updated.",
                  "We may request verification where necessary for security, payment or support purposes.",
                ]}
              />
            </PolicySection>

            <PolicySection title="5. Description of Services">
              <p>The Aspire Nation may provide:</p>

              <PolicyList
                items={[
                  "Daily digital e-paper editions.",
                  "Current affairs articles and summaries.",
                  "Editorial analysis.",
                  "Revision material and preparation resources.",
                  "Practice quizzes and multiple-choice questions.",
                  "Government job and examination updates.",
                  "Results, admit-card and official-notification links.",
                  "Premium archives and previously published editions.",
                  "Other educational content introduced from time to time.",
                ]}
              />

              <p className="mt-5">
                The availability, format, frequency and scope of any feature may
                change as the platform develops.
              </p>
            </PolicySection>

            <PolicySection title="6. Free and Premium Content">
              <p>
                Some content may be available without payment, while other
                content is restricted to users with an active premium
                subscription.
              </p>

              <p className="mt-4">
                Free users may receive access to previews, headlines, selected
                pages or limited resources. Premium access may include the full
                e-paper, complete current affairs, editorials, archives,
                quizzes and other benefits described on the subscription page.
              </p>
            </PolicySection>

            <PolicySection title="7. Subscription Plan">
              <p>
                The current premium plan is offered at:
              </p>

              <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-6">
                <p className="text-sm font-black uppercase tracking-widest text-red-700">
                  Monthly Premium Membership
                </p>

                <p className="mt-2 text-4xl font-black text-gray-950">
                  ₹99
                  <span className="ml-2 text-lg font-bold text-gray-500">
                    per month
                  </span>
                </p>
              </div>

              <p className="mt-5">
                Prices, plans and included benefits may be revised in the
                future. Any revised price will apply prospectively and will be
                displayed before purchase.
              </p>
            </PolicySection>

            <PolicySection title="8. Subscription Activation">
              <p>
                Premium access is activated after successful payment
                confirmation and verification by our payment system.
              </p>

              <p className="mt-4">
                Activation may be delayed where a payment is pending,
                unsuccessful, disputed, reversed or not correctly reported by
                the payment provider.
              </p>

              <p className="mt-4">
                If payment is deducted but access is not activated, contact us
                with the payment reference and registered email address.
              </p>
            </PolicySection>

            <PolicySection title="9. Subscription Duration and Expiry">
              <p>
                A monthly subscription remains active for the period displayed
                at purchase or recorded in your account after successful
                payment.
              </p>

              <p className="mt-4">
                Access automatically expires at the end of the subscription
                period unless the subscription is renewed or a recurring
                payment arrangement has been separately enabled.
              </p>
            </PolicySection>

            <PolicySection title="10. Payments">
              <p>
                Payments may be processed through Razorpay or another authorised
                payment provider.
              </p>

              <PolicyList
                items={[
                  "You agree to provide accurate billing and payment information.",
                  "You authorise the payment provider to process the selected amount.",
                  "Payment availability may depend on cards, UPI, net banking, wallets or other supported methods.",
                  "We do not control banking failures, payment-provider downtime or payment-method restrictions.",
                  "Taxes or statutory charges may be applied where required by law.",
                ]}
              />
            </PolicySection>

            <PolicySection title="11. Refunds and Cancellations">
              <p>
                Because our services provide immediate access to digital
                content, subscription fees are generally non-refundable once
                premium access has been granted.
              </p>

              <p className="mt-4">
                Exceptions may be considered for duplicate payments, proven
                erroneous charges, payments made without activation of access,
                or where a refund is required by applicable law.
              </p>

              <p className="mt-4">
                Complete details are available in our{" "}
                <Link
                  href="/refund-policy"
                  className="font-bold text-red-700 hover:underline"
                >
                  Refund and Cancellation Policy
                </Link>
                .
              </p>
            </PolicySection>

            <PolicySection title="12. Digital Content Access">
              <p>
                Premium content is licensed for personal, non-commercial use by
                the subscriber whose account was used to purchase access.
              </p>

              <PolicyList
                items={[
                  "You must not share your account with multiple users.",
                  "You must not copy, reproduce or redistribute full e-paper editions.",
                  "You must not upload premium content to social media, messaging groups, websites or file-sharing platforms.",
                  "You must not resell, sublicense or commercially exploit our content.",
                  "You must not attempt to bypass access controls, signed links or subscription checks.",
                ]}
              />
            </PolicySection>

            <PolicySection title="13. Intellectual Property Rights">
              <p>
                Unless otherwise stated, the website design, branding, logo,
                written material, layout, graphics, compilations, quizzes,
                summaries, editorial content and digital newspaper editions are
                owned by or licensed to The Aspire Nation.
              </p>

              <p className="mt-4">
                These materials are protected by applicable intellectual
                property laws. No ownership rights are transferred to users by
                registration or subscription.
              </p>
            </PolicySection>

            <PolicySection title="14. Limited Personal Use">
              <p>
                You may read and use the content for your personal examination
                preparation.
              </p>

              <p className="mt-4">
                Small portions may be quoted for genuine educational,
                discussion or review purposes where lawful, provided suitable
                attribution is given and the use does not substitute for the
                original paid content.
              </p>
            </PolicySection>

            <PolicySection title="15. Prohibited Conduct">
              <p>You must not:</p>

              <PolicyList
                items={[
                  "Use the website for illegal, fraudulent or harmful activity.",
                  "Attempt to gain unauthorised access to accounts, servers, databases or administrative pages.",
                  "Use automated tools to scrape, copy or download large quantities of content.",
                  "Interfere with website security, performance or availability.",
                  "Submit malicious code, viruses, scripts or harmful files.",
                  "Misrepresent your identity or impersonate another person.",
                  "Use stolen payment information or perform fraudulent transactions.",
                  "Harass, threaten or abuse staff, users or contributors.",
                  "Reproduce premium content for coaching, commercial classes or resale without written permission.",
                ]}
              />
            </PolicySection>

            <PolicySection title="16. Government Jobs, Results and Official Links">
              <p>
                Job, examination, admit-card, result and recruitment information
                may be summarised from official notifications or other public
                sources.
              </p>

              <p className="mt-4">
                Users must verify eligibility, deadlines, fees, instructions
                and final details on the relevant official website before
                applying or taking action.
              </p>

              <p className="mt-4">
                The Aspire Nation is not responsible for changes, cancellations,
                errors or delays made by examination authorities, government
                departments or third-party portals.
              </p>
            </PolicySection>

            <PolicySection title="17. Educational Purpose and No Guarantee">
              <p>
                Our content is intended to support preparation and general
                educational understanding. It does not guarantee selection,
                employment, examination success, rank, marks or any particular
                result.
              </p>

              <p className="mt-4">
                Individual outcomes depend on preparation, effort, examination
                conditions and many factors outside our control.
              </p>
            </PolicySection>

            <PolicySection title="18. Accuracy of Information">
              <p>
                We make reasonable efforts to provide useful and accurate
                content. However, current affairs, examination dates, policies,
                official notifications and other information may change.
              </p>

              <p className="mt-4">
                We do not guarantee that every item will always be complete,
                current or free from typographical or factual error. Material
                errors may be corrected when identified.
              </p>
            </PolicySection>

            <PolicySection title="19. Third-Party Websites">
              <p>
                The website may contain links to government portals,
                examination authorities, payment services, news sources and
                other third-party websites.
              </p>

              <p className="mt-4">
                We do not control or endorse every third-party website and are
                not responsible for its availability, content, security,
                policies or transactions.
              </p>
            </PolicySection>

            <PolicySection title="20. Service Availability">
              <p>
                We aim to maintain reliable access, but services may be
                interrupted because of:
              </p>

              <PolicyList
                items={[
                  "Maintenance or updates.",
                  "Hosting, database or payment-provider issues.",
                  "Internet, telecommunications or electricity failures.",
                  "Cybersecurity incidents.",
                  "Government orders or legal requirements.",
                  "Events beyond reasonable control.",
                ]}
              />

              <p className="mt-5">
                Temporary unavailability does not automatically create a right
                to compensation or refund unless required by law.
              </p>
            </PolicySection>

            <PolicySection title="21. Suspension or Termination of Accounts">
              <p>
                We may restrict, suspend or terminate access where we reasonably
                believe that:
              </p>

              <PolicyList
                items={[
                  "An account is being shared or misused.",
                  "Payment fraud or unauthorised activity has occurred.",
                  "Premium content is being copied or redistributed.",
                  "The user has violated these Terms and Conditions.",
                  "Suspension is required to protect users, the platform or legal rights.",
                ]}
              />

              <p className="mt-5">
                Serious violations may result in immediate termination without
                refund, subject to applicable law.
              </p>
            </PolicySection>

            <PolicySection title="22. User Support">
              <p>
                Users may contact us for account, payment, subscription or
                content-related support.
              </p>

              <p className="mt-4">
                We aim to respond within a reasonable period but do not
                guarantee an immediate response at all times.
              </p>
            </PolicySection>

            <PolicySection title="23. Privacy">
              <p>
                Our collection and use of personal information is described in
                our{" "}
                <Link
                  href="/privacy-policy"
                  className="font-bold text-red-700 hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>

              <p className="mt-4">
                By using the website, you acknowledge that your information may
                be processed as described in that policy.
              </p>
            </PolicySection>

            <PolicySection title="24. Limitation of Liability">
              <p>
                To the maximum extent permitted by applicable law, The Aspire
                Nation and its owner, contributors and service providers shall
                not be liable for indirect, incidental, consequential or
                special losses arising from use of or inability to use the
                website.
              </p>

              <p className="mt-4">
                This includes losses relating to examination outcomes, missed
                deadlines, third-party websites, device problems, unauthorised
                account access or service interruption.
              </p>

              <p className="mt-4">
                Nothing in these terms excludes liability that cannot lawfully
                be excluded.
              </p>
            </PolicySection>

            <PolicySection title="25. Indemnity">
              <p>
                You agree to be responsible for losses, claims or expenses
                arising from your unlawful use of the platform, violation of
                these terms, infringement of intellectual property rights or
                misuse of another person’s account or payment method.
              </p>
            </PolicySection>

            <PolicySection title="26. Changes to Services">
              <p>
                We may add, modify, replace or discontinue features, plans,
                content formats or services.
              </p>

              <p className="mt-4">
                Where practical, material changes affecting active subscribers
                may be communicated through the website, email or account
                notification.
              </p>
            </PolicySection>

            <PolicySection title="27. Changes to These Terms">
              <p>
                We may update these Terms and Conditions to reflect changes in
                law, technology, pricing, services or business practices.
              </p>

              <p className="mt-4">
                The revised terms will be posted on this page with an updated
                date. Continued use after publication of revised terms
                constitutes acceptance of those terms.
              </p>
            </PolicySection>

            <PolicySection title="28. Severability">
              <p>
                If any provision of these terms is held invalid or
                unenforceable, the remaining provisions shall continue to
                apply to the extent permitted by law.
              </p>
            </PolicySection>

            <PolicySection title="29. No Waiver">
              <p>
                Failure to enforce any right or provision does not waive that
                right or prevent future enforcement.
              </p>
            </PolicySection>

            <PolicySection title="30. Governing Law and Jurisdiction">
              <p>
                These Terms and Conditions are governed by the applicable laws
                of India.
              </p>

              <p className="mt-4">
                Subject to applicable consumer-protection and other mandatory
                laws, disputes shall fall under the jurisdiction of the
                competent courts in Uttar Pradesh, India.
              </p>
            </PolicySection>

            <PolicySection title="31. Contact Information">
              <p>
                For questions concerning these Terms and Conditions, contact:
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <a
                  href="mailto:contact@theaspirenation.com"
                  className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-red-200 hover:bg-red-50"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-700 text-white">
                    <FaEnvelope />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-500">Email</p>
                    <p className="mt-1 break-all font-black text-gray-900">
                      contact@theaspirenation.com
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

          <div className="mt-12 rounded-2xl border border-green-100 bg-green-50 p-6">
            <div className="flex items-start gap-4">
              <FaCheckCircle className="mt-1 shrink-0 text-xl text-green-700" />

              <div>
                <h2 className="text-xl font-black text-gray-950">
                  Agreement Confirmation
                </h2>

                <p className="mt-2 leading-7 text-gray-700">
                  By continuing to use The Aspire Nation, creating an account or
                  purchasing a subscription, you confirm your acceptance of
                  these Terms and Conditions.
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Bottom links */}

        <div className="mt-8 flex flex-col justify-between gap-4 rounded-2xl bg-gray-950 px-6 py-6 text-white sm:flex-row sm:items-center">
          <div>
            <p className="font-black">The Aspire Nation</p>
            <p className="mt-1 text-sm text-gray-400">
              Every Aspirant&apos;s Morning Starts Here.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm font-bold">
            <Link href="/privacy-policy" className="hover:text-red-400">
              Privacy Policy
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