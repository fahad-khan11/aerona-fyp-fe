import type { ApiFilterState, FilterState, LoadingState } from "@/types/hotels";
import type { HotelAPI } from "@/types/hotels";
import axios from "axios";
import mapHotelToAPI from "@/components/hotels/mapHotelToAPI";
import { GetHotels, GetHotelsPublic } from "@/lib/api";

// Loads search state from sessionStorage
export function loadSearchFromSession(setSearch: (s: any) => void) {
  const searchResults = sessionStorage.getItem("searchResults");
  if (searchResults) {
    try {
      const parsed = JSON.parse(searchResults);
      if (parsed && parsed.search) {
        setSearch(parsed.search);
      }
    } catch (e) {
      // ignore
    }
  }
}

// Loads initial hotel data from sessionStorage and API
export async function loadInitialData(
setLoading: (cb: (prev: LoadingState) => LoadingState) => void, setError: (err: string | null) => void, setSearch: (s: any) => void, setSelectedCity: (c: any) => void, setCityCoords: (coords: { lat: number; lng: number; }) => void, setHotelOffers: (hotels: HotelAPI[]) => void, setApiFilters: (filters: ApiFilterState) => void, setHotels: (hotels: any[]) => void, setBasePriceRange: (range: [number, number]) => void, setFilters: (cb: (prev: FilterState) => FilterState) => void, city: string, checkin: string, checkout: string, selectedCurrency: string) {
  setLoading((prev) => ({ ...prev, initial: true }));
  setError(null);
  try {
    const searchResults = sessionStorage.getItem("searchResults");
    if (!searchResults) throw new Error("No hotel data found in session storage.");
    
    const parsed = JSON.parse(searchResults);
    console.log("Parsed search results:", parsed.search);
    
    // Set search and city info
    setSearch(parsed.search);
    setSelectedCity(parsed.selectedCity);
    
    // Set city coordinates if available
    if (parsed.selectedCity?.latitude && parsed.selectedCity?.longitude) {
      setCityCoords({ lat: parsed.selectedCity.latitude, lng: parsed.selectedCity.longitude });
    }
    
    // Calculate number of days for pricing
    const checkInDate = new Date(parsed.search?.checkIn || checkin);
    const checkOutDate = new Date(parsed.search?.checkOut || checkout);
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const numberOfDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // ── Agoda hotels (may be empty if API quota exceeded or city not found on Agoda) ──
    const agodaHotels = Array.isArray(parsed.hotels) ? parsed.hotels : [];
    
    if (agodaHotels.length > 0) {
      console.log(`Mapping ${agodaHotels.length} Agoda hotels with ${numberOfDays} days stay`);
      const mappedHotels: HotelAPI[] = agodaHotels
        .map((hotel: any) => mapHotelToAPI(hotel, numberOfDays))
        .filter((hotel: HotelAPI | undefined) => hotel !== undefined);
      setHotelOffers(mappedHotels);

      const prices = mappedHotels
        .map((h) => h.property.priceBreakdown?.grossPrice?.value || 0)
        .filter((p) => p > 0);
      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        setBasePriceRange([minPrice, maxPrice]);
        setFilters((prev) => ({ ...prev, priceRange: [minPrice, maxPrice] }));
      }
    } else {
      console.warn("No Agoda hotels in session — only DB hotels will be shown.");
      setHotelOffers([]);
    }

    if (parsed.filters) {
      setApiFilters(parsed.filters);
    }

    // ── Always fetch our own DB hotels for the searched city ──
    try {
      const ourHotels = await GetHotelsPublic(city);
      setHotels(Array.isArray(ourHotels) ? ourHotels : []);
    } catch (error) {
      console.error("Error fetching local hotels:", error);
      setHotels([]);
    }

  } catch (err: any) {
    // If session is broken, still try to load our DB hotels so page isn't blank
    try {
      const ourHotels = await GetHotelsPublic(city);
      setHotels(Array.isArray(ourHotels) ? ourHotels : []);
      setHotelOffers([]);
    } catch (_) {
      setError("No hotels found for this search criteria.");
    }
  } finally {
    setLoading((prev) => ({ ...prev, initial: false }));
  }
}

// Other handlers (handleApiFilterSelect, handleApiFilterCheckbox, clearFilters, updateFilter, loadMoreHotels) can be added here as needed.
