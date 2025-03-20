class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = "DatabaseError";
    this.statusCode = 500; // Internal Server Error
  }
}

class UniqueConstraintError extends DatabaseError {
  constructor(field) {
    super(`${field} ya está registrado`);
    this.name = "UniqueConstraintError";
    this.statusCode = 409; // Conflict
  }
}

class NotFoundError extends DatabaseError {
  constructor(resource) {
    super(`${resource} no encontrado`);
    this.name = "NotFoundError";
    this.statusCode = 404; // Not Found
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400; // Bad Request
  }
}

module.exports = {
  DatabaseError,
  UniqueConstraintError,
  NotFoundError,
  ValidationError,
};
