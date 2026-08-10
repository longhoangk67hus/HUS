package week2;

import java.util.Scanner;

public class RightTriangle {
    static boolean isTriangle(double a, double b, double c) {
        // begin edit
        return !(a < 0 || b < 0 || c < 0 || a + b < c || b + c < a || c + a < b);
        //end edit
    }

    public static void main(String args[]) {
        Scanner sc = new Scanner(System.in);
        double a = sc.nextDouble();
        double b = sc.nextDouble();
        double c = sc.nextDouble();
        System.out.println(isTriangle(a,b,c));




    }
}

