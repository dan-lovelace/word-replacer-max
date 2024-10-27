export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    const arrCopy: any[] = [];

    for (const item of obj) {
      arrCopy.push(deepClone(item));
    }

    return arrCopy as unknown as T;
  }

  const objCopy: { [key: string]: any } = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      objCopy[key] = deepClone(obj[key]);
    }
  }

  return objCopy as T;
}
