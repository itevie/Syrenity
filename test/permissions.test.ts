import {afterAll, describe, expect, test} from '@jest/globals';
import * as permissions from '../src/util/permissions';
import * as databsae from '../src/database';
import * as Logger from "../src/Logger";
Logger.options.disableLogging = true;

const testIDs = {
  user: -1,
  guildOwner: 33,
  guild: 47,
  roleAtEveryone: 930,
  channel: 184,
}

describe("Testing permissions utility", () => {
  afterAll(async () => {
    await databsae.close();
  });

  test(`Initialise database`, async () => {
    await databsae.initialise();
  });

  test(`Can user view guild`, async () => {
    expect(
      await permissions.canUserView("guild", testIDs.guild, testIDs.user)
    ).toBe(true);
  });

  test(`Can user view channel`, async () => {
    expect(
      await permissions.canUserView("channel", testIDs.channel, testIDs.user)
    ).toBe(true);
  });

  test(`Can user view channel`, async () => {
    expect(
      await permissions.canUserView("channel", 1, testIDs.user)
    ).toBe(false);
  });

  test(`Expect user to have @everyone + BAN perms`, async () => {
    expect(
      await permissions.computeBitField({
        guildId: testIDs.guild,
        userId: testIDs.user
      })
    ).toBe(permissions.defaultPermissions | permissions.PermissionBitfield.BAN_MEMBERS);
  });

  test(`User has SEND_MESSAGES`, async () => {
    expect(
      await permissions.hasPermission({
        guildId: testIDs.guild,
        channelId: testIDs.channel,
        userId: testIDs.user,
        permission: permissions.PermissionBitfield.CREATE_MESSAGES
      })
    ).toBe(true);
  });

  test(`User has ADMINISTRATOR`, async () => {
    expect(
      await permissions.hasPermission({
        guildId: testIDs.guild,
        userId: testIDs.user,
        permission: permissions.PermissionBitfield.ADMINISTRATOR
      })
    ).toBe(false);
  });

  test(`User has BAN_MEMBERS`, async () => {
    expect(
      await permissions.hasPermission({
        guildId: testIDs.guild,
        userId: testIDs.user,
        permission: permissions.PermissionBitfield.BAN_MEMBERS
      })
    ).toBe(true);
  });

  test(`Owner has ADMINISTRATOR`, async () => {
    expect(
      await permissions.hasPermission({
        guildId: testIDs.guild,
        userId: testIDs.guildOwner,
        permission: permissions.PermissionBitfield.ADMINISTRATOR
      })
    ).toBe(true);
  });

  test(`Owner has BAN_MEMBERS`, async () => {
    expect(
      await permissions.hasPermission({
        guildId: testIDs.guild,
        userId: testIDs.guildOwner,
        permission: permissions.PermissionBitfield.BAN_MEMBERS
      })
    ).toBe(true);
  });
});