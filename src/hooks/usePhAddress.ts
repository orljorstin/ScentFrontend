import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'https://psgc.gitlab.io/api';

export interface LocationData {
    code: string;
    name: string;
}

export function usePhAddress() {
    const [regions, setRegions] = useState<LocationData[]>([]);
    const [provinces, setProvinces] = useState<LocationData[]>([]);
    const [cities, setCities] = useState<LocationData[]>([]);
    const [barangays, setBarangays] = useState<LocationData[]>([]);

    const [loading, setLoading] = useState(false);

    // Fetch Regions on mount
    useEffect(() => {
        setLoading(true);
        fetch(`${API_BASE}/regions`)
            .then(res => res.json())
            .then(data => setRegions(data.sort((a: any, b: any) => a.name.localeCompare(b.name))))
            .catch(err => console.error("Failed to fetch regions", err))
            .finally(() => setLoading(false));
    }, []);

    const fetchProvinces = useCallback(async (regionCode: string) => {
        setLoading(true);
        setProvinces([]);
        setCities([]);
        setBarangays([]);
        try {
            // NCR (130000000) has no provinces, usually directs to districts/cities
            // But API behavior: /regions/130000000/provinces returns empty array
            // So we can try fetching provinces, if empty, it might be NCR-like.
            const res = await fetch(`${API_BASE}/regions/${regionCode}/provinces`);
            const data = await res.json();
            setProvinces(data.sort((a: any, b: any) => a.name.localeCompare(b.name)));
            return data;
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCities = useCallback(async (regionCode: string, provinceCode?: string) => {
        setLoading(true);
        setCities([]);
        setBarangays([]);
        try {
            let url = '';
            if (provinceCode) {
                url = `${API_BASE}/provinces/${provinceCode}/cities-municipalities`;
            } else {
                // If no province (e.g. NCR), fetch by region
                url = `${API_BASE}/regions/${regionCode}/cities-municipalities`;
            }
            const res = await fetch(url);
            const data = await res.json();
            setCities(data.sort((a: any, b: any) => a.name.localeCompare(b.name)));
            return data;
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchBarangays = useCallback(async (cityCode: string) => {
        setLoading(true);
        setBarangays([]);
        try {
            const res = await fetch(`${API_BASE}/cities-municipalities/${cityCode}/barangays`);
            const data = await res.json();
            setBarangays(data.sort((a: any, b: any) => a.name.localeCompare(b.name)));
            return data;
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        regions,
        provinces,
        cities,
        barangays,
        fetchProvinces,
        fetchCities,
        fetchBarangays,
        loading
    };
}
