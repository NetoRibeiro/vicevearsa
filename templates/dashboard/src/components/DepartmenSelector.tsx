import { useDepartmenStore } from "@/store/useDepartmenStore";
import { DepartmenCard } from "./DepartmenCard";

export function DepartmenSelector() {
  const departmens = useDepartmenStore((s) => s.departmens);
  const activeStates = useDepartmenStore((s) => s.activeStates);
  const selectedDepartmen = useDepartmenStore((s) => s.selectedDepartmen);
  const selectDepartmen = useDepartmenStore((s) => s.selectDepartmen);

  // Sort: active departmens first, then alphabetical
  const departmenList = Array.from(departmens.values()).sort((a, b) => {
    const aActive = activeStates.has(a.code) ? 0 : 1;
    const bActive = activeStates.has(b.code) ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;
    return a.name.localeCompare(b.name);
  });

  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        height: "100%",
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 12px 8px",
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: "var(--text-secondary)",
        }}
      >
        Departmens
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {departmenList.length === 0 && (
          <div style={{ padding: "16px 12px", color: "var(--text-secondary)", fontSize: 12 }}>
            No departmens found
          </div>
        )}
        {departmenList.map((departmen) => (
          <DepartmenCard
            key={departmen.code}
            departmen={departmen}
            state={activeStates.get(departmen.code)}
            isSelected={selectedDepartmen === departmen.code}
            onSelect={() => selectDepartmen(departmen.code)}
          />
        ))}
      </div>
    </aside>
  );
}
