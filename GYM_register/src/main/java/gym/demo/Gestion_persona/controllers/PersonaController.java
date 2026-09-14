package gym.demo.Gestion_persona.controllers;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import gym.demo.Gestion_persona.config.ApiResponse;
import gym.demo.Gestion_persona.models.dto.PersonDto;
import gym.demo.Gestion_persona.models.entity.PersonBean;
import gym.demo.Gestion_persona.services.PersonService;

@RestController
@RequestMapping("/api/personas")
@Validated
public class PersonaController {

    @Autowired
    private PersonService personService;

    @GetMapping
    public ResponseEntity<ApiResponse> getAllPersons() {
        return personService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getPersonById(@PathVariable Integer id) {
        return personService.getOne(id);
    }

    @PostMapping("crear")
    public ResponseEntity<ApiResponse> createPerson(@Valid @RequestBody PersonDto personDto) {
        return personService.save(personDto.toEntity());
    }

    @PutMapping("/modificar/{id}")
    public ResponseEntity<ApiResponse> updatePerson(@PathVariable Integer id, @Valid @RequestBody PersonDto personDto) {
        PersonBean person = personDto.toEntity();
        person.setId(id);
        return personService.update(person);
    }

    @DeleteMapping("/borrar/{id}")
    public ResponseEntity<ApiResponse> deletePerson(@PathVariable Integer id) {
        return personService.delete(id);
    }
}