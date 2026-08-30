// Generic action state type for use across all server actions
export type ActionState<TForm = unknown, TData = unknown> = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<keyof TForm | string, string[]>>;
  data?: TData;
  inputs?: Partial<TForm>;
};
