import React, { useState, useMemo } from "react";
import {
  PopoverNext,
  Button,
  Menu,
  MenuItem,
  MenuDivider,
  Intent,
  InputGroup,
} from "@blueprintjs/core";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getFlagEmoji } from "../../../utils/getFlagEmoji";
import { formatCountryName } from "../../../utils/formatCountryName";
import { ALL_COUNTRY_CODES } from "../../../utils/countries";

export interface DestCountryFilterProps {
  destCountryFilter: string | null;
  setDestCountryFilter: (val: string | null) => void;
  isMobile: boolean;
}

export const DestCountryFilter: React.FC<DestCountryFilterProps> = ({
  destCountryFilter,
  setDestCountryFilter,
  isMobile,
}) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Map each country code to its localized name and search text
  const countryList = useMemo(() => {
    const lang = i18n.language;
    return ALL_COUNTRY_CODES.map((code) => {
      const localized = formatCountryName(code, lang);
      const en = formatCountryName(code, "en");
      return {
        code,
        name: localized || en || code,
        searchStr: `${code} ${localized} ${en}`.toLowerCase(),
      };
    });
  }, [i18n.language]);

  // Filter countries by code or name
  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return countryList;
    return countryList.filter((c) => c.searchStr.includes(q));
  }, [countryList, search]);

  const countryMenu = (
    <div className="w-72 flex flex-col p-1.5">
      <div className="pb-1.5">
        <InputGroup
          leftIcon="search"
          placeholder={t("logs.searchCountry", "Search country...")}
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
        {!search && (
          <>
            <MenuItem
              icon={destCountryFilter === null ? "tick" : undefined}
              text={t("logs.allCountry")}
              onClick={() => {
                setDestCountryFilter(null);
                setIsOpen(false);
              }}
            />
            <MenuDivider />
          </>
        )}
        {filteredCountries.length === 0 ? (
          <MenuItem disabled text={t("logs.noMatchingCountries", "No matching countries found")} />
        ) : (
          filteredCountries.map((c) => (
            <MenuItem
              key={c.code}
              icon={destCountryFilter === c.code ? "tick" : undefined}
              text={
                <span className="flex items-center justify-between gap-2 w-full">
                  <span className="truncate">
                    {getFlagEmoji(c.code)} {c.name}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0 font-mono">
                    {c.code}
                  </span>
                </span>
              }
              onClick={() => {
                setDestCountryFilter(c.code);
                setIsOpen(false);
              }}
            />
          ))
        )}
      </Menu>
    </div>
  );

  const selectedCountryName = destCountryFilter
    ? `${getFlagEmoji(destCountryFilter)} ${formatCountryName(destCountryFilter, i18n.language) || destCountryFilter} (${destCountryFilter})`
    : t("logs.allCountry");

  return (
    <PopoverNext
      content={countryMenu}
      placement="bottom-start"
      isOpen={isOpen}
      onInteraction={(nextOpen) => {
        setIsOpen(nextOpen);
        if (!nextOpen) setSearch("");
      }}
    >
      <Button
        icon={<Globe size={14} />}
        rightIcon="caret-down"
        intent={destCountryFilter ? Intent.PRIMARY : Intent.NONE}
        text={selectedCountryName}
        variant="outlined"
        fill={isMobile}
      />
    </PopoverNext>
  );
};
