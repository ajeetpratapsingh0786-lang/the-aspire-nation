import Link from "next/link";
import Header from "@/components/Header";
import {
  FaArrowLeft,
  FaEnvelope,
  FaPhoneAlt,
  FaReceipt,
  FaUndoAlt,
} from "react-icons/fa";

export const metadata = {
  title: "Refund and Cancellation Policy",
  description:
    "Refund and Cancellation Policy for The Aspire Nation premium digital subscription and e-paper services.",
  alternates: {
    canonical: "/refund-policy",
  },
};

const lastUpdated = "14 July 2026";

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Header />

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
              <FaUndoAlt />
            </div>

            <div>
              <p className="font-black uppercase tracking-[0.18em] text-red-700">
                Legal Information
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
                Refund and Cancellation Policy
              </h1>

              <p className="mt-3 text-gray-600">
                Last updated: {lastUpdated}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
        <article className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10 lg:p-12">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="leading-7 text-gray-700">
              This Refund and Cancellation Policy explains the circumstances
              under which subscription payments made to The Aspire Nation may
              be cancelled, refunded or reviewed.
            </p>
          </div>

          <div className="mt-10 space-y-12">
            <PolicySection title="1. About Our Digital Subscription">
              <p>
                The Aspire Nation provides digital educational services,
                including premium e-paper editions, current affairs, editorial
                analysis, quizzes, archives and preparation resources.
              </p>

              <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <p>
                  <strong>Subscription Plan:</strong> ₹99 per month
                </p>

                <p className="mt-2">
                  <strong>Service Type:</strong> Digital subscription with
                  online access
                </p>

                <p className="mt-2">
                  <strong>Delivery:</strong> Access is provided electronically
                  through the user&apos;s registered account
                </p>
              </div>
            </PolicySection>

            <PolicySection title="2. General No-Refund Rule">
              <p>
                Because The Aspire Nation provides immediate access to digital
                content and premium services, subscription payments are
                generally non-refundable once premium access has been
                successfully activated.
              </p>

              <p className="mt-4">
                By completing a payment, you acknowledge that digital access
                may begin immediately and that the subscription fee will
                ordinarily not be refunded merely because:
              </p>

              <PolicyList
                items={[
                  "You changed your mind after purchasing.",
                  "You did not use the subscription.",
                  "You forgot to access the website during the subscription period.",
                  "You no longer require the service.",
                  "You did not achieve a desired examination result.",
                  "You misunderstood the nature of the digital content despite the subscription benefits being displayed.",
                  "You experienced an issue caused by your device, browser, internet connection or login credentials.",
                ]}
              />
            </PolicySection>

            <PolicySection title="3. Situations Where a Refund May Be Considered">
              <p>
                A refund request may be considered in limited circumstances,
                including:
              </p>

              <PolicyList
                items={[
                  "The same transaction was charged more than once.",
                  "Payment was successfully deducted but premium access was never activated.",
                  "An incorrect amount was charged due to a verified technical error.",
                  "A payment was made without authorisation and the claim is supported by appropriate evidence.",
                  "A refund is required under applicable law.",
                  "The Aspire Nation is unable to provide the purchased digital service for a substantial period because of an issue under our control.",
                ]}
              />

              <p className="mt-5">
                Every request is reviewed individually. Submission of a request
                does not guarantee that a refund will be approved.
              </p>
            </PolicySection>

            <PolicySection title="4. Duplicate Payments">
              <p>
                If you are charged more than once for the same subscription,
                contact us with the transaction details.
              </p>

              <p className="mt-4">
                After verification, the duplicate amount may be refunded to the
                original payment method, while one valid subscription payment
                may be retained.
              </p>
            </PolicySection>

            <PolicySection title="5. Payment Deducted but Access Not Activated">
              <p>
                If payment is deducted but premium access is not activated,
                first:
              </p>

              <PolicyList
                items={[
                  "Refresh the website and log in again.",
                  "Confirm that you are using the same email address used during payment.",
                  "Wait briefly in case the payment provider has not yet completed confirmation.",
                  "Check whether the payment status is pending, failed or successful.",
                ]}
              />

              <p className="mt-5">
                If access is still unavailable, contact us with the payment
                details. We may either activate the subscription after
                verification or issue a refund where activation is not
                possible.
              </p>
            </PolicySection>

            <PolicySection title="6. Failed or Pending Payments">
              <p>
                A payment marked as failed or pending is controlled by the
                payment provider and the user&apos;s bank or payment service.
              </p>

              <p className="mt-4">
                If money is debited for a failed or pending payment, it may be
                automatically reversed by the bank or payment provider. The
                reversal time depends on the payment method and financial
                institution.
              </p>

              <p className="mt-4">
                We cannot issue a refund for money that has not been received or
                successfully captured by us.
              </p>
            </PolicySection>

            <PolicySection title="7. Cancellation of Subscription">
              <p>
                The current ₹99 monthly plan provides access for the applicable
                subscription period.
              </p>

              <p className="mt-4">
                If the subscription is not configured for automatic recurring
                renewal, no cancellation request is required. Access will
                automatically expire at the end of the paid period unless the
                user purchases another subscription.
              </p>

              <p className="mt-4">
                Cancelling access before the expiry date does not create a right
                to a partial or prorated refund.
              </p>
            </PolicySection>

            <PolicySection title="8. Recurring Payments">
              <p>
                If automatic renewal or recurring billing is introduced in the
                future, users will be informed during purchase.
              </p>

              <p className="mt-4">
                Users will be responsible for cancelling a recurring
                authorisation before the next billing date through the method
                made available by The Aspire Nation, Razorpay or the relevant
                bank.
              </p>

              <p className="mt-4">
                A renewal already processed may remain non-refundable once the
                renewed digital access has been activated, except in the
                limited circumstances described in this policy.
              </p>
            </PolicySection>

            <PolicySection title="9. How to Request a Refund">
              <p>Refund requests must be sent to:</p>

              <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-5">
                <a
                  href="mailto:contact@theaspirenation.com"
                  className="font-black text-red-700 hover:underline"
                >
                  contact@theaspirenation.com
                </a>
              </div>

              <p className="mt-5">Your request should include:</p>

              <PolicyList
                items={[
                  "Your full name.",
                  "Your registered email address.",
                  "Your phone number.",
                  "Razorpay payment ID or transaction reference.",
                  "Order ID, if available.",
                  "Payment date and amount.",
                  "The reason for requesting a refund.",
                  "A screenshot or supporting evidence, where relevant.",
                ]}
              />

              <p className="mt-5">
                Incomplete information may delay the review of your request.
              </p>
            </PolicySection>

            <PolicySection title="10. Time Limit for Refund Requests">
              <p>
                A refund request should ordinarily be submitted within seven
                calendar days of the relevant transaction.
              </p>

              <p className="mt-4">
                Requests received after this period may still be reviewed where
                required by law or where exceptional circumstances are
                established.
              </p>
            </PolicySection>

            <PolicySection title="11. Review Process">
              <p>After receiving a complete request, we may:</p>

              <PolicyList
                items={[
                  "Verify the user account and subscription status.",
                  "Check the transaction in Razorpay and our database.",
                  "Request additional information.",
                  "Confirm whether premium access was activated or used.",
                  "Investigate possible duplicate, erroneous or unauthorised charges.",
                ]}
              />

              <p className="mt-5">
                We aim to provide an initial response within a reasonable
                period, generally within five to seven business days.
              </p>
            </PolicySection>

            <PolicySection title="12. Approved Refunds">
              <p>
                If a refund is approved, it will normally be processed through
                the original payment method used for the transaction.
              </p>

              <p className="mt-4">
                We may not be able to refund an amount to a different bank
                account, card, wallet or UPI address.
              </p>
            </PolicySection>

            <PolicySection title="13. Refund Processing Time">
              <p>
                After a refund is initiated, the time required for the amount
                to appear depends on Razorpay, the user&apos;s bank and the
                selected payment method.
              </p>

              <p className="mt-4">
                Processing may take approximately five to ten business days,
                although some banks or payment methods may require more time.
              </p>

              <p className="mt-4">
                Once a refund has been successfully initiated, delays caused by
                the bank or payment provider are outside our direct control.
              </p>
            </PolicySection>

            <PolicySection title="14. Partial Refunds">
              <p>
                Partial or prorated refunds are generally not provided for
                unused days in an active monthly subscription.
              </p>

              <p className="mt-4">
                A partial refund may be considered only where required by law or
                where we determine that exceptional circumstances justify it.
              </p>
            </PolicySection>

            <PolicySection title="15. Promotional Prices and Discounted Plans">
              <p>
                Payments made under a promotional, discounted or special-price
                offer remain subject to this Refund and Cancellation Policy.
              </p>

              <p className="mt-4">
                The difference between a promotional price and the regular
                price is not refundable.
              </p>
            </PolicySection>

            <PolicySection title="16. Account Suspension or Termination">
              <p>
                No refund will ordinarily be provided where access is suspended
                or terminated because of:
              </p>

              <PolicyList
                items={[
                  "Account sharing.",
                  "Unauthorised redistribution of premium content.",
                  "Fraudulent or disputed payment activity.",
                  "Attempted circumvention of access controls.",
                  "Violation of our Terms and Conditions.",
                  "Illegal or abusive use of the website.",
                ]}
              />

              <p className="mt-5">
                This does not affect any rights that cannot legally be excluded.
              </p>
            </PolicySection>

            <PolicySection title="17. Chargebacks and Payment Disputes">
              <p>
                Before raising a chargeback or payment dispute with your bank,
                please contact us so we can investigate and attempt to resolve
                the matter.
              </p>

              <p className="mt-4">
                Fraudulent or abusive chargebacks may result in suspension of
                the associated account and submission of transaction evidence
                to the payment provider or financial institution.
              </p>
            </PolicySection>

            <PolicySection title="18. Third-Party Payment Provider">
              <p>
                Payments and refunds may be processed through Razorpay or
                another authorised provider.
              </p>

              <p className="mt-4">
                The provider may apply its own processing rules, security checks
                and timelines. Users may also be required to cooperate with
                requests from the payment provider or bank.
              </p>
            </PolicySection>

            <PolicySection title="19. Service Interruptions">
              <p>
                Temporary interruptions caused by maintenance, internet
                connectivity, third-party hosting, database services, payment
                providers or circumstances beyond reasonable control do not
                automatically qualify for a refund.
              </p>

              <p className="mt-4">
                Where a substantial interruption caused by The Aspire Nation
                materially prevents access, we may offer an access extension,
                account credit or refund at our discretion and subject to law.
              </p>
            </PolicySection>

            <PolicySection title="20. Changes to This Policy">
              <p>
                We may update this Refund and Cancellation Policy to reflect
                changes in our services, payment arrangements or applicable
                law.
              </p>

              <p className="mt-4">
                The revised policy will be published on this page with an
                updated date. The policy in effect on the transaction date will
                generally apply to that purchase.
              </p>
            </PolicySection>

            <PolicySection title="21. Governing Law">
              <p>
                This policy is governed by the applicable laws of India.
              </p>

              <p className="mt-4">
                Subject to mandatory consumer-protection provisions, disputes
                shall be subject to the jurisdiction of the competent courts in
                Uttar Pradesh, India.
              </p>
            </PolicySection>

            <PolicySection title="22. Contact Information">
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
                <p className="font-black">Business Address</p>

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

          <div className="mt-12 rounded-2xl border border-amber-100 bg-amber-50 p-6">
            <div className="flex items-start gap-4">
              <FaReceipt className="mt-1 shrink-0 text-xl text-amber-700" />

              <div>
                <h2 className="text-xl font-black text-gray-950">
                  Keep Your Payment Details
                </h2>

                <p className="mt-2 leading-7 text-gray-700">
                  Please retain your payment confirmation, Razorpay payment ID
                  and registered email address. These details help us review
                  payment and refund requests quickly.
                </p>
              </div>
            </div>
          </div>
        </article>

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

            <Link
              href="/terms-and-conditions"
              className="hover:text-red-400"
            >
              Terms & Conditions
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