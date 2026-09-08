package gym.demo.Gestion_persona.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import gym.demo.Gestion_persona.config.ApiResponse;
import gym.demo.Gestion_persona.services.BitacoraService;

// Endpoints de solo lectura: la bitácora se genera automáticamente desde los demás servicios,
// nunca se crea, actualiza ni elimina a través de la API.
@RestController
@RequestMapping("/api/bitacora")
@Validated
public class BitacoraController {

    @Autowired
    private BitacoraService bitacoraService;

    // Historial completo de movimientos registrados por todos los usuarios
    @GetMapping
    public ResponseEntity<ApiResponse> getAllMovimientos() {
        return bitacoraService.obtenerTodos();
    }

    // Historial de movimientos filtrado por un usuario (empleado) en particular
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<ApiResponse> getMovimientosPorUsuario(@PathVariable Integer idUsuario) {
        return bitacoraService.obtenerPorUsuario(idUsuario);
    }
}
