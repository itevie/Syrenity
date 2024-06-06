import { actions, query } from "./database";

/**
 * Checks if the user can view the specified resource
 * @param user The user in question
 * @param what The resource to be checked
 * @param id The ID of the resource (assumed to be existent)
 */
export async function canView(user: User, what: Resource, id: number): Promise<boolean> {
    switch (what) {
        case "guild":
            // Simple has member check will suit it
            return await actions.guilds.hasMember(id, user.id);
        case "channel":
            const cresult = (await query({
                text: `
                    SELECT
                        CASE
                            -- Check if the channel ID is a relationship, and the user is in it
                            WHEN EXISTS (
                                SELECT 1
                                    FROM relationships
                                    WHERE channel_id = $2
                                        AND (user1 = $1 OR user2 = $1)
                            )

                            -- Check if the channel is from a server which the user is from
                            OR EXISTS (
                                SELECT 1 FROM (
                                    SELECT 
                                        CASE 
                                            WHEN m.user_id IS NOT NULL THEN TRUE
                                            ELSE FALSE
                                        END AS result
                                    FROM 
                                        channels c
                                    JOIN 
                                        guilds g ON c.guild_id = g.id
                                    LEFT JOIN 
                                        members m ON g.id = m.guild_id AND m.user_id = $1
                                    WHERE 
                                        c.id = $2
                                ) AS result
                                WHERE result = true
                            ) THEN TRUE
                            ELSE FALSE
                        END AS result;
                `,
                values: [user.id, id]
            })).rows[0].result;

            return cresult;
        case "user":
            if (user.id === id) return true;
            const result = (await query({
                text: `
                    SELECT 
                        CASE
                            -- Check if the two users contain a mutural server
                            WHEN EXISTS (
                                SELECT 1
                                    FROM members
                                    WHERE user_id IN ($1, $2)
                                    GROUP BY guild_id
                                    HAVING COUNT(DISTINCT user_id) = 2
                            ) 

                            -- Check if the two users have a relationship
                            OR EXISTS (
                                SELECT 1
                                    FROM relationships
                                    WHERE user1 = $1 AND user1 = $2
                                        OR user1 = $2 AND user2 = $1
                            )
                            THEN TRUE
                            ELSE FALSE
                        END AS result;
                `,
                values: [user.id, id]
            })).rows[0].result;

            return result;
        default:
            console.error(`Can view not implemented for ${what}`);
            process.exit(0);
    }
}