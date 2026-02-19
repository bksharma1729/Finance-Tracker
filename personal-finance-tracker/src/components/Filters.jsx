function Filters({
  searchText,
  onSearchTextChange,
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) {
  return (
    <div className="filters">
      <input
        type="text"
        placeholder="Search by title or category..."
        value={searchText}
        onChange={(e) => onSearchTextChange(e.target.value)}
      />

      <select
        value={typeFilter}
        onChange={(e) => onTypeFilterChange(e.target.value)}
      >
        <option value="all">All Types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>

      <input
        type="text"
        placeholder="Category (e.g. Food, Rent)"
        value={categoryFilter}
        onChange={(e) => onCategoryFilterChange(e.target.value)}
      />

      <div className="date-filters">
        <label>
          From
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

export default Filters;

