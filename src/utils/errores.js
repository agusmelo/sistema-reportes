class ErrorBadRequest extends Error {
  constructor() {
    super("Solicitud incorrecta");
  }
}

class ElementNotFound extends Error {
  constructor() {
    super("No encontrado");
  }
}

class InternalError extends Error {
  constructor() {
    super("Error interno del servidor");
  }
}

class InvalidData extends Error {
  constructor() {
    super("Datos invalidos");
  }
}

export { ErrorBadRequest, ElementNotFound, InternalError, InvalidData };
