import { extractMediaPreviews, resolveMediaUrl } from '@/utils/mediaUrls';

function isDirectImageUrl(url) {
    return /\.(jpe?g|png|gif|webp|avif)(\?|#|$)/i.test(String(url || ''));
}

function buildGalleryItems(addItem, sources = []) {
    const seen = new Set();
    const items = [];

    const push = (preview) => {
        const url = resolveMediaUrl(preview?.url || preview?.thumbnail || '');
        const thumbnail = resolveMediaUrl(preview?.thumbnail || preview?.url || '');
        if (!thumbnail || seen.has(url)) return;

        seen.add(url);
        items.push({
            url,
            thumbnail,
            type: preview.type,
            label: preview.label,
        });
    };

    sources.forEach((source) => source(push));

    return items;
}

export function buildUnitGalleryItems(unit = {}) {
    return buildGalleryItems((addItem) => {
        (unit.asset_images || []).forEach((url) => {
            addItem({
                type: 'image',
                url,
                thumbnail: url,
            });
        });

        const hasAssetPhotos = (unit.asset_images || []).length > 0;

        extractMediaPreviews(unit.images_videos_link || '').forEach((preview) => {
            if (hasAssetPhotos && preview.type !== 'video') return;
            addItem(preview);
        });

        if (!hasAssetPhotos && unit.image && isDirectImageUrl(unit.image)) {
            addItem({
                type: 'image',
                url: unit.image,
                thumbnail: unit.image,
            });
        }
    });
}

export function buildBuildingGalleryItems(building = {}) {
    return buildGalleryItems((addItem) => {
        extractMediaPreviews(building.images_videos_link || '').forEach(addItem);

        if (building.image && isDirectImageUrl(building.image)) {
            addItem({
                type: 'image',
                url: building.image,
                thumbnail: building.image,
            });
        }
    });
}

export function buildListingGalleryItems(kind, listing = {}) {
    if (kind === 'building') {
        return buildBuildingGalleryItems(listing);
    }

    return buildUnitGalleryItems(listing);
}
