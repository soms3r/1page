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
  hasEasyMode?: boolean;
};

export type EasyModeField = {
  name: string;
  type: "text" | "textarea" | "select" | "number";
  label: string;
  options?: string[];
  placeholder?: string;
};

export type EasyModeConfig = {
  enabled: boolean;
  fields: EasyModeField[];
  template: string;
};

export type Workflow = WorkflowMeta & {
  body: string;
  variables?: WorkflowVariable[];
  easyMode?: EasyModeConfig;
};

export type WorkflowVariable = {
  name: string;
  label: string;
  required: boolean;
  placeholder: string;
};
