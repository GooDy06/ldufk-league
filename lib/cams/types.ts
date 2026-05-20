export type CameraRoom = {
  id: string;
  name: string;
  tournament_name: string | null;
  created_at: string;
};

export type CameraPlayer = {
  id: string;
  room_id: string;
  nickname: string;
  team_name: string | null;
  steamid64: string;
  avatar_url: string | null;
  join_token: string;
  is_online: boolean;
  last_seen: string | null;
  created_at: string;
};

export type CameraPlayerWithRoom = CameraPlayer & {
  room: CameraRoom | null;
};

export type PublicCameraPlayer = Omit<CameraPlayer, "join_token"> & {
  room?: CameraRoom | null;
};

export type IceServerResponse = {
  iceServers: RTCIceServer[];
};

export type CameraStatus = "idle" | "connecting" | "connected" | "camera-active" | "disconnected" | "offline" | "error";
