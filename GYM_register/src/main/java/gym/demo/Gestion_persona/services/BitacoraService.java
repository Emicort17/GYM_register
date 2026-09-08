package gym.demo.Gestion_persona.services;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import gym.demo.Gestion_persona.config.ApiResponse;
import gym.demo.Gestion_persona.models.dto.BitacoraDto;
import gym.demo.Gestion_persona.models.entity.BitacoraBean;
import gym.demo.Gestion_persona.models.entity.UserBean;
import gym.demo.Gestion_persona.models.repository.BitacoraRepository;
import gym.demo.Gestion_persona.models.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class BitacoraService {

    private final BitacoraRepository repository;
    private final UserRepository usuarioRepository;

    // Registra un movimiento en la bitácora, atribuido al usuario autenticado en la petición actual.
    @Transactional
    public void registrar(String accion, String tablaAfectada, Integer registroAfectadoId, String detalles) {
        BitacoraBean movimiento = BitacoraBean.builder()
                .fecha(LocalDateTime.now())
                .accion(accion)
                .tablaAfectada(tablaAfectada)
                .registroAfectadoId(registroAfectadoId)
                .detalles(detalles)
                .usuario(usuarioActual().orElse(null))
                .build();

        repository.save(movimiento);
    }

    private Optional<UserBean> usuarioActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return Optional.empty();
        }
        return usuarioRepository.findByEmail(auth.getName());
    }

    // Historial completo de movimientos, del más reciente al más antiguo (solo lectura, para el admin)
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse> obtenerTodos() {
        List<BitacoraDto> movimientos = repository.findAllByOrderByFechaDesc().stream()
                .map(BitacoraDto::fromEntity)
                .toList();
        return new ResponseEntity<>(new ApiResponse(movimientos, HttpStatus.OK), HttpStatus.OK);
    }

    // Historial de movimientos de un usuario (empleado) en particular
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse> obtenerPorUsuario(Integer idUsuario) {
        if (!usuarioRepository.existsById(idUsuario)) {
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.NOT_FOUND, true, "Usuario no encontrado"),
                    HttpStatus.NOT_FOUND
            );
        }

        List<BitacoraDto> movimientos = repository.findByIdUsuarioOrderByFechaDesc(idUsuario).stream()
                .map(BitacoraDto::fromEntity)
                .toList();
        return new ResponseEntity<>(new ApiResponse(movimientos, HttpStatus.OK), HttpStatus.OK);
    }
}
