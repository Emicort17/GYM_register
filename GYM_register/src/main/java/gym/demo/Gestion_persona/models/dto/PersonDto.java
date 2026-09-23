package gym.demo.Gestion_persona.models.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import gym.demo.Gestion_persona.models.entity.PersonBean;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PersonDto {
    private Integer id;

    @NotBlank(message = "El nombre no puede estar vacío")
    @Size(min = 2, max = 60, message = "El nombre debe tener entre 2 y 60 caracteres")
    private String name;

    // El correo es opcional; si se envía, debe tener formato válido
    @Email(message = "El correo debe tener un formato válido")
    private String email;

    @NotBlank(message = "El teléfono no puede estar vacío")
    @Pattern(regexp = "^[0-9]{10}$", message = "El teléfono debe tener 10 dígitos")
    private String telefono;

    @NotNull(message = "La edad no puede estar vacía")
    @Min(value = 1, message = "La edad debe ser mayor a 0")
    @Max(value = 120, message = "La edad debe ser menor o igual a 120")
    private Integer age;

    // Método para convertir DTO a entidad
    public PersonBean toEntity() {
        return PersonBean.builder()
                .id(this.id)
                .name(this.name)
                .email(this.email)
                .telefono(this.telefono)
                .age(this.age)
                .build();
    }

    // Método para convertir entidad a DTO
    public static PersonDto fromEntity(PersonBean person) {
        return PersonDto.builder()
                .id(person.getId())
                .name(person.getName())
                .email(person.getEmail())
                .telefono(person.getTelefono())
                .age(person.getAge())
                .build();
    }
}
