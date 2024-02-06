interface Guild {
  id: number;
  name: string;
  owner_id: number;
  description: string;
  avatar: string;
  roles: {[key: number]: Role};
}
