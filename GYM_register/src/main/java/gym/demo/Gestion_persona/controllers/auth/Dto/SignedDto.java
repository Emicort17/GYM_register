package gym.demo.Gestion_persona.controllers.auth.Dto;

import lombok.Value;
import gym.demo.Gestion_persona.models.dto.UserDto;
import gym.demo.Gestion_persona.models.entity.RoleBean;

@Value
public class SignedDto {
    String token;
    String tokenType;
    UserDto user;
    RoleBean role;
}
