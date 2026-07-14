import api from '@/plugins/axios';
import { CONTACT_INFO } from '@/config/homeContent';

let cachedContactInfo = null;
let loadPromise = null;

export function mapCompanyProfileToContact(profile = {}) {
    return {
        company_name: profile.company_name || '',
        tagline: profile.tagline || '',
        address: profile.address || CONTACT_INFO.address,
        phone: profile.phone || CONTACT_INFO.phone,
        email: profile.email || CONTACT_INFO.email,
        hours: profile.business_hours || profile.hours || CONTACT_INFO.hours,
        whatsapp: profile.whatsapp || '',
        city: profile.city || '',
        facebook_url: profile.facebook_url || '',
        messenger_url: profile.messenger_url || '',
        instagram_url: profile.instagram_url || '',
        website_url: profile.website_url || '',
        maps_url: profile.maps_url || '',
        legal_name: profile.legal_name || '',
        privacy_email: profile.privacy_email || '',
    };
}

export async function loadCompanyContactInfo() {
    if (cachedContactInfo) {
        return cachedContactInfo;
    }

    if (!loadPromise) {
        loadPromise = api
            .get('/company-profile')
            .then((res) => {
                cachedContactInfo = mapCompanyProfileToContact(res.data || {});
                return cachedContactInfo;
            })
            .catch((err) => {
                console.error('Failed to load company profile:', err);
                cachedContactInfo = { ...CONTACT_INFO };
                return cachedContactInfo;
            });
    }

    return loadPromise;
}
