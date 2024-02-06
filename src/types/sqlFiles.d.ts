/**
 * Interfaces containing all the sql files for intellisense
 */
interface SQLFiles {
  FETCH_USER?,
  FETCH_PARTIAL_USER?,
  FETCH_BY_EMAIL?,
  FETCH_GUILD_CHANNELS?,
  FETCH_USER_GUILDS?,

  /**
   * If I forget to add one
   */
  [key: string]: string;
}