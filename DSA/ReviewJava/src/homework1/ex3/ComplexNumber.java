package homework1.ex3;

public class ComplexNumber {
    private double real;
    private double imag;

    public ComplexNumber(double real, double imag) {
        this.real = real;
        this.imag = imag;
    }

    @Override
    public String toString() {
        if (imag >= 0) {
            return String.format("%.2f + %.2fi",real,imag);
        }
        return String.format("%.2f - %.2fi",real,imag);
    }

    public ComplexNumber addition(ComplexNumber that) {
        double newReal = this.real + that.real;
        double newImag = this.imag + that.imag;
        this.real = newReal;
        this.imag = newImag;
        return this;
    }

    public ComplexNumber multiply(ComplexNumber that) {
        double newReal = (this.real * that.real) - (this.imag * that.imag);
        double newImag = (this.real * that.imag) + (this.imag * that.real);
        return new ComplexNumber(newReal, newImag);

    }

    public ComplexNumber addMultiple(ComplexNumber[] complexNumbers) {
        ComplexNumber result = complexNumbers[0];
        for (int i = 1; i < complexNumbers.length; i++) {
            result = result.addition(complexNumbers[i]);
        }
        return result;
    }

    public ComplexNumber multiplyMultiple(ComplexNumber[] complexNumbers) {
        ComplexNumber result = complexNumbers[0];
        for (int i = 1; i < complexNumbers.length; i++) {
            result = result.multiply(complexNumbers[i]);
        }
        return result;
    }

//    public static void main(String[] args) {
//        Scanner in = new Scanner(System.in);
//
//        System.out.println("Enter the first complex number: ");
//        System.out.print("Enter the real: ");
//        double real1 = in.nextDouble();
//        System.out.print("Enter the imagination: ");
//        double imag1 = in.nextDouble();
//
//        System.out.println("Enter the second complex number: ");
//        System.out.print("Enter the real: ");
//        double real2 = in.nextDouble();
//        System.out.print("Enter the imagination: ");
//        double imag2 = in.nextDouble();
//
//        ComplexNumber complex1 = new ComplexNumber(real1, imag1);
//        ComplexNumber complex2 = new ComplexNumber(real2, imag2);
//        ComplexNumber complex3 = new ComplexNumber(5, 6);
//
//
//        System.out.println("First complex: ");
//        System.out.print(complex1);
//
//        System.out.println("\nSecond complex: ");
//        System.out.println(complex2);
//
//        System.out.println("The sum of two complex:");
//        ComplexNumber sumComplex = complex1.addition(complex2);
//        System.out.println(sumComplex);
//
//        System.out.println("The product of two complex:");
//        ComplexNumber productComplex = complex1.multiply(complex2);
//        System.out.println(productComplex);
//        ComplexNumber[] list = {complex2, complex3};
//
//        System.out.println(complex1);
//    }
}
