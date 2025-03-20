const { DatabaseError, UniqueConstraintError } = require("./errors");

function handleSQLError(error, modelName = "", logErrors = true) {
  if (logErrors) {
    console.error(`Model (${modelName}) - Database Error: `, error);
  }
  if (error.code === "SQLITE_CONSTRAINT") {
    if (error.message.includes("UNIQUE constraint failed")) {
      const field = error.message.split(": ")[1]; // Extract the field name
      return new UniqueConstraintError(field);
    }
    return new DatabaseError(
      "Restricción de integridad violada en la base de datos"
    );
  } else if (error.code === "SQLITE_BUSY") {
    return new DatabaseError(
      "La base de datos está ocupada, intenta de nuevo más tarde"
    );
  } else if (error.code === "SQLITE_IOERR") {
    return new DatabaseError(
      "Error de entrada/salida al acceder a la base de datos"
    );
  }

  console.error("Database Error:", error);
  return new DatabaseError("Error inesperado en la base de datos");
}

module.exports = handleSQLError;
