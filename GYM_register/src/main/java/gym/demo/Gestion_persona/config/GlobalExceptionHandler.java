package gym.demo.Gestion_persona.config;

import gym.demo.Gestion_persona.exceptions.InvalidCurrentPasswordException;
import gym.demo.Gestion_persona.exceptions.ResourceNotFoundException;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

// Manejo centralizado de errores: respuestas consistentes y sin exponer detalles internos
// (stack traces, SQL, contraseñas o hashes) al cliente.
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Errores de validación de @Valid en los DTOs (nombre, correo, teléfono, edad, etc.)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        ApiResponse response = new ApiResponse(HttpStatus.BAD_REQUEST, true, "Error de validación", errors);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // Cuerpo JSON malformado o con un valor inválido para un campo (p. ej. un tipoPago
    // que no sea MENSUAL/TRIMESTRAL/SEMESTRAL/ANUAL)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse> handleMessageNotReadable(HttpMessageNotReadableException ex) {
        ApiResponse response = new ApiResponse(HttpStatus.BAD_REQUEST, true, "El cuerpo de la solicitud es inválido o contiene un valor no permitido");
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse> handleConstraintViolation(ConstraintViolationException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations().forEach(violation ->
                errors.put(violation.getPropertyPath().toString(), violation.getMessage()));
        ApiResponse response = new ApiResponse(HttpStatus.BAD_REQUEST, true, "Error de validación", errors);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // Segunda barrera ante violaciones de restricciones UNIQUE/NOT NULL a nivel de base de datos
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        logger.warn("Violación de integridad de datos: {}", ex.getMessage());
        ApiResponse response = new ApiResponse(HttpStatus.BAD_REQUEST, true,
                "El registro no pudo guardarse porque viola una restricción de datos únicos");
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InvalidCurrentPasswordException.class)
    public ResponseEntity<ApiResponse> handleInvalidCurrentPassword(InvalidCurrentPasswordException ex) {
        ApiResponse response = new ApiResponse(HttpStatus.BAD_REQUEST, true, ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse> handleBadCredentials(BadCredentialsException ex) {
        ApiResponse response = new ApiResponse(HttpStatus.BAD_REQUEST, true, "Las credenciales no coinciden");
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        ApiResponse response = new ApiResponse(HttpStatus.NOT_FOUND, true, ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse> handleAccessDenied(AccessDeniedException ex) {
        ApiResponse response = new ApiResponse(HttpStatus.FORBIDDEN, true, "No tiene permisos para realizar esta operación");
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse> handleIllegalArgument(IllegalArgumentException ex) {
        ApiResponse response = new ApiResponse(HttpStatus.BAD_REQUEST, true, ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // Red de seguridad final: nunca exponer stack traces ni detalles internos al cliente
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleUnexpected(Exception ex) {
        logger.error("Error interno no controlado", ex);
        ApiResponse response = new ApiResponse(HttpStatus.INTERNAL_SERVER_ERROR, true, "Error interno en el servidor");
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
