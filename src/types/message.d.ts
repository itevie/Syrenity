interface Message {
    id: number,
    channel_id: number,
    content: string,
    created_at: Date,
    author_id: number,
    is_pinned: number,
    is_edited: number,
}