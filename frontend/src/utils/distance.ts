export function getDistanceMeters(
    target_lat: number,
    target_lng: number,
    current_lat: number,
    current_lng: number
) {
    const R = 6371000; // earth radius (m)
    const toRad = (d: number) => (d * Math.PI) / 180;

    const dLat = toRad(current_lat - target_lat);
    const dLng = toRad(current_lng - target_lng);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(target_lat)) *
        Math.cos(toRad(current_lat)) *
        Math.sin(dLng / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
