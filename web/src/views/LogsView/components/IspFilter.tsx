import React, { useState, useMemo, useRef } from "react";
import {
  PopoverNext,
  Button,
  Menu,
  MenuItem,
  MenuDivider,
  Intent,
  InputGroup,
  Spinner,
} from "@blueprintjs/core";
import { Network } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getProfileAnalytics } from "../../../services";
import type { TimeRange } from "../types";

export interface IspFilterProps {
  profileId: string;
  range: TimeRange;
  customRange: { start: string; end: string };
  destCountryFilter: string | null;
  accessPointIdFilter: string | null;
  ispFilter: string | null;
  setIspFilter: (val: string | null) => void;
  isMobile: boolean;
}

export const IspFilter: React.FC<IspFilterProps> = ({
  profileId,
  range,
  customRange,
  destCountryFilter,
  accessPointIdFilter,
  ispFilter,
  setIspFilter,
  isMobile,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isps, setIsps] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const lastFetchedKeyRef = useRef<string>("");

  // Fingerprint for the current filter criteria
  const startTs = customRange.start ? Math.floor(new Date(customRange.start).getTime() / 1000) : "";
  const endTs = customRange.end ? Math.floor(new Date(customRange.end).getTime() / 1000) : "";
  const currentParamKey = `${profileId}:${range}:${startTs}:${endTs}:${destCountryFilter || ""}:${accessPointIdFilter || ""}`;

  // Lazy-fetch ISPs using the exact active time range and filters
  const fetchIsps = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (range === "custom" && customRange.start && customRange.end) {
        const s = Math.floor(new Date(customRange.start).getTime() / 1000);
        const e = Math.floor(new Date(customRange.end).getTime() / 1000);
        params.set("range", "custom");
        params.set("start", String(s));
        params.set("end", String(e));
      } else {
        params.set("range", range);
      }

      if (destCountryFilter) {
        params.set("country_code", destCountryFilter);
      }

      if (accessPointIdFilter) {
        params.set("access_point_id", accessPointIdFilter);
      }

      const data = await getProfileAnalytics(profileId, "isps", params.toString());
      if (Array.isArray(data)) {
        setIsps(data);
      } else {
        setIsps([]);
      }
      lastFetchedKeyRef.current = currentParamKey;
    } catch (err) {
      console.error("Failed to fetch ISPs for filter", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInteraction = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    if (nextOpen) {
      // Lazy load only when opening and filters have changed or not yet fetched
      if (lastFetchedKeyRef.current !== currentParamKey) {
        fetchIsps();
      }
    } else {
      setSearch("");
    }
  };

  // Static frontend filter over fetched ISPs
  const filteredIsps = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return isps;
    return isps.filter((item) => item.name.toLowerCase().includes(q));
  }, [isps, search]);

  const ispMenu = (
    <div className="w-72 flex flex-col p-1.5">
      <div className="pb-1.5">
        <InputGroup
          leftIcon="search"
          placeholder={t("logs.searchIsp", "Search ISP...")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          small
          autoFocus
          rightElement={
            search ? (
              <Button icon="cross" variant="minimal" small onClick={() => setSearch("")} />
            ) : undefined
          }
        />
      </div>
      <Menu className="max-h-64 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-6 text-gray-500 gap-2">
            <Spinner size={16} />
            <span className="text-xs">{t("logs.loadingIsps", "Loading ISPs...")}</span>
          </div>
        ) : (
          <>
            {!search && (
              <>
                <MenuItem
                  icon={ispFilter === null ? "tick" : undefined}
                  text={t("logs.allIsp")}
                  onClick={() => {
                    setIspFilter(null);
                    setIsOpen(false);
                  }}
                />
                <MenuDivider />
              </>
            )}
            {filteredIsps.length === 0 ? (
              <MenuItem disabled text={t("logs.noMatchingIsps", "No matching ISPs found")} />
            ) : (
              filteredIsps.map((isp) => (
                <MenuItem
                  key={isp.name}
                  icon={ispFilter === isp.name ? "tick" : undefined}
                  text={
                    <span className="flex items-center justify-between gap-2 w-full">
                      <span className="truncate" title={isp.name}>
                        {isp.name}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0 font-mono">
                        {isp.count.toLocaleString()}
                      </span>
                    </span>
                  }
                  onClick={() => {
                    setIspFilter(isp.name);
                    setIsOpen(false);
                  }}
                />
              ))
            )}
          </>
        )}
      </Menu>
    </div>
  );

  const selectedIspName = ispFilter || t("logs.allIsp");

  return (
    <PopoverNext
      content={ispMenu}
      placement="bottom-start"
      isOpen={isOpen}
      onInteraction={handleInteraction}
    >
      <Button
        icon={<Network size={14} />}
        rightIcon="caret-down"
        intent={ispFilter ? Intent.PRIMARY : Intent.NONE}
        text={selectedIspName}
        variant="outlined"
        fill={isMobile}
      />
    </PopoverNext>
  );
};
