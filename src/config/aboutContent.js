/**
 * About Us page content.
 * Section bodies support HTML (e.g. <strong>, <em>, <a>, <p>, <ul>).
 * Contact details (phone, email, hours) are managed in Admin → Settings → Company Info.
 */
export const ABOUT_PAGE = {
    heroEyebrow: 'Mr. Boss Realty',
    heroTitle: 'About Us',
    heroLead:
        'We help buyers and renters find the right property across the Philippines—with clear information, honest guidance, and tools that make the search simpler.',

    intro: '',

    sections: [
        {
            id: 'about',
            title: 'About Mr. Boss Realty',
            content: `
                <p>At Mr. Boss Realty, we are bridging the gap between deep-rooted market expertise and the next generation of digital innovation. Founded five years ago by broker Mike Dalmacio, our firm was built on a legacy of trust and local market knowledge. Today, we are transforming that foundation into a high-performance, technology-driven experience that offers the smarter way to find your next property. Anywhere, anytime.</p>
            `,
        },
        {
            id: 'evolution',
            title: 'Our Evolution',
            content: `
                <p>The vision for a modern, AI-powered brokerage began one year ago. Inspired by the forward-thinking insights of Mr. A, who first introduced the transformative potential of artificial intelligence in our field, we set out to redefine the standard of service.</p>
                <p>Gerald Dawkins, our Marketing Strategist, spearheaded this shift. By moving us away from traditional sales models to a strategy centered on precision-driven AI solutions and compelling visual storytelling, Gerald has redefined how we present the property market. This technological evolution was solidified by the addition of Rei Yurama, whose expertise in software development and information systems powers our custom digital platforms, making the property market more accessible and efficient than ever before.</p>
            `,
        },
        {
            id: 'balance',
            title: 'The Perfect Balance: AI Efficiency & Human Connection',
            content: `
                <p>While we embrace the power of technology, we believe that real estate is fundamentally a people business. That is why we pair our advanced AI tools with a dedicated, accredited team of professionals who are ready to assist you personally.</p>
                <p>When you work with Mr. Boss Realty, you get the best of both worlds:</p>
                <ul>
                    <li><strong>The Power of AI:</strong> Our smart systems, led by our technical and creative team, work behind the scenes to provide data-driven insights, faster matching, and seamless digital workflows.</li>
                    <li><strong>The Personal Touch:</strong> Our accredited team provides the hands-on, human-centric support required to navigate every client’s unique journey. Whether it is a site visit or a complex negotiation, our experts are with you at every step.</li>
                </ul>
            `,
        },
        {
            id: 'promise',
            title: 'Our Promise',
            content: `
                <p>Mr. Boss Realty is not just keeping up with the market—we are setting the pace. We are committed to providing a smarter, faster, and more transparent real estate experience, backed by the human touch that makes a house feel like home.</p>
                <p>Welcome to Mr. Boss Realty.</p>
            `,
        },
    ],

    valuesTitle: 'What We Stand For',
    valuesLead: `At Mr. Boss Realty, our values define who we are and how we serve every client. We believe that real estate is more than buying or selling properties—it's about helping people make one of the most important decisions of their lives with confidence and peace of mind.`,
    values: [
        {
            icon: 'ti ti-heart-handshake',
            title: 'Client-first guidance',
            description: `We put your needs first by providing honest advice, personalized support, and trusted guidance every step of the way.`,
        },
        {
            icon: 'ti ti-eye-check',
            title: 'Transparent listings',
            description: `We provide accurate, up-to-date property information so you can make confident decisions with clarity and trust.`,
        },
        {
            icon: 'ti ti-users',
            title: 'People you can reach',
            description: `Our friendly team is always ready to answer your questions and provide personalized assistance whenever you need it.`
        },
    ],

    ctaTitle: 'Ready to explore?',
    ctaLead: 'Browse our listings or get in touch—we are here to help you find your next property.',
    ctaPrimaryLabel: 'View properties',
    ctaPrimaryTo: '/properties',
    ctaSecondaryLabel: 'Contact us',
    ctaSecondaryTo: '/contact',
};
