export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};

export type ValidationError = {
  path: string;
  message: string;
};

export type FieldSchema = {
  type: "string" | "boolean" | "number" | "array" | "object";
  required?: boolean;
  keys?: Record<string, FieldSchema>;
  itemType?: "string" | "object";
  itemKeys?: Record<string, FieldSchema>;
};

export const SETTINGS_SCHEMAS: Record<string, FieldSchema> = {
  site: {
    type: "object", required: true,
    keys: {
      siteName: { type: "string", required: true },
      tagline: { type: "string" },
      description: { type: "string" },
      creator: {
        type: "object", keys: {
          name: { type: "string", required: true },
          username: { type: "string" },
          url: { type: "string" },
        },
      },
      website: { type: "string" },
      sponsor: {
        type: "object", keys: {
          name: { type: "string" },
          url: { type: "string" },
        },
      },
      favicon: { type: "string" },
      language: { type: "string" },
    },
  },
  social: {
    type: "object", required: true,
    keys: {
      github: { type: "string" },
      githubSponsors: { type: "string" },
      telegram: { type: "string" },
      telegramChannel: { type: "string" },
      facebook: { type: "string" },
      twitter: { type: "string" },
      discord: { type: "string" },
      youtube: { type: "string" },
      website: { type: "string" },
    },
  },
  homepage: {
    type: "object", required: true,
    keys: {
      heroTitle: { type: "string" },
      heroTagline: { type: "string" },
      heroSubtitle: { type: "string" },
      heroTagline2: { type: "string" },
      searchPlaceholder: { type: "string" },
      quickTags: { type: "array", itemType: "string" },
      directoryCategories: { type: "array", itemType: "string" },
      ctaTitle: { type: "string" },
      ctaSubtitle: { type: "string" },
    },
  },
  seo: {
    type: "object", required: true,
    keys: {
      defaultTitle: { type: "string" },
      defaultDescription: { type: "string" },
      defaultKeywords: { type: "array", itemType: "string" },
      titleSuffix: { type: "string" },
      twitterHandle: { type: "string" },
      ogImage: { type: "string" },
    },
  },
  banner: {
    type: "object", required: true,
    keys: {
      enabled: { type: "boolean" },
      message: { type: "string" },
      link: { type: "string" },
      linkText: { type: "string" },
      type: { type: "string" },
      dismissible: { type: "boolean" },
    },
  },
  footer: {
    type: "object", required: true,
    keys: {
      showTagline: { type: "boolean" },
      links: {
        type: "array", itemType: "object",
        itemKeys: {
          label: { type: "string", required: true },
          url: { type: "string", required: true },
          external: { type: "boolean" },
        },
      },
      showCreator: { type: "boolean" },
      showSponsor: { type: "boolean" },
    },
  },
  community: {
    type: "object", required: true,
    keys: {
      githubRepo: { type: "string" },
      issuesUrl: { type: "string" },
      discussionsUrl: { type: "string" },
      contributingUrl: { type: "string" },
      telegramPromo: {
        type: "object", keys: {
          enabled: { type: "boolean" },
          title: { type: "string" },
          message: { type: "string" },
          link: { type: "string" },
          linkText: { type: "string" },
        },
      },
      defaultMessages: {
        type: "object", keys: {
          ctaTitle: { type: "string" },
          ctaSubtitle: { type: "string" },
          workflowRequest: { type: "string" },
        },
      },
    },
  },
  donation: {
    type: "object", required: true,
    keys: {
      enabled: { type: "boolean" },
      title: { type: "string" },
      description: { type: "string" },
      message: { type: "string" },
      supportMessage: { type: "string" },
      reassurance: { type: "string" },
      uses: { type: "array", itemType: "string" },
      githubSponsorsUrl: { type: "string" },
      stripeDonationUrl: { type: "string" },
      customLinksEnabled: { type: "boolean" },
      customLinks: {
        type: "array", itemType: "object",
        itemKeys: {
          label: { type: "string", required: true },
          url: { type: "string", required: true },
        },
      },
    },
  },
  features: {
    type: "object", required: true,
    keys: {
      donation: { type: "boolean" },
      shareUnlock: { type: "boolean" },
      workflowGenerator: { type: "boolean" },
      telegramPromo: { type: "boolean" },
      banner: { type: "boolean" },
      search: { type: "boolean" },
      trending: { type: "boolean" },
      featured: { type: "boolean" },
      communityCta: { type: "boolean" },
      statsDisplay: { type: "boolean" },
    },
  },
};

function getType(val: unknown): FieldSchema["type"] {
  if (val === null) return "string";
  if (Array.isArray(val)) return "array";
  return typeof val as FieldSchema["type"];
}

export function validateSection(sectionKey: string, data: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const schema = SETTINGS_SCHEMAS[sectionKey];
  if (!schema) {
    return { valid: false, errors: [{ path: sectionKey, message: `Unknown section: ${sectionKey}` }] };
  }
  validateValue(schema, data, [], errors);
  return { valid: errors.length === 0, errors };
}

function validateValue(
  schema: FieldSchema,
  value: unknown,
  path: string[],
  errors: ValidationError[],
): void {
  const actualType = getType(value);

  if (schema.required && (value === undefined || value === null || value === "")) {
    errors.push({ path: path.join("."), message: "Required field is empty" });
    return;
  }
  if (value === undefined || value === null || value === "") return;

  if (schema.type !== actualType) {
    if (schema.type === "array" && actualType === "string") {
      return;
    }
    if (schema.type === "string" && actualType === "number") {
      return;
    }
    if (schema.type === "number" && actualType === "string") {
      const num = Number(value);
      if (!isNaN(num)) return;
    }
    if (!(schema.type === "object" && actualType === "array")) {
      errors.push({ path: path.join("."), message: `Expected ${schema.type}, got ${actualType}` });
      return;
    }
  }

  if (schema.type === "object" && schema.keys && typeof value === "object" && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    for (const [key, fieldSchema] of Object.entries(schema.keys)) {
      validateValue(fieldSchema, obj[key], [...path, key], errors);
    }
  }

  if (schema.type === "array" && Array.isArray(value)) {
    if (schema.itemType === "object" && schema.itemKeys) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (typeof item === "object" && item !== null) {
          for (const [key, fieldSchema] of Object.entries(schema.itemKeys)) {
            validateValue(fieldSchema, (item as Record<string, unknown>)[key], [...path, `${i}.${key}`], errors);
          }
        } else {
          errors.push({ path: [...path, String(i)].join("."), message: "Expected object" });
        }
      }
    }
    if (schema.itemType === "string") {
      for (let i = 0; i < value.length; i++) {
        if (typeof value[i] !== "string") {
          errors.push({ path: [...path, String(i)].join("."), message: "Expected string" });
        }
      }
    }
  }
}
