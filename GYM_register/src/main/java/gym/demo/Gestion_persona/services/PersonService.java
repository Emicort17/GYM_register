package gym.demo.Gestion_persona.services;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import gym.demo.Gestion_persona.config.ApiResponse;
import gym.demo.Gestion_persona.models.entity.PersonBean;
import gym.demo.Gestion_persona.models.repository.PersonRepository;
import gym.demo.Gestion_persona.models.repository.RegistroRepository;

import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@AllArgsConstructor
public class PersonService {
    private final PersonRepository repository;
    private final RegistroRepository registroRepository;
    private final RegistroService registroService;
    private final BitacoraService bitacoraService;

    // Obtener todas las personas, incluyendo su fecha de registro y el estado (semáforo) de su último pago
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse> getAll() {
        List<?> personas = repository.findAll().stream()
                .map(registroService::toEstadoDto)
                .toList();
        return new ResponseEntity<>(
                new ApiResponse(personas, HttpStatus.OK),
                HttpStatus.OK
        );
    }

    // Obtener una persona por su ID, incluyendo su fecha de registro y estado de pago
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse> getOne(Integer id) {
        Optional<PersonBean> optionalPersonBean = repository.findById(id);
        if (optionalPersonBean.isPresent()) {
            return new ResponseEntity<>(
                    new ApiResponse(registroService.toEstadoDto(optionalPersonBean.get()), HttpStatus.OK),
                    HttpStatus.OK
            );
        } else {
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.NOT_FOUND, true, "Persona no encontrada"),
                    HttpStatus.NOT_FOUND
            );
        }
    }

    // Guardar una nueva persona
    @Transactional(rollbackFor = {SQLException.class})
    public ResponseEntity<ApiResponse> save(PersonBean person) {
        // Verifica si el correo ya está registrado
        if (repository.existsByEmail(person.getEmail())) {
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.BAD_REQUEST, true, "El correo ya está registrado"),
                    HttpStatus.BAD_REQUEST
            );
        }
        // Verifica si el teléfono ya está registrado
        if (repository.existsByTelefono(person.getTelefono())) {
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.BAD_REQUEST, true, "El teléfono ya está registrado"),
                    HttpStatus.BAD_REQUEST
            );
        }
        // La fecha de registro se guarda una única vez, al momento de dar de alta a la persona
        if (person.getFechaRegistro() == null) {
            person.setFechaRegistro(LocalDate.now());
        }
        // Guarda la persona
        PersonBean saved = repository.saveAndFlush(person);
        bitacoraService.registrar("CREAR_PERSONA", "persona", saved.getId(), "Alta de persona: " + saved.getEmail());
        return new ResponseEntity<>(
                new ApiResponse(registroService.toEstadoDto(saved), HttpStatus.OK),
                HttpStatus.OK
        );
    }

    // Actualizar una persona existente
    @Transactional(rollbackFor = {SQLException.class})
    public ResponseEntity<ApiResponse> update(PersonBean person) {
        if (person.getId() == null) {
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.BAD_REQUEST, true, "El ID no puede ser null"),
                    HttpStatus.BAD_REQUEST
            );
        }
        Optional<PersonBean> foundPerson = repository.findById(person.getId());
        if (foundPerson.isPresent()) {
            // Verifica si el correo ya está registrado por otra persona
            if (repository.existsByEmailAndIdNot(person.getEmail(), person.getId())) {
                return new ResponseEntity<>(
                        new ApiResponse(HttpStatus.BAD_REQUEST, true, "El correo ya está registrado por otra persona"),
                        HttpStatus.BAD_REQUEST
                );
            }
            // Verifica si el teléfono ya está registrado por otra persona
            if (repository.existsByTelefonoAndIdNot(person.getTelefono(), person.getId())) {
                return new ResponseEntity<>(
                        new ApiResponse(HttpStatus.BAD_REQUEST, true, "El teléfono ya está registrado por otra persona"),
                        HttpStatus.BAD_REQUEST
                );
            }
            // La fecha de registro no se modifica desde una actualización, se conserva la original
            person.setFechaRegistro(foundPerson.get().getFechaRegistro());
            // Actualiza la persona
            PersonBean updated = repository.saveAndFlush(person);
            bitacoraService.registrar("ACTUALIZAR_PERSONA", "persona", updated.getId(), "Actualización de persona: " + updated.getEmail());
            return new ResponseEntity<>(
                    new ApiResponse(registroService.toEstadoDto(updated), HttpStatus.OK),
                    HttpStatus.OK
            );
        } else {
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.NOT_FOUND, true, "Persona no encontrada"),
                    HttpStatus.NOT_FOUND
            );
        }
    }

    @Transactional(rollbackFor = {SQLException.class})
    public ResponseEntity<ApiResponse> delete(Integer id) {
        Optional<PersonBean> foundPerson = repository.findById(id);
        if (foundPerson.isPresent()) {
            // Elimina primero los pagos asociados para evitar la violación de la FK registro.persona_id
            registroRepository.deleteByPersonaId(id);
            repository.deleteById(id);
            bitacoraService.registrar("ELIMINAR_PERSONA", "persona", id, "Baja de persona: " + foundPerson.get().getEmail());
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.OK, false, "Registro Eliminado"),
                    HttpStatus.OK
            );
        } else {
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.NOT_FOUND, true, "Persona no encontrada"),
                    HttpStatus.NOT_FOUND
            );
        }
    }
}