import { Geolocation } from '@capacitor/geolocation';

export async function getCurrentLocation() {
    const perm = await Geolocation.requestPermissions();

    if (perm.location !== 'granted') {
        throw new Error("위치 권한 필요");
    }

    const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true
    });

    return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
    };
}
