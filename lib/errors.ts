export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function providerCode(provider: string) {
  const normalized = provider
    .replace("_API_KEY", "")
    .replace("DATABASE_URL", "DATABASE")
    .replace("JWT_SECRET", "JWT")
    .replace(/\s+/g, "_")
    .toUpperCase();

  return `${normalized}_NOT_CONFIGURED`;
}

export function missingProvider(provider: string) {
  return new ApiError(
    503,
    providerCode(provider),
    `${provider} is not configured. Add ${provider} to .env.`,
  );
}

export function externalServiceError(provider: string, message: string) {
  const code = `${provider.replace(/\s+/g, "_").toUpperCase()}_ERROR`;
  return new ApiError(
    502,
    code,
    `${provider} request failed: ${message}`,
  );
}

export function toErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json(
      { success: false, error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }

  if (error instanceof Error) {
    return Response.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 },
    );
  }

  return Response.json(
    {
      success: false,
      error: { code: "SERVER_ERROR", message: "Unknown server error" },
    },
    { status: 500 },
  );
}
