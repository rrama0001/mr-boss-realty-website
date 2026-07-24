import popularPlacesCebuImage from '@/assets/images/popular-places-cebu.jpg';
import popularPlacesIloiloImage from '@/assets/images/popular-places-iloilo.jpg';
import popularPlacesDavaoImage from '@/assets/images/popular-places-davao.jpg';
import popularPlacesMakatiImage from '@/assets/images/popular-places-makati.jpg';

export const PROPERTY_TYPES = [
    'All Types',
    'Condominium',
    'Apartment',
    'House & Lot',
    'Townhouse',
    'Commercial',
];

export const LOCATIONS = [
    'All Locations',
    'Metro Manila',
    'Cebu',
    'Davao',
    'Clark',
    'Baguio',
];

export const FEATURED_PROPERTIES = [
    {
        id: 1,
        title: 'Luxury Condo in BGC',
        location: 'Taguig, Metro Manila',
        price: 12500000,
        status: 'For Sale',
        beds: 2,
        baths: 2,
        garages: 1,
        sqft: 86,
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    },
    {
        id: 2,
        title: 'Villa House in Cebu',
        location: 'Cebu City',
        price: 45000,
        status: 'For Rent',
        beds: 4,
        baths: 3,
        garages: 2,
        sqft: 220,
        image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    },
    {
        id: 3,
        title: 'Family Home in Quezon City',
        location: 'Quezon City',
        price: 8900000,
        status: 'For Sale',
        beds: 3,
        baths: 2,
        garages: 1,
        sqft: 120,
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
    },
    {
        id: 4,
        title: 'Studio Unit in Makati',
        location: 'Makati City',
        price: 28000,
        status: 'For Rent',
        beds: 1,
        baths: 1,
        garages: 0,
        sqft: 32,
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    },
    {
        id: 5,
        title: 'Premium Suite in Ortigas',
        location: 'Pasig City',
        price: 15200000,
        status: 'For Sale',
        beds: 3,
        baths: 2,
        garages: 1,
        sqft: 98,
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    },
    {
        id: 6,
        title: 'Townhouse in Alabang',
        location: 'Muntinlupa City',
        price: 52000,
        status: 'For Rent',
        beds: 3,
        baths: 3,
        garages: 2,
        sqft: 145,
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    },
];

export const WHY_CHOOSE_US = [
    {
        icon: 'ti ti-building-community',
        iconTone: 'orange',
        title: 'Wide Range of Properties',
        description: 'Browse condominiums, houses, commercial spaces, and more from trusted developers across the Philippines.',
    },
    {
        icon: 'ti ti-shield-check',
        iconTone: 'green',
        title: 'Trusted by Thousands',
        description: 'Mr. Boss Realty helps buyers and renters find the right property with transparent guidance at every step.',
    },
    {
        icon: 'ti ti-cash-banknote',
        iconTone: 'cyan',
        title: 'Financing Made Easy',
        description: 'We connect you with flexible payment terms, bank partners, and reservation options that fit your budget.',
    },
    {
        icon: 'ti ti-headset',
        iconTone: 'blue',
        title: 'We Are Here for You',
        description: 'Our team is ready to assist with site visits, documentation, and property inquiries near you.',
    },
];

export const AI_ASSISTANT_NOTICE = {
    eyebrow: 'How it works',
    title: 'AI that knows our listings—not generic guesses.',
    lead: 'Mr. Boss AI draws from our property database—including details that may not appear on public listing pages—and answers in plain language. Ask about locations, prices, rent terms, or what fits your budget.',
    points: [
        {
            icon: 'ti ti-search',
            title: 'Search in your words',
            text: 'Ask in English, Filipino, Cebuano, or any language you prefer. Describe what you want—a studio in Cebu, a family home under ₱8M, pet-friendly rent—and get matching options fast.',
        },
        {
            icon: 'ti ti-list-details',
            title: 'Property data beyond the public site',
            text: 'Unit sizes, rates, payment terms, project notes, and related property info come from our database—not the open web—and can include details not shown on every public page.',
        },
        {
            icon: 'ti ti-headset',
            title: 'Real agents back you up',
            text: 'When you are ready to view, reserve, or sign, our team confirms everything and handles the paperwork.',
        },
    ],
    disclaimer: 'AI replies are helpful starting points. Final pricing, availability, and terms are always verified by a Mr. Boss Realty agent.',
    ctaLabel: 'Try the AI assistant',
};

export const AI_GUIDE_NUDGE = {
    message: 'I can help you find the right property.',
    linkLabel: 'Learn how I work',
};

export const POPULAR_PLACES = [
    {
        id: 1,
        name: 'Makati City',
        city: 'Makati City',
        cities: ['Makati City', 'Makati'],
        image: popularPlacesMakatiImage,
    },
    {
        id: 2,
        name: 'Cebu City',
        city: 'Cebu City',
        cities: ['Cebu City', 'Cebu'],
        image: popularPlacesCebuImage,
    },
    {
        id: 3,
        name: 'Iloilo City',
        city: 'Iloilo City',
        cities: ['Iloilo City', 'Iloilo'],
        image: popularPlacesIloiloImage,
    },
    {
        id: 4,
        name: 'Davao City',
        city: 'Davao City',
        cities: ['Davao City', 'Davao'],
        image: popularPlacesDavaoImage,
    },
];

