package gym.demo.Gestion_persona.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import gym.demo.Gestion_persona.config.ApiResponse;
import gym.demo.Gestion_persona.models.dto.RegistroDto;
import gym.demo.Gestion_persona.services.RegistroService;

@RestController
@RequestMapping("/api/personas/{personaId}/pagos")
@Validated
public class RegistroController {

    @Autowired
    private RegistroService registroService;

    // Registrar un nuevo pago (adjuntar un "pago" a la persona). Body opcional: { "fechaPago": "yyyy-MM-dd" }
    @PostMapping
    public ResponseEntity<ApiResponse> registrarPago(@PathVariable Integer personaId,
                                                       @RequestBody(required = false) RegistroDto body) {
        return registroService.registrarPago(personaId, body != null ? body.getFechaPago() : null);
    }

    // Historial de pagos de la persona
    @GetMapping
    public ResponseEntity<ApiResponse> historial(@PathVariable Integer personaId) {
        return registroService.historial(personaId);
    }
}
