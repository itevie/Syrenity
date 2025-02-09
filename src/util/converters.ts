import { actions } from "./database";

export async function assignedRolesToRoles(assignedRoles: AssignedRole[]): Promise<Role[]> {
    let roles: Role[] = [];

    for (const assignedRole of assignedRoles) {
        roles.push(await actions.roles.fetch(assignedRole.role_id));
    }

    return roles;
}