/** Fallback contact details. Live values come from GET /api/company-profile. */
export const CONTACT_INFO = {
    company_name: 'Mr. Boss Realty',
    tagline: 'The smarter way to find condos, houses, and rentals—anywhere, anytime.',
    address: 'Cebu City, Philippines',
    phone: '+63 917 000 0000',
    email: 'hello@mrbossrealty.com',
    hours: '8:00 AM – 6:00 PM, Mon–Sat',
};

export const CONTACT_PAGE = {
    heroEyebrow: 'Mr. Boss Realty',
    heroTitle: 'Let’s find your next property',
    heroLead: 'Whether you’re buying, renting, or just exploring—our team and AI assistant are ready to help you move forward with confidence.',
    heroHighlights: [
        { icon: 'ti ti-clock-bolt', label: 'Replies within 24 hours' },
        { icon: 'ti ti-map-pin', label: 'Site visits nationwide' },
        { icon: 'ti ti-sparkles', label: 'AI assistant available 24/7' },
    ],
    contactChannels: [
        {
            key: 'phone',
            label: 'Call us',
            icon: 'ti ti-phone',
            hint: 'Mon–Sat during business hours',
            link: 'phone',
        },
        {
            key: 'email',
            label: 'Email',
            icon: 'ti ti-mail',
            hint: 'We reply within one business day',
            link: 'email',
        },
        {
            key: 'office',
            label: 'Office',
            icon: 'ti ti-map-pin',
            hint: 'Philippines-wide property coverage',
            link: null,
        },
        {
            key: 'hours',
            label: 'Business Hours',
            icon: 'ti ti-clock',
            hint: 'AI assistant available anytime',
            link: null,
        },
    ],
    formTitle: 'Send us a message',
    formLead: 'Tell us what you’re looking for and we’ll get back to you with options that fit.',
    inquiryTopics: [
        'General inquiry',
        'Schedule a viewing',
        'Buy a property',
        'Rent a property',
        'Financing & payment terms',
        'Partnership / developer',
    ],
    asideTitle: 'Prefer a direct line?',
    asideLead: 'Reach us during business hours or browse listings while you wait—we keep things simple and transparent.',
    processTitle: 'What happens next',
    processLead: 'From first message to keys in hand, here’s how we typically work with clients.',
    processSteps: [
        {
            icon: 'ti ti-message-2',
            iconTone: 'blue',
            title: 'We hear you out',
            description: 'Share your budget, location, and timeline. Our team reviews your message and matches you with relevant listings.',
        },
        {
            icon: 'ti ti-calendar-event',
            iconTone: 'orange',
            title: 'We schedule a visit',
            description: 'Pick a time for a site visit or virtual tour. We confirm availability and prepare the property details you need.',
        },
        {
            icon: 'ti ti-home-check',
            iconTone: 'green',
            title: 'We guide you through',
            description: 'From reservation to paperwork, we stay with you—answering questions and connecting you with the right next steps.',
        },
    ],
    faqIds: ['viewing', 'reservation', 'financing', 'contact'],
};

export const HOMEPAGE_FAQS = [
    {
        id: 'ai-assistant',
        question: 'How does the AI assistant work on this site?',
        answer: 'Mr. Boss AI uses our property database to answer your questions in chat—including details that may not appear on public listing pages, such as unit info, rent rates, and payment terms. You can ask in English, Filipino, Cebuano, or other languages. It is available 24/7 in the search bar at the top of the page. For viewings, reservations, and contracts, a real agent confirms the details before anything is finalized.',
    },
    {
        id: 'viewing',
        question: 'How do I schedule a property viewing?',
        answer: 'Browse listings on our website and use the Interested button on any property, or send us a message through the contact form. Our team will confirm your schedule and arrange a site visit or virtual tour.',
    },
    {
        id: 'reservation',
        question: 'What do I need to reserve a unit?',
        answer: 'Requirements vary by developer and listing type. Typically you will need a valid ID, a signed reservation agreement, and the reservation fee shown on the unit details. We will guide you through the exact documents for your chosen property.',
    },
    {
        id: 'financing',
        question: 'Do you assist with financing or bank loans?',
        answer: 'Yes. We can walk you through developer payment terms, in-house financing options, and bank loan requirements so you can compare what fits your budget before you commit.',
    },
    {
        id: 'rent-terms',
        question: 'What rental terms are available?',
        answer: 'Some listings offer monthly, daily, or hourly rates depending on the property. Each rent listing shows the available rate on its detail page. Contact us if you need a custom lease term.',
    },
    {
        id: 'pets',
        question: 'Are pets allowed in rental units?',
        answer: 'Pet policies differ per property and unit. Check the listing details for pet rules, ask Mr. Boss AI which properties allow pets, or contact our team—we can shortlist options that match your requirements.',
    },
    {
        id: 'contact',
        question: 'I am interested in a property. How can I reach your agents?',
        answer: 'Use the contact form on this page, call us during business hours, or email us directly. One property recommendations and next steps.',
    },
];
