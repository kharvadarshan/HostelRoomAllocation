import { NextResponse } from 'next/server';

type ApiResponseOptions = {
  statusCode?: number;
  message?: string;
  data?: any;
  error?: any;
};

export function createApiResponse({
  statusCode = 200,
  message = 'Success',
  data = null,
  error = null,
}: ApiResponseOptions) {
  return NextResponse.json(
    {
      success: statusCode >= 200 && statusCode < 400,
      message,
      data,
      error,
    },
    { status: statusCode }
  );
}

export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User registered successfully',
};

export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Something went wrong, please try again later',
  REQUIRED_FIELDS: 'Please fill in all required fields',
  INVALID_REQUEST: 'Invalid request data',
}; 