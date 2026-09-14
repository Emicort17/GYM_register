package gym.demo.Gestion_persona.config;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public class ApiResponse {

    private Object data;
    private HttpStatus status;
    private boolean error;
    private String message;
    private Map<String, String> errors;

    public ApiResponse(Object data, HttpStatus status) {
        this.data = data;
        this.status = status;
    }

    public ApiResponse(HttpStatus status, boolean error, String message){
        this.status = status;
        this.error = error;
        this.message = message;
    }

    public ApiResponse(HttpStatus status, boolean error, String message, Map<String, String> errors){
        this.status = status;
        this.error = error;
        this.message = message;
        this.errors = errors;
    }
}