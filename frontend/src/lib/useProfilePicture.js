import { useEffect, useRef, useState } from "react";

// Shared by PatientLayout/DoctorLayout/AvatarMenu and the Profile pages/health card.
// Profile photos aren't served as a plain static URL (same as license/degree docs and
// the health-card QR) — they're fetched through an authenticated blob endpoint and
// turned into an object URL, mirroring useHealthCard.js's loadQrImage pattern.
//
// fetchPicture: PatientAPI.profilePicture / DoctorAPI.profilePicture (returns { blob }).
// profile: the current profile object; only fetches when profile.profilePicturePath is set.
export function useProfilePicture(fetchPicture, profile) {
  const [pictureUrl, setPictureUrl] = useState(null);
  const urlRef = useRef(null);
  const hasPicture = !!(profile && profile.profilePicturePath);

  useEffect(() => {
    let cancelled = false;

    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setPictureUrl(null);

    if (!hasPicture) return undefined;

    fetchPicture()
      .then((result) => {
        if (cancelled) return;
        const url = URL.createObjectURL(result.blob);
        urlRef.current = url;
        setPictureUrl(url);
      })
      .catch(() => {
        if (!cancelled) setPictureUrl(null);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPicture, hasPicture]);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  return pictureUrl;
}
