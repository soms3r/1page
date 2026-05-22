export type WorkflowMeta = {
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  models: {
    best: string;
    good: string[];
    limited: string[];
  };
  updated: string;
  featured: boolean;
  locked: boolean;
  refCount?: number;
};

export type Workflow = WorkflowMeta & {
  body: string;
  variables?: WorkflowVariable[];
};

export type WorkflowVariable = {
  name: string;
  label: string;
  required: boolean;
  placeholder: string;
};
