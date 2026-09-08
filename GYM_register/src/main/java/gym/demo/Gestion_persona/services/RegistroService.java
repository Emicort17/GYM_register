package gym.demo.Gestion_persona.services;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import gym.demo.Gestion_persona.config.ApiResponse;
import gym.demo.Gestion_persona.models.dto.PersonaEstadoDto;
import gym.demo.Gestion_persona.models.dto.RegistroDto;
import gym.demo.Gestion_persona.models.entity.PersonBean;
import gym.demo.Gestion_persona.models.entity.RegistroBean;
import gym.demo.Gestion_persona.models.repository.PersonRepository;
import gym.demo.Gestion_persona.models.repository.RegistroRepository;

import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class RegistroService {

    // Días de anticipación antes del vencimiento en los que el estado pasa a AMARILLO
    private static final long DIAS_AVISO = 7;

    public static final String VERDE = "Activo";
    public static final String AMARILLO = "Proximo a vencer";
    public static final String ROJO = "Vencido";

    private final RegistroRepository repository;
    private final PersonRepository personRepository;
    private final BitacoraService bitacoraService;

    // Registrar un nuevo pago para una persona. El pago dura 1 mes desde su fecha.
    @Transactional(rollbackFor = {SQLException.class})
    public ResponseEntity<ApiResponse> registrarPago(Integer personaId, LocalDate fechaPago) {
        Optional<PersonBean> foundPersona = personRepository.findById(personaId);
        if (foundPersona.isEmpty()) {
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.NOT_FOUND, true, "Persona no encontrada"),
                    HttpStatus.NOT_FOUND
            );
        }

        LocalDate fecha = fechaPago != null ? fechaPago : LocalDate.now();

        RegistroBean registro = RegistroBean.builder()
                .persona(foundPersona.get())
                .fechaPago(fecha)
                .fechaVencimiento(fecha.plusMonths(1))
                .fechaCreacion(LocalDateTime.now())
                .build();

        RegistroBean saved = repository.saveAndFlush(registro);
        bitacoraService.registrar("REGISTRAR_PAGO", "registro", saved.getId(),
                "Pago registrado para persona ID " + personaId + ", vence " + saved.getFechaVencimiento());

        return new ResponseEntity<>(
                new ApiResponse(RegistroDto.fromEntity(saved, calcularEstado(saved.getFechaVencimiento())), HttpStatus.OK),
                HttpStatus.OK
        );
    }

    // Historial de pagos de una persona
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse> historial(Integer personaId) {
        if (personRepository.findById(personaId).isEmpty()) {
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.NOT_FOUND, true, "Persona no encontrada"),
                    HttpStatus.NOT_FOUND
            );
        }
        List<RegistroDto> historial = repository.findByPersonaIdOrderByFechaPagoDesc(personaId).stream()
                .map(r -> RegistroDto.fromEntity(r, calcularEstado(r.getFechaVencimiento())))
                .toList();

        return new ResponseEntity<>(new ApiResponse(historial, HttpStatus.OK), HttpStatus.OK);
    }

    // Calcula el semáforo a partir de la fecha de vencimiento del último pago.
    // - ROJO: ya venció o vence hoy
    // - AMARILLO: falta 1 semana o menos para vencer
    // - VERDE: falta más de una semana, o nunca se ha registrado un pago
    public String calcularEstado(LocalDate fechaVencimiento) {
        if (fechaVencimiento == null) {
            return VERDE;
        }
        long diasRestantes = ChronoUnit.DAYS.between(LocalDate.now(), fechaVencimiento);
        if (diasRestantes <= 0) {
            return ROJO;
        }
        if (diasRestantes <= DIAS_AVISO) {
            return AMARILLO;
        }
        return VERDE;
    }

    // Construye el DTO enriquecido de una persona (fecha de registro + estado de pago)
    @Transactional(readOnly = true)
    public PersonaEstadoDto toEstadoDto(PersonBean persona) {
        Optional<RegistroBean> ultimo = repository.findFirstByPersonaIdOrderByFechaPagoDesc(persona.getId());

        LocalDate ultimoPago = ultimo.map(RegistroBean::getFechaPago).orElse(null);
        LocalDate vencimiento = ultimo.map(RegistroBean::getFechaVencimiento).orElse(null);
        Long diasRestantes = vencimiento != null
                ? ChronoUnit.DAYS.between(LocalDate.now(), vencimiento)
                : null;

        return PersonaEstadoDto.builder()
                .id(persona.getId())
                .name(persona.getName())
                .email(persona.getEmail())
                .telefono(persona.getTelefono())
                .age(persona.getAge())
                .fechaRegistro(persona.getFechaRegistro())
                .ultimoPago(ultimoPago)
                .fechaVencimiento(vencimiento)
                .diasRestantes(diasRestantes)
                .estado(calcularEstado(vencimiento))
                .build();
    }
}
