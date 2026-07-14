/**
 * Legal page content for Mr. Boss Realty.
 * Draft placeholder copy — review with legal counsel before publishing.
 * Paragraphs support HTML (e.g. <strong>, <a>, <p>).
 */
export const LEGAL_PAGES = {
    'privacy-policy': {
        slug: 'privacy-policy',
        heroEyebrow: 'Legal',
        title: 'Privacy Policy',
        heroLead: 'How we collect, use, store, and protect personal information on our website and services.',
        lastUpdated: 'July 2026',
        notice: '',
        intro: `
            <p>Mr. Boss Realty ("we," "us," or "our") respects your privacy and is committed to protecting personal data in accordance with the Philippine Data Privacy Act of 2012 (Republic Act No. 10173), its Implementing Rules and Regulations, and relevant issuances of the National Privacy Commission.</p>
            <p>This Privacy Policy explains what information we collect, why we collect it, how we use and share it, and the choices available to you when you use our website, AI assistant, contact forms, and related services.</p>
        `,
        sections: [
            {
                id: 'collect',
                title: 'Information we collect',
                paragraphs: [
                    '<p>We may collect the following categories of personal information when you use our website or contact us:</p>',
                ],
                list: [
                    'Identity and contact details (name, email address, phone number)',
                    'Inquiry details (property interest, budget, location preferences, messages you send)',
                    'Verification details when OTP is enabled (mobile number for one-time password verification)',
                    'Technical data (IP address, browser type, device information, pages visited, session identifiers)',
                    'Cookies and similar technologies as described in our Cookie Policy',
                ],
            },
            {
                id: 'use',
                title: 'How we use your information',
                paragraphs: [
                    '<p>We use personal information for legitimate business purposes, including:</p>',
                ],
                list: [
                    'Responding to property inquiries and scheduling viewings',
                    'Providing AI-assisted property information and follow-up communication',
                    'Improving website performance, security, and user experience',
                    'Sending updates about listings or services where you have given consent',
                    'Complying with legal, regulatory, and contractual obligations',
                ],
            },
            {
                id: 'share',
                title: 'How we share information',
                paragraphs: [
                    '<p>We do not sell your personal data. We may share information only when necessary, such as with property developers or owners for legitimate inquiry follow-up, service providers that help us operate the website (hosting, analytics, SMS/email delivery), or authorities when required by law.</p>',
                    '<p>All third parties are expected to handle personal data securely and only for the purposes we authorize.</p>',
                ],
            },
            {
                id: 'retention',
                title: 'Data retention and security',
                paragraphs: [
                    '<p>We retain personal information only for as long as needed to fulfill the purposes described in this policy, unless a longer retention period is required by law.</p>',
                    '<p>We implement reasonable administrative, technical, and organizational safeguards to protect personal data against unauthorized access, disclosure, alteration, or destruction.</p>',
                ],
            },
            {
                id: 'rights',
                title: 'Your rights',
                paragraphs: [
                    '<p>Subject to applicable law, you may have the right to access, correct, object to, or request deletion or blocking of your personal data, and to withdraw consent where processing is consent-based.</p>',
                    '<p>To exercise these rights or ask privacy-related questions, contact us using the details on our Contact page.</p>',
                ],
            },
            {
                id: 'changes',
                title: 'Changes to this policy',
                paragraphs: [
                    '<p>We may update this Privacy Policy from time to time. The "Last updated" date at the top of this page will reflect the latest revision. Continued use of the website after changes are posted constitutes acceptance of the updated policy.</p>',
                ],
            },
        ],
    },
    'terms-and-conditions': {
        slug: 'terms-and-conditions',
        heroEyebrow: 'Legal',
        title: 'Terms & Conditions',
        heroLead: 'Rules and conditions for using the Mr. Boss Realty website and services.',
        lastUpdated: 'July 2026',
        notice: 'This is draft placeholder content for review. Replace with your final Terms & Conditions before production use.',
        intro: `
            <p>These Terms & Conditions ("Terms") govern your access to and use of the Mr. Boss Realty website, AI assistant, listings, and related services. By using our website, you agree to these Terms.</p>
            <p>If you do not agree, please do not use the website.</p>
        `,
        sections: [
            {
                id: 'use',
                title: 'Use of the website',
                paragraphs: [
                    '<p>You may use this website for lawful personal or business property research and inquiries. You agree not to misuse the website, attempt unauthorized access, scrape content in violation of these Terms, or use the platform for fraudulent or harmful activity.</p>',
                ],
            },
            {
                id: 'ip',
                title: 'Intellectual property',
                paragraphs: [
                    '<p>Website design, branding, text, software, and original content are owned by or licensed to Mr. Boss Realty unless otherwise stated.</p>',
                    '<p>Property photos, logos, brochures, and developer materials belong to their respective owners and are displayed for informational purposes. You may not copy, reproduce, or redistribute website content without prior written permission.</p>',
                ],
            },
            {
                id: 'listings',
                title: 'Property information disclaimer',
                paragraphs: [
                    '<p>Listings, prices, availability, floor plans, promotions, and specifications are provided for reference and may change without notice. See our Property Listing Disclaimer for additional details.</p>',
                ],
            },
            {
                id: 'ai',
                title: 'AI assistant disclaimer',
                paragraphs: [
                    '<p>Our AI assistant provides automated responses based on available property data. AI output is for general information only and does not constitute legal, financial, or professional advice. See our AI Disclaimer for full details.</p>',
                ],
            },
            {
                id: 'liability',
                title: 'Limitation of liability',
                paragraphs: [
                    '<p>To the fullest extent permitted by law, Mr. Boss Realty is not liable for indirect, incidental, or consequential damages arising from use of the website, reliance on listing information, or third-party services linked from the site.</p>',
                    '<p>Nothing in these Terms limits rights that cannot be excluded under applicable Philippine law.</p>',
                ],
            },
            {
                id: 'links',
                title: 'Third-party links',
                paragraphs: [
                    '<p>Our website may link to developer websites, social media pages, or other third-party resources. We are not responsible for the content, privacy practices, or availability of external sites.</p>',
                ],
            },
            {
                id: 'law',
                title: 'Governing law',
                paragraphs: [
                    '<p>These Terms are governed by the laws of the Republic of the Philippines. Disputes shall be subject to the exclusive jurisdiction of the courts of the Philippines, unless otherwise required by mandatory law.</p>',
                ],
            },
        ],
    },
    'cookie-policy': {
        slug: 'cookie-policy',
        heroEyebrow: 'Legal',
        title: 'Cookie Policy',
        heroLead: 'How we use cookies and similar technologies on our website.',
        lastUpdated: 'July 2026',
        notice: '',
        intro: `
            <p>Cookies are small text files stored on your device when you visit a website. We use cookies and similar technologies to operate the site, remember preferences, understand usage, and improve performance.</p>
        `,
        sections: [
            {
                id: 'types',
                title: 'Types of cookies we use',
                paragraphs: [
                    '<p>Depending on how the website is configured, we may use the following categories of cookies:</p>',
                ],
                list: [
                    'Essential cookies — required for core site functions such as navigation and security',
                    'Session cookies — help maintain your browsing session and chat session state',
                    'Analytics cookies — help us understand traffic and usage patterns (e.g. Google Analytics, if enabled)',
                    'Preference cookies — remember settings you choose during your visit',
                ],
            },
            {
                id: 'manage',
                title: 'Managing cookies',
                paragraphs: [
                    '<p>Most browsers allow you to block or delete cookies through settings. Disabling essential cookies may affect website functionality, including AI chat session features.</p>',
                    '<p>Where required by law, we will request consent before placing non-essential cookies.</p>',
                ],
            },
            {
                id: 'third-party',
                title: 'Third-party cookies',
                paragraphs: [
                    '<p>Some cookies may be set by third-party services we use for analytics, embedded content, or communication tools. Those providers have their own privacy and cookie policies.</p>',
                ],
            },
        ],
    },
    'ai-disclaimer': {
        slug: 'ai-disclaimer',
        heroEyebrow: 'Legal',
        title: 'AI Disclaimer',
        heroLead: 'Important information about our AI property assistant.',
        lastUpdated: 'July 2026',
        notice: '',
        intro: `
            <p>Mr. Boss Realty uses artificial intelligence to help visitors explore listings and answer common property questions. Please read this disclaimer carefully before relying on AI-generated responses.</p>
        `,
        sections: [
            {
                id: 'purpose',
                title: 'Purpose of the AI assistant',
                paragraphs: [
                    '<p>The AI assistant is designed to help users search, compare, and understand property information more conveniently. It draws from available listing and project data in our system.</p>',
                ],
            },
            {
                id: 'limitations',
                title: 'Limitations',
                paragraphs: [
                    '<p>AI responses are generated automatically and may be incomplete, outdated, or incorrect. They should not replace professional advice from licensed brokers, developers, legal counsel, or financial advisers.</p>',
                ],
                list: [
                    'Prices, promotions, and availability may change without notice',
                    'Floor plans, finishes, and unit specifications may differ from actual units',
                    'Restricted details may require verification before disclosure',
                    'Final terms are confirmed only by Mr. Boss Realty, the developer, or the property owner',
                ],
            },
            {
                id: 'verification',
                title: 'Verification and human follow-up',
                paragraphs: [
                    '<p>For viewings, reservations, contracts, payment terms, and official confirmations, a Mr. Boss Realty representative or authorized developer contact should verify details before you make decisions.</p>',
                ],
            },
            {
                id: 'privacy',
                title: 'Chat data and verification',
                paragraphs: [
                    '<p>When you use the AI assistant or submit contact details, your information may be processed according to our Privacy Policy. Mobile OTP verification may be used to protect sensitive information and reduce automated abuse when that feature is enabled.</p>',
                ],
            },
        ],
    },
    'property-disclaimer': {
        slug: 'property-disclaimer',
        heroEyebrow: 'Legal',
        title: 'Property Listing Disclaimer',
        heroLead: 'Important notes about listings, pricing, images, and availability.',
        lastUpdated: 'July 2026',
        notice: '',
        intro: `
            <p>Property listings on Mr. Boss Realty are provided for general reference to help buyers and renters explore options. While we aim to keep information accurate and current, details may change at any time.</p>
        `,
        sections: [
            {
                id: 'pricing',
                title: 'Pricing and availability',
                paragraphs: [
                    '<p>Prices, rent rates, payment schemes, promotions, and unit availability are subject to change without prior notice and remain subject to developer or owner confirmation.</p>',
                    '<p>A listing marked as available may become reserved, sold, or leased before the website is updated.</p>',
                ],
            },
            {
                id: 'media',
                title: 'Images, floor plans, and specifications',
                paragraphs: [
                    '<p>Photos, renderings, videos, and floor plans may include artist impressions, show units, or representative layouts. Actual finishes, views, measurements, and configurations may differ.</p>',
                    '<p>Always verify unit details during a site visit or through an authorized representative before making a purchase or rental decision.</p>',
                ],
            },
            {
                id: 'third-party',
                title: 'Developer and third-party information',
                paragraphs: [
                    '<p>Some listing content originates from property developers, brokers, or owners. Mr. Boss Realty does not guarantee the accuracy of all third-party materials and is not responsible for changes made by external parties.</p>',
                ],
            },
            {
                id: 'reference',
                title: 'No offer or contract',
                paragraphs: [
                    '<p>Information on this website does not constitute a binding offer, reservation, or contract. Official documentation and confirmation from the relevant developer, owner, or authorized agent is required.</p>',
                ],
            },
        ],
    },
    'fair-housing': {
        slug: 'fair-housing',
        heroEyebrow: 'Legal',
        title: 'Fair Housing & Equal Opportunity',
        heroLead: 'Our commitment to fair and respectful treatment of all clients.',
        lastUpdated: 'July 2026',
        notice: '',
        intro: `
            <p>Mr. Boss Realty is committed to helping all qualified clients search for property in a professional, respectful, and non-discriminatory manner.</p>
        `,
        sections: [
            {
                id: 'commitment',
                title: 'Our commitment',
                paragraphs: [
                    '<p>We do not discriminate against any person on the basis of race, color, religion, sex, gender identity, national origin, disability, familial status, or other characteristic protected under applicable law.</p>',
                    '<p>Our team and digital services are intended to provide equal access to property information and inquiry support for all users.</p>',
                ],
            },
            {
                id: 'listings',
                title: 'Listing presentation',
                paragraphs: [
                    '<p>We present listings based on client preferences such as location, budget, property type, and size. We do not exclude properties or clients based on unlawful criteria.</p>',
                ],
            },
            {
                id: 'concerns',
                title: 'Questions or concerns',
                paragraphs: [
                    '<p>If you believe you have experienced unfair treatment in connection with our services, please contact us through our Contact page so we can review and address your concern promptly.</p>',
                ],
            },
        ],
    },
};
