package gym.demo.Gestion_persona.models.enums;

// Periodicidad de un pago: define cuántos meses de vigencia otorga a partir de su fecha.
public enum TipoPago {
    MENSUAL(1),
    TRIMESTRAL(3),
    SEMESTRAL(6),
    ANUAL(12);

    private final int meses;

    TipoPago(int meses) {
        this.meses = meses;
    }

    public int getMeses() {
        return meses;
    }
}
