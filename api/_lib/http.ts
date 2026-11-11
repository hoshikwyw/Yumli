/** Small helpers shared by the API routes. */

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Responses are never cached. The admin dashboard reads the same routes the
 * public pages do, and must see its own edits straight away.
 */
export const json = (body: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  });

/**
 * Run a route handler, turning thrown errors into JSON. Expected errors
 * (HttpError) keep their message; anything else is logged and reported as a
 * generic failure, so database details never reach the browser.
 */
export const handle = (fn: (request: Request) => Promise<Response>) =>
  async (request: Request): Promise<Response> => {
    try {
      return await fn(request);
    } catch (error) {
      if (error instanceof HttpError) return json({ error: error.message }, error.status);
      console.error(error);
      return json({ error: 'Something went wrong' }, 500);
    }
  };

/** Read a JSON request body. Requiring the JSON content type also blocks cross-site form posts. */
export const readJson = async (request: Request): Promise<unknown> => {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    throw new HttpError(415, 'Expected a JSON body');
  }
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, 'Invalid JSON');
  }
};

/** A required query parameter, such as `?id=`. */
export const param = (request: Request, name: string): string => {
  const value = new URL(request.url).searchParams.get(name);
  if (!value) throw new HttpError(400, `Missing ?${name}=`);
  return value;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const uuidParam = (request: Request, name = 'id'): string => {
  const value = param(request, name);
  if (!UUID.test(value)) throw new HttpError(400, `?${name}= is not a valid id`);
  return value;
};

export const isUuid = (value: unknown): value is string => typeof value === 'string' && UUID.test(value);

/** Turn a Supabase error result into an exception for `handle` to log. */
export const check = <T>(result: { data: T; error: { message: string; code?: string } | null }): T => {
  if (result.error?.code === '23505') throw new HttpError(409, 'That name is already used');
  if (result.error) throw new Error(result.error.message);
  return result.data;
};
