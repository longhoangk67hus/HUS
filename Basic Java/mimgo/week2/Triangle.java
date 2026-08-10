package week2;

import java.util.Scanner;

public class Triangle {
    static double getArea(double a, double b, double c) {
        if (a < 0 || b < 0 || c < 0 || a + b < c || b + c < a || c + a < b) {
            return 0;
        }
        double p = (a + b + c) / 2;
        double area = Math.sqrt(p * (p - a) * (p - b) * (p - c));
        return area;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        double a = sc.nextDouble();
        double b = sc.nextDouble();
        double c = sc.nextDouble();

        System.out.println(getArea(a, b, c));
    }

}
