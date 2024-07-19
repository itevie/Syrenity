const permissionsBitfield = {
    CreateMessages: 1 << 0,
    ManageMessages: 1 << 1,
    ReadChannelHistory: 1 << 2,
    ManageChannels: 1 << 3,
    CreateInvites: 1 << 4,
    ManageInvites: 1 << 5,
}

export const defaultBitfield =
    permissionsBitfield.CreateMessages
    | permissionsBitfield.ReadChannelHistory
    | permissionsBitfield.CreateInvites

export default permissionsBitfield;