"""Custom application exceptions."""

from fastapi import HTTPException, status


class AppException(HTTPException):
    """Base application exception."""

    def __init__(self, status_code: int, detail: str, error_code: str = "INTERNAL_ERROR"):
        super().__init__(status_code=status_code, detail={"code": error_code, "message": detail})


class NotFoundException(AppException):
    def __init__(self, resource: str = "Resource"):
        super().__init__(status.HTTP_404_NOT_FOUND, f"{resource} not found", "NOT_FOUND")


class UnauthorizedException(AppException):
    def __init__(self, detail: str = "Invalid credentials"):
        super().__init__(status.HTTP_401_UNAUTHORIZED, detail, "UNAUTHORIZED")


class ForbiddenException(AppException):
    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(status.HTTP_403_FORBIDDEN, detail, "FORBIDDEN")


class ConflictException(AppException):
    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(status.HTTP_409_CONFLICT, detail, "CONFLICT")


class ValidationException(AppException):
    def __init__(self, detail: str = "Validation error"):
        super().__init__(status.HTTP_422_UNPROCESSABLE_ENTITY, detail, "VALIDATION_ERROR")
