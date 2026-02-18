import { Geolocation } from '@capacitor/geolocation';

export async function getCurrentLocation() {
    const perm = await Geolocation.requestPermissions();
    console.log("perm: ", perm);

    if (perm.location !== 'granted') {
        throw new Error("위치 권한 필요");
    }

    const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,   // GPS 위성 사용
        timeout: 40000,
        maximumAge: 5000
    });

    return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
    };
}
