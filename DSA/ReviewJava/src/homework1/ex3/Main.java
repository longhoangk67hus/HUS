package homework1.ex3;

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);

        System.out.println("Enter the first complex number: ");
        System.out.print("Enter the real: ");
        double real1 = in.nextDouble();
        System.out.print("Enter the imagination: ");
        double imag1 = in.nextDouble();

        System.out.println("Enter the second complex number: ");
        System.out.print("Enter the real: ");
        double real2 = in.nextDouble();
        System.out.print("Enter the imagination: ");
        double imag2 = in.nextDouble();

        ComplexNumber complex1 = new ComplexNumber(real1, imag1);
        ComplexNumber complex2 = new ComplexNumber(real2, imag2);
        ComplexNumber complex3 = new ComplexNumber(5, 6);


        System.out.println("First complex: ");
        System.out.print(complex1);

        System.out.println("\nSecond complex: ");
        System.out.println(complex2);

        System.out.println("The sum of two complex:");
        ComplexNumber sumComplex = complex1.addition(complex2);
        System.out.println(sumComplex);

        System.out.println("The product of two complex:");
        ComplexNumber productComplex = complex1.multiply(complex2);
        System.out.println(productComplex);

        ComplexNumber[] complexNumbers = {complex2, complex3};

        System.out.println("The total of multiple complex");
        complex1.addMultiple(complexNumbers);
        System.out.println(complex1);

        System.out.println("The product of multiple complex");
        complex1.multiplyMultiple(complexNumbers);
        System.out.println(complex1);
    }
}

