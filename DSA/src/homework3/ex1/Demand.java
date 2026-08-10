package homework3.ex1;

import java.util.Scanner;

public class Demand {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        Fraction[] fractions = new Fraction[n];

        for (int i = 0; i < n; i++) {
            float numerator = sc.nextFloat();
            float denominator = sc.nextFloat();
            fractions[i] = new Fraction(numerator, denominator);
        }

        int i = sc.nextInt();
        System.out.println(fractions[i]);
    }
}
