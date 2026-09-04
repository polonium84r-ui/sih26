from typing import List, Dict
from backend.app.models.domain import MaintenanceTask, DepartmentEnum

class DepartmentCoordinator:
    """Evaluates multi-department co-location compatibility for shadow maintenance."""

    # Department compatibility matrix
    COMPATIBILITY_RULES = {
        (DepartmentEnum.ENGINEERING, DepartmentEnum.TRACTION): True,  # Track work + OHE inspection can co-exist
        (DepartmentEnum.ENGINEERING, DepartmentEnum.SNT): True,       # Track work + Signal maintenance can co-exist
        (DepartmentEnum.TRACTION, DepartmentEnum.SNT): True,          # OHE + Signal can co-exist
    }

    def check_compatibility(self, dept1: DepartmentEnum, dept2: DepartmentEnum) -> bool:
        if dept1 == dept2:
            return True
        key = (dept1, dept2) if (dept1, dept2) in self.COMPATIBILITY_RULES else (dept2, dept1)
        return self.COMPATIBILITY_RULES.get(key, False)

    def group_coordinated_tasks(self, tasks: List[MaintenanceTask]) -> List[List[MaintenanceTask]]:
        """Groups tasks that can be executed together inside a single block window."""
        groups: List[List[MaintenanceTask]] = []
        for task in tasks:
            added = False
            for group in groups:
                # Check spatial proximity (within 3 KM) and compatibility
                spatial_close = all(
                    abs(task.location_start_km - g_task.location_start_km) <= 3.0
                    for g_task in group
                )
                depts_compatible = all(
                    self.check_compatibility(task.department, g_task.department)
                    for g_task in group
                )
                if spatial_close and depts_compatible:
                    group.append(task)
                    added = True
                    break
            if not added:
                groups.append([task])
        return groups
