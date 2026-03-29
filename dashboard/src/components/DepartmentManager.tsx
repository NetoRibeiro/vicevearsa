import { useDepartmentStore } from "@/store/useDepartmentStore";
import { DepartmentCard } from "./DepartmentCard";
import { DepartmentActions } from "./DepartmentActions";
import { BundleImport } from "./BundleImport";

export function DepartmentManager() {
  const departments = useDepartmentStore((s) => s.departments);
  const activeStates = useDepartmentStore((s) => s.activeStates);
  const selectedDepartment = useDepartmentStore((s) => s.selectedDepartment);
  const selectDepartment = useDepartmentStore((s) => s.selectDepartment);

  const departmentList = Array.from(departments.values()).sort((a, b) => {
    const aActive = activeStates.has(a.code) ? 0 : 1;
    const bActive = activeStates.has(b.code) ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;
    return a.name.localeCompare(b.name);
  });

  function handleDeleted() {
    // Snapshot will auto-refresh via WebSocket when department.yaml is removed
    // by chokidar watcher
  }

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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Departments</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {departmentList.length === 0 && (
          <div style={{ padding: "16px 12px", color: "var(--text-secondary)", fontSize: 12 }}>
            No departments yet. Use <code>/vicevearsa create</code> in your IDE to create one.
          </div>
        )}
        {departmentList.map((department) => (
          <div key={department.code}>
            <DepartmentCard
              department={department}
              state={activeStates.get(department.code)}
              isSelected={selectedDepartment === department.code}
              onSelect={() => selectDepartment(department.code)}
            />
            {selectedDepartment === department.code && (
              <div style={{ padding: "0 12px 8px" }}>
                <DepartmentActions
                  departmentCode={department.code}
                  departmentName={department.name}
                  onDeleted={handleDeleted}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <BundleImport />
    </aside>
  );
}
