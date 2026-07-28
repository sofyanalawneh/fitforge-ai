interface WeekdayTabsProps {
  days: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

/** Tab row over the plan's actual trained days only — never a fabricated
 * fixed Mon-Sat strip, since the agent only ever produces 3/4/5 real days. */
export function WeekdayTabs({ days, selectedIndex, onSelect }: WeekdayTabsProps) {
  return (
    <div className="weekday-tabs" role="tablist" aria-label="Workout day">
      {days.map((day, index) => (
        <button
          key={`${day}-${index}`}
          type="button"
          role="tab"
          aria-selected={index === selectedIndex}
          className={`weekday-tab${index === selectedIndex ? " active" : ""}`}
          onClick={() => onSelect(index)}
        >
          {day.slice(0, 3).toUpperCase()}
        </button>
      ))}
    </div>
  );
}
