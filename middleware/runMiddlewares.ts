import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function runMiddlewares(
  request: NextRequest,
  middlewares: Array<(req: NextRequest, res: NextResponse | null) => Promise<NextResponse | null>>
) {
  let response: NextResponse | null = null;
  for (const middleware of middlewares) {
    response = await middleware(request, response);
    if (response && !response.ok) {
      return response;
    }
  }
  return response;
}
