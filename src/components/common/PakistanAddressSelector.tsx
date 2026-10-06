import React, { useMemo } from "react";
import {
  getProvinces,
  getDivisionsByProvince,
  getDistrictsByDivision,
  getTehsilsByDistrict,
} from "@/src/data/pakistanAdministrativeData";
import { AlertCircle, MapPin, Globe } from "lucide-react";

interface PakistanAddressSelectorProps {
  country?: string;
  province: string;
  division?: string;
  district?: string;
  tehsil?: string;
  onProvinceChange: (province: string) => void;
  onDivisionChange: (division: string) => void;
  onDistrictChange: (district: string) => void;
  onTehsilChange: (tehsil: string) => void;
  errors?: {
    province?: string;
    division?: string;
    district?: string;
    tehsil?: string;
  };
  disabled?: boolean;
}

export const PakistanAddressSelector: React.FC<PakistanAddressSelectorProps> = ({
  country = "Pakistan",
  province,
  division = "",
  district = "",
  tehsil = "",
  onProvinceChange,
  onDivisionChange,
  onDistrictChange,
  onTehsilChange,
  errors = {},
  disabled = false,
}) => {
  const provinces = useMemo(() => getProvinces(), []);

  const divisions = useMemo(() => {
    if (!province) return [];
    return getDivisionsByProvince(province);
  }, [province]);

  const districts = useMemo(() => {
    if (!province || !division) return [];
    return getDistrictsByDivision(province, division);
  }, [province, division]);

  const tehsils = useMemo(() => {
    if (!province || !division || !district) return [];
    return getTehsilsByDistrict(province, division, district);
  }, [province, division, district]);

  // Handle Province change with cascading reset
  const handleProvinceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvince = e.target.value;
    onProvinceChange(newProvince);
    onDivisionChange("");
    onDistrictChange("");
    onTehsilChange("");
  };

  // Handle Division change with cascading reset
  const handleDivisionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDivision = e.target.value;
    onDivisionChange(newDivision);
    onDistrictChange("");
    onTehsilChange("");
  };

  // Handle District change with cascading reset
  const handleDistrictSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistrict = e.target.value;
    onDistrictChange(newDistrict);
    onTehsilChange("");
  };

  // Handle Tehsil change
  const handleTehsilSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onTehsilChange(e.target.value);
  };

  return (
    <div className="space-y-4">
      {/* Country Row */}
      <div>
        <label className="text-xs font-semibold text-stone-700 block mb-1">
          Country / Destination *
        </label>
        <div className="relative">
          <input
            type="text"
            readOnly
            value="Pakistan"
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100/70 text-xs sm:text-sm text-stone-800 font-medium cursor-not-allowed select-none"
          />
          <Globe className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Nationwide Delivery
          </span>
        </div>
      </div>

      {/* 4-Tier Hierarchy Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Tier 1: Province / Region */}
        <div>
          <label className="text-xs font-semibold text-stone-700 block mb-1">
            Province / Region *
          </label>
          <select
            value={province}
            onChange={handleProvinceSelect}
            disabled={disabled}
            className={`w-full px-3 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-all ${
              errors.province
                ? "border-rose-500 bg-rose-50/50"
                : "border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
            } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <option value="">— Select Province/Region —</option>
            {provinces.map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </select>
          {errors.province && (
            <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.province}</span>
            </p>
          )}
        </div>

        {/* Tier 2: Division */}
        <div>
          <label className="text-xs font-semibold text-stone-700 block mb-1">
            Division *
          </label>
          <select
            value={division}
            onChange={handleDivisionSelect}
            disabled={disabled || !province || divisions.length === 0}
            className={`w-full px-3 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-all ${
              errors.division
                ? "border-rose-500 bg-rose-50/50"
                : "border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
            } ${(!province || disabled) ? "opacity-60 cursor-not-allowed bg-stone-100" : ""}`}
          >
            <option value="">
              {!province
                ? "— Select Province first —"
                : divisions.length === 1
                ? `— ${divisions[0]} —`
                : "— Select Division —"}
            </option>
            {divisions.map((div) => (
              <option key={div} value={div}>
                {div}
              </option>
            ))}
          </select>
          {errors.division && (
            <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.division}</span>
            </p>
          )}
        </div>

        {/* Tier 3: District */}
        <div>
          <label className="text-xs font-semibold text-stone-700 block mb-1">
            District *
          </label>
          <select
            value={district}
            onChange={handleDistrictSelect}
            disabled={disabled || !division || districts.length === 0}
            className={`w-full px-3 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-all ${
              errors.district
                ? "border-rose-500 bg-rose-50/50"
                : "border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
            } ${(!division || disabled) ? "opacity-60 cursor-not-allowed bg-stone-100" : ""}`}
          >
            <option value="">
              {!division
                ? "— Select Division first —"
                : "— Select District —"}
            </option>
            {districts.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
          {errors.district && (
            <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.district}</span>
            </p>
          )}
        </div>

        {/* Tier 4: Tehsil / Taluka / Sub-Division */}
        <div>
          <label className="text-xs font-semibold text-stone-700 block mb-1">
            Tehsil / Taluka / Sub-Division *
          </label>
          <select
            value={tehsil}
            onChange={handleTehsilSelect}
            disabled={disabled || !district || tehsils.length === 0}
            className={`w-full px-3 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-all ${
              errors.tehsil
                ? "border-rose-500 bg-rose-50/50"
                : "border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
            } ${(!district || disabled) ? "opacity-60 cursor-not-allowed bg-stone-100" : ""}`}
          >
            <option value="">
              {!district
                ? "— Select District first —"
                : "— Select Tehsil / Taluka —"}
            </option>
            {tehsils.map((teh) => (
              <option key={teh} value={teh}>
                {teh}
              </option>
            ))}
          </select>
          {errors.tehsil && (
            <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.tehsil}</span>
            </p>
          )}
        </div>
      </div>

      {/* Selected Route Breadcrumb Preview */}
      {province && division && district && (
        <div className="flex items-center gap-1.5 text-[11px] text-stone-500 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200/60 overflow-x-auto">
          <MapPin className="w-3 h-3 text-stone-700 shrink-0" />
          <span className="font-semibold text-stone-700">Selected Hub:</span>
          <span>{province}</span>
          <span>›</span>
          <span>{division}</span>
          <span>›</span>
          <span className="font-semibold text-stone-800">{district}</span>
          {tehsil && (
            <>
              <span>›</span>
              <span className="font-bold text-stone-950">{tehsil}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
