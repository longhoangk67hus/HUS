package homework1.ex2;

import java.util.Random;

public class ex2 {
    public static void main(String[] args) {
        Random random = new Random();
        int n = 10;
        int[] array = new int[n];
        for (int i = 0; i < n; i++) {
            array[i] = random.nextInt((int)1e6);
        }
        System.out.println("Array of integer");
        for (int i = 0; i < n; i++) {
            System.out.print(array[i] + " ");
        }
        System.out.println("\nPrime number in array:");
        for (int i = 0; i < n; i++) {
            if (isPrime(array[i])) {
                System.out.print(array[i] + " ");
            }
        }
    }

    public static boolean isPrime(int n) {
        if (n <= 1) {
            return false;
        }
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) {
                return false;
            }
        }
        return true;
    }
    public static boolean isPerfect(int n) {

        int total = 0;
        for (int i = 0; i < n; i++) {
            if (n % i == 0) {
                total += i;
            }
        }
        if (total == n) {
            return true;
        }
        return false;
    }
}
