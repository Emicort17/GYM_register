package gym.demo.Gestion_persona.controllers.auth.Dto;


import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

@Data
public class SignDto {
    @NotBlank
    @NotEmpty
    private String usuario;
    @NotBlank
    @NotEmpty
    private String contrasenia;
}
