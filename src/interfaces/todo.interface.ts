export interface ITask {
  id: string;
  name: string;
  status: TYPE_STATUS_TASK;
}

export type TYPE_STATUS_TASK = 'pending' | 'completed'