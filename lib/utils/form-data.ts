interface ObjectToFormDataOptions {
  existingFormData?: FormData;
  multipleAppendFields?: string[];
}

/**
 * Converts a primitive object to FormData.
 * Handles: Files, Arrays, Booleans, Objects (JSON), and Primitives.
 */
export function objectToFormData(
  obj: Record<string, unknown>,
  options: ObjectToFormDataOptions = {}
): FormData {
  const { existingFormData, multipleAppendFields = [] } = options;
  const formData = existingFormData || new FormData();

  Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (value instanceof File) {
      if (value.size > 0 && value.name !== "undefined") {
        formData.append(key, value);
      }
      return;
    }

    if (Array.isArray(value)) {
      if (multipleAppendFields.includes(key)) {
        if (value.length === 0) {
          formData.append(key, "");
        } else {
          value.forEach((val) => {
            if (val !== undefined && val !== null) {
              formData.append(key, String(val));
            }
          });
        }
      } else {
        formData.append(key, JSON.stringify(value));
      }
      return;
    }

    if (typeof value === "boolean") {
      formData.append(key, value ? "true" : "false");
      return;
    }

    if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
}

/**
 * Converts FormData to a plain object.
 * Handles: multiple values, JSON-stringified values, nested keys (dot notation).
 */
export function formDataToObject(
  formData: FormData,
  options: { arrayFields?: string[] } = {}
): Record<string, unknown> {
  const obj: Record<string, unknown> = {};

  for (const key of Array.from(new Set(formData.keys()))) {
    const values = formData.getAll(key);
    let value: unknown;

    if (options.arrayFields?.includes(key)) {
      value = values.filter((v) => typeof v === "string" && v.trim() !== "");
    } else if (values.length > 1) {
      value = values;
    } else {
      const val = values[0];
      if (typeof val === "string" && (val.startsWith("[") || val.startsWith("{"))) {
        try {
          value = JSON.parse(val);
        } catch {
          value = val;
        }
      } else {
        value = val;
      }
    }

    if (key.includes(".")) {
      const parts = key.split(".");
      let current: Record<string, unknown> = obj;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          current[part] = value;
        } else {
          current[part] = (current[part] as Record<string, unknown>) || {};
          current = current[part] as Record<string, unknown>;
        }
      }
    } else {
      obj[key] = value;
    }
  }

  return obj;
}
