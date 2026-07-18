import { extractMediaPreviews, resolveMediaUrl } from '@/utils/mediaUrls';

function isDirectImageUrl(url) {
    return /\.(jpe?g|png|gif|webp|avif)(\?|#|$)/i.test(String(url || ''));
}

function buildGalleryItems(sources = []) {
    const seen = new Set();
    const items = [];

    const addItem = (preview) => {
        const url = resolveMediaUrl(preview?.url || '');
        if (!url || seen.has(url)) return;

        seen.add(url);
        items.push({
            url,
            thumbnail: resolveMediaUrl(preview?.thumbnail || '') || null,
            type: preview.type || 'file',
            label: preview.label || 'Media',
            embedUrl: preview.embedUrl || null,
        });
    };

    sources.forEach((source) => source(addItem));

    return items;
}

export function buildUnitGalleryItems(unit = {}) {
    return buildGalleryItems([
        (addItem) => {
            (unit.asset_images || []).forEach((url) => {
                addItem({
                    type: 'image',
                    url,
                    thumbnail: url,
                    label: 'Photo',
                });
            });
        },
        (addItem) => {
            const hasAssetPhotos = (unit.asset_images || []).length > 0;

            extractMediaPreviews(unit.images_videos_link || '').forEach((preview) => {
                // Keep uploaded photos as the image set; still include videos/docs/files from links.
                if (hasAssetPhotos && preview.type === 'image') return;
                addItem(preview);
            });
        },
        (addItem) => {
            const hasAssetPhotos = (unit.asset_images || []).length > 0;
            if (!hasAssetPhotos && unit.image && isDirectImageUrl(unit.image)) {
                addItem({
                    type: 'image',
                    url: unit.image,
                    thumbnail: unit.image,
                    label: 'Photo',
                });
            }
        },
    ]);
}

export function buildBuildingGalleryItems(building = {}) {
    return buildGalleryItems([
        (addItem) => {
            extractMediaPreviews(building.images_videos_link || '').forEach(addItem);
        },
        (addItem) => {
            if (building.image && isDirectImageUrl(building.image)) {
                addItem({
                    type: 'image',
                    url: building.image,
                    thumbnail: building.image,
                    label: 'Photo',
                });
            }
        },
    ]);
}

export function buildListingGalleryItems(kind, listing = {}) {
    if (kind === 'building') {
        return buildBuildingGalleryItems(listing);
    }

    return buildUnitGalleryItems(listing);
}
