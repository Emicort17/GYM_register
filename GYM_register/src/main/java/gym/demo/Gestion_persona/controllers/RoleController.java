package gym.demo.Gestion_persona.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import gym.demo.Gestion_persona.config.ApiResponse;
import gym.demo.Gestion_persona.models.dto.RoleDto;
import gym.demo.Gestion_persona.services.RoleService;


import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    @Autowired
    private RoleService roleService;

    // Obtener todos los roles
    @GetMapping
    public ResponseEntity<ApiResponse> getAllRoles() {
        List<RoleDto> roles = roleService.getAllRoles();
        ApiResponse response = new ApiResponse(roles, HttpStatus.OK);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Obtener un rol por ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getRoleById(@PathVariable Integer id) {
        Optional<RoleDto> role = roleService.getRoleById(id);
        ApiResponse response;

        if (role.isPresent()) {
            response = new ApiResponse(role.get(), HttpStatus.OK);
        } else {
            response = new ApiResponse(HttpStatus.NOT_FOUND, true, "Rol no encontrado");
        }

        return new ResponseEntity<>(response, response.getStatus());
    }

    // Crear un nuevo rol
    @PostMapping
    public ResponseEntity<ApiResponse> createRole(@RequestBody RoleDto roleDto) {
        ApiResponse response;
        try {
            RoleDto createdRole = roleService.saveRole(roleDto);
            response = new ApiResponse(createdRole, HttpStatus.CREATED);
        } catch (Exception e) {
            response = new ApiResponse(HttpStatus.INTERNAL_SERVER_ERROR, true, "Error al crear el rol");
        }
        return new ResponseEntity<>(response, response.getStatus());
    }

    // Actualizar un rol existente
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateRole(@PathVariable Integer id, @RequestBody RoleDto roleDto) {
        Optional<RoleDto> updatedRole = roleService.updateRole(id, roleDto);
        ApiResponse response;

        if (updatedRole.isPresent()) {
            response = new ApiResponse(updatedRole.get(), HttpStatus.OK);
        } else {
            response = new ApiResponse(HttpStatus.NOT_FOUND, true, "Rol no encontrado para actualizar");
        }

        return new ResponseEntity<>(response, response.getStatus());
    }

    // Eliminar un rol
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteRole(@PathVariable Integer id) {
        boolean isDeleted = roleService.deleteRole(id);
        ApiResponse response;

        if (isDeleted) {
            response = new ApiResponse(HttpStatus.NO_CONTENT, false, "Rol eliminado con éxito");
        } else {
            response = new ApiResponse(HttpStatus.NOT_FOUND, true, "Rol no encontrado para eliminar");
        }

        return new ResponseEntity<>(response, response.getStatus());
    }
}
