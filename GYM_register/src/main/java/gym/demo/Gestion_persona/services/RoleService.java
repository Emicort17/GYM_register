package gym.demo.Gestion_persona.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import gym.demo.Gestion_persona.models.dto.RoleDto;
import gym.demo.Gestion_persona.models.entity.RoleBean;
import gym.demo.Gestion_persona.models.repository.RoleRepository;


import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RoleService {

    @Autowired
    private RoleRepository roleDao;

    @Autowired
    private BitacoraService bitacoraService;

    // Obtener todos los roles
    public List<RoleDto> getAllRoles() {
        return roleDao.findAll().stream()
                .map(role -> RoleDto.builder()
                        .id_role(role.getId_role())
                        .nombre(role.getName())
                        .build())
                .collect(Collectors.toList());
    }

    // Obtener rol por ID
    public Optional<RoleDto> getRoleById(Integer id) {
        return roleDao.findById(id)
                .map(role -> RoleDto.builder()
                        .id_role(role.getId_role())
                        .nombre(role.getName())
                        .build());
    }

    // Crear rol
    public RoleDto saveRole(RoleDto roleDto) {
        RoleBean role = new RoleBean();
        role.setName(roleDto.getNombre());
        roleDao.save(role);
        bitacoraService.registrar("CREAR_ROL", "role", role.getId_role(), "Alta de rol: " + role.getName());

        return RoleDto.builder()
                .id_role(role.getId_role())
                .nombre(role.getName())
                .build();
    }

    // Actualizar rol
    public Optional<RoleDto> updateRole(Integer id, RoleDto roleDto) {
        return roleDao.findById(id)
                .map(role -> {
                    role.setName(roleDto.getNombre());
                    roleDao.save(role);
                    bitacoraService.registrar("ACTUALIZAR_ROL", "role", role.getId_role(), "Actualización de rol: " + role.getName());
                    return RoleDto.builder()
                            .id_role(role.getId_role())
                            .nombre(role.getName())
                            .build();
                });
    }

    // Eliminar rol
    public boolean deleteRole(Integer id) {
        Optional<RoleBean> role = roleDao.findById(id);
        if (role.isPresent()) {
            roleDao.deleteById(id);
            bitacoraService.registrar("ELIMINAR_ROL", "role", id, "Baja de rol: " + role.get().getName());
            return true;
        }
        return false;
    }
}
