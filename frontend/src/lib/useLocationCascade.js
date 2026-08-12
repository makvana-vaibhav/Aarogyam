import { useEffect, useRef, useState } from "react";

// Shared country -> state -> city cascading-select logic, used by Register and the
// patient/doctor profile edit forms. `api` is the role-specific lookup client
// (AarogyamAuth / PatientAPI / DoctorAPI — each exposes countries()/states()/cities()).
//
// `initial` is optional and may arrive asynchronously (e.g. once a profile fetch
// resolves) — the moment it first becomes truthy, the state/city selects are
// preloaded and pre-selected to match it.
export function useLocationCascade(api, initial) {
  const [countries, setCountries] = useState([]);
  const [countriesFailed, setCountriesFailed] = useState(false);
  const [states, setStates] = useState([]);
  const [statesLoading, setStatesLoading] = useState(false);
  const [statesFailed, setStatesFailed] = useState(false);
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [citiesFailed, setCitiesFailed] = useState(false);

  const [countryId, setCountryIdRaw] = useState("");
  const [stateId, setStateIdRaw] = useState("");
  const [cityId, setCityId] = useState("");

  const appliedPresetRef = useRef(false);

  useEffect(() => {
    api.countries()
      .then((rows) => setCountries(rows))
      .catch(() => setCountriesFailed(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyPreset(preset) {
    setCountryIdRaw(preset.countryId ? String(preset.countryId) : "");
    setStateIdRaw(preset.stateId ? String(preset.stateId) : "");
    setCityId(preset.cityId ? String(preset.cityId) : "");
    setCities([]);
    setStates([]);
    if (preset.countryId) {
      setStatesLoading(true);
      api.states(preset.countryId)
        .then((rows) => {
          setStates(rows);
          if (preset.stateId) {
            setCitiesLoading(true);
            api.cities(preset.stateId)
              .then((cityRows) => setCities(cityRows))
              .catch(() => setCitiesFailed(true))
              .finally(() => setCitiesLoading(false));
          }
        })
        .catch(() => setStatesFailed(true))
        .finally(() => setStatesLoading(false));
    }
  }

  useEffect(() => {
    if (!initial || appliedPresetRef.current) return;
    appliedPresetRef.current = true;
    applyPreset(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  function resetToInitial() {
    if (initial) applyPreset(initial);
  }

  function setCountryId(value) {
    setCountryIdRaw(value);
    setStateIdRaw("");
    setCityId("");
    setCities([]);
    setStatesFailed(false);
    if (!value) {
      setStates([]);
      return;
    }
    setStatesLoading(true);
    api.states(value)
      .then((rows) => setStates(rows))
      .catch(() => setStatesFailed(true))
      .finally(() => setStatesLoading(false));
  }

  function setStateId(value) {
    setStateIdRaw(value);
    setCityId("");
    setCitiesFailed(false);
    if (!value) {
      setCities([]);
      return;
    }
    setCitiesLoading(true);
    api.cities(value)
      .then((rows) => setCities(rows))
      .catch(() => setCitiesFailed(true))
      .finally(() => setCitiesLoading(false));
  }

  return {
    countries, countriesFailed,
    states, statesLoading, statesFailed,
    cities, citiesLoading, citiesFailed,
    countryId, stateId, cityId,
    setCountryId, setStateId, setCityId,
    resetToInitial
  };
}
