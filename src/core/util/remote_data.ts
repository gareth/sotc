export type RemoteData<T> =
  | { status: "unknown" }
  | { status: "pending" }
  | { status: "success"; data: T }
  | { status: "failure"; error: Error };
