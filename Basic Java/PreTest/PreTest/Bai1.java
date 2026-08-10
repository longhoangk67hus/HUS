package PreTest;


import java.util.Scanner;

public class Bai1 {
    public static double dathuc(double x, int[] a) {
        double sum = a[0];
        double tmp = a[0];
        while (x < 2) {
            for (int i=1; i< a.length; i++) {
                tmp *= -1  *x * x;
                sum += tmp *a[i];
            }
        }
        return sum;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] a = new int[n];
        double x = sc.nextDouble();
        dathuc(x, a);
    }
}
