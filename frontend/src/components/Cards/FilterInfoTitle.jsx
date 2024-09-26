import moment from "moment";
import React from "react";
import { MdOutlineClose } from "react-icons/md";

const FilterInfoTitle = ({ filterType, filterDates, onClear }) => {
  const DateRangeChip = ({ from, to }) => {
    const startDate = from ? moment(from).format("Do MMM YYYY") : "N/A";
    const endDate = to ? moment(to).format("Do MMM YYYY") : "N/A";
    
    return (
      <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded">
        <p className="text-xs font-medium">
          {startDate} - {endDate}
        </p>
        <button onClick={onClear} aria-label="Clear date filter">
          <MdOutlineClose />
        </button>
      </div>
    );
  };

  return (
    filterType && (
      <div className="mb-5">
        {filterType === "search" ? (
          <h3 className="text-lg font-medium">Search Results</h3>
        ) : (
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">Travel Stories from</h3>
            <DateRangeChip from={filterDates?.from} to={filterDates?.to} />
          </div>
        )}
      </div>
    )
  );
};

export default FilterInfoTitle;
