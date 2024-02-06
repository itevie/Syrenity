SELECT *
    FROM
        roles,
        (
            SELECT role_id
                FROM assigned_roles
                WHERE
                    user_id = $1
                    AND guild_id = $2
        ) as role
    WHERE
        roles.id = role.role_id