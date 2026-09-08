package gym.demo.Gestion_persona.controllers.auth;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import gym.demo.Gestion_persona.config.ApiResponse;
import gym.demo.Gestion_persona.controllers.auth.Dto.SignDto;
import gym.demo.Gestion_persona.services.auth.AuthService;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"*"})
public class AuthController {
    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/signin")
    public ResponseEntity<ApiResponse> signIn(@RequestBody SignDto dto) {
        return service.signIn(dto.getUsuario(), dto.getContrasenia());
    }
}